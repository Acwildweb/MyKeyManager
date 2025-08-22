# MyKeyManager

Sistema di gestione licenze (single-user) composto da backend FastAPI e frontend React/Vite.

## Funzionalità iniziali
- Autenticazione a singolo utente (token JWT)
- CRUD categorie e licenze
- Tracciamento ultima data di utilizzo licenza
- Invio email automatico all'utilizzo (info@acwild.it)
- Download link ISO associato alla licenza
- Rate limiting & CORS
- Container Docker separati (backend, frontend, Postgres, Redis, SMTP)

## Sicurezza
- Utente non-root nei container
- Dipendenze minime
- Rate limiting
- Headers di sicurezza (frontend nginx)
- Secret key configurabile via env
- Password hash con bcrypt

## Avvio (development rapido)
```bash
docker compose -f devops/docker-compose.yml up --build
```
Backend: http://localhost:8000/docs  Frontend: http://localhost:5173

Credenziali default: admin / ChangeMe!123 (cambiare appena possibile!)

## TODO prossime release
- Interfaccia di login + gestione token lato frontend
- Ricerca / filtraggio licenze
- Upload icone vendor dinamiche
- Gestione categorie con icone predefinite (Windows 11, Windows 10, etc.)
- Audit log utilizzi
- Hardening CSP più restrittiva
- Test automatici
