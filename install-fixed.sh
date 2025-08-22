#!/bin/bash

# =========================================================================
# MyKeyManager - Script di Installazione Docker Compose FIXED
# =========================================================================

echo "🐳 MyKeyManager - Installazione Docker Compose"
echo "================================================="

# Controlla se docker-compose.fixed.yml esiste
if [ ! -f "docker-compose.fixed.yml" ]; then
    echo "📥 Download docker-compose.fixed.yml..."
    curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.fixed.yml
fi

# Ferma eventuali container esistenti
echo "🛑 Ferma container esistenti..."
docker compose -f docker-compose.fixed.yml down 2>/dev/null || true

# Pulisce i volumi se richiesto
read -p "🧹 Vuoi pulire i volumi esistenti? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Rimuovo volumi esistenti..."
    docker volume rm mykeymanager_postgres_data mykeymanager_redis_data 2>/dev/null || true
fi

# Avvia i servizi
echo "🚀 Avvio servizi MyKeyManager..."
docker compose -f docker-compose.fixed.yml up -d

# Attende che i servizi siano pronti
echo "⏳ Attendo che i servizi siano pronti..."
sleep 10

echo "🔄 Controllo Database..."
for i in {1..30}; do
    if docker exec mykeymanager-db pg_isready -U mykeymanager -d mykeymanager >/dev/null 2>&1; then
        echo "✅ Database pronto!"
        break
    fi
    echo "⏳ Database non ancora pronto... ($i/30)"
    sleep 2
done

echo "🔄 Controllo Backend..."
for i in {1..30}; do
    if docker exec mykeymanager-backend curl -f http://localhost:8000/health >/dev/null 2>&1; then
        echo "✅ Backend pronto!"
        break
    fi
    echo "⏳ Backend non ancora pronto... ($i/30)"
    sleep 2
done

echo "🔄 Controllo Frontend..."
for i in {1..20}; do
    if docker exec mykeymanager-frontend wget --spider -q http://localhost/ >/dev/null 2>&1; then
        echo "✅ Frontend pronto!"
        break
    fi
    echo "⏳ Frontend non ancora pronto... ($i/20)"
    sleep 2
done

# Status finale
echo ""
echo "📊 Status Container:"
docker compose -f docker-compose.fixed.yml ps

echo ""
echo "🎉 INSTALLAZIONE COMPLETATA!"
echo ""
echo "🌐 Accesso MyKeyManager:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:8001"
echo ""
echo "👤 Credenziali default:"
echo "   Username: admin"
echo "   Password: ChangeMe!123"
echo ""
echo "🔧 Comandi utili:"
echo "   Status: docker compose -f docker-compose.fixed.yml ps"
echo "   Logs: docker compose -f docker-compose.fixed.yml logs"
echo "   Stop: docker compose -f docker-compose.fixed.yml down"
echo ""

# Test finale
echo "🧪 Test di connettività:"
if curl -s http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ Frontend accessibile su http://localhost:8080"
else
    echo "⚠️ Frontend potrebbe non essere ancora pronto, riprova tra qualche secondo"
fi

if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    echo "✅ Backend API accessibile su http://localhost:8001"
else
    echo "⚠️ Backend API potrebbe non essere ancora pronto, riprova tra qualche secondo"
fi
