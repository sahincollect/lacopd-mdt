"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import ThemeToggle from '@/components/ThemeToggle';

export default function MDTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: authData } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    if (authData?.user) {
      setUser(authData.user);
    } else if (authData && !authData.user) {
      setUser(null);
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
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = '/giris';
  };

  const navLinks = [
    { label: "ANA PANEL", path: "/mdt" },
    { label: "RAPORLAR", path: "/mdt/raporlar" },
    { label: "MESAİ SİSTEMİ", path: "/mdt/mesai" },
    { label: "BİRİM BAŞVURULARI", path: "/mdt/basvuru" },
    { label: "PERSONEL LİSTESİ", path: "/mdt/personel" },
    { label: "YÖNETMELİKLER", path: "/mdt/yonetmelikler" },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ label: "ADMİN PANELİ", path: "/mdt/admin" });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--lapd-bg)', color: 'var(--text-primary)', fontFamily: "var(--font-inter)" }}>
      
      {/* ── TOP ALERT BAR ── */}
      <div style={{ 
        backgroundColor: 'var(--bg-tertiary)', 
        borderBottom: '1px solid var(--border-light)', 
        padding: '0.4rem 1rem', 
        textAlign: 'center', 
        fontSize: '0.75rem', 
        color: 'var(--text-primary)' 
      }}>
        <strong style={{ fontWeight: 800 }}>SİSTEM BİLDİRİMİ!</strong> Los Angeles C.P.D. Mobil Veri Terminali (MDT) aktif. Tüm işlemler kayıt altındadır.
      </div>

      {/* ── MAIN WHITE HEADER (Mimicking Navigation.tsx) ── */}
      <header style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
      }}>
        
        {/* Left: Logo */}
        <Link href="/mdt" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            overflow: 'hidden', border: '2px solid var(--lapd-blue-dark)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
            flexShrink: 0
          }}>
            <img 
              src="/lapd-logo.png" 
              alt="LAPD Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: 'var(--bg-primary)' }} 
            />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--lapd-blue-dark)', letterSpacing: '0.03em', fontFamily: "var(--font-oswald)", lineHeight: 1 }}>
              L.A.C.P.D.
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              MEMUR TERMİNALİ
            </div>
          </div>
        </Link>

        {/* Center: MDT Nav Links */}
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path}
                href={link.path} 
                style={{ 
                  color: isActive ? 'var(--lapd-orange)' : 'var(--text-primary)', 
                  textDecoration: 'none', 
                  fontSize: '0.82rem', 
                  fontWeight: 800, 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '1.5rem 0',
                  position: 'relative',
                  borderBottom: isActive ? '3px solid var(--lapd-orange)' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <ThemeToggle />
          
          <Link href="/mdt/mesajlar" style={{ position: 'relative', color: 'var(--text-primary)', fontSize: '1.2rem', textDecoration: 'none' }}>
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--lapd-orange)', color: "#fff", fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>
                {unreadCount}
              </span>
            )}
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user?.name || 'Yükleniyor...'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                #{user?.badge || '000'} | {user?.rank || 'Memur'}
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: 'var(--lapd-orange)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              ÇIKIŞ
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2.5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </main>

    </div>
  );
}
