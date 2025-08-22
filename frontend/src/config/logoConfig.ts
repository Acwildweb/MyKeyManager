// Configurazione centralizzata dei loghi per MyKeyManager
// Modifica questi valori per cambiare i loghi in tutta l'applicazione

const DEFAULT_LOGO_CONFIG = {
  // Configurazione principale dei loghi
  variants: {
    // Varia tra '1', '2', '3', '4' per cambiare il logo principale
    primary: '2' as '1' | '2' | '3' | '4',
    
    // Logo specifici per contesti diversi (opzionale)
    login: '2' as '1' | '2' | '3' | '4',      // Logo nella pagina di login
    header: '2' as '1' | '2' | '3' | '4',     // Logo nell'header dell'app
    loading: '2' as '1' | '2' | '3' | '4',    // Logo nel componente loading
    favicon: '2' as '1' | '2' | '3' | '4',    // Favicon del browser
  },
  
  // Configurazione dimensioni per ogni variante
  sizes: {
    '1': 'md' as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '3.5xl' | '4xl',
    '2': 'md' as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '3.5xl' | '4xl',
    '3': 'md' as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '3.5xl' | '4xl',
    '4': 'md' as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '3.5xl' | '4xl',
  },
  
  // Impostazioni animazioni
  animations: {
    loginPage: true,      // Animazione logo nella pagina login
    loadingSpinner: true, // Animazione nel loading spinner
  },
  
  // Metadati dei loghi (per il pannello di gestione)
  metadata: {
    '1': {
      name: 'Logo Principale',
      description: 'Versione standard del logo aziendale',
      bestFor: ['Header', 'Favicon', 'Uso generale']
    },
    '2': {
      name: 'Logo Alternativo',
      description: 'Versione alternativa con colori diversi',
      bestFor: ['Login', 'Branding', 'Presentazioni']
    },
    '3': {
      name: 'Logo Compatto',
      description: 'Versione compatta per spazi ridotti',
      bestFor: ['Mobile', 'Icone', 'UI compatta']
    },
    '4': {
      name: 'Logo Esteso',
      description: 'Versione con testo o elementi aggiuntivi',
      bestFor: ['Homepage', 'Header esteso', 'Branding completo']
    }
  }
};

// Funzione per ottenere la configurazione corrente (con localStorage)
const getCurrentLogoConfig = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('logoConfig');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        // Merge con la configurazione di default per garantire tutti i campi
        return {
          ...DEFAULT_LOGO_CONFIG,
          ...parsedConfig,
          variants: { ...DEFAULT_LOGO_CONFIG.variants, ...parsedConfig.variants },
          sizes: { ...DEFAULT_LOGO_CONFIG.sizes, ...parsedConfig.sizes },
          animations: { ...DEFAULT_LOGO_CONFIG.animations, ...parsedConfig.animations }
        };
      } catch (e) {
        console.warn('Errore nel parsing della configurazione logo salvata:', e);
      }
    }
  }
  return DEFAULT_LOGO_CONFIG;
};

export const LOGO_CONFIG = getCurrentLogoConfig();

// Funzioni helper per ottenere i loghi (sempre aggiornate)
export const getLogoVariant = (context: 'primary' | 'login' | 'header' | 'loading' | 'favicon' = 'primary') => {
  const currentConfig = getCurrentLogoConfig();
  return currentConfig.variants[context] || currentConfig.variants.primary;
};

export const getLogoSize = (variant: '1' | '2' | '3' | '4') => {
  const currentConfig = getCurrentLogoConfig();
  return currentConfig.sizes[variant] || 'md';
};

// Funzione per ottenere l'intera configurazione aggiornata
export const getLogoConfig = () => {
  return getCurrentLogoConfig();
};

export const isAnimationEnabled = (context: 'loginPage' | 'loadingSpinner') => {
  const currentConfig = getCurrentLogoConfig();
  return currentConfig.animations[context] ?? false;
};

export const getLogoMetadata = (variant: '1' | '2' | '3' | '4') => {
  const currentConfig = getCurrentLogoConfig();
  return currentConfig.metadata[variant];
};

// Sistema di notifica per aggiornamenti della configurazione
export const updateLogoConfig = (newConfig: typeof DEFAULT_LOGO_CONFIG) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('logoConfig', JSON.stringify(newConfig));
    
    // Aggiorna la favicon se è cambiata
    updateFavicon(newConfig.variants.favicon);
    
    // Trigger evento personalizzato per notificare i componenti
    window.dispatchEvent(new CustomEvent('logoConfigChanged', { detail: newConfig }));
  }
};

// Funzione per aggiornare dinamicamente la favicon
export const updateFavicon = (variant: '1' | '2' | '3' | '4') => {
  if (typeof window !== 'undefined') {
    const faviconPath = LOGO_PATHS[variant];
    
    // Trova l'elemento favicon esistente
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!favicon) {
      // Se non esiste, crealo
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/png';
      document.head.appendChild(favicon);
    }
    
    // Aggiorna l'href della favicon
    favicon.href = faviconPath;
    
    // Forza il refresh della favicon nel browser
    const newFavicon = favicon.cloneNode(true) as HTMLLinkElement;
    favicon.remove();
    document.head.appendChild(newFavicon);
  }
};

// Inizializza la favicon al caricamento
export const initializeFavicon = () => {
  const currentConfig = getCurrentLogoConfig();
  updateFavicon(currentConfig.variants.favicon);
};

// Per future estensioni: percorsi personalizzati
export const LOGO_PATHS = {
  '1': '/1.png',
  '2': '/2.png', 
  '3': '/3.png',
  '4': '/4.png'
} as const;
