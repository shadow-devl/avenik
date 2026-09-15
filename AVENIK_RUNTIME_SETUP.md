# AVENIK RUNTIME SETUP

## Prerequisites
- Node.js 20+
- PostgreSQL database (e.g., Neon serverless)

## 1. Environment Setup
Create \.env\ in both the root/backend and frontend directories.
- **Backend:** \DATABASE_URL\, \JWT_SECRET\, \CORS_ORIGIN=http://localhost:3000\, \PORT=4000\, \GEMINI_API_KEY\
- **Frontend:** \NEXT_PUBLIC_API_URL=http://localhost:4000\, \NEXTAUTH_SECRET\

## 2. Database Initialization
From the \ackend\ directory:
\\\ash
npm run db:push
npm run db:generate
npm run db:seed
\\\

## 3. Starting the Backend
From the \ackend\ directory:
\\\ash
npm run dev
\\\
*(Backend runs on http://localhost:4000)*

## 4. Starting the Frontend
From the \rontend\ directory:
\\\ash
npm run dev
\\\
*(Frontend runs on http://localhost:3000)*
