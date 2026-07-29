"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AudioPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);

  // MDT ve Rapor Portalı sayfalarında oynatıcı tamamen gizlenir ve durur.
  const isMdt = pathname?.startsWith('/mdt') || pathname?.startsWith('/rapor-portali');
  // Sadece ana sayfada tam boyut, diğerlerinde ufak tasarım.
  const isHome = pathname === '/';

  useEffect(() => {
    // Tarayıcılar etkileşimsiz autoplay'i engeller. Kullanıcı herhangi bir yere tıkladığında başlatmayı dene.
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused && !isMdt) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => console.log("Otomatik oynatma hatası:", e));
      }
      // Etkileşim alındıktan sonra event'leri temizle (bir kere çalışması yeterli)
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };

    // İlk yüklemede direkt deniyoruz, belki izin vardır
    if (audioRef.current && !isMdt) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // İzin yoksa kullanıcı etkileşimini bekle
        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('scroll', handleInteraction);
      });
    }

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [isMdt]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isMdt && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isMdt, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Tarayıcı izin verirse başlat
        audioRef.current.play().catch(e => console.log("Otomatik oynatma engellendi:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  if (isMdt) return null;

  return (
    <>
      <audio 
        ref={audioRef} 
        src="/music/trillmatic.mp3" 
        loop 
        autoPlay
        preload="auto"
      />

      <>
        <div
          key="player"
         
         
         
          style={{
            position: 'fixed',
            bottom: isHome ? '2.5rem' : '1.5rem',
            left: isHome ? '2.5rem' : '1.5rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '0.75rem 1.25rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.5s ease',
          }}
        >
          {/* Cover Art */}
          <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
            <img 
              src="/trillmatic_cover.jpg" 
              alt="Trillmatic Cover" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {isPlaying && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(14, 165, 233, 0.2)', mixBlendMode: 'overlay' }}></div>
            )}
          </div>

          {/* Info & Controls Wrapper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '180px' }}>
            
            {/* Title & Artist */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>Trillmatic</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>A$AP Mob</span>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                onClick={togglePlay}
                style={{
                  background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', padding: 0, fontSize: '1rem',
                  transition: 'transform 0.2s, color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.color = '#0ea5e9'}
                onMouseOut={e => e.currentTarget.style.color = '#fff'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isPlaying ? <i className="fa-solid fa-pause"></i> : <i className="fa-solid fa-play"></i>}
              </button>

              {/* Volume Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <i className="fa-solid fa-volume-low" style={{ fontSize: '0.65rem', color: '#94a3b8' }}></i>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={volume} 
                  onChange={handleVolumeChange}
                  style={{
                    width: '100%', height: '4px', appearance: 'none',
                    background: `linear-gradient(to right, #0ea5e9 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`,
                    borderRadius: '2px', outline: 'none', cursor: 'pointer'
                  }}
                  className="volume-slider"
                />
              </div>
            </div>
            
          </div>
        </div>
      </>
    </>
  );
}
