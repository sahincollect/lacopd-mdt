"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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
        }
        
        /* Make handbook container fill MDT area properly */
        .handbook-wrapper .sidebar {
           position: relative !important;
           height: auto !important;
           min-height: 800px;
           border-right: 1px solid var(--border-light);
        }
        
        .handbook-wrapper .main-content {
           background: transparent !important;
        }

        .handbook-wrapper .glass-card {
           background: var(--bg-secondary) !important;
           border-color: var(--border-light) !important;
           box-shadow: 0 4px 6px rgba(0,0,0,0.02) !important;
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
    <div style={{ padding: "1.5rem", maxWidth: "1600px", margin: "0 auto", width: "100%", minHeight: "85vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <i className="fa-solid fa-book-bookmark" style={{ color: "var(--accent-primary)" }}></i> Yönetmelikler
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Los Angeles Polis Departmanı resmi kural ve yönetmeliklerine buradan ulaşabilirsiniz.
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: "var(--bg-primary)",
          borderRadius: '8px',
          border: "1px solid var(--border-light)",
          overflow: "hidden",
          minHeight: "800px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.02)"
        }}
        className="handbook-wrapper"
      >
        {!htmlContent ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "500px", color: "var(--text-muted)" }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
            <span style={{ marginLeft: "1rem" }}>Yönetmelik yükleniyor...</span>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
            style={{ display: "flex", width: "100%", height: "100%" }}
          />
        )}
      </motion.div>
    </div>
  );
}
