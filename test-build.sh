#!/bin/bash

# Test script per verificare che i Dockerfile build correttamente dal root

echo "🧪 Test Build Docker dal Root Directory"
echo "======================================"

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test build backend
echo -e "${YELLOW}Test build backend...${NC}"
if docker build -f ./devops/Dockerfile.backend -t test-backend .; then
    echo -e "${GREEN}✅ Backend build SUCCESS${NC}"
    docker rmi test-backend
else
    echo -e "${RED}❌ Backend build FAILED${NC}"
    exit 1
fi

# Test build frontend
echo -e "${YELLOW}Test build frontend...${NC}"
if docker build -f ./devops/Dockerfile.frontend -t test-frontend .; then
    echo -e "${GREEN}✅ Frontend build SUCCESS${NC}"
    docker rmi test-frontend
else
    echo -e "${RED}❌ Frontend build FAILED${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Tutti i build test sono passati!${NC}"
echo "Il docker-compose.casaos.yml dovrebbe ora funzionare correttamente."
