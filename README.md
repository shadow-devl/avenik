# AVENIK
### India's Comprehensive Startup Ecosystem Platform

> Build. Grow. Succeed. — Connecting entrepreneurs, investors, mentors, and government schemes on a single trust-first platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 · TypeScript · Tailwind CSS |
| Backend | Express.js · TypeScript · Prisma ORM |
| Database | PostgreSQL (Neon) |
| Auth | Auth.js (NextAuth v5) |
| Validation | Zod |

## Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL (or Neon account)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd AVENIK

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database URL, auth secrets, etc.

# 3. Install frontend
cd frontend && npm install && cd ..

# 4. Install backend
cd backend && npm install && cd ..

# 5. Run database migrations
cd backend && npx prisma migrate dev && cd ..

# 6. Start development
# Terminal 1 — Frontend
cd frontend && npm run dev

# Terminal 2 — Backend
cd backend && npm run dev
```

## Project Structure

```
AVENIK/
├── frontend/         # Next.js 15 App (UI + SSR)
├── backend/          # Express.js API Server
├── api/              # Shared TypeScript types & schemas
├── database/         # SQL migrations & seeds
├── docs/             # Architecture documentation
└── scripts/          # Utility scripts
```

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation | 🔨 In Progress |
| 1.1 | Secure Authentication | ⏳ Pending |
| 1.2 | Identity + Roles + Authorization | ⏳ Pending |
| 1.3 | Privacy + Audit + Security | ⏳ Pending |
| 1.4 | Verification + Trust | ⏳ Pending |
| 1.5 | Government Schemes | ⏳ Pending |
| 1.6 | Financial Intelligence | ⏳ Pending |
| 1.7 | Business OS + CRM | ⏳ Pending |
| 1.8 | HR + Workforce | ⏳ Pending |
| 1.9 | Investor Ecosystem | ⏳ Pending |
| 1.10 | Mentor + Advisor | ⏳ Pending |
| 1.11 | Incubator + Accelerator | ⏳ Pending |
| 1.12 | Corporate + Partnership | ⏳ Pending |
| 1.13 | Student + Explorer | ⏳ Pending |

## License

MIT
