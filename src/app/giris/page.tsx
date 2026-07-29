"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#ffffff'
    }}>
      <style jsx global>{`
        /* Hide scrollbars across login viewport to ensure 100% fit without jumping */
        body, html {
          overflow: hidden !important;
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }
      `}</style>
      
      {/* ── ATMOSPHERIC SOFT BLURRED BACKGROUND PHOTO (`/mdt-bg.jpeg`) ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url("/mdt-bg.jpeg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        filter: 'blur(10px) brightness(0.65)',
        transform: 'scale(1.05)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Subtle Radial Overlay to add cinematic depth without darkening the photo too much */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at center, rgba(10, 15, 30, 0.22) 0%, rgba(4, 7, 16, 0.72) 100%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* ── MAIN SPLIT-SCREEN CARD CONTAINER (SCALES AND FITS WITHIN VIEWPORT) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '1080px',
          maxHeight: 'calc(100vh - 2.5rem)',
          height: '100%',
          backgroundColor: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 30px rgba(29, 78, 216, 0.2)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
          overflow: 'hidden',
          padding: '10px',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* ================= LEFT SIDE: VISUAL PHOTO & BRANDING ================= */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2rem',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          {/* USER PHOTO (/mdt-bg.jpeg) - ZERO DARKENING OVERLAY ON THE PHOTO ITSELF */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'url("/mdt-bg.jpeg")',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }} />

          {/* Subtle Bottom Gradient just behind the bottom text so typography reads sharp */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%',
            background: 'linear-gradient(to top, rgba(4, 7, 17, 0.96) 0%, rgba(4, 7, 17, 0.6) 55%, transparent 100%)',
            zIndex: 1, pointerEvents: 'none'
          }} />

          {/* Top Brand Tag inside photo */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              <img src="/lapd-logo.jpg" alt="LAC" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.08em', color: '#ffffff', fontFamily: "'Oswald', sans-serif" }}>
                LAC • MDT NETWORK
              </span>
              <div style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.12em' }}>
                MOBILE DATA TERMINAL v7.4
              </div>
            </div>
          </div>

          {/* Bottom Headline & Subtitle */}
          <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: 'rgba(30, 58, 138, 0.45)', border: '1px solid rgba(96, 165, 250, 0.3)', padding: '0.28rem 0.75rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, color: '#93c5fd', marginBottom: '0.75rem' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
              <span>OFFICIAL LAW ENFORCEMENT PORTAL</span>
            </div>
            
            <h2 style={{
              fontSize: '1.9rem',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 0.5rem 0',
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.03em',
              lineHeight: 1.15
            }}>
              Protect. Serve. Command.
            </h2>
            
            <p style={{
              fontSize: '0.8rem',
              color: '#cbd5e1',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '390px',
              fontWeight: 400
            }}>
              Los Angeles Polis Departmanı yetkili personeli için geliştirilmiş, gerçek zamanlı komuta, taktiksel dispeç ve birimler arası koordinasyon ağı.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE: MODERN FORM INTERFACE (SCROLLS IF NEEDED ON SHORT SCREENS) ================= */}
        <div className="custom-scroll" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '1.5rem 2.5rem',
          backgroundColor: '#0a0e1a',
          overflowY: 'auto',
          height: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ maxWidth: '370px', width: '100%', margin: '0 auto' }}>
            
            {/* Header Text */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.3rem 0', letterSpacing: '-0.02em' }}>
                {activeTab === 'login' ? 'Sisteme Giriş Yapın' : 'Personel Başvurusu Oluşturun'}
              </h1>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                {activeTab === 'login' 
                  ? 'Resmi rozet numaranız ve şifrenizle oturum açın.' 
                  : 'Sisteme kayıt için başvuru formunu eksiksiz doldurun.'}
              </p>
            </div>

            {/* SLEEK PILL TAB SWITCHER */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px',
              backgroundColor: '#111827',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              marginBottom: '1.25rem'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                style={{
                  padding: '0.6rem 0.8rem', border: 'none', borderRadius: '8px',
                  backgroundColor: activeTab === 'login' ? '#2563eb' : 'transparent',
                  color: activeTab === 'login' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: activeTab === 'login' ? '0 4px 10px rgba(37, 99, 235, 0.35)' : 'none'
                }}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setRegError(''); }}
                style={{
                  padding: '0.6rem 0.8rem', border: 'none', borderRadius: '8px',
                  backgroundColor: activeTab === 'register' ? '#2563eb' : 'transparent',
                  color: activeTab === 'register' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: activeTab === 'register' ? '0 4px 10px rgba(37, 99, 235, 0.35)' : 'none'
                }}
              >
                Kayıt Başvurusu
              </button>
            </div>

            {/* FORM CONTAINER */}
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleLogin}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}
                >
                  {error && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#fca5a5', padding: '0.7rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem',
                      display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
                    }}>
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                      SİCİL / ROZET NUMARASI <span style={{ color: '#38bdf8' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: 1222 veya 04-1234"
                      value={badge}
                      onChange={e => setBadge(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.75rem 0.9rem',
                        backgroundColor: '#111827', border: '1px solid #1f2937',
                        borderRadius: '10px', color: '#ffffff', fontSize: '0.88rem',
                        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={e => e.currentTarget.style.borderColor = '#1f2937'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                      GÜVENLİK ŞİFRESİ <span style={{ color: '#38bdf8' }}>*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.75rem 0.9rem',
                        backgroundColor: '#111827', border: '1px solid #1f2937',
                        borderRadius: '10px', color: '#ffffff', fontSize: '0.88rem',
                        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={e => e.currentTarget.style.borderColor = '#1f2937'}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        style={{ accentColor: '#2563eb', width: '15px', height: '15px', borderRadius: '4px' }}
                      />
                      <span>Oturumu Koru (24 Saat)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '0.3rem', width: '100%', padding: '0.85rem',
                      background: loading ? '#1e3a8a' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff', fontWeight: 800, fontSize: '0.9rem',
                      border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.55rem',
                      boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        <span>DOĞRULANIYOR...</span>
                      </>
                    ) : (
                      <>
                        <span>SİSTEME GİRİŞ YAP</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>

                  <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Yetki veya hesap başvurunuz yok mu?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Hemen Başvurun
                      </button>
                    </span>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleRegister}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  {regSuccess ? (
                    <div style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#6ee7b7', padding: '1.2rem', borderRadius: '14px', textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem', color: '#10b981' }}>
                        <i className="fa-solid fa-circle-check"></i>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.3rem', color: '#ffffff' }}>
                        Başvurunuz Alındı!
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#a7f3d0', lineHeight: 1.4 }}>
                        Kayıt talebiniz sistem yöneticilerine iletildi. Admin onayından sonra belirlediğiniz rozet numarası ve şifrenizle giriş yapabileceksiniz.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setRegSuccess(false); setActiveTab('login'); }}
                        style={{
                          marginTop: '1rem', padding: '0.65rem 1.2rem', backgroundColor: '#059669',
                          color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', border: 'none',
                          borderRadius: '8px', cursor: 'pointer'
                        }}
                      >
                        Giriş Ekranına Dön
                      </button>
                    </div>
                  ) : (
                    <>
                      {regError && (
                        <div style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#fca5a5', padding: '0.65rem 0.8rem', borderRadius: '10px', fontSize: '0.78rem',
                          display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600
                        }}>
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          <span>{regError}</span>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                            ROZET / SİCİL NO *
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: 33410"
                            value={regBadge}
                            onChange={e => setRegBadge(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '0.65rem 0.75rem', backgroundColor: '#111827',
                              border: '1px solid #1f2937', borderRadius: '8px', color: '#ffffff',
                              fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                            İSİM SOYİSİM *
                          </label>
                          <input
                            type="text"
                            placeholder="Örn: Lucas Miller"
                            value={regName}
                            onChange={e => setRegName(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '0.65rem 0.75rem', backgroundColor: '#111827',
                              border: '1px solid #1f2937', borderRadius: '8px', color: '#ffffff',
                              fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                            DEPARTMAN *
                          </label>
                          <select
                            value={regDept}
                            onChange={e => setRegDept(e.target.value)}
                            style={{
                              width: '100%', padding: '0.65rem 0.75rem', backgroundColor: '#111827',
                              border: '1px solid #1f2937', borderRadius: '8px', color: '#ffffff',
                              fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                            }}
                          >
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                            RÜTBE *
                          </label>
                          <select
                            value={regRank}
                            onChange={e => setRegRank(e.target.value)}
                            style={{
                              width: '100%', padding: '0.65rem 0.75rem', backgroundColor: '#111827',
                              border: '1px solid #1f2937', borderRadius: '8px', color: '#ffffff',
                              fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                            }}
                          >
                            {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                          ŞİFRE BELİRLEYİN *
                        </label>
                        <input
                          type="password"
                          placeholder="Güvenlik şifrenizi oluşturun"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: '0.65rem 0.75rem', backgroundColor: '#111827',
                            border: '1px solid #1f2937', borderRadius: '8px', color: '#ffffff',
                            fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={regLoading}
                        style={{
                          marginTop: '0.3rem', width: '100%', padding: '0.8rem',
                          background: regLoading ? '#047857' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff', fontWeight: 800, fontSize: '0.88rem',
                          border: 'none', borderRadius: '10px', cursor: regLoading ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          boxShadow: '0 6px 14px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        {regLoading ? 'BAŞVURU İŞLENİYOR...' : 'BAŞVURUNU ONAYA GÖNDER'}
                      </button>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Bottom Security Note */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <i className="fa-solid fa-lock" style={{ color: '#3b82f6' }}></i>
                <span>AES-256 TLS 1.3 Encrypted</span>
              </div>
              <span>LAC High Command © 2026</span>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
