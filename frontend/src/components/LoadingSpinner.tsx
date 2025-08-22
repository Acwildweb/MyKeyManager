import React from 'react';
import Logo from './Logo';
import { getLogoVariant, isAnimationEnabled } from '../config/logoConfig';
import { spacing, fontSize, fontWeight, colors } from '../styles/design-system';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Caricamento...', 
  size = 'md' 
}) => {
  const logoSize = size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl';
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing['2xl'],
    }}>
      <div style={{
        position: 'relative',
        display: 'inline-block',
      }}>
        <Logo 
          size={logoSize} 
          variant={getLogoVariant('loading')} 
          animated={isAnimationEnabled('loadingSpinner')}
          style={{
            opacity: 0.8,
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          border: '3px solid transparent',
          borderTop: `3px solid ${colors.primary[500]}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
      
      <span style={{
        fontSize: fontSize.base,
        fontWeight: fontWeight.medium,
        color: colors.gray[600],
        textAlign: 'center',
      }}>
        {message}
      </span>
    </div>
  );
};

export default LoadingSpinner;
