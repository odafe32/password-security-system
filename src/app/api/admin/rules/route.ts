import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, withRetry } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

// ─── Validation ────────────────────────────────────────────────────

const RuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  weight: z.number().int().min(0).max(100).default(1),
  active: z.boolean().default(true),
});

// ─── GET /api/admin/rules ──────────────────────────────────────────

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const rules = await withRetry(() =>
      prisma.passwordRule.findMany({ orderBy: { weight: "desc" } })
    );
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Failed to fetch rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

// ─── POST /api/admin/rules ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = RuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rule = await withRetry(() =>
      prisma.passwordRule.create({ data: parsed.data })
    );

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Failed to create rule:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}
