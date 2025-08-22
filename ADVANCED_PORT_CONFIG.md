# 🔧 Configurazione Porte Avanzata - MyKeyManager

## 🎯 Panoramica

MyKeyManager ora include un sistema di gestione porte intelligente simile a Docker Desktop, che permette di:

- ✅ **Rilevare automaticamente porte occupate**
- ✅ **Suggerire porte alternative disponibili**  
- ✅ **Configurare automaticamente il file .env**
- ✅ **Supportare multiple configurazioni**
- ✅ **Override personalizzati per Docker Compose**

## 🚀 Quick Start

### Configurazione Automatica (Raccomandato)
```bash
# Configurazione intelligente delle porte
./configure-ports.sh

# Script rileva automaticamente porte occupate e propone alternative
# Crea file .env ottimizzato per il tuo sistema
```

### Avvio Immediato
```bash
# Dopo configurazione porte
docker-compose -f docker-compose.hub.yml up -d

# Accesso con porte configurate
# URLs mostrati dal script configure-ports.sh --info
```

## 🛠️ Metodi di Configurazione

### 1. 🤖 Script Automatico (Intelligente)
```bash
./configure-ports.sh --configure    # Configurazione completa
./configure-ports.sh --check        # Solo verifica porte
./configure-ports.sh --info         # Mostra config attuale
./configure-ports.sh --help         # Aiuto completo
```

**Vantaggi:**
- Rileva automaticamente porte occupate
- Suggerisce alternative disponibili
- Configura CORS e URL automaticamente
- Crea backup delle configurazioni esistenti

### 2. 📝 File .env Manuale
```bash
# Configurazione diretta nel .env
FRONTEND_PORT=8080      # Porta frontend personalizzata
BACKEND_PORT=8001       # Porta backend personalizzata  
POSTGRES_PORT=5433      # Porta PostgreSQL personalizzata
REDIS_PORT=6380         # Porta Redis personalizzata
```

### 3. 🔄 Docker Compose Override
```bash
# Copia template override
cp docker-compose.override.example.yml docker-compose.override.yml

# Modifica porte nel file override
# Docker Compose automaticamente usa anche l'override
```

### 4. 🌐 Environment Variables
```bash
# Configurazione runtime
export FRONTEND_PORT=8080
export BACKEND_PORT=8001
docker-compose -f docker-compose.hub.yml up -d
```

## 🔍 Risoluzione Problemi Porte

### Verifica Porte Occupate
```bash
# Script integrato
./configure-ports.sh --check

# Comandi manuali macOS/Linux
lsof -i :80          # Verifica porta 80
lsof -i :8000        # Verifica porta 8000

# Windows
netstat -an | findstr :80
netstat -an | findstr :8000
```

### Porte Comuni Alternative

| Servizio | Default | Alternative Comuni |
|----------|---------|-------------------|
| Frontend | 80 | 8080, 3000, 4000, 5000 |
| Backend | 8000 | 8001, 8080, 3001, 9000 |
| PostgreSQL | 5432 | 5433, 15432, 25432 |
| Redis | 6379 | 6380, 16379, 26379 |

## 📦 Configurazioni Predefinite

### Docker Desktop (Porte Non Privilegiate)
```bash
FRONTEND_PORT=8080
BACKEND_PORT=8001
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### Server Produzione (Reverse Proxy)
```bash
FRONTEND_PORT=3000      # Dietro nginx/caddy
BACKEND_PORT=8000       # API interna
POSTGRES_PORT=5432      # Solo interno
REDIS_PORT=6379         # Solo interno
```

### Sviluppo Multi-Istanza
```bash
# Istanza 1
FRONTEND_PORT=8080
BACKEND_PORT=8001

# Istanza 2  
FRONTEND_PORT=9080
BACKEND_PORT=9001
```

## 🔐 Sicurezza e Best Practices

### Produzione
```bash
# Non esporre database esternamente
# Rimuovi dal docker-compose.hub.yml:
# db:
#   ports:
#     - "${POSTGRES_PORT}:5432"  # Commenta o rimuovi

# Redis solo interno
# redis:
#   ports:
#     - "${REDIS_PORT}:6379"     # Commenta o rimuovi
```

### Firewall
```bash
# Apri solo porte necessarie
sudo ufw allow ${FRONTEND_PORT}
sudo ufw allow ${BACKEND_PORT}
```

### Reverse Proxy Nginx
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Testing Configurazione

### Test Connettività
```bash
# Frontend
curl http://localhost:${FRONTEND_PORT}

# Backend Health Check
curl http://localhost:${BACKEND_PORT}/health

# API Documentation
curl http://localhost:${BACKEND_PORT}/docs

# Database (se esposto)
pg_isready -h localhost -p ${POSTGRES_PORT}

# Redis (se esposto)  
redis-cli -h localhost -p ${REDIS_PORT} ping
```

### Test Completo
```bash
# Script di test automatico
./configure-ports.sh --info          # Mostra configurazione
docker-compose -f docker-compose.hub.yml ps    # Verifica container
docker-compose -f docker-compose.hub.yml logs  # Verifica logs
```

## 🚀 Esempi Scenari d'Uso

### Scenario 1: Primo Setup
```bash
# 1. Clone progetto
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager

# 2. Configurazione automatica
./configure-ports.sh

# 3. Avvio immediato
docker-compose -f docker-compose.hub.yml up -d

# 4. Accesso (URLs mostrati dallo script)
```

### Scenario 2: Porte Occupate
```bash
# Script rileva automaticamente e propone alternative
./configure-ports.sh --configure

# Output esempio:
# ⚠️ Frontend: Porta 80 occupata, suggerisco 8080
# ⚠️ Backend: Porta 8000 occupata, suggerisco 8001
# ✅ PostgreSQL: Porta 5432 disponibile
# ✅ Redis: Porta 6379 disponibile
```

### Scenario 3: Ambiente Condiviso
```bash
# Configurazione manuale per evitare conflitti
echo "FRONTEND_PORT=9080" > .env
echo "BACKEND_PORT=9001" >> .env
echo "POSTGRES_PORT=9432" >> .env  
echo "REDIS_PORT=9379" >> .env

docker-compose -f docker-compose.hub.yml up -d
```

## 📞 Supporto

### File di Log
- `docker-compose.hub.yml logs` - Logs applicazione
- `.env.backup.*` - Backup configurazioni precedenti

### Ripristino Configurazione
```bash
# Ripristina da backup
cp .env.backup.20250122_153806 .env

# Riconfigurazione completa
rm .env
./configure-ports.sh --configure
```

Questo sistema rende MyKeyManager estremamente flessibile e compatibile con qualsiasi ambiente, proprio come i migliori tool di gestione container professionali!
