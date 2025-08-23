#!/bin/bash

# =========================================================================
# MyKeyManager - Recupero Password Admin dal Database
# Estrae la password hashata e la decripta se possibile
# =========================================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}==========================================================================${NC}"
echo -e "${BLUE}🔍 Recupero Password Admin MyKeyManager${NC}"
echo -e "${BLUE}==========================================================================${NC}"

# Verifica che i container siano attivi
if ! docker compose ps | grep -q "database.*Up"; then
    print_error "❌ Container database non attivo!"
    echo -e "${YELLOW}Avvio database...${NC}"
    docker compose up -d database
    sleep 10
fi

print_status "🔍 Cerco tutti gli utenti nel database..."

# Recupera tutti gli utenti
echo -e "${BLUE}📋 Utenti trovati:${NC}"
docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
SELECT 
    id,
    username,
    email,
    full_name,
    is_active,
    created_at
FROM users 
ORDER BY id;
" 2>/dev/null || {
    print_error "❌ Errore accesso database!"
    print_warning "Provo a creare le tabelle..."
    
    # Se le tabelle non esistono, le creo
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE,
        full_name VARCHAR(200),
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        smtp_host VARCHAR(255),
        smtp_port INTEGER,
        smtp_username VARCHAR(255), 
        smtp_password VARCHAR(255),
        smtp_from VARCHAR(255),
        smtp_use_tls BOOLEAN DEFAULT TRUE
    );
    
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(255)
    );
    
    CREATE TABLE IF NOT EXISTS licenses (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        product_name VARCHAR(150) NOT NULL,
        edition VARCHAR(100),
        vendor VARCHAR(120),
        version VARCHAR(50),
        license_key VARCHAR(255) UNIQUE NOT NULL,
        iso_url TEXT,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    " >/dev/null 2>&1
    
    print_status "✅ Tabelle create/verificate"
    
    # Riprova a leggere utenti
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    SELECT 
        id,
        username,
        email,
        full_name,
        is_active,
        created_at
    FROM users 
    ORDER BY id;
    " 2>/dev/null || print_error "❌ Impossibile accedere alle tabelle utenti"
}

echo
print_status "🔐 Recupero hash password..."

# Recupera hash password per tutti gli utenti
USERS_DATA=$(docker compose exec -T database psql -U mykeymanager -d mykeymanager -t -c "
SELECT 
    username || '|' || COALESCE(email, 'noemail') || '|' || password_hash
FROM users 
WHERE is_active = true
ORDER BY id;
" 2>/dev/null | grep -v '^$' || echo "")

if [[ -z "$USERS_DATA" ]]; then
    print_warning "❌ Nessun utente trovato nel database!"
    echo
    print_status "🔧 Creo utente admin di default..."
    
    # Genera hash per password admin123
    ADMIN_HASH='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeakyIkn2eWhZmZPW'
    
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    INSERT INTO users (username, email, full_name, password_hash, is_active)
    VALUES ('admin', 'admin@example.com', 'Administrator', '$ADMIN_HASH', true)
    ON CONFLICT (username) DO UPDATE SET
        password_hash = '$ADMIN_HASH',
        email = 'admin@example.com',
        is_active = true;
    " >/dev/null 2>&1
    
    # Crea categoria default
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    INSERT INTO categories (name, icon) 
    VALUES ('Software', '💻')
    ON CONFLICT (name) DO NOTHING;
    " >/dev/null 2>&1
    
    print_status "✅ Utente admin creato!"
    
    echo
    echo -e "${GREEN}==========================================================================${NC}"
    echo -e "${GREEN}✅ UTENTE ADMIN RICREATO${NC}"
    echo -e "${GREEN}==========================================================================${NC}"
    echo -e "${BLUE}🔑 Credenziali:${NC}"
    echo -e "   📧 Email:    ${YELLOW}admin@example.com${NC}"
    echo -e "   🔒 Password: ${YELLOW}admin123${NC}"
    echo -e "${GREEN}==========================================================================${NC}"
    
else
    print_status "✅ Utenti trovati! Ecco i dettagli:"
    echo
    
    echo -e "${BLUE}📋 Lista Utenti Attivi:${NC}"
    echo "$USERS_DATA" | while IFS='|' read -r username email hash_password; do
        # Pulisci spazi
        username=$(echo "$username" | tr -d ' ')
        email=$(echo "$email" | tr -d ' ')
        hash_password=$(echo "$hash_password" | tr -d ' ')
        
        if [[ -n "$username" && "$username" != "username" ]]; then
            echo -e "${GREEN}👤 Username:${NC} $username"
            echo -e "${GREEN}📧 Email:${NC} $email"
            echo -e "${GREEN}🔐 Hash:${NC} ${hash_password:0:30}..."
            echo
            
            # Prova password comuni
            echo -e "${YELLOW}🧪 Test password comuni per $username:${NC}"
            
            COMMON_PASSWORDS=("admin123" "password" "123456" "admin" "mykeymanager" "password123" "qwerty")
            
            for pwd in "${COMMON_PASSWORDS[@]}"; do
                # Test login via API
                LOGIN_RESULT=$(curl -s -X POST "http://localhost:8001/api/v1/auth/login" \
                  -H "Content-Type: application/x-www-form-urlencoded" \
                  -d "username=$email&password=$pwd" 2>/dev/null || echo "ERROR")
                
                if [[ "$LOGIN_RESULT" != "ERROR" ]] && echo "$LOGIN_RESULT" | grep -q "access_token"; then
                    echo -e "   ✅ ${GREEN}PASSWORD TROVATA:${NC} ${YELLOW}$pwd${NC}"
                    FOUND_PASSWORD="$pwd"
                    break
                else
                    echo -e "   ❌ $pwd"
                fi
            done
            
            if [[ -n "$FOUND_PASSWORD" ]]; then
                echo
                echo -e "${GREEN}🎉 PASSWORD RECUPERATA PER $username:${NC}"
                echo -e "${BLUE}📧 Email:${NC} $email"
                echo -e "${BLUE}🔒 Password:${NC} ${YELLOW}$FOUND_PASSWORD${NC}"
            fi
            
            echo -e "${BLUE}─────────────────────────────────────────${NC}"
        fi
    done
fi

echo
print_status "🌐 Test accesso pannello..."
SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")

# Test se frontend risponde
if curl -s "http://localhost:3000" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend attivo:${NC} http://$SERVER_IP:3000"
else
    print_warning "⚠️  Frontend non risponde, verifica container"
fi

# Test se backend risponde
if curl -s "http://localhost:8001/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend attivo:${NC} http://$SERVER_IP:8001"
else
    print_warning "⚠️  Backend non risponde, verifica container"
fi

echo
echo -e "${BLUE}🔧 Se ancora non funziona:${NC}"
echo -e "   1. ${YELLOW}docker compose restart${NC}"
echo -e "   2. ${YELLOW}docker compose logs backend${NC}"
echo -e "   3. ${YELLOW}./reset-admin-password.sh${NC} (forza reset)"

echo
echo -e "${GREEN}==========================================================================${NC}"
print_status "🎯 Recupero password completato!"
echo -e "${GREEN}==========================================================================${NC}"
