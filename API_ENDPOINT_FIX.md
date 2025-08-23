# 🚨 Fix Errore API Endpoints - Porta 8080 vs 8001

## ❌ Problema Identificato

Dai log che hai fornito:
```
:8080/api/v1/users/change-password:1 Failed to load resource: the server responded with a status of 422
```

**CAUSA**: Stai usando **immagini Docker Hub** che hanno configurazione API hardcoded per porta 8080, mentre il server gira su porta 8001.

## 🔧 Soluzione Automatica (Consigliata)

### 1. Script Fix Automatico
```bash
# Sul tuo server ARM64
./fix-api-errors.sh
```

Lo script rileverà automaticamente il problema e applicherà il fix.

### 2. Fix Manuale Rapido
```bash
# Ferma servizi attuali
docker compose down

# Passa a configurazione build locale
cp docker-compose.arm64.yml docker-compose.yml

# Configura IP (sostituisci con il tuo IP)
SERVER_IP=$(hostname -I | awk '{print $1}')
sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" docker-compose.yml

# Riavvia con build locale (corregge configurazione API)
docker compose up -d --build
```

## 🔍 Verifica Problema

### Controlla quale configurazione stai usando:
```bash
# Se vedi "acwild/mykeymanager-backend" = PROBLEMA
docker compose config | grep image

# Se vedi "build:" = CORRETTO
docker compose config | grep build
```

### Test API endpoint:
```bash
# Questo dovrebbe funzionare
curl http://YOUR_SERVER_IP:8001/health

# Se invece va su 8080, hai il problema
curl http://YOUR_SERVER_IP:8080/health
```

## 📊 Differenze Configurazioni

| Configurazione | Frontend porta API | Build | Problema |
|---|---|---|---|
| **docker-compose.arm64-hub.yml** | ❌ 8080 | No | Errori 422 |
| **docker-compose.arm64.yml** | ✅ 8001 | Sì | Funziona |

## 🎯 Risultato Atteso

Dopo il fix:
- ✅ Frontend chiama `YOUR_SERVER_IP:8001/api/v1/`
- ✅ Cambio password funziona
- ✅ Nessun errore 422
- ✅ API disponibili su porta corretta

## 🚀 Verifiche Post-Fix

### 1. Test Applicazione
```bash
# Accedi all'app
open http://YOUR_SERVER_IP:3000

# Login: admin@example.com / admin123
# Prova cambio password
```

### 2. Monitor Log Browser
Apri F12 → Network e verifica che le chiamate vadano a `:8001` invece di `:8080`

### 3. Test API Diretti
```bash
# Health check
curl http://YOUR_SERVER_IP:8001/health

# API v1
curl http://YOUR_SERVER_IP:8001/api/v1/

# Test auth (dovrebbe dare 401 senza token)
curl http://YOUR_SERVER_IP:8001/api/v1/users/me
```

## 🐛 Troubleshooting

### Se il fix non funziona:

1. **Verifica build completato**:
   ```bash
   docker compose logs backend | grep -i "started"
   docker compose logs frontend | grep -i "started"
   ```

2. **Verifica IP configurato**:
   ```bash
   docker compose exec backend printenv | grep ALLOWED_ORIGINS
   docker compose exec frontend printenv | grep VITE_API
   ```

3. **Hard refresh browser**:
   ```bash
   # Ctrl+F5 o Cmd+Shift+R per forzare reload
   ```

### Se persistono errori:

1. **Pulisci cache browser** completamente
2. **Riavvia container**:
   ```bash
   docker compose restart
   ```
3. **Rebuild completo**:
   ```bash
   docker compose down
   docker compose up -d --build --no-cache
   ```

## 💡 Prevenzione Futura

Per evitare questo problema:
- ✅ Usa sempre `docker-compose.arm64.yml` (build locale)
- ❌ Evita `docker-compose.arm64-hub.yml` (immagini Docker Hub)
- ✅ Verifica IP configurato correttamente
- ✅ Usa script di installazione dedicati

## 📞 Supporto

Se il problema persiste:
- 🐛 **Issues**: https://github.com/Acwildweb/MyKeyManager/issues
- 💬 **Discussions**: https://github.com/Acwildweb/MyKeyManager/discussions

Allega sempre:
- Output di `docker compose logs backend`
- Output di `docker compose logs frontend`
- Screenshot errori browser (F12 → Console/Network)

---

**TL;DR: Esegui `./fix-api-errors.sh` per correggere automaticamente gli errori API 8080→8001**
