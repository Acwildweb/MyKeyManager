# 🚀 MyKeyManager - Deployment Server ARM64 Esterni

## 🎯 Panoramica

Questa guida è specifica per il deployment di MyKeyManager su **server Linux ARM64 esterni** (es: VPS, server dedicati, Raspberry Pi 4/5, server cloud ARM64).

## 📋 Prerequisiti

### Sistema Operativo
- **Linux ARM64** (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- **2GB RAM minimo** (4GB consigliato)
- **20GB spazio disco** (per applicazione + database)
- **Connessione internet** stabile

### Software Richiesto
```bash
# Docker (versione 20.10+)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose v2
sudo apt update && sudo apt install docker-compose-plugin

# Verifica installazione
docker --version
docker compose version
```

## 🚀 Installazione Automatica (Consigliata)

### 1. Clone del Repository
```bash
# Su server ARM64
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
```

### 2. Esecuzione Script Automatico
```bash
# Rendi eseguibile lo script
chmod +x install-arm64-server.sh

# Lancia installazione
./install-arm64-server.sh
```

Lo script gestisce automaticamente:
- ✅ Verifica architettura ARM64
- ✅ Controllo prerequisiti Docker
- ✅ Rilevamento IP del server
- ✅ Configurazione dominio (opzionale)
- ✅ Build ottimizzato per ARM64
- ✅ Test di funzionamento completo

## 🔧 Installazione Manuale

### 1. Preparazione Environment
```bash
# Configura IP del server
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# Copia configurazione ARM64
cp docker-compose.arm64.yml docker-compose.yml

# Sostituisci placeholder con IP reale
sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml
```

### 2. Deploy Servizi
```bash
# Build e avvio (processo lungo - 10-15 min)
docker compose up -d --build

# Verifica stato
docker compose ps
```

### 3. Test Funzionamento
```bash
# Test database
docker compose exec database pg_isready -U mykeymanager

# Test backend API
curl http://$SERVER_IP:8001/health

# Test frontend
curl -I http://$SERVER_IP:3000
```

## 🌐 Accesso all'Applicazione

Dopo il deployment:
- **Frontend**: `http://SERVER_IP:3000`
- **Backend API**: `http://SERVER_IP:8001`
- **API Documentation**: `http://SERVER_IP:8001/docs`
- **Health Check**: `http://SERVER_IP:8001/health`

### Credenziali Default
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **⚠️ IMPORTANTE**: Cambia immediatamente le credenziali!

## 🔒 Configurazione Sicurezza

### 1. Firewall Configuration
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 3000/tcp comment "MyKeyManager Frontend"
sudo ufw allow 8001/tcp comment "MyKeyManager API"
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8001/tcp
sudo firewall-cmd --reload
```

### 2. HTTPS con Nginx (Consigliato)
```bash
# Installa Nginx
sudo apt install nginx

# Configurazione base
sudo tee /etc/nginx/sites-available/mykeymanager << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Abilita sito
sudo ln -s /etc/nginx/sites-available/mykeymanager /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Configurazioni Sicurezza Database
```bash
# Nel docker-compose.yml, modifica:
environment:
  POSTGRES_PASSWORD: "YOUR_STRONG_PASSWORD_HERE"
  SECRET_KEY: "YOUR_SECRET_JWT_KEY_64_CHARS_MINIMUM"
```

## 📊 Monitoring e Manutenzione

### Comandi Essenziali
```bash
# Stato servizi
docker compose ps

# Log in tempo reale
docker compose logs -f

# Log singolo servizio
docker compose logs backend -f

# Statistiche risorse
docker stats

# Spazio disco
df -h
docker system df
```

### Health Monitoring
```bash
# Script di monitoraggio automatico
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== MyKeyManager Health Check ==="
echo "Database: $(docker compose exec -T database pg_isready -U mykeymanager)"
echo "Backend: $(curl -s http://localhost:8001/health || echo 'FAILED')"
echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"
echo "Disk usage: $(df -h / | tail -1 | awk '{print $5}')"
echo "Memory: $(free -h | grep '^Mem' | awk '{print $3"/"$2}')"
EOF

chmod +x monitor.sh
./monitor.sh
```

## 💾 Backup e Restore

### Backup Database
```bash
# Backup SQL
docker compose exec database pg_dump -U mykeymanager mykeymanager > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup volume completo
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/postgres_volume_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

### Restore Database
```bash
# Restore da SQL
docker compose exec -T database psql -U mykeymanager mykeymanager < backup_20241225_120000.sql

# Restore volume completo
docker compose down
docker volume rm mykeymanager_postgres_data
docker volume create mykeymanager_postgres_data
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/postgres_volume_20241225_120000.tar.gz -C /
docker compose up -d
```

### Backup Automatico (Crontab)
```bash
# Aggiungi a crontab
crontab -e

# Backup giornaliero alle 3:00 AM
0 3 * * * cd /path/to/MyKeyManager && docker compose exec -T database pg_dump -U mykeymanager mykeymanager > /backup/mykeymanager_$(date +\%Y\%m\%d).sql
```

## 🔄 Aggiornamenti

### Update Standard
```bash
cd MyKeyManager
git pull origin main
docker compose down
docker compose up -d --build
```

### Update con Backup Preventivo
```bash
# Backup pre-update
docker compose exec database pg_dump -U mykeymanager mykeymanager > backup_pre_update.sql

# Update
git pull origin main
docker compose down
docker compose up -d --build

# Verifica post-update
curl http://localhost:8001/health
```

## 🚨 Troubleshooting

### Problemi Comuni

**1. Build ARM64 lento**
```bash
# Normale su ARM64 - il primo build può richiedere 10-15 minuti
# Verifica progresso con:
docker compose logs --tail=50
```

**2. Out of Memory**
```bash
# Verifica memoria
free -h
# Aggiungi swap se necessario
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**3. Porte occupate**
```bash
# Verifica porte in uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :8001

# Cambia porte nel docker-compose.yml se necessario
```

**4. Performance ARM64**
```bash
# Ottimizzazioni nel docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
```

### Log Analysis
```bash
# Log dettagliati per debug
docker compose logs backend --tail=100 | grep ERROR
docker compose logs frontend --tail=100 | grep error
docker compose logs database --tail=50
```

## 📈 Ottimizzazioni Performance ARM64

### 1. Configurazione PostgreSQL
```yaml
# Nel docker-compose.yml
environment:
  POSTGRES_SHARED_BUFFERS: "256MB"      # Per ARM64 con 4GB RAM
  POSTGRES_EFFECTIVE_CACHE_SIZE: "512MB"
  POSTGRES_WORK_MEM: "8MB"
  POSTGRES_MAINTENANCE_WORK_MEM: "64MB"
  POSTGRES_CHECKPOINT_SEGMENTS: "8"
```

### 2. Ottimizzazioni Sistema
```bash
# Ottimizzazioni kernel per ARM64
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
sysctl -p
```

### 3. Resource Limits
```yaml
# Limiti risorse ottimizzati per ARM64
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
    reservations:
      memory: 256M
      cpus: '0.25'
```

## 📞 Supporto

- **Repository**: https://github.com/Acwildweb/MyKeyManager
- **Issues**: https://github.com/Acwildweb/MyKeyManager/issues
- **Wiki**: https://github.com/Acwildweb/MyKeyManager/wiki

---

**✅ Guida completa per deployment MyKeyManager su server ARM64 esterni**
