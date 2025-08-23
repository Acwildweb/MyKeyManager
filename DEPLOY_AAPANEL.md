# 🚀 Deploy MyKeyManager su Server AaPanel

## 📋 Prerequisiti
- Server con AaPanel installato
- Docker e Docker Compose attivi
- Accesso SSH o Terminal AaPanel

## 🔧 Metodo 1: SSH Diretto (Raccomandato)

### 1. Connetti via SSH al server
```bash
# Dal tuo Mac/PC locale
ssh root@YOUR_SERVER_IP
# oppure
ssh username@YOUR_SERVER_IP
```

### 2. Clona/trasferisci il progetto
```bash
# Clona repository
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager

# OPPURE carica files via SCP
scp -r /Users/gianfrancoringo/Desktop/licenze-manager/* root@YOUR_SERVER_IP:/root/MyKeyManager/
```

### 3. Esegui script fix
```bash
chmod +x fix-api-errors.sh
./fix-api-errors.sh
```

## 🖥️ Metodo 2: Terminal AaPanel Web

### 1. Accedi ad AaPanel
- URL: `http://YOUR_SERVER_IP:7800`
- Login con credenziali AaPanel

### 2. Apri Terminal
- Menu laterale → **Terminal** 
- Oppure **File Manager** → **Terminal**

### 3. Naviga e esegui
```bash
cd /www/wwwroot/  # o altra directory preferita
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
chmod +x fix-api-errors.sh
./fix-api-errors.sh
```

## 📁 Metodo 3: File Manager AaPanel

### 1. Carica files via Web
- AaPanel → **File Manager**
- Crea cartella `/www/wwwroot/MyKeyManager`
- Upload tutti i files del progetto

### 2. Imposta permessi
- Click destro su `fix-api-errors.sh`
- **Proprietà** → **Permessi** → `755`

### 3. Esegui da Terminal
```bash
cd /www/wwwroot/MyKeyManager
./fix-api-errors.sh
```

## ⚙️ Configurazione AaPanel Specifica

### 1. Verifica Docker
```bash
# Controlla se Docker è attivo
systemctl status docker
docker --version
docker compose --version
```

### 2. Configura Firewall AaPanel
- **Sicurezza** → **Firewall**
- Aggiungi regole:
  - Porta `3000` (Frontend)
  - Porta `8001` (Backend API)
  - Porta `5432` (PostgreSQL - opzionale)

### 3. Configura IP nel docker-compose
Lo script automaticamente:
- Rileva IP del server
- Sostituisce `YOUR_SERVER_IP` nei file di configurazione
- Riavvia i container con configurazione corretta

## 🔍 Verifica Installazione

### 1. Controlla container
```bash
docker compose ps
docker compose logs -f
```

### 2. Test connessione
```bash
# Health check backend
curl http://YOUR_SERVER_IP:8001/health

# Test frontend
curl http://YOUR_SERVER_IP:3000
```

### 3. Accesso Web
- Frontend: `http://YOUR_SERVER_IP:3000`
- Login: `admin@example.com` / `admin123`

## 🐛 Troubleshooting AaPanel

### Se Docker non è installato:
```bash
# Installa Docker via AaPanel
# App Store → Docker → Installa
# OPPURE manualmente:
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker
```

### Se ci sono problemi di rete:
```bash
# Disabilita temporaneamente firewall
systemctl stop firewalld
# OPPURE configura regole specifiche in AaPanel
```

### Se script non parte:
```bash
# Verifica permessi
ls -la fix-api-errors.sh
chmod +x fix-api-errors.sh

# Esegui manualmente step per step
docker compose down
cp docker-compose.arm64.yml docker-compose.yml
# ... resto configurazione
```

## 📞 Supporto

- **Logs**: `docker compose logs backend frontend`
- **Status**: `docker compose ps`
- **Restart**: `docker compose restart`

---

**TL;DR: SSH → `git clone` → `./fix-api-errors.sh` → Configura firewall porte 3000,8001**
