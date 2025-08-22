#!/bin/bash

# Script di build automatico per MyKeyManager
# Incrementa automaticamente la patch version e ricompila l'applicazione

echo "🚀 MyKeyManager - Build Automatico"
echo "=================================="

# Controlla se è stato fornito un messaggio di commit
if [ -z "$1" ]; then
    echo "❌ Errore: Fornire un messaggio per la build"
    echo "Utilizzo: ./scripts/build.sh \"Descrizione delle modifiche\""
    exit 1
fi

BUILD_MESSAGE="$1"

echo "📝 Messaggio build: $BUILD_MESSAGE"
echo ""

# Vai nella directory frontend
cd "$(dirname "$0")/.."

# Incrementa la patch version
echo "🔢 Incremento versione..."
node scripts/version.js patch "$BUILD_MESSAGE"

if [ $? -ne 0 ]; then
    echo "❌ Errore nell'incremento della versione"
    exit 1
fi

echo ""

# Vai nella directory root del progetto
cd ..

echo "🐳 Avvio build Docker..."
echo ""

# Build del container frontend
cd devops
docker compose build --no-cache frontend

if [ $? -ne 0 ]; then
    echo "❌ Errore nella build del container"
    exit 1
fi

# Riavvia i servizi
echo ""
echo "🔄 Riavvio servizi..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Errore nel riavvio dei servizi"
    exit 1
fi

echo ""
echo "✅ Build completata con successo!"
echo "🌐 Applicazione disponibile su: http://localhost:3000"

# Mostra la versione corrente
echo ""
echo "📊 Informazioni versione:"
cd ../frontend
node scripts/version.js current
