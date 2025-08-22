import React, { useState, useEffect } from 'react';
import { borderRadius, shadows } from '../styles/design-system';
import { getLogoSize, getLogoConfig } from '../config/logoConfig';

type LogoVariant = '1' | '2' | '3' | '4';
type LogoContext = 'login' | 'header' | 'favicon' | 'loading';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '3.5xl' | '4xl';
  variant?: LogoVariant;
  context?: LogoContext;
  showBackground?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

  const sizeMap = {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 80, height: 80 },
    '2xl': { width: 120, height: 120 },
    '3xl': { width: 192, height: 192 },
    '3.5xl': { width: 408, height: 408 },
    '4xl': { width: 480, height: 480 },
  };

const contextStyles: Record<string, React.CSSProperties> = {
  login: {
    borderRadius: borderRadius.full,
    boxShadow: shadows.lg,
    // Rimosso background per sfruttare la trasparenza
    padding: '12px',
  },
  header: {
    borderRadius: borderRadius.xl,
    // Ombra più sottile per immagini trasparenti
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },
  favicon: {
    borderRadius: borderRadius.sm,
  },
};

export const Logo: React.FC<LogoProps> = ({ 
  size, 
  variant = '1',
  context = 'header',
  className = '',
  style = {},
  showBackground = false,
  animated = false
}) => {
  const [currentConfig, setCurrentConfig] = useState(getLogoConfig());
  
  // Ascolta i cambiamenti della configurazione logo
  useEffect(() => {
    const handleLogoConfigChange = (event: CustomEvent) => {
      setCurrentConfig(event.detail || getLogoConfig());
    };
    
    window.addEventListener('logoConfigChanged', handleLogoConfigChange as EventListener);
    
    return () => {
      window.removeEventListener('logoConfigChanged', handleLogoConfigChange as EventListener);
    };
  }, []);

  // Se non viene specificata una dimensione, usa quella configurata per la variante
  const effectiveSize = size || currentConfig.sizes[variant as '1' | '2' | '3' | '4'] || 'md';
  const dimensions = sizeMap[effectiveSize as keyof typeof sizeMap] || sizeMap.md;
  const contextStyle = contextStyles[context] || {};
  
  const containerStyle = showBackground ? {
    ...contextStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  } : {};
  
  const animationClass = animated ? 'logo-float' : '';
  const combinedClassName = `${className} ${animationClass}`.trim();
  
  const logoElement = (
    <img
      src={`/${variant}.png`}
      alt="MyKeyManager Logo"
      className={combinedClassName}
      style={{
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
        width: 'auto',
        height: 'auto',
        objectFit: 'contain',
        objectPosition: 'center',
        ...style,
      }}
    />
  );
  
  if (showBackground) {
    return (
      <div style={containerStyle}>
        {logoElement}
      </div>
    );
  }
  
  return logoElement;
};

export default Logo;
