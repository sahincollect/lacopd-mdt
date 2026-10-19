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

const DEPARTMENTS = [
  "Patrol Division",
  "Traffic Division",
  "Detective Bureau",
  "SWAT",
  "Metro K-9",
  "Gangs & Narcotics (GND)",
  "Gang Impact Teams (GIT)",
  "Dive Unit",
  "Air Support Division",
];

export default function GirisPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Yükleniyor...</div>}>
      <GirisPageContent />
    </Suspense>
  );
}

function GirisPageContent() {
  const [error, setError] = useState("");
  const [step, setStep] = useState<"login" | "register" | "pending">("login");

  // Discord OAuth session state
  const [discordProfile, setDiscordProfile] = useState<{
    displayName: string;
    username: string;
    discordId: string;
    avatarUrl: string;
  }>({
    displayName: "",
    username: "",
    discordId: "",
    avatarUrl: "",
  });

  // Officer registration form state
  const [icName, setIcName] = useState("");
  const [badge, setBadge] = useState("");
  const [rank, setRank] = useState("Police Officer I");
  const [department, setDepartment] = useState("Patrol Division");
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const stepParam = searchParams.get("step");
    const statusParam = searchParams.get("status");

    const dname = searchParams.get("dname") || "";
    const duser = searchParams.get("duser") || "";
    const did = searchParams.get("did") || "";
    const davatar = searchParams.get("davatar") || "";
    const oname = searchParams.get("oname") || "";
    const obadge = searchParams.get("obadge") || "";
    const orank = searchParams.get("orank") || "";

    if (dname || duser || davatar) {
      setDiscordProfile({
        displayName: dname || duser || "Discord Kullanıcısı",
        username: duser || dname,
        discordId: did,
        avatarUrl: davatar,
      });
    }

    if (oname) setIcName(oname);
    if (obadge) setBadge(obadge);
    if (orank) setRank(orank);

    if (stepParam === "register") {
      setStep("register");
      setError("");
      // Ayrıca sunucudaki discord_reg_token çerezinden bilgileri doğrula
      fetch("/api/auth/discord/complete")
        .then((r) => r.json())
        .then((data) => {
          if (data?.authenticated) {
            setDiscordProfile((prev) => ({
              displayName: data.globalName || prev.displayName || "Discord Kullanıcısı",
              username: data.discordUsername || prev.username || "",
              discordId: data.discordId || prev.discordId || "",
              avatarUrl: data.avatarUrl || prev.avatarUrl || "",
            }));
          }
        })
        .catch(() => {});
    } else if (statusParam === "pending") {
      setStep("pending");
      setError("");
    } else if (errorParam) {
      setStep("login");
      if (errorParam === "discord_denied") setError("Discord yetkilendirmesi iptal edildi.");
      else if (errorParam === "account_rejected")
        setError("MDT hesap başvurunuz Komuta Merkezi tarafından reddedilmiştir.");
      else setError("Discord ile kimlik doğrulaması sırasında bir hata oluştu.");
    }
  }, [searchParams]);

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!icName.trim() || !badge.trim() || !rank.trim()) {
      setError("Lütfen IC Ad Soyad, Rozet Numarası ve Rütbe alanlarını eksiksiz doldurun.");
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
          department: department.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayıt sırasında bir hata oluştu.");
      } else if (data.status === "APPROVED" && data.redirect) {
        window.location.href = data.redirect;
      } else {
        if (data.officer) {
          setIcName(data.officer.name);
          setBadge(data.officer.badge);
          setRank(data.officer.rank);
        }
        setStep("pending");
      }
    } catch {
      setError("Sunucu bağlantı hatası.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentStepNum = step === "login" ? 1 : step === "register" ? 2 : 3;

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .lapd-btn-orange:hover:not(:disabled) { opacity: 0.9 !important; }
        .lapd-btn-discord:hover { background-color: #4752C4 !important; }
        .lapd-input:focus { border-color: var(--LAC-orange) !important; outline: none; }
        @media (max-width: 960px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          fontFamily: "var(--font-inter), 'Inter', -apple-system, sans-serif",
          overflow: "hidden",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {/* ── LEFT PANEL: OFFICIAL LAPD BRANDING ── */}
        <div
          className="login-left-panel"
          style={{
            flex: "0 0 46%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRight: "3px solid var(--LAC-orange)",
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
                "linear-gradient(160deg, rgba(4,22,50,0.94) 0%, rgba(4,22,50,0.82) 65%, rgba(232,79,42,0.30) 100%)",
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
            {/* Official Seal & Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: "#041632",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,0.25)",
                }}
              >
                <img src="/logom.png" alt="LACPD" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div
                  style={{
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "1.35rem",
                    letterSpacing: "0.03em",
                    fontFamily: "'Oswald', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  LOS ANGELES C.P.D.
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginTop: "0.25rem",
                  }}
                >
                  MOBILE DATA TERMINAL · RESMİ PORTAL
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto", marginBottom: "auto", paddingTop: "2rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "var(--LAC-orange)",
                  color: "#FFFFFF",
                  padding: "6px 14px",
                  borderRadius: "2px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                }}
              >
                <i className="fa-solid fa-shield-halved"></i>
                RESMİ EMNİYET TERMİNALİ
              </div>

              <h1
                style={{
                  color: "#FFFFFF",
                  fontSize: "3.1rem",
                  fontWeight: 900,
                  lineHeight: 1.08,
                  margin: "0 0 1.25rem 0",
                  letterSpacing: "-0.01em",
                  fontFamily: "'Oswald', sans-serif",
                  textTransform: "uppercase",
                }}
              >
                To Protect and
                <br />
                <span style={{ color: "var(--LAC-orange)" }}>To Serve.</span>
              </h1>

              <p
                style={{
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "0.95rem",
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: "430px",
                }}
              >
                Los Angeles Community Police Department resmi personel ağı, vaka raporlama, kriminal sicil sorgulama ve saha koordinasyon sistemi.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: "fa-lock", text: "256-Bit SSL" },
                { icon: "fa-brands fa-discord", text: "Discord OAuth2 Kimlik" },
                { icon: "fa-user-check", text: "Yüksek Komuta Onaylı" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <i className={`fa-solid ${item.icon}`} style={{ color: "var(--LAC-orange)" }}></i>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: PORTAL CONTENT ── */}
        <div
          style={{
            flex: 1,
            backgroundColor: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Top Corporate Bar matching Navigation.tsx */}
          <div
            style={{
              height: "72px",
              padding: "0 2.5rem",
              backgroundColor: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span
                style={{
                  width: "4px",
                  height: "20px",
                  backgroundColor: "var(--LAC-orange)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                PERSONEL GİRİŞ & KİMLİK DOĞRULAMA PORTALI
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <ThemeToggle />
              <Link
                href="/"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                  padding: "0.5rem 1rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  borderRadius: "2px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="fa-solid fa-arrow-left" style={{ color: "var(--LAC-orange)" }}></i>
                ANA SAYFAYA DÖN
              </Link>
            </div>
          </div>

          {/* Main Scrollable Area */}
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
            <div style={{ width: "100%", maxWidth: "520px" }}>
              {/* ── 3-STEP PROGRESS BAR ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem",
                  marginBottom: "1.75rem",
                }}
              >
                {[
                  { num: 1, label: "1. Discord Girişi", done: currentStepNum > 1 },
                  { num: 2, label: "2. Sicil Bilgileri", done: currentStepNum > 2 },
                  { num: 3, label: "3. Komuta Onayı", done: false },
                ].map((s) => {
                  const isCurrent = currentStepNum === s.num;
                  return (
                    <div
                      key={s.num}
                      style={{
                        padding: "0.65rem 0.75rem",
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        borderTop: s.done
                          ? "3px solid #10B981"
                          : isCurrent
                          ? "3px solid var(--LAC-orange)"
                          : "3px solid var(--border-strong)",
                        borderRadius: "2px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "2px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          backgroundColor: s.done
                            ? "#10B981"
                            : isCurrent
                            ? "var(--LAC-orange)"
                            : "var(--bg-tertiary)",
                          color: s.done || isCurrent ? "#FFFFFF" : "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        {s.done ? <i className="fa-solid fa-check" /> : s.num}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: isCurrent || s.done ? "var(--text-primary)" : "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ══════════════════════════════════════════
                  STEP 1: DISCORD LOGIN
                 ══════════════════════════════════════════ */}
              {step === "login" && (
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    borderTop: "3px solid var(--LAC-orange)",
                    borderRadius: "2px",
                    padding: "2rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: "var(--LAC-orange)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "0.35rem",
                      }}
                    >
                      ADIM 1 · KİMLİK DOĞRULAMA
                    </div>
                    <h2
                      style={{
                        margin: "0 0 8px",
                        fontSize: "1.75rem",
                        fontWeight: 800,
                        color: "var(--accent-primary)",
                        fontFamily: "'Oswald', sans-serif",
                        textTransform: "uppercase",
                        letterSpacing: "0.01em",
                      }}
                    >
                      PERSONEL SİSTEMİNE GİRİŞ
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      MDT terminaline bağlanmak veya yeni personel sicil kaydı oluşturmak için resmi Discord hesabınızla oturum açın.
                    </p>
                  </div>

                  {error && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "var(--color-danger-bg)",
                        border: "1px solid var(--color-danger-border)",
                        borderLeft: "4px solid var(--color-danger)",
                        color: "var(--color-danger)",
                        padding: "12px 14px",
                        borderRadius: "2px",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        marginBottom: "1.5rem",
                      }}
                    >
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {error}
                    </div>
                  )}

                  <a
                    href="/api/auth/discord/login"
                    className="lapd-btn-discord"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "1rem 1.25rem",
                      backgroundColor: "#5865F2",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "2px",
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      textDecoration: "none",
                      transition: "background-color 0.2s",
                      boxSizing: "border-box",
                    }}
                  >
                    <i className="fa-brands fa-discord" style={{ fontSize: "1.3rem" }}></i>
                    DISCORD İLE KİMLİK DOĞRULA
                  </a>

                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "1.1rem",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-light)",
                      borderLeft: "3px solid var(--accent-primary)",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: "0.35rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fa-solid fa-circle-info" style={{ color: "var(--LAC-orange)" }}></i>
                      PERSONEL KAYIT PROSEDÜRÜ
                    </div>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      Discord hesabınız doğrulandıktan sonra otomatik olarak <strong>Personel Sicil Formu</strong> açılır.{" "}
                      <strong>IC Ad Soyad, Rütbe ve Rozet Numaranızı</strong> girerek başvurunuzu tamamladığınızda, Yüksek Komuta onayının ardından doğrudan MDT&apos;ye erişebilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════
                  STEP 2: CONNECTED DISCORD PROFILE + IC OFFICER FORM
                 ══════════════════════════════════════════ */}
              {step === "register" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* CONNECTED DISCORD ACCOUNT BANNER */}
                  <div
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                      borderLeft: "4px solid #10B981",
                      borderRadius: "2px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", minWidth: 0 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {discordProfile.avatarUrl ? (
                          <img
                            src={discordProfile.avatarUrl}
                            alt="Discord Avatar"
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #10B981",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: "50%",
                              backgroundColor: "#5865F2",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.3rem",
                              border: "2px solid #10B981",
                            }}
                          >
                            <i className="fa-brands fa-discord" />
                          </div>
                        )}
                        <span
                          title="Oturum Açık"
                          style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: "#10B981",
                            border: "2px solid var(--bg-secondary)",
                          }}
                        />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: "0.62rem",
                              fontWeight: 800,
                              backgroundColor: "var(--color-success-bg)",
                              color: "var(--color-success)",
                              border: "1px solid var(--color-success-border)",
                              padding: "2px 6px",
                              borderRadius: "2px",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            ✓ DISCORD HESABI BAĞLANDI
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.98rem",
                            fontWeight: 800,
                            color: "var(--text-primary)",
                            marginTop: "4px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {discordProfile.displayName || "Discord Oturumu Aktif"}
                        </div>
                        {discordProfile.username && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                            @{discordProfile.username}
                          </div>
                        )}
                      </div>
                    </div>

                    <a
                      href="/api/auth/discord/login"
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-light)",
                        padding: "0.45rem 0.75rem",
                        borderRadius: "2px",
                        textDecoration: "none",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        flexShrink: 0,
                      }}
                    >
                      Hesabı Değiştir
                    </a>
                  </div>

                  {/* REGISTRATION CARD */}
                  <form
                    onSubmit={handleCompleteRegistration}
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                      borderTop: "3px solid var(--LAC-orange)",
                      borderRadius: "2px",
                      padding: "1.75rem 2rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ marginBottom: "1.25rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "1rem" }}>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: "var(--LAC-orange)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "0.25rem",
                        }}
                      >
                        ADIM 2 · RESMİ PERSONEL DOSYASI OLUŞTURMA
                      </div>
                      <h2
                        style={{
                          margin: "0 0 6px",
                          fontSize: "1.55rem",
                          fontWeight: 800,
                          color: "var(--accent-primary)",
                          fontFamily: "'Oswald', sans-serif",
                          textTransform: "uppercase",
                        }}
                      >
                        MEMUR SİCİL & ROZET BİLGİLERİ
                      </h2>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        Discord kimliğiniz doğrulandı. MDT sistemine giriş yapabilmek için oyun içi (IC) memur bilgilerinizi aşağıya girin.
                      </p>
                    </div>

                    {error && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          backgroundColor: "var(--color-danger-bg)",
                          border: "1px solid var(--color-danger-border)",
                          borderLeft: "4px solid var(--color-danger)",
                          color: "var(--color-danger)",
                          padding: "10px 14px",
                          borderRadius: "2px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          marginBottom: "1.25rem",
                        }}
                      >
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {error}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.85rem" }}>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "var(--text-primary)",
                              marginBottom: "6px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            IC AD SOYAD *
                          </label>
                          <input
                            className="lapd-input"
                            type="text"
                            required
                            value={icName}
                            onChange={(e) => setIcName(e.target.value)}
                            placeholder="Örn: John Nolan"
                            style={{
                              width: "100%",
                              padding: "11px 12px",
                              borderRadius: "2px",
                              border: "1px solid var(--border-strong)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "var(--text-primary)",
                              marginBottom: "6px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            ROZET NO *
                          </label>
                          <input
                            className="lapd-input"
                            type="text"
                            required
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            placeholder="Örn: 1222"
                            style={{
                              width: "100%",
                              padding: "11px 12px",
                              borderRadius: "2px",
                              border: "1px solid var(--border-strong)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "var(--text-primary)",
                              marginBottom: "6px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            RÜTBE *
                          </label>
                          <select
                            className="lapd-input"
                            value={rank}
                            onChange={(e) => setRank(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "11px 12px",
                              borderRadius: "2px",
                              border: "1px solid var(--border-strong)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                              fontSize: "0.85rem",
                              fontWeight: 600,
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

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "var(--text-primary)",
                              marginBottom: "6px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            GÖREV BİRİMİ
                          </label>
                          <select
                            className="lapd-input"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "11px 12px",
                              borderRadius: "2px",
                              border: "1px solid var(--border-strong)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              boxSizing: "border-box",
                            }}
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* LIVE LAPD ID CARD PREVIEW */}
                      <div
                        style={{
                          marginTop: "0.25rem",
                          padding: "0.85rem 1rem",
                          backgroundColor: "var(--bg-tertiary)",
                          border: "1px solid var(--border-light)",
                          borderRadius: "2px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img
                            src="/logom.png"
                            alt="Seal"
                            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              ÖNİZLEME · LAPD PERSONEL KARTI
                            </div>
                            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-primary)" }}>
                              {icName.trim() || "Memur Adı Soyadı"} ·{" "}
                              <span style={{ color: "var(--LAC-orange)" }}>#{badge.trim() || "0000"}</span>
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                              {rank} — {department}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="lapd-btn-orange"
                        style={{
                          marginTop: "0.25rem",
                          width: "100%",
                          padding: "0.95rem 1.25rem",
                          borderRadius: "2px",
                          border: "none",
                          backgroundColor: "var(--LAC-orange)",
                          color: "#FFFFFF",
                          fontSize: "0.85rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          cursor: submitting ? "not-allowed" : "pointer",
                          opacity: submitting ? 0.7 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <i className="fa-solid fa-file-signature"></i>
                        {submitting ? "SİCİL KAYDEDİLİYOR..." : "SİCİL KAYDINI TAMAMLA VE ONAYA GÖNDER"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ══════════════════════════════════════════
                  STEP 3: PENDING ADMIN APPROVAL
                 ══════════════════════════════════════════ */}
              {step === "pending" && (
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    borderTop: "3px solid var(--LAC-orange)",
                    borderRadius: "2px",
                    padding: "2rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "2px",
                        backgroundColor: "var(--color-warning-bg)",
                        border: "1px solid var(--color-warning-border)",
                        color: "var(--color-warning)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.35rem",
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-user-clock" />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: "var(--LAC-orange)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        ADIM 3 · YÜKSEK KOMUTA ONAYI BEKLENİYOR
                      </div>
                      <h3
                        style={{
                          margin: "2px 0 0",
                          fontSize: "1.45rem",
                          fontWeight: 800,
                          color: "var(--accent-primary)",
                          fontFamily: "'Oswald', sans-serif",
                          textTransform: "uppercase",
                        }}
                      >
                        PERSONEL DOSYANIZ İNCELEMEDE
                      </h3>
                    </div>
                  </div>

                  {/* Submitted Officer File Card */}
                  <div
                    style={{
                      padding: "1rem 1.25rem",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--border-light)",
                      borderLeft: "4px solid var(--accent-primary)",
                      borderRadius: "2px",
                      marginBottom: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      {discordProfile.avatarUrl ? (
                        <img
                          src={discordProfile.avatarUrl}
                          alt=""
                          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <img
                          src="/logom.png"
                          alt=""
                          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
                          {icName || discordProfile.displayName || "Kayıtlı Personel"}{" "}
                          {badge && <span style={{ color: "var(--LAC-orange)" }}>#{badge}</span>}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                          {rank} · Discord OAuth2 Bağlı
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: "2px",
                        backgroundColor: "var(--color-warning-bg)",
                        color: "var(--color-warning)",
                        border: "1px solid var(--color-warning-border)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      ONAY BEKLİYOR
                    </span>
                  </div>

                  <p style={{ margin: "0 0 1.5rem", fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Personel sicil kaydınız veritabanına işlendi. Yüksek Komuta (Admin) yetkisine sahip personel başvurunuzu onayladıktan sonra aşağıdaki butonla doğrudan MDT terminaline bağlanabilirsiniz.
                  </p>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <a
                      href="/api/auth/discord/login"
                      className="lapd-btn-orange"
                      style={{
                        flex: 1,
                        padding: "0.8rem 1rem",
                        borderRadius: "2px",
                        backgroundColor: "var(--LAC-orange)",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <i className="fa-solid fa-rotate"></i>
                      ONAY DURUMUNU KONTROL ET / GİRİŞ YAP
                    </a>
                    <button
                      onClick={() => {
                        setStep("login");
                        router.replace("/giris");
                      }}
                      style={{
                        padding: "0.8rem 1rem",
                        borderRadius: "2px",
                        border: "1px solid var(--border-strong)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      Geri Dön
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span>LOS ANGELES C.P.D. · MDT v3.2</span>
                <span>© 2026 RESMİ EMNİYET PORTALI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}