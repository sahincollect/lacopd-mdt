"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      
      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: '-80px' // Pull up behind the transparent navbar
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("/gallery/lapdtoren3.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: 0
        }} />
        
        {/* Elegant Gradient Overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at center, rgba(0,29,61,0.4) 0%, rgba(0,8,20,0.85) 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '40vh',
          background: 'linear-gradient(to top, var(--bg-dark) 0%, transparent 100%)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 2rem', maxWidth: '1000px' }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <motion.img 
              variants={fadeInUp}
              src="/lapd-logo.png" 
              alt="LAPD Logo" 
              style={{ width: '180px', height: '180px', marginBottom: '2rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} 
            />

            <motion.div variants={fadeInUp} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ height: '2px', width: '60px', backgroundColor: 'var(--accent-primary)' }} />
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.4em', fontSize: '0.9rem' }}>EST. 1781</span>
              <div style={{ height: '2px', width: '60px', backgroundColor: 'var(--accent-primary)' }} />
            </motion.div>

            <motion.h1 variants={fadeInUp} style={{ 
              fontFamily: 'var(--font-oswald)', 
              fontSize: 'clamp(3rem, 8vw, 6rem)', 
              lineHeight: 1.1, 
              fontWeight: 700,
              textShadow: '0 10px 30px rgba(0,0,0,0.8)',
              marginBottom: '1rem',
              letterSpacing: '0.02em'
            }}>
              LOS ANGELES <br />
              <span style={{ color: 'var(--text-primary)', opacity: 0.9 }}>POLICE DEPARTMENT</span>
            </motion.h1>

            <motion.p variants={fadeInUp} style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1.25rem', 
              maxWidth: '700px', 
              margin: '0 auto 3rem',
              lineHeight: 1.8,
              fontWeight: 400
            }}>
              Los Angeles topluluğuna adanmış, dürüstlük, cesaret ve profesyonellik ilkeleriyle şehre hizmet eden asil bir güç. <strong>To Protect and To Serve.</strong>
            </motion.p>

            <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/giris" style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--bg-dark)',
                padding: '1.2rem 3rem',
                borderRadius: '4px',
                fontWeight: 800,
                fontSize: '1rem',
                letterSpacing: '0.1em',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 25px rgba(204, 160, 0, 0.3)',
                textTransform: 'uppercase'
              }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <i className="fa-solid fa-shield-halved"></i>
                MDT SİSTEMİNE GİRİŞ
              </Link>
              
              <Link href="https://discord.gg/thelapd" target="_blank" style={{
                backgroundColor: 'rgba(0, 29, 61, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                padding: '1.2rem 3rem',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '0.1em',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'rgba(0, 29, 61, 0.8)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.backgroundColor = 'rgba(0, 29, 61, 0.5)'; }}
              >
                <i className="fa-brands fa-discord"></i>
                DİSCORD'A KATIL
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ── CORE VALUES SECTION ── */}
      <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--bg-dark)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            style={{ textAlign: 'center', marginBottom: '5rem' }}
          >
            <motion.h2 variants={fadeInUp} style={{ fontFamily: 'var(--font-oswald)', fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              TEMEL <span style={{ color: 'var(--accent-primary)' }}>DEĞERLERİMİZ</span>
            </motion.h2>
            <motion.p variants={fadeInUp} style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              Los Angeles topluluğuna hizmet ederken her bir memurumuzun kalbinde taşıdığı sarsılmaz ilkeler.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            
            {[
              { icon: 'fa-scale-balanced', title: 'DÜRÜSTLÜK & ADALET', desc: 'Her koşulda yasaları tarafsızca uygular, rozetimizin onurunu koruyarak şeffaf ve hesap verebilir bir hizmet sunarız.' },
              { icon: 'fa-user-shield', title: 'PROFESYONELLİK', desc: 'Görevimizi en yüksek standartlarda, sürekli eğitim ve gelişimle destekleyerek, saygı ve disiplin çerçevesinde ifa ederiz.' },
              { icon: 'fa-hand-holding-heart', title: 'TOPLUMA BAĞLILIK', desc: 'Hizmet ettiğimiz halkla omuz omuza çalışır, güven inşa eder ve şehrimizin yaşam kalitesini artırmak için çabalarız.' }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} style={{ 
                backgroundColor: 'var(--bg-panel)', 
                padding: '3rem 2rem', 
                borderRadius: '12px',
                borderTop: '3px solid var(--accent-primary)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  width: '70px', height: '70px', 
                  backgroundColor: 'rgba(204, 160, 0, 0.1)', 
                  color: 'var(--accent-primary)', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '2rem', margin: '0 auto 1.5rem' 
                }}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h3 style={{ fontFamily: 'var(--font-oswald)', fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{item.desc}</p>
              </motion.div>
            ))}

          </motion.div>
        </div>
      </section>

      {/* ── DIVISIONS PREVIEW ── */}
      <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--bg-panel)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,53,102,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <motion.div variants={fadeInUp} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ width: '40px', height: '2px', backgroundColor: 'var(--accent-primary)' }} />
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.2em', fontSize: '0.85rem' }}>OPERASYONEL BİRİMLER</span>
              </motion.div>
              <motion.h2 variants={fadeInUp} style={{ fontFamily: 'var(--font-oswald)', fontSize: '3.5rem', lineHeight: 1.1 }}>
                ŞEHRİN GÜVENLİĞİ İÇİN<br />
                <span style={{ color: 'var(--text-secondary)' }}>KOORDİNELİ GÜÇ</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeInUp} style={{ marginTop: '2rem' }}>
              <Link href="/hakkimizda" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1rem', borderBottom: '1px solid var(--accent-primary)', paddingBottom: '4px', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-primary)'}
              >
                TÜM BİRİMLERİ İNCELE <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { id: '01', title: 'PATROL DIVISION', desc: 'Sokakların ilk savunma hattı ve günlük asayişin temeli.' },
              { id: '02', title: 'DETECTIVE BUREAU', desc: 'Büyük suçların araştırılması ve çözümlenmesi.' },
              { id: '03', title: 'S.W.A.T.', desc: 'Yüksek riskli operasyonlar ve taktiksel müdahale.' },
              { id: '04', title: 'TRAFFIC DIVISION', desc: 'Otoyol güvenliği ve trafik operasyonları.' },
            ].map((unit, i) => (
              <motion.div key={i} variants={fadeInUp} style={{
                position: 'relative',
                backgroundColor: 'var(--bg-dark)',
                padding: '2.5rem 2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                (e.currentTarget.querySelector('.unit-bg') as HTMLElement).style.opacity = '1';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'translateY(0)';
                (e.currentTarget.querySelector('.unit-bg') as HTMLElement).style.opacity = '0';
              }}
              >
                <div className="unit-bg" style={{
                  position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%',
                  background: 'linear-gradient(45deg, transparent 50%, rgba(204, 160, 0, 0.05) 100%)',
                  opacity: 0, transition: 'opacity 0.3s', pointerEvents: 'none'
                }} />
                
                <div style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-oswald)', fontSize: '2.5rem', opacity: 0.3, marginBottom: '1rem', lineHeight: 1 }}>
                  {unit.id}
                </div>
                <h3 style={{ fontFamily: 'var(--font-oswald)', fontSize: '1.4rem', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{unit.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{unit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
