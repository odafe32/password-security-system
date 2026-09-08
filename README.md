# Intelligent Password Security System

An AI-powered password strength evaluation system that combines **rule-based analysis** with a **neural network classifier** to provide real-time, intelligent password security feedback.

Built by **Godfrey Joseph Sule** — [godfreyj.sule1@gmail.com](mailto:godfreyj.sule1@gmail.com)

---

## Features

- **Hybrid Evaluation Engine** — Combines rule-based scoring (60% weight) with a neural network prediction (40% weight)
- **Real-time Feedback** — Passwords are evaluated as you type, with instant visual feedback
- **Pattern Detection** — Detects common words, keyboard walks, predictable substitutions (leet-speak), and seasonal patterns
- **Weak Password Dictionary** — Checks passwords against a database of 50+ known weak passwords
- **Entropy Estimation** — Calculates password entropy in bits
- **Neural Network Prediction** — A trained MLP classifier (14 inputs → 32 ReLU → 16 ReLU → 3 softmax) provides an independent AI assessment
- **Actionable Suggestions** — Clear warnings and tips for improving password strength
- **User Accounts** — Register/login to save your evaluation history, or use as a guest
- **Admin Panel** — Manage password rules, weak-password dictionary, and view system logs
- **Secure Logging** — Passwords are hashed with bcrypt before storage — never stored in plaintext

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js App Router API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 5.22 |
| ML Training | Python, scikit-learn, NumPy |
| ML Inference | TypeScript (runs in-browser, no Python needed) |
| Auth | Custom cookie-based sessions with bcrypt |
| Icons | lucide-react |

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 24)
- npm 10+
- A PostgreSQL database (Neon, Supabase, or local)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/odafe32/password-security-system.git
cd password-security-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```
DATABASE_URL="postgresql://your-connection-string-here"
```

4. **Set up the database**

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## Admin Access

The database is seeded with a default admin account:

```
Email:    admin@password-security.local
Password: admin123
```

Use these credentials to log in at `/login` and access the admin panel at `/admin`.

---

## Pages

| Route | Description |
|-------|------------|
| `/` | Password evaluator — real-time strength analysis |
| `/login` | Login page |
| `/register` | Create a new account |
| `/history` | View your past evaluations (login required) |
| `/admin` | Admin dashboard with statistics |
| `/admin/rules` | Manage password evaluation rules |
| `/admin/dictionary` | Manage weak-password dictionary |
| `/admin/logs` | View system activity logs |

---

## How the Hybrid Engine Works

```
User types password
       |
       +---> Rule-based engine (score 0-100, 60% weight)
       |     - Length checks
       |     - Character class checks (lowercase, uppercase, digits, special)
       |     - Repetition and sequence detection
       |     - Common pattern detection (keyboard walks, leet-speak)
       |     - Weak-password dictionary lookup
       |     - Entropy estimation
       |
       +---> Neural network (score 0-100, 40% weight)
       |     - 14 extracted features
       |     - MLP: 14 -> 32 (ReLU) -> 16 (ReLU) -> 3 (Softmax)
       |     - Classes: Weak, Medium, Strong
       |
       v
  Hybrid score = (ruleScore x 0.6) + (mlScore x 0.4)
       |
       v
  Final score, strength level, checks, and suggestions
```

---

## ML Model Training

The neural network was trained in Python using scikit-learn:

```bash
cd ml
pip install -r requirements.txt
python train_model.py
```

This trains the model and exports it to `src/lib/ml/model.json`, which is loaded at runtime by the TypeScript inference engine — no Python runtime needed in production.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/evaluate` | Evaluate a password |
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/history` | Get evaluation history |
| GET | `/api/admin/rules` | List all rules |
| POST | `/api/admin/rules` | Create a rule |
| PUT | `/api/admin/rules/:id` | Update a rule |
| DELETE | `/api/admin/rules/:id` | Delete a rule |
| GET | `/api/admin/dictionary` | List weak passwords |
| POST | `/api/admin/dictionary` | Add a weak password |
| DELETE | `/api/admin/dictionary/:id` | Remove a weak password |
| GET | `/api/admin/logs` | Get system logs and stats |

---

## Project Structure

```
src/
+-- app/
|   +-- page.tsx              # Home - password evaluator
|   +-- layout.tsx            # Root layout with header/nav
|   +-- login/page.tsx        # Login page
|   +-- register/page.tsx     # Registration page
|   +-- history/page.tsx      # Evaluation history
|   +-- admin/
|   |   +-- page.tsx          # Admin dashboard
|   |   +-- rules/page.tsx    # Manage rules
|   |   +-- dictionary/page.tsx # Manage weak passwords
|   |   +-- logs/page.tsx     # View logs
|   +-- api/
|       +-- evaluate/route.ts
|       +-- auth/{register,login,logout,me}/route.ts
|       +-- history/route.ts
|       +-- admin/{rules,dictionary,logs}/route.ts
+-- components/
|   +-- PasswordInput.tsx
|   +-- StrengthMeter.tsx
|   +-- FeedbackPanel.tsx
|   +-- ScoreBreakdown.tsx
|   +-- LogoutButton.tsx
|   +-- ui/{Button,Card,Badge}.tsx
+-- lib/
|   +-- prisma.ts             # Prisma client singleton
|   +-- auth.ts               # Auth utilities
|   +-- utils.ts              # General utilities
|   +-- password-engine/      # Rule-based engine
|   +-- ml/                   # Neural network inference
+-- types/
    +-- index.ts              # Shared types
ml/                           # Python ML training pipeline
prisma/                       # Database schema and seed
```

---

## Contact

**Godfrey Joseph Sule**
Email: [godfreyj.sule1@gmail.com](mailto:godfreyj.sule1@gmail.com)

---

## License

This project is for academic purposes. All rights reserved.
