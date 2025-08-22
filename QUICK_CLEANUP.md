# 🧹 Quick Volume Cleanup

> **Risolvi rapidamente problemi di autenticazione PostgreSQL**

## ⚡ Comando Rapido

```bash
# Pulizia automatica con script
./clean-volumes.sh

# Oppure manualmente
docker compose down && docker volume rm mykeymanager_postgres_data mykeymanager_redis_data
```

## 🔍 Quando Usarlo

- ❌ `FATAL: password authentication failed for user "myuser"`
- ❌ Errori di connessione database dopo cambio password
- ❌ Container che non si avvia dopo aggiornamenti
- ❌ Conflitti tra versioni diverse

## 🚀 Deploy Dopo Pulizia

```bash
# All-in-One automatico
curl -sSL https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/quick-start-all-in-one.sh | bash

# Manuale
curl -O https://raw.githubusercontent.com/GianfrancoRing/mykeymanager/main/docker-compose.hub-all-in-one.yml
docker compose -f docker-compose.hub-all-in-one.yml up -d
```

## 📖 Guida Completa

Per informazioni dettagliate: [VOLUME_CLEANUP_GUIDE.md](VOLUME_CLEANUP_GUIDE.md)

---
*Questa procedura risolve il 95% dei problemi di autenticazione database*
