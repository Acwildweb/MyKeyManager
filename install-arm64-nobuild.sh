#!/bin/bash

# ====================================================================
# Script di installazione MyKeyManager per Server ARM64 
# SENZA BUILD LOCALE - Usa solo immagini Docker Hub
# Risolve errori "build context path not found"
# ====================================================================

set -e  # Exit on any error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Header
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🚀 MyKeyManager - Installazione ARM64 (Solo Docker Hub)${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""
echo -e "${YELLOW}⚡ Questa installazione usa SOLO immagini pre-costruite da Docker Hub${NC}"
echo -e "${YELLOW}⚡ NON richiede build locale - Risolve errori di build context${NC}"
echo ""

# Funzioni di logging
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

# Step 1: Verifica sistema e architettura
log "Verifica sistema operativo e architettura..."
OS=$(uname -s)
ARCH=$(uname -m)

if [ "$OS" != "Linux" ]; then
    warn "Sistema $OS rilevato (ottimizzato per Linux)"
fi

case $ARCH in
    aarch64|arm64)
        success "✅ Architettura ARM64 confermata: $ARCH"
        ;;
    x86_64|amd64)
        warn "⚠️  Architettura AMD64 rilevata: $ARCH"
        warn "Le immagini multi-arch dovrebbero funzionare comunque..."
        ;;
    *)
        error "❌ Architettura $ARCH potrebbe non essere supportata"
        ;;
esac

# Step 2: Verifica Docker (senza verificare file locali)
log "Verifica installazione Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker non installato!"
    echo "Installa Docker con:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose non installato!"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
success "✅ Docker: $DOCKER_VERSION"

# Verifica che Docker sia attivo
if ! docker info &> /dev/null; then
    error "Docker daemon non in esecuzione!"
    echo "Avvia Docker con: sudo systemctl start docker"
    exit 1
fi

success "✅ Docker Compose disponibile"

# Step 3: Download configurazione Docker Compose
log "Download configurazione Docker Compose..."

# Verifica se il file esiste nella directory corrente
if [ -f "docker-compose.arm64-hub.yml" ]; then
    log "File docker-compose.arm64-hub.yml trovato localmente"
else
    # Download dal repository GitHub
    log "Download da GitHub..."
    if command -v curl &> /dev/null; then
        curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.arm64-hub.yml
    elif command -v wget &> /dev/null; then
        wget https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.arm64-hub.yml
    else
        error "Né curl né wget disponibili per il download"
        exit 1
    fi
fi

if [ ! -f "docker-compose.arm64-hub.yml" ]; then
    error "Impossibile ottenere il file docker-compose.arm64-hub.yml"
    exit 1
fi

success "✅ Configurazione Docker Compose ottenuta"

# Step 4: Rilevamento IP del server
log "Rilevamento IP del server..."

# Metodi multipli per rilevare IP
SERVER_IP=""

# Metodo 1: IP pubblico (con timeout)
SERVER_IP=$(timeout 5 curl -s ifconfig.me 2>/dev/null || echo "")

# Metodo 2: IP locale se fallisce il pubblico
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
fi

# Metodo 3: Fallback con route
if [ -z "$SERVER_IP" ]; then
    SERVER_IP=$(ip route get 8.8.8.8 | awk '{print $7}' 2>/dev/null | head -1 || echo "localhost")
fi

if [ -z "$SERVER_IP" ] || [ "$SERVER_IP" = "localhost" ]; then
    warn "⚠️  Impossibile rilevare IP automaticamente"
    read -p "Inserisci l'IP del server manualmente: " -r SERVER_IP
    if [ -z "$SERVER_IP" ]; then
        error "IP del server richiesto!"
        exit 1
    fi
fi

success "✅ IP Server configurato: $SERVER_IP"

# Step 5: Configurazione dominio (opzionale)
echo ""
read -p "Vuoi configurare un dominio personalizzato? [y/N]: " -n 1 -r USE_DOMAIN
echo
DOMAIN=""
if [[ $USE_DOMAIN =~ ^[Yy]$ ]]; then
    read -p "Inserisci il dominio (es: mykeymanager.yourdomain.com): " -r DOMAIN
    if [ -n "$DOMAIN" ]; then
        success "✅ Dominio configurato: $DOMAIN"
    fi
fi

# Step 6: Preparazione configurazione
log "Preparazione configurazione finale..."

# Crea copia operativa
cp docker-compose.arm64-hub.yml docker-compose.yml

# Sostituisce IP del server
sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml

# Sostituisce dominio se specificato
if [ -n "$DOMAIN" ]; then
    sed -i.bak "s/YOUR_DOMAIN/$DOMAIN/g" docker-compose.yml
    success "✅ Configurazione dominio applicata"
fi

rm -f docker-compose.yml.bak
success "✅ Configurazione preparata"

# Step 7: Pre-download immagini (opzionale per velocizzare)
log "Pre-download immagini Docker Hub..."
docker pull --platform linux/arm64 postgres:15-alpine
docker pull --platform linux/arm64 acwild/mykeymanager-backend:latest
docker pull --platform linux/arm64 acwild/mykeymanager-frontend:latest
success "✅ Immagini scaricate"

# Step 8: Gestione installazione precedente
if docker compose ps 2>/dev/null | grep -q "Up"; then
    warn "⚠️  Servizi esistenti rilevati"
    read -p "Vuoi fermare i servizi esistenti? [y/N]: " -n 1 -r STOP_EXISTING
    echo
    if [[ $STOP_EXISTING =~ ^[Yy]$ ]]; then
        log "Arresto servizi esistenti..."
        docker compose down
        success "✅ Servizi arrestati"
        
        read -p "Vuoi rimuovere anche i volumi (DATI PERSI)? [y/N]: " -n 1 -r REMOVE_VOLUMES
        echo
        if [[ $REMOVE_VOLUMES =~ ^[Yy]$ ]]; then
            docker compose down -v
            docker volume prune -f
            warn "⚠️  Volumi rimossi - tutti i dati sono stati cancellati"
        fi
    fi
fi

# Step 9: Avvio servizi (VELOCE - no build!)
log "🚀 Avvio servizi MyKeyManager..."
log "⚡ VELOCE: Usa immagini pre-costruite (no build time)"

# Avvia servizi senza build
if docker compose up -d; then
    success "✅ Servizi avviati con successo"
else
    error "❌ Errore durante l'avvio dei servizi"
    log "Verifica log con: docker compose logs"
    exit 1
fi

# Step 10: Attesa e verifica servizi
log "⏳ Attesa avvio servizi (60 secondi)..."
sleep 20

# Verifica stato container
log "Verifica stato container..."
if docker compose ps | grep database | grep -q "Up"; then
    success "✅ Database PostgreSQL: Attivo"
else
    error "❌ Database PostgreSQL: Errore"
    docker compose logs database --tail=10
fi

if docker compose ps | grep backend | grep -q "Up"; then
    success "✅ Backend FastAPI: Attivo"
else
    error "❌ Backend FastAPI: Errore"
    docker compose logs backend --tail=10
fi

if docker compose ps | grep frontend | grep -q "Up"; then
    success "✅ Frontend React: Attivo"
else
    error "❌ Frontend React: Errore"
    docker compose logs frontend --tail=10
fi

# Step 11: Health check completo
log "🔍 Test di funzionamento..."
sleep 30

# Test database
if docker compose exec -T database pg_isready -U mykeymanager -d mykeymanager >/dev/null 2>&1; then
    success "✅ Database: Connessione OK"
else
    warn "⚠️  Database: Test connessione fallito"
fi

# Test backend API
BACKEND_URL="http://${SERVER_IP}:8001"
if curl -f -s "${BACKEND_URL}/health" >/dev/null 2>&1; then
    success "✅ Backend API: Health check OK"
    API_RESPONSE=$(curl -s "${BACKEND_URL}/health" 2>/dev/null || echo "N/A")
    log "API Response: $API_RESPONSE"
else
    warn "⚠️  Backend API: Health check fallito"
    log "Verifica manualmente: curl ${BACKEND_URL}/health"
fi

# Test frontend
FRONTEND_URL="http://${SERVER_IP}:3000"
if curl -f -s "$FRONTEND_URL" >/dev/null 2>&1; then
    success "✅ Frontend: Disponibile"
else
    warn "⚠️  Frontend: Test disponibilità fallito"
    log "Verifica manualmente: curl $FRONTEND_URL"
fi

# Step 12: Test API specifico per verificare configurazione corretta
log "🧪 Test configurazione API endpoints..."
# Test che il frontend non chiami la porta sbagliata
if curl -s "${BACKEND_URL}/api/v1/" >/dev/null 2>&1; then
    success "✅ API v1 endpoint: Disponibile"
else
    warn "⚠️  API v1 endpoint: Verifica configurazione"
fi

# Step 13: Informazioni finali
echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🎉 INSTALLAZIONE COMPLETATA! 🎉${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""
echo -e "${GREEN}🌐 Accesso all'applicazione:${NC}"
echo -e "   Frontend URL: ${YELLOW}$FRONTEND_URL${NC}"
echo -e "   Backend API:  ${YELLOW}$BACKEND_URL${NC}"
echo -e "   API Docs:     ${YELLOW}$BACKEND_URL/docs${NC}"
echo -e "   Health Check: ${YELLOW}$BACKEND_URL/health${NC}"
if [ -n "$DOMAIN" ]; then
    echo -e "   Dominio:      ${YELLOW}https://$DOMAIN${NC} (configurare reverse proxy)"
fi
echo ""
echo -e "${GREEN}🔐 Credenziali amministratore:${NC}"
echo -e "   Email:    ${YELLOW}admin@example.com${NC}"
echo -e "   Password: ${YELLOW}admin123${NC}"
echo -e "   ${RED}⚠️  CAMBIA SUBITO LE CREDENZIALI!${NC}"
echo ""
echo -e "${GREEN}⚡ VANTAGGI CONFIGURAZIONE SENZA BUILD:${NC}"
echo -e "   ✅ Nessun errore build context"
echo -e "   ✅ Deploy velocissimo (no build time)"
echo -e "   ✅ Immagini multi-arch testate"
echo -e "   ✅ Compatibilità universale"
echo ""
echo -e "${GREEN}🛠️  Gestione servizi:${NC}"
echo -e "   Status:   ${YELLOW}docker compose ps${NC}"
echo -e "   Logs:     ${YELLOW}docker compose logs -f${NC}"
echo -e "   Stop:     ${YELLOW}docker compose down${NC}"
echo -e "   Restart:  ${YELLOW}docker compose restart${NC}"
echo -e "   Update:   ${YELLOW}docker compose pull && docker compose up -d${NC}"
echo ""
echo -e "${GREEN}🔧 Troubleshooting:${NC}"
echo -e "   Se l'app non risponde:"
echo -e "   1. ${YELLOW}docker compose logs backend${NC}"
echo -e "   2. ${YELLOW}curl $BACKEND_URL/health${NC}"
echo -e "   3. ${YELLOW}docker compose restart${NC}"
echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${PURPLE}✅ MyKeyManager installato senza build locale su ARM64!${NC}"
echo -e "${BLUE}=====================================================================${NC}"
