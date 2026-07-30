"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [activeUnit, setActiveUnit] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [isInstantlyHidden, setIsInstantlyHidden] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const lastSeen = localStorage.getItem('LACIntroLastSeen');
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    if (lastSeen && (now - parseInt(lastSeen, 10)) < twelveHours) {
      setIsInstantlyHidden(true);
      setShowIntro(false);
    } else {
      localStorage.setItem('LACIntroLastSeen', now.toString());
      const timer = setTimeout(() => { setShowIntro(false); }, 3200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    console.log(`%c
   ____  __  __      _    ____   ___  ____  
  | __ ) \\ \\/ /     / \\  |  _ \\ / _ \\|  _ \\ 
  |  _ \\  \\  /     / _ \\ | | | | | | | |_) |
  | |_) | /  \\    / ___ \\| |_| | |_| |  _ < 
  |____/ /_/\\_\\  /_/   \\_\\____/ \\___/|_| \\_\\
                                            
        >>> Coded & Designed by ADOR <<<
    `, 'color: #0ea5e9; font-weight: bold; font-size: 12px;');
  }, []);

  const fadeUp: any = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } };
  const staggerContainer: any = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  const row1Text = Array.from({ length: 30 }).map((_, idx) => (
    <span key={idx} style={{ marginRight: '4rem' }}>THE LAC</span>
  ));
  const row2Text = Array.from({ length: 30 }).map((_, idx) => (
    <span key={idx} style={{ marginRight: '4rem' }}>THE LAC</span>
  ));

  const units = [
    { title: 'DEDEKTİF BÜRO', desc: 'Karmaşık suçları ve cinayetleri araştıran sivil soruşturma ekibi.', icon: 'fa-user-secret', color: '#6366F1', leader: 'Ador Vance' },
    { title: 'GND UNIT', desc: 'Çete suçları ve narkotik faaliyetleri araştıran saha operasyon birimi.', icon: 'fa-skull-crossbones', color: '#EC4899', leader: 'Aiden Rise' },
    { title: 'AIR UNIT', desc: 'Göklerdeki gözümüz. Havadan devriye, aydınlatma ve şüpheli takibi.', icon: 'fa-helicopter', color: '#0EA5E9', leader: 'Louis Rogers' },
    { title: 'SWAT UNIT', desc: 'Yüksek riskli operasyonlar ve rehine kurtarma görevleri için taktiksel güç.', icon: 'fa-crosshairs', color: '#EF4444', leader: 'Aiden Rise' },
    { title: 'TRAFFIC UNIT', desc: 'Otoyol güvenliği ve yüksek hızlı takipler konusunda uzmanlaşmış önleyici kuvvet.', icon: 'fa-car', color: '#F59E0B', leader: 'Louis Rogers' },
    { title: 'DIVE UNIT', desc: 'Sualtı delil arama, kurtarma ve kıyı devriyesi görevlerini yürüten dalgıç timi.', icon: 'fa-water', color: '#3B82F6', leader: 'Jessica Rise' }
  ];

  const steps = [
    { step: "01", title: "Başvuru Süreci", text: "Öncelikle sistem üzerinden departmana katılım başvurusu oluşturun ve evrakları tamamlayın." },
    { step: "02", title: "İnceleme", text: "Kayıt büromuz ve komuta kademesi bilgilerinizi ve sicil kaydınızı detaylıca inceler." },
    { step: "03", title: "Mülakat & Alım", text: "Uygun görülen adaylar sesli mülakata alınır. Başarılı olanlar akademiye kabul edilir." },
    { step: "04", title: "Eğitim Akademisi", text: "Kapsamlı saha eğitimleri, silah kullanımı, telsiz prosedürleri ve ileri sürüş eğitimleri." }
  ];

  return (
    <>
      {!isInstantlyHidden && (
        <>
          {showIntro && (
            <div
              key="intro"
             
             
             
              style={{
                position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#000000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top center, rgba(245, 130, 32, 0.06) 0%, transparent 70%)' }}></div>

              <div
                
                 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '450px', textAlign: 'center', padding: '3.5rem 3rem', backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.9)', zIndex: 1 }}
              >
                {/* Cloudflare-like Spinner */}
                <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '2rem' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: '#f58220', borderRightColor: '#f58220' }}></div>
                  <i className="fa-solid fa-shield-check" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#f58220', fontSize: '1.25rem', opacity: 0.8 }}></i>
                </div>
                
                <h2 style={{ fontSize: '1.35rem', color: 'var(--bg-tertiary)', fontWeight: 600, margin: '0 0 1rem 0', letterSpacing: '-0.01em' }}>
                  Güvenli Bağlantı Doğrulanıyor
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, margin: '0 0 2.5rem 0' }}>
                  Lütfen bekleyin, <strong>theLAC.online</strong> adresine erişiminiz denetleniyor. Bu işlem ağ güvenliğinizi sağlamak içindir.
                </p>

                {/* Progress/Status line */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span>Bağlantı Durumu</span>
                      <span style={{ color: '#10b981' }}>Onaylandı</span>
                   </div>
                   <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: '#f58220' }}></div>
                   </div>
                </div>

                {/* Ray ID and Prominent Cloudflare branding */}
                <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>Ray ID: {Math.random().toString(36).substring(2, 15).toUpperCase()}{Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <i className="fa-brands fa-cloudflare" style={{ fontSize: '2.5rem', color: '#f58220', filter: 'drop-shadow(0 0 10px rgba(245, 130, 32, 0.4))' }}></i>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '-0.1rem' }}>Performance & Security by</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--bg-tertiary)', letterSpacing: '-0.02em' }}>Cloudflare</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

    <div style={{ backgroundColor: '#040914', minHeight: '100vh', color: 'var(--bg-tertiary)', overflowX: 'hidden', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      
      {/* GLOBAL STYLES & ANIMATIONS */}
      <style>{`
        @keyframes scrollLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes scrollRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); } 70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
        .LAC-scroll-left { display: flex; white-space: nowrap; width: max-content; animation: scrollLeft var(--dur) linear infinite; }
        .LAC-scroll-right { display: flex; white-space: nowrap; width: max-content; animation: scrollRight var(--dur) linear infinite; }
        .btn-modern { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(14, 165, 233, 0.2); }
      `}</style>

      {/* SCROLLING BACKGROUND TEXT (SUBTLE) */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', width: '250vw', height: '250vh', transform: 'translate(-50%, -50%) rotate(-20deg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', opacity: 0.8 }}>
        {Array.from({ length: 18 }).map((_, i) => {
          const isEven = i % 2 === 0;
          const isAlt = i % 4 < 2;
          const dur = isEven ? '120s' : '100s';
          const opacity = i % 3 === 0 ? '0.15' : i % 3 === 1 ? '0.10' : '0.05';
          const strokeColor = isAlt ? `rgba(14, 165, 233, ${opacity})` : `rgba(148, 163, 255, ${opacity})`;
          return (
            <div key={i} style={{ lineHeight: '1.2' }}>
              <div className={isEven ? 'LAC-scroll-left' : 'LAC-scroll-right'} style={{ '--dur': dur, fontSize: i % 3 === 0 ? '6rem' : i % 3 === 1 ? '4rem' : '3rem', fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: 'transparent', WebkitTextStroke: `1px ${strokeColor}`, letterSpacing: '0.05em', userSelect: 'none' } as any}>
                {isAlt ? [...row1Text, ...row1Text] : [...row2Text, ...row2Text]}
              </div>
            </div>
          );
        })}
      </div>

      {/* BACKGROUND OVERLAYS (CLEANER) */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: 'radial-gradient(circle at center, transparent 0%, #040914 90%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: 'url("https://www.transparenttextures.com/patterns/stardust.png")', opacity: 0.1, pointerEvents: 'none', mixBlendMode: 'overlay' }}></div>

      {/* HERO SECTION (EXPERIMENTAL CYBER-SLEEK) */}
      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '6rem 2rem' }}>
        <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* LEFT SIDE: TEXT & BUTTONS */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-2rem', top: '-1rem', width: '2px', height: '120%', background: 'linear-gradient(to bottom, transparent, rgba(14, 165, 233, 0.5), transparent)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', left: '-2.35rem', top: '10%', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #0EA5E9', backgroundColor: '#040914', zIndex: 1, boxShadow: '0 0 15px #0EA5E9' }}></div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderLeft: '3px solid #22c55e', padding: '0.5rem 1.5rem', marginBottom: '2rem', backdropFilter: 'blur(8px)', width: 'fit-content' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'pulse-green 1.5s infinite' }}></div>
              <span style={{ fontSize: '0.85rem', color: '#bbf7d0', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>MDT 3.0 Personel Yönetim Sistemi Çevrimiçi</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 300, color: '#e2e8f0', lineHeight: 1, letterSpacing: '0.05em', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", margin: 0, textTransform: 'uppercase' }}>
                LOS ANGELES
              </h1>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 5.2rem)', fontWeight: 800, color: '#ffffff', lineHeight: 0.95, letterSpacing: '-0.02em', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", margin: 0, textTransform: 'uppercase' }}>
                POLICE <span style={{ color: '#0EA5E9' }}>DEPARTMENT</span>
              </h1>
            </div>
            
            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '550px', margin: '0 0 3rem 0', fontWeight: 400, letterSpacing: '0.01em', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
              Korumak, hizmet etmek ve adaleti teknolojiyle sağlamak. Gelişmiş operasyonel ağımıza katılarak sokakların kontrolünü elinize alın.
            </p>

            {/* BUTTONS (SLEEK REDESIGN) */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/giris" passHref legacyBehavior>
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#0EA5E9', color: '#040914', padding: '0.85rem 2rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em', transition: 'all 0.3s ease', boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.5)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#0EA5E9'; e.currentTarget.style.boxShadow = '0 0 20px rgba(14, 165, 233, 0.4)'; }}>
                  SİSTEME GİRİŞ <i className="fa-solid fa-arrow-right"></i>
                </a>
              </Link>
              <Link href="/basvurular" passHref legacyBehavior>
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'transparent', color: '#e2e8f0', padding: '0.85rem 2rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.05em', transition: 'all 0.3s ease', border: '1px solid rgba(255,255,255,0.15)' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
                  <i className="fa-solid fa-file-pen"></i> BAŞVURULAR
                </a>
              </Link>
              <a href="https://discord.gg/theLAC" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid rgba(88, 101, 242, 0.5)', color: '#5865F2', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(88, 101, 242, 0.1)'; e.currentTarget.style.borderColor = '#5865F2'; e.currentTarget.style.boxShadow = '0 0 15px rgba(88, 101, 242, 0.3)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(88, 101, 242, 0.5)'; e.currentTarget.style.boxShadow = 'none'; }} title="Discord">
                <i className="fa-brands fa-discord" style={{ fontSize: '1.2rem' }}></i>
              </a>
              <a href="https://www.youtube.com/@TheLAC-7" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid rgba(255, 0, 0, 0.5)', color: '#FF0000', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.1)'; e.currentTarget.style.borderColor = '#FF0000'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.3)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 0, 0, 0.5)'; e.currentTarget.style.boxShadow = 'none'; }} title="YouTube">
                <i className="fa-brands fa-youtube" style={{ fontSize: '1.2rem' }}></i>
              </a>
              <a href="https://www.tiktok.com/@theLACfivem?lang=tr-TR" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#fff', backgroundColor: 'transparent', transition: 'all 0.3s ease' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.2)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; e.currentTarget.style.boxShadow = 'none'; }} title="TikTok">
                <i className="fa-brands fa-tiktok" style={{ fontSize: '1.2rem' }}></i>
              </a>
            </div>
          </div>

          {/* RIGHT SIDE: SLEEK VIDEO PLAYER */}
          <div style={{ flex: '1 1 400px', position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(14, 165, 233, 0.15)' }}>
            <video 
              ref={videoRef}
              autoPlay 
              muted={isMuted} 
              loop 
              playsInline 
              preload="auto"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src="/bg-video.mp4" type="video/mp4" />
            </video>
            {/* Video Overlays for depth */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,9,20,0.9) 0%, transparent 50%)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)', pointerEvents: 'none' }}></div>
            
            {/* Embedded Video Controls */}
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 20, display: 'flex', gap: '0.75rem' }}>
              <button onClick={toggleMute} style={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', width: '36px', height: '36px', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.4)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.8)'}>
                <i className={`fa-solid ${isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`} style={{ fontSize: '0.9rem' }}></i>
              </button>
              <button onClick={togglePlay} style={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', width: '36px', height: '36px', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.4)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.8)'}>
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ fontSize: '0.9rem' }}></i>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* HUD STATS SECTION (MINIMAL & UNIFIED) */}
      <section style={{ position: 'relative', zIndex: 10, padding: '3rem 5%', borderTop: '1px solid rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', backgroundColor: 'rgba(2, 6, 23, 0.4)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          {[
            { value: '07', label: 'SEZONLUK TECRÜBE', icon: 'fa-calendar-check' },
            { value: '55+', label: 'KAYITLI PERSONEL', icon: 'fa-users' },
            { value: '25', label: 'AKTİF GÖREVLİ', icon: 'fa-user-shield' },
            { value: '122', label: 'EMEKLİ MEMUR', icon: 'fa-medal' }
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.3s ease' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <i className={`fa-solid ${stat.icon}`} style={{ fontSize: '1.25rem', color: '#0EA5E9', marginBottom: '0.75rem', opacity: 0.8 }}></i>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--bg-tertiary)', fontFamily: "'Oswald', sans-serif", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.15em', marginTop: '0.5rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOSSIER DIVISIONS SECTION (EXPERIMENTAL CYBER-TECH) */}
      <section style={{ position: 'relative', zIndex: 10, padding: '6rem 5%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#0EA5E9', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.5rem' }}>[ DATABASE :: DIVISIONS ]</div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--bg-tertiary)', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>OPERASYONEL <span style={{ color: 'transparent', WebkitTextStroke: '1px #0EA5E9' }}>BİRİMLER</span></h2>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#0EA5E9' }}></div>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#0EA5E9' }}></div>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#0EA5E9', opacity: 0.2 }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {/* Left Menu (Cyber Tabs) */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
              {/* Vertical Guide Line */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '0', width: '2px', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>
              
              {units.map((unit, i) => (
                <button
                  key={i}
                  onClick={() => setActiveUnit(i)}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem 1.25rem 2rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: activeUnit === i ? '#fff' : '#64748b',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden'
                  }}
                  onMouseOver={e => { if(activeUnit !== i) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.paddingLeft = '2.5rem' } }}
                  onMouseOut={e => { if(activeUnit !== i) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '2rem' } }}
                >
                  {/* Active Indicator Line */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: activeUnit === i ? unit.color : 'transparent', transition: 'all 0.3s', boxShadow: activeUnit === i ? `0 0 15px ${unit.color}` : 'none', zIndex: 2 }}></div>
                  
                  {/* Active Background Glow */}
                  {activeUnit === i && (
                    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${unit.color}15 0%, transparent 100%)`, zIndex: 0 }} />
                  )}

                  <i className={`fa-solid ${unit.icon}`} style={{ fontSize: '1.25rem', color: activeUnit === i ? unit.color : '#334155', zIndex: 1, transition: 'all 0.3s' }}></i>
                  <span style={{ fontSize: '1.1rem', fontWeight: activeUnit === i ? 700 : 500, zIndex: 1, letterSpacing: '0.05em' }}>{unit.title}</span>
                  
                  {/* Hexagon/Cyber detail */}
                  {activeUnit === i && (
                     <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: unit.color, letterSpacing: '0.2em', opacity: 0.6, fontWeight: 700 }}>ACTIVE</div>
                  )}
                </button>
              ))}
            </div>

            {/* Right Panel (Dossier Interface) */}
            <div style={{ flex: '2 1 500px', position: 'relative' }}>
              <>
                <div
                  key={activeUnit}
                 
                 
                 
                 
                  style={{
                    backgroundColor: 'rgba(4, 9, 20, 0.7)',
                    border: `1px solid rgba(255, 255, 255, 0.05)`,
                    boxShadow: `inset 0 0 60px ${units[activeUnit].color}05`,
                    padding: '3rem',
                    minHeight: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Clipped corner effect wrapper */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: `linear-gradient(-45deg, transparent 50%, ${units[activeUnit].color}30 50%)` }}></div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: `2px solid ${units[activeUnit].color}40`, borderLeft: `2px solid ${units[activeUnit].color}40` }}></div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: `2px solid ${units[activeUnit].color}40`, borderRight: `2px solid ${units[activeUnit].color}40` }}></div>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: `2px solid ${units[activeUnit].color}40`, borderLeft: `2px solid ${units[activeUnit].color}40` }}></div>
                  
                  {/* Huge Watermark Icon */}
                  <i className={`fa-solid ${units[activeUnit].icon}`} style={{ position: 'absolute', right: '-5%', bottom: '-15%', fontSize: '18rem', color: units[activeUnit].color, opacity: 0.04, transform: 'rotate(-10deg)', pointerEvents: 'none' }}></i>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ width: '56px', height: '56px', border: `1px solid ${units[activeUnit].color}50`, backgroundColor: `${units[activeUnit].color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: units[activeUnit].color, fontSize: '1.5rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '6px', height: '6px', backgroundColor: units[activeUnit].color }}></div>
                      <i className={`fa-solid ${units[activeUnit].icon}`}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.2em', fontWeight: 700, marginBottom: '0.35rem' }}>{`// DOSSIER . ${String(activeUnit + 1).padStart(2, '0')}`}</div>
                      <h3 style={{ fontSize: '2.25rem', fontWeight: 800, margin: 0, color: '#fff', textTransform: 'uppercase', lineHeight: 1, letterSpacing: '-0.02em', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>{units[activeUnit].title}</h3>
                    </div>
                  </div>
                  
                  <div style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, ${units[activeUnit].color}50, transparent)`, marginBottom: '2rem' }}></div>

                  <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.8, maxWidth: '550px', fontWeight: 400, position: 'relative', zIndex: 1, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
                    {units[activeUnit].desc}
                  </p>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '3rem', zIndex: 2 }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.35rem', padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${units[activeUnit].color}`, borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase' }}>BİRİM SORUMLUSU</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <i className="fa-solid fa-user-shield" style={{ color: units[activeUnit].color, fontSize: '1rem' }}></i>
                        <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.05em' }}>{(units[activeUnit] as any).leader}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </section>

      {/* MDT TERMINAL UI SECTION (MODERN, REFINED) */}
      <section style={{ position: 'relative', zIndex: 10, padding: '6rem 5%', backgroundColor: 'rgba(2, 6, 23, 0.6)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap-reverse' }}>
          
          <div style={{ flex: '1 1 450px' }}>
            <div style={{
              backgroundColor: '#050a14',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}>
              <div style={{ backgroundColor: '#0f172a', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.1em', margin: '0 auto' }}>MDT_V3_TERMINAL</div>
              </div>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'rgba(14, 165, 233, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
                  <i className="fa-solid fa-server" style={{ fontSize: '2rem', color: '#0EA5E9' }}></i>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.1em' }}>SİSTEM DURUMU</div>
                    <div style={{ fontSize: '1.1rem', color: '#10B981', fontWeight: 700 }}>ÇEVRİMİÇİ & ŞİFRELİ</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--bg-tertiary)' }}>24/7</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.1em', marginTop: '0.5rem' }}>UPTIME</div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--bg-tertiary)' }}>%100</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.1em', marginTop: '0.5rem' }}>GÜVENLİ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 450px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', lineHeight: 1.1, textTransform: 'uppercase' }}>
              Yeni Nesil <span style={{ color: '#0EA5E9' }}>MDT</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Operasyonel yeteneklerinizi zirveye taşıyın. Suçlu profillemeden, gelişmiş raporlamaya kadar sahada ihtiyaç duyduğunuz tüm araçlar, şifrelenmiş tek bir ağ üzerinden parmaklarınızın ucunda.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { text: 'Gerçek Zamanlı Mesai Takibi', icon: 'fa-stopwatch' },
                { text: 'Şifreli Vaka & Sicil Dosyaları', icon: 'fa-file-shield' },
                { text: 'Canlı Yönetmelik Entegrasyonu', icon: 'fa-book-bookmark' },
                { text: 'Maksimum Mobil Uyumluluk', icon: 'fa-mobile-button' }
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '1rem', color: '#cbd5e1', fontWeight: 500 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5E9' }}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* TIMELINE SECTION (CLEANER, SMALLER) */}
      <section style={{ position: 'relative', zIndex: 10, padding: '6rem 5%', borderTop: '1px solid rgba(255,255,255,0.03)', backgroundColor: '#040914' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 1rem' }}>Katılım <span style={{ color: '#0EA5E9' }}>Süreci</span></h2>
            <div style={{ width: '40px', height: '3px', backgroundColor: '#0EA5E9', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '34px', width: '2px', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
            
            {steps.map((step, i) => (
              <div 
                key={i}
               
               
               
               
                style={{ display: 'flex', gap: '2.5rem', position: 'relative', zIndex: 1, alignItems: 'flex-start' }}
              >
                <div style={{ flexShrink: 0, width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#0f172a', border: '2px solid rgba(14, 165, 233, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#0EA5E9' }}>
                  {step.step}
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bg-tertiary)', margin: '0 0 0.5rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
