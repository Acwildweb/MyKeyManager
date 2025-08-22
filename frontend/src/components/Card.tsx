import React from 'react';
import { DESIGN_SYSTEM } from '../styles/design-system';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  key?: string | number;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  onClick,
  key,
  style = {},
}) => {
  const paddingMap: Record<string, string> = {
    sm: DESIGN_SYSTEM.spacing.sm,
    md: DESIGN_SYSTEM.spacing.md,
    lg: DESIGN_SYSTEM.spacing.lg,
    xl: DESIGN_SYSTEM.spacing.xl,
  };

  const baseStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    boxShadow: DESIGN_SYSTEM.shadows.sm,
    border: `1px solid ${DESIGN_SYSTEM.colors.border.primary}`,
    transition: 'all 0.2s ease-in-out',
    cursor: onClick ? 'pointer' : 'default',
    padding: paddingMap[padding],
  };

  return (
    <div
      style={{...baseStyles, ...style}}
      className={className}
      onClick={onClick}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = DESIGN_SYSTEM.shadows.lg;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = DESIGN_SYSTEM.shadows.sm;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
};
