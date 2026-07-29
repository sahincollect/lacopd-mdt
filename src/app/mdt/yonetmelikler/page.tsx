"use client";

import { useEffect, useRef, useState } from "react";

export default function Yonetmelikler() {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch the raw HTML from the public folder
    fetch('/handbook/index.html')
      .then(res => res.text())
      .then(html => {
        // Extract just the inner app-container content to avoid duplicate html/body tags
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // We only want the app-container content
        const appContainer = doc.querySelector('.app-container');
        if (appContainer) {
          setHtmlContent(appContainer.innerHTML);
        } else {
          setHtmlContent(html);
        }
      })
      .catch(err => console.error("Failed to load handbook:", err));
  }, []);

  useEffect(() => {
    // Inject the handbook's CSS and JS after HTML is loaded
    if (htmlContent) {
      // 1. Inject CSS
      const link = document.createElement("link");
      link.href = "/handbook/style.css";
      link.rel = "stylesheet";
      link.id = "handbook-styles";
      
      // Override some handbook CSS variables to match MDT theme dynamically
      const overrideStyle = document.createElement("style");
      overrideStyle.id = "handbook-overrides";
      overrideStyle.innerHTML = `
        /* Force handbook to inherit MDT theme variables instead of hardcoded ones */
        .handbook-wrapper {
          --bg-main: var(--bg-primary);
          --bg-sidebar: var(--bg-tertiary);
          --bg-card: var(--bg-secondary);
          --bg-glass: var(--bg-secondary);
          --text-main: var(--text-primary);
          --text-muted: var(--text-secondary);
          --border-color: var(--border-light);
          --border-glow: var(--border-light);
          --accent: var(--lapd-blue-dark);
          --accent-hover: var(--lapd-orange);
        }
        
        /* Make handbook container fill MDT area properly */
        .handbook-wrapper .sidebar {
           position: relative !important;
           height: auto !important;
           min-height: 800px;
           border-right: 1px solid var(--border-light);
           background: var(--bg-tertiary) !important;
        }
        
        .handbook-wrapper .main-content {
           background: var(--bg-primary) !important;
        }

        .handbook-wrapper .glass-card {
           background: var(--bg-secondary) !important;
           border: 1px solid var(--border-light) !important;
           box-shadow: none !important;
        }
        
        .handbook-wrapper h1, .handbook-wrapper h2, .handbook-wrapper h3 {
           color: var(--lapd-blue-dark) !important;
           font-family: var(--font-inter) !important;
           font-weight: 900 !important;
        }
        
        .handbook-wrapper .chapter-title {
           color: var(--lapd-orange) !important;
        }
      `;
      
      document.head.appendChild(link);
      document.head.appendChild(overrideStyle);

      // 2. Inject JS logic
      const script = document.createElement("script");
      script.src = "/handbook/app.js";
      script.id = "handbook-script";
      document.body.appendChild(script);

      return () => {
        // Cleanup on unmount
        if (document.getElementById("handbook-styles")) document.getElementById("handbook-styles")?.remove();
        if (document.getElementById("handbook-overrides")) document.getElementById("handbook-overrides")?.remove();
        if (document.getElementById("handbook-script")) document.getElementById("handbook-script")?.remove();
      };
    }
  }, [htmlContent]);

  return (
    <div style={{ fontFamily: "var(--font-inter)", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* Header */}
      <div style={{ borderBottom: "2px solid var(--border-light)", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'var(--lapd-blue-dark)', letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
          DEPARTMAN YÖNETMELİKLERİ
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem', fontWeight: 600 }}>
          Los Angeles Polis Departmanı resmi kural ve yönetmeliklerine buradan ulaşabilirsiniz.
        </p>
      </div>

      <div 
        style={{ 
          background: "var(--bg-primary)",
          borderRadius: '8px',
          border: "1px solid var(--border-light)",
          overflow: "hidden",
          minHeight: "800px",
        }}
        className="handbook-wrapper"
      >
        {!htmlContent ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "500px", color: "var(--text-muted)", flexDirection: "column", gap: "1rem" }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem" }}></i>
            <span style={{ fontWeight: 700 }}>YÖNETMELİK YÜKLENİYOR...</span>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
            style={{ display: "flex", width: "100%", height: "100%" }}
          />
        )}
      </div>
    </div>
  );
}
