"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();

  // Memur paneli ve giriş sayfasında genel navigasyonu gizle
  if (pathname === '/giris' || pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali') || pathname?.startsWith('/basvurular')) {
    return null;
  }

  const navLinks = [
    { name: "HAKKIMIZDA", path: "/hakkimizda" },
    { name: "KARİYER", path: "/kariyer" },
    { name: "BAŞVURULAR", path: "/basvurular" },
    { name: "GALERİ", path: "/galeri" }
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
        <strong style={{ fontWeight: 800 }}>DUYURU!</strong> Los Angeles Polis Akademisi (Season 7) başvuruları başlamıştır. 
        <Link href="https://discord.gg/thelapd" target="_blank" style={{ color: 'var(--lapd-orange)', marginLeft: '10px', textDecoration: 'none', fontWeight: 600 }}>
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
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img 
            src="/lapd-logo.png" 
            alt="LAPD Logo" 
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} 
          />
        </Link>

        {/* Right: Nav & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          
          {/* Nav Links */}
          <nav style={{ display: 'flex', gap: '2rem' }}>
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                style={{ 
                  color: 'var(--lapd-text-dark)', 
                  textDecoration: 'none', 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  fontFamily: 'var(--font-inter)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {link.name}
                <span style={{ 
                  width: 0, height: 0, 
                  borderLeft: '4px solid transparent', 
                  borderRight: '4px solid transparent', 
                  borderTop: '4px solid var(--lapd-orange)',
                  marginTop: '2px'
                }}></span>
              </Link>
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
              MDT GİRİŞİ
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
