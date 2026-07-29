"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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

const ACCENT = "#0EA5E9";
const ACCENT_GLOW = "rgba(14,165,233,0.4)";

export default function MemurBasvurusu() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    discordName: "",
    age: "",
    email: "",
    timezone: "",
    hoursPerWeek: "",
    experience: "",
    motivation: "",
    pastDepartments: "",
    referral: "",
    agreeRules: false,
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.fullName || !form.discordName || !form.age || !form.motivation || !form.agreeRules) {
      setError("Lütfen tüm zorunlu alanları doldurun ve kuralları kabul edin.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/civil-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "memur",
          fullName: form.fullName,
          discordName: form.discordName,
          age: parseInt(form.age),
          email: form.email,
          content: JSON.stringify({
            timezone: form.timezone,
            hoursPerWeek: form.hoursPerWeek,
            experience: form.experience,
            motivation: form.motivation,
            pastDepartments: form.pastDepartments,
            referral: form.referral,
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
        input:focus, select:focus, textarea:focus { border-color: ${ACCENT} !important; background-color: rgba(14,165,233,0.04) !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.12) !important; }
        @keyframes float-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* BG */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 30% 40%, rgba(14,165,233,0.06) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 5%", borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(4,9,20,0.85)", backdropFilter: "blur(20px)" }}>
        <Link href="/basvurular" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <img src="/lapd-logo.png" alt="LAC" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid rgba(14,165,233,0.4)" }} />
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Başvurular</span>
          <i className="fa-solid fa-chevron-right" style={{ color: "#475569", fontSize: "0.65rem" }} />
          <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.9rem" }}>Memur Başvurusu</span>
        </Link>
        <Link href="/basvurular" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} /> Geri
        </Link>
      </nav>

      <main style={{ position: "relative", zIndex: 10, padding: "8rem 5% 4rem", maxWidth: "860px", margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", boxShadow: "0 0 30px rgba(16,185,129,0.3)" }}>
                <i className="fa-solid fa-check" style={{ fontSize: "2rem", color: "#10b981" }} />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>Başvurunuz Alındı!</h2>
              <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                Memur başvurunuz başarıyla sisteme kaydedildi. Yönetim ekibimiz başvurunuzu en kısa sürede inceleyecek ve Discord üzerinden sizinle iletişime geçecektir.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/basvurular" style={{ padding: "0.85rem 2rem", borderRadius: "12px", backgroundColor: ACCENT, color: "#040914", textDecoration: "none", fontWeight: 700 }}>
                  Başvurulara Dön
                </Link>
                <Link href="/" style={{ padding: "0.85rem 2rem", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", textDecoration: "none", fontWeight: 600 }}>
                  Ana Sayfa
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <div style={{ marginBottom: "3rem" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: "50px", padding: "0.4rem 1.25rem", marginBottom: "1.5rem" }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: ACCENT, fontSize: "0.8rem" }} />
                  <span style={{ fontSize: "0.8rem", color: "#7dd3fc", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Resmi Memur Başvurusu</span>
                </div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                  LAC&apos;ye Katıl
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7 }}>
                  Tüm alanları dürüstçe ve eksiksiz doldurun. Eksik veya yanlış bilgi başvurunuzun reddedilmesine neden olabilir.
                </p>
              </div>

              {/* Progress Steps */}
              <div style={{ display: "flex", gap: "0", marginBottom: "3rem", position: "relative" }}>
                {["Kişisel Bilgiler", "Deneyim & Motivasyon", "Onay"].map((s, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    {i < 2 && <div style={{ position: "absolute", top: "18px", left: "50%", right: "-50%", height: "2px", backgroundColor: step > i + 1 ? ACCENT : "rgba(255,255,255,0.08)", zIndex: 0, transition: "background-color 0.4s" }} />}
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: step > i ? ACCENT : step === i + 1 ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.05)", border: `2px solid ${step >= i + 1 ? ACCENT : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, transition: "all 0.4s", boxShadow: step === i + 1 ? `0 0 15px ${ACCENT_GLOW}` : "none" }}>
                      {step > i ? <i className="fa-solid fa-check" style={{ color: "#040914", fontSize: "0.75rem" }} /> : <span style={{ color: step === i + 1 ? ACCENT : "#475569", fontSize: "0.8rem", fontWeight: 700 }}>{i + 1}</span>}
                    </div>
                    <span style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: step === i + 1 ? ACCENT : "#475569", fontWeight: 600, textAlign: "center", display: "none" }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Form Steps */}
              <div style={{ backgroundColor: "rgba(10,16,35,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "3rem", backdropFilter: "blur(16px)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <i className="fa-solid fa-user" style={{ color: ACCENT }} /> Kişisel Bilgiler
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Karakter Adı Soyadı *</label>
                          <input style={inputStyle} placeholder="Örn: John Miller" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Discord Kullanıcı Adı *</label>
                          <input style={inputStyle} placeholder="Örn: john#1234" value={form.discordName} onChange={e => set("discordName", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Yaş *</label>
                          <input style={inputStyle} type="number" placeholder="Örn: 22" min="18" max="99" value={form.age} onChange={e => set("age", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>E-posta (İsteğe Bağlı)</label>
                          <input style={inputStyle} type="email" placeholder="ornek@mail.com" value={form.email} onChange={e => set("email", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Zaman Dilimi</label>
                          <select style={inputStyle} value={form.timezone} onChange={e => set("timezone", e.target.value)}>
                            <option value="" style={{ color: "#0f172a" }}>Seçiniz...</option>
                            <option value="UTC+3" style={{ color: "#0f172a" }}>UTC+3 (Türkiye)</option>
                            <option value="UTC+1" style={{ color: "#0f172a" }}>UTC+1 (Avrupa Merkezi)</option>
                            <option value="UTC+0" style={{ color: "#0f172a" }}>UTC+0 (İngiltere)</option>
                            <option value="Diğer" style={{ color: "#0f172a" }}>Diğer</option>
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Haftalık Aktif Süre</label>
                          <select style={inputStyle} value={form.hoursPerWeek} onChange={e => set("hoursPerWeek", e.target.value)}>
                            <option value="" style={{ color: "#0f172a" }}>Seçiniz...</option>
                            <option value="5-10 saat" style={{ color: "#0f172a" }}>5-10 saat</option>
                            <option value="10-20 saat" style={{ color: "#0f172a" }}>10-20 saat</option>
                            <option value="20-30 saat" style={{ color: "#0f172a" }}>20-30 saat</option>
                            <option value="30+ saat" style={{ color: "#0f172a" }}>30+ saat</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <i className="fa-solid fa-star" style={{ color: ACCENT }} /> Deneyim ve Motivasyon
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                          <label style={labelStyle}>FiveM / Polis Roleplay Deneyiminiz</label>
                          <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} placeholder="Daha önce hangi sunucularda, hangi pozisyonlarda görev aldınız?" value={form.experience} onChange={e => set("experience", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Neden LAC&apos;ye Katılmak İstiyorsunuz? *</label>
                          <textarea style={{ ...inputStyle, minHeight: "140px", resize: "vertical" }} placeholder="Motivasyonunuzu, hedeflerinizi ve beklentilerinizi detaylandırın..." value={form.motivation} onChange={e => set("motivation", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Daha Önce Çıkarıldığınız / Ayrıldığınız Departmanlar</label>
                          <input style={inputStyle} placeholder="Yoksa 'Yok' yazın" value={form.pastDepartments} onChange={e => set("pastDepartments", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Sizi Kim Yönlendirdi? (İsteğe Bağlı)</label>
                          <input style={inputStyle} placeholder="Discord kullanıcı adı / Kimse" value={form.referral} onChange={e => set("referral", e.target.value)} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <i className="fa-solid fa-clipboard-check" style={{ color: ACCENT }} /> Özet ve Onay
                      </h3>

                      <div style={{ backgroundColor: "rgba(14,165,233,0.04)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: "16px", padding: "2rem", marginBottom: "2rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          {[
                            { label: "Ad Soyad", value: form.fullName },
                            { label: "Discord", value: form.discordName },
                            { label: "Yaş", value: form.age },
                            { label: "Zaman Dilimi", value: form.timezone || "—" },
                            { label: "Haftalık Süre", value: form.hoursPerWeek || "—" },
                            { label: "E-posta", value: form.email || "—" },
                          ].map((item, i) => (
                            <div key={i}>
                              <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{item.label}</div>
                              <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.9rem" }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <label style={{ display: "flex", gap: "1rem", alignItems: "flex-start", cursor: "pointer", marginBottom: "1.5rem" }}>
                        <input type="checkbox" checked={form.agreeRules} onChange={e => set("agreeRules", e.target.checked)} style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: ACCENT, flexShrink: 0 }} />
                        <span style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
                        Verdiğim bilgilerin doğru ve eksiksiz olduğunu, LAC sunucu kurallarını okuduğumu ve kabul ettiğimi onaylıyorum. Yanlış bilgi nedeniyle başvurumun reddedilebileceğini ve sunucudan çıkarılabileceğimi anlıyorum.
                        </span>
                      </label>

                      {error && (
                        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "0.85rem 1.25rem", color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />
                          {error}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2.5rem", gap: "1rem" }}>
                  {step > 1 ? (
                    <button onClick={() => setStep(s => s - 1)} style={{ padding: "0.9rem 2rem", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      <i className="fa-solid fa-arrow-left" style={{ marginRight: "0.5rem" }} /> Geri
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      style={{ padding: "0.9rem 2.5rem", borderRadius: "12px", background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: `0 8px 25px ${ACCENT_GLOW}`, transition: "all 0.2s", letterSpacing: "0.03em" }}
                    >
                      Devam Et <i className="fa-solid fa-arrow-right" style={{ marginLeft: "0.5rem" }} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{ padding: "0.9rem 2.5rem", borderRadius: "12px", background: submitting ? "rgba(16,185,129,0.3)" : "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "#fff", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", boxShadow: "0 8px 25px rgba(16,185,129,0.35)", transition: "all 0.2s", letterSpacing: "0.03em", opacity: submitting ? 0.7 : 1 }}
                    >
                      {submitting ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Gönderiliyor...</> : <><i className="fa-solid fa-paper-plane" style={{ marginRight: "0.5rem" }} />Başvuruyu Gönder</>}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
