// src/app/mdt/duyurular/page.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  "Normal":  { color: "#1D6EF7", bg: "rgba(29,110,247,0.08)",  border: "rgba(29,110,247,0.2)",  icon: "fa-bullhorn",           label: "Normal"  },
  "Dikkat":  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",  icon: "fa-circle-exclamation", label: "Dikkat"  },
  "Acil":    { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   icon: "fa-triangle-exclamation",label: "Acil"    },
};

const glassCard: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(13,18,32,0.9) 0%, rgba(10,14,26,0.8) 100%)",
  border: "1px solid rgba(29,110,247,0.1)",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(29,110,247,0.04)",
  border: "1px solid rgba(29,110,247,0.12)", borderRadius: 8,
  padding: "0.58rem 0.9rem", color: "#e8ecf5",
  fontSize: "0.83rem", outline: "none", fontFamily: "'Inter', sans-serif",
  transition: "all 0.18s ease", boxSizing: "border-box",
};

export default function Duyurular() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [formData, setFormData]       = useState({ title: "", content: "", type: "Normal" });

  const { data: announcementsData, mutate } = useSWR("/api/announcements", fetcher);
  const { data: meData }                     = useSWR("/api/auth/me", fetcher);

  const loading       = !announcementsData || !meData;
  const announcements = announcementsData?.announcements || [];
  const user          = meData?.user || null;
  const isAdmin       = user?.role === "admin";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url    = editingId ? `/api/announcements/${editingId}` : "/api/announcements";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) {
        setFormData({ title: "", content: "", type: "Normal" });
        setShowAddForm(false); setEditingId(null); mutate();
        toast.success(editingId ? "Duyuru güncellendi." : "Yeni duyuru yayınlandı.");
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error("Hata: " + (d.error || "Bilinmeyen hata."));
      }
    } catch { toast.error("Hata oluştu."); }
    finally   { setSubmitting(false); }
  };

  const handleEdit = (ann: any) => {
    setFormData({ title: ann.title, content: ann.content, type: ann.type || "Normal" });
    setEditingId(ann.id); setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (res.ok) { mutate(); toast.success("Duyuru silindi."); }
      else toast.error("Silme başarısız.");
    } catch { toast.error("Hata oluştu."); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "1.8rem", color: "rgba(29,110,247,0.5)" }} />
      <span style={{ fontSize: "0.82rem", color: "rgba(200,208,230,0.35)", fontWeight: 600, letterSpacing: "0.1em" }}>DUYURULAR YÜKLENİYOR...</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .ann-card { transition: all 0.2s ease; }
        .ann-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px -8px rgba(0,0,0,0.6) !important; }
        .mdt-input:focus { border-color: rgba(29,110,247,0.5) !important; box-shadow: 0 0 0 3px rgba(29,110,247,0.12) !important; }
        .cancel-btn:hover { border-color: rgba(200,208,230,0.3) !important; color: #e8ecf5 !important; }
        .admin-edit-btn:hover { border-color: rgba(29,110,247,0.4) !important; color: #1D6EF7 !important; background: rgba(29,110,247,0.06) !important; }
        .admin-del-btn:hover  { background: rgba(239,68,68,0.15) !important; }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        {/* ─── Page Header ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(29,110,247,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.45rem" }}>
              L.A.C.P.D. · İÇ İLETİŞİM
            </div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#e8ecf5", margin: 0, letterSpacing: "-0.02em" }}>
              Duyurular
            </h1>
            <p style={{ color: "rgba(200,208,230,0.4)", fontSize: "0.8rem", margin: "0.4rem 0 0", fontWeight: 400 }}>
              Departman içi yayınlar · <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(29,110,247,0.6)" }}>{announcements.length} aktif duyuru</span>
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ title: "", content: "", type: "Normal" }); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.55rem",
                padding: "0.65rem 1.35rem", borderRadius: 9,
                background: "linear-gradient(135deg, #1D6EF7 0%, #1558d6 100%)",
                border: "1px solid rgba(29,110,247,0.4)",
                color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(29,110,247,0.25)",
                transition: "all 0.18s ease",
              }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(29,110,247,0.4)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseOut={e  => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(29,110,247,0.25)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              <i className="fa-solid fa-plus" style={{ fontSize: "0.78rem" }} /> YENİ DUYURU
            </button>
          )}
        </div>

        {/* ─── Announcement List ─── */}
        {announcements.length === 0 ? (
          <div style={{ ...glassCard, padding: "5rem 2rem", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(29,110,247,0.05)", border: "1px solid rgba(29,110,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <i className="fa-solid fa-bell-slash" style={{ color: "rgba(29,110,247,0.25)", fontSize: "1.4rem" }} />
            </div>
            <div style={{ fontSize: "0.9rem", color: "rgba(200,208,230,0.35)", fontWeight: 600 }}>Henüz duyuru yayınlanmamış.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {announcements.map((ann: any) => {
              const cfg = TYPE_CONFIG[ann.type || "Normal"] ?? TYPE_CONFIG["Normal"];
              return (
                <div
                  key={ann.id}
                  className="ann-card"
                  style={{
                    ...glassCard,
                    borderLeft: `3px solid ${cfg.color}`,
                    borderRadius: 14,
                  }}
                >
                  {/* Card header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "1.25rem 1.4rem 0.9rem",
                    borderBottom: "1px solid rgba(29,110,247,0.07)",
                    background: `linear-gradient(90deg, ${cfg.bg} 0%, transparent 50%)`,
                    flexWrap: "wrap", gap: "0.75rem",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                      {/* Type badge + time */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem",
                          padding: "0.22rem 0.65rem", borderRadius: 20,
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          color: cfg.color, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
                        }}>
                          <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: "0.55rem" }} /> {cfg.label}
                        </span>
                        <span style={{ fontSize: "0.67rem", color: "rgba(200,208,230,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>
                          {new Date(ann.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </div>
                      {/* Title */}
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#e8ecf5", lineHeight: 1.3 }}>{ann.title}</h3>
                      {/* Author */}
                      <div style={{ fontSize: "0.7rem", color: "rgba(200,208,230,0.38)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <i className="fa-solid fa-user-shield" style={{ color: "rgba(29,110,247,0.4)", fontSize: "0.62rem" }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>#{ann.author?.badge}</span>
                        <span>{ann.author?.name}</span>
                        {ann.author?.rank && <span style={{ color: "rgba(29,110,247,0.4)" }}>· {ann.author.rank}</span>}
                      </div>
                    </div>

                    {/* Admin actions */}
                    {isAdmin && (
                      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                        <button className="admin-edit-btn" onClick={() => handleEdit(ann)} title="Düzenle" style={{
                          padding: "0.45rem 0.75rem", borderRadius: 8, fontSize: "0.75rem",
                          border: "1px solid rgba(29,110,247,0.15)", background: "transparent",
                          color: "rgba(200,208,230,0.4)", cursor: "pointer", transition: "all 0.15s",
                        }}>
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button className="admin-del-btn" onClick={() => handleDelete(ann.id)} title="Sil" style={{
                          padding: "0.45rem 0.75rem", borderRadius: 8, fontSize: "0.75rem",
                          border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                          color: "#ef4444", cursor: "pointer", transition: "all 0.15s",
                        }}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content body */}
                  <div style={{ padding: "1.1rem 1.4rem" }}>
                    <p style={{ lineHeight: 1.75, whiteSpace: "pre-wrap", fontSize: "0.86rem", margin: 0, color: "rgba(200,208,230,0.6)" }}>
                      {ann.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal ─── */}
      {showAddForm && isAdmin && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddForm(false); }}
        >
          <div style={{ ...glassCard, borderRadius: 18, width: "100%", maxWidth: 560, boxShadow: "0 24px 80px rgba(0,0,0,0.7)", border: "1px solid rgba(29,110,247,0.2)" }}>
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.35rem 1.5rem", borderBottom: "1px solid rgba(29,110,247,0.1)", background: "linear-gradient(90deg, rgba(29,110,247,0.05) 0%, transparent 100%)" }}>
              <div>
                <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "rgba(29,110,247,0.45)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                  ADMIN · BROADCAST
                </div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1rem", color: "#e8ecf5" }}>
                  {editingId ? "Duyuruyu Düzenle" : "Yeni Duyuru Yayınla"}
                </h3>
              </div>
              <button onClick={() => setShowAddForm(false)} style={{ background: "none", border: "none", color: "rgba(200,208,230,0.3)", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem", borderRadius: 6, transition: "color 0.15s" }}
                onMouseOver={e => (e.currentTarget.style.color = "#ef4444")}
                onMouseOut={e  => (e.currentTarget.style.color = "rgba(200,208,230,0.3)")}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "rgba(29,110,247,0.5)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Duyuru Başlığı</label>
                <input className="mdt-input" name="title" type="text" value={formData.title} onChange={handleChange} required placeholder="Duyuru başlığını girin..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "rgba(29,110,247,0.5)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Önem Derecesi</label>
                <select className="mdt-input" name="type" value={formData.type} onChange={handleChange} style={{ ...inputStyle, appearance: "none" }}>
                  <option value="Normal">Normal</option>
                  <option value="Dikkat">Dikkat</option>
                  <option value="Acil">Acil</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "rgba(29,110,247,0.5)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>İçerik</label>
                <textarea className="mdt-input" name="content" value={formData.content} onChange={handleChange} required rows={5}
                  placeholder="Duyuru içeriğini buraya yazın..."
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.25rem" }}>
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)} style={{
                  padding: "0.6rem 1.1rem", borderRadius: 8, border: "1px solid rgba(29,110,247,0.12)",
                  background: "transparent", color: "rgba(200,208,230,0.4)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s",
                }}>İptal</button>
                <button type="submit" disabled={submitting} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.65rem 1.35rem", borderRadius: 8,
                  background: "linear-gradient(135deg, #1D6EF7 0%, #1558d6 100%)",
                  border: "1px solid rgba(29,110,247,0.4)", color: "#fff",
                  fontWeight: 700, fontSize: "0.82rem", cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.65 : 1, transition: "all 0.18s",
                }}>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin" /> İŞLENİYOR...</> : <><i className="fa-solid fa-paper-plane" /> {editingId ? "GÜNCELLE" : "YAYINLA"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
