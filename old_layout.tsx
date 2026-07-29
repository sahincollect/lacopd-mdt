"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function MDTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(err => console.error(err));
      
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
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = '/giris';
  };

  const getSidebarLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.85rem 1.2rem',
      borderRadius: '8px',
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontWeight: isActive ? 600 : 500,
      transition: 'all 0.2s ease',
      borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
      boxShadow: isActive ? 'inset 0 0 15px rgba(0, 212, 255, 0.05)' : 'none'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-dark)', overflow: 'hidden', position: 'relative' }}>

      {/* Modern Background Grid/Glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100vw', height: '100vh',
        background: 'radial-gradient(ellipse at top, rgba(0, 212, 255, 0.04) 0%, rgba(7, 11, 20, 0) 60%)',
        zIndex: 0, pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 0, pointerEvents: 'none', opacity: 0.5
      }}></div>

      {/* TOP HEADER */}
      <header className="glass-panel" style={{ 
        height: '76px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 2.5rem',
        flexShrink: 0,
        zIndex: 10,
        borderBottom: '1px solid var(--border-light)',
        borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderRadius: 0
      }}>
        {/* Left Logo & Title */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textDecoration: 'none', cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}>
            <img src="/lapd-logo.jpg" alt="LAPD Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)' }} />
            <div style={{ position: 'absolute', bottom: 0, right: -4, width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', border: '2px solid var(--bg-panel)', boxShadow: '0 0 8px #22c55e' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, letterSpacing: '0.08em', lineHeight: '1.2' }}>
              LOS ANGELES POLICE DEPT.
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', fontFamily: "'Inter', sans-serif" }}>
                SECURE TERMINAL
              </span>
              <span style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', color: 'var(--accent-primary)', fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px', letterSpacing: '0.05em', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
                v3.0
              </span>
            </div>
          </div>
        </Link>
        
        {/* Right User Info */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/mdt/profil" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>#{user.badge} - {user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{user.role === 'admin' ? 'SYSTEM ADMIN' : 'OFFICER'}</div>
              </div>
              <div style={{ 
                width: '38px', height: '38px', borderRadius: '10px', 
                backgroundColor: 'rgba(0,212,255,0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.2rem',
                border: '1px solid rgba(0,212,255,0.3)',
                overflow: 'hidden'
              }}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </Link>
            <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--border-light)' }}></div>
            <button onClick={handleLogout} style={{ 
              background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', 
              padding: '0.6rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} 
            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = '#ef4444'; }}
            title="Sistemden ├ç─▒k">
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <i className="fa-solid fa-circle-notch fa-spin"></i> BA─ŞLANTI KURULUYOR...
          </div>
        )}
      </header>

      {/* GLOBAL DISPATCH TICKER (Sleeker) */}
      <div style={{
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: '#6ee7b7',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.15em',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
        zIndex: 9,
      }}>
        <div style={{
           backgroundColor: 'rgba(16, 185, 129, 0.2)',
           padding: '0.4rem 1.5rem',
           zIndex: 2,
           boxShadow: '10px 0 20px rgba(0,0,0,0.5)',
           display: 'flex',
           alignItems: 'center',
           gap: '0.5rem',
           borderRight: '1px solid rgba(16, 185, 129, 0.3)',
           color: '#10b981'
        }}>
           <i className="fa-solid fa-tower-broadcast" style={{ animation: 'pulse-icon 2s infinite' }}></i> GLOBAL_DISPATCH
        </div>
        <style>{`
           @keyframes marquee { 
             0% { transform: translateX(100vw); } 
             100% { transform: translateX(-100%); } 
           }
           @keyframes pulse-icon { 
             0%, 100% { opacity: 1; } 
             50% { opacity: 0.3; } 
           }
        `}</style>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'inline-block', whiteSpace: 'nowrap', animation: 'marquee 30s linear infinite', paddingRight: '100vw' }}>
             {"// G├£NCEL B─░LD─░R─░M // STANDART G├£VENL─░K PROTOKOL├£ AKT─░F. L├£TFEN MESA─░ DURUMLARINIZI G├£NCEL TUTUN VE MDT ├£ZER─░NDEN GELECEK B─░LD─░R─░MLER─░ TAK─░P ED─░N. DURUM KODU: 4 (G├£VENL─░). //"}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', zIndex: 1 }}>
        {/* EXPERIMENTAL LEFT SIDEBAR */}
        <aside style={{ 
          width: '300px', 
          height: '100%',
          backgroundColor: 'rgba(10, 15, 30, 0.65)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.05)', 
          padding: '1.5rem 1rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.4rem',
          flexShrink: 0,
          boxShadow: '10px 0 50px rgba(0,0,0,0.5)',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 20
        }}>
          <style>{`
            aside::-webkit-scrollbar { width: 4px; }
            aside::-webkit-scrollbar-track { background: transparent; }
            aside::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.2); border-radius: 10px; }
            aside::-webkit-scrollbar-thumb:hover { background: rgba(0, 212, 255, 0.4); }

            .sidebar-link {
              position: relative;
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 0.75rem 1rem;
              border-radius: 10px;
              text-decoration: none;
              font-size: 0.9rem;
              font-weight: 500;
              color: #94a3b8;
              transition: all 0.2s ease;
              border: 1px solid transparent;
            }
            .sidebar-link:hover {
              color: #e2e8f0;
              background-color: rgba(255,255,255,0.04);
            }
            .sidebar-link.active {
              color: #fff;
              background-color: rgba(255,255,255,0.08);
              font-weight: 600;
              box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
              border: 1px solid rgba(255,255,255,0.03);
            }
            
            /* Ultra-modern subtle glowing dot for active state */
            .sidebar-link.active::after {
              content: '';
              position: absolute;
              right: 12px;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #00d4ff;
              box-shadow: 0 0 10px #00d4ff;
            }

            .sidebar-link .icon-box {
              width: 28px;
              height: 28px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #64748b;
              transition: all 0.2s ease;
              font-size: 1rem;
            }
            .sidebar-link.active .icon-box {
              color: #00d4ff;
              background-color: rgba(0, 212, 255, 0.1);
            }
            .sidebar-link:hover .icon-box {
              color: #cbd5e1;
            }
            .sidebar-link.active:hover .icon-box {
              color: #00d4ff;
            }

            .group-title {
              font-size: 0.65rem;
              color: rgba(255,255,255,0.3);
              text-transform: uppercase;
              letter-spacing: 0.15em;
              margin-top: 1.2rem;
              margin-bottom: 0.5rem;
              padding-left: 0.5rem;
              font-weight: 800;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .group-title::after {
              content: '';
              flex: 1;
              height: 1px;
              background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent);
            }
            
            .unread-badge {
              font-size: 0.6rem;
              font-weight: 800;
              background-color: #f43f5e;
              color: #fff;
              padding: 0.1rem 0.4rem;
              border-radius: 20px;
              letter-spacing: 0.1em;
              box-shadow: 0 0 15px rgba(244, 63, 94, 0.6);
              animation: pulse-icon 2s infinite;
            }
          `}</style>
          
          <div className="group-title">OPERASYONEL</div>

          <Link href="/mdt" className={`sidebar-link ${pathname === '/mdt' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-border-all"></i></div> Kontrol Paneli
          </Link>
          <Link href="/mdt/mesai" className={`sidebar-link ${pathname === '/mdt/mesai' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-stopwatch"></i></div> Mesai Sistemi
          </Link>
          <Link href="/mdt/kriminal" className={`sidebar-link ${pathname === '/mdt/kriminal' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-fingerprint"></i></div> Su├ğlu Kay─▒t
          </Link>
          <Link href="/mdt/raporlar" className={`sidebar-link ${pathname === '/mdt/raporlar' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-file-signature"></i></div> Raporlar
          </Link>

          <div className="group-title">DEPARTMAN</div>

          <Link href="/mdt/duyurular" className={`sidebar-link ${pathname === '/mdt/duyurular' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-tower-broadcast"></i></div> Duyurular
          </Link>
          <Link href="/mdt/basvuru" className={`sidebar-link ${pathname === '/mdt/basvuru' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-id-badge"></i></div> Birim Ba┼şvurusu
          </Link>
          <Link href="/mdt/mesajlar" className={`sidebar-link ${pathname === '/mdt/mesajlar' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-envelope"></i></div> 
            <span style={{ flex: 1 }}>Mesajlar─▒m</span>
            {unreadCount > 0 && <span className="unread-badge">YEN─░</span>}
          </Link>
          <Link href="/mdt/mazeretler" className={`sidebar-link ${pathname === '/mdt/mazeretler' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-calendar-xmark"></i></div> ─░zin Talepleri
          </Link>
          <Link href="/mdt/yonetmelikler" className={`sidebar-link ${pathname === '/mdt/yonetmelikler' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-book-bookmark"></i></div> Y├Ânetmelikler
          </Link>
          <Link href="/mdt/personel" className={`sidebar-link ${pathname === '/mdt/personel' ? 'active' : ''}`}>
            <div className="icon-box"><i className="fa-solid fa-users-viewfinder"></i></div> Personel Listesi
          </Link>

          {user?.role === 'admin' && (
            <>
              <div className="group-title" style={{ color: 'rgba(244, 63, 94, 0.7)' }}>Y├£KSEK KOMUTA</div>
              <Link href="/mdt/admin" className={`sidebar-link ${pathname === '/mdt/admin' ? 'active' : ''}`}>
                <div className="icon-box"><i className="fa-solid fa-shield-halved"></i></div> Y├╝ksek Komuta
              </Link>
            </>
          )}

          {/* Spacer using margin-top: auto instead of flex: 1 to prevent scrolling overflow bugs */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            {/* Bottom Profile Area - Cyberpunk Style */}
            <div style={{
              position: 'relative', padding: '1rem',
              backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '38px', height: '38px', borderRadius: '10px', 
                    backgroundColor: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: '#00d4ff', fontSize: '1.1rem', boxShadow: '0 0 15px rgba(0,212,255,0.2)'
                  }}>
                    <i className="fa-solid fa-fingerprint"></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.6rem', color: '#64748b', letterSpacing: '0.15em', fontWeight: 800 }}>OTURUM A├çIK</div>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Bilinmiyor'}</div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <Link href="/mdt/profil" style={{ flex: 1 }}>
                    <button style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.2)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.1)'; }}>
                      PROF─░L
                    </button>
                  </Link>
                  <button onClick={handleLogout} style={{ width: '38px', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.2)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(244,63,94,0.1)'; }} title="├ç─▒k─▒┼ş Yap">
                     <i className="fa-solid fa-power-off"></i>
                  </button>
               </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
