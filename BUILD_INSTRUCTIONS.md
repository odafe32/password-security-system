# Build Instructions — Intelligent Password Security System

Follow these steps in order to scaffold and set up the entire Next.js + PostgreSQL + Prisma project from scratch.

> **Platform note:** These commands work in PowerShell, CMD, or any terminal on Windows. Where you see `cp` (Unix), use `copy` on Windows instead — both versions are shown.

---

## Step 0 — Prerequisites

Make sure these are installed before you begin:

| Tool         | Version  | How to check                  | Download                                     |
|--------------|----------|-------------------------------|----------------------------------------------|
| Node.js      | 18+      | `node --version`              | https://nodejs.org/                          |
| npm          | 9+       | `npm --version`               | (comes with Node)                            |
| PostgreSQL   | 14+      | `psql --version`              | https://www.postgresql.org/download/         |
| Git          | any      | `git --version`               | https://git-scm.com/                         |

> Alternatively, use a **cloud PostgreSQL** instance (Supabase, Neon, Railway) — you'll just need the connection string later.

---

## Step 1 — Scaffold the Next.js App

Open a terminal in your Documents folder and run:

```bash
npx create-next-app@latest password-security-system --typescript --tailwind --app --eslint --src-dir --use-npm --import-alias "@/*"
```

When prompted, accept the defaults. Once it finishes:

```bash
cd password-security-system
```

This gives you a working Next.js 14 App Router project with TypeScript + Tailwind already configured.

---

## Step 2 — Install All Dependencies

Run these commands one after another. They are split into **runtime** (needed in production) and **dev** (build-time only) groups.

### Runtime dependencies

```bash
npm install @prisma/client bcryptjs clsx tailwind-merge zod lucide-react
```

| Package            | Purpose                                                        |
|--------------------|----------------------------------------------------------------|
| `@prisma/client`   | Prisma ORM client — talks to PostgreSQL                        |
| `bcryptjs`         | Hash passwords (admin login + optional eval logging)           |
| `clsx`             | Conditional className helper                                   |
| `tailwind-merge`   | Merge Tailwind classes without conflicts                       |
| `zod`              | Validate API request bodies and env vars                       |
| `lucide-react`     | Icon library (Eye, EyeOff, Shield, Check, X, AlertTriangle…)   |

### Dev dependencies

```bash
npm install -D prisma @types/bcryptjs tsx
```

| Package             | Purpose                                              |
|---------------------|------------------------------------------------------|
| `prisma`            | CLI for migrations, schema, studio                   |
| `@types/bcryptjs`   | TypeScript types for bcryptjs                        |
| `tsx`               | Run TypeScript files directly (used for seed script) |

---

## Step 3 — Set Up Prisma + PostgreSQL

### 3.1 Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

This creates:
- `prisma/schema.prisma` — your schema file
- `.env` — with a `DATABASE_URL` placeholder

### 3.2 Create the database

If running PostgreSQL locally, create a database for the project:

```bash
psql -U postgres -c "CREATE DATABASE password_security;"
```

(Or create it via pgAdmin / your cloud dashboard.)

### 3.3 Configure the connection string

Open the `.env` file (created by Prisma) and set:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/password_security?schema=public"
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password. If using a cloud DB, paste the connection string from your provider's dashboard.

### 3.4 Write the schema

Replace the entire contents of `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  sessionId String   @unique
  createdAt DateTime @default(now())

  evaluations PasswordEvaluation[]
  logs        SystemLog[]
}

model PasswordRule {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  weight      Int      @default(1)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model PasswordEvaluation {
  id            Int      @id @default(autoincrement())
  userId        Int
  passwordHash  String
  strengthLevel String
  score         Int
  createdAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model WeakPassword {
  id        Int      @id @default(autoincrement())
  password  String   @unique
  category  String?
  createdAt DateTime @default(now())
}

model SystemLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  activity  String
  status    String   @default("success")
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([status])
}

model Admin {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  passwordHash String
  role         String   @default("admin")
  createdAt    DateTime @default(now())
}
```

### 3.5 Run the migration

```bash
npx prisma migrate dev --name init
```

This creates the tables in PostgreSQL and generates the Prisma Client.

### 3.6 Generate the client (run after any schema change)

```bash
npx prisma generate
```

---

## Step 4 — Create the Folder Structure

Run these commands to create all the directories the app needs:

```bash
mkdir src\lib\password-engine
mkdir src\components\ui
mkdir src\types
mkdir src\app\admin\rules
mkdir src\app\admin\dictionary
mkdir src\app\admin\logs
mkdir src\app\api\evaluate
mkdir src\app\api\admin\rules
mkdir src\app\api\admin\dictionary
mkdir src\app\api\admin\logs
```

Your final structure should look like this:

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── rules/page.tsx
│   │   ├── dictionary/page.tsx
│   │   └── logs/page.tsx
│   └── api/
│       ├── evaluate/route.ts
│       └── admin/
│           ├── rules/route.ts
│           ├── dictionary/route.ts
│           └── logs/route.ts
├── components/
│   ├── PasswordInput.tsx
│   ├── StrengthMeter.tsx
│   ├── FeedbackPanel.tsx
│   ├── ScoreBreakdown.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   └── password-engine/
│       ├── index.ts
│       ├── rules.ts
│       ├── patterns.ts
│       ├── scoring.ts
│       └── types.ts
└── types/
    └── index.ts
```

---

## Step 5 — Add npm Scripts

Open `package.json` and add these entries inside `"scripts"`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio",
  "prisma:seed": "tsx prisma/seed.ts",
  "db:push": "prisma db push"
}
```

---

## Step 6 — Environment Variables

Create a `.env.example` file (this one is safe to commit — it's a template):

```bash
# Windows
copy NUL .env.example
```

Add this content to `.env.example`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# App config
NEXT_PUBLIC_APP_NAME="Intelligent Password Security System"
```

Your real `.env` (created by `prisma init`) should already have the actual `DATABASE_URL`. Make sure both `.env` and `.env.local` are in `.gitignore` (Next.js adds `.env*` by default, but verify).

---

## Step 7 — Seed the Database (Optional but Recommended)

Create `prisma/seed.ts`:

```bash
copy NUL prisma\seed.ts
```

This script will populate:
- The 11 default `PasswordRule` entries (with weights from the README)
- A starter `WeakPassword` dictionary (~50 common passwords)
- One default `Admin` account

You'll write the seed script content in the next phase (when we build the code files). For now, the file just needs to exist so the `npm run prisma:seed` command doesn't error.

---

## Step 8 — Icons (lucide-react)

Icons are already installed in Step 2 via `lucide-react`. Here are the icons you'll use across the app:

| Icon            | Import                                  | Used in                    |
|-----------------|-----------------------------------------|----------------------------|
| `Eye`           | `import { Eye } from "lucide-react"`    | PasswordInput (show toggle)|
| `EyeOff`        | `import { EyeOff } from "lucide-react"` | PasswordInput (hide toggle)|
| `Shield`        | `import { Shield } from "lucide-react"` | Header / branding          |
| `ShieldCheck`   | `import { ShieldCheck } from "lucide-react"` | Strong password badge |
| `ShieldAlert`   | `import { ShieldAlert } from "lucide-react"` | Weak password badge    |
| `Check`         | `import { Check } from "lucide-react"`  | Passed rule checkmark      |
| `X`             | `import { X } from "lucide-react"`      | Failed rule mark           |
| `AlertTriangle` | `import { AlertTriangle } from "lucide-react"` | Warning feedback     |
| `Lightbulb`     | `import { Lightbulb } from "lucide-react"` | Suggestion bullets      |
| `Lock`          | `import { Lock } from "lucide-react"`   | Input field icon           |
| `Settings`      | `import { Settings } from "lucide-react"` | Admin nav               |
| `BookOpen`      | `import { BookOpen } from "lucide-react"` | Dictionary page         |
| `ScrollText`    | `import { ScrollText } from "lucide-react"` | Logs page              |
| `Plus`          | `import { Plus } from "lucide-react"`   | Add button                 |
| `Trash2`        | `import { Trash2 } from "lucide-react"` | Delete button              |
| `Loader2`       | `import { Loader2 } from "lucide-react"` | Loading spinner         |

Usage example in a component:

```tsx
import { Shield, Eye, EyeOff } from "lucide-react";

export function Header() {
  return (
    <h1 className="flex items-center gap-2">
      <Shield className="w-6 h-6 text-blue-600" />
      Password Security System
    </h1>
  );
}
```

---

## Step 9 — Tailwind Theme (Strength Colors)

Open `tailwind.config.ts` and extend the theme with strength colors:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        strength: {
          weak: "#ef4444",       // red-500
          medium: "#f59e0b",     // amber-500
          strong: "#22c55e",     // green-500
          verystrong: "#16a34a", // green-600
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

You can then use classes like `text-strength-weak`, `bg-strength-strong`, etc.

---

## Step 10 — Verify the Setup

Run these to confirm everything is wired up:

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Open Prisma Studio to view your database
npx prisma studio
```

Then start the dev server:

```bash
npm run dev
```

Open http://localhost:3000 — you should see the default Next.js page. The scaffold is ready.

---

## Step 11 — What to Build Next

Once the scaffold is up, the actual code files need to be created in this order:

| # | File(s)                                          | What it does                          |
|---|--------------------------------------------------|---------------------------------------|
| 1 | `src/lib/prisma.ts`                              | Prisma client singleton               |
| 2 | `src/lib/utils.ts`                               | `cn()` className helper               |
| 3 | `src/lib/password-engine/types.ts`               | Engine types                          |
| 4 | `src/lib/password-engine/rules.ts`               | Individual rule checks                |
| 5 | `src/lib/password-engine/patterns.ts`            | Pattern + dictionary detection        |
| 6 | `src/lib/password-engine/scoring.ts`             | Score aggregation + classification    |
| 7 | `src/lib/password-engine/index.ts`               | Main `evaluatePassword()` function    |
| 8 | `src/app/api/evaluate/route.ts`                  | POST endpoint                         |
| 9 | `src/app/api/admin/*/route.ts`                   | Admin CRUD endpoints                  |
| 10| `src/components/ui/*`                            | Button, Card, Badge primitives        |
| 11| `src/components/PasswordInput.tsx`               | Password input + show/hide            |
| 12| `src/components/StrengthMeter.tsx`               | Visual strength bar                   |
| 13| `src/components/FeedbackPanel.tsx`               | Suggestions + warnings list           |
| 14| `src/components/ScoreBreakdown.tsx`              | Per-rule breakdown                    |
| 15| `src/app/page.tsx`                               | Home — password evaluator UI          |
| 16| `src/app/admin/*/page.tsx`                       | Admin pages                           |
| 17| `prisma/seed.ts`                                 | Seed default rules + weak passwords   |

Ask me to build any of these files when you're ready and I'll write the actual code.

---

## Quick Reference — All Commands in One Block

```bash
# 1. Scaffold
npx create-next-app@latest password-security-system --typescript --tailwind --app --eslint --src-dir --use-npm --import-alias "@/*"
cd password-security-system

# 2. Install deps
npm install @prisma/client bcryptjs clsx tailwind-merge zod lucide-react
npm install -D prisma @types/bcryptjs tsx

# 3. Prisma
npx prisma init --datasource-provider postgresql
# → edit prisma/schema.prisma and .env
npx prisma migrate dev --name init
npx prisma generate

# 4. Folders
mkdir src\lib\password-engine src\components\ui src\types
mkdir src\app\admin\rules src\app\admin\dictionary src\app\admin\logs
mkdir src\app\api\evaluate src\app\api\admin\rules src\app\api\admin\dictionary src\app\api\admin\logs

# 5. Run
npm run dev
```

---

You're now set up and ready to build. When you want the actual code for any file in the structure above, just tell me which one (or say "build it all") and I'll write it.
