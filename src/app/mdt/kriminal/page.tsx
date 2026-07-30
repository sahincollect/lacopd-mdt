// src/app/mdt/kriminal/page.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function SuçluVeritabanı() {
  const [search, setSearch] = useState("");
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const { data: criminalsData, mutate: mutateCriminals } = useSWR('/api/criminals', fetcher);
  const { data: meData } = useSWR('/api/auth/me', fetcher);

  const loading = !criminalsData || !meData;
  const criminals = criminalsData?.criminals || [];
  const user = meData?.user || null;

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const [formData, setFormData] = useState({
    name: "",
    crimes: "",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `/api/criminals/${editingId}` : "/api/criminals";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormData({ name: "", crimes: "", notes: "" });
        setShowAddForm(false);
        setEditingId(null);
        mutateCriminals();
        toast.success(editingId ? "Kayıt başarıyla güncellendi." : "Yeni kayıt sisteme işlendi.");
      } else {
        toast.error("İşlem başarısız oldu.");
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (criminal: any) => {
    setFormData({ name: criminal.name, crimes: criminal.crimes, notes: criminal.notes || "" });
    setEditingId(criminal.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/criminals/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutateCriminals();
        toast.success("Kayıt başarıyla silindi.");
      } else {
        toast.error("Silme işlemi başarısız.");
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };

  const filteredCriminals = criminals.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.crimes.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--mdt-text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }}></i>
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>VERİTABANI TARANIYOR...</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--mdt-border)', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · İSTİHBARAT
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>CRIMINAL DB</span>
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--mdt-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Kriminal Kayıtlar
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Kriminal kayıt sorgulama, ekleme ve düzenleme.
          </p>
        </div>
        <div>
          <button 
            onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({name: "", crimes: "", notes: ""}); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', borderRadius: 8, border: '1px solid var(--mdt-accent)', background: 'var(--mdt-accent)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            <i className="fa-solid fa-plus"></i> YENİ SABIKA KAYDI
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <i className="fa-solid fa-search" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--mdt-text-muted)', fontSize: '1.1rem' }}></i>
        <input 
          type="text" 
          placeholder="İsim veya suça göre ara..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 10, padding: '1rem 1rem 1rem 3.5rem', color: 'var(--mdt-text-primary)', fontSize: '1rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
          onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Kayıt Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredCriminals.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--mdt-text-muted)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--mdt-accent-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '1.5rem', color: 'var(--mdt-accent)', opacity: 0.6 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--mdt-text-secondary)', marginBottom: '0.3rem' }}>Kayıt bulunamadı</div>
              <div style={{ fontSize: '0.82rem' }}>Sistemde kayıtlı veya aramanızla eşleşen şüpheli yok.</div>
            </div>
          </div>
        ) : (
          filteredCriminals.map((c: any) => {
            const canModify = user && (user.id === c.officerId || user.role === 'admin');
            const crimesList = c.crimes ? c.crimes.split(',').map((item: string) => item.trim()) : [];
            const isExpanded = expandedIds.includes(c.id);
            const initials = c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            
            return (
              <div key={c.id} style={{ 
                background: 'var(--mdt-card-bg)', 
                borderRadius: 10, 
                border: '1px solid var(--mdt-border)',
                borderLeft: '4px solid var(--mdt-danger)',
                overflow: 'hidden',
                transition: 'border-color 0.15s'
              }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.borderRightColor = 'var(--mdt-accent)'}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.borderRightColor = 'var(--mdt-border)'}>
                <div 
                  onClick={() => toggleExpand(c.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1.25rem 1.5rem', borderBottom: isExpanded ? '1px solid var(--mdt-border)' : 'none', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                >
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mdt-danger)', fontSize: '1rem', fontWeight: 800 }}>
                      {initials}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--mdt-text-primary)' }}>{c.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--mdt-text-muted)' }}>
                        <i className="fa-regular fa-clock" style={{ marginRight: '0.4rem' }}></i> Kayıt: {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: 'var(--mdt-text-muted)', fontSize: '0.9rem' }}></i>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '1.5rem', background: 'var(--mdt-bg-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <i className="fa-solid fa-gavel" style={{ color: 'var(--mdt-accent)', fontSize: '0.78rem', opacity: 0.8 }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)' }}>İşlenen Suçlar</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--mdt-border)' }} />
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {crimesList.map((crime: string, idx: number) => (
                        <span key={idx} style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', color: 'var(--mdt-text-secondary)', padding: '0.35rem 0.75rem', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                          {crime}
                        </span>
                      ))}
                    </div>
                    
                    {c.notes && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0 1rem' }}>
                          <i className="fa-solid fa-align-left" style={{ color: 'var(--mdt-accent)', fontSize: '0.78rem', opacity: 0.8 }} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)' }}>Ek Notlar / Detaylar</span>
                          <div style={{ flex: 1, height: 1, background: 'var(--mdt-border)' }} />
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 8, border: '1px solid var(--mdt-border)', marginBottom: '1.5rem' }}>
                          <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.85rem', margin: 0, color: 'var(--mdt-text-secondary)' }}>
                            {c.notes}
                          </p>
                        </div>
                      </>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--mdt-border)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--mdt-text-muted)' }}>
                        <i className="fa-solid fa-shield" style={{ marginRight: '0.5rem', color: 'var(--mdt-accent)' }}></i>
                        Kaydı Giren: <strong style={{ color: 'var(--mdt-text-secondary)' }}>#{c.officer?.badge}</strong>
                      </div>
                      
                      {canModify && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEdit(c)} title="Düzenle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--mdt-border)', background: 'transparent', color: 'var(--mdt-text-secondary)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-accent)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; }}>
                            <i className="fa-solid fa-pen"></i> Düzenle
                          </button>
                          
                          <button onClick={() => handleDelete(c.id)} title="Sil" style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.12s' }}>
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form */}
      {showAddForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: 14, padding: '1.75rem', width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.55)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--mdt-text-primary)' }}>
                {editingId ? "Sabıka Kaydını Düzenle" : "Yeni Sabıka Kaydı Formu"}
              </h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mdt-text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>ŞÜPHELİ / SUÇLU İSMİ</label>
                <input name="name" type="text" 
                  style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                  value={formData.name} onChange={handleChange} required />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>İŞLENEN SUÇLAR (VİRGÜLLE AYIRIN)</label>
                <input name="crimes" type="text" 
                  style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                  placeholder="Örn: Silahlı Soygun, Polise Mukavemet" value={formData.crimes} onChange={handleChange} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>EK NOTLAR</label>
                <textarea name="notes" 
                  style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                  value={formData.notes} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: 8, border: '1px solid var(--mdt-border)', background: 'transparent', color: 'var(--mdt-text-secondary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-text-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; }}>
                  İptal
                </button>
                <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', borderRadius: 8, border: '1px solid var(--mdt-accent)', background: 'var(--mdt-accent)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'opacity 0.15s', opacity: submitting ? 0.7 : 1 }}
                  onMouseOver={e => { if(!submitting) (e.currentTarget as HTMLElement).style.opacity = '0.85'} }
                  onMouseOut={e => { if(!submitting) (e.currentTarget as HTMLElement).style.opacity = '1'} }>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> İŞLENİYOR...</> : <><i className="fa-solid fa-save"></i> {editingId ? "GÜNCELLE" : "KAYDET"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
