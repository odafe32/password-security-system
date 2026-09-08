import type { PatternMatch } from "./types";

// ─── Common words frequently found in weak passwords ────────────────

const COMMON_WORDS = [
  "password", "pass", "passwd", "passcode",
  "admin", "administrator", "root", "user",
  "welcome", "login", "signin", "signup",
  "letmein", "monkey", "dragon", "master",
  "qwerty", "abc", "test", "guest",
  "hello", "love", "money", "shadow",
  "superman", "batman", "football", "baseball",
  "princess", "sunshine", "trustno1", "iloveyou",
  "changeme", "secret", "computer", "internet",
  "nigeria", "lagos", "abuja", "admin",
  // Seasonal words — common in passwords like "Summer2024!"
  "summer", "winter", "spring", "autumn", "fall",
  // Common name patterns
  "john", "mary", "david", "james", "michael", "jennifer",
];

// ─── Keyboard walk patterns ────────────────────────────────────────

const KEYBOARD_WALKS = [
  "qwerty", "qwertyuiop", "asdfgh", "asdfghjkl",
  "zxcvbn", "zxcvbnm", "1234", "12345", "123456",
  "qazwsx", "wsxedc", "edcrfv",
];

// ─── Substitution map ──────────────────────────────────────────────
// Detects predictable leet-speak substitutions: P@ssw0rd, p455w0rd, etc.

const SUBSTITUTIONS: Record<string, string> = {
  "@": "a",
  "4": "a",
  "$": "s",
  "5": "s",
  "0": "o",
  "1": "i",
  "3": "e",
  "7": "t",
  "|": "l",
  "!": "i",
};

function normalizeSubstitutions(password: string): string {
  let result = password.toLowerCase();
  for (const [symbol, letter] of Object.entries(SUBSTITUTIONS)) {
    result = result.replaceAll(symbol, letter);
  }
  return result;
}

// ─── Pattern detection functions ───────────────────────────────────

/** Check if the password contains any common words */
function detectCommonWords(password: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lower = password.toLowerCase();

  for (const word of COMMON_WORDS) {
    if (lower.includes(word)) {
      matches.push({
        type: "common_word",
        match: word,
        description: `Contains the common word "${word}"`,
        suggestion: `Avoid using "${word}" — it's one of the most guessed words in passwords`,
      });
    }
  }

  return matches;
}

/** Check if the password is or contains a keyboard walk */
function detectKeyboardWalks(password: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lower = password.toLowerCase();

  for (const walk of KEYBOARD_WALKS) {
    if (walk.length >= 4 && lower.includes(walk)) {
      matches.push({
        type: "keyboard_walk",
        match: walk,
        description: `Contains keyboard pattern "${walk}"`,
        suggestion: "Avoid keyboard patterns like qwerty, asdf, zxcv — they're trivially guessable",
      });
    }
  }

  return matches;
}

/** Check if the password uses predictable leet-speak substitutions */
function detectSubstitutions(password: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const normalized = normalizeSubstitutions(password);
  const lower = password.toLowerCase();

  // Only flag if the normalized version differs (meaning substitutions were used)
  // AND the normalized version contains a common word
  if (normalized === lower) return matches;

  for (const word of COMMON_WORDS) {
    if (normalized.includes(word) && !lower.includes(word)) {
      matches.push({
        type: "substitution",
        match: word,
        description: `Uses predictable character substitutions to spell "${word}"`,
        suggestion: `Avoid substituting characters to spell common words (e.g. P@ssw0rd for password)`,
      });
    }
  }

  return matches;
}

/** Check if the password exists in the weak-password dictionary from the database */
function detectDictionary(
  password: string,
  dictionary: string[]
): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lower = password.toLowerCase();

  for (const entry of dictionary) {
    if (lower === entry.toLowerCase()) {
      matches.push({
        type: "dictionary",
        match: entry,
        description: "This password is in the known weak-password database",
        suggestion: "This password has been found in known data breaches — never use it",
      });
      break;
    }
  }

  return matches;
}

// ─── Main pattern detection entry point ────────────────────────────

export function detectPatterns(
  password: string,
  dictionary: string[] = []
): PatternMatch[] {
  return [
    ...detectCommonWords(password),
    ...detectKeyboardWalks(password),
    ...detectSubstitutions(password),
    ...detectDictionary(password, dictionary),
  ];
}

// ─── Pattern-based rule checks (used by scoring) ───────────────────

export function hasCommonPattern(password: string, dictionary: string[] = []): boolean {
  return detectPatterns(password, dictionary).length > 0;
}

export { COMMON_WORDS, KEYBOARD_WALKS };
