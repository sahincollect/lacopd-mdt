"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const RANKS = [
  "Police Officer I",
  "Police Officer II",
  "Police Officer III",
  "Police Officer III+1",
  "Detective I",
  "Detective II",
  "Detective III",
  "Sergeant I",
  "Sergeant II",
  "Lieutenant I",
  "Lieutenant II",
  "Captain I",
  "Captain II",
  "Captain III",
  "Commander",
  "Deputy Chief",
  "Assistant Chief",
  "Chief of Police",
];

export default function GirisPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <GirisPageContent />
    </Suspense>
  );
}

function GirisPageContent() {
  const [error, setError] = useState("");
  const [step, setStep] = useState<"login" | "register" | "pending">("login");
  const [icName, setIcName] = useState("");
  const [badge, setBadge] = useState("");
  const [rank, setRank] = useState("Police Officer I");
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const stepParam = searchParams.get("step");
    const statusParam = searchParams.get("status");

    if (stepParam === "register") {
      setStep("register");
      setError("");
    } else if (statusParam === "pending") {
      setStep("pending");
      setError("");
    } else if (errorParam) {
      setStep("login");
      if (errorParam === "discord_denied") setError("Discord ile giriş reddedildi.");
      else if (errorParam === "account_rejected")
        setError("MDT hesap başvurunuz reddedilmiştir. Yetkililerle iletişime geçiniz.");
      else setError("Discord ile giriş yapılırken bir hata oluştu.");
    }
  }, [searchParams]);

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!icName.trim() || !badge.trim() || !rank.trim()) {
      setError("Lütfen IC Ad Soyad, Rozet Numarası ve Rütbe alanlarını doldurun.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/discord/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: icName.trim(),
          badge: badge.trim(),
          rank: rank.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
      } else if (data.status === "APPROVED" && data.redirect) {
        window.location.href = data.redirect;
      } else {
        setStep("pending");
      }
    } catch {
      setError("Sunucu bağlantı hatası.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .discord-btn:hover { opacity: 0.9 !important; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(88,101,242,0.3) !important; }
        .back-link:hover { color: var(--accent-secondary) !important; }
        .academy-link:hover { text-decoration: underline !important; color: var(--accent-primary) !important; }
        .support-link:hover { text-decoration: underline !important; color: #5865F2 !important; }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── LEFT PANEL: BRANDING ── */}
        <div
          style={{
            flex: "0 0 52%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: 'url("/mdt-bg.jpeg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(4,22,50,0.88) 0%, rgba(4,22,50,0.65) 60%, rgba(232,79,42,0.25) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px),
              repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px)`,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "2.5rem 3rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <img src="/logom.png" alt="LAC" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.06em" }}>
                  LOS ANGELES C.P.D.
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em" }}>
                  MOBILE DATA TERMINAL
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto", marginBottom: "auto", paddingTop: "2rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--accent-secondary)",
                  color: "#000000",
                  padding: "5px 14px",
                  borderRadius: "4px",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                }}
              >
                <i className="fa-solid fa-shield-halved"></i>
                OFFICIAL RESTRICTED ACCESS
              </div>

              <h1
                style={{
                  color: "#FFFFFF",
                  fontSize: "3.2rem",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  margin: "0 0 1.5rem 0",
                  letterSpacing: "-0.02em",
                }}
              >
                Protect.
                <br />
                Serve.
                <br />
                <span style={{ color: "var(--accent-secondary)" }}>Command.</span>
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  margin: 0,
                  maxWidth: "420px",
                }}
              >
                Yetkili personele özel komuta, dispeç ve koordinasyon platformu. Erişim yalnızca onaylı personeller için açıktır.
              </p>
            </div>

            <div style={{ display: "flex", gap: "20px", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
              {[
                { icon: "fa-lock", text: "AES-256 Şifreli" },
                { icon: "fa-shield-check", text: "TLS 1.3" },
                { icon: "fa-user-shield", text: "OAuth2 Güvenliği" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: FORM ── */}
        <div
          style={{
            flex: 1,
            backgroundColor: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.25rem 2.5rem",
              backgroundColor: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              MDT PERSONEL PORTALI
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <ThemeToggle />
              <Link
                href="/"
                className="back-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                <i className="fa-solid fa-arrow-left"></i>
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              overflowY: "auto",
            }}
          >
            <div style={{ width: "100%", maxWidth: "420px" }}>
              {/* ── STEP 1: DISCORD LOGIN ── */}
              {step === "login" && (
                <>
                  <div style={{ marginBottom: "2rem" }}>
                    <h2
                      style={{
                        margin: "0 0 10px",
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        color: "var(--accent-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Sisteme Giriş
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      MDT veritabanına erişmek veya personel kaydı oluşturmak için Discord hesabınızla giriş yapın.
                    </p>
                  </div>

                  {error && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        marginBottom: "1.5rem",
                      }}
                    >
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {error}
                    </div>
                  )}

                  <a
                    href="/api/auth/discord/login"
                    className="discord-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "16px",
                      backgroundColor: "#5865F2",
                      color: "#FFF",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 10px rgba(88,101,242,0.2)",
                      boxSizing: "border-box",
                    }}
                  >
                    <i className="fa-brands fa-discord" style={{ fontSize: "1.4rem" }}></i>
                    Discord ile Giriş Yap
                  </a>

                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "1rem",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "8px",
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ color: "#00d26a", fontSize: "1.2rem", marginTop: "2px" }}>
                      <i className="fa-solid fa-shield-check"></i>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Kayıt ve Onay Süreci
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        İlk kez giriş yapıyorsanız Discord doğrulamasının ardından <strong>IC Ad Soyad, Rütbe ve Rozet Numaranızı</strong> gireceğiniz ekran açılır. Kaydınız Admin onayından geçtikten sonra MDT erişiminiz aktifleşir.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 2: IC AD SOYAD, RÜTBE, ROZET NO KAYIT FORMU ── */}
              {step === "register" && (
                <form onSubmit={handleCompleteRegistration}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        color: "#5865F2",
                        backgroundColor: "rgba(88,101,242,0.12)",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <i className="fa-brands fa-discord"></i> DISCORD DOĞRULANDI
                    </div>
                    <h2
                      style={{
                        margin: "0 0 8px",
                        fontSize: "1.65rem",
                        fontWeight: 800,
                        color: "var(--accent-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Personel Kimlik Bilgileri
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                      MDT erişim talebi oluşturmak için IC bilgilerinizi eksiksiz doldurun. Başvurunuz Admin onayına sunulacaktır.
                    </p>
                  </div>

                  {error && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        padding: "12px 14px",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        marginBottom: "1.25rem",
                      }}
                    >
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {error}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: "6px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        IC AD SOYAD *
                      </label>
                      <input
                        type="text"
                        required
                        value={icName}
                        onChange={(e) => setIcName(e.target.value)}
                        placeholder="Örn: John Nolan"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-light)",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: "6px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        ROZET / SİCİL NUMARASI *
                      </label>
                      <input
                        type="text"
                        required
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="Örn: 1222"
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-light)",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: "6px",
                          letterSpacing: "0.04em",
                        }}
                      >
                        RÜTBE *
                      </label>
                      <select
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: "1px solid var(--border-light)",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        {RANKS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        marginTop: "0.5rem",
                        width: "100%",
                        padding: "14px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: "#5865F2",
                        color: "#FFFFFF",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? "KAYDEDİLİYOR..." : "Kaydı Tamamla ve Onaya Gönder"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: PENDING ADMIN APPROVAL ── */}
              {step === "pending" && (
                <div
                  style={{
                    padding: "1.75rem",
                    borderRadius: "12px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>⏳</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    Başvurunuz Onay Bekliyor
                  </h3>
                  <p style={{ margin: "0 0 1.25rem", fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    IC personel bilgileriniz başarıyla kaydedildi. Admin yetkisine sahip kişiler kaydınızı onayladıktan sonra Discord ile doğrudan MDT&apos;ye giriş yapabilirsiniz.
                  </p>
                  <button
                    onClick={() => {
                      setStep("login");
                      router.replace("/giris");
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                    }}
                  >
                    Giriş Ekranına Dön
                  </button>
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  marginTop: "3rem",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                }}
              >
                <span>
                  <i className="fa-solid fa-code" style={{ marginRight: "5px" }}></i>v2.1.0
                </span>
                <span>© 2026 LAC Police Department</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}