"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

const SIDEBAR_W = 260;
const SIDEBAR_COLLAPSED = 72;

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');

        /* ── Keyframes ── */
        @keyframes mdt-fadeInDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mdt-pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,210,106,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(0,210,106,0); }
        }
        @keyframes mdt-logo-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(255,255,255,0.16), 0 0 20px rgba(255,255,255,0.08); }
          50%       { box-shadow: 0 0 18px #555, 0 0 35px rgba(255,255,255,0.12); }
        }
        @keyframes mdt-scanline {
          0%   { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }
        @keyframes mdt-slide-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mdt-badge-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(0.95); }
        }
        /* Aurora breathing animations */
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.12; }
          33%       { transform: translate(60px,-40px) scale(1.15); opacity: 0.15; }
          66%       { transform: translate(-30px,50px) scale(0.92); opacity: 0.1; }
        }
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.1; }
          40%       { transform: translate(-70px,30px) scale(1.2); opacity: 0.13; }
          70%       { transform: translate(40px,-60px) scale(0.88); opacity: 0.08; }
        }
        @keyframes aurora-3 {
          0%, 100% { transform: translate(0,0) scale(1); opacity: 0.08; }
          50%       { transform: translate(50px,70px) scale(1.1); opacity: 0.12; }
        }
        @keyframes grid-drift {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }

        /* ── Sidebar nav items ── */
        .mdt-nav-item {
          position: relative;
          transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }
        .mdt-nav-item::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 3px;
          height: 60%;
          background: linear-gradient(180deg, #ededed 0%, rgba(255,255,255,0.16) 100%);
          border-radius: 0 3px 3px 0;
          transition: transform 0.22s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 2px 0 10px rgba(255,255,255,0.16);
        }
        .mdt-nav-item.active::before {
          transform: translateY(-50%) scaleY(1);
        }
        .mdt-nav-item.active {
          animation: mdt-slide-in 0.2s ease;
        }
        .mdt-nav-item .mdt-icon {
          transition: transform 0.18s ease, color 0.18s ease;
        }
        .mdt-nav-item:hover .mdt-icon,
        .mdt-nav-item.active .mdt-icon {
          transform: scale(1.15);
        }
        .mdt-profile-card {
          animation: mdt-fadeInDown 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .mdt-logo-wrap {
          animation: none;
        }
        .mdt-sidebar-scanline {
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.08) 3px,
            rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
        }
        .mdt-topbar-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #555;
        }
        .mdt-collapse-btn {
          transition: all 0.18s ease;
          border: 1px solid transparent;
        }
        .mdt-collapse-btn:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05) !important;
          color: #888 !important;
        }
        .mdt-search-input:focus {
          border-color: #555 !important;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.08) !important;
        }
        .mdt-icon-btn {
          transition: all 0.15s ease;
        }
        .mdt-icon-btn:hover {
          background: rgba(255,255,255,0.06) !important;
          color: #888 !important;
        }
        .mdt-avatar-btn {
          transition: all 0.18s ease;
        }
        .mdt-avatar-btn:hover {
          border-color: rgba(255,255,255,0.25) !important;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.08) !important;
        }
        /* Scrollbar */
        .mdt-sidebar::-webkit-scrollbar { width: 3px; }
        .mdt-sidebar::-webkit-scrollbar-track { background: transparent; }
        .mdt-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        .mdt-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
        .mdt-main::-webkit-scrollbar { width: 5px; }
        .mdt-main::-webkit-scrollbar-track { background: transparent; }
        .mdt-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#ededed',
          fontFamily: "'Inter', -apple-system, sans-serif",
          position: 'relative',
        }}
      >
        {/* ═══════════ SIDEBAR ═══════════ */}
        <aside
          className="mdt-sidebar"
          style={{
            width: sideW,
            minWidth: sideW,
            background: '#0f0f0f',
            backdropFilter: 'blur(32px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '4px 0 24px -10px rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
            zIndex: 50,
            flexShrink: 0,
          }}
        >
          {/* Scanline overlay */}
          <div
            className="mdt-sidebar-scanline"
            style={{
              position: 'absolute', inset: 0,
              opacity: 0.4,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* ── Logo Area ── */}
          <div
            style={{
              padding: collapsed ? '1.4rem 0' : '1.25rem 1.1rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1,
              background: 'linear-gradient(135deg, #161616 0%, transparent 60%)',
            }}
          >
            <div
              className="mdt-logo-wrap"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1.5px solid #555',
                flexShrink: 0,
              }}
            >
              <img
                src="/logom.png"
                alt="LACPD"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#ededed',
                    letterSpacing: '0.08em',
                    lineHeight: 1.1,
                  }}
                >
                  L.A.C.P.D.
                </div>
                <div
                  style={{
                    fontSize: '0.55rem',
                    color: '#ededed',
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    marginTop: 3,
                  }}
                >
                  MDT Terminal
                </div>
              </div>
            )}
          </div>

          {/* ── Nav ── */}
          <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
            {allSections.map((section) => (
              <div key={section.label} style={{ marginBottom: '0.5rem' }}>
                {!collapsed && (
                  <div
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: '#555',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      padding: '0.4rem 0.6rem',
                      margin: '1rem 0.5rem 0.5rem 0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'transparent',
                      borderLeft: '2px solid rgba(255,255,255,0.15)',
                      borderRadius: '4px',
                      fontFamily: "'JetBrains Mono', monospace",
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
                        gap: collapsed ? 0 : '0.8rem',
                        padding: collapsed ? '0.82rem 0' : '0.65rem 0.85rem',
                        borderRadius: 8,
                        marginBottom: '0.2rem',
                        textDecoration: 'none',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        background: isActive
                          ? 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, transparent 100%)'
                          : 'transparent',
                        border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                        color: isActive ? '#ededed' : '#888',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.82rem',
                        letterSpacing: '0.01em',
                        userSelect: 'none',
                        position: 'relative',
                        boxShadow: isActive ? 'inset 2px 0 0 #ededed' : 'none',
                      }}
                      onMouseOver={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#161616';
                          (e.currentTarget as HTMLElement).style.color = '#888';
                        }
                      }}
                      onMouseOut={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#888';
                        }
                      }}
                    >
                      <i
                        className={`fa-solid ${item.icon} mdt-icon`}
                        style={{
                          fontSize: '0.9rem',
                          width: 20,
                          textAlign: 'center',
                          flexShrink: 0,
                          color: isActive ? '#ededed' : 'inherit',
                          filter: isActive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.3))' : 'none',
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
                            background: '#ededed',
                            color: '#fff',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: 10,
                            flexShrink: 0,
                            fontFamily: "'JetBrains Mono', monospace",
                            boxShadow: '0 0 8px rgba(255,255,255,0.16)',
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                      {hasUnread && collapsed && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 9,
                            right: 10,
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: '#ededed',
                            boxShadow: '0 0 6px rgba(255,255,255,0.3)',
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* ── Divider + System Info ── */}
          {!collapsed && (
            <div
              style={{
                margin: '0 0.75rem',
                padding: '0.75rem',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid #161616',
                marginBottom: '0.5rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.6rem', color: '#555', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Sistem Durumu
                </span>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#00d26a',
                  boxShadow: '0 0 6px rgba(34,197,94,0.6)',
                  display: 'inline-block',
                }} />
              </div>
              <div style={{ fontSize: '0.62rem', color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                MDT v3.2 — ONLINE
              </div>
            </div>
          )}

          {/* ── Collapse button ── */}
          <div
            style={{
              padding: '0.6rem 0.5rem',
              borderTop: '1px solid #161616',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <button
              className="mdt-collapse-btn"
              onClick={() => setCollapsed(c => !c)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '0.65rem',
                padding: collapsed ? '0.65rem 0' : '0.65rem 0.85rem',
                borderRadius: 8,
                border: '1px solid transparent',
                background: 'none',
                cursor: 'pointer',
                color: '#555',
                fontSize: '0.78rem',
                fontWeight: 500,
              }}
            >
              <i
                className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}
                style={{ fontSize: '0.72rem', width: 18, textAlign: 'center', transition: 'transform 0.25s' }}
              />
              {!collapsed && <span>Daralt</span>}
            </button>
          </div>
        </aside>

        {/* ═══════════ MAIN ═══════════ */}
        <div className="mdt-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

          {/* ── Top Header ── */}
          <header
            style={{
              height: 60,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1.5rem',
              gap: '1.25rem',
              background: 'linear-gradient(90deg, #111111 0%, #111111 100%)',
              backdropFilter: 'blur(16px)',
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
                gap: '0.45rem',
                fontSize: '0.75rem',
                color: '#666',
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '0.72rem', color: '#555' }} />
              <span style={{ fontWeight: 500 }}>MDT</span>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.45rem', opacity: 0.3 }} />
              <span style={{ color: '#ededed', fontWeight: 600 }}>{currentLabel}</span>
            </div>

            {/* Search */}
            <div style={{ flex: 1, maxWidth: 360, position: 'relative', marginLeft: '0.25rem' }}>
              <i
                className="fa-solid fa-magnifying-glass"
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.16)',
                  fontSize: '0.7rem',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Ara..."
                className="mdt-search-input"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '0.48rem 1rem 0.48rem 2.2rem',
                  color: '#ededed',
                  fontSize: '0.78rem',
                  outline: 'none',
                  transition: 'all 0.18s ease',
                }}
              />
            </div>

            {/* Right actions */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>

              {/* Notification bell */}
              <Link
                href="/mdt/mesajlar"
                className="mdt-icon-btn"
                style={{
                  position: 'relative',
                  color: '#666',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  padding: '0.5rem 0.6rem',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <i className="fa-solid fa-bell" />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 7,
                      right: 7,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#ededed',
                      boxShadow: '0 0 8px #555',
                      border: '1.5px solid #0a0a0a',
                    }}
                  />
                )}
              </Link>

              {/* Separator */}
              <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', margin: '0 0.25rem' }} />

              {/* Duty chip */}
              {user && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.38rem 0.9rem',
                    borderRadius: 20,
                    border: `1px solid ${user.isOnDuty ? 'rgba(0,210,106,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    background: user.isOnDuty ? 'rgba(0,210,106,0.07)' : 'transparent',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: user.isOnDuty ? '#00d26a' : '#666',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: user.isOnDuty ? '#00d26a' : '#555',
                      animation: user.isOnDuty ? 'mdt-pulse-green 2s infinite' : 'none',
                      flexShrink: 0,
                    }}
                  />
                  {user.isOnDuty ? 'Görevde' : 'Görev Dışı'}
                </div>
              )}

              {/* Profile avatar */}
              <div ref={profileRef} style={{ position: 'relative', marginLeft: '0.1rem' }}>
                <button
                  className="mdt-avatar-btn"
                  onClick={() => setProfileOpen(o => !o)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: `2px solid ${profileOpen ? '#555' : 'rgba(255,255,255,0.1)'}`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.18s ease',
                    boxShadow: profileOpen ? '0 0 0 4px rgba(255,255,255,0.08)' : 'none',
                  }}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa-solid fa-user" style={{ color: '#ededed', fontSize: '0.8rem' }} />
                  )}
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div
                    className="mdt-profile-card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 248,
                      background: 'linear-gradient(160deg, #111111 0%, #0a0e1a 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 14,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px #161616',
                      zIndex: 200,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: '1.1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        background: 'linear-gradient(135deg, #161616 0%, transparent 100%)',
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: '50%',
                          border: '2px solid #555',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.08)',
                          boxShadow: '0 0 12px rgba(255,255,255,0.1)',
                        }}
                      >
                        {user?.profileImage ? (
                          <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="fa-solid fa-user" style={{ color: '#ededed', fontSize: '1rem' }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ededed', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.name ?? '—'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#888', marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                          #{user?.badge ?? '—'} · {user?.rank ?? '—'}
                        </div>
                      </div>
                    </div>

                    {/* Status row */}
                    <div style={{ padding: '0.7rem 1.1rem', borderBottom: '1px solid #161616', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: 8, height: 8, borderRadius: '50%',
                          backgroundColor: user?.isOnDuty ? '#00d26a' : '#444',
                          animation: user?.isOnDuty ? 'mdt-pulse-green 2s infinite' : 'none',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '0.72rem', color: user?.isOnDuty ? '#00d26a' : '#555', fontWeight: 600 }}>
                        {user?.isOnDuty ? 'Görevde' : 'Görev Dışı'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '0.5rem' }}>
                      <Link href="/mdt/profil" onClick={() => setProfileOpen(false)} style={{ textDecoration: 'none' }}>
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.7rem',
                            padding: '0.6rem 0.8rem', borderRadius: 8,
                            cursor: 'pointer', color: '#888',
                            fontSize: '0.82rem', fontWeight: 500,
                            transition: 'all 0.12s ease',
                          }}
                          onMouseOver={e => {
                            (e.currentTarget as HTMLElement).style.background = '#161616';
                            (e.currentTarget as HTMLElement).style.color = '#ededed';
                          }}
                          onMouseOut={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = '#888';
                          }}
                        >
                          <i className="fa-solid fa-circle-user" style={{ width: 16, textAlign: 'center', color: '#555' }} />
                          Profilim
                        </div>
                      </Link>

                      <div
                        onClick={handleLogout}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.7rem',
                          padding: '0.6rem 0.8rem', borderRadius: 8,
                          cursor: 'pointer', color: '#888',
                          fontSize: '0.82rem', fontWeight: 500,
                          transition: 'all 0.12s ease',
                        }}
                        onMouseOver={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                          (e.currentTarget as HTMLElement).style.color = '#ef4444';
                        }}
                        onMouseOut={e => {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#888';
                        }}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: 16, textAlign: 'center', color: 'rgba(239,68,68,0.6)' }} />
                        Çıkış Yap
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Page Content ── */}
          <main
            style={{
              flex: 1,
              padding: '2rem 2rem',
              overflowY: 'auto',
              background: 'linear-gradient(160deg, #0a0a0a 0%, #0a0a0a 100%)',
              position: 'relative',
            }}
          >
          {/* ── Futuristic Background ── */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 20% 50%, #050810 0%, #0a0a0a 40%, #0a0a0a 100%)',
            }}
          >
            {/* Aurora blob 1 — deep blue */}
            <div style={{
              position: 'absolute',
              top: '-10%', left: '-5%',
              width: '55vw', height: '55vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #161616 0%, transparent 45%, transparent 70%)',
              animation: 'aurora-1 18s ease-in-out infinite',
              filter: 'blur(40px)',
            }} />
            {/* Aurora blob 2 — indigo */}
            <div style={{
              position: 'absolute',
              bottom: '5%', right: '-10%',
              width: '50vw', height: '50vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,60,230,0.04) 0%, rgba(99,60,230,0.01) 45%, transparent 70%)',
              animation: 'aurora-2 22s ease-in-out infinite',
              filter: 'blur(50px)',
            }} />
            {/* Aurora blob 3 — teal accent */}
            <div style={{
              position: 'absolute',
              top: '40%', left: '35%',
              width: '35vw', height: '35vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6,182,212,0.02) 0%, transparent 65%)',
              animation: 'aurora-3 26s ease-in-out infinite',
              filter: 'blur(35px)',
            }} />
            {/* Vercel-style Dot grid */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(to bottom, black 5%, transparent 80%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 5%, transparent 80%)',
            }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
          </main>
        </div>
      </div>
    </>
  );
}
