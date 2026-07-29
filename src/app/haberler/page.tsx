"use client";

import Link from 'next/link';

export default function HaberlerPage() {
  const newsItems = [
    {
      id: 1,
      tag: "BREAKING NEWS",
      title: "LAPD SWAT Ekibi Vinewood'da Rehine Krizini Başarıyla Çözdü",
      date: "Updated 10:45 AM PT, July 28, 2026",
      desc: "Dün gece geç saatlerde Batı Vinewood'da bir bankada meydana gelen silahlı soygun ve rehine alma girişimi, LAPD SWAT ekiplerinin başarılı operasyonuyla can kaybı yaşanmadan sonlandırıldı. Şüpheliler gözaltına alındı. Yetkililer halkı bölgeden uzak durmaları konusunda uyarmıştı ancak tehlike tamamen geçti.",
      img: "/gallery/8.png",
      featured: true
    },
    {
      id: 2,
      tag: "COMMUNITY",
      title: "Yeni 'Ride-Along' Sürüş Programı Başlıyor",
      date: "July 25, 2026",
      desc: "Vatandaşlarımızın polis memurlarının günlük görevlerine tanıklık edebilmesi için başlatılan Ride-Along programı kayıtları açıldı. Toplumla şeffaf bağlar kurmak en büyük önceliğimiz.",
      img: "/gallery/statecar5.png",
      featured: false
    },
    {
      id: 3,
      tag: "TRAFFIC",
      title: "Otoyol Güvenliği: Hız İhlallerine Karşı Sıkı Denetim",
      date: "July 22, 2026",
      desc: "Los Angeles otoyollarında artan trafik kazalarını önlemek amacıyla Trafik Birimi (TED), önümüzdeki hafta boyunca yüksek katılımlı bir radar denetimi gerçekleştireceğini duyurdu.",
      img: "/gallery/saspbenz.png",
      featured: false
    },
    {
      id: 4,
      tag: "ACADEMY",
      title: "Season 1 Polis Akademisi Mezuniyet Töreni Gerçekleşti",
      date: "July 15, 2026",
      desc: "Aylarca süren zorlu fiziksel ve zihinsel eğitimlerini tamamlayan yeni aday memurlarımız, bugün düzenlenen törenle yemin ederek rozetlerini taktılar.",
      img: "/gallery/lapdtoren3.png",
      featured: false
    },
    {
      id: 5,
      tag: "CRIME",
      title: "Güney Merkez'de Çete Operasyonu: 12 Gözaltı",
      date: "July 10, 2026",
      desc: "GND birimlerinin aylardır sürdürdüğü takip sonucu gerçekleşen şafak baskınında yasadışı silah ve yüklü miktarda nakit ele geçirildi.",
      img: "/gallery/6.png",
      featured: false
    }
  ];

  const featuredNews = newsItems.find(n => n.featured);
  const otherNews = newsItems.filter(n => !n.featured);

  return (
    <div style={{ backgroundColor: 'white', color: '#111', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', minHeight: '100vh' }}>
      


      {/* ── BREAKING NEWS BANNER ── */}
      <div style={{ backgroundColor: '#CC0000', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px' }}>BREAKING NEWS</div>
        <div style={{ height: '15px', width: '2px', backgroundColor: 'rgba(255,255,255,0.5)' }}></div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>LAPD Chief announces new community safety initiative starting next month.</div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          
          {/* LEFT COLUMN: HERO NEWS */}
          {featuredNews && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px', letterSpacing: '-0.5px', color: '#111' }}>
                  {featuredNews.title}
                </h1>
                <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
                  {featuredNews.desc}
                </p>
              </div>
              <div style={{ position: 'relative' }}>
                <img src={featuredNews.img} alt={featuredNews.title} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', maxHeight: '500px' }} />
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
                  {featuredNews.date}
                </div>
              </div>
            </div>
          )}

          {/* RIGHT COLUMN: MORE TOP STORIES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '2px solid #111', paddingBottom: '5px', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>More Top Stories</h2>
            </div>
            
            {otherNews.slice(0, 3).map((news, index) => (
              <div key={news.id} style={{ display: 'flex', gap: '15px', borderBottom: index !== 2 ? '1px solid #e2e2e2' : 'none', paddingBottom: index !== 2 ? '15px' : '0' }}>
                <img src={news.img} alt={news.title} style={{ width: '120px', height: '80px', objectFit: 'cover' }} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 5px', lineHeight: 1.3, color: '#111' }}>
                    {news.title}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>{news.date.split(',')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LOWER GRID (CNN STYLE 3 COLUMNS) ── */}
        <div style={{ marginTop: '3rem', borderTop: '4px solid #111', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {otherNews.map(news => (
            <div key={news.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <img src={news.img} alt={news.title} style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '10px' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.2 }}>
                {news.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.5, margin: 0 }}>
                {news.desc.length > 100 ? news.desc.substring(0, 100) + '...' : news.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* ── FOOTER (CNN STYLE) ── */}
      <footer style={{ backgroundColor: 'black', color: 'white', padding: '3rem 2rem', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#CC0000', color: 'white', fontWeight: 900, fontSize: '2rem', padding: '0px 10px', letterSpacing: '-2px', display: 'inline-block', lineHeight: 1.2 }}>
              CNN
            </div>
            <div style={{ fontSize: '0.9rem', color: '#999', display: 'flex', gap: '15px' }}>
              <span>World</span>
              <span>Politics</span>
              <span>Business</span>
              <span>Health</span>
              <span>Entertainment</span>
              <span>Tech</span>
              <span>Style</span>
              <span>Travel</span>
              <span>Sports</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>© 2026 Cable News Network. A Warner Bros. Discovery Company. All Rights Reserved.</span>
            <div style={{ display: 'flex', gap: '15px' }}>
              <span>Terms of Use</span>
              <span>Privacy Policy</span>
              <span>Ad Choices</span>
              <span>About Us</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
