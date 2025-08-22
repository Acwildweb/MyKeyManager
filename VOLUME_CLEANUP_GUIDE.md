# 🧹 Guida alla Pulizia dei Volumi Docker

## 📋 Indice
- [Quando Pulire](#quando-pulire)
- [Metodi di Pulizia](#metodi-di-pulizia)
- [Script Automatici](#script-automatici)
- [Risoluzione Problemi](#risoluzione-problemi)

## 🔍 Quando Pulire

### Sintomi che Richiedono Pulizia:
- ❌ Errori di autenticazione PostgreSQL
- ❌ Database con credenziali obsolete
- ❌ Conflitti tra diverse versioni
- ❌ "FATAL: password authentication failed"

### Situazioni Tipiche:
1. **Dopo cambio password** nel file di configurazione
2. **Prima di un fresh deploy** dell'all-in-one
3. **Quando si passa** da una versione all'altra
4. **Errori persistenti** di connessione database

## 🛠️ Metodi di Pulizia

### 1. Pulizia Specifica (Raccomandato)
```bash
# Ferma i container
docker compose down

# Rimuovi solo i volumi MyKeyManager
docker volume rm mykeymanager_postgres_data mykeymanager_redis_data

# Verifica
docker volume ls | grep mykeymanager
```

### 2. Pulizia Selettiva
```bash
# Lista tutti i volumi
docker volume ls

# Rimuovi volumi specifici
docker volume rm <nome_volume1> <nome_volume2>

# Rimuovi volumi non utilizzati
docker volume prune -f
```

### 3. Pulizia Completa (Attenzione!)
```bash
# ⚠️ ATTENZIONE: Rimuove TUTTI i dati Docker
docker system prune -af
docker volume prune -f
```

### 4. Pulizia con Backup
```bash
# Backup prima della pulizia
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup busybox tar czf /backup/postgres_backup.tar.gz -C /data .

# Pulizia
docker volume rm mykeymanager_postgres_data mykeymanager_redis_data

# Restore (se necessario)
docker volume create mykeymanager_postgres_data
docker run --rm -v mykeymanager_postgres_data:/data -v $(pwd):/backup busybox tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🤖 Script Automatici

### Script di Pulizia Rapida
```bash
#!/bin/bash
echo "🧹 Pulizia volumi MyKeyManager..."

# Ferma container
docker compose down 2>/dev/null || true

# Rimuovi volumi
docker volume rm mykeymanager_postgres_data mykeymanager_redis_data 2>/dev/null || echo "Volumi già rimossi"

# Verifica
if docker volume ls | grep -q mykeymanager; then
    echo "❌ Alcuni volumi non sono stati rimossi"
    docker volume ls | grep mykeymanager
else
    echo "✅ Pulizia completata con successo!"
fi
```

### Script di Reset Completo
```bash
#!/bin/bash
echo "🔄 Reset completo MyKeyManager..."

# Ferma e rimuovi container
docker compose down
docker rm -f $(docker ps -aq --filter name=mykeymanager) 2>/dev/null || true

# Rimuovi volumi
docker volume rm mykeymanager_postgres_data mykeymanager_redis_data 2>/dev/null || true

# Rimuovi immagini (opzionale)
read -p "Vuoi rimuovere anche le immagini? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker rmi acwild/mykeymanager-backend:v1.1.2 2>/dev/null || true
    docker rmi acwild/mykeymanager-frontend:v1.1.1 2>/dev/null || true
fi

echo "✅ Reset completato!"
```

## 🔧 Risoluzione Problemi

### Problema: "Volume in use"
```bash
# Lista container che usano il volume
docker ps -a --filter volume=mykeymanager_postgres_data

# Ferma container specifici
docker stop <container_id>
docker rm <container_id>

# Ora rimuovi il volume
docker volume rm mykeymanager_postgres_data
```

### Problema: "Permission denied"
```bash
# Su Linux/Mac con problemi di permessi
sudo docker volume rm mykeymanager_postgres_data mykeymanager_redis_data
```

### Problema: Volumi fantasma
```bash
# Pulizia totale volumi orfani
docker volume prune -f

# Lista volumi con dettagli
docker volume ls --format "table {{.Driver}}\t{{.Name}}\t{{.Scope}}"
```

## 📊 Monitoraggio Spazio

### Controllo Utilizzo Spazio
```bash
# Spazio totale Docker
docker system df

# Dettaglio volumi
docker system df -v

# Spazio per tipo
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
docker volume ls --format "table {{.Driver}}\t{{.Name}}\t{{.Size}}"
```

## ⚡ Comandi Rapidi

```bash
# Comando All-in-One per reset veloce
docker compose down && docker volume rm mykeymanager_postgres_data mykeymanager_redis_data 2>/dev/null || true && echo "✅ Pronto per fresh deploy!"

# Verifica stato
docker ps && docker volume ls | grep mykeymanager

# Deploy dopo pulizia
curl -sSL https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/quick-start-all-in-one.sh | bash
```

## 🔄 Workflow Raccomandato

1. **Verifica stato attuale**
   ```bash
   docker ps
   docker volume ls | grep mykeymanager
   ```

2. **Backup (se necessario)**
   ```bash
   # Solo se hai dati importanti
   ```

3. **Pulizia**
   ```bash
   docker compose down
   docker volume rm mykeymanager_postgres_data mykeymanager_redis_data
   ```

4. **Verifica**
   ```bash
   docker volume ls | grep mykeymanager
   ```

5. **Fresh Deploy**
   ```bash
   # Usa uno dei metodi disponibili
   curl -sSL https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/quick-start-all-in-one.sh | bash
   ```

---
*Questa guida ti permette di gestire completamente la pulizia dei volumi Docker per MyKeyManager*
