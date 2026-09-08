import type { RuleResult, Suggestion, StrengthLevel } from "@/types";

// ─── Rule Definition ───────────────────────────────────────────────

export interface RuleDefinition {
  /** Machine name, e.g. "min_length" */
  name: string;
  /** Human-readable label */
  label: string;
  /** Weight / max points for this rule */
  weight: number;
  /** The check function — returns true if password passes */
  check: (password: string) => boolean;
  /** Message when the rule passes */
  passMessage: string;
  /** Message when the rule fails */
  failMessage: string;
  /** Suggestion to show when this rule fails */
  failSuggestion?: string;
}

// ─── Pattern Detection Result ──────────────────────────────────────

export interface PatternMatch {
  /** What type of pattern was detected */
  type: "common_word" | "sequence" | "keyboard_walk" | "substitution" | "dictionary";
  /** The matched substring or word */
  match: string;
  /** Human-readable description */
  description: string;
  /** Suggestion for fixing it */
  suggestion: string;
}

// ─── Scoring helpers ───────────────────────────────────────────────

export const SCORE_THRESHOLDS = {
  weak: 40,
  medium: 70,
  strong: 90,
} as const;

export function classifyScore(score: number): StrengthLevel {
  if (score < SCORE_THRESHOLDS.weak) return "Weak";
  if (score < SCORE_THRESHOLDS.medium) return "Medium";
  if (score < SCORE_THRESHOLDS.strong) return "Strong";
  return "Very Strong";
}

// ─── Re-export shared types for convenience ─────────────────────────

export type { RuleResult, Suggestion, StrengthLevel };
