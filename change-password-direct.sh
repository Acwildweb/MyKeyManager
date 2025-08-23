#!/bin/bash

# =========================================================================
# MyKeyManager - Cambio Password Diretto Database  
# Forza cambio password senza API, accesso diretto al database
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
echo -e "${BLUE}🔧 Cambio Password Diretto Database${NC}"
echo -e "${BLUE}==========================================================================${NC}"

# Verifica container database
if ! docker compose ps | grep -q "database.*Up"; then
    print_error "❌ Container database non attivo!"
    echo -e "${YELLOW}Avvio database...${NC}"
    docker compose up -d database
    sleep 15
fi

print_status "🔍 Lista utenti nel database..."

# Mostra utenti esistenti
echo -e "${BLUE}👥 Utenti esistenti:${NC}"
docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
SELECT id, username, email, is_active FROM users ORDER BY id;
" 2>/dev/null || {
    print_error "❌ Errore accesso database o tabelle non esistono!"
    exit 1
}

echo
read -p "🤔 Vuoi cambiare password per un utente esistente o creare nuovo admin? [esistente/nuovo]: " CHOICE

if [[ "$CHOICE" == "nuovo" || "$CHOICE" == "n" ]]; then
    print_status "🆕 Creazione nuovo utente admin..."
    
    # Chiedi dati nuovo admin
    read -p "📧 Email nuovo admin [admin@example.com]: " NEW_EMAIL
    NEW_EMAIL=${NEW_EMAIL:-admin@example.com}
    
    read -p "👤 Username nuovo admin [admin]: " NEW_USERNAME  
    NEW_USERNAME=${NEW_USERNAME:-admin}
    
    read -s -p "🔒 Password nuovo admin [admin123]: " NEW_PASSWORD
    echo
    NEW_PASSWORD=${NEW_PASSWORD:-admin123}
    
    # Genera hash bcrypt per la nuova password
    print_status "🔐 Generazione hash password..."
    
    # Usa Python per generare hash bcrypt compatibile
    PASSWORD_HASH=$(docker compose exec -T backend python3 -c "
import bcrypt
password = '$NEW_PASSWORD'.encode('utf-8')
hash = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
print(hash)
" 2>/dev/null || echo "ERROR")

    if [[ "$PASSWORD_HASH" == "ERROR" || -z "$PASSWORD_HASH" ]]; then
        print_error "❌ Errore generazione hash!"
        print_warning "Uso hash predefinito per 'admin123'..."
        PASSWORD_HASH='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeakyIkn2eWhZmZPW'
        NEW_PASSWORD="admin123"
    fi
    
    # Inserisci nuovo utente
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    INSERT INTO users (username, email, full_name, password_hash, is_active)
    VALUES ('$NEW_USERNAME', '$NEW_EMAIL', 'Administrator', '$PASSWORD_HASH', true)
    ON CONFLICT (username) DO UPDATE SET
        password_hash = '$PASSWORD_HASH',
        email = '$NEW_EMAIL',
        is_active = true;
    " >/dev/null 2>&1
    
    print_status "✅ Utente creato/aggiornato!"
    
    echo
    echo -e "${GREEN}✅ NUOVO ADMIN CREATO:${NC}"
    echo -e "   📧 Email: ${YELLOW}$NEW_EMAIL${NC}"
    echo -e "   👤 Username: ${YELLOW}$NEW_USERNAME${NC}"
    echo -e "   🔒 Password: ${YELLOW}$NEW_PASSWORD${NC}"

else
    print_status "🔧 Modifica utente esistente..."
    
    # Mostra utenti con ID
    echo -e "${BLUE}Seleziona utente da modificare:${NC}"
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    SELECT id, username, email FROM users ORDER BY id;
    "
    
    echo
    read -p "🆔 Inserisci ID utente da modificare: " USER_ID
    
    if [[ ! "$USER_ID" =~ ^[0-9]+$ ]]; then
        print_error "❌ ID non valido!"
        exit 1
    fi
    
    # Verifica che l'utente esista
    USER_EXISTS=$(docker compose exec -T database psql -U mykeymanager -d mykeymanager -t -c "
    SELECT COUNT(*) FROM users WHERE id = $USER_ID;
    " 2>/dev/null | tr -d ' ' || echo "0")
    
    if [[ "$USER_EXISTS" == "0" ]]; then
        print_error "❌ Utente con ID $USER_ID non trovato!"
        exit 1
    fi
    
    # Mostra dettagli utente
    echo -e "${BLUE}Dettagli utente selezionato:${NC}"
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    SELECT id, username, email, full_name, is_active FROM users WHERE id = $USER_ID;
    "
    
    echo
    read -s -p "🔒 Nuova password: " NEW_PASSWORD
    echo
    
    if [[ -z "$NEW_PASSWORD" ]]; then
        print_error "❌ Password non può essere vuota!"
        exit 1
    fi
    
    # Genera hash per la nuova password
    print_status "🔐 Generazione hash password..."
    
    PASSWORD_HASH=$(docker compose exec -T backend python3 -c "
import bcrypt
password = '$NEW_PASSWORD'.encode('utf-8')
hash = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
print(hash)
" 2>/dev/null || echo "ERROR")

    if [[ "$PASSWORD_HASH" == "ERROR" || -z "$PASSWORD_HASH" ]]; then
        print_error "❌ Errore generazione hash!"
        exit 1
    fi
    
    # Aggiorna password nel database
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    UPDATE users 
    SET password_hash = '$PASSWORD_HASH', 
        is_active = true,
        updated_at = NOW()
    WHERE id = $USER_ID;
    " >/dev/null 2>&1
    
    print_status "✅ Password aggiornata!"
    
    # Mostra dettagli aggiornati
    echo -e "${GREEN}✅ PASSWORD CAMBIATA PER:${NC}"
    docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
    SELECT username, email FROM users WHERE id = $USER_ID;
    "
    echo -e "   🔒 Nuova Password: ${YELLOW}$NEW_PASSWORD${NC}"
fi

echo
print_status "🧪 Test login con nuove credenziali..."

# Ottieni dettagli utente per test
USER_DETAILS=$(docker compose exec -T database psql -U mykeymanager -d mykeymanager -t -c "
SELECT email FROM users WHERE id = ${USER_ID:-1} OR username = '${NEW_USERNAME:-admin}';
" 2>/dev/null | tr -d ' ' | head -1)

if [[ -n "$USER_DETAILS" ]]; then
    sleep 3
    
    LOGIN_TEST=$(curl -s -X POST "http://localhost:8001/api/v1/auth/login" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=$USER_DETAILS&password=$NEW_PASSWORD" 2>/dev/null || echo "ERROR")
    
    if [[ "$LOGIN_TEST" != "ERROR" ]] && echo "$LOGIN_TEST" | grep -q "access_token"; then
        print_status "✅ Test login riuscito!"
    else
        print_warning "⚠️  Test login fallito, ma password dovrebbe essere corretta"
        print_warning "Prova a riavviare: docker compose restart"
    fi
fi

echo
SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
echo -e "${GREEN}==========================================================================${NC}"
echo -e "${GREEN}🎉 OPERAZIONE COMPLETATA${NC}"
echo -e "${GREEN}==========================================================================${NC}"
echo -e "${BLUE}🌐 Accesso Pannello:${NC} http://$SERVER_IP:3000"
echo -e "${BLUE}🔑 Usa le credenziali mostrate sopra${NC}"
echo -e "${GREEN}==========================================================================${NC}"
