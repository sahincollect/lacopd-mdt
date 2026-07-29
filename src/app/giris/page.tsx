"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DEPARTMENTS = [
  "Patrol Division",
  "Detective Bureau",
  "SWAT",
  "Metro K-9",
  "Dive Unit",
  "Traffic Division",
  "GND (Gangs & Narcotics)",
];

const RANKS = [
  "Cadet",
  "Officer I",
  "Officer II",
  "Officer III",
  "Detective I",
  "Sergeant I",
  "Sergeant II",
  "Lieutenant I",
  "Captain",
];

export default function ResponsiveSplitScreenLogin() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register State
  const [regBadge, setRegBadge] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRank, setRegRank] = useState('Officer I');
  const [regDept, setRegDept] = useState('Patrol Division');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge, password, rememberMe }),
      });

      if (res.ok) {
        router.push('/mdt');
      } else {
        const data = await res.json();
        setError(data.message || 'Erişim reddedildi. Sicil numarası veya şifre geçersiz.');
      }
    } catch (err) {
      setError('Sistem sunucusuna bağlantı kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badge: regBadge,
          name: regName,
          password: regPassword,
          rank: regRank,
          department: regDept
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRegSuccess(true);
      } else {
        setRegError(data.message || 'Başvuru talebi sisteme kaydedilemedi.');
      }
    } catch (err) {
      setRegError('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.25rem',
      boxSizing: 'border-box',
      position: 'relative',
      fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: 'var(--lapd-bg)',
      color: 'var(--lapd-text-dark)'
    }}>
      {/* Return Home Button */}
      <Link href="/" style={{
        position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 50,
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 1rem', borderRadius: '8px',
        backgroundColor: 'white',
        border: '1px solid var(--lapd-border)',
        color: 'var(--lapd-text-dark)', fontSize: '0.85rem', fontWeight: 600,
        textDecoration: 'none', transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}
      onMouseOver={e => { e.currentTarget.style.color = 'var(--lapd-orange)'; }}
      onMouseOut={e => { e.currentTarget.style.color = 'var(--lapd-text-dark)'; }}
      >
        <i className="fa-solid fa-arrow-left"></i>
        Ana Sayfaya Dön
      </Link>

      <style jsx global>{`
        body, html {
          overflow: hidden !important;
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }
      `}</style>

      {/* ── MAIN SPLIT-SCREEN CARD CONTAINER ── */}
      <div style={{
          width: '100%',
          maxWidth: '1080px',
          maxHeight: 'calc(100vh - 2.5rem)',
          height: '100%',
          backgroundColor: 'white',
          border: '1px solid var(--lapd-border)',
          borderRadius: '16px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        {/* ================= LEFT SIDE: VISUAL PHOTO & BRANDING ================= */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2rem',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {/* USER PHOTO */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'url("/mdt-bg.jpeg")',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }} />

          {/* Bottom Gradient for Text Readability */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%',
            background: 'linear-gradient(to top, rgba(0, 18, 51, 0.9) 0%, transparent 100%)',
            zIndex: 1, pointerEvents: 'none'
          }} />

          {/* Top Brand Tag */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}>
              <img src="/lapd-logo.png" alt="LAC" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                LAC • MDT NETWORK
              </span>
              <div style={{ fontSize: '0.65rem', color: '#ffcc00', fontWeight: 700, letterSpacing: '0.1em', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                OFFICIAL SECURE PORTAL
              </div>
            </div>
          </div>

          {/* Bottom Headline & Subtitle */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: 'var(--lapd-orange)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, color: 'white', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Restricted Access
            </div>
            
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'white',
              margin: '0 0 0.5rem 0',
              lineHeight: 1.15
            }}>
              Protect. Serve. Command.
            </h2>
            
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '390px',
              fontWeight: 500
            }}>
              Los Angeles Polis Departmanı yetkili personeli için geliştirilmiş, gerçek zamanlı komuta ve koordinasyon ağı.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE: FORM ================= */}
        <div className="custom-scroll" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem 3rem',
          backgroundColor: '#fafafa',
          overflowY: 'auto',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
            
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <img src="/lapd-logo.png" alt="LAPD Logo" style={{ width: '60px', marginBottom: '1rem' }} />
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', margin: '0 0 0.3rem 0', letterSpacing: '-0.02em' }}>
                {activeTab === 'login' ? 'Sisteme Giriş Yapın' : 'Personel Başvurusu'}
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--lapd-text-muted)', margin: 0 }}>
                {activeTab === 'login' 
                  ? 'Rozet numaranız ve şifrenizle oturum açın.' 
                  : 'MDT erişimi için bilgilerinizi eksiksiz doldurun.'}
              </p>
            </div>

            {/* TAB SWITCHER */}
            <div style={{
              display: 'flex',
              backgroundColor: '#e5e7eb',
              padding: '4px',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', borderRadius: '6px',
                  backgroundColor: activeTab === 'login' ? 'white' : 'transparent',
                  color: activeTab === 'login' ? 'var(--lapd-blue-dark)' : '#6b7280',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: activeTab === 'login' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setRegError(''); }}
                style={{
                  flex: 1, padding: '0.7rem', border: 'none', borderRadius: '6px',
                  backgroundColor: activeTab === 'register' ? 'white' : 'transparent',
                  color: activeTab === 'register' ? 'var(--lapd-blue-dark)' : '#6b7280',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: activeTab === 'register' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Kayıt Ol
              </button>
            </div>

            {/* FORM CONTAINER */}
            <>
              {activeTab === 'login' ? (
                <form key="login" onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {error && (
                    <div style={{
                      backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                      color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
                    }}>
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      SİCİL / ROZET NUMARASI <span style={{ color: 'var(--lapd-orange)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 1222 veya 04-1234"
                      value={badge}
                      onChange={e => setBadge(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.8rem 1rem',
                        backgroundColor: 'white', border: '1px solid #d1d5db',
                        borderRadius: '8px', color: 'var(--lapd-text-dark)', fontSize: '0.9rem',
                        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--lapd-blue-dark)'}
                      onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      GÜVENLİK ŞİFRESİ <span style={{ color: 'var(--lapd-orange)' }}>*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.8rem 1rem',
                        backgroundColor: 'white', border: '1px solid #d1d5db',
                        borderRadius: '8px', color: 'var(--lapd-text-dark)', fontSize: '0.9rem',
                        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--lapd-blue-dark)'}
                      onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--lapd-blue-dark)' }}
                    />
                    <label htmlFor="remember" style={{ fontSize: '0.8rem', color: 'var(--lapd-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                      Oturumu Koru (24 Saat)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.9rem',
                      backgroundColor: 'var(--lapd-blue-dark)', color: '#ffffff',
                      border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 800,
                      cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--lapd-orange)')}
                    onMouseOut={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--lapd-blue-dark)')}
                  >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-right-to-bracket"></i>}
                    SİSTEME GİRİŞ YAP
                  </button>
                </form>
              ) : (
                <form key="register" onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {regSuccess ? (
                    <div style={{
                      backgroundColor: '#dcfce7', border: '1px solid #bbf7d0',
                      color: '#166534', padding: '1rem', borderRadius: '8px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><i className="fa-solid fa-circle-check"></i></div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>Başvuru Alındı!</div>
                      <div style={{ fontSize: '0.85rem' }}>
                        Yetki talebiniz sisteme iletildi. Onaylandıktan sonra giriş yapabilirsiniz.
                      </div>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('login'); setRegSuccess(false); }}
                        style={{
                          marginTop: '1rem', padding: '0.6rem 1.2rem', backgroundColor: '#166534',
                          color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem',
                          fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Giriş Ekranına Dön
                      </button>
                    </div>
                  ) : (
                    <>
                      {regError && (
                        <div style={{
                          backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                          color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
                        }}>
                          <i className="fa-solid fa-circle-exclamation"></i>
                          <span>{regError}</span>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.4rem' }}>
                            ROZET NO *
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: 1234"
                            value={regBadge}
                            onChange={e => setRegBadge(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '0.75rem',
                              backgroundColor: 'white', border: '1px solid #d1d5db',
                              borderRadius: '8px', color: 'var(--lapd-text-dark)', fontSize: '0.85rem',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--lapd-blue-dark)'}
                            onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.4rem' }}>
                            İSİM SOYİSİM *
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={regName}
                            onChange={e => setRegName(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '0.75rem',
                              backgroundColor: 'white', border: '1px solid #d1d5db',
                              borderRadius: '8px', color: 'var(--lapd-text-dark)', fontSize: '0.85rem',
                              outline: 'none', boxSizing: 'border-box'
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--lapd-blue-dark)'}
                            onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.4rem' }}>
                          BİRİM / DEPARTMAN *
                        </label>
                        <select
                          value={regDept}
                          onChange={e => setRegDept(e.target.value)}
                          style={{
                            width: '100%', padding: '0.75rem',
                            backgroundColor: 'white', border: '1px solid #d1d5db',
                            borderRadius: '8px', color: 'var(--lapd-text-dark)', fontSize: '0.85rem',
                            outline: 'none', boxSizing: 'border-box', cursor: 'pointer'
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = 'var(--lapd-blue-dark)'}
                          onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                        >
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.4rem' }}>
                          RÜTBE *
                        </label>
                        <select
                          value={regRank}
                          onChange={e => setRegRank(e.target.value)}
                          style={{
                            width: '100%', padding: '0.75rem',
                            backgroundColor: 'white', border: '1px solid #d1d5db',
                            borderRadius: '8px', color: 'var(--lapd-text-dark)', fontSize: '0.85rem',
                            outline: 'none', boxSizing: 'border-box', cursor: 'pointer'
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = 'var(--lapd-blue-dark)'}
                          onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                        >
                          {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--lapd-text-dark)', marginBottom: '0.4rem' }}>
                          GÜVENLİK ŞİFRESİ *
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: '0.75rem',
                            backgroundColor: 'white', border: '1px solid #d1d5db',
                            borderRadius: '8px', color: 'var(--lapd-text-dark)', fontSize: '0.85rem',
                            outline: 'none', boxSizing: 'border-box'
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = 'var(--lapd-blue-dark)'}
                          onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={regLoading}
                        style={{
                          width: '100%', padding: '0.9rem', marginTop: '0.5rem',
                          backgroundColor: 'var(--lapd-blue-dark)', color: '#ffffff',
                          border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 800,
                          cursor: regLoading ? 'not-allowed' : 'pointer', opacity: regLoading ? 0.7 : 1,
                          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={e => !regLoading && (e.currentTarget.style.backgroundColor = 'var(--lapd-orange)')}
                        onMouseOut={e => !regLoading && (e.currentTarget.style.backgroundColor = 'var(--lapd-blue-dark)')}
                      >
                        {regLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-user-plus"></i>}
                        BAŞVURUYU TAMAMLA
                      </button>
                    </>
                  )}
                </form>
              )}
            </>
            
            {/* Footer Copyright */}
            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <span><i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i> AES-256 TLS 1.3 Encrypted</span>
              <span>© 2026 LAPD Network</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
