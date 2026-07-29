"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import ThemeToggle from '@/components/ThemeToggle';

const SIDEBAR_W = 256;
const SIDEBAR_COLLAPSED = 68;

const NAV_SECTIONS = [
  {
    label: "Operasyon",
    items: [
      { label: "Ana Panel",         path: "/mdt",              icon: "fa-gauge-high" },
      { label: "Raporlar",          path: "/mdt/raporlar",     icon: "fa-file-lines" },
      { label: "Mesai Sistemi",     path: "/mdt/mesai",        icon: "fa-clock" },
      { label: "Personel Listesi",  path: "/mdt/personel",     icon: "fa-users" },
      { label: "Kriminal Kayıt",   path: "/mdt/kriminal",     icon: "fa-fingerprint" },
    ],
  },
  {
    label: "Birim",
    items: [
      { label: "Birim Başvuruları", path: "/mdt/basvuru",       icon: "fa-id-badge" },
      { label: "Duyurular",         path: "/mdt/duyurular",     icon: "fa-bullhorn" },
      { label: "İç Haberleşme",    path: "/mdt/mesajlar",      icon: "fa-message", hasUnread: true },
      { label: "Mazeret / İzin",   path: "/mdt/mazeretler",    icon: "fa-calendar-xmark" },
      { label: "Yönetmelikler",    path: "/mdt/yonetmelikler", icon: "fa-scale-balanced" },
    ],
  },
  {
    label: "Hesap",
    items: [
      { label: "Profilim",          path: "/mdt/profil",        icon: "fa-circle-user" },
    ],
  },
];

export default function MDTLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [user, setUser]           = useState<any>(null);
  const [unreadCount, setUnread]  = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const { data: authData } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    if (authData?.user) setUser(authData.user);
    else if (authData && !authData.user) setUser(null);
  }, [authData]);

  useEffect(() => {
    const check = () => {
      const last = localStorage.getItem('lastGlobalView') || '0';
      fetch(`/api/messages/unread?lastGlobalView=${last}`)
        .then(r => r.json())
        .then(d => { if (d.count !== undefined) setUnread(d.count); })
        .catch(() => {});
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.location.href = '/giris';
  };

  // Inject admin section dynamically
  const allSections = [...NAV_SECTIONS];
  if (user?.role === 'admin') {
    allSections.push({
      label: "Yönetim",
      items: [{ label: "Admin Paneli", path: "/mdt/admin", icon: "fa-shield-halved" }],
    });
  }

  const currentLabel = allSections
    .flatMap(s => s.items)
    .find(i => i.path === pathname)?.label ?? "Ana Panel";

  const sideW = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_W;

  return (
    <div
      className="mdt-zone"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--mdt-bg-main)',
        color: 'var(--mdt-text-primary)',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside
        style={{
          width: sideW,
          minWidth: sideW,
          background: 'var(--mdt-sidebar-bg)',
          borderRight: '1px solid var(--mdt-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {/* ── Logo ── */}
        <div
          style={{
            padding: collapsed ? '1.25rem 0' : '1.25rem 1.1rem',
            borderBottom: '1px solid var(--mdt-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1.5px solid var(--mdt-accent)',
              flexShrink: 0,
              boxShadow: '0 0 12px var(--mdt-accent-glow)',
            }}
          >
            <img
              src="/lapd-logo.png"
              alt="LACPD"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--mdt-text-primary)',
                  letterSpacing: '0.08em',
                  lineHeight: 1.1,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                L.A.C.P.D.
              </div>
              <div
                style={{
                  fontSize: '0.6rem',
                  color: 'var(--mdt-accent)',
                  fontWeight: 700,
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  marginTop: 1,
                }}
              >
                MDT Terminal
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
          {allSections.map((section) => (
            <div key={section.label} style={{ marginBottom: '0.25rem' }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: 'var(--mdt-text-muted)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    padding: '0.85rem 0.75rem 0.35rem',
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? 0 : '0.75rem',
                      padding: collapsed ? '0.75rem 0' : '0.65rem 0.75rem',
                      borderRadius: 7,
                      marginBottom: '0.1rem',
                      textDecoration: 'none',
                      position: 'relative',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      backgroundColor: isActive ? 'var(--mdt-accent-alpha)' : 'transparent',
                      color: isActive ? 'var(--mdt-accent)' : 'var(--mdt-text-secondary)',
                      fontWeight: isActive ? 700 : 400,
                      fontSize: '0.83rem',
                      letterSpacing: '0.01em',
                      transition: 'all 0.12s',
                    }}
                    onMouseOver={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--mdt-hover)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)';
                      }
                    }}
                    onMouseOut={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)';
                      }
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '18%',
                          bottom: '18%',
                          width: 3,
                          borderRadius: '0 2px 2px 0',
                          backgroundColor: 'var(--mdt-accent)',
                          boxShadow: '2px 0 8px var(--mdt-accent-glow)',
                        }}
                      />
                    )}

                    <i
                      className={`fa-solid ${item.icon}`}
                      style={{
                        fontSize: '0.88rem',
                        width: 18,
                        textAlign: 'center',
                        flexShrink: 0,
                        opacity: isActive ? 1 : 0.7,
                      }}
                    />

                    {!collapsed && (
                      <span
                        style={{
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.label}
                      </span>
                    )}

                    {hasUnread && !collapsed && (
                      <span
                        style={{
                          backgroundColor: 'var(--mdt-accent)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 10,
                          flexShrink: 0,
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                    {hasUnread && collapsed && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 10,
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: 'var(--mdt-accent)',
                          boxShadow: '0 0 6px var(--mdt-accent)',
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── User card ── */}
        <div
          style={{
            padding: collapsed ? '1rem 0' : '0.85rem 0.85rem',
            borderTop: '1px solid var(--mdt-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--mdt-accent-alpha)',
              border: '1.5px solid var(--mdt-accent)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <i
                className="fa-solid fa-user"
                style={{ color: 'var(--mdt-accent)', fontSize: '0.78rem' }}
              />
            )}
          </div>

          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--mdt-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name ?? 'Yükleniyor...'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--mdt-text-muted)', marginTop: 1 }}>
                #{user?.badge ?? '—'} · {user?.rank ?? ''}
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Çıkış"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--mdt-text-muted)',
                fontSize: '0.85rem',
                padding: '0.3rem',
                borderRadius: 6,
                flexShrink: 0,
                transition: 'color 0.12s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--mdt-accent)')}
              onMouseOut={e  => (e.currentTarget.style.color = 'var(--mdt-text-muted)')}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" />
            </button>
          )}
        </div>
      </aside>

      {/* ═══════════ MAIN AREA ═══════════ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        {/* ── Top header ── */}
        <div
          role="banner"
          style={{
            height: 60,
            borderBottom: '1px solid var(--mdt-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.75rem',
            gap: '1.25rem',
            background: 'var(--mdt-sidebar-bg)',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            flexShrink: 0,
          }}
        >
          {/* Collapse */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--mdt-text-muted)',
              fontSize: '0.95rem',
              padding: '0.4rem',
              borderRadius: 6,
              transition: 'color 0.12s',
              flexShrink: 0,
            }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--mdt-text-primary)')}
            onMouseOut={e  => (e.currentTarget.style.color = 'var(--mdt-text-muted)')}
          >
            <i className="fa-solid fa-bars" />
          </button>

          {/* Breadcrumb */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              color: 'var(--mdt-text-muted)',
              flexShrink: 0,
            }}
          >
            <span>MDT</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.55rem', opacity: 0.5 }} />
            <span style={{ color: 'var(--mdt-text-primary)', fontWeight: 600 }}>
              {currentLabel}
            </span>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 380, position: 'relative', marginLeft: '0.25rem' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--mdt-text-muted)',
                fontSize: '0.75rem',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Personel, rapor veya kayıt ara..."
              style={{
                width: '100%',
                background: 'var(--mdt-card-bg)',
                border: '1px solid var(--mdt-border)',
                borderRadius: 8,
                padding: '0.48rem 1rem 0.48rem 2.1rem',
                color: 'var(--mdt-text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e  => (e.target.style.borderColor = 'var(--mdt-accent)')}
              onBlur={e   => (e.target.style.borderColor = 'var(--mdt-border)')}
            />
          </div>

          {/* Right */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle />

            {/* Bell */}
            <Link
              href="/mdt/mesajlar"
              style={{
                position: 'relative',
                color: 'var(--mdt-text-muted)',
                fontSize: '0.95rem',
                textDecoration: 'none',
                padding: '0.45rem 0.55rem',
                borderRadius: 7,
                transition: 'color 0.12s, background 0.12s',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)';
                (e.currentTarget as HTMLElement).style.background = 'var(--mdt-hover)';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <i className="fa-solid fa-bell" />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--mdt-accent)',
                    boxShadow: '0 0 6px var(--mdt-accent)',
                    border: '1.5px solid var(--mdt-sidebar-bg)',
                  }}
                />
              )}
            </Link>

            {/* Duty chip */}
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.38rem 0.9rem',
                  borderRadius: 20,
                  border: `1px solid ${user.isOnDuty ? 'rgba(34,197,94,0.3)' : 'var(--mdt-border)'}`,
                  background: user.isOnDuty ? 'rgba(34,197,94,0.07)' : 'transparent',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: user.isOnDuty ? '#22c55e' : 'var(--mdt-text-muted)',
                  letterSpacing: '0.03em',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: user.isOnDuty ? '#22c55e' : 'var(--mdt-text-muted)',
                    boxShadow: user.isOnDuty ? '0 0 7px #22c55e' : 'none',
                  }}
                />
                {user.isOnDuty ? 'Görevde' : 'Görev Dışı'}
              </div>
            )}

            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--mdt-accent-alpha)',
                border: '1.5px solid var(--mdt-accent)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 10px var(--mdt-accent-glow)',
              }}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <i
                  className="fa-solid fa-user"
                  style={{ color: 'var(--mdt-accent)', fontSize: '0.75rem' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <main
          style={{
            flex: 1,
            padding: '2rem 2rem',
            overflowY: 'auto',
            background: 'var(--mdt-bg-main)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
