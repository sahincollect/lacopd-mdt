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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        return { color: "var(--color-danger)", bg: "rgba(239, 68, 68, 0.1)", border: "var(--color-danger)", icon: "fa-triangle-exclamation" };
      case "Dikkat":
        return { color: "var(--lapd-orange)", bg: "rgba(245, 158, 11, 0.1)", border: "var(--lapd-orange)", icon: "fa-circle-exclamation" };
      case "Normal":
      default:
        return { color: "var(--lapd-blue-dark)", bg: "var(--bg-tertiary)", border: "var(--border-light)", icon: "fa-info-circle" };
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }} />
      <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>DUYURULAR YÜKLENİYOR...</span>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.85rem", background: 'var(--bg-tertiary)', border: "1px solid var(--border-light)",
    borderRadius: '4px', color: 'var(--text-primary)', fontSize: "0.95rem", outline: "none", boxSizing: "border-box"
  };

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: "2px solid var(--border-light)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--lapd-blue-dark)', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
            DEPARTMAN DUYURULARI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
            Departman içi önemli bildirimler ve uyarılar.
          </p>
        </div>
        {user?.role === 'admin' && (
          <div>
            <button 
              onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({title: "", content: "", type: "Normal"}); }}
              style={{ 
                background: showAddForm ? "var(--bg-tertiary)" : "var(--lapd-blue-dark)",
                color: showAddForm ? "var(--text-primary)" : "#fff",
                border: showAddForm ? "1px solid var(--border-light)" : "none",
                padding: "0.75rem 1.5rem", borderRadius: '4px', fontWeight: 900, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem"
              }}
            >
              {showAddForm ? <><i className="fa-solid fa-xmark"></i> İPTAL</> : <><i className="fa-solid fa-bullhorn"></i> YENİ DUYURU</>}
            </button>
          </div>
        )}
      </div>

      {/* Form */}
      {showAddForm && user?.role === 'admin' && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--lapd-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fa-solid fa-pen-to-square"></i>
            {editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Yayınla"}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Duyuru Başlığı</label>
                <input name="title" type="text" style={inputStyle} value={formData.title} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Önem Derecesi</label>
                <select name="type" style={inputStyle} value={formData.type} onChange={handleChange} required>
                  <option value="Normal">Normal</option>
                  <option value="Dikkat">Dikkat</option>
                  <option value="Acil">Acil</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Duyuru İçeriği</label>
              <textarea name="content" style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} rows={4} value={formData.content} onChange={handleChange} required></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" disabled={submitting} style={{ 
                padding: '0.85rem 2rem', borderRadius: '4px', border: 'none',
                background: "var(--lapd-blue-dark)", color: '#fff', fontWeight: 900,
                cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> İŞLENİYOR...</> : <><i className="fa-solid fa-paper-plane"></i> {editingId ? "GÜNCELLE" : "YAYINLA"}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Duyuru Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {announcements.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <i className="fa-solid fa-bell-slash" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
              Sistemde henüz yayınlanmış bir duyuru bulunmuyor.
            </p>
          </div>
        ) : (
          announcements.map((ann: any) => {
            const styles = getTypeStyles(ann.type || "Normal");
            return (
              <div key={ann.id} style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: `1px solid var(--border-light)`, padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: styles.color }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '4px', flexShrink: 0, backgroundColor: styles.bg, color: styles.color, border: `1px solid ${styles.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      <i className={`fa-solid ${styles.icon}`}></i>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.5rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {ann.title}
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}>
                          {ann.type || "Normal"}
                        </span>
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700, flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-primary)' }}><i className="fa-solid fa-user-shield" style={{ marginRight: '0.4rem', color: 'var(--lapd-blue-dark)' }}></i>#{ann.author?.badge} {ann.author?.name} ({ann.author?.rank})</span>
                        <span><i className="fa-regular fa-clock" style={{ marginRight: '0.4rem' }}></i>{new Date(ann.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(ann)} title="Düzenle" style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--lapd-blue-dark)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button onClick={() => handleDelete(ann.id)} title="Sil" style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--color-danger)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '4px', border: `1px solid var(--border-light)` }}>
                  <p style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '0.95rem', margin: 0, color: 'var(--text-primary)' }}>
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
