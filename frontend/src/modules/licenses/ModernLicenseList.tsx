import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { DESIGN_SYSTEM, colors, spacing, shadows, fontSize, fontWeight, borderRadius } from '../../styles/design-system';

interface License {
  id: number;
  product_name: string;
  edition?: string;
  vendor?: string;
  version?: string;
  license_key: string;
  iso_url?: string;
  category_id: number;
  last_used_at?: string;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
}

interface LicenseForm {
  product_name: string;
  edition?: string;
  vendor?: string;
  version?: string;
  license_key: string;
  iso_url?: string;
  category_id: number;
}

interface CategoryForm {
  name: string;
  icon: string;
}

// Modern SVG Icons
const Icons = {
  Plus: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14"/>
      <path d="M12 5v14"/>
    </svg>
  ),
  Download: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7,10 12,15 17,10"/>
      <line x1="12" x2="12" y1="15" y2="3"/>
    </svg>
  ),
  Copy: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  ),
  Eye: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  ),
  Search: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Filter: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
    </svg>
  ),
  Laptop: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
    </svg>
  ),
  Monitor: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="14" x="2" y="3" rx="2" ry="2"/>
      <line x1="8" x2="16" y1="21" y2="21"/>
      <line x1="12" x2="12" y1="17" y2="21"/>
    </svg>
  ),
  Key: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="8" r="6"/>
      <path d="m13 13 5 5"/>
      <path d="m13 13 1 1"/>
    </svg>
  ),
  Calendar: () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  X: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  Edit: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      <line x1="10" x2="10" y1="11" y2="17"/>
      <line x1="14" x2="14" y1="11" y2="17"/>
    </svg>
  ),
  // Windows and Office Icons
  Windows11: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
    </svg>
  ),
  Windows10: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5.5h7.5V12H3V5.5zm8.5 0H21V12h-9.5V5.5zM3 13h7.5v6.5H3V13zm8.5 0H21v6.5h-9.5V13z"/>
    </svg>
  ),
  Office2019: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.5 4.5v15h-19v-15h19zm-17 2v11h15v-11h-15zm13 2v3h-3v-3h3zm-5 0v3h-3v-3h3zm-5 0v3h-3v-3h3zm0 5v3h-3v-3h3zm5 0v3h-3v-3h3zm5 0v3h-3v-3h3z"/>
    </svg>
  ),
  Office2021: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-2-12H7v2h10V7zm0 4H7v2h10v-2zm-4 4H7v2h6v-2z"/>
    </svg>
  ),
  Office2024: () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l10 4v12l-10 4L2 18V6l10-4zm8 5.5L12 4.5 4 7.5v9l8 3 8-3v-9z"/>
      <path d="M12 8l-6 2.5v3L12 16l6-2.5v-3L12 8z"/>
    </svg>
  ),
};

const iconMap: Record<string, () => JSX.Element> = {
  Laptop: Icons.Laptop,
  Monitor: Icons.Monitor,
  DeviceDesktop: Icons.Monitor,
  Key: Icons.Key,
  Calendar: Icons.Calendar,
  Windows11: Icons.Windows11,
  Windows10: Icons.Windows10,
  Office2019: Icons.Office2019,
  Office2021: Icons.Office2021,
  Office2024: Icons.Office2024,
};

const iconCatalog = [
  { name: 'Windows11', component: Icons.Windows11, label: 'Windows 11' },
  { name: 'Windows10', component: Icons.Windows10, label: 'Windows 10' },
  { name: 'Office2019', component: Icons.Office2019, label: 'Office 2019' },
  { name: 'Office2021', component: Icons.Office2021, label: 'Office 2021' },
  { name: 'Office2024', component: Icons.Office2024, label: 'Office 2024' },
];

export default function ModernLicenseList() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [newLicense, setNewLicense] = useState<LicenseForm>({
    product_name: '',
    edition: '',
    vendor: '',
    version: '',
    license_key: '',
    iso_url: '',
    category_id: 0
  });
  const [newCategory, setNewCategory] = useState<CategoryForm>({ name: '', icon: '' });
  const [expandedLicense, setExpandedLicense] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [editingCategory, setEditingCategory] = useState<{name: string, icon: string} | null>(null);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<Category | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [licensesRes, categoriesRes] = await Promise.all([
        api.get('/licenses/'),
        api.get('/categories/')
      ]);
      setLicenses(licensesRes.data);
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0) {
        setNewLicense(prev => ({ ...prev, category_id: categoriesRes.data[0].id }));
      }
    } catch (e) {
      console.error('Errore caricamento:', e);
      alert('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  }

  async function useLicense(id: number) {
    setLoading(true);
    try {
      const res = await api.post(`/licenses/${id}/use/`, { iso_download: true });
      setLicenses(prev => prev.map(l => l.id === id ? { ...l, last_used_at: res.data.last_used_at } : l));
      alert('✅ Licenza utilizzata con successo!');
    } catch (e) {
      alert('❌ Errore utilizzo licenza');
    } finally {
      setLoading(false);
    }
  }

  async function createLicense() {
    if (!newLicense.product_name || !newLicense.license_key) {
      alert('⚠️ Nome prodotto e chiave sono obbligatori');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/licenses/', newLicense);
      setLicenses(prev => [...prev, res.data]);
      setNewLicense({ product_name: '', edition: '', vendor: '', version: '', license_key: '', iso_url: '', category_id: categories[0]?.id || 1 });
      setShowLicenseModal(false);
      alert('✅ Licenza creata con successo!');
    } catch {
      alert('❌ Errore creazione licenza');
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    if (!newCategory.name.trim()) { 
      alert('⚠️ Nome categoria obbligatorio'); 
      return; 
    }
    setLoading(true);
    try {
      const res = await api.post('/categories/', { name: newCategory.name, icon: newCategory.icon || null });
      setCategories((p: Category[]) => [...p, res.data]);
      setNewCategory({ name: '', icon: '' });
      setShowCategoryModal(false);
      setNewLicense((prev: LicenseForm) => ({ ...prev, category_id: res.data.id }));
      alert('✅ Categoria creata con successo!');
    } catch {
      alert('❌ Errore creazione categoria');
    } finally { 
      setLoading(false); 
    }
  }

  async function updateLicense(license: License) {
    setLoadingLicense(true);
    try {
      const res = await api.put(`/licenses/${license.id}/`, license);
      setLicenses((prev: License[]) => prev.map(l => l.id === license.id ? res.data : l));
      alert('✅ Licenza aggiornata con successo!');
      setEditingLicense(null);
    } catch {
      alert('❌ Errore nell\'aggiornamento della licenza');
    } finally {
      setLoadingLicense(false);
    }
  }

  async function deleteLicense(id: number) {
    if (confirm('🗑️ Sei sicuro di voler eliminare questa licenza?')) {
      try {
        await api.delete(`/licenses/${id}/`);
        setLicenses((prev: License[]) => prev.filter(l => l.id !== id));
        alert('✅ Licenza eliminata con successo!');
      } catch {
        alert('❌ Errore nell\'eliminazione della licenza');
      }
    }
  }

  async function updateCategory(category: Category) {
    setLoadingCategory(true);
    try {
      const res = await api.put(`/categories/${category.id}/`, category);
      setCategories((prev: Category[]) => prev.map(c => c.id === category.id ? res.data : c));
      alert('✅ Categoria aggiornata con successo!');
      setEditingCategory(null);
    } catch {
      alert('❌ Errore nell\'aggiornamento della categoria');
    } finally {
      setLoadingCategory(false);
    }
  }

  async function deleteCategory(id: number) {
    if (confirm('🗑️ Sei sicuro di voler eliminare questa categoria?')) {
      try {
        await api.delete(`/categories/${id}/`);
        setCategories((prev: Category[]) => prev.filter(c => c.id !== id));
        alert('✅ Categoria eliminata con successo!');
      } catch {
        alert('❌ Errore nell\'eliminazione della categoria');
      }
    }
  }

  function categoryName(id: number) { 
    return categories.find(c => c.id === id)?.name || 'Senza categoria'; 
  }
  
  function getCategoryIcon(id: number) { 
    const category = categories.find(c => c.id === id);
    const IconComponent = category?.icon ? iconMap[category.icon] : Icons.Key;
    return IconComponent ? <IconComponent /> : <Icons.Key />;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('📋 Copiato negli appunti!');
  };

  const toggleKeyVisibility = (id: number) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (license.vendor?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (license.edition?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? license.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const grouped = filteredLicenses.reduce((acc, lic) => {
    const catName = categoryName(lic.category_id);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(lic);
    return acc;
  }, {} as Record<string, License[]>);

  if (loading && licenses.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: spacing.lg,
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${colors.gray[200]}`,
          borderTop: `4px solid ${colors.primary[500]}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span style={{
          fontSize: fontSize.lg,
          color: colors.gray[600],
          fontWeight: fontWeight.medium,
        }}>
          Caricamento licenze...
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header con titolo e controlli */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
        flexWrap: 'wrap',
        gap: spacing.lg,
      }}>
        <div>
          <h1 style={{
            fontSize: fontSize['4xl'],
            fontWeight: fontWeight.bold,
            fontFamily: "'Poppins', sans-serif",
            background: colors.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            marginBottom: spacing.sm,
          }}>
            🔐 Gestione Licenze
          </h1>
          <p style={{
            fontSize: fontSize.lg,
            color: colors.gray[600],
            margin: 0,
            fontWeight: fontWeight.medium,
          }}>
            {licenses.length} licenze • {categories.length} categorie
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: spacing.md,
          alignItems: 'center',
        }}>
          <button
            onClick={() => setShowCategoryForm(true)}
            style={{
              background: colors.gradients.secondary,
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
              boxShadow: shadows.md,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = shadows.xl;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadows.md;
            }}
          >
            <Icons.Plus /> Nuova Categoria
          </button>

          <button
            onClick={() => setShowLicenseModal(true)}
            style={{
              background: colors.gradients.primary,
              border: 'none',
              color: 'white',
              padding: `${spacing.md} ${spacing.xl}`,
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              fontSize: fontSize.base,
              fontWeight: fontWeight.medium,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              boxShadow: shadows.lg,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = shadows.xl;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadows.lg;
            }}
          >
            <Icons.Plus /> Nuova Licenza
          </button>
        </div>
      </div>

      {/* Barra di ricerca e filtri */}
      <div style={{
        background: 'white',
        padding: spacing.xl,
        borderRadius: borderRadius['2xl'],
        boxShadow: shadows.lg,
        marginBottom: spacing.xl,
        border: `1px solid ${colors.gray[100]}`,
      }}>
        <div style={{
          display: 'flex',
          gap: spacing.lg,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            flex: '1',
            minWidth: '250px',
          }}>
            <div style={{
              position: 'absolute',
              left: spacing.md,
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.gray[400],
              pointerEvents: 'none',
            }}>
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Cerca licenze per nome, vendor, edizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing.md} ${spacing.md} ${spacing.md} 48px`,
                border: `2px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.lg,
                fontSize: fontSize.base,
                outline: 'none',
                transition: 'all 0.2s ease',
                background: colors.gray[50],
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary[400];
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.gray[200];
                e.currentTarget.style.background = colors.gray[50];
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                border: `2px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.lg,
                fontSize: fontSize.base,
                background: 'white',
                color: colors.gray[700],
                cursor: 'pointer',
                outline: 'none',
                minWidth: '180px',
              }}
            >
              <option value="">🏷️ Tutte le categorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                background: colors.gray[100],
                border: 'none',
                borderRadius: borderRadius.md,
                color: colors.gray[600],
                cursor: 'pointer',
                fontSize: fontSize.sm,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <Icons.X /> Cancella filtri
            </button>
          )}
        </div>
      </div>

      {/* Griglia delle licenze */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{
          background: 'white',
          padding: spacing['4xl'],
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows.md,
          textAlign: 'center',
          border: `1px solid ${colors.gray[100]}`,
        }}>
          <div style={{
            fontSize: fontSize['6xl'],
            marginBottom: spacing.lg,
          }}>
            🔍
          </div>
          <h3 style={{
            fontSize: fontSize['2xl'],
            fontWeight: fontWeight.semibold,
            color: colors.gray[800],
            margin: 0,
            marginBottom: spacing.sm,
          }}>
            Nessuna licenza trovata
          </h3>
          <p style={{
            fontSize: fontSize.base,
            color: colors.gray[600],
            margin: 0,
          }}>
            {searchTerm || selectedCategory 
              ? 'Prova a modificare i filtri di ricerca'
              : 'Inizia creando la tua prima licenza'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: spacing.xl,
        }}>
          {Object.entries(grouped).map(([categoryName, categoryLicenses]) => (
            <div key={categoryName}>
              {/* Category Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.lg,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: `${spacing.sm} ${spacing.lg}`,
                  background: colors.gradients.blue,
                  borderRadius: borderRadius.full,
                  color: 'white',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  boxShadow: shadows.md,
                }}>
                  {getCategoryIcon(categoryLicenses[0].category_id)}
                  {categoryName}
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.full,
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semibold,
                  }}>
                    {categoryLicenses.length}
                  </span>
                </div>
                
                {/* Category Actions */}
                <div style={{
                  display: 'flex',
                  gap: spacing.xs,
                }}>
                  <button
                    onClick={() => {
                      setEditingCategory({ name: '', icon: 'Windows11' });
                      setSelectedCategoryToEdit(null);
                    }}
                    style={{
                      background: colors.gradients.secondary,
                      border: 'none',
                      color: 'white',
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: shadows.sm,
                      transition: 'all 0.2s ease',
                    }}
                    title={`Modifica categoria ${categoryName}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={() => deleteCategory(categoryLicenses[0].category_id)}
                    style={{
                      background: colors.gradients.danger,
                      border: 'none',
                      color: 'white',
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: shadows.sm,
                      transition: 'all 0.2s ease',
                    }}
                    title={`Elimina categoria ${categoryName}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>

              {/* Licenses Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: spacing.lg,
              }}>
                {categoryLicenses.map((license) => (
                  <div
                    key={license.id}
                    style={{
                      background: 'white',
                      borderRadius: borderRadius['2xl'],
                      padding: spacing.xl,
                      boxShadow: shadows.md,
                      border: `1px solid ${colors.gray[100]}`,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = shadows.xl;
                      e.currentTarget.style.borderColor = colors.primary[200];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = shadows.md;
                      e.currentTarget.style.borderColor = colors.gray[100];
                    }}
                  >
                    {/* License Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: spacing.lg,
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: fontSize.xl,
                          fontWeight: fontWeight.bold,
                          color: colors.gray[800],
                          margin: 0,
                          marginBottom: spacing.xs,
                          fontFamily: "'Poppins', sans-serif",
                        }}>
                          {license.product_name}
                        </h3>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: spacing.sm,
                          marginBottom: spacing.sm,
                        }}>
                          {license.vendor && (
                            <span style={{
                              background: colors.primary[50],
                              color: colors.primary[700],
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.md,
                              fontSize: fontSize.xs,
                              fontWeight: fontWeight.medium,
                            }}>
                              {license.vendor}
                            </span>
                          )}
                          {license.edition && (
                            <span style={{
                              background: colors.secondary[50],
                              color: colors.secondary[700],
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.md,
                              fontSize: fontSize.xs,
                              fontWeight: fontWeight.medium,
                            }}>
                              {license.edition}
                            </span>
                          )}
                          {license.version && (
                            <span style={{
                              background: colors.success[50],
                              color: colors.success[700],
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.md,
                              fontSize: fontSize.xs,
                              fontWeight: fontWeight.medium,
                            }}>
                              v{license.version}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: spacing.xs,
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            useLicense(license.id);
                          }}
                          style={{
                            background: colors.gradients.success,
                            border: 'none',
                            color: 'white',
                            padding: spacing.sm,
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: shadows.sm,
                            transition: 'all 0.2s ease',
                          }}
                          title="Scarica ISO"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Icons.Download />
                        </button>
                      </div>
                    </div>

                    {/* License Key */}
                    <div style={{
                      background: colors.gray[50],
                      borderRadius: borderRadius.lg,
                      padding: spacing.lg,
                      marginBottom: spacing.lg,
                      border: `2px dashed ${colors.gray[200]}`,
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: spacing.sm,
                      }}>
                        <label style={{
                          fontSize: fontSize.sm,
                          fontWeight: fontWeight.medium,
                          color: colors.gray[600],
                        }}>
                          🔑 Chiave di Licenza
                        </label>
                        <div style={{
                          display: 'flex',
                          gap: spacing.xs,
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleKeyVisibility(license.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: colors.gray[500],
                              cursor: 'pointer',
                              padding: spacing.xs,
                              borderRadius: borderRadius.sm,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title={visibleKeys.has(license.id) ? 'Nascondi' : 'Mostra'}
                          >
                            {visibleKeys.has(license.id) ? <Icons.EyeOff /> : <Icons.Eye />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(license.license_key);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: colors.gray[500],
                              cursor: 'pointer',
                              padding: spacing.xs,
                              borderRadius: borderRadius.sm,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Copia"
                          >
                            <Icons.Copy />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLicense(license);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: colors.primary[500],
                              cursor: 'pointer',
                              padding: spacing.xs,
                              borderRadius: borderRadius.sm,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Modifica licenza"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLicense(license.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: colors.error[500],
                              cursor: 'pointer',
                              padding: spacing.xs,
                              borderRadius: borderRadius.sm,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Elimina licenza"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>
                      <div style={{
                        fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
                        fontSize: fontSize.sm,
                        color: colors.gray[800],
                        background: 'white',
                        padding: spacing.md,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.gray[200]}`,
                        wordBreak: 'break-all',
                      }}>
                        {visibleKeys.has(license.id) 
                          ? license.license_key 
                          : '•'.repeat(license.license_key.length)
                        }
                      </div>
                    </div>

                    {/* Last Used */}
                    {license.last_used_at && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.sm,
                        color: colors.gray[500],
                        fontSize: fontSize.sm,
                      }}>
                        <Icons.Calendar />
                        Ultimo utilizzo: {new Date(license.last_used_at).toLocaleDateString('it-IT')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modali e form */}
      {/* Modal Nuova Licenza */}
      {showLicenseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.lg,
        }}>
          <div style={{
            background: 'white',
            borderRadius: borderRadius['2xl'],
            padding: spacing['2xl'],
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: shadows['2xl'],
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <h2 style={{
                fontSize: fontSize['2xl'],
                fontWeight: fontWeight.bold,
                color: colors.gray[800],
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
              }}>
                🆕 Nuova Licenza
              </h2>
              <button
                onClick={() => setShowLicenseModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.gray[500],
                  cursor: 'pointer',
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                }}
              >
                <Icons.X />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: spacing.lg,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  📦 Nome Prodotto *
                </label>
                <input
                  type="text"
                  value={newLicense.product_name || ''}
                  onChange={(e) => setNewLicense(prev => ({ ...prev, product_name: e.target.value }))}
                  placeholder="es. Microsoft Office"
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    🏢 Vendor
                  </label>
                  <input
                    type="text"
                    value={newLicense.vendor || ''}
                    onChange={(e) => setNewLicense(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="es. Microsoft"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      outline: 'none',
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    📄 Edizione
                  </label>
                  <input
                    type="text"
                    value={newLicense.edition || ''}
                    onChange={(e) => setNewLicense(prev => ({ ...prev, edition: e.target.value }))}
                    placeholder="es. Professional"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      outline: 'none',
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    🔢 Versione
                  </label>
                  <input
                    type="text"
                    value={newLicense.version || ''}
                    onChange={(e) => setNewLicense(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="es. 2024"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      outline: 'none',
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    🏷️ Categoria
                  </label>
                  <select
                    value={newLicense.category_id || ''}
                    onChange={(e) => setNewLicense(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      background: 'white',
                      outline: 'none',
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  🔑 Chiave di Licenza *
                </label>
                <textarea
                  value={newLicense.license_key || ''}
                  onChange={(e) => setNewLicense(prev => ({ ...prev, license_key: e.target.value }))}
                  placeholder="Inserisci la chiave di licenza"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
                    fontFamily: "'Monaco', 'Consolas', monospace",
                    resize: 'vertical',
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  💿 URL ISO (opzionale)
                </label>
                <input
                  type="url"
                  value={newLicense.iso_url || ''}
                  onChange={(e) => setNewLicense(prev => ({ ...prev, iso_url: e.target.value }))}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
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

              <div style={{
                display: 'flex',
                gap: spacing.md,
                justifyContent: 'flex-end',
                marginTop: spacing.lg,
              }}>
                <button
                  onClick={() => setShowLicenseModal(false)}
                  style={{
                    background: colors.gray[100],
                    border: 'none',
                    color: colors.gray[700],
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                  }}
                >
                  Annulla
                </button>
                <button
                  onClick={createLicense}
                  disabled={loading || !newLicense.product_name || !newLicense.license_key}
                  style={{
                    background: loading || !newLicense.product_name || !newLicense.license_key 
                      ? colors.gray[400] 
                      : colors.gradients.primary,
                    border: 'none',
                    color: 'white',
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: loading || !newLicense.product_name || !newLicense.license_key 
                      ? 'not-allowed' 
                      : 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    boxShadow: shadows.md,
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Creazione...
                    </>
                  ) : (
                    <>
                      ✨ Crea Licenza
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifica Licenza */}
      {editingLicense && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.lg,
        }}>
          <div style={{
            background: 'white',
            borderRadius: borderRadius['2xl'],
            padding: spacing['2xl'],
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: shadows['2xl'],
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <h2 style={{
                fontSize: fontSize['2xl'],
                fontWeight: fontWeight.bold,
                color: colors.gray[800],
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
              }}>
                ✏️ Modifica Licenza
              </h2>
              <button
                onClick={() => setEditingLicense(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.gray[500],
                  cursor: 'pointer',
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                }}
              >
                <Icons.X />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: spacing.lg,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  📦 Nome Prodotto *
                </label>
                <input
                  type="text"
                  value={editingLicense.product_name || ''}
                  onChange={(e) => setEditingLicense(prev => prev ? ({ ...prev, product_name: e.target.value }) : null)}
                  placeholder="es. Microsoft Office"
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    🏢 Vendor
                  </label>
                  <input
                    type="text"
                    value={editingLicense.vendor || ''}
                    onChange={(e) => setEditingLicense(prev => prev ? ({ ...prev, vendor: e.target.value }) : null)}
                    placeholder="es. Microsoft"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      outline: 'none',
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    📄 Edizione
                  </label>
                  <input
                    type="text"
                    value={editingLicense.edition || ''}
                    onChange={(e) => setEditingLicense(prev => prev ? ({ ...prev, edition: e.target.value }) : null)}
                    placeholder="es. Professional"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      outline: 'none',
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    🔢 Versione
                  </label>
                  <input
                    type="text"
                    value={editingLicense.version || ''}
                    onChange={(e) => setEditingLicense(prev => prev ? ({ ...prev, version: e.target.value }) : null)}
                    placeholder="es. 2024"
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      outline: 'none',
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

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                    color: colors.gray[700],
                    marginBottom: spacing.sm,
                  }}>
                    🏷️ Categoria
                  </label>
                  <select
                    value={editingLicense.category_id || ''}
                    onChange={(e) => setEditingLicense(prev => prev ? ({ ...prev, category_id: Number(e.target.value) }) : null)}
                    style={{
                      width: '100%',
                      padding: `${spacing.md} ${spacing.lg}`,
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: borderRadius.lg,
                      fontSize: fontSize.base,
                      background: 'white',
                      outline: 'none',
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  🔑 Chiave di Licenza *
                </label>
                <textarea
                  value={editingLicense.license_key || ''}
                  onChange={(e) => setEditingLicense(prev => prev ? ({ ...prev, license_key: e.target.value }) : null)}
                  placeholder="Inserisci la chiave di licenza"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
                    fontFamily: "'Monaco', 'Consolas', monospace",
                    resize: 'vertical',
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  💿 URL ISO (opzionale)
                </label>
                <input
                  type="url"
                  value={editingLicense.iso_url || ''}
                  onChange={(e) => setEditingLicense(prev => prev ? ({ ...prev, iso_url: e.target.value }) : null)}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
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

              <div style={{
                display: 'flex',
                gap: spacing.md,
                justifyContent: 'flex-end',
                marginTop: spacing.lg,
              }}>
                <button
                  onClick={() => setEditingLicense(null)}
                  style={{
                    background: colors.gray[100],
                    border: 'none',
                    color: colors.gray[700],
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                  }}
                >
                  Annulla
                </button>
                <button
                  onClick={() => updateLicense(editingLicense)}
                  disabled={loadingLicense || !editingLicense.product_name || !editingLicense.license_key}
                  style={{
                    background: loadingLicense || !editingLicense.product_name || !editingLicense.license_key 
                      ? colors.gray[400] 
                      : colors.gradients.primary,
                    border: 'none',
                    color: 'white',
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: loadingLicense || !editingLicense.product_name || !editingLicense.license_key 
                      ? 'not-allowed' 
                      : 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    boxShadow: shadows.md,
                  }}
                >
                  {loadingLicense ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Aggiornamento...
                    </>
                  ) : (
                    <>
                      ✅ Aggiorna Licenza
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifica Categoria */}
      {editingCategory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.lg,
        }}>
          <div style={{
            background: 'white',
            borderRadius: borderRadius['2xl'],
            padding: spacing['2xl'],
            maxWidth: '500px',
            width: '100%',
            boxShadow: shadows['2xl'],
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <h2 style={{
                fontSize: fontSize['2xl'],
                fontWeight: fontWeight.bold,
                color: colors.gray[800],
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
              }}>
                ✏️ Modifica Categoria
              </h2>
              <button
                onClick={() => setEditingCategory(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.gray[500],
                  cursor: 'pointer',
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                }}
              >
                <Icons.X />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: spacing.lg,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  � Seleziona Categoria da Modificare *
                </label>
                <select
                  value={selectedCategoryToEdit?.id || ''}
                  onChange={(e) => {
                    const category = categories.find(c => c.id === parseInt(e.target.value));
                    if (category) {
                      setSelectedCategoryToEdit(category);
                      setEditingCategory({ name: category.name, icon: category.icon });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
                    background: 'white',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary[400];
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.gray[200];
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Seleziona una categoria...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryToEdit && (
                <>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.sm,
                    }}>
                      �📝 Nome Categoria *
                    </label>
                    <input
                      type="text"
                      value={editingCategory?.name || ''}
                      onChange={(e) => setEditingCategory(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                      placeholder="es. Software di Sicurezza"
                      style={{
                        width: '100%',
                        padding: `${spacing.md} ${spacing.lg}`,
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: borderRadius.lg,
                        fontSize: fontSize.base,
                        outline: 'none',
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

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.medium,
                      color: colors.gray[700],
                      marginBottom: spacing.sm,
                    }}>
                      🎨 Icona
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: spacing.sm,
                      padding: spacing.md,
                      background: colors.gray[50],
                      borderRadius: borderRadius.lg,
                      border: `1px solid ${colors.gray[200]}`,
                    }}>
                      {iconCatalog.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setEditingCategory(prev => prev ? ({ ...prev, icon: icon.name }) : null)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: spacing.xs,
                            padding: spacing.sm,
                            border: `2px solid ${editingCategory?.icon === icon.name ? colors.primary[400] : 'transparent'}`,
                            background: editingCategory?.icon === icon.name ? colors.primary[50] : 'white',
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: fontSize.xs,
                            fontWeight: fontWeight.medium,
                          }}
                          onMouseEnter={(e) => {
                            if (editingCategory?.icon !== icon.name) {
                              e.currentTarget.style.background = colors.gray[100];
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (editingCategory?.icon !== icon.name) {
                              e.currentTarget.style.background = 'white';
                            }
                          }}
                        >
                          <icon.component />
                          <span>{icon.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div style={{
                display: 'flex',
                gap: spacing.md,
                justifyContent: 'flex-end',
                marginTop: spacing.lg,
              }}>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setSelectedCategoryToEdit(null);
                  }}
                  style={{
                    background: colors.gray[100],
                    border: 'none',
                    color: colors.gray[700],
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                  }}
                >
                  Annulla
                </button>
                <button
                  onClick={async () => {
                    if (!selectedCategoryToEdit || !editingCategory) return;
                    
                    try {
                      setLoadingCategory(true);
                      const updateData = {
                        name: editingCategory.name,
                        icon: editingCategory.icon
                      };
                      
                      const res = await api.put(`/categories/${selectedCategoryToEdit.id}`, updateData);
                      setCategories(prev => prev.map(c => c.id === selectedCategoryToEdit.id ? res.data : c));
                      
                      // No need to update licenses since they only have category_id, not category object
                      // The category name will be updated automatically through the getCategoryName function
                      
                      setEditingCategory(null);
                      setSelectedCategoryToEdit(null);
                      alert('Categoria aggiornata con successo!');
                    } catch (error) {
                      console.error('Error updating category:', error);
                      alert('Errore durante l\'aggiornamento della categoria');
                    } finally {
                      setLoadingCategory(false);
                    }
                  }}
                  disabled={loadingCategory || !editingCategory?.name.trim() || !selectedCategoryToEdit}
                  style={{
                    background: loadingCategory || !editingCategory?.name.trim() || !selectedCategoryToEdit
                      ? colors.gray[400] 
                      : colors.gradients.secondary,
                    border: 'none',
                    color: 'white',
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: loadingCategory || !editingCategory?.name.trim() || !selectedCategoryToEdit
                      ? 'not-allowed' 
                      : 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    boxShadow: shadows.md,
                  }}
                >
                  {loadingCategory ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Aggiornamento...
                    </>
                  ) : (
                    <>
                      ✅ Aggiorna Categoria
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuova Categoria */}
      {showCategoryForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing.lg,
        }}>
          <div style={{
            background: 'white',
            borderRadius: borderRadius['2xl'],
            padding: spacing['2xl'],
            maxWidth: '500px',
            width: '100%',
            boxShadow: shadows['2xl'],
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <h2 style={{
                fontSize: fontSize['2xl'],
                fontWeight: fontWeight.bold,
                color: colors.gray[800],
                margin: 0,
                fontFamily: "'Poppins', sans-serif",
              }}>
                🏷️ Nuova Categoria
              </h2>
              <button
                onClick={() => setShowCategoryForm(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.gray[500],
                  cursor: 'pointer',
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                }}
              >
                <Icons.X />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gap: spacing.lg,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  📝 Nome Categoria *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="es. Software di Sicurezza"
                  style={{
                    width: '100%',
                    padding: `${spacing.md} ${spacing.lg}`,
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: borderRadius.lg,
                    fontSize: fontSize.base,
                    outline: 'none',
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: colors.gray[700],
                  marginBottom: spacing.sm,
                }}>
                  🎨 Icona
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: spacing.sm,
                  padding: spacing.md,
                  background: colors.gray[50],
                  borderRadius: borderRadius.lg,
                  border: `1px solid ${colors.gray[200]}`,
                }}>
                  {iconCatalog.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, icon: icon.name }))}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: spacing.sm,
                        border: `2px solid ${newCategory.icon === icon.name ? colors.primary[400] : 'transparent'}`,
                        background: newCategory.icon === icon.name ? colors.primary[50] : 'white',
                        borderRadius: borderRadius.md,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (newCategory.icon !== icon.name) {
                          e.currentTarget.style.background = colors.gray[100];
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (newCategory.icon !== icon.name) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <icon.component />
                      <span style={{
                        fontSize: fontSize.xs,
                        color: colors.gray[600],
                        marginTop: spacing.xs,
                        textAlign: 'center',
                      }}>
                        {icon.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: spacing.md,
                justifyContent: 'flex-end',
                marginTop: spacing.lg,
              }}>
                <button
                  onClick={() => setShowCategoryForm(false)}
                  style={{
                    background: colors.gray[100],
                    border: 'none',
                    color: colors.gray[700],
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                  }}
                >
                  Annulla
                </button>
                <button
                  onClick={createCategory}
                  disabled={loading || !newCategory.name.trim()}
                  style={{
                    background: loading || !newCategory.name.trim() 
                      ? colors.gray[400] 
                      : colors.gradients.secondary,
                    border: 'none',
                    color: 'white',
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    cursor: loading || !newCategory.name.trim() 
                      ? 'not-allowed' 
                      : 'pointer',
                    fontSize: fontSize.base,
                    fontWeight: fontWeight.medium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.sm,
                    boxShadow: shadows.md,
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      Creazione...
                    </>
                  ) : (
                    <>
                      ✨ Crea Categoria
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
