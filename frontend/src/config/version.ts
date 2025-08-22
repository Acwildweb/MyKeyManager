// Sistema di Versioning MyKeyManager
// Gestione automatica delle versioni dell'applicazione

export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  build?: string;
  date: string;
  features: string[];
  changelog: string[];
}

// Versione corrente dell'applicazione
export const CURRENT_VERSION: VersionInfo = {
  major: 1,
  minor: 1,
  patch: 0,
  build: 'stable',
  date: '2025-01-22',
  features: [
    'Sistema di gestione licenze avanzato',
    'Autenticazione e autorizzazione utenti', 
    'Dashboard amministrativo completo',
    'Sistema di gestione loghi personalizzabile con favicon dinamico',
    'Pannello di gestione icone FontAwesome integrato',
    'Interfaccia responsive e moderna',
    'Containerizzazione Docker completa',
    'Sistema di versioning automatico',
    'Integrazione FontAwesome completa con CDN'
  ],
  changelog: [
    'v1.1.0 - Gestione icone e favicon dinamici implementata',
    'Aggiunto pannello completo di gestione icone FontAwesome',
    'Implementato sistema di favicon dinamico configurabile',
    'Integrazione FontAwesome CDN per performance ottimali',
    'Miglioramenti interfaccia utente e usabilità',
    'Sistema di branding completamente personalizzabile',
    'v1.0.0 - Release iniziale del sistema MyKeyManager'
  ]
};

// Storico delle versioni precedenti
export const VERSION_HISTORY: VersionInfo[] = [
  {
    major: 0,
    minor: 9,
    patch: 5,
    build: 'beta',
    date: '2025-08-20',
    features: [
      'Prototipo sistema gestione licenze',
      'Interfaccia utente base',
      'Sistema di autenticazione preliminare'
    ],
    changelog: [
      'v0.9.5 - Beta finale pre-release',
      'Completamento funzionalità core',
      'Testing e debugging estensivo'
    ]
  }
];

// Utility functions per la gestione delle versioni
export const getVersionString = (version: VersionInfo = CURRENT_VERSION): string => {
  const baseVersion = `${version.major}.${version.minor}.${version.patch}`;
  return version.build ? `${baseVersion}-${version.build}` : baseVersion;
};

export const getShortVersion = (version: VersionInfo = CURRENT_VERSION): string => {
  return `v${version.major}.${version.minor}.${version.patch}`;
};

export const getFullVersionInfo = (version: VersionInfo = CURRENT_VERSION): string => {
  return `${getVersionString(version)} (${version.date})`;
};

export const compareVersions = (v1: VersionInfo, v2: VersionInfo): number => {
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  return v1.patch - v2.patch;
};

export const isNewerVersion = (v1: VersionInfo, v2: VersionInfo): boolean => {
  return compareVersions(v1, v2) > 0;
};

// Informazioni sviluppatore
export const DEVELOPER_INFO = {
  company: 'A.c. wild s.a.s',
  address: 'Via Spagna, 33 - Palermo',
  websites: [
    'www.acwild.it',
    'www.myeliminacode.it'
  ],
  email: 'info@acwild.it',
  copyright: `© ${new Date().getFullYear()} A.c. wild s.a.s - Tutti i diritti riservati`
};

// Helper per incrementare versioni
export const incrementVersion = (
  version: VersionInfo, 
  type: 'major' | 'minor' | 'patch' = 'patch'
): VersionInfo => {
  const newVersion = { ...version };
  
  switch (type) {
    case 'major':
      newVersion.major += 1;
      newVersion.minor = 0;
      newVersion.patch = 0;
      break;
    case 'minor':
      newVersion.minor += 1;
      newVersion.patch = 0;
      break;
    case 'patch':
      newVersion.patch += 1;
      break;
  }
  
  newVersion.date = new Date().toISOString().split('T')[0];
  return newVersion;
};

// Export delle informazioni principali
export { CURRENT_VERSION as VERSION, DEVELOPER_INFO as DEVELOPER };
