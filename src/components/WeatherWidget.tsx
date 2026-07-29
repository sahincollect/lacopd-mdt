"use client";

import { useEffect, useState } from 'react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    // Latitude and Longitude for Los Angeles, CA
    fetch('https://api.open-meteo.com/v1/forecast?latitude=34.0522&longitude=-118.2437&current_weather=true')
      .then(res => res.json())
      .then(data => {
        setWeather(data.current_weather);
      })
      .catch(console.error);
  }, []);

  if (!weather) {
    return (
      <div style={{ backgroundColor: '#f6f6f6', border: '1px solid #e2e2e2', padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#CC0000' }}></i>
      </div>
    );
  }

  // WMO Weather interpretation codes to icons
  const code = weather.weathercode;
  let icon = 'fa-sun';
  if (code >= 1 && code <= 3) icon = 'fa-cloud-sun';
  if (code >= 45 && code <= 48) icon = 'fa-smog';
  if (code >= 51 && code <= 67) icon = 'fa-cloud-rain';
  if (code >= 71 && code <= 77) icon = 'fa-snowflake';
  if (code >= 95 && code <= 99) icon = 'fa-bolt';

  return (
    <div style={{ backgroundColor: '#111', color: 'white', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '4px solid #CC0000' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: '2.5rem', color: '#CC0000' }}></i>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: 800 }}>Los Angeles, CA</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Weather</p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{weather.temperature}°C</div>
        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '5px' }}>Wind: {weather.windspeed} km/h</div>
      </div>
    </div>
  );
}
