import type { EvaluationResult, StrengthLevel } from "@/types";
import { detectPatterns } from "./patterns";
import { runRules, calculateScore, buildSuggestions, estimateEntropy, classify } from "./scoring";
import { predictStrength, mlClassToLevel, getModelInfo, type MLPrediction } from "@/lib/ml/model";

// ─── Pattern-based rule checks (added to the rule results) ─────────
// These two "rules" are evaluated using pattern detection and are
// scored separately from the static rules in rules.ts.

const PATTERN_RULE_WEIGHT = 20;
const DICTIONARY_RULE_WEIGHT = 20;

import type { RuleResult } from "@/types";

function buildPatternRuleResults(
  password: string,
  dictionary: string[]
): { results: RuleResult[]; patterns: ReturnType<typeof detectPatterns> } {
  const patterns = detectPatterns(password, dictionary);

  const hasCommonWordOrPattern = patterns.some(
    (p) => p.type === "common_word" || p.type === "keyboard_walk" || p.type === "substitution"
  );
  const isInDictionary = patterns.some((p) => p.type === "dictionary");

  const results: RuleResult[] = [
    {
      rule: "no_common_pattern",
      label: "No common patterns or words",
      passed: !hasCommonWordOrPattern,
      points: hasCommonWordOrPattern ? 0 : PATTERN_RULE_WEIGHT,
      maxPoints: PATTERN_RULE_WEIGHT,
      message: hasCommonWordOrPattern
        ? "Contains common words, keyboard patterns, or predictable substitutions"
        : "No common patterns detected",
    },
    {
      rule: "no_dictionary",
      label: "Not in weak-password database",
      passed: !isInDictionary,
      points: isInDictionary ? 0 : DICTIONARY_RULE_WEIGHT,
      maxPoints: DICTIONARY_RULE_WEIGHT,
      message: isInDictionary
        ? "Found in the known weak-password database"
        : "Not found in weak-password database",
    },
  ];

  return { results, patterns };
}

// ─── Hybrid scoring weights ────────────────────────────────────────
// The final score is a weighted combination of:
//   - Rule-based score (0–100)
//   - ML prediction (0–100, mapped from class probabilities)
//
// RULE_WEIGHT + ML_WEIGHT must equal 1.0

const RULE_WEIGHT = 0.6;
const ML_WEIGHT = 0.4;

/** Map ML class probabilities to a 0–100 score */
function mlProbabilitiesToScore(probabilities: number[]): number {
  // Classes: [Weak, Medium, Strong] → weights [0, 50, 100]
  const classWeights = [0, 50, 100];
  let score = 0;
  for (let i = 0; i < probabilities.length; i++) {
    score += probabilities[i] * classWeights[i];
  }
  return Math.round(score);
}

// ─── Extended evaluation result with ML data ───────────────────────

export interface HybridEvaluationResult extends EvaluationResult {
  /** ML neural network prediction */
  ml: {
    /** Predicted class name */
    className: string;
    /** Confidence (0–1) */
    confidence: number;
    /** Probability distribution [Weak, Medium, Strong] */
    probabilities: number[];
    /** ML-derived score (0–100) */
    score: number;
  };
  /** How the final score was derived */
  scoring: {
    ruleScore: number;
    mlScore: number;
    ruleWeight: number;
    mlWeight: number;
    method: string;
  };
}

// ─── Main entry point ──────────────────────────────────────────────

/**
 * Evaluate a password using a hybrid approach:
 *   1. Rule-based checks (length, character classes, patterns, dictionary)
 *   2. Neural network prediction (MLP classifier trained in Python)
 *   3. Combine both into a final score and strength level
 *
 * @param password - The password to evaluate
 * @param dictionary - Optional array of known weak passwords from the database
 * @returns Full hybrid evaluation result
 */
export function evaluatePassword(
  password: string,
  dictionary: string[] = []
): HybridEvaluationResult {
  // ── 1. Rule-based evaluation ──────────────────────────────────

  const ruleResults = runRules(password);
  const { results: patternResults, patterns } = buildPatternRuleResults(
    password,
    dictionary
  );
  const allChecks = [...ruleResults, ...patternResults];
  const entropy = estimateEntropy(password);
  const ruleScore = calculateScore(ruleResults, patterns, entropy);

  // ── 2. ML neural network prediction ───────────────────────────

  const mlPrediction: MLPrediction = predictStrength(password);
  const mlScore = mlProbabilitiesToScore(mlPrediction.probabilities);

  // ── 3. Hybrid score (weighted combination) ────────────────────

  const hybridScore = Math.round(ruleScore * RULE_WEIGHT + mlScore * ML_WEIGHT);
  const finalScore = Math.max(0, Math.min(100, hybridScore));

  // ── 4. Classification ─────────────────────────────────────────
  // Use the rule-based classification as primary, but if ML strongly
  // disagrees (high confidence), defer to ML for the level.

  const ruleLevel = classify(finalScore);
  const mlLevel = mlClassToLevel(mlPrediction.className);

  // If ML confidence is very high (>0.9) and disagrees with rules,
  // use the more conservative (weaker) of the two
  let level: StrengthLevel = ruleLevel;
  if (mlPrediction.confidence > 0.9 && mlLevel !== ruleLevel) {
    const order: StrengthLevel[] = ["Weak", "Medium", "Strong", "Very Strong"];
    const mlIdx = order.indexOf(mlLevel);
    const ruleIdx = order.indexOf(ruleLevel);
    level = mlIdx < ruleIdx ? mlLevel : ruleLevel; // pick the weaker one
  }

  // ── 5. Suggestions ────────────────────────────────────────────

  const suggestions = buildSuggestions(allChecks, patterns);

  // Add ML-specific note if confidence is high
  if (mlPrediction.confidence > 0.8 && mlLevel === "Weak") {
    suggestions.unshift({
      type: "warning",
      text: `AI model classifies this password as "${mlPrediction.className}" with ${(mlPrediction.confidence * 100).toFixed(0)}% confidence`,
    });
  }

  // ── 6. Return result ──────────────────────────────────────────

  return {
    score: finalScore,
    level,
    checks: allChecks,
    suggestions,
    entropy,
    ml: {
      className: mlPrediction.className,
      confidence: mlPrediction.confidence,
      probabilities: mlPrediction.probabilities,
      score: mlScore,
    },
    scoring: {
      ruleScore,
      mlScore,
      ruleWeight: RULE_WEIGHT,
      mlWeight: ML_WEIGHT,
      method: "Hybrid (60% rule-based + 40% neural network)",
    },
  };
}

// ─── Re-exports for convenience ────────────────────────────────────

export { estimateEntropy, classify } from "./scoring";
export { detectPatterns } from "./patterns";
export { RULES } from "./rules";
export { predictStrength, getModelInfo } from "@/lib/ml/model";
