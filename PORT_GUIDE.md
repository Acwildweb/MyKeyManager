# 🌐 Guida Porte MyKeyManager - Configurazione Avanzata

## � Configurazione Automatica delle Porte (Nuovo!)

MyKeyManager ora include un sistema di configurazione porte intelligente, simile a Docker Desktop!

### ⚡ Setup Automatico
```bash
# Configurazione automatica delle porte
./configure-ports.sh

# Solo verifica porte disponibili
./configure-ports.sh --check

# Mostra configurazione attuale
./configure-ports.sh --info
```

## �📋 Porte Standard

### Docker Hub Version (Raccomandato per Produzione)
```yaml
services:
  frontend:
    ports:
      - "${FRONTEND_PORT:-80}:80"       # Frontend Web App
  backend:
    ports:
      - "${BACKEND_PORT:-8000}:8000"    # API Backend
  db:
    ports:
      - "${POSTGRES_PORT:-5432}:5432"   # PostgreSQL
  redis:
    ports:
      - "${REDIS_PORT:-6379}:6379"      # Redis
```

### Configurazione tramite .env
```bash
# Porte personalizzate nel file .env
FRONTEND_PORT=8080
BACKEND_PORT=8001
POSTGRES_PORT=5433
REDIS_PORT=6380
```

## 🛠️ Metodi di Configurazione

### 1. 🤖 Configurazione Automatica (Raccomandato)
```bash
# Script intelligente che rileva porte occupate
./configure-ports.sh --configure

# Output esempio:
# ✅ Frontend: Porta 80 disponibile
# ⚠️  Backend: Porta 8000 occupata, suggerisco 8001
# ✅ PostgreSQL: Porta 5432 disponibile
# ⚠️  Redis: Porta 6379 occupata, suggerisco 6380
```

### 2. 📝 File .env Manuale
```bash
# Crea/modifica .env
echo "FRONTEND_PORT=8080" > .env
echo "BACKEND_PORT=8001" >> .env
echo "POSTGRES_PORT=5433" >> .env
echo "REDIS_PORT=6380" >> .env
```

### 3. 🔄 Docker Compose Override
```bash
# Copia e personalizza
cp docker-compose.override.example.yml docker-compose.override.yml
# Modifica le porte nel file override
```

### 4. 🌐 Variabili Environment
```bash
# Configurazione al volo
export FRONTEND_PORT=8080
export BACKEND_PORT=8001
docker-compose -f docker-compose.hub.yml up -d
```

## 🌐 Accesso Applicazione

### URL Dinamici (basati su configurazione)
```bash
# Con porte default
Frontend: http://localhost:80
API Docs: http://localhost:8000/docs

# Con porte personalizzate (esempio)
Frontend: http://localhost:8080
API Docs: http://localhost:8001/docs
```

### Verifica URLs Attuali
```bash
# Script mostra URLs corretti
./configure-ports.sh --info

# Output:
# 🌐 URLs di accesso:
#    Frontend:   http://localhost:8080
#    Backend:    http://localhost:8001/docs
#    PostgreSQL: localhost:5433
#    Redis:      localhost:6380
```

## ⚡ Avvio Rapido

### Comando Unico
```bash
# Download e avvio
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.hub.yml
docker-compose -f docker-compose.hub.yml up -d

# Accesso immediato
open http://localhost
```

### Verifica Servizi
```bash
# Controlla container attivi
docker-compose -f docker-compose.hub.yml ps

# Logs applicazione
docker-compose -f docker-compose.hub.yml logs -f
```

## 🛡️ Sicurezza Porte

### Produzione
- Chiudi porte database (5432, 6379) all'esterno
- Usa reverse proxy (nginx/caddy) per HTTPS
- Configura firewall per limitare accesso

### Esempio Reverse Proxy
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:80;
    }
    
    location /api/ {
        proxy_pass http://localhost:8000;
    }
}
```

## 🔍 Troubleshooting Porte

### Verifica porte occupate
```bash
# macOS/Linux
lsof -i :80
lsof -i :8000

# Windows
netstat -an | findstr :80
netstat -an | findstr :8000
```

### Cambia porte in .env
```bash
# Crea/modifica .env
FRONTEND_PORT=8080
BACKEND_PORT=8001
```

### Test connettività
```bash
# Test frontend
curl http://localhost

# Test backend
curl http://localhost:8000/health

# Test API
curl http://localhost:8000/docs
```
