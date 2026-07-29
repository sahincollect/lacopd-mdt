"use client";

import Link from 'next/link';

export default function HaberlerPage() {
  const newsItems = [
    {
      id: 1,
      tag: "GANG UNIT",
      title: "Los Angeles Sokaklarında Dev Çete Operasyonu",
      date: "August 12, 2026",
      desc: "LAPD Gang Unit (GED) ekiplerinin aylardır sürdürdüğü teknik ve fiziki takip sonucu, Güney Los Angeles bölgesinde çok sayıda adrese eş zamanlı şafak baskını düzenlendi. Operasyonda yüksek miktarda yasadışı madde ve ruhsatsız silah ele geçirilirken, 15 şüpheli gözaltına alındı. Yetkililer, sokaklardaki çete şiddetine karşı sıfır tolerans politikasının devam edeceğini vurguladı.",
      img: "/news/1.jpg",
      featured: true
    },
    {
      id: 2,
      tag: "OPERATION",
      title: "Organize Suç Örgütlerine Büyük Darbe",
      date: "August 09, 2026",
      desc: "GED (Gang Enforcement Detail) ekipleri, şehir merkezinde faaliyet gösteren organize bir şebekeyi çökertti. Sivil ekiplerin de katıldığı operasyon nefes kesen anlara sahne oldu.",
      img: "/news/2.jpg",
      featured: false
    },
    {
      id: 3,
      tag: "TRAFFIC",
      title: "Crash Night: Hafta Sonu Trafik Denetimleri",
      date: "August 05, 2026",
      desc: "Artan trafik kazaları ve kural ihlallerinin önüne geçmek amacıyla Trafik Birimi (TED), ana arterlerde geniş çaplı 'Crash Night' denetimleri başlattı. Sürücülere uyarılar yapıldı.",
      img: "/news/3.jpg",
      featured: false
    },
    {
      id: 4,
      tag: "FLEET",
      title: "LAPD Filosuna Yeni Nesil Devriye Araçları",
      date: "August 01, 2026",
      desc: "Departmanın araç filosu modernize ediliyor. Arreolas Grafix tarafından özel olarak tasarlanan yeni 'livery' kaplamalarına sahip devriye araçları sokaklarda yerini almaya başladı.",
      img: "/news/4.jpg",
      featured: false
    },
    {
      id: 5,
      tag: "TECHNOLOGY",
      title: "Taktiksel Üstünlük: Yeni Araçların Teknolojisi",
      date: "July 28, 2026",
      desc: "Yeni envantere katılan araçlar sadece dış görünüşleriyle değil, içlerindeki son teknoloji plaka okuma sistemleri (ALPR) ve gelişmiş iletişim ağlarıyla da dikkat çekiyor.",
      img: "/news/5.jpg",
      featured: false
    },
    {
      id: 6,
      tag: "CRIME",
      title: "Şafak Operasyonu: Ağır Silahlar Ele Geçirildi",
      date: "July 25, 2026",
      desc: "İstihbarat birimlerinin sağladığı veriler ışığında harekete geçen taktiksel ekipler, bir depoya düzenledikleri operasyonda yüksek kalibreli silahlar ve mühimmatlar ele geçirdi.",
      img: "/news/6.jpg",
      featured: false
    }
  ];

  const featuredNews = newsItems.find(n => n.featured);
  const otherNews = newsItems.filter(n => !n.featured);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-inter)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Haberler</span>
        </div>
      </div>

      {/* ── BREAKING NEWS TICKER ── */}
      <div style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', padding: '12px 2rem', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '2px', whiteSpace: 'nowrap' }}>SON DAKİKA</div>
        </div>
        <div style={{ height: '20px', width: '2px', backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          LAPD Şefi, şehir genelinde çete faaliyetlerine karşı sıfır tolerans politikasının devreye sokulduğunu açıkladı.
        </div>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        {/* ── PAGE TITLE ── */}
        <div style={{ marginBottom: '3rem', borderLeft: '4px solid var(--lapd-orange)', paddingLeft: '1.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, textTransform: 'uppercase' }}>Haber Merkezi</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Los Angeles Polis Departmanı'ndan en güncel gelişmeler ve operasyonel duyurular.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3rem' }}>
          
          {/* ── LEFT COLUMN: HERO NEWS ── */}
          {featuredNews && (
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column' }}>
              <div 
                style={{ 
                  position: 'relative', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  aspectRatio: '16/9',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer'
                }}
                onMouseOver={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseOut={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <img 
                  src={featuredNews.img} 
                  alt={featuredNews.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)' }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }}></div>
                
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '3rem 2.5rem' }}>
                  <div style={{ display: 'inline-block', backgroundColor: 'var(--lapd-orange)', color: 'var(--bg-primary)', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1rem', borderRadius: '4px' }}>
                    {featuredNews.tag}
                  </div>
                  <h2 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1rem', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {featuredNews.title}
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: '#f3f4f6', lineHeight: 1.6, maxWidth: '90%', margin: '0 0 1rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {featuredNews.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-regular fa-clock"></i>
                      {featuredNews.date}
                    </div>
                    <div style={{ width: '4px', height: '4px', backgroundColor: '#6b7280', borderRadius: '50%' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fa-solid fa-pen-nib"></i>
                      LAPD Medya İlişkileri
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RIGHT COLUMN: SIDE STORIES ── */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border-strong)', paddingBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Öne Çıkanlar</h3>
              <i className="fa-solid fa-bolt" style={{ color: 'var(--lapd-orange)' }}></i>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {otherNews.slice(0, 3).map((news, index) => (
                <div 
                  key={news.id} 
                  style={{ display: 'flex', gap: '1rem', paddingBottom: index !== 2 ? '1.5rem' : '0', borderBottom: index !== 2 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', group: 'true' }}
                  onMouseOver={e => {
                    const title = e.currentTarget.querySelector('h4');
                    if (title) title.style.color = 'var(--lapd-orange)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={e => {
                    const title = e.currentTarget.querySelector('h4');
                    if (title) title.style.color = 'var(--text-primary)';
                    const img = e.currentTarget.querySelector('img');
                    if (img) img.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={news.img} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--lapd-orange)', letterSpacing: '1px', marginBottom: '0.3rem' }}>{news.tag}</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem', lineHeight: 1.3, color: 'var(--text-primary)', transition: 'color 0.2s' }}>
                      {news.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i>{news.date}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* ── CTA WIDGET ── */}
            <div style={{ marginTop: 'auto', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-light)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', color: 'var(--border-strong)', opacity: 0.1, transform: 'rotate(-15deg)' }}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', position: 'relative', zIndex: 1 }}>Ekiplerimize Katılın</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>Los Angeles sokaklarını güvenli tutmak için cesur ve kararlı memurlara ihtiyacımız var.</p>
              <Link href="/basvurular/memur" style={{ display: 'inline-block', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', padding: '0.8rem 1.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', zIndex: 1 }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Akademiye Başvur
              </Link>
            </div>
          </div>
        </div>

        {/* ── LOWER GRID ── */}
        <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '2px solid var(--border-strong)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Diğer Haberler</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {otherNews.slice(3).map(news => (
              <div 
                key={news.id} 
                style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                onMouseOver={e => {
                  const title = e.currentTarget.querySelector('h3');
                  if (title) title.style.color = 'var(--lapd-orange)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseOut={e => {
                  const title = e.currentTarget.querySelector('h3');
                  if (title) title.style.color = 'var(--text-primary)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.2rem' }}>
                  <img src={news.img} alt={news.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
                  <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{news.tag}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{news.date}</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 1rem', lineHeight: 1.3, transition: 'color 0.2s' }}>
                  {news.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {news.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}} />
    </div>
  );
}
