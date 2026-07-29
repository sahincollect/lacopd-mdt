"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--text-muted)' }}></i>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      style={{
        backgroundColor: 'transparent',
        border: '1px solid var(--border-strong)',
        color: 'var(--text-primary)',
        borderRadius: '12px',
        cursor: 'pointer',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      title={isDark ? "Aydınlık Temaya Geç" : "Karanlık Temaya Geç"}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--text-muted)';
        e.currentTarget.style.color = isDark ? '#FFF' : '#000';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
    >
      <div style={{
        position: 'relative',
        width: '16px',
        height: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {isDark ? (
          <i className="fa-regular fa-sun" style={{ fontSize: '1rem', color: 'inherit' }} />
        ) : (
          <i className="fa-regular fa-moon" style={{ fontSize: '1rem', color: 'inherit' }} />
        )}
      </div>
    </button>
  );
}
