"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Galeri() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/images?type=GALERI')
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          setImages(data.images);
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--lapd-bg)', fontFamily: 'var(--font-inter)', paddingBottom: '5rem' }}>
      
      {/* ── HEADER BREADCRUMB ── */}
      <div style={{ backgroundColor: '#F0F4F4', padding: '1rem 2rem', borderBottom: '1px solid var(--lapd-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontSize: '0.85rem', color: 'var(--lapd-text-muted)' }}>
          <Link href="/" style={{ color: 'var(--lapd-text-dark)', textDecoration: 'none', fontWeight: 600 }}>Ana Sayfa</Link> &nbsp;&gt;&nbsp; 
          <span style={{ color: 'var(--lapd-orange)' }}>Medya Galeresi</span>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '4rem auto 0', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--lapd-blue-dark)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          MEDYA GALERİSİ
        </h1>
        <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--lapd-orange)', marginBottom: '1.5rem' }}></div>
        <p style={{ color: 'var(--lapd-text-dark)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '600px' }}>
          Los Angeles Polis Departman'ının sahadaki operasyonel anları ve departman içi görselleri.
        </p>

        {loading ? (
          <div style={{ color: 'var(--lapd-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fa-solid fa-spinner fa-spin"></i> Fotoğraflar yükleniyor...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {images.map((img, idx) => (
              <div 
                key={img.id} 
                onClick={() => setSelectedImage(img.url)}
               
               
               
                whileHover={{ y: -5 }}
                style={{ 
                  position: 'relative', 
                  backgroundColor: 'white',
                  border: '1px solid var(--lapd-border)',
                  padding: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                  aspectRatio: '16/9',
                  cursor: 'pointer'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={`Gallery Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {images.length === 0 && (
              <div style={{ padding: '3rem', backgroundColor: 'var(--lapd-gray-bg)', border: '1px dashed var(--lapd-border)', textAlign: 'center', color: 'var(--lapd-text-muted)', gridColumn: '1 / -1' }}>
                <i className="fa-regular fa-image" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--lapd-blue)' }}></i>
                <p>Henüz galeriye fotoğraf eklenmemiş.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Pop-up */}
      <>
        {selectedImage && (
          <div
           
           
           
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.95)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'zoom-out'
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                top: '2rem', right: '2rem',
                background: 'var(--lapd-gray-bg)',
                border: '1px solid var(--lapd-border)',
                color: 'var(--lapd-text-dark)',
                width: '50px', height: '50px',
                borderRadius: '50%',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img
             
             
             
             
              src={selectedImage}
              alt="Selected Gallery Image"
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '10px solid white',
                cursor: 'default'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    </div>
  );
}
