import React, { useState } from 'react';
import { api, setAuthToken } from '../../api/client';
import { DESIGN_SYSTEM, colors, spacing, shadows, fontSize, fontWeight, borderRadius } from '../../styles/design-system';
import Logo from '../../components/Logo';
import { getLogoVariant, isAnimationEnabled } from '../../config/logoConfig';
import { Icons } from '../../components/Icons';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('ChangeMe!123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Attempting login with:', { username, password });
    try {
      console.log('Making API request to /auth/login');
      
      // Crea FormData per OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      console.log('Login successful:', res.data);
      setAuthToken(res.data.access_token);
      localStorage.setItem('token', res.data.access_token);
      onLogin();
    } catch (err) {
      console.error('Login failed:', err);
      setError('Credenziali non valide');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: borderRadius['3xl'],
      padding: spacing['4xl'],
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      maxWidth: '420px',
      width: '100%',
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: spacing['2xl'],
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: `0 auto ${spacing['2xl']} auto`,
        }}>
          <Logo 
            variant={getLogoVariant('login')} 
            context="login"
            showBackground={false}
            animated={isAnimationEnabled('loginPage')}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.lg,
      }}>
        {/* Username Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
            color: colors.gray[700],
            marginBottom: spacing.sm,
          }}>
            👤 Username
          </label>
          <input 
            type="text"
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Inserisci il tuo username" 
            autoFocus 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: `${spacing.lg} ${spacing.xl}`,
              border: `2px solid ${colors.gray[200]}`,
              borderRadius: borderRadius.xl,
              fontSize: fontSize.base,
              outline: 'none',
              transition: 'all 0.2s ease',
              background: 'white',
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary[400];
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.gray[200];
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Password Field */}
        <div>
          <label style={{
            display: 'block',
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
            color: colors.gray[700],
            marginBottom: spacing.sm,
          }}>
            🔒 Password
          </label>
          <input 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Inserisci la tua password" 
            required 
            disabled={loading}
            style={{
              width: '100%',
              padding: `${spacing.lg} ${spacing.xl}`,
              border: `2px solid ${colors.gray[200]}`,
              borderRadius: borderRadius.xl,
              fontSize: fontSize.base,
              outline: 'none',
              transition: 'all 0.2s ease',
              background: 'white',
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary[400];
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.gray[200];
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? colors.gray[400] : colors.gradients.primary,
            color: 'white',
            padding: `${spacing.lg} ${spacing.xl}`,
            border: 'none',
            borderRadius: borderRadius.xl,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semibold,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            boxShadow: loading ? 'none' : shadows.lg,
            transition: 'all 0.2s ease',
            marginTop: spacing.md,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = shadows.xl;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadows.lg;
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Accesso in corso...
            </>
          ) : (
            <>
              <Icons.Shield size={16} color="white" style={{marginRight: spacing.xs}} />
              Accedi
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div style={{
            background: colors.error[50],
            border: `1px solid ${colors.error[200]}`,
            color: colors.error[700],
            padding: spacing.lg,
            borderRadius: borderRadius.lg,
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
      </form>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: spacing['2xl'],
        paddingTop: spacing.lg,
        borderTop: `1px solid ${colors.gray[200]}`,
      }}>
        <p style={{
          fontSize: fontSize.xs,
          color: colors.gray[500],
          margin: 0,
        }}>
          <Icons.Shield size={14} color={colors.gray[500]} style={{marginRight: spacing.xs, display: 'inline'}} />
          Sistema di autenticazione sicuro
        </p>
      </div>
    </div>
  );
}
