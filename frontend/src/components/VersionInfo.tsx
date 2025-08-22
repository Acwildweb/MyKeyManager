import React from 'react';
import { CURRENT_VERSION, VERSION_HISTORY, DEVELOPER_INFO, getVersionString, getFullVersionInfo } from '../config/version';
import { spacing, colors, borderRadius, shadows, fontSize, fontWeight } from '../styles/design-system';
import { Icons } from './Icons';

interface VersionInfoProps {
  variant?: 'modal' | 'page' | 'compact';
  onClose?: () => void;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ 
  variant = 'modal',
  onClose 
}) => {
  if (variant === 'compact') {
    return (
      <div style={{
        padding: spacing.md,
        background: colors.gray[50],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.gray[200]}`,
        fontSize: fontSize.sm,
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}>
          <h4 style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            color: colors.gray[800],
            margin: 0,
          }}>
            <Icons.License size={16} color={colors.primary[700]} style={{marginRight: spacing.xs}} />
            Informazioni Versione
          </h4>
          <span style={{
            background: colors.primary[100],
            color: colors.primary[700],
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: borderRadius.md,
            fontSize: fontSize.xs,
            fontWeight: fontWeight.bold,
          }}>
            {getVersionString()}
          </span>
        </div>
        
        <div style={{
          fontSize: fontSize.xs,
          color: colors.gray[600],
          lineHeight: 1.4,
        }}>
          <div><Icons.Calendar size={14} color={colors.gray[600]} style={{marginRight: spacing.xs, display: 'inline'}} /> <strong>Data rilascio:</strong> {CURRENT_VERSION.date}</div>
          <div><Icons.Server size={14} color={colors.gray[600]} style={{marginRight: spacing.xs, display: 'inline'}} /> <strong>Build:</strong> {CURRENT_VERSION.build}</div>
          <div><Icons.User size={14} color={colors.gray[600]} style={{marginRight: spacing.xs, display: 'inline'}} /> <strong>Sviluppato da:</strong> {DEVELOPER_INFO.company}</div>
        </div>
      </div>
    );
  }

  const content = (
    <div style={{
      background: 'white',
      borderRadius: borderRadius['2xl'],
      padding: spacing['2xl'],
      maxWidth: variant === 'modal' ? '600px' : '800px',
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
        borderBottom: `2px solid ${colors.primary[100]}`,
        paddingBottom: spacing.lg,
      }}>
        <h2 style={{
          fontSize: fontSize['2xl'],
          fontWeight: fontWeight.bold,
          color: colors.gray[800],
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
        }}>
          <Icons.License size={20} color={colors.primary[700]} style={{marginRight: spacing.sm}} />
          MyKeyManager
          <span style={{
            background: colors.primary[500],
            color: 'white',
            padding: `${spacing.sm} ${spacing.lg}`,
            borderRadius: borderRadius.lg,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
          }}>
            {getVersionString()}
          </span>
        </h2>
        
        {onClose && (
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
        )}
      </div>

      {/* Informazioni versione corrente */}
      <div style={{
        background: colors.primary[50],
        border: `2px solid ${colors.primary[200]}`,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        marginBottom: spacing.xl,
      }}>
        <h3 style={{
          fontSize: fontSize.xl,
          fontWeight: fontWeight.bold,
          color: colors.primary[700],
          marginBottom: spacing.md,
          margin: 0,
        }}>
          <Icons.Server size={18} color={colors.primary[700]} style={{marginRight: spacing.sm}} />
          Versione Corrente
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.md,
          marginBottom: spacing.lg,
        }}>
          <div style={{
            background: 'white',
            padding: spacing.md,
            borderRadius: borderRadius.lg,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: fontSize['2xl'],
              fontWeight: fontWeight.bold,
              color: colors.primary[600],
            }}>
              {getVersionString()}
            </div>
            <div style={{
              fontSize: fontSize.sm,
              color: colors.gray[600],
            }}>
              Versione
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: spacing.md,
            borderRadius: borderRadius.lg,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              color: colors.secondary[700],
            }}>
              {CURRENT_VERSION.date}
            </div>
            <div style={{
              fontSize: fontSize.sm,
              color: colors.gray[600],
            }}>
              Data Rilascio
            </div>
          </div>
          
          <div style={{
            background: 'white',
            padding: spacing.md,
            borderRadius: borderRadius.lg,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.bold,
              color: colors.success[700],
            }}>
              {CURRENT_VERSION.build}
            </div>
            <div style={{
              fontSize: fontSize.sm,
              color: colors.gray[600],
            }}>
              Build
            </div>
          </div>
        </div>
      </div>

      {/* Funzionalità principali */}
      <div style={{
        marginBottom: spacing.xl,
      }}>
        <h3 style={{
          fontSize: fontSize.xl,
          fontWeight: fontWeight.bold,
          color: colors.gray[800],
          marginBottom: spacing.md,
          margin: 0,
        }}>
          <Icons.Shield size={18} color={colors.primary[700]} style={{marginRight: spacing.sm}} />
          Funzionalità Principali
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing.md,
        }}>
          {CURRENT_VERSION.features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: colors.gray[50],
                padding: spacing.md,
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.gray[200]}`,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <Icons.CheckCircle size={16} color={colors.success[500]} style={{marginRight: spacing.xs}} />
              <span style={{ fontSize: fontSize.sm, color: colors.gray[700] }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Changelog recente */}
      <div style={{
        marginBottom: spacing.xl,
      }}>
        <h3 style={{
          fontSize: fontSize.xl,
          fontWeight: fontWeight.bold,
          color: colors.gray[800],
          marginBottom: spacing.md,
          margin: 0,
        }}>
          <Icons.Edit size={18} color={colors.gray[700]} style={{marginRight: spacing.sm}} />
          Changelog Recente
        </h3>
        
        <div style={{
          background: colors.gray[50],
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          border: `1px solid ${colors.gray[200]}`,
        }}>
          {CURRENT_VERSION.changelog.slice(0, 5).map((change, index) => (
            <div
              key={index}
              style={{
                padding: spacing.sm,
                borderBottom: index < 4 ? `1px solid ${colors.gray[200]}` : 'none',
                fontSize: fontSize.sm,
                color: colors.gray[700],
                lineHeight: 1.5,
              }}
            >
              {change}
            </div>
          ))}
        </div>
      </div>

      {/* Informazioni sviluppatore */}
      <div style={{
        background: colors.gray[900],
        color: colors.gray[300],
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
      }}>
        <h3 style={{
          fontSize: fontSize.xl,
          fontWeight: fontWeight.bold,
          color: 'white',
          marginBottom: spacing.md,
          margin: 0,
        }}>
          <Icons.User size={18} color="white" style={{marginRight: spacing.sm}} />
          Informazioni Sviluppatore
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.lg,
        }}>
          <div>
            <div style={{
              fontWeight: fontWeight.bold,
              color: 'white',
              marginBottom: spacing.xs,
            }}>
              {DEVELOPER_INFO.company}
            </div>
            <div style={{ fontSize: fontSize.sm, marginBottom: spacing.xs }}>
              {DEVELOPER_INFO.address}
            </div>
            <div style={{ fontSize: fontSize.sm }}>
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
          </div>
          
          <div>
            <div style={{
              fontWeight: fontWeight.bold,
              color: 'white',
              marginBottom: spacing.xs,
            }}>
              Siti Web
            </div>
            {DEVELOPER_INFO.websites.map((website, index) => (
              <div key={index} style={{ marginBottom: spacing.xs }}>
                <a
                  href={`https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: colors.primary[400],
                    textDecoration: 'none',
                    fontSize: fontSize.sm,
                  }}
                >
                  <Icons.Cloud size={14} color={colors.primary[400]} style={{marginRight: spacing.xs, display: 'inline'}} />
                  {website}
                </a>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          borderTop: `1px solid ${colors.gray[700]}`,
          paddingTop: spacing.md,
          marginTop: spacing.lg,
          fontSize: fontSize.xs,
          color: colors.gray[500],
          textAlign: 'center',
        }}>
          {DEVELOPER_INFO.copyright}
        </div>
      </div>
    </div>
  );

  if (variant === 'modal') {
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
        {content}
      </div>
    );
  }

  return content;
};

export default VersionInfo;
