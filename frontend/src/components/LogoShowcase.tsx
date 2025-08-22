import React, { useState } from 'react';
import Logo from './Logo';
import { spacing, colors, borderRadius, shadows, fontSize, fontWeight } from '../styles/design-system';

export const LogoShowcase: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<'1' | '2' | '3' | '4'>('1');
  const variants: Array<'1' | '2' | '3' | '4'> = ['1', '2', '3', '4'];
  
  return (
    <div style={{
      padding: spacing['2xl'],
      background: 'white',
      borderRadius: borderRadius['2xl'],
      boxShadow: shadows.lg,
      margin: spacing.xl,
    }}>
      <h2 style={{
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xl,
        textAlign: 'center',
        color: colors.gray[800],
      }}>
        🎨 Galleria Loghi MyKeyManager
      </h2>
      
      {/* Griglia delle varianti */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.lg,
        marginBottom: spacing['2xl'],
      }}>
        {variants.map((variant) => (
          <div
            key={variant}
            onClick={() => setSelectedVariant(variant)}
            style={{
              padding: spacing.lg,
              border: `2px solid ${selectedVariant === variant ? colors.primary[500] : colors.gray[200]}`,
              borderRadius: borderRadius.xl,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: selectedVariant === variant ? colors.primary[50] : 'white',
            }}
          >
            <div style={{ marginBottom: spacing.md }}>
              <Logo size="lg" variant={variant} />
            </div>
            <div style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              color: selectedVariant === variant ? colors.primary[700] : colors.gray[600],
            }}>
              Variante {variant}
            </div>
          </div>
        ))}
      </div>
      
      {/* Preview della variante selezionata */}
      <div style={{
        background: colors.gradients.primary,
        borderRadius: borderRadius.xl,
        padding: spacing['2xl'],
        textAlign: 'center',
        color: 'white',
      }}>
        <h3 style={{
          fontSize: fontSize.xl,
          fontWeight: fontWeight.bold,
          marginBottom: spacing.lg,
          margin: 0,
        }}>
          Preview - Variante {selectedVariant}
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.lg,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: spacing.sm }}>
              <Logo size="sm" variant={selectedVariant} />
            </div>
            <div style={{ fontSize: fontSize.xs }}>Piccolo</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: spacing.sm }}>
              <Logo size="md" variant={selectedVariant} />
            </div>
            <div style={{ fontSize: fontSize.xs }}>Medio</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: spacing.sm }}>
              <Logo size="lg" variant={selectedVariant} />
            </div>
            <div style={{ fontSize: fontSize.xs }}>Grande</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: spacing.sm }}>
              <Logo size="xl" variant={selectedVariant} animated={true} />
            </div>
            <div style={{ fontSize: fontSize.xs }}>Extra Large (Animato)</div>
          </div>
        </div>
      </div>
      
      <div style={{
        marginTop: spacing.lg,
        textAlign: 'center',
        fontSize: fontSize.sm,
        color: colors.gray[600],
      }}>
        💡 Clicca su una variante per visualizzare l'anteprima in diverse dimensioni
      </div>
    </div>
  );
};

export default LogoShowcase;
