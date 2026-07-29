"use client";

import { useState } from "react";
import Link from "next/link";

const ACCENT = "var(--lapd-orange)";
const ACCENT_BG = "var(--lapd-gray-bg)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.9rem 1.25rem",
  backgroundColor: "white",
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
    <div style={{ backgroundColor: "var(--lapd-bg)", minHeight: "100vh", color: "var(--lapd-text-dark)", fontFamily: "var(--font-inter)", paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: '#F0F4F4', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <Link href="/basvurular" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Başvurular</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Şikayet Formu</span>
        </div>
      </div>

      <main style={{ position: "relative", zIndex: 10, padding: "5rem 2rem 4rem", maxWidth: "800px", margin: "0 auto" }}>
        <>
          {submitted ? (
            <div key="success" style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: 'white', border: '1px solid var(--lapd-border)' }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--lapd-gray-bg)", border: `2px solid var(--lapd-border)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 2rem" }}>
                <i className="fa-solid fa-check" style={{ fontSize: "1.8rem", color: ACCENT }} />
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--lapd-blue-dark)", marginBottom: "1rem" }}>Şikayetiniz Alındı</h2>
              <p style={{ color: "var(--lapd-text-dark)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                Şikayet başvurunuz İç İşler Büromuz'a iletildi ve kayıt altına alındı. Gizlilik ilkelerimiz doğrultusunda inceleme yapılacaktır.
              </p>
              <p style={{ color: "var(--lapd-text-muted)", fontSize: "0.9rem", marginBottom: "2.5rem" }}>
                Anonim başvurular da kabul edilmekte olup süreç hakkında e-posta ile bilgilendirilmek isterseniz e-posta adresinizi belirtmeniz gerekmektedir.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/basvurular" style={{ padding: "0.85rem 2rem", backgroundColor: ACCENT, color: "white", textDecoration: "none", fontWeight: 700 }}>Başvurulara Dön</Link>
                <Link href="/" style={{ padding: "0.85rem 2rem", backgroundColor: "var(--lapd-gray-bg)", border: "1px solid var(--lapd-border)", color: "var(--lapd-text-dark)", textDecoration: "none", fontWeight: 600 }}>Ana Sayfa</Link>
              </div>
            </div>
          ) : (
            <div key="form">
              <div style={{ marginBottom: "3rem", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "var(--lapd-gray-bg)", border: `1px solid var(--lapd-border)`, padding: "0.4rem 1.25rem", marginBottom: "1.5rem" }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: ACCENT, fontSize: "0.85rem" }} />
                  <span style={{ fontSize: "0.8rem", color: "var(--lapd-blue-dark)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>İç İşler Bürosu</span>
                </div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--lapd-blue-dark)", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
                  Memur Şikayet Formu
                </h1>
                <div style={{ width: '60px', height: '4px', backgroundColor: ACCENT, margin: '0 auto 1.5rem' }}></div>
                <p style={{ color: "var(--lapd-text-dark)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  Bir LAPD görevlisiyle ilgili şikayetinizi buradan iletebilirsiniz. Tüm başvurular gizli tutulur ve İç İşler Bürosu tarafından titizlikle incelenir.
                </p>

                {/* Warning */}
                <div style={{ backgroundColor: "#FFFBEB", border: `1px solid #FCD34D`, padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start", textAlign: "left" }}>
                  <i className="fa-solid fa-circle-info" style={{ color: ACCENT, fontSize: "1rem", marginTop: "2px", flexShrink: 0 }} />
                  <div style={{ fontSize: "0.875rem", color: "var(--lapd-text-dark)", lineHeight: 1.6 }}>
                    <strong style={{ color: "#B45309" }}>Önemli Bilgi:</strong> Asılsız veya kötü niyetle yapılan şikayetler kendi başına disiplin süreci başlatılmasına neden olabilir. Lütfen yalnızca gerçek olayları bildirin.
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ backgroundColor: "white", border: "1px solid var(--lapd-border)", overflow: "hidden" }}>
                  {/* Section: Şikayet Eden */}
                  <div style={{ padding: "2rem 2.5rem", borderBottom: "1px solid var(--lapd-border)", backgroundColor: 'var(--lapd-gray-bg)' }}>
                    <h3 style={{ fontSize: "0.85rem", color: "var(--lapd-blue-dark)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                  <div style={{ padding: "2rem 2.5rem", borderBottom: "1px solid var(--lapd-border)" }}>
                    <h3 style={{ fontSize: "0.85rem", color: "var(--lapd-blue-dark)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                    <h3 style={{ fontSize: "0.85rem", color: "var(--lapd-blue-dark)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <i className="fa-solid fa-file-lines" style={{ color: ACCENT }} /> Olay Detayları
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                      <div>
                        <label style={labelStyle}>Şikayet Kategorisi *</label>
                        <select style={inputStyle} value={form.category} onChange={e => set("category", e.target.value)} required>
                          <option value="">Seçiniz...</option>
                          <option value="Haksız Muamele">Haksız Muamele / Kötü Davranış</option>
                          <option value="Aşırı Güç Kullanımı">Aşırı Güç Kullanımı</option>
                          <option value="Yetki Suistimali">Yetki Suistimali / Konum Kötüye Kullanımı</option>
                          <option value="Sahte Suçlama">Sahte Suçlama / Uydurma Delil</option>
                          <option value="Rüşvet / Yolsuzluk">Rüşvet / Yolsuzluk</option>
                          <option value="Mevzuata Aykırılık">Mevzuata Aykırı Uygulama</option>
                          <option value="Diğer">Diğer</option>
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

                      <div style={{ borderTop: "1px solid var(--lapd-border)", paddingTop: "1.5rem" }}>
                        <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
                          <input type="checkbox" checked={form.agreeHonest} onChange={e => set("agreeHonest", e.target.checked)} style={{ width: "16px", height: "16px", marginTop: "3px", accentColor: ACCENT, flexShrink: 0 }} />
                          <span style={{ color: "var(--lapd-text-dark)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                            Yukarıdaki bilgilerin doğru ve gerçeği yansıttığını, kasten yanıltıcı veya asılsız bir şikayette bulunmadığımı beyan eder, aksinin tespiti durumunda disiplin işlemi uygulanabileceğini kabul ediyorum.
                          </span>
                        </label>
                      </div>

                      {error && (
                        <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", padding: "0.85rem 1.25rem", color: "#DC2626", fontSize: "0.875rem" }}>
                          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: "0.5rem" }} />{error}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" disabled={submitting} style={{ padding: "1rem 2.5rem", background: submitting ? `var(--lapd-gray-bg)` : ACCENT, border: "none", color: submitting ? "var(--lapd-text-muted)" : "white", fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.95rem", transition: "all 0.2s" }}>
                          {submitting ? <><i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: "0.5rem" }} />Gönderiliyor...</> : <><i className="fa-solid fa-paper-plane" style={{ marginRight: "0.5rem" }} />Şikayeti Gönder</>}
                        </button>
                      </div>
                    </div>
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
