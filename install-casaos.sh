#!/bin/bash

# =========================================================================
# MyKeyManager - Installer Semplificato per CasaOS ARM64
# Usa solo immagini Docker Hub - Non richiede codice sorgente
# =========================================================================

set -e

echo "🚀 MyKeyManager - Installazione CasaOS ARM64"
echo "============================================"

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
        echo "Installa Docker prima di continuare"
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
            print_success "Architettura ARM64 supportata - PERFETTA per CasaOS!"
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

# Scarica solo il docker-compose necessario
download_compose_file() {
    print_status "Download configurazione Docker Compose per CasaOS..."
    
    # Download del docker-compose specifico per CasaOS
    curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.casaos.yml
    
    if [ ! -f "docker-compose.casaos.yml" ]; then
        print_error "Impossibile scaricare il file docker-compose.casaos.yml"
        print_status "Provo un metodo alternativo..."
        
        # Metodo alternativo con wget
        wget https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.casaos.yml 2>/dev/null || {
            print_error "Impossibile scaricare il file. Controlla la connessione internet."
            exit 1
        }
    fi
    
    # Copia come docker-compose.yml
    cp docker-compose.casaos.yml docker-compose.yml
    
    print_success "File di configurazione scaricato"
}

# Configura docker-compose con IP del server
configure_docker_compose() {
    print_status "Configurazione IP del server ($SERVER_IP)..."
    
    # Sostituisci placeholder con IP reale
    if [ "$SERVER_IP" != "localhost" ]; then
        sed -i.bak "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml
        rm -f docker-compose.yml.bak
        print_success "IP del server configurato: $SERVER_IP"
    fi
}

# Pulisci eventuali installazioni precedenti
cleanup_previous() {
    print_status "Pulizia installazioni precedenti..."
    
    # Ferma e rimuovi eventuali container esistenti
    docker compose down -v 2>/dev/null || true
    
    # Rimuovi immagini obsolete se esistono (per aggiornamenti)
    docker rmi acwild/mykeymanager-backend:latest 2>/dev/null || true
    docker rmi acwild/mykeymanager-frontend:latest 2>/dev/null || true
    
    # Pulizia sistema
    docker system prune -f 2>/dev/null || true
    
    print_success "Pulizia completata"
}

# Avvia i servizi
start_services() {
    print_status "Download e avvio servizi MyKeyManager per $DOCKER_PLATFORM..."
    
    # Avvia i servizi (Docker scaricherà automaticamente le immagini multi-arch)
    print_status "Download immagini Docker Hub multi-architettura e avvio container..."
    docker compose up -d
    
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
            print_status "Log database:"
            docker compose logs database
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
            print_status "Log backend:"
            docker compose logs backend
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
            print_status "Log frontend:"
            docker compose logs frontend
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
    echo "   Health:   http://$SERVER_IP:8001/health"
    echo ""
    echo "📊 Monitoraggio:"
    echo "   docker compose ps        # Stato servizi"
    echo "   docker compose logs      # Log completi" 
    echo "   docker compose logs -f   # Log in tempo reale"
    echo ""
    echo "🔧 Gestione:"
    echo "   docker compose stop      # Ferma servizi"
    echo "   docker compose start     # Avvia servizi"
    echo "   docker compose restart   # Riavvia servizi"
    echo "   docker compose down      # Ferma e rimuovi"
    echo ""
    echo "🗂️  Directory di lavoro: $(pwd)"
    echo "🏗️  Architettura: $DOCKER_PLATFORM"
    echo ""
    print_warning "⚠️  IMPORTANTE:"
    echo "   - Cambia le password di default modificando docker-compose.yml"
    echo "   - Configura un certificato SSL per produzione"
    echo "   - Effettua backup regolari del volume postgres_data"
    echo ""
}

# Funzione principale
main() {
    print_status "Inizio installazione MyKeyManager per CasaOS ARM64..."
    
    check_docker
    check_docker_compose
    detect_architecture
    get_server_ip
    setup_workspace
    download_compose_file
    configure_docker_compose
    cleanup_previous
    start_services
    wait_for_services
    show_final_info
}

# Gestione errori
trap 'print_error "Installazione fallita! Controlla i log sopra per dettagli."' ERR

# Esegui installazione
main

print_success "✅ Installazione MyKeyManager completata su CasaOS ARM64!"
