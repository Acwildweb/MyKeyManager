# 🔧 Risoluzione Errore Build Context - CasaOS

## ❌ Problema Identificato

L'errore che hai ricevuto:
```
unable to prepare context: path "/www/server/panel/data/compose/MyCodeManager/backend" not found
```

Indica che Docker non riusciva a trovare il path del contesto di build specificato nel docker-compose.casaos.yml.

## ✅ Risoluzione Applicata

### 1. Dockerfile Locali Creati
Per semplificare il deploy su CasaOS, sono stati creati Dockerfile direttamente nelle directory:
- `backend/Dockerfile`
- `frontend/Dockerfile`

### 2. Correzione Context Build
**Configurazione finale**:
```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile

frontend:
  build:
    context: ./frontend  
    dockerfile: Dockerfile
```

Questo elimina la dipendenza dalla directory `devops` che potrebbe non essere presente in alcuni deploy CasaOS.

## 🚀 Come Procedere Ora

### 1. Su CasaOS, ferma i container esistenti:
```bash
cd ~/MyKeyManager  # o la directory dove hai clonato
docker compose -f docker-compose.casaos.yml down
```

### 2. Aggiorna il codice:
```bash
git pull origin main
```

### 3. Riavvia con build corretto:
```bash
./install-casaos-local.sh
```

Oppure manualmente:
```bash
export SERVER_IP=$(hostname -I | awk '{print $1}')
docker compose -f docker-compose.casaos.yml up -d --build
```

## 🔍 Verifica Risoluzione

Dopo il riavvio, dovresti vedere:
```bash
✅ Database PostgreSQL attivo
✅ Backend FastAPI attivo  
✅ Frontend React attivo
```

E l'applicazione dovrebbe essere accessibile su:
- Frontend: `http://YOUR_SERVER_IP:3000`
- API: `http://YOUR_SERVER_IP:8001`

## 🧪 Test Locale (Opzionale)

Per testare i build localmente prima del deploy:
```bash
./test-build.sh
```

Questo script verifica che entrambi i Dockerfile buildino correttamente dal root del progetto.

---

**La risoluzione è completa e testata! Il docker-compose.casaos.yml ora dovrebbe funzionare correttamente su CasaOS.**
