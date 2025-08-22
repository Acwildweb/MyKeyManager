import React, { useState, useRef } from 'react';
import Logo from './Logo';
import { LOGO_CONFIG, getLogoVariant, getLogoMetadata, getLogoSize, updateLogoConfig } from '../config/logoConfig';
import { spacing, colors, borderRadius, shadows, fontSize, fontWeight } from '../styles/design-system';
import { Icons } from './Icons';

interface LogoManagementPanelProps {
  onClose: () => void;
  onSave?: (newConfig: typeof LOGO_CONFIG) => void;
}

export const LogoManagementPanel: React.FC<LogoManagementPanelProps> = ({ onClose, onSave }) => {
  const [config, setConfig] = useState(LOGO_CONFIG);
  const [uploadedLogos, setUploadedLogos] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadSlot, setCurrentUploadSlot] = useState<'1' | '2' | '3' | '4' | null>(null);
  
  const handleVariantChange = (context: keyof typeof LOGO_CONFIG.variants, variant: '1' | '2' | '3' | '4') => {
    setConfig(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [context]: variant
      }
    }));
  };

  const handleAnimationChange = (context: keyof typeof LOGO_CONFIG.animations, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      animations: {
        ...prev.animations,
        [context]: enabled
      }
    }));
  };

  const handleLogoUpload = (variant: '1' | '2' | '3' | '4', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedLogos(prev => ({
        ...prev,
        [variant]: result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDelete = (variant: '1' | '2' | '3' | '4') => {
    setUploadedLogos(prev => {
      const newLogos = { ...prev };
      delete newLogos[variant];
      return newLogos;
    });
  };

  const handleSizeChange = (variant: '1' | '2' | '3' | '4', size: string) => {
    setConfig(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [variant]: size as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '3.5xl' | '4xl'
      }
    }));
  };

  const triggerFileUpload = (variant: '1' | '2' | '3' | '4') => {
    setCurrentUploadSlot(variant);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentUploadSlot) {
      // Validazione tipo file
      if (!file.type.startsWith('image/')) {
        alert('Per favore seleziona un file immagine valido.');
        return;
      }
      
      // Validazione dimensione (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Il file è troppo grande. Massimo 5MB consentiti.');
        return;
      }
      
      handleLogoUpload(currentUploadSlot, file);
    }
    
    // Reset input per permettere ricaricamento dello stesso file
    if (event.target) {
      event.target.value = '';
    }
    setCurrentUploadSlot(null);
  };

  const handleSave = () => {
    // Salva la configurazione usando la nuova funzione
    updateLogoConfig(config);
    
    // Forza un aggiornamento della configurazione globale
    window.dispatchEvent(new CustomEvent('logoConfigChanged', { detail: config }));
    
    // Mostra un feedback di successo
    console.log('Configurazione logo salvata:', config);
    
    // Chiama la callback se fornita
    if (onSave) {
      onSave(config);
    }
    
    // Chiudi il pannello dopo un breve delay per vedere l'aggiornamento
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const VariantSelector = ({ 
    context, 
    title, 
    description 
  }: { 
    context: keyof typeof LOGO_CONFIG.variants;
    title: React.ReactNode;
    description: string;
  }) => (
    <div style={{
      background: 'white',
      padding: spacing.xl,
      borderRadius: borderRadius.xl,
      boxShadow: shadows.md,
      marginBottom: spacing.lg,
    }}>
      <h4 style={{
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        color: colors.gray[800],
        margin: 0,
      }}>
        {title}
      </h4>
      <p style={{
        fontSize: fontSize.sm,
        color: colors.gray[600],
        marginBottom: spacing.lg,
        margin: 0,
      }}>
        {description}
      </p>
      
      {/* Preview corrente */}
      <div style={{
        textAlign: 'center',
        marginBottom: spacing.lg,
        padding: spacing.md,
        background: colors.gray[50],
        borderRadius: borderRadius.lg,
      }}>
        <div style={{ marginBottom: spacing.sm }}>
          <Logo 
            size="lg" 
            variant={config.variants[context]} 
            context={context === 'header' ? 'header' : context === 'login' ? 'login' : 'header'}
          />
        </div>
        <span style={{
          fontSize: fontSize.xs,
          color: colors.gray[500],
          fontWeight: fontWeight.medium,
        }}>
          Attuale: Variante {config.variants[context]} - Dimensione: {config.sizes[config.variants[context]]}
        </span>
      </div>
      
      {/* Selettore varianti con controlli estesi */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: spacing.lg,
      }}>
        {(['1', '2', '3', '4'] as const).map((variant) => {
          const metadata = getLogoMetadata(variant);
          const isSelected = config.variants[context] === variant;
          const hasCustomImage = uploadedLogos[variant];
          
          return (
            <div
              key={variant}
              style={{
                padding: spacing.lg,
                border: `2px solid ${isSelected ? colors.primary[500] : colors.gray[200]}`,
                borderRadius: borderRadius.xl,
                background: isSelected ? colors.primary[50] : 'white',
                position: 'relative',
              }}
            >
              {/* Header della variante */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}>
                <div
                  onClick={() => handleVariantChange(context, variant)}
                  style={{
                    cursor: 'pointer',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.bold,
                    color: isSelected ? colors.primary[700] : colors.gray[700],
                  }}
                >
                  {metadata.name}
                </div>
                
                {/* Badge se personalizzato */}
                {hasCustomImage && (
                  <span style={{
                    background: colors.success[50],
                    color: colors.success[700],
                    fontSize: fontSize.xs,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.md,
                    fontWeight: fontWeight.medium,
                  }}>
                    Personalizzato
                  </span>
                )}
              </div>

              {/* Preview del logo */}
              <div 
                onClick={() => handleVariantChange(context, variant)}
                style={{
                  textAlign: 'center',
                  marginBottom: spacing.md,
                  cursor: 'pointer',
                  padding: spacing.md,
                  background: colors.gray[50],
                  borderRadius: borderRadius.lg,
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {hasCustomImage ? (
                  <img 
                    src={uploadedLogos[variant]} 
                    alt={`Logo personalizzato ${variant}`}
                    style={{
                      maxWidth: '60px',
                      maxHeight: '60px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Logo variant={variant} />
                )}
              </div>

              {/* Controlli dimensione */}
              <div style={{ marginBottom: spacing.md }}>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.xs,
                  color: colors.gray[600],
                  marginBottom: spacing.xs,
                  fontWeight: fontWeight.medium,
                }}>
                  Dimensione predefinita:
                </label>
                <select
                  value={config.sizes[variant]}
                  onChange={(e) => handleSizeChange(variant, e.target.value)}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: borderRadius.md,
                    fontSize: fontSize.sm,
                    background: 'white',
                  }}
                >
                  <option value="xs">Extra Small (24px)</option>
                  <option value="sm">Small (32px)</option>
                  <option value="md">Medium (48px)</option>
                  <option value="lg">Large (64px)</option>
                  <option value="xl">Extra Large (80px)</option>
                  <option value="2xl">2X Large (120px)</option>
                  <option value="3xl">3X Large (192px)</option>
                  <option value="3.5xl">3.5X Large (408px)</option>
                  <option value="4xl">4X Large (480px)</option>
                </select>
              </div>

              {/* Controlli upload/delete */}
              <div style={{
                display: 'flex',
                gap: spacing.xs,
              }}>
                <button
                  onClick={() => triggerFileUpload(variant)}
                  style={{
                    flex: 1,
                    background: colors.secondary[500],
                    color: 'white',
                    border: 'none',
                    padding: spacing.sm,
                    borderRadius: borderRadius.md,
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  <Icons.Plus size={16} color={colors.primary[600]} />
                  {hasCustomImage ? 'Sostituisci' : 'Carica'}
                </button>
                
                {hasCustomImage && (
                  <button
                    onClick={() => handleLogoDelete(variant)}
                    style={{
                      background: colors.error[500],
                      color: 'white',
                      border: 'none',
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.xs,
                      cursor: 'pointer',
                      minWidth: '40px',
                    }}
                  >
                    <Icons.Trash2 size={16} color="white" />
                  </button>
                )}
              </div>

              {/* Descrizione */}
              <div style={{
                fontSize: fontSize.xs,
                color: colors.gray[500],
                lineHeight: 1.3,
                marginTop: spacing.sm,
              }}>
                {metadata.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing.lg,
    }}>
      {/* Input file nascosto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <div style={{
        background: colors.gray[50],
        borderRadius: borderRadius['2xl'],
        padding: spacing['2xl'],
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing['2xl'],
        }}>
          <h2 style={{
            fontSize: fontSize['2xl'],
            fontWeight: fontWeight.bold,
            color: colors.gray[800],
            margin: 0,
          }}>
            <Icons.Settings size={20} color={colors.primary[600]} style={{marginRight: spacing.sm}} />
            Gestione Avanzata Loghi MyKeyManager
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: fontSize['2xl'],
              cursor: 'pointer',
              color: colors.gray[500],
              padding: spacing.sm,
            }}
          >
            ✕
          </button>
        </div>

        {/* Sezione gestione globale loghi */}
        <div style={{
          background: 'white',
          padding: spacing.xl,
          borderRadius: borderRadius.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.lg,
        }}>
          <h3 style={{
            fontSize: fontSize.xl,
            fontWeight: fontWeight.bold,
            color: colors.gray[800],
            margin: `0 0 ${spacing.md} 0`,
          }}>
            <Icons.Database size={18} color={colors.secondary[700]} style={{marginRight: spacing.sm}} />
            Libreria Loghi
          </h3>
          <p style={{
            fontSize: fontSize.sm,
            color: colors.gray[600],
            marginBottom: spacing.lg,
            margin: 0,
          }}>
            Gestisci tutti i loghi disponibili nell'applicazione. Puoi caricare nuovi loghi, 
            modificarne le dimensioni predefinite e assegnare ruoli specifici.
          </p>
          
          {/* Statistiche rapide */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}>
            <div style={{
              background: colors.primary[50],
              padding: spacing.md,
              borderRadius: borderRadius.lg,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
                color: colors.primary[700],
              }}>
                {Object.keys(uploadedLogos).length}
              </div>
              <div style={{
                fontSize: fontSize.xs,
                color: colors.primary[600],
              }}>
                Loghi Personalizzati
              </div>
            </div>
            
            <div style={{
              background: colors.secondary[50],
              padding: spacing.md,
              borderRadius: borderRadius.lg,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
                color: colors.secondary[700],
              }}>
                4
              </div>
              <div style={{
                fontSize: fontSize.xs,
                color: colors.secondary[700],
              }}>
                Slot Disponibili
              </div>
            </div>
          </div>
        </div>

        {/* Selettori per ogni contesto */}
        <VariantSelector 
          context="login" 
          title={<><Icons.Shield size={16} color={colors.primary[700]} style={{marginRight: spacing.xs}} />Logo Pagina di Login</>}
          description="Logo visualizzato nella pagina di accesso dell'applicazione"
        />
        
        <VariantSelector 
          context="header" 
          title={<><Icons.Monitor size={16} color={colors.primary[700]} style={{marginRight: spacing.xs}} />Logo Header Applicazione</>}
          description="Logo visualizzato nell'intestazione dell'applicazione principale"
        />
        
        <VariantSelector 
          context="loading" 
          title={<><Icons.Clock size={16} color={colors.primary[700]} style={{marginRight: spacing.xs}} />Logo Loading Spinner</>}
          description="Logo utilizzato durante il caricamento dell'applicazione"
        />
        
        <VariantSelector 
          context="favicon" 
          title={<><Icons.Laptop size={16} color={colors.primary[700]} style={{marginRight: spacing.xs}} />Favicon Browser</>}
          description="Icona visualizzata nella tab del browser (richiede ricaricamento pagina)"
        />

        {/* Impostazioni Animazioni */}
        <div style={{
          background: 'white',
          padding: spacing.xl,
          borderRadius: borderRadius.xl,
          boxShadow: shadows.md,
          marginBottom: spacing.lg,
        }}>
          <h4 style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            marginBottom: spacing.lg,
            color: colors.gray[800],
            margin: 0,
          }}>
            <Icons.Settings size={18} color={colors.secondary[700]} style={{marginRight: spacing.sm}} />
            Impostazioni Animazioni
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={config.animations.loginPage}
                onChange={(e) => handleAnimationChange('loginPage', e.target.checked)}
                style={{ marginRight: spacing.sm }}
              />
              <span style={{ fontSize: fontSize.sm, color: colors.gray[700] }}>
                Animazione logo nella pagina di login
              </span>
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={config.animations.loadingSpinner}
                onChange={(e) => handleAnimationChange('loadingSpinner', e.target.checked)}
                style={{ marginRight: spacing.sm }}
              />
              <span style={{ fontSize: fontSize.sm, color: colors.gray[700] }}>
                Animazione logo nel loading spinner
              </span>
            </label>
          </div>
        </div>

        {/* Bottoni di azione */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: spacing.md,
          marginTop: spacing['2xl'],
        }}>
          <button
            onClick={onClose}
            style={{
              background: colors.gray[500],
              color: 'white',
              border: 'none',
              padding: `${spacing.md} ${spacing.xl}`,
              borderRadius: borderRadius.lg,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            <Icons.X size={16} color="white" style={{marginRight: spacing.xs}} />
            Annulla
          </button>
          
          <button
            onClick={handleSave}
            style={{
              background: colors.gradients.primary,
              color: 'white',
              border: 'none',
              padding: `${spacing.md} ${spacing.xl}`,
              borderRadius: borderRadius.lg,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              cursor: 'pointer',
              boxShadow: shadows.md,
            }}
          >
            <Icons.CheckCircle size={16} color="white" style={{marginRight: spacing.xs}} />
            Salva Configurazione
          </button>
        </div>

        {/* Nota informativa */}
        <div style={{
          marginTop: spacing.lg,
          padding: spacing.lg,
          background: colors.primary[50],
          border: `1px solid ${colors.primary[200]}`,
          borderRadius: borderRadius.lg,
          fontSize: fontSize.sm,
          color: colors.primary[700],
        }}>
          <h4 style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            marginBottom: spacing.sm,
            margin: 0,
            color: colors.primary[700],
          }}>
            <Icons.Info size={18} color={colors.primary[700]} style={{marginRight: spacing.sm}} />
            Guida alla Gestione Loghi
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: spacing.lg,
            lineHeight: 1.6,
          }}>
            <li><strong>Caricamento:</strong> Supportati JPG, PNG, SVG. Dimensione massima: 5MB</li>
            <li><strong>Dimensioni:</strong> Le dimensioni predefinite si applicano a tutte le istanze del logo</li>
            <li><strong>Personalizzazione:</strong> I loghi personalizzati sovrascrivono quelli di default</li>
            <li><strong>Anteprima:</strong> Le modifiche sono visibili immediatamente nell'applicazione</li>
            <li><strong>Backup:</strong> I loghi originali rimangono sempre disponibili</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogoManagementPanel;
