import { jwtVerify as joseJwtVerify, type JWTPayload } from "jose";
import { prisma } from "@/lib/prisma";
import { getJwtSecret } from "@/lib/auth-config";

export { getJwtSecret };

export interface CachedOfficer {
  id: number;
  badge: string;
  name: string;
  rank: string;
  department: string;
  role: string;
  status: string;
  isOnDuty: boolean;
  specialRoles: string | null;
  discordRoles: string | null;
  profileImage: string | null;
  createdAt: Date;
}

interface CacheEntry {
  officer: CachedOfficer;
  cachedAt: number;
}

// Node.js process içi bellek önbelleği (Cross-region Supabase gecikmesini ortadan kaldırır)
const globalForCache = globalThis as unknown as { officerSessionCache: Map<number, CacheEntry> | undefined };
const sessionCache = globalForCache.officerSessionCache || new Map<number, CacheEntry>();
globalForCache.officerSessionCache = sessionCache;

const SESSION_CACHE_TTL_MS = 45_000; // 45 saniye TTL

/** Bir memurun yetkisi, rolü veya durumu değiştiğinde önbelleği anında temizler */
export function invalidateOfficerSessionCache(id?: number) {
  if (id !== undefined) {
    sessionCache.delete(id);
  } else {
    sessionCache.clear();
  }
}

async function getOrFetchOfficer(id: number): Promise<CachedOfficer | null> {
  const cached = sessionCache.get(id);
  const now = Date.now();
  if (cached && now - cached.cachedAt < SESSION_CACHE_TTL_MS) {
    return cached.officer;
  }

  const officer = await prisma.officer.findUnique({
    where: { id },
    select: {
      id: true,
      badge: true,
      name: true,
      rank: true,
      department: true,
      role: true,
      status: true,
      isOnDuty: true,
      specialRoles: true,
      discordRoles: true,
      profileImage: true,
      createdAt: true,
    },
  });

  if (officer) {
    sessionCache.set(id, { officer, cachedAt: now });
  } else {
    sessionCache.delete(id);
  }

  return officer;
}

/**
 * jose.jwtVerify yerine kullanılan güvenli ve yüksek performanslı sürüm.
 * - İmza ve süre doğrulanır (jose - CPU 0.1ms).
 * - Memur 45 saniyelik bellek önbelleği üzerinden teyit edilir (veritabanı gidiş-dönüşü 0ms'ye indirilir).
 * - Süresi dolmuş, askıya alınmış veya reddedilmiş hesaplar anında engellenir.
 */
export async function jwtVerify(
  token: string,
  key: Uint8Array
): Promise<{ payload: JWTPayload & { id: number; role: string; badge: string; name: string } }> {
  const { payload } = await joseJwtVerify(token, key, { algorithms: ["HS256"] });

  const id = Number(payload.id);
  if (!Number.isInteger(id)) throw new Error("Geçersiz oturum.");

  const officer = await getOrFetchOfficer(id);

  if (!officer || officer.status !== "APPROVED") {
    throw new Error("Hesap aktif değil veya onaylanmamış.");
  }

  return {
    payload: {
      ...payload,
      id: officer.id,
      role: officer.role,
      badge: officer.badge,
      name: officer.name,
    },
  };
}

export type AuthedOfficer = { id: number; role: string; badge: string; name: string };

/** İstekteki auth_token çerezini doğrular; geçerliyse güncel memur bilgisini, değilse null döner. */
export async function getAuthedOfficer(req: Request): Promise<AuthedOfficer | null> {
  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("auth_token="));
    const token = match?.slice("auth_token=".length);
    if (!token) return null;
    const { payload } = await jwtVerify(token, getJwtSecret());
    return { id: payload.id, role: payload.role, badge: payload.badge, name: payload.name };
  } catch {
    return null;
  }
}

/** İstekteki auth_token çerezini doğrular; geçerliyse profil detaylarıyla birlikte memuru döner. */
export async function getAuthedOfficerWithDetails(req: Request): Promise<CachedOfficer | null> {
  try {
    const cookie = req.headers.get("cookie") || "";
    const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("auth_token="));
    const token = match?.slice("auth_token=".length);
    if (!token) return null;
    const { payload } = await joseJwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] });
    const id = Number(payload.id);
    if (!Number.isInteger(id)) return null;
    const officer = await getOrFetchOfficer(id);
    if (!officer || officer.status !== "APPROVED") return null;
    return officer;
  } catch {
    return null;
  }
}
