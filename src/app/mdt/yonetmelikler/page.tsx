"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const glassCard: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(13,18,32,0.9) 0%, rgba(10,14,26,0.8) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
};

const inputBase: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
  padding: "0.58rem 0.9rem", color: "#ededed",
  fontSize: "0.83rem", outline: "none", fontFamily: "'Inter', sans-serif",
  transition: "all 0.18s ease", boxSizing: "border-box",
};

export default function Yonetmelikler() {
  const { data: meData }         = useSWR("/api/auth/me", fetcher);
  const { data: yrData, mutate } = useSWR("/api/yonetmelikler", fetcher);

  const user    = meData?.user ?? null;
  const isAdmin = user?.role === "admin";
  const list    = yrData?.yonetmelikler ?? yrData ?? [];

  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ title: "", content: "" });
  const [saving, setSaving]         = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [deletingId, setDeletingId]   = useState<number | null>(null);

  const toggleExpand = (id: number) =>
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/yonetmelikler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setShowModal(false);
      setForm({ title: "", content: "" });
      mutate();
    } catch {}
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu yönetmeliği silmek istediğinize emin misiniz?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/yonetmelikler/${id}`, { method: "DELETE" });
      mutate();
    } catch {}
    finally { setDeletingId(null); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .yr-row { transition: all 0.18s ease; cursor: pointer; }
        .yr-row:hover { background: rgba(255,255,255,0.03) !important; }
        .mdt-inp:focus { border-color: #555 !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.08) !important; }
        .add-btn:hover { box-shadow: 0 6px 24px rgba(255,255,255,0.16) !important; transform: translateY(-1px) !important; }
        .del-yr:hover { background: rgba(239,68,68,0.15) !important; }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "1.75rem", maxWidth: 900, margin: "0 auto" }}>

        {/* ─── Header ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(255,255,255,0.16)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.45rem" }}>
              L.A.C.P.D. · RESMİ BELGELER
            </div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ededed", margin: 0, letterSpacing: "-0.02em" }}>
              Departman Yönetmelikleri
            </h1>
            <p style={{ color: "#666", fontSize: "0.8rem", margin: "0.4rem 0 0", fontWeight: 400 }}>
              Resmi kural, prosedür ve iç tüzükler · <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>{Array.isArray(list) ? list.length : 0} belge</span>
            </p>
          </div>
          {isAdmin && (
            <button
              className="add-btn"
              onClick={() => setShowModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: "0.55rem",
                padding: "0.65rem 1.35rem", borderRadius: 9,
                background: "linear-gradient(135deg, #1D6EF7 0%, #1558d6 100%)",
                border: "1px solid rgba(255,255,255,0.16)", color: "#fff",
                fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                boxShadow: "0 4px 16px rgba(255,255,255,0.12)", transition: "all 0.18s ease",
              }}
            >
              <i className="fa-solid fa-plus" /> Yeni Yönetmelik
            </button>
          )}
        </div>

        {/* ─── List ─── */}
        {!Array.isArray(list) || list.length === 0 ? (
          <div style={{ ...glassCard, padding: "5rem 2rem", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#161616", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <i className="fa-solid fa-scale-balanced" style={{ color: "rgba(255,255,255,0.12)", fontSize: "1.6rem" }} />
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#555" }}>Henüz yönetmelik eklenmedi</div>
            <div style={{ fontSize: "0.78rem", color: "#444", marginTop: "0.5rem" }}>
              Departman yönetmelikleri, prosedürler ve iç tüzükler burada yayınlanacaktır.
            </div>
            {isAdmin && (
              <button onClick={() => setShowModal(true)} style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", borderRadius: 8, background: "#161616", border: "1px solid rgba(255,255,255,0.1)", color: "#1D6EF7", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                <i className="fa-solid fa-plus" /> Yeni Ekle
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {(Array.isArray(list) ? list : []).map((yr: any, idx: number) => {
              const isExp = expandedIds.includes(yr.id);
              return (
                <div key={yr.id} style={glassCard}>
                  {/* Accordion header */}
                  <div
                    className="yr-row"
                    onClick={() => toggleExpand(yr.id)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "1.1rem 1.3rem",
                      borderBottom: isExp ? "1px solid #161616" : "none",
                      background: isExp ? "rgba(255,255,255,0.03)" : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {/* Index badge */}
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: "#161616", border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700,
                        color: "#555",
                      }}>
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.93rem", color: "#ededed" }}>{yr.title}</div>
                        {yr.createdAt && (
                          <div style={{ fontSize: "0.65rem", color: "#555", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                            {new Date(yr.createdAt).toLocaleDateString("tr-TR")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {isAdmin && (
                        <button
                          className="del-yr"
                          onClick={e => { e.stopPropagation(); handleDelete(yr.id); }}
                          disabled={deletingId === yr.id}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                            color: "#ef4444", fontSize: "0.7rem", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                        >
                          {deletingId === yr.id ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-trash" />}
                        </button>
                      )}
                      <i className={`fa-solid fa-chevron-${isExp ? "up" : "down"}`} style={{ color: "rgba(29,110,247,0.35)", fontSize: "0.7rem" }} />
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExp && (
                    <div style={{ padding: "1.25rem 1.5rem", background: "rgba(8,12,20,0.4)" }}>
                      <div style={{
                        fontSize: "0.83rem", lineHeight: 1.8, whiteSpace: "pre-wrap",
                        color: "#aaa",
                        borderLeft: "2px solid rgba(255,255,255,0.1)",
                        paddingLeft: "1.25rem",
                      }}>
                        {yr.content}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Admin Modal ─── */}
      {showModal && isAdmin && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: "linear-gradient(145deg, #111111 0%, rgba(10,14,26,0.96) 100%)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18,
            width: "100%", maxWidth: 580, boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}>
            <div style={{ padding: "1.35rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(90deg, #161616 0%, transparent 100%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.2rem" }}>YÖNETİM · REGULATIONS</div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1rem", color: "#ededed" }}>Yeni Yönetmelik Ekle</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "1.1rem" }}
                onMouseOver={e => (e.currentTarget.style.color = "#ef4444")}
                onMouseOut={e  => (e.currentTarget.style.color = "#555")}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>Başlık</label>
                <input className="mdt-inp" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Yönetmelik başlığı..." style={inputBase} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, color: "#555", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.45rem" }}>İçerik</label>
                <textarea className="mdt-inp" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Yönetmelik içeriği..." rows={9}
                  style={{ ...inputBase, resize: "vertical", lineHeight: 1.7 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button onClick={() => setShowModal(false)} style={{ padding: "0.6rem 1.1rem", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#666", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>İptal</button>
                <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.content.trim()} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.65rem 1.35rem", borderRadius: 8,
                  background: "linear-gradient(135deg, #1D6EF7 0%, #1558d6 100%)",
                  border: "1px solid rgba(255,255,255,0.16)", color: "#fff",
                  fontWeight: 700, fontSize: "0.82rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving || !form.title.trim() || !form.content.trim() ? 0.55 : 1,
                  boxShadow: "0 4px 16px rgba(255,255,255,0.12)", transition: "all 0.18s",
                }}>
                  {saving ? <><i className="fa-solid fa-circle-notch fa-spin" /> KAYDEDİLİYOR...</> : <><i className="fa-solid fa-floppy-disk" /> KAYDET</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
