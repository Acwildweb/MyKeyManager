#!/bin/bash

# =========================================================================
# Test CSP Fix - MyKeyManager ARM64
# Verifica risoluzione Content Security Policy e configurazione proxy
# =========================================================================

echo "🔍 TESTING CSP FIX E CONFIGURAZIONE PROXY"
echo "=========================================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 1. CONTROLLO STATO CONTAINER${NC}"
echo "--------------------------------------"
docker compose -f docker-compose.arm64.yml ps

echo -e "\n${BLUE}📋 2. REBUILD CONTAINER FRONTEND CON NUOVA CONFIGURAZIONE${NC}"
echo "--------------------------------------------------------"
echo "Rebuilding frontend con proxy interno..."
docker compose -f docker-compose.arm64.yml build frontend

echo -e "\n${BLUE}📋 3. RESTART SISTEMA COMPLETO${NC}"
echo "-------------------------------"
docker compose -f docker-compose.arm64.yml down
echo "Restarting con nuova configurazione..."
docker compose -f docker-compose.arm64.yml up -d

echo -e "\n${BLUE}📋 4. ATTESA AVVIO SERVIZI${NC}"
echo "-----------------------------"
echo "Aspettando che i servizi si avviino..."
sleep 15

echo -e "\n${BLUE}📋 5. TEST HEALTH CHECK BACKEND${NC}"
echo "--------------------------------"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health 2>/dev/null || echo "000")
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend health check OK ($BACKEND_HEALTH)${NC}"
else
    echo -e "${RED}❌ Backend health check FAILED ($BACKEND_HEALTH)${NC}"
fi

echo -e "\n${BLUE}📋 6. TEST FRONTEND ACCESSIBILITÀ${NC}"
echo "---------------------------------"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend accessibile ($FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Frontend non accessibile ($FRONTEND_STATUS)${NC}"
fi

echo -e "\n${BLUE}📋 7. TEST PROXY API INTERNO${NC}"
echo "----------------------------"
API_PROXY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null || echo "000")
if [ "$API_PROXY_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Proxy API interno funziona ($API_PROXY_STATUS)${NC}"
else
    echo -e "${RED}❌ Proxy API interno non funziona ($API_PROXY_STATUS)${NC}"
    echo "Tentando connessione diretta..."
    curl -v http://localhost:3000/api/v1/health 2>&1 | head -10
fi

echo -e "\n${BLUE}📋 8. TEST HEADERS CSP${NC}"
echo "----------------------"
echo "Verificando Content Security Policy Headers..."
CSP_HEADERS=$(curl -s -I http://localhost:3000 | grep -i "content-security-policy" || echo "NESSUN CSP TROVATO")
echo "CSP Headers: $CSP_HEADERS"

echo -e "\n${BLUE}📋 9. TEST LOGIN ENDPOINT PROXY${NC}"
echo "-------------------------------"
echo "Testando login endpoint attraverso proxy..."
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=test" \
  http://localhost:3000/api/v1/auth/login 2>/dev/null || echo "000")

if [ "$LOGIN_RESPONSE" = "422" ] || [ "$LOGIN_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Login endpoint accessibile via proxy ($LOGIN_RESPONSE - credenziali test invalid come previsto)${NC}"
elif [ "$LOGIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Login endpoint accessibile via proxy ($LOGIN_RESPONSE - login riuscito)${NC}"
else
    echo -e "${RED}❌ Login endpoint non accessibile via proxy ($LOGIN_RESPONSE)${NC}"
fi

echo -e "\n${BLUE}📋 10. CONTROLLO LOGS FRONTEND${NC}"
echo "------------------------------"
echo "Ultimi log del frontend:"
docker compose -f docker-compose.arm64.yml logs --tail=10 frontend

echo -e "\n${YELLOW}🔧 ISTRUZIONI PER IL TEST MANUALE:${NC}"
echo "====================================="
echo "1. Apri il browser su http://localhost:3000"
echo "2. Apri Developer Tools (F12)"
echo "3. Vai alla tab Network"
echo "4. Prova il login"
echo "5. Verifica che le richieste vadano a '/api/v1/auth/login' (relativo)"
echo "6. Non dovrebbero più esserci errori CSP nella Console"

echo -e "\n${GREEN}✅ TEST COMPLETATO${NC}"
echo "Se il proxy funziona, le richieste API saranno interne e non violeranno più il CSP!"
