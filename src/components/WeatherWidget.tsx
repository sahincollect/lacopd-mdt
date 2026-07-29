"use client";

import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
}

const getWeatherInfo = (code: number, isDay: number) => {
  if (code === 0) return { icon: isDay ? 'fa-sun' : 'fa-moon', label: 'Açık' };
  if (code <= 2)  return { icon: 'fa-cloud-sun', label: 'Az Bulutlu' };
  if (code === 3) return { icon: 'fa-cloud', label: 'Bulutlu' };
  if (code <= 48) return { icon: 'fa-smog', label: 'Sisli' };
  if (code <= 57) return { icon: 'fa-cloud-rain', label: 'Çisenti' };
  if (code <= 67) return { icon: 'fa-cloud-rain', label: 'Yağmurlu' };
  if (code <= 77) return { icon: 'fa-snowflake', label: 'Karlı' };
  if (code <= 82) return { icon: 'fa-cloud-showers-heavy', label: 'Sağanak' };
  if (code <= 99) return { icon: 'fa-bolt', label: 'Fırtınalı' };
  return { icon: 'fa-cloud', label: 'Değişken' };
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Kendi proxy route'umuzu kullan → CORS ve network kısıtlamalarını aşar
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
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#DC2626',
        fontSize: '0.8rem',
        fontWeight: 600,
      }}>
        <i className="fa-solid fa-triangle-exclamation"></i>
        Hava durumu bilgisi şu an alınamıyor.
      </div>
    );
  }

  if (!weather) {
    return (
      <div style={{
        backgroundColor: '#F3F4F6',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ color: '#9CA3AF' }}></i>
        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>Hava durumu yükleniyor...</span>
      </div>
    );
  }

  const { icon, label } = getWeatherInfo(weather.weathercode, weather.is_day);

  return (
    <div style={{
      backgroundColor: '#041632',
      borderRadius: '8px',
      padding: '16px 20px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeft: '4px solid #E84F2A',
      color: 'white',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: '2rem', color: '#E84F2A' }}></i>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Los Angeles, CA</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label} · Rüzgar: {weather.windspeed} km/h
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{weather.temperature}°C</div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
          {weather.is_day ? '☀ Gündüz' : '🌙 Gece'}
        </div>
      </div>
    </div>
  );
}
