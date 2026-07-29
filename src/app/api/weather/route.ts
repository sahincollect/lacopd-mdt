import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=34.0522&longitude=-118.2437&current=temperature_2m,wind_speed_10m,weather_code,is_day&wind_speed_unit=kmh&timezone=America%2FLos_Angeles',
      { next: { revalidate: 1800 } } // 30 dakika cache
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'upstream error' }, { status: 502 });
    }

    const data = await res.json();
    const c = data?.current;

    if (!c) {
      return NextResponse.json({ error: 'no current data' }, { status: 502 });
    }

    return NextResponse.json({
      temperature: Math.round(c.temperature_2m),
      windspeed: Math.round(c.wind_speed_10m),
      weathercode: c.weather_code,
      is_day: c.is_day,
    });
  } catch (err) {
    console.error('Weather API error:', err);
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }
}
