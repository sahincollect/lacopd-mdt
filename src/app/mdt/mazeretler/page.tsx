// src/app/mdt/mazeretler/page.tsx
"use client";
import { useState, useEffect } from "react";

const STATUS_CFG: Record<string, { bg: string; color: string; border: string; icon: string }> = {
  "Bekliyor":   { bg: "rgba(245,158,11,0.08)",  color: "#f59e0b", border: "rgba(245,158,11,0.2)",  icon: "fa-clock" },
  "Onaylandı":  { bg: "rgba(34,197,94,0.08)",   color: "#22c55e", border: "rgba(34,197,94,0.2)",   icon: "fa-check" },
  "Reddedildi": { bg: "rgba(239,68,68,0.08)",   color: "#ef4444", border: "rgba(239,68,68,0.2)",   icon: "fa-xmark" },
};

const glassCard: React.CSSProperties = {
  background: "linear-gradient(145deg, rgba(13,18,32,0.9) 0%, rgba(10,14,26,0.8) 100%)",
  border: "1px solid rgba(29,110,247,0.1)",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
};

const inputBase: React.CSSProperties = {
  width: "100%", background: "rgba(29,110,247,0.04)",
  border: "1px solid rgba(29,110,247,0.12)", borderRadius: 8,
  padding: "0.58rem 0.9rem", color: "#e8ecf5",
  fontSize: "0.83rem", outline: "none", fontFamily: "'Inter', sans-serif",
  transition: "all 0.18s ease", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.58rem", fontWeight: 800,
  color: "rgba(29,110,247,0.5)", letterSpacing: "0.22em",
  textTransform: "uppercase", marginBottom: "0.45rem",
};

export default function MazeretlerPage() {
  const [form, setForm]         = useState({ badge: "", fullName: "", reason: "", startDate: "", endDate: "", dayCount: "" });
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [user, setUser]         = useState<any>(null);
  const [tab, setTab]           = useState<"form" | "list">("form");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); });
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await fetch("/api/mazeretler");
    if (res.ok) setRequests(await res.json());
  };

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end   = new Date(form.endDate);
      const diff  = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0) setForm(f => ({ ...f, dayCount: diff.toString() }));
    }
  }, [form.startDate, form.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(""); setSuccess("");
    const res  = await fetch("/api/mazeretler", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess("Mazeret talebiniz başarıyla oluşturuldu!");
      setForm({ badge: "", fullName: "", reason: "", startDate: "", endDate: "", dayCount: "" });
      fetchRequests();
      setTimeout(() => setSuccess(""), 4000);
    } else setError(data.message || "Bir hata oluştu.");
  };

  const handleStatus = async (id: number, status: string) => {
    await fetch(`/api/mazeretler/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchRequests();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu mazeret kaydını silmek istediğinizden emin misiniz?")) return;
    await fetch(`/api/mazeretler/${id}`, { method: "DELETE" });
    fetchRequests();
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .mdt-inp:focus { border-color: rgba(29,110,247,0.5) !important; box-shadow: 0 0 0 3px rgba(29,110,247,0.1) !important; }
        .req-row:hover { background: rgba(29,110,247,0.03) !important; }
        .tab-btn-active { background: rgba(29,110,247,0.1) !important; color: #e8ecf5 !important; border-color: rgba(29,110,247,0.25) !important; }
        .approve-btn:hover { background: rgba(34,197,94,0.2) !important; }
        .reject-btn:hover  { background: rgba(245,158,11,0.2) !important; }
        .del-btn:hover     { background: rgba(239,68,68,0.15) !important; }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        {/* ─── Header ─── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(29,110,247,0.4)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.45rem" }}>
              L.A.C.P.D. · İNSAN KAYNAKLARI
            </div>
            <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#e8ecf5", margin: 0, letterSpacing: "-0.02em" }}>
              Mazeret & İzin
            </h1>
            <p style={{ color: "rgba(200,208,230,0.4)", fontSize: "0.8rem", margin: "0.4rem 0 0", fontWeight: 400 }}>
              İzin ve mazeret taleplerini oluşturun veya yönetin.
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(13,18,32,0.9)", padding: "0.3rem", borderRadius: 11, border: "1px solid rgba(29,110,247,0.1)" }}>
            {(["form", "list"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={tab === t ? "tab-btn-active" : ""}
                style={{
                  padding: "0.5rem 1.15rem", borderRadius: 8,
                  border: "1px solid transparent",
                  background: "transparent",
                  color: "rgba(200,208,230,0.4)",
                  fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {t === "form" ? <><i className="fa-solid fa-plus" style={{ marginRight: "0.4rem" }} />Yeni Talep</> : <><i className="fa-solid fa-list" style={{ marginRight: "0.4rem" }} />Başvurular ({requests.length})</>}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Form Tab ─── */}
        {tab === "form" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ ...glassCard, width: "100%", maxWidth: 660 }}>
              {/* Card header */}
              <div style={{ padding: "1.15rem 1.4rem", borderBottom: "1px solid rgba(29,110,247,0.08)", background: "linear-gradient(90deg, rgba(29,110,247,0.05) 0%, transparent 100%)" }}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#e8ecf5", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(29,110,247,0.1)", border: "1px solid rgba(29,110,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-file-signature" style={{ color: "#1D6EF7", fontSize: "0.78rem" }} />
                  </div>
                  Mazeret Talebi Oluştur
                </h3>
              </div>

              <div style={{ padding: "1.5rem" }}>
                {/* Success / Error banners */}
                {success && (
                  <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "0.85rem 1rem", marginBottom: "1.25rem", color: "#22c55e", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="fa-solid fa-circle-check" /> {success}
                  </div>
                )}
                {error && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.85rem 1rem", marginBottom: "1.25rem", color: "#ef4444", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <i className="fa-solid fa-triangle-exclamation" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Rozet Numarası *</label>
                      <input className="mdt-inp" style={inputBase} placeholder="Örn: 042" value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={labelStyle}>İsim Soyisim *</label>
                      <input className="mdt-inp" style={inputBase} placeholder="Tam adınız" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>Başlangıç Tarihi *</label>
                      <input className="mdt-inp" type="date" style={{ ...inputBase, colorScheme: "dark" }} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Bitiş Tarihi *</label>
                      <input className="mdt-inp" type="date" style={{ ...inputBase, colorScheme: "dark" }} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
                    </div>
                  </div>

                  {/* Day counter */}
                  {form.dayCount && (
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
                      padding: "0.9rem", borderRadius: 10,
                      background: "rgba(29,110,247,0.05)", border: "1px dashed rgba(29,110,247,0.2)",
                      color: "#1D6EF7", fontWeight: 700, fontSize: "0.88rem",
                    }}>
                      <i className="fa-solid fa-calendar-days" />
                      Toplam <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", margin: "0 0.25rem" }}>{form.dayCount}</span> Gün
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Mazeret Nedeni *</label>
                    <textarea className="mdt-inp" rows={4} style={{ ...inputBase, resize: "vertical", lineHeight: 1.65 }}
                      placeholder="Mazeret nedeninizi açıklayınız..."
                      value={form.reason}
                      onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" disabled={loading} style={{
                      display: "flex", alignItems: "center", gap: "0.55rem",
                      padding: "0.65rem 1.5rem", borderRadius: 8,
                      background: "linear-gradient(135deg, #1D6EF7 0%, #1558d6 100%)",
                      border: "1px solid rgba(29,110,247,0.4)", color: "#fff",
                      fontWeight: 700, fontSize: "0.82rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.65 : 1, transition: "all 0.18s",
                      boxShadow: "0 4px 16px rgba(29,110,247,0.25)",
                    }}>
                      {loading ? <><i className="fa-solid fa-spinner fa-spin" /> GÖNDERİLİYOR...</> : <><i className="fa-solid fa-paper-plane" /> TALEBİ GÖNDER</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ─── List Tab ─── */}
        {tab === "list" && (
          requests.length === 0 ? (
            <div style={{ ...glassCard, padding: "5rem 2rem", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(29,110,247,0.05)", border: "1px solid rgba(29,110,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <i className="fa-solid fa-calendar-xmark" style={{ color: "rgba(29,110,247,0.25)", fontSize: "1.3rem" }} />
              </div>
              <div style={{ fontSize: "0.85rem", color: "rgba(200,208,230,0.3)", fontWeight: 500 }}>Henüz mazeret talebi bulunmuyor.</div>
            </div>
          ) : (
            <div style={glassCard}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr auto auto", gap: "1rem", padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(29,110,247,0.08)", background: "rgba(8,12,20,0.6)" }}>
                {["Personel", "Tarih Aralığı", "Gerekçe", "Durum", user?.role === "admin" ? "İşlemler" : ""].filter(Boolean).map((h, i) => (
                  <div key={i} style={{ fontSize: "0.58rem", fontWeight: 800, color: "rgba(29,110,247,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              {requests.map((r: any) => {
                const cfg = STATUS_CFG[r.status] || STATUS_CFG["Bekliyor"];
                return (
                  <div key={r.id} className="req-row" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr auto auto", gap: "1rem", alignItems: "center", padding: "0.9rem 1.25rem", borderBottom: "1px solid rgba(29,110,247,0.05)", transition: "background 0.15s" }}>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#e8ecf5" }}>{r.fullName}</div>
                      <div style={{ fontSize: "0.67rem", fontFamily: "'JetBrains Mono', monospace", color: "rgba(29,110,247,0.5)", marginTop: 2 }}>#{r.badge}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(200,208,230,0.55)" }}>{fmt(r.startDate)} — {fmt(r.endDate)}</div>
                      <div style={{ fontSize: "0.68rem", fontFamily: "'JetBrains Mono', monospace", color: "rgba(29,110,247,0.5)", marginTop: 2 }}>{r.dayCount} GÜN</div>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(200,208,230,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason}</div>
                    <div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.7rem", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em" }}>
                        <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: "0.55rem" }} /> {r.status}
                      </span>
                    </div>
                    {user?.role === "admin" && (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        {r.status === "Bekliyor" && (
                          <>
                            <button className="approve-btn" onClick={() => handleStatus(r.id, "Onaylandı")} title="Onayla" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                              <i className="fa-solid fa-check" />
                            </button>
                            <button className="reject-btn" onClick={() => handleStatus(r.id, "Reddedildi")} title="Reddet" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.08)", color: "#f59e0b", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </>
                        )}
                        <button className="del-btn" onClick={() => handleDelete(r.id)} title="Sil" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </>
  );
}
