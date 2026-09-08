import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

// ─── GET /api/admin/users — list all users ─────────────────────────

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 500),
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        suspended: true,
        createdAt: true,
        _count: {
          select: {
            evaluations: true,
            logs: true,
          },
        },
      },
    });

    const total = await prisma.user.count();
    const activeCount = await prisma.user.count({ where: { suspended: false } });
    const suspendedCount = await prisma.user.count({ where: { suspended: true } });
    const adminCount = await prisma.user.count({ where: { role: "admin" } });

    return NextResponse.json({
      users,
      stats: { total, active: activeCount, suspended: suspendedCount, admins: adminCount },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
