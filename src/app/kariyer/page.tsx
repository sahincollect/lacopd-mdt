"use client";

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
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      
      {/* Arka Plan Gradient Efektleri */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 0,
        background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)',
        pointerEvents: 'none'
      }}></div>

      {/* 1. HERO SECTION */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: '10rem', paddingBottom: '6rem', textAlign: 'center', padding: '10rem 2rem 6rem' }}>
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(59, 130, 246,0.1)', border: '1px solid rgba(59, 130, 246,0.3)', borderRadius: '20px', padding: '0.4rem 1.2rem', marginBottom: '2rem' }}>
            <i className="fa-solid fa-star" style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}></i>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.1em' }}>JOIN THE LAC</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', fontFamily: "'Inter', sans-serif" }}>
            Roleplay&apos;in Ötesine Geçin:<br/>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px var(--accent-primary)', textShadow: '0 0 30px rgba(59, 130, 246,0.4)' }}>
              En Gerçekçi Polislik Deneyimi
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '750px', margin: '0 auto' }}>
            Doğrudan kaynağında, <span style={{ color: '#fff', fontWeight: 600 }}>gerçek Amerikan polisleri ve dedektifleriyle</span> hazırlanan müfredatımızla Los Angeles sokaklarının otoritesi olun. Standartları biz belirliyoruz.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. NEDEN BİZ? */}
      <section style={{ position: 'relative', zIndex: 1, padding: '5rem 2rem', backgroundColor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Fark Yaratan Özelliklerimiz</motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Neden başka sunucuda değil de burada polis olmalısınız?</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Feature 1 */}
            <motion.div variants={fadeUp} className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Eksiksiz ve Gerçekçi Müfredat</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>Eğitim dokümanlarımız, prosedürlerimiz ve saha taktiklerimiz, ABD&apos;de aktif görev yapan polis memurları ve dedektiflerin sağladığı gerçek eğitim materyalleri referans alınarak özenle hazırlanmıştır.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeUp} className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-video"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Canlı Taktiksel Eğitimler</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>Roleplay dünyasında bir ilk! Sadece okuyarak değil, uygulayarak öğrenin. Akademi sürecimizde ve sonrasında, <span style={{ color: '#fff' }}>gerçek Amerikan kolluk kuvvetleri personeliyle</span> Discord üzerinden canlı bağlantılar kuruyor, soru-cevap oturumları ve interaktif teorik eğitimler düzenliyoruz.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeUp} className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
              <div style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
                <i className="fa-solid fa-ranking-star"></i>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Gerçekçi Hiyerarşi ve Kariyer Yolu</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>Devriye memurluğundan dedektifliğe veya özel taktiksel birimlere (SWAT) kadar uzanan, tamamen gerçek hayattaki liyakat sistemine dayalı, zorlayıcı ve bir o kadar tatmin edici bir kariyer inşa edin.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. AKADEMİ SÜRECİ (Timeline) */}
      <section style={{ position: 'relative', zIndex: 1, padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Akademi Süreci</motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Başvurunuzdan rozetinizi taktığınız ilk güne kadar sizi neler bekliyor?</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ position: 'relative', paddingLeft: '2rem' }}>
            {/* Dikey Çizgi */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '2rem', width: '2px', backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>

            {[
              { title: "Faz 1: İşe Alım (Recruitment)", desc: "Başvuru formunuzun titizlikle incelenmesi ve hem rol yapma yeteneklerinizi hem de karakter hikayenizi değerlendirdiğimiz temel IC/OOC mülakat aşaması.", icon: "fa-clipboard-user" },
              { title: "Faz 2: Akademi (The Academy)", desc: "Gerçek materyallerle desteklenmiş hukuki ve taktiksel teori eğitimi. Bu aşamada ABD polisleriyle gerçekleştirilen canlı seminerlere katılacak ve LAC yasalarını öğreneceksiniz.", icon: "fa-school" },
              { title: "Faz 3: Saha Eğitimi (FTO Program)", desc: "Öğrendiklerinizi sahada test etme vakti. Kıdemli bir saha eğitim memuru (FTO) eşliğinde sokaklarda pratik deneyim kazanacak ve gerçekçi senaryolarla sınanacaksınız.", icon: "fa-car-side" },
              { title: "Faz 4: Yemin Töreni ve Görev", desc: "Tüm eğitimleri başarıyla tamamladıktan sonra resmi yemin töreninde rozetinizi takar ve tam yetkili bir LAC memuru olarak Los Santos sokaklarında adaleti sağlamaya başlarsınız.", icon: "fa-shield-halved" },
            ].map((step, idx) => (
              <motion.div key={idx} variants={fadeUp} style={{ position: 'relative', paddingLeft: '3rem', marginBottom: idx !== 3 ? '4rem' : '0' }}>
                <div style={{
                  position: 'absolute', left: '-11px', top: 0, width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: 'var(--bg-dark)', border: '4px solid var(--accent-primary)', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}></div>
                <div className="glass-panel" style={{ padding: '1.5rem 2rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                    <i className={`fa-solid ${step.icon}`} style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}></i>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#fff' }}>{step.title}</h3>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. S.S.S. */}
      <section style={{ position: 'relative', zIndex: 1, padding: '5rem 2rem 8rem', backgroundColor: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Sıkça Sorulan Sorular</motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Eğitimlerin ciddiyeti sizi korkutmasın, buradayız.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <motion.div variants={fadeUp} className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--accent-primary)' }}></i>
                Eğitimler ne kadar zorlayıcı?
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>Amacımız sizi zorlamak değil, en yüksek kalitede roleplay deneyimine hazırlamak. Eğitim sürecimiz aşama aşama tasarlanmıştır. Eğitmenlerimiz ve gerçek polis danışmanlarımız her adımda sizi destekler ve eksiklerinizi kapatmanız için size yardımcı olur.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--accent-primary)' }}></i>
                Gerçek polislerle yapılan canlı eğitimler için ileri seviye İngilizce şart mı?
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>Hayır, kesinlikle şart değil! Topluluğumuzda eş zamanlı (simultane) ve senkronize çeviri desteği sunan, hem polis terminolojisine hem de dilimize çok hakim profesyonel çevirmenlerimiz bulunuyor. Canlı seminerlerimizde tüm eğitimler anlık olarak Türkçeye çevrildiği için herhangi bir detayı kaçırmadan en üst düzey eğitimin bir parçası olabilirsiniz.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

    </div>
  );
}
