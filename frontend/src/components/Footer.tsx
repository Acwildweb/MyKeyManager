import React, { useState } from 'react';
import { CURRENT_VERSION, DEVELOPER_INFO, getVersionString, getShortVersion } from '../config/version';
import VersionInfo from './VersionInfo';
import { spacing, colors, fontSize, fontWeight, borderRadius } from '../styles/design-system';

interface FooterProps {
  variant?: 'full' | 'compact' | 'minimal';
  showVersion?: boolean;
  showDeveloper?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  variant = 'full',
  showVersion = true,
  showDeveloper = true,
  className = ''
}) => {
  const currentYear = new Date().getFullYear();
  const [showVersionModal, setShowVersionModal] = useState(false);

  if (variant === 'minimal') {
    return (
      <footer className={className} style={{
        textAlign: 'center',
        padding: spacing.sm,
        fontSize: fontSize.xs,
        color: colors.gray[500],
        borderTop: `1px solid ${colors.gray[200]}`,
        background: colors.gray[50],
      }}>
        {showVersion && (
          <span>{getShortVersion()} | </span>
        )}
        © {currentYear} A.c. wild s.a.s
      </footer>
    );
  }

  if (variant === 'compact') {
    return (
      <footer className={className} style={{
        padding: spacing.md,
        background: colors.gray[50],
        borderTop: `1px solid ${colors.gray[200]}`,
        fontSize: fontSize.sm,
        color: colors.gray[600],
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}>
          {showVersion && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
            }}>
              <span style={{
                background: colors.primary[100],
                color: colors.primary[700],
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: borderRadius.md,
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
              }}>
                {getShortVersion()}
              </span>
              <span style={{ fontSize: fontSize.xs, color: colors.gray[500] }}>
                {CURRENT_VERSION.date}
              </span>
            </div>
          )}
          
          {showDeveloper && (
            <div style={{
              textAlign: 'right',
              fontSize: fontSize.xs,
              color: colors.gray[500],
            }}>
              <div>{DEVELOPER_INFO.company}</div>
              <div>{DEVELOPER_INFO.email}</div>
            </div>
          )}
        </div>
      </footer>
    );
  }

  // Variant 'full' - Footer completo
  return (
    <>
    <footer className={className} style={{
      background: colors.gray[900],
      color: colors.gray[300],
      padding: `${spacing['2xl']} ${spacing.xl}`,
      fontSize: fontSize.sm,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Sezione principale */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: spacing.xl,
          marginBottom: spacing.xl,
        }}>
          {/* Informazioni applicazione */}
          {showVersion && (
            <div>
              <h4 style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
                color: 'white',
                marginBottom: spacing.md,
                margin: 0,
              }}>
                MyKeyManager
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.sm,
              }}>
                <span style={{
                  background: colors.primary[600],
                  color: 'white',
                  padding: `${spacing.xs} ${spacing.sm}`,
                  borderRadius: borderRadius.md,
                  fontSize: fontSize.xs,
                  fontWeight: fontWeight.bold,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setShowVersionModal(true)}
                onMouseOver={(e) => {
                  e.target.style.background = colors.primary[700];
                }}
                onMouseOut={(e) => {
                  e.target.style.background = colors.primary[600];
                }}>
                  {getVersionString()}
                </span>
                <span style={{ fontSize: fontSize.xs, color: colors.gray[400] }}>
                  {CURRENT_VERSION.date}
                </span>
              </div>
              <p style={{
                fontSize: fontSize.sm,
                color: colors.gray[400],
                lineHeight: 1.5,
                margin: 0,
              }}>
                Sistema avanzato per la gestione delle licenze software.
                Semplifica il controllo, il monitoraggio e l'amministrazione 
                delle tue licenze aziendali.
              </p>
            </div>
          )}

          {/* Informazioni sviluppatore */}
          {showDeveloper && (
            <div>
              <h4 style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
                color: 'white',
                marginBottom: spacing.md,
                margin: 0,
              }}>
                Sviluppato da
              </h4>
              <div style={{
                fontSize: fontSize.sm,
                color: colors.gray[300],
                lineHeight: 1.6,
              }}>
                <div style={{
                  fontWeight: fontWeight.bold,
                  color: 'white',
                  marginBottom: spacing.xs,
                }}>
                  {DEVELOPER_INFO.company}
                </div>
                <div style={{ marginBottom: spacing.xs }}>
                  {DEVELOPER_INFO.address}
                </div>
                <div style={{ marginBottom: spacing.sm }}>
                  <a 
                    href={`mailto:${DEVELOPER_INFO.email}`}
                    style={{
                      color: colors.primary[400],
                      textDecoration: 'none',
                    }}
                  >
                    {DEVELOPER_INFO.email}
                  </a>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.xs,
                }}>
                  {DEVELOPER_INFO.websites.map((website, index) => (
                    <a
                      key={index}
                      href={`https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: colors.primary[400],
                        textDecoration: 'none',
                        fontSize: fontSize.sm,
                      }}
                    >
                      🌐 {website}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Funzionalità principali */}
          <div>
            <h4 style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              color: 'white',
              marginBottom: spacing.md,
              margin: 0,
            }}>
              Funzionalità
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: fontSize.sm,
              color: colors.gray[400],
            }}>
              {CURRENT_VERSION.features.slice(0, 4).map((feature, index) => (
                <li key={index} style={{
                  marginBottom: spacing.xs,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                }}>
                  <span style={{ color: colors.primary[400] }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright e divider */}
        <div style={{
          borderTop: `1px solid ${colors.gray[700]}`,
          paddingTop: spacing.lg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: spacing.md,
        }}>
          <div style={{
            fontSize: fontSize.xs,
            color: colors.gray[500],
          }}>
            {DEVELOPER_INFO.copyright}
          </div>
          
          {showVersion && (
            <div style={{
              fontSize: fontSize.xs,
              color: colors.gray[500],
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}>
              <span>Build: {CURRENT_VERSION.build}</span>
              <span>•</span>
              <span>Versione: {getVersionString()}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
    
    {/* Version Info Modal */}
    {showVersionModal && (
      <VersionInfo 
        variant="modal" 
        onClose={() => setShowVersionModal(false)} 
      />
    )}
    </>
  );
};

export default Footer;
