#!/bin/bash

# =========================================================================
# MyKeyManager - Script Diagnostico Post-Aggiornamento
# Verifica stato container e risolve problemi comuni
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
echo -e "${BLUE}🔍 Diagnostica MyKeyManager Post-Aggiornamento${NC}"
echo -e "${BLUE}==========================================================================${NC}"

print_status "📊 Controllo stato container..."
docker compose ps

echo
print_status "🐳 Controllo salute container..."

# Controllo database
if docker compose ps database | grep -q "Up"; then
    print_status "✅ Database: Running"
    
    # Test connessione database
    if docker compose exec -T database pg_isready -U mykeymanager >/dev/null 2>&1; then
        print_status "✅ Database: Connessione OK"
    else
        print_error "❌ Database: Connessione fallita"
    fi
else
    print_error "❌ Database: Non in esecuzione"
fi

# Controllo backend
if docker compose ps backend | grep -q "Up"; then
    print_status "✅ Backend: Running"
    
    # Test API backend
    if curl -sf http://localhost:8001/health >/dev/null 2>&1; then
        print_status "✅ Backend: API risponde"
    else
        print_warning "⚠️  Backend: API non risponde (potrebbe essere in startup)"
    fi
else
    print_error "❌ Backend: Non in esecuzione"
fi

# Controllo frontend
if docker compose ps frontend | grep -q "Up"; then
    print_status "✅ Frontend: Running"
    
    # Test frontend
    if curl -sf http://localhost:3000 >/dev/null 2>&1; then
        print_status "✅ Frontend: Risponde"
    else
        print_warning "⚠️  Frontend: Non risponde (potrebbe essere in startup)"
    fi
else
    print_error "❌ Frontend: Non in esecuzione"
fi

echo
print_status "📄 Ultimi log container (errori)..."

echo -e "${YELLOW}=== Database Logs ===${NC}"
docker compose logs database --tail=10 | grep -i error || echo "Nessun errore database"

echo -e "${YELLOW}=== Backend Logs ===${NC}"
docker compose logs backend --tail=10 | grep -i error || echo "Nessun errore backend"

echo -e "${YELLOW}=== Frontend Logs ===${NC}"
docker compose logs frontend --tail=10 | grep -i error || echo "Nessun errore frontend"

echo
print_status "🔧 Controllo configurazione..."

# Verifica IP configurazione
if grep -q "YOUR_SERVER_IP" docker-compose.yml; then
    print_error "❌ IP non configurato! Trova 'YOUR_SERVER_IP' in docker-compose.yml"
    echo "   Esegui: sed -i 's/YOUR_SERVER_IP/$(hostname -I | awk '{print $1}')/g' docker-compose.yml"
else
    print_status "✅ IP configurato"
fi

echo
print_status "🚀 Possibili soluzioni..."

echo -e "${BLUE}Soluzione 1 - Restart completo:${NC}"
echo "   docker compose down"
echo "   docker compose up -d"

echo -e "${BLUE}Soluzione 2 - Rebuild completo:${NC}"
echo "   docker compose down"
echo "   docker compose up -d --build --force-recreate"

echo -e "${BLUE}Soluzione 3 - Reset database (ATTENZIONE: cancella dati):${NC}"
echo "   docker compose down -v"
echo "   docker compose up -d"

echo -e "${BLUE}Soluzione 4 - Controllo dettagliato:${NC}"
echo "   docker compose logs -f"

echo
print_status "💡 Suggerimenti specifici per problemi comuni..."

# Controlla se c'è problema di porta
if netstat -tuln 2>/dev/null | grep -q ":3000.*LISTEN" && ! docker compose ps frontend | grep -q "Up"; then
    print_warning "⚠️  Porta 3000 occupata da altro processo"
    echo "   Trova processo: lsof -i :3000"
    echo "   Termina processo: kill -9 PID"
fi

if netstat -tuln 2>/dev/null | grep -q ":8001.*LISTEN" && ! docker compose ps backend | grep -q "Up"; then
    print_warning "⚠️  Porta 8001 occupata da altro processo"
    echo "   Trova processo: lsof -i :8001"
    echo "   Termina processo: kill -9 PID"
fi

echo -e "${GREEN}==========================================================================${NC}"
echo -e "${GREEN}🎯 Per accesso pannello verifica:${NC}"
echo -e "   🌐 URL: http://$(hostname -I | awk '{print $1}'):3000"
echo -e "   🔑 Login: admin@example.com / admin123"
echo -e "${GREEN}==========================================================================${NC}"
