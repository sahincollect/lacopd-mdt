import { PrismaClient } from '@prisma/client';

function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    let url = rawUrl.trim();

    // Supabase pooler port 5432 (Session mode) yerine 6543 (Transaction mode - pgbouncer) kullan.
    // Bu sayede Vercel serverless ortamında FATAL: (EMAXCONNSESSION) hatası önlenir.
    if (url.includes('.pooler.supabase.com:5432')) {
      url = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
    }

    const parsed = new URL(url);
    if (parsed.hostname.includes('pooler.supabase.com')) {
      parsed.port = '6543';
      if (!parsed.searchParams.has('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true');
      }
      // Paralel sorguların darboğaza girmemesi için havuz limiti en az 10 olmalıdır.
      parsed.searchParams.set('connection_limit', '10');
      parsed.searchParams.set('pool_timeout', '15');
      parsed.searchParams.set('connect_timeout', '15');
      return parsed.toString();
    }

    return url;
  } catch {
    let fallback = rawUrl.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
    if (fallback.includes('pooler.supabase.com')) {
      fallback += (fallback.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=10&pool_timeout=15&connect_timeout=15';
    }
    return fallback;
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const optimizedUrl = getOptimizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(optimizedUrl ? { datasources: { db: { url: optimizedUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;
