"use client";

import { useState } from "react";
import Link from "next/link";

const ACCENT = "var(--lapd-blue-dark)";
const ACCENT_BG = "var(--bg-tertiary)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.9rem 1.25rem",
  backgroundColor: "var(--bg-secondary)",
  border: "1px solid var(--lapd-border)",
  borderRadius: "4px",
  color: "var(--lapd-text-dark)",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  fontFamily: "var(--font-inter)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 800,
  color: "var(--lapd-text-muted)",
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
    <div style={{ backgroundColor: "var(--lapd-bg)", minHeight: "100vh", color: "var(--lapd-text-dark)", fontFamily: "var(--font-inter)", paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <Link href="/basvurular" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Başvurular</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Ride Along</span>
        </div>
      </div>

      <main style={{ position: "relative", zIndex: 10, padding: "5rem 2rem 4rem", maxWidth: "800px", margin: "0 auto" }}>
        <>
          {submitted ? (
            <div key="success" style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--lapd-border)' }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", border: `2px solid var(--lapd-border)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
                <i className="fa-solid fa-car-side" style={{ fontSize: "1.8rem", color: 'var(--lapd-orange)' }} />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--lapd-blue-dark)", marginBottom: "1rem" }}>Başvurunuz Alındı!</h2>
              <p style={{ color: "var(--lapd-text-dark)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                Ride Along başvurunuz kaydedildi. Uygun bir devriye zamanı belirlendikten sonra Discord üzerinden bilgilendirileceksiniz. Katılım için ilgili memur koordinatörlüğünde olacaktır.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/basvurular" style={{ padding: "0.85rem 2rem", backgroundColor: 'var(--lapd-blue-dark)', color: "var(--bg-primary)", textDecoration: "none", fontWeight: 700 }}>Başvurulara Dön</Link>
                <Link href="/" style={{ padding: "0.85rem 2rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--lapd-border)", color: "var(--lapd-text-dark)", textDecoration: "none", fontWeight: 600 }}>Ana Sayfa</Link>
              </div>
            </div>
          ) : (
            <div key="form">
              {/* Header */}
              <div style={{ marginBottom: "3rem", textAlign: 'center' }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "var(--bg-tertiary)", border: `1px solid var(--lapd-border)`, padding: "0.4rem 1.25rem", marginBottom: "1.5rem" }}>
                  <i className="fa-solid fa-car-side" style={{ color: "var(--lapd-orange)", fontSize: "0.85rem" }} />
                  <span style={{ fontSize: "0.8rem", color: "var(--lapd-blue-dark)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sivil Ride Along Programı</span>
                </div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--lapd-blue-dark)", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                  Ride Along Başvurusu
                </h1>
                <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
                <p style={{ color: "var(--lapd-text-dark)", fontSize: "1rem", lineHeight: 1.7 }}>
                  LAPD devriye araçlarına eşlik edin, gerçek saha deneyimi yaşayın. Başvurunuz onaylandıktan sonra size uygun bir devriye zamanı ayarlanacaktır.
                </p>

                {/* Info boxes */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "2rem" }}>
                  {[
                    { icon: "fa-clock", title: "Süre", text: "2-4 saat" },
                    { icon: "fa-user-shield", title: "Gözetim", text: "Deneyimli memur" },
                    { icon: "fa-ban", title: "Yasak", text: "Silah taşıma" },
                  ].map((info, i) => (
                    <div key={i} style={{ backgroundColor: "var(--bg-secondary)", border: `1px solid var(--lapd-border)`, padding: "1.5rem 1rem", textAlign: "center" }}>
                      <i className={`fa-solid ${info.icon}`} style={{ color: "var(--lapd-orange)", fontSize: "1.5rem", marginBottom: "1rem", display: "block" }} />
                      <div style={{ fontSize: "0.75rem", color: "var(--lapd-text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>{info.title}</div>
                      <div style={{ color: "var(--lapd-blue-dark)", fontWeight: 700, fontSize: "0.95rem", marginTop: "0.5rem" }}>{info.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--lapd-border)", padding: "3rem" }}>
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
                        <option value="">Fark etmez / Seçiniz</option>
                        <option value="Genel Devriye">Genel Devriye</option>
                        <option value="Traffic Unit">Traffic Unit</option>
                        <option value="Dedektif Büro">Dedektif Büro</option>
                        <option value="SWAT">SWAT (İzinli Operasyon)</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>FiveM Polis RP Deneyiminiz Var mı?</label>
                      <select style={inputStyle} value={form.hasExperience} onChange={e => set("hasExperience", e.target.value)}>
                        <option value="">Seçiniz...</option>
                        <option value="Evet, aktif oynuyorum">Evet, aktif oynuyorum</option>
                        <option value="Evet, geçmişte oynadım">Evet, geçmişte oynadım</option>
                        <option value="Hayır, daha önce oynamadım">Hayır, daha önce oynamadım</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Neden Ride Along Yapmak İstiyorsunuz? *</label>
                      <textarea style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} placeholder="Beklentilerinizi ve neden bu programa başvurduğunuzu yazın..." value={form.reason} onChange={e => set("reason", e.target.value)} required />
                    </div>

                    <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--lapd-border)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.agreeRules} onChange={e => set("agreeRules", e.target.checked)} style={{ width: "16px", height: "16px", marginTop: "3px", accentColor: 'var(--lapd-blue-dark)', flexShrink: 0 }} />
                        <span style={{ color: "var(--lapd-text-dark)", fontSize: "0.875rem", lineHeight: 1.6 }}>LAPD Ride Along program kurallarını okudum ve kabul ediyorum. Devriye sırasında görevli memurun tüm talimatlarına uymayı taahhüt ediyorum.</span>
                      </label>
                      <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.agreeSafety} onChange={e => set("agreeSafety", e.target.checked)} style={{ width: "16px", height: "16px", marginTop: "3px", accentColor: 'var(--lapd-blue-dark)', flexShrink: 0 }} />
                        <span style={{ color: "var(--lapd-text-dark)", fontSize: "0.875rem", lineHeight: 1.6 }}>Ride Along sırasında hiçbir polisiye müdahalede bulunmayacağımı, silahlı ya da fiziksel hiçbir eyleme girmeyeceğimi kabul ediyorum.</span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", padding: "0.85rem 1.25rem", color: "#DC2626", fontSize: "0.875rem", marginTop: "1.5rem" }}>
                      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />{error}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                    <button type="submit" disabled={submitting} style={{ padding: "1rem 2.5rem", background: submitting ? `var(--bg-tertiary)` : `var(--lapd-blue-dark)`, border: "none", color: submitting ? "var(--lapd-text-muted)" : "#fff", fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.95rem", transition: "all 0.2s" }}>
                      {submitting ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Gönderiliyor...</> : <><i className="fa-solid fa-paper-plane" style={{ marginRight: "0.5rem" }} />Başvuruyu Gönder</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      </main>
    </div>
  );
}
