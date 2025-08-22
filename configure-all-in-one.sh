#!/bin/bash

# =========================================================================
# MyKeyManager All-in-One Configuration Script
# Configures and deploys single container with all services
# =========================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Script metadata
SCRIPT_NAME="MyKeyManager All-in-One Configurator"
SCRIPT_VERSION="1.1.0"
DEFAULT_PORT=80

# Functions
print_header() {
    echo -e "\n${PURPLE}=================================${NC}"
    echo -e "${WHITE}🚀 $SCRIPT_NAME${NC}"
    echo -e "${PURPLE}=================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Find free port starting from given port
find_free_port() {
    local start_port=$1
    local port=$start_port
    
    while [ $port -le 65535 ]; do
        if ! check_port $port; then
            echo $port
            return 0
        fi
        ((port++))
    done
    
    return 1  # No free port found
}

# Configure port
configure_port() {
    local default_port=$1
    local service_name=$2
    local port
    
    print_step "Configurazione porta per $service_name"
    
    if check_port $default_port; then
        print_warning "Porta $default_port già in uso!"
        
        # Find alternative
        local alternative=$(find_free_port $((default_port + 1)))
        if [ $? -eq 0 ]; then
            print_info "Suggerisco porta alternativa: $alternative"
            echo -n "Vuoi usare la porta $alternative? [Y/n]: "
            read -r response
            
            if [[ $response =~ ^[Nn]$ ]]; then
                while true; do
                    echo -n "Inserisci porta personalizzata: "
                    read -r custom_port
                    
                    if [[ $custom_port =~ ^[0-9]+$ ]] && [ $custom_port -ge 1024 ] && [ $custom_port -le 65535 ]; then
                        if ! check_port $custom_port; then
                            port=$custom_port
                            break
                        else
                            print_error "Porta $custom_port già in uso!"
                        fi
                    else
                        print_error "Porta non valida! Usa un numero tra 1024 e 65535"
                    fi
                done
            else
                port=$alternative
            fi
        else
            print_error "Nessuna porta alternativa trovata!"
            exit 1
        fi
    else
        port=$default_port
        print_success "Porta $default_port disponibile"
    fi
    
    echo $port
}

# Generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Create .env file
create_env_file() {
    local port=$1
    local postgres_password=$2
    local secret_key=$3
    
    print_step "Creazione file .env.all-in-one"
    
    cat > .env.all-in-one << EOF
# =========================================================================
# MyKeyManager All-in-One Configuration
# Generated on: $(date)
# =========================================================================

# =================== PORT CONFIGURATION ===================
MYKEYMANAGER_PORT=$port

# =================== DATABASE CONFIGURATION ===================
POSTGRES_PASSWORD=$postgres_password

# =================== SECURITY CONFIGURATION ===================
SECRET_KEY=$secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# =================== SMTP CONFIGURATION ===================
# Local SMTP (Postfix) - pre-configured
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@mykeymanager.local

# External SMTP (optional - uncomment and configure)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# EMAIL_FROM=noreply@yourdomain.com

# =================== APPLICATION CONFIGURATION ===================
DEBUG=false
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:$port,http://127.0.0.1:$port

# =================== TIMEZONE ===================
TZ=Europe/Rome

# =================== RESOURCE LIMITS ===================
# Memory limit in bytes (default: 2GB)
MEMORY_LIMIT=2147483648

# CPU limit (default: 1.0 = 1 CPU core)
CPU_LIMIT=1.0
EOF

    print_success "File .env.all-in-one creato"
}

# Show configuration info
show_config_info() {
    local port=$1
    
    echo -e "\n${GREEN}🎉 Configurazione completata!${NC}\n"
    
    echo -e "${WHITE}📋 Informazioni di accesso:${NC}"
    echo -e "   🌐 Frontend:     ${CYAN}http://localhost:$port${NC}"
    echo -e "   🔧 Backend API:  ${CYAN}http://localhost:$port/api${NC}"
    echo -e "   📚 Docs:         ${CYAN}http://localhost:$port/docs${NC}"
    echo -e "   🔍 Health:       ${CYAN}http://localhost:$port/health${NC}"
    
    echo -e "\n${WHITE}🔑 Credenziali default:${NC}"
    echo -e "   👤 Username:     ${YELLOW}admin${NC}"
    echo -e "   🔒 Password:     ${YELLOW}ChangeMe!123${NC}"
    echo -e "   ${RED}⚠️  CAMBIARE IMMEDIATAMENTE DOPO IL PRIMO ACCESSO!${NC}"
    
    echo -e "\n${WHITE}📊 Servizi inclusi nel container:${NC}"
    echo -e "   🎨 Frontend (Nginx)"
    echo -e "   ⚡ Backend (FastAPI)"
    echo -e "   🗄️  Database (PostgreSQL)"
    echo -e "   🚀 Cache (Redis)"
    echo -e "   📧 SMTP (Postfix)"
    
    echo -e "\n${WHITE}🚀 Comandi per avviare:${NC}"
    echo -e "   ${CYAN}docker-compose -f docker-compose.all-in-one.yml --env-file .env.all-in-one up -d${NC}"
    
    echo -e "\n${WHITE}🔍 Comandi utili:${NC}"
    echo -e "   Logs:     ${CYAN}docker-compose -f docker-compose.all-in-one.yml logs -f${NC}"
    echo -e "   Status:   ${CYAN}docker-compose -f docker-compose.all-in-one.yml ps${NC}"
    echo -e "   Stop:     ${CYAN}docker-compose -f docker-compose.all-in-one.yml down${NC}"
    echo -e "   Health:   ${CYAN}docker exec mykeymanager-all-in-one /app/scripts/health.sh${NC}"
}

# Build container
build_container() {
    print_step "Build del container all-in-one"
    
    if docker-compose -f docker-compose.all-in-one.yml --env-file .env.all-in-one build; then
        print_success "Build completato con successo"
    else
        print_error "Errore durante il build"
        exit 1
    fi
}

# Deploy container
deploy_container() {
    print_step "Deploy del container"
    
    if docker-compose -f docker-compose.all-in-one.yml --env-file .env.all-in-one up -d; then
        print_success "Container avviato con successo"
        
        print_info "Attendendo che tutti i servizi siano pronti..."
        sleep 10
        
        # Health check
        if docker exec mykeymanager-all-in-one /app/scripts/health.sh >/dev/null 2>&1; then
            print_success "Tutti i servizi sono attivi e funzionanti!"
        else
            print_warning "Alcuni servizi potrebbero essere ancora in avvio. Controlla i logs."
        fi
    else
        print_error "Errore durante il deploy"
        exit 1
    fi
}

# Main configuration function
main() {
    print_header
    
    # Check dependencies
    print_step "Verifica dipendenze"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker non trovato! Installare Docker prima di continuare."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose non trovato! Installare Docker Compose prima di continuare."
        exit 1
    fi
    
    print_success "Dipendenze verificate"
    
    # Configure port
    local port=$(configure_port $DEFAULT_PORT "MyKeyManager All-in-One")
    
    # Generate secure credentials
    print_step "Generazione credenziali sicure"
    local postgres_password=$(generate_password)
    local secret_key=$(generate_password)
    print_success "Credenziali generate"
    
    # Create environment file
    create_env_file $port $postgres_password $secret_key
    
    # Show configuration
    show_config_info $port
    
    # Ask for deployment
    echo -e "\n${YELLOW}Vuoi procedere con il build e deploy? [Y/n]:${NC} "
    read -r deploy_response
    
    if [[ ! $deploy_response =~ ^[Nn]$ ]]; then
        build_container
        deploy_container
        
        echo -e "\n${GREEN}🎉 MyKeyManager All-in-One è pronto!${NC}"
        echo -e "${CYAN}   Accedi a: http://localhost:$port${NC}\n"
    else
        echo -e "\n${YELLOW}Configurazione salvata. Esegui manualmente:${NC}"
        echo -e "${CYAN}docker-compose -f docker-compose.all-in-one.yml --env-file .env.all-in-one up -d${NC}\n"
    fi
}

# Help function
show_help() {
    echo -e "${WHITE}$SCRIPT_NAME v$SCRIPT_VERSION${NC}\n"
    echo -e "${WHITE}Uso:${NC}"
    echo -e "  $0 [opzioni]\n"
    echo -e "${WHITE}Opzioni:${NC}"
    echo -e "  --configure    Configura e deploy automatico"
    echo -e "  --build        Solo build del container"
    echo -e "  --deploy       Solo deploy (richiede .env.all-in-one)"
    echo -e "  --status       Mostra stato container"
    echo -e "  --logs         Mostra logs container"
    echo -e "  --stop         Ferma container"
    echo -e "  --health       Controlla health dei servizi"
    echo -e "  --help         Mostra questo aiuto\n"
    echo -e "${WHITE}Esempi:${NC}"
    echo -e "  $0 --configure     # Setup completo"
    echo -e "  $0 --status        # Controlla stato"
    echo -e "  $0 --logs          # Visualizza logs\n"
}

# Parse command line arguments
case "${1:-}" in
    --configure)
        main
        ;;
    --build)
        print_header
        if [ -f .env.all-in-one ]; then
            build_container
        else
            print_error "File .env.all-in-one non trovato! Esegui prima --configure"
            exit 1
        fi
        ;;
    --deploy)
        print_header
        if [ -f .env.all-in-one ]; then
            deploy_container
        else
            print_error "File .env.all-in-one non trovato! Esegui prima --configure"
            exit 1
        fi
        ;;
    --status)
        docker-compose -f docker-compose.all-in-one.yml ps
        ;;
    --logs)
        docker-compose -f docker-compose.all-in-one.yml logs -f
        ;;
    --stop)
        print_step "Fermando container"
        docker-compose -f docker-compose.all-in-one.yml down
        print_success "Container fermato"
        ;;
    --health)
        docker exec mykeymanager-all-in-one /app/scripts/health.sh
        ;;
    --help)
        show_help
        ;;
    "")
        main
        ;;
    *)
        print_error "Opzione non riconosciuta: $1"
        show_help
        exit 1
        ;;
esac
