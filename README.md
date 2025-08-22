# 🔑 MyKeyManager v1.1.1

> **Sistema avanzato di gestione licenze software single-user**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](devops/docker-compose.yml)
[![Version](https://img.shields.io/badge/version-1.1.1-green.svg)](frontend/src/config/version.ts)
[![All-in-One](https://img.shields.io/badge/deploy-all--in--one-orange.svg)](ALL_IN_ONE_GUIDE.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)](backend/pyproject.toml)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](frontend/package.json)

Sistema completo di gestione licenze software con dashboard amministrativo moderno, sistema di branding personalizzabile, **container All-in-One per deploy semplificato** e **gestione intelligente delle porte** con containerizzazione Docker integrata.

---

## 🚀 Caratteristiche Principali

### 🛡️ Sistema di Gestione Licenze
- **CRUD completo** per categorie e licenze software
- **Tracciamento automatico** dell'ultima data di utilizzo
- **Download links ISO** associati alle licenze
- **Invio email automatico** all'utilizzo (configurabile via SMTP)
- **Sistema di categorizzazione** avanzato con icone personalizzabili

### 👤 Autenticazione e Sicurezza
- **Autenticazione JWT** sicura single-user
- **Password hashing** con bcrypt
- **Rate limiting** per protezione API
- **Headers di sicurezza** configurati
- **CORS policies** appropriate
- **Utenti non-root** nei container Docker

### 🎨 Sistema di Branding Avanzato
- **Gestione loghi multi-variante** con sizing dinamico
- **Favicon configurabile dinamicamente** 
- **Pannello completo gestione icone FontAwesome**
- **Configurazioni persistenti** in localStorage
- **Interfaccia responsive** moderna

### 🐳 Containerizzazione Completa
- **3 modalità di deployment**: All-in-One, Microservizi Docker Hub, Build locale
- **Container All-in-One** per setup in 30 secondi
- **Sistema intelligente gestione porte** con auto-detection conflitti
- **Container separati**: Backend FastAPI, Frontend React, PostgreSQL, Redis, SMTP
- **Immagini Docker Hub** precompilate per deploy istantaneo
- **Volumes persistenti** per database con **sistema di pulizia automatica**
- **Hot-reload** in development
- **Build ottimizzato** per produzione

---

## 📦 Requisiti di Sistema

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **4GB RAM** raccomandati
- **Porte flessibili**: Sistema intelligente di gestione porte (vedere [Configurazione Porte Avanzata](ADVANCED_PORT_CONFIG.md))

---

## ⚡ Installazione Rapida

## ⚡ Installazione Rapida

### 🎯 All-in-One Quick Start (30 secondi)
```bash
# Download e avvio dello script automatico
curl -sL https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/quick-start-all-in-one.sh -o quick-start.sh
chmod +x quick-start.sh
./quick-start.sh

# Accesso: http://localhost:3000
```
✅ **Tutto incluso:** Frontend + Backend + Database + Redis + SMTP  
✅ **Setup automatico:** Gestione intelligente porte e configurazione  
✅ **Deploy istantaneo:** Usa immagini Docker Hub pre-compilate

### 📦 Docker Hub Microservizi (Produzione)
```bash
# Download configurazione pronta
curl -O https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.hub.yml
docker compose -f docker-compose.hub.yml up -d

# Accesso: http://localhost:3000
```
✅ **Scalabile:** Servizi separati per alta disponibilità  
✅ **Production-ready:** Configurazioni ottimizzate  
✅ **Personalizzabile:** Environment variables per tuning

### 🔧 Build Locale (Sviluppo)
```bash
# Clone e build da sorgente
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager
docker compose up -d

# Accesso: http://localhost:3000
```
✅ **Controllo totale:** Build e customizzazione completa  
✅ **Development-ready:** Hot reload e debugging  
✅ **Contribution-friendly:** Setup per contributi al progetto

# 3. Avvio con immagini Docker Hub precompilate
docker-compose -f docker-compose.hub.yml up -d

# 4. Accesso applicazione (URLs mostrati dal configure-ports.sh --info)
```

### 🛠️ Build Locale (Sviluppo)
```bash
# 1. Clone del repository
git clone https://github.com/Acwildweb/MyKeyManager.git
cd MyKeyManager

# 2. Avvio completo con build automatico
docker compose -f devops/docker-compose.yml up --build

# 3. Accesso all'applicazione
# Frontend: http://localhost:5173 
# Backend API: http://localhost:8000/docs
```

### 🔑 Credenziali Default
- **Username**: `admin`
- **Password**: `ChangeMe!123` 
- ⚠️ **Cambiare immediatamente dopo il primo accesso!**

> 🛠️ **Problemi di autenticazione?** Usa: `./clean-volumes.sh` oppure vedi [QUICK_CLEANUP.md](QUICK_CLEANUP.md)

### 🚀 Opzioni di Deployment

#### 🎯 Docker Hub All-in-One (Velocità Massima)
- **Immagine precompilata** su Docker Hub - deploy in 10 secondi
- **Un solo container** con tutto integrato
- **Zero build time** - download e avvio immediato
- **Ideale per**: Test rapidi, demo istantanee, workshop

#### 📦 All-in-One Build Locale (Massima Semplicità)
- **Un solo container** con tutti i servizi
- **Setup in 30 secondi** con configurazione automatica
- **Ideale per**: Demo, test, sviluppo locale, risorse limitate
- **Test rapido**: `./test-all-in-one.sh` per verificare compatibilità
- **Guida completa**: [ALL_IN_ONE_GUIDE.md](ALL_IN_ONE_GUIDE.md)

#### 🎯 Microservizi (Raccomandato per Produzione)
- **Container separati** per ogni servizio
- **Scalabilità ottimale** e fault tolerance
- **Ideale per**: Produzione, team development, high availability

### 🔧 Gestione Porte Avanzata
Il sistema include un **configuratore intelligente** simile a Docker Desktop:

```bash
# Configurazione automatica (rileva conflitti e suggerisce alternative)
./configure-ports.sh

# Verifica porte disponibili  
./configure-ports.sh --check

# Mostra configurazione attuale
./configure-ports.sh --info
```

📚 **Documentazione completa**: [ADVANCED_PORT_CONFIG.md](ADVANCED_PORT_CONFIG.md)

---

## 🏗️ Architettura del Sistema

### Stack Tecnologico

#### Backend
- **FastAPI** - Framework web moderno ad alte prestazioni
- **SQLAlchemy** - ORM per gestione database
- **PostgreSQL** - Database relazionale principale
- **Redis** - Cache e sessioni
- **JWT** - Autenticazione token-based
- **Uvicorn** - Server ASGI ad alte prestazioni

#### Frontend
- **React 18.3.1** - Libreria UI moderna
- **TypeScript** - Type safety e developer experience
- **Vite** - Build tool veloce e moderno
- **FontAwesome** - Sistema di icone completo
- **Responsive Design** - Mobile-first approach

#### Infrastructure
- **Docker & Docker Compose** - Containerizzazione
- **Nginx** - Web server per frontend
- **SMTP** - Sistema email configurabile
- **Git** - Versioning con sistema automatico

### Struttura del Progetto
```
MyKeyManager/
├── 📁 backend/                 # API FastAPI
│   ├── 📁 app/
│   │   ├── 📁 api/            # Routes e endpoints
│   │   ├── 📁 migrations/     # Database migrations
│   │   ├── 📄 main.py         # Entry point applicazione
│   │   ├── 📄 models.py       # Modelli SQLAlchemy
│   │   ├── 📄 security.py     # Sistema autenticazione
│   │   └── ...
│   └── 📄 pyproject.toml      # Dipendenze Python
├── 📁 frontend/               # React App
│   ├── 📁 src/
│   │   ├── 📁 components/     # Componenti riutilizzabili
│   │   ├── 📁 modules/        # Feature modules
│   │   ├── 📁 config/         # Configurazioni app
│   │   └── 📁 styles/         # Design system
│   ├── 📄 package.json       # Dipendenze Node.js
│   └── 📄 vite.config.ts     # Configurazione Vite
├── 📁 devops/                # Docker setup
│   ├── 📄 docker-compose.yml # Orchestrazione servizi
│   ├── 📄 Dockerfile.backend # Container backend
│   └── 📄 Dockerfile.frontend# Container frontend
├── 📄 README.md              # Questo file
├── 📄 VERSIONING.md          # Sistema versioning
└── 📄 start.sh              # Script avvio rapido
```

---

## 🔧 Configurazione Avanzata

### Variabili di Ambiente

Crea un file `.env` nella root del progetto o usa il configuratore automatico:

```bash
# Configurazione automatica con script intelligente
./configure-ports.sh --configure

# Oppure manuale: copia template e modifica
cp env.template .env
```

**File .env di esempio:**
```env
# =================== PORTE CONFIGURABILI ===================
# Il sistema rileva automaticamente conflitti e suggerisce alternative
FRONTEND_PORT=8080        # Default: 80, Alternative: 8080, 3000, 4000
BACKEND_PORT=8001         # Default: 8000, Alternative: 8001, 8080, 9000  
POSTGRES_PORT=5432        # Default: 5432, Alternative: 5433, 15432
REDIS_PORT=6379           # Default: 6379, Alternative: 6380, 16379

# =================== DATABASE ===================
DATABASE_URL=postgresql://user:password@postgres:5432/mykeymanager
POSTGRES_USER=mykeymanager_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=mykeymanager

# =================== SECURITY ===================
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# =================== EMAIL CONFIGURATION ===================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# =================== REDIS ===================
REDIS_URL=redis://redis:6379/0

# =================== APPLICATION ===================
DEBUG=false
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

📚 **Documentazione porte avanzata**: [ADVANCED_PORT_CONFIG.md](ADVANCED_PORT_CONFIG.md)

### Personalizzazione Branding

#### Logo Management
```typescript
// frontend/src/config/logoConfig.ts
export const LOGO_PATHS = {
  main: '/logo.svg',
  favicon: '/favicon.ico',
  // Aggiungi i tuoi loghi personalizzati
};
```

#### Icon Configuration
```typescript
// frontend/src/config/iconConfig.ts
export const ICON_STYLES = {
  solid: 'fas',      // FontAwesome Solid
  regular: 'far',    // FontAwesome Regular  
  brands: 'fab',     // FontAwesome Brands
};
```

---

## 🛠️ Sviluppo e Deployment

### Development Mode
```bash
# Backend development con hot-reload
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend development
cd frontend
npm run dev
```

### Production Build
```bash
# Build ottimizzato per produzione
docker compose -f devops/docker-compose.yml build --no-cache
docker compose -f devops/docker-compose.yml up -d
```

### Sistema di Versioning
```bash
# Incrementa versione
node frontend/scripts/version.js patch "Descrizione modifiche"
node frontend/scripts/version.js minor "Nuove funzionalità"
node frontend/scripts/version.js major "Breaking changes"

# Build automatico con versioning
./frontend/scripts/build.sh "Messaggio release"
```

---

## 📊 API Documentation

L'API REST completa è documentata automaticamente:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints Principali

#### Authentication
- `POST /api/auth/login` - Login utente
- `POST /api/auth/refresh` - Refresh token

#### Licenses
- `GET /api/licenses/` - Lista licenze
- `POST /api/licenses/` - Crea licenza
- `PUT /api/licenses/{id}` - Aggiorna licenza
- `DELETE /api/licenses/{id}` - Elimina licenza

#### Categories  
- `GET /api/categories/` - Lista categorie
- `POST /api/categories/` - Crea categoria
- `PUT /api/categories/{id}` - Aggiorna categoria

---

## 🔐 Sicurezza e Best Practices

### Configurazione di Sicurezza Raccomandata

1. **Cambia credenziali default** immediatamente
2. **Usa password complesse** per database e applicazione
3. **Configura HTTPS** in produzione con reverse proxy
4. **Limita accesso rete** ai container Docker
5. **Backup regolari** del database PostgreSQL
6. **Monitoring** dei logs applicazione

### Headers di Sicurezza Implementati
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

---

## 🚀 Roadmap e Funzionalità Future

### v1.2.0 - Q2 2025
- [ ] **Multi-tenant support** - Gestione multi-azienda
- [ ] **Advanced search** - Ricerca e filtraggio avanzato
- [ ] **Bulk operations** - Operazioni batch su licenze
- [ ] **Export/Import** - Backup e migrazione dati

### v1.3.0 - Q3 2025
- [ ] **Mobile app** - Applicazione mobile nativa
- [ ] **API webhooks** - Notifiche eventi esterni
- [ ] **Advanced analytics** - Dashboard e statistiche
- [ ] **SSO integration** - Single Sign-On enterprise

### v2.0.0 - Q4 2025
- [ ] **Microservices architecture** - Architettura distribuita
- [ ] **Kubernetes support** - Deploy cloud-native
- [ ] **Advanced AI features** - ML per ottimizzazione licenze
- [ ] **Enterprise features** - Audit trail, compliance

---

## 🤝 Contribuire al Progetto

### Development Setup
```bash
# 1. Fork del repository
git clone https://github.com/[your-username]/MyKeyManager.git

# 2. Crea branch feature
git checkout -b feature/nome-feature

# 3. Installa dependencies
cd backend && poetry install
cd ../frontend && npm install

# 4. Avvia in development mode
docker compose -f devops/docker-compose.yml up --build
```

### Code Style
- **Backend**: Black formatter + Ruff linter
- **Frontend**: Prettier + ESLint
- **Commits**: Conventional Commits format
- **Tests**: Pytest (backend) + Vitest (frontend)

---

## 📝 Changelog

### v1.1.1 (2025-08-22) - Current
- ✅ **Container All-in-One** con deploy semplificato e immagine Docker Hub precompilata
- ✅ **Sistema intelligente gestione porte** simile a Docker Desktop con auto-detection conflitti
- ✅ **3 modalità deployment flessibili**: All-in-One, Docker Hub microservizi, Build locale
- ✅ **Script configurazione automatica** per setup one-click con rilevamento conflitti
- ✅ **Docker Hub publication** completa con immagini ottimizzate (acwild/mykeymanager-*)
- ✅ **Sistema di gestione icone FontAwesome** completo con pannello amministrativo
- ✅ **Favicon dinamico** configurabile dal pannello admin
- ✅ **Integrazione FontAwesome CDN** per performance ottimali
- ✅ **Miglioramenti interfaccia utente** e usabilità
- ✅ **Sistema di branding** completamente personalizzabile
- ✅ **Configuratore automatico** per deployment flessibile

### v1.0.0 (2025-08-22) - Release Iniziale
- ✅ Sistema completo gestione licenze software
- ✅ Pannello amministrativo avanzato
- ✅ Sistema di gestione loghi personalizzabile  
- ✅ Autenticazione e autorizzazione utenti
- ✅ Interfaccia responsive moderna
- ✅ Containerizzazione Docker completa
- ✅ Sistema di versioning automatico

---

## 📞 Supporto e Contatti

### 🏢 Sviluppato da A.c. wild s.a.s
- **Indirizzo**: Via Spagna, 33 - Palermo, Italia
- **Email**: info@acwild.it
- **Siti Web**: 
  - [www.acwild.it](https://www.acwild.it)
  - [www.myeliminacode.it](https://www.myeliminacode.it)

### 🐛 Bug Reports e Feature Requests
- **GitHub Issues**: [Apri una issue](https://github.com/[username]/MyKeyManager/issues)
- **Email Support**: info@acwild.it
- **Response Time**: 24-48 ore

### 📚 Documentazione
- **Setup Guide**: [VERSIONING.md](VERSIONING.md)
- **API Docs**: http://localhost:8000/docs
- **Configuration**: Vedi sezione Configurazione Avanzata
- **🧹 Pulizia Volumi**: [VOLUME_CLEANUP_GUIDE.md](VOLUME_CLEANUP_GUIDE.md)
- **📦 All-in-One Guide**: [ALL_IN_ONE_GUIDE.md](ALL_IN_ONE_GUIDE.md)
- **🐳 Docker Hub Guide**: [DOCKER_HUB_GUIDE.md](DOCKER_HUB_GUIDE.md)

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli completi.

```
MIT License

Copyright (c) 2025 A.c. wild s.a.s

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

⭐ **Se questo progetto ti è stato utile, considera di lasciare una stella su GitHub!**

---

**MyKeyManager v1.1.0** - © 2025 A.c. wild s.a.s - Tutti i diritti riservati
