import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withRetry } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { invalidateCache, CACHE_KEYS } from "@/lib/cache";

// ─── Validation ────────────────────────────────────────────────────

const DictionarySchema = z.object({
  password: z.string().min(1, "Password is required").max(255),
  category: z.string().max(100).optional(),
});

// ─── GET /api/admin/dictionary ─────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where = category ? { category } : {};

    const entries = await withRetry(() =>
      prisma.weakPassword.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 500),
      })
    );

    const total = await withRetry(() => prisma.weakPassword.count());

    return NextResponse.json({ entries, total });
  } catch (error) {
    console.error("Failed to fetch dictionary:", error);
    return NextResponse.json(
      { error: "Failed to fetch dictionary" },
      { status: 500 }
    );
  }
}

// ─── POST /api/admin/dictionary ────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = DictionarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const entry = await withRetry(() =>
      prisma.weakPassword.upsert({
        where: { password: parsed.data.password.toLowerCase() },
        update: { category: parsed.data.category },
        create: {
          password: parsed.data.password.toLowerCase(),
          category: parsed.data.category,
        },
      })
    );

    // Invalidate cache so new entries are picked up
    invalidateCache(CACHE_KEYS.weakPasswords);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to add dictionary entry:", error);
    return NextResponse.json(
      { error: "Failed to add dictionary entry" },
      { status: 500 }
    );
  }
}
