"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

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
];

export default function MDTLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [user, setUser]               = useState<any>(null);
  const [unreadCount, setUnread]      = useState(0);
  const [collapsed, setCollapsed]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef                    = useRef<HTMLDivElement>(null);

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

  // Close profile card on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.location.href = '/giris';
  };

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
    <>
      {/* ── Global MDT animation keyframes ── */}
      <style>{`
        @keyframes mdt-fadeInDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes mdt-pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0);  }
        }
        @keyframes mdt-glow-badge {
          0%, 100% { box-shadow: 0 0 8px var(--mdt-accent-glow); }
          50%       { box-shadow: 0 0 18px var(--mdt-accent-glow);}
        }
        @keyframes mdt-slide-in {
          from { transform: translateX(-6px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .mdt-nav-item {
          transition: background 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
        }
        .mdt-nav-item:hover {
          padding-left: calc(0.75rem + 3px) !important;
        }
        .mdt-nav-item.active {
          animation: mdt-slide-in 0.2s ease;
        }
        .mdt-profile-card {
          animation: mdt-fadeInDown 0.18s cubic-bezier(.4,0,.2,1);
        }
        .mdt-sidebar-logo {
          animation: mdt-glow-badge 3s ease-in-out infinite;
        }
      `}</style>

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
            transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
            zIndex: 50,
            flexShrink: 0,
          }}
        >
          {/* ── Logo ── */}
          <div
            style={{
              padding: collapsed ? '1.35rem 0' : '1.35rem 1.1rem',
              borderBottom: '1px solid var(--mdt-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              flexShrink: 0,
            }}
          >
            <div
              className="mdt-sidebar-logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid var(--mdt-accent)',
                flexShrink: 0,
              }}
            >
              <img
                src="/lapd-logo.png"
                alt="LACPD"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--mdt-text-primary)',
                    letterSpacing: '0.07em',
                    lineHeight: 1.1,
                  }}
                >
                  L.A.C.P.D.
                </div>
                <div
                  style={{
                    fontSize: '0.58rem',
                    color: 'var(--mdt-accent)',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                    opacity: 0.85,
                  }}
                >
                  MDT Terminal
                </div>
              </div>
            )}
          </div>

          {/* ── Nav ── */}
          <nav style={{ flex: 1, padding: '0.6rem 0.45rem', overflowY: 'auto' }}>
            {allSections.map((section) => (
              <div key={section.label} style={{ marginBottom: '0.2rem' }}>
                {!collapsed && (
                  <div
                    style={{
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      color: 'var(--mdt-text-muted)',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      padding: '0.9rem 0.75rem 0.3rem',
                      opacity: 0.7,
                    }}
                  >
                    {section.label}
                  </div>
                )}

                {section.items.map((item: any) => {
                  const isActive  = pathname === item.path;
                  const hasUnread = item.hasUnread && unreadCount > 0;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`mdt-nav-item${isActive ? ' active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: collapsed ? 0 : '0.72rem',
                        padding: collapsed ? '0.78rem 0' : '0.65rem 0.75rem',
                        borderRadius: 8,
                        marginBottom: '0.08rem',
                        textDecoration: 'none',
                        position: 'relative',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        backgroundColor: isActive ? 'var(--mdt-accent-alpha)' : 'transparent',
                        color: isActive ? 'var(--mdt-accent)' : 'var(--mdt-text-secondary)',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.83rem',
                        letterSpacing: '0.005em',
                      }}
                    >
                      {/* Active bar */}
                      {isActive && (
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '20%',
                            bottom: '20%',
                            width: 3,
                            borderRadius: '0 3px 3px 0',
                            backgroundColor: 'var(--mdt-accent)',
                            boxShadow: '2px 0 10px var(--mdt-accent-glow)',
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
                          opacity: isActive ? 1 : 0.65,
                          transition: 'opacity 0.15s',
                        }}
                      />

                      {!collapsed && (
                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                      )}

                      {hasUnread && !collapsed && (
                        <span
                          style={{
                            backgroundColor: 'var(--mdt-accent)',
                            color: '#fff',
                            fontSize: '0.58rem',
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
                            right: 8,
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

          {/* ── Collapse button at bottom ── */}
          <div
            style={{
              padding: '0.75rem 0.45rem',
              borderTop: '1px solid var(--mdt-border)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setCollapsed(c => !c)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: collapsed ? '0.65rem 0' : '0.65rem 0.75rem',
                borderRadius: 8,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--mdt-text-muted)',
                fontSize: '0.8rem',
                fontWeight: 500,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseOver={e => {
                (e.currentTarget).style.color = 'var(--mdt-text-primary)';
                (e.currentTarget).style.background = 'var(--mdt-hover)';
              }}
              onMouseOut={e => {
                (e.currentTarget).style.color = 'var(--mdt-text-muted)';
                (e.currentTarget).style.background = 'none';
              }}
            >
              <i
                className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}
                style={{ fontSize: '0.78rem', width: 18, textAlign: 'center', transition: 'transform 0.25s' }}
              />
              {!collapsed && <span>Daralt</span>}
            </button>
          </div>
        </aside>

        {/* ═══════════ MAIN ═══════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

          {/* ── Top Header ── */}
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
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '0.7rem', color: 'var(--mdt-accent)', opacity: 0.7 }} />
              <span>MDT</span>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.5rem', opacity: 0.35 }} />
              <span style={{ color: 'var(--mdt-text-primary)', fontWeight: 600 }}>{currentLabel}</span>
            </div>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: 380, position: 'relative', marginLeft: '0.5rem' }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--mdt-text-muted)',
                  fontSize: '0.72rem',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Ara..."
                style={{
                  width: '100%',
                  background: 'var(--mdt-card-bg)',
                  border: '1px solid var(--mdt-border)',
                  borderRadius: 8,
                  padding: '0.46rem 1rem 0.46rem 2rem',
                  color: 'var(--mdt-text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e  => {
                  e.target.style.borderColor = 'var(--mdt-accent)';
                  e.target.style.boxShadow   = '0 0 0 3px var(--mdt-accent-alpha)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--mdt-border)';
                  e.target.style.boxShadow   = 'none';
                }}
              />
            </div>

            {/* Right actions */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              {/* Notification bell */}
              <Link
                href="/mdt/mesajlar"
                style={{
                  position: 'relative',
                  color: 'var(--mdt-text-muted)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  padding: '0.45rem 0.55rem',
                  borderRadius: 8,
                  transition: 'color 0.15s, background 0.15s',
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
                    gap: '0.42rem',
                    padding: '0.36rem 0.85rem',
                    borderRadius: 20,
                    border: `1px solid ${user.isOnDuty ? 'rgba(34,197,94,0.28)' : 'var(--mdt-border)'}`,
                    background: user.isOnDuty ? 'rgba(34,197,94,0.07)' : 'transparent',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: user.isOnDuty ? '#22c55e' : 'var(--mdt-text-muted)',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: user.isOnDuty ? '#22c55e' : 'var(--mdt-text-muted)',
                      animation: user.isOnDuty ? 'mdt-pulse-dot 2s infinite' : 'none',
                    }}
                  />
                  {user.isOnDuty ? 'Görevde' : 'Görev Dışı'}
                </div>
              )}

              {/* ── Profile avatar + dropdown card ── */}
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--mdt-accent-alpha)',
                    border: `2px solid ${profileOpen ? 'var(--mdt-accent)' : 'rgba(255,255,255,0.1)'}`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: profileOpen ? '0 0 0 3px var(--mdt-accent-alpha)' : 'none',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--mdt-accent)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px var(--mdt-accent-alpha)';
                  }}
                  onMouseOut={e => {
                    if (!profileOpen) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }
                  }}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa-solid fa-user" style={{ color: 'var(--mdt-accent)', fontSize: '0.78rem' }} />
                  )}
                </button>

                {/* Dropdown Card */}
                {profileOpen && (
                  <div
                    className="mdt-profile-card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 240,
                      background: 'var(--mdt-card-bg)',
                      border: '1px solid var(--mdt-border)',
                      borderRadius: 12,
                      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                      zIndex: 200,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Card header */}
                    <div
                      style={{
                        padding: '1.1rem 1.1rem 0.9rem',
                        borderBottom: '1px solid var(--mdt-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        background: 'linear-gradient(135deg, var(--mdt-accent-alpha) 0%, transparent 100%)',
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '2px solid var(--mdt-accent)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--mdt-accent-alpha)',
                        }}
                      >
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="fa-solid fa-user" style={{ color: 'var(--mdt-accent)', fontSize: '1rem' }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--mdt-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.name ?? '—'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--mdt-text-muted)', marginTop: 2 }}>
                          #{user?.badge ?? '—'} · {user?.rank ?? '—'}
                        </div>
                      </div>
                    </div>

                    {/* Status row */}
                    <div style={{ padding: '0.7rem 1.1rem', borderBottom: '1px solid var(--mdt-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: user?.isOnDuty ? '#22c55e' : 'var(--mdt-text-muted)',
                          animation: user?.isOnDuty ? 'mdt-pulse-dot 2s infinite' : 'none',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '0.75rem', color: user?.isOnDuty ? '#22c55e' : 'var(--mdt-text-muted)', fontWeight: 600 }}>
                        {user?.isOnDuty ? 'Görevde' : 'Görev Dışı'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '0.5rem' }}>
                      <Link
                        href="/mdt/profil"
                        onClick={() => setProfileOpen(false)}
                        style={{ textDecoration: 'none' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.7rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: 7,
                            cursor: 'pointer',
                            color: 'var(--mdt-text-secondary)',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            transition: 'background 0.12s, color 0.12s',
                          }}
                          onMouseOver={e => {
                            (e.currentTarget as HTMLElement).style.background = 'var(--mdt-hover)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)';
                          }}
                          onMouseOut={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)';
                          }}
                        >
                          <i className="fa-solid fa-circle-user" style={{ width: 16, textAlign: 'center', color: 'var(--mdt-accent)', opacity: 0.8 }} />
                          Profilim
                        </div>
                      </Link>

                      <div
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.7rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 7,
                          cursor: 'pointer',
                          color: 'var(--mdt-text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          transition: 'background 0.12s, color 0.12s',
                        }}
                        onMouseOver={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                          (e.currentTarget as HTMLElement).style.color = '#ef4444';
                        }}
                        onMouseOut={e => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-secondary)';
                        }}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: 16, textAlign: 'center', color: '#ef4444', opacity: 0.8 }} />
                        Çıkış Yap
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Page Content ── */}
          <main
            style={{
              flex: 1,
              padding: '2rem',
              overflowY: 'auto',
              background: 'var(--mdt-bg-main)',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
