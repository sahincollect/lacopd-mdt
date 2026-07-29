"use client";

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  { id: 'hero',  bg: '/gallery/lapdtoren3.png' },
  { id: 'man1',  bg: '/gallery/1.png' },
  { id: 'man2',  bg: '/gallery/3.png' },
  { id: 'man3',  bg: '/gallery/6.png' },
  { id: 'bur1',  bg: '/gallery/saspbenz.png' },
  { id: 'bur2',  bg: '/gallery/8.png' },
  { id: 'bur3',  bg: '/gallery/9.png' },
  { id: 'bur4',  bg: '/gallery/statecar.png' },
  { id: 'bur5',  bg: '/gallery/statecar5.png' },
  { id: 'portal',bg: '/gallery/lspd7.png' },
];

const UNIT_STAGES = [
  { label: 'DIVISION 01 // ACTIVE',           text: 'PATROL',      color: '#60A5FA' },
  { label: 'TACTICAL // STANDBY',              text: 'S.W.A.T',     color: '#EF4444' },
  { label: 'INVESTIGATION // CLASSIFIED',      text: 'DETECTIVES',  color: '#EAB308' },
  { label: 'AIR SUPPORT // ACTIVE',            text: 'AIR UNIT',    color: '#38BDF8' },
  { label: 'HIGHWAY SAFETY // ENFORCEMENT',    text: 'TRAFFIC',     color: '#F97316' },
];

export default function Home() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [activeStage, setActiveStage] = useState(0);
  const isScrolling = useRef(false);
  const touchStart = useRef(0);

  const [loginStatus, setLoginStatus] = useState('SYSTEM STANDBY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeStr, setTimeStr] = useState('00:00:00 PST');

  const goTo = (n: number) => {
    if (isScrolling.current) return;
    const next = Math.max(0, Math.min(STAGES.length - 1, n));
    if (next === activeStage) return;
    isScrolling.current = true;
    setActiveStage(next);
    setTimeout(() => { isScrolling.current = false; }, 1100);
  };

  // Wheel
  useEffect(() => {
    if (booting) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 15) return;
      goTo(activeStage + (e.deltaY > 0 ? 1 : -1));
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [activeStage, booting]);

  // Touch
  useEffect(() => {
    if (booting) return;
    const ts = (e: TouchEvent) => { touchStart.current = e.touches[0].clientY; };
    const te = (e: TouchEvent) => {
      const d = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(d) > 40) goTo(activeStage + (d > 0 ? 1 : -1));
    };
    window.addEventListener('touchstart', ts);
    window.addEventListener('touchend', te);
    return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te); };
  }, [activeStage, booting]);

  // Keyboard
  useEffect(() => {
    if (booting) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') goTo(activeStage + 1);
      if (e.key === 'ArrowUp') goTo(activeStage - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeStage, booting]);

  // Clock
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' PST');
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Boot — show every 12 hours
  useEffect(() => {
    const TWELVE_H = 12 * 60 * 60 * 1000;
    const last = localStorage.getItem('lapd_boot_ts');
    const now = Date.now();
    if (last && now - parseInt(last, 10) < TWELVE_H) {
      // Seen within 12h — skip
      document.body.style.overflow = 'hidden';
      setBooting(false);
      return;
    }
    localStorage.setItem('lapd_boot_ts', String(now));
    // Animation takes ~1.8s, hide shortly after
    const t = setTimeout(() => {
      document.body.style.overflow = 'hidden';
      setBooting(false);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  // Restore scroll when navigating away from home page
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const [redirecting, setRedirecting] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setRedirecting(true);
    // Short delay just for the fade animation to play
    setTimeout(() => router.push('/giris'), 600);
  };

  // unit stage index (stages 4-8 map to unit 0-4)
  const unitIndex = activeStage >= 4 && activeStage <= 8 ? activeStage - 4 : -1;
  const unit = unitIndex >= 0 ? UNIT_STAGES[unitIndex] : null;
  const isPortal = activeStage === 9;
  const isHero = activeStage === 0;
  const isManifesto = activeStage >= 1 && activeStage <= 3;
  const manifestoIndex = isManifesto ? activeStage - 1 : 0;

  const MANIFESTOS = [
    {
      tag: '01. BİRİNCİ DİREKTİF',
      line1: 'Şehrin kalbinde, kaosun karşısındayız.',
      line2: 'Düzen, sarsılmaz bir iradeyle sağlanır.',
      dir: 'left',
    },
    {
      tag: '02. OPERASYONEL AĞ',
      line1: 'Gecenin karanlığında bile,',
      line2: 'adaletin ışığı sönmez.',
      dir: 'right',
    },
    {
      tag: '03. MUTLAK OTORİTE',
      line1: 'Korumak ve hizmet etmek.',
      line2: 'Bizim yeminimiz şehrin teminatıdır.',
      dir: 'left',
    },
  ];

  const getDotStyle = (active: boolean): React.CSSProperties => ({
    width: active ? 10 : 8, height: active ? 10 : 8,
    borderRadius: '50%',
    background: active ? '#ffffff' : 'rgba(255,255,255,0.2)',
    boxShadow: active ? '0 0 15px rgba(255,255,255,0.9), 0 0 5px #fff' : 'none',
    cursor: 'pointer', border: 'none', padding: 4,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', display: 'block',
  });

  const S: Record<string, React.CSSProperties> = {
    page: {
      position: 'fixed', inset: 0, width: '100vw', height: '100vh',
      background: '#02040a', overflow: 'hidden', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    bgImg: {
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      objectFit: 'cover', filter: 'brightness(0.65) contrast(1.1)',
    },
    bgOverlay: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to bottom, rgba(2,4,10,0.35) 0%, rgba(2,4,10,0.55) 60%, rgba(2,4,10,0.92) 100%)',
    },
    hudTop: {
      position: 'fixed', top: 72, left: 0, right: 0, padding: '0 2.5rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      zIndex: 60, pointerEvents: 'none', fontFamily: 'monospace',
      letterSpacing: '0.25em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)',
    },
    rec: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    recDot: {
      width: 10, height: 10, borderRadius: '50%', background: '#EF4444',
      boxShadow: '0 0 8px red', animation: 'pulse 1.5s ease-in-out infinite',
    },
    hudBottom: {
      position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1.5rem 2.5rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      zIndex: 60, pointerEvents: 'none', fontFamily: 'monospace', letterSpacing: '0.25em',
    },
    time: { fontSize: '1rem', fontWeight: 700, color: '#fff' },
    loc: { fontSize: '0.7rem', color: '#60A5FA', marginTop: 4 },
    status: { fontSize: '1rem', fontWeight: 700, color: '#4ADE80', textAlign: 'right' },
    ver: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' },
    dots: {
      position: 'fixed', right: '2rem', top: '50%', transform: 'translateY(-50%)',
      zIndex: 60, display: 'flex', flexDirection: 'column', gap: '1rem',
    },
    content: {
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 20,
    },
    scanline: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: 2,
      background: 'rgba(255,255,255,0.06)', zIndex: 50, pointerEvents: 'none',
      animation: 'scan 7s linear infinite',
    },
    noise: {
      position: 'fixed', inset: 0, zIndex: 45, pointerEvents: 'none',
      opacity: 0.07, mixBlendMode: 'overlay',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    },
  };

  return (
    <>
      <style>{`
        @keyframes scan { from { top: -2px; } to { top: 100vh; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} 99%{opacity:0} }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        body { margin: 0; }
      `}</style>

      {/* BOOT SCREEN: GTA dots → Authenticated checkmark */}
      <AnimatePresence>
        {booting && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: '#000',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
              {/* FLUID DOTS TO CHECKMARK ANIMATION */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 80 }}>
                <div style={{ position: 'relative', width: 78, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Left dot — flies in, then merges to center */}
                  <motion.div
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: [null, 0, -4, 0, 0, 32], opacity: [null, 1, 1, 1, 1, 0] }}
                    transition={{ duration: 1.6, times: [0, 0.3, 0.45, 0.6, 0.8, 1], ease: 'easeInOut' }}
                    style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff', left: 0 }}
                  />
                  
                  {/* Center dot — scales up, then becomes the checkmark */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [null, 1.35, 1, 1, 2.2], opacity: [null, 1, 1, 1, 1] }}
                    transition={{ duration: 1.6, times: [0, 0.3, 0.45, 0.6, 0.8], ease: 'easeInOut', delay: 0.06 }}
                    style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {/* Checkmark inside center dot, appears at the end */}
                    <motion.svg
                      initial={{ opacity: 0, pathLength: 0 }}
                      animate={{ opacity: [0, 0, 1], pathLength: [0, 0, 1] }}
                      transition={{ duration: 1.8, times: [0, 0.85, 1], ease: 'easeOut' }}
                      width="8" height="8" viewBox="0 0 14 14" fill="none"
                    >
                      <path d="M3 7.5L5.5 10L11 4" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </motion.svg>
                  </motion.div>

                  {/* Right dot — flies in, then merges to center */}
                  <motion.div
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: [null, 0, 4, 0, 0, -32], opacity: [null, 1, 1, 1, 1, 0] }}
                    transition={{ duration: 1.6, times: [0, 0.3, 0.45, 0.6, 0.8, 1], ease: 'easeInOut' }}
                    style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff', right: 0 }}
                  />
                </div>

                {/* Authenticated Text */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: [0, 0, 1], y: [5, 5, 0] }}
                  transition={{ duration: 1.8, times: [0, 0.8, 1] }}
                  style={{
                    fontSize: '1rem', fontWeight: 500, color: '#fff',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    marginTop: 8
                  }}
                >
                  Authenticated
                </motion.span>
              </div>


            {/* Bottom label */}
            <div style={{
              position: 'absolute', bottom: '2rem',
              fontFamily: 'monospace', fontSize: '0.65rem',
              letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)',
            }}>
              Cloudflare Authentication
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REDIRECT OVERLAY - Full screen fade to black */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 99998,
              background: '#000',
              pointerEvents: 'none',
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* MAIN PAGE */}
      {!booting && (
        <div style={S.page}>
          {/* NOISE */}
          <div style={S.noise} />
          {/* SCANLINE */}
          <div style={S.scanline} />

          {/* PRELOAD NEXT IMAGE */}
          {activeStage + 1 < STAGES.length && (
            <img 
              src={STAGES[activeStage + 1].bg} 
              style={{ display: 'none' }} 
              alt="preload" 
              fetchPriority="low" 
            />
          )}

          {/* BG IMAGE */}
          <AnimatePresence mode="wait">
            <motion.img
              key={activeStage}
              src={STAGES[activeStage].bg}
              alt=""
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              style={S.bgImg}
              loading={activeStage === 0 ? "eager" : "lazy"}
              fetchPriority={activeStage === 0 ? "high" : "low"}
            />
          </AnimatePresence>
          <div style={S.bgOverlay} />

          {/* HUD TOP */}
          <div style={S.hudTop}>
            <div style={S.rec}>
              <div style={S.recDot} />
              <span>REC // L.A.C.</span>
            </div>
          </div>

          {/* HUD BOTTOM */}
          <div style={S.hudBottom}>
            <div>
              <div style={S.time}>{timeStr}</div>
              <div style={S.loc}>LOS ANGELES, CA</div>
            </div>
            <div>
              <div style={S.status}>SYS.OP.NORMAL</div>
              <div style={S.ver}>v3.0.0_STABLE</div>
            </div>
          </div>

          {/* PAGINATION DOTS */}
          <div style={S.dots}>
            {STAGES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', lineHeight: 0 }}>
                <span style={getDotStyle(i === activeStage)} />
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div style={S.content}>
            <AnimatePresence mode="wait">

              {/* HERO */}
              {isHero && (
                <motion.div key="hero"
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5rem' }}
                >
                  <img 
                    src="/lapd-logo.png" 
                    alt="LAC Seal" 
                    style={{ 
                      width: 140, height: 140, borderRadius: '50%', marginBottom: '2.5rem', 
                      boxShadow: '0 0 50px rgba(255,255,255,0.1), inset 0 0 20px rgba(0,0,0,0.5)', 
                      border: '1px solid rgba(255,255,255,0.15)',
                      objectFit: 'cover'
                    }} 
                  />
                  <h1 style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 500, margin: 0,
                    color: '#fff', letterSpacing: '0.15em', lineHeight: 1.1,
                    textShadow: '0 0 30px rgba(255,255,255,0.3)',
                  }}>
                    LOS ANGELES
                  </h1>
                  <h2 style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 'clamp(1.8rem, 5vw, 4rem)', fontWeight: 700, margin: 0,
                    color: '#fff', letterSpacing: '0.25em', lineHeight: 1.2,
                    textShadow: '0 0 40px rgba(255,255,255,0.4)',
                  }}>
                    COMMUNITY
                  </h2>
                  <div style={{ width: '80px', height: '1px', background: 'rgba(255,255,255,0.4)', margin: '2.5rem auto' }} />
                  <p style={{
                    fontSize: '0.85rem', fontWeight: 500,
                    letterSpacing: '0.5em', color: 'rgba(255,255,255,0.7)', margin: 0,
                    textTransform: 'uppercase',
                  }}>
                    To Protect and to Serve
                  </p>
                  
                  <div style={{ marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        AŞAĞI KAYDIR
                      </span>
                      {/* Mouse Icon */}
                      <div style={{ width: 26, height: 42, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20, display: 'flex', justifyContent: 'center', paddingTop: 6, position: 'relative', background: 'rgba(0,0,0,0.3)' }}>
                        <motion.div
                          animate={{ y: [0, 14], opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          style={{ width: 4, height: 6, backgroundColor: '#fff', borderRadius: 2, boxShadow: '0 0 8px #fff' }}
                        />
                      </div>
                      {/* Chevrons */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -4 }}>
                        {[0, 1, 2].map((i) => (
                          <motion.svg key={i} width="16" height="10" viewBox="0 0 24 24" fill="none"
                            animate={{ opacity: [0, 0.6, 0], y: [-3, 3] }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.3, ease: "linear" }}
                            style={{ margin: '-5px 0' }}
                          >
                            <path d="M4 6l8 8 8-8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MANIFESTO */}
              {isManifesto && (
                <motion.div key={`manifesto-${manifestoIndex}`}
                  initial={{ opacity: 0, x: MANIFESTOS[manifestoIndex].dir === 'left' ? -80 : 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: MANIFESTOS[manifestoIndex].dir === 'left' ? 80 : -80 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  style={{
                    width: '100%', padding: '0 8%',
                    textAlign: MANIFESTOS[manifestoIndex].dir as any,
                    display: 'flex', flexDirection: 'column',
                    alignItems: MANIFESTOS[manifestoIndex].dir === 'left' ? 'flex-start' : 'flex-end',
                  }}
                >
                  <p style={{
                    fontFamily: 'monospace', fontSize: 'clamp(0.7rem, 1.5vw, 1.3rem)',
                    letterSpacing: '0.5em', color: '#60A5FA', fontWeight: 700,
                    textTransform: 'uppercase', marginBottom: '2rem',
                    borderLeft: MANIFESTOS[manifestoIndex].dir === 'left' ? '4px solid #60A5FA' : 'none',
                    borderRight: MANIFESTOS[manifestoIndex].dir === 'right' ? '4px solid #60A5FA' : 'none',
                    paddingLeft: MANIFESTOS[manifestoIndex].dir === 'left' ? '1.5rem' : 0,
                    paddingRight: MANIFESTOS[manifestoIndex].dir === 'right' ? '1.5rem' : 0,
                    textShadow: '0 0 15px rgba(96,165,250,0.6)',
                  }}>
                    {MANIFESTOS[manifestoIndex].tag}
                  </p>
                  <h2 style={{
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: 'clamp(1.4rem, 3.2vw, 3.2rem)', fontWeight: 300, margin: 0,
                    color: '#fff', lineHeight: 1.3, letterSpacing: '0.02em',
                    textShadow: '0 4px 40px rgba(0,0,0,0.8)',
                  }}>
                    {MANIFESTOS[manifestoIndex].line1}<br />
                    <span style={{ color: '#BAE6FD', fontWeight: 400 }}>{MANIFESTOS[manifestoIndex].line2}</span>
                  </h2>
                </motion.div>
              )}

              {/* UNIT STAGES */}
              {unit && (
                <motion.div key={`unit-${unitIndex}`}
                  initial={{ scale: 1.15, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    textAlign: 'center', position: 'relative', width: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <p style={{
                    fontFamily: 'monospace', fontSize: 'clamp(0.7rem, 1.5vw, 1.2rem)',
                    letterSpacing: '0.5em', fontWeight: 700,
                    color: unit.color, textTransform: 'uppercase',
                    textShadow: `0 0 20px ${unit.color}`,
                    marginBottom: '1.5rem', textAlign: 'center',
                  }}>
                    {unit.label}
                  </p>
                  <div style={{
                    fontSize: 'clamp(3rem, 10vw, 11rem)', fontWeight: 900,
                    textTransform: 'uppercase', letterSpacing: '-0.02em',
                    color: 'transparent',
                    WebkitTextStroke: '2px rgba(255,255,255,0.9)',
                    textShadow: `0 0 40px ${unit.color}30`,
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    maxWidth: '90vw',
                    overflow: 'hidden',
                  }}>
                    {unit.text}
                  </div>
                </motion.div>
              )}

              {/* PORTAL */}
              {isPortal && (
                <motion.div key="portal"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(2,4,10,0.92) 0%, rgba(10,15,35,0.95) 100%)',
                    backdropFilter: 'blur(40px)',
                  }}
                >
                  {/* Decorative glow orbs */}
                  <div style={{
                    position: 'absolute', top: '20%', left: '10%',
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '15%', right: '8%',
                    width: 250, height: 250, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />

                  <div style={{ width: '100%', maxWidth: 520, padding: '0 2rem', position: 'relative', zIndex: 1 }}>

                    {/* Logo + Brand */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.5 }}
                      style={{ textAlign: 'center', marginBottom: '2.5rem' }}
                    >
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
                        <div style={{
                          position: 'absolute', inset: -4, borderRadius: '50%',
                          background: 'conic-gradient(from 0deg, #3B82F6, #8B5CF6, #3B82F6)',
                          animation: 'spin 6s linear infinite',
                          opacity: 0.6,
                        }} />
                        <img src="/lapd-logo.png" alt="LACO MDT" style={{
                          width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
                          position: 'relative', zIndex: 1,
                          border: '3px solid rgba(10,15,35,1)',
                        }} />
                      </div>
                      <div style={{
                        fontSize: '2rem', fontWeight: 900, color: '#fff',
                        letterSpacing: '0.12em', lineHeight: 1,
                        fontFamily: "'Oswald', sans-serif",
                        textShadow: '0 0 30px rgba(96,165,250,0.4)',
                      }}>
                        LACO <span style={{
                          background: 'linear-gradient(135deg, #60A5FA, #8B5CF6)',
                          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>MDT</span>
                      </div>
                      <div style={{
                        fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(148,163,184,0.6)',
                        fontFamily: 'monospace', marginTop: '0.5rem', textTransform: 'uppercase',
                      }}>
                        Los Angeles Community — Personel Sistemi
                      </div>
                    </motion.div>

                    {/* Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.5 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 20,
                        padding: '2rem',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Status bar */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '1.75rem', paddingBottom: '1.25rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <motion.div
                            animate={{ opacity: [1, 0.2, 1], scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                            style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }}
                          />
                          <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(74,222,128,0.8)', textTransform: 'uppercase' }}>
                            Sistem Aktif
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {['SSL', 'TLS 1.3', 'AES-256'].map(tag => (
                            <span key={tag} style={{
                              fontSize: '0.55rem', letterSpacing: '0.1em', fontFamily: 'monospace',
                              padding: '0.2rem 0.5rem',
                              background: 'rgba(59,130,246,0.1)',
                              border: '1px solid rgba(59,130,246,0.2)',
                              borderRadius: 4, color: 'rgba(96,165,250,0.7)',
                              textTransform: 'uppercase',
                            }}>{tag}</span>
                          ))}
                        </div>
                      </div>

                      {/* Login button */}
                      <form onSubmit={handleLogin}>
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={!isSubmitting ? {
                            scale: 1.02,
                            boxShadow: '0 20px 50px rgba(59,130,246,0.4)',
                          } : {}}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            width: '100%', padding: '1.1rem 1.5rem',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            background: isSubmitting
                              ? 'rgba(59,130,246,0.08)'
                              : 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(139,92,246,0.12) 100%)',
                            border: '1px solid rgba(96,165,250,0.3)',
                            borderRadius: 14,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            color: '#fff', fontFamily: 'inherit',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 32px rgba(59,130,246,0.12)',
                            position: 'relative', overflow: 'hidden',
                          }}
                        >
                          {/* Shimmer effect */}
                          {!isSubmitting && (
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ repeat: Infinity, duration: 3, ease: 'linear', repeatDelay: 1 }}
                              style={{
                                position: 'absolute', top: 0, left: 0,
                                width: '40%', height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
                                pointerEvents: 'none',
                              }}
                            />
                          )}
                          <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                          }}>🛡️</div>
                          <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                              {isSubmitting ? 'Bağlanıyor...' : 'Personel Girişi'}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'rgba(148,163,184,0.6)', letterSpacing: '0.15em', marginTop: 3, fontFamily: 'monospace' }}>
                              {isSubmitting ? loginStatus : 'laco.mdt.portal / şifreli bağlantı'}
                            </div>
                          </div>
                          {!isSubmitting && (
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            >
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.5 }}>
                                <path d="M4 10h12M12 5l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </motion.div>
                          )}
                        </motion.button>

                        {/* Bottom info */}
                        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.6rem', letterSpacing: '0.2em', fontFamily: 'monospace',
                            color: 'rgba(100,116,139,0.5)', textTransform: 'uppercase',
                          }}>
                            Sadece Yetkili Personel &nbsp;·&nbsp; Tüm Aktiviteler Kayıt Altındadır
                          </span>
                        </div>
                      </form>
                    </motion.div>

                    {/* Bottom version */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      style={{ textAlign: 'center', marginTop: '1.5rem' }}
                    >
                      <span style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(100,116,139,0.35)', textTransform: 'uppercase' }}>
                        LACO MDT v3.0 &nbsp;·&nbsp; Secure Channel
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
