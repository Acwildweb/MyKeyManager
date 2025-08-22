import React, { useEffect, useState } from 'react';
import { getIconConfig, ICON_MAPPING, type IconStyle } from '../config/iconConfig';

interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  color?: string;
  className?: string;
  name?: keyof typeof ICON_MAPPING;
  style?: IconStyle;
}

// Mappatura FontAwesome per dimensioni
const sizeClassMap = {
  xs: 'fa-xs',
  sm: 'fa-sm',
  md: 'fa-lg',
  lg: 'fa-xl',
  xl: 'fa-2x',
  '2xl': 'fa-3x',
  '3xl': 'fa-4x',
  '4xl': 'fa-5x'
} as const;

// Componente base per le icone FontAwesome
export const FAIcon: React.FC<IconProps> = ({ 
  name,
  size = 'md', 
  color, 
  className = '',
  style: forcedStyle
}) => {
  const [iconConfig, setIconConfig] = useState(getIconConfig());

  useEffect(() => {
    const handleConfigChange = (event: CustomEvent) => {
      setIconConfig(event.detail);
    };

    window.addEventListener('iconConfigChanged', handleConfigChange as EventListener);
    return () => {
      window.removeEventListener('iconConfigChanged', handleConfigChange as EventListener);
    };
  }, []);

  if (!name || !ICON_MAPPING[name]) {
    return null;
  }

  const iconName = ICON_MAPPING[name];
  const iconStyle = forcedStyle || iconConfig.defaultStyle;
  
  // Costruisci le classi CSS di FontAwesome
  const stylePrefix = iconStyle === 'solid' ? 'fas' : iconStyle === 'regular' ? 'far' : 'fab';
  const iconClasses = `${stylePrefix} fa-${iconName} ${sizeClassMap[size]} ${className}`;
  
  const iconStyles: React.CSSProperties = {
    color: color || iconConfig.color
  };

  return (
    <i 
      className={iconClasses} 
      style={iconStyles}
    />
  );
};

// Componenti specifici per retrocompatibilità
export const SecurityIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="security" />
);

export const DashboardIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="dashboard" />
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="user" />
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="settings" />
);

export const DeviceIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="device" />
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="edit" />
);

export const DeleteIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="delete" />
);

export const SaveIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="save" />
);

export const AddIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="add" />
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="search" />
);

export const FilterIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="filter" />
);

export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="back" />
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="forward" />
);

export const ChevronUpIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="up" />
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="down" />
);

export const ExitIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="logout" />
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="success" />
);

export const AlertIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="warning" />
);

export const InfoIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="info" />
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="cancel" />
);

export const HomeIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="home" />
);

export const LicenseIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="document" />
);

export const ActivityIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="forward" />
);

export const AnalyticsIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="dashboard" />
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="security" />
);

export const BuildIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="hammer" />
);

export const DatabaseIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="database" />
);

export const CodeIcon: React.FC<IconProps> = (props) => (
  <FAIcon {...props} name="code" />
);

// Legacy compatibility - Icons object with FontAwesome implementation
export const Icons = {
  // Professional icon components using FontAwesome classes
  Key: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-key ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  License: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-file-alt ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Shield: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-shield-alt ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Certificate: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-certificate ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Laptop: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-laptop ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Monitor: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-desktop ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Server: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-server ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Cloud: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-cloud ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Database: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-database ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Smartphone: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-mobile-alt ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Tablet: ({ size = 20, color = '#475569', className = '', ...props }: any) => (
    <i className={`fas fa-tablet-alt ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Plus: ({ size = 20, color = '#10b981', className = '', ...props }: any) => (
    <i className={`fas fa-plus ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Edit: ({ size = 20, color = '#3b82f6', className = '', ...props }: any) => (
    <i className={`fas fa-edit ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Trash2: ({ size = 20, color = '#dc2626', className = '', ...props }: any) => (
    <i className={`fas fa-trash ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Download: ({ size = 20, color = '#059669', className = '', ...props }: any) => (
    <i className={`fas fa-download ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Copy: ({ size = 20, color = '#6366f1', className = '', ...props }: any) => (
    <i className={`fas fa-copy ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Eye: ({ size = 20, color = '#64748b', className = '', ...props }: any) => (
    <i className={`fas fa-eye ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  EyeOff: ({ size = 20, color = '#64748b', className = '', ...props }: any) => (
    <i className={`fas fa-eye-slash ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Search: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-search ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Filter: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-filter ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Settings: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-cog ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  LogOut: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-sign-out-alt ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  User: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-user ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Calendar: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-calendar ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Clock: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-clock ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  CheckCircle: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-check-circle ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  AlertCircle: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-exclamation-circle ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  Info: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-info-circle ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  X: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-times ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  ChevronDown: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-chevron-down ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  ChevronUp: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-chevron-up ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  ChevronRight: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-chevron-right ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
  
  ChevronLeft: ({ size = 20, color = 'currentColor', className = '', ...props }: any) => (
    <i className={`fas fa-chevron-left ${className}`} style={{ fontSize: `${size}px`, color }} {...props} />
  ),
};

// Professional Icon Catalog for Selection using FontAwesome
export const iconCatalog = [
  // Security & License Icons
  { name: 'Key', component: Icons.Key, category: 'Security', faClass: 'fas fa-key' },
  { name: 'License', component: Icons.License, category: 'Security', faClass: 'fas fa-file-alt' },
  { name: 'Shield', component: Icons.Shield, category: 'Security', faClass: 'fas fa-shield-alt' },
  { name: 'Certificate', component: Icons.Certificate, category: 'Security', faClass: 'fas fa-certificate' },
  
  // Device & Technology Icons
  { name: 'Laptop', component: Icons.Laptop, category: 'Devices', faClass: 'fas fa-laptop' },
  { name: 'Monitor', component: Icons.Monitor, category: 'Devices', faClass: 'fas fa-desktop' },
  { name: 'Server', component: Icons.Server, category: 'Infrastructure', faClass: 'fas fa-server' },
  { name: 'Cloud', component: Icons.Cloud, category: 'Infrastructure', faClass: 'fas fa-cloud' },
  { name: 'Database', component: Icons.Database, category: 'Infrastructure', faClass: 'fas fa-database' },
  { name: 'Smartphone', component: Icons.Smartphone, category: 'Devices', faClass: 'fas fa-mobile-alt' },
  { name: 'Tablet', component: Icons.Tablet, category: 'Devices', faClass: 'fas fa-tablet-alt' },
  
  // Professional Actions
  { name: 'Plus', component: Icons.Plus, category: 'Actions', faClass: 'fas fa-plus' },
  { name: 'Edit', component: Icons.Edit, category: 'Actions', faClass: 'fas fa-edit' },
  { name: 'Copy', component: Icons.Copy, category: 'Actions', faClass: 'fas fa-copy' },
  { name: 'Download', component: Icons.Download, category: 'Actions', faClass: 'fas fa-download' },
  
  // System & General
  { name: 'User', component: Icons.User, category: 'System', faClass: 'fas fa-user' },
  { name: 'Settings', component: Icons.Settings, category: 'System', faClass: 'fas fa-cog' },
  { name: 'Calendar', component: Icons.Calendar, category: 'System', faClass: 'fas fa-calendar' },
  { name: 'Clock', component: Icons.Clock, category: 'System', faClass: 'fas fa-clock' },
  { name: 'Search', component: Icons.Search, category: 'System', faClass: 'fas fa-search' },
  { name: 'Filter', component: Icons.Filter, category: 'System', faClass: 'fas fa-filter' },
];
