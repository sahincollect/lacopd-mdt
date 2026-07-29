"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F9FAFB', color: '#1F2937', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      
      {/* ── OFFICIAL GOVERNMENT HEADER BANNER ── */}
      <header style={{
        width: '100%',
        height: '72px',
        backgroundColor: '#FFFFFF',
        borderBottom: '3px solid #041632',
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
        <Link href="/mdt" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem', cursor: 'pointer' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            overflow: 'hidden', border: '2px solid #E5E7EB',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
            flexShrink: 0
          }}>
            <img src="/lapd-logo.png" alt="LAC Official Seal" style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#041632' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#041632', letterSpacing: '0.04em', fontFamily: "'Oswald', sans-serif" }}>
              LOS ANGELES C.P.D.
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
              MDT • MOBILE DATA TERMINAL
            </div>
          </div>
        </Link>
        
        {/* Right User Info */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
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
                backgroundColor: pathname === '/mdt/mesajlar' ? '#041632' : '#F3F4F6',
                border: `1px solid ${pathname === '/mdt/mesajlar' ? '#041632' : '#E5E7EB'}`,
                color: pathname === '/mdt/mesajlar' ? '#FFFFFF' : '#4B5563',
                fontWeight: 700,
                fontSize: '0.84rem',
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.04em',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                if (pathname !== '/mdt/mesajlar') {
                  e.currentTarget.style.backgroundColor = '#E5E7EB';
                  e.currentTarget.style.color = '#1F2937';
                }
              }}
              onMouseOut={e => {
                if (pathname !== '/mdt/mesajlar') {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.color = '#4B5563';
                }
              }}
            >
              <i className="fa-solid fa-envelope-open-text" style={{ color: pathname === '/mdt/mesajlar' ? '#FFFFFF' : '#041632', fontSize: '1rem' }} />
              <span>GELEN KUTUSU</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#E84F2A',
                  color: '#ffffff',
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

            <Link href="/mdt/profil" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', transition: 'all 0.15s', padding: '0.4rem 0.7rem 0.4rem 1rem', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.backgroundColor = '#F9FAFB'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#041632', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em' }}>
                  <span style={{ color: '#E84F2A' }}>#{user.badge}</span>
                  <span>{user.name}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
                  {user.role === 'admin' ? 'SYSTEM ADMIN' : 'OFFICER'} • {user.rank || 'Patrol'}
                </div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#041632', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden', flexShrink: 0 }}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </Link>

            <button onClick={handleLogout} style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '8px', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }} title="Sistemden Çık">
              <i className="fa-solid fa-power-off" style={{ fontSize: '0.9rem' }} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#041632', fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Oswald', sans-serif" }}>
            <i className="fa-solid fa-circle-notch fa-spin" /> BAĞLANILIYOR...
          </div>
        )}
      </header>

      {/* ── CJIS COMPLIANT DISPATCH TICKER ── */}
      <div style={{
        backgroundColor: '#FFFBEB',
        borderBottom: '1px solid #FEF3C7',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 15,
        overflow: 'hidden'
      }}>
        <div style={{
           backgroundColor: '#FEF3C7',
           padding: '0 1.25rem',
           height: '100%',
           display: 'flex',
           alignItems: 'center',
           gap: '0.6rem',
           borderRight: '1px solid #FDE68A',
           color: '#92400E',
           fontSize: '0.72rem',
           fontWeight: 800,
           letterSpacing: '0.14em',
           flexShrink: 0
        }}>
           <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D97706', boxShadow: '0 0 8px #F59E0B', animation: 'ping-pulse 2s infinite' }} />
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
        <aside style={{ 
          width: '280px', 
          minWidth: '280px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E7EB', 
          padding: '1.25rem 1rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.25rem',
          flexShrink: 0,
          overflowY: 'auto',
          boxShadow: '4px 0 15px rgba(0,0,0,0.02)'
        }}>
          <style jsx global>{`
            aside::-webkit-scrollbar { width: 4px; }
            aside::-webkit-scrollbar-track { background: #FFFFFF; }
            aside::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }

            .sidebar-link {
              position: relative;
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              align-items: center !important;
              gap: 0.75rem !important;
              padding: 0.65rem 0.85rem !important;
              border-radius: 8px;
              text-decoration: none;
              font-size: 0.85rem;
              font-weight: 600;
              color: #4B5563;
              transition: all 0.15s ease;
              border: 1px solid transparent;
              white-space: nowrap !important;
            }
            .sidebar-link span {
              white-space: nowrap !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
            }
            .sidebar-link:hover {
              color: #1F2937;
              background-color: #F3F4F6;
            }
            .sidebar-link.active {
              color: #FFFFFF;
              background-color: #041632;
              border: 1px solid #041632;
              box-shadow: 0 4px 6px rgba(4, 22, 50, 0.2);
            }
            
            .sidebar-link .icon-box {
              width: 26px;
              height: 26px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6B7280;
              font-size: 0.85rem;
              transition: all 0.15s ease;
              flex-shrink: 0;
            }
            .sidebar-link.active .icon-box {
              color: #FFFFFF;
            }
            .sidebar-link:hover .icon-box {
              color: #374151;
            }
            .sidebar-link.active:hover .icon-box {
              color: #FFFFFF;
            }

            .group-title {
              font-size: 0.7rem;
              color: #9CA3AF;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-top: 1.25rem;
              margin-bottom: 0.5rem;
              padding-left: 0.6rem;
              font-weight: 800;
              font-family: "'Oswald', sans-serif";
            }
            
            .unread-badge {
              font-size: 0.6rem;
              font-weight: 800;
              background-color: #E84F2A;
              color: #ffffff;
              padding: 0.15rem 0.5rem;
              border-radius: 20px;
              letter-spacing: 0.05em;
              margin-left: auto;
            }
          `}</style>
          
          <div className="group-title" style={{ marginTop: '0.3rem' }}>OPERASYONEL</div>

          <Link href="/mdt" className={`sidebar-link ${pathname === '/mdt' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-border-all" /></div> <span style={{ flex: 1 }}>Kontrol Paneli</span>
          </Link>
          <Link href="/mdt/mesai" className={`sidebar-link ${pathname === '/mdt/mesai' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-stopwatch" /></div> <span style={{ flex: 1 }}>Mesai Sistemi</span>
          </Link>
          <Link href="/mdt/kriminal" className={`sidebar-link ${pathname === '/mdt/kriminal' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-fingerprint" /></div> <span style={{ flex: 1 }}>Suçlu Kayıt</span>
          </Link>
          <a href="/rapor-portali" target="_blank" rel="noopener noreferrer" className="sidebar-link">
            <div className="icon-box"><i className="fa-solid fa-file-signature" /></div> 
            <span style={{ flex: 1 }}>Rapor Portalı</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.68rem', opacity: 0.5 }} />
          </a>

          <div className="group-title">DEPARTMAN</div>

          <Link href="/mdt/duyurular" className={`sidebar-link ${pathname === '/mdt/duyurular' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-tower-broadcast" /></div> <span style={{ flex: 1 }}>Duyurular</span>
          </Link>
          <Link href="/mdt/basvuru" className={`sidebar-link ${pathname === '/mdt/basvuru' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-id-badge" /></div> <span style={{ flex: 1 }}>Birim Başvurusu</span>
          </Link>

          <Link href="/mdt/mazeretler" className={`sidebar-link ${pathname === '/mdt/mazeretler' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-calendar-xmark" /></div> <span style={{ flex: 1 }}>İzin Talepleri</span>
          </Link>
          <a href="/handbook/index.html?v=20260708_1" target="_blank" rel="noopener noreferrer" className="sidebar-link">
            <div className="icon-box"><i className="fa-solid fa-book-bookmark" /></div> 
            <span style={{ flex: 1 }}>Yönetmelikler</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.68rem', color: '#041632', opacity: 0.5 }} />
          </a>
          <Link href="/mdt/personel" className={`sidebar-link ${pathname === '/mdt/personel' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-users-viewfinder" /></div> <span style={{ flex: 1 }}>Personel Listesi</span>
          </Link>

          {user?.role === 'admin' && (
            <>
              <div className="group-title" style={{ color: '#E84F2A' }}>YÖNETİM</div>
              <Link href="/mdt/admin" className={`sidebar-link ${pathname === '/mdt/admin' ? 'active' : ''}`}>
                <div className="icon-box"><i className="fa-solid fa-shield-halved" /></div> <span style={{ flex: 1 }}>Admin Seçenekleri</span>
              </Link>
            </>
          )}

          {/* Bottom Profile Capsule */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <div style={{
              padding: '0.85rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '14px',
              border: '1px solid #E5E7EB'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: '#10B981', fontSize: '0.85rem'
                  }}>
                    <i className="fa-solid fa-lock" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.58rem', color: '#10B981', letterSpacing: '0.08em', fontWeight: 800 }}>GÜVENLİ AĞ AKTİF</div>
                    <div style={{ fontSize: '0.8rem', color: '#1F2937', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Bilinmiyor'}</div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                  <Link href="/mdt/profil" style={{ flex: 1 }}>
                    <button style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', backgroundColor: '#FFFFFF', color: '#4B5563', border: '1px solid #D1D5DB', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}>
                      PROFİL
                    </button>
                  </Link>
                  <button onClick={handleLogout} style={{ width: '34px', padding: '0.45rem', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; }} title="Sistemden Çık">
                     <i className="fa-solid fa-power-off" style={{ fontSize: '0.75rem' }} />
                  </button>
               </div>
            </div>
          </div>
        </aside>

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
