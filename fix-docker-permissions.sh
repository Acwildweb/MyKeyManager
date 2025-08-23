#!/bin/bash

# =========================================================================
# MyKeyManager - Fix Permessi Docker per AaPanel
# Risolve problemi di permessi Docker daemon
# =========================================================================

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}==========================================================================${NC}"
echo -e "${BLUE}🔧 Fix Permessi Docker - MyKeyManager AaPanel${NC}"
echo -e "${BLUE}==========================================================================${NC}"

# Verifica utente corrente
CURRENT_USER=$(whoami)
print_status "👤 Utente corrente: $CURRENT_USER"

# Verifica se Docker è attivo
if ! systemctl is-active --quiet docker; then
    print_warning "🐳 Docker non è attivo, provo ad avviarlo..."
    sudo systemctl start docker
    sudo systemctl enable docker
    print_status "✅ Docker avviato"
fi

# Verifica gruppo docker
if ! getent group docker >/dev/null 2>&1; then
    print_status "👥 Creazione gruppo docker..."
    sudo groupadd docker
fi

# Aggiungi utente al gruppo docker
if ! groups $CURRENT_USER | grep -q docker; then
    print_status "👥 Aggiunta utente $CURRENT_USER al gruppo docker..."
    sudo usermod -aG docker $CURRENT_USER
    print_warning "⚠️  RICHIESTO LOGOUT/LOGIN per applicare permessi gruppo!"
fi

# Fix permessi socket Docker
print_status "🔧 Configurazione permessi socket Docker..."
sudo chmod 666 /var/run/docker.sock
sudo chown root:docker /var/run/docker.sock

# Test permessi Docker
print_status "🧪 Test permessi Docker..."
if docker ps >/dev/null 2>&1; then
    print_status "✅ Permessi Docker OK!"
else
    print_warning "⚠️  Permessi ancora non funzionanti"
    echo
    echo -e "${YELLOW}🔄 Prova una di queste soluzioni:${NC}"
    echo
    echo -e "${BLUE}Soluzione 1 - Logout/Login (Raccomandato):${NC}"
    echo "   exit"
    echo "   # Riconnettiti SSH e riprova"
    echo
    echo -e "${BLUE}Soluzione 2 - Nuovo shell:${NC}"
    echo "   newgrp docker"
    echo "   ./install-aapanel.sh"
    echo
    echo -e "${BLUE}Soluzione 3 - Con sudo:${NC}"
    echo "   sudo ./install-aapanel.sh"
    echo
    exit 1
fi

print_status "🚀 Ora puoi eseguire MyKeyManager senza sudo!"
echo
echo -e "${GREEN}📋 Comandi disponibili:${NC}"
echo -e "   🔄 Riprova installazione: ${YELLOW}./install-aapanel.sh${NC}"
echo -e "   🧪 Test Docker:           ${YELLOW}docker ps${NC}"
echo -e "   📊 Info Docker:           ${YELLOW}docker info${NC}"

echo -e "${GREEN}==========================================================================${NC}"
