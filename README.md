# 🔑 MyKeyManager v1.1.0

> **Sistema avanzato di gestione licenze software single-user**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](devops/docker-compose.yml)
[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](frontend/src/config/version.ts)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-green.svg)](backend/pyproject.toml)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](frontend/package.json)

Sistema completo di gestione licenze software con dashboard amministrativo moderno, sistema di branding personalizzabile e containerizzazione Docker integrata.

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
- **Docker Compose** setup con un comando
- **Container separati**: Backend FastAPI, Frontend React, PostgreSQL, Redis, SMTP
- **Volumes persistenti** per database
- **Hot-reload** in development
- **Build ottimizzato** per produzione

---

## 📦 Requisiti di Sistema

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **4GB RAM** raccomandati
- **Porte**: 8000 (Backend), 5173 (Frontend), 5432 (PostgreSQL), 6379 (Redis)

---

## ⚡ Installazione Rapida

### 1. Clone del Repository
```bash
git clone https://github.com/[username]/MyKeyManager.git
cd MyKeyManager
```

### 2. Avvio con Docker Compose
```bash
# Avvio completo con build automatico
docker compose -f devops/docker-compose.yml up --build

# Oppure in background
docker compose -f devops/docker-compose.yml up --build -d
```

### 3. Accesso all'Applicazione
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/docs (Swagger UI)
- **Credenziali default**: `admin` / `ChangeMe!123` ⚠️ **Cambiare immediatamente!**

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

Crea un file `.env` nella root del progetto:

```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/mykeymanager
POSTGRES_USER=mykeymanager_user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=mykeymanager

# Security
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Redis
REDIS_URL=redis://redis:6379/0

# Application
DEBUG=false
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

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

### v1.1.0 (2025-01-22) - Current
- ✅ **Sistema di gestione icone FontAwesome** completo
- ✅ **Favicon dinamico** configurabile dal pannello admin
- ✅ **Integrazione FontAwesome CDN** per performance ottimali
- ✅ **Miglioramenti interfaccia utente** e usabilità
- ✅ **Sistema di branding** completamente personalizzabile

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
