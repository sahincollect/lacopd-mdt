"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

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
  "Officer II",
  "Officer III",
  "Detective I",
  "Sergeant I",
  "Sergeant II",
  "Lieutenant I",
  "Captain",
];

export default function GirisPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [regBadge, setRegBadge] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRank, setRegRank] = useState('Cadet');
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
        setError(data.message || 'Sicil numarası veya şifre hatalı.');
      }
    } catch {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
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
        body: JSON.stringify({ badge: regBadge, name: regName, password: regPassword, rank: regRank, department: regDept }),
      });
      const data = await res.json();
      if (res.ok) setRegSuccess(true);
      else setRegError(data.message || 'Başvuru kaydedilemedi.');
    } catch {
      setRegError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setRegLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid var(--border-strong)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-secondary)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        .lapd-input:focus { border-color: var(--accent-primary) !important; box-shadow: 0 0 0 3px rgba(4,22,50,0.08) !important; }
        .login-btn:hover { background-color: var(--accent-secondary) !important; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { color: var(--accent-primary) !important; }
        .back-link:hover { color: var(--accent-secondary) !important; }
        .reg-btn:hover { background-color: var(--accent-secondary) !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .form-fade { animation: fadeIn 0.25s ease; }
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
                <img src="/lapd-logo.png" alt="LAPD" style={{ width: 34, height: 34, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ color: 'var(--bg-secondary)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em' }}>
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
                color: 'var(--bg-secondary)',
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
                color: 'var(--bg-secondary)',
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
                Yetkili personele özel komuta, dispeç ve koordinasyon platformu. Erişim yalnızca aktif badge numarası ile mümkündür.
              </p>
            </div>

            {/* Bottom: Security badges */}
            <div style={{ display: 'flex', gap: '20px', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              {[
                { icon: 'fa-lock', text: 'AES-256 Şifreli' },
                { icon: 'fa-shield-check', text: 'TLS 1.3' },
                { icon: 'fa-user-shield', text: 'İki Katmanlı Güvenlik' },
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

              {/* Tabs */}
              <div style={{
                display: 'flex',
                backgroundColor: 'var(--border-light)',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '2rem',
              }}>
                {(['login', 'register'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    className="tab-btn"
                    onClick={() => { setActiveTab(tab); setError(''); setRegError(''); }}
                    style={{
                      flex: 1,
                      padding: '9px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: activeTab === tab ? 'var(--bg-secondary)' : 'transparent',
                      color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    {tab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                  </button>
                ))}
              </div>

              {activeTab === 'login' ? (
                <div className="form-fade">
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
                      Hoş Geldiniz
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      MDT sistemine erişmek için giriş yapın.
                    </p>
                  </div>

                  {error && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                      color: '#DC2626', padding: '12px 14px', borderRadius: '8px',
                      fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem',
                    }}>
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div>
                      <label style={labelStyle}>Sicil / Rozet Numarası <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
                      <input
                        className="lapd-input"
                        type="text"
                        placeholder="Örn: 1222 veya 04-1234"
                        value={badge}
                        onChange={e => setBadge(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Güvenlik Şifresi <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
                      <input
                        className="lapd-input"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                      />
                      <label htmlFor="remember" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                        Oturumu 24 saat boyunca açık tut
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="login-btn"
                      style={{
                        width: '100%',
                        padding: '13px',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--bg-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        letterSpacing: '0.03em',
                        transition: 'background-color 0.2s',
                        fontFamily: 'inherit',
                        marginTop: '0.5rem',
                      }}
                    >
                      {loading
                        ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Doğrulanıyor...</>
                        : <><i className="fa-solid fa-right-to-bracket"></i> SİSTEME GİRİŞ YAP</>
                      }
                    </button>
                  </form>

                  <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                    Hesabınız yok mu?{' '}
                    <button onClick={() => setActiveTab('register')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 'inherit', padding: 0, fontFamily: 'inherit' }}>
                      Başvuru Yapın
                    </button>
                  </p>
                </div>
              ) : (
                <div className="form-fade" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                  {regSuccess ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                      <div style={{ width: 64, height: 64, backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.8rem', color: '#16A34A' }}>
                        <i className="fa-solid fa-check"></i>
                      </div>
                      <h3 style={{ margin: '0 0 8px', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.3rem' }}>Başvuru Alındı!</h3>
                      <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        Yetki talebiniz yönetime iletildi.<br />Onaylandıktan sonra giriş yapabilirsiniz.
                      </p>
                      <button
                        onClick={() => { setActiveTab('login'); setRegSuccess(false); }}
                        style={{ padding: '10px 24px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Giriş Ekranına Dön
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '1.75rem' }}>
                        <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
                          Personel Başvurusu
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          MDT erişimi için bilgilerinizi eksiksiz doldurun.
                        </p>
                      </div>

                      {regError && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
                          color: '#DC2626', padding: '12px 14px', borderRadius: '8px',
                          fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem',
                        }}>
                          <i className="fa-solid fa-circle-exclamation"></i>
                          {regError}
                        </div>
                      )}

                      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={labelStyle}>Rozet No <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
                            <input className="lapd-input" type="text" placeholder="1234" value={regBadge} onChange={e => setRegBadge(e.target.value)} required style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>İsim Soyisim <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
                            <input className="lapd-input" type="text" placeholder="John Doe" value={regName} onChange={e => setRegName(e.target.value)} required style={inputStyle} />
                          </div>
                        </div>

                        <div>
                          <label style={labelStyle}>Birim / Departman <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
                          <select value={regDept} onChange={e => setRegDept(e.target.value)} className="lapd-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={labelStyle}>Rütbe <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
                          <select value={regRank} onChange={e => setRegRank(e.target.value)} className="lapd-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                            {RANKS.map(r => <option key={r}>{r}</option>)}
                          </select>
                        </div>

                        <div>
                          <label style={labelStyle}>Şifre <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
                          <input className="lapd-input" type="password" placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required style={inputStyle} />
                        </div>

                        <button
                          type="submit"
                          disabled={regLoading}
                          className="reg-btn"
                          style={{
                            width: '100%', padding: '13px',
                            backgroundColor: 'var(--accent-primary)', color: 'var(--bg-secondary)',
                            border: 'none', borderRadius: '8px',
                            fontSize: '0.9rem', fontWeight: 800,
                            cursor: regLoading ? 'not-allowed' : 'pointer',
                            opacity: regLoading ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'background-color 0.2s', fontFamily: 'inherit', marginTop: '0.25rem',
                          }}
                        >
                          {regLoading
                            ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Gönderiliyor...</>
                            : <><i className="fa-solid fa-user-plus"></i> BAŞVURUYU TAMAMLA</>
                          }
                        </button>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Footer */}
              <div style={{
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}>
                <span><i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i>AES-256 TLS 1.3</span>
                <span>© 2026 LAC Police Department</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
