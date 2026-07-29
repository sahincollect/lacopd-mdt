"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#8B5CF6";
const ACCENT_GLOW = "rgba(139,92,246,0.4)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.9rem 1.25rem",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#f1f5f9",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  fontFamily: "'Inter', sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "0.6rem",
};

export default function RideAlongBasvurusu() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    discordName: "",
    age: "",
    email: "",
    preferredDate: "",
    preferredUnit: "",
    reason: "",
    hasExperience: "",
    agreeRules: false,
    agreeSafety: false,
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.discordName || !form.age || !form.reason || !form.agreeRules || !form.agreeSafety) {
      setError("Lütfen tüm zorunlu alanları doldurun ve onayları işaretleyin.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/civil-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ride-along",
          fullName: form.fullName,
          discordName: form.discordName,
          age: parseInt(form.age),
          email: form.email,
          content: JSON.stringify({
            preferredDate: form.preferredDate,
            preferredUnit: form.preferredUnit,
            reason: form.reason,
            hasExperience: form.hasExperience,
          }),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu.");
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#040914", minHeight: "100vh", color: "#f1f5f9", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        input:focus, select:focus, textarea:focus { border-color: ${ACCENT} !important; background-color: rgba(139,92,246,0.04) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.12) !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 70% 30%, rgba(139,92,246,0.07) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 5%", borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(4,9,20,0.85)", backdropFilter: "blur(20px)" }}>
        <Link href="/basvurular" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <img src="/lapd-logo.jpg" alt="LAPD" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${ACCENT}66` }} />
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Başvurular</span>
          <i className="fa-solid fa-chevron-right" style={{ color: "#475569", fontSize: "0.65rem" }} />
          <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.9rem" }}>Ride Along</span>
        </Link>
        <Link href="/basvurular" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} /> Geri
        </Link>
      </nav>

      <main style={{ position: "relative", zIndex: 10, padding: "8rem 5% 4rem", maxWidth: "760px", margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(139,92,246,0.1)", border: `2px solid ${ACCENT}66`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", boxShadow: `0 0 30px ${ACCENT_GLOW}` }}>
                <i className="fa-solid fa-car-side" style={{ fontSize: "1.8rem", color: ACCENT }} />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>Başvurunuz Alındı!</h2>
              <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                Ride Along başvurunuz kaydedildi. Uygun bir devriye zamanı belirlendikten sonra Discord üzerinden bilgilendirileceksiniz. Katılım için ilgili memur koordinatörlüğünde olacaktır.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/basvurular" style={{ padding: "0.85rem 2rem", borderRadius: "12px", backgroundColor: ACCENT, color: "#fff", textDecoration: "none", fontWeight: 700 }}>Başvurulara Dön</Link>
                <Link href="/" style={{ padding: "0.85rem 2rem", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", textDecoration: "none", fontWeight: 600 }}>Ana Sayfa</Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <div style={{ marginBottom: "3rem" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, borderRadius: "50px", padding: "0.4rem 1.25rem", marginBottom: "1.5rem" }}>
                  <i className="fa-solid fa-car-side" style={{ color: ACCENT, fontSize: "0.85rem" }} />
                  <span style={{ fontSize: "0.8rem", color: "#c4b5fd", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sivil Ride Along Programı</span>
                </div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                  Ride Along <span style={{ color: ACCENT }}>Başvurusu</span>
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7 }}>
                  LAPD devriye araçlarına eşlik edin, gerçek saha deneyimi yaşayın. Başvurunuz onaylandıktan sonra size uygun bir devriye zamanı ayarlanacaktır.
                </p>

                {/* Info boxes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "2rem" }}>
                  {[
                    { icon: "fa-clock", title: "Süre", text: "2-4 saat" },
                    { icon: "fa-user-shield", title: "Gözetim", text: "Deneyimli memur" },
                    { icon: "fa-ban", title: "Yasak", text: "Silah taşıma" },
                  ].map((info, i) => (
                    <div key={i} style={{ backgroundColor: "rgba(139,92,246,0.06)", border: `1px solid ${ACCENT}20`, borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
                      <i className={`fa-solid ${info.icon}`} style={{ color: ACCENT, fontSize: "1.1rem", marginBottom: "0.5rem", display: "block" }} />
                      <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{info.title}</div>
                      <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.85rem", marginTop: "0.2rem" }}>{info.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ backgroundColor: "rgba(10,16,35,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "3rem", backdropFilter: "blur(16px)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Karakter Adı Soyadı *</label>
                      <input style={inputStyle} placeholder="Örn: Jane Doe" value={form.fullName} onChange={e => set("fullName", e.target.value)} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Discord Kullanıcı Adı *</label>
                      <input style={inputStyle} placeholder="Örn: jane#5678" value={form.discordName} onChange={e => set("discordName", e.target.value)} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Yaş *</label>
                      <input style={inputStyle} type="number" placeholder="Örn: 25" min="16" value={form.age} onChange={e => set("age", e.target.value)} required />
                    </div>
                    <div>
                      <label style={labelStyle}>Tercih Ettiğiniz Tarih/Saat</label>
                      <input style={inputStyle} type="datetime-local" value={form.preferredDate} onChange={e => set("preferredDate", e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>Tercih Ettiğiniz Birim</label>
                      <select style={inputStyle} value={form.preferredUnit} onChange={e => set("preferredUnit", e.target.value)}>
                        <option value="" style={{ color: "#0f172a" }}>Fark etmez / Seçiniz</option>
                        <option value="Genel Devriye" style={{ color: "#0f172a" }}>Genel Devriye</option>
                        <option value="Traffic Unit" style={{ color: "#0f172a" }}>Traffic Unit</option>
                        <option value="Dedektif Büro" style={{ color: "#0f172a" }}>Dedektif Büro</option>
                        <option value="SWAT" style={{ color: "#0f172a" }}>SWAT (İzinli Operasyon)</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>FiveM Polis RP Deneyiminiz Var mı?</label>
                      <select style={inputStyle} value={form.hasExperience} onChange={e => set("hasExperience", e.target.value)}>
                        <option value="" style={{ color: "#0f172a" }}>Seçiniz...</option>
                        <option value="Evet, aktif oynuyorum" style={{ color: "#0f172a" }}>Evet, aktif oynuyorum</option>
                        <option value="Evet, geçmişte oynadım" style={{ color: "#0f172a" }}>Evet, geçmişte oynadım</option>
                        <option value="Hayır, daha önce oynamadım" style={{ color: "#0f172a" }}>Hayır, daha önce oynamadım</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Neden Ride Along Yapmak İstiyorsunuz? *</label>
                      <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} placeholder="Beklentilerinizi ve neden bu programa başvurduğunuzu yazın..." value={form.reason} onChange={e => set("reason", e.target.value)} required />
                    </div>

                    <div style={{ gridColumn: "1 / -1", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.agreeRules} onChange={e => set("agreeRules", e.target.checked)} style={{ width: "16px", height: "16px", marginTop: "3px", accentColor: ACCENT, flexShrink: 0 }} />
                        <span style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6 }}>LAPD Ride Along program kurallarını okudum ve kabul ediyorum. Devriye sırasında görevli memurun tüm talimatlarına uymayı taahhüt ediyorum.</span>
                      </label>
                      <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.agreeSafety} onChange={e => set("agreeSafety", e.target.checked)} style={{ width: "16px", height: "16px", marginTop: "3px", accentColor: ACCENT, flexShrink: 0 }} />
                        <span style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6 }}>Ride Along sırasında hiçbir polisiye müdahalede bulunmayacağımı, silahlı ya da fiziksel hiçbir eyleme girmeyeceğimi kabul ediyorum.</span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "0.85rem 1.25rem", color: "#fca5a5", fontSize: "0.875rem", marginTop: "1.5rem" }}>
                      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />{error}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                    <button type="submit" disabled={submitting} style={{ padding: "1rem 2.5rem", borderRadius: "14px", background: submitting ? `${ACCENT}55` : `linear-gradient(135deg, ${ACCENT}, #6d28d9)`, border: "none", color: "#fff", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.95rem", boxShadow: `0 8px 25px ${ACCENT_GLOW}`, transition: "all 0.2s", opacity: submitting ? 0.7 : 1, letterSpacing: "0.03em" }}>
                      {submitting ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Gönderiliyor...</> : <><i className="fa-solid fa-paper-plane" style={{ marginRight: "0.5rem" }} />Başvuruyu Gönder</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
