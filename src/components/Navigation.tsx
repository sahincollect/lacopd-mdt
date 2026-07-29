"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Memur paneli ve giriş sayfasında genel navigasyonu gizle
  if (pathname === '/giris' || pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali')) {
    return null;
  }

  const navMenus = [
    { 
      name: "ANA SAYFA", 
      path: "/"
    },
    { 
      name: "HAKKIMIZDA", 
      items: [
        { label: "Biz Kimiz?", path: "/hakkimizda" },
        { label: "Community Lead'den Mesaj", path: "/mesaj" }
      ]
    },
    { 
      name: "GALERİ", 
      path: "/galeri"
    },
    { 
      name: "HABERLER", 
      path: "/haberler"
    },
    { 
      name: "KARİYER", 
      items: [
        { label: "Akademi Başvurusu", path: "/basvurular/memur" },
        { label: "Ride-Along Programı", path: "/basvurular/ride-along" },
        { label: "Kariyer Olanakları", path: "/kariyer" }
      ]
    },
    { 
      name: "İLETİŞİM", 
      items: [
        { label: "Memur Şikayet Formu", path: "/basvurular/sikayet" },
        { label: "Departman İletişimi", path: "/iletisim" }
      ]
    }
  ];

  return (
    <div style={{ width: "100%", zIndex: 100, position: "relative" }}>
      
      {/* ── TOP ALERT BAR ── */}
      <div style={{ 
        backgroundColor: 'var(--bg-tertiary)', 
        borderBottom: '1px solid var(--border-light)', 
        padding: '0.4rem 1rem', 
        textAlign: 'center', 
        fontSize: '0.75rem', 
        color: 'var(--text-primary)' 
      }}>
        <strong style={{ fontWeight: 800 }}>DUYURU!</strong> Los Angeles Polis Akademisi (Season 1) başvuruları başlamıştır. 
        <Link href="https://discord.com/invite/laco" target="_blank" style={{ color: 'var(--accent-secondary)', marginLeft: '10px', textDecoration: 'none', fontWeight: 600 }}>
          — Detaylı Bilgi Alın
        </Link>
      </div>

      {/* ── MAIN WHITE HEADER ── */}
      <div style={{
        backgroundColor: 'var(--lapd-bg)',
        borderBottom: '1px solid var(--lapd-border)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        boxSizing: 'border-box'
      }}>
        
        {/* Left: Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            overflow: 'hidden', border: '2px solid var(--border-strong)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
            flexShrink: 0
          }}>
            <img 
              src="/lapd-logo.png" 
              alt="LAPD Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'var(--accent-primary)' }} 
            />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.03em', fontFamily: "'Oswald', sans-serif", lineHeight: 1 }}>
              LOS ANGELES C.P.D.
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              RESMİ WEB PORTALI
            </div>
          </div>
        </Link>

        {/* Right: Nav & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          
          {/* Nav Links (Dropdown) */}
          <nav style={{ display: 'flex', gap: '2rem' }}>
            {navMenus.map((menu) => (
              <div 
                key={menu.name}
                onMouseEnter={() => setActiveMenu(menu.name)}
                onMouseLeave={() => setActiveMenu(null)}
                style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', padding: '20px 0' }}
              >
                {menu.path ? (
                  <Link href={menu.path} style={{ 
                    color: 'var(--lapd-text-dark)', 
                    textDecoration: 'none', 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    fontFamily: 'var(--font-inter)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}>
                    {menu.name}
                  </Link>
                ) : (
                  <div style={{ 
                    color: 'var(--lapd-text-dark)', 
                    textDecoration: 'none', 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    fontFamily: 'var(--font-inter)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}>
                    {menu.name}
                    <span style={{ 
                      width: 0, height: 0, 
                      borderLeft: '4px solid transparent', 
                      borderRight: '4px solid transparent', 
                      borderTop: `4px solid ${activeMenu === menu.name ? 'var(--lapd-orange)' : 'var(--lapd-text-dark)'}`,
                      marginTop: '2px',
                      transition: 'border-top-color 0.2s'
                    }}></span>
                  </div>
                )}

                {/* Dropdown Box */}
                {activeMenu === menu.name && menu.items && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--lapd-border)',
                    borderTop: '3px solid var(--lapd-orange)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    minWidth: '250px',
                    zIndex: 200,
                    padding: '0.5rem 0'
                  }}>
                    {menu.items.map(item => (
                      <Link 
                        key={item.label}
                        href={item.path}
                        style={{
                          display: 'block',
                          padding: '0.8rem 1.5rem',
                          color: 'var(--lapd-text-dark)',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          transition: 'background-color 0.2s, color 0.2s'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                          e.currentTarget.style.color = 'var(--lapd-orange)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--lapd-text-dark)';
                        }}
                        onClick={() => setActiveMenu(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <ThemeToggle />
            <Link 
              href="/giris" 
              style={{
                backgroundColor: 'var(--lapd-orange)',
                color: 'white',
                padding: '0.6rem 1.25rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                fontFamily: 'var(--font-inter)',
                transition: 'opacity 0.2s',
                display: 'inline-block'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              PERSONEL GİRİŞİ
            </Link>
            
            <button style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: 'var(--lapd-text-dark)', fontSize: '1.1rem' 
            }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
