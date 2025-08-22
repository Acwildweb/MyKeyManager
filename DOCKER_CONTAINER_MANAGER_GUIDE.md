# 🐳 MyKeyManager - Guida Docker Container Manager

> **Installazione completa per interfacce grafiche Docker (Portainer, Docker Desktop, etc.)**

## 🚀 Installazione Rapida (AGGIORNATO v1.1.3)

### Opzione A: Version Stabile HOTFIX ⚡ (Raccomandato)

```bash
# NUOVO: Versione corretta per massima compatibilità
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.fixed.yml
docker compose -f docker-compose.fixed.yml up -d
```

### Opzione B: Versione Standard v1.1.2

```bash
# Versione originale (alcuni container manager potrebbero avere problemi di parsing)
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.container-manager.yml
docker compose -f docker-compose.container-manager.yml up -d
```

---

## 🎯 Metodo 1: Stack Docker Compose (Raccomandato)

### **1. Copia questo Docker Compose**

```yaml
services:
  # PostgreSQL Database
  db:
    image: postgres:14-alpine
    container_name: mykeymanager-db
    environment:
      POSTGRES_DB: mykeymanager
      POSTGRES_USER: mykeymanager
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-SecurePass123}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mykeymanager -d mykeymanager"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - mykeymanager-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: mykeymanager-redis
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - mykeymanager-network

  # Backend API
  backend:
    image: acwild/mykeymanager-backend:v1.1.2
    container_name: mykeymanager-backend
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://mykeymanager:${POSTGRES_PASSWORD:-SecurePass123}@db:5432/mykeymanager
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${SECRET_KEY:-your-secret-key-change-in-production}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS:-http://localhost:3000,http://localhost:8080}
      CORS_ORIGINS: '["http://localhost:${FRONTEND_PORT:-8080}"]'
      APP_VERSION: v1.1.2
    ports:
      - "${BACKEND_PORT:-8001}:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - mykeymanager-network

  # Frontend + Nginx
  frontend:
    image: acwild/mykeymanager-frontend:v1.1.1
    container_name: mykeymanager-frontend
    depends_on:
      backend:
        condition: service_healthy
    environment:
      VITE_API_URL: http://localhost:${BACKEND_PORT:-8001}/api
      VITE_APP_VERSION: v1.1.1
    ports:
      - "${FRONTEND_PORT:-8080}:80"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - mykeymanager-network

volumes:
  postgres_data:
    driver: local
    name: mykeymanager_postgres_data
  redis_data:
    driver: local
    name: mykeymanager_redis_data

networks:
  mykeymanager-network:
    driver: bridge

# Labels for management
x-labels: &default-labels
  com.mykeymanager.service: "all-in-one-compose"
  com.mykeymanager.version: "v1.1.2"
  com.mykeymanager.description: "Complete license management system"
```

### **2. Variabili d'Ambiente (Opzionali)**

```bash
# Porte (personalizza se necessario)
FRONTEND_PORT=8080
BACKEND_PORT=8001
DB_PORT=5432
REDIS_PORT=6379

# Sicurezza
POSTGRES_PASSWORD=SecurePass123
SECRET_KEY=your-super-secret-jwt-key-here

# CORS (aggiorna con i tuoi domini)
ALLOWED_ORIGINS=http://localhost:8080,http://your-domain.com
```

## 🎯 Metodo 2: Container Singoli (Step-by-Step)

### **1. Network**
```bash
docker network create mykeymanager-network
```

### **2. Database PostgreSQL**
```bash
docker run -d \
  --name mykeymanager-db \
  --network mykeymanager-network \
  -e POSTGRES_DB=mykeymanager \
  -e POSTGRES_USER=mykeymanager \
  -e POSTGRES_PASSWORD=SecurePass123 \
  -v mykeymanager_postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:14-alpine
```

### **3. Cache Redis**
```bash
docker run -d \
  --name mykeymanager-redis \
  --network mykeymanager-network \
  -v mykeymanager_redis_data:/data \
  -p 6379:6379 \
  --restart unless-stopped \
  redis:7-alpine
```

### **4. Backend API**
```bash
docker run -d \
  --name mykeymanager-backend \
  --network mykeymanager-network \
  -e DATABASE_URL=postgresql://mykeymanager:SecurePass123@mykeymanager-db:5432/mykeymanager \
  -e REDIS_URL=redis://mykeymanager-redis:6379 \
  -e SECRET_KEY=your-secret-key-change-in-production \
  -e ALLOWED_ORIGINS=http://localhost:8080 \
  -e APP_VERSION=v1.1.2 \
  -p 8001:8000 \
  --restart unless-stopped \
  acwild/mykeymanager-backend:v1.1.2
```

### **5. Frontend Web**
```bash
docker run -d \
  --name mykeymanager-frontend \
  --network mykeymanager-network \
  -e VITE_API_URL=http://localhost:8001/api \
  -e VITE_APP_VERSION=v1.1.1 \
  -p 8080:80 \
  --restart unless-stopped \
  acwild/mykeymanager-frontend:v1.1.1
```

## 🎛️ Configurazione Container Manager

### **Portainer**

1. **Stack Deployment**:
   - Vai in `Stacks` → `Add Stack`
   - Nome: `mykeymanager`
   - Copia il Docker Compose sopra
   - Aggiungi le variabili d'ambiente se necessario
   - Click `Deploy the stack`

2. **Container Singoli**:
   - Vai in `Containers` → `Add Container`
   - Usa i comandi Docker run sopra
   - Configura le variabili d'ambiente nell'interfaccia

### **Docker Desktop**

1. **Docker Compose**:
   - Salva il compose come `docker-compose.yml`
   - Apri terminale nella cartella
   - `docker compose up -d`

2. **Interfaccia Grafica**:
   - Usa la sezione "Containers/Apps"
   - Configura ogni container manualmente

### **Synology Docker**

1. **Registro**:
   - Cerca `acwild/mykeymanager-backend`
   - Scarica tag `v1.1.2`
   - Cerca `acwild/mykeymanager-frontend`
   - Scarica tag `v1.1.1`
   - Scarica `postgres:14-alpine`
   - Scarica `redis:7-alpine`

2. **Containers**:
   - Crea container seguendo l'ordine:
   1. PostgreSQL
   2. Redis  
   3. Backend
   4. Frontend

## 🔧 Configurazioni Avanzate

### **Mapping Porte Personalizzate**

```yaml
ports:
  # Frontend su porta 9000
  - "9000:80"
  
  # Backend su porta 9001  
  - "9001:8000"
  
  # Database solo interno (rimuovi ports)
  # - "5432:5432"  # Commentato per sicurezza
```

### **Volumi Personalizzati**

```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /your/custom/path/postgres
  
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /your/custom/path/redis
```

### **Configurazione SMTP (Email)**

```yaml
environment:
  # Backend - aggiungi queste variabili
  SMTP_SERVER: smtp.gmail.com
  SMTP_PORT: 587
  SMTP_USER: your-email@gmail.com
  SMTP_PASS: your-app-password
  FROM_EMAIL: noreply@your-domain.com
```

## 🔍 Verifica Installazione

### **Health Check**
```bash
# Test connettività
curl http://localhost:8080              # Frontend
curl http://localhost:8001/health       # Backend Health
curl http://localhost:8001/docs         # API Documentation
```

### **Log Container**
```bash
docker logs mykeymanager-backend
docker logs mykeymanager-frontend
docker logs mykeymanager-db
docker logs mykeymanager-redis
```

## 🎯 Accesso Sistema

Dopo l'installazione:

- **Frontend**: `http://localhost:8080`
- **API Docs**: `http://localhost:8001/docs`

**Credenziali Default**:
- Username: `admin`
- Password: `ChangeMe!123`

> ⚠️ **IMPORTANTE**: Cambia la password immediatamente dopo il primo accesso!

## 🛠️ Troubleshooting

### **Container non si avvia**
```bash
# Verifica log
docker logs container-name

# Verifica network
docker network ls
docker network inspect mykeymanager-network
```

### **Database non connette**
```bash
# Test connessione database
docker exec -it mykeymanager-db psql -U mykeymanager -d mykeymanager -c "\dt"
```

### **Reset completo**
```bash
# Ferma tutto
docker stop mykeymanager-frontend mykeymanager-backend mykeymanager-redis mykeymanager-db

# Rimuovi container
docker rm mykeymanager-frontend mykeymanager-backend mykeymanager-redis mykeymanager-db

# Rimuovi volumi (ATTENZIONE: cancella i dati!)
docker volume rm mykeymanager_postgres_data mykeymanager_redis_data

# Rimuovi network
docker network rm mykeymanager-network
```

## 📊 Monitoraggio

### **Risorse Container**
```bash
# Utilizzo risorse
docker stats

# Spazio volumi
docker system df -v
```

### **Backup Database**
```bash
# Backup
docker exec mykeymanager-db pg_dump -U mykeymanager mykeymanager > backup.sql

# Restore
docker exec -i mykeymanager-db psql -U mykeymanager -d mykeymanager < backup.sql
```

---

**🎉 Il tuo MyKeyManager è ora pronto per l'uso!**
