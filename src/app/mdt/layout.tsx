"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import ThemeToggle from '@/components/ThemeToggle';

const SIDEBAR_W = 260;

const NAV_ITEMS = [
  { label: "Ana Panel",         path: "/mdt",              icon: "fa-gauge-high" },
  { label: "Raporlar",          path: "/mdt/raporlar",     icon: "fa-file-lines" },
  { label: "Mesai Sistemi",     path: "/mdt/mesai",        icon: "fa-clock" },
  { label: "Personel Listesi",  path: "/mdt/personel",     icon: "fa-users" },
  { label: "Birim Başvuruları", path: "/mdt/basvuru",      icon: "fa-id-badge" },
  { label: "Kriminal Kayıt",   path: "/mdt/kriminal",     icon: "fa-fingerprint" },
  { label: "Duyurular",         path: "/mdt/duyurular",    icon: "fa-bullhorn" },
  { label: "İç Haberleşme",    path: "/mdt/mesajlar",     icon: "fa-message", hasUnread: true },
  { label: "Yönetmelikler",    path: "/mdt/yonetmelikler", icon: "fa-scale-balanced" },
  { label: "Mazeret / İzin",   path: "/mdt/mazeretler",   icon: "fa-calendar-xmark" },
  { label: "Profilim",          path: "/mdt/profil",        icon: "fa-circle-user" },
];

export default function MDTLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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

  const navItems = [...NAV_ITEMS];
  if (user?.role === 'admin') navItems.push({ label: "Admin Paneli", path: "/mdt/admin", icon: "fa-shield-halved" });

  const currentPage = navItems.find(i => i.path === pathname)?.label ?? "MDT";

  const sidebarW = collapsed ? 72 : SIDEBAR_W;

  return (
    <div className="mdt-zone" style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--mdt-bg-main)',
      color: 'var(--mdt-text-primary)',
      fontFamily: 'var(--font-inter)',
    }}>

      {/* ─────────── SIDEBAR ─────────── */}
      <aside style={{
        width: sidebarW,
        minWidth: sidebarW,
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
      }}>

        {/* Logo row */}
        <div style={{
          padding: collapsed ? '1.5rem 0' : '1.5rem 1.25rem',
          borderBottom: '1px solid var(--mdt-border)',
          display: 'flex', alignItems: 'center',
          gap: '0.9rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexShrink: 0,
        }}>
          <img
            src="/lapd-logo.png"
            alt="LACPD"
            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          {!collapsed && (
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--mdt-text-primary)', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                L.A.C.P.D.
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--mdt-text-muted)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                MDT Terminali
              </div>
            </div>
          )}
        </div>

        {/* Nav label */}
        {!collapsed && (
          <div style={{ padding: '1.25rem 1.25rem 0.5rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--mdt-text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Menü
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.5rem 0.5rem 0' }}>
          {navItems.map(item => {
            const isActive = pathname === item.path;
            const unread   = item.hasUnread && unreadCount > 0;
            return (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: collapsed ? 0 : '0.85rem',
                  padding: collapsed ? '0.8rem 0' : '0.75rem 0.85rem',
                  borderRadius: 8,
                  marginBottom: '0.15rem',
                  textDecoration: 'none',
                  position: 'relative',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive ? 'var(--mdt-accent-alpha)' : 'transparent',
                  color: isActive ? 'var(--mdt-accent)' : 'var(--mdt-text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s',
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
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: 2,
                    backgroundColor: 'var(--mdt-accent)',
                  }} />
                )}
                <i
                  className={`fa-solid ${item.icon}`}
                  style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0 }}
                />
                {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                {unread && !collapsed && (
                  <span style={{
                    marginLeft: 'auto', backgroundColor: 'var(--mdt-orange)',
                    color: '#fff', fontSize: '0.62rem', fontWeight: 800,
                    padding: '1px 6px', borderRadius: 10, flexShrink: 0,
                  }}>
                    {unreadCount}
                  </span>
                )}
                {unread && collapsed && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: 'var(--mdt-orange)',
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User card */}
        <div style={{
          padding: collapsed ? '1rem 0' : '1rem 0.75rem',
          borderTop: '1px solid var(--mdt-border)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--mdt-accent-alpha)',
            border: '2px solid var(--mdt-accent)',
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {user?.profileImage
              ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <i className="fa-solid fa-user" style={{ color: 'var(--mdt-accent)', fontSize: '0.9rem' }} />
            }
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mdt-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name ?? 'Yükleniyor...'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--mdt-text-muted)', fontWeight: 600 }}>
                #{user?.badge ?? '—'} · {user?.rank ?? ''}
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Çıkış"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--mdt-text-muted)', fontSize: '0.9rem',
                padding: '0.3rem', borderRadius: 6, flexShrink: 0,
                transition: 'color 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--mdt-orange)')}
              onMouseOut={e  => (e.currentTarget.style.color = 'var(--mdt-text-muted)')}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" />
            </button>
          )}
        </div>
      </aside>

      {/* ─────────── MAIN AREA ─────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* Top header bar */}
        <div role="banner" style={{
          height: 64,
          borderBottom: '1px solid var(--mdt-border)',
          display: 'flex', alignItems: 'center',
          padding: '0 1.75rem',
          gap: '1.5rem',
          background: 'var(--mdt-sidebar-bg)',
          position: 'sticky', top: 0, zIndex: 40,
          flexShrink: 0,
        }}>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--mdt-text-muted)', fontSize: '1rem',
              padding: '0.4rem', borderRadius: 6,
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--mdt-text-primary)')}
            onMouseOut={e  => (e.currentTarget.style.color = 'var(--mdt-text-muted)')}
          >
            <i className="fa-solid fa-bars" />
          </button>

          {/* Page breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--mdt-text-muted)', flexShrink: 0 }}>
            <span>MDT</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.6rem' }} />
            <span style={{ color: 'var(--mdt-text-primary)', fontWeight: 700 }}>{currentPage}</span>
          </div>

          {/* Search */}
          <div style={{
            flex: 1, maxWidth: 420,
            position: 'relative',
            marginLeft: '0.5rem',
          }}>
            <i className="fa-solid fa-magnifying-glass" style={{
              position: 'absolute', left: '0.85rem', top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--mdt-text-muted)', fontSize: '0.8rem',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Personel, rapor veya kayıt ara..."
              style={{
                width: '100%', background: 'var(--mdt-bg-main)',
                border: '1px solid var(--mdt-border)',
                borderRadius: 8, padding: '0.55rem 1rem 0.55rem 2.25rem',
                color: 'var(--mdt-text-primary)', fontSize: '0.85rem',
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--mdt-accent)')}
              onBlur={e  => (e.target.style.borderColor = 'var(--mdt-border)')}
            />
          </div>

          {/* Right actions */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications bell */}
            <Link href="/mdt/mesajlar" style={{
              position: 'relative', color: 'var(--mdt-text-muted)',
              fontSize: '1rem', textDecoration: 'none',
              padding: '0.4rem', borderRadius: 6,
              transition: 'color 0.15s',
            }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-primary)'}
            onMouseOut={e  => (e.currentTarget as HTMLElement).style.color = 'var(--mdt-text-muted)'}
            >
              <i className="fa-solid fa-bell" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: 'var(--mdt-orange)',
                  border: '2px solid var(--mdt-sidebar-bg)',
                }} />
              )}
            </Link>

            {/* Duty status chip */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.85rem',
                borderRadius: 20,
                border: `1px solid ${user.isOnDuty ? 'rgba(16,185,129,0.3)' : 'var(--mdt-border)'}`,
                background: user.isOnDuty ? 'rgba(16,185,129,0.08)' : 'transparent',
                fontSize: '0.75rem', fontWeight: 700,
                color: user.isOnDuty ? '#10b981' : 'var(--mdt-text-muted)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  backgroundColor: user.isOnDuty ? '#10b981' : 'var(--mdt-text-muted)',
                  boxShadow: user.isOnDuty ? '0 0 6px #10b981' : 'none',
                }} />
                {user.isOnDuty ? 'Görevde' : 'Görev Dışı'}
              </div>
            )}

            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--mdt-accent-alpha)',
              border: '2px solid var(--mdt-accent)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {user?.profileImage
                ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <i className="fa-solid fa-user" style={{ color: 'var(--mdt-accent)', fontSize: '0.8rem' }} />
              }
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: '2rem 2rem',
          overflowY: 'auto',
          background: 'var(--mdt-bg-main)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
