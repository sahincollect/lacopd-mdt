import { jwtVerify as joseJwtVerify, type JWTPayload } from "jose";
import { prisma } from "@/lib/prisma";
import { getJwtSecret } from "@/lib/auth-config";

export { getJwtSecret };

/**
 * jose.jwtVerify yerine kullanilan guvenli surum.
 * - Imza ve sure dogrulanir (jose).
 * - Memur her istekte veritabanindan yeniden okunur: silinmis, PENDING veya REJECTED hesaplar reddedilir.
 * - role, badge, name JWT'deki eski degerle degil veritabanindaki GUNCEL degerle doner.
 *   (Rol dusurulen / reddedilen kullanicinin eski token'i artik calismaz.)
 */
export async function jwtVerify(
  token: string,
  key: Uint8Array
): Promise<{ payload: JWTPayload & { id: number; role: string; badge: string; name: string } }> {
  const { payload } = await joseJwtVerify(token, key, { algorithms: ["HS256"] });

  const id = Number(payload.id);
  if (!Number.isInteger(id)) throw new Error("Gecersiz oturum.");

  const officer = await prisma.officer.findUnique({
    where: { id },
    select: { id: true, badge: true, name: true, role: true, status: true },
  });

  if (!officer || officer.status !== "APPROVED") {
    throw new Error("Hesap aktif degil.");
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

/** Istekteki auth_token cerezini dogrular; gecerliyse guncel memur bilgisini, degilse null doner. */
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
