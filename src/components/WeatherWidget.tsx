"use client";

import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Open-Meteo API — current (yeni format)
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=34.0522&longitude=-118.2437&current=temperature_2m,wind_speed_10m,weather_code,is_day&wind_speed_unit=kmh&timezone=America%2FLos_Angeles'
    )
      .then(res => {
        if (!res.ok) throw new Error('HTTP error');
        return res.json();
      })
      .then(data => {
        const c = data?.current;
        if (!c) throw new Error('No current data');
        setWeather({
          temperature: Math.round(c.temperature_2m),
          windspeed: Math.round(c.wind_speed_10m),
          weathercode: c.weather_code,
          is_day: c.is_day,
        });
      })
      .catch(() => setError(true));
  }, []);

  // WMO Weather code → icon + description
  const getWeatherInfo = (code: number, isDay: number) => {
    if (code === 0) return { icon: isDay ? 'fa-sun' : 'fa-moon', label: 'Açık' };
    if (code <= 2) return { icon: 'fa-cloud-sun', label: 'Az Bulutlu' };
    if (code === 3) return { icon: 'fa-cloud', label: 'Bulutlu' };
    if (code <= 48) return { icon: 'fa-smog', label: 'Sisli' };
    if (code <= 57) return { icon: 'fa-cloud-drizzle', label: 'Çisenti' };
    if (code <= 67) return { icon: 'fa-cloud-rain', label: 'Yağmurlu' };
    if (code <= 77) return { icon: 'fa-snowflake', label: 'Karlı' };
    if (code <= 82) return { icon: 'fa-cloud-showers-heavy', label: 'Sağanak' };
    if (code <= 99) return { icon: 'fa-bolt', label: 'Fırtınalı' };
    return { icon: 'fa-cloud', label: 'Bilinmiyor' };
  };

  if (error) {
    return (
      <div style={{
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#DC2626',
        fontSize: '0.82rem',
        fontWeight: 600,
      }}>
        <i className="fa-solid fa-triangle-exclamation"></i>
        Hava durumu bilgisi alınamadı.
      </div>
    );
  }

  if (!weather) {
    return (
      <div style={{
        backgroundColor: '#F3F4F6',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ color: '#9CA3AF', fontSize: '1.1rem' }}></i>
        <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>Hava durumu yükleniyor...</span>
      </div>
    );
  }

  const { icon, label } = getWeatherInfo(weather.weathercode, weather.is_day);

  return (
    <div style={{
      backgroundColor: '#041632',
      borderRadius: '8px',
      padding: '18px 20px',
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
          <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
            Los Angeles, CA
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label} — Rüzgar: {weather.windspeed} km/h
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>
          {weather.temperature}°C
        </div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
          {weather.is_day ? 'Gündüz' : 'Gece'}
        </div>
      </div>
    </div>
  );
}
