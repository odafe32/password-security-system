import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

// ─── GET /api/admin/evaluations — all evaluations from all users ───

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where = level ? { strengthLevel: level } : {};

    const evaluations = await prisma.passwordEvaluation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 500),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.passwordEvaluation.count();
    const byLevel = {
      Weak: await prisma.passwordEvaluation.count({ where: { strengthLevel: "Weak" } }),
      Medium: await prisma.passwordEvaluation.count({ where: { strengthLevel: "Medium" } }),
      Strong: await prisma.passwordEvaluation.count({ where: { strengthLevel: "Strong" } }),
      "Very Strong": await prisma.passwordEvaluation.count({ where: { strengthLevel: "Very Strong" } }),
    };

    return NextResponse.json({ evaluations, stats: { total, byLevel } });
  } catch (error) {
    console.error("Failed to fetch evaluations:", error);
    return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 });
  }
}
