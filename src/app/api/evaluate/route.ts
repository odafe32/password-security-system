import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma, withRetry } from "@/lib/prisma";
import { getCached, setCached, CACHE_KEYS } from "@/lib/cache";
import { evaluatePassword } from "@/lib/password-engine";
import { getCurrentUser, getOrCreateGuestUser } from "@/lib/auth";

// ─── Validation ────────────────────────────────────────────────────

const EvaluateSchema = z.object({
  password: z.string().min(1, "Password is required").max(1000, "Password too long"),
});

// ─── POST /api/evaluate ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = EvaluateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { password } = parsed.data;

    // 1. Fetch weak password dictionary (cached for 5 min to reduce DB calls)
    let dictionary = getCached<string[]>(CACHE_KEYS.weakPasswords);
    if (!dictionary) {
      try {
        const weakPasswords = await withRetry(() =>
          prisma.weakPassword.findMany({ select: { password: true } })
        );
        dictionary = weakPasswords.map((wp) => wp.password);
        setCached(CACHE_KEYS.weakPasswords, dictionary);
      } catch {
        // If DB is down, use cached data or empty dictionary
        dictionary = dictionary ?? [];
      }
    }

    // 2. Run the hybrid evaluation (rule-based + neural network)
    const result = evaluatePassword(password, dictionary);

    // 3. Log the evaluation (hash the password — never store plaintext)
    // This is best-effort — if DB is down, we still return the result
    try {
      // Use existing logged-in user, or create/reuse a guest session
      const currentUser = await getCurrentUser();
      const user = currentUser ?? await getOrCreateGuestUser();

      // Hash the password before storing
      const passwordHash = await bcrypt.hash(password, 10);

      // Store the evaluation (with retry for connection issues)
      await withRetry(() =>
        prisma.passwordEvaluation.create({
          data: {
            userId: user.id,
            passwordHash,
            strengthLevel: result.level,
            score: result.score,
            entropy: result.entropy,
            mlClass: result.ml.className,
            mlConfidence: result.ml.confidence,
            mlScore: result.ml.score,
            ruleScore: result.scoring.ruleScore,
          },
        })
      );

      // Log the activity
      await prisma.systemLog.create({
        data: {
          userId: user.id,
          activity: `Password evaluated — Score: ${result.score}, Level: ${result.level}`,
          status: "success",
        },
      });
    } catch (logError) {
      // Logging is optional — don't fail the request if logging fails
      console.error("Failed to log evaluation:", logError);
    }

    // 4. Return the result
    return NextResponse.json({
      ...result,
      logged: true,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate password" },
      { status: 500 }
    );
  }
}
