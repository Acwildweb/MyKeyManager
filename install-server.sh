#!/bin/bash

# =========================================================================
# MyKeyManager - Script Installazione Server Docker Esterno
# =========================================================================

set -e  # Exit on any error

echo "🐳 MyKeyManager - Installazione Server Docker Esterno"
echo "======================================================"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Controlla prerequisiti
echo "🔍 Controllo prerequisiti..."

if ! command -v docker &> /dev/null; then
    print_error "Docker non è installato. Installa Docker prima di continuare."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose non è installato. Installa Docker Compose prima di continuare."
    exit 1
fi

print_status "Docker e Docker Compose sono installati"

# Controlla se i file necessari esistono
if [ ! -f "docker-compose.server.yml" ]; then
    print_info "Download docker-compose.server.yml..."
    curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.server.yml
fi

if [ ! -f ".env" ]; then
    if [ -f ".env.server.example" ]; then
        print_warning "File .env non trovato. Copio .env.server.example come .env"
        cp .env.server.example .env
    else
        print_info "Download .env.server.example..."
        curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/.env.server.example
        cp .env.server.example .env
    fi
    
    print_warning "IMPORTANTE: Modifica il file .env con i tuoi valori prima di continuare!"
    print_info "Editor disponibili: nano .env, vim .env, oppure modifica con il tuo editor preferito"
    
    read -p "Hai configurato il file .env? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Configura il file .env e riavvia lo script"
        exit 1
    fi
fi

# Carica le variabili d'ambiente
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    print_status "Variabili d'ambiente caricate da .env"
else
    print_error "File .env non trovato!"
    exit 1
fi

# Mostra configurazione
echo ""
echo "📋 CONFIGURAZIONE CORRENTE:"
echo "================================"
echo "Frontend Port: ${FRONTEND_PORT:-8080}"
echo "Backend Port: ${BACKEND_PORT:-8001}"
echo "Database Port: ${DB_PORT:-5432}"
echo "Redis Port: ${REDIS_PORT:-6379}"
echo "Container Prefix: ${CONTAINER_PREFIX:-mykeymanager}"
echo "Network: ${NETWORK_NAME:-mykeymanager-network}"
echo ""

# Controlla porte
echo "🔌 Controllo disponibilità porte..."

check_port() {
    local port=$1
    local service=$2
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        print_warning "Porta $port ($service) è già in uso!"
        return 1
    else
        print_status "Porta $port ($service) disponibile"
        return 0
    fi
}

PORTS_OK=true
check_port "${FRONTEND_PORT:-8080}" "Frontend" || PORTS_OK=false
check_port "${BACKEND_PORT:-8001}" "Backend" || PORTS_OK=false
check_port "${DB_PORT:-5432}" "Database" || PORTS_OK=false
check_port "${REDIS_PORT:-6379}" "Redis" || PORTS_OK=false

if [ "$PORTS_OK" = false ]; then
    print_warning "Alcune porte sono già in uso. Modifica il file .env per usare porte diverse."
    read -p "Vuoi continuare comunque? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Controlla spazio disco
echo "💾 Controllo spazio disco..."
AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
if [ "$AVAILABLE_SPACE" -lt 2097152 ]; then  # 2GB in KB
    print_warning "Spazio disco limitato (meno di 2GB disponibili)"
else
    print_status "Spazio disco sufficiente"
fi

# Ferma container esistenti
echo "🛑 Ferma eventuali container esistenti..."
docker compose -f docker-compose.server.yml down 2>/dev/null || true

# Opzione per pulire volumi
read -p "🧹 Vuoi pulire i volumi esistenti (CANCELLA TUTTI I DATI)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Rimozione volumi esistenti..."
    docker volume rm "${CONTAINER_PREFIX:-mykeymanager}_postgres_data" "${CONTAINER_PREFIX:-mykeymanager}_redis_data" 2>/dev/null || true
fi

# Pull delle immagini
echo "📥 Download immagini Docker..."
docker compose -f docker-compose.server.yml pull

# Avvio servizi
echo "🚀 Avvio servizi MyKeyManager..."
docker compose -f docker-compose.server.yml up -d

# Attesa servizi
echo "⏳ Attendo che i servizi siano pronti..."
sleep 15

# Controllo stato servizi
echo "📊 Controllo stato servizi..."
docker compose -f docker-compose.server.yml ps

# Test connettività
echo "🧪 Test connettività..."

# Test database
for i in {1..30}; do
    if docker exec "${CONTAINER_PREFIX:-mykeymanager}-db" pg_isready -U "${POSTGRES_USER:-mykeymanager}" -d "${POSTGRES_DB:-mykeymanager}" >/dev/null 2>&1; then
        print_status "Database PostgreSQL pronto"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database non risponde dopo 60 secondi"
    else
        echo "⏳ Attendo database... ($i/30)"
        sleep 2
    fi
done

# Test backend
for i in {1..30}; do
    if curl -f "http://localhost:${BACKEND_PORT:-8001}/health" >/dev/null 2>&1; then
        print_status "Backend API pronto"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Backend API non risponde dopo 60 secondi"
    else
        echo "⏳ Attendo backend... ($i/30)"
        sleep 2
    fi
done

# Test frontend
for i in {1..20}; do
    if curl -f "http://localhost:${FRONTEND_PORT:-8080}" >/dev/null 2>&1; then
        print_status "Frontend Web pronto"
        break
    fi
    if [ $i -eq 20 ]; then
        print_warning "Frontend potrebbe non essere ancora pronto"
    else
        echo "⏳ Attendo frontend... ($i/20)"
        sleep 2
    fi
done

# Riepilogo finale
echo ""
echo "🎉 INSTALLAZIONE COMPLETATA!"
echo "============================="
echo ""
echo "🌐 ACCESSO MyKeyManager:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "   Backend API: http://localhost:${BACKEND_PORT:-8001}"
echo ""
echo "👤 Credenziali default:"
echo "   Username: admin"
echo "   Password: ChangeMe!123"
echo ""
echo "🔧 COMANDI UTILI:"
echo "   Status: docker compose -f docker-compose.server.yml ps"
echo "   Logs: docker compose -f docker-compose.server.yml logs"
echo "   Stop: docker compose -f docker-compose.server.yml down"
echo "   Restart: docker compose -f docker-compose.server.yml restart"
echo ""
echo "⚠️  SICUREZZA:"
echo "   1. Cambia la password admin nell'interfaccia web"
echo "   2. Configura un reverse proxy (Nginx/Traefik) per HTTPS"
echo "   3. Configura un firewall per limitare l'accesso alle porte"
echo "   4. Backup regolari dei volumi Docker"
echo ""

# Mostra logs se richiesto
read -p "Vuoi vedere i logs dei servizi? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose -f docker-compose.server.yml logs --tail 20
fi
