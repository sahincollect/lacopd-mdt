// src/app/mdt/kriminal/page.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const glassCard: React.CSSProperties = {
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
};

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#161616",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
  padding: "0.58rem 0.9rem", color: "#ededed",
  fontSize: "0.83rem", outline: "none", fontFamily: "'Inter', sans-serif",
  transition: "all 0.18s ease", boxSizing: "border-box",
};

export default function SuçluVeritabanı() {
  const [search, setSearch]           = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [formData, setFormData]       = useState({ name: "", crimes: "", notes: "", image: "" });
  const [uploadingImg, setUploadingImg] = useState(false);

  const { data: criminalsData, mutate } = useSWR("/api/criminals", fetcher);
  const { data: meData }                = useSWR("/api/auth/me", fetcher);

  const loading   = !criminalsData || !meData;
  const criminals = criminalsData?.criminals || [];
  const user      = meData?.user || null;

  const toggleExpand = (id: number) =>
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const currentUrls = formData.image ? formData.image.split(",") : [];
    if (currentUrls.length >= 5) {
      toast.error("En fazla 5 adet sabıka fotoğrafı ekleyebilirsiniz.");
      return;
    }
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, image: prev.image ? prev.image + "," + data.url : data.url }));
        toast.success("Fotoğraf eklendi.");
      } else toast.error(data.error || "Yükleme başarısız.");
    } catch { toast.error("Sunucu hatası."); }
    finally { setUploadingImg(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const url    = editingId ? `/api/criminals/${editingId}` : "/api/criminals";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) {
        setFormData({ name: "", crimes: "", notes: "", image: "" });
        setShowAddForm(false); setEditingId(null); mutate();
        toast.success(editingId ? "Kayıt güncellendi." : "Yeni kayıt işlendi.");
      } else toast.error("İşlem başarısız.");
    } catch { toast.error("Hata oluştu."); }
    finally  { setSubmitting(false); }
  };

  const handleEdit = (c: any) => {
    setFormData({ name: c.name, crimes: c.crimes, notes: c.notes || "", image: c.image || "" });
    setEditingId(c.id); setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/criminals/${id}`, { method: "DELETE" });
      if (res.ok) { mutate(); toast.success("Kayıt silindi."); }
      else toast.error("Silme başarısız.");
    } catch { toast.error("Hata oluştu."); }
  };

  const filtered = criminals.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.crimes.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: "1rem" }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "1.8rem", color: "#555" }} />
      <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600, letterSpacing: "0.1em" }}>VERİTABANI TARANIYOR...</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .crim-row { transition: all 0.18s ease; }
        .crim-row:hover { border-color: rgba(239,68,68,0.3) !important; }
        .mdt-inp:focus { border-color: #555 !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.08) !important; }
        .hdr-btn:hover { box-shadow: 0 6px 24px rgba(255,255,255,0.16) !important; transform: translateY(-1px) !important; }
        .edit-btn:hover { border-color: rgba(255,255,255,0.16) !important; color: #1D6EF7 !important; background: #161616 !important; }
        .del-btn:hover  { background: rgba(239,68,68,0.15) !important; }
        .expand-row { cursor: pointer; }
        .expand-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        {/* ─── Header ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#333", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.45rem" }}>
              L.A.C.P.D. · İSTİHBARAT
            </div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ededed", margin: 0, letterSpacing: "-0.02em" }}>
              Kriminal Kayıtlar
            </h1>
            <p style={{ color: "#666", fontSize: "0.8rem", margin: "0.4rem 0 0", fontWeight: 400 }}>
              Criminal DB — <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(239,68,68,0.6)" }}>{criminals.length} kayıt</span>
            </p>
          </div>
          <button
            className="hdr-btn"
            onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ name: "", crimes: "", notes: "", image: "" }); }}
            style={{
              display: "flex", alignItems: "center", gap: "0.55rem",
              padding: "0.65rem 1.35rem", borderRadius: 9,
              background: "#1D6EF7",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              boxShadow: "none", transition: "all 0.18s ease",
            }}
          >
            <i className="fa-solid fa-fingerprint" style={{ fontSize: "0.78rem" }} /> YENİ SABIKA KAYDI
          </button>
        </div>

        {/* ─── Search ─── */}
        <div style={{ position: "relative" }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: "0.85rem", pointerEvents: "none" }} />
          <input
            className="mdt-inp"
            type="text"
            placeholder="İsim veya suça göre ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "2.6rem", fontSize: "0.88rem", padding: "0.7rem 0.9rem 0.7rem 2.6rem" }}
          />
        </div>

        {/* ─── List ─── */}
        {filtered.length === 0 ? (
          <div style={{ ...glassCard, padding: "5rem 2rem", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <i className="fa-solid fa-shield-halved" style={{ color: "rgba(239,68,68,0.25)", fontSize: "1.4rem" }} />
            </div>
            <div style={{ fontSize: "0.9rem", color: "#555", fontWeight: 600 }}>
              {search ? "Aranan kritere uygun kayıt bulunamadı." : "Sistemde kriminal kayıt bulunmuyor."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map((c: any) => {
              const canModify = user && (user.id === c.officerId || user.role === "admin");
              const crimeList = c.crimes ? c.crimes.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
              const isExp     = expandedIds.includes(c.id);
              const initials  = c.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

              return (
                <div
                  key={c.id}
                  className="crim-row"
                  style={{
                    ...glassCard,
                    borderLeft: "3px solid rgba(239,68,68,0.5)",
                  }}
                >
                  {/* Row header */}
                  <div
                    className="expand-row"
                    onClick={() => toggleExpand(c.id)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "1rem 1.25rem",
                      background: isExp ? "rgba(239,68,68,0.03)" : "transparent",
                      borderBottom: isExp ? "1px solid #161616" : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {/* Avatar */}
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%",
                        background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#ef4444", fontSize: "0.85rem", fontWeight: 800, fontFamily: "'Inter', sans-serif",
                        flexShrink: 0,
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#ededed" }}>{c.name}</div>
                        <div style={{ fontSize: "0.67rem", color: "#555", marginTop: 2, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <i className="fa-regular fa-clock" style={{ fontSize: "0.58rem" }} />
                          {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(239,68,68,0.4)", display: "inline-block" }} />
                          <span style={{ color: "rgba(239,68,68,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{crimeList.length} suç kaydı</span>
                        </div>
                      </div>
                    </div>
                    <i className={`fa-solid fa-chevron-${isExp ? "up" : "down"}`} style={{ color: "rgba(255,255,255,0.14)", fontSize: "0.7rem" }} />
                  </div>

                  {/* Expanded detail */}
                  {isExp && (
                    <div style={{ padding: "1.25rem", background: "#161616" }}>
                      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                        {/* Info Left */}
                        <div style={{ flex: 1, minWidth: 200 }}>
                          {/* Crimes */}
                          <div style={{ marginBottom: "1.1rem" }}>
                            <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "rgba(239,68,68,0.45)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <i className="fa-solid fa-gavel" style={{ fontSize: "0.55rem" }} /> İşlenen Suçlar
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                              {crimeList.map((crime: string, idx: number) => (
                                <span key={idx} style={{
                                  padding: "0.25rem 0.7rem", borderRadius: 20,
                                  background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                                  color: "rgba(239,68,68,0.7)", fontSize: "0.72rem", fontWeight: 600,
                                }}>
                                  {crime}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          {c.notes && (
                            <div style={{ marginBottom: "1.1rem" }}>
                              <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <i className="fa-solid fa-align-left" style={{ fontSize: "0.55rem" }} /> Ek Notlar
                              </div>
                              <p style={{ margin: 0, lineHeight: 1.7, fontSize: "0.83rem", color: "#888", whiteSpace: "pre-wrap", background: "#161616", padding: "0.8rem 1rem", borderRadius: 8, border: "1px solid #161616" }}>
                                {c.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Image Right */}
                        {c.image && (
                          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 300, flexShrink: 0 }}>
                            {c.image.split(",").map((url: string, i: number) => (
                              <div key={i} style={{ width: 140 }}>
                                 <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "rgba(239,68,68,0.45)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.6rem", textAlign: "center" }}>MUGSHOT {i + 1}</div>
                                 <img src={url} alt={`Sabıka ${i + 1}`} style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", display: "block" }} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.9rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "0.68rem", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
                          <i className="fa-solid fa-shield" style={{ color: "#333", marginRight: "0.4rem" }} />
                          {c.officer?.badge ? `#${c.officer.badge}` : "—"}
                        </span>
                        {canModify && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button className="edit-btn" onClick={() => handleEdit(c)} style={{
                              display: "flex", alignItems: "center", gap: "0.4rem",
                              padding: "0.4rem 0.85rem", borderRadius: 7, fontSize: "0.72rem", fontWeight: 600,
                              border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
                              color: "#666", cursor: "pointer", transition: "all 0.15s",
                            }}>
                              <i className="fa-solid fa-pen" /> Düzenle
                            </button>
                            <button className="del-btn" onClick={() => handleDelete(c.id)} style={{
                              padding: "0.4rem 0.65rem", borderRadius: 7, fontSize: "0.72rem",
                              border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                              color: "#ef4444", cursor: "pointer", transition: "all 0.15s",
                            }}>
                              <i className="fa-solid fa-trash" />
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

      {/* ─── Modal ─── */}
      {showAddForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddForm(false); }}
        >
          <div style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            width: "100%", maxWidth: 560, boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}>
            <div style={{ padding: "1.35rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(90deg, rgba(239,68,68,0.05) 0%, transparent 100%)" }}>
              <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "rgba(239,68,68,0.45)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                CRIMINAL DB · {editingId ? "GÜNCELLE" : "YENİ KAYIT"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1rem", color: "#ededed" }}>
                  {editingId ? "Sabıka Kaydını Düzenle" : "Yeni Sabıka Kaydı"}
                </h3>
                <button onClick={() => setShowAddForm(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "1.1rem" }}
                  onMouseOver={e => (e.currentTarget.style.color = "#ef4444")}
                  onMouseOut={e  => (e.currentTarget.style.color = "#555")}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Şüpheli / Suçlu İsmi</label>
                <input className="mdt-inp" name="name" type="text" value={formData.name} onChange={handleChange} required placeholder="Tam isim soyisim..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>İşlenen Suçlar <span style={{ color: "#555", fontWeight: 400, letterSpacing: 0 }}>(virgülle ayırın)</span></label>
                <input className="mdt-inp" name="crimes" type="text" value={formData.crimes} onChange={handleChange} required placeholder="Silahlı Soygun, Polise Mukavemet..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Sabıka Fotoğrafı (En fazla 5 adet)</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <label style={{ ...inputStyle, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "#161616", color: "rgba(29,110,247,0.8)", fontWeight: 600, width: "auto", padding: "0.6rem 1rem" }}>
                    <i className={uploadingImg ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-camera"} /> 
                    {uploadingImg ? "Yükleniyor..." : "Fotoğraf Ekle"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploadingImg || (formData.image && formData.image.split(",").length >= 5)} />
                  </label>
                  {formData.image && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", width: "100%", marginTop: "0.5rem" }}>
                      {formData.image.split(",").map((url: string, i: number) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#00d26a", fontWeight: 600, background: "rgba(0,210,106,0.1)", padding: "0.3rem 0.6rem", borderRadius: 6, border: "1px solid rgba(0,210,106,0.2)" }}>
                          <i className="fa-solid fa-check-circle" /> Foto {i + 1}
                          <button type="button" onClick={() => {
                            const newUrls = formData.image.split(",").filter((_: any, idx: number) => idx !== i).join(",");
                            setFormData(prev => ({...prev, image: newUrls}));
                          }} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.7)", cursor: "pointer", padding: "0 0.2rem", marginLeft: "0.25rem" }}>Sil</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Ek Notlar <span style={{ color: "#555", fontWeight: 400, letterSpacing: 0 }}>(opsiyonel)</span></label>
                <textarea className="mdt-inp" name="notes" value={formData.notes} onChange={handleChange} rows={4}
                  placeholder="Ek detaylar, tanıklar, deliller..."
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.25rem" }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: "0.6rem 1.1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#666", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s" }}>İptal</button>
                <button type="submit" disabled={submitting} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.35rem", borderRadius: 8, background: "#1D6EF7", border: "1px solid rgba(255,255,255,0.16)", color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.65 : 1, transition: "all 0.18s" }}>
                  {submitting ? <><i className="fa-solid fa-spinner fa-spin" /> İŞLENİYOR...</> : <><i className="fa-solid fa-save" /> {editingId ? "GÜNCELLE" : "KAYDET"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
