#!/bin/bash

# =========================================================================
# MyKeyManager - Reset Password Admin
# Ripristina credenziali admin dopo problemi database
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
echo -e "${BLUE}🔧 Reset Password Admin MyKeyManager${NC}"
echo -e "${BLUE}==========================================================================${NC}"

# Verifica che i container siano attivi
if ! docker compose ps | grep -q "backend.*Up"; then
    print_error "❌ Container backend non attivo!"
    echo -e "${YELLOW}Prova:${NC}"
    echo "   docker compose up -d"
    exit 1
fi

if ! docker compose ps | grep -q "database.*Up"; then
    print_error "❌ Container database non attivo!"
    echo -e "${YELLOW}Prova:${NC}"
    echo "   docker compose up -d"
    exit 1
fi

print_status "⏳ Attendo che il database sia pronto..."
sleep 10

print_status "🔍 Controllo se utente admin esiste..."

# Controlla se esiste utente admin
USER_EXISTS=$(docker compose exec -T database psql -U mykeymanager -d mykeymanager -t -c "SELECT COUNT(*) FROM users WHERE username='admin' OR email='admin@example.com';" 2>/dev/null | tr -d ' ' || echo "0")

if [[ "$USER_EXISTS" == "0" ]]; then
    print_warning "👤 Utente admin non trovato, lo creo..."
    
    # Crea utente admin via API backend
    print_status "📝 Creazione utente admin tramite inizializzazione database..."
    
    # Prova a creare tramite endpoint backend se disponibile
    docker compose exec -T backend python -c "
import sys
sys.path.append('/app')
from app.database import SessionLocal, engine
from app import models
from app.security import get_password_hash
from sqlalchemy.orm import Session

# Crea tabelle se non esistono
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # Verifica se admin esiste
    admin_user = db.query(models.User).filter(
        (models.User.username == 'admin') | 
        (models.User.email == 'admin@example.com')
    ).first()
    
    if admin_user:
        print('Admin esistente trovato, aggiorno password...')
        admin_user.password_hash = get_password_hash('admin123')
        db.commit()
        print('✅ Password admin aggiornata!')
    else:
        print('Creo nuovo utente admin...')
        # Crea nuovo admin
        admin_user = models.User(
            username='admin',
            email='admin@example.com',
            full_name='Administrator',
            password_hash=get_password_hash('admin123'),
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print('✅ Nuovo utente admin creato!')
        
    # Crea categoria di default se non esiste
    default_category = db.query(models.Category).filter(models.Category.name == 'Software').first()
    if not default_category:
        default_category = models.Category(name='Software', icon='💻')
        db.add(default_category)
        db.commit()
        print('✅ Categoria Software creata!')
        
except Exception as e:
    print(f'❌ Errore: {e}')
    db.rollback()
finally:
    db.close()
" 2>/dev/null || print_error "❌ Errore nella creazione utente admin"

else
    print_status "👤 Utente admin trovato, aggiorno password..."
    
    # Reset password utente esistente
    docker compose exec -T backend python -c "
import sys
sys.path.append('/app')
from app.database import SessionLocal
from app import models
from app.security import get_password_hash

db = SessionLocal()
try:
    admin_user = db.query(models.User).filter(
        (models.User.username == 'admin') | 
        (models.User.email == 'admin@example.com')
    ).first()
    
    if admin_user:
        admin_user.password_hash = get_password_hash('admin123')
        admin_user.is_active = True
        db.commit()
        print('✅ Password admin resettata!')
    else:
        print('❌ Utente admin non trovato!')
except Exception as e:
    print(f'❌ Errore: {e}')
    db.rollback()
finally:
    db.close()
" 2>/dev/null || print_error "❌ Errore nel reset password"
fi

echo
print_status "🧪 Test connessione API..."

# Test login
sleep 5
LOGIN_TEST=$(curl -s -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123" 2>/dev/null || echo "ERROR")

if [[ "$LOGIN_TEST" != "ERROR" ]] && echo "$LOGIN_TEST" | grep -q "access_token"; then
    print_status "✅ Login test riuscito!"
else
    print_warning "⚠️  Test login fallito, ma utente dovrebbe essere stato creato"
fi

echo
echo -e "${GREEN}==========================================================================${NC}"
echo -e "${GREEN}✅ RESET COMPLETATO${NC}"
echo -e "${GREEN}==========================================================================${NC}"
echo
echo -e "${BLUE}🔑 Credenziali Admin Ripristinate:${NC}"
echo -e "   📧 Email:    ${YELLOW}admin@example.com${NC}"
echo -e "   🔒 Password: ${YELLOW}admin123${NC}"
echo
echo -e "${BLUE}🌐 Accesso Pannello:${NC}"
SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
echo -e "   🌍 URL: ${YELLOW}http://$SERVER_IP:3000${NC}"
echo
echo -e "${BLUE}🔧 Se persiste il problema:${NC}"
echo -e "   1. ${YELLOW}docker compose restart${NC}"
echo -e "   2. ${YELLOW}docker compose logs backend${NC}"
echo -e "   3. Verifica firewall porte 3000, 8001"
echo -e "${GREEN}==========================================================================${NC}"
