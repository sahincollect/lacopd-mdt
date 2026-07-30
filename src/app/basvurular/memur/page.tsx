"use client";

import { useState } from "react";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.9rem 1.25rem",
  backgroundColor: "var(--bg-secondary)",
  border: "1px solid var(--LAC-border)",
  borderRadius: "4px",
  color: "var(--LAC-text-dark)",
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
  color: "var(--LAC-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "0.6rem",
};

const ACCENT = "var(--LAC-blue-dark)";
const ACCENT_BG = "var(--bg-tertiary)";

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
    <div style={{ backgroundColor: "var(--LAC-bg)", minHeight: "100vh", color: "var(--LAC-text-dark)", fontFamily: "var(--font-inter)", paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem 2rem', borderBottom: '1px solid var(--LAC-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--LAC-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--LAC-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <Link href="/basvurular" style={{ color: 'var(--LAC-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Başvurular</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--LAC-orange)' }}>Memur Başvurusu</span>
        </div>
      </div>

      <main style={{ position: "relative", zIndex: 10, padding: "5rem 2rem 4rem", maxWidth: "860px", margin: "0 auto" }}>
        <>
          {submitted ? (
            <div key="success" style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--LAC-border)' }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", border: `2px solid var(--LAC-border)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
                <i className="fa-solid fa-check" style={{ fontSize: "2rem", color: "#10B981" }} />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--LAC-blue-dark)", marginBottom: "1rem" }}>Başvurunuz Alındı!</h2>
              <p style={{ color: "var(--LAC-text-dark)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
                Memur başvurunuz başarıyla sisteme kaydedildi. Yönetim ekibimiz başvurunuzu en kısa sürede inceleyecek ve Discord üzerinden sizinle iletişime geçecektir.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/basvurular" style={{ padding: "0.85rem 2rem", backgroundColor: ACCENT, color: "var(--bg-primary)", textDecoration: "none", fontWeight: 700 }}>
                  Başvurulara Dön
                </Link>
                <Link href="/" style={{ padding: "0.85rem 2rem", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--LAC-border)", color: "var(--LAC-text-dark)", textDecoration: "none", fontWeight: 600 }}>
                  Ana Sayfa
                </Link>
              </div>
            </div>
          ) : (
            <div key="form">
              {/* Header */}
              <div style={{ marginBottom: "3rem", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "var(--bg-tertiary)", border: `1px solid var(--LAC-border)`, padding: "0.4rem 1.25rem", marginBottom: "1.5rem" }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: "var(--LAC-orange)", fontSize: "0.8rem" }} />
                  <span style={{ fontSize: "0.8rem", color: "var(--LAC-blue-dark)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Resmi Memur Başvurusu</span>
                </div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--LAC-blue-dark)", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                  LAC'ye Katıl
                </h1>
                <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--LAC-orange)', margin: '0 auto 1.5rem' }}></div>
                <p style={{ color: "var(--LAC-text-dark)", fontSize: "1rem", lineHeight: 1.7 }}>
                  LAC çatısı altında hizmet etmek bir ayrıcalıktır. Bu formu doldurarak Akademi sürecine (Phase 1) girmek için ilk adımı atıyorsunuz.
                </p>
              </div>

              {/* Progress Steps */}
              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "3rem" }}>
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "35px", height: "35px", borderRadius: "50%", backgroundColor: step === s ? ACCENT : step > s ? "#10B981" : "var(--bg-tertiary)", border: `1px solid ${step === s ? ACCENT : step > s ? "#10B981" : "var(--LAC-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: step === s || step > s ? "var(--bg-primary)" : "var(--LAC-text-muted)", fontWeight: 800, fontSize: "0.9rem", transition: "all 0.3s" }}>
                      {step > s ? <i className="fa-solid fa-check" /> : s}
                    </div>
                    {s !== 3 && <div style={{ width: "40px", height: "2px", backgroundColor: step > s ? "#10B981" : "var(--LAC-border)", transition: "all 0.3s" }} />}
                  </div>
                ))}
              </div>

              {/* Form Container */}
              <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--LAC-border)", overflow: "hidden" }}>
                
                {/* STEP 1 */}
                {step === 1 && (
                  <div>
                    <div style={{ padding: "3rem" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--LAC-blue-dark)", marginBottom: "2rem" }}>Kişisel Bilgiler & İletişim</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ gridColumn: "1 / -1" }}>
                          <label style={labelStyle}>Karakter Adı Soyadı *</label>
                          <input style={inputStyle} placeholder="Örn: John Smith" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Discord Kullanıcı Adı *</label>
                          <input style={inputStyle} placeholder="Örn: john#1234" value={form.discordName} onChange={e => set("discordName", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Karakter Yaşı *</label>
                          <input style={inputStyle} type="number" placeholder="Min 18" min="18" value={form.age} onChange={e => set("age", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Zaman Dilimi (Timezone)</label>
                          <input style={inputStyle} placeholder="Örn: GMT+3 (TSİ)" value={form.timezone} onChange={e => set("timezone", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Haftalık Aktiflik Süresi</label>
                          <select style={inputStyle} value={form.hoursPerWeek} onChange={e => set("hoursPerWeek", e.target.value)}>
                            <option value="">Seçiniz...</option>
                            <option value="10-20 Saat">10-20 Saat</option>
                            <option value="20-30 Saat">20-30 Saat</option>
                            <option value="30-40 Saat">30-40 Saat</option>
                            <option value="40+ Saat">40+ Saat</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div>
                    <div style={{ padding: "3rem" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--LAC-blue-dark)", marginBottom: "2rem" }}>Deneyim & Niyet</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div>
                          <label style={labelStyle}>Polis Rolü Deneyiminiz Var mı?</label>
                          <select style={inputStyle} value={form.experience} onChange={e => set("experience", e.target.value)}>
                            <option value="">Seçiniz...</option>
                            <option value="Hiç deneyimim yok (İlk kez)">Hiç deneyimim yok, akademi eğitimi almak istiyorum</option>
                            <option value="Başka sunucularda polis rolü yaptım">Başka sunucularda polis rolü yaptım</option>
                            <option value="Yüksek deneyime sahibim (Gerçekçi LEO RP)">Yüksek deneyime sahibim (Gerçekçi LEO RP)</option>
                          </select>
                        </div>
                        {form.experience.includes("Başka") || form.experience.includes("Yüksek") ? (
                          <div>
                            <label style={labelStyle}>Geçmişte Görev Yaptığınız Departmanlar & Rütbeleriniz</label>
                            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Hangi sunucularda, hangi departman/rütbede görev aldınız?" value={form.pastDepartments} onChange={e => set("pastDepartments", e.target.value)} />
                          </div>
                        ) : null}
                        <div>
                          <label style={labelStyle}>LAC'ye Katılma Motivasyonunuz Nedir? *</label>
                          <textarea style={{ ...inputStyle, minHeight: "150px", resize: "vertical" }} placeholder="Karakterinizin neden polis olmak istediğini ve hedeflerini açıklayın. (Min. 50 kelime)" value={form.motivation} onChange={e => set("motivation", e.target.value)} />
                        </div>
                        <div>
                          <label style={labelStyle}>Bizi Nereden Buldunuz / Referansınız</label>
                          <input style={inputStyle} placeholder="Discord kullanıcı adı / Kimse" value={form.referral} onChange={e => set("referral", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div>
                    <div style={{ padding: "3rem" }}>
                      <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--LAC-blue-dark)", marginBottom: "2rem" }}>Onay & Beyan</h3>
                      
                      <div style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--LAC-border)", padding: "1.5rem", marginBottom: "2rem" }}>
                        <h4 style={{ fontSize: "0.85rem", color: "var(--LAC-blue-dark)", fontWeight: 800, textTransform: "uppercase", marginBottom: "1rem" }}>Özet Bilgiler</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                          {[
                            { label: "Karakter", value: form.fullName },
                            { label: "Discord", value: form.discordName },
                            { label: "Yaş", value: form.age },
                            { label: "Deneyim", value: form.experience || "Belirtilmedi" },
                          ].map((item, i) => (
                            <div key={i}>
                              <div style={{ fontSize: "0.7rem", color: "var(--LAC-text-muted)", fontWeight: 800, textTransform: "uppercase" }}>{item.label}</div>
                              <div style={{ color: "var(--LAC-text-dark)", fontSize: "0.95rem", fontWeight: 500 }}>{item.value || "-"}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid var(--LAC-border)", paddingTop: "2rem" }}>
                        <label style={{ display: "flex", gap: "1rem", alignItems: "flex-start", cursor: "pointer" }}>
                          <input type="checkbox" checked={form.agreeRules} onChange={e => set("agreeRules", e.target.checked)} style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: ACCENT, flexShrink: 0 }} />
                          <span style={{ color: "var(--LAC-text-dark)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                            Verdiğim bilgilerin tamamen doğru olduğunu beyan ederim. Yalan beyan durumunda departmandan ihraç edileceğimi, 
                            Akademi sürecindeki yoğun eğitimlere ve üstlerimin emirlerine kayıtsız şartsız itaat edeceğimi kabul ediyorum.
                          </span>
                        </label>
                      </div>

                      {error && (
                        <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", padding: "0.85rem 1.25rem", color: "#DC2626", fontSize: "0.875rem", marginTop: "2rem" }}>
                          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />{error}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Controls */}
                <div style={{ padding: "1.5rem 3rem", backgroundColor: "var(--bg-tertiary)", borderTop: "1px solid var(--LAC-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button 
                    type="button" 
                    onClick={() => setStep(step - 1)}
                    style={{ padding: "0.85rem 1.5rem", background: "transparent", border: "1px solid var(--LAC-border)", color: "var(--LAC-text-dark)", fontWeight: 700, borderRadius: "4px", visibility: step === 1 ? "hidden" : "visible", cursor: "pointer" }}
                  >
                    Geri
                  </button>

                  {step < 3 ? (
                    <button 
                      type="button" 
                      onClick={() => setStep(step + 1)}
                      style={{ padding: "0.85rem 2.5rem", background: ACCENT, border: "none", color: "var(--bg-primary)", fontWeight: 800, borderRadius: "4px", cursor: "pointer", transition: "background-color 0.2s" }}
                    >
                      İleri
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleSubmit}
                      disabled={submitting || !form.agreeRules}
                      style={{ padding: "0.85rem 2.5rem", background: (submitting || !form.agreeRules) ? "var(--LAC-border)" : "#10B981", border: "none", color: "var(--bg-primary)", fontWeight: 800, borderRadius: "4px", cursor: (submitting || !form.agreeRules) ? "not-allowed" : "pointer", transition: "background-color 0.2s" }}
                    >
                      {submitting ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}
        </>
      </main>
    </div>
  );
}
