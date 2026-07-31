"use client";

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function GirisPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <GirisPageContent />
    </Suspense>
  );
}

function GirisPageContent() {
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'discord_denied') setError('Discord ile giriş reddedildi.');
      else if (errorParam === 'not_in_server') setError('LA COMMUNITY sunucusunda bulunmuyorsunuz.');
      else if (errorParam === 'missing_role') setError('Los Angeles Police Department rolüne sahip değilsiniz.');
      else if (errorParam === 'invalid_nickname_format') setError('Sunucudaki takma adınız hatalı. (Örn: [101] Ador Vance) olmalıdır.');
      else setError('Discord ile giriş yapılırken bir hata oluştu.');
    }
  }, [searchParams]);

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .discord-btn:hover { opacity: 0.9 !important; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(88,101,242,0.3) !important; }
        .back-link:hover { color: var(--accent-secondary) !important; }
        .academy-link:hover { text-decoration: underline !important; color: var(--accent-primary) !important; }
        .support-link:hover { text-decoration: underline !important; color: #5865F2 !important; }
      `}</style>

      <div style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
      }}>
        {/* ── LEFT PANEL: BRANDING ── */}
        <div style={{
          flex: '0 0 52%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Background photo */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url("/mdt-bg.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          {/* Dark gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(4,22,50,0.88) 0%, rgba(4,22,50,0.65) 60%, rgba(232,79,42,0.25) 100%)',
          }} />
          {/* Subtle grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px),
              repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px)`,
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '2.5rem 3rem' }}>
            
            {/* Top: Logo + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: 48, height: 48,
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}>
                <img src="/lac-logo.png" alt="LAC" style={{ width: 34, height: 34, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
                  LOS ANGELES C.P.D.
                </div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em' }}>
                  MOBILE DATA TERMINAL
                </div>
              </div>
            </div>

            {/* Middle: Main tagline */}
            <div style={{ marginTop: 'auto', marginBottom: 'auto', paddingTop: '2rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'var(--accent-secondary)',
                color: '#000000',
                padding: '5px 14px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}>
                <i className="fa-solid fa-shield-halved"></i>
                OFFICIAL RESTRICTED ACCESS
              </div>

              <h1 style={{
                color: '#FFFFFF',
                fontSize: '3.2rem',
                fontWeight: 900,
                lineHeight: 1.1,
                margin: '0 0 1.5rem 0',
                letterSpacing: '-0.02em',
              }}>
                Protect.<br />Serve.<br />
                <span style={{ color: 'var(--accent-secondary)' }}>Command.</span>
              </h1>

              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1rem',
                lineHeight: 1.7,
                margin: 0,
                maxWidth: '420px',
              }}>
                Yetkili personele özel komuta, dispeç ve koordinasyon platformu. Erişim yalnızca aktif personeller için açıktır.
              </p>
            </div>

            {/* Bottom: Security badges */}
            <div style={{ display: 'flex', gap: '20px', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              {[
                { icon: 'fa-lock', text: 'AES-256 Şifreli' },
                { icon: 'fa-shield-check', text: 'TLS 1.3' },
                { icon: 'fa-user-shield', text: 'OAuth2 Güvenliği' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600 }}>
                  <i className={`fa-solid ${item.icon}`}></i>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: FORM ── */}
        <div style={{
          flex: 1,
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Top bar */}
          <div style={{
            padding: '1.25rem 2.5rem',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              MDT PERSONEL PORTALI
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <ThemeToggle />
              <Link href="/" className="back-link" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)',
                textDecoration: 'none', transition: 'color 0.2s',
              }}>
                <i className="fa-solid fa-arrow-left"></i>
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>

          {/* Form area */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            overflowY: 'auto',
          }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>

              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 10px', fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
                  Sisteme Giriş
                </h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  MDT veritabanına erişmek için Discord hesabınızı kullanarak kimliğinizi doğrulayın.
                </p>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                  color: '#DC2626', padding: '12px 14px', borderRadius: '8px',
                  fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem',
                }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <a
                href="/api/auth/discord/login"
                className="discord-btn"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '16px',
                  backgroundColor: '#5865F2', color: '#FFF',
                  border: 'none', borderRadius: '10px',
                  fontSize: '1rem', fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 10px rgba(88,101,242,0.2)',
                  boxSizing: 'border-box'
                }}
              >
                <i className="fa-brands fa-discord" style={{ fontSize: '1.4rem' }}></i>
                Discord ile Giriş Yap
              </a>

              {/* Trust Badge / Security Info */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{ color: '#00d26a', fontSize: '1.2rem', marginTop: '2px' }}>
                  <i className="fa-solid fa-shield-check"></i>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Güvenli Doğrulama</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    MDT sistemi yalnızca <strong style={{ color: 'var(--text-primary)' }}>Genel Profil Bilgilerinize (Kullanıcı Adı, Profil Fotoğrafı)</strong> ve sunucudaki <strong style={{ color: 'var(--text-primary)' }}>Rollerinize</strong> erişim sağlar. Mesajlarınız, arkadaşlarınız veya özel verileriniz <u>kesinlikle görüntülenemez.</u> Endişe etmenize gerek yoktur.
                  </p>
                </div>
              </div>

              {/* Helpful Links */}
              <div style={{ 
                marginTop: '2.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid var(--border-light)'
              }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Faydalı Bağlantılar</h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ width: 28, height: 28, backgroundColor: 'rgba(29,110,247,0.1)', color: 'var(--accent-primary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-file-signature"></i>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>MDT'de kaydınız yok mu? </span>
                    <a href="https://discord.gg/lacommunity" target="_blank" rel="noreferrer" className="academy-link" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                      Akademi Başvuru formunu doldurun.
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ width: 28, height: 28, backgroundColor: 'rgba(88,101,242,0.1)', color: '#5865F2', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-brands fa-discord"></i>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Giriş yapamıyor musunuz? </span>
                    <a href="https://discord.gg/lacommunity" target="_blank" rel="noreferrer" className="support-link" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
                      Destek Talebi açın.
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: '3rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}>
                <span><i className="fa-solid fa-code" style={{ marginRight: '5px' }}></i>v2.0.0</span>
                <span>© 2026 LAC Police Department</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}