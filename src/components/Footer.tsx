"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Memur paneli, giriş sayfası ve ana sayfada (scrollytelling) gizle
  if (pathname === '/' || pathname === '/giris' || pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali')) {
    return null;
  }

  return (
    <footer style={{
      backgroundColor: 'rgba(5, 8, 15, 0.95)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '4rem 5% 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4rem',
        justifyContent: 'space-between',
        marginBottom: '3rem'
      }}>
        
        {/* Brand Section */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <img src="/lapd-logo.png" alt="LAC Logo" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }} />
            <h2 style={{ 
              margin: 0, 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: 'white', 
              letterSpacing: '0.1em',
              fontFamily: "'Oswald', sans-serif"
            }}>
              LAC<span style={{ color: 'var(--accent-primary, #3B82F6)', fontWeight: 400 }}>PORTAL</span>
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '350px' }}>
            Los Angeles Polis Departmanı memurları ve departman yönetimi için geliştirilmiş yeni nesil resmi iletişim ve veritabanı portalı. Korumak ve hizmet etmek için tasarlandı.
          </p>
        </div>

        {/* Links Section */}
        <div style={{ flex: '1 1 200px', display: 'flex', gap: '4rem' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Hızlı Bağlantılar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Ana Sayfa</Link>
              <Link href="/hakkimizda" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Hakkımızda</Link>
              <Link href="/galeri" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Galeri</Link>
            </div>
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.05em' }}>Portal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/giris" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Memur Girişi</Link>
              <a href="https://discord.gg/thelapd" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Discord Destek</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        paddingTop: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} Los Angeles Community. Tüm Hakları Saklıdır.
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', lineHeight: '1.4', maxWidth: '800px' }}>
            <strong>Yasal Uyarı:</strong> Bu web sitesi, Grand Theft Auto V (FiveM) platformu üzerinde faaliyet gösteren kurgusal bir rol yapma (roleplay) topluluğu için hazırlanmıştır. Gerçek Los Angeles Polis Departmanı (LAC) veya herhangi bir resmi devlet kurumu ile hiçbir ticari veya resmi bağlantısı bulunmamaktadır.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="https://www.youtube.com/@Thelapd-7" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '1.3rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ff0000'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} title="YouTube"><i className="fa-brands fa-youtube"></i></a>
          <a href="https://www.tiktok.com/@thelapdfivem?lang=tr-TR" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'} title="TikTok"><i className="fa-brands fa-tiktok"></i></a>
        </div>
      </div>
    </footer>
  );
}
