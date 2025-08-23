# 🏠 MyKeyManager su CasaOS - Guida Completa

> **Installazione e configurazione di MyKeyManager su CasaOS**

## 🎯 Cos'è CasaOS?

CasaOS è un sistema operativo domestico elegante e semplice che rende facile la gestione di container Docker attraverso un'interfaccia web intuitiva.

## 🚀 Metodi di Installazione

### Metodo 1: Installazione tramite App Store CasaOS (Raccomandato)

Se MyKeyManager non è ancora nell'App Store di CasaOS, puoi installarlo manualmente:

#### 1. **Accedi al Pannello CasaOS**
- Apri il browser e vai su `http://IP_CASAOS` (di solito `http://192.168.1.XXX`)
- Accedi con le tue credenziali

#### 2. **Crea una Nuova App Custom**
- Clicca su "**+**" per aggiungere una nuova applicazione
- Seleziona "**Custom Install**" o "**Install from Docker Compose**"

#### 3. **Configurazione Docker Compose**

Copia e incolla questo Docker Compose ottimizzato per CasaOS:

```yaml
name: mykeymanager
services:
  # Database PostgreSQL
  db:
    image: postgres:14-alpine
    container_name: mykeymanager-db
    environment:
      POSTGRES_DB: mykeymanager
      POSTGRES_USER: mykeymanager
      POSTGRES_PASSWORD: SecurePass123
    volumes:
      - /DATA/AppData/mykeymanager/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - mykeymanager-net

  # Cache Redis
  redis:
    image: redis:7-alpine
    container_name: mykeymanager-redis
    volumes:
      - /DATA/AppData/mykeymanager/redis:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - mykeymanager-net
    command: redis-server --appendonly yes

  # Backend API
  backend:
    image: acwild/mykeymanager-backend:v1.1.2
    container_name: mykeymanager-backend
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgresql://mykeymanager:SecurePass123@mykeymanager-db:5432/mykeymanager
      REDIS_URL: redis://mykeymanager-redis:6379
      SECRET_KEY: casa-os-secret-key-change-me
      ALLOWED_ORIGINS: http://localhost:8080
      CORS_ORIGINS: '["http://localhost:8080"]'
      APP_VERSION: v1.1.2
    ports:
      - "8001:8000"
    restart: unless-stopped
    networks:
      - mykeymanager-net

  # Frontend Web
  frontend:
    image: acwild/mykeymanager-frontend:v1.1.1
    container_name: mykeymanager-frontend
    depends_on:
      - backend
    environment:
      VITE_API_URL: http://localhost:8001/api
      VITE_APP_VERSION: v1.1.1
    ports:
      - "8080:80"
    restart: unless-stopped
    networks:
      - mykeymanager-net

networks:
  mykeymanager-net:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### Metodo 2: Installazione tramite Terminale CasaOS

Se preferisci usare il terminale:

#### 1. **Accedi al Terminale CasaOS**
- Nel pannello CasaOS, vai su "**Terminal**"
- Oppure collegati via SSH: `ssh casaos@IP_CASAOS`

#### 2. **Download Files di Installazione**

```bash
# Crea directory per MyKeyManager
mkdir -p /DATA/AppData/mykeymanager
cd /DATA/AppData/mykeymanager

# Download docker-compose per CasaOS
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.server.yml

# Crea file .env personalizzato per CasaOS
cat > .env << 'EOF'
# Configurazione CasaOS
CONTAINER_PREFIX=mykeymanager
FRONTEND_PORT=8080
BACKEND_PORT=8001
DB_PORT=5432
REDIS_PORT=6379

# Database
POSTGRES_PASSWORD=SecurePass123
POSTGRES_DB=mykeymanager
POSTGRES_USER=mykeymanager

# Sicurezza
SECRET_KEY=casaos-change-this-secret-key

# URL per CasaOS (cambia IP con quello del tuo CasaOS)
ALLOWED_ORIGINS=http://192.168.1.100:8080
CORS_ORIGINS=["http://192.168.1.100:8080"]
API_URL=http://192.168.1.100:8001/api
EOF
```

#### 3. **Avvio Servizi**

```bash
# Avvia MyKeyManager
docker compose -f docker-compose.server.yml up -d

# Controlla stato
docker compose -f docker-compose.server.yml ps
```

## 🔧 Configurazione Specifica CasaOS

### 1. **Percorsi di Storage**

CasaOS usa `/DATA/AppData/` per i dati persistenti:

```bash
# Struttura directory
/DATA/AppData/mykeymanager/
├── postgres/          # Dati PostgreSQL
├── redis/            # Cache Redis
├── backups/          # Backup (opzionale)
├── .env              # Configurazione
└── docker-compose.yml
```

### 2. **Configurazione Rete CasaOS**

Trova l'IP del tuo CasaOS:

```bash
# Nel terminale CasaOS
ip addr show | grep "inet 192"
# Oppure
hostname -I
```

Aggiorna il file `.env` con l'IP corretto:

```bash
# Sostituisci 192.168.1.100 con l'IP del tuo CasaOS
ALLOWED_ORIGINS=http://192.168.1.100:8080
CORS_ORIGINS=["http://192.168.1.100:8080"]
API_URL=http://192.168.1.100:8001/api
```

### 3. **Firewall CasaOS**

CasaOS gestisce automaticamente le porte, ma assicurati che siano aperte:

```bash
# Controlla porte aperte
netstat -tuln | grep -E "(8080|8001)"

# Se necessario, apri porte
sudo ufw allow 8080/tcp
sudo ufw allow 8001/tcp
```

## 📱 Interfaccia CasaOS

### 1. **Aggiunta Shortcut nell'App Store**

Dopo l'installazione, puoi aggiungere MyKeyManager alla dashboard:

1. **Dashboard CasaOS** → **Add Widget**
2. **Custom App** → **Add New**
3. **App Details**:
   - **Nome**: MyKeyManager
   - **Icona**: 🔐 (o carica un'icona personalizzata)
   - **URL**: `http://IP_CASAOS:8080`
   - **Descrizione**: "Gestione Licenze Software"

### 2. **Monitoring dei Container**

Nel pannello CasaOS:
- **Docker** → **Containers** per vedere lo stato
- **Logs** per controllare i log dei servizi
- **Resources** per monitorare CPU/RAM

## 🔧 Configurazione App CasaOS Custom

Se vuoi creare un'app personalizzata per CasaOS, crea questo file:

```yaml
# /DATA/AppData/mykeymanager/app.json
{
  "name": "MyKeyManager",
  "id": "mykeymanager",
  "title": "MyKeyManager - Gestione Licenze",
  "description": "Sistema completo per la gestione delle licenze software",
  "developer": "Acwild",
  "version": "v1.1.2",
  "category": "Developer",
  "port_map": "8080",
  "icon": "🔐",
  "screenshot_link": [],
  "thumbnail": "",
  "tips": {
    "before_install": [
      "Assicurati di avere almeno 2GB di RAM liberi",
      "Le porte 8080 e 8001 devono essere disponibili"
    ]
  },
  "changelog": {
    "v1.1.2": "Versione stabile con supporto CasaOS"
  },
  "docker_compose": {
    "file": "docker-compose.server.yml",
    "env_file": ".env"
  }
}
```

## 🚀 Accesso e Utilizzo

### 1. **Accesso Web**

- **URL**: `http://IP_CASAOS:8080`
- **Username**: `admin`
- **Password**: `ChangeMe!123`

### 2. **API Backend**

- **Health Check**: `http://IP_CASAOS:8001/health`
- **API Docs**: `http://IP_CASAOS:8001/docs`

## 📊 Gestione e Manutenzione

### 1. **Comandi Utili CasaOS**

```bash
# Status container
docker ps | grep mykeymanager

# Logs in tempo reale
docker logs -f mykeymanager-backend

# Restart servizio
docker restart mykeymanager-frontend

# Stop completo
cd /DATA/AppData/mykeymanager
docker compose -f docker-compose.server.yml down
```

### 2. **Backup Automatico**

Crea uno script di backup:

```bash
# /DATA/AppData/mykeymanager/backup.sh
#!/bin/bash
BACKUP_DIR="/DATA/AppData/mykeymanager/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec mykeymanager-db pg_dump -U mykeymanager mykeymanager > \
  "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup configurazione
cp .env "$BACKUP_DIR/env_backup_$DATE"

echo "Backup completato: $DATE"
```

### 3. **Aggiornamento**

```bash
cd /DATA/AppData/mykeymanager

# Pull nuove immagini
docker compose -f docker-compose.server.yml pull

# Riavvia con nuove versioni
docker compose -f docker-compose.server.yml up -d
```

## 🆘 Troubleshooting CasaOS

### Problemi Comuni

#### 1. **Container non si avviano**
```bash
# Controlla logs
docker logs mykeymanager-backend

# Verifica porte
netstat -tuln | grep 8080
```

#### 2. **Frontend non raggiungibile**
```bash
# Controlla IP CasaOS
ip addr show

# Aggiorna .env con IP corretto
nano .env
```

#### 3. **Database non si connette**
```bash
# Verifica container DB
docker logs mykeymanager-db

# Test connessione
docker exec mykeymanager-db psql -U mykeymanager -d mykeymanager -c "SELECT 1;"
```

## 📞 Supporto CasaOS

- **CasaOS Community**: https://community.casaos.io/
- **MyKeyManager Issues**: https://github.com/Acwildweb/MyKeyManager/issues

---

**Guida aggiornata per CasaOS**: 23 Agosto 2025  
**Compatibilità**: CasaOS 0.4.0+, Docker 20.10+
