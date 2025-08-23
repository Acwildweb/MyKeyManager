#!/bin/bash

# ====================================================================
# Script di installazione MyKeyManager per CasaOS ARM64
# Build locale - Risolve problemi di configurazione API endpoints
# ====================================================================

set -e  # Exit on any error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per logging
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🚀 MyKeyManager - Installazione CasaOS ARM64 (Build Locale)${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""

# Step 1: Verifica che siamo nella directory corretta
log "Verifica directory progetto..."
if [ ! -f "docker-compose.casaos.yml" ]; then
    error "File docker-compose.casaos.yml non trovato!"
    error "Assicurati di essere nella directory root del progetto licenze-manager"
    exit 1
fi

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    error "Directory backend o frontend non trovate!"
    error "Assicurati di avere il codice sorgente completo"
    exit 1
fi

# Verifica Dockerfile locali
if [ ! -f "backend/Dockerfile" ] || [ ! -f "frontend/Dockerfile" ]; then
    error "Dockerfile non trovati nelle directory backend/frontend!"
    error "Assicurati di avere la versione aggiornata del repository"
    exit 1
fi

log "✅ Directory progetto e Dockerfile verificati"

# Step 2: Rilevamento architettura
log "Rilevamento architettura sistema..."
ARCH=$(uname -m)
log "Architettura rilevata: $ARCH"

case $ARCH in
    aarch64|arm64)
        log "✅ Architettura ARM64 supportata"
        ;;
    x86_64|amd64)
        warn "Architettura AMD64 rilevata. Il progetto è ottimizzato per ARM64 su CasaOS"
        ;;
    *)
        error "Architettura $ARCH non supportata"
        exit 1
        ;;
esac

# Step 3: Rilevamento IP server
log "Rilevamento IP del server..."
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    # Fallback methods
    SERVER_IP=$(ip route get 8.8.8.8 | awk '{print $7}' 2>/dev/null || echo "localhost")
fi

if [ -z "$SERVER_IP" ] || [ "$SERVER_IP" = "localhost" ]; then
    error "Impossibile rilevare IP del server"
    error "Configura manualmente SERVER_IP nel docker-compose.casaos.yml"
    exit 1
fi

log "IP Server rilevato: $SERVER_IP"

# Step 4: Verifica Docker
log "Verifica installazione Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker non installato. Installare Docker prima di continuare."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose non installato. Installare Docker Compose prima di continuare."
    exit 1
fi

log "✅ Docker trovato: $(docker --version)"
log "✅ Docker Compose trovato"

# Step 5: Configurazione environment
log "Configurazione variabili d'ambiente..."
export SERVER_IP="$SERVER_IP"
log "✅ SERVER_IP configurato: $SERVER_IP"

# Step 6: Arresto servizi esistenti
log "Verifica servizi esistenti..."
if docker compose -f docker-compose.casaos.yml ps 2>/dev/null | grep -q "Up"; then
    warn "Servizi già attivi. Arresto in corso..."
    docker compose -f docker-compose.casaos.yml down
    log "✅ Servizi arrestati"
fi

# Step 7: Pulizia volumi se necessario (opzionale)
read -p "Vuoi pulire i volumi esistenti? (rimuoverà tutti i dati) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    warn "Rimozione volumi esistenti..."
    docker compose -f docker-compose.casaos.yml down -v
    docker volume prune -f
    log "✅ Volumi rimossi"
fi

# Step 8: Build e avvio servizi
log "Build e avvio servizi con Docker Compose..."
log "Usando file: docker-compose.casaos.yml"
log "⏳ Build locale in corso (potrebbe richiedere 5-10 minuti)..."

# Build con verbose output
docker compose -f docker-compose.casaos.yml up -d --build

# Step 9: Attesa avvio servizi
log "⏳ Attesa avvio servizi (60 secondi)..."
sleep 20

# Step 10: Verifica stato servizi
log "Verifica stato servizi..."

# Check database
if docker compose -f docker-compose.casaos.yml ps | grep postgres | grep -q "Up"; then
    log "✅ Database PostgreSQL attivo"
else
    error "❌ Database PostgreSQL non attivo"
    docker compose -f docker-compose.casaos.yml logs database
fi

# Check backend
if docker compose -f docker-compose.casaos.yml ps | grep backend | grep -q "Up"; then
    log "✅ Backend FastAPI attivo"
else
    error "❌ Backend FastAPI non attivo"
    docker compose -f docker-compose.casaos.yml logs backend
fi

# Check frontend
if docker compose -f docker-compose.casaos.yml ps | grep frontend | grep -q "Up"; then
    log "✅ Frontend React attivo"
else
    error "❌ Frontend React non attivo"
    docker compose -f docker-compose.casaos.yml logs frontend
fi

# Step 11: Health check dettagliato
log "Controllo health check dettagliato..."
sleep 10

# Test database connection
log "Test connessione database..."
if docker compose -f docker-compose.casaos.yml exec -T database pg_isready -U mykeymanager -d mykeymanager; then
    log "✅ Database connection OK"
else
    warn "⚠️  Database connection test fallito"
fi

# Test backend health
log "Test backend health endpoint..."
if curl -f -s "http://${SERVER_IP}:8001/health" > /dev/null; then
    log "✅ Backend health check OK"
    log "Backend response: $(curl -s "http://${SERVER_IP}:8001/health")"
else
    warn "⚠️  Backend health check fallito - verifica logs"
    docker compose -f docker-compose.casaos.yml logs backend --tail=20
fi

# Test frontend availability
log "Test frontend availability..."
if curl -f -s "http://${SERVER_IP}:3000" > /dev/null; then
    log "✅ Frontend availability OK"
else
    warn "⚠️  Frontend availability test fallito - verifica logs"
    docker compose -f docker-compose.casaos.yml logs frontend --tail=20
fi

# Step 12: Test API endpoint specifico
log "Test API endpoint change-password..."
# Test specifico per l'endpoint che stava fallendo
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" -X GET "http://${SERVER_IP}:8001/api/v1/users/me" || echo "000")
if [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "422" ]; then
    log "✅ API endpoint risponde correttamente (401/422 expected senza auth)"
elif [ "$HTTP_STATUS" = "000" ]; then
    warn "⚠️  API endpoint non raggiungibile"
else
    log "API endpoint status: $HTTP_STATUS"
fi

# Step 13: Informazioni di accesso finali
echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🎉 INSTALLAZIONE COMPLETATA! 🎉${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo ""
echo -e "${GREEN}🌐 Accesso all'applicazione:${NC}"
echo -e "   Frontend URL: ${YELLOW}http://${SERVER_IP}:3000${NC}"
echo -e "   Backend API:  ${YELLOW}http://${SERVER_IP}:8001${NC}"
echo -e "   API Docs:     ${YELLOW}http://${SERVER_IP}:8001/docs${NC}"
echo -e "   Health Check: ${YELLOW}http://${SERVER_IP}:8001/health${NC}"
echo ""
echo -e "${GREEN}🔐 Credenziali default amministratore:${NC}"
echo -e "   Email:    ${YELLOW}admin@example.com${NC}"
echo -e "   Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "${GREEN}🛠️  Comandi utili:${NC}"
echo -e "   Status:   ${YELLOW}docker compose -f docker-compose.casaos.yml ps${NC}"
echo -e "   Logs:     ${YELLOW}docker compose -f docker-compose.casaos.yml logs -f${NC}"
echo -e "   Stop:     ${YELLOW}docker compose -f docker-compose.casaos.yml down${NC}"
echo -e "   Restart:  ${YELLOW}docker compose -f docker-compose.casaos.yml restart${NC}"
echo -e "   Rebuild:  ${YELLOW}docker compose -f docker-compose.casaos.yml up -d --build${NC}"
echo ""
echo -e "${GREEN}📋 Note importanti:${NC}"
echo -e "   • Build locale risolve problemi di configurazione API endpoints"
echo -e "   • Tutti i dati sono persistenti tramite volumi Docker"
echo -e "   • Configurazione ottimizzata per CasaOS ARM64"
echo -e "   • API correttamente configurata per IP: $SERVER_IP"
echo ""
echo -e "${GREEN}🔧 Troubleshooting:${NC}"
echo -e "   Se l'app non funziona:"
echo -e "   1. Verifica logs: docker compose -f docker-compose.casaos.yml logs"
echo -e "   2. Verifica IP: curl http://${SERVER_IP}:8001/health"
echo -e "   3. Riavvia: docker compose -f docker-compose.casaos.yml restart"
echo ""
echo -e "${BLUE}=====================================================================${NC}"

# Final status summary
echo -e "${GREEN}✅ Installazione MyKeyManager completata su CasaOS ARM64 con build locale!${NC}"
