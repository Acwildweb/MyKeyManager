#!/bin/bash

# =========================================================================
# MyKeyManager - Installazione Automatica per CasaOS
# =========================================================================

set -e

# Colori per output
RED='\033[0;31m'
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

# Controlla Docker
echo "🐳 Controllo Docker..."

if ! command -v docker &> /dev/null; then
    print_error "Docker non installato. Installa Docker su CasaOS:"
    print_info "Nel pannello CasaOS → Apps → Docker"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker non è in esecuzione"
    print_info "Avvia Docker dal pannello CasaOS"
    exit 1
fi

print_status "Docker attivo e funzionante"

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

# Ferma container esistenti
echo "🛑 Pulizia container esistenti..."
docker compose -f docker-compose.casaos.yml down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true

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
docker compose -f docker-compose.casaos.yml up -d

if [ $? -eq 0 ]; then
    print_status "Container avviati"
else
    print_error "Errore avvio container"
    print_info "Controlla i logs: docker compose -f docker-compose.casaos.yml logs"
    exit 1
fi

# Attesa per startup completo
echo "⏳ Attendo che i servizi siano pronti..."
sleep 30

# Controllo servizi
echo "🔍 Verifica servizi..."

# Test database
for i in {1..20}; do
    if docker exec mykeymanager-db pg_isready -U mykeymanager -d mykeymanager >/dev/null 2>&1; then
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
docker compose -f docker-compose.casaos.yml ps

# Crea script di gestione
echo "🔧 Creazione script di gestione..."

cat > manage.sh << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "🚀 Avvio MyKeyManager..."
        docker compose -f docker-compose.casaos.yml up -d
        ;;
    stop)
        echo "🛑 Stop MyKeyManager..."
        docker compose -f docker-compose.casaos.yml down
        ;;
    restart)
        echo "🔄 Restart MyKeyManager..."
        docker compose -f docker-compose.casaos.yml restart
        ;;
    status)
        echo "📊 Status MyKeyManager:"
        docker compose -f docker-compose.casaos.yml ps
        ;;
    logs)
        echo "📋 Logs MyKeyManager:"
        docker compose -f docker-compose.casaos.yml logs --tail 50
        ;;
    backup)
        echo "💾 Backup Database..."
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker exec mykeymanager-db pg_dump -U mykeymanager mykeymanager > "./backups/$BACKUP_FILE"
        echo "Backup salvato: ./backups/$BACKUP_FILE"
        ;;
    update)
        echo "🔄 Aggiornamento MyKeyManager..."
        docker compose -f docker-compose.casaos.yml pull
        docker compose -f docker-compose.casaos.yml up -d
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
