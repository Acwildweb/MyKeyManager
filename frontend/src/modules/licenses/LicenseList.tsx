// File pulito riscritto completamente per rimuovere duplicati e codice corrotto
import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { osIcon, downloadIcon } from '../../icons/iconMap';

interface License {
  id: number;
  product_name: string;
  edition?: string;
  vendor?: string;
  version?: string;
  license_key: string;
  iso_url?: string;
  last_used_at?: string;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
}

export default function LicenseList() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [newLicense, setNewLicense] = useState({
    product_name: '', edition: '', vendor: '', version: '', license_key: '', iso_url: '', category_id: 1
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
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
      console.error('Errore caricamento dati', e);
    }
  }

  async function useLicense(id: number) {
    setLoading(true);
    try {
      const res = await api.post(`/licenses/${id}/use/`, { iso_download: true });
      setLicenses(prev => prev.map(l => l.id === id ? { ...l, last_used_at: res.data.last_used_at } : l));
      alert('Licenza utilizzata');
    } catch (e) {
      alert('Errore utilizzo licenza');
    } finally {
      setLoading(false);
    }
  }

  async function createLicense() {
    if (!newLicense.product_name || !newLicense.license_key) {
      alert('Nome prodotto e chiave obbligatori');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/licenses/', newLicense);
      setLicenses(prev => [...prev, res.data]);
      setNewLicense({ product_name: '', edition: '', vendor: '', version: '', license_key: '', iso_url: '', category_id: categories[0]?.id || 1 });
      setShowLicenseForm(false);
    } catch {
      alert('Errore creazione licenza');
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    if (!newCategory.name.trim()) { alert('Nome categoria obbligatorio'); return; }
    setLoading(true);
    try {
      const res = await api.post('/categories/', { name: newCategory.name, icon: newCategory.icon || null });
      setCategories(p => [...p, res.data]);
      setNewCategory({ name: '', icon: '' });
      setShowCategoryForm(false);
      setNewLicense(prev => ({ ...prev, category_id: res.data.id }));
    } catch {
      alert('Errore creazione categoria');
    } finally { setLoading(false); }
  }

  function categoryName(id: number) { return categories.find(c => c.id === id)?.name || 'Senza categoria'; }

  const grouped = licenses.reduce((acc, lic) => {
    const name = categoryName(lic.category_id);
    (acc[name] = acc[name] || []).push(lic);
    return acc;
  }, {} as Record<string, License[]>);

  return (
    <div style={pageBg}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={pageTitle}>🔑 MyKeyManager - Gestione Licenze</h1>
        <div style={toolbar}>
          <button style={primaryBtn} onClick={() => setShowLicenseForm(true)}>➕ Licenza</button>
          <button style={secondaryBtn} onClick={() => setShowCategoryForm(true)}>📂 Categoria</button>
          <button style={ghostBtn} onClick={loadData}>🔄 Aggiorna</button>
        </div>

        {showCategoryForm && (
          <div style={modalBackdrop}>
            <div style={modalBox}>
              <h3 style={modalTitle}>Nuova Categoria</h3>
              <div style={fieldWrap}>
                <label style={labelStyle}>Nome *</label>
                <input style={inputStyle} value={newCategory.name} onChange={e=>setNewCategory(p=>({...p,name:e.target.value}))} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Icona</label>
                <input style={inputStyle} value={newCategory.icon} onChange={e=>setNewCategory(p=>({...p,icon:e.target.value}))} />
              </div>
              <div style={modalActions}>
                <button style={smallNeutralBtn} onClick={()=>setShowCategoryForm(false)}>Annulla</button>
                <button style={smallPrimaryBtn} disabled={loading} onClick={createCategory}>{loading?'...':'Crea'}</button>
              </div>
            </div>
          </div>
        )}

        {showLicenseForm && (
          <div style={modalBackdrop}>
            <div style={modalBox}>
              <h3 style={modalTitle}>Nuova Licenza</h3>
              <LabeledInput label="Nome Prodotto *" value={newLicense.product_name} onChange={v=>setNewLicense(p=>({...p,product_name:v}))} placeholder="es. Windows 11 Pro" />
              <LabeledInput label="Vendor" value={newLicense.vendor} onChange={v=>setNewLicense(p=>({...p,vendor:v}))} />
              <LabeledInput label="Edizione" value={newLicense.edition} onChange={v=>setNewLicense(p=>({...p,edition:v}))} />
              <LabeledInput label="Versione" value={newLicense.version} onChange={v=>setNewLicense(p=>({...p,version:v}))} />
              <LabeledInput label="Chiave Licenza *" value={newLicense.license_key} onChange={v=>setNewLicense(p=>({...p,license_key:v}))} placeholder="XXXXX-XXXXX-XXXXX" />
              <LabeledInput label="URL ISO" value={newLicense.iso_url} onChange={v=>setNewLicense(p=>({...p,iso_url:v}))} placeholder="https://..." />
              <div style={fieldWrap}>
                <label style={labelStyle}>Categoria</label>
                <select style={inputStyle} value={newLicense.category_id} onChange={e=>setNewLicense(p=>({...p,category_id:parseInt(e.target.value)}))}>
                  {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={modalActions}>
                <button style={smallNeutralBtn} onClick={()=>setShowLicenseForm(false)}>Annulla</button>
                <button style={smallPrimaryBtn} disabled={loading} onClick={createLicense}>{loading?'...':'Crea'}</button>
              </div>
            </div>
          </div>
        )}

        {Object.entries(grouped).map(([catName, list]) => (
          <div key={catName} style={{ marginBottom: 32 }}>
            <h2 style={categoryTitle}><span style={{ fontSize:24 }}>📂</span>{catName}</h2>
            <div style={cardsGrid}>
              {list.map(lic => (
                <div key={lic.id} style={card}>
                  <div style={cardHeader}>
                    <div style={{ fontSize:40 }}>{osIcon(lic.vendor, lic.version)}</div>
                    <div style={{ flex:1 }}>
                      <h3 style={cardTitle}>{lic.product_name}</h3>
                      <p style={cardSub}>{lic.vendor} {lic.edition} {lic.version}</p>
                    </div>
                  </div>
                  <div style={licenseBox}>
                    <label style={licenseLabel}>Codice Licenza:</label>
                    <div style={licenseCode}>{lic.license_key}</div>
                  </div>
                  <div style={cardFooter}>
                    <div style={lastUsed}>{lic.last_used_at ? `Ultimo uso: ${new Date(lic.last_used_at).toLocaleDateString('it-IT')}` : 'Mai utilizzato'}</div>
                    <button style={{...useBtn, background: lic.iso_url ? '#48bb78':'#718096', opacity: loading?0.6:1}} disabled={loading} onClick={()=>useLicense(lic.id)}>
                      {downloadIcon} {lic.iso_url ? 'Scarica ISO':'Usa Licenza'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {licenses.length === 0 && (
          <div style={emptyBox}>
            <h3>Nessuna licenza presente</h3>
            <p>Crea una categoria e poi aggiungi licenze.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componenti di supporto
function LabeledInput(props: { label: string; value: string; onChange: (v: string)=>void; placeholder?: string; }) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{props.label}</label>
      <input style={inputStyle} value={props.value} placeholder={props.placeholder} onChange={e=>props.onChange(e.target.value)} />
    </div>
  );
}

// Styles centralizzati
const pageBg: React.CSSProperties = { padding:24, background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', minHeight:'100vh' };
const pageTitle: React.CSSProperties = { color:'#fff', textAlign:'center', marginBottom:32, fontSize:28, fontWeight:700 };
const toolbar: React.CSSProperties = { display:'flex', gap:16, justifyContent:'center', marginBottom:32, flexWrap:'wrap' };
const primaryBtn: React.CSSProperties = { background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', padding:'12px 24px', borderRadius:12, fontSize:16, fontWeight:600, cursor:'pointer', backdropFilter:'blur(10px)', transition:'all .2s' };
const secondaryBtn: React.CSSProperties = { ...primaryBtn, background:'rgba(255,255,255,0.15)' };
const ghostBtn: React.CSSProperties = { ...primaryBtn, background:'rgba(255,255,255,0.08)' };
const modalBackdrop: React.CSSProperties = { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const modalBox: React.CSSProperties = { background:'#fff', borderRadius:16, padding:24, maxWidth:520, width:'90%', maxHeight:'90vh', overflow:'auto' };
const modalTitle: React.CSSProperties = { margin:'0 0 16px 0', color:'#2d3748' };
const fieldWrap: React.CSSProperties = { marginBottom:14 };
const labelStyle: React.CSSProperties = { display:'block', marginBottom:4, fontSize:13, fontWeight:500 };
const inputStyle: React.CSSProperties = { width:'100%', padding:8, borderRadius:6, border:'1px solid #cbd5e0' };
const smallNeutralBtn: React.CSSProperties = { background:'#e2e8f0', color:'#4a5568', border:'none', padding:'6px 14px', borderRadius:6, cursor:'pointer' };
const smallPrimaryBtn: React.CSSProperties = { background:'#667eea', color:'#fff', border:'none', padding:'6px 14px', borderRadius:6, cursor:'pointer' };
const modalActions: React.CSSProperties = { display:'flex', gap:12, justifyContent:'flex-end' };
const categoryTitle: React.CSSProperties = { color:'#fff', marginBottom:16, padding:'12px 20px', background:'rgba(255,255,255,0.1)', borderRadius:12, backdropFilter:'blur(10px)', display:'flex', alignItems:'center', gap:12 };
const cardsGrid: React.CSSProperties = { display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fill,minmax(380px,1fr))' };
const card: React.CSSProperties = { background:'rgba(255,255,255,0.95)', borderRadius:16, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,0.1)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.2)' };
const cardHeader: React.CSSProperties = { display:'flex', gap:16, marginBottom:16 };
const cardTitle: React.CSSProperties = { margin:0, color:'#2d3748', fontSize:18, fontWeight:600 };
const cardSub: React.CSSProperties = { margin:0, color:'#718096', fontSize:14 };
const licenseBox: React.CSSProperties = { background:'#f7fafc', padding:12, borderRadius:8, marginBottom:16, border:'1px solid #e2e8f0' };
const licenseLabel: React.CSSProperties = { fontSize:12, color:'#718096', fontWeight:500 };
const licenseCode: React.CSSProperties = { fontFamily:'monospace', fontSize:14, color:'#2d3748', fontWeight:600, wordBreak:'break-all' };
const cardFooter: React.CSSProperties = { display:'flex', justifyContent:'space-between', alignItems:'center' };
const lastUsed: React.CSSProperties = { fontSize:12, color:'#718096' };
const useBtn: React.CSSProperties = { display:'flex', alignItems:'center', gap:8, color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .2s' };
const emptyBox: React.CSSProperties = { textAlign:'center', color:'#fff', background:'rgba(255,255,255,0.1)', padding:40, borderRadius:16, backdropFilter:'blur(10px)' };
