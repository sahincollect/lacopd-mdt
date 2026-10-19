import { PrismaClient } from '@prisma/client';

function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    let url = rawUrl.trim();

    // Supabase pooler port 5432 (Session mode - 15 client limiti var) yerine
    // otomatik olarak 6543 (Transaction mode - pgbouncer) kullan.
    // Bu sayede Vercel serverless ortamında FATAL: (EMAXCONNSESSION) hatası kesin olarak önlenir.
    if (url.includes('.pooler.supabase.com:5432')) {
      url = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
    }

    const parsed = new URL(url);
    if (parsed.hostname.includes('pooler.supabase.com')) {
      parsed.port = '6543';
      if (!parsed.searchParams.has('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true');
      }
      if (!parsed.searchParams.has('connection_limit')) {
        parsed.searchParams.set('connection_limit', '1');
      }
      if (!parsed.searchParams.has('pool_timeout')) {
        parsed.searchParams.set('pool_timeout', '20');
      }
      return parsed.toString();
    }

    return url;
  } catch {
    let fallback = rawUrl.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
    if (fallback.includes('pooler.supabase.com') && !fallback.includes('pgbouncer=true')) {
      fallback += (fallback.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1&pool_timeout=20';
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
