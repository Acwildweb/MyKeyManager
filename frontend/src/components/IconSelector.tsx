import React, { useState } from 'react';
import { DESIGN_SYSTEM } from '../styles/design-system';
import { Icons, iconCatalog } from './Icons';

interface IconSelectorProps {
  value?: string;
  onChange?: (iconName: string) => void;
  label?: string;
  className?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  value,
  onChange,
  label = 'Seleziona Icona',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = iconCatalog.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedIcon = iconCatalog.find(icon => icon.name === value);

  const containerStyles = {
    position: 'relative' as const,
    width: '100%',
  };

  const triggerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: DESIGN_SYSTEM.spacing.md,
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    border: `2px solid ${DESIGN_SYSTEM.colors.border.primary}`,
    background: DESIGN_SYSTEM.colors.background.primary,
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: DESIGN_SYSTEM.typography.body.fontWeight,
    transition: 'all 0.2s ease',
    gap: DESIGN_SYSTEM.spacing.sm,
  };

  const dropdownStyles = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    marginTop: DESIGN_SYSTEM.spacing.xs,
    background: DESIGN_SYSTEM.colors.background.primary,
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    boxShadow: DESIGN_SYSTEM.shadows.xl,
    border: `1px solid ${DESIGN_SYSTEM.colors.border.primary}`,
    zIndex: 1000,
    maxHeight: '300px',
    overflow: 'hidden',
  };

  const searchStyles = {
    width: '100%',
    padding: DESIGN_SYSTEM.spacing.md,
    border: 'none',
    borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.primary}`,
    fontSize: '0.875rem',
    fontWeight: DESIGN_SYSTEM.typography.body.fontWeight,
    outline: 'none',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
    gap: DESIGN_SYSTEM.spacing.xs,
    padding: DESIGN_SYSTEM.spacing.md,
    maxHeight: '200px',
    overflow: 'auto',
  };

  const iconItemStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: DESIGN_SYSTEM.spacing.sm,
    borderRadius: DESIGN_SYSTEM.borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '2px solid transparent',
  };

  const categoryMap = filteredIcons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, typeof filteredIcons>);

  return (
    <div style={containerStyles} className={className}>
      {label && (
        <label style={{
          fontSize: '0.875rem',
          fontWeight: DESIGN_SYSTEM.typography.body.fontWeight,
          color: DESIGN_SYSTEM.colors.text.primary,
          marginBottom: DESIGN_SYSTEM.spacing.xs,
          display: 'block',
        }}>
          {label}
        </label>
      )}

      <div
        style={triggerStyles}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border.focus;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border.primary;
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_SYSTEM.spacing.sm }}>
          {selectedIcon ? (
            <>
              <selectedIcon.component size={22} />
              <span style={{ fontWeight: DESIGN_SYSTEM.typography.body.fontWeight }}>{selectedIcon.name}</span>
            </>
          ) : (
            <span style={{ color: DESIGN_SYSTEM.colors.text.tertiary }}>Seleziona un'icona...</span>
          )}
        </div>
        <Icons.ChevronDown size={16} />
      </div>

      {isOpen && (
        <div style={dropdownStyles}>
          <input
            type="text"
            placeholder="Cerca icone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchStyles}
            autoFocus
          />

          <div style={{ maxHeight: '250px', overflow: 'auto' }}>
            {Object.entries(categoryMap).map(([category, icons]) => (
              <div key={category}>
                <div style={{
                  padding: `${DESIGN_SYSTEM.spacing.sm} ${DESIGN_SYSTEM.spacing.md}`,
                  background: DESIGN_SYSTEM.colors.background.secondary,
                  fontSize: '0.75rem',
                  fontWeight: DESIGN_SYSTEM.typography.body.fontWeight,
                  color: DESIGN_SYSTEM.colors.text.secondary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  {category}
                </div>
                <div style={gridStyles}>
                  {icons.map((icon) => (
                    <div
                      key={icon.name}
                      style={{
                        ...iconItemStyles,
                        background: value === icon.name ? DESIGN_SYSTEM.colors.background.secondary : 'transparent',
                        borderColor: value === icon.name ? DESIGN_SYSTEM.colors.border.focus : 'transparent',
                      }}
                      onClick={() => {
                        onChange?.(icon.name);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      onMouseEnter={(e) => {
                        if (value !== icon.name) {
                          e.currentTarget.style.background = DESIGN_SYSTEM.colors.background.secondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (value !== icon.name) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <icon.component size={22} />
                      <span style={{
                        fontSize: '0.75rem',
                        color: DESIGN_SYSTEM.colors.text.secondary,
                        textAlign: 'center' as const,
                        marginTop: DESIGN_SYSTEM.spacing.xs,
                        fontWeight: DESIGN_SYSTEM.typography.body.fontWeight,
                      }}>
                        {icon.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
};
