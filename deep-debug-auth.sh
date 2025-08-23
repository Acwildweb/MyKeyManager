#!/bin/bash

# =========================================================================
# MyKeyManager - Diagnosi Completa Sistema - Debug Autenticazione
# Verifica TUTTO: database, backend, frontend, API, hash password
# =========================================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1"
}

echo -e "${BLUE}==========================================================================${NC}"
echo -e "${BLUE}🔍 DIAGNOSI COMPLETA SISTEMA MYKEYMANAGER${NC}"
echo -e "${BLUE}==========================================================================${NC}"

# 1. VERIFICA CONTAINER
print_status "📊 1. Stato Container Docker"
echo -e "${YELLOW}Container Status:${NC}"
docker compose ps || {
    print_error "❌ Docker compose non funziona!"
    exit 1
}

echo
print_status "📄 2. Log Container (ultimi errori)"

echo -e "${YELLOW}=== DATABASE LOGS (errori) ===${NC}"
docker compose logs database --tail=20 | grep -i "error\|fail\|fatal" || echo "Nessun errore database"

echo -e "${YELLOW}=== BACKEND LOGS (errori) ===${NC}"
docker compose logs backend --tail=20 | grep -i "error\|fail\|fatal" || echo "Nessun errore backend"

echo -e "${YELLOW}=== FRONTEND LOGS (errori) ===${NC}"
docker compose logs frontend --tail=20 | grep -i "error\|fail\|fatal" || echo "Nessun errore frontend"

echo
print_status "🔌 3. Test Connettività Container"

# Test database
if docker compose exec -T database pg_isready -U mykeymanager >/dev/null 2>&1; then
    print_status "✅ Database: OK"
else
    print_error "❌ Database: NON RISPONDE"
fi

# Test backend health
if curl -sf http://localhost:8001/health >/dev/null 2>&1; then
    print_status "✅ Backend health: OK"
    
    # Test backend API docs
    if curl -sf http://localhost:8001/docs >/dev/null 2>&1; then
        print_status "✅ Backend API docs: OK"
    else
        print_warning "⚠️  Backend API docs: NON DISPONIBILI"
    fi
else
    print_error "❌ Backend: NON RISPONDE"
    print_debug "Verifico se backend è davvero in ascolto..."
    docker compose exec backend netstat -tlnp | grep :8000 || print_error "Backend non in ascolto su porta 8000"
fi

# Test frontend
if curl -sf http://localhost:3000 >/dev/null 2>&1; then
    print_status "✅ Frontend: OK"
else
    print_error "❌ Frontend: NON RISPONDE"
fi

echo
print_status "🗄️  4. Verifica Database e Utenti"

# Schema database
print_debug "Schema tabelle database:"
docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "\dt" 2>/dev/null || {
    print_error "❌ Impossibile accedere alle tabelle!"
    print_warning "Provo a creare schema..."
    
    docker compose exec -T database psql -U mykeymanager -d mykeymanager << 'EOF'
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
EOF
    print_status "Schema database creato"
}

# Lista utenti dettagliata
echo -e "${YELLOW}Utenti nel database:${NC}"
docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
SELECT 
    id,
    username,
    email,
    is_active,
    length(password_hash) as hash_length,
    substring(password_hash, 1, 20) as hash_preview
FROM users 
ORDER BY id;
" 2>/dev/null || print_error "❌ Errore lettura utenti"

echo
print_status "🔐 5. Test Hash Password e Algoritmi"

# Verifica che bcrypt sia disponibile nel backend
print_debug "Test moduli Python backend:"
docker compose exec backend python3 -c "
try:
    import bcrypt
    print('✅ bcrypt: DISPONIBILE')
    
    # Test hash
    test_password = 'admin123'
    hash_test = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
    print(f'✅ Hash test: {hash_test.decode()}')
    
    # Test verifica
    if bcrypt.checkpw(test_password.encode('utf-8'), hash_test):
        print('✅ Verifica hash: OK')
    else:
        print('❌ Verifica hash: FALLITA')
        
except ImportError as e:
    print(f'❌ bcrypt: NON DISPONIBILE - {e}')
except Exception as e:
    print(f'❌ Errore test hash: {e}')
    
# Test altri moduli
try:
    from passlib.context import CryptContext
    print('✅ passlib: DISPONIBILE')
except:
    print('❌ passlib: NON DISPONIBILE')
    
try:
    import fastapi
    print(f'✅ FastAPI: {fastapi.__version__}')
except:
    print('❌ FastAPI: NON DISPONIBILE')
" 2>/dev/null || print_error "❌ Errore test moduli Python"

echo
print_status "🔑 6. Test Autenticazione Diretta"

# Crea utente test con hash noto
print_debug "Creo utente test con hash bcrypt noto..."

# Hash per 'testpass123' generato con bcrypt
TEST_HASH='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeakyIkn2eWhZmZPW'

docker compose exec -T database psql -U mykeymanager -d mykeymanager -c "
INSERT INTO users (username, email, full_name, password_hash, is_active)
VALUES ('testuser', 'test@example.com', 'Test User', '$TEST_HASH', true)
ON CONFLICT (username) DO UPDATE SET
    password_hash = '$TEST_HASH',
    email = 'test@example.com',
    is_active = true;
" >/dev/null 2>&1

print_debug "Test login con utente test..."

# Test login API
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=admin123" 2>/dev/null || echo "ERROR")

print_debug "Risposta login API:"
echo "$LOGIN_RESPONSE" | head -3

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    print_status "✅ Autenticazione API: FUNZIONA"
else
    print_error "❌ Autenticazione API: NON FUNZIONA"
    
    # Test con diversi formati
    print_debug "Test formati login alternativi..."
    
    # Test con username invece di email
    LOGIN_RESPONSE2=$(curl -s -X POST "http://localhost:8001/api/v1/auth/login" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=testuser&password=admin123" 2>/dev/null || echo "ERROR")
    
    if echo "$LOGIN_RESPONSE2" | grep -q "access_token"; then
        print_status "✅ Login con USERNAME funziona"
    else
        print_error "❌ Login con USERNAME non funziona"
    fi
    
    # Test JSON format
    LOGIN_RESPONSE3=$(curl -s -X POST "http://localhost:8001/api/v1/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"username":"test@example.com","password":"admin123"}' 2>/dev/null || echo "ERROR")
    
    if echo "$LOGIN_RESPONSE3" | grep -q "access_token"; then
        print_status "✅ Login JSON funziona"
    else
        print_error "❌ Login JSON non funziona"
    fi
fi

echo
print_status "🌐 7. Test Frontend-Backend Communication"

# Verifica configurazione frontend
print_debug "Configurazione API nel frontend:"
if curl -s http://localhost:3000 | grep -o 'http://[^"]*:8001' | head -1; then
    print_status "✅ Frontend configurato per backend"
else
    print_warning "⚠️  Configurazione frontend non chiara"
fi

# Verifica CORS
print_debug "Test CORS backend:"
CORS_TEST=$(curl -s -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:8001/api/v1/auth/login 2>/dev/null || echo "ERROR")

if [[ "$CORS_TEST" != "ERROR" ]]; then
    print_status "✅ CORS configurato"
else
    print_error "❌ CORS non configurato correttamente"
fi

echo
print_status "🔧 8. Configurazione Sistema"

# Verifica configurazione docker-compose
if grep -q "YOUR_SERVER_IP" docker-compose.yml 2>/dev/null; then
    print_error "❌ IP server non configurato in docker-compose.yml"
    echo "   Esegui: sed -i 's/YOUR_SERVER_IP/$(hostname -I | awk '{print $1}')/g' docker-compose.yml"
else
    print_status "✅ IP server configurato"
fi

# Verifica variabili ambiente backend
print_debug "Variabili ambiente backend:"
docker compose exec backend env | grep -E "(DATABASE_URL|SECRET_KEY|ALLOWED_ORIGINS)" || print_warning "Variabili ambiente non trovate"

echo
print_status "💡 9. Suggerimenti Risoluzione"

echo -e "${BLUE}Possibili cause problema login:${NC}"
echo -e "1. ${YELLOW}Hash password incompatibile${NC} - Algoritmo bcrypt diverso"
echo -e "2. ${YELLOW}Endpoint autenticazione rotto${NC} - Backend API non funziona"
echo -e "3. ${YELLOW}CORS bloccato${NC} - Frontend non può comunicare con backend"
echo -e "4. ${YELLOW}Database schema diverso${NC} - Tabelle/colonne cambiate"
echo -e "5. ${YELLOW}Frontend configurazione sbagliata${NC} - API endpoint wrong"

echo
echo -e "${BLUE}Soluzioni da provare:${NC}"
echo -e "1. ${GREEN}docker compose down && docker compose up -d --build${NC}"
echo -e "2. ${GREEN}./reset-admin-password.sh${NC} (riprova con hash fresh)"
echo -e "3. ${GREEN}Verifica log: docker compose logs backend -f${NC}"
echo -e "4. ${GREEN}Test API diretto: curl -X POST http://localhost:8001/api/v1/auth/login -d 'username=test@example.com&password=admin123'${NC}"

echo
echo -e "${GREEN}==========================================================================${NC}"
print_status "🎯 Diagnosi completata! Verifica i risultati sopra"
echo -e "${GREEN}==========================================================================${NC}"
