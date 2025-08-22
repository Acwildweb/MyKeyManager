#!/bin/bash

# ================================================
# 🐳 MyKeyManager - Docker Hub Build & Push Script
# ================================================
# Questo script costruisce e pubblica le immagini Docker su Docker Hub
# 
# Utilizzo:
#   ./build-and-push.sh [version]
#   
# Esempio:
#   ./build-and-push.sh v1.1.0
#
# Se non specifichi una versione, userà 'latest'
# ================================================

set -e  # Exit on any error

# Configurazione
DOCKER_USERNAME="acwild"  # Username Docker Hub corretto
PROJECT_NAME="mykeymanager"
VERSION=${1:-"latest"}

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per logging
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
    exit 1
}

# Banner
echo "================================================"
echo "🐳 MyKeyManager Docker Hub Publisher v1.1.1"
echo "================================================"
echo ""

# Verifica prerequisiti
log "Verifico prerequisiti..."

if ! command -v docker &> /dev/null; then
    error "Docker non è installato o non è nel PATH"
fi

if ! docker info &> /dev/null; then
    error "Docker daemon non è in esecuzione"
fi

# Verifica login Docker Hub
if ! docker info | grep -q "Username:"; then
    warning "Non sei loggato a Docker Hub. Effettua il login:"
    docker login
fi

success "Prerequisiti verificati"

# Verifica directory di lavoro
if [ ! -f "devops/docker-compose.yml" ]; then
    error "Esegui questo script dalla directory root del progetto MyKeyManager"
fi

log "Directory di lavoro: $(pwd)"

# Build Backend
log "🚀 Costruendo immagine Backend..."
docker build \
    -f devops/Dockerfile.backend \
    -t ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION} \
    -t ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:latest \
    .

success "Immagine Backend costruita"

# Build Frontend
log "🌐 Costruendo immagine Frontend..."
docker build \
    -f devops/Dockerfile.frontend \
    -t ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION} \
    -t ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:latest \
    .

success "Immagine Frontend costruita"

# Build All-in-One (New in v1.1.1)
log "📦 Costruendo immagine All-in-One..."
docker build \
    -f Dockerfile.all-in-one \
    -t ${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one:${VERSION} \
    -t ${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one:latest \
    .

success "Immagine All-in-One costruita"

# Verifica immagini create
log "📋 Verificando immagini create..."
docker images | grep ${DOCKER_USERNAME}/${PROJECT_NAME}

# Push Backend
log "📤 Caricando immagine Backend su Docker Hub..."
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION}
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:latest

success "Immagine Backend caricata su Docker Hub"

# Push Frontend
log "📤 Caricando immagine Frontend su Docker Hub..."
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:latest

success "Immagine Frontend caricata su Docker Hub"

# Push All-in-One
log "📤 Caricando immagine All-in-One su Docker Hub..."
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one:${VERSION}
docker push ${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one:latest

success "Immagine All-in-One caricata su Docker Hub"

# Cleanup locale (opzionale)
read -p "Vuoi rimuovere le immagini locali per liberare spazio? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "🧹 Rimuovendo immagini locali..."
    docker rmi ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION} || true
    docker rmi ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION} || true
    docker rmi ${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one:${VERSION} || true
    success "Immagini locali rimosse"
fi

# Resoconto finale
echo ""
echo "================================================"
echo "🎉 PUBBLICAZIONE COMPLETATA!"
echo "================================================"
echo ""
echo "📦 Immagini pubblicate su Docker Hub:"
echo "   • ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:${VERSION}"
echo "   • ${DOCKER_USERNAME}/${PROJECT_NAME}-backend:latest"
echo "   • ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:${VERSION}"
echo "   • ${DOCKER_USERNAME}/${PROJECT_NAME}-frontend:latest"
echo "   • ${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one:${VERSION}"
echo "   • ${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one:latest"
echo ""
echo "🚀 Per utilizzare le immagini:"
echo "   Microservizi: docker-compose -f docker-compose.hub.yml up -d"
echo "   All-in-One:   ./configure-all-in-one.sh"
echo ""
echo "🌐 Link Docker Hub:"
echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/${PROJECT_NAME}-backend"
echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/${PROJECT_NAME}-frontend"
echo "   https://hub.docker.com/r/${DOCKER_USERNAME}/${PROJECT_NAME}-all-in-one"
echo ""
echo "📚 Documentazione completa:"
echo "   https://github.com/Acwildweb/MyKeyManager"
echo ""

success "Script completato con successo!"
