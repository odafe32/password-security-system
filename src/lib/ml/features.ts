/**
 * Feature extraction for ML inference — TypeScript implementation.
 *
 * This MUST produce the same 14 features as ml/features.py (Python).
 * Any mismatch will cause incorrect predictions.
 */

import { COMMON_WORDS, KEYBOARD_WALKS } from "@/lib/password-engine/patterns";

const SEQUENCES = [
  "abcdefghijklmnopqrstuvwxyz",
  "zyxwvutsrqponmlkjihgfedcba",
  "0123456789",
  "9876543210",
];

export const FEATURE_NAMES = [
  "length",
  "num_lowercase",
  "num_uppercase",
  "num_digits",
  "num_special",
  "char_variety",
  "entropy",
  "has_common_word",
  "has_sequence",
  "has_repetition",
  "has_keyboard_walk",
  "consecutive_lower",
  "consecutive_upper",
  "consecutive_digit",
] as const;

function maxConsecutive(password: string, regex: RegExp): number {
  let max = 0;
  let current = 0;
  for (const char of password) {
    if (regex.test(char)) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }
  return max;
}

/**
 * Extract the 14 ML features from a password.
 * Returns a number[] in the same order as FEATURE_NAMES.
 */
export function extractFeatures(password: string): number[] {
  const length = password.length;
  if (length === 0) return new Array(FEATURE_NAMES.length).fill(0);

  // Character counts
  const num_lowercase = (password.match(/[a-z]/g) || []).length;
  const num_uppercase = (password.match(/[A-Z]/g) || []).length;
  const num_digits = (password.match(/[0-9]/g) || []).length;
  const num_special = (password.match(/[^a-zA-Z0-9]/g) || []).length;

  // Character variety
  const uniqueChars = new Set(password).size;
  const char_variety = uniqueChars / length;

  // Entropy estimation
  let pool = 0;
  if (num_lowercase > 0) pool += 26;
  if (num_uppercase > 0) pool += 26;
  if (num_digits > 0) pool += 10;
  if (num_special > 0) pool += 33;
  const entropy = pool > 0 ? length * Math.log2(pool) : 0;

  // Common word detection
  const lower = password.toLowerCase();
  const has_common_word = COMMON_WORDS.some((w) => lower.includes(w)) ? 1 : 0;

  // Sequence detection
  let has_sequence = 0;
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lower.includes(seq.slice(i, i + 3))) {
        has_sequence = 1;
        break;
      }
    }
    if (has_sequence) break;
  }

  // Repetition detection
  const has_repetition = /(.)\1{2,}/.test(password) ? 1 : 0;

  // Keyboard walk detection
  const has_keyboard_walk = KEYBOARD_WALKS.some(
    (w) => w.length >= 4 && lower.includes(w)
  ) ? 1 : 0;

  // Consecutive character types
  const consecutive_lower = maxConsecutive(password, /[a-z]/);
  const consecutive_upper = maxConsecutive(password, /[A-Z]/);
  const consecutive_digit = maxConsecutive(password, /[0-9]/);

  return [
    length,
    num_lowercase,
    num_uppercase,
    num_digits,
    num_special,
    char_variety,
    entropy,
    has_common_word,
    has_sequence,
    has_repetition,
    has_keyboard_walk,
    consecutive_lower,
    consecutive_upper,
    consecutive_digit,
  ];
}
