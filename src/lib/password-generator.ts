/**
 * Strong password generator
 * Generates random passwords with a mix of character classes.
 * Avoids ambiguous characters (l, I, O, 0, 1) for readability.
 */

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I, O
const LOWERCASE = "abcdefghijkmnpqrstuvwxyz"; // no l, o
const NUMBERS = "23456789"; // no 0, 1
const SPECIALS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS + SPECIALS;

// Use crypto.getRandomValues for cryptographically secure randomness
function secureRandom(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function pickRandom(str: string): string {
  return str[secureRandom(str.length)];
}

function shuffle(str: string): string {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

/**
 * Generate a strong random password.
 * @param length - Password length (default 16, min 12)
 * @returns A strong password with at least one of each character class
 */
export function generateStrongPassword(length: number = 16): string {
  const len = Math.max(12, length);

  // Guarantee at least one of each character class
  const parts: string[] = [
    pickRandom(UPPERCASE),
    pickRandom(LOWERCASE),
    pickRandom(NUMBERS),
    pickRandom(SPECIALS),
    pickRandom(UPPERCASE),
    pickRandom(LOWERCASE),
    pickRandom(NUMBERS),
    pickRandom(SPECIALS),
  ];

  // Fill the rest with random characters from all classes
  for (let i = parts.length; i < len; i++) {
    parts.push(pickRandom(ALL_CHARS));
  }

  // Shuffle so the guaranteed characters aren't always at the start
  return shuffle(parts.join(""));
}

/**
 * Generate multiple password suggestions.
 * @param count - Number of passwords to generate
 * @param length - Length of each password
 * @returns Array of strong passwords
 */
export function generatePasswordSuggestions(count: number = 3, length: number = 16): string[] {
  return Array.from({ length: count }, () => generateStrongPassword(length));
}
