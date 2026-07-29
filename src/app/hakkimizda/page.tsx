"use client";

import Link from 'next/link';

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
      bg: "var(--bg-tertiary)",
      ranks: [
        { title: "Sergeant II", icon: "fa-star", desc: "Topluluk Lideri (Community Lead) - Departmanın kurucusu ve nihai karar mercii." }
      ]
    },
    {
      tier: "ÜST DÜZEY YÖNETİM",
      color: "var(--lapd-blue)",
      bg: "var(--bg-tertiary)",
      ranks: [
        { title: "Detective III", icon: "fa-user-shield", desc: "Büro yöneticileri ve üst düzey operasyon amirleri." }
      ]
    },
    {
      tier: "DENETLEYİCİ KADEME",
      color: "var(--lapd-orange)",
      bg: "var(--bg-tertiary)",
      ranks: [
        { title: "Sergeant I", icon: "fa-chevron-up", desc: "Vardiya amirleri ve sahadaki doğrudan denetleyiciler." }
      ]
    },
    {
      tier: "SORUŞTURMA & UZMAN PERSONEL",
      color: "var(--lapd-text-dark)",
      bg: "var(--bg-tertiary)",
      ranks: [
        { title: "Detective II", icon: "fa-magnifying-glass", desc: "Kıdemli dedektifler ve uzman soruşturmacılar." },
        { title: "Detective I", icon: "fa-user-secret", desc: "Saha soruşturmaları ve sivil operasyon personeli." }
      ]
    },
    {
      tier: "SAHA PERSONELİ (PATROL)",
      color: "var(--lapd-text-muted)",
      bg: "var(--bg-tertiary)",
      ranks: [
        { title: "Officer III", icon: "fa-shield-halved", desc: "Kıdemli devriye memurları ve saha eğitmenleri." },
        { title: "Officer II", icon: "fa-shield", desc: "Bağımsız devriye atanabilen standart saha memurları." },
        { title: "Cadet", icon: "fa-user-check", desc: "Saha eğitim sürecindeki (FTO) yeni veya stajyer memurlar." }
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--lapd-bg)', color: 'var(--lapd-text-dark)', fontFamily: 'var(--font-inter)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Biz Kimiz?</span>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderBottom: '1px solid var(--lapd-border)', backgroundImage: 'url("/gallery/saspbenz.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--bg-primary) 0%, rgba(10, 10, 10, 0.7) 50%, var(--bg-primary) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', padding: '4rem 2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-inter)', fontSize: '3.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            BİZ KİMİZ?
          </h1>
          <p style={{ color: 'var(--lapd-text-dark)', fontSize: '1.1rem', lineHeight: '1.8', margin: '0 auto', maxWidth: '750px', fontWeight: 500 }}>
            Biz, Los Angeles şehrinin huzur ve güvenliğini sağlamaya yemin etmiş, profesyonelliğin ve taktiksel üstünlüğün zirvesini temsil eden <strong>LACPORTAL</strong> ekibiyiz.
          </p>
        </div>
      </section>

      {/* ── Birimler ── */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto 0', padding: '0 2rem' }}>
        <div style={{ borderLeft: '4px solid var(--lapd-orange)', paddingLeft: '1.5rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1 }}>
            DEPARTMAN BİRİMLERİ
          </h2>
          <p style={{ color: 'var(--lapd-text-muted)', fontSize: '1rem', marginTop: '1rem', maxWidth: '800px' }}>
            Los Angeles gibi devasa bir metropolün güvenliği, uzmanlaşmış ve senkronize çalışan birimlerin varlığıyla mümkündür.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {divisions.map(div => (
            <div key={div.id} style={{ 
              backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--lapd-border)', padding: '2rem', display: 'flex', flexDirection: 'column',
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
            </div>
          ))}
        </div>
      </section>

      {/* ── Komuta Kademesi Org Chart ── */}
      <section style={{ maxWidth: '1000px', margin: '5rem auto 0', padding: '0 2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--lapd-border)', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

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

        </div>
      </section>


      {/* ── CTA ── */}
      <section style={{ textAlign: 'center', marginTop: '6rem', padding: '0 2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1rem' }}>
          HEMEN ARAMIZA KATILIN
        </h2>
        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: 'var(--lapd-text-muted)', fontSize: '1.1rem', margin: '0 auto 2.5rem', maxWidth: '600px' }}>
          Süreç zorlu, standartlar yüksek, ancak şehrinize hizmet etmenin ödülü eşsizdir.
        </p>
        <a href="https://discord.com/invite/laco" target="_blank" rel="noopener noreferrer"
          style={{ backgroundColor: 'var(--lapd-orange)', color: 'white', fontSize: '1rem', padding: '1.2rem 3.5rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', transition: 'background-color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange-hover)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange)'}>
          <i className="fa-brands fa-discord" />
          DISCORD SUNUCUMUZA KATIL
        </a>
      </section>
    </div>
  );
}
