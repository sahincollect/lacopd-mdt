// src/app/mdt/duyurular/page.tsx
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
        toast.success("Duyuru silindi.");
      } else {
        toast.error("Silme işlemi başarısız.");
      }
    } catch (error) {
      toast.error("Hata oluştu.");
    }
  };

  const getTypeStyles = (type: string) => {
    switch(type) {
      case "Acil":
        return { color: "var(--mdt-danger)", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.22)", icon: "fa-triangle-exclamation" };
      case "Dikkat":
        return { color: "var(--mdt-warning)", bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.25)", icon: "fa-circle-exclamation" };
      case "Normal":
      default:
        return { color: "var(--mdt-accent)", bg: "rgba(29, 110, 247, 0.12)", border: "rgba(29, 110, 247, 0.22)", icon: "fa-bullhorn" };
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--mdt-text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>DUYURULAR YÜKLENİYOR...</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--mdt-border)', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            L.A.C.P.D. · İÇ İLETİŞİM
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--mdt-text-muted)" }} />
            <span style={{ color: "var(--mdt-accent)" }}>DEPT BROADCAST</span>
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, color: 'var(--mdt-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Duyurular
          </h1>
          <p style={{ color: 'var(--mdt-text-muted)', fontSize: '0.82rem', marginTop: '0.35rem', fontWeight: 400 }}>
            Departman içi önemli bildirimler ve uyarılar.
          </p>
        </div>
        {user?.role === 'admin' && (
          <div>
            <button 
              onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({title: "", content: "", type: "Normal"}); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem', borderRadius: 8, border: '1px solid var(--mdt-accent)', background: 'var(--mdt-accent)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <i className="fa-solid fa-plus"></i> YENİ DUYURU
            </button>
          </div>
        )}
      </div>

      {/* Duyuru Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--mdt-text-muted)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--mdt-accent-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-bell-slash" style={{ fontSize: '1.5rem', color: 'var(--mdt-accent)', opacity: 0.6 }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--mdt-text-secondary)', marginBottom: '0.3rem' }}>Duyuru bulunamadı</div>
              <div style={{ fontSize: '0.82rem' }}>Sistemde henüz yayınlanmış bir duyuru yok.</div>
            </div>
          </div>
        ) : (
          announcements.map((ann: any) => {
            const styles = getTypeStyles(ann.type || "Normal");
            return (
              <div key={ann.id} style={{ 
                background: 'var(--mdt-card-bg)',
                border: '1px solid var(--mdt-border)',
                borderLeft: `4px solid ${styles.color}`,
                borderRadius: 10,
                padding: '1.5rem',
                transition: 'border-color 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.borderRightColor = 'var(--mdt-accent)'}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.borderRightColor = 'var(--mdt-border)'}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className={`fa-solid ${styles.icon}`}></i> {ann.type || "Normal"}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--mdt-text-muted)' }}>
                        <i className="fa-regular fa-clock" style={{ marginRight: '0.4rem' }}></i>{new Date(ann.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.25rem 0', color: 'var(--mdt-text-primary)' }}>
                      {ann.title}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--mdt-text-muted)', fontWeight: 600 }}>
                      <i className="fa-solid fa-user-shield" style={{ marginRight: '0.4rem', color: 'var(--mdt-accent)' }}></i>#{ann.author?.badge} {ann.author?.name} ({ann.author?.rank})
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(ann)} title="Düzenle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--mdt-border)', background: 'transparent', color: 'var(--mdt-text-secondary)', fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-accent)'; }}
                        onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)'; }}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button onClick={() => handleDelete(ann.id)} title="Sil" style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.12s' }}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={{ background: 'var(--mdt-bg-main)', padding: '1.25rem', borderRadius: 8, border: `1px solid var(--mdt-border)` }}>
                  <p style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '0.9rem', margin: 0, color: 'var(--mdt-text-secondary)' }}>
                    {ann.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Form Modal */}
      {showAddForm && user?.role === 'admin' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--mdt-card-bg)', border: '1px solid var(--mdt-border)', borderRadius: 14, padding: '1.75rem', width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.55)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--mdt-text-primary)' }}>
                {editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Yayınla"}
              </h3>
              <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mdt-text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>Duyuru Başlığı</label>
                <input name="title" type="text" 
                  style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                  value={formData.title} onChange={handleChange} required 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>Önem Derecesi</label>
                <select name="type" 
                  style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                  value={formData.type} onChange={handleChange} required>
                  <option value="Normal">Normal</option>
                  <option value="Dikkat">Dikkat</option>
                  <option value="Acil">Acil</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mdt-text-muted)', marginBottom: '0.45rem' }}>İçerik</label>
                <textarea name="content" 
                  style={{ width: '100%', background: 'var(--mdt-bg-main)', border: '1px solid var(--mdt-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--mdt-text-primary)', fontSize: '0.875rem', outline: 'none', fontFamily: "'Inter', sans-serif", transition: 'border-color 0.15s, box-shadow 0.15s', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--mdt-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--mdt-border)'; e.target.style.boxShadow = 'none'; }}
                  value={formData.content} onChange={handleChange} required></textarea>
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
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> İŞLENİYOR...</> : <><i className="fa-solid fa-paper-plane"></i> {editingId ? "GÜNCELLE" : "YAYINLA"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
