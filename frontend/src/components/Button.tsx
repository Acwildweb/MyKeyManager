import React from 'react';
import { DESIGN_SYSTEM, spacing, shadows, buttonStyles } from '../styles/design-system';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
  style = {},
}) => {
  const baseStyles: React.CSSProperties = {
    ...buttonStyles.base,
    ...(buttonStyles.sizes as any)[size],
    ...(buttonStyles.variants as any)[variant],
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    gap: spacing.sm,
  };

  const hoverStyles = disabled || loading ? {} : {
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: shadows.lg,
    }
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      style={{...baseStyles, ...style}}
      className={className}
      disabled={disabled || loading}
      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, {
            transform: 'translateY(-1px)',
            boxShadow: shadows.lg,
          });
        }
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, {
            transform: 'translateY(0)',
            boxShadow: (buttonStyles.variants as any)[variant].boxShadow || 'none',
          });
        }
      }}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      )}
    </button>
  );
};

// Add keyframes for spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
