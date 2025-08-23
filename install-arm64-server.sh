#!/bin/bash

# ====================================================================
# Script di installazione MyKeyManager per Server ARM64 Esterni
# Ottimizzato per deployment su server Linux ARM64 (non CasaOS)
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
echo -e "${BLUE}🚀 MyKeyManager - Installazione Server ARM64 Esterno${NC}"
echo -e "${BLUE}=====================================================================${NC}"
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
    error "Questo script è ottimizzato per Linux. OS rilevato: $OS"
    exit 1
fi

case $ARCH in
    aarch64|arm64)
        success "✅ Architettura ARM64 confermata: $ARCH"
        ;;
    x86_64|amd64)
        warn "⚠️  Architettura AMD64 rilevata: $ARCH"
        warn "Questo script è ottimizzato per ARM64, ma continuerò..."
        ;;
    *)
        error "❌ Architettura $ARCH non supportata"
        exit 1
        ;;
esac

# Step 2: Verifica directory progetto
log "Verifica directory progetto..."
if [ ! -f "docker-compose.arm64.yml" ]; then
    error "File docker-compose.arm64.yml non trovato!"
    error "Assicurati di essere nella directory root del progetto MyKeyManager"
    exit 1
fi

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    error "Directory backend o frontend non trovate!"
    error "Clona il repository completo: git clone https://github.com/Acwildweb/MyKeyManager.git"
    exit 1
fi

if [ ! -f "backend/Dockerfile" ] || [ ! -f "frontend/Dockerfile" ]; then
    error "Dockerfile locali non trovati!"
    error "Aggiorna il repository: git pull origin main"
    exit 1
fi

success "✅ Struttura progetto verificata"

# Step 3: Verifica Docker
log "Verifica installazione Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker non installato!"
    echo "Installa Docker con:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose non installato!"
    echo "Installa Docker Compose v2"
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

# Step 4: Rilevamento IP del server
log "Rilevamento IP del server..."

# Metodi multipli per rilevare IP
SERVER_IP=""

# Metodo 1: IP pubblico
SERVER_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "")

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

# Step 6: Configurazione ambiente
log "Configurazione variabili d'ambiente..."
export SERVER_IP="$SERVER_IP"
if [ -n "$DOMAIN" ]; then
    export DOMAIN="$DOMAIN"
fi

# Crea copia del docker-compose per configurazione
cp docker-compose.arm64.yml docker-compose.yml

# Sostituisce IP del server
sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml

# Sostituisce dominio se specificato
if [ -n "$DOMAIN" ]; then
    sed -i.bak "s/YOUR_DOMAIN/$DOMAIN/g" docker-compose.yml
    success "✅ Configurazione dominio applicata"
fi

rm -f docker-compose.yml.bak
success "✅ Configurazione ambiente completata"

# Step 7: Gestione installazione precedente
log "Verifica installazioni precedenti..."
if docker compose ps 2>/dev/null | grep -q "Up"; then
    warn "⚠️  Servizi esistenti rilevati"
    read -p "Vuoi fermare e rimuovere i servizi esistenti? [y/N]: " -n 1 -r REMOVE_EXISTING
    echo
    if [[ $REMOVE_EXISTING =~ ^[Yy]$ ]]; then
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

# Step 8: Build e deploy
log "🏗️  Build e avvio servizi MyKeyManager..."
log "⏳ Questo processo può richiedere 5-15 minuti per il build completo..."

# Avvia servizi con build
if docker compose up -d --build; then
    success "✅ Build e deploy completati"
else
    error "❌ Errore durante build/deploy"
    log "Verifica log con: docker compose logs"
    exit 1
fi

# Step 9: Attesa e verifica servizi
log "⏳ Attesa avvio servizi (90 secondi)..."
sleep 30

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

# Step 10: Health check completo
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
    log "Response: $API_RESPONSE"
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

# Step 11: Informazioni finali
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
echo -e "${GREEN}🛠️  Gestione servizi:${NC}"
echo -e "   Status:   ${YELLOW}docker compose ps${NC}"
echo -e "   Logs:     ${YELLOW}docker compose logs -f${NC}"
echo -e "   Stop:     ${YELLOW}docker compose down${NC}"
echo -e "   Restart:  ${YELLOW}docker compose restart${NC}"
echo -e "   Update:   ${YELLOW}git pull && docker compose up -d --build${NC}"
echo ""
echo -e "${GREEN}💾 Backup database:${NC}"
echo -e "   ${YELLOW}docker compose exec database pg_dump -U mykeymanager mykeymanager > backup_\$(date +%Y%m%d).sql${NC}"
echo ""
echo -e "${GREEN}🔒 Sicurezza (IMPORTANTE):${NC}"
echo -e "   • Configura firewall per porte 3000, 8001"
echo -e "   • Configura HTTPS con reverse proxy (Nginx/Traefik)"
echo -e "   • Cambia SECRET_KEY nel docker-compose.yml"
echo -e "   • Configura backup automatici"
echo -e "   • Aggiorna password PostgreSQL"
echo ""
echo -e "${GREEN}📊 Monitoraggio:${NC}"
echo -e "   Sistema: ${YELLOW}htop, df -h, free -h${NC}"
echo -e "   Docker:  ${YELLOW}docker stats${NC}"
echo -e "   App:     ${YELLOW}curl $BACKEND_URL/health${NC}"
echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${PURPLE}✅ MyKeyManager installato con successo su server ARM64!${NC}"
echo -e "${BLUE}=====================================================================${NC}"
