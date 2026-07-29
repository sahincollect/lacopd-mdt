"use client";

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Memur paneli, giriş sayfası ve ana sayfada gizle (ana sayfada kendi bottom banner'ı var)
  if (pathname === '/giris' || pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali')) {
    return null;
  }

  return (
    <footer style={{
      backgroundColor: 'var(--lapd-blue-dark)',
      color: 'rgba(255,255,255,0.7)',
      padding: '1.5rem 2rem',
      marginTop: 'auto',
      fontSize: '0.75rem',
      fontFamily: 'var(--font-inter)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ flex: 1, lineHeight: 1.6 }}>
          Telif Hakkı &copy; {new Date().getFullYear()} Los Angeles Community Police Department ve LAC. Tüm hakları saklıdır.
          <a href="#" style={{ color: 'white', marginLeft: '1rem', textDecoration: 'none' }}>Gizlilik Politikası</a>
          <a href="#" style={{ color: 'white', marginLeft: '1rem', textDecoration: 'none' }}>Kişisel Verilerim</a>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'right', lineHeight: 1.6, flexShrink: 0 }}>
          Bu web sitesi sadece <strong>FiveM Roleplay</strong> amaçlı geliştirilmiştir.<br/>
          <span style={{ color: 'var(--lapd-orange)' }}>Gerçek kurumlar veya LAPD ile hiçbir ilgisi yoktur.</span>
        </div>
      </div>
    </footer>
  );
}
