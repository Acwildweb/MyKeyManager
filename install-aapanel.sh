#!/bin/bash

# =========================================================================
# MyKeyManager - Installazione Automatica per Server AaPanel
# Script ottimizzato per ambiente AaPanel con Docker
# =========================================================================

set -e  # Exit on any error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}==========================================================================${NC}"
echo -e "${BLUE}🚀 MyKeyManager - Installazione Server AaPanel${NC}"
echo -e "${BLUE}==========================================================================${NC}"

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Funzione per rilevare IP del server
detect_server_ip() {
    print_status "🔍 Rilevamento IP del server..."
    
    # Prova diversi metodi per ottenere IP pubblico
    SERVER_IP=""
    
    # Metodo 1: hostname -I (IP locale)
    if command -v hostname &> /dev/null; then
        LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
        if [[ $LOCAL_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            SERVER_IP=$LOCAL_IP
            print_status "📍 IP locale rilevato: $SERVER_IP"
        fi
    fi
    
    # Metodo 2: IP pubblico (se disponibile)
    if command -v curl &> /dev/null; then
        PUBLIC_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo "")
        if [[ $PUBLIC_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            print_status "🌐 IP pubblico rilevato: $PUBLIC_IP"
            read -p "🤔 Usa IP pubblico ($PUBLIC_IP) invece di locale ($SERVER_IP)? [y/N]: " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                SERVER_IP=$PUBLIC_IP
            fi
        fi
    fi
    
    # Fallback: richiedi IP manualmente
    if [[ -z "$SERVER_IP" ]]; then
        print_warning "❓ Non riesco a rilevare automaticamente l'IP"
        read -p "🖥️  Inserisci l'IP del server manualmente: " SERVER_IP
    fi
    
    # Validazione IP
    if [[ ! $SERVER_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "❌ IP non valido: $SERVER_IP"
        exit 1
    fi
    
    print_status "✅ Utilizzo IP: $SERVER_IP"
}

# Verifica prerequisiti
check_prerequisites() {
    print_status "🔍 Verifica prerequisiti..."
    
    # Controlla se siamo su AaPanel
    if [[ -d "/www/server" ]] || [[ -d "/www/wwwroot" ]]; then
        print_status "✅ Ambiente AaPanel rilevato"
    else
        print_warning "⚠️  Directory AaPanel non trovate, continuo comunque..."
    fi
    
    # Controlla Docker
    if ! command -v docker &> /dev/null; then
        print_error "❌ Docker non installato!"
        echo -e "${YELLOW}💡 Installa Docker tramite AaPanel:${NC}"
        echo "   1. Accedi ad AaPanel"
        echo "   2. App Store → Docker → Installa"
        echo "   3. Oppure manualmente: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    
    # Controlla Docker Compose
    if ! docker compose version &> /dev/null; then
        print_error "❌ Docker Compose non disponibile!"
        exit 1
    fi
    
    print_status "✅ Docker e Docker Compose OK"
    
    # Controlla porte
    for port in 3000 8001; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_warning "⚠️  Porta $port già in uso"
            read -p "🔄 Continua comunque? [y/N]: " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    done
}

# Configura directory di lavoro
setup_directory() {
    print_status "📁 Configurazione directory..."
    
    # Directory preferite per AaPanel
    POSSIBLE_DIRS=(
        "/www/wwwroot"
        "/root"
        "/home/$(whoami)"
        "$(pwd)"
    )
    
    WORK_DIR=""
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [[ -w "$dir" ]]; then
            WORK_DIR="$dir/MyKeyManager"
            break
        fi
    done
    
    if [[ -z "$WORK_DIR" ]]; then
        print_error "❌ Nessuna directory scrivibile trovata!"
        exit 1
    fi
    
    print_status "📂 Directory di lavoro: $WORK_DIR"
    
    # Crea directory se non esiste
    mkdir -p "$WORK_DIR"
    cd "$WORK_DIR"
}

# Scarica/aggiorna progetto
download_project() {
    print_status "📥 Download progetto MyKeyManager..."
    
    # Se esiste già, chiedi se aggiornare
    if [[ -f "docker-compose.arm64.yml" ]]; then
        print_warning "🔄 Progetto già presente"
        read -p "🆕 Aggiorna all'ultima versione? [Y/n]: " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            # Backup configurazione esistente
            if [[ -f "docker-compose.yml" ]]; then
                cp docker-compose.yml docker-compose.yml.backup
                print_status "💾 Backup configurazione salvato"
            fi
            
            # Pull aggiornamenti
            if [[ -d ".git" ]]; then
                git pull origin main
            else
                print_warning "⚠️  Cartella .git non trovata, scarica manualmente"
            fi
        fi
    else
        # Clone repository
        if command -v git &> /dev/null; then
            git clone https://github.com/Acwildweb/MyKeyManager.git .
        else
            print_error "❌ Git non installato!"
            echo -e "${YELLOW}💡 Installa git: yum install git -y (CentOS) o apt install git -y (Ubuntu)${NC}"
            exit 1
        fi
    fi
}

# Configura Docker Compose
configure_docker() {
    print_status "⚙️  Configurazione Docker Compose..."
    
    # Cerca configurazione ARM64 esistente o crea una nuova
    if [[ -f "docker-compose.arm64.yml" ]]; then
        print_status "📄 Trovato docker-compose.arm64.yml"
        cp docker-compose.arm64.yml docker-compose.yml
    elif [[ -f "docker-compose.server.yml" ]]; then
        print_status "📄 Uso docker-compose.server.yml come base"
        cp docker-compose.server.yml docker-compose.yml
    else
        print_status "📝 Creo configurazione ARM64 personalizzata..."
        create_arm64_compose
    fi
    
    # Sostituisci IP nel file
    sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml
    sed -i "s/YOUR_DOMAIN/$SERVER_IP/g" docker-compose.yml
    
    print_status "✅ Configurazione aggiornata con IP: $SERVER_IP"
}

# Crea configurazione ARM64 se non esiste
create_arm64_compose() {
    print_status "🔧 Generazione docker-compose.yml per ARM64..."
    
    cat > docker-compose.yml << EOF
# =========================================================================
# MyKeyManager - Docker Compose per Server ARM64 (AaPanel)
# Generato automaticamente da install-aapanel.sh
# =========================================================================

services:
  # Database PostgreSQL - ARM64 ottimizzato
  database:
    image: postgres:15-alpine
    platform: linux/arm64
    container_name: mykeymanager-db
    environment:
      POSTGRES_DB: mykeymanager
      POSTGRES_USER: mykeymanager
      POSTGRES_PASSWORD: MyKey2024!Secure
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mykeymanager -d mykeymanager"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - mykeymanager
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'

  # Backend API - Build locale per server ARM64
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    platform: linux/arm64
    container_name: mykeymanager-api
    environment:
      DATABASE_URL: postgresql://mykeymanager:MyKey2024!Secure@database:5432/mykeymanager
      SECRET_KEY: MyKeyManager-ARM64-Production-Secret-2024-Change-This
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 480
      ALLOWED_ORIGINS: "http://localhost:3000,http://YOUR_SERVER_IP:3000,https://YOUR_DOMAIN:3000,https://YOUR_DOMAIN,http://YOUR_SERVER_IP"
      RATE_LIMIT: "200/hour"
      LOG_LEVEL: "INFO"
      ENVIRONMENT: "production"
      UVICORN_WORKERS: 2
    ports:
      - "8001:8000"
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 10
      start_period: 60s
    networks:
      - mykeymanager
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'

  # Frontend Web - Build locale per server ARM64
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    platform: linux/arm64
    container_name: mykeymanager-web
    environment:
      VITE_API_URL: http://YOUR_SERVER_IP:8001/api/v1
      VITE_API_BASE_URL: http://YOUR_SERVER_IP:8001/api/v1
      VITE_BACKEND_URL: http://YOUR_SERVER_IP:8001
    ports:
      - "3000:80"
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - mykeymanager
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

networks:
  mykeymanager:
    name: mykeymanager-network
    driver: bridge

volumes:
  postgres_data:
    name: mykeymanager_postgres_data
    driver: local
EOF

    print_status "✅ Configurazione ARM64 creata"
}

# Configura firewall AaPanel
configure_firewall() {
    print_status "🔥 Configurazione firewall..."
    
    # Porte da aprire
    PORTS=(3000 8001)
    
    for port in "${PORTS[@]}"; do
        # Prova diversi sistemi firewall
        if command -v ufw &> /dev/null; then
            ufw allow $port/tcp 2>/dev/null || true
        elif command -v firewall-cmd &> /dev/null; then
            firewall-cmd --permanent --add-port=$port/tcp 2>/dev/null || true
            firewall-cmd --reload 2>/dev/null || true
        elif command -v iptables &> /dev/null; then
            iptables -I INPUT -p tcp --dport $port -j ACCEPT 2>/dev/null || true
        fi
    done
    
    print_status "🔓 Porte 3000,8001 configurate nel firewall"
    print_warning "📋 IMPORTANTE: Configura anche il firewall AaPanel!"
    echo "   - Accedi ad AaPanel → Sicurezza → Firewall"
    echo "   - Aggiungi regole per porte: 3000, 8001"
}

# Avvia servizi
start_services() {
    print_status "🚀 Avvio servizi MyKeyManager..."
    
    # Ferma servizi esistenti
    docker compose down 2>/dev/null || true
    
    # Pulizia volumi orfani (opzionale)
    read -p "🧹 Pulire volumi Docker orfani? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f 2>/dev/null || true
    fi
    
    # Avvia con build
    print_status "🔨 Build e avvio container..."
    docker compose up -d --build
    
    # Attendi che i servizi siano pronti
    print_status "⏳ Attendo che i servizi siano pronti..."
    sleep 30
}

# Verifica installazione
verify_installation() {
    print_status "🔍 Verifica installazione..."
    
    # Controlla container
    print_status "📊 Status container:"
    docker compose ps
    
    # Test health check
    echo
    print_status "🏥 Test health check..."
    
    # Backend health
    if curl -sf "http://localhost:8001/health" >/dev/null 2>&1; then
        print_status "✅ Backend OK"
    else
        print_warning "⚠️  Backend non risponde (normale durante startup)"
    fi
    
    # Frontend check
    if curl -sf "http://localhost:3000" >/dev/null 2>&1; then
        print_status "✅ Frontend OK" 
    else
        print_warning "⚠️  Frontend non risponde (normale durante startup)"
    fi
}

# Mostra risultati finali
show_results() {
    echo
    echo -e "${GREEN}==========================================================================${NC}"
    echo -e "${GREEN}🎉 INSTALLAZIONE COMPLETATA!${NC}"
    echo -e "${GREEN}==========================================================================${NC}"
    echo
    echo -e "${BLUE}📍 Accesso Applicazione:${NC}"
    echo -e "   🌐 Frontend: ${YELLOW}http://$SERVER_IP:3000${NC}"
    echo -e "   🔧 Backend:  ${YELLOW}http://$SERVER_IP:8001${NC}"
    echo
    echo -e "${BLUE}🔑 Credenziali Default:${NC}"
    echo -e "   📧 Email:    ${YELLOW}admin@example.com${NC}"
    echo -e "   🔒 Password: ${YELLOW}admin123${NC}"
    echo
    echo -e "${BLUE}📋 Comandi Utili:${NC}"
    echo -e "   📊 Status:   ${YELLOW}docker compose ps${NC}"
    echo -e "   📄 Logs:     ${YELLOW}docker compose logs -f${NC}"
    echo -e "   🔄 Restart:  ${YELLOW}docker compose restart${NC}"
    echo -e "   🛑 Stop:     ${YELLOW}docker compose down${NC}"
    echo
    echo -e "${BLUE}🔥 Firewall AaPanel:${NC}"
    echo -e "   Configura manualmente porte: ${YELLOW}3000, 8001${NC}"
    echo
    echo -e "${GREEN}🚀 Buon utilizzo di MyKeyManager!${NC}"
    echo -e "${GREEN}==========================================================================${NC}"
}

# Funzione principale
main() {
    # Controlla se eseguito come root o con sudo
    if [[ $EUID -ne 0 ]] && ! groups $(whoami) | grep -q docker; then
        print_warning "⚠️  Potresti aver bisogno di privilegi elevati"
        print_warning "   Prova: sudo $0 oppure aggiungi utente al gruppo docker"
    fi
    
    detect_server_ip
    check_prerequisites  
    setup_directory
    download_project
    configure_docker
    configure_firewall
    start_services
    verify_installation
    show_results
}

# Esegui script principale
main "$@"
