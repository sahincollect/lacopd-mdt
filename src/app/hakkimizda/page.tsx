"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hakkimizda() {
  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const divisions = [
    { id: "patrol",    name: "Genel Devriye (Patrol)",        icon: "fa-shield",           desc: "Şehrin ön safhalarındaki ilk müdahale hattı. Günlük asayiş, acil çağrılara yanıt ve sokak güvenliğinden sorumlu temel birim." },
    { id: "detective", name: "Dedektif Bürosu (RHD)",         icon: "fa-magnifying-glass", desc: "Cinayet, ağır suçlar ve büyük çaplı soygunların arkasındaki gerçeği aydınlatan deneyimli soruşturma ekibi." },
    { id: "gnd",       name: "Çete ve Narkotik (GND)",         icon: "fa-skull-crossbones", desc: "Sokak çeteleri, uyuşturucu kaçakçılığı ve yasadışı silah ticaretiyle mücadele eden özel operasyon ve soruşturma birimi." },
    { id: "swat",      name: "Özel Harekat (SWAT/Metro)",     icon: "fa-crosshairs",       desc: "Rehine kurtarma, yüksek riskli baskınlar, terörle mücadele ve standart birimlerin kapasitesini aşan kriz durumları için ağır teçhizatlı taktik birimi." },
    { id: "traffic",   name: "Trafik Birimi (TED)",            icon: "fa-car-side",         desc: "Otoyolların güvenliğini sağlayan, trafik kazalarını inceleyen ve yüksek hızlı kovalamacalarda öncülük eden özel donanımlı devriye birimi." },
    { id: "air",       name: "Hava Destek Birimi (ASD)",       icon: "fa-helicopter",       desc: "Şehrin gökyüzündeki gözleri. Helikopterlerle yaya/araç takibi, alan aydınlatması ve devriyelere havadan istihbarat sağlar." },
    { id: "k9",        name: "K-9 Birimi",                     icon: "fa-paw",              desc: "Şüpheli takibi, uyuşturucu/patlayıcı tespiti ve arama kurtarma görevleri için özel eğitimli polis köpekleri ve idarecilerinden oluşur." },
  ];

  const hierarchy = [
    {
      tier: "LİDERLİK KADEMESİ",
      color: "var(--lapd-blue-dark)",
      bg: "white",
      ranks: [
        { title: "Community Lead", icon: "fa-star", desc: "Topluluğun kurucusu ve nihai karar mercii." }
      ]
    },
    {
      tier: "YÜKSEK KOMUTA (HIGH COMMAND)",
      color: "var(--lapd-blue)",
      bg: "#f0f4f8",
      ranks: [
        { title: "Chief of Police", icon: "fa-star", desc: "Departmanın en yetkili memuru, vizyon ve stratejiyi belirler." },
        { title: "Assistant Chief", icon: "fa-star-half-stroke", desc: "Şefin sağ kolu, büroların denetiminden sorumludur." },
        { title: "Deputy Chief", icon: "fa-shield-halved", desc: "Büro yöneticileri ve üst düzey operasyon amirleridir." }
      ]
    },
    {
      tier: "KOMUTA KADEMESİ (COMMAND STAFF)",
      color: "var(--lapd-orange)",
      bg: "#fffaf0",
      ranks: [
        { title: "Commander", icon: "fa-certificate", desc: "Bölge veya büyük grupların yöneticiliğini üstlenir." },
        { title: "Captain", icon: "fa-medal", desc: "İstasyonların ve belirli departman birimlerinin komutanları." }
      ]
    },
    {
      tier: "DENETLEYİCİ KADEME (SUPERVISORY STAFF)",
      color: "var(--lapd-text-dark)",
      bg: "#f9fafb",
      ranks: [
        { title: "Lieutenant", icon: "fa-id-badge", desc: "Vardiya amirleri ve operasyon yöneticileridir." },
        { title: "Sergeant", icon: "fa-chevron-up", desc: "Sahadaki liderler, personelin doğrudan denetleyicileri." }
      ]
    },
    {
      tier: "SAHA PERSONELİ (FIELD STAFF)",
      color: "var(--lapd-text-muted)",
      bg: "white",
      ranks: [
        { title: "Detective", icon: "fa-user-secret", desc: "Soruşturma ve sivil saha operasyonları uzmanları." },
        { title: "Officer", icon: "fa-user-shield", desc: "Sahadaki ilk müdahale ekibi, devriye memurları." },
        { title: "Cadet", icon: "fa-user", desc: "Akademi sürecindeki aday memurlar." }
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--lapd-bg)', color: 'var(--lapd-text-dark)', fontFamily: 'var(--font-inter)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: '#F0F4F4', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Biz Kimiz?</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderBottom: '1px solid var(--lapd-border)', backgroundImage: 'url("/gallery/saspbenz.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.9)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', padding: '0 2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: '3.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            BİZ KİMİZ?
          </h1>
          <p style={{ color: 'var(--lapd-text-dark)', fontSize: '1.1rem', lineHeight: '1.8', margin: '0 auto', maxWidth: '750px', fontWeight: 500 }}>
            Biz, Los Angeles şehrinin huzur ve güvenliğini sağlamaya yemin etmiş, profesyonelliğin ve taktiksel üstünlüğün zirvesini temsil eden <strong>LACPORTAL</strong> ekibiyiz.
          </p>
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

      {/* ── Komuta Kademesi Org Chart ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ maxWidth: '1000px', margin: '5rem auto 0', padding: '0 2rem' }}>
        <motion.div variants={fadeUp} style={{ backgroundColor: 'white', border: '1px solid var(--lapd-border)', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1, marginBottom: '1rem' }}>
              KOMUTA KADEMESİ
            </h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: 'var(--lapd-text-muted)', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
              Los Angeles Community Police Department, operasyonel başarıyı sağlamak adına katı bir emir-komuta zinciriyle yönetilir.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {hierarchy.map((tier, idx) => (
              <div key={idx} style={{ 
                border: '1px solid var(--lapd-border)', 
                borderLeft: `4px solid ${tier.color}`,
                backgroundColor: tier.bg,
                padding: '2rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: tier.color, letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                  {tier.tier}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {tier.ranks.map((rank, ridx) => (
                    <div key={ridx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: tier.color, flexShrink: 0 }}>
                        <i className={`fa-solid ${rank.icon}`} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--lapd-text-dark)' }}>{rank.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--lapd-text-muted)', lineHeight: 1.4 }}>{rank.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
          
          {/* TÜRK BAYRAĞI */}
          <div style={{ 
            width: '100px', height: '100px', 
            borderRadius: '50%', 
            backgroundColor: '#fef2f2', 
            border: '3px solid #fca5a5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginBottom: '2rem',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(227, 10, 23, 0.2)'
          }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg" alt="Türk Bayrağı" style={{ width: '150%', height: '150%', objectFit: 'cover' }} />
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
