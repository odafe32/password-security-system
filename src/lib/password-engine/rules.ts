import type { RuleDefinition } from "./types";

// ─── Character class checks ────────────────────────────────────────

const hasLowercase = (pw: string) => /[a-z]/.test(pw);
const hasUppercase = (pw: string) => /[A-Z]/.test(pw);
const hasNumber = (pw: string) => /[0-9]/.test(pw);
const hasSpecial = (pw: string) => /[^a-zA-Z0-9]/.test(pw);

// ─── Repetition check ──────────────────────────────────────────────
// Detects 3+ of the same character in a row: "aaa", "111", "!!!"

function hasRepetition(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

// ─── Sequence check ────────────────────────────────────────────────
// Detects 3+ consecutive ascending or descending characters: "abc", "cba", "123", "987"

const SEQUENCES = [
  "abcdefghijklmnopqrstuvwxyz",
  "zyxwvutsrqponmlkjihgfedcba",
  "0123456789",
  "9876543210",
];

function hasSequence(password: string): boolean {
  const lower = password.toLowerCase();
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const chunk = seq.slice(i, i + 3);
      if (lower.includes(chunk)) return true;
    }
  }
  return false;
}

// ─── Rule Definitions ──────────────────────────────────────────────
// Each rule has a weight (max points). The engine awards full weight
// if the check passes, 0 if it fails.

export const RULES: RuleDefinition[] = [
  {
    name: "min_length",
    label: "Minimum length (12+)",
    weight: 15,
    check: (pw) => pw.length >= 12,
    passMessage: "Password is at least 12 characters",
    failMessage: "Password is too short (needs 12+ characters)",
    failSuggestion: "Use at least 12 characters — longer passwords are harder to crack",
  },
  {
    name: "length_bonus",
    label: "Length bonus (16+)",
    weight: 10,
    check: (pw) => pw.length >= 16,
    passMessage: "Password is 16+ characters — excellent length",
    failMessage: "Password could be longer (16+ recommended)",
    failSuggestion: "Consider using 16+ characters for even stronger security",
  },
  {
    name: "lowercase",
    label: "Contains lowercase letters",
    weight: 5,
    check: hasLowercase,
    passMessage: "Contains lowercase letters",
    failMessage: "Missing lowercase letters",
    failSuggestion: "Add some lowercase letters (a-z)",
  },
  {
    name: "uppercase",
    label: "Contains uppercase letters",
    weight: 10,
    check: hasUppercase,
    passMessage: "Contains uppercase letters",
    failMessage: "Missing uppercase letters",
    failSuggestion: "Add some uppercase letters (A-Z)",
  },
  {
    name: "numbers",
    label: "Contains numbers",
    weight: 10,
    check: hasNumber,
    passMessage: "Contains numbers",
    failMessage: "Missing numbers",
    failSuggestion: "Add some digits (0-9)",
  },
  {
    name: "special_chars",
    label: "Contains special characters",
    weight: 10,
    check: hasSpecial,
    passMessage: "Contains special characters",
    failMessage: "Missing special characters",
    failSuggestion: "Add special characters like !@#$%^&*",
  },
  {
    name: "no_repetition",
    label: "No repeated characters (3+)",
    weight: 10,
    check: (pw) => !hasRepetition(pw),
    passMessage: "No excessive character repetition",
    failMessage: "Contains 3+ repeated characters in a row",
    failSuggestion: "Avoid repeating the same character 3+ times (e.g. aaa, 111)",
  },
  {
    name: "no_sequence",
    label: "No sequential characters (3+)",
    weight: 10,
    check: (pw) => !hasSequence(pw),
    passMessage: "No sequential character patterns detected",
    failMessage: "Contains sequential characters (e.g. abc, 123)",
    failSuggestion: "Avoid sequences like abc, 123, 987 — they're easy to guess",
  },
];

// ─── Total possible points from rules ──────────────────────────────

export const RULES_MAX_POINTS = RULES.reduce((sum, r) => sum + r.weight, 0);
