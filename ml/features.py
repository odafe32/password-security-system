"""
Feature extraction for the Intelligent Password Security System.

This module defines the features extracted from each password.
The same features are implemented in TypeScript (src/lib/ml/features.ts)
for inference in the Next.js application.

Features (14 total):
  1.  length            - Password length
  2.  num_lowercase     - Count of lowercase letters
  3.  num_uppercase     - Count of uppercase letters
  4.  num_digits        - Count of digits
  5.  num_special       - Count of special characters
  6.  char_variety      - Unique characters / length
  7.  entropy           - Estimated bits of entropy
  8.  has_common_word   - 1 if contains a common word, 0 otherwise
  9.  has_sequence      - 1 if contains abc/123/cba pattern, 0 otherwise
 10.  has_repetition    - 1 if has 3+ repeated chars, 0 otherwise
 11.  has_keyboard_walk - 1 if contains keyboard pattern, 0 otherwise
 12.  consecutive_lower - Max consecutive lowercase letters
 13.  consecutive_upper - Max consecutive uppercase letters
 14. consecutive_digit  - Max consecutive digits
"""

import re
import math

# ─── Common words list (must match patterns.ts) ────────────────────

COMMON_WORDS = [
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
    "summer", "winter", "spring", "autumn", "fall",
    "john", "mary", "david", "james", "michael", "jennifer",
]

KEYBOARD_WALKS = [
    "qwerty", "qwertyuiop", "asdfgh", "asdfghjkl",
    "zxcvbn", "zxcvbnm", "1234", "12345", "123456",
    "qazwsx", "wsxedc", "edcrfv",
]

SEQUENCES = [
    "abcdefghijklmnopqrstuvwxyz",
    "zyxwvutsrqponmlkjihgfedcba",
    "0123456789",
    "9876543210",
]

# ─── Feature names (order matters — must match TypeScript) ──────────

FEATURE_NAMES = [
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
]


def extract_features(password: str) -> list:
    """Extract the 14 features from a password. Returns a list of floats."""

    length = len(password)
    if length == 0:
        return [0.0] * len(FEATURE_NAMES)

    # Character counts
    num_lowercase = len(re.findall(r'[a-z]', password))
    num_uppercase = len(re.findall(r'[A-Z]', password))
    num_digits = len(re.findall(r'[0-9]', password))
    num_special = len(re.findall(r'[^a-zA-Z0-9]', password))

    # Character variety
    unique_chars = len(set(password))
    char_variety = unique_chars / length

    # Entropy estimation
    pool = 0
    if num_lowercase > 0: pool += 26
    if num_uppercase > 0: pool += 26
    if num_digits > 0: pool += 10
    if num_special > 0: pool += 33
    entropy = length * math.log2(pool) if pool > 0 else 0.0

    # Common word detection
    lower = password.lower()
    has_common_word = 1.0 if any(word in lower for word in COMMON_WORDS) else 0.0

    # Sequence detection
    has_sequence = 0.0
    for seq in SEQUENCES:
        for i in range(len(seq) - 2):
            if seq[i:i+3] in lower:
                has_sequence = 1.0
                break
        if has_sequence:
            break

    # Repetition detection
    has_repetition = 1.0 if re.search(r'(.)\1{2,}', password) else 0.0

    # Keyboard walk detection
    has_keyboard_walk = 0.0
    for walk in KEYBOARD_WALKS:
        if len(walk) >= 4 and walk in lower:
            has_keyboard_walk = 1.0
            break

    # Consecutive character type counts
    consecutive_lower = _max_consecutive(password, r'[a-z]')
    consecutive_upper = _max_consecutive(password, r'[A-Z]')
    consecutive_digit = _max_consecutive(password, r'[0-9]')

    return [
        float(length),
        float(num_lowercase),
        float(num_uppercase),
        float(num_digits),
        float(num_special),
        float(char_variety),
        float(entropy),
        has_common_word,
        has_sequence,
        has_repetition,
        has_keyboard_walk,
        float(consecutive_lower),
        float(consecutive_upper),
        float(consecutive_digit),
    ]


def _max_consecutive(password: str, pattern: str) -> int:
    """Find the maximum number of consecutive characters matching the pattern."""
    max_count = 0
    current = 0
    for char in password:
        if re.match(pattern, char):
            current += 1
            max_count = max(max_count, current)
        else:
            current = 0
    return max_count
