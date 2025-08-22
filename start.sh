#!/bin/bash
# Script di avvio rapido per MyKeyManager

echo "🔑 Avvio MyKeyManager..."

# Controlla se Docker è installato
if ! command -v docker &> /dev/null; then
    echo "❌ Docker non trovato. Installa Docker prima di continuare."
    exit 1
fi

# Controlla se docker compose è disponibile
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose non trovato. Installa Docker Desktop prima di continuare."
    exit 1
fi

# Crea file .env se non esiste
if [ ! -f .env ]; then
    echo "📝 Creazione file .env..."
    cp .env.example .env
    echo "✅ File .env creato. Modifica le credenziali se necessario."
fi

# Vai nella directory devops
cd devops

echo "🚀 Avvio container Docker..."
docker compose up --build -d

echo "⏳ Attendo che i servizi siano pronti..."
sleep 10

echo "✅ MyKeyManager è ora disponibile!"
echo ""
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 Documentazione API: http://localhost:8000/docs"
echo ""
echo "🔐 Credenziali default:"
echo "   Username: admin"
echo "   Password: ChangeMe!123"
echo ""
echo "Per fermare i servizi: docker compose down"
