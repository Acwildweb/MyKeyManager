# 📦 MyKeyManager All-in-One Container

> **Container unico con tutti i servizi integrati**

[![Docker](https://img.shields.io/badge/docker-single--container-blue.svg)](docker-compose.all-in-one.yml)
[![Size](https://img.shields.io/badge/approach-monolithic-orange.svg)](Dockerfile.all-in-one)
[![Services](https://img.shields.io/badge/services-5--in--1-green.svg)](#servizi-inclusi)

Container monolitico che include **tutti i servizi** in un'unica immagine Docker per deployment semplificato e demo.

---

## 🎯 Quando Usare All-in-One

### ✅ Casi d'Uso Ideali
- **Demo e testing** rapido
- **Deployment semplificato** su sistemi con risorse limitate
- **Prototipazione** e development personale
- **Ambienti isolati** o air-gapped
- **Training e workshop**

### ❌ Casi d'Uso Sconsigliati
- **Produzione scalabile** (preferire architettura microservizi)
- **High availability** (single point of failure)
- **Scaling orizzontale** (difficile scalare singoli componenti)
- **Team development** distribuito

---

## 🏗️ Servizi Inclusi

Il container all-in-one include:

| Servizio | Tecnologia | Porta Interna | Descrizione |
|----------|------------|---------------|-------------|
| **Frontend** | Nginx | 80 | Interfaccia React ottimizzata |
| **Backend** | FastAPI + Uvicorn | 8000 | API REST con documentazione |
| **Database** | PostgreSQL 14 | 5432 | Database relazionale principale |
| **Cache** | Redis | 6379 | Cache e sessioni |
| **SMTP** | Postfix | 25 | Mail server locale |

### 🔧 Processo Manager
- **Supervisor** gestisce tutti i servizi
- **Auto-restart** automatico in caso di crash
- **Logging centralizzato** per tutti i componenti
- **Health checks** integrati

---

## ⚡ Quick Start

### 1. Configurazione Automatica
```bash
# Setup completo automatico
./configure-all-in-one.sh

# O configurazione interattiva
./configure-all-in-one.sh --configure
```

### 2. Avvio Manuale
```bash
# Build e deploy
docker-compose -f docker-compose.all-in-one.yml --env-file .env.all-in-one up -d

# Verifica stato
docker-compose -f docker-compose.all-in-one.yml ps
```

### 3. Accesso Applicazione
- **Frontend**: http://localhost (porta configurata)
- **API**: http://localhost/api
- **Docs**: http://localhost/docs
- **Health**: http://localhost/health

**Credenziali default**: `admin` / `ChangeMe!123`

---

## 🔧 Configurazione

### Environment Variables

Il file `.env.all-in-one` contiene tutte le configurazioni:

```env
# Porta esterna del container
MYKEYMANAGER_PORT=80

# Database (interno al container)
POSTGRES_PASSWORD=generated_secure_password

# Sicurezza
SECRET_KEY=generated_secure_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# SMTP Locale (Postfix)
SMTP_HOST=localhost
SMTP_PORT=25
EMAIL_FROM=noreply@mykeymanager.local

# SMTP Esterno (opzionale)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password

# Applicazione
DEBUG=false
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:80
TZ=Europe/Rome
```

### 🎚️ Configurazione Porte

Il sistema rileva automaticamente conflitti di porte:

```bash
# Script intelligente
./configure-all-in-one.sh

# Porta 80 occupata? Suggerisce alternative:
# ⚠️ Porta 80 già in uso!
# ℹ️ Suggerisco porta alternativa: 8080
# Vuoi usare la porta 8080? [Y/n]:
```

### 🔧 Override Personalizzato

Puoi creare un override per configurazioni specifiche:

```yaml
# docker-compose.all-in-one.override.yml
version: '3.8'

services:
  mykeymanager-all-in-one:
    ports:
      - "8080:80"  # Porta personalizzata
    
    environment:
      - DEBUG=true  # Debug abilitato
      
    volumes:
      - ./custom-data:/app/data  # Volume custom
```

Avvio con override:
```bash
docker-compose -f docker-compose.all-in-one.yml -f docker-compose.all-in-one.override.yml up -d
```

---

## 🚀 Gestione Container

### Script di Configurazione

```bash
# Configurazione completa
./configure-all-in-one.sh --configure

# Solo build
./configure-all-in-one.sh --build

# Solo deploy  
./configure-all-in-one.sh --deploy

# Controllo stato
./configure-all-in-one.sh --status

# Visualizza logs
./configure-all-in-one.sh --logs

# Health check
./configure-all-in-one.sh --health

# Stop container
./configure-all-in-one.sh --stop
```

### Comandi Docker Compose

```bash
# Avvio
docker-compose -f docker-compose.all-in-one.yml up -d

# Stop
docker-compose -f docker-compose.all-in-one.yml down

# Logs
docker-compose -f docker-compose.all-in-one.yml logs -f

# Rebuild
docker-compose -f docker-compose.all-in-one.yml up --build -d

# Status servizi
docker-compose -f docker-compose.all-in-one.yml ps
```

### Comandi Container

```bash
# Accesso shell container
docker exec -it mykeymanager-all-in-one bash

# Health check manuale
docker exec mykeymanager-all-in-one /app/scripts/health.sh

# Restart singolo servizio (tramite supervisor)
docker exec mykeymanager-all-in-one supervisorctl restart backend
docker exec mykeymanager-all-in-one supervisorctl restart nginx

# Controllo status supervisor
docker exec mykeymanager-all-in-one supervisorctl status
```

---

## 🔍 Troubleshooting

### Verifica Servizi

```bash
# Health check completo
./configure-all-in-one.sh --health

# Output esempio:
# 🔍 MyKeyManager Health Check
# ==========================
# ✅ PostgreSQL: Running
# ✅ Redis: Running  
# ✅ Backend API: Running
# ✅ Frontend (Nginx): Running
# 🎉 All services are healthy!
```

### Debug Singoli Servizi

```bash
# Logs specifici per servizio
docker exec mykeymanager-all-in-one tail -f /app/logs/backend.out.log
docker exec mykeymanager-all-in-one tail -f /app/logs/nginx.err.log
docker exec mykeymanager-all-in-one tail -f /app/logs/postgresql.out.log

# Status supervisor
docker exec mykeymanager-all-in-one supervisorctl status

# Restart servizio problematico
docker exec mykeymanager-all-in-one supervisorctl restart [nome_servizio]
```

### Problemi Comuni

#### 🔧 Porta Occupata
```bash
# Controlla processo che usa la porta
lsof -i :80

# Riconfigura con porta diversa
./configure-all-in-one.sh --configure
```

#### 🗄️ Database Non Accessibile
```bash
# Verifica PostgreSQL
docker exec mykeymanager-all-in-one sudo -u postgres pg_isready

# Restart database
docker exec mykeymanager-all-in-one supervisorctl restart postgresql
```

#### 🚀 Backend Non Risponde
```bash
# Test API diretta
docker exec mykeymanager-all-in-one curl -s http://localhost:8000/health

# Restart backend
docker exec mykeymanager-all-in-one supervisorctl restart backend
```

#### 🎨 Frontend Non Carica
```bash
# Test Nginx
docker exec mykeymanager-all-in-one curl -s http://localhost:80

# Restart nginx
docker exec mykeymanager-all-in-one supervisorctl restart nginx
```

---

## 📊 Performance e Risorse

### Requisiti Minimi

| Risorsa | Minimo | Raccomandato |
|---------|--------|--------------|
| **RAM** | 1GB | 2GB |
| **CPU** | 1 core | 2 cores |
| **Disk** | 5GB | 10GB |
| **Network** | 1 porta | Port range |

### Configurazione Risorse

Nel `docker-compose.all-in-one.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 2G      # Limite massimo RAM
      cpus: '1.0'     # Limite CPU cores
    reservations:
      memory: 512M    # RAM garantita
      cpus: '0.25'    # CPU garantita
```

### Monitoring

```bash
# Utilizzo risorse container
docker stats mykeymanager-all-in-one

# Spazio disco utilizzato
docker exec mykeymanager-all-in-one df -h

# Processi attivi
docker exec mykeymanager-all-in-one ps aux
```

---

## 🔄 Backup e Restore

### Backup Dati

```bash
# Backup database
docker exec mykeymanager-all-in-one sudo -u postgres pg_dump mykeymanager > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup volume completo
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Backup logs
docker cp mykeymanager-all-in-one:/app/logs ./logs_backup_$(date +%Y%m%d_%H%M%S)
```

### Restore Dati

```bash
# Restore database
cat backup_20250822_120000.sql | docker exec -i mykeymanager-all-in-one sudo -u postgres psql mykeymanager

# Restore volume
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres_backup_20250822_120000.tar.gz -C /data
```

---

## 🔧 Customizzazione

### Configurazioni Personalizzate

Puoi aggiungere configurazioni custom nel volume:

```bash
# Crea directory configurazioni
mkdir -p custom-config

# Configurazione Nginx personalizzata
cat > custom-config/nginx.conf << EOF
# Custom nginx configuration
client_max_body_size 100M;
proxy_read_timeout 300s;
EOF

# Configurazione backend personalizzata  
cat > custom-config/backend.env << EOF
# Custom backend environment
CUSTOM_FEATURE_ENABLED=true
MAX_UPLOAD_SIZE=104857600
EOF
```

Aggiorna il docker-compose per usare le configurazioni:

```yaml
volumes:
  - ./custom-config:/app/config:ro
```

### Script Personalizzati

```bash
# Crea script custom
mkdir -p custom-scripts

cat > custom-scripts/custom-init.sh << EOF
#!/bin/bash
echo "🎨 Eseguo inizializzazione personalizzata..."
# I tuoi comandi personalizzati qui
EOF

chmod +x custom-scripts/custom-init.sh
```

---

## 🆚 Confronto Architetture

### All-in-One vs Microservizi

| Aspetto | All-in-One | Microservizi |
|---------|------------|--------------|
| **Simplicità Deploy** | ✅ Molto alta | ❌ Complessa |
| **Scalabilità** | ❌ Limitata | ✅ Eccellente |
| **Risorse** | ✅ Minime | ❌ Maggiori |
| **Manutenzione** | ✅ Semplice | ❌ Complessa |
| **Debugging** | ✅ Centralizzato | ❌ Distribuito |
| **High Availability** | ❌ Single Point | ✅ Ridondanza |
| **Team Development** | ❌ Conflitti | ✅ Isolamento |

### Quando Scegliere All-in-One

```bash
# ✅ Usa All-in-One per:
- Demo rapide
- Prototipazione  
- Sviluppo locale
- Risorse limitate
- Setup semplificato

# ❌ Evita All-in-One per:
- Produzione critica
- Team grandi
- Scaling requirements
- High availability
- Performance extreme
```

---

## 📚 Documentazione Aggiuntiva

### File di Configurazione
- `Dockerfile.all-in-one` - Definizione container
- `docker-compose.all-in-one.yml` - Orchestrazione
- `configure-all-in-one.sh` - Script configurazione

### Logging
- `/app/logs/` - Directory logs nel container
- `supervisord.log` - Log supervisor principale
- `backend.out.log` - Output backend FastAPI
- `nginx.err.log` - Errori Nginx
- `postgresql.out.log` - Output PostgreSQL

### Security
- Container non-root user
- Services isolation
- Firewall interno
- Minimal base image

---

## 🤝 Supporto

### Debugging
```bash
# Shell interattiva
docker exec -it mykeymanager-all-in-one bash

# Supervisor control
docker exec -it mykeymanager-all-in-one supervisorctl

# System info
docker exec mykeymanager-all-in-one cat /etc/os-release
```

### Aiuto e Supporto
- **GitHub Issues**: [Segnala problemi](https://github.com/Acwildweb/MyKeyManager/issues)
- **Email**: info@acwild.it
- **Logs**: Includi sempre logs nel report bug

---

**MyKeyManager All-in-One** - 📦 Tutto in un container per deployment semplificato!

---

**© 2025 A.c. wild s.a.s** - Powered by Docker & Supervisor
