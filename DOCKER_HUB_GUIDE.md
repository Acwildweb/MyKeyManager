# 🐳 Guida Docker Hub - MyKeyManager

## 📋 Panoramica
Questa guida ti aiuta a pubblicare MyKeyManager su Docker Hub per facilitare il deployment per gli utenti finali.

## 🚀 Pubblicazione su Docker Hub

### 1. Prerequisiti
- Account Docker Hub: https://hub.docker.com
- Docker installato localmente
- Progetto MyKeyManager pronto

### 2. Setup Account Docker Hub
```bash
# Login a Docker Hub
docker login

# Inserisci le tue credenziali quando richiesto
```

### 3. Modifica Username
Prima di procedere, modifica lo username Docker Hub nello script:

**File: `build-and-push.sh`**
```bash
# Cambia questa riga con il tuo username Docker Hub
DOCKER_USERNAME="tuousername"  # Sostituisci con il tuo username
```

### 4. Build e Push Automatico
```bash
# Dalla directory root del progetto
cd "/Users/gianfrancoringo/Desktop/licenze-manager"

# Esegui lo script di build e push
./build-and-push.sh v1.1.0

# Oppure per version 'latest'
./build-and-push.sh
```

### 5. Verifica su Docker Hub
Dopo il push, verifica che le immagini siano disponibili:
- https://hub.docker.com/r/[username]/mykeymanager-backend
- https://hub.docker.com/r/[username]/mykeymanager-frontend

## 📦 Utilizzo per gli Utenti Finali

### Deployment Semplificato
Gli utenti potranno deployare MyKeyManager con un comando:

```bash
# Download del docker-compose
curl -O https://raw.githubusercontent.com/[username]/MyKeyManager/main/docker-compose.hub.yml

# Configurazione environment
cp env.template .env
# Modifica .env con le proprie configurazioni

# Avvio applicazione
docker-compose -f docker-compose.hub.yml up -d
```

### Configurazione .env
```bash
# Configurazioni minime richieste
SECRET_KEY=your-secure-secret-key-here
POSTGRES_PASSWORD=your-secure-db-password
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🎯 Vantaggi Docker Hub

### Per Te (Sviluppatore)
- ✅ Distribuzione centralizzata
- ✅ Versioning automatico
- ✅ Build pipeline automatizzata
- ✅ Download statistics
- ✅ Community feedback

### Per gli Utenti
- ✅ Deploy con un comando
- ✅ No build locale richiesto
- ✅ Aggiornamenti semplificati
- ✅ Consistent environment
- ✅ Faster deployment

## 📊 Gestione Versioni

### Tagging Strategy
```bash
# Versione specifica
./build-and-push.sh v1.1.0

# Latest (sempre punta all'ultima versione)
./build-and-push.sh latest

# Release candidate
./build-and-push.sh v1.2.0-rc1
```

### Aggiornamento Versioni
1. Aggiorna `frontend/src/config/version.ts`
2. Esegui build e push con nuova versione
3. Aggiorna `docker-compose.hub.yml` con nuovo tag
4. Commit e push su GitHub

## 🔧 Manutenzione

### Aggiornamento Immagini
```bash
# Build e push nuova versione
./build-and-push.sh v1.2.0

# Aggiorna docker-compose.hub.yml
# Cambia i tag delle immagini dalla v1.1.0 alla v1.2.0
```

### Cleanup Locale
```bash
# Rimuovi immagini locali vecchie
docker system prune -a

# Rimuovi solo immagini specifiche
docker rmi acwildweb/mykeymanager-backend:old-version
```

## 📚 Documentazione Docker Hub

### README per Repository Docker Hub
Crea un README.md ottimizzato per Docker Hub con:
- Quick start guide
- Environment variables
- Volume mapping
- Network configuration
- Troubleshooting

### Esempio README Docker Hub
```markdown
# MyKeyManager

Sistema di gestione licenze software con React + FastAPI

## Quick Start
\`\`\`bash
curl -O https://raw.githubusercontent.com/username/MyKeyManager/main/docker-compose.hub.yml
docker-compose -f docker-compose.hub.yml up -d
\`\`\`

## Access
- Frontend: http://localhost
- API: http://localhost:8000/docs
- Default credentials: admin / ChangeMe!123

## Configuration
See .env.template for all configuration options.
```

## 🎉 Pubblicazione Completata

Dopo aver seguito questa guida:
1. ✅ Immagini Docker pubblicate su Docker Hub
2. ✅ Docker Compose semplificato per utenti
3. ✅ Documentazione per deployment
4. ✅ Sistema di versioning automatico
5. ✅ Guida per utenti finali

Gli utenti potranno ora deployare MyKeyManager facilmente usando le tue immagini pre-built da Docker Hub!
