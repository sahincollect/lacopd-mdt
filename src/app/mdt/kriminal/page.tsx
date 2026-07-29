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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.85rem",
    background: 'var(--bg-tertiary)',
    border: "1px solid var(--border-light)",
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease"
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }}></i>
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>VERİTABANI TARANIYOR...</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--lapd-blue-dark)', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
            SUÇLU KAYIT VERİTABANI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
            Kriminal kayıt sorgulama, ekleme ve düzenleme.
          </p>
        </div>
        <div>
          <button 
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({name: "", crimes: "", notes: ""}); }}
            style={{ 
              background: showAddForm ? "var(--bg-tertiary)" : "var(--lapd-blue-dark)",
              color: showAddForm ? "var(--text-primary)" : "#fff",
              border: showAddForm ? "1px solid var(--border-light)" : "none",
              padding: "0.75rem 1.5rem",
              borderRadius: '4px',
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {showAddForm ? <><i className="fa-solid fa-xmark"></i> İPTAL ET</> : <><i className="fa-solid fa-plus"></i> YENİ SABIKA KAYDI</>}
          </button>
        </div>
      </div>

      {/* Form */}
      {showAddForm && (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '2rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--lapd-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fa-solid fa-fingerprint"></i>
            {editingId ? "Sabıka Kaydını Düzenle" : "Sabıka Kaydı Formu"}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>ŞÜPHELİ / SUÇLU İSMİ</label>
              <input name="name" type="text" style={inputStyle} value={formData.name} onChange={handleChange} required />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>İŞLENEN SUÇLAR (VİRGÜLLE AYIRIN)</label>
              <input name="crimes" type="text" style={inputStyle} placeholder="Örn: Silahlı Soygun, Polise Mukavemet" value={formData.crimes} onChange={handleChange} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>EK NOTLAR</label>
              <textarea name="notes" style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} rows={4} value={formData.notes} onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" disabled={submitting} style={{ 
                padding: '0.85rem 2rem', borderRadius: '4px', border: 'none',
                background: "var(--lapd-blue-dark)", color: '#fff', fontWeight: 900,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> İŞLENİYOR...</> : <><i className="fa-solid fa-save"></i> {editingId ? "GÜNCELLE" : "KAYDET"}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kayıt Listesi */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--lapd-blue-dark)' }}>
          <i className="fa-solid fa-folder-open"></i> SİCİL KAYITLARI
        </h3>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <i className="fa-solid fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
          <input 
            type="text" 
            placeholder="İsim veya suça göre ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.5rem' }} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredCriminals.length === 0 ? (
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '4rem 2rem', 
            textAlign: 'center', border: '1px solid var(--border-light)' 
          }}>
            <i className="fa-solid fa-shield-check" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
              Sistemde kayıtlı veya aramanızla eşleşen şüpheli bulunamadı.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredCriminals.map((c: any) => {
              const canModify = user && (user.id === c.officerId || user.role === 'admin');
              const crimesList = c.crimes ? c.crimes.split(',').map((item: string) => item.trim()) : [];
              const isExpanded = expandedIds.includes(c.id);
              
              return (
                <div key={c.id} style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden'
                }}>
                  <div 
                    onClick={() => toggleExpand(c.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1.5rem', borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none', background: isExpanded ? 'var(--bg-tertiary)' : 'transparent' }}
                  >
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lapd-blue-dark)', fontSize: '1.25rem' }}>
                        <i className="fa-solid fa-user-secret"></i>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{c.name}</h3>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          <i className="fa-regular fa-clock" style={{ marginRight: '0.4rem' }}></i> {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: 'var(--text-muted)' }}></i>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '2rem', background: 'var(--bg-primary)' }}>
                      <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--lapd-blue-dark)', fontWeight: 900, marginBottom: '0.75rem', textTransform: 'uppercase' }}>İŞLENEN SUÇLAR</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {crimesList.map((crime: string, idx: number) => (
                            <span key={idx} style={{
                              backgroundColor: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-primary)',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                            }}>
                              <i className="fa-solid fa-gavel" style={{ marginRight: '0.4rem', color: 'var(--lapd-orange)' }}></i> {crime}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {c.notes && (
                        <div style={{ marginBottom: '2rem' }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--lapd-blue-dark)', fontWeight: 900, marginBottom: '0.75rem', textTransform: 'uppercase' }}>EK NOTLAR / DETAYLAR</div>
                          <div style={{ 
                            backgroundColor: 'var(--bg-tertiary)', 
                            padding: '1.5rem', 
                            borderRadius: '4px', 
                            border: '1px solid var(--border-light)'
                          }}>
                            <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)' }}>
                              {c.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '2px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                          <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.5rem', color: 'var(--lapd-orange)' }}></i>
                          <span style={{ fontWeight: 800 }}>KAYIT: #{c.officer?.badge}</span>
                        </div>
                        
                        {canModify && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEdit(c)} title="Düzenle" style={{
                              width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--lapd-blue-dark)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            
                            <button onClick={() => handleDelete(c.id)} title="Sil" style={{
                              width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--color-danger)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
