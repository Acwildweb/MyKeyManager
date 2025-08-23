#!/bin/bash

echo "🔧 FIX SCHEMA DATABASE - Aggiunta colonna password mancante"
echo "=========================================================="

echo "1. Controllo schema attuale tabella users..."
docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -c "
\d users;
"

echo ""
echo "2. Aggiunta colonna hashed_password se mancante..."
docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -c "
ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);
"

echo ""
echo "3. Verifica schema aggiornato..."
docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -c "
\d users;
"

echo ""
echo "4. Impostazione password per utente admin esistente..."
# Genera hash password per Wingman7474!!
PASSWORD_HASH=$(docker compose -f docker-compose.arm64.yml exec backend python3 -c "
import bcrypt
password = 'Wingman7474!!'
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
print(hashed.decode('utf-8'))
" | tr -d '\r')

echo "Hash generato per password: ${PASSWORD_HASH:0:30}..."

# Aggiorna la password dell'admin
docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -c "
UPDATE users 
SET hashed_password = '$PASSWORD_HASH'
WHERE username = 'admin';
"

echo ""
echo "5. Verifica utente admin completo..."
docker compose -f docker-compose.arm64.yml exec database psql -U mykeymanager -d mykeymanager -c "
SELECT 
    id, 
    username, 
    email, 
    is_active, 
    created_at,
    CASE 
        WHEN hashed_password IS NOT NULL THEN 'Password impostata ✅'
        ELSE 'Password mancante ❌'
    END as password_status,
    substring(hashed_password, 1, 30) as password_hash_preview
FROM users 
WHERE username = 'admin';
"

echo ""
echo "6. Test login con curl..."
curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=Wingman7474!!" | \
  python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'access_token' in data:
        print('✅ LOGIN RIUSCITO! Token ricevuto')
        print(f'Token type: {data.get(\"token_type\", \"N/A\")}')
    else:
        print('❌ Login fallito:')
        print(json.dumps(data, indent=2))
except:
    print('❌ Risposta non JSON o errore di connessione')
"

echo ""
echo "🎉 RIPARAZIONE COMPLETATA!"
echo "Password admin: Wingman7474!!"
echo "Ora puoi accedere al pannello su http://mkm.acwild.it:3000"
