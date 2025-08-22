# 🏷️ Sistema di Versioning MyKeyManager

Questo documento descrive il sistema di versioning implementato per MyKeyManager, che permette di gestire automaticamente le versioni dell'applicazione e tenere traccia delle modifiche.

## 📋 Panoramica

Il sistema di versioning segue il formato **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Incremento per breaking changes
- **MINOR**: Incremento per nuove funzionalità
- **PATCH**: Incremento per bug fix e piccole modifiche

**Versione corrente**: `v1.0.0` (Release iniziale)

## 🗂️ Struttura File

### File di Configurazione
- `frontend/src/config/version.ts` - Configurazione versione e metadati
- `frontend/scripts/version.js` - Script per gestione automatica versioning  
- `frontend/scripts/build.sh` - Script di build automatico con incremento versione

### Componenti UI
- `frontend/src/components/Footer.tsx` - Footer con informazioni versione
- `frontend/src/components/VersionInfo.tsx` - Modal dettagliato informazioni versione

## 🚀 Utilizzo

### 1. Incremento Manuale Versione

```bash
# Incrementa patch version (1.0.0 → 1.0.1)
node frontend/scripts/version.js patch "Correzione bug nel login"

# Incrementa minor version (1.0.0 → 1.1.0) 
node frontend/scripts/version.js minor "Aggiunta gestione utenti"

# Incrementa major version (1.0.0 → 2.0.0)
node frontend/scripts/version.js major "Nuova architettura API"

# Visualizza versione corrente
node frontend/scripts/version.js current
```

### 2. Build Automatico con Versioning

```bash
# Build completo con incremento automatico patch version
./frontend/scripts/build.sh "Messaggio delle modifiche"
```

Questo script:
- Incrementa automaticamente la patch version
- Ricompila il container Docker
- Riavvia l'applicazione

### 3. Informazioni Versione nell'UI

- **Footer**: Mostra versione corrente con pulsante cliccabile
- **Modal Versione**: Click sulla versione nel footer per dettagli completi
- **Informazioni Sviluppatore**: Sempre visibili nel footer

## 🏗️ Informazioni Sviluppatore

**Sviluppato da**: A.c. wild s.a.s  
**Indirizzo**: Via Spagna, 33 - Palermo  
**Email**: info@acwild.it  
**Siti Web**: 
- www.acwild.it
- www.myeliminacode.it

## 📝 Workflow Consigliato

### Per ogni modifica:

1. **Sviluppo**: Apporta le modifiche al codice
2. **Testing**: Verifica che tutto funzioni correttamente  
3. **Versioning**: Incrementa la versione appropriata
   ```bash
   node frontend/scripts/version.js patch "Descrizione modifiche"
   ```
4. **Build**: Ricompila l'applicazione
   ```bash
   cd devops && docker compose build --no-cache frontend && docker compose up -d
   ```

### Per release importanti:

```bash
# Usa lo script automatico
./frontend/scripts/build.sh "Release v1.1.0 - Nuove funzionalità utenti"
```

## 🔧 Personalizzazione

### Modifica Metadati Versione

Edita `frontend/src/config/version.ts`:

```typescript
export const CURRENT_VERSION: VersionInfo = {
  major: 1,
  minor: 0, 
  patch: 0,
  build: 'stable',
  date: '2025-08-22',
  features: [
    'Le tue funzionalità...'
  ],
  changelog: [
    'I tuoi changelog...'
  ]
};
```

### Modifica Informazioni Sviluppatore

```typescript
export const DEVELOPER_INFO = {
  company: 'Il tuo nome azienda',
  address: 'Il tuo indirizzo',
  websites: ['www.tuosito.it'],
  email: 'tua@email.it'
};
```

## 📊 Cronologia Versioni

### v1.0.0 (2025-08-22) - Release Iniziale
- ✅ Sistema completo gestione licenze software
- ✅ Pannello amministrativo avanzato  
- ✅ Sistema di gestione loghi personalizzabile
- ✅ Autenticazione e autorizzazione utenti
- ✅ Interfaccia responsive moderna
- ✅ Containerizzazione Docker completa
- ✅ Sistema di versioning automatico

## 🤖 Automazione Future

### Possibili miglioramenti:
- Integrazione con Git hooks per versioning automatico
- CI/CD pipeline con GitHub Actions
- Changelog automatico da commit messages
- Backup automatico versioni precedenti
- Notifiche di aggiornamento in-app

## 🆘 Troubleshooting

### Script non eseguibile
```bash
chmod +x frontend/scripts/build.sh
```

### Errori Node.js
Assicurati di avere Node.js installato per usare gli script di versioning.

### Problemi Docker
```bash
# Reset completo
cd devops
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

**MyKeyManager v1.0.0** - © 2025 A.c. wild s.a.s - Tutti i diritti riservati
