/**
 * Seed script — populates the database with:
 *   1. 11 default password evaluation rules (with weights)
 *   2. ~50 common weak passwords
 *   3. 1 admin account (credentials shown below)
 *
 * Run with: npm run prisma:seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Admin credentials (shown intentionally for demo/testing) ──────

const ADMIN_EMAIL = "admin@password-security.local";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "System Administrator";

// ─── Default password rules ────────────────────────────────────────

const DEFAULT_RULES = [
  { name: "min_length", description: "Password must be at least 12 characters", weight: 15, active: true },
  { name: "length_bonus", description: "Extra points for 16+ characters", weight: 10, active: true },
  { name: "lowercase", description: "Contains lowercase letters (a-z)", weight: 5, active: true },
  { name: "uppercase", description: "Contains uppercase letters (A-Z)", weight: 10, active: true },
  { name: "numbers", description: "Contains digits (0-9)", weight: 10, active: true },
  { name: "special_chars", description: "Contains special characters (!@#$%^&*)", weight: 10, active: true },
  { name: "no_common_pattern", description: "No common words, keyboard patterns, or substitutions", weight: 20, active: true },
  { name: "no_dictionary", description: "Not found in the weak-password database", weight: 20, active: true },
  { name: "no_repetition", description: "No 3+ repeated characters in a row", weight: 10, active: true },
  { name: "no_sequence", description: "No 3+ sequential characters (abc, 123)", weight: 10, active: true },
  { name: "entropy", description: "Estimated entropy >= 60 bits", weight: 20, active: true },
];

// ─── Common weak passwords ─────────────────────────────────────────

const WEAK_PASSWORDS = [
  { password: "password", category: "common" },
  { password: "123456", category: "common" },
  { password: "123456789", category: "common" },
  { password: "12345678", category: "common" },
  { password: "12345", category: "common" },
  { password: "1234567", category: "common" },
  { password: "password1", category: "common" },
  { password: "qwerty", category: "pattern" },
  { password: "abc123", category: "pattern" },
  { password: "monkey", category: "common" },
  { password: "master", category: "common" },
  { password: "dragon", category: "common" },
  { password: "letmein", category: "common" },
  { password: "admin", category: "common" },
  { password: "welcome", category: "common" },
  { password: "login", category: "common" },
  { password: "princess", category: "common" },
  { password: "football", category: "common" },
  { password: "shadow", category: "common" },
  { password: "sunshine", category: "common" },
  { password: "trustno1", category: "common" },
  { password: "iloveyou", category: "common" },
  { password: "batman", category: "common" },
  { password: "access", category: "common" },
  { password: "hello", category: "common" },
  { password: "charlie", category: "common" },
  { password: "111111", category: "pattern" },
  { password: "1234567890", category: "common" },
  { password: "password123", category: "common" },
  { password: "admin123", category: "common" },
  { password: "root", category: "common" },
  { password: "test", category: "common" },
  { password: "guest", category: "common" },
  { password: "changeme", category: "common" },
  { password: "secret", category: "common" },
  { password: "computer", category: "common" },
  { password: "superman", category: "common" },
  { password: "michael", category: "common" },
  { password: "jennifer", category: "common" },
  { password: "qwerty123", category: "pattern" },
  { password: "1q2w3e4r", category: "pattern" },
  { password: "zxcvbnm", category: "pattern" },
  { password: "asdfgh", category: "pattern" },
  { password: "p@ssw0rd", category: "pattern" },
  { password: "passw0rd", category: "pattern" },
  { password: "summer2024", category: "pattern" },
  { password: "winter2024", category: "pattern" },
  { password: "password!", category: "common" },
  { password: "welcome1", category: "common" },
  { password: "hello123", category: "common" },
  { password: "000000", category: "pattern" },
  { password: "abc123456", category: "pattern" },
];

// ─── Seed function ─────────────────────────────────────────────────

async function main() {
  console.log("Seeding database...\n");

  // 1. Seed password rules
  console.log("[1/3] Seeding password rules...");
  for (const rule of DEFAULT_RULES) {
    await prisma.passwordRule.upsert({
      where: { name: rule.name },
      update: {},
      create: rule,
    });
  }
  console.log(`      ${DEFAULT_RULES.length} rules seeded`);

  // 2. Seed weak passwords
  console.log("[2/3] Seeding weak password dictionary...");
  for (const entry of WEAK_PASSWORDS) {
    await prisma.weakPassword.upsert({
      where: { password: entry.password },
      update: {},
      create: entry,
    });
  }
  console.log(`      ${WEAK_PASSWORDS.length} weak passwords seeded`);

  // 3. Seed admin account
  console.log("[3/3] Seeding admin account...");
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const sessionId = `sess_admin_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      sessionId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: "admin",
    },
  });

  console.log(`      Admin account created:`);
  console.log(`      Email:    ${ADMIN_EMAIL}`);
  console.log(`      Password: ${ADMIN_PASSWORD}`);
  console.log(`      Role:     admin`);

  console.log("\nDone! Database seeded successfully.");
  console.log("\n--- Admin Login Credentials ---");
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log("------------------------------");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
