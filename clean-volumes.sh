#!/bin/bash

# 🧹 Script di Pulizia Volumi MyKeyManager
# Risolve problemi di autenticazione PostgreSQL e conflitti di credenziali

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per log colorato
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
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

# Header
echo -e "${BLUE}"
cat << "EOF"
 ╔══════════════════════════════════════════════════════╗
 ║          🧹 MyKeyManager Volume Cleaner              ║
 ║                                                      ║
 ║  Risolve problemi di autenticazione PostgreSQL      ║
 ║  e conflitti di credenziali tra versioni            ║
 ╚══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Controllo prerequisiti
log "Controllo prerequisiti..."

if ! command -v docker &> /dev/null; then
    error "Docker non trovato. Installalo prima di continuare."
    exit 1
fi

if ! docker info &> /dev/null; then
    error "Docker non è in esecuzione. Avvialo e riprova."
    exit 1
fi

success "Docker è disponibile e funzionante"

# Mostra stato attuale
log "Stato attuale del sistema..."

echo "📊 Container attivi:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(mykeymanager|NAMES)" || echo "Nessun container MyKeyManager attivo"

echo
echo "💾 Volumi esistenti:"
EXISTING_VOLUMES=$(docker volume ls --format "{{.Name}}" | grep mykeymanager || true)
if [ -n "$EXISTING_VOLUMES" ]; then
    echo "$EXISTING_VOLUMES"
    echo
    warning "Trovati volumi MyKeyManager esistenti che potrebbero causare conflitti"
else
    success "Nessun volume MyKeyManager trovato"
    echo
    success "Il sistema è già pulito!"
    exit 0
fi

# Chiedi conferma
echo
read -p "🤔 Vuoi procedere con la pulizia dei volumi? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    warning "Operazione annullata dall'utente"
    exit 0
fi

# Backup opzionale
echo
read -p "💾 Vuoi fare un backup dei dati prima della pulizia? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Creazione backup..."
    
    BACKUP_DIR="./backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup PostgreSQL
    if docker volume ls | grep -q "mykeymanager_postgres_data"; then
        log "Backup PostgreSQL..."
        docker run --rm \
            -v mykeymanager_postgres_data:/data \
            -v "$(pwd)/$BACKUP_DIR":/backup \
            busybox tar czf /backup/postgres_data.tar.gz -C /data . 2>/dev/null || warning "Backup PostgreSQL fallito"
    fi
    
    # Backup Redis
    if docker volume ls | grep -q "mykeymanager_redis_data"; then
        log "Backup Redis..."
        docker run --rm \
            -v mykeymanager_redis_data:/data \
            -v "$(pwd)/$BACKUP_DIR":/backup \
            busybox tar czf /backup/redis_data.tar.gz -C /data . 2>/dev/null || warning "Backup Redis fallito"
    fi
    
    success "Backup completato in: $BACKUP_DIR"
fi

# Pulizia step-by-step
echo
log "Inizio pulizia..."

# 1. Ferma tutti i container MyKeyManager
log "1/4 - Fermando container MyKeyManager..."
docker compose down 2>/dev/null || true

CONTAINERS=$(docker ps -aq --filter name=mykeymanager 2>/dev/null || true)
if [ -n "$CONTAINERS" ]; then
    docker rm -f $CONTAINERS 2>/dev/null || true
    success "Container fermati e rimossi"
else
    success "Nessun container da fermare"
fi

# 2. Rimuovi volumi PostgreSQL
log "2/4 - Rimuovendo volume PostgreSQL..."
if docker volume ls | grep -q "mykeymanager_postgres_data"; then
    docker volume rm mykeymanager_postgres_data 2>/dev/null && success "Volume PostgreSQL rimosso" || error "Errore rimozione PostgreSQL"
else
    success "Volume PostgreSQL non esistente"
fi

# 3. Rimuovi volumi Redis
log "3/4 - Rimuovendo volume Redis..."
if docker volume ls | grep -q "mykeymanager_redis_data"; then
    docker volume rm mykeymanager_redis_data 2>/dev/null && success "Volume Redis rimosso" || error "Errore rimozione Redis"
else
    success "Volume Redis non esistente"
fi

# 4. Verifica finale
log "4/4 - Verifica finale..."
REMAINING_VOLUMES=$(docker volume ls --format "{{.Name}}" | grep mykeymanager || true)

if [ -n "$REMAINING_VOLUMES" ]; then
    error "Alcuni volumi non sono stati rimossi:"
    echo "$REMAINING_VOLUMES"
    echo
    warning "Prova la pulizia manuale:"
    echo "docker volume rm $REMAINING_VOLUMES"
    exit 1
else
    success "Tutti i volumi MyKeyManager sono stati rimossi con successo!"
fi

# Riepilogo finale
echo
echo -e "${GREEN}"
cat << "EOF"
 ╔══════════════════════════════════════════════════════╗
 ║                  ✅ PULIZIA COMPLETATA               ║
 ║                                                      ║
 ║  Il sistema è ora pronto per un fresh deploy!       ║
 ║                                                      ║
 ║  Prossimi passi:                                     ║
 ║  1. Esegui il deploy all-in-one                      ║
 ║  2. Verifica che tutto funzioni correttamente       ║
 ║  3. Le nuove credenziali saranno applicate          ║
 ╚══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Suggerimenti prossimi passi
echo "🚀 Comandi utili per il prossimo deploy:"
echo
echo "# Deploy all-in-one automatico:"
echo "curl -sSL https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/quick-start-all-in-one.sh | bash"
echo
echo "# Deploy manuale:"
echo "curl -O https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/docker-compose.hub-all-in-one.yml"
echo "docker compose -f docker-compose.hub-all-in-one.yml up -d"
echo
echo "# Verifica stato:"
echo "docker ps && docker logs mykeymanager-backend"

# Opzione deploy immediato
echo
read -p "🚀 Vuoi avviare subito il deploy all-in-one? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Avvio deploy all-in-one..."
    
    # Download script
    if curl -sSL https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/quick-start-all-in-one.sh -o quick-start.sh 2>/dev/null; then
        chmod +x quick-start.sh
        success "Script scaricato, avvio deploy..."
        ./quick-start.sh
    else
        error "Errore download script. Prova manualmente:"
        echo "curl -sSL https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/quick-start-all-in-one.sh | bash"
    fi
else
    log "Deploy rimandato. Usa i comandi sopra quando sei pronto!"
fi

success "Operazione completata! 🎉"
