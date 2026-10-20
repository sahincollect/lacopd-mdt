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
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#031022",
            color: "#94a3b8",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.9rem",
            letterSpacing: "0.05em",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "2px solid rgba(255,255,255,0.1)",
                borderTopColor: "#E84F2A",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            YÜKLENİYOR...
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

  // Live Terminal Clock
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "America/Los_Angeles",
        }) + " PT"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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
        displayName: dname || duser || "Yetkilendirilmiş Kullanıcı",
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
              displayName: data.globalName || prev.displayName || "Yetkilendirilmiş Kullanıcı",
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
          title: "Yetkilendirme Reddedildi",
          description: "Kullanıcı tarafından kimlik doğrulama işlemi onaylanmadı veya iptal edildi.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "account_rejected") {
        setLoginError({
          title: "Personel Dosyası Reddedildi",
          description: "MDT sicil başvurunuz Yüksek Komuta Merkezi / İç İşleri tarafından reddedilmiştir.",
        });
      } else if (errorParam === "state_mismatch") {
        setLoginError({
          title: "Güvenlik Oturum Hatası",
          description: "OAuth oturum anahtarı eşleşmedi. Lütfen sayfayı yenileyip tekrar deneyin.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "discord_token_failed") {
        setLoginError({
          title: "Kimlik Sağlayıcı İletişim Hatası",
          description: "Kimlik sağlayıcı sunucusu ile jeton takası gerçekleştirilemedi.",
          detail: detailParam || undefined,
          uri: uriParam || undefined,
        });
      } else if (errorParam === "discord_user_failed") {
        setLoginError({
          title: "Profil Doğrulama Hatası",
          description: "Kimlik sağlayıcıdan kullanıcı profil verisi alınamadı.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "missing_credentials") {
        setLoginError({
          title: "Sistem Yapılandırma Eksikliği",
          description: "Sunucu tarafında OAuth kimlik sağlayıcı parametreleri tanımlanmamış.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "server_error") {
        setLoginError({
          title: "Sunucu / Veritabanı Hatası",
          description: "Veritabanı oturum doğrulaması sırasında sistemsel bir hata meydana geldi.",
          detail: detailParam || undefined,
        });
      } else if (errorParam === "no_code") {
        setLoginError({
          title: "Yetkilendirme Kodu Bulunamadı",
          description: "Kimlik sağlayıcı yönlendirmesinden geçerli yetkilendirme parametresi alınamadı.",
        });
      } else {
        setLoginError({
          title: "Kimlik Doğrulama Hatası",
          description: `Güvenlik denetimi sırasında hata kodu alındı: ${errorParam}`,
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

  const currentStepNum = step === "login" ? 1 : step === "register" ? 2 : 3;

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #031022;
        }
        .portal-btn-sso {
          transition: all 0.2s ease;
          background-color: #041632;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #ffffff;
        }
        .portal-btn-sso:hover {
          background-color: #092654;
          border-color: rgba(232, 79, 42, 0.8);
          box-shadow: 0 4px 14px rgba(4, 22, 50, 0.35);
        }
        .portal-btn-primary {
          transition: all 0.2s ease;
          background-color: var(--LAC-orange, #E84F2A);
          color: #ffffff;
        }
        .portal-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 4px 12px rgba(232, 79, 42, 0.3);
        }
        .portal-input:focus {
          border-color: #041632 !important;
          outline: none;
          box-shadow: 0 0 0 2px rgba(4, 22, 50, 0.12);
        }
        .dark .portal-input:focus {
          border-color: var(--LAC-orange, #E84F2A) !important;
          box-shadow: 0 0 0 2px rgba(232, 79, 42, 0.2);
        }
        @media (max-width: 980px) {
          .portal-layout {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh !important;
            overflow-y: auto !important;
          }
          .portal-left-panel {
            flex: 0 0 auto !important;
            padding: 2rem 1.5rem !important;
            border-right: none !important;
            border-bottom: 2px solid rgba(232, 79, 42, 0.6) !important;
          }
          .portal-right-panel {
            flex: 1 1 auto !important;
            height: auto !important;
            overflow-y: visible !important;
          }
        }
      `}</style>

      {/* ── TOP FEDERAL DEMARCATION BAR ── */}
      <div
        style={{
          width: "100%",
          backgroundColor: "#020914",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "0.35rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.68rem",
          letterSpacing: "0.06em",
          color: "#94a3b8",
          fontFamily: "var(--font-inter), sans-serif",
          boxSizing: "border-box",
          zIndex: 50,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              color: "#f8fafc",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            <i className="fa-solid fa-building-shield" style={{ color: "#E84F2A", fontSize: "0.75rem" }} />
            CITY OF LOS ANGELES
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span style={{ textTransform: "uppercase", fontWeight: 600 }}>
            COMMUNITY POLICE DEPARTMENT • IT &amp; COMMUNICATIONS BUREAU
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {currentTime && (
            <div
              style={{
                fontFamily: "Consolas, Monaco, monospace",
                color: "#cbd5e1",
                fontSize: "0.68rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  display: "inline-block",
                }}
              />
              {currentTime}
            </div>
          )}
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          <span
            style={{
              color: "#E84F2A",
              fontWeight: 700,
              fontSize: "0.64rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            LAW ENFORCEMENT SENSITIVE
          </span>
        </div>
      </div>

      {/* ── MAIN PORTAL CONTAINER ── */}
      <div
        className="portal-layout"
        style={{
          display: "flex",
          height: "calc(100vh - 30px)",
          width: "100vw",
          fontFamily: "var(--font-inter), 'Inter', -apple-system, sans-serif",
          overflow: "hidden",
          backgroundColor: "var(--bg-primary, #f4f6f9)",
        }}
      >
        {/* ═════════════════════════════════════════════════════
            LEFT PANEL: OFFICIAL INSTITUTIONAL ADVISORY & DOSSIER
           ═════════════════════════════════════════════════════ */}
        <div
          className="portal-left-panel"
          style={{
            flex: "0 0 44%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#031024",
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(9, 38, 84, 0.45) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(232, 79, 42, 0.08) 0%, transparent 50%)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "2.75rem 3rem",
            color: "#FFFFFF",
            boxSizing: "border-box",
          }}
        >
          {/* Subtle Watermark Seal */}
          <div
            style={{
              position: "absolute",
              right: "-60px",
              bottom: "-60px",
              width: "360px",
              height: "360px",
              opacity: 0.035,
              backgroundImage: 'url("/logom.png")',
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Top: Department Header */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2rem" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "#041632",
                  border: "2px solid rgba(255, 255, 255, 0.25)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/logom.png"
                  alt="LACPD Seal"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255, 255, 255, 0.6)",
                    marginBottom: "3px",
                  }}
                >
                  City of Los Angeles • Official Law Enforcement
                </div>
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    letterSpacing: "0.04em",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-oswald), sans-serif",
                    lineHeight: 1.15,
                  }}
                >
                  COMMUNITY POLICE DEPARTMENT
                </div>
                <div
                  style={{
                    fontSize: "0.74rem",
                    color: "#E84F2A",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginTop: "2px",
                  }}
                >
                  MOBILE DATA TERMINAL (MDT) // CENTRAL NETWORK
                </div>
              </div>
            </div>

            {/* Department Mission Banner */}
            <div
              style={{
                borderLeft: "3px solid #E84F2A",
                paddingLeft: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  fontSize: "1.65rem",
                  fontWeight: 900,
                  lineHeight: 1.2,
                  fontFamily: "var(--font-oswald), sans-serif",
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                }}
              >
                TO PROTECT AND TO SERVE.
              </div>
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "0.82rem",
                  color: "rgba(255, 255, 255, 0.72)",
                  lineHeight: 1.55,
                }}
              >
                Kolluk kuvvetleri saha koordinasyonu, adli vaka kayıtları, kriminal sicil sorgulaması ve yüksek komuta bilgi ağı.
              </p>
            </div>

            {/* Formal Statutory Warning & Audit Protocol (Real Law Enforcement Standard) */}
            <div
              style={{
                backgroundColor: "rgba(4, 22, 50, 0.7)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
                padding: "1.25rem 1.35rem",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#E84F2A",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                <i className="fa-solid fa-shield-halved" />
                RESMİ BİLGİ GÜVENLİĞİ VE DENETİM BİLDİRİMİ
              </div>

              <div
                style={{
                  fontSize: "0.76rem",
                  color: "rgba(255, 255, 255, 0.78)",
                  lineHeight: 1.6,
                }}
              >
                Bu sistem, Los Angeles Community Police Department görevlilerinin resmi vazife ifası için tahsis edilmiştir.
                <ul
                  style={{
                    margin: "8px 0 0 0",
                    paddingLeft: "1.1rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "0.74rem",
                    lineHeight: 1.55,
                  }}
                >
                  <li>Yalnızca onaylanmış ve aktif kolluk personeli erişim sağlayabilir.</li>
                  <li>
                    Sistemdeki her oturum açma, veri sorgusu ve hareket IP adresiyle birlikte kayıt altına alınmakta olup İç İşleri (Internal Affairs) denetimine tabidir.
                  </li>
                  <li>Yetkisiz erişim teşebbüsleri derhal engellenir ve yasal takibata sevk edilir.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Status */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.09)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                fontSize: "0.7rem",
                color: "rgba(255, 255, 255, 0.6)",
                fontFamily: "Consolas, Monaco, monospace",
              }}
            >
              <div>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>NODE:</span> LAC-HQ-SRV-01
              </div>
              <div>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>SECURITY:</span> TLS 1.3 / AES-256
              </div>
              <div>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>PROTOCOL:</span> ENTERPRISE SSO
              </div>
              <div>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>STATE:</span>{" "}
                <span style={{ color: "#34d399", fontWeight: 700 }}>OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════
            RIGHT PANEL: AUTHENTICATION CONSOLE
           ═════════════════════════════════════════════════════ */}
        <div
          className="portal-right-panel"
          style={{
            flex: "1 1 56%",
            backgroundColor: "var(--bg-primary, #f4f6f9)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Top Secondary Action Bar */}
          <div
            style={{
              height: "56px",
              padding: "0 2rem",
              backgroundColor: "var(--bg-secondary, #ffffff)",
              borderBottom: "1px solid var(--border-light, #e2e8f0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span
                style={{
                  width: "3px",
                  height: "16px",
                  backgroundColor: "#041632",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "var(--text-primary, #0f172a)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                GÜVENLİ ERİŞİM TERMİNALİ // AUTHENTICATION GATEWAY
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ThemeToggle />
              <Link
                href="/"
                style={{
                  backgroundColor: "var(--bg-tertiary, #eef2f6)",
                  border: "1px solid var(--border-light, #e2e8f0)",
                  color: "var(--text-primary, #0f172a)",
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "background 0.15s ease",
                }}
              >
                <i className="fa-solid fa-arrow-left" style={{ color: "#E84F2A" }} />
                Ana Sayfa
              </Link>
            </div>
          </div>

          {/* Form / Content Container */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2.5rem 2rem",
            }}
          >
            <div style={{ width: "100%", maxWidth: "490px" }}>
              {/* ── STEP TRACKER STRIP ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "6px",
                  marginBottom: "1.75rem",
                }}
              >
                {[
                  { num: 1, title: "1. Kimlik Teyidi", done: currentStepNum > 1 },
                  { num: 2, title: "2. Sicil Dosyası", done: currentStepNum > 2 },
                  { num: 3, title: "3. Komuta Onayı", done: false },
                ].map((s) => {
                  const isCurrent = currentStepNum === s.num;
                  return (
                    <div
                      key={s.num}
                      style={{
                        padding: "0.55rem 0.65rem",
                        backgroundColor: "var(--bg-secondary, #ffffff)",
                        border: "1px solid var(--border-light, #e2e8f0)",
                        borderTop: s.done
                          ? "2.5px solid #059669"
                          : isCurrent
                          ? "2.5px solid #041632"
                          : "2.5px solid transparent",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "3px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          backgroundColor: s.done
                            ? "#059669"
                            : isCurrent
                            ? "#041632"
                            : "var(--bg-tertiary, #eef2f6)",
                          color: s.done || isCurrent ? "#FFFFFF" : "var(--text-muted, #64748b)",
                          flexShrink: 0,
                        }}
                      >
                        {s.done ? <i className="fa-solid fa-check" /> : s.num}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: isCurrent || s.done ? "var(--text-primary, #0f172a)" : "var(--text-muted, #64748b)",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* ═════════════════════════════════════════════════════
                  STEP 1: INSTITUTIONAL SINGLE SIGN-ON (SSO)
                 ═════════════════════════════════════════════════════ */}
              {step === "login" && (
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary, #ffffff)",
                    border: "1px solid var(--border-light, #e2e8f0)",
                    borderTop: "3px solid #041632",
                    borderRadius: "4px",
                    padding: "2.25rem 2rem",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ marginBottom: "1.75rem" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        color: "#E84F2A",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <i className="fa-solid fa-lock" style={{ fontSize: "0.65rem" }} />
                      GÜVENLİ ERİŞİM NOKTASI
                    </div>
                    <h2
                      style={{
                        margin: "0 0 6px",
                        fontSize: "1.55rem",
                        fontWeight: 800,
                        color: "var(--text-primary, #0f172a)",
                        fontFamily: "var(--font-oswald), 'Inter', sans-serif",
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                      }}
                    >
                      PERSONEL KİMLİK DOĞRULAMA
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.82rem",
                        color: "var(--text-secondary, #334155)",
                        lineHeight: 1.5,
                      }}
                    >
                      MDT terminaline bağlanmak için departman onaylı tekil oturum (SSO) hesabınızı doğrulayın.
                    </p>
                  </div>

                  {/* INCIDENT / ERROR ADVISORY */}
                  {loginError && (
                    <div
                      style={{
                        backgroundColor: "var(--color-danger-bg, #fef2f2)",
                        border: "1px solid var(--color-danger-border, #fecaca)",
                        borderLeft: "3.5px solid #dc2626",
                        color: "#991b1b",
                        padding: "12px 14px",
                        borderRadius: "4px",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: 800,
                          fontSize: "0.8rem",
                          marginBottom: "3px",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        <i className="fa-solid fa-triangle-exclamation" />
                        <span>{loginError.title}</span>
                      </div>
                      <div style={{ color: "var(--text-primary, #0f172a)", fontSize: "0.78rem", lineHeight: 1.5 }}>
                        {loginError.description}
                      </div>
                      {loginError.detail && (
                        <div
                          style={{
                            marginTop: "6px",
                            padding: "6px 8px",
                            backgroundColor: "rgba(0,0,0,0.05)",
                            borderRadius: "3px",
                            fontFamily: "Consolas, monospace",
                            fontSize: "0.7rem",
                            color: "var(--text-primary, #0f172a)",
                            wordBreak: "break-all",
                          }}
                        >
                          <strong>Referans:</strong> {loginError.detail}
                        </div>
                      )}
                      {loginError.uri && (
                        <div
                          style={{
                            marginTop: "6px",
                            fontSize: "0.68rem",
                            color: "var(--text-secondary, #334155)",
                          }}
                        >
                          OAuth Callback URI: <code>{loginError.uri}</code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ENTERPRISE SSO BUTTON */}
                  <a
                    href="/api/auth/discord/login"
                    className="portal-btn-sso"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "0.95rem 1.25rem",
                      borderRadius: "4px",
                      textDecoration: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "4px",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#cbd5e1",
                          fontSize: "1.1rem",
                        }}
                      >
                        <i className="fa-brands fa-discord" />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            color: "#FFFFFF",
                          }}
                        >
                          DEPARTMAN KİMLİK SAĞLAYICISI İLE GİRİŞ
                        </div>
                        <div
                          style={{
                            fontSize: "0.68rem",
                            color: "rgba(255, 255, 255, 0.65)",
                            fontWeight: 500,
                          }}
                        >
                          Kurumsal Discord Kimlik Teyidi (SSO)
                        </div>
                      </div>
                    </div>

                    <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem" }}>
                      <i className="fa-solid fa-arrow-right-to-bracket" />
                    </div>
                  </a>

                  {/* TRANSPARENCY & DATA PRIVACY DISCLOSURE (Eliminates Phishing/Scam Anxiety) */}
                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "1rem",
                      backgroundColor: "var(--bg-tertiary, #eef2f6)",
                      border: "1px solid var(--border-light, #e2e8f0)",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        color: "var(--text-primary, #0f172a)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.4rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fa-solid fa-shield-check" style={{ color: "#059669" }} />
                      GÜVENLİK VE VERİ GİZLİLİĞİ BEYANI
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.74rem",
                        color: "var(--text-secondary, #334155)",
                        lineHeight: 1.55,
                      }}
                    >
                      Kimlik doğrulaması OAuth2 standardında çalışır. Bu sistem hesabınızın şifresine, mesajlarınıza veya özel izinlerine asla erişemez. Yalnızca kimliğinizi teyit eden genel kullanıcı ID bilginiz emniyet sicilinizle eşleştirilir.
                    </p>
                  </div>

                  {/* Registration Procedure Note */}
                  <div
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.72rem",
                      color: "var(--text-muted, #64748b)",
                      lineHeight: 1.5,
                      textAlign: "center",
                    }}
                  >
                    İlk kez katılan memurlar için kimlik doğrulamasının ardından otomatik olarak <strong>Sicil ve Rozet Tanımlama</strong> adımı açılacaktır.
                  </div>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════
                  STEP 2: OFFICER DOSSIER & BADGE REQUISITION FORM
                 ═════════════════════════════════════════════════════ */}
              {step === "register" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* VERIFIED SSO IDENTITY CARD */}
                  <div
                    style={{
                      backgroundColor: "var(--bg-secondary, #ffffff)",
                      border: "1px solid var(--border-light, #e2e8f0)",
                      borderLeft: "3.5px solid #059669",
                      borderRadius: "4px",
                      padding: "0.9rem 1.15rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {discordProfile.avatarUrl ? (
                          <img
                            src={discordProfile.avatarUrl}
                            alt="Avatar"
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1.5px solid #059669",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              backgroundColor: "#041632",
                              color: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1rem",
                              border: "1.5px solid #059669",
                            }}
                          >
                            <i className="fa-solid fa-user-shield" />
                          </div>
                        )}
                        <span
                          title="Doğrulandı"
                          style={{
                            position: "absolute",
                            bottom: -1,
                            right: -1,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "#059669",
                            border: "2px solid var(--bg-secondary, #ffffff)",
                          }}
                        />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.66rem",
                            fontWeight: 800,
                            color: "#059669",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          DOĞRULANMIŞ HARİCİ KİMLİK (SSO)
                        </div>
                        <div
                          style={{
                            fontSize: "0.92rem",
                            fontWeight: 800,
                            color: "var(--text-primary, #0f172a)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {discordProfile.displayName || "Kullanıcı"}
                        </div>
                        {discordProfile.username && (
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)" }}>
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
                        color: "var(--text-secondary, #334155)",
                        backgroundColor: "var(--bg-tertiary, #eef2f6)",
                        border: "1px solid var(--border-light, #e2e8f0)",
                        padding: "0.35rem 0.65rem",
                        borderRadius: "3px",
                        textDecoration: "none",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        flexShrink: 0,
                      }}
                    >
                      Hesabı Değiştir
                    </a>
                  </div>

                  {/* OFFICIAL DOSSIER REQUISITION FORM */}
                  <form
                    onSubmit={handleCompleteRegistration}
                    style={{
                      backgroundColor: "var(--bg-secondary, #ffffff)",
                      border: "1px solid var(--border-light, #e2e8f0)",
                      borderTop: "3px solid #041632",
                      borderRadius: "4px",
                      padding: "1.75rem 2rem",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "1.25rem",
                        borderBottom: "1px solid var(--border-light, #e2e8f0)",
                        paddingBottom: "0.85rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: "#E84F2A",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "0.25rem",
                        }}
                      >
                        ADIM 2 // PERSONEL SİCİL DOSYASI OLUŞTURMA
                      </div>
                      <h2
                        style={{
                          margin: "0 0 4px",
                          fontSize: "1.45rem",
                          fontWeight: 800,
                          color: "var(--text-primary, #0f172a)",
                          fontFamily: "var(--font-oswald), sans-serif",
                          textTransform: "uppercase",
                        }}
                      >
                        MEMUR SİCİL &amp; ROZET BİLGİLERİ
                      </h2>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.78rem",
                          color: "var(--text-secondary, #334155)",
                          lineHeight: 1.5,
                        }}
                      >
                        Oyun içi (IC) memur kimlik bilgilerinizi giriniz. Bilgiler teyit edildikten sonra personel kartınız oluşturulacaktır.
                      </p>
                    </div>

                    {error && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: "var(--color-danger-bg, #fef2f2)",
                          border: "1px solid var(--color-danger-border, #fecaca)",
                          borderLeft: "3.5px solid #dc2626",
                          color: "#991b1b",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          marginBottom: "1.25rem",
                        }}
                      >
                        <i className="fa-solid fa-circle-exclamation" />
                        {error}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: "var(--text-primary, #0f172a)",
                              marginBottom: "5px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            IC AD SOYAD *
                          </label>
                          <input
                            className="portal-input"
                            type="text"
                            required
                            value={icName}
                            onChange={(e) => setIcName(e.target.value)}
                            placeholder="Örn: John Nolan"
                            style={{
                              width: "100%",
                              padding: "9px 11px",
                              borderRadius: "4px",
                              border: "1px solid var(--border-strong, #cbd5e1)",
                              backgroundColor: "var(--bg-primary, #f4f6f9)",
                              color: "var(--text-primary, #0f172a)",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: "var(--text-primary, #0f172a)",
                              marginBottom: "5px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            ROZET NO *
                          </label>
                          <input
                            className="portal-input"
                            type="text"
                            required
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            placeholder="Örn: 1222"
                            style={{
                              width: "100%",
                              padding: "9px 11px",
                              borderRadius: "4px",
                              border: "1px solid var(--border-strong, #cbd5e1)",
                              backgroundColor: "var(--bg-primary, #f4f6f9)",
                              color: "var(--text-primary, #0f172a)",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              boxSizing: "border-box",
                              fontFamily: "Consolas, monospace",
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: "var(--text-primary, #0f172a)",
                              marginBottom: "5px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            RÜTBE *
                          </label>
                          <select
                            className="portal-input"
                            value={rank}
                            onChange={(e) => setRank(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "9px 11px",
                              borderRadius: "4px",
                              border: "1px solid var(--border-strong, #cbd5e1)",
                              backgroundColor: "var(--bg-primary, #f4f6f9)",
                              color: "var(--text-primary, #0f172a)",
                              fontSize: "0.82rem",
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
                              fontSize: "0.7rem",
                              fontWeight: 800,
                              color: "var(--text-primary, #0f172a)",
                              marginBottom: "5px",
                              letterSpacing: "0.05em",
                              textTransform: "uppercase",
                            }}
                          >
                            GÖREV BİRİMİ
                          </label>
                          <select
                            className="portal-input"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "9px 11px",
                              borderRadius: "4px",
                              border: "1px solid var(--border-strong, #cbd5e1)",
                              backgroundColor: "var(--bg-primary, #f4f6f9)",
                              color: "var(--text-primary, #0f172a)",
                              fontSize: "0.82rem",
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

                      {/* OFFICIAL WARRANT CARD / BADGE PREVIEW */}
                      <div
                        style={{
                          marginTop: "0.4rem",
                          padding: "0.85rem 1rem",
                          backgroundColor: "#031024",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "4px",
                          color: "#FFFFFF",
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
                            style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: "0.64rem",
                                fontWeight: 800,
                                color: "#E84F2A",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              ÖNİZLEME // PERSONEL KİMLİK KARTI
                            </div>
                            <div
                              style={{
                                fontSize: "0.88rem",
                                fontWeight: 800,
                                color: "#FFFFFF",
                                fontFamily: "var(--font-oswald), sans-serif",
                                letterSpacing: "0.03em",
                              }}
                            >
                              {icName.trim() || "MEMUR ADI SOYADI"} •{" "}
                              <span style={{ color: "#E84F2A" }}>#{badge.trim() || "0000"}</span>
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.7)" }}>
                              {rank} — {department}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "0.62rem",
                            fontFamily: "Consolas, monospace",
                            color: "rgba(255,255,255,0.4)",
                            textAlign: "right",
                          }}
                        >
                          OFFICIAL
                          <br />
                          CREDENTIAL
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="portal-btn-primary"
                        style={{
                          marginTop: "0.4rem",
                          width: "100%",
                          padding: "0.85rem 1.25rem",
                          borderRadius: "4px",
                          border: "none",
                          fontSize: "0.82rem",
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
                        <i className="fa-solid fa-file-signature" />
                        {submitting ? "KAYDEDİLİYOR..." : "SİCİL DOSYASINI KOMUTA ONAYINA İLET"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ═════════════════════════════════════════════════════
                  STEP 3: PENDING COMMAND AUTHORIZATION
                 ═════════════════════════════════════════════════════ */}
              {step === "pending" && (
                <div
                  style={{
                    backgroundColor: "var(--bg-secondary, #ffffff)",
                    border: "1px solid var(--border-light, #e2e8f0)",
                    borderTop: "3px solid #d97706",
                    borderRadius: "4px",
                    padding: "2.25rem 2rem",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "4px",
                        backgroundColor: "var(--color-warning-bg, #fffbeb)",
                        border: "1px solid var(--color-warning-border, #fde68a)",
                        color: "#b45309",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-solid fa-hourglass-half" />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: "#d97706",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        ADIM 3 // KOMUTA İNCELEMESİ
                      </div>
                      <h3
                        style={{
                          margin: "2px 0 0",
                          fontSize: "1.35rem",
                          fontWeight: 800,
                          color: "var(--text-primary, #0f172a)",
                          fontFamily: "var(--font-oswald), sans-serif",
                          textTransform: "uppercase",
                        }}
                      >
                        PERSONEL DOSYANIZ İNCELENİYOR
                      </h3>
                    </div>
                  </div>

                  {/* SUBMITTED DOSSIER SUMMARY */}
                  <div
                    style={{
                      padding: "0.9rem 1.15rem",
                      backgroundColor: "var(--bg-tertiary, #eef2f6)",
                      border: "1px solid var(--border-light, #e2e8f0)",
                      borderLeft: "3.5px solid #041632",
                      borderRadius: "4px",
                      marginBottom: "1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {discordProfile.avatarUrl ? (
                        <img
                          src={discordProfile.avatarUrl}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <img
                          src="/logom.png"
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary, #0f172a)" }}>
                          {icName || discordProfile.displayName || "Kayıtlı Memur"}{" "}
                          {badge && <span style={{ color: "#E84F2A" }}>#{badge}</span>}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary, #334155)", fontWeight: 600 }}>
                          {rank} • SSO Doğrulandı
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "3px",
                        backgroundColor: "var(--color-warning-bg, #fffbeb)",
                        color: "#b45309",
                        border: "1px solid var(--color-warning-border, #fde68a)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      ONAY BEKLİYOR
                    </span>
                  </div>

                  {/* Dossier status timeline */}
                  <div
                    style={{
                      backgroundColor: "var(--bg-primary, #f4f6f9)",
                      border: "1px solid var(--border-light, #e2e8f0)",
                      borderRadius: "4px",
                      padding: "0.85rem 1rem",
                      marginBottom: "1.25rem",
                      fontSize: "0.74rem",
                      color: "var(--text-secondary, #334155)",
                      lineHeight: 1.6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <i className="fa-solid fa-check" style={{ color: "#059669", fontSize: "0.75rem" }} />
                      <span>Harici kimlik teyidi başarıyla sağlandı.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <i className="fa-solid fa-check" style={{ color: "#059669", fontSize: "0.75rem" }} />
                      <span>Personel sicil formu veritabanına kaydedildi.</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ color: "#d97706", fontSize: "0.75rem" }} />
                      <span>Yüksek Komuta ve İç İşleri onayı bekleniyor.</span>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "0 0 1.5rem",
                      fontSize: "0.78rem",
                      color: "var(--text-secondary, #334155)",
                      lineHeight: 1.55,
                    }}
                  >
                    Personel sicil kaydınız yetkililere iletildi. Onay verildikten sonra aşağıdaki buton ile doğrudan MDT sistemine bağlanabilirsiniz.
                  </p>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <a
                      href="/api/auth/discord/login"
                      className="portal-btn-primary"
                      style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "4px",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <i className="fa-solid fa-rotate" />
                      ONAY DURUMUNU SORGULA / GİRİŞ YAP
                    </a>
                    <button
                      onClick={() => {
                        setStep("login");
                        router.replace("/giris");
                      }}
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "4px",
                        border: "1px solid var(--border-strong, #cbd5e1)",
                        backgroundColor: "var(--bg-secondary, #ffffff)",
                        color: "var(--text-primary, #0f172a)",
                        fontWeight: 700,
                        fontSize: "0.74rem",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      Girişe Dön
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Copyright & Compliance Footer */}
              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-light, #e2e8f0)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "var(--text-muted, #64748b)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span>CITY OF LOS ANGELES • LACPD MDT v4.2</span>
                <span>CJIS / INTERNAL AUDIT COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
