"use client";

import Link from 'next/link';
import { motion } from "framer-motion";

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
    <div style={{ backgroundColor: 'var(--lapd-bg)', minHeight: '100vh', color: 'var(--lapd-text-dark)', overflowX: 'hidden', fontFamily: 'var(--font-inter)' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: '#F0F4F4', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Kariyer Olanakları</span>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section style={{ position: 'relative', padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'white', borderBottom: '1px solid var(--lapd-border)' }}>
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--lapd-gray-bg)', border: '1px solid var(--lapd-border)', padding: '0.4rem 1.2rem', marginBottom: '2rem' }}>
            <i className="fa-solid fa-star" style={{ color: 'var(--lapd-orange)', fontSize: '0.8rem' }}></i>
            <span style={{ fontSize: '0.85rem', color: 'var(--lapd-blue-dark)', fontWeight: 800, letterSpacing: '0.1em' }}>JOIN THE LAPD</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', color: 'var(--lapd-blue-dark)', letterSpacing: '-0.02em' }}>
            Roleplay'in Ötesine Geçin:<br/>
            <span style={{ color: 'var(--lapd-orange)' }}>
              En Gerçekçi Polislik Deneyimi
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: '1.2rem', color: 'var(--lapd-text-dark)', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto' }}>
            Doğrudan kaynağında, <strong>gerçek Amerikan polisleri ve dedektifleriyle</strong> hazırlanan müfredatımızla Los Angeles sokaklarının otoritesi olun. Standartları biz belirliyoruz.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. NEDEN BİZ? */}
      <section style={{ position: 'relative', padding: '5rem 2rem', backgroundColor: 'var(--lapd-gray-bg)', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--lapd-blue-dark)' }}>Fark Yaratan Özelliklerimiz</motion.h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
            <motion.p variants={fadeUp} style={{ color: 'var(--lapd-text-muted)', fontSize: '1.1rem' }}>Neden başka sunucuda değil de burada polis olmalısınız?</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Feature 1 */}
            <motion.div variants={fadeUp} style={{ padding: '2.5rem', backgroundColor: 'white', border: '1px solid var(--lapd-border)', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--lapd-gray-bg)', border: '1px solid var(--lapd-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--lapd-blue-dark)' }}>Eksiksiz ve Gerçekçi Müfredat</h3>
              <p style={{ color: 'var(--lapd-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>Eğitim dokümanlarımız, prosedürlerimiz ve saha taktiklerimiz, ABD'de aktif görev yapan polis memurları ve dedektiflerin sağladığı gerçek eğitim materyalleri referans alınarak özenle hazırlanmıştır.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUp} style={{ padding: '2.5rem', backgroundColor: 'white', border: '1px solid var(--lapd-border)', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--lapd-gray-bg)', border: '1px solid var(--lapd-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-video"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--lapd-blue-dark)' }}>Canlı Taktiksel Eğitimler</h3>
              <p style={{ color: 'var(--lapd-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>Roleplay dünyasında bir ilk! Sadece okuyarak değil, uygulayarak öğrenin. Akademi sürecimizde ve sonrasında, <strong>gerçek Amerikan kolluk kuvvetleri personeliyle</strong> Discord üzerinden canlı bağlantılar kuruyor, soru-cevap oturumları ve interaktif teorik eğitimler düzenliyoruz.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUp} style={{ padding: '2.5rem', backgroundColor: 'white', border: '1px solid var(--lapd-border)', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)'; }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--lapd-gray-bg)', border: '1px solid var(--lapd-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--lapd-blue-dark)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-ranking-star"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--lapd-blue-dark)' }}>Gerçekçi Hiyerarşi ve Kariyer Yolu</h3>
              <p style={{ color: 'var(--lapd-text-dark)', lineHeight: 1.6, fontSize: '0.95rem' }}>Devriye memurluğundan dedektifliğe veya özel taktiksel birimlere (SWAT) kadar uzanan, tamamen gerçek hayattaki liyakat sistemine dayalı, zorlayıcı ve bir o kadar tatmin edici bir kariyer inşa edin.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. AKADEMİ SÜRECİ (Timeline) */}
      <section style={{ position: 'relative', padding: '7rem 2rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--lapd-blue-dark)' }}>Akademi Süreci</motion.h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
            <motion.p variants={fadeUp} style={{ color: 'var(--lapd-text-muted)', fontSize: '1.1rem' }}>Başvurunuzdan rozetinizi taktığınız ilk güne kadar sizi neler bekliyor?</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ position: 'relative', paddingLeft: '2rem' }}>
            {/* Dikey Çizgi */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '2rem', width: '2px', backgroundColor: 'var(--lapd-border)' }}></div>

            {[
              { title: "Faz 1: İşe Alım (Recruitment)", desc: "Başvuru formunuzun titizlikle incelenmesi ve hem rol yapma yeteneklerinizi hem de karakter hikayenizi değerlendirdiğimiz temel IC/OOC mülakat aşaması.", icon: "fa-clipboard-user" },
              { title: "Faz 2: Akademi (The Academy)", desc: "Gerçek materyallerle desteklenmiş hukuki ve taktiksel teori eğitimi. Bu aşamada ABD polisleriyle gerçekleştirilen canlı seminerlere katılacak ve LAC yasalarını öğreneceksiniz.", icon: "fa-school" },
              { title: "Faz 3: Saha Eğitimi (FTO Program)", desc: "Öğrendiklerinizi sahada test etme vakti. Kıdemli bir saha eğitim memuru (FTO) eşliğinde sokaklarda pratik deneyim kazanacak ve gerçekçi senaryolarla sınanacaksınız.", icon: "fa-car-side" },
              { title: "Faz 4: Yemin Töreni ve Görev", desc: "Tüm eğitimleri başarıyla tamamladıktan sonra resmi yemin töreninde rozetinizi takar ve tam yetkili bir LAC memuru olarak Los Santos sokaklarında adaleti sağlamaya başlarsınız.", icon: "fa-shield-halved" },
            ].map((step, idx) => (
              <motion.div key={idx} variants={fadeUp} style={{ position: 'relative', paddingLeft: '3rem', marginBottom: idx !== 3 ? '4rem' : '0' }}>
                <div style={{
                  position: 'absolute', left: '-13px', top: '10px', width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: 'white', border: '4px solid var(--lapd-orange)'
                }}></div>
                <div style={{ padding: '2rem', backgroundColor: 'var(--lapd-gray-bg)', border: '1px solid var(--lapd-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                    <i className={`fa-solid ${step.icon}`} style={{ color: 'var(--lapd-blue-dark)', fontSize: '1.2rem' }}></i>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--lapd-blue-dark)' }}>{step.title}</h3>
                  </div>
                  <p style={{ color: 'var(--lapd-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '1rem' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. S.S.S. */}
      <section style={{ position: 'relative', padding: '5rem 2rem 8rem', backgroundColor: 'var(--lapd-gray-bg)', borderTop: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--lapd-blue-dark)' }}>Sıkça Sorulan Sorular</motion.h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', margin: '0 auto 1.5rem' }}></div>
            <motion.p variants={fadeUp} style={{ color: 'var(--lapd-text-muted)', fontSize: '1.1rem' }}>Eğitimlerin ciddiyeti sizi korkutmasın, buradayız.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <motion.div variants={fadeUp} style={{ padding: '2rem', backgroundColor: 'white', border: '1px solid var(--lapd-border)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--lapd-orange)' }}></i>
                Eğitimler ne kadar zorlayıcı?
              </h4>
              <p style={{ color: 'var(--lapd-text-dark)', lineHeight: 1.6, margin: 0 }}>Amacımız sizi zorlamak değil, en yüksek kalitede roleplay deneyimine hazırlamak. Eğitim sürecimiz aşama aşama tasarlanmıştır. Eğitmenlerimiz ve gerçek polis danışmanlarımız her adımda sizi destekler ve eksiklerinizi kapatmanız için size yardımcı olur.</p>
            </motion.div>

            <motion.div variants={fadeUp} style={{ padding: '2rem', backgroundColor: 'white', border: '1px solid var(--lapd-border)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--lapd-orange)' }}></i>
                Gerçek polislerle yapılan canlı eğitimler için ileri seviye İngilizce şart mı?
              </h4>
              <p style={{ color: 'var(--lapd-text-dark)', lineHeight: 1.6, margin: 0 }}>Hayır, kesinlikle şart değil! Topluluğumuzda eş zamanlı (simultane) ve senkronize çeviri desteği sunan, hem polis terminolojisine hem de dilimize çok hakim profesyonel çevirmenlerimiz bulunuyor. Canlı seminerlerimizde tüm eğitimler anlık olarak Türkçeye çevrildiği için herhangi bir detayı kaçırmadan en üst düzey eğitimin bir parçası olabilirsiniz.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

    </div>
  );
}
