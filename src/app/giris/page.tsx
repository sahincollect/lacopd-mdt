"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

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
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#000000",
            color: "#a1a1aa",
            fontFamily: "var(--font-inter), -apple-system, sans-serif",
            fontSize: "0.9rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid #27272a",
                borderTopColor: "#a3b18a",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Yükleniyor...
          </div>
        </div>
      }
    >
      <GirisPageContent />
    </Suspense>
  );
}

function GirisPageContent() {
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState<{
    title: string;
    description: string;
    detail?: string;
    uri?: string;
  } | null>(null);
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
    const detailParam = searchParams.get("detail");
    const uriParam = searchParams.get("uri");
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
        displayName: dname || duser || "Kullanıcı",
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
      setLoginError(null);
      fetch("/api/auth/discord/complete")
        .then((r) => r.json())
        .then((data) => {
          if (data?.authenticated) {
            setDiscordProfile((prev) => ({
              displayName: data.globalName || prev.displayName || "Kullanıcı",
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
      setLoginError(null);
    } else if (errorParam) {
      setStep("login");
      if (errorParam === "discord_denied") {
        setLoginError({
          title: "Yetkilendirme İptal Edildi",
          description: "Discord kimlik doğrulama işlemi kullanıcı tarafından iptal edildi.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "account_rejected") {
        setLoginError({
          title: "Başvuru Reddedildi",
          description: "MDT personel sicil başvurunuz Yüksek Komuta tarafından reddedilmiştir.",
        });
      } else if (errorParam === "state_mismatch") {
        setLoginError({
          title: "Oturum Doğrulama Hatası",
          description: "OAuth oturum anahtarı doğrulanamadı. Lütfen sayfayı yenileyip tekrar deneyin.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "discord_token_failed") {
        setLoginError({
          title: "Jeton Takas Hatası",
          description: "Discord sunucusu ile jeton takası yapılamadı.",
          detail: detailParam || undefined,
          uri: uriParam || undefined,
        });
      } else if (errorParam === "discord_user_failed") {
        setLoginError({
          title: "Profil Hatası",
          description: "Discord profil bilgileri alınamadı.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "missing_credentials") {
        setLoginError({
          title: "Yapılandırma Eksikliği",
          description: "Sunucu tarafında Discord OAuth değişkenleri tanımlanmamış.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "server_error") {
        setLoginError({
          title: "Sunucu Hatası",
          description: "Veritabanı veya oturum oluşturulurken sistemsel bir hata oluştu.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "no_code") {
        setLoginError({
          title: "Yetkilendirme Kodu Eksik",
          description: "Kimlik sağlayıcıdan geçerli yetki kodu alınamadı.",
        });
      } else {
        setLoginError({
          title: "Kimlik Doğrulama Hatası",
          description: `Giriş sırasında hata oluştu: ${errorParam}`,
          detail: detailParam || undefined,
        });
      }
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

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000000;
          color: #ffffff;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
        }

        .minimal-input {
          width: 100%;
          box-sizing: border-box;
          background-color: #121214;
          border: 1px solid #27272a;
          color: #f4f4f5;
          border-radius: 10px;
          padding: 13px 15px;
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .minimal-input::placeholder {
          color: #52525b;
        }
        .minimal-input:focus {
          border-color: #a3b18a;
          box-shadow: 0 0 0 1.5px #a3b18a;
        }

        .minimal-btn-primary {
          width: 100%;
          box-sizing: border-box;
          background-color: #a3b18a;
          color: #0d0d0f;
          border: none;
          border-radius: 10px;
          padding: 13px 18px;
          font-size: 0.92rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          transition: filter 0.2s ease, transform 0.1s ease;
          font-family: inherit;
        }
        .minimal-btn-primary:hover:not(:disabled) {
          filter: brightness(1.06);
        }
        .minimal-btn-primary:active:not(:disabled) {
          transform: scale(0.99);
        }
        .minimal-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .minimal-btn-secondary {
          background-color: #18181b;
          border: 1px solid #27272a;
          color: #d4d4d8;
          border-radius: 10px;
          padding: 11px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .minimal-btn-secondary:hover {
          background-color: #27272a;
          color: #ffffff;
        }

        @media (max-width: 960px) {
          .minimal-split-layout {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .minimal-hero-panel {
            display: none !important;
          }
          .minimal-form-panel {
            padding: 2.5rem 1.5rem !important;
          }
        }
      `}</style>

      <div
        className="minimal-split-layout"
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          backgroundColor: "#000000",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* ═════════════════════════════════════════════════════
            LEFT PANEL: ARCHITECTURAL HERO CARD (MATCHING USER IMAGE)
           ═════════════════════════════════════════════════════ */}
        <div
          className="minimal-hero-panel"
          style={{
            flex: "0 0 48%",
            padding: "16px",
            boxSizing: "border-box",
            display: "flex",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "26px",
              overflow: "hidden",
              position: "relative",
              backgroundColor: "#09090b",
              backgroundImage:
                'url("/login-architecture.jpg"), url("/gallery/gallery_add_100.jpg"), url("/mdt-bg.jpeg")',
              backgroundSize: "cover",
              backgroundPosition: "center center",
            }}
          >
            {/* Subtle dark gradient overlay towards the bottom */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)",
              }}
            />

            {/* Overlaid Typography at Bottom Left (Exact styling from reference) */}
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                right: 0,
                padding: "3rem 2.75rem",
                color: "#ffffff",
                zIndex: 2,
              }}
            >
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 400,
                  lineHeight: 1.35,
                  margin: "0 0 0.5rem 0",
                  letterSpacing: "-0.015em",
                  color: "#f4f4f5",
                }}
              >
                To protect and to serve,
                <br />
                one watch at a time.
              </h2>

              <p
                style={{
                  fontSize: "1rem",
                  fontWeight: 400,
                  color: "#e4e4e7",
                  margin: "0 0 1.5rem 0",
                  lineHeight: 1.45,
                }}
              >
                Connecting law enforcement personnel across Los Angeles.
              </p>

              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#a1a1aa",
                  letterSpacing: "0.01em",
                }}
              >
                LACPD MDT — Your gateway to operational excellence.
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            RIGHT PANEL: CLEAN MINIMALIST FORM (MATCHING USER IMAGE)
           ═════════════════════════════════════════════════════ */}
        <div
          className="minimal-form-panel"
          style={{
            flex: "1 1 52%",
            backgroundColor: "#000000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 3rem",
            boxSizing: "border-box",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {/* Top subtle back link */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "32px",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#71717a",
                fontSize: "0.82rem",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#d4d4d8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* ═════════════════════════════════════════════════
                STEP 1: LOGIN (DISCORD SSO)
               ═════════════════════════════════════════════════ */}
            {step === "login" && (
              <div>
                <div style={{ marginBottom: "2rem" }}>
                  <h1
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 500,
                      margin: "0 0 0.5rem 0",
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                    }}
                  >
                    Sign in to your terminal
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#71717a",
                      lineHeight: 1.5,
                    }}
                  >
                    Los Angeles Community Police Department resmi personel veri terminaline erişmek için oturum açın.
                  </p>
                </div>

                {loginError && (
                  <div
                    style={{
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      marginBottom: "1.5rem",
                      color: "#fca5a5",
                      fontSize: "0.82rem",
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "2px" }}>{loginError.title}</div>
                    <div style={{ color: "#d4d4d8" }}>{loginError.description}</div>
                    {loginError.detail && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontFamily: "monospace",
                          fontSize: "0.74rem",
                          color: "#a1a1aa",
                        }}
                      >
                        {loginError.detail}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.82rem",
                        color: "#a1a1aa",
                        marginBottom: "7px",
                        fontWeight: 500,
                      }}
                    >
                      Kimlik Doğrulama Sağlayıcısı
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="Kurumsal Discord SSO (OAuth2)"
                      className="minimal-input"
                      style={{
                        color: "#a1a1aa",
                        cursor: "default",
                        backgroundColor: "#0d0d0f",
                      }}
                    />
                  </div>

                  <a href="/api/auth/discord/login" className="minimal-btn-primary">
                    <i className="fa-brands fa-discord" style={{ fontSize: "1.05rem" }} />
                    Discord ile Giriş Yap
                  </a>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.82rem",
                      color: "#71717a",
                      marginTop: "0.5rem",
                    }}
                  >
                    İlk kez mi katılıyorsunuz?{" "}
                    <span style={{ color: "#d4d4d8" }}>
                      Discord girişinden sonra sicil formu açılacaktır.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════
                STEP 2: REGISTER (OFFICER DOSSIER FORM)
               ═════════════════════════════════════════════ */}
            {step === "register" && (
              <div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h1
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 500,
                      margin: "0 0 0.5rem 0",
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                    }}
                  >
                    Create your account
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#71717a",
                      lineHeight: 1.5,
                    }}
                  >
                    Doğrulanan kimliğinize ait resmi memur sicil ve rozet bilgilerinizi tanımlayın.
                  </p>
                </div>

                {error && (
                  <div
                    style={{
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      marginBottom: "1.25rem",
                      color: "#fca5a5",
                      fontSize: "0.82rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Connected Account Tag */}
                <div
                  style={{
                    backgroundColor: "#121214",
                    border: "1px solid #27272a",
                    borderRadius: "10px",
                    padding: "9px 13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.25rem",
                    fontSize: "0.78rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d4d4d8" }}>
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        backgroundColor: "#a3b18a",
                        display: "inline-block",
                      }}
                    />
                    <span>{discordProfile.displayName || "Discord Hesabı"}</span>
                    {discordProfile.username && (
                      <span style={{ color: "#71717a" }}>@{discordProfile.username}</span>
                    )}
                  </div>
                  <a
                    href="/api/auth/discord/login"
                    style={{
                      color: "#a1a1aa",
                      fontSize: "0.72rem",
                      textDecoration: "none",
                    }}
                  >
                    Değiştir
                  </a>
                </div>

                <form onSubmit={handleCompleteRegistration} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.82rem",
                        color: "#a1a1aa",
                        marginBottom: "6px",
                        fontWeight: 500,
                      }}
                    >
                      Full name *
                    </label>
                    <input
                      type="text"
                      required
                      value={icName}
                      onChange={(e) => setIcName(e.target.value)}
                      placeholder="Andrew Thomas"
                      className="minimal-input"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.82rem",
                        color: "#a1a1aa",
                        marginBottom: "6px",
                        fontWeight: 500,
                      }}
                    >
                      Badge number *
                    </label>
                    <input
                      type="text"
                      required
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. 1222"
                      className="minimal-input"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.82rem",
                          color: "#a1a1aa",
                          marginBottom: "6px",
                          fontWeight: 500,
                        }}
                      >
                        Rank *
                      </label>
                      <select
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="minimal-input"
                        style={{ cursor: "pointer" }}
                      >
                        {RANKS.map((r) => (
                          <option key={r} value={r} style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.82rem",
                          color: "#a1a1aa",
                          marginBottom: "6px",
                          fontWeight: 500,
                        }}
                      >
                        Division *
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="minimal-input"
                        style={{ cursor: "pointer" }}
                      >
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d} style={{ backgroundColor: "#18181b", color: "#ffffff" }}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "0.74rem",
                      color: "#71717a",
                      lineHeight: 1.45,
                      marginTop: "2px",
                    }}
                  >
                    Sicil bilgileriniz veritabanına işlenecek ve Yüksek Komuta onayının ardından terminal erişimi sağlanacaktır.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="minimal-btn-primary"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {submitting ? "Oluşturuluyor..." : "Create account"}
                  </button>
                </form>
              </div>
            )}

            {/* ═════════════════════════════════════════════════
                STEP 3: PENDING APPROVAL
               ═════════════════════════════════════════════ */}
            {step === "pending" && (
              <div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h1
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 500,
                      margin: "0 0 0.5rem 0",
                      letterSpacing: "-0.02em",
                      color: "#ffffff",
                    }}
                  >
                    Account under review
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#71717a",
                      lineHeight: 1.5,
                    }}
                  >
                    Personel sicil dosyanız sisteme kaydedildi. Yüksek Komuta onayının ardından doğrudan terminale erişebilirsiniz.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: "#121214",
                    border: "1px solid #27272a",
                    borderRadius: "12px",
                    padding: "16px 18px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      DOSYA DURUMU
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#a3b18a",
                        backgroundColor: "rgba(163, 177, 138, 0.12)",
                        border: "1px solid rgba(163, 177, 138, 0.25)",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: 600,
                      }}
                    >
                      ONAY BEKLİYOR
                    </span>
                  </div>

                  <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#ffffff", marginBottom: "4px" }}>
                    {icName || discordProfile.displayName || "Kayıtlı Memur"}{" "}
                    {badge && <span style={{ color: "#a3b18a" }}>#{badge}</span>}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#71717a" }}>
                    {rank} — {department}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <a href="/api/auth/discord/login" className="minimal-btn-primary">
                    Onay Durumunu Kontrol Et
                  </a>
                  <button
                    onClick={() => {
                      setStep("login");
                      router.replace("/giris");
                    }}
                    className="minimal-btn-secondary"
                  >
                    Girişe Dön
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Footer Note (Matching screenshot footer) */}
            <div
              style={{
                marginTop: "2.5rem",
                textAlign: "center",
                fontSize: "0.72rem",
                color: "#52525b",
                lineHeight: 1.5,
              }}
            >
              By accessing this terminal, you agree to our{" "}
              <span style={{ color: "#a1a1aa" }}>Terms of Service</span> and{" "}
              <span style={{ color: "#a1a1aa" }}>Privacy Policy</span>.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
