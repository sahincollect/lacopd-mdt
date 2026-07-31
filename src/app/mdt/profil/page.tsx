"use client";

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface User {
  id: string;
  name: string;
  badge: string;
  department: string;
  rank: string;
  role: string;
  specialRoles?: string;
  isOnDuty: boolean;
  profileImage?: string;
  createdAt: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  badge: string;
  totalSeconds: number;
  rank?: number;
}

interface Report {
  id: string;
  officer?: {
    badge: string;
  };
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ProfilPage() {
  const [dutyLoading, setDutyLoading] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(false);

  // Şifre değiştirme state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profil Fotoğrafı state
  const [imgUrl, setImgUrl] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgMessage, setImgMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Canlı Mesai Süresi
  const [liveSeconds, setLiveSeconds] = useState(0);

  const { data: meData, mutate: mutateMe } = useSWR('/api/auth/me', fetcher);
  const { data: shiftsData, mutate: mutateShifts } = useSWR('/api/shifts', fetcher);
  const { data: reportsData } = useSWR('/api/reports', fetcher);

  const loading = !meData || !shiftsData || !reportsData;
  const user: User | null = meData?.user || null;
  const leaderboard: LeaderboardEntry[] = useMemo(() => shiftsData?.leaderboard || [], [shiftsData]);
  const reports: Report[] = reportsData?.reports || [];

  useEffect(() => {
    if (user) {
      setIsOnDuty(user.isOnDuty);
      if (user.profileImage) setImgUrl(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    if (user && leaderboard.length > 0) {
      const myEntry = leaderboard.find(e => e.id === user.id);
      setLiveSeconds(myEntry?.totalSeconds ?? 0);
    }
  }, [user, leaderboard]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnDuty) {
      interval = setInterval(() => {
        setLiveSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnDuty]);

  const toggleDuty = async () => {
    if (!user) return;
    
    const newIsOnDuty = !isOnDuty;
    setIsOnDuty(newIsOnDuty);
    setDutyLoading(true);

    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnDuty: newIsOnDuty }),
      });
      if (!res.ok) throw new Error();
      mutateMe();
      mutateShifts();
    } catch (e) {
      setIsOnDuty(!newIsOnDuty);
    } finally {
      setDutyLoading(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'Tüm alanları doldurun.' });
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }
    setPwLoading(true);
    setPwMessage(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
        setPwForm({ current: '', newPw: '', confirm: '' });
      } else {
        setPwMessage({ type: 'error', text: data.error || 'Bir hata oluştu.' });
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setPwLoading(false);
    }
  };

  const updateProfileImage = async (urlToSave: string) => {
    if (!user) return;
    setImgLoading(true);
    setImgMessage(null);
    try {
      const res = await fetch(`/api/officers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: urlToSave }),
      });
      const data = await res.json();
      if (res.ok) {
        setImgMessage({ type: 'success', text: urlToSave ? 'Profil fotoğrafı güncellendi.' : 'Profil fotoğrafı kaldırıldı.' });
        mutateMe();
      } else {
        setImgMessage({ type: 'error', text: data.error || 'Bir hata oluştu.' });
      }
    } catch {
      setImgMessage({ type: 'error', text: 'Sunucuya bağlanılamadı.' });
    } finally {
      setImgLoading(false);
    }
  };

  const handleUpdateUrl = () => {
    updateProfileImage(imgUrl);
  };

  const removePhoto = () => {
    if (window.confirm("Profil fotoğrafınızı kaldırmak istediğinize emin misiniz?")) {
      setImgUrl("");
      updateProfileImage("");
    }
  };

  const glassCard: React.CSSProperties = {
    background: "#111111",
      border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#161616",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "0.55rem 0.9rem",
    color: "#ededed",
    fontSize: "0.83rem",
    outline: "none",
    transition: "all 0.18s ease",
    fontFamily: "'Inter', sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.6rem",
    fontWeight: 800,
    color: "#555",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    marginBottom: "0.45rem",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "0.6rem 1.25rem", borderRadius: 8,
    background: "#1D6EF7",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#fff", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
    transition: "all 0.2s"
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", flexDirection: "column", gap: "1rem" }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "1.8rem", color: "#555" }} />
        <span style={{ fontSize: "0.82rem", color: "#555", fontWeight: 600, letterSpacing: "0.1em" }}>YÜKLENİYOR...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "rgba(239,68,68,0.5)", fontSize: "1.3rem" }} />
        </div>
        <div style={{ fontSize: "0.85rem", color: "#555", fontWeight: 500 }}>Kimlik doğrulama hatası</div>
      </div>
    );
  }

  const rankIndex = leaderboard.findIndex((e) => e.id === user.id);
  const userRank = rankIndex >= 0 ? rankIndex + 1 : '—';
  const reportCount = reports.filter((r) => r.officer?.badge === user.badge).length;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        .custom-input:focus {
          border-color: rgba(255,255,255,0.16) !important;
          background: #161616 !important;
        }
        .custom-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .duty-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .duty-btn:hover {
          filter: brightness(1.2);
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
      
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "#333", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          L.A.C.P.D. · YÖNETİM
        </div>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#ededed", margin: 0, letterSpacing: "-0.02em" }}>
          Personel Profili
        </h1>
        <p style={{ color: "#666", fontSize: "0.8rem", margin: "0.4rem 0 0", fontWeight: 400 }}>
          Kimlik Kartı ve Sistem Konfigürasyonu
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* HERO PROFILE CARD */}
          <div style={{ ...glassCard, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)' }} />
            
            <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              
              <div style={{ 
                width: 110, height: 110, borderRadius: '50%', background: 'rgba(10,14,26,0.8)', border: '2px solid #555', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1.5rem',
                boxShadow: '0 0 30px rgba(255,255,255,0.1)'
              }}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className="fa-solid fa-user-tie" style={{ fontSize: '3rem', color: "#555" }}></i>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1rem' }}>
                <span style={{ 
                  padding: "0.25rem 0.7rem", borderRadius: 20,
                  background: isOnDuty ? "rgba(0,210,106,0.08)" : "rgba(239,68,68,0.08)", 
                  border: isOnDuty ? "1px solid rgba(0,210,106,0.2)" : "1px solid rgba(239,68,68,0.2)",
                  color: isOnDuty ? "#00d26a" : "#ef4444", 
                  fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em",
                }}>
                  {isOnDuty ? 'MESAİDE' : 'MESAİ DIŞI'}
                </span>
                <span className="mono" style={{ 
                  padding: "0.25rem 0.7rem", borderRadius: 20,
                  background: "#161616", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#1D6EF7", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.08em",
                }}>
                  #{user.badge}
                </span>
              </div>

              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ededed', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>{user.name}</h2>
              <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 500 }}>{user.rank} • {user.department || 'L.A.C.P.D.'}</div>

              {user.specialRoles && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  {user.specialRoles.split(',').filter(Boolean).map((sr: string, idx: number) => (
                    <span key={idx} style={{
                      fontSize: '0.65rem', fontWeight: 700, color: '#ededed',
                      backgroundColor: '#161616', border: '1px solid rgba(255,255,255,0.08)',
                      padding: '4px 10px', borderRadius: '6px', letterSpacing: '0.05em', textTransform: 'uppercase'
                    }}>
                      {sr.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#555', fontWeight: 500 }}>
                Kayıt Tarihi: {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
          
          {/* 3 STAT CARDS IN A ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ ...glassCard, padding: '1.25rem', textAlign: 'center' }}>
              <div style={labelStyle}>TOPLAM MESAİ</div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ededed' }}>{formatTime(liveSeconds)}</div>
            </div>
            <div style={{ ...glassCard, padding: '1.25rem', textAlign: 'center' }}>
              <div style={labelStyle}>RAPOR SAYISI</div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ededed' }}>{reportCount}</div>
            </div>
            <div style={{ ...glassCard, padding: '1.25rem', textAlign: 'center' }}>
              <div style={labelStyle}>LİDERBOARD</div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1D6EF7' }}>#{userRank}</div>
            </div>
          </div>
          
          {/* DUTY TOGGLE */}
          <button
            className="duty-btn"
            onClick={toggleDuty}
            disabled={dutyLoading}
            style={{
              background: isOnDuty ? 'rgba(0,210,106,0.1)' : 'rgba(239,68,68,0.1)',
              border: isOnDuty ? '1px solid rgba(0,210,106,0.3)' : '1px solid rgba(239,68,68,0.3)',
              color: isOnDuty ? '#22c55e' : '#ef4444',
              opacity: dutyLoading ? 0.7 : 1,
              boxShadow: isOnDuty ? '0 0 20px rgba(0,210,106,0.1)' : 'none'
            }}
          >
            <i className={`fa-solid ${isOnDuty ? 'fa-satellite-dish' : 'fa-power-off'}`} />
            {isOnDuty ? 'MESAİDEN ÇIK' : 'MESAİYE BAŞLA'}
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* PROFILE IMAGE CARD */}
          <div style={{ ...glassCard, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <i className="fa-solid fa-image" style={{ color: '#1D6EF7', fontSize: '0.9rem' }}></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ededed' }}>Profil Fotoğrafı</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>FOTOĞRAF URL (IMGUR/DISCORD)</label>
                <input 
                  type="text" 
                  className="custom-input"
                  placeholder="https://..." 
                  value={imgUrl} 
                  onChange={e => setImgUrl(e.target.value)} 
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="custom-btn"
                  onClick={handleUpdateUrl} 
                  disabled={imgLoading} 
                  style={{ ...btnPrimary, flex: 1, opacity: imgLoading ? 0.7 : 1 }}
                >
                  {imgLoading ? 'KAYDEDİLİYOR...' : 'GÜNCELLE'}
                </button>
                <button 
                  className="custom-btn"
                  onClick={removePhoto} 
                  disabled={imgLoading || !user.profileImage} 
                  style={{ padding: '0.6rem 1rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', cursor: 'pointer', opacity: (!user.profileImage || imgLoading) ? 0.5 : 1, transition: 'all 0.2s' }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

              {imgMessage && (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.75rem', borderRadius: 8, backgroundColor: imgMessage.type === 'success' ? 'rgba(0,210,106,0.1)' : 'rgba(239, 68, 68, 0.1)', color: imgMessage.type === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${imgMessage.type === 'success' ? 'rgba(0,210,106,0.2)' : 'rgba(239, 68, 68, 0.2)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={`fa-solid ${imgMessage.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
                  {imgMessage.text}
                </div>
              )}
            </div>
          </div>

          {/* SECURITY CARD */}
          <div style={{ ...glassCard, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
                <i className="fa-solid fa-lock" style={{ color: '#f59e0b', fontSize: '0.9rem' }}></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ededed' }}>Güvenlik Anahtarı</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>MEVCUT ŞİFRE</label>
                <input 
                  type="password" 
                  className="custom-input"
                  value={pwForm.current} 
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} 
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>YENİ ŞİFRE</label>
                <input 
                  type="password" 
                  className="custom-input"
                  value={pwForm.newPw} 
                  onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} 
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>YENİ ŞİFRE (TEKRAR)</label>
                <input 
                  type="password" 
                  className="custom-input"
                  value={pwForm.confirm} 
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} 
                  style={inputStyle}
                />
              </div>
              
              {pwMessage && (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.75rem', borderRadius: 8, backgroundColor: pwMessage.type === 'success' ? 'rgba(0,210,106,0.1)' : 'rgba(239, 68, 68, 0.1)', color: pwMessage.type === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${pwMessage.type === 'success' ? 'rgba(0,210,106,0.2)' : 'rgba(239, 68, 68, 0.2)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={`fa-solid ${pwMessage.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`}></i>
                  {pwMessage.text}
                </div>
              )}

              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  className="custom-btn"
                  onClick={changePassword} 
                  disabled={pwLoading} 
                  style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', cursor: pwLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: pwLoading ? 0.7 : 1 }}
                >
                  {pwLoading ? 'İŞLENİYOR...' : 'ŞİFREYİ GÜNCELLE'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
