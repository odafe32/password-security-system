import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const evaluations = await prisma.passwordEvaluation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        strengthLevel: true,
        score: true,
        entropy: true,
        mlClass: true,
        mlConfidence: true,
        mlScore: true,
        ruleScore: true,
        createdAt: true,
      },
    });

    // Get summary stats
    const total = await prisma.passwordEvaluation.count({ where: { userId: user.id } });
    const avgScore = total > 0
      ? Math.round(
          (await prisma.passwordEvaluation.aggregate({
            where: { userId: user.id },
            _avg: { score: true },
          }))._avg.score ?? 0
        )
      : 0;

    const byLevel = {
      Weak: await prisma.passwordEvaluation.count({ where: { userId: user.id, strengthLevel: "Weak" } }),
      Medium: await prisma.passwordEvaluation.count({ where: { userId: user.id, strengthLevel: "Medium" } }),
      Strong: await prisma.passwordEvaluation.count({ where: { userId: user.id, strengthLevel: "Strong" } }),
      "Very Strong": await prisma.passwordEvaluation.count({ where: { userId: user.id, strengthLevel: "Very Strong" } }),
    };

    return NextResponse.json({
      evaluations,
      stats: { total, avgScore, byLevel },
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
