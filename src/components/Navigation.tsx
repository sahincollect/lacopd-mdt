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
    { name: "Ana Sayfa", path: "/" },
    { name: "Hakkımızda", path: "/hakkimizda" },
    { name: "Kariyer", path: "/kariyer" },
    { name: "Başvurular", path: "/basvurular" },
    { name: "Galeri", path: "/galeri" }
  ];

  return (
    <div style={{ position: "sticky", top: "1rem", zIndex: 50, padding: "0 2rem", width: "100%", maxWidth: "1600px", margin: "0 auto", boxSizing: "border-box" }}>
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.8rem 2rem',
          backgroundColor: 'rgba(10, 15, 30, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.05)'
        }}
      >
        {/* Sol Logo Alanı */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', width: '250px', cursor: 'pointer' }}>
            <div style={{ position: 'relative' }}>
              <img src="/lapd-logo.jpg" alt="LAPD Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)', animation: 'pulse-blip 3s infinite' }}></div>
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.6rem', 
              fontWeight: 800, 
              color: 'white', 
              letterSpacing: '0.12em',
              fontFamily: "'Oswald', sans-serif",
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              LAPD<span style={{ color: 'var(--accent-primary, #3B82F6)', fontWeight: 400, textShadow: '0 0 15px rgba(59,130,246,0.6)' }}>PORTAL</span>
            </h1>
          </div>
        </Link>
        
        {/* Orta Menü */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path === '/mdt' && pathname?.startsWith('/mdt'));
            return (
              <Link href={link.path} key={link.path} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -2 }}
                  style={{
                    position: 'relative',
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '0.9rem', 
                    fontWeight: isActive ? 700 : 500, 
                    letterSpacing: '0.08em', 
                    textTransform: 'uppercase',
                    color: isActive ? '#60A5FA' : 'rgba(255,255,255,0.7)',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute',
                        bottom: -4,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)',
                        boxShadow: '0 0 10px #3B82F6'
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Sağ Butonlar */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end', width: '320px' }}>
          <motion.a 
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(88, 101, 242, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            href="https://discord.gg/thelapd" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              backgroundColor: 'rgba(88, 101, 242, 0.15)', border: '1px solid rgba(88, 101, 242, 0.5)', color: '#a5b4fc', 
              borderRadius: '12px', padding: '0.6rem 1.25rem', whiteSpace: 'nowrap', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', textDecoration: 'none'
            }}
          >
            <i className="fa-brands fa-discord"></i> DISCORD
          </motion.a>
          
          <Link href="/giris" style={{ textDecoration: 'none' }}>
            <motion.div 
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                border: 'none',
                color: '#fff',
                borderRadius: '12px',
                padding: '0.6rem 1.25rem',
                whiteSpace: 'nowrap',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                textShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <i className="fa-solid fa-shield-halved"></i> MEMUR GİRİŞİ
            </motion.div>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}
