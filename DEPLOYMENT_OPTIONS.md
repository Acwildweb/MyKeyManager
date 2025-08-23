# 🚀 MyKeyManager - Opzioni di Deployment

## 📋 Panoramica Deployment

MyKeyManager offre diverse configurazioni di deployment ottimizzate per architetture e ambienti specifici:

## 🏗️ Configurazioni Disponibili

### 1. 🏠 Deployment Locale (Sviluppo)
**File**: `docker-compose.yml`
- ✅ Ottimizzato per sviluppo locale
- ✅ Tutte le architetture (AMD64/ARM64)
- ✅ Debug abilitato
- 🎯 **Per**: Sviluppatori, testing locale

```bash
# Avvio rapido
docker compose up -d --build
```

### 2. 🌐 Server Generico (Produzione)
**File**: `docker-compose.server.yml`
- ✅ Configurazione produzione generica
- ✅ Multi-architettura
- ✅ Performance ottimizzate
- 🎯 **Per**: VPS generici, server cloud misti

```bash
# Con script automatico
./install-server.sh
```

### 3. 🏠 CasaOS ARM64 (Specifico)
**File**: `docker-compose.casaos.yml` + `install-casaos-local.sh`
- ✅ Build locale per CasaOS
- ✅ Risoluzione problemi API endpoints
- ✅ Platform ARM64 forzato
- 🎯 **Per**: CasaOS su ARM64 (Raspberry Pi, etc.)

```bash
# Installazione CasaOS
./install-casaos-local.sh
```

### 4. 💪 Server ARM64 Esterni (Ottimizzato)
**File**: `docker-compose.arm64.yml` + `install-arm64-server.sh`
- ✅ Ottimizzazioni specifiche ARM64
- ✅ Resource limits appropriati
- ✅ Configurazioni PostgreSQL per ARM64
- 🎯 **Per**: Server ARM64 dedicati, VPS ARM64

```bash
# Installazione server ARM64
./install-arm64-server.sh
```

### 5. ⚡ Server ARM64 Senza Build (Veloce)
**File**: `docker-compose.arm64-hub.yml` + `install-arm64-nobuild.sh`
- ✅ **RISOLVE errori "build context path not found"**
- ✅ Deploy velocissimo (no build time)
- ✅ Solo immagini Docker Hub pre-costruite
- ✅ Compatibilità universale
- 🎯 **Per**: Server con problemi di build context, deploy rapidi

```bash
# Installazione ARM64 senza build locale
./install-arm64-nobuild.sh
```

## 🎯 Quale Scegliere?

### 🏠 Uso Domestico/Homelab
- **CasaOS**: `docker-compose.casaos.yml` + `install-casaos-local.sh`
- **Raspberry Pi 4/5**: `docker-compose.arm64.yml` + `install-arm64-server.sh`
- **Mini PC x86**: `docker-compose.server.yml` + `install-server.sh`

### 🌐 Produzione Cloud
- **VPS ARM64** (Oracle Cloud, AWS Graviton): `docker-compose.arm64.yml` o `docker-compose.arm64-hub.yml` (se problemi build)
- **VPS x86** (DigitalOcean, Linode): `docker-compose.server.yml`
- **Server Dedicati**: `docker-compose.arm64.yml` o `docker-compose.server.yml`
- **Deploy Rapidi**: `docker-compose.arm64-hub.yml` (senza build)

### 👨‍💻 Sviluppo
- **Locale**: `docker-compose.yml`
- **Testing**: Qualsiasi configurazione per test deployment

## 📊 Confronto Configurazioni

| Configurazione | Architettura | Uso | Build | Resource Limits | HTTPS |
|----------------|--------------|-----|-------|----------------|-------|
| `docker-compose.yml` | Multi | Sviluppo | Locale | No | No |
| `docker-compose.server.yml` | Multi | Produzione | Locale | Basic | Manuale |
| `docker-compose.casaos.yml` | ARM64 | CasaOS | Locale | No | Manuale |
| `docker-compose.arm64.yml` | ARM64 | Server ARM64 | Locale | Ottimizzati | Manuale |
| `docker-compose.arm64-hub.yml` | ARM64 | Server ARM64 | **No Build** | Ottimizzati | Manuale |

## 🔧 File di Supporto

### Script di Installazione
- `install.sh` - Installazione generica locale
- `install-server.sh` - Server generico con rilevamento architettura
- `install-casaos.sh` - CasaOS con Docker Hub (deprecato)
- `install-casaos-local.sh` - CasaOS con build locale (consigliato)
- `install-arm64-server.sh` - Server ARM64 ottimizzato

### Dockerfile
- `backend/Dockerfile` - Backend build locale
- `frontend/Dockerfile` - Frontend build locale
- `devops/Dockerfile.backend` - Backend build dal root
- `devops/Dockerfile.frontend` - Frontend build dal root

### Documentazione
- `README.md` - Documentazione principale
- `INSTALL_DOCKER.md` - Installazione Docker generica
- `INSTALL_CASAOS.md` - Deployment specifico CasaOS
- `INSTALL_ARM64_SERVER.md` - Deployment server ARM64
- `TROUBLESHOOTING_CASAOS.md` - Risoluzione problemi CasaOS
- `FIX_SUMMARY_CASAOS.md` - Summary fix context build

## 🚀 Quick Start per Ambiente

### CasaOS (Consigliato per CasaOS)
```bash
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
./install-casaos-local.sh
```
**Accesso**: `http://CASAOS_IP:3000`

### Server ARM64 Cloud (Problemi Build Context)
```bash
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
./install-arm64-nobuild.sh
```
**Accesso**: `http://SERVER_IP:3000`

### Server x86 Cloud
```bash
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
./install-server.sh
```
**Accesso**: `http://SERVER_IP:3000`

### Sviluppo Locale
```bash
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
docker compose up -d --build
```
**Accesso**: `http://localhost:3000`

## 🔒 Post-Deployment Sicurezza

Per **tutti** gli ambienti di produzione:

1. **Cambia credenziali default**:
   - Email: `admin@example.com`
   - Password: `admin123`

2. **Configura HTTPS** con reverse proxy (Nginx/Traefik)

3. **Aggiorna configurazioni sicurezza**:
   ```bash
   # Nel docker-compose.yml
   SECRET_KEY: "YOUR_SECRET_KEY_64_CHARS_MIN"
   POSTGRES_PASSWORD: "YOUR_STRONG_DB_PASSWORD"
   ```

4. **Configura firewall** per porte 3000, 8001

5. **Setup backup automatici** del database

## 📞 Supporto

- **Repository**: https://github.com/Acwildweb/MyKeyManager
- **Issues**: https://github.com/Acwildweb/MyKeyManager/issues
- **Discussions**: https://github.com/Acwildweb/MyKeyManager/discussions

---

**Scegli la configurazione più adatta al tuo ambiente e segui la documentazione specifica!**
