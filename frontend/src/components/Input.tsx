import React from 'react';
import { DESIGN_SYSTEM, colors, spacing, fontSize, inputStyles } from '../styles/design-system';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  errorMessage,
  label,
  icon,
  iconPosition = 'left',
  className = '',
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing.sm,
  };

  const inputWrapperStyles = {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  };

  const baseInputStyles = {
    ...inputStyles.base,
    paddingLeft: icon && iconPosition === 'left' ? '2.75rem' : inputStyles.base.padding.split(' ')[1],
    paddingRight: icon && iconPosition === 'right' ? '2.75rem' : inputStyles.base.padding.split(' ')[1],
    borderColor: error ? colors.error[500] : colors.gray[200],
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const iconStyles = {
    position: 'absolute' as const,
    [iconPosition]: '0.75rem',
    color: error ? colors.error[500] : colors.gray[400],
    pointerEvents: 'none' as const,
    display: 'flex',
    alignItems: 'center',
    zIndex: 1,
  };

  const labelStyles = {
    fontSize: fontSize.sm,
    fontWeight: 500,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  };

  const errorStyles = {
    fontSize: fontSize.sm,
    color: colors.error[500],
    marginTop: spacing.xs,
  };

  return (
    <div style={containerStyles} className={className}>
      {label && <label style={labelStyles}>{label}</label>}
      
      <div style={inputWrapperStyles}>
        {icon && <div style={iconStyles}>{icon}</div>}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
          disabled={disabled}
          style={baseInputStyles}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            if (!disabled && !error) {
              Object.assign(e.currentTarget.style, inputStyles.focus);
            }
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            Object.assign(e.currentTarget.style, {
              borderColor: error ? DESIGN_SYSTEM.colors.danger : DESIGN_SYSTEM.colors.border.primary,
              boxShadow: 'none',
            });
          }}
        />
      </div>
      
      {error && errorMessage && (
        <span style={errorStyles}>{errorMessage}</span>
      )}
    </div>
  );
};
