"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import ThemeToggle from "@/components/ThemeToggle";

const SIDEBAR_W = 265;
const SIDEBAR_COLLAPSED = 68;

const NAV_SECTIONS = [
  {
    label: "OPERASYON MERKEZİ",
    items: [
      { label: "Ana Panel", path: "/mdt", icon: "fa-gauge-high" },
      { label: "Rapor & Belge Portalı", path: "/mdt/raporlar", icon: "fa-file-lines" },
      { label: "Mesai & Devriye", path: "/mdt/mesai", icon: "fa-clock" },
      { label: "Personel Veritabanı", path: "/mdt/personel", icon: "fa-users" },
      { label: "Kriminal Sicil Kayıtları", path: "/mdt/kriminal", icon: "fa-fingerprint" },
    ],
  },
  {
    label: "DEPARTMAN BİRİMLERİ",
    items: [
      { label: "Birim Başvuruları", path: "/mdt/basvuru", icon: "fa-id-badge" },
      { label: "Resmi Duyurular", path: "/mdt/duyurular", icon: "fa-bullhorn" },
      { label: "İç Haberleşme (E-Posta)", path: "/mdt/mesajlar", icon: "fa-envelope", hasUnread: true },
      { label: "Mazeret & İzin Talepleri", path: "/mdt/mazeretler", icon: "fa-calendar-xmark" },
      { label: "Departman Yönetmelikleri", path: "/mdt/yonetmelikler", icon: "fa-scale-balanced" },
    ],
  },
];

export default function MDTLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnread] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: authData } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    if (authData?.user) setUser(authData.user);
    else if (authData && !authData.user) setUser(null);
  }, [authData]);

  useEffect(() => {
    const check = () => {
      const last = localStorage.getItem("lastGlobalView") || "0";
      fetch(`/api/messages/unread?lastGlobalView=${last}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.count !== undefined) setUnread(d.count);
        })
        .catch(() => {});
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    window.location.href = "/giris";
  };

  const allSections = [...NAV_SECTIONS];
  if (user?.role === "admin") {
    allSections.push({
      label: "YÜKSEK KOMUTA",
      items: [{ label: "Yüksek Komuta Paneli", path: "/mdt/komuta-1222", icon: "fa-shield-halved" }],
    });
  }

  const allNavItems = allSections.flatMap((s) => s.items);
  const currentLabel = allNavItems.find((i) => i.path === pathname)?.label ?? "Ana Panel";

  const filteredSearchItems =
    quickSearch.trim().length > 1
      ? allNavItems.filter((i) => i.label.toLowerCase().includes(quickSearch.toLowerCase()))
      : [];

  const sideW = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_W;

  return (
    <div
      className="mdt-zone"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--LAC-bg)",
        color: "var(--LAC-text-dark)",
        fontFamily: "var(--font-inter), 'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ── TOP OFFICIAL LAPD BANNER (Matches Navigation.tsx) ── */}
      <div
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderBottom: "1px solid var(--border-light)",
          padding: "0.4rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.73rem",
          color: "var(--text-primary)",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <strong style={{ fontWeight: 800, color: "var(--LAC-orange)" }}>RESMİ EMNİYET AĞI:</strong>{" "}
          Los Angeles Community Police Department — Mobil Veri Terminali (MDT)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {user && (
            <span style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
              Aktif Oturum: <strong style={{ color: "var(--text-primary)" }}>{user.name} (#{user.badge})</strong> · {user.rank}
            </span>
          )}
          <Link
            href="/"
            style={{
              color: "var(--accent-secondary)",
              textDecoration: "none",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            — Resmi Web Sitesine Dön
          </Link>
        </div>
      </div>

      {/* ── MAIN CORPORATE HEADER (Matches Navigation.tsx 80px header) ── */}
      <header
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--LAC-border)",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "80px",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          zIndex: 60,
          gap: "1.5rem",
        }}
      >
        {/* Left: Official Seal & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <Link href="/mdt" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "1.1rem" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid var(--border-strong)",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
                flexShrink: 0,
              }}
            >
              <img
                src="/logom.png"
                alt="LAC Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: "var(--accent-primary)" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 900,
                  color: "var(--accent-primary)",
                  letterSpacing: "0.03em",
                  fontFamily: "'Oswald', sans-serif",
                  lineHeight: 1,
                }}
              >
                LOS ANGELES C.P.D.
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginTop: "0.25rem",
                }}
              >
                MOBİL VERİ TERMİNALİ · {currentLabel.toUpperCase()}
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Corporate Search Box (Same as Main Page) */}
        <div style={{ flex: 1, maxWidth: "420px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.55rem 1rem",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-light)",
              borderRadius: "2px",
            }}
          >
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ color: "var(--accent-secondary)", fontSize: "0.95rem", marginRight: "10px" }}
            />
            <input
              type="text"
              placeholder="MDT modülü ara... (Örn: Rapor, Kriminal, Mesai)"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                backgroundColor: "transparent",
                fontFamily: "var(--font-inter)",
              }}
            />
          </div>

          {filteredSearchItems.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderTop: "3px solid var(--LAC-orange)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                zIndex: 200,
              }}
            >
              {filteredSearchItems.map((res) => (
                <Link
                  key={res.path}
                  href={res.path}
                  onClick={() => setQuickSearch("")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    padding: "0.75rem 1rem",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--border-light)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <i className={`fa-solid ${res.icon}`} style={{ color: "var(--LAC-orange)", width: 16 }} />
                  {res.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions (ThemeToggle, Messages, Duty Status, Officer Profile) */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ThemeToggle />

          {/* Internal Mail / Notification Button */}
          <Link
            href="/mdt/mesajlar"
            title="İç Haberleşme"
            style={{
              position: "relative",
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              padding: "0.55rem 0.8rem",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              textDecoration: "none",
              fontSize: "0.78rem",
              fontWeight: 700,
            }}
          >
            <i className="fa-solid fa-envelope" style={{ color: "var(--LAC-orange)" }} />
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: "var(--LAC-orange)",
                  color: "#FFFFFF",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: "2px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Duty Status Badge */}
          {user && (
            <Link
              href="/mdt/mesai"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.55rem 0.95rem",
                borderRadius: "2px",
                backgroundColor: user.isOnDuty ? "var(--color-success-bg)" : "var(--bg-tertiary)",
                border: `1px solid ${user.isOnDuty ? "var(--color-success-border)" : "var(--border-light)"}`,
                color: user.isOnDuty ? "var(--color-success)" : "var(--text-secondary)",
                fontSize: "0.75rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: user.isOnDuty ? "var(--color-success)" : "var(--text-muted)",
                }}
              />
              {user.isOnDuty ? "GÖREVDE (10-8)" : "GÖREV DIŞI (10-7)"}
            </Link>
          )}

          {/* Officer Profile Button & Corporate Dropdown */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                backgroundColor: "var(--LAC-orange)",
                color: "#FFFFFF",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "2px",
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", border: "1px solid #fff" }}
                />
              ) : (
                <i className="fa-solid fa-user-shield" />
              )}
              <span>{user ? `#${user.badge} ${user.name.split(" ")[0]}` : "PERSONEL"}</span>
              <i className="fa-solid fa-caret-down" style={{ fontSize: "0.7rem" }} />
            </button>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "260px",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--LAC-border)",
                  borderTop: "3px solid var(--LAC-orange)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  zIndex: 200,
                }}
              >
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-tertiary)",
                  }}
                >
                  <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {user?.name ?? "Memur"}
                  </div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--LAC-orange)", marginTop: "2px" }}>
                    Rozet #{user?.badge ?? "—"} · {user?.rank ?? "—"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {user?.department ?? "Patrol Division"}
                  </div>
                </div>

                <Link
                  href="/mdt/profil"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.85rem 1.25rem",
                    color: "var(--LAC-text-dark)",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <i className="fa-solid fa-id-card" style={{ color: "var(--LAC-orange)", width: 16 }} />
                  Personel Dosyam & Profil
                </Link>

                {user?.role === "admin" && (
                  <Link
                    href="/mdt/komuta-1222"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.85rem 1.25rem",
                      color: "var(--LAC-text-dark)",
                      textDecoration: "none",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--border-light)",
                    }}
                  >
                    <i className="fa-solid fa-shield-halved" style={{ color: "var(--LAC-orange)", width: 16 }} />
                    Yüksek Komuta Paneli
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.85rem 1.25rem",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "var(--color-danger)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket" style={{ width: 16 }} />
                  Güvenli Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY: LEFT CORPORATE SIDEBAR + MAIN CONTENT ── */}
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 112px)" }}>
        <aside
          style={{
            width: sideW,
            minWidth: sideW,
            backgroundColor: "var(--bg-secondary)",
            borderRight: "1px solid var(--LAC-border)",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.2s ease",
            flexShrink: 0,
          }}
        >
          <nav style={{ flex: 1, padding: "1.25rem 0.75rem" }}>
            {allSections.map((section) => (
              <div key={section.label} style={{ marginBottom: "1.5rem" }}>
                {!collapsed && (
                  <div
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: "var(--LAC-orange)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0 0.5rem 0.4rem",
                      marginBottom: "0.5rem",
                      borderBottom: "2px solid var(--LAC-orange)",
                    }}
                  >
                    {section.label}
                  </div>
                )}

                {section.items.map((item: any) => {
                  const isActive = pathname === item.path;
                  const hasUnread = item.hasUnread && unreadCount > 0;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: collapsed ? 0 : "0.75rem",
                        justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? "0.75rem 0" : "0.7rem 0.85rem",
                        marginBottom: "0.2rem",
                        borderRadius: "2px",
                        textDecoration: "none",
                        backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                        borderLeft: isActive ? "3px solid var(--LAC-orange)" : "3px solid transparent",
                        color: isActive ? "var(--LAC-orange)" : "var(--text-primary)",
                        fontWeight: isActive ? 800 : 600,
                        fontSize: "0.82rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                        transition: "background-color 0.15s, color 0.15s",
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                          e.currentTarget.style.color = "var(--LAC-orange)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--text-primary)";
                        }
                      }}
                    >
                      <i
                        className={`fa-solid ${item.icon}`}
                        style={{
                          fontSize: "0.95rem",
                          width: 20,
                          textAlign: "center",
                          color: isActive ? "var(--LAC-orange)" : "var(--accent-primary)",
                          flexShrink: 0,
                        }}
                      />
                      {!collapsed && (
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.label}
                        </span>
                      )}
                      {hasUnread && !collapsed && (
                        <span
                          style={{
                            backgroundColor: "var(--LAC-orange)",
                            color: "#FFFFFF",
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            padding: "1px 6px",
                            borderRadius: "2px",
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Collapse Sidebar Footer */}
          <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                padding: "0.6rem 0.85rem",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                borderRadius: "2px",
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              {!collapsed && <span>MENÜYÜ DARALT</span>}
              <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`} />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            padding: "2rem 2.5rem",
            backgroundColor: "var(--LAC-bg)",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
