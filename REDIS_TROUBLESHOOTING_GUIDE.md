# 🔴 Guida Risoluzione Problemi Redis - MyKeyManager

## 🚨 Errori Redis Comuni

### 1. "Connection refused" o "Redis unreachable"
```
redis.exceptions.ConnectionError: Error 111 connecting to redis:6379. Connection refused.
```

### 2. "Redis dependency missing"
```
ModuleNotFoundError: No module named 'redis'
```

### 3. "Redis timeout" o "Redis not responding"
```
redis.exceptions.TimeoutError: Timeout reading from socket
```

## 🔍 Diagnosi Problemi Redis

### Script di Auto-Diagnosi
```bash
#!/bin/bash
echo "🔍 DIAGNOSI REDIS MyKeyManager"
echo "=============================="

# Test 1: Container Redis
echo "📦 Test container Redis..."
if docker ps | grep -q mykeymanager-redis; then
    echo "✅ Container Redis attivo"
else
    echo "❌ Container Redis non trovato"
fi

# Test 2: Connessione Redis
echo "🔌 Test connessione Redis..."
if docker exec mykeymanager-redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ Redis risponde"
else
    echo "❌ Redis non risponde"
fi

# Test 3: Logs Redis
echo "📋 Logs Redis (ultimi 10 righe):"
docker logs mykeymanager-redis --tail 10

# Test 4: Risorse container
echo "💾 Risorse container Redis:"
docker stats mykeymanager-redis --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## 🛠️ Soluzioni per Problemi Redis

### Soluzione 1: Riavvio Container Redis
```bash
# Riavvia solo Redis
docker restart mykeymanager-redis

# Verifica stato
docker exec mykeymanager-redis redis-cli ping
```

### Soluzione 2: Ricrea Container Redis
```bash
# Ferma tutto
docker compose -f docker-compose.casaos.yml down

# Rimuovi volume Redis (CANCELLA CACHE)
docker volume rm mykeymanager_redis_data

# Riavvia
docker compose -f docker-compose.casaos.yml up -d
```

### Soluzione 3: Usa Versione senza Redis
```bash
# Download versione senza Redis
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.casaos-noredis.yml

# Ferma versione con Redis
docker compose -f docker-compose.casaos.yml down

# Avvia versione senza Redis
docker compose -f docker-compose.casaos-noredis.yml up -d
```

### Soluzione 4: Configurazione Redis Ridotta
Modifica `docker-compose.casaos.yml`:

```yaml
  redis:
    image: redis:7-alpine
    container_name: mykeymanager-redis
    command: >
      redis-server
      --maxmemory 64mb
      --maxmemory-policy allkeys-lru
      --save ""
      --appendonly no
    deploy:
      resources:
        limits:
          memory: 64M
          cpus: '0.1'
    restart: unless-stopped
    networks:
      - mykeymanager-net
```

## 🔧 Configurazioni Alternative Redis

### Configurazione Minimal (32MB RAM)
```yaml
  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 32mb --maxmemory-policy allkeys-lru
    deploy:
      resources:
        limits:
          memory: 32M
```

### Configurazione No-Persistence (Solo Cache)
```yaml
  redis:
    image: redis:7-alpine
    command: redis-server --save "" --appendonly no
    # Nessun volume - solo cache temporanea
```

### Configurazione Ultra-Light
```yaml
  redis:
    image: redis:7-alpine
    command: >
      redis-server
      --maxmemory 16mb
      --maxmemory-policy volatile-lru
      --tcp-keepalive 60
      --timeout 30
```

## 📋 Versione Senza Redis (Soluzione Definitiva)

Se Redis continua a dare problemi, usa la versione senza Redis:

### 1. Script di Installazione Senza Redis
```bash
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/install-casaos-redis-debug.sh
chmod +x install-casaos-redis-debug.sh
./install-casaos-redis-debug.sh
```

### 2. Conversione Manuale
```bash
# Backup della configurazione corrente
cp docker-compose.casaos.yml docker-compose.casaos.yml.backup

# Download versione senza Redis
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.casaos-noredis.yml

# Migrazione
docker compose -f docker-compose.casaos.yml down
docker compose -f docker-compose.casaos-noredis.yml up -d
```

## ⚠️ Impatti della Rimozione Redis

### Cosa Funziona Senza Redis:
- ✅ Tutte le funzionalità principali
- ✅ Autenticazione e autorizzazione
- ✅ Database PostgreSQL
- ✅ Frontend e API
- ✅ Rate limiting (memoria in-process)

### Limitazioni Senza Redis:
- ⚠️ Rate limiting solo per sessione corrente
- ⚠️ Nessuna cache distribuita (prestazioni leggermente inferiori)
- ⚠️ Restart backend resetta contatori rate limit

## 🔍 Monitoraggio Redis

### Comandi Utili
```bash
# Stato Redis
docker exec mykeymanager-redis redis-cli info

# Memoria Redis
docker exec mykeymanager-redis redis-cli info memory

# Connessioni attive
docker exec mykeymanager-redis redis-cli info clients

# Performance Redis
docker exec mykeymanager-redis redis-cli --latency

# Test performance
docker exec mykeymanager-redis redis-cli --latency-history -i 1
```

### Alert e Monitoraggio
```bash
#!/bin/bash
# Script monitoraggio Redis

REDIS_MEMORY=$(docker exec mykeymanager-redis redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
REDIS_CONNECTIONS=$(docker exec mykeymanager-redis redis-cli info clients | grep connected_clients | cut -d: -f2 | tr -d '\r')

echo "📊 Redis Status:"
echo "   Memory: $REDIS_MEMORY"
echo "   Connections: $REDIS_CONNECTIONS"

# Alert se memoria > 100MB
if [[ $REDIS_MEMORY =~ ([0-9]+)M ]]; then
    if [ ${BASH_REMATCH[1]} -gt 100 ]; then
        echo "⚠️ ALERT: Redis usa troppa memoria!"
    fi
fi
```

## 🏠 Configurazioni Specifiche CasaOS

### Per Raspberry Pi / ARM
```yaml
  redis:
    image: redis:7-alpine
    platform: linux/arm64  # o linux/arm/v7
    command: redis-server --maxmemory 32mb
```

### Per Sistemi con Poca RAM
```yaml
  redis:
    image: redis:7-alpine
    command: >
      redis-server
      --maxmemory 16mb
      --maxmemory-policy allkeys-lru
      --save ""
      --appendonly no
    deploy:
      resources:
        limits:
          memory: 32M
          cpus: '0.1'
```

## 🆘 Se Nulla Funziona

1. **Usa la versione senza Redis**: È completamente funzionale
2. **Controlla logs di sistema**: `journalctl -u docker`
3. **Verifica spazio disco**: Redis potrebbe non avviarsi se poco spazio
4. **Riavvia Docker**: `sudo systemctl restart docker`
5. **Riavvia CasaOS**: In caso di configurazioni corrotte

## 📞 Supporto

Se i problemi persistono:
1. Raccogli logs: `docker compose logs > problemi-redis.log`
2. Verifica configurazione: `docker compose config`
3. Controlla risorse sistema: `free -h` e `df -h`
4. Usa la versione senza Redis come fallback definitivo
