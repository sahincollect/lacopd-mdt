"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RANK_META: Record<string, { color: string; glow: string; tier: number; icon: string }> = {
  'Sergeant II':   { color: '#FFD700', glow: 'rgba(255,215,0,0.45)',   tier: 1, icon: 'fa-star' },
  'Detective III': { color: '#38bdf8', glow: 'rgba(56,189,248,0.4)', tier: 2, icon: 'fa-user-shield' },
  'Sergeant I':    { color: '#CD7F32', glow: 'rgba(205,127,50,0.35)', tier: 3, icon: 'fa-chevron-up' },
  'Detective II':  { color: '#60a5fa', glow: 'rgba(96,165,250,0.3)',  tier: 4, icon: 'fa-magnifying-glass' },
  'Detective I':   { color: '#3b82f6', glow: 'rgba(59,130,246,0.25)', tier: 5, icon: 'fa-user-secret' },
  'Officer III':   { color: '#cbd5e1', glow: 'rgba(203,213,225,0.25)', tier: 6, icon: 'fa-shield-halved' },
  'Officer II':    { color: '#94a3b8', glow: 'rgba(148,163,184,0.2)',  tier: 7, icon: 'fa-shield' },
  'Officer I':     { color: '#64748b', glow: 'rgba(100,116,139,0.2)',  tier: 8, icon: 'fa-user-check' },
  'Cadet':         { color: '#475569', glow: 'rgba(71,85,105,0.2)',   tier: 9, icon: 'fa-user' },
  'Captain':       { color: '#F59E0B', glow: 'rgba(245,158,11,0.35)', tier: 10, icon: 'fa-medal' },
  'Lieutenant':    { color: '#E2E8F0', glow: 'rgba(226,232,240,0.3)', tier: 11, icon: 'fa-id-badge' },
};

const DEFAULT_META = { color: '#94a3b8', glow: 'rgba(148,163,184,0.2)', tier: 99, icon: 'fa-user-shield' };

export default function Hakkimizda() {
  const [officers, setOfficers] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  useEffect(() => {
    fetch('/api/officers')
      .then(res => res.json())
      .then(data => { 
        if (data.officers) {
          // Admin hesabını ve Chief of Police rütbesini org şemasından gizle (Louis Rogers Sergeant II olarak baştadır)
          const visibleOfficers = data.officers.filter((o: any) => 
            o.name?.toLowerCase() !== 'admin' && 
            o.rank?.toLowerCase() !== 'chief of police'
          );
          setOfficers(visibleOfficers);
        } 
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  const predefinedRanks = [
    'Sergeant II',
    'Detective III',
    'Sergeant I',
    'Detective II',
    'Detective I',
    'Officer III',
    'Officer II',
    'Officer I',
    'Cadet'
  ];

  const getRankGroup = (rank: string): string => {
    if (!rank) return '';
    const r = rank.trim();
    // Önce tam eşleşme
    const exact = predefinedRanks.find(pr => r.toLowerCase() === pr.toLowerCase());
    if (exact) return exact;
    // Sonra başlangıç eşleşmesi
    const match = predefinedRanks.find(pr => r.toLowerCase().startsWith(pr.toLowerCase()));
    return match || rank;
  };

  let officersByRank = predefinedRanks.map(rank => ({
    rankName: rank,
    members: officers.filter(o => getRankGroup(o.rank || '') === rank)
  }));

  if (officers.length > 0) {
    const handledRanks = new Set(predefinedRanks.map(r => r.toLowerCase()));
    const unhandled = officers.filter(o => {
      const group = getRankGroup(o.rank || '');
      return !handledRanks.has(group.toLowerCase()) && group !== '';
    });
    const extraGroupNames = Array.from(new Set(unhandled.map(o => getRankGroup(o.rank || ''))));
    extraGroupNames.forEach(rank => {
      officersByRank.push({ rankName: rank, members: officers.filter(o => getRankGroup(o.rank || '') === rank) });
    });
  }

  const onDutyCount = officers.filter(o => o.isOnDuty).length;
  const totalOfficers = officers.length;

  const divisions = [
    { id: "patrol",    name: "Genel Devriye (Patrol)",        icon: "fa-shield",           desc: "Şehrin ön safhalarındaki ilk müdahale hattı. Günlük asayiş, acil çağrılara yanıt ve sokak güvenliğinden sorumlu temel birim." },
    { id: "detective", name: "Dedektif Bürosu (RHD)",         icon: "fa-magnifying-glass", desc: "Cinayet, ağır suçlar ve büyük çaplı soygunların arkasındaki gerçeği aydınlatan deneyimli soruşturma ekibi." },
    { id: "gnd",       name: "Çete ve Narkotik (GND)",         icon: "fa-skull-crossbones", desc: "Sokak çeteleri, uyuşturucu kaçakçılığı ve yasadışı silah ticaretiyle mücadele eden özel operasyon ve soruşturma birimi." },
    { id: "swat",      name: "Özel Harekat (SWAT/Metro)",     icon: "fa-crosshairs",       desc: "Rehine kurtarma, yüksek riskli baskınlar, terörle mücadele ve standart birimlerin kapasitesini aşan kriz durumları için ağır teçhizatlı taktik birimi." },
    { id: "traffic",   name: "Trafik Birimi (TED)",            icon: "fa-car-side",         desc: "Otoyolların güvenliğini sağlayan, trafik kazalarını inceleyen ve yüksek hızlı kovalamacalarda öncülük eden özel donanımlı devriye birimi." },
    { id: "air",       name: "Hava Destek Birimi (ASD)",       icon: "fa-helicopter",       desc: "Şehrin gökyüzündeki gözleri. Helikopterlerle yaya/araç takibi, alan aydınlatması ve devriyelere havadan istihbarat sağlar." },
    { id: "k9",        name: "K-9 Birimi",                     icon: "fa-paw",              desc: "Şüpheli takibi, uyuşturucu/patlayıcı tespiti ve arama kurtarma görevleri için özel eğitimli polis köpekleri ve idarecilerinden oluşur." },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', paddingBottom: '5rem' }}>
      <style>{`
        @keyframes pulse-green { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); } 70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } }
        @keyframes pulse-gray  { 0%,100% { box-shadow: 0 0 0 0 rgba(100,116,139,0.5); } 70% { box-shadow: 0 0 0 6px rgba(100,116,139,0); } }
        @keyframes fadeInUp    { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer     { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .officer-card:hover { transform: translateY(-4px) scale(1.015) !important; }
        .officer-card:hover .card-glow { opacity: 1 !important; }
      `}</style>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', height: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ width: '50px', height: '2px', backgroundColor: 'var(--accent-primary)' }} />
            <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.4em', textTransform: 'uppercase' }}>To Protect And To Serve</span>
            <span style={{ width: '50px', height: '2px', backgroundColor: 'var(--accent-primary)' }} />
          </div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '5.5rem', lineHeight: 0.9, marginBottom: '2rem', letterSpacing: '0.02em', color: '#fff', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            LOS ANGELES POLICE <span style={{ color: 'var(--accent-primary)' }}>DEPARTMENT</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', margin: '0 auto 2.5rem', maxWidth: '750px' }}>
            Biz, Los Angeles şehrinin huzur ve güvenliğini sağlamaya yemin etmiş, profesyonelliğin ve taktiksel üstünlüğün zirvesini temsil eden <strong>LAPDPORTAL</strong> ekibiyiz.
          </p>

          {/* ── CANLI DURUM SAYACI (Sürpriz!) ── */}
          {loaded && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '0.75rem 2rem', backdropFilter: 'blur(12px)', animation: 'fadeInUp 0.6s ease forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: onDutyCount > 0 ? '#22c55e' : '#64748b', animation: onDutyCount > 0 ? 'pulse-green 1.5s infinite' : 'pulse-gray 2.5s infinite', flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: onDutyCount > 0 ? '#22c55e' : '#94a3b8', fontSize: '0.9rem' }}>{onDutyCount} Aktif Görevde</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="fa-solid fa-users" style={{ color: '#3B82F6', fontSize: '0.85rem' }} />
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{totalOfficers} Kayıtlı Personel</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#3B82F6', fontSize: '0.85rem' }} />
                <span style={{ fontWeight: 700, color: '#94a3b8', fontSize: '0.9rem' }}>MDT 3.0 Çevrimiçi</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Birimler ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 2rem' }}>
        <motion.div variants={fadeUp} style={{ borderLeft: '4px solid var(--accent-primary)', paddingLeft: '2rem', marginBottom: '4rem' }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '3.5rem', color: '#fff', lineHeight: 1 }}>
            DEPARTMAN <span style={{ color: 'var(--accent-primary)' }}>BİRİMLERİ</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '1rem', maxWidth: '800px' }}>
            Los Angeles gibi devasa bir metropolün güvenliği, uzmanlaşmış ve senkronize çalışan birimlerin varlığıyla mümkündür.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {divisions.map(div => (
            <motion.div variants={fadeUp} key={div.id} className="card" style={{ transition: 'all 0.3s', cursor: 'pointer', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.4)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border-color)'; }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-primary)', fontSize: '1.5rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                <i className={`fa-solid ${div.icon}`} />
              </div>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: '#fff', marginBottom: '1rem', letterSpacing: '0.05em' }}>{div.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{div.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Personel Org Chart ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ maxWidth: '1200px', margin: '6rem auto 0', padding: '0 2rem' }}>
        <motion.div variants={fadeUp} style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '3.5rem', color: '#fff', lineHeight: 1, marginBottom: '1rem' }}>
              KOMUTA <span style={{ color: 'var(--accent-primary)' }}>ZİNCİRİ & PERSONELİMİZ</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
              LAPD, katı ve disiplinli bir askeri hiyerarşi üzerine kuruludur. Yeşil halka, o an aktif görevde olan personeli gösterir.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {!loaded ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }} />
                <p>Personel listesi yükleniyor...</p>
              </div>
            ) : officersByRank.map((group, i) => {
              const meta = RANK_META[group.rankName] || DEFAULT_META;
              return (
                <div key={group.rankName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                  {/* Rank Node */}
                  <div style={{
                    backgroundColor: 'rgba(10,18,38,0.9)',
                    border: `2px solid ${meta.color}30`,
                    borderTop: `3px solid ${meta.color}`,
                    borderRadius: '18px',
                    padding: '2rem 2.5rem',
                    width: '100%',
                    maxWidth: i === 0 ? '580px' : i === 1 ? '680px' : i === 2 ? '800px' : '1000px',
                    boxShadow: `0 8px 32px ${meta.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
                    backdropFilter: 'blur(10px)',
                    animation: `fadeInUp 0.4s ease ${i * 0.07}s both`,
                  }}>
                    {/* Rank Header */}
                    <div style={{ textAlign: 'center', marginBottom: group.members.length > 0 ? '1.75rem' : '0', paddingBottom: group.members.length > 0 ? '1.25rem' : '0', borderBottom: group.members.length > 0 ? `1px solid ${meta.color}20` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: `${meta.color}15`, border: `1.5px solid ${meta.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, fontSize: '1rem' }}>
                          <i className={`fa-solid ${meta.icon}`} />
                        </div>
                        <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2rem', color: meta.color, letterSpacing: '0.08em', margin: 0, textShadow: `0 0 20px ${meta.glow}` }}>
                          {group.rankName.toUpperCase()}
                        </h3>
                        <span style={{ backgroundColor: `${meta.color}15`, color: meta.color, padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', border: `1px solid ${meta.color}30` }}>
                          KADEME {String(i + 1).padStart(2, '0')}
                        </span>
                        {group.members.length > 0 && (
                          <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {group.members.length} personel
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Officer Cards */}
                    {group.members.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem' }}>
                        {group.members.map(member => (
                          <div
                            key={member.badge}
                            className="officer-card"
                            style={{
                              position: 'relative',
                              display: 'flex', alignItems: 'center', gap: '0.85rem',
                              backgroundColor: member.isOnDuty ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                              padding: '0.75rem 1.2rem',
                              borderRadius: '12px',
                              border: member.isOnDuty ? '1px solid rgba(34,197,94,0.25)' : `1px solid ${meta.color}10`,
                              transition: 'all 0.25s ease',
                              cursor: 'default',
                              minWidth: '185px',
                              boxShadow: member.isOnDuty ? '0 4px 15px rgba(34,197,94,0.1)' : 'none',
                            }}
                          >
                            {/* Glow overlay */}
                            <div className="card-glow" style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: `radial-gradient(circle at 30% 50%, ${meta.color}08, transparent 70%)`, opacity: 0, transition: 'opacity 0.25s', pointerEvents: 'none' }} />

                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <div style={{
                                width: 42, height: 42, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${meta.color}30, ${meta.color}10)`,
                                border: `2px solid ${meta.color}50`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: meta.color, fontWeight: 800, fontSize: '1.05rem',
                                boxShadow: `0 0 12px ${meta.glow}`,
                              }}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              {/* On-duty pulse indicator */}
                              <div style={{
                                position: 'absolute', bottom: -1, right: -1,
                                width: 12, height: 12, borderRadius: '50%',
                                backgroundColor: member.isOnDuty ? '#22c55e' : '#334155',
                                border: '2px solid rgba(10,18,38,0.9)',
                                animation: member.isOnDuty ? 'pulse-green 1.5s infinite' : 'none',
                              }} />
                            </div>

                            {/* Info */}
                            <div style={{ textAlign: 'left', minWidth: 0 }}>
                              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{member.name}</div>
                              <div style={{ color: '#64748b', fontSize: '0.72rem', fontFamily: 'monospace', marginTop: '0.1rem' }}>#{member.badge}</div>
                              <div style={{ color: member.isOnDuty ? '#22c55e' : '#475569', fontSize: '0.68rem', fontWeight: 600, marginTop: '0.15rem', letterSpacing: '0.04em' }}>
                                {member.isOnDuty ? '● GÖREVDE' : '○ HAZIR'}
                              </div>
                              {member.specialRoles && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '5px' }}>
                                  {member.specialRoles.split(',').filter(Boolean).map((sr: string, sIdx: number) => (
                                    <span key={sIdx} style={{
                                      fontSize: '0.62rem',
                                      fontWeight: 700,
                                      color: '#38bdf8',
                                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                                      border: '1px solid rgba(56, 189, 248, 0.3)',
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}>
                                      <i className="fa-solid fa-medal" style={{ fontSize: '0.55rem' }}></i> {sr.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', margin: 0 }}>
                        Bu kademede henüz görevli personel bulunmamaktadır.
                      </p>
                    )}
                  </div>

                  {/* Connector */}
                  {i < officersByRank.length - 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
                      <div style={{ width: 2, height: 32, background: `linear-gradient(to bottom, ${meta.color}60, ${(RANK_META[officersByRank[i+1]?.rankName] || DEFAULT_META).color}40)` }} />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--bg-dark)', border: `2px solid ${meta.color}50`, margin: '2px 0' }} />
                      <div style={{ width: 2, height: 32, background: `linear-gradient(to bottom, ${meta.color}40, ${(RANK_META[officersByRank[i+1]?.rankName] || DEFAULT_META).color}60)` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginTop: '6rem', padding: '0 2rem' }}>
        <motion.h2 variants={fadeUp} style={{ fontFamily: "'Oswald', sans-serif", fontSize: '3.5rem', color: '#fff', marginBottom: '1.5rem' }}>
          HEMEN ARAMIZA <span style={{ color: '#3B82F6' }}>KATIL</span>
        </motion.h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: '0 auto 2.5rem', maxWidth: '600px' }}>
          Süreç zorlu, standartlar yüksek, ancak şehrinize hizmet etmenin ödülü eşsizdir.
        </p>
        <motion.a href="https://discord.gg/thelapd" target="_blank" rel="noopener noreferrer" className="btn"
          style={{ backgroundColor: '#3B82F6', color: '#000', fontSize: '1rem', padding: '1.2rem 3.5rem', borderRadius: '8px', letterSpacing: '0.1em', fontWeight: 800, boxShadow: '0 10px 20px rgba(59,130,246,0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(59,130,246,0.35)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(59,130,246,0.2)'; }}>
          <i className="fa-brands fa-discord" />
          DİSCORD SUNUCUMUZA KATIL
        </motion.a>
      </motion.section>
    </div>
  );
}
