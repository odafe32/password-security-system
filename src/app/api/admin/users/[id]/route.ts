import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/auth";

// ─── Validation ────────────────────────────────────────────────────

const UpdateUserSchema = z.object({
  name: z.string().max(100).optional(),
  role: z.enum(["user", "admin"]).optional(),
  suspended: z.boolean().optional(),
});

// ─── PUT /api/admin/users/[id] — update user ───────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Prevent admin from demoting/suspending themselves
    if (currentUser?.id === userId) {
      if (parsed.data.role === "user" || parsed.data.suspended === true) {
        return NextResponse.json(
          { error: "You cannot demote or suspend your own account" },
          { status: 400 }
        );
      }
    }

    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined)
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, role: true, suspended: true },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: currentUser!.id,
        activity: `Admin updated user #${userId}: ${JSON.stringify(data)}`,
        status: "success",
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// ─── DELETE /api/admin/users/[id] — delete user ────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (currentUser?.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        userId: currentUser!.id,
        activity: `Admin deleted user #${userId}`,
        status: "warning",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
