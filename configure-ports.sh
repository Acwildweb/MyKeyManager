#!/bin/bash

# ================================================
# 🔧 MyKeyManager Port Configuration Script
# ================================================
# Script per configurazione automatica porte disponibili
# Simile a Docker Desktop Port Manager
# ================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funzioni di utilità
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Verifica se una porta è occupata
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Porta occupata
    else
        return 0  # Porta libera
    fi
}

# Trova la prossima porta libera a partire da un numero
find_free_port() {
    local start_port=$1
    local port=$start_port
    
    while ! check_port $port; do
        ((port++))
        if [ $port -gt 65535 ]; then
            echo "0"  # Nessuna porta trovata
            return
        fi
    done
    
    echo $port
}

# Configurazione interattiva delle porte
configure_ports() {
    echo "================================================"
    echo "🔧 Configurazione Porte MyKeyManager"
    echo "================================================"
    echo ""
    
    # Porte default
    DEFAULT_FRONTEND=80
    DEFAULT_BACKEND=8000
    DEFAULT_POSTGRES=5432
    DEFAULT_REDIS=6379
    
    # File .env
    ENV_FILE=".env"
    
    echo "Verifica porte disponibili..."
    echo ""
    
    # Frontend
    if check_port $DEFAULT_FRONTEND; then
        FRONTEND_PORT=$DEFAULT_FRONTEND
        success "Frontend: Porta $DEFAULT_FRONTEND disponibile"
    else
        FRONTEND_PORT=$(find_free_port 8080)
        warning "Frontend: Porta $DEFAULT_FRONTEND occupata, suggerisco $FRONTEND_PORT"
    fi
    
    # Backend
    if check_port $DEFAULT_BACKEND; then
        BACKEND_PORT=$DEFAULT_BACKEND
        success "Backend: Porta $DEFAULT_BACKEND disponibile"
    else
        BACKEND_PORT=$(find_free_port 8001)
        warning "Backend: Porta $DEFAULT_BACKEND occupata, suggerisco $BACKEND_PORT"
    fi
    
    # PostgreSQL
    if check_port $DEFAULT_POSTGRES; then
        POSTGRES_PORT=$DEFAULT_POSTGRES
        success "PostgreSQL: Porta $DEFAULT_POSTGRES disponibile"
    else
        POSTGRES_PORT=$(find_free_port 5433)
        warning "PostgreSQL: Porta $DEFAULT_POSTGRES occupata, suggerisco $POSTGRES_PORT"
    fi
    
    # Redis
    if check_port $DEFAULT_REDIS; then
        REDIS_PORT=$DEFAULT_REDIS
        success "Redis: Porta $DEFAULT_REDIS disponibile"
    else
        REDIS_PORT=$(find_free_port 6380)
        warning "Redis: Porta $DEFAULT_REDIS occupata, suggerisco $REDIS_PORT"
    fi
    
    echo ""
    echo "================================================"
    echo "📋 Configurazione Proposta"
    echo "================================================"
    echo "Frontend:   http://localhost:$FRONTEND_PORT"
    echo "Backend:    http://localhost:$BACKEND_PORT/docs"
    echo "PostgreSQL: localhost:$POSTGRES_PORT"
    echo "Redis:      localhost:$REDIS_PORT"
    echo ""
    
    # Conferma dall'utente
    read -p "Accetti questa configurazione? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        # Crea o aggiorna .env
        log "Creazione file .env..."
        
        if [ -f "$ENV_FILE" ]; then
            # Backup del file esistente
            cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
            info "Backup del .env esistente creato"
        fi
        
        # Crea nuovo .env con porte configurate
        cat > "$ENV_FILE" << EOF
# ================================================
# MyKeyManager v1.1.0 - Configurazione Environment
# Generato automaticamente: $(date)
# ================================================

# ========================================
# 🐳 CONFIGURAZIONE PORTE
# ========================================
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT
POSTGRES_PORT=$POSTGRES_PORT
REDIS_PORT=$REDIS_PORT

# ========================================
# 🔐 SICUREZZA GENERALE
# ========================================
SECRET_KEY=change-this-super-secret-key-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ========================================
# 🗄️ DATABASE POSTGRESQL
# ========================================
DATABASE_URL=postgresql://mykeyuser:mykeypass@db:5432/mykeymanager
POSTGRES_HOST=db
POSTGRES_DB=mykeymanager
POSTGRES_USER=mykeyuser
POSTGRES_PASSWORD=mykeypass

# ========================================
# 🔄 REDIS CACHE
# ========================================
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_DB=0

# ========================================
# 🌐 CONFIGURAZIONE CORS E DOMINI
# ========================================
ALLOWED_ORIGINS=http://localhost:$FRONTEND_PORT,http://localhost:$BACKEND_PORT,http://127.0.0.1:$FRONTEND_PORT,http://127.0.0.1:$BACKEND_PORT
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# ========================================
# 📧 CONFIGURAZIONE EMAIL SMTP
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=MyKeyManager

# ========================================
# 👤 UTENTE AMMINISTRATORE INIZIALE
# ========================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe!123
ADMIN_EMAIL=admin@yourdomain.com

# ========================================
# ⚙️ CONFIGURAZIONE APPLICAZIONE
# ========================================
DEBUG=false
ENVIRONMENT=production
LOG_LEVEL=INFO
EOF
        
        success "File .env creato con successo!"
        echo ""
        echo "================================================"
        echo "🚀 Comandi per Avvio"
        echo "================================================"
        echo "# Avvio con Docker Hub (raccomandato)"
        echo "docker-compose -f docker-compose.hub.yml up -d"
        echo ""
        echo "# Avvio con build locale"
        echo "docker compose -f devops/docker-compose.yml up --build -d"
        echo ""
        echo "================================================"
        echo "🌐 URL di Accesso"
        echo "================================================"
        echo "Frontend:   http://localhost:$FRONTEND_PORT"
        echo "API Docs:   http://localhost:$BACKEND_PORT/docs"
        echo "API Health: http://localhost:$BACKEND_PORT/health"
        echo ""
        echo "Credenziali: admin / ChangeMe!123"
        echo "⚠️  Cambia la password dopo il primo accesso!"
        echo ""
        
    else
        echo ""
        info "Configurazione annullata. Puoi modificare manualmente il file .env"
        echo ""
        echo "Esempio configurazione manuale:"
        echo "FRONTEND_PORT=8080"
        echo "BACKEND_PORT=8001"
        echo "POSTGRES_PORT=5433"
        echo "REDIS_PORT=6380"
    fi
}

# Modalità check porte
check_ports_only() {
    echo "================================================"
    echo "🔍 Verifica Porte MyKeyManager"
    echo "================================================"
    echo ""
    
    ports=(80 8000 5432 6379)
    services=("Frontend" "Backend" "PostgreSQL" "Redis")
    
    for i in "${!ports[@]}"; do
        port=${ports[$i]}
        service=${services[$i]}
        
        if check_port $port; then
            success "$service (porta $port): Disponibile"
        else
            error "$service (porta $port): Occupata"
            
            # Mostra processo che occupa la porta
            if command -v lsof >/dev/null 2>&1; then
                process=$(lsof -ti:$port | head -1)
                if [ ! -z "$process" ]; then
                    process_name=$(ps -p $process -o comm= 2>/dev/null || echo "unknown")
                    info "   Processo: $process_name (PID: $process)"
                fi
            fi
        fi
    done
    
    echo ""
    info "Per configurare automaticamente le porte: $0 --configure"
}

# Modalità info configurazione attuale
show_current_config() {
    echo "================================================"
    echo "📋 Configurazione Attuale MyKeyManager"
    echo "================================================"
    echo ""
    
    if [ -f ".env" ]; then
        echo "File .env trovato:"
        echo ""
        
        # Estrai le porte dal .env se esistono
        FRONTEND_PORT=$(grep "^FRONTEND_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "80")
        BACKEND_PORT=$(grep "^BACKEND_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "8000")
        POSTGRES_PORT=$(grep "^POSTGRES_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "5432")
        REDIS_PORT=$(grep "^REDIS_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "6379")
        
        echo "🌐 URLs di accesso:"
        echo "   Frontend:   http://localhost:$FRONTEND_PORT"
        echo "   Backend:    http://localhost:$BACKEND_PORT/docs"
        echo "   PostgreSQL: localhost:$POSTGRES_PORT"
        echo "   Redis:      localhost:$REDIS_PORT"
        echo ""
        
        # Verifica stato porte
        echo "🔍 Stato porte:"
        check_port $FRONTEND_PORT && success "   Frontend ($FRONTEND_PORT): Disponibile" || warning "   Frontend ($FRONTEND_PORT): Occupata"
        check_port $BACKEND_PORT && success "   Backend ($BACKEND_PORT): Disponibile" || warning "   Backend ($BACKEND_PORT): Occupata"
        check_port $POSTGRES_PORT && success "   PostgreSQL ($POSTGRES_PORT): Disponibile" || warning "   PostgreSQL ($POSTGRES_PORT): Occupata"
        check_port $REDIS_PORT && success "   Redis ($REDIS_PORT): Disponibile" || warning "   Redis ($REDIS_PORT): Occupata"
        
    else
        warning "File .env non trovato"
        info "Esegui: $0 --configure per creare la configurazione"
    fi
}

# Menu principale
show_help() {
    echo "================================================"
    echo "🔧 MyKeyManager Port Configuration Tool"
    echo "================================================"
    echo ""
    echo "Utilizzo: $0 [opzione]"
    echo ""
    echo "Opzioni:"
    echo "  --configure     Configurazione interattiva delle porte"
    echo "  --check         Verifica solo lo stato delle porte"
    echo "  --info          Mostra configurazione attuale"
    echo "  --help          Mostra questo aiuto"
    echo ""
    echo "Esempi:"
    echo "  $0 --configure  # Configura automaticamente le porte"
    echo "  $0 --check      # Verifica porte disponibili"
    echo "  $0 --info       # Mostra configurazione attuale"
    echo ""
}

# Parsing argomenti
case "${1:-}" in
    --configure)
        configure_ports
        ;;
    --check)
        check_ports_only
        ;;
    --info)
        show_current_config
        ;;
    --help)
        show_help
        ;;
    *)
        if [ $# -eq 0 ]; then
            configure_ports
        else
            show_help
            exit 1
        fi
        ;;
esac
