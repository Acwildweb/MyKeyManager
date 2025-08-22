// Configurazione centralizzata per il sistema di icone FontAwesome
export type IconStyle = 'solid' | 'regular' | 'brands';

export interface IconConfig {
  defaultStyle: IconStyle;
  availableStyles: IconStyle[];
  size: string;
  color: string;
}

export interface IconSet {
  name: string;
  style: IconStyle;
  description: string;
  preview: string[];
}

// Configurazione predefinita delle icone
export const DEFAULT_ICON_CONFIG: IconConfig = {
  defaultStyle: 'solid',
  availableStyles: ['solid', 'regular', 'brands'],
  size: '1x',
  color: '#374151'
};

// Set di icone disponibili con anteprima
export const AVAILABLE_ICON_SETS: IconSet[] = [
  {
    name: 'Solid Icons',
    style: 'solid',
    description: 'Icone piene per azioni principali e elementi importanti',
    preview: ['home', 'user', 'cog', 'chart-bar', 'lock']
  },
  {
    name: 'Regular Icons',
    style: 'regular',
    description: 'Icone outline per interfacce pulite e moderne',
    preview: ['home', 'user', 'bell', 'calendar', 'envelope']
  },
  {
    name: 'Brand Icons',
    style: 'brands',
    description: 'Icone di brand per social e servizi esterni',
    preview: ['github', 'twitter', 'linkedin', 'google', 'microsoft']
  }
];

// Mappatura delle icone utilizzate nell'applicazione
export const ICON_MAPPING = {
  // Sistema
  home: 'home',
  dashboard: 'chart-line',
  settings: 'cog',
  user: 'user',
  users: 'users',
  
  // Sicurezza
  security: 'shield-alt',
  lock: 'lock',
  unlock: 'unlock-alt',
  key: 'key',
  
  // Azioni
  edit: 'edit',
  delete: 'trash',
  save: 'save',
  cancel: 'times',
  add: 'plus',
  search: 'search',
  filter: 'filter',
  
  // Navigazione
  back: 'arrow-left',
  forward: 'arrow-right',
  up: 'arrow-up',
  down: 'arrow-down',
  
  // Status
  success: 'check-circle',
  error: 'exclamation-circle',
  warning: 'exclamation-triangle',
  info: 'info-circle',
  
  // Contenuto
  document: 'file-alt',
  image: 'image',
  video: 'video',
  download: 'download',
  upload: 'upload',
  
  // Dispositivi e tecnologia
  device: 'laptop',
  laptop: 'laptop',
  desktop: 'desktop',
  mobile: 'mobile-alt',
  tablet: 'tablet-alt',
  server: 'server',
  database: 'database',
  cloud: 'cloud',
  
  // Strumenti e costruzione
  hammer: 'hammer',
  code: 'code',
  
  // Social/Brand
  github: 'github',
  twitter: 'twitter',
  linkedin: 'linkedin',
  email: 'envelope',
  
  // UI e controlli
  'sign-out-alt': 'sign-out-alt',
  'chevron-down': 'chevron-down',
  'chevron-up': 'chevron-up',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'check-circle': 'check-circle',
  'exclamation-circle': 'exclamation-circle',
  'exclamation-triangle': 'exclamation-triangle',
  'info-circle': 'info-circle',
  calendar: 'calendar',
  clock: 'clock',
  copy: 'copy',
  eye: 'eye',
  'eye-slash': 'eye-slash',
  
  // Icone aggiuntive per compatibilità
  logout: 'sign-out-alt',
  exit: 'sign-out-alt'
};

// Funzioni per gestire la configurazione delle icone
export const getIconConfig = (): IconConfig => {
  const stored = localStorage.getItem('iconConfig');
  if (stored) {
    try {
      return { ...DEFAULT_ICON_CONFIG, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Errore nel parsing della configurazione icone:', error);
    }
  }
  return DEFAULT_ICON_CONFIG;
};

export const updateIconConfig = (config: Partial<IconConfig>): void => {
  const currentConfig = getIconConfig();
  const newConfig = { ...currentConfig, ...config };
  localStorage.setItem('iconConfig', JSON.stringify(newConfig));
  
  // Emetti evento per aggiornare i componenti
  window.dispatchEvent(new CustomEvent('iconConfigChanged', { 
    detail: newConfig 
  }));
};

export const resetIconConfig = (): void => {
  localStorage.removeItem('iconConfig');
  window.dispatchEvent(new CustomEvent('iconConfigChanged', { 
    detail: DEFAULT_ICON_CONFIG 
  }));
};
