import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { LogoManagementPanel } from '../../components/LogoManagementPanel';
// import { IconManagementPanel } from '../../components/IconManagementPanel';
import { DESIGN_SYSTEM, colors, spacing, shadows, fontSize, fontWeight, borderRadius } from '../../styles/design-system';

interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_from: string | null;
  smtp_use_tls: boolean | null;
}

interface UserUpdate {
  username?: string;
  email?: string;
  full_name?: string;
  password?: string;
}

interface SMTPSettings {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password: string | null;
  smtp_from: string | null;
  smtp_use_tls: boolean;
}

interface SMTPUpdate {
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_from?: string;
  smtp_use_tls?: boolean;
}

const Icons = {
  User: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Mail: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Lock: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <circle cx="12" cy="16" r="1"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Settings: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Save: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17,21 17,13 7,13 7,21"/>
      <polyline points="7,3 7,8 15,8"/>
    </svg>
  ),
  X: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18"/>
      <path d="M6 6l12 12"/>
    </svg>
  ),
  Refresh: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  ),
};

export default function UserSettings({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [smtpSettings, setSMTPSettings] = useState<SMTPSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'smtp' | 'branding' | 'icons'>('profile');
  const [showLogoPanel, setShowLogoPanel] = useState(false);
  const [showIconPanel, setShowIconPanel] = useState(false);
  
  const [formData, setFormData] = useState<UserUpdate>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [smtpData, setSMTPData] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_from: '',
    smtp_use_tls: true
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSMTPSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setProfile(res.data);
      setFormData({
        username: res.data.username,
        email: res.data.email || '',
        full_name: res.data.full_name || ''
      });
    } catch (error) {
      alert('❌ Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const loadSMTPSettings = async () => {
    try {
      const res = await api.get('/users/me/smtp');
      setSMTPSettings(res.data);
      setSMTPData({
        smtp_host: res.data.smtp_host || '',
        smtp_port: res.data.smtp_port || 587,
        smtp_username: res.data.smtp_username || '',
        smtp_password: '', // Non caricare mai la password per sicurezza
        smtp_from: res.data.smtp_from || '',
        smtp_use_tls: res.data.smtp_use_tls ?? true
      });
    } catch (error) {
      console.error('Errore caricamento impostazioni SMTP:', error);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', formData);
      setProfile(res.data);
      alert('✅ Profilo aggiornato con successo!');
    } catch (error: any) {
      alert(`❌ Errore: ${error.response?.data?.detail || 'Errore nell\'aggiornamento'}`);
    } finally {
      setSaving(false);
    }
  };

  const updateSMTPSettings = async () => {
    setSaving(true);
    try {
      // Prepara i dati da inviare, escludendo campi vuoti
      const updateData: SMTPUpdate = {};
      if (smtpData.smtp_host) updateData.smtp_host = smtpData.smtp_host;
      if (smtpData.smtp_port) updateData.smtp_port = smtpData.smtp_port;
      if (smtpData.smtp_username) updateData.smtp_username = smtpData.smtp_username;
      if (smtpData.smtp_password) updateData.smtp_password = smtpData.smtp_password;
      if (smtpData.smtp_from) updateData.smtp_from = smtpData.smtp_from;
      updateData.smtp_use_tls = smtpData.smtp_use_tls;

      await api.put('/users/me/smtp', updateData);
      alert('✅ Impostazioni SMTP aggiornate con successo!');
      loadSMTPSettings(); // Ricarica le impostazioni
    } catch (error: any) {
      alert(`❌ Errore: ${error.response?.data?.detail || 'Errore nell\'aggiornamento SMTP'}`);
    } finally {
      setSaving(false);
    }
  };

  const testSMTPConnection = async () => {
    setSaving(true);
    try {
      // Prepara i dati per il test
      const testData: SMTPUpdate = {};
      if (smtpData.smtp_host) testData.smtp_host = smtpData.smtp_host;
      if (smtpData.smtp_port) testData.smtp_port = smtpData.smtp_port;
      if (smtpData.smtp_username) testData.smtp_username = smtpData.smtp_username;
      if (smtpData.smtp_password) testData.smtp_password = smtpData.smtp_password;
      testData.smtp_use_tls = smtpData.smtp_use_tls;

      const response = await api.post('/users/me/smtp/test', testData);
      
      if (response.data.success) {
        // Crea un messaggio dettagliato per il successo
        const details = response.data.details;
        const successMessage = `✅ ${response.data.message}\n\n` +
                              `📡 Server: ${details.host}:${details.port || 'default'}\n` +
                              `🔒 TLS: ${details.tls}\n` +
                              `🔐 Autenticazione: ${details.authentication}\n` +
                              `✨ Status: ${details.status}`;
        
        // Mostra un alert personalizzato con stile migliore
        if (confirm(successMessage + '\n\nVuoi salvare queste impostazioni SMTP?')) {
          updateSMTPSettings();
        }
      } else {
        // Mostra errore con dettagli
        const errorMessage = `❌ ${response.data.message}\n\n` +
                           `🔍 Dettagli: ${response.data.details}\n\n` +
                           `💡 Suggerimenti:\n` +
                           `• Verifica che l'host e la porta siano corretti\n` +
                           `• Controlla username e password se richiesti\n` +
                           `• Prova ad abilitare/disabilitare TLS`;
        alert(errorMessage);
      }
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail || 'Errore nel test SMTP';
      alert(`❌ Errore durante il test SMTP\n\n🔍 Dettagli: ${errorDetail}\n\n💡 Verifica la tua connessione internet e i parametri inseriti.`);
    } finally {
      setSaving(false);
    }
  };

  const resetSMTPSettings = async () => {
    if (!confirm('Sei sicuro di voler resettare tutte le impostazioni SMTP? Verranno utilizzate le impostazioni di sistema.')) {
      return;
    }

    try {
      await api.delete('/users/me/smtp');
      alert('✅ Impostazioni SMTP resettate alle impostazioni di sistema!');
      loadSMTPSettings();
    } catch (error: any) {
      alert(`❌ Errore: ${error.response?.data?.detail || 'Errore nel reset SMTP'}`);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ Le password non coincidono');
      return;
    }

    setSaving(true);
    try {
      await api.post('/users/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      alert('✅ Password cambiata con successo!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      alert(`❌ Errore: ${error.response?.data?.detail || 'Errore nel cambio password'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: 'white',
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: `3px solid ${colors.gray[200]}`,
            borderTop: `3px solid ${colors.primary[500]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <span>Caricamento profilo...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing.lg,
    }}>
      <div style={{
        background: 'white',
        borderRadius: borderRadius.xl,
        padding: 0,
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: shadows.xl,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.xl,
          borderBottom: `1px solid ${colors.gray[200]}`,
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: fontSize['2xl'],
              fontWeight: fontWeight.bold,
              color: colors.gray[900],
              fontFamily: "'Poppins', sans-serif",
            }}>
              ⚙️ Impostazioni Utente
            </h2>
            <p style={{
              margin: 0,
              marginTop: spacing.xs,
              fontSize: fontSize.sm,
              color: colors.gray[600],
            }}>
              Gestisci il tuo profilo e le impostazioni
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: spacing.sm,
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              color: colors.gray[500],
            }}
          >
            <Icons.X />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          paddingLeft: spacing.xl,
          paddingRight: spacing.xl,
          borderBottom: `1px solid ${colors.gray[200]}` 
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'profile' ? `2px solid ${colors.primary[500]}` : '2px solid transparent',
              color: activeTab === 'profile' ? colors.primary[500] : colors.gray[600],
              fontWeight: activeTab === 'profile' ? fontWeight.semibold : fontWeight.normal,
              cursor: 'pointer',
              fontSize: fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Icons.User />
            Profilo
          </button>
          <button
            onClick={() => setActiveTab('smtp')}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'smtp' ? `2px solid ${colors.primary[500]}` : '2px solid transparent',
              color: activeTab === 'smtp' ? colors.primary[500] : colors.gray[600],
              fontWeight: activeTab === 'smtp' ? fontWeight.semibold : fontWeight.normal,
              cursor: 'pointer',
              fontSize: fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <Icons.Mail />
            SMTP
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'branding' ? `2px solid ${colors.primary[500]}` : '2px solid transparent',
              color: activeTab === 'branding' ? colors.primary[500] : colors.gray[600],
              fontWeight: activeTab === 'branding' ? fontWeight.semibold : fontWeight.normal,
              cursor: 'pointer',
              fontSize: fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            🎨 Branding
          </button>
          <button
            onClick={() => setActiveTab('icons')}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'icons' ? `2px solid ${colors.primary[500]}` : '2px solid transparent',
              color: activeTab === 'icons' ? colors.primary[500] : colors.gray[600],
              fontWeight: activeTab === 'icons' ? fontWeight.semibold : fontWeight.normal,
              cursor: 'pointer',
              fontSize: fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            🔧 Icone
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: spacing.xl }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
              {/* Profile Form */}
              <div>
                <h3 style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold,
                  color: colors.gray[900],
                  marginBottom: spacing.lg,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}>
                  <Icons.User />
                  Informazioni Profilo
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                  {/* Username */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      👤 Username
                    </label>
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      📧 Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="esempio@dominio.com"
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      🏷️ Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Il tuo nome completo"
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={updateProfile}
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                      padding: `${spacing.md} ${spacing.lg}`,
                      background: saving ? colors.gray[400] : colors.primary[500],
                      color: 'white',
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Icons.Save />
                    {saving ? 'Salvando...' : 'Salva Modifiche'}
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div>
                <h3 style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold,
                  color: colors.gray[900],
                  marginBottom: spacing.lg,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}>
                  <Icons.Lock />
                  Sicurezza
                </h3>

                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      background: colors.secondary[500],
                      color: 'white',
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      cursor: 'pointer',
                    }}
                  >
                    🔒 Cambia Password
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                    <input
                      type="password"
                      placeholder="Password attuale"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                      }}
                    />
                    <input
                      type="password"
                      placeholder="Nuova password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                      }}
                    />
                    <input
                      type="password"
                      placeholder="Conferma nuova password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                      }}
                    />
                    <div style={{ display: 'flex', gap: spacing.md }}>
                      <button
                        onClick={changePassword}
                        disabled={saving}
                        style={{
                          flex: 1,
                          padding: `${spacing.md} ${spacing.lg}`,
                          background: saving ? colors.gray[400] : colors.success[500],
                          color: 'white',
                          border: 'none',
                          borderRadius: borderRadius.md,
                          fontSize: fontSize.sm,
                          fontWeight: fontWeight.medium,
                          cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {saving ? 'Cambiando...' : 'Cambia Password'}
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        style={{
                          padding: `${spacing.md} ${spacing.lg}`,
                          background: colors.gray[500],
                          color: 'white',
                          border: 'none',
                          borderRadius: borderRadius.md,
                          fontSize: fontSize.sm,
                          cursor: 'pointer',
                        }}
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'smtp' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: spacing.lg 
              }}>
                <h3 style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold,
                  color: colors.gray[900],
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}>
                  <Icons.Settings />
                  Configurazione SMTP
                </h3>
                <button
                  onClick={resetSMTPSettings}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    padding: `${spacing.sm} ${spacing.md}`,
                    background: colors.gray[200],
                    color: colors.gray[700],
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontSize: fontSize.sm,
                    cursor: 'pointer',
                  }}
                >
                  <Icons.Refresh />
                  Reset
                </button>
              </div>
              
              <p style={{ 
                color: colors.gray[600], 
                marginBottom: spacing.lg,
                fontSize: fontSize.sm,
                lineHeight: '1.5'
              }}>
                Configura le impostazioni SMTP personalizzate per l'invio di email. 
                Lascia vuoto per utilizzare le impostazioni di sistema.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: spacing.md }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      🖥️ Server SMTP
                    </label>
                    <input
                      type="text"
                      value={smtpData.smtp_host}
                      onChange={(e) => setSMTPData(prev => ({ ...prev, smtp_host: e.target.value }))}
                      placeholder="es. smtp.gmail.com"
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.xs,
                    }}>
                      🔌 Porta
                    </label>
                    <input
                      type="number"
                      value={smtpData.smtp_port}
                      onChange={(e) => setSMTPData(prev => ({ ...prev, smtp_port: parseInt(e.target.value) || 587 }))}
                      placeholder="587"
                      style={{
                        width: '100%',
                        padding: spacing.md,
                        border: `1px solid ${colors.gray[300]}`,
                        borderRadius: borderRadius.md,
                        fontSize: fontSize.sm,
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.xs,
                  }}>
                    👤 Username SMTP
                  </label>
                  <input
                    type="text"
                    value={smtpData.smtp_username}
                    onChange={(e) => setSMTPData(prev => ({ ...prev, smtp_username: e.target.value }))}
                    placeholder="es. il tuo username"
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.xs,
                  }}>
                    🔑 Password SMTP
                  </label>
                  <input
                    type="password"
                    value={smtpData.smtp_password}
                    onChange={(e) => setSMTPData(prev => ({ ...prev, smtp_password: e.target.value }))}
                    placeholder="Lascia vuoto per non modificare"
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.xs,
                  }}>
                    📧 Email mittente
                  </label>
                  <input
                    type="email"
                    value={smtpData.smtp_from}
                    onChange={(e) => setSMTPData(prev => ({ ...prev, smtp_from: e.target.value }))}
                    placeholder="es. noreply@example.com"
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      border: `1px solid ${colors.gray[300]}`,
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                    }}
                  />
                </div>
                
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  color: colors.gray[700],
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                }}>
                  <input
                    type="checkbox"
                    checked={smtpData.smtp_use_tls}
                    onChange={(e) => setSMTPData(prev => ({ ...prev, smtp_use_tls: e.target.checked }))}
                    style={{ 
                      accentColor: colors.primary[500],
                      width: '16px',
                      height: '16px' 
                    }}
                  />
                  🔒 Usa TLS (raccomandato)
                </label>
                
                <div style={{ display: 'flex', gap: spacing.md }}>
                  <button
                    type="button"
                    onClick={testSMTPConnection}
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                      padding: `${spacing.md} ${spacing.lg}`,
                      background: saving ? colors.gray[400] : colors.secondary[500],
                      color: 'white',
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Icons.Settings />
                    {saving ? 'Testando...' : '🧪 Testa Connessione'}
                  </button>
                  
                  <button
                    onClick={updateSMTPSettings}
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                      padding: `${spacing.md} ${spacing.lg}`,
                      background: saving ? colors.gray[400] : colors.primary[500],
                      color: 'white',
                      border: 'none',
                      borderRadius: borderRadius.md,
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      flex: 1,
                    }}
                  >
                    <Icons.Save />
                    {saving ? 'Salvando...' : 'Salva Impostazioni SMTP'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
              <div>
                <h3 style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold,
                  color: colors.gray[900],
                  marginBottom: spacing.lg,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}>
                  🎨 Gestione Loghi e Branding
                </h3>
                
                <div style={{
                  background: colors.gray[50],
                  padding: spacing.lg,
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing.lg,
                }}>
                  <p style={{
                    fontSize: fontSize.sm,
                    color: colors.gray[700],
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    Personalizza l'aspetto dell'applicazione scegliendo i loghi da utilizzare 
                    nelle diverse sezioni. Puoi configurare loghi specifici per login, header, 
                    loading e favicon.
                  </p>
                </div>

                <button
                  onClick={() => setShowLogoPanel(true)}
                  style={{
                    background: colors.gradients.primary,
                    color: 'white',
                    border: 'none',
                    padding: `${spacing.lg} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.semibold,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    boxShadow: shadows.md,
                    transition: 'all 0.2s ease',
                    width: 'fit-content',
                    marginBottom: spacing.lg,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = shadows.lg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = shadows.md;
                  }}
                >
                  🖼️ Gestisci Loghi
                </button>
              </div>
            </div>
          )}

          {activeTab === 'icons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
              <div>
                <h3 style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold,
                  color: colors.gray[900],
                  marginBottom: spacing.lg,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                }}>
                  🔧 Gestione Set di Icone FontAwesome
                </h3>
                
                <div style={{
                  background: colors.primary[50],
                  padding: spacing.lg,
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing.xl,
                }}>
                  <p style={{
                    fontSize: fontSize.sm,
                    color: colors.primary[700],
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    Configura e personalizza i set di icone utilizzati nell'applicazione. 
                    Scegli tra i diversi stili di FontAwesome: Solid, Regular, e Brands. 
                    Le modifiche verranno applicate immediatamente in tutta l'applicazione.
                  </p>
                </div>

                {/* Contenuto del pannello icone integrato direttamente */}
                {/* <IconManagementPanel onClose={() => {}} /> */}
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <p>Pannello icone temporaneamente disabilitato per build</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logo Management Panel */}
        {showLogoPanel && (
          <LogoManagementPanel
            onClose={() => setShowLogoPanel(false)}
            onSave={(newConfig) => {
              // Qui puoi salvare la configurazione
              console.log('Nuova configurazione:', newConfig);
            }}
          />
        )}

        {/* Icon Management Panel */}
        {showIconPanel && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative'
            }}>
              {/* <IconManagementPanel onClose={() => setShowIconPanel(false)} /> */}
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <p>Pannello icone temporaneamente disabilitato per build</p>
                <button 
                  onClick={() => setShowIconPanel(false)}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    cursor: 'pointer'
                  }}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        {profile && (
          <div style={{
            padding: spacing.xl,
            borderTop: `1px solid ${colors.gray[200]}`,
            background: colors.gray[50],
            fontSize: fontSize.xs,
            color: colors.gray[600],
          }}>
            <p style={{ margin: 0, marginBottom: spacing.xs }}>
              <strong>Account creato:</strong> {new Date(profile.created_at).toLocaleDateString('it-IT')}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Ultimo aggiornamento:</strong> {new Date(profile.updated_at).toLocaleDateString('it-IT')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
