# 📋 MyKeyManager - Guida Installazione CasaOS

## 🎯 Installazione Build Locale (Consigliata)

**IMPORTANTE**: Il build locale risolve problemi di configurazione API endpoints che potrebbero verificarsi con le immagini Docker Hub pre-costruite.

### 1. Clona il Repository su CasaOS
```bash
# Accesso SSH al server CasaOS
ssh root@YOUR_CASAOS_IP

# Clona il repository completo
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
```

### 2. Esegui Installazione Build Locale
```bash
# Rendi eseguibile e lancia lo script
chmod +x install-casaos-local.sh
./install-casaos-local.sh
```

Lo script gestirà automaticamente:
- ✅ Verifica codice sorgente e prerequisiti
- ✅ Rilevamento architettura (ARM64/AMD64)  
- ✅ Configurazione IP del server automatica
- ✅ Build locale ottimizzato per CasaOS ARM64
- ✅ Configurazione corretta degli endpoint API
- ✅ Test di funzionamento completo

---

## 🚀 Installazione Rapida con Docker Hub (Alternativa)

### 1. Accesso SSH al Server CasaOS
```bash
ssh root@YOUR_CASAOS_IP
```

### 2. Installazione con Script Automatico
```bash
# Download e esecuzione script di installazione
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/install-casaos.sh
chmod +x install-casaos.sh
./install-casaos.sh
```

**NOTA**: Questo metodo usa immagini Docker Hub pre-costruite ma potrebbe avere problemi di configurazione API endpoints.

---

## 🔧 Installazione Manuale

### 1. Prerequisiti
Assicurati che CasaOS abbia Docker e Docker Compose installati:
```bash
docker --version
docker compose version
```

### 2. Download del Progetto
```bash
# Crea directory di lavoro
mkdir -p ~/mykeymanager
cd ~/mykeymanager

# Clona il repository
git clone https://github.com/Acwildweb/MyKeyManager.git .
```

### 3. Configurazione per CasaOS ARM64
```bash
# Usa la configurazione specifica per CasaOS
cp docker-compose.casaos.yml docker-compose.yml

# Configura IP del server automaticamente
CASAOS_IP=$(hostname -I | awk '{print $1}')
echo "IP Server rilevato: $CASAOS_IP"

# Esporta variabile per Docker Compose
export SERVER_IP="$CASAOS_IP"
```

### 4. Avvio Servizi con Build Locale
```bash
# Costruisci e avvia i container (build locale)
docker compose up -d --build

# Verifica stato
docker compose ps
```

---

## 🌐 Accesso all'Applicazione

Dopo l'installazione, accedi a:
- **Frontend**: `http://CASAOS_IP:3000`  ← **PORTA CORRETTA**
- **API**: `http://CASAOS_IP:8001`
- **API Docs**: `http://CASAOS_IP:8001/docs`
- **Health Check**: `http://CASAOS_IP:8001/health`

### 🔐 Credenziali Default
- **Email**: `admin@example.com`
- **Password**: `admin123`

---

## 📊 Monitoraggio e Gestione

### Comandi Utili
```bash
# Stato dei container
docker compose ps

# Log in tempo reale
docker compose logs -f

# Log di un singolo servizio
docker compose logs backend
docker compose logs frontend
docker compose logs database

# Riavvio servizi
docker compose restart

# Ferma tutti i servizi
docker compose down

# Rebuild completo
docker compose up -d --build --no-cache
```

### Controllo Salute Servizi
```bash
# Test database
docker compose exec database pg_isready -U mykeymanager

# Test backend API (sostituisci IP)
curl http://YOUR_CASAOS_IP:8001/health

# Test frontend (sostituisci IP)
curl -I http://YOUR_CASAOS_IP:3000
```

---

## 🔧 Risoluzione Problemi Specifici CasaOS

### Problema: Errore API Endpoints (Port 8080 vs 8001)
**Sintomo**: Login funziona ma cambio password fallisce con errore 422
**Causa**: Frontend chiama API su porta sbagliata (8080 invece di 8001)
**Soluzione**: Usa build locale invece di immagini Docker Hub

```bash
# Passa a build locale
cd ~/mykeymanager
git pull  # Assicurati di avere ultima versione
docker compose down
cp docker-compose.casaos.yml docker-compose.yml
docker compose up -d --build
```

### Problema: Platform Mismatch su ARM64
**Sintomo**: "linux/amd64 does not match linux/arm64/v8"
**Soluzione**: Usa docker-compose.casaos.yml che forza platform ARM64

```bash
# Verifica architettura
uname -m  # Dovrebbe mostrare aarch64 o arm64

# Usa configurazione ARM64
cp docker-compose.casaos.yml docker-compose.yml
docker compose build --no-cache
docker compose up -d
```

### Problema: Porta Occupata
```bash
# Controlla porte in uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :8001

# Se necessario, modifica porte in docker-compose.yml
```

### Problema: Database Non Avvia su ARM64
```bash
# Controlla log database
docker compose logs database

# Reset database se necessario
docker compose down -v
docker volume prune -f
docker compose up database -d
```

---

## 🔒 Configurazioni di Sicurezza

### 1. Modifica Password Predefinite
Edita il file `docker-compose.yml`:
```yaml
environment:
  # Database
  POSTGRES_PASSWORD: "TUA_PASSWORD_SICURA"
  
  # Backend
  SECRET_KEY: "TUA_CHIAVE_SEGRETA_LUNGA_E_COMPLESSA"
```

### 2. Configura CORS per il Tuo Dominio
```yaml
environment:
  ALLOWED_ORIGINS: "http://tuo-dominio.com:3000,https://tuo-dominio.com"
```

---

## 🗂️ Backup e Ripristino

### Backup Database
```bash
# Crea backup
docker compose exec database pg_dump -U mykeymanager mykeymanager > backup_$(date +%Y%m%d).sql

# Backup volume PostgreSQL
docker run --rm -v licenze-manager_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data
```

### Ripristino Database
```bash
# Ripristina da file SQL
docker compose exec -T database psql -U mykeymanager mykeymanager < backup_20241225.sql
```

---

## 📈 Ottimizzazione per CasaOS ARM64

### Configurazione Risorse Limitate
```yaml
# Nel docker-compose.yml, aggiungi per ogni servizio:
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
```

### Cache PostgreSQL Ottimizzata
```yaml
environment:
  POSTGRES_SHARED_BUFFERS: "64MB"
  POSTGRES_EFFECTIVE_CACHE_SIZE: "128MB" 
  POSTGRES_WORK_MEM: "2MB"
```

---

## 🔄 Aggiornamenti

Per aggiornare all'ultima versione:
```bash
cd ~/MyKeyManager  # o la directory dove hai clonato
git pull
docker compose down
docker compose up -d --build
```

---

## 📞 Supporto

- **Repository**: https://github.com/Acwildweb/MyKeyManager
- **Issues**: https://github.com/Acwildweb/MyKeyManager/issues
- **Troubleshooting CasaOS**: Usa sempre il build locale per evitare problemi di configurazione

---

**✅ Installazione completata con successo!**
Il tuo MyKeyManager è ora disponibile su `http://CASAOS_IP:3000`

**IMPORTANTE**: Per CasaOS ARM64, usa sempre il build locale (`install-casaos-local.sh`) per garantire la corretta configurazione degli endpoint API.

---

## 📊 Monitoraggio e Gestione

### Comandi Utili
```bash
# Stato dei container
docker compose ps

# Log in tempo reale
docker compose logs -f

# Log di un singolo servizio
docker compose logs backend
docker compose logs frontend
docker compose logs database

# Riavvio servizi
docker compose restart

# Ferma tutti i servizi
docker compose down

# Aggiornamento
git pull
docker compose up -d --build
```

### Controllo Salute Servizi
```bash
# Test database
docker compose exec database pg_isready -U mykeymanager

# Test backend API
curl http://localhost:8001/health

# Test frontend
curl -I http://localhost:8080
```

---

## 🔒 Configurazioni di Sicurezza

### 1. Modifica Password Predefinite
Edita il file `.env` o `docker-compose.yml`:
```bash
# Cambia la password di PostgreSQL
POSTGRES_PASSWORD: "TUA_PASSWORD_SICURA"

# Cambia la chiave segreta JWT
SECRET_KEY: "TUA_CHIAVE_SEGRETA_LUNGA_E_COMPLESSA"
```

### 2. Configura CORS per il Tuo Dominio
```bash
# Nel docker-compose.yml, sezione backend environment:
ALLOWED_ORIGINS: "http://tuo-dominio.com:8080,https://tuo-dominio.com"
```

### 3. Configura HTTPS (Opzionale)
Per produzione, usa un reverse proxy come Nginx o Traefik:
```bash
# Esempio con Nginx
server {
    listen 443 ssl;
    server_name tuo-dominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🗂️ Backup e Ripristino

### Backup Database
```bash
# Crea backup
docker compose exec database pg_dump -U mykeymanager mykeymanager > backup_$(date +%Y%m%d).sql

# Backup volume PostgreSQL
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data
```

### Ripristino Database
```bash
# Ripristina da file SQL
docker compose exec -T database psql -U mykeymanager mykeymanager < backup_20241225.sql

# Ripristina volume
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup_20241225.tar.gz -C /
```

---

## 🛠️ Risoluzione Problemi

### Problema: Errore di Architettura
Se vedi errori come "platform does not match":
```bash
# Forza ricostruzione per architettura corretta
docker compose build --no-cache --platform linux/amd64
```

### Problema: Porta Occupata
```bash
# Controlla chi usa la porta
netstat -tulpn | grep :8080
netstat -tulpn | grep :8001

# Cambia porte nel docker-compose.yml se necessario
ports:
  - "9080:80"  # Frontend su porta 9080
  - "9001:8000"  # Backend su porta 9001
```

### Problema: Database Non Avvia
```bash
# Controlla log database
docker compose logs database

# Reset completo database (ATTENZIONE: cancella tutti i dati)
docker compose down -v
docker compose up database -d
```

### Problema: Servizio Non Raggiungibile
```bash
# Verifica rete Docker
docker network ls
docker network inspect mykeymanager-network

# Verifica firewall CasaOS
iptables -L
ufw status
```

---

## 📈 Ottimizzazione Performance

### Per Server con Risorse Limitate
```bash
# Nel docker-compose.yml, aggiungi limiti risorse:
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
```

### Cache e Persistenza
```bash
# Ottimizza PostgreSQL
# Nel docker-compose.yml, sezione database environment:
POSTGRES_SHARED_BUFFERS: "128MB"
POSTGRES_EFFECTIVE_CACHE_SIZE: "256MB"
POSTGRES_WORK_MEM: "4MB"
```

---

## 📞 Supporto

- **Repository**: https://github.com/Acwildweb/MyKeyManager
- **Issues**: https://github.com/Acwildweb/MyKeyManager/issues
- **Documentazione**: https://github.com/Acwildweb/MyKeyManager/wiki

---

## 🔄 Aggiornamenti

Per aggiornare all'ultima versione:
```bash
cd ~/mykeymanager
git pull
docker compose down
docker compose up -d --build
```

---

**✅ Installazione completata con successo!**
Il tuo MyKeyManager è ora disponibile su `http://CASAOS_IP:8080`
