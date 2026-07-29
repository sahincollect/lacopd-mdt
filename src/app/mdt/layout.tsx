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
  { id: 'rapor', label: 'Raporlar', icon: 'fa-file-signature', path: '/mdt/raporlar' },
  { id: 'duyurular', label: 'Duyurular', icon: 'fa-tower-broadcast', path: '/mdt/duyurular' },
  { id: 'basvuru', label: 'Birim Başvurusu', icon: 'fa-id-badge', path: '/mdt/basvuru' },
  { id: 'izin', label: 'İzin Talepleri', icon: 'fa-calendar-xmark', path: '/mdt/mazeretler' },
  { id: 'yonetmelik', label: 'Yönetmelikler', icon: 'fa-book-bookmark', path: '/mdt/yonetmelikler' },
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
      
      {/* ── FLOATING HAMBURGER MENU ── */}
      <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 50 }}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          style={{ 
            background: 'rgba(10,10,10,0.5)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-light)', 
            color: 'var(--text-primary)', 
            fontSize: '1.2rem', 
            cursor: 'pointer', 
            width: '40px', height: '40px',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }} 
          onMouseOver={e => e.currentTarget.style.background = 'rgba(10,10,10,0.8)'} 
          onMouseOut={e => e.currentTarget.style.background = 'rgba(10,10,10,0.5)'}
        >
          <i className="fa-solid fa-bars" />
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', zIndex: 10 }}>
        
        {/* ── OFFICIAL SIDEBAR DIRECTORY (BLACK GLASS) ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0, x: -50 }}
              animate={{ width: 280, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ 
                width: '280px',
                minWidth: '280px',
                height: '100%',
                backgroundColor: 'rgba(10, 10, 10, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex', 
                flexDirection: 'column', 
                flexShrink: 0,
                overflowY: 'hidden',
                boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
                position: 'relative',
                zIndex: 40
              }}
            >
              <style jsx global>{`
                aside::-webkit-scrollbar { width: 4px; }
                aside::-webkit-scrollbar-track { background: transparent; }
                aside::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }

                .sidebar-link {
                  position: relative;
                  display: flex !important;
                  flex-direction: row !important;
                  flex-wrap: nowrap !important;
                  align-items: center !important;
                  gap: 1rem !important;
                  padding: 0.75rem 1rem !important;
                  border-radius: 6px;
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
                  background-color: var(--bg-hover-subtle);
                }
                .sidebar-link.active {
                  color: var(--accent-primary);
                  background-color: var(--bg-tertiary);
                  border: 1px solid var(--border-light);
                  font-weight: 700;
                }
                
                .sidebar-link .icon-box {
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: inherit;
                  font-size: 0.95rem;
                  transition: all 0.2s ease;
                  flex-shrink: 0;
                  opacity: 0.7;
                }
                .sidebar-link.active .icon-box {
                  opacity: 1;
                  color: var(--accent-primary);
                }
                .sidebar-link:hover .icon-box {
                  opacity: 1;
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
                  color: isEditMode ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.4)',
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
              
              {/* Logo & Profile Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 1.5rem 2rem' }}>
                <img src="/lapd-logo.png" alt="LAPD" style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: '0.8rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: "var(--text-primary)", letterSpacing: '0.04em', fontFamily: "'Oswald', sans-serif" }}>
                  LOS ANGELES C.P.D.
                </div>
                
                <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 700 }}>
                    {user?.name || 'Bilinmiyor'} <span style={{ opacity: 0.7, fontWeight: 500 }}>#{user?.badge || '0000'}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {user?.role === 'admin' ? 'System Admin' : (user?.rank || 'Patrol Officer')}
                  </div>
                </div>
              </div>

              {/* Inbox Button */}
              <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
                <Link
                  href="/mdt/mesajlar"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    backgroundColor: 'rgba(232, 79, 42, 0.15)',
                    border: '1px solid rgba(232, 79, 42, 0.3)',
                    color: 'var(--accent-secondary)',
                    padding: '0.65rem', borderRadius: '8px',
                    textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem',
                    position: 'relative', transition: 'all 0.2s',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(232, 79, 42, 0.25)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(232, 79, 42, 0.15)'}
                >
                  <i className="fa-solid fa-envelope-open-text" /> GELEN KUTUSU
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--accent-secondary)', color: "var(--text-primary)", fontSize: '0.65rem', padding: '2px 7px', borderRadius: '10px', fontWeight: 800 }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
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
                            {isEditMode && <i className="fa-solid fa-grip-vertical" style={{ color: 'rgba(255,255,255,0.3)', marginRight: '0.5rem', cursor: 'grab' }} />}
                            <div className="icon-box"><i className={`fa-solid ${link.icon}`} /></div> 
                            <span style={{ flex: 1 }}>{link.label}</span>
                          </a>
                        ) : (
                          <Link href={link.path} className={`sidebar-link ${pathname === link.path && !isEditMode ? 'active' : ''}`} onClick={e => isEditMode && e.preventDefault()}>
                            {isEditMode && <i className="fa-solid fa-grip-vertical" style={{ color: 'rgba(255,255,255,0.3)', marginRight: '0.5rem', cursor: 'grab' }} />}
                            <div className="icon-box"><i className={`fa-solid ${link.icon}`} /></div> 
                            <span style={{ flex: 1 }}>{link.label}</span>
                          </Link>
                        )}
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>

              {/* Bottom Footer (Theme, Status & Logout) */}
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block', boxShadow: '0 0 8px var(--color-success)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Available</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <ThemeToggle />
                      <button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '6px', color: 'var(--color-danger)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'} title="Sistemden Çık">
                        Logout
                      </button>
                    </div>
                 </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          {/* ── CJIS COMPLIANT DISPATCH TICKER (MOVED TO TOP OF MAIN CONTENT) ── */}
          <div style={{
            backgroundColor: 'var(--color-warning-bg)',
            borderBottom: '1px solid var(--color-warning-border)',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 15,
            overflow: 'hidden',
            flexShrink: 0
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

          <div style={{ padding: '2rem 2.5rem', maxWidth: '1360px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
