# 🚀 MyKeyManager - Guida Completa Deployment

> **3 modalità di deployment per ogni esigenza: velocità, semplicità, scalabilità**

## 🎯 Quick Decision Guide

### Cosa vuoi fare?

#### 🔥 "Voglio testare subito in 10 secondi"
```bash
curl -o docker-compose.hub-all-in-one.yml https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.hub-all-in-one.yml
echo "MYKEYMANAGER_PORT=8080" > .env.all-in-one
docker-compose -f docker-compose.hub-all-in-one.yml --env-file .env.all-in-one up -d
```
→ **Docker Hub All-in-One** - Immagine precompilata

#### 📦 "Voglio semplicità massima con controllo"
```bash
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
./configure-all-in-one.sh
```
→ **All-in-One Build** - Un container con tutto

#### 🏭 "Voglio produzione scalabile"
```bash
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
./configure-ports.sh
docker-compose -f docker-compose.hub.yml up -d
```
→ **Microservizi** - Container separati ottimizzati

---

## 📊 Confronto Modalità

| Aspetto | Docker Hub All-in-One | All-in-One Build | Microservizi |
|---------|----------------------|-------------------|--------------|
| **Velocità Setup** | 🥇 10 secondi | 🥈 30 secondi | 🥉 2-3 minuti |
| **Semplicità** | 🥇 Massima | 🥈 Alta | 🥉 Media |
| **Controllo** | 🥉 Limitato | 🥈 Medio | 🥇 Completo |
| **Scalabilità** | 🥉 Limitata | 🥉 Limitata | 🥇 Ottima |
| **Produzione** | ⚠️ Demo/Test | ⚠️ Demo/Test | ✅ Raccomandato |
| **Risorse** | 🥇 Minime | 🥈 Moderate | 🥉 Maggiori |

---

## 🔥 Opzione 1: Docker Hub All-in-One (Velocità Massima)

### ⚡ Setup Ultra-Rapido
```bash
# 1. Download configurazione (10s)
curl -o docker-compose.hub-all-in-one.yml \
  https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.hub-all-in-one.yml

# 2. Configurazione porta (opzionale)
echo "MYKEYMANAGER_PORT=8080" > .env.all-in-one

# 3. Deploy istantaneo
docker-compose -f docker-compose.hub-all-in-one.yml --env-file .env.all-in-one up -d

# 4. Accesso immediato
open http://localhost:8080
```

### 🎯 Vantaggi
- ✅ **Zero build time** - immagine precompilata
- ✅ **Deploy in 10 secondi** dalla rete
- ✅ **Perfetto per workshop** e demo
- ✅ **Non serve Git** o repository locale

### ⚠️ Limitazioni
- ❌ Dipende dalla connessione internet
- ❌ Meno controllo su customizzazioni
- ❌ Immagine più grande da scaricare

### 🔧 Configurazione Avanzata
```bash
# File .env.all-in-one personalizzato
cat > .env.all-in-one << EOF
MYKEYMANAGER_PORT=8080
SECRET_KEY=your-custom-secret
POSTGRES_PASSWORD=secure-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EOF
```

---

## 📦 Opzione 2: All-in-One Build Locale (Semplicità Massima)

### 🛠️ Setup Guidato
```bash
# 1. Clone repository
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager

# 2. Test compatibilità (opzionale)
./test-all-in-one.sh

# 3. Configurazione automatica
./configure-all-in-one.sh

# 4. Accesso (porta auto-configurata)
# URLs mostrati dallo script
```

### 🎯 Vantaggi
- ✅ **Controllo completo** del build
- ✅ **Configurazione intelligente** porte
- ✅ **Customizzazioni possibili** 
- ✅ **Funziona offline** dopo build

### ⚠️ Limitazioni
- ❌ Build time ~8-12 minuti
- ❌ Richiede più spazio disco
- ❌ Serve repository Git locale

### 🔧 Gestione Container
```bash
# Status e controllo
./configure-all-in-one.sh --status
./configure-all-in-one.sh --logs
./configure-all-in-one.sh --health

# Debug
docker exec -it mykeymanager-all-in-one bash
docker exec mykeymanager-all-in-one supervisorctl status
```

---

## 🏭 Opzione 3: Microservizi (Produzione Scalabile)

### 🚀 Setup Produzione
```bash
# 1. Clone repository
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager

# 2. Configurazione porte intelligente
./configure-ports.sh

# 3. Deploy microservizi con Docker Hub
docker-compose -f docker-compose.hub.yml up -d

# 4. Verifica deploy
docker-compose -f docker-compose.hub.yml ps
```

### 🎯 Vantaggi
- ✅ **Scalabilità orizzontale** per singoli servizi
- ✅ **Fault tolerance** - servizi isolati
- ✅ **Monitoring granulare** per componente
- ✅ **Update indipendenti** dei servizi
- ✅ **Load balancing** possibile

### 🔧 Gestione Avanzata
```bash
# Scaling specifico
docker-compose -f docker-compose.hub.yml up -d --scale backend=3

# Update singolo servizio
docker-compose -f docker-compose.hub.yml pull backend
docker-compose -f docker-compose.hub.yml up -d backend

# Monitoring
docker-compose -f docker-compose.hub.yml logs -f backend
docker-compose -f docker-compose.hub.yml exec backend /bin/bash
```

---

## 🔧 Sistema Gestione Porte Intelligente

### Auto-Detection Conflitti
Tutti i metodi includono **rilevamento automatico** conflitti:

```bash
# Script rileva automaticamente:
⚠️ Frontend: Porta 80 occupata da Apache
✅ Suggerisco porta 8080 (libera)

⚠️ Backend: Porta 8000 occupata da Python
✅ Suggerisco porta 8001 (libera)

✅ PostgreSQL: Porta 5432 disponibile
✅ Redis: Porta 6379 disponibile
```

### Configurazione Manuale
```bash
# Override porte specifiche
export FRONTEND_PORT=9080
export BACKEND_PORT=9001
export POSTGRES_PORT=9432
export REDIS_PORT=9379

# Applica configurazione
docker-compose -f [compose-file] up -d
```

### Verifica Porte
```bash
# Check porte occupate
lsof -i :80 -i :8000 -i :5432 -i :6379

# Test connettività
curl http://localhost:8080                    # Frontend
curl http://localhost:8001/health            # Backend
curl http://localhost:8001/docs              # API Docs
```

---

## 🚀 Migrazione Tra Modalità

### Da Docker Hub All-in-One → Build Locale
```bash
# 1. Backup configurazione
docker exec mykeymanager-all-in-one /app/scripts/health.sh > backup-config.txt

# 2. Stop Docker Hub
docker-compose -f docker-compose.hub-all-in-one.yml down

# 3. Setup build locale
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
./configure-all-in-one.sh
```

### Da All-in-One → Microservizi
```bash
# 1. Backup database
docker exec mykeymanager-all-in-one sudo -u postgres pg_dump mykeymanager > backup.sql

# 2. Stop All-in-One
./configure-all-in-one.sh --stop

# 3. Setup microservizi
./configure-ports.sh
docker-compose -f docker-compose.hub.yml up -d

# 4. Restore database
cat backup.sql | docker-compose -f docker-compose.hub.yml exec -T db psql -U mykeymanager_user mykeymanager
```

---

## 🔍 Troubleshooting Common Issues

### Porta Occupata
```bash
# Identifica processo
lsof -i :80

# Kill processo se necessario
sudo kill -9 [PID]

# Riconfigurazione automatica
./configure-ports.sh --configure
```

### Container Non Si Avvia
```bash
# Logs dettagliati
docker-compose logs -f

# Debug All-in-One
docker exec mykeymanager-all-in-one supervisorctl status

# Reset completo
docker-compose down -v
docker system prune -f
```

### Performance Issues
```bash
# Resource usage
docker stats

# Ottimizzazione memoria
docker-compose -f docker-compose.hub.yml up -d --scale backend=1

# Cleanup
docker system prune -a
```

---

## 📚 Documentazione Approfondita

### Guide Specifiche
- **[ALL_IN_ONE_GUIDE.md](ALL_IN_ONE_GUIDE.md)** - Guida completa container All-in-One
- **[ADVANCED_PORT_CONFIG.md](ADVANCED_PORT_CONFIG.md)** - Gestione porte avanzata
- **[DOCKER_HUB_GUIDE.md](DOCKER_HUB_GUIDE.md)** - Deployment Docker Hub

### Link Utili
- **Docker Hub Repository**: https://hub.docker.com/r/acwild/mykeymanager-all-in-one
- **GitHub Repository**: https://github.com/Acwildweb/MyKeyManager
- **Issues & Support**: https://github.com/Acwildweb/MyKeyManager/issues

---

**MyKeyManager v1.1.1** - 🚀 La potenza della scelta: velocità, semplicità o scalabilità!

**© 2025 A.c. wild s.a.s** - Via Spagna, 33 - Palermo | info@acwild.it
