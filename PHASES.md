# Build Plan — Phase by Phase

Each phase builds on the previous one. Complete a phase, test it, then move to the next.

---

## Phase 1 — Foundation
> *Set up the base infrastructure so everything else can connect to the database and share types.*

| # | File | What it does |
|---|------|-------------|
| 1 | `src/lib/prisma.ts` | Prisma client singleton — connects to Neon PostgreSQL |
| 2 | `src/lib/utils.ts` | `cn()` helper for merging Tailwind classes |
| 3 | `src/types/index.ts` | Shared TypeScript types used across the app |

**Test:** Run `npm run typecheck` — should pass with no errors.

---

## Phase 2 — Password Evaluation Engine (the brain)
> *The core intelligence — this is what makes the system "intelligent."*

| # | File | What it does |
|---|------|-------------|
| 4 | `src/lib/password-engine/types.ts` | Types for evaluation results, rule checks, suggestions |
| 5 | `src/lib/password-engine/rules.ts` | Individual checks: length, uppercase, lowercase, numbers, special chars, repetition, sequences |
| 6 | `src/lib/password-engine/patterns.ts` | Detect common words, keyboard walks, predictable substitutions, dictionary lookup |
| 7 | `src/lib/password-engine/scoring.ts` | Combine all checks → 0-100 score + classify as Weak/Medium/Strong/Very Strong |
| 8 | `src/lib/password-engine/index.ts` | Main `evaluatePassword()` function that ties it all together |

**Test:** Write a quick test script that calls `evaluatePassword("password123")` and `evaluatePassword("Kx7#mQ9$vL2p!")` and prints results.

---

## Phase 3 — API Routes (the backend)
> *HTTP endpoints that the frontend calls.*

| # | File | What it does |
|---|------|-------------|
| 9 | `src/app/api/evaluate/route.ts` | POST — receives a password, runs the engine, returns score + feedback |
| 10 | `src/app/api/admin/rules/route.ts` | GET/POST/PUT/DELETE — manage password rules |
| 11 | `src/app/api/admin/dictionary/route.ts` | GET/POST/DELETE — manage weak-password dictionary |
| 12 | `src/app/api/admin/logs/route.ts` | GET — view system logs + statistics |

**Test:** Use `curl` or Postman to POST to `/api/evaluate` with a password and verify the JSON response.

---

## Phase 4 — UI Components (reusable building blocks)
> *Small, reusable pieces that the pages will compose together.*

| # | File | What it does |
|---|------|-------------|
| 13 | `src/components/ui/Button.tsx` | Styled button (variants: primary, danger, ghost) |
| 14 | `src/components/ui/Card.tsx` | Container card with border + shadow |
| 15 | `src/components/ui/Badge.tsx` | Small label badge (for strength levels) |
| 16 | `src/components/PasswordInput.tsx` | Input field with Eye/EyeOff show-hide toggle |
| 17 | `src/components/StrengthMeter.tsx` | Animated colored bar showing score 0-100 |
| 18 | `src/components/FeedbackPanel.tsx` | List of suggestions + warnings with icons |
| 19 | `src/components/ScoreBreakdown.tsx` | Per-rule checklist showing ✓/✗ for each check |

**Test:** Import each into a temp page and verify they render without errors.

---

## Phase 5 — Pages (the actual screens)
> *The pages users and admins will visit.*

| # | File | What it does |
|---|------|-------------|
| 20 | `src/app/layout.tsx` | Update root layout — header with Shield icon, nav links |
| 21 | `src/app/page.tsx` | HOME — password evaluator (input + meter + feedback + breakdown) |
| 22 | `src/app/admin/page.tsx` | Admin dashboard — stats overview cards |
| 23 | `src/app/admin/rules/page.tsx` | Table of rules with edit/delete + add form |
| 24 | `src/app/admin/dictionary/page.tsx` | Table of weak passwords with add/delete |
| 25 | `src/app/admin/logs/page.tsx` | Table of system logs with filtering |

**Test:** Run `npm run dev`, visit http://localhost:3000 — type passwords and see results. Visit /admin — see the admin panel.

---

## Phase 6 — Seed Data
> *Populate the database with default rules and a starter weak-password list.*

| # | File | What it does |
|---|------|-------------|
| 26 | `prisma/seed.ts` | Inserts 11 default rules + ~50 common weak passwords + 1 admin account |

**Test:** Run `npm run prisma:seed`, then open `npx prisma studio` to verify data is there.

---

## Phase 7 — Polish & Testing
> *Final touches to make it production-ready.*

- [ ] Test with weak passwords (`password`, `123456`, `qwerty`) → should score Weak
- [ ] Test with medium passwords (`Summer2024!`) → should score Medium
- [ ] Test with strong passwords (`Kx7#mQ9$vL2p!`) → should score Strong/Very Strong
- [ ] Verify admin can add/edit/delete rules
- [ ] Verify admin can add/delete weak passwords
- [ ] Verify logs are being recorded
- [ ] Run `npm run build` — should pass
- [ ] Run `npm run lint` — no errors
- [ ] Commit + push to GitHub

---

## Progress Tracker

| Phase | Name | Status | Files |
|-------|------|--------|-------|
| 1 | Foundation | ✅ Complete | 3 files |
| 2 | Password Engine + ML | ✅ Complete | 8 files (5 engine + 3 ML) |
| 3 | API Routes | ✅ Complete | 6 files |
| 4 | UI Components | ✅ Complete | 7 files |
| 5 | Pages + Auth | ✅ Complete | 14 files (6 pages + 5 auth routes + 3 auth utils) |
| 6 | Seed Data | ✅ Complete | 1 file (11 rules + 52 weak passwords + admin) |
| 7 | Polish & Testing | ⬜ Not started | — |

**Total: 26 files across 7 phases**

---

## How We'll Work

1. You say **"start Phase 1"** (or "next phase")
2. I write all the files for that phase
3. You test it
4. We commit + move to the next phase

No rushing ahead — each phase is tested before moving on.
