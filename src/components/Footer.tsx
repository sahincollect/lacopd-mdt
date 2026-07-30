"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Footer() {
  const pathname = usePathname();

  // Memur paneli, giriş sayfası ve ana sayfada gizle (ana sayfada kendi bottom banner'ı var)
  if (pathname === '/giris' || pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali')) {
    return null;
  }

  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-light)',
      color: 'var(--text-secondary)',
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
          <Link href="/gizlilik" style={{ color: 'var(--text-primary)', marginLeft: '1rem', textDecoration: 'none', fontWeight: 600 }}>Gizlilik Politikası</Link>
          <Link href="/verilerim" style={{ color: 'var(--text-primary)', marginLeft: '1rem', textDecoration: 'none', fontWeight: 600 }}>Kişisel Verilerim</Link>
        </div>
        <div style={{ textAlign: 'right', lineHeight: 1.6, flexShrink: 0 }}>
          Bu web sitesi sadece <strong>FiveM Roleplay</strong> amaçlı geliştirilmiştir.<br/>
          <span style={{ color: 'var(--accent-secondary)' }}>Gerçek kurumlar veya LAC ile hiçbir ilgisi yoktur.</span>
        </div>
      </div>
    </footer>
  );
}
