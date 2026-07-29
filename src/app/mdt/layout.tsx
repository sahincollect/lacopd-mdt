"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import ThemeToggle from '@/components/ThemeToggle';
import { Reorder, motion, AnimatePresence } from 'framer-motion';

const DEFAULT_LINKS = [
  { id: 'dashboard', label: 'Kontrol Paneli', icon: 'fa-border-all', path: '/mdt' },
  { id: 'mesai', label: 'Mesai Sistemi', icon: 'fa-stopwatch', path: '/mdt/mesai' },
  { id: 'kriminal', label: 'Suçlu Kayıt', icon: 'fa-fingerprint', path: '/mdt/kriminal' },
  { id: 'rapor', label: 'Rapor Portalı', icon: 'fa-file-signature', path: '/rapor-portali', external: true },
  { id: 'duyurular', label: 'Duyurular', icon: 'fa-tower-broadcast', path: '/mdt/duyurular' },
  { id: 'basvuru', label: 'Birim Başvurusu', icon: 'fa-id-badge', path: '/mdt/basvuru' },
  { id: 'izin', label: 'İzin Talepleri', icon: 'fa-calendar-xmark', path: '/mdt/mazeretler' },
  { id: 'yonetmelik', label: 'Yönetmelikler', icon: 'fa-book-bookmark', path: '/handbook/index.html?v=20260708_1', external: true },
  { id: 'personel', label: 'Personel Listesi', icon: 'fa-users-viewfinder', path: '/mdt/personel' },
  { id: 'admin', label: 'Admin Seçenekleri', icon: 'fa-shield-halved', path: '/mdt/admin', adminOnly: true },
];

export default function MDTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('lapd_cached_auth_user');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sidebarLinks, setSidebarLinks] = useState(DEFAULT_LINKS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lapd_sidebar_order');
      if (saved) {
        const parsedIds = JSON.parse(saved);
        const reordered = parsedIds.map((id: string) => DEFAULT_LINKS.find(l => l.id === id)).filter(Boolean);
        DEFAULT_LINKS.forEach(dl => {
           if (!reordered.find((r: any) => r.id === dl.id)) reordered.push(dl);
        });
        setSidebarLinks(reordered as any);
      }
    } catch (e) {}
  }, []);

  const handleReorder = (newOrder: any[]) => {
    setSidebarLinks(newOrder);
    localStorage.setItem('lapd_sidebar_order', JSON.stringify(newOrder.map(n => n.id)));
  };

  const { data: authData } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    if (authData?.user) {
      setUser(authData.user);
      try {
        localStorage.setItem('lapd_cached_auth_user', JSON.stringify(authData.user));
      } catch (e) {}
    } else if (authData && !authData.user) {
      setUser(null);
      try {
        localStorage.removeItem('lapd_cached_auth_user');
      } catch (e) {}
    }
  }, [authData]);

  useEffect(() => {
    const checkUnread = () => {
      const lastGlobalView = localStorage.getItem('lastGlobalView') || '0';
      fetch(`/api/messages/unread?lastGlobalView=${lastGlobalView}`)
        .then(res => res.json())
        .then(data => {
          if (data.count !== undefined) setUnreadCount(data.count);
        })
        .catch(() => {});
    };
    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('lapd_cached_auth_user');
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = '/giris';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      
      {/* ── OFFICIAL GOVERNMENT HEADER BANNER ── */}
      <header style={{
        width: '100%',
        height: '72px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '3px solid var(--accent-primary)',
        padding: '0 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box',
        flexShrink: 0,
        zIndex: 20
      }}>
        {/* Left Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-primary)'}>
            <i className="fa-solid fa-bars" />
          </button>
          <Link href="/mdt" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem', cursor: 'pointer' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              overflow: 'hidden', border: '2px solid var(--border-light)',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
              flexShrink: 0
            }}>
              <img src="/lapd-logo.png" alt="LAC Official Seal" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'var(--accent-primary)' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.04em', fontFamily: "'Oswald', sans-serif" }}>
                LOS ANGELES C.P.D.
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
                MDT • MOBILE DATA TERMINAL
              </div>
            </div>
          </Link>
        </div>
        
        {/* Right User Info */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <ThemeToggle />
            {/* ── MAILBOX HEADER BUTTON ── */}
            <Link
              href="/mdt/mesajlar"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textDecoration: 'none',
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                backgroundColor: pathname === '/mdt/mesajlar' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                border: `1px solid ${pathname === '/mdt/mesajlar' ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                color: pathname === '/mdt/mesajlar' ? 'var(--bg-secondary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.84rem',
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.04em',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                if (pathname !== '/mdt/mesajlar') {
                  e.currentTarget.style.backgroundColor = 'var(--border-light)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseOut={e => {
                if (pathname !== '/mdt/mesajlar') {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <i className="fa-solid fa-envelope-open-text" style={{ color: pathname === '/mdt/mesajlar' ? 'var(--bg-secondary)' : 'var(--accent-primary)', fontSize: '1rem' }} />
              <span>GELEN KUTUSU</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: 'var(--accent-secondary)',
                  color: 'var(--bg-secondary)',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '0.12rem 0.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(232,79,42,0.3)',
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link href="/mdt/profil" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', transition: 'all 0.15s', padding: '0.4rem 0.7rem 0.4rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }} onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em' }}>
                  <span style={{ color: 'var(--accent-secondary)' }}>#{user.badge}</span>
                  <span>{user.name}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                  {user.role === 'admin' ? 'SYSTEM ADMIN' : 'OFFICER'} • {user.rank || 'Patrol'}
                </div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-secondary)', fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden', flexShrink: 0 }}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </Link>

            <button onClick={handleLogout} style={{ backgroundColor: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger)', borderRadius: '8px', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--color-danger-border)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'; e.currentTarget.style.color = 'var(--color-danger)'; }} title="Sistemden Çık">
              <i className="fa-solid fa-power-off" style={{ fontSize: '0.9rem' }} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Oswald', sans-serif" }}>
            <i className="fa-solid fa-circle-notch fa-spin" /> BAĞLANILIYOR...
          </div>
        )}
      </header>

      {/* ── CJIS COMPLIANT DISPATCH TICKER ── */}
      <div style={{
        backgroundColor: 'var(--color-warning-bg)',
        borderBottom: '1px solid var(--color-warning-border)',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 15,
        overflow: 'hidden'
      }}>
        <div style={{
           backgroundColor: 'var(--color-warning-border)',
           padding: '0 1.25rem',
           height: '100%',
           display: 'flex',
           alignItems: 'center',
           gap: '0.6rem',
           borderRight: '1px solid var(--color-warning-border)',
           color: 'var(--color-warning)',
           fontSize: '0.72rem',
           fontWeight: 800,
           letterSpacing: '0.14em',
           flexShrink: 0
        }}>
           <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 8px #F59E0B', animation: 'ping-pulse 2s infinite' }} />
           SYSTEM BROADCAST
        </div>
        <style jsx>{`
           @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
           @keyframes ping-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        `}</style>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 35s linear infinite', paddingRight: '100vw', fontSize: '0.75rem', fontWeight: 600, color: '#B45309', letterSpacing: '0.04em', fontFamily: "'Courier New', monospace" }}>
             [SYSTEM] LAC CENTRAL DISPATCH ONLINE. ALL OFFICERS ARE REQUIRED TO LOG THEIR SHIFTS VIA THE TIME & ATTENDANCE MODULE. SECURE CJIS NETWORK ACTIVE.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', zIndex: 10 }}>
        
        {/* ── OFFICIAL SIDEBAR DIRECTORY ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ 
                width: '280px',
                minWidth: '280px',
                height: '100%',
                backgroundColor: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-light)', 
                display: 'flex', 
                flexDirection: 'column', 
                flexShrink: 0,
                overflowY: 'hidden', /* we will handle scrolling in the inner div */
                boxShadow: '4px 0 15px rgba(0,0,0,0.02)',
                position: 'relative'
              }}
            >
              <style jsx global>{`
                aside::-webkit-scrollbar { width: 4px; }
                aside::-webkit-scrollbar-track { background: var(--bg-secondary); }
                aside::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 10px; }

                .sidebar-link {
                  position: relative;
                  display: flex !important;
                  flex-direction: row !important;
                  flex-wrap: nowrap !important;
                  align-items: center !important;
                  gap: 1rem !important;
                  padding: 0.75rem 1rem !important;
                  border-radius: 8px;
                  text-decoration: none;
                  font-size: 0.85rem;
                  font-weight: 500;
                  color: var(--text-secondary);
                  transition: all 0.2s ease;
                  border: 1px solid transparent;
                  white-space: nowrap !important;
                  margin: 0.2rem 1.5rem;
                }
                .sidebar-link span {
                  white-space: nowrap !important;
                  overflow: hidden !important;
                  text-overflow: ellipsis !important;
                }
                .sidebar-link:hover {
                  color: var(--text-primary);
                  background-color: var(--bg-tertiary);
                }
                .sidebar-link.active {
                  color: var(--text-primary);
                  background-color: var(--bg-tertiary);
                }
                
                .sidebar-link .icon-box {
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: var(--text-muted);
                  font-size: 0.95rem;
                  transition: all 0.2s ease;
                  flex-shrink: 0;
                }
                .sidebar-link.active .icon-box {
                  color: var(--text-primary);
                }
                .sidebar-link:hover .icon-box {
                  color: var(--text-primary);
                }
              `}</style>

              {/* Edit Mode Toggle Button */}
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: isEditMode ? 'var(--accent-secondary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0.5rem',
                  transition: 'color 0.2s',
                  zIndex: 10
                }}
                title="Sıralamayı Düzenle"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              
              {/* Profile Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem 2rem' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', 
                  backgroundColor: 'var(--accent-secondary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: '#FFF', fontWeight: 800, fontSize: '2rem', 
                  overflow: 'hidden', marginBottom: '1rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {user?.name || 'Bilinmiyor'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.2rem' }}>
                  {user?.role === 'admin' ? 'System Admin' : (user?.rank || 'Patrol Officer')}
                </div>
              </div>

              {/* Links */}
              <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
                <Reorder.Group axis="y" values={sidebarLinks} onReorder={handleReorder} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {sidebarLinks.map((link) => {
                    if (link.adminOnly && user?.role !== 'admin') return null;
                    
                    return (
                      <Reorder.Item 
                        key={link.id} 
                        value={link} 
                        dragListener={isEditMode}
                        style={{ cursor: isEditMode ? 'grab' : 'auto', position: 'relative' }}
                      >
                        {link.external ? (
                          <a href={link.path} target="_blank" rel="noopener noreferrer" className="sidebar-link" onClick={e => isEditMode && e.preventDefault()}>
                            {isEditMode && <i className="fa-solid fa-grip-vertical" style={{ color: 'var(--text-muted)', marginRight: '0.5rem', cursor: 'grab' }} />}
                            <div className="icon-box"><i className={`fa-solid ${link.icon}`} /></div> 
                            <span style={{ flex: 1 }}>{link.label}</span>
                          </a>
                        ) : (
                          <Link href={link.path} className={`sidebar-link ${pathname === link.path && !isEditMode ? 'active' : ''}`} onClick={e => isEditMode && e.preventDefault()}>
                            {isEditMode && <i className="fa-solid fa-grip-vertical" style={{ color: 'var(--text-muted)', marginRight: '0.5rem', cursor: 'grab' }} />}
                            <div className="icon-box"><i className={`fa-solid ${link.icon}`} /></div> 
                            <span style={{ flex: 1 }}>{link.label}</span>
                          </Link>
                        )}
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>

              {/* Bottom Footer (Status & Contact) */}
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block', boxShadow: '0 0 8px var(--color-success)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Available</span>
                    </div>
                    <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border-strong)', padding: '0.4rem 0.8rem', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      Logout
                    </button>
                 </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
