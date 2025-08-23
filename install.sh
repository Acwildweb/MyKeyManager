#!/bin/bash

# =========================================================================
# MyKeyManager - Script di Installazione Semplificato
# =========================================================================

set -e  # Exit on any error

echo "🚀 MyKeyManager - Installazione Docker"
echo "======================================="

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Controlla Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker non installato!"
    print_info "Installa Docker da: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose non installato!"
    print_info "Installa Docker Compose da: https://docs.docker.com/compose/install/"
    exit 1
fi

print_status "Docker e Docker Compose trovati"

# Gestione permessi Docker
if ! docker ps &> /dev/null; then
    print_warning "Permessi Docker insufficienti"
    if command -v sudo &> /dev/null; then
        print_info "Provo con sudo..."
        if sudo docker ps &> /dev/null; then
            print_status "Uso sudo per Docker"
            DOCKER_CMD="sudo docker"
            COMPOSE_CMD="sudo docker compose"
        else
            print_error "Impossibile accedere a Docker anche con sudo"
            exit 1
        fi
    else
        print_error "Sudo non disponibile e Docker non accessibile"
        exit 1
    fi
else
    print_status "Permessi Docker OK"
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker compose"
fi

# Download file se necessario
if [ ! -f "docker-compose.yml" ]; then
    print_info "Download docker-compose.yml..."
    curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.yml
fi

if [ ! -f ".env.production" ]; then
    print_info "Download .env.production..."
    curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/.env.production
fi

# Configurazione
if [ ! -f ".env" ]; then
    print_info "Creazione file .env..."
    cp .env.production .env
    
    print_warning "IMPORTANTE: Configura il file .env prima di continuare!"
    print_info "Modifica almeno:"
    print_info "  - POSTGRES_PASSWORD (password database)"
    print_info "  - SECRET_KEY (chiave segreta)"
    print_info "  - ALLOWED_ORIGINS (IP del tuo server)"
    echo ""
    
    read -p "Hai configurato il file .env? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Configura il file .env e riesegui lo script"
        exit 1
    fi
fi

# Carica variabili ambiente
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    print_status "Configurazione caricata"
fi

# Ferma installazioni precedenti
print_info "Arresto eventuali installazioni precedenti..."
$COMPOSE_CMD down 2>/dev/null || true

# Download immagini
print_info "Download immagini Docker..."
$COMPOSE_CMD pull

# Avvio servizi
print_info "Avvio MyKeyManager..."
$COMPOSE_CMD up -d

# Attesa avvio
print_info "Attendo avvio servizi..."
sleep 30

# Verifica stato
print_info "Verifica stato servizi..."

# Test database
for i in {1..10}; do
    if $DOCKER_CMD exec mykeymanager-db pg_isready -U mykeymanager -d mykeymanager >/dev/null 2>&1; then
        print_status "Database PostgreSQL pronto"
        break
    fi
    if [ $i -eq 10 ]; then
        print_warning "Database impiega più tempo del previsto"
    else
        echo -n "."
        sleep 3
    fi
done

# Test backend
for i in {1..10}; do
    if curl -f "http://localhost:${BACKEND_PORT:-8001}/health" >/dev/null 2>&1; then
        print_status "Backend API pronto"
        break
    fi
    if [ $i -eq 10 ]; then
        print_warning "Backend impiega più tempo del previsto"
    else
        echo -n "."
        sleep 3
    fi
done

# Test frontend
for i in {1..10}; do
    if curl -f "http://localhost:${FRONTEND_PORT:-8080}" >/dev/null 2>&1; then
        print_status "Frontend Web pronto"
        break
    fi
    if [ $i -eq 10 ]; then
        print_warning "Frontend impiega più tempo del previsto"
    else
        echo -n "."
        sleep 2
    fi
done

# Risultato finale
echo ""
echo "🎉 INSTALLAZIONE COMPLETATA!"
echo "============================"
echo ""
echo "🌐 Accesso MyKeyManager:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-8080}"
echo "   Backend:  http://localhost:${BACKEND_PORT:-8001}"
echo ""
echo "🔑 Credenziali default:"
echo "   Username: admin"
echo "   Password: ChangeMe!123"
echo ""
echo "🔧 Comandi gestione:"
echo "   Status:   $COMPOSE_CMD ps"
echo "   Logs:     $COMPOSE_CMD logs"
echo "   Stop:     $COMPOSE_CMD down"
echo "   Restart:  $COMPOSE_CMD restart"
echo ""
print_status "MyKeyManager è ora attivo!"

# Mostra stato finale
echo ""
echo "📊 Stato container:"
$COMPOSE_CMD ps
