"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import ThemeToggle from "@/components/ThemeToggle";

const SIDEBAR_W = 252;
const SIDEBAR_COLLAPSED = 68;

const NAV_SECTIONS = [
  {
    label: "Operasyon",
    items: [
      { label: "Ana Panel", path: "/mdt", icon: "fa-table-columns" },
      { label: "Taktiksel Planlama", path: "/mdt/taktik", icon: "fa-map-location-dot" },
      { label: "Rapor & Belge Portalı", path: "/mdt/raporlar", icon: "fa-file-lines" },
      { label: "Mesai & Devriye", path: "/mdt/mesai", icon: "fa-clock" },
      { label: "Personel Veritabanı", path: "/mdt/personel", icon: "fa-users" },
      { label: "Kriminal Kayıtlar", path: "/mdt/kriminal", icon: "fa-fingerprint" },
    ],
  },
  {
    label: "Birim & İdari İşlemler",
    items: [
      { label: "Birim Başvuruları", path: "/mdt/basvuru", icon: "fa-id-badge" },
      { label: "Duyurular", path: "/mdt/duyurular", icon: "fa-bullhorn" },
      { label: "İç Haberleşme", path: "/mdt/mesajlar", icon: "fa-envelope", hasUnread: true },
      { label: "Mazeret & İzin", path: "/mdt/mazeretler", icon: "fa-calendar-check" },
      { label: "Yönetmelikler", path: "/mdt/yonetmelikler", icon: "fa-scale-balanced" },
    ],
  },
];

export default function MDTLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
      label: "Yönetim",
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
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── CLEAN CORPORATE HEADER (64px) ── */}
      <header
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-light)",
          padding: "0 1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          position: "sticky",
          top: 0,
          zIndex: 60,
          gap: "1.5rem",
        }}
      >
        {/* Left: Seal + Title + Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/mdt" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img
              src="/logom.png"
              alt="LACPD"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid var(--border-strong)",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: "0.98rem",
                  fontWeight: 800,
                  color: "var(--accent-primary)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                }}
              >
                Los Angeles C.P.D.
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Mobil Veri Terminali
              </div>
            </div>
          </Link>

          <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border-light)", margin: "0 0.25rem" }} />

          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {currentLabel}
          </span>
        </div>

        {/* Center: Clean Search Input */}
        <div style={{ flex: 1, maxWidth: "360px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.45rem 0.85rem",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
            }}
          >
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginRight: "8px" }}
            />
            <input
              type="text"
              placeholder="Modül ara..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                backgroundColor: "transparent",
                fontFamily: "inherit",
              }}
            />
          </div>

          {filteredSearchItems.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                boxShadow: "0 10px 25px rgba(15, 23, 42, 0.1)",
                zIndex: 200,
                overflow: "hidden",
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
                    padding: "0.65rem 1rem",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--border-light)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  <i className={`fa-solid ${res.icon}`} style={{ color: "var(--text-muted)", width: 16 }} />
                  {res.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <Link
            href="/"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              textDecoration: "none",
              padding: "0.45rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            Ana Sayfa
          </Link>

          <ThemeToggle />

          {/* Internal Mail */}
          <Link
            href="/mdt/mesajlar"
            title="İç Haberleşme"
            style={{
              position: "relative",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-light)",
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              fontSize: "0.88rem",
            }}
          >
            <i className="fa-regular fa-envelope" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "var(--LAC-orange)",
                  color: "#FFFFFF",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "1px 5px",
                  borderRadius: "10px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Duty Status Pill */}
          {user && (
            <Link
              href="/mdt/mesai"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.42rem 0.8rem",
                borderRadius: "6px",
                backgroundColor: user.isOnDuty ? "var(--color-success-bg)" : "var(--bg-primary)",
                border: `1px solid ${user.isOnDuty ? "var(--color-success-border)" : "var(--border-light)"}`,
                color: user.isOnDuty ? "var(--color-success)" : "var(--text-secondary)",
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: user.isOnDuty ? "var(--color-success)" : "var(--text-muted)",
                }}
              />
              {user.isOnDuty ? "Görevde" : "Görev Dışı"}
            </Link>
          )}

          {/* Officer Profile Dropdown */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                padding: "0.35rem 0.75rem 0.35rem 0.45rem",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: "#041632",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.charAt(0) ?? "M"}
                </div>
              )}
              <span>{user ? user.name : "Personel"}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.76rem", fontWeight: 500 }}>
                #{user?.badge ?? "—"}
              </span>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }} />
            </button>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  width: "240px",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
                  zIndex: 200,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "0.9rem 1rem",
                    borderBottom: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                >
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {user?.name ?? "Memur"}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    #{user?.badge ?? "—"} · {user?.rank ?? "—"}
                  </div>
                </div>

                <div style={{ padding: "0.35rem" }}>
                  <Link
                    href="/mdt/profil"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: "0.6rem 0.75rem",
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      fontSize: "0.84rem",
                      fontWeight: 500,
                      borderRadius: "5px",
                    }}
                  >
                    <i className="fa-regular fa-id-badge" style={{ color: "var(--text-muted)", width: 16 }} />
                    Profilim & Sicil Kartı
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      href="/mdt/komuta-1222"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        padding: "0.6rem 0.75rem",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        fontSize: "0.84rem",
                        fontWeight: 500,
                        borderRadius: "5px",
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
                      gap: "0.65rem",
                      padding: "0.6rem 0.75rem",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "var(--color-danger)",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      textAlign: "left",
                      cursor: "pointer",
                      borderRadius: "5px",
                    }}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: 16 }} />
                    Çıkış Yap
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY: SIDEBAR + MAIN ── */}
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 64px)" }}>
        <aside
          style={{
            width: sideW,
            minWidth: sideW,
            backgroundColor: "var(--bg-secondary)",
            borderRight: "1px solid var(--border-light)",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.2s ease",
            flexShrink: 0,
          }}
        >
          <nav style={{ flex: 1, padding: "1.1rem 0.75rem" }}>
            {allSections.map((section) => (
              <div key={section.label} style={{ marginBottom: "1.35rem" }}>
                {!collapsed && (
                  <div
                    style={{
                      fontSize: "0.73rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      padding: "0 0.65rem",
                      marginBottom: "0.4rem",
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
                        padding: collapsed ? "0.7rem 0" : "0.6rem 0.75rem",
                        marginBottom: "0.18rem",
                        borderRadius: "6px",
                        textDecoration: "none",
                        backgroundColor: isActive ? "#041632" : "transparent",
                        color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                        fontWeight: isActive ? 600 : 500,
                        fontSize: "0.875rem",
                        transition: "background-color 0.15s, color 0.15s",
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                          e.currentTarget.style.color = "var(--text-primary)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }
                      }}
                    >
                      <i
                        className={`fa-solid ${item.icon}`}
                        style={{
                          fontSize: "0.9rem",
                          width: 18,
                          textAlign: "center",
                          color: isActive ? "#E84F2A" : "var(--text-muted)",
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
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "10px",
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

          {/* Collapse Button */}
          <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border-light)" }}>
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                padding: "0.55rem 0.75rem",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {!collapsed && <span>Menüyü Daralt</span>}
              <i className={`fa-solid ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`} style={{ fontSize: "0.75rem" }} />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            padding: "1.75rem 2.25rem",
            backgroundColor: "var(--bg-primary)",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
