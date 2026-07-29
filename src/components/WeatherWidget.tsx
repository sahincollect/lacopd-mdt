"use client";

import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
}

const getWeatherInfo = (code: number, isDay: number) => {
  if (code === 0) return { icon: isDay ? 'fa-sun' : 'fa-moon', label: 'Açık', color: isDay ? '#F59E0B' : '#6B7280' };
  if (code <= 2)  return { icon: 'fa-cloud-sun', label: 'Az Bulutlu', color: '#60A5FA' };
  if (code === 3) return { icon: 'fa-cloud', label: 'Bulutlu', color: '#9CA3AF' };
  if (code <= 48) return { icon: 'fa-smog', label: 'Sisli', color: '#9CA3AF' };
  if (code <= 57) return { icon: 'fa-cloud-rain', label: 'Çisenti', color: '#3B82F6' };
  if (code <= 67) return { icon: 'fa-cloud-rain', label: 'Yağmurlu', color: '#2563EB' };
  if (code <= 77) return { icon: 'fa-snowflake', label: 'Karlı', color: '#60A5FA' };
  if (code <= 82) return { icon: 'fa-cloud-showers-heavy', label: 'Sağanak', color: '#1D4ED8' };
  if (code <= 99) return { icon: 'fa-bolt', label: 'Fırtınalı', color: '#7C3AED' };
  return { icon: 'fa-cloud', label: 'Değişken', color: '#9CA3AF' };
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => {
        if (!res.ok) throw new Error('Proxy error');
        return res.json();
      })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setWeather(data);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div style={{
        backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
        borderRadius: '4px', padding: '14px 16px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px',
        color: '#DC2626', fontSize: '0.8rem', fontWeight: 600,
      }}>
        <i className="fa-solid fa-triangle-exclamation"></i> Hava durumu bilgisi şu an alınamıyor.
      </div>
    );
  }

  if (!weather) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB',
        borderRadius: '4px', padding: '18px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ color: '#9CA3AF' }}></i>
        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>Yükleniyor...</span>
      </div>
    );
  }

  const { icon, label, color } = getWeatherInfo(weather.weathercode, weather.is_day);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderTop: '3px solid #CC0000', // CNN/News style red top border
      padding: '16px 20px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: '2.4rem', color: color }}></i>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#CC0000', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>
            Los Angeles, CA
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', lineHeight: 1.2 }}>
            {label}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
            Rüzgar: {weather.windspeed} km/h
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {weather.temperature}°
        </div>
      </div>
    </div>
  );
}
