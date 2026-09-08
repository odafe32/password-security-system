import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { invalidateCache, CACHE_KEYS } from "@/lib/cache";

// ─── DELETE /api/admin/dictionary/[id] ─────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const entryId = parseInt(id, 10);

    if (isNaN(entryId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await withRetry(() =>
      prisma.weakPassword.delete({ where: { id: entryId } })
    );

    // Invalidate cache so deleted entries are removed
    invalidateCache(CACHE_KEYS.weakPasswords);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete dictionary entry:", error);
    return NextResponse.json(
      { error: "Failed to delete dictionary entry" },
      { status: 500 }
    );
  }
}
