# 🌐 MyKeyManager - Guida Installazione Server Docker Esterno

> **Installazione completa su server Linux/Windows con Docker**

## 🎯 Prerequisiti Server

### Sistema Operativo Supportato:
- ✅ Ubuntu 20.04+ / Debian 11+
- ✅ CentOS 8+ / RHEL 8+
- ✅ Windows Server 2019+ con Docker Desktop
- ✅ Qualsiasi sistema con Docker Engine 20.10+

### Requisiti Hardware Minimi:
- **CPU**: 2 vCPU
- **RAM**: 4GB (8GB raccomandati)
- **Storage**: 20GB disponibili
- **Network**: Porte configurabili (default: 8080, 8001, 5432, 6379)

## 🚀 Installazione Rapida (1-Click)

### Metodo 1: Script Automatico (Raccomandato)

```bash
# Download e installazione automatica
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/install-server.sh
chmod +x install-server.sh
./install-server.sh
```

### Metodo 2: Installazione Manuale

```bash
# 1. Download files necessari
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.server.yml
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/.env.server.example

# 2. Copia e configura .env
cp .env.server.example .env
nano .env  # Modifica con i tuoi valori

# 3. Avvia i servizi
docker compose -f docker-compose.server.yml up -d
```

## ⚙️ Configurazione Porte Server

### File `.env` - Configurazione Principale

```bash
# =============== PORTE DEL SERVER ===============
# Modifica queste porte secondo il tuo firewall

FRONTEND_PORT=8080    # Interfaccia Web
BACKEND_PORT=8001     # API REST
DB_PORT=5432          # PostgreSQL
REDIS_PORT=6379       # Cache Redis

# =============== ACCESSO PUBBLICO ===============
# Sostituisci con IP/dominio del tuo server

# Per IP pubblico:
ALLOWED_ORIGINS=http://123.456.789.101:8080
CORS_ORIGINS=["http://123.456.789.101:8080"]
API_URL=http://123.456.789.101:8001/api

# Per dominio:
ALLOWED_ORIGINS=https://mykeymanager.yourdomain.com
CORS_ORIGINS=["https://mykeymanager.yourdomain.com"]
API_URL=https://mykeymanager.yourdomain.com/api
```

### Esempi Configurazione per Diversi Scenari

#### 🏠 Server Domestico (IP Locale)
```bash
FRONTEND_PORT=8080
BACKEND_PORT=8001
ALLOWED_ORIGINS=http://192.168.1.100:8080
API_URL=http://192.168.1.100:8001/api
```

#### 🌍 Server VPS (IP Pubblico)
```bash
FRONTEND_PORT=80
BACKEND_PORT=3001
ALLOWED_ORIGINS=http://123.456.789.101
API_URL=http://123.456.789.101:3001/api
```

#### 🏢 Server Aziendale (Dominio)
```bash
FRONTEND_PORT=443
BACKEND_PORT=8443
ALLOWED_ORIGINS=https://mykeymanager.company.com
API_URL=https://api.company.com/mykeymanager
```

## 🔧 Configurazione Rete Docker

### Rete Personalizzata

Nel file `docker-compose.server.yml`, puoi personalizzare la rete:

```yaml
networks:
  mykeymanager-network:
    name: ${NETWORK_NAME:-mykeymanager-network}
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
```

### Rete Esterna Esistente

Se hai già una rete Docker:

```yaml
networks:
  mykeymanager-network:
    external: true
    name: your-existing-network
```

## 🔒 Configurazione Sicurezza

### 1. Cambia Password e Chiavi

```bash
# Nel file .env
POSTGRES_PASSWORD=YourSecureDBPassword123!
SECRET_KEY=$(openssl rand -hex 32)
```

### 2. Firewall Configuration

```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp   # Frontend
sudo ufw allow 8001/tcp   # Backend API
sudo ufw deny 5432/tcp    # Blocca accesso diretto al DB
sudo ufw deny 6379/tcp    # Blocca accesso diretto a Redis

# CentOS/RHEL
firewall-cmd --permanent --add-port=8080/tcp
firewall-cmd --permanent --add-port=8001/tcp
firewall-cmd --reload
```

### 3. Reverse Proxy con Nginx

```nginx
# /etc/nginx/sites-available/mykeymanager
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoraggio e Gestione

### Comandi Utili

```bash
# Status servizi
docker compose -f docker-compose.server.yml ps

# Logs in tempo reale
docker compose -f docker-compose.server.yml logs -f

# Restart servizio specifico
docker compose -f docker-compose.server.yml restart backend

# Stop completo
docker compose -f docker-compose.server.yml down

# Aggiornamento immagini
docker compose -f docker-compose.server.yml pull
docker compose -f docker-compose.server.yml up -d
```

### Health Check

```bash
# Test connettività
curl http://your-server:8001/health
curl http://your-server:8080

# Test API
curl http://your-server:8001/api/v1/health
```

## 💾 Backup e Persistenza

### Backup Automatico Database

```bash
# Script backup
#!/bin/bash
BACKUP_DIR="/backups/mykeymanager"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec mykeymanager-db pg_dump -U mykeymanager mykeymanager > \
  "$BACKUP_DIR/db_backup_$DATE.sql"

# Mantieni solo ultimi 7 backup
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

### Volumi Persistenti

I dati sono salvati automaticamente in volumi Docker:
- `mykeymanager_postgres_data`: Database
- `mykeymanager_redis_data`: Cache

## 🔄 Aggiornamento

```bash
# 1. Backup dati
docker compose -f docker-compose.server.yml exec db pg_dump -U mykeymanager mykeymanager > backup.sql

# 2. Aggiorna immagini
docker compose -f docker-compose.server.yml pull

# 3. Riavvia servizi
docker compose -f docker-compose.server.yml up -d
```

## 🆘 Troubleshooting

### Problemi Comuni

#### 1. Errore "port already in use"
```bash
# Cambia porte nel file .env
FRONTEND_PORT=8090
BACKEND_PORT=8091
```

#### 2. Backend non raggiungibile
```bash
# Controlla CORS nel .env
ALLOWED_ORIGINS=http://YOUR_SERVER_IP:PORT
```

#### 3. Database non si connette
```bash
# Verifica password nel .env
POSTGRES_PASSWORD=your_password
# Controlla logs
docker logs mykeymanager-db
```

### Log Debugging

```bash
# Logs dettagliati
docker compose -f docker-compose.server.yml logs --tail 100

# Logs servizio specifico
docker logs mykeymanager-backend --tail 50
```

## 📞 Supporto

- **Repository**: https://github.com/Acwildweb/MyKeyManager
- **Docker Hub**: https://hub.docker.com/r/acwild/mykeymanager-backend
- **Issues**: https://github.com/Acwildweb/MyKeyManager/issues

---

**Versione Guida**: v1.1.3  
**Compatibilità**: Docker Engine 20.10+, Docker Compose v2+  
**Ultimo Aggiornamento**: 23 Agosto 2025
