import type { RuleResult, Suggestion, StrengthLevel } from "@/types";
import { RULES, RULES_MAX_POINTS } from "./rules";
import type { PatternMatch } from "./types";
import { classifyScore } from "./types";

// ─── Entropy Estimation ────────────────────────────────────────────
// Estimates the bits of entropy in a password based on the character
// pool size and password length. This is a rough estimate — real
// entropy depends on how the password was generated, but this gives
// a useful heuristic.

function getCharacterPoolSize(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33; // common special chars
  return pool;
}

export function estimateEntropy(password: string): number {
  const pool = getCharacterPoolSize(password);
  if (pool === 0 || password.length === 0) return 0;
  return Math.round(password.length * Math.log2(pool));
}

// ─── Score Calculation ─────────────────────────────────────────────
// Combines rule-based points + pattern penalties + entropy bonus
// into a final 0–100 score.

const PATTERN_PENALTY = 25; // points deducted per pattern found
const PATTERN_PENALTY_MAX = 50; // max total penalty from patterns
const ENTROPY_THRESHOLD = 80; // bits needed for full entropy bonus
const ENTROPY_BONUS_MAX = 15; // max bonus points from entropy

export function calculateScore(
  ruleResults: RuleResult[],
  patterns: PatternMatch[],
  entropy: number
): number {
  // 1. Sum points from rules (proportionally scaled to 0–80)
  const rulePoints = ruleResults.reduce((sum, r) => sum + r.points, 0);
  const ruleScore = (rulePoints / RULES_MAX_POINTS) * 80;

  // 2. Pattern penalty
  const penalty = Math.min(
    patterns.length * PATTERN_PENALTY,
    PATTERN_PENALTY_MAX
  );

  // 3. Entropy bonus (0–20 points)
  const entropyBonus = Math.min(
    (entropy / ENTROPY_THRESHOLD) * ENTROPY_BONUS_MAX,
    ENTROPY_BONUS_MAX
  );

  // 4. Final score, clamped to 0–100
  const raw = ruleScore - penalty + entropyBonus;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

// ─── Build suggestions from failed rules + patterns ────────────────

export function buildSuggestions(
  ruleResults: RuleResult[],
  patterns: PatternMatch[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Warnings from detected patterns (highest priority)
  for (const p of patterns) {
    suggestions.push({ type: "warning", text: p.suggestion });
  }

  // Tips from failed rules
  for (const r of ruleResults) {
    if (!r.passed && r.message) {
      suggestions.push({ type: "tip", text: r.message });
    }
  }

  // General tip if no suggestions at all (very strong password)
  if (suggestions.length === 0) {
    suggestions.push({
      type: "tip",
      text: "Excellent! This is a strong password. Keep it unique and don't reuse it across sites.",
    });
  }

  return suggestions;
}

// ─── Classification ────────────────────────────────────────────────

export function classify(score: number): StrengthLevel {
  return classifyScore(score);
}

// ─── Run all rules and produce RuleResult[] ────────────────────────

export function runRules(password: string): RuleResult[] {
  return RULES.map((rule) => {
    const passed = rule.check(password);
    return {
      rule: rule.name,
      label: rule.label,
      passed,
      points: passed ? rule.weight : 0,
      maxPoints: rule.weight,
      message: passed ? rule.passMessage : rule.failMessage,
    };
  });
}
