# 🚀 MyKeyManager - Installazione Docker Semplificata

## 📋 Prerequisiti

- **Docker** e **Docker Compose** installati
- **Porte libere**: 8080 (frontend), 8001 (backend), 5432 (database)
- **RAM minima**: 1GB
- **Spazio disco**: 2GB

## ⚡ Installazione Rapida

### Metodo 1: Script Automatico (Raccomandato)

```bash
# Download e installazione in un comando
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/install.sh
chmod +x install.sh
./install.sh
```

### Metodo 2: Manuale

```bash
# 1. Download file necessari
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/.env.production

# 2. Configurazione
cp .env.production .env
nano .env  # Modifica la configurazione

# 3. Avvio
docker compose up -d
```

## 🔧 Configurazione Base

Modifica il file `.env` con i tuoi valori:

```env
# Porte (cambia se occupate)
FRONTEND_PORT=8080
BACKEND_PORT=8001
DATABASE_PORT=5432

# Password database (CAMBIA QUESTA!)
POSTGRES_PASSWORD=TuaPasswordSicura123!

# Chiave segreta (CAMBIA QUESTA!)
SECRET_KEY=TuaChiaveSegretaSuperSicura2024

# IP del tuo server (importante per accesso remoto)
ALLOWED_ORIGINS=http://localhost:8080,http://TUO_IP:8080
```

## 🌐 Accesso

Dopo l'installazione:

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8001
- **Documentazione**: http://localhost:8001/docs

### Credenziali Default
- **Username**: `admin`
- **Password**: `ChangeMe!123`

## 🔧 Comandi Gestione

```bash
# Stato servizi
docker compose ps

# Logs
docker compose logs

# Riavvio
docker compose restart

# Stop
docker compose down

# Stop con cancellazione dati
docker compose down -v
```

## 🌍 Accesso da Rete Esterna

Per accedere da altri dispositivi:

1. **Trova l'IP del server**:
   ```bash
   hostname -I
   ```

2. **Modifica `.env`**:
   ```env
   ALLOWED_ORIGINS=http://localhost:8080,http://192.168.1.100:8080
   ```

3. **Riavvia**:
   ```bash
   docker compose restart backend
   ```

4. **Accedi da**: http://IP_SERVER:8080

## ❗ Risoluzione Problemi

### Permessi Docker
```bash
# Se errori di permessi
sudo usermod -aG docker $USER
# Poi riavvia il terminale
```

### Porte Occupate
```bash
# Cambia porte nel file .env
FRONTEND_PORT=9080
BACKEND_PORT=9001
DATABASE_PORT=5433
```

### Reset Completo
```bash
# Cancella tutto e ricomincia
docker compose down -v
docker system prune -f
./install.sh
```

## 🔐 Sicurezza Produzione

Prima di usare in produzione:

1. **Cambia password**:
   - Password database in `.env`
   - Chiave segreta in `.env`
   - Password admin nell'interfaccia web

2. **Configura firewall**:
   ```bash
   # Apri solo porte necessarie
   ufw allow 8080
   ufw allow 8001
   ```

3. **Usa HTTPS** con reverse proxy (Nginx/Traefik)

4. **Backup regolari**:
   ```bash
   # Backup database
   docker exec mykeymanager-db pg_dump -U mykeymanager mykeymanager > backup.sql
   ```

## 📞 Supporto

- **Logs dettagliati**: `docker compose logs --follow`
- **Test connettività**: `curl http://localhost:8001/health`
- **Versione**: Controlla che usi immagini v1.1.2+ su Docker Hub

---

✅ **Versione semplificata e testata** - Funziona su qualsiasi sistema Docker!
