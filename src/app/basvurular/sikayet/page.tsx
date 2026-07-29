"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#F59E0B";
const ACCENT_GLOW = "rgba(245,158,11,0.4)";

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

export default function SikayetBasvurusu() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    discordName: "",
    email: "",
    officerName: "",
    officerBadge: "",
    incidentDate: "",
    incidentLocation: "",
    category: "",
    description: "",
    evidence: "",
    agreeHonest: false,
  });

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.discordName || !form.description || !form.category || !form.agreeHonest) {
      setError("Lütfen zorunlu alanları doldurun ve doğruluk beyanını kabul edin.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/civil-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sikayet",
          fullName: form.fullName,
          discordName: form.discordName,
          email: form.email,
          content: JSON.stringify({
            officerName: form.officerName,
            officerBadge: form.officerBadge,
            incidentDate: form.incidentDate,
            incidentLocation: form.incidentLocation,
            category: form.category,
            description: form.description,
            evidence: form.evidence,
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
        input:focus, select:focus, textarea:focus { border-color: ${ACCENT} !important; background-color: rgba(245,158,11,0.04) !important; box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 80% 60%, rgba(245,158,11,0.06) 0%, transparent 50%)", pointerEvents: "none", zIndex: 0 }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 5%", borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: "rgba(4,9,20,0.85)", backdropFilter: "blur(20px)" }}>
        <Link href="/basvurular" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <img src="/lapd-logo.png" alt="LAC" style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${ACCENT}66` }} />
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Başvurular</span>
          <i className="fa-solid fa-chevron-right" style={{ color: "#475569", fontSize: "0.65rem" }} />
          <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "0.9rem" }}>Şikayet Formu</span>
        </Link>
        <Link href="/basvurular" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} /> Geri
        </Link>
      </nav>

      <main style={{ position: "relative", zIndex: 10, padding: "8rem 5% 4rem", maxWidth: "760px", margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: `${ACCENT}15`, border: `2px solid ${ACCENT}66`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem", boxShadow: `0 0 30px ${ACCENT_GLOW}` }}>
                <i className="fa-solid fa-check" style={{ fontSize: "1.8rem", color: ACCENT }} />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>Şikayetiniz Alındı</h2>
              <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                Şikayet başvurunuz İç İşler Büromuz&apos;a iletildi ve kayıt altına alındı. Gizlilik ilkelerimiz doğrultusunda inceleme yapılacaktır.
              </p>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "2.5rem" }}>
                Anonim başvurular da kabul edilmekte olup süreç hakkında e-posta ile bilgilendirilmek isterseniz e-posta adresinizi belirtmeniz gerekmektedir.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/basvurular" style={{ padding: "0.85rem 2rem", borderRadius: "12px", backgroundColor: ACCENT, color: "#040914", textDecoration: "none", fontWeight: 700 }}>Başvurulara Dön</Link>
                <Link href="/" style={{ padding: "0.85rem 2rem", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", textDecoration: "none", fontWeight: 600 }}>Ana Sayfa</Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ marginBottom: "3rem" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}30`, borderRadius: "50px", padding: "0.4rem 1.25rem", marginBottom: "1.5rem" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: ACCENT, fontSize: "0.85rem" }} />
                  <span style={{ fontSize: "0.8rem", color: "#fcd34d", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>İç İşler Bürosu</span>
                </div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                  Memur <span style={{ color: ACCENT }}>Şikayet Formu</span>
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  Bir LAC görevlisiyle ilgili şikayetinizi buradan iletebilirsiniz. Tüm başvurular gizli tutulur ve İç İşler Bürosu tarafından titizlikle incelenir.
                </p>

                {/* Warning */}
                <div style={{ backgroundColor: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, borderRadius: "14px", padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <i className="fa-solid fa-circle-info" style={{ color: ACCENT, fontSize: "1rem", marginTop: "2px", flexShrink: 0 }} />
                  <div style={{ fontSize: "0.875rem", color: "#cbd5e1", lineHeight: 1.6 }}>
                    <strong style={{ color: "#fcd34d" }}>Önemli Bilgi:</strong> Asılsız veya kötü niyetle yapılan şikayetler kendi başına disiplin süreci başlatılmasına neden olabilir. Lütfen yalnızca gerçek olayları bildirin.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ backgroundColor: "rgba(10,16,35,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", overflow: "hidden", backdropFilter: "blur(16px)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
                  {/* Section: Şikayet Eden */}
                  <div style={{ padding: "2rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <i className="fa-solid fa-user" style={{ color: ACCENT }} /> Şikayetçi Bilgileri
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                      <div>
                        <label style={labelStyle}>Adınız Soyadınız *</label>
                        <input style={inputStyle} placeholder="Karakter adı" value={form.fullName} onChange={e => set("fullName", e.target.value)} required />
                      </div>
                      <div>
                        <label style={labelStyle}>Discord Kullanıcı Adı *</label>
                        <input style={inputStyle} placeholder="discord#0000" value={form.discordName} onChange={e => set("discordName", e.target.value)} required />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>E-posta (Takip için, isteğe bağlı)</label>
                        <input style={inputStyle} type="email" placeholder="Yanıt almak isterseniz e-posta adresinizi girin" value={form.email} onChange={e => set("email", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Section: Şikayet Edilen */}
                  <div style={{ padding: "2rem 2.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <i className="fa-solid fa-badge" style={{ color: ACCENT }} /> Şikayet Edilen Görevli
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                      <div>
                        <label style={labelStyle}>Görevlinin Adı (Biliniyorsa)</label>
                        <input style={inputStyle} placeholder="Memur adı / Bilinmiyor" value={form.officerName} onChange={e => set("officerName", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Rozet Numarası (Biliniyorsa)</label>
                        <input style={inputStyle} placeholder="Örn: #4521" value={form.officerBadge} onChange={e => set("officerBadge", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Olayın Tarihi / Saati</label>
                        <input style={inputStyle} type="datetime-local" value={form.incidentDate} onChange={e => set("incidentDate", e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Olayın Yeri</label>
                        <input style={inputStyle} placeholder="Örn: Vinewood Blvd, Mission Row" value={form.incidentLocation} onChange={e => set("incidentLocation", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Section: Olay Detayı */}
                  <div style={{ padding: "2rem 2.5rem" }}>
                    <h3 style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <i className="fa-solid fa-file-lines" style={{ color: ACCENT }} /> Olay Detayları
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div>
                        <label style={labelStyle}>Şikayet Kategorisi *</label>
                        <select style={inputStyle} value={form.category} onChange={e => set("category", e.target.value)} required>
                          <option value="" style={{ color: "#0f172a" }}>Seçiniz...</option>
                          <option value="Haksız Muamele" style={{ color: "#0f172a" }}>Haksız Muamele / Kötü Davranış</option>
                          <option value="Aşırı Güç Kullanımı" style={{ color: "#0f172a" }}>Aşırı Güç Kullanımı</option>
                          <option value="Yetki Suistimali" style={{ color: "#0f172a" }}>Yetki Suistimali / Konum Kötüye Kullanımı</option>
                          <option value="Sahte Suçlama" style={{ color: "#0f172a" }}>Sahte Suçlama / Uydurma Delil</option>
                          <option value="Rüşvet / Yolsuzluk" style={{ color: "#0f172a" }}>Rüşvet / Yolsuzluk</option>
                          <option value="Mevzuata Aykırılık" style={{ color: "#0f172a" }}>Mevzuata Aykırı Uygulama</option>
                          <option value="Diğer" style={{ color: "#0f172a" }}>Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Olayın Ayrıntılı Açıklaması *</label>
                        <textarea style={{ ...inputStyle, minHeight: "160px", resize: "vertical" }} placeholder="Ne yaşandığını adım adım, mümkün olduğunca detaylı anlatın. Tanıklar varsa belirtin." value={form.description} onChange={e => set("description", e.target.value)} required />
                      </div>
                      <div>
                        <label style={labelStyle}>Delil / Kanıt Linkleri</label>
                        <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Ekran görüntüsü, video veya ses kaydı linkleri (Imgur, YouTube, vb.)" value={form.evidence} onChange={e => set("evidence", e.target.value)} />
                      </div>

                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
                        <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
                          <input type="checkbox" checked={form.agreeHonest} onChange={e => set("agreeHonest", e.target.checked)} style={{ width: "16px", height: "16px", marginTop: "3px", accentColor: ACCENT, flexShrink: 0 }} />
                          <span style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6 }}>
                            Yukarıdaki bilgilerin doğru ve gerçeği yansıttığını, kasten yanıltıcı veya asılsız bir şikayette bulunmadığımı beyan eder, aksinin tespiti durumunda disiplin işlemi uygulanabileceğini kabul ediyorum.
                          </span>
                        </label>
                      </div>

                      {error && (
                        <div style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "0.85rem 1.25rem", color: "#fca5a5", fontSize: "0.875rem" }}>
                          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />{error}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" disabled={submitting} style={{ padding: "1rem 2.5rem", borderRadius: "14px", background: submitting ? `${ACCENT}55` : `linear-gradient(135deg, ${ACCENT}, #d97706)`, border: "none", color: "#040914", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.95rem", boxShadow: `0 8px 25px ${ACCENT_GLOW}`, transition: "all 0.2s", opacity: submitting ? 0.7 : 1, letterSpacing: "0.03em" }}>
                          {submitting ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Gönderiliyor...</> : <><i className="fa-solid fa-paper-plane" style={{ marginRight: "0.5rem" }} />Şikayeti Gönder</>}
                        </button>
                      </div>
                    </div>
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
