"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Memur paneli ve giriş sayfasında genel navigasyonu gizle
  if (pathname === '/giris' || pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali')) {
    return null;
  }

  const navMenus = [
    { 
      name: "DEPARTMANIMIZ", 
      items: [
        { label: "Biz Kimiz?", path: "/hakkimizda" },
        { label: "Community Lead'den Mesaj", path: "/mesaj" },
        { label: "Medya ve Galeri", path: "/galeri" }
      ]
    },
    { 
      name: "HİZMETLER", 
      items: [
        { label: "Polis Raporu Oluştur", path: "/rapor-portali" },
        { label: "Trafik Kazası Raporu", path: "/rapor-portali" }
      ]
    },
    { 
      name: "BİLGİ & KARİYER", 
      items: [
        { label: "Aramıza Katıl", path: "/basvurular" },
        { label: "Kariyer Olanakları", path: "/kariyer" }
      ]
    }
  ];

  return (
    <div style={{ width: "100%", zIndex: 100, position: "relative" }}>
      
      {/* ── TOP ALERT BAR ── */}
      <div style={{ 
        backgroundColor: '#F9FAFB', 
        borderBottom: '1px solid var(--lapd-border)', 
        padding: '0.4rem 1rem', 
        textAlign: 'center', 
        fontSize: '0.75rem', 
        color: 'var(--lapd-text-dark)' 
      }}>
        <strong style={{ fontWeight: 800 }}>DUYURU!</strong> Los Angeles Polis Akademisi (Season 1) başvuruları başlamıştır. 
        <Link href="https://discord.com/invite/laco" target="_blank" style={{ color: 'var(--lapd-orange)', marginLeft: '10px', textDecoration: 'none', fontWeight: 600 }}>
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
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/lapd-logo.png" 
            alt="LAPD Logo" 
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <span style={{ color: 'var(--lapd-text-dark)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.02em', lineHeight: 1.2 }}>
            LOS ANGELES<br/>COMMUNITY
          </span>
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

                {/* Dropdown Box */}
                {activeMenu === menu.name && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '0',
                    backgroundColor: 'white',
                    border: '1px solid var(--lapd-border)',
                    borderTop: '3px solid var(--lapd-orange)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
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
                          e.currentTarget.style.backgroundColor = 'var(--lapd-gray-bg)';
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
                transition: 'background-color 0.2s',
                display: 'inline-block'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange)'}
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
