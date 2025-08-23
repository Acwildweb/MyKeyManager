#!/bin/bash

# =========================================================================
# MyKeyManager - Installazione Automatica per CasaOS
# =========================================================================

set -e

# Colori per output
RED='# Download immagini Docker
echo "📥 Download immagini Docker..."
if ! docker_compose_cmd -f docker-compose.casaos.yml pull; then
    print_error "Errore durante il download delle immagini Docker"
    print_info "Controlla la connessione internet e i permessi Docker"
    exit 1
fim'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🏠 MyKeyManager per CasaOS               ║"
    echo "║              Installazione Automatica v1.1.2                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

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

# Funzioni helper per Docker con gestione sudo
docker_cmd() {
    if [ -n "$DOCKER_CMD" ]; then
        $DOCKER_CMD "$@"
    else
        docker "$@"
    fi
}

docker_compose_cmd() {
    if [ -n "$DOCKER_COMPOSE_CMD" ]; then
        $DOCKER_COMPOSE_CMD "$@"
    else
        docker compose "$@"
    fi
}

print_header

# Controlla se siamo su CasaOS
echo "🔍 Controllo ambiente CasaOS..."

if [ ! -d "/DATA" ]; then
    print_error "Directory /DATA non trovata. Questo script è ottimizzato per CasaOS."
    print_info "Se stai usando CasaOS, verifica che sia configurato correttamente."
    exit 1
fi

print_status "Ambiente CasaOS rilevato"

# Crea directory applicazione
APP_DIR="/DATA/AppData/mykeymanager"
echo "📁 Creazione directory applicazione..."

sudo mkdir -p "$APP_DIR"/{postgres,redis,backups}
sudo chown -R $(whoami):$(whoami) "$APP_DIR" 2>/dev/null || true

print_status "Directory create: $APP_DIR"

# Naviga nella directory
cd "$APP_DIR"

# Rileva IP CasaOS
echo "🌐 Rilevamento IP CasaOS..."
CASAOS_IP=$(hostname -I | awk '{print $1}' | head -n1)

if [ -z "$CASAOS_IP" ]; then
    CASAOS_IP="192.168.1.100"
    print_warning "IP non rilevato automaticamente, uso default: $CASAOS_IP"
else
    print_status "IP CasaOS rilevato: $CASAOS_IP"
fi

# Download docker-compose per CasaOS
echo "📥 Download configurazione CasaOS..."
curl -s -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.casaos.yml

if [ $? -eq 0 ]; then
    print_status "Docker Compose scaricato"
else
    print_error "Errore download Docker Compose"
    exit 1
fi

# Crea file .env personalizzato
echo "⚙️  Creazione configurazione personalizzata..."

cat > .env << EOF
# =========================================================================
# MyKeyManager - Configurazione CasaOS
# Generato automaticamente il $(date)
# =========================================================================

# IP CasaOS rilevato
CASAOS_IP=$CASAOS_IP

# Porte (modifica se necessario)
FRONTEND_PORT=8080
BACKEND_PORT=8001
DB_PORT=5432
REDIS_PORT=6379

# Database (CAMBIA PASSWORD IN PRODUZIONE!)
POSTGRES_PASSWORD=CasaOS_SecurePass_$(date +%s)
POSTGRES_DB=mykeymanager
POSTGRES_USER=mykeymanager

# Sicurezza (CAMBIA IN PRODUZIONE!)
SECRET_KEY=casaos-$(openssl rand -hex 16 2>/dev/null || echo "change-this-key")

# URLs per CasaOS
ALLOWED_ORIGINS=http://localhost:8080,http://$CASAOS_IP:8080
CORS_ORIGINS=["http://localhost:8080","http://$CASAOS_IP:8080"]
API_URL=http://$CASAOS_IP:8001/api

# App info
APP_VERSION=v1.1.2
INSTALL_DATE=$(date)
EOF

print_status "Configurazione creata"

# Controlla prerequisiti CasaOS
echo "� Controllo prerequisiti CasaOS..."

# Rileva se siamo su CasaOS
CASAOS_DETECTED=false
if [ -d "/var/lib/casaos" ] || [ -f "/usr/bin/casaos" ] || [ -d "/DATA" ]; then
    CASAOS_DETECTED=true
    print_status "Ambiente CasaOS rilevato"
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker non è installato."
    if [ "$CASAOS_DETECTED" = true ]; then
        print_info "Su CasaOS, Docker dovrebbe essere preinstallato."
        print_info "Prova a riavviare CasaOS o contatta il supporto."
    fi
    exit 1
fi

if ! docker compose version &> /dev/null && ! docker-compose --version &> /dev/null; then
    print_error "Docker Compose non è disponibile."
    exit 1
fi

print_status "Docker e Docker Compose sono disponibili"

# Gestione permessi Docker per CasaOS
echo "🔐 Controllo permessi Docker..."
if ! docker ps &> /dev/null; then
    print_warning "Permessi Docker insufficienti. Risoluzione per CasaOS..."
    
    if [ "$CASAOS_DETECTED" = true ]; then
        # Su CasaOS spesso dobbiamo usare sudo o essere root
        print_info "Ambiente CasaOS: tentativo escalation privilegi..."
        
        # Prova con sudo
        if command -v sudo &> /dev/null && sudo docker ps &> /dev/null; then
            print_status "Usando sudo per Docker"
            # Redefiniamo i comandi docker per usare sudo
            alias docker='sudo docker'
            alias docker-compose='sudo docker-compose'
            export DOCKER_CMD="sudo docker"
            export DOCKER_COMPOSE_CMD="sudo docker compose"
        else
            print_error "Impossibile accedere a Docker anche con sudo."
            print_error ""
            print_error "SOLUZIONI per CasaOS:"
            print_error "1. Esegui come root: sudo su - && curl -O ... && ./install-casaos.sh"
            print_error "2. Aggiungi utente al gruppo docker: sudo usermod -aG docker \$USER"
            print_error "3. Riavvia il terminale dopo l'aggiunta al gruppo"
            print_error "4. Controlla che Docker sia in esecuzione: sudo systemctl status docker"
            exit 1
        fi
    else
        # Gestione standard per sistemi non-CasaOS
        if ! groups | grep -q docker; then
            print_info "Aggiunta utente al gruppo docker..."
            if command -v sudo &> /dev/null; then
                sudo usermod -aG docker $USER
                print_warning "RIAVVIA IL TERMINALE e riesegui lo script!"
                exit 1
            fi
        fi
        
        # Permessi socket
        if command -v sudo &> /dev/null; then
            sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
        fi
    fi
else
    print_status "Permessi Docker verificati"
fi

# Controlla porte disponibili
echo "🔌 Controllo disponibilità porte..."

check_port() {
    local port=$1
    local service=$2
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        print_warning "Porta $port ($service) già in uso"
        return 1
    else
        print_status "Porta $port ($service) disponibile"
        return 0
    fi
}

PORTS_AVAILABLE=true
check_port 8080 "Frontend" || PORTS_AVAILABLE=false
check_port 8001 "Backend" || PORTS_AVAILABLE=false

if [ "$PORTS_AVAILABLE" = false ]; then
    print_warning "Alcune porte sono occupate"
    read -p "Vuoi continuare? Le porte in uso potrebbero causare conflitti (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Modifica le porte nel file .env e riavvia l'installazione"
        exit 1
    fi
fi

# Ferma eventuali installazioni precedenti
echo "🛑 Arresto installazioni precedenti..."
docker_compose_cmd -f docker-compose.casaos.yml down -v 2>/dev/null || true

print_status "Ambiente pulito"

# Download immagini
echo "📦 Download immagini Docker..."
docker compose -f docker-compose.casaos.yml pull

if [ $? -eq 0 ]; then
    print_status "Immagini scaricate"
else
    print_error "Errore download immagini"
    exit 1
fi

# Avvio servizi
echo "🚀 Avvio MyKeyManager..."
docker_compose_cmd -f docker-compose.casaos.yml up -d

if [ $? -eq 0 ]; then
    print_status "Container avviati"
else
    print_error "Errore avvio container"
    print_info "Controlla i logs: docker_compose_cmd -f docker-compose.casaos.yml logs"
    exit 1
fi

# Attesa per startup completo
echo "⏳ Attendo che i servizi siano pronti..."
sleep 30

# Controllo servizi
echo "🔍 Verifica servizi..."

# Test database
for i in {1..20}; do
    if docker_cmd exec mykeymanager-db pg_isready -U mykeymanager -d mykeymanager >/dev/null 2>&1; then
        print_status "Database PostgreSQL online"
        break
    fi
    if [ $i -eq 20 ]; then
        print_warning "Database impiega più tempo del previsto"
    else
        echo -n "."
        sleep 3
    fi
done

# Test backend
for i in {1..20}; do
    if curl -f "http://localhost:8001/health" >/dev/null 2>&1; then
        print_status "Backend API online"
        break
    fi
    if [ $i -eq 20 ]; then
        print_warning "Backend impiega più tempo del previsto"
    else
        echo -n "."
        sleep 3
    fi
done

# Test frontend
for i in {1..15}; do
    if curl -f "http://localhost:8080" >/dev/null 2>&1; then
        print_status "Frontend Web online"
        break
    fi
    if [ $i -eq 15 ]; then
        print_warning "Frontend impiega più tempo del previsto"
    else
        echo -n "."
        sleep 2
    fi
done

# Status finale
echo ""
echo "📊 Status Container:"
docker_compose_cmd -f docker-compose.casaos.yml ps

# Crea script di gestione
echo "🔧 Creazione script di gestione..."

# Crea script di gestione
echo "🔧 Creazione script di gestione..."

cat > manage.sh << 'EOF'
#!/bin/bash

# Rileva se serve sudo per Docker
if ! docker ps &> /dev/null; then
    if sudo docker ps &> /dev/null; then
        DOCKER_PREFIX="sudo "
    else
        echo "❌ Impossibile accedere a Docker"
        exit 1
    fi
else
    DOCKER_PREFIX=""
fi

case "$1" in
    start)
        echo "🚀 Avvio MyKeyManager..."
        ${DOCKER_PREFIX}docker compose -f docker-compose.casaos.yml up -d
        ;;
    stop)
        echo "🛑 Stop MyKeyManager..."
        ${DOCKER_PREFIX}docker compose -f docker-compose.casaos.yml down
        ;;
    restart)
        echo "🔄 Restart MyKeyManager..."
        ${DOCKER_PREFIX}docker compose -f docker-compose.casaos.yml restart
        ;;
    status)
        echo "📊 Status MyKeyManager:"
        ${DOCKER_PREFIX}docker compose -f docker-compose.casaos.yml ps
        ;;
    logs)
        echo "📋 Logs MyKeyManager:"
        ${DOCKER_PREFIX}docker compose -f docker-compose.casaos.yml logs --tail 50
        ;;
    backup)
        echo "💾 Backup Database..."
        mkdir -p ./backups
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        ${DOCKER_PREFIX}docker exec mykeymanager-db pg_dump -U mykeymanager mykeymanager > "./backups/$BACKUP_FILE"
        echo "Backup salvato: ./backups/$BACKUP_FILE"
        ;;
    update)
        echo "🔄 Aggiornamento MyKeyManager..."
        ${DOCKER_PREFIX}docker compose -f docker-compose.casaos.yml pull
        ${DOCKER_PREFIX}docker compose -f docker-compose.casaos.yml up -d
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|backup|update}"
        exit 1
        ;;
esac
EOF

chmod +x manage.sh
print_status "Script di gestione creato"

# Risultato finale
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                🎉 INSTALLAZIONE COMPLETATA! 🎉              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 ACCESSO MyKeyManager:${NC}"
echo "   🖥️  Locale: http://localhost:8080"
echo "   🌍 Rete:   http://$CASAOS_IP:8080"
echo ""
echo -e "${BLUE}🔧 API Backend:${NC}"
echo "   📡 Health: http://$CASAOS_IP:8001/health"
echo "   📚 Docs:   http://$CASAOS_IP:8001/docs"
echo ""
echo -e "${BLUE}👤 CREDENZIALI DEFAULT:${NC}"
echo "   Username: ${GREEN}admin${NC}"
echo "   Password: ${GREEN}ChangeMe!123${NC}"
echo ""
echo -e "${BLUE}🎮 GESTIONE FACILE:${NC}"
echo "   ./manage.sh start    # Avvia"
echo "   ./manage.sh stop     # Stop"
echo "   ./manage.sh status   # Status"
echo "   ./manage.sh logs     # Logs"
echo "   ./manage.sh backup   # Backup"
echo "   ./manage.sh update   # Aggiorna"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   1. Cambia la password admin appena possibile"
echo "   2. Configura backup automatici"
echo "   3. L'app è ora visibile nel pannello CasaOS"
echo ""
print_info "Directory installazione: $APP_DIR"
print_info "File di configurazione: $APP_DIR/.env"
echo ""
