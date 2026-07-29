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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0a0f1d', color: '#f1f5f9', overflow: 'hidden', position: 'relative', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      
      {/* Subtle Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#0a0f1d',
        zIndex: 0, pointerEvents: 'none'
      }} />

      {/* ── OFFICIAL GOVERNMENT HEADER BANNER ── */}
      <header style={{
        width: '100%',
        height: '72px',
        backgroundColor: '#080e1a',
        borderBottom: '3px solid #1d4ed8',
        padding: '0 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.45)',
        boxSizing: 'border-box',
        flexShrink: 0,
        zIndex: 20
      }}>
        {/* Left Logo & Title */}
        <Link href="/mdt" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem', cursor: 'pointer' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            overflow: 'hidden', border: '2px solid #cbd5e1',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
            flexShrink: 0
          }}>
            <img src="/lapd-logo.jpg" alt="LAC Official Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em', fontFamily: "'Oswald', sans-serif" }}>
              CITY OF LOS ANGELES — COMMUNITY
            </div>
            <div style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.1rem' }}>
              INTERNAL LAW ENFORCEMENT & MOBILE DATA TERMINAL PORTAL
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
                borderRadius: '10px',
                backgroundColor: pathname === '/mdt/mesajlar' ? 'rgba(14, 165, 233, 0.25)' : 'rgba(14, 165, 233, 0.1)',
                border: `1px solid ${pathname === '/mdt/mesajlar' ? '#38bdf8' : 'rgba(14, 165, 233, 0.35)'}`,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.84rem',
                fontFamily: "'Oswald', sans-serif",
                letterSpacing: '0.04em',
                boxShadow: pathname === '/mdt/mesajlar' ? '0 0 15px rgba(14, 165, 233, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.3)';
                e.currentTarget.style.borderColor = '#38bdf8';
              }}
              onMouseOut={e => {
                if (pathname !== '/mdt/mesajlar') {
                  e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.35)';
                }
              }}
            >
              <i className="fa-solid fa-envelope-open-text" style={{ color: '#38bdf8', fontSize: '1rem' }} />
              <span>MAIL BOX</span>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '0.12rem 0.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 0 10px #ef4444',
                  border: '1px solid #7f1d1d'
                }}>
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link href="/mdt/profil" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none', transition: 'all 0.15s', padding: '0.4rem 0.7rem 0.4rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(30, 58, 138, 0.2)', border: '1px solid rgba(29, 78, 216, 0.4)' }} onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)'; e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.35)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(29, 78, 216, 0.4)'; e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.2)'; }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.04em' }}>
                  <span style={{ color: '#60a5fa' }}>#{user.badge}</span>
                  <span>{user.name}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
                  {user.role === 'admin' ? 'SYSTEM ADMIN' : 'OFFICER'} • {user.rank || 'Patrol'}
                </div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfdbfe', fontWeight: 800, fontSize: '0.9rem', border: '1px solid #3b82f6', overflow: 'hidden', flexShrink: 0 }}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </Link>

            <button onClick={handleLogout} style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', borderRadius: '8px', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'; e.currentTarget.style.color = '#ffffff'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }} title="Sistemden Çık">
              <i className="fa-solid fa-power-off" style={{ fontSize: '0.9rem' }} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Oswald', sans-serif" }}>
            <i className="fa-solid fa-circle-notch fa-spin" /> TERMINAL BAĞLANTISI...
          </div>
        )}
      </header>

      {/* ── CJIS COMPLIANT DISPATCH TICKER ── */}
      <div style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        zIndex: 15,
        overflow: 'hidden'
      }}>
        <div style={{
           backgroundColor: '#1e293b',
           padding: '0 1.25rem',
           height: '100%',
           display: 'flex',
           alignItems: 'center',
           gap: '0.6rem',
           borderRight: '1px solid #334155',
           color: '#94a3b8',
           fontSize: '0.72rem',
           fontWeight: 800,
           letterSpacing: '0.14em',
           flexShrink: 0
        }}>
           <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'ping-pulse 2s infinite' }} />
           SYSTEM BROADCAST
        </div>
        <style jsx>{`
           @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
           @keyframes ping-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        `}</style>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 35s linear infinite', paddingRight: '100vw', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', letterSpacing: '0.04em', fontFamily: "'Courier New', monospace" }}>
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
          backgroundColor: '#0c1222',
          borderRight: '1px solid #1e293b', 
          padding: '1.25rem 1rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.25rem',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          <style jsx global>{`
            aside::-webkit-scrollbar { width: 4px; }
            aside::-webkit-scrollbar-track { background: #0c1222; }
            aside::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

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
              color: #94a3b8;
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
              color: #f1f5f9;
              background-color: #1e293b;
            }
            .sidebar-link.active {
              color: #ffffff;
              background-color: #1d4ed8;
              border: 1px solid #2563eb;
              box-shadow: 0 4px 12px rgba(29, 78, 216, 0.4);
            }
            
            .sidebar-link .icon-box {
              width: 26px;
              height: 26px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #64748b;
              font-size: 0.85rem;
              transition: all 0.15s ease;
              flex-shrink: 0;
            }
            .sidebar-link.active .icon-box {
              color: #ffffff;
            }
            .sidebar-link:hover .icon-box {
              color: #e2e8f0;
            }

            .group-title {
              font-size: 0.68rem;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.14em;
              margin-top: 1.25rem;
              margin-bottom: 0.5rem;
              padding-left: 0.6rem;
              font-weight: 800;
              font-family: "'Oswald', sans-serif";
            }
            
            .unread-badge {
              font-size: 0.6rem;
              font-weight: 800;
              background-color: #ef4444;
              color: #ffffff;
              padding: 0.15rem 0.5rem;
              border-radius: 20px;
              letter-spacing: 0.05em;
              margin-left: auto;
              box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
            }
          `}</style>
          
          <div className="group-title" style={{ marginTop: '0.3rem' }}>OPERASYONEL</div>

          <Link href="/mdt" className={`sidebar-link ${pathname === '/mdt' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-border-all" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Kontrol Paneli</span>
          </Link>
          <Link href="/mdt/mesai" className={`sidebar-link ${pathname === '/mdt/mesai' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-stopwatch" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Mesai Sistemi</span>
          </Link>
          <Link href="/mdt/kriminal" className={`sidebar-link ${pathname === '/mdt/kriminal' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-fingerprint" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Suçlu Kayıt</span>
          </Link>
          <a href="/rapor-portali" target="_blank" rel="noopener noreferrer" className="sidebar-link" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-file-signature" /></div> 
            <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Rapor Portalı</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.68rem', opacity: 0.6 }} />
          </a>

          <div className="group-title">DEPARTMAN</div>

          <Link href="/mdt/duyurular" className={`sidebar-link ${pathname === '/mdt/duyurular' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-tower-broadcast" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Duyurular</span>
          </Link>
          <Link href="/mdt/basvuru" className={`sidebar-link ${pathname === '/mdt/basvuru' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-id-badge" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Birim Başvurusu</span>
          </Link>

          <Link href="/mdt/mazeretler" className={`sidebar-link ${pathname === '/mdt/mazeretler' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-calendar-xmark" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>İzin Talepleri</span>
          </Link>
          <a href="/handbook/index.html?v=20260708_1" target="_blank" rel="noopener noreferrer" className="sidebar-link" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-book-bookmark" /></div> 
            <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Yönetmelikler</span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.68rem', color: '#38BDF8', opacity: 0.8 }} />
          </a>
          <Link href="/mdt/personel" className={`sidebar-link ${pathname === '/mdt/personel' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
            <div className="icon-box"><i className="fa-solid fa-users-viewfinder" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Personel Listesi</span>
          </Link>

          {user?.role === 'admin' && (
            <>
              <div className="group-title" style={{ color: '#38BDF8' }}>YÖNETİM</div>
              <Link href="/mdt/admin" className={`sidebar-link ${pathname === '/mdt/admin' ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
                <div className="icon-box"><i className="fa-solid fa-shield-halved" /></div> <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Admin Seçenekleri</span>
              </Link>
            </>
          )}

          {/* Bottom Profile Capsule */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <div style={{
              padding: '0.85rem',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    backgroundColor: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: '#38BDF8', fontSize: '0.85rem'
                  }}>
                    <i className="fa-solid fa-fingerprint" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.58rem', color: '#34D399', letterSpacing: '0.12em', fontWeight: 800 }}>ŞİFRELİ AĞ AKTİF</div>
                    <div style={{ fontSize: '0.8rem', color: '#FFF', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Bilinmiyor'}</div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                  <Link href="/mdt/profil" style={{ flex: 1 }}>
                    <button style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}>
                      PROFİL
                    </button>
                  </Link>
                  <button onClick={handleLogout} style={{ width: '34px', padding: '0.45rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.color = '#FFF'; }} title="Sistemden Çık">
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
