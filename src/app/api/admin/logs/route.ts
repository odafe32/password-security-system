import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";

// ─── GET /api/admin/logs ───────────────────────────────────────────
// Returns system logs with optional filtering + aggregate statistics.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Build where clause from filters
    const where = status ? { status } : {};

    // Fetch logs
    const logs = await withRetry(() =>
      prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 200),
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true },
          },
        },
      })
    );

    // Aggregate stats
    const total = await prisma.systemLog.count();
    const successCount = await prisma.systemLog.count({ where: { status: "success" } });
    const failedCount = await prisma.systemLog.count({ where: { status: "failed" } });
    const warningCount = await prisma.systemLog.count({ where: { status: "warning" } });

    // Password evaluation stats
    const evaluationCount = await prisma.passwordEvaluation.count();
    const weakCount = await prisma.passwordEvaluation.count({ where: { strengthLevel: "Weak" } });
    const mediumCount = await prisma.passwordEvaluation.count({ where: { strengthLevel: "Medium" } });
    const strongCount = await prisma.passwordEvaluation.count({ where: { strengthLevel: "Strong" } });
    const veryStrongCount = await prisma.passwordEvaluation.count({ where: { strengthLevel: "Very Strong" } });

    // Average score
    const evaluations = await prisma.passwordEvaluation.findMany({
      select: { score: true },
    });
    const avgScore = evaluations.length > 0
      ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
      : 0;

    return NextResponse.json({
      logs,
      stats: {
        totalLogs: total,
        byStatus: {
          success: successCount,
          failed: failedCount,
          warning: warningCount,
        },
        evaluations: {
          total: evaluationCount,
          byLevel: {
            Weak: weakCount,
            Medium: mediumCount,
            Strong: strongCount,
            "Very Strong": veryStrongCount,
          },
          averageScore: avgScore,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
