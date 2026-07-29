"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function Yonetmelikler() {
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  // Expanded item
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: meData } = useSWR('/api/auth/me', fetcher);
  const { data: regData, mutate: mutateRegs } = useSWR('/api/yonetmelikler', fetcher);

  const loading = !meData || !regData;
  const user = meData?.user || null;
  const regulations = regData?.regulations || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/yonetmelikler/${editingId}` : "/api/yonetmelikler";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ title: "", content: "" });
        setShowForm(false);
        setEditingId(null);
        mutateRegs();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error("Hata: " + (errData.error || "İşlem başarısız oldu."));
      }
    } catch {
      toast.error("Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reg: any) => {
    setFormData({ title: reg.title, content: reg.content });
    setEditingId(reg.id);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu yönetmeliği silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/yonetmelikler/${id}`, { method: "DELETE" });
    if (res.ok) mutateRegs();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", content: "" });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1.25rem", backgroundColor: "rgba(15, 23, 42, 0.4)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff",
    fontSize: "0.95rem", outline: "none", boxSizing: "border-box", transition: "all 0.2s ease"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ color: "#fff", paddingBottom: "3rem", maxWidth: "1600px", width: "100%", padding: "0 1rem", margin: "0 auto" }}
    >
      <style>{`
        .reg-card-hover:hover { background-color: rgba(14, 165, 233,0.1) !important; border-color: rgba(14, 165, 233,0.3) !important; box-shadow: inset 0 0 20px rgba(14, 165, 233,0.05) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: "#fff", letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Departman <span style={{ color: "var(--accent-primary)", textShadow: "0 0 20px rgba(14, 165, 233,0.4)" }}>Yönetmelikleri</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            DEPARTMAN İÇİ KURALLAR, PROSEDÜRLER VE YASALAR.
          </p>
        </div>
        {user?.role === 'admin' && (
          <div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn"
              onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({title: "", content: ""}); }}
              style={{ 
                background: showForm ? "linear-gradient(135deg, rgba(14, 165, 233,0.2), rgba(2, 132, 199,0.1))" : "linear-gradient(135deg, #0284c7, #1D4ED8)",
                color: showForm ? "#7dd3fc" : "#fff",
                border: showForm ? "1px solid rgba(14, 165, 233,0.3)" : "none",
                boxShadow: showForm ? "none" : "0 8px 25px rgba(14, 165, 233, 0.4)",
                padding: "1rem 1.5rem", borderRadius: "12px", fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {showForm ? <><i className="fa-solid fa-xmark"></i> İPTAL</> : <><i className="fa-solid fa-plus"></i> YENİ YÖNETMELİK</>}
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {/* Form */}
        {showForm && user?.role === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: "2.5rem" }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(14, 165, 233, 0.3)', borderRadius: '20px', padding: '2.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2), inset 0 0 20px rgba(14, 165, 233, 0.05)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2.5rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-pen-to-square"></i>
                {editingId ? "Yönetmeliği Düzenle" : "Yeni Yönetmelik Ekle"}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>BAŞLIK</label>
                  <input name="title" type="text" style={inputStyle} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required 
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233,0.05)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
                    placeholder="Yönetmelik veya yasa başlığı..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>AÇIKLAMA / İÇERİK</label>
                  <textarea name="content" style={{ ...inputStyle, minHeight: '160px', resize: 'vertical' }} rows={6} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233,0.05)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; }}
                    placeholder="Tüm detayları buraya girin..."
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving} style={{ 
                    flex: 1, padding: '1rem', borderRadius: '12px', border: 'none',
                    background: "linear-gradient(135deg, #0284c7, #1D4ED8)", color: '#fff', fontWeight: 800,
                    letterSpacing: '0.05em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 8px 25px rgba(14, 165, 233, 0.4)'
                  }}>
                    {saving ? <><i className="fa-solid fa-circle-notch fa-spin"></i> KAYDEDİLİYOR</> : <><i className="fa-solid fa-paper-plane"></i> {editingId ? "GÜNCELLE" : "YAYINLA"}</>}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "var(--text-secondary)", flexDirection: "column", gap: "1.5rem" }}>
          <motion.i animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="fa-solid fa-circle-notch" style={{ fontSize: "2.5rem", color: "var(--accent-primary)" }} />
          <span style={{ fontSize: "1.1rem", letterSpacing: "0.05em" }}>Veriler Yükleniyor...</span>
        </div>
      ) : regulations.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: '20px', padding: '4rem 2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <i className="fa-solid fa-book-open" style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }}></i>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Sistemde henüz bir yönetmelik bulunmuyor.</p>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {regulations.map((reg: any, idx: number) => {
            const isExpanded = expandedId === reg.id;
            return (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div
                  className="reg-card-hover"
                  onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem",
                    backgroundColor: isExpanded ? "rgba(14, 165, 233,0.15)" : "rgba(15,23,42,0.6)",
                    border: `1px solid ${isExpanded ? "rgba(14, 165, 233,0.4)" : "rgba(255,255,255,0.05)"}`,
                    borderRadius: isExpanded ? "16px 16px 0 0" : "16px", cursor: "pointer", transition: "all 0.3s",
                    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                    boxShadow: isExpanded ? "inset 0 0 20px rgba(14, 165, 233,0.1)" : "0 4px 20px rgba(0,0,0,0.2)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0, transition: "all 0.3s",
                      backgroundColor: isExpanded ? "rgba(14, 165, 233,0.2)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isExpanded ? "rgba(14, 165, 233,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: isExpanded ? "#60A5FA" : "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                      boxShadow: isExpanded ? "0 0 15px rgba(14, 165, 233,0.3)" : "none"
                    }}>
                      <i className="fa-solid fa-scale-balanced" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: isExpanded ? "#fff" : "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>
                        {reg.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: isExpanded ? "rgba(147,197,253,0.8)" : "var(--text-secondary)", marginTop: "0.25rem", fontWeight: 600 }}>
                        <i className="fa-regular fa-calendar-days" style={{ marginRight: "0.4rem" }}></i>
                        {new Date(reg.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {user?.role === "admin" && (
                      <div style={{ display: "flex", gap: "0.5rem" }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(reg)} title="Düzenle"
                          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(14, 165, 233,0.4)"; e.currentTarget.style.backgroundColor = "rgba(14, 165, 233,0.1)"; e.currentTarget.style.color = "#60A5FA"; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id)} title="Sil"
                          style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(14, 165, 233,0.4)"; e.currentTarget.style.backgroundColor = "rgba(14, 165, 233,0.1)"; e.currentTarget.style.color = "#0ea5e9"; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    )}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}
                      style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: isExpanded ? "rgba(14, 165, 233,0.2)" : "transparent", color: isExpanded ? "#60A5FA" : "var(--text-secondary)" }}
                    >
                      <i className="fa-solid fa-chevron-down" />
                    </motion.div>
                  </div>
                </div>

                {/* Accordion Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: "hidden" }}
                    >
                      <div style={{
                        padding: "2rem 2.5rem", backgroundColor: "rgba(10,15,25,0.8)", border: "1px solid rgba(14, 165, 233,0.3)",
                        borderTop: "none", borderRadius: "0 0 16px 16px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                        boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.2)"
                      }}>
                        <div style={{
                          color: "rgba(255,255,255,0.85)", lineHeight: "1.8", fontSize: "0.95rem", whiteSpace: "pre-wrap", margin: 0,
                          borderLeft: "3px solid rgba(14, 165, 233,0.5)", paddingLeft: "1.5rem"
                        }}>
                          {reg.content}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
