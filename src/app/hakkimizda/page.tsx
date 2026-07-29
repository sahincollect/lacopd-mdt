"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RANK_META: Record<string, { color: string; bg: string; tier: number; icon: string }> = {
  'Sergeant II':   { color: 'var(--lapd-orange)', bg: '#fffaf0', tier: 1, icon: 'fa-star' },
  'Detective III': { color: 'var(--lapd-blue)', bg: '#f0f4f8', tier: 2, icon: 'fa-user-shield' },
  'Sergeant I':    { color: 'var(--lapd-orange)', bg: '#fffaf0', tier: 3, icon: 'fa-chevron-up' },
  'Detective II':  { color: 'var(--lapd-blue)', bg: '#f0f4f8', tier: 4, icon: 'fa-magnifying-glass' },
  'Detective I':   { color: 'var(--lapd-blue)', bg: '#f0f4f8', tier: 5, icon: 'fa-user-secret' },
  'Officer III':   { color: 'var(--lapd-text-dark)', bg: '#f9fafb', tier: 6, icon: 'fa-shield-halved' },
  'Officer II':    { color: 'var(--lapd-text-dark)', bg: '#f9fafb', tier: 7, icon: 'fa-shield' },
  'Officer I':     { color: 'var(--lapd-text-dark)', bg: '#f9fafb', tier: 8, icon: 'fa-user-check' },
  'Captain':       { color: 'var(--lapd-orange)', bg: '#fffaf0', tier: 10, icon: 'fa-medal' },
  'Lieutenant':    { color: 'var(--lapd-text-dark)', bg: '#f9fafb', tier: 11, icon: 'fa-id-badge' },
};

const DEFAULT_META = { color: 'var(--lapd-text-dark)', bg: '#f9fafb', tier: 99, icon: 'fa-user-shield' };

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
  ];

  const getRankGroup = (rank: string): string => {
    if (!rank) return '';
    const r = rank.trim();
    const exact = predefinedRanks.find(pr => r.toLowerCase() === pr.toLowerCase());
    if (exact) return exact;
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
    <div style={{ backgroundColor: 'var(--lapd-bg)', color: 'var(--lapd-text-dark)', fontFamily: 'var(--font-inter)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: '#F0F4F4', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Hakkımızda</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderBottom: '1px solid var(--lapd-border)', backgroundImage: 'url("/gallery/saspbenz.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.9)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', padding: '0 2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: '3.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            HAKKIMIZDA
          </h1>
          <p style={{ color: 'var(--lapd-text-dark)', fontSize: '1.1rem', lineHeight: '1.8', margin: '0 auto 2.5rem', maxWidth: '750px', fontWeight: 500 }}>
            Biz, Los Angeles şehrinin huzur ve güvenliğini sağlamaya yemin etmiş, profesyonelliğin ve taktiksel üstünlüğün zirvesini temsil eden <strong>LACPORTAL</strong> ekibiyiz.
          </p>

          {/* ── CANLI DURUM SAYACI ── */}
          {loaded && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2rem', backgroundColor: 'white', border: '1px solid var(--lapd-border)', borderRadius: '4px', padding: '0.75rem 2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: onDutyCount > 0 ? '#10B981' : 'var(--lapd-text-muted)' }} />
                <span style={{ fontWeight: 700, color: onDutyCount > 0 ? '#10B981' : 'var(--lapd-text-muted)', fontSize: '0.9rem' }}>{onDutyCount} Aktif Görevde</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: 'var(--lapd-border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--lapd-blue)', fontSize: '0.85rem' }} />
                <span style={{ fontWeight: 700, color: 'var(--lapd-text-dark)', fontSize: '0.9rem' }}>{totalOfficers} Kayıtlı Personel</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Birimler ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 2rem' }}>
        <motion.div variants={fadeUp} style={{ borderLeft: '4px solid var(--lapd-orange)', paddingLeft: '1.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1 }}>
            DEPARTMAN BİRİMLERİ
          </h2>
          <p style={{ color: 'var(--lapd-text-muted)', fontSize: '1rem', marginTop: '1rem', maxWidth: '800px' }}>
            Los Angeles gibi devasa bir metropolün güvenliği, uzmanlaşmış ve senkronize çalışan birimlerin varlığıyla mümkündür.
          </p>
        </motion.div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {divisions.map(div => (
            <motion.div variants={fadeUp} key={div.id} style={{ 
              backgroundColor: 'white', border: '1px solid var(--lapd-border)', padding: '2rem', display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--lapd-gray-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lapd-blue-dark)', fontSize: '1.2rem' }}>
                  <i className={`fa-solid ${div.icon}`} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', margin: 0 }}>{div.name}</h3>
              </div>
              <p style={{ color: 'var(--lapd-text-dark)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{div.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Personel Org Chart ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 2rem' }}>
        <motion.div variants={fadeUp} style={{ backgroundColor: 'white', border: '1px solid var(--lapd-border)', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1, marginBottom: '1rem' }}>
              KOMUTA ZİNCİRİ & PERSONELİMİZ
            </h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: 'var(--lapd-text-muted)', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
              LAC, katı ve disiplinli bir hiyerarşi üzerine kuruludur. Yeşil ibare, o an aktif görevde olan personeli gösterir.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {!loaded ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--lapd-text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }} />
                <p>Personel listesi yükleniyor...</p>
              </div>
            ) : officersByRank.map((group, i) => {
              const meta = RANK_META[group.rankName] || DEFAULT_META;
              return (
                <div key={group.rankName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                  {/* Rank Node */}
                  <div style={{
                    backgroundColor: meta.bg,
                    border: `1px solid var(--lapd-border)`,
                    borderTop: `3px solid ${meta.color}`,
                    padding: '2rem',
                    width: '100%',
                    maxWidth: i === 0 ? '600px' : i === 1 ? '700px' : i === 2 ? '850px' : '1000px',
                    marginBottom: '1rem'
                  }}>
                    {/* Rank Header */}
                    <div style={{ textAlign: 'center', marginBottom: group.members.length > 0 ? '1.75rem' : '0', paddingBottom: group.members.length > 0 ? '1.25rem' : '0', borderBottom: group.members.length > 0 ? `1px solid var(--lapd-border)` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ color: meta.color, fontSize: '1.2rem' }}>
                          <i className={`fa-solid ${meta.icon}`} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', margin: 0 }}>
                          {group.rankName.toUpperCase()}
                        </h3>
                        <span style={{ backgroundColor: 'var(--lapd-gray-bg)', color: 'var(--lapd-text-dark)', padding: '0.2rem 0.8rem', fontSize: '0.75rem', fontWeight: 700, border: `1px solid var(--lapd-border)` }}>
                          KADEME {String(i + 1).padStart(2, '0')}
                        </span>
                        {group.members.length > 0 && (
                          <span style={{ color: 'var(--lapd-text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {group.members.length} personel
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Officer Cards */}
                    {group.members.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                        {group.members.map(member => (
                          <div
                            key={member.badge}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '1rem',
                              backgroundColor: 'white',
                              padding: '1rem',
                              border: member.isOnDuty ? '1px solid #10B981' : '1px solid var(--lapd-border)',
                              minWidth: '220px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                            }}
                          >
                            {/* Avatar */}
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <div style={{
                                width: 45, height: 45, borderRadius: '50%',
                                backgroundColor: 'var(--lapd-gray-bg)',
                                border: `2px solid var(--lapd-border)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--lapd-blue-dark)', fontWeight: 800, fontSize: '1.1rem'
                              }}>
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            </div>

                            {/* Info */}
                            <div style={{ textAlign: 'left', minWidth: 0 }}>
                              <div style={{ color: 'var(--lapd-text-dark)', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{member.name}</div>
                              <div style={{ color: 'var(--lapd-text-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>Yaka No: #{member.badge}</div>
                              <div style={{ color: member.isOnDuty ? '#10B981' : 'var(--lapd-text-muted)', fontSize: '0.7rem', fontWeight: 700, marginTop: '0.2rem' }}>
                                {member.isOnDuty ? '● GÖREVDE' : '○ HAZIR'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connector */}
                  {i < officersByRank.length - 1 && (
                    <div style={{ width: '2px', height: '30px', backgroundColor: 'var(--lapd-border)', margin: '0.5rem 0' }} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.section>

      {/* ── SOSYAL SORUMLULUK (MEHMETÇİK VAKFI) ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ maxWidth: '1000px', margin: '5rem auto 0', padding: '0 2rem' }}>
        <motion.div variants={fadeUp} style={{ 
          backgroundColor: 'white', 
          border: '1px solid var(--lapd-border)',
          borderTop: '4px solid #E30A17',
          padding: '4rem 3rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        }}>
          
          <div style={{ 
            width: '80px', height: '80px', 
            borderRadius: '50%', 
            backgroundColor: '#fef2f2', 
            border: '2px solid #fca5a5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2.5rem', color: '#E30A17', 
            marginBottom: '2rem'
          }}>
            <i className="fa-solid fa-star-and-crescent"></i>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            BİZİM İÇİN <span style={{ color: '#E30A17' }}>VATAN</span>, HER ŞEYDEN ÖNCE GELİR
          </h2>
          
          <p style={{ color: 'var(--lapd-text-dark)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto 2rem' }}>
            Los Angeles sokaklarında adaleti sağlarken, kalbimiz her daim anavatanımızla atıyor. Departmanımızda toplanan fonlar ve personellerimizin gönüllü katkılarıyla, <strong>her ay düzenli olarak TSK Mehmetçik Vakfı'na</strong> bağışta bulunmaktan büyük bir onur duyuyoruz.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--lapd-gray-bg)', padding: '0.8rem 1.5rem', border: '1px solid var(--lapd-border)' }}>
            <i className="fa-solid fa-hand-holding-heart" style={{ color: '#E30A17', fontSize: '1.2rem' }}></i>
            <span style={{ color: 'var(--lapd-text-dark)', fontWeight: 600, fontSize: '0.95rem' }}>Şehit ve gazi ailelerimizin daima yanındayız.</span>
          </div>
        </motion.div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginTop: '6rem', padding: '0 2rem' }}>
        <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1rem' }}>
          HEMEN ARAMIZA KATILIN
        </motion.h2>
        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--lapd-text-muted)', fontSize: '1.1rem', margin: '0 auto 2.5rem', maxWidth: '600px' }}>
          Süreç zorlu, standartlar yüksek, ancak şehrinize hizmet etmenin ödülü eşsizdir.
        </p>
        <motion.a href="https://discord.com/invite/laco" target="_blank" rel="noopener noreferrer"
          style={{ backgroundColor: 'var(--lapd-orange)', color: 'white', fontSize: '1rem', padding: '1.2rem 3.5rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', transition: 'background-color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange-hover)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange)'}>
          <i className="fa-brands fa-discord" />
          DISCORD SUNUCUMUZA KATIL
        </motion.a>
      </motion.section>
    </div>
  );
}
