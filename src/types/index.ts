// ─── Strength Levels ───────────────────────────────────────────────

export type StrengthLevel = "Weak" | "Medium" | "Strong" | "Very Strong";

export const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  Weak: "#ef4444",
  Medium: "#f59e0b",
  Strong: "#22c55e",
  "Very Strong": "#16a34a",
};

export const STRENGTH_CLASSES: Record<StrengthLevel, string> = {
  Weak: "text-strength-weak bg-strength-weak",
  Medium: "text-strength-medium bg-strength-medium",
  Strong: "text-strength-strong bg-strength-strong",
  "Very Strong": "text-strength-verystrong bg-strength-verystrong",
};

// ─── Evaluation Result ─────────────────────────────────────────────

export interface RuleResult {
  /** Machine name of the rule, e.g. "min_length" */
  rule: string;
  /** Human-readable label, e.g. "Minimum length (12+)" */
  label: string;
  /** Did the password pass this check? */
  passed: boolean;
  /** Points awarded for this rule (0 if failed) */
  points: number;
  /** Maximum possible points for this rule */
  maxPoints: number;
  /** Short message explaining the result */
  message: string;
}

export interface Suggestion {
  /** Severity: warning = problem found, tip = general advice */
  type: "warning" | "tip";
  /** The suggestion text shown to the user */
  text: string;
}

export interface EvaluationResult {
  /** Numerical score 0–100 */
  score: number;
  /** Qualitative strength level */
  level: StrengthLevel;
  /** Per-rule breakdown */
  checks: RuleResult[];
  /** Actionable suggestions for improvement */
  suggestions: Suggestion[];
  /** Estimated bits of entropy */
  entropy: number;
}

// ─── API Types ─────────────────────────────────────────────────────

export interface EvaluateRequest {
  password: string;
}

export interface EvaluateResponse extends EvaluationResult {
  /** Whether the evaluation was logged to the database */
  logged: boolean;
}

// ─── Admin Types ───────────────────────────────────────────────────

export interface RuleFormData {
  name: string;
  description?: string;
  weight: number;
  active: boolean;
}

export interface DictionaryFormData {
  password: string;
  category?: string;
}

export interface LogStats {
  total: number;
  byStatus: Record<string, number>;
  recent: Array<{
    id: number;
    activity: string;
    status: string;
    createdAt: string;
  }>;
}
