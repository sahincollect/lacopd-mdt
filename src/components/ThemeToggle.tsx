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
        border: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
        transition: 'opacity 0.2s, transform 0.2s',
      }}
      title={isDark ? "Aydınlık Temaya Geç" : "Karanlık Temaya Geç"}
      onMouseOver={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.opacity = '0.7';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isDark ? (
        <i className="fa-regular fa-sun" style={{ fontSize: '1.2rem', color: 'inherit' }} />
      ) : (
        <i className="fa-regular fa-moon" style={{ fontSize: '1.2rem', color: 'inherit' }} />
      )}
    </button>
  );
}
