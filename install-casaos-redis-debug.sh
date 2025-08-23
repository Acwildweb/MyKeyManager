#!/bin/bash

# =========================================================================
# MyKeyManager - Script Installazione CasaOS con Diagnostica Redis
# =========================================================================

set -e  # Exit on any error

echo "🐳 MyKeyManager - Installazione CasaOS (Diagnostica Redis)"
echo "============================================================"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_debug() {
    echo -e "${PURPLE}🔍 $1${NC}"
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

# Controlla prerequisiti CasaOS
echo "🔍 Controllo prerequisiti CasaOS..."

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
            print_error "1. Esegui come root: sudo su - && curl -O ... && ./install-casaos-redis-debug.sh"
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

# Download file necessari
echo "📥 Preparazione file di configurazione..."

# Controlla se docker-compose.casaos.yml esiste
if [ ! -f "docker-compose.casaos.yml" ]; then
    print_info "Download docker-compose.casaos.yml..."
    curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.casaos.yml
fi

# Crea directory per dati persistenti CasaOS
echo "📁 Creazione directory dati CasaOS..."
sudo mkdir -p /DATA/AppData/mykeymanager/postgres
sudo mkdir -p /DATA/AppData/mykeymanager/redis
sudo chown -R $(whoami):$(whoami) /DATA/AppData/mykeymanager/ 2>/dev/null || print_warning "Impossibile cambiare proprietario, potrebbe richiedere permessi root"

# Test Redis separato prima dell'installazione completa
echo "🔍 DIAGNOSTICA REDIS"
echo "===================="

print_info "Test Redis standalone..."

# Avvia solo Redis per testare
print_debug "Avvio container Redis di test..."
docker_cmd run --name redis-test --rm -d -p 6379:6379 redis:7-alpine

if [ $? -eq 0 ]; then
    print_status "Container Redis avviato con successo"
    
    # Test connessione Redis
    sleep 5
    print_debug "Test connessione Redis..."
    
    if docker_cmd exec redis-test redis-cli ping | grep -q PONG; then
        print_status "Redis funziona correttamente!"
    else
        print_warning "Redis non risponde al ping"
    fi
    
    # Stop Redis test
    print_debug "Ferma container Redis di test..."
    docker_cmd stop redis-test
else
    print_error "Impossibile avviare container Redis di test"
    print_warning "Procedera con installazione senza Redis"
    
    # Usa la versione senza Redis
    if [ ! -f "docker-compose.casaos-noredis.yml" ]; then
        print_info "Download configurazione senza Redis..."
        curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.casaos-noredis.yml
    fi
    COMPOSE_FILE="docker-compose.casaos-noredis.yml"
    print_warning "Usando configurazione senza Redis per evitare problemi"
fi

# Se Redis test ha funzionato, usa configurazione normale
if [ -z "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose.casaos.yml"
    print_status "Usando configurazione completa con Redis"
fi

# Rileva IP CasaOS per configurazione
echo "🌐 Rilevamento IP di rete..."
CASAOS_IP=$(hostname -I | awk '{print $1}')
if [ -z "$CASAOS_IP" ]; then
    CASAOS_IP="localhost"
    print_warning "Impossibile rilevare IP, uso localhost"
else
    print_status "IP rilevato: $CASAOS_IP"
fi

# Ferma eventuali installazioni precedenti
echo "🛑 Arresto installazioni precedenti..."
docker_compose_cmd -f "$COMPOSE_FILE" down -v 2>/dev/null || true

# Download immagini Docker
echo "📥 Download immagini Docker..."
if ! docker_compose_cmd -f "$COMPOSE_FILE" pull; then
    print_error "Errore durante il download delle immagini Docker"
    print_info "Controlla la connessione internet e i permessi Docker"
    exit 1
fi

print_status "Immagini scaricate"

# Avvio servizi
echo "🚀 Avvio MyKeyManager..."
docker_compose_cmd -f "$COMPOSE_FILE" up -d

if [ $? -eq 0 ]; then
    print_status "Container avviati"
else
    print_error "Errore avvio container"
    print_info "Controlla i logs: docker_compose_cmd -f $COMPOSE_FILE logs"
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

# Test Redis (solo se incluso)
if [ "$COMPOSE_FILE" = "docker-compose.casaos.yml" ]; then
    for i in {1..10}; do
        if docker_cmd exec mykeymanager-redis redis-cli ping >/dev/null 2>&1; then
            print_status "Redis Cache online"
            break
        fi
        if [ $i -eq 10 ]; then
            print_warning "Redis impiega più tempo del previsto"
        else
            echo -n "."
            sleep 2
        fi
    done
fi

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
docker_compose_cmd -f "$COMPOSE_FILE" ps

# Crea script di gestione con configurazione dinamica
echo "🔧 Creazione script di gestione..."

cat > manage.sh << EOF
#!/bin/bash

# Rileva file di configurazione
if [ -f "docker-compose.casaos-noredis.yml" ] && [ "$COMPOSE_FILE" = "docker-compose.casaos-noredis.yml" ]; then
    COMPOSE_FILE="docker-compose.casaos-noredis.yml"
else
    COMPOSE_FILE="docker-compose.casaos.yml"
fi

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

case "\$1" in
    start)
        echo "🚀 Avvio MyKeyManager..."
        \${DOCKER_PREFIX}docker compose -f \$COMPOSE_FILE up -d
        ;;
    stop)
        echo "🛑 Stop MyKeyManager..."
        \${DOCKER_PREFIX}docker compose -f \$COMPOSE_FILE down
        ;;
    restart)
        echo "🔄 Restart MyKeyManager..."
        \${DOCKER_PREFIX}docker compose -f \$COMPOSE_FILE restart
        ;;
    status)
        echo "📊 Status MyKeyManager:"
        \${DOCKER_PREFIX}docker compose -f \$COMPOSE_FILE ps
        ;;
    logs)
        echo "📋 Logs MyKeyManager:"
        \${DOCKER_PREFIX}docker compose -f \$COMPOSE_FILE logs --tail 50
        ;;
    backup)
        echo "💾 Backup Database..."
        mkdir -p ./backups
        BACKUP_FILE="backup_\$(date +%Y%m%d_%H%M%S).sql"
        \${DOCKER_PREFIX}docker exec mykeymanager-db pg_dump -U mykeymanager mykeymanager > "./backups/\$BACKUP_FILE"
        echo "Backup salvato: ./backups/\$BACKUP_FILE"
        ;;
    update)
        echo "🔄 Aggiornamento MyKeyManager..."
        \${DOCKER_PREFIX}docker compose -f \$COMPOSE_FILE pull
        \${DOCKER_PREFIX}docker compose -f \$COMPOSE_FILE up -d
        ;;
    redis-test)
        if [ "\$COMPOSE_FILE" = "docker-compose.casaos.yml" ]; then
            echo "🔍 Test Redis:"
            \${DOCKER_PREFIX}docker exec mykeymanager-redis redis-cli ping
        else
            echo "ℹ️ Redis non configurato in questa installazione"
        fi
        ;;
    *)
        echo "Uso: \$0 {start|stop|restart|status|logs|backup|update|redis-test}"
        exit 1
        ;;
esac
EOF

chmod +x manage.sh
print_status "Script di gestione creato"

# Risultato finale
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🎉 INSTALLAZIONE COMPLETATA! 🎉           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$COMPOSE_FILE" = "docker-compose.casaos-noredis.yml" ]; then
    echo -e "${YELLOW}⚠️  INSTALLAZIONE SENZA REDIS${NC}"
    echo -e "${YELLOW}   Rate limiting funziona in memoria (solo per questa sessione)${NC}"
    echo ""
fi

echo -e "${WHITE}🌐 ACCESSO MyKeyManager su CasaOS:${NC}"
echo -e "   ${CYAN}🖥️  Locale:     http://localhost:8080${NC}"
echo -e "   ${CYAN}🌍 Rete:       http://$CASAOS_IP:8080${NC}"
echo -e "   ${CYAN}🔧 API:        http://$CASAOS_IP:8001${NC}"
echo -e "   ${CYAN}📚 Docs:       http://$CASAOS_IP:8001/docs${NC}"
echo ""
echo -e "${WHITE}🔑 Credenziali default:${NC}"
echo -e "   ${GREEN}Username: admin${NC}"
echo -e "   ${GREEN}Password: ChangeMe!123${NC}"
echo ""
echo -e "${WHITE}🔧 COMANDI GESTIONE:${NC}"
echo -e "   ${BLUE}./manage.sh start     ${NC}# Avvia servizi"
echo -e "   ${BLUE}./manage.sh stop      ${NC}# Ferma servizi"  
echo -e "   ${BLUE}./manage.sh restart   ${NC}# Riavvia servizi"
echo -e "   ${BLUE}./manage.sh status    ${NC}# Stato servizi"
echo -e "   ${BLUE}./manage.sh logs      ${NC}# Visualizza logs"
echo -e "   ${BLUE}./manage.sh backup    ${NC}# Backup database"
echo -e "   ${BLUE}./manage.sh update    ${NC}# Aggiorna immagini"
if [ "$COMPOSE_FILE" = "docker-compose.casaos.yml" ]; then
    echo -e "   ${BLUE}./manage.sh redis-test${NC}# Test Redis"
fi
echo ""
echo -e "${WHITE}🏠 INTEGRAZIONE CASAOS:${NC}"
echo -e "   ${GREEN}• Dati persistenti in /DATA/AppData/mykeymanager/${NC}"
echo -e "   ${GREEN}• Configurazione ottimizzata per risorse limitate${NC}"
echo -e "   ${GREEN}• Health checks automatici${NC}"
echo -e "   ${GREEN}• Restart automatico dei container${NC}"
echo ""

# Test finale Redis se disponibile
if [ "$COMPOSE_FILE" = "docker-compose.casaos.yml" ]; then
    echo -e "${PURPLE}🔍 TEST FINALE REDIS:${NC}"
    if docker_cmd exec mykeymanager-redis redis-cli ping >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Redis operativo${NC}"
    else
        echo -e "   ${YELLOW}⚠️ Redis potrebbe avere problemi${NC}"
        echo -e "   ${BLUE}ℹ️ Usa: ./manage.sh redis-test per verificare${NC}"
    fi
fi

echo ""
print_status "MyKeyManager installato con successo su CasaOS!"
