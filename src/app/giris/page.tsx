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

// Curated top gallery photos for the hero card
const HERO_PHOTOS = [
  {
    id: "patrol-response",
    label: "Devriye & Müdahale",
    url: "/gallery/gallery_add_100.jpg",
    description: "Ford Interceptor & Saha Müdahalesi",
  },
  {
    id: "field-officers",
    label: "Saha Memurları",
    url: "/gallery/1.png",
    description: "Operasyonel Personel ve Devriye Birimi",
  },
  {
    id: "sergeant-unit",
    label: "Devriye Amiri",
    url: "/gallery/lspd7.png",
    description: "Sergeant 1. Sınıf ve Devriye Aracı",
  },
  {
    id: "high-command",
    label: "Yüksek Komuta",
    url: "/gallery/lapdtoren3.png",
    description: "Departman Brifing ve Toplantı Salonu",
  },
  {
    id: "cruiser-04",
    label: "Kruvazör 04",
    url: "/gallery/gallery_add_113.jpg",
    description: "Crown Vic LAPD Interceptor",
  },
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
            backgroundColor: "#f8f9fa",
            color: "#475569",
            fontFamily: "var(--font-inter), -apple-system, sans-serif",
            fontSize: "0.9rem",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid #cbd5e1",
                borderTopColor: "#657e4e",
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
  // Theme state: defaults to "light" as requested ("Açık renkli karşılasın, tıklanırsa karanlık olsun")
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState<{
    title: string;
    description: string;
    detail?: string;
    uri?: string;
  } | null>(null);
  const [step, setStep] = useState<"login" | "register" | "pending">("login");

  // Selected hero photo from gallery
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Modals state
  const [activeModal, setActiveModal] = useState<"terms" | "privacy" | "help" | null>(null);

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

  // Sync theme with document class
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const currentHeroPhoto = HERO_PHOTOS[selectedPhotoIndex] || HERO_PHOTOS[0];
  const isDark = theme === "dark";

  // Dynamic theme palette: Default is Light ("Açık renkli"), toggles to Dark on click
  const t = isDark
    ? {
        pageBg: "#000000",
        panelBg: "#000000",
        heroWrapperBg: "#09090b",
        heroWrapperBorder: "rgba(255, 255, 255, 0.08)",
        textPrimary: "#ffffff",
        textSecondary: "#a1a1aa",
        textMuted: "#71717a",
        cardBg: "#121214",
        cardBorder: "#27272a",
        inputBg: "#121214",
        inputBorder: "#27272a",
        inputText: "#f4f4f5",
        inputPlaceholder: "#52525b",
        inputFocusBorder: "#a3b18a",
        inputFocusRing: "rgba(163, 177, 138, 0.45)",
        btnPrimaryBg: "#a3b18a",
        btnPrimaryText: "#0d0d0f",
        btnPrimaryHover: "#b4c39c",
        btnSecondaryBg: "#18181b",
        btnSecondaryBorder: "#27272a",
        btnSecondaryText: "#d4d4d8",
        btnSecondaryHover: "#27272a",
        ghostBtnBg: "rgba(24, 24, 27, 0.6)",
        ghostBtnBorder: "#27272a",
        ghostBtnText: "#a1a1aa",
        ghostBtnHover: "#27272a",
        actionRowBg: "#121214",
        actionRowBorder: "#27272a",
        actionRowText: "#d4d4d8",
        actionRowHover: "#1a1a1e",
        statusPillBg: "rgba(34, 197, 94, 0.12)",
        statusPillBorder: "rgba(34, 197, 94, 0.25)",
        statusPillText: "#4ade80",
        badgePillBg: "rgba(163, 177, 138, 0.12)",
        badgePillBorder: "rgba(163, 177, 138, 0.28)",
        badgePillText: "#a3b18a",
        modalBg: "#0f0f11",
        modalBorder: "#27272a",
        modalText: "#a1a1aa",
        modalTitle: "#ffffff",
        modalHeaderBorder: "#27272a",
        footerText: "#52525b",
        footerLink: "#a1a1aa",
      }
    : {
        pageBg: "#f8f9fa",
        panelBg: "#ffffff",
        heroWrapperBg: "#f1f5f9",
        heroWrapperBorder: "#e2e8f0",
        textPrimary: "#0f172a",
        textSecondary: "#475569",
        textMuted: "#64748b",
        cardBg: "#f8fafc",
        cardBorder: "#e2e8f0",
        inputBg: "#ffffff",
        inputBorder: "#cbd5e1",
        inputText: "#0f172a",
        inputPlaceholder: "#94a3b8",
        inputFocusBorder: "#657e4e",
        inputFocusRing: "rgba(101, 126, 78, 0.25)",
        btnPrimaryBg: "#657e4e",
        btnPrimaryText: "#ffffff",
        btnPrimaryHover: "#556b41",
        btnSecondaryBg: "#f1f5f9",
        btnSecondaryBorder: "#cbd5e1",
        btnSecondaryText: "#1e293b",
        btnSecondaryHover: "#e2e8f0",
        ghostBtnBg: "#ffffff",
        ghostBtnBorder: "#e2e8f0",
        ghostBtnText: "#334155",
        ghostBtnHover: "#f1f5f9",
        actionRowBg: "#ffffff",
        actionRowBorder: "#e2e8f0",
        actionRowText: "#1e293b",
        actionRowHover: "#f8fafc",
        statusPillBg: "#f0fdf4",
        statusPillBorder: "#bbf7d0",
        statusPillText: "#15803d",
        badgePillBg: "rgba(101, 126, 78, 0.12)",
        badgePillBorder: "rgba(101, 126, 78, 0.3)",
        badgePillText: "#4d623a",
        modalBg: "#ffffff",
        modalBorder: "#e2e8f0",
        modalText: "#334155",
        modalTitle: "#0f172a",
        modalHeaderBorder: "#e2e8f0",
        footerText: "#64748b",
        footerLink: "#0f172a",
      };

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: ${t.pageBg};
          color: ${t.textPrimary};
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .minimal-input {
          width: 100%;
          box-sizing: border-box;
          background-color: ${t.inputBg};
          border: 1px solid ${t.inputBorder};
          color: ${t.inputText};
          border-radius: 10px;
          padding: 13px 15px;
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .minimal-input::placeholder {
          color: ${t.inputPlaceholder};
        }
        .minimal-input:focus {
          border-color: ${t.inputFocusBorder};
          box-shadow: 0 0 0 2px ${t.inputFocusRing};
        }

        .minimal-btn-primary {
          width: 100%;
          box-sizing: border-box;
          background-color: ${t.btnPrimaryBg};
          color: ${t.btnPrimaryText};
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
          gap: 10px;
          text-decoration: none;
          transition: filter 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          font-family: inherit;
        }
        .minimal-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 6px 20px -2px rgba(101, 126, 78, 0.35);
        }
        .minimal-btn-primary:active:not(:disabled) {
          transform: scale(0.99);
        }
        .minimal-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .minimal-btn-secondary {
          background-color: ${t.btnSecondaryBg};
          border: 1px solid ${t.btnSecondaryBorder};
          color: ${t.btnSecondaryText};
          border-radius: 10px;
          padding: 11px 16px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .minimal-btn-secondary:hover {
          background-color: ${t.btnSecondaryHover};
          color: ${t.textPrimary};
        }
        .minimal-btn-secondary:active {
          transform: scale(0.99);
        }

        .nav-ghost-btn {
          color: ${t.ghostBtnText};
          background-color: ${t.ghostBtnBg};
          border: 1px solid ${t.ghostBtnBorder};
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .nav-ghost-btn:hover {
          color: ${t.textPrimary};
          background-color: ${t.ghostBtnHover};
        }

        .action-link-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background-color: ${t.actionRowBg};
          border: 1px solid ${t.actionRowBorder};
          border-radius: 10px;
          color: ${t.actionRowText};
          font-size: 0.82rem;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          font-family: inherit;
        }
        .action-link-row:hover {
          background-color: ${t.actionRowHover};
          color: ${t.textPrimary};
        }

        .gallery-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
          color: #d4d4d8;
          background-color: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .gallery-pill:hover {
          background-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.35);
        }
        .gallery-pill.active {
          background-color: #a3b18a;
          color: #0d0d0f;
          border-color: #a3b18a;
          font-weight: 600;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: ${isDark ? "rgba(0, 0, 0, 0.82)" : "rgba(15, 23, 42, 0.55)"};
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
          animation: modalFadeIn 0.2s ease-out;
        }
        .modal-card {
          width: 100%;
          max-width: 540px;
          background-color: ${t.modalBg};
          border: 1px solid ${t.modalBorder};
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, ${isDark ? "0.85" : "0.25"});
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 85vh;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
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
            min-height: 100vh;
          }
        }
      `}</style>

      <div
        className="minimal-split-layout"
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          backgroundColor: t.pageBg,
          overflow: "hidden",
          boxSizing: "border-box",
          transition: "background-color 0.3s ease",
        }}
      >
        {/* ═════════════════════════════════════════════════════
            LEFT PANEL: POLICE GALLERY HERO CARD
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
              backgroundColor: t.heroWrapperBg,
              border: `1px solid ${t.heroWrapperBorder}`,
              backgroundImage: `url("${currentHeroPhoto.url}")`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              transition: "background-image 0.5s ease-in-out, border-color 0.3s ease",
              boxShadow: isDark ? "none" : "0 20px 40px -15px rgba(0,0,0,0.12)",
            }}
          >
            {/* Top Bar inside Left Card: Official Seal + Gallery Selector */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 3,
                background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)",
              }}
            >
              {/* Seal + Department branding */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logom.png"
                  alt="City of Los Angeles Police Department Seal"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    LACPD · Terminal
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "#cbd5e1",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Mobile Data Terminal
                  </div>
                </div>
              </div>

              {/* Gallery Photo Switcher Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {HERO_PHOTOS.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`gallery-pill ${selectedPhotoIndex === idx ? "active" : ""}`}
                    title={photo.description}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark gradient overlay towards the bottom for maximum text readability */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)",
              }}
            />

            {/* Overlaid Typography at Bottom Left */}
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
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  fontSize: "0.7rem",
                  color: "#f1f5f9",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                <i className="fa-solid fa-camera" style={{ fontSize: "0.65rem", color: "#a3b18a" }} />
                <span>{currentHeroPhoto.label}</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
                <span style={{ color: "#e2e8f0" }}>{currentHeroPhoto.description}</span>
              </div>

              <h2
                style={{
                  fontSize: "1.85rem",
                  fontWeight: 500,
                  lineHeight: 1.35,
                  margin: "0 0 0.5rem 0",
                  letterSpacing: "-0.015em",
                  color: "#ffffff",
                }}
              >
                To protect and to serve,
                <br />
                one watch at a time.
              </h2>

              <p
                style={{
                  fontSize: "0.98rem",
                  fontWeight: 400,
                  color: "#e2e8f0",
                  margin: "0 0 1.25rem 0",
                  lineHeight: 1.45,
                }}
              >
                Connecting law enforcement personnel across Los Angeles.
              </p>

              <div
                style={{
                  fontSize: "0.76rem",
                  color: "#cbd5e1",
                  letterSpacing: "0.01em",
                }}
              >
                LACPD MDT — Your gateway to operational excellence.
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════
            RIGHT PANEL: ADAPTIVE LIGHT/DARK INTERFACE
           ═════════════════════════════════════════════════ */}
        <div
          className="minimal-form-panel"
          style={{
            flex: "1 1 52%",
            backgroundColor: t.panelBg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 3rem",
            boxSizing: "border-box",
            overflowY: "auto",
            position: "relative",
            transition: "background-color 0.3s ease",
          }}
        >
          {/* Top Bar with System Status & Action Links */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "32px",
              right: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* System Status Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                fontSize: "0.74rem",
                color: t.statusPillText,
                backgroundColor: t.statusPillBg,
                border: `1px solid ${t.statusPillBorder}`,
                padding: "4px 10px",
                borderRadius: "20px",
                letterSpacing: "0.04em",
                fontFamily: "monospace",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  boxShadow: "0 0 10px rgba(34, 197, 94, 0.7)",
                  display: "inline-block",
                }}
              />
              <span>TERMINAL ACTIVE</span>
              <span style={{ opacity: 0.5 }}>|</span>
              <span>v2.4 SSL</span>
            </div>

            {/* Right Quick Navigation Actions & Theme Toggle Switch */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* THEME TOGGLE BUTTON: Default Light -> Click to Dark */}
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="nav-ghost-btn"
                title={isDark ? "Açık Renkli Temaya Geç" : "Karanlık Temaya Geç"}
                style={{
                  backgroundColor: isDark ? "#27272a" : "#f1f5f9",
                  borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                  color: isDark ? "#facc15" : "#475569",
                  fontWeight: 600,
                }}
              >
                <i className={isDark ? "fa-solid fa-sun" : "fa-solid fa-moon"} style={{ fontSize: "0.82rem" }} />
                <span>{isDark ? "Açık Mod" : "Karanlık Mod"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal("help")}
                className="nav-ghost-btn"
                title="MDT Kılavuzu ve Yardım"
              >
                <i className="fa-solid fa-circle-question" style={{ fontSize: "0.75rem" }} />
                <span>Yardım</span>
              </button>

              <a
                href="https://discord.com/invite/laco"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-ghost-btn"
                title="Discord Topluluğu"
              >
                <i className="fa-brands fa-discord" style={{ fontSize: "0.8rem", color: "#5865F2" }} />
                <span>Discord</span>
              </a>

              <Link href="/" className="nav-ghost-btn" title="Ana Sayfaya Dön">
                <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.72rem" }} />
                <span>Ana Sayfa</span>
              </Link>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              display: "flex",
              flexDirection: "column",
              marginTop: "20px",
            }}
          >
            {/* ═════════════════════════════════════════════════
                STEP 1: LOGIN (DISCORD SSO)
               ═════════════════════════════════════════════════ */}
            {step === "login" && (
              <div>
                <div style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: t.badgePillBg,
                      border: `1px solid ${t.badgePillBorder}`,
                      color: t.badgePillText,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <i className="fa-solid fa-shield-halved" style={{ fontSize: "0.7rem" }} />
                    MDT Secure Gateway
                  </div>

                  <h1
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 600,
                      margin: "0 0 0.5rem 0",
                      letterSpacing: "-0.02em",
                      color: t.textPrimary,
                    }}
                  >
                    Sign in to your terminal
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: t.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    Los Angeles Community Police Department resmi personel veri terminaline erişmek için doğrulama yapın.
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
                      color: isDark ? "#fca5a5" : "#dc2626",
                      fontSize: "0.82rem",
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <i className="fa-solid fa-triangle-exclamation" />
                      {loginError.title}
                    </div>
                    <div style={{ color: t.textSecondary }}>{loginError.description}</div>
                    {loginError.detail && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontFamily: "monospace",
                          fontSize: "0.74rem",
                          color: t.textMuted,
                          backgroundColor: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0,0,0,0.05)",
                          padding: "4px 8px",
                          borderRadius: "4px",
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.82rem",
                        color: t.textSecondary,
                        marginBottom: "7px",
                        fontWeight: 500,
                      }}
                    >
                      <span>Kimlik Doğrulama Sağlayıcısı</span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: isDark ? "#a3b18a" : "#4d623a",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: 600,
                        }}
                      >
                        <i className="fa-solid fa-circle-check" />
                        Güvenli
                      </span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        readOnly
                        value="Kurumsal Discord SSO (OAuth2)"
                        className="minimal-input"
                        style={{
                          color: t.inputText,
                          cursor: "default",
                          backgroundColor: isDark ? "#0d0d0f" : "#f8fafc",
                          paddingLeft: "40px",
                        }}
                      />
                      <i
                        className="fa-brands fa-discord"
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#5865F2",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                  </div>

                  <a href="/api/auth/discord/login" className="minimal-btn-primary">
                    <i className="fa-brands fa-discord" style={{ fontSize: "1.1rem" }} />
                    Discord ile Giriş Yap
                  </a>

                  {/* Secondary Quick Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setStep("pending")}
                      className="action-link-row"
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-id-card-clip" style={{ color: isDark ? "#a3b18a" : "#657e4e", fontSize: "0.85rem" }} />
                        <span>Onay bekleyen personel dosyam var</span>
                      </span>
                      <i className="fa-solid fa-chevron-right" style={{ color: t.textMuted, fontSize: "0.75rem" }} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModal("help")}
                      className="action-link-row"
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-book-bookmark" style={{ color: t.textSecondary, fontSize: "0.85rem" }} />
                        <span>MDT Kullanım & Yetki Alma Kılavuzu</span>
                      </span>
                      <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: t.textMuted, fontSize: "0.72rem" }} />
                    </button>

                    <Link href="/iletisim" className="action-link-row">
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-headset" style={{ color: t.textSecondary, fontSize: "0.85rem" }} />
                        <span>Departman İletişimi & Yüksek Komuta</span>
                      </span>
                      <i className="fa-solid fa-chevron-right" style={{ color: t.textMuted, fontSize: "0.75rem" }} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════
                STEP 2: REGISTER (OFFICER DOSSIER FORM)
               ═════════════════════════════════════════════════ */}
            {step === "register" && (
              <div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: t.badgePillBg,
                      border: `1px solid ${t.badgePillBorder}`,
                      color: t.badgePillText,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <i className="fa-solid fa-user-plus" style={{ fontSize: "0.7rem" }} />
                    Personel Sicil Tanımlama
                  </div>

                  <h1
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 600,
                      margin: "0 0 0.5rem 0",
                      letterSpacing: "-0.02em",
                      color: t.textPrimary,
                    }}
                  >
                    Create your account
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: t.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    Doğrulanan Discord kimliğinize ait resmi memur sicil ve rozet bilgilerinizi tanımlayın.
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
                      color: isDark ? "#fca5a5" : "#dc2626",
                      fontSize: "0.82rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="fa-solid fa-circle-exclamation" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Connected Account Bar */}
                <div
                  style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: "10px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.25rem",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: t.textPrimary }}>
                    {discordProfile.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={discordProfile.avatarUrl}
                        alt="Discord Avatar"
                        style={{ width: 24, height: 24, borderRadius: "50%" }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: isDark ? "#a3b18a" : "#657e4e",
                          display: "inline-block",
                        }}
                      />
                    )}
                    <span style={{ fontWeight: 600 }}>{discordProfile.displayName || "Discord Kullanıcısı"}</span>
                    {discordProfile.username && (
                      <span style={{ color: t.textMuted }}>@{discordProfile.username}</span>
                    )}
                  </div>
                  <a
                    href="/api/auth/discord/login"
                    style={{
                      color: isDark ? "#a3b18a" : "#657e4e",
                      fontSize: "0.75rem",
                      textDecoration: "none",
                      fontWeight: 600,
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
                        color: t.textSecondary,
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
                        color: t.textSecondary,
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
                      placeholder="Örn: 1222"
                      className="minimal-input"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.82rem",
                          color: t.textSecondary,
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
                          <option key={r} value={r} style={{ backgroundColor: t.cardBg, color: t.textPrimary }}>
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
                          color: t.textSecondary,
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
                          <option key={d} value={d} style={{ backgroundColor: t.cardBg, color: t.textPrimary }}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "0.74rem",
                      color: t.textMuted,
                      lineHeight: 1.45,
                      marginTop: "2px",
                    }}
                  >
                    Sicil bilgileriniz veritabanına işlenecek ve Yüksek Komuta onayının ardından terminal erişimi sağlanacaktır.
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="minimal-btn-primary"
                      style={{ flex: 1 }}
                    >
                      {submitting ? (
                        <>
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              border: "2px solid currentColor",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "spin 0.6s linear infinite",
                            }}
                          />
                          Oluşturuluyor...
                        </>
                      ) : (
                        "Create account"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("login")}
                      className="minimal-btn-secondary"
                      style={{ padding: "13px 18px" }}
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ═════════════════════════════════════════════════
                STEP 3: PENDING APPROVAL
               ═════════════════════════════════════════════════ */}
            {step === "pending" && (
              <div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(234, 179, 8, 0.12)",
                      border: "1px solid rgba(234, 179, 8, 0.28)",
                      color: isDark ? "#facc15" : "#b45309",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: "0.7rem" }} />
                    İnceleme Aşamasında
                  </div>

                  <h1
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 600,
                      margin: "0 0 0.5rem 0",
                      letterSpacing: "-0.02em",
                      color: t.textPrimary,
                    }}
                  >
                    Account under review
                  </h1>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: t.textSecondary,
                      lineHeight: 1.5,
                    }}
                  >
                    Personel sicil dosyanız sisteme kaydedildi. Yüksek Komuta onayının ardından doğrudan terminale erişebilirsiniz.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: "12px",
                    padding: "16px 18px",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.75rem", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      DOSYA DURUMU
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: isDark ? "#a3b18a" : "#4d623a",
                        backgroundColor: t.badgePillBg,
                        border: `1px solid ${t.badgePillBorder}`,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: 600,
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
                          backgroundColor: isDark ? "#a3b18a" : "#657e4e",
                          display: "inline-block",
                        }}
                      />
                      ONAY BEKLİYOR
                    </span>
                  </div>

                  <div style={{ fontSize: "1.05rem", fontWeight: 600, color: t.textPrimary, marginBottom: "4px" }}>
                    {icName || discordProfile.displayName || "Kayıtlı Memur"}{" "}
                    {badge && <span style={{ color: isDark ? "#a3b18a" : "#657e4e" }}>#{badge}</span>}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: t.textSecondary }}>
                    {rank} — {department}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <a href="/api/auth/discord/login" className="minimal-btn-primary">
                    <i className="fa-solid fa-arrows-rotate" />
                    Onay Durumunu Kontrol Et
                  </a>

                  <a
                    href="https://discord.com/invite/laco"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="minimal-btn-secondary"
                  >
                    <i className="fa-brands fa-discord" style={{ color: "#5865F2" }} />
                    Yüksek Komutaya Bildir (Discord)
                  </a>

                  <button
                    onClick={() => {
                      setStep("login");
                      router.replace("/giris");
                    }}
                    className="minimal-btn-secondary"
                  >
                    <i className="fa-solid fa-arrow-left" />
                    Girişe Dön
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Footer Note */}
            <div
              style={{
                marginTop: "2.5rem",
                textAlign: "center",
                fontSize: "0.74rem",
                color: t.footerText,
                lineHeight: 1.5,
              }}
            >
              By accessing this terminal, you agree to our{" "}
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: t.footerLink,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: 500,
                }}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: t.footerLink,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  fontWeight: 500,
                }}
              >
                Privacy Policy
              </button>
              .
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════
          MODAL: TERMS OF SERVICE (KULLANIM KOŞULLARI)
         ═════════════════════════════════════════════════════ */}
      {activeModal === "terms" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${t.modalHeaderBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fa-solid fa-scale-balanced" style={{ color: isDark ? "#a3b18a" : "#657e4e", fontSize: "1.1rem" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: t.modalTitle }}>
                  MDT Terminal Kullanım Koşulları
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", fontSize: "0.85rem", color: t.modalText, lineHeight: 1.6 }}>
              <p style={{ marginTop: 0 }}>
                Bu terminal, yalnızca Los Angeles Community Police Department (LACPD) bünyesinde aktif görev yapan yetkili
                personel için tahsis edilmiş bir kolluk kuvveti bilgi sistemidir.
              </p>
              <h4 style={{ color: t.textPrimary, fontSize: "0.92rem", margin: "14px 0 6px" }}>1. Yetkisiz Erişim ve Güvenlik</h4>
              <p>
                Terminal üzerindeki tüm oturum açma girişimleri, yapılan sorgular, sicil aramaları ve girilen raporlar CJIS
                standartlarına uygun olarak tarih, IP ve kullanıcı kimliğiyle kayıt altına alınmaktadır.
              </p>
              <h4 style={{ color: t.textPrimary, fontSize: "0.92rem", margin: "14px 0 6px" }}>2. Bilgi Gizliliği ve Paylaşım Yasağı</h4>
              <p>
                MDT sistemi içerisindeki şahıs kayıtları, ceza puanları, araç sorguları ve taktik planlar gizlilik derecelidir.
                Üçüncü şahıslara veya departman dışına sızdırılması durumunda derhal ihraç ve adli soruşturma uygulanır.
              </p>
              <h4 style={{ color: t.textPrimary, fontSize: "0.92rem", margin: "14px 0 6px" }}>3. Yüksek Komuta Denetimi</h4>
              <p>
                Yüksek Komuta kademesi, gerektiğinde herhangi bir personelin terminal yetkilerini askıya alma, raporlarını
                denetleme ve mesai saatlerini teftiş etme hakkını saklı tutar.
              </p>
            </div>
            <div
              style={{
                padding: "14px 24px",
                borderTop: `1px solid ${t.modalHeaderBorder}`,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="minimal-btn-primary"
                style={{ width: "auto", padding: "9px 20px", fontSize: "0.85rem" }}
              >
                Anladım ve Kabul Ediyorum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          MODAL: PRIVACY POLICY (GİZLİLİK POLİTİKASI)
         ═════════════════════════════════════════════════════ */}
      {activeModal === "privacy" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${t.modalHeaderBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fa-solid fa-user-shield" style={{ color: isDark ? "#a3b18a" : "#657e4e", fontSize: "1.1rem" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: t.modalTitle }}>
                  MDT Veri Gizliliği Politikası
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", fontSize: "0.85rem", color: t.modalText, lineHeight: 1.6 }}>
              <p style={{ marginTop: 0 }}>
                Los Angeles Community (LACPD), personelinin ve terminal verilerinin mahremiyetine en üst düzeyde önem verir.
              </p>
              <h4 style={{ color: t.textPrimary, fontSize: "0.92rem", margin: "14px 0 6px" }}>Toplanan Veriler</h4>
              <p>
                Discord OAuth2 doğrulaması sırasında yalnızca Discord ID, global kullanıcı adı ve profil avatarı alınır.
                Şifre veya özel mesajlarınız kesinlikle sisteme aktarılmaz.
              </p>
              <h4 style={{ color: t.textPrimary, fontSize: "0.92rem", margin: "14px 0 6px" }}>Kullanım Amacı</h4>
              <p>
                Toplanan sicil ve devriye kayıtları yalnızca rol içi asayiş yönetimi, raporlama ve rütbe terfi süreçlerinde
                departman içi denetim için kullanılır. Reklam veya ticari amaçlarla asla paylaşılamaz.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href="/gizlilik"
                  target="_blank"
                  style={{ color: isDark ? "#a3b18a" : "#657e4e", textDecoration: "underline", fontSize: "0.82rem", fontWeight: 500 }}
                >
                  Genel Departman Gizlilik Politikasını Görüntüle →
                </Link>
              </div>
            </div>
            <div
              style={{
                padding: "14px 24px",
                borderTop: `1px solid ${t.modalHeaderBorder}`,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="minimal-btn-primary"
                style={{ width: "auto", padding: "9px 20px", fontSize: "0.85rem" }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════
          MODAL: HELP & GUIDE (MDT KILAVUZU & YARDIM)
         ═════════════════════════════════════════════════ */}
      {activeModal === "help" && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${t.modalHeaderBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fa-solid fa-circle-question" style={{ color: isDark ? "#a3b18a" : "#657e4e", fontSize: "1.1rem" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: t.modalTitle }}>
                  MDT Erişim & Kayıt Kılavuzu
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: t.textMuted,
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px 24px", overflowY: "auto", fontSize: "0.85rem", color: t.modalText, lineHeight: 1.6 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: isDark ? "rgba(163, 177, 138, 0.2)" : "rgba(101, 126, 78, 0.15)",
                      color: isDark ? "#a3b18a" : "#657e4e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <strong style={{ color: t.textPrimary }}>Discord Yetkilendirmesi</strong>
                    <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                      &quot;Discord ile Giriş Yap&quot; butonuna basarak resmi topluluk sunucumuzdaki hesabınızı doğrulayın.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: isDark ? "rgba(163, 177, 138, 0.2)" : "rgba(101, 126, 78, 0.15)",
                      color: isDark ? "#a3b18a" : "#657e4e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <strong style={{ color: t.textPrimary }}>Personel Sicil Tanımlama</strong>
                    <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                      İlk girişinizde IC İsim Soyisim, Rozet Numarası, Rütbe ve Departman bilgilerinizi sisteme kaydedin.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      backgroundColor: isDark ? "rgba(163, 177, 138, 0.2)" : "rgba(101, 126, 78, 0.15)",
                      color: isDark ? "#a3b18a" : "#657e4e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <strong style={{ color: t.textPrimary }}>Yüksek Komuta Onayı</strong>
                    <div style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                      Başvurunuz Yüksek Komuta paneline düşer. İnceleme onaylandığında terminale tam erişim sağlarsınız.
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                <div style={{ color: t.textPrimary, fontWeight: 600, marginBottom: "4px" }}>
                  Acil Destek Gerekiyor mu?
                </div>
                <div style={{ fontSize: "0.78rem", color: t.textSecondary }}>
                  Discord sunucumuzdaki <code>#ticket-destek</code> kanalından Yüksek Komuta yetkililerine ulaşabilirsiniz.
                </div>
              </div>
            </div>
            <div
              style={{
                padding: "14px 24px",
                borderTop: `1px solid ${t.modalHeaderBorder}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <a
                href="https://discord.com/invite/laco"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#5865F2",
                  fontSize: "0.82rem",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <i className="fa-brands fa-discord" />
                Discord Topluluğu
              </a>

              <button
                onClick={() => setActiveModal(null)}
                className="minimal-btn-primary"
                style={{ width: "auto", padding: "9px 20px", fontSize: "0.85rem" }}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
