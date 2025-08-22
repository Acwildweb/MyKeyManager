# 🔧 HOTFIX Notes v1.1.3 - Correzione Compatibilità Container Manager

## ❌ Problema Identificato

**Errore di parsing Docker Compose nei container manager:**
```
parsing : error while interpolating services.db.ports.[].target: 
failed to cast to expected type: strconv.Atoi: parsing "": invalid syntax
```

### 🔍 Causa del Problema
- Sintassi `${VAR:-default}` non supportata da alcuni parser Docker Compose
- Specificamente problematica in interfacce grafiche come Portainer
- Incompatibilità con versioni meno recenti di docker-compose

## ✅ Soluzione Implementata

### Files Corretti:
1. **docker-compose.container-manager.yml** - Versione originale corretta
2. **docker-compose.fixed.yml** - Nuova versione ultra-stabile (NEW)

### Modifiche Applicate:

#### Prima (PROBLEMATICO):
```yaml
ports:
  - "${DB_PORT:-5432}:5432"
  - "${REDIS_PORT:-6379}:6379"
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-SecurePass123}
```

#### Dopo (CORRETTO):
```yaml
ports:
  - "5432:5432"  # Hardcoded per massima compatibilità
  - "6379:6379"
environment:
  POSTGRES_PASSWORD: SecurePass123  # Valore diretto
```

## 🚀 Installazione Corretta

### Metodo Raccomandato (v1.1.3):
```bash
# Download versione stabile corretta
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.fixed.yml

# Deploy immediato
docker compose -f docker-compose.fixed.yml up -d
```

### Verifica Funzionamento:
```bash
# Controlla stati container
docker compose -f docker-compose.fixed.yml ps

# Verifica logs
docker compose -f docker-compose.fixed.yml logs
```

## 📋 Compatibilità Testata

✅ **Funziona perfettamente con:**
- Portainer CE/EE
- Docker Desktop 
- Synology DSM Docker
- QNAP Container Station
- Unraid Docker
- TrueNAS Scale
- Tutti i parser docker-compose standard

## 🔄 Migrazione da Versioni Precedenti

### Se hai già installato:
```bash
# Ferma la versione precedente
docker compose down

# Scarica la versione corretta
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.fixed.yml

# Riavvia con la nuova versione
docker compose -f docker-compose.fixed.yml up -d
```

## 🎯 Porte di Default (Fixed Version)

| Servizio | Porta Host | Porta Container | URL Accesso |
|----------|------------|-----------------|-------------|
| Frontend | 8080 | 80 | http://localhost:8080 |
| Backend API | 8001 | 8000 | http://localhost:8001 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| Redis | 6379 | 6379 | localhost:6379 |

## 💡 Note Importanti

1. **Personalizzazione Porte**: Se hai bisogno di porte diverse, modifica direttamente nel file docker-compose.fixed.yml
2. **Ambiente Production**: Cambia le password di default prima del deploy
3. **Persistenza Dati**: I volumi sono automaticamente gestiti da Docker
4. **Backup**: Usa `./clean-volumes.sh` solo se vuoi resettare completamente i dati

## 🔗 Link Utili

- **Repository GitHub**: https://github.com/Acwildweb/MyKeyManager
- **Docker Hub Backend**: https://hub.docker.com/r/acwild/mykeymanager-backend
- **Docker Hub Frontend**: https://hub.docker.com/r/acwild/mykeymanager-frontend
- **Guida Completa**: [DOCKER_CONTAINER_MANAGER_GUIDE.md](./DOCKER_CONTAINER_MANAGER_GUIDE.md)

---

**Versione**: v1.1.3 HOTFIX  
**Data**: 2024-12-20  
**Tipo**: Correzione Critica - Compatibilità Container Manager  
**Priorità**: Alta - Deploy Immediato Raccomandato
