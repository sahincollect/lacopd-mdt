"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function Duyurular() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ title: "", content: "", type: "Normal" });

  const { data: announcementsData, mutate: mutateAnnouncements } = useSWR('/api/announcements', fetcher);
  const { data: meData } = useSWR('/api/auth/me', fetcher);

  const loading = !announcementsData || !meData;
  const announcements = announcementsData?.announcements || [];
  const user = meData?.user || null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `/api/announcements/${editingId}` : "/api/announcements";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormData({ title: "", content: "", type: "Normal" });
        setShowAddForm(false);
        setEditingId(null);
        mutateAnnouncements();
        toast.success(editingId ? "Duyuru güncellendi." : "Yeni duyuru yayınlandı.");
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error("İşlem başarısız oldu: " + (errData.error || "Bilinmeyen sunucu hatası."));
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ann: any) => {
    setFormData({ title: ann.title, content: ann.content, type: ann.type || "Normal" });
    setEditingId(ann.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutateAnnouncements();
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
    setFormData({ title: "", content: "", type: "Normal" });
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case "Acil":
        return {
          color: "#0ea5e9", 
          bg: "rgba(14, 165, 233, 0.1)", 
          border: "rgba(14, 165, 233, 0.3)",
          glow: "0 0 20px rgba(14, 165, 233, 0.2)",
          icon: "fa-triangle-exclamation"
        };
      case "Dikkat":
        return {
          color: "#f59e0b", 
          bg: "rgba(245, 158, 11, 0.1)", 
          border: "rgba(245, 158, 11, 0.3)",
          glow: "0 0 20px rgba(245, 158, 11, 0.2)",
          icon: "fa-circle-exclamation"
        };
      case "Normal":
      default:
        return {
          color: "#0284c7", 
          bg: "rgba(14, 165, 233, 0.1)", 
          border: "rgba(14, 165, 233, 0.3)",
          glow: "0 0 20px rgba(14, 165, 233, 0.2)",
          icon: "fa-info-circle"
        };
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-secondary)", flexDirection: "column", gap: "1.5rem" }}>
      <i 
        
       
        className="fa-solid fa-circle-notch" 
        style={{ fontSize: "2.5rem", color: "var(--accent-primary)" }}
      />
      <span style={{ fontSize: "1.1rem", letterSpacing: "0.05em" }}>Duyurular Yükleniyor...</span>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1.25rem", backgroundColor: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: 'var(--text-primary)',
    fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s ease"
  };

  return (
    <div 
     
     
     
      style={{ color: 'var(--text-primary)', paddingBottom: "3rem", maxWidth: "1600px", width: "100%", padding: "0 1rem", margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Departman <span style={{ color: "var(--accent-primary)", textShadow: "0 0 20px rgba(14, 165, 233,0.4)" }}>Duyuruları</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Departman içi önemli bildirimler ve uyarılar.
          </p>
        </div>
        {user?.role === 'admin' && (
          <div>
            <button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn"
              onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({title: "", content: "", type: "Normal"}); }}
              style={{ 
                background: showAddForm ? "linear-gradient(135deg, rgba(14, 165, 233,0.2), rgba(2, 132, 199,0.1))" : "linear-gradient(135deg, #0284c7, #1D4ED8)",
                color: showAddForm ? "#7dd3fc" : "#fff",
                border: showAddForm ? "1px solid rgba(14, 165, 233,0.3)" : "none",
                boxShadow: showAddForm ? "none" : "0 8px 25px rgba(14, 165, 233, 0.4)",
                padding: "1rem 1.5rem", borderRadius: "12px", fontWeight: 800
              }}
            >
              {showAddForm ? <><i className="fa-solid fa-xmark" style={{ marginRight: '0.5rem' }}></i> İPTAL</> : <><i className="fa-solid fa-bullhorn" style={{ marginRight: '0.5rem' }}></i> YENİ DUYURU</>}
            </button>
          </div>
        )}
      </div>

      <>
        {/* Form */}
        {showAddForm && user?.role === 'admin' && (
          <div 
           
           
           
            style={{ overflow: 'hidden' }}
          >
            <div style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '20px', padding: '2.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(14, 165, 233, 0.05)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2.5rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-pen-to-square"></i>
                {editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Yayınla"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>DUYURU BAŞLIĞI</label>
                    <input name="title" type="text" style={inputStyle} value={formData.title} onChange={handleChange} required 
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233,0.05)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>ÖNEM DERECESİ</label>
                    <select name="type" style={inputStyle} value={formData.type} onChange={handleChange} required
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Dikkat">Dikkat</option>
                      <option value="Acil">Acil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>DUYURU İÇERİĞİ</label>
                  <textarea name="content" style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} rows={4} value={formData.content} onChange={handleChange} required
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233,0.05)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={submitting} style={{ 
                    flex: 1, padding: '1rem', borderRadius: '12px', border: 'none',
                    background: "linear-gradient(135deg, #0284c7, #1D4ED8)", color: 'var(--text-primary)', fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                    boxShadow: submitting ? 'none' : '0 8px 25px rgba(14, 165, 233, 0.4)'
                  }}>
                    {submitting ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> İŞLENİYOR...</> : <><i className="fa-solid fa-paper-plane" style={{ marginRight: '0.5rem' }}></i> {editingId ? "GÜNCELLE" : "YAYINLA"}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {announcements.length === 0 ? (
          <div style={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '4rem 2rem', 
            textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' 
          }}>
            <i className="fa-solid fa-bell-slash" style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
              Sistemde henüz yayınlanmış bir duyuru bulunmuyor.
            </p>
          </div>
        ) : (
          announcements.map((ann: any, idx: number) => {
            const styles = getTypeStyles(ann.type || "Normal");
            return (
              <div 
               
               
               
                key={ann.id} 
                style={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.5)', 
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '16px', 
                  border: `1px solid ${styles.border}`,
                  padding: '1.5rem',
                  boxShadow: `0 10px 30px rgba(0,0,0,0.15), inset 0 0 20px ${styles.bg}`,
                  display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Glow bar at top */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: styles.color, boxShadow: styles.glow }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '45px', height: '45px', borderRadius: '12px', flexShrink: 0,
                      backgroundColor: styles.bg, color: styles.color, border: `1px solid ${styles.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                      boxShadow: styles.glow
                    }}>
                      <i className={`fa-solid ${styles.icon}`}></i>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', margin: '0 0 0.5rem 0', color: 'var(--text-primary)', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {ann.title}
                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: styles.bg, color: styles.color, border: `1px solid ${styles.border}`, verticalAlign: 'middle' }}>
                          {ann.type || "Normal"}
                        </span>
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem', textTransform: 'uppercase', fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-primary)' }}><i className="fa-solid fa-user-shield" style={{ marginRight: '0.4rem', color: 'var(--accent-primary)' }}></i>#{ann.author?.badge} {ann.author?.name} ({ann.author?.rank})</span>
                        <span><i className="fa-regular fa-clock" style={{ marginRight: '0.4rem' }}></i>{new Date(ann.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(ann)} title="Düzenle" style={{
                        width: '35px', height: '35px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-light)', color: 'var(--text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = '#0284c7'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0284c7'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                      ><i className="fa-solid fa-pen" style={{ fontSize: '0.9rem' }}></i></button>
                      
                      <button onClick={() => handleDelete(ann.id)} title="Sil" style={{
                        width: '35px', height: '35px', borderRadius: '8px', backgroundColor: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid rgba(14, 165, 233, 0.2)', color: '#0ea5e9', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                      }}
                      onMouseOver={e => { e.currentTarget.style.backgroundColor = '#0ea5e9'; e.currentTarget.style.color = '#fff'; }}
                      onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)'; e.currentTarget.style.color = '#0ea5e9'; }}
                      ><i className="fa-solid fa-trash" style={{ fontSize: '0.9rem' }}></i></button>
                    </div>
                  )}
                </div>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', borderLeft: `3px solid ${styles.color}` }}>
                  <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '0.95rem', margin: 0, color: 'rgba(255,255,255,0.9)' }}>
                    {ann.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
