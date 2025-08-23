# 🔐 Guida Risoluzione Problemi Permessi Docker

## 🚨 Problema: "permission denied while trying to connect to the Docker daemon socket"

Questo errore si verifica quando l'utente non ha i permessi per accedere al daemon Docker. È un problema comune sui server Linux, incluso CasaOS.

## 🛠️ Soluzioni Rapide

### Soluzione 1: Esecuzione con sudo (IMMEDIATA)
```bash
# Per CasaOS - Eseguire come root
sudo su -
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/install-casaos.sh
chmod +x install-casaos.sh
./install-casaos.sh
```

### Soluzione 2: Aggiungi utente al gruppo docker (PERMANENTE)
```bash
# Aggiungi utente corrente al gruppo docker
sudo usermod -aG docker $USER

# Riavvia il terminale o esegui
newgrp docker

# Verifica permessi
docker ps
```

### Soluzione 3: Permessi temporanei socket Docker
```bash
# Applica permessi temporanei (fino al riavvio)
sudo chmod 666 /var/run/docker.sock

# Ora esegui lo script
./install-casaos.sh
```

## 🏠 Specifico per CasaOS

### Metodo 1: Root Shell
```bash
# Diventa root
sudo su -

# Scarica e installa
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/install-casaos.sh
chmod +x install-casaos.sh
./install-casaos.sh
```

### Metodo 2: Controllo Servizio Docker
```bash
# Controlla se Docker è in esecuzione
sudo systemctl status docker

# Se non è attivo, avvialo
sudo systemctl start docker
sudo systemctl enable docker
```

### Metodo 3: Riavvio CasaOS
```bash
# Riavvia tutti i servizi CasaOS
sudo systemctl restart casaos

# Oppure riavvia completamente il sistema
sudo reboot
```

## 🔍 Diagnostica Problemi

### 1. Verifica Docker
```bash
# Controlla installazione Docker
docker --version
which docker

# Controlla daemon Docker
sudo systemctl status docker
```

### 2. Verifica Gruppo Docker
```bash
# Controlla se l'utente è nel gruppo docker
groups
groups $USER

# Lista membri del gruppo docker
getent group docker
```

### 3. Verifica Socket Docker
```bash
# Controlla proprietà socket Docker
ls -la /var/run/docker.sock

# Dovrebbe mostrare qualcosa come:
# srw-rw---- 1 root docker 0 date /var/run/docker.sock
```

## 📋 Script di Auto-Diagnosi

Crea questo script per diagnosticare i problemi:

```bash
cat > diagnose-docker.sh << 'EOF'
#!/bin/bash
echo "🔍 DIAGNOSI DOCKER"
echo "=================="

echo "👤 Utente corrente: $(whoami)"
echo "📁 Home directory: $HOME"

echo -e "\n🐳 DOCKER:"
if command -v docker &> /dev/null; then
    echo "✅ Docker installato: $(docker --version)"
else
    echo "❌ Docker NON installato"
fi

echo -e "\n🔐 PERMESSI:"
if docker ps &> /dev/null; then
    echo "✅ Permessi Docker OK"
else
    echo "❌ Permessi Docker insufficienti"
fi

echo -e "\n👥 GRUPPI:"
echo "Gruppi utente: $(groups)"
if groups | grep -q docker; then
    echo "✅ Utente nel gruppo docker"
else
    echo "❌ Utente NON nel gruppo docker"
fi

echo -e "\n🔌 SOCKET DOCKER:"
if [ -S /var/run/docker.sock ]; then
    echo "✅ Socket Docker esiste"
    echo "Permessi: $(ls -la /var/run/docker.sock)"
else
    echo "❌ Socket Docker non trovato"
fi

echo -e "\n🚀 SERVIZIO DOCKER:"
if systemctl is-active --quiet docker; then
    echo "✅ Docker daemon attivo"
else
    echo "❌ Docker daemon non attivo"
fi

echo -e "\n🏠 CASAOS:"
if [ -d "/var/lib/casaos" ] || [ -f "/usr/bin/casaos" ]; then
    echo "✅ CasaOS rilevato"
else
    echo "ℹ️ CasaOS non rilevato"
fi
EOF

chmod +x diagnose-docker.sh
./diagnose-docker.sh
```

## 🚀 Comandi Post-Installazione

Dopo aver risolto i permessi, questi comandi dovrebbero funzionare:

```bash
# Controllo stato
docker compose -f docker-compose.casaos.yml ps

# Visualizza logs
docker compose -f docker-compose.casaos.yml logs

# Riavvio servizi
docker compose -f docker-compose.casaos.yml restart

# Stop completo
docker compose -f docker-compose.casaos.yml down
```

## ⚠️ Note Importanti

1. **Riavvio Necessario**: Dopo l'aggiunta al gruppo docker, è spesso necessario riavviare il terminale o fare logout/login
2. **Permessi Temporanei**: `chmod 666` sui socket Docker è una soluzione temporanea che si resetta al riavvio
3. **Sicurezza**: L'accesso a Docker equivale all'accesso root. Usa con cautela
4. **CasaOS**: Su alcuni sistemi CasaOS, è normale dover usare sudo per Docker

## 🆘 Se Nulla Funziona

1. **Reinstalla Docker**:
   ```bash
   # Rimuovi Docker
   sudo apt remove docker docker-engine docker.io containerd runc
   
   # Reinstalla Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Contatta il Supporto CasaOS**: Se stai usando CasaOS, potrebbero esserci configurazioni specifiche del tuo sistema

3. **Esegui come Root**: Come ultima risorsa, esegui sempre tutto come root con `sudo su -`
