#!/bin/bash

echo "🔍 CONTROLLO UTENTE ADMIN E PASSWORD"
echo "===================================="

echo "1. Connessione al database per controllare utente admin..."
docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -c "
SELECT 
    id, 
    username, 
    email, 
    is_active, 
    created_at,
    substring(hashed_password, 1, 20) as password_hash_preview
FROM users 
WHERE username = 'admin' OR email = 'admin'
ORDER BY created_at DESC;
"

echo ""
echo "2. Elenco di tutti gli utenti presenti..."
docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -c "
SELECT 
    id, 
    username, 
    email, 
    is_active, 
    created_at
FROM users 
ORDER BY created_at DESC;
"

echo ""
echo "3. Test hash password con bcrypt..."
echo "Password testata: Wingman7474!!"

# Ottieni l'hash password dall'admin
ADMIN_HASH=$(docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -t -c "SELECT hashed_password FROM users WHERE username = 'admin' LIMIT 1;" 2>/dev/null | tr -d ' \n\r')

if [ ! -z "$ADMIN_HASH" ]; then
    echo "Hash trovato per admin: ${ADMIN_HASH:0:30}..."
    
    # Test hash con Python
    docker compose -f docker-compose.arm64.yml exec backend python3 -c "
import bcrypt
password = 'Wingman7474!!'
stored_hash = '$ADMIN_HASH'
try:
    # Rimuovi spazi extra
    stored_hash = stored_hash.strip()
    if bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
        print('✅ Password CORRETTA - bcrypt match!')
    else:
        print('❌ Password SBAGLIATA - bcrypt no match')
        print(f'Password testata: {password}')
        print(f'Hash formato: {len(stored_hash)} caratteri')
except Exception as e:
    print(f'❌ Errore durante test hash: {e}')
    print(f'Hash ricevuto: {repr(stored_hash)}')
"
else
    echo "❌ Nessun utente admin trovato!"
fi

echo ""
echo "4. Suggerimenti:"
echo "   - Se utente admin non esiste, crearlo con ./reset-admin-password.sh"
echo "   - Se password sbagliata, cambiarla con ./change-password-direct.sh"
echo "   - Password corrente dovrebbe essere quella impostata durante setup"
