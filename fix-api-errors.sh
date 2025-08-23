#!/bin/bash

# ====================================================================
# Script di Diagnosi e Fix per Errori API MyKeyManager
# Risolve problemi di configurazione endpoint API
# ====================================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Header
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🔍 Diagnosi Errori API MyKeyManager${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${PURPLE}[SUCCESS]${NC} $1"
}

# Step 1: Analisi problema dai log
echo -e "${YELLOW}🐛 PROBLEMI IDENTIFICATI DAI LOG:${NC}"
echo "❌ Frontend chiama :8080/api/v1/ invece di :8001/api/v1/"
echo "❌ Errore 401 Unauthorized per licenses e categories"
echo "❌ Errore 422 Unprocessable Entity per change-password"
echo "✅ Login funziona correttamente"
echo ""
echo -e "${YELLOW}🔍 CAUSA: Configurazione API hardcoded nelle immagini Docker Hub${NC}"
echo ""

# Step 2: Verifica configurazione attuale
log "Verifica configurazione Docker Compose attuale..."

# Controlla quale docker-compose.yml è in uso
if [ -f "docker-compose.yml" ]; then
    # Verifica se usa immagini Docker Hub o build locale
    if grep -q "acwild/mykeymanager" docker-compose.yml; then
        error "🔴 PROBLEMA TROVATO: Usa immagini Docker Hub con configurazione errata"
        USE_HUB_IMAGES=true
    elif grep -q "build:" docker-compose.yml; then
        success "✅ Configurazione corretta: Usa build locale"
        USE_HUB_IMAGES=false
    else
        warn "⚠️  Configurazione non chiara"
        USE_HUB_IMAGES=unknown
    fi
else
    error "File docker-compose.yml non trovato!"
    exit 1
fi

# Step 3: Verifica stato servizi
log "Verifica stato servizi..."
if ! docker compose ps >/dev/null 2>&1; then
    error "Servizi Docker non attivi"
    exit 1
fi

# Rileva IP del server
SERVER_IP=$(docker compose exec -T backend printenv | grep -E "ALLOWED_ORIGINS|VITE_API" | head -1 | grep -oE "([0-9]{1,3}\.){3}[0-9]{1,3}" | head -1 || echo "")
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(hostname -I | awk '{print $1}')
fi

success "✅ IP Server: $SERVER_IP"

# Step 4: Test API endpoints
log "Test API endpoints..."

# Test backend diretto
BACKEND_URL="http://${SERVER_IP}:8001"
if curl -f -s "${BACKEND_URL}/health" >/dev/null 2>&1; then
    success "✅ Backend risponde su porta 8001"
else
    error "❌ Backend non risponde su porta 8001"
fi

# Test se il frontend chiama la porta sbagliata
FRONTEND_URL="http://${SERVER_IP}:3000"
if curl -s "$FRONTEND_URL" | grep -q "8080"; then
    error "❌ Frontend configurato per chiamare porta 8080 (SBAGLIATO)"
    WRONG_PORT_CONFIG=true
else
    success "✅ Frontend sembra configurato correttamente"
    WRONG_PORT_CONFIG=false
fi

# Step 5: Soluzione automatica
echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🔧 APPLICAZIONE FIX AUTOMATICO${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

if [ "$USE_HUB_IMAGES" = "true" ] || [ "$WRONG_PORT_CONFIG" = "true" ]; then
    warn "🔄 Necessario passare a build locale per fix configurazione API"
    
    # Verifica che abbiamo i file necessari per build locale
    if [ ! -f "docker-compose.arm64.yml" ]; then
        error "File docker-compose.arm64.yml non trovato"
        echo "Scarica con: curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.arm64.yml"
        exit 1
    fi
    
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        error "Directory backend/frontend non trovate - serve repository completo"
        echo "Clona repository completo: git clone https://github.com/Acwildweb/MyKeyManager.git"
        exit 1
    fi
    
    if [ ! -f "backend/Dockerfile" ] || [ ! -f "frontend/Dockerfile" ]; then
        error "Dockerfile locali non trovati"
        echo "Aggiorna repository: git pull origin main"
        exit 1
    fi
    
    log "🔄 Applicazione fix: Passaggio a build locale..."
    
    # Backup configurazione attuale
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml docker-compose.yml.backup
        log "✅ Backup configurazione salvato: docker-compose.yml.backup"
    fi
    
    # Arresta servizi attuali
    log "🛑 Arresto servizi attuali..."
    docker compose down
    
    # Sostituisci con configurazione build locale
    log "📝 Configurazione build locale..."
    cp docker-compose.arm64.yml docker-compose.yml
    
    # Configura IP del server
    sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml
    rm -f docker-compose.yml.bak
    
    success "✅ Configurazione aggiornata per build locale"
    
    # Avvia con build locale
    log "🏗️  Avvio con build locale (può richiedere 10-15 minuti)..."
    docker compose up -d --build
    
    log "⏳ Attesa avvio servizi..."
    sleep 60
    
    # Test post-fix
    log "🧪 Test configurazione post-fix..."
    
    # Test backend
    if curl -f -s "${BACKEND_URL}/health" >/dev/null 2>&1; then
        success "✅ Backend attivo post-fix"
    else
        error "❌ Backend non risponde post-fix"
    fi
    
    # Test API specifica
    if curl -f -s "${BACKEND_URL}/api/v1/" >/dev/null 2>&1; then
        success "✅ API v1 endpoint disponibile"
    else
        warn "⚠️  API v1 endpoint non risponde (potrebbe essere normale)"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 FIX APPLICATO!${NC}"
    echo ""
    echo -e "${GREEN}Verifiche da fare:${NC}"
    echo "1. Accedi a: ${YELLOW}$FRONTEND_URL${NC}"
    echo "2. Prova login con: admin@example.com / admin123"
    echo "3. Prova cambio password"
    echo "4. Verifica che non ci siano più errori 8080 nei log browser"
    echo ""
    echo -e "${GREEN}Debug se serve:${NC}"
    echo "Backend logs: ${YELLOW}docker compose logs backend${NC}"
    echo "Frontend logs: ${YELLOW}docker compose logs frontend${NC}"
    echo "Tutti i logs: ${YELLOW}docker compose logs -f${NC}"
    
else
    success "✅ Configurazione sembra corretta"
    log "🔍 Debug ulteriore necessario..."
    
    echo ""
    echo -e "${YELLOW}Debug Commands:${NC}"
    echo "1. Verifica logs backend: ${YELLOW}docker compose logs backend${NC}"
    echo "2. Verifica logs frontend: ${YELLOW}docker compose logs frontend${NC}"
    echo "3. Test API diretto: ${YELLOW}curl $BACKEND_URL/api/v1/auth/check${NC}"
    echo "4. Controlla variabili env: ${YELLOW}docker compose exec backend printenv | grep API${NC}"
fi

echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}📞 Se i problemi persistono:${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo "1. 🐛 Issues: https://github.com/Acwildweb/MyKeyManager/issues"
echo "2. 💬 Discussions: https://github.com/Acwildweb/MyKeyManager/discussions"
echo "3. 📖 Troubleshooting: https://github.com/Acwildweb/MyKeyManager/wiki"
echo ""
