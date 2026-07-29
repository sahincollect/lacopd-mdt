import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Add profileImage column safely
    await prisma.$executeRawUnsafe(`
      ALTER TABLE Officer 
      ADD COLUMN profileImage TEXT NULL;
    `);

    return NextResponse.json({ success: true, message: "Officer table updated successfully." });
  } catch (error: any) {
    // Return 200 even on error if it's "Duplicate column name"
    if (error.message?.includes("Duplicate column name")) {
      return NextResponse.json({ success: true, message: "Column profileImage already exists." });
    }
    
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message || "Failed to update table" }, { status: 500 });
  }
}
