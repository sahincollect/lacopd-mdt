"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Galeri() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/images?type=GALERI')
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          // Reverse the array to show newest first, assuming higher ID or later addition
          setImages(data.images.reverse());
        } else {
          setImages([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Right click prevention
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', fontFamily: 'var(--font-inter)', paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem 2rem', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--accent-primary)' }}>Medya Galerisi</span>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '4rem auto 0', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            MEDYA GALERİSİ
          </h1>
          <div style={{ width: '80px', height: '4px', backgroundColor: 'var(--accent-primary)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', margin: '0 auto', maxWidth: '700px', lineHeight: '1.6' }}>
            Los Angeles Polis Departmanı'nın sahadaki operasyonel anları, etkinlikleri ve departman içi özel görselleri.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--accent-primary)' }}>
            <i className="fa-solid fa-spinner fa-spin fa-3x"></i>
          </div>
        ) : (
          <div style={{ 
            columnCount: 3, 
            columnGap: '1.5rem',
            // Simple responsive approach using inline styles
          }}>
            {/* Inject a quick style tag for column responsiveness since inline style media queries aren't possible */}
            <style dangerouslySetInnerHTML={{__html: `
              @media (max-width: 1024px) { div[style*="columnCount: 3"] { column-count: 2 !important; } }
              @media (max-width: 640px) { div[style*="columnCount: 3"] { column-count: 1 !important; } }
            `}} />
            
            {images.map((img, idx) => (
              <motion.div 
                key={img.id} 
                onClick={() => setSelectedImage(img.url)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
                whileHover={{ y: -8, scale: 1.02 }}
                style={{ 
                  breakInside: 'avoid',
                  marginBottom: '1.5rem',
                  position: 'relative', 
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  cursor: 'zoom-in',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img.url} 
                    alt={`Gallery Image ${idx + 1}`} 
                    onContextMenu={handleContextMenu}
                    style={{ 
                      width: '100%', 
                      display: 'block', 
                      objectFit: 'cover',
                      transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }} 
                  />
                  {/* Hover Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(4px)',
                      padding: '1rem',
                      borderRadius: '50%',
                      color: 'white',
                      transform: 'scale(0.8)',
                      transition: 'transform 0.3s ease'
                    }}>
                      <i className="fa-solid fa-expand fa-lg"></i>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {images.length === 0 && (
              <div style={{ padding: '4rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '2px dashed var(--border-light)', textAlign: 'center', color: 'var(--text-muted)', columnSpan: 'all' }}>
                <i className="fa-regular fa-image" style={{ fontSize: '3rem', marginBottom: '1.5rem', color: 'var(--accent-secondary)' }}></i>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Galeri Boş</h3>
                <p>Henüz galeriye fotoğraf eklenmemiş.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Pop-up */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'zoom-out'
            }}
          >
            <motion.button
              onClick={() => setSelectedImage(null)}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                top: '2rem', right: '2rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                width: '50px', height: '50px',
                borderRadius: '50%',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000,
                backdropFilter: 'blur(4px)',
                transition: 'background-color 0.2s'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Selected Gallery Image"
              onContextMenu={handleContextMenu}
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                borderRadius: '8px',
                cursor: 'default'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
