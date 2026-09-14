<div align="center">
  <img src="https://raw.githubusercontent.com/shadow-devl/avenik/main/frontend/public/logo.png" alt="Avenik Logo" width="200" onerror="this.style.display='none'"/>
  <h1>🚀 AVENIK</h1>
  <p><b>India's Comprehensive AI-Driven Startup Ecosystem Platform</b></p>
  <p><i>Smart India Hackathon (SIH26092) — AI-Driven Scheme Matching for Marginalized Entrepreneurs</i></p>
  
  [![Phase](https://img.shields.io/badge/Phase-10.9%20Production%20Ready-brightgreen.svg)]()
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)]()
  [![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)]()
  [![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)]()
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)]()
</div>

<br />

> 🌍 **Access Avenik Globally:**  
> To view the live platform, click here: **[🔗 Open Avenik Platform (Live Demo)](https://avenik-sih.vercel.app)** *(Replace with your actual deployment URL like Vercel/Render)*
>
> ⚡ *Running locally and want to share instantly?* Run `npx localtunnel --port 3000` and share the generated link!

---

## 📖 Overview

**Avenik** is a unified entrepreneurial operating, intelligence, funding, and government-support ecosystem. Built specifically for the **Smart India Hackathon (SIH26092)**, Avenik eliminates the complexity of discovering government schemes by offering a highly secure, AI-driven, and marginalized-entrepreneur-first matching engine.

### ✨ Key Features
- 🧠 **Entrepreneur Intelligence Core:** Adaptive, minimal-question engine to extract candidate intent without exhausting the user.
- 🎯 **Government Scheme Matching:** Hard eligibility verification combined with soft relevance scoring (separating AI heuristics from authoritative truth).
- 🛡️ **Zero-Trust & Provenance:** Robust RBAC and tenant isolation via a canonical `ContextService`. You only see what you own.
- 📊 **Financial & Health Engine:** Deterministic calculation of business health, EMI, and runway.
- 📱 **Unified UX Dashboard:** Actionable "Next-Best-Actions" (NBA) and trajectory tracking in a clean, responsive UI.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | ⚛️ Next.js 15 (App Router) · 🟦 TypeScript · 🎨 Tailwind CSS |
| **Backend** | 🟢 Express.js · 🟦 TypeScript · 🗄️ Prisma ORM |
| **Database** | 🐘 PostgreSQL (Neon Serverless) |
| **Auth** | 🔐 Auth.js (NextAuth v5) / JWT Middleware |
| **Validation** | 🛡️ Zod |

---

## 🚀 Quick Start

### 📋 Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL (or a Neon database URL)

### 💻 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/shadow-devl/avenik.git
cd avenik

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

# 3. Install dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 4. Run database migrations & Seed Demo Data
cd backend 
npx prisma migrate dev
npx tsx prisma/seed_sih.ts 
cd ..

# 5. Start development servers
# Terminal 1 — Frontend (Runs on port 3000)
cd frontend && npm run dev

# Terminal 2 — Backend (Runs on port 4000)
cd backend && npm run dev
```

---

## 📁 Project Structure

```text
AVENIK/
├── frontend/         # Next.js 15 App (UI + SSR + Dashboards)
├── backend/          # Express.js API Server (Business Logic + AI Orchestration)
├── api/              # Shared TypeScript types & validation schemas
└── backend/prisma/   # SQL migrations, Canonical Schema, and SIH seeds
```

---

## 🏆 Development Roadmap & Status

| Phase | Description | Status |
|-------|-------------|--------|
| **1 - 2** | Foundation, Auth, Trust, Fraud, Graph & Core Database | ✅ Completed |
| **3 - 9** | Growth Planning, Financial Intelligence, Ecosystem OS | ✅ Completed (Engines Unified) |
| **10.9** | Global Avenik Integration & Production Gate Audit | ✅ Completed |

> *Note: Avenik operates on a canonical architecture. Features are driven by unified Context, Recommendation, Decision, and Memory engines rather than sprawling micro-databases.*

---

## 🔒 Security & Privacy

Avenik enforces strict **Tenant Isolation**. The internal `ContextService` prevents horizontal privilege escalation. The architecture mandates that AI models **never** bypass database authorization constraints.

---

<div align="center">
  <b>Built with ❤️ for the Smart India Hackathon 2026</b>
</div>
