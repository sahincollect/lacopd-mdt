"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const applicationTypes = [
  {
    id: "memur",
    href: "https://discord.gg/thelapd",
    title: "Memur Başvurusu",
    subtitle: "LAC Officer Application",
    description:
      "Los Angeles Polis Departmanı'na katılmak isteyen adaylar için resmi başvuru formu. Tüm gereksinimler ve değerlendirme süreci bu form üzerinden yürütülür.",
    icon: "fa-shield-halved",
    color: "#0EA5E9",
    glow: "rgba(14, 165, 233, 0.4)",
    requirements: ["18 yaş ve üzeri", "Discord hesabı", "Sunucuda kayıtlı olmak"],
    badge: "Açık",
    badgeColor: "#10b981",
  },
  {
    id: "ride-along",
    href: "/basvurular/ride-along",
    title: "Ride Along Başvurusu",
    subtitle: "Civilian Ride-Along Program",
    description:
      "Aktif devriye araçlarına refakat etmek isteyen sivil vatandaşlar için Ride Along programı başvurusu. Memurlarla birlikte saha deneyimi kazanın.",
    icon: "fa-car-side",
    color: "#8B5CF6",
    glow: "rgba(139, 92, 246, 0.4)",
    requirements: ["Sivil karakter", "Temiz sabıka", "Ön bilgilendirme tamamlandı"],
    badge: "Açık",
    badgeColor: "#10b981",
  },
  {
    id: "sikayet",
    href: "/basvurular/sikayet",
    title: "Memur Şikayet",
    subtitle: "Officer Complaint Form",
    description:
      "Bir LAC görevlisiyle ilgili şikayetinizi iletebileceğiniz resmi şikayet formu. Tüm başvurular İç İşler Bürosu tarafından titizlikle incelenir.",
    icon: "fa-triangle-exclamation",
    color: "#F59E0B",
    glow: "rgba(245, 158, 11, 0.4)",
    requirements: ["Olay tarihi ve yeri", "Şikayet konusu", "İletişim bilgisi"],
    badge: "Her Zaman",
    badgeColor: "#F59E0B",
  },
];

export default function BasvurularPage() {
  return (
    <div
      style={{
        backgroundColor: "#040914",
        minHeight: "100vh",
        color: "#f1f5f9",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes pulse-glow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes scan-line { 0% { top: 0%; } 100% { top: 100%; } }
        .card-hover { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .card-hover:hover { transform: translateY(-8px); }
      `}</style>

      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(14,165,233,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 40%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header / Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 5%",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          backgroundColor: "rgba(4, 9, 20, 0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
          <img src="/lapd-logo.png" alt="LAC" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid rgba(14,165,233,0.4)" }} />
          <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.05em" }}>LAC</span>
        </Link>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#94a3b8",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 500,
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.06)",
            transition: "all 0.2s",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }}></i>
          Ana Sayfa
        </Link>
      </nav>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: "10rem",
          paddingBottom: "5rem",
          textAlign: "center",
          padding: "10rem 5% 5rem",
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              backgroundColor: "rgba(14,165,233,0.08)",
              border: "1px solid rgba(14,165,233,0.2)",
              borderRadius: "50px",
              padding: "0.4rem 1.25rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981", animation: "pulse-glow 2s infinite" }} />
            <span style={{ fontSize: "0.8rem", color: "#7dd3fc", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Başvuru Sistemi Aktif
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 1.5rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              textTransform: "uppercase",
            }}
          >
            LAC{" "}
            <span style={{ color: "#0EA5E9", textShadow: "0 0 40px rgba(14,165,233,0.5)" }}>
              Başvurular
            </span>
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "1.15rem",
              maxWidth: "600px",
              margin: "0 auto 4rem",
              lineHeight: 1.7,
            }}
          >
            Los Angeles Polis Departmanı&apos;na başvurmak veya resmi bir işlem başlatmak için
            aşağıdaki formlardan uygun olanı seçin.
          </p>
        </motion.div>

        {/* Application Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            maxWidth: "1100px",
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          {applicationTypes.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="card-hover"
              style={{
                position: "relative",
                backgroundColor: "rgba(10, 16, 35, 0.8)",
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: "24px",
                overflow: "hidden",
                backdropFilter: "blur(16px)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
              }}
            >
              {/* Top glow line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${app.color}, transparent)`, opacity: 0.7 }} />

              <div style={{ padding: "2.5rem" }}>
                {/* Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      backgroundColor: `${app.color}15`,
                      border: `1px solid ${app.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 20px ${app.glow}`,
                    }}
                  >
                    <i className={`fa-solid ${app.icon}`} style={{ fontSize: "1.5rem", color: app.color }} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: app.badgeColor,
                      backgroundColor: `${app.badgeColor}15`,
                      border: `1px solid ${app.badgeColor}30`,
                      padding: "0.3rem 0.8rem",
                      borderRadius: "50px",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {app.badge}
                  </span>
                </div>

                <div style={{ fontSize: "0.7rem", color: app.color, letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  {app.subtitle}
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: "0 0 1rem", letterSpacing: "-0.01em" }}>{app.title}</h2>
                <p style={{ fontSize: "0.9rem", color: "#94a3b8", lineHeight: 1.7, margin: "0 0 2rem" }}>{app.description}</p>

                {/* Requirements */}
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "#64748b", letterSpacing: "0.1em", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    Gereksinimler
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {app.requirements.map((req, ri) => (
                      <li key={ri} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
                        <i className="fa-solid fa-check" style={{ color: app.color, fontSize: "0.7rem", flexShrink: 0 }} />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={app.href}
                  target={app.id === "memur" ? "_blank" : undefined}
                  rel={app.id === "memur" ? "noopener noreferrer" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "14px",
                    backgroundColor: `${app.color}15`,
                    border: `1px solid ${app.color}30`,
                    color: app.color,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    letterSpacing: "0.05em",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = app.color;
                    e.currentTarget.style.color = "#040914";
                    e.currentTarget.style.boxShadow = `0 0 25px ${app.glow}`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = `${app.color}15`;
                    e.currentTarget.style.color = app.color;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {app.id === "memur" ? "DISCORD'A GİT" : "BAŞVURUYA GİT"} <i className={app.id === "memur" ? "fa-brands fa-discord" : "fa-solid fa-arrow-right"} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          padding: "3rem 5%",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          textAlign: "center",
          color: "#334155",
          fontSize: "0.8rem",
        }}
      >
        <p>© {new Date().getFullYear()} Los Angeles Community — FiveM Roleplay | Tüm başvurular kayıt altına alınmaktadır.</p>
      </footer>
    </div>
  );
}
