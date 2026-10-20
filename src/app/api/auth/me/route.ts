export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthedOfficerWithDetails } from '@/lib/session-verify';

export async function GET(req: NextRequest) {
  try {
    const officer = await getAuthedOfficerWithDetails(req);

    if (!officer) {
      return NextResponse.json({ message: "Oturum açılmamış veya hesap onaylanmamış." }, { status: 401 });
    }

    return NextResponse.json({ user: officer }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Geçersiz oturum." }, { status: 401 });
  }
}
