import React, { useState, useEffect } from 'react';
import { setAuthToken } from '../../api/client';
import Login from '../auth/Login';
import ModernLicenseList from '../licenses/ModernLicenseList';
import UserSettings from '../admin/UserSettings';
import Logo from '../../components/Logo';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getLogoVariant } from '../../config/logoConfig';
import { DESIGN_SYSTEM, colors, spacing, shadows, fontSize, fontWeight, borderRadius } from '../../styles/design-system';

export default function AppShell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUserSettings, setShowUserSettings] = useState(false);

  useEffect(() => {
    console.log('AppShell mounted');
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  function handleLogin() {
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setAuthToken(null);
    setIsAuthenticated(false);
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.gradients.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: fontSize['2xl'],
        fontFamily: "'Poppins', sans-serif",
        fontWeight: fontWeight.medium,
      }}>
        <LoadingSpinner message="Caricamento applicazione..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        overflow: 'hidden',
      }}>
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -2,
          }}
        >
          <source src="/intro.mp4" type="video/mp4" />
          {/* Fallback per browser che non supportano video */}
        </video>
        
        {/* Overlay scuro per migliorare la leggibilità */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1,
        }} />
        
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.gray[50],
    }}>
      <header style={{
        background: 'white',
        borderBottom: `1px solid ${colors.gray[200]}`,
        padding: `${spacing.lg} ${spacing.xl}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: shadows.sm,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
        }}>
          <Logo 
            variant={getLogoVariant('header')} 
            context="header"
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
        }}>
          <div style={{
            padding: `${spacing.sm} ${spacing.md}`,
            background: colors.gray[100],
            borderRadius: borderRadius.lg,
            fontSize: fontSize.sm,
            color: colors.gray[700],
            fontWeight: fontWeight.medium,
          }}>
            👤 Admin
          </div>
          
          <button
            onClick={() => setShowUserSettings(true)}
            style={{
              background: colors.secondary[500],
              border: 'none',
              color: 'white',
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              transition: 'all 0.2s ease',
              boxShadow: shadows.md,
            }}
            title="Impostazioni Account"
          >
            ⚙️ Impostazioni
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              background: colors.gradients.primary,
              border: 'none',
              color: 'white',
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              transition: 'all 0.2s ease',
              boxShadow: shadows.md,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadows.md;
            }}
          >
            🚪 Logout
          </button>
        </div>
      </header>
      
      <main style={{
        padding: spacing.xl,
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 200px)', // Lascia spazio per il footer
      }}>
        <ModernLicenseList />
      </main>
      
      {/* Footer */}
      <Footer variant="full" showVersion={true} showDeveloper={true} />
      
      {/* User Settings Modal */}
      {showUserSettings && (
        <UserSettings onClose={() => setShowUserSettings(false)} />
      )}
    </div>
  );
}
