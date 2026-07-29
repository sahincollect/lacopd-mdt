"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HaberlerPage() {
  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const newsItems = [
    {
      id: 1,
      tag: "BASIN BÜLTENİ",
      title: "LAPD Özel Harekât (SWAT) Ekibi Vinewood'da Rehine Krizini Başarıyla Çözdü",
      date: "28 Temmuz 2026",
      desc: "Dün gece geç saatlerde Batı Vinewood'da bir bankada meydana gelen silahlı soygun ve rehine alma girişimi, LAPD SWAT ekiplerinin başarılı operasyonuyla can kaybı yaşanmadan sonlandırıldı. Şüpheliler gözaltına alındı.",
      img: "/gallery/8.png",
      featured: true
    },
    {
      id: 2,
      tag: "TOPLUMSAL İLİŞKİLER",
      title: "Yeni 'Ride-Along' Sürüş Programı Başlıyor",
      date: "25 Temmuz 2026",
      desc: "Vatandaşlarımızın polis memurlarının günlük görevlerine tanıklık edebilmesi için başlatılan Ride-Along programı kayıtları açıldı. Toplumla şeffaf bağlar kurmak en büyük önceliğimiz.",
      img: "/gallery/statecar5.png",
      featured: false
    },
    {
      id: 3,
      tag: "TRAFİK BÜROSU",
      title: "Otoyol Güvenliği: Hız İhlallerine Karşı Sıkı Denetim",
      date: "22 Temmuz 2026",
      desc: "Los Angeles otoyollarında artan trafik kazalarını önlemek amacıyla Trafik Birimi (TED), önümüzdeki hafta boyunca yüksek katılımlı bir radar denetimi gerçekleştireceğini duyurdu.",
      img: "/gallery/saspbenz.png",
      featured: false
    },
    {
      id: 4,
      tag: "AKADEMİ",
      title: "Season 1 Polis Akademisi Mezuniyet Töreni Gerçekleşti",
      date: "15 Temmuz 2026",
      desc: "Aylarca süren zorlu fiziksel ve zihinsel eğitimlerini tamamlayan yeni aday memurlarımız, bugün düzenlenen törenle yemin ederek rozetlerini taktılar. Los Angeles sokakları artık daha güvenli.",
      img: "/gallery/lapdtoren3.png",
      featured: false
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--lapd-bg)', color: 'var(--lapd-text-dark)', fontFamily: 'var(--font-inter)', minHeight: '100vh', paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: '#F0F4F4', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Haberler & Basın Odası</span>
        </div>
      </div>

      {/* ── Hero / Sayfa Başlığı ── */}
      <section style={{ backgroundColor: 'white', padding: '4rem 2rem', borderBottom: '1px solid var(--lapd-border)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          HABER ODASI
        </h1>
        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
        <p style={{ fontSize: '1.1rem', color: 'var(--lapd-text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Los Angeles Community Police Department'ın en güncel basın bültenleri, olay raporları ve departman duyuruları.
        </p>
      </section>

      {/* ── İÇERİK BÖLÜMÜ ── */}
      <motion.section 
        initial="hidden" animate="visible" variants={staggerContainer} 
        style={{ maxWidth: '1200px', margin: '4rem auto 0', padding: '0 2rem' }}
      >
        
        {/* ÖNE ÇIKAN HABER */}
        {newsItems.filter(n => n.featured).map(news => (
          <motion.div variants={fadeUp} key={news.id} style={{ 
            display: 'flex', flexWrap: 'wrap', backgroundColor: 'white', border: '1px solid var(--lapd-border)', marginBottom: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
          }}>
            <div style={{ flex: '1 1 500px', minHeight: '350px', backgroundImage: `url(${news.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div style={{ flex: '1 1 400px', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--lapd-orange)', letterSpacing: '0.1em', marginBottom: '1rem' }}>{news.tag}</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1.2, marginBottom: '1rem' }}>{news.title}</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--lapd-text-muted)', marginBottom: '1.5rem', fontWeight: 600 }}>
                <i className="fa-regular fa-calendar" style={{ marginRight: '8px' }}></i> {news.date}
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--lapd-text-dark)', lineHeight: 1.7, marginBottom: '2rem' }}>
                {news.desc}
              </p>
              <div>
                <button style={{ backgroundColor: 'var(--lapd-blue-dark)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--lapd-blue-dark)'}>
                  Devamını Oku &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* DİĞER HABERLER GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {newsItems.filter(n => !n.featured).map(news => (
            <motion.div variants={fadeUp} key={news.id} style={{ 
              backgroundColor: 'white', border: '1px solid var(--lapd-border)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.06)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: '100%', height: '220px', backgroundImage: `url(${news.img})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--lapd-border)' }}></div>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--lapd-orange)', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>{news.tag}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', lineHeight: 1.3, marginBottom: '1rem' }}>{news.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--lapd-text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
                  <i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i> {news.date}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--lapd-text-dark)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  {news.desc}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <span style={{ color: 'var(--lapd-blue-dark)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--lapd-orange)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--lapd-blue-dark)'}>
                    Haberi Oku &rarr;
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </motion.section>

      {/* ── SOSYAL MEDYA CALL TO ACTION ── */}
      <section style={{ backgroundColor: 'var(--lapd-blue-dark)', color: 'white', textAlign: 'center', padding: '4rem 2rem', marginTop: '5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem' }}>Anlık Gelişmeler İçin Bizi Takip Edin</h2>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          En sıcak haberler, olay yeri duyuruları ve topluluk etkinliklerinden ilk siz haberdar olun.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a href="https://discord.com/invite/laco" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', textDecoration: 'none', fontSize: '1.5rem', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--lapd-orange)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
            <i className="fa-brands fa-discord"></i>
          </a>
          <a href="https://www.youtube.com/@Thelapd-7" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '50%', textDecoration: 'none', fontSize: '1.5rem', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FF0000'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
            <i className="fa-brands fa-youtube"></i>
          </a>
        </div>
      </section>

    </div>
  );
}
