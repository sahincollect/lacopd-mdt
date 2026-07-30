"use client";

import Link from 'next/link';

export default function KariyerPage() {
  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div style={{ backgroundColor: 'var(--LAC-bg)', minHeight: '100vh', color: 'var(--LAC-text-dark)', overflowX: 'hidden', fontFamily: 'var(--font-inter)' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem 2rem', borderBottom: '1px solid var(--LAC-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--LAC-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--LAC-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--LAC-orange)' }}>Kariyer Olanakları</span>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section style={{ position: 'relative', padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--LAC-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--LAC-border)', padding: '0.4rem 1.2rem', marginBottom: '2rem' }}>
            <i className="fa-solid fa-star" style={{ color: 'var(--LAC-orange)', fontSize: '0.8rem' }}></i>
            <span style={{ fontSize: '0.85rem', color: 'var(--LAC-blue-dark)', fontWeight: 800, letterSpacing: '0.1em' }}>JOIN THE LAC</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', color: 'var(--LAC-blue-dark)', letterSpacing: '-0.02em' }}>
            Roleplay'in Ötesine Geçin:<br/>
            <span style={{ color: 'var(--LAC-orange)' }}>
              En Gerçekçi Polislik Deneyimi
            </span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--LAC-text-dark)', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto' }}>
            Doğrudan kaynağında, <strong>gerçek Amerikan polisleri ve dedektifleriyle</strong> hazırlanan müfredatımızla Los Angeles sokaklarının otoritesi olun. Standartları biz belirliyoruz.
          </p>
        </div>
      </section>

      {/* 2. NEDEN BİZ? */}
      <section style={{ position: 'relative', padding: '5rem 2rem', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--LAC-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--LAC-blue-dark)' }}>Fark Yaratan Özelliklerimiz</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--LAC-orange)', margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: 'var(--LAC-text-muted)', fontSize: '1.1rem' }}>Neden başka sunucuda değil de burada polis olmalısınız?</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Feature 1 */}
            <div style={{ padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--LAC-border)', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--LAC-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--LAC-blue-dark)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--LAC-blue-dark)' }}>Eksiksiz ve Gerçekçi Müfredat</h3>
              <p style={{ color: 'var(--LAC-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>Eğitim dokümanlarımız, prosedürlerimiz ve saha taktiklerimiz, ABD'de aktif görev yapan polis memurları ve dedektiflerin sağladığı gerçek eğitim materyalleri referans alınarak özenle hazırlanmıştır.</p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--LAC-border)', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--LAC-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--LAC-blue-dark)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-video"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--LAC-blue-dark)' }}>Canlı Taktiksel Eğitimler</h3>
              <p style={{ color: 'var(--LAC-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>Roleplay dünyasında bir ilk! Sadece okuyarak değil, uygulayarak öğrenin. Akademi sürecimizde ve sonrasında, <strong>gerçek Amerikan kolluk kuvvetleri personeliyle</strong> Discord üzerinden canlı bağlantılar kuruyor, soru-cevap oturumları ve interaktif teorik eğitimler düzenliyoruz.</p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--LAC-border)', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--LAC-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--LAC-blue-dark)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-ranking-star"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--LAC-blue-dark)' }}>Gerçekçi Hiyerarşi ve Kariyer Yolu</h3>
              <p style={{ color: 'var(--LAC-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>Devriye memurluğundan dedektifliğe veya özel taktiksel birimlere (SWAT) kadar uzanan, tamamen gerçek hayattaki liyakat sistemine dayalı, zorlayıcı ve bir o kadar tatmin edici bir kariyer inşa edin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AKADEMİ SÜRECİ (Timeline) */}
      <section style={{ position: 'relative', padding: '7rem 2rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--LAC-blue-dark)' }}>Akademi Süreci</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--LAC-orange)', margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: 'var(--LAC-text-muted)', fontSize: '1.1rem' }}>Başvurunuzdan rozetinizi taktığınız ilk güne kadar sizi neler bekliyor?</p>
          </div>

          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            {/* Dikey Çizgi */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '2rem', width: '2px', backgroundColor: 'var(--LAC-border)' }}></div>

            {[
              { title: "Faz 1: İşe Alım (Recruitment)", desc: "Başvuru formunuzun titizlikle incelenmesi ve hem rol yapma yeteneklerinizi hem de karakter hikayenizi değerlendirdiğimiz temel IC/OOC mülakat aşaması.", icon: "fa-clipboard-user" },
              { title: "Faz 2: Akademi (The Academy)", desc: "Gerçek materyallerle desteklenmiş hukuki ve taktiksel teori eğitimi. Bu aşamada ABD polisleriyle gerçekleştirilen canlı seminerlere katılacak ve LAC yasalarını öğreneceksiniz.", icon: "fa-school" },
              { title: "Faz 3: Saha Eğitimi (FTO Program)", desc: "Öğrendiklerinizi sahada test etme vakti. Kıdemli bir saha eğitim memuru (FTO) eşliğinde sokaklarda pratik deneyim kazanacak ve gerçekçi senaryolarla sınanacaksınız.", icon: "fa-car-side" },
              { title: "Faz 4: Yemin Töreni ve Görev", desc: "Tüm eğitimleri başarıyla tamamladıktan sonra resmi yemin töreninde rozetinizi takar ve tam yetkili bir LAC memuru olarak Los Santos sokaklarında adaleti sağlamaya başlarsınız.", icon: "fa-shield-halved" },
            ].map((step, idx) => (
              <div key={idx} style={{ position: 'relative', paddingLeft: '3rem', marginBottom: idx !== 3 ? '4rem' : '0' }}>
                <div style={{
                  position: 'absolute', left: '-13px', top: '10px', width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)', border: '4px solid var(--LAC-orange)'
                }}></div>
                <div style={{ padding: '2rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--LAC-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                    <i className={`fa-solid ${step.icon}`} style={{ color: 'var(--LAC-blue-dark)', fontSize: '1.2rem' }}></i>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--LAC-blue-dark)' }}>{step.title}</h3>
                  </div>
                  <p style={{ color: 'var(--LAC-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '1rem' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. S.S.S. */}
      <section style={{ position: 'relative', padding: '5rem 2rem 8rem', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--LAC-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--LAC-blue-dark)' }}>Sıkça Sorulan Sorular</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--LAC-orange)', margin: '0 auto 1.5rem' }}></div>
            <p style={{ color: 'var(--LAC-text-muted)', fontSize: '1.1rem' }}>Eğitimlerin ciddiyeti sizi korkutmasın, buradayız.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--LAC-border)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--LAC-blue-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--LAC-orange)' }}></i>
                Eğitimler ne kadar zorlayıcı?
              </h4>
              <p style={{ color: 'var(--LAC-text-dark)', lineHeight: 1.6, margin: 0 }}>Amacımız sizi zorlamak değil, en yüksek kalitede roleplay deneyimine hazırlamak. Eğitim sürecimiz aşama aşama tasarlanmıştır. Eğitmenlerimiz ve gerçek polis danışmanlarımız her adımda sizi destekler ve eksiklerinizi kapatmanız için size yardımcı olur.</p>
            </div>

            <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--LAC-border)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--LAC-blue-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--LAC-orange)' }}></i>
                Gerçek polislerle yapılan canlı eğitimler için ileri seviye İngilizce şart mı?
              </h4>
              <p style={{ color: 'var(--LAC-text-dark)', lineHeight: 1.6, margin: 0 }}>Hayır, kesinlikle şart değil! Topluluğumuzda eş zamanlı (simultane) ve senkronize çeviri desteği sunan, hem polis terminolojisine hem de dilimize çok hakim profesyonel çevirmenlerimiz bulunuyor. Canlı seminerlerimizde tüm eğitimler anlık olarak Türkçeye çevrildiği için herhangi bir detayı kaçırmadan en üst düzey eğitimin bir parçası olabilirsiniz.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
