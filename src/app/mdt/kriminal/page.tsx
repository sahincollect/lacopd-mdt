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
        mutateCriminals(); // Refresh list
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
      } else {
        toast.error("Silme işlemi başarısız.");
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: "", crimes: "", notes: "" });
  };

  const filteredCriminals = criminals.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.crimes.toLowerCase().includes(search.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-secondary)", flexDirection: "column", gap: "1.5rem" }}>
      <i 
        
       
        className="fa-solid fa-circle-notch" 
        style={{ fontSize: "2.5rem", color: "var(--accent-primary)" }}
      />
      <span style={{ fontSize: "1.1rem", letterSpacing: "0.05em" }}>Veritabanı Taranıyor...</span>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.9rem 1.25rem",
    backgroundColor: 'var(--bg-secondary)',
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s ease"
  };

  return (
    <div 
     
     
     
      style={{ color: 'var(--text-primary)', paddingBottom: "3rem", width: "100%", maxWidth: "1800px", margin: "0 auto", padding: "0 2rem" }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Suçlu <span style={{ color: "var(--accent-primary)", textShadow: "0 0 20px rgba(14, 165, 233,0.4)" }}>Kayıt</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Kriminal kayıt sorgulama, ekleme ve düzenleme.
          </p>
        </div>
        <div>
          <button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(14, 165, 233, 0.2)", boxShadow: "0 0 30px rgba(14, 165, 233, 0.4), inset 0 0 15px rgba(14, 165, 233, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="btn"
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({name: "", crimes: "", notes: ""}); }}
            style={{ 
              background: showAddForm ? "rgba(14, 165, 233, 0.05)" : "rgba(14, 165, 233, 0.1)",
              color: showAddForm ? "#7dd3fc" : "#0ea5e9",
              border: showAddForm ? "1px solid rgba(14, 165, 233,0.2)" : "1px solid rgba(14, 165, 233, 0.5)",
              boxShadow: showAddForm ? "none" : "0 0 20px rgba(14, 165, 233, 0.2), inset 0 0 10px rgba(14, 165, 233, 0.1)",
              padding: "0.8rem 1.8rem",
              borderRadius: '8px',
              fontWeight: 900,
              letterSpacing: "0.05em",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease"
            }}
          >
            {showAddForm ? <><i className="fa-solid fa-xmark"></i> İPTAL ET</> : <><i className="fa-solid fa-plus"></i> YENİ SABIKA KAYDI</>}
          </button>
        </div>
      </div>

      <>
        {/* Form */}
        {showAddForm && (
          <div 
           
           
           
            style={{ overflow: 'hidden' }}
          >
            <div style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.6)', 
              backdropFilter: 'blur(16px)', 
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(14, 165, 233, 0.05)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-fingerprint"></i>
                {editingId ? "Sabıka Kaydını Düzenle" : "Sabıka Kaydı Formu"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>ŞÜPHELİ / SUÇLU İSMİ</label>
                  <input name="name" type="text" style={inputStyle} value={formData.name} onChange={handleChange} required 
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233,0.05)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>İŞLENEN SUÇLAR (VİRGÜLLE AYIRIN)</label>
                  <input name="crimes" type="text" style={inputStyle} placeholder="Örn: Silahlı Soygun, Polise Mukavemet" value={formData.crimes} onChange={handleChange} required 
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233,0.05)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>EK NOTLAR</label>
                  <textarea name="notes" style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} rows={3} value={formData.notes} onChange={handleChange}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233,0.05)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={submitting} style={{ 
                    flex: 1, padding: '1rem', borderRadius: '6px', border: 'none',
                    background: "linear-gradient(135deg, #10B981, #059669)", color: 'var(--text-primary)', fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                    boxShadow: submitting ? 'none' : '0 8px 25px rgba(14, 165, 233, 0.3)'
                  }}>
                    {submitting ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> İŞLENİYOR...</> : <><i className="fa-solid fa-save" style={{ marginRight: '0.5rem' }}></i> {editingId ? "GÜNCELLE" : "KAYDET"}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>

      {/* Kayıt Listesi */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <i className="fa-solid fa-folder-open" style={{ color: 'var(--accent-primary)' }}></i>
          Kayıtlar
        </h3>
        <div style={{ position: 'relative', width: '300px' }}>
          <i className="fa-solid fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
          <input 
            type="text" 
            placeholder="İsim veya suça göre ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '2.5rem', borderRadius: '30px' }} 
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.05)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredCriminals.length === 0 ? (
          <div style={{ 
            backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '4rem 2rem', 
            textAlign: 'center', border: '1px solid var(--border-light)' 
          }}>
            <i className="fa-solid fa-shield-check" style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
              Sistemde kayıtlı veya aramanızla eşleşen şüpheli bulunamadı.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredCriminals.map((c: any) => {
              const canModify = user && (user.id === c.officerId || user.role === 'admin');
              
              // Split crimes into badges
              const crimesList = c.crimes ? c.crimes.split(',').map((item: string) => item.trim()) : [];
              
              return (
                <div key={c.id} whileHover={{ y: -5, boxShadow: '0 15px 40px rgba(14, 165, 233, 0.15)' }} style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '8px', 
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  padding: '1.5rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                >
                  {/* Subtle red gradient top bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #0ea5e9, #B91C1C, #0ea5e9)', backgroundSize: '200% 200%', animation: 'skeleton-shimmer 3s linear infinite' }} />
                  
                  {/* Fingerprint watermark */}
                  <div style={{ position: 'absolute', right: '-10%', bottom: '-10%', opacity: 0.03, fontSize: '12rem', color: '#0ea5e9', pointerEvents: 'none', transform: 'rotate(-15deg)' }}>
                    <i className="fa-solid fa-fingerprint"></i>
                  </div>
                  
                  <div 
                    onClick={() => toggleExpand(c.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', marginBottom: expandedIds.includes(c.id) ? '1.5rem' : '0', position: 'relative', zIndex: 2 }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '6px', backgroundColor: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', fontSize: '1.5rem' }}>
                        <i className="fa-solid fa-user-secret"></i>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.25rem 0', color: '#7dd3fc', letterSpacing: '0.05em', textShadow: '0 0 10px rgba(14, 165, 233, 0.3)' }}>{c.name}</h3>
                        <span style={{ 
                          fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                          color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px'
                        }}>
                          <i className="fa-regular fa-clock" style={{ marginRight: '0.4rem', color: '#0ea5e9' }}></i> {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', transform: expandedIds.includes(c.id) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <i className="fa-solid fa-chevron-down" style={{ color: expandedIds.includes(c.id) ? '#0ea5e9' : 'var(--text-secondary)' }}></i>
                    </div>
                  </div>

                  <>
                    {expandedIds.includes(c.id) && (
                      <div
                       
                       
                       
                       
                        style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 2 }}
                      >

                  <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {crimesList.map((crime: string, idx: number) => (
                      <span key={idx} style={{
                        backgroundColor: 'rgba(14, 165, 233, 0.15)',
                        border: '1px solid rgba(14, 165, 233, 0.4)',
                        color: '#7dd3fc',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: 'inset 0 0 10px rgba(14, 165, 233, 0.1)'
                      }}>
                        <i className="fa-solid fa-gavel" style={{ marginRight: '0.3rem', opacity: 0.7 }}></i> {crime}
                      </span>
                    ))}
                  </div>
                  
                  {c.notes && (
                    <div style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      padding: '1.25rem', 
                      borderRadius: '6px', 
                      borderLeft: '4px solid #0ea5e9', 
                      marginBottom: '1.5rem',
                      flex: 1,
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: '0.75rem', right: '1rem', color: 'rgba(14, 165, 233,0.2)', fontSize: '1.5rem' }}><i className="fa-solid fa-quote-right"></i></div>
                      <div style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: 900, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>EK NOTLAR / DETAYLAR</div>
                      <p style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '0.85rem', margin: 0, color: 'rgba(255,255,255,0.85)' }}>
                        {c.notes}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px dashed rgba(14, 165, 233,0.3)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
                      <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.5rem', color: '#0ea5e9' }}></i>
                      <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>KAYIT: #{c.officer?.badge}</span>
                    </div>
                    
                    {canModify && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(c)} title="Düzenle" style={{
                          width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.1)',
                          border: '1px solid rgba(14, 165, 233, 0.3)', color: '#60A5FA', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.backgroundColor = '#0284c7'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)'; e.currentTarget.style.color = '#60A5FA'; }}
                        ><i className="fa-solid fa-pen" style={{ fontSize: '0.8rem' }}></i></button>
                        
                        <button onClick={() => handleDelete(c.id)} title="Sil" style={{
                          width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.1)',
                          border: '1px solid rgba(14, 165, 233, 0.3)', color: '#0ea5e9', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.backgroundColor = '#0ea5e9'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)'; e.currentTarget.style.color = '#0ea5e9'; }}
                        ><i className="fa-solid fa-trash" style={{ fontSize: '0.8rem' }}></i></button>
                      </div>
                    )}
                  </div>
                      </div>
                    )}
                  </>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
