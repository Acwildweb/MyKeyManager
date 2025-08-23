# 🔧 Risoluzione Errore "Build Context Path Not Found"

## ❌ Problema

Se vedi questo errore durante il deploy:

```
unable to prepare context: path "/www/server/panel/data/compose/MaPerch/backend" not found
```

Il problema è causato da **path di build context** che non esistono sul sistema target.

## ✅ Soluzione Immediata (Consigliata)

Usa la configurazione **SENZA BUILD LOCALE** che utilizza solo immagini Docker Hub pre-costruite:

### 1. Download Configurazione Senza Build
```bash
# Se hai già clonato il repository
cd MyKeyManager
./install-arm64-nobuild.sh

# Se non hai il repository locale
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.arm64-hub.yml
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/install-arm64-nobuild.sh
chmod +x install-arm64-nobuild.sh
./install-arm64-nobuild.sh
```

### 2. Deploy Manuale Veloce
```bash
# Download solo il file compose necessario
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.arm64-hub.yml

# Configura IP
SERVER_IP=$(hostname -I | awk '{print $1}')
cp docker-compose.arm64-hub.yml docker-compose.yml
sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml

# Avvio (velocissimo - no build)
docker compose up -d
```

## 🔍 Cause del Problema

### 1. Path Build Context Inesistenti
Il docker-compose cerca di fare build da directory che non esistono:
```yaml
# PROBLEMATICO
build:
  context: ./backend  # <- Directory non trovata
  dockerfile: Dockerfile
```

### 2. Sistemi con Strutture Directory Diverse
Alcuni sistemi (CasaOS, Docker custom) hanno strutture directory diverse che causano path relativi errati.

### 3. Repository Incompleti
Se il repository non è stato clonato completamente, mancano directory essenziali.

## 🚀 Vantaggi Soluzione Senza Build

### ✅ Vantaggi Immediati
- **Nessun errore build context**
- **Deploy velocissimo** (no build time)
- **Immagini testate** e multi-architettura
- **Compatibilità universale**
- **Meno requisiti** (non serve codice sorgente completo)

### ⚡ Performance
```bash
# Con build locale: 10-15 minuti
./install-arm64-server.sh

# Senza build: 2-3 minuti
./install-arm64-nobuild.sh
```

## 🔄 Alternative per Build Locale

Se preferisci il build locale, prova queste soluzioni:

### 1. Verifica Struttura Repository
```bash
# Assicurati di avere tutto
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
ls -la backend/ frontend/ devops/

# Verifica Dockerfile
ls -la backend/Dockerfile frontend/Dockerfile
```

### 2. Usa Configurazione CasaOS
```bash
# Per CasaOS specificamente
./install-casaos-local.sh
```

### 3. Build Manuale Prima del Deploy
```bash
# Pre-build immagini localmente
cd backend && docker build -t local-backend .
cd ../frontend && docker build -t local-frontend .

# Modifica docker-compose.yml per usare immagini locali
# image: local-backend
# image: local-frontend
```

## 📊 Confronto Soluzioni

| Metodo | Tempo Deploy | Requisiti | Problemi Build | Personalizzazione |
|--------|--------------|-----------|----------------|-------------------|
| **No Build (Hub)** | ⚡ 2-3 min | Docker only | ✅ Nessuno | ⭐ Limitata |
| **Build Locale** | 🐌 10-15 min | Repository completo | ❌ Possibili | ⭐⭐⭐ Completa |
| **CasaOS Local** | 🐌 8-12 min | Repository + CasaOS | ⭐ Rari | ⭐⭐ Media |

## 🎯 Raccomandazione

### Per Produzione Rapida
**Usa docker-compose.arm64-hub.yml** (senza build):
```bash
./install-arm64-nobuild.sh
```

### Per Sviluppo/Personalizzazione
**Usa docker-compose.arm64.yml** (con build):
```bash
# Assicurati di avere repository completo
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
./install-arm64-server.sh
```

### Per CasaOS Specifico
**Usa docker-compose.casaos.yml**:
```bash
./install-casaos-local.sh
```

## 🔧 Troubleshooting

### Se Immagini Hub Non Funzionano
Le immagini Docker Hub potrebbero avere configurazioni API diverse:

1. **Verifica endpoint API**:
   ```bash
   curl http://SERVER_IP:8001/health
   curl http://SERVER_IP:8001/api/v1/
   ```

2. **Se API non risponde correttamente**, passa al build locale:
   ```bash
   # Download repository completo
   git clone https://github.com/Acwildweb/MyKeyManager.git
   cd MyKeyManager
   ./install-arm64-server.sh
   ```

### Log Debugging
```bash
# Verifica cosa sta succedendo
docker compose logs backend
docker compose logs frontend
docker compose ps
```

## 📞 Supporto

Se hai ancora problemi:
1. 🐛 **Issues**: https://github.com/Acwildweb/MyKeyManager/issues
2. 💬 **Discussions**: https://github.com/Acwildweb/MyKeyManager/discussions
3. 📖 **Wiki**: https://github.com/Acwildweb/MyKeyManager/wiki

---

**💡 TL;DR: Usa `./install-arm64-nobuild.sh` per risolvere immediatamente gli errori di build context!**
