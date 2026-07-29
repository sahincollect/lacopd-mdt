"use client";

import Link from "next/link";

const applicationTypes = [
  {
    id: "memur",
    href: "https://discord.com/invite/laco",
    title: "Memur Başvurusu",
    subtitle: "LAPD Officer Application",
    description:
      "Los Angeles Polis Departmanı'na katılmak isteyen adaylar için resmi başvuru formu. Tüm gereksinimler ve değerlendirme süreci bu form üzerinden yürütülür.",
    icon: "fa-shield-halved",
    color: "var(--lapd-blue-dark)",
    bg: "var(--lapd-blue-dark)",
    hoverBg: "var(--lapd-blue)",
    requirements: ["18 yaş ve üzeri", "Discord hesabı", "Sunucuda kayıtlı olmak"],
    badge: "Açık",
    badgeColor: "#10B981",
  },
  {
    id: "ride-along",
    href: "/basvurular/ride-along",
    title: "Ride Along Başvurusu",
    subtitle: "Civilian Ride-Along Program",
    description:
      "Aktif devriye araçlarına refakat etmek isteyen sivil vatandaşlar için Ride Along programı başvurusu. Memurlarla birlikte saha deneyimi kazanın.",
    icon: "fa-car-side",
    color: "var(--lapd-text-dark)",
    bg: "var(--bg-tertiary)",
    hoverBg: "var(--lapd-border)",
    requirements: ["Sivil karakter", "Temiz sabıka", "Ön bilgilendirme tamamlandı"],
    badge: "Açık",
    badgeColor: "#10B981",
  },
  {
    id: "sikayet",
    href: "/basvurular/sikayet",
    title: "Memur Şikayet",
    subtitle: "Officer Complaint Form",
    description:
      "Bir LAPD görevlisiyle ilgili şikayetinizi iletebileceğiniz resmi şikayet formu. Tüm başvurular İç İşler Bürosu tarafından titizlikle incelenir.",
    icon: "fa-triangle-exclamation",
    color: "var(--lapd-orange)",
    bg: "var(--lapd-orange)",
    hoverBg: "var(--lapd-orange-hover)",
    requirements: ["Olay tarihi ve yeri", "Şikayet konusu", "İletişim bilgisi"],
    badge: "Her Zaman",
    badgeColor: "var(--lapd-orange)",
  },
];

export default function BasvurularPage() {
  return (
    <div
      style={{
        backgroundColor: "var(--lapd-bg)",
        minHeight: "100vh",
        color: "var(--lapd-text-dark)",
        fontFamily: "var(--font-inter)",
        overflowX: "hidden",
        paddingBottom: "5rem"
      }}
    >
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Başvurular</span>
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          padding: "6rem 2rem 4rem",
          textAlign: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--lapd-border)",
              borderRadius: "4px",
              padding: "0.4rem 1.25rem",
              marginBottom: "2rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--lapd-blue-dark)", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Başvuru Sistemi Aktif
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              color: "var(--lapd-blue-dark)",
              margin: "0 0 1.5rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              textTransform: "uppercase",
            }}
          >
            LAPD{" "}
            <span style={{ color: "var(--lapd-orange)" }}>
              BAŞVURULAR
            </span>
          </h1>
          <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
          <p
            style={{
              color: "var(--lapd-text-dark)",
              fontSize: "1.1rem",
              maxWidth: "600px",
              margin: "0 auto 4rem",
              lineHeight: 1.7,
            }}
          >
            Los Angeles Polis Departmanı'na başvurmak veya resmi bir işlem başlatmak için
            aşağıdaki formlardan uygun olanı seçin.
          </p>
        </div>

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
            <div
              key={app.id}
             
             
             
              style={{
                position: "relative",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--lapd-border)",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                cursor: "default"
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.08)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.03)'; }}
            >
              {/* Top border line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", backgroundColor: app.color }} />

              <div style={{ padding: "2.5rem" }}>
                {/* Badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px solid var(--lapd-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className={`fa-solid ${app.icon}`} style={{ fontSize: "1.5rem", color: app.color }} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: app.badgeColor,
                      backgroundColor: 'var(--bg-secondary)',
                      border: `1px solid ${app.badgeColor}`,
                      padding: "0.3rem 0.8rem",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {app.badge}
                  </span>
                </div>

                <div style={{ fontSize: "0.75rem", color: "var(--lapd-text-muted)", letterSpacing: "0.1em", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  {app.subtitle}
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--lapd-blue-dark)", margin: "0 0 1rem", letterSpacing: "-0.01em" }}>{app.title}</h2>
                <p style={{ fontSize: "0.95rem", color: "var(--lapd-text-dark)", lineHeight: 1.6, margin: "0 0 2rem" }}>{app.description}</p>

                {/* Requirements */}
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--lapd-blue-dark)", letterSpacing: "0.05em", fontWeight: 800, textTransform: "uppercase", marginBottom: "1rem", borderBottom: "1px solid var(--lapd-border)", paddingBottom: "0.5rem" }}>
                    Gereksinimler
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {app.requirements.map((req, ri) => (
                      <li key={ri} style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.9rem", color: "var(--lapd-text-dark)", fontWeight: 500 }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className="fa-solid fa-check" style={{ color: app.color, fontSize: "0.7rem" }} />
                        </div>
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
                    backgroundColor: app.bg,
                    border: 'none',
                    color: app.bg === 'var(--bg-tertiary)' ? 'var(--lapd-text-dark)' : 'white',
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    transition: "background-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = app.hoverBg}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = app.bg}
                >
                  {app.id === "memur" ? "DISCORD'A GİT" : "BAŞVURUYA GİT"} <i className={app.id === "memur" ? "fa-brands fa-discord" : "fa-solid fa-arrow-right"} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
