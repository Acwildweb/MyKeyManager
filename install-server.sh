#!/bin/bash

# =========================================================================
# MyKeyManager - Installer per Server CasaOS/AMD64
# =========================================================================

set -e

echo "🚀 MyKeyManager - Installazione per Server CasaOS"
echo "=================================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Controlla se Docker è installato
check_docker() {
    print_status "Verifico installazione Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker non è installato!"
        echo "Installa Docker prima di continuare:"
        echo "https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker trovato: $(docker --version)"
}

# Controlla se Docker Compose è installato
check_docker_compose() {
    print_status "Verifico Docker Compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose non è installato!"
        echo "Installa Docker Compose prima di continuare"
        exit 1
    fi
    print_success "Docker Compose trovato"
}

# Rileva architettura
detect_architecture() {
    ARCH=$(uname -m)
    print_status "Architettura rilevata: $ARCH"
    
    case $ARCH in
        x86_64|amd64)
            DOCKER_PLATFORM="linux/amd64"
            print_success "Architettura AMD64 supportata"
            ;;
        aarch64|arm64)
            DOCKER_PLATFORM="linux/arm64"
            print_success "Architettura ARM64 supportata"
            ;;
        *)
            print_error "Architettura $ARCH non supportata"
            exit 1
            ;;
    esac
}

# Ottieni IP del server
get_server_ip() {
    print_status "Rilevamento IP del server..."
    
    # Prova diversi metodi per ottenere l'IP
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "")
    
    if [ -z "$SERVER_IP" ]; then
        # Fallback su IP locale
        SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ip route get 8.8.8.8 | awk '{print $7}' 2>/dev/null || echo "localhost")
    fi
    
    print_success "IP del server: $SERVER_IP"
}

# Crea directory di lavoro
setup_workspace() {
    print_status "Creazione workspace..."
    
    WORK_DIR="$HOME/mykeymanager"
    mkdir -p "$WORK_DIR"
    cd "$WORK_DIR"
    
    print_success "Workspace creato in: $WORK_DIR"
}

# Scarica file necessari
download_files() {
    print_status "Download file di configurazione..."
    
    # Download repository completo
    print_status "Clonazione repository..."
    if [ -d ".git" ]; then
        git pull
    else
        git clone https://github.com/Acwildweb/MyKeyManager.git .
    fi
    
    print_success "File scaricati con successo"
}

# Configura docker-compose per l'architettura corretta
configure_docker_compose() {
    print_status "Configurazione Docker Compose per $DOCKER_PLATFORM..."
    
    # Usa sempre il docker-compose.server.yml per installazioni su server
    if [ -f "docker-compose.server.yml" ]; then
        cp docker-compose.server.yml docker-compose.yml
        print_success "Configurazione server multi-architettura applicata"
    fi
    
    # Sostituisci placeholder con IP reale
    if [ "$SERVER_IP" != "localhost" ]; then
        sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml
        sed -i.bak "s/localhost:8001/$SERVER_IP:8001/g" docker-compose.yml
        rm -f docker-compose.yml.bak
        print_success "IP del server configurato: $SERVER_IP"
    fi
}

# Configura file .env
setup_environment() {
    print_status "Configurazione file ambiente..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.production" ]; then
            cp .env.production .env
        else
            cat > .env << EOF
# MyKeyManager Configuration
DATABASE_URL=postgresql://mykeymanager:MyKey2024!Secure@database:5432/mykeymanager
SECRET_KEY=MyKeyManager-Production-Secret-2024-Change-This
ALLOWED_ORIGINS=http://$SERVER_IP:8080,http://localhost:8080
VITE_API_URL=http://$SERVER_IP:8001
EOF
        fi
        print_success "File .env creato"
    else
        print_warning "File .env già esistente, non modificato"
    fi
}

# Avvia i servizi
start_services() {
    print_status "Avvio servizi MyKeyManager..."
    
    # Ferma e rimuovi eventuali container esistenti
    print_status "Pulizia container esistenti..."
    docker compose down -v 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    
    # Costruisci e avvia i servizi
    print_status "Costruzione e avvio container per architettura $DOCKER_PLATFORM..."
    docker compose up -d --build --force-recreate
    
    print_success "Servizi avviati!"
}

# Attende che i servizi siano pronti
wait_for_services() {
    print_status "Attesa avvio servizi..."
    
    # Attende PostgreSQL
    print_status "Attesa database..."
    for i in {1..30}; do
        if docker compose exec -T database pg_isready -U mykeymanager -d mykeymanager >/dev/null 2>&1; then
            print_success "Database pronto"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Database non disponibile dopo 30 tentativi"
            exit 1
        fi
        sleep 2
    done
    
    # Attende Backend
    print_status "Attesa backend API..."
    for i in {1..60}; do
        if curl -s http://localhost:8001/health >/dev/null 2>&1; then
            print_success "Backend API pronto"
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "Backend API non disponibile dopo 60 tentativi"
            exit 1
        fi
        sleep 2
    done
    
    # Attende Frontend
    print_status "Attesa frontend web..."
    for i in {1..30}; do
        if curl -s http://localhost:8080 >/dev/null 2>&1; then
            print_success "Frontend web pronto"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend web non disponibile dopo 30 tentativi"
            exit 1
        fi
        sleep 2
    done
}

# Mostra informazioni finali
show_final_info() {
    echo ""
    echo "=============================="
    print_success "🎉 INSTALLAZIONE COMPLETATA!"
    echo "=============================="
    echo ""
    echo "🌐 Accedi a MyKeyManager:"
    echo "   Frontend: http://$SERVER_IP:8080"
    echo "   API:      http://$SERVER_IP:8001"
    echo ""
    echo "📊 Monitoraggio:"
    echo "   docker compose ps      # Stato servizi"
    echo "   docker compose logs    # Log completi" 
    echo "   docker compose logs -f # Log in tempo reale"
    echo ""
    echo "🔧 Gestione:"
    echo "   docker compose stop    # Ferma servizi"
    echo "   docker compose start   # Avvia servizi"
    echo "   docker compose restart # Riavvia servizi"
    echo ""
    echo "🗂️  Directory di lavoro: $(pwd)"
    echo ""
    print_warning "⚠️  IMPORTANTE:"
    echo "   - Cambia le password di default nel file .env"
    echo "   - Configura un certificato SSL per produzione"
    echo "   - Effettua backup regolari del volume postgres_data"
    echo ""
}

# Funzione principale
main() {
    print_status "Inizio installazione MyKeyManager per CasaOS..."
    
    check_docker
    check_docker_compose
    detect_architecture
    get_server_ip
    setup_workspace
    download_files
    configure_docker_compose
    setup_environment
    start_services
    wait_for_services
    show_final_info
}

# Gestione errori
trap 'print_error "Installazione fallita! Controlla i log sopra per dettagli."' ERR

# Esegui installazione
main

print_success "✅ Installazione MyKeyManager completata!"
