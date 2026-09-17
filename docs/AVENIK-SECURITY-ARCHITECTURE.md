# AVENIK Security Architecture

## 1. Tenant Isolation & Context Security
*   **Zero-Trust Context Engine**: Every protected API route invokes `ContextService.resolve(req)`.
*   **IDOR Protection**: The context engine verifies that the `userId` attached to the current session token explicitly owns, or has an organizational role granting access to, the requested `businessId`.
*   **Implicit Scoping**: Routes do not trust the client to assert access. The backend fetches the allowed businesses and automatically scopes database queries (e.g., `where: { businessId: context.business.id }`).

## 2. Authentication
*   **Primary**: Google OAuth + Email via `next-auth` (v5).
*   **Session Management**: Secure, HttpOnly JWTs / Server-side sessions via PrismaAdapter.

## 3. Data Integrity & Provenance
*   **Audit Logging**: Every context switch and sensitive mutation creates an `AuditEvent` with IP, UserAgent, and Result.
*   **Provenance Tracking**: External data imports (like government schemes) carry a `ProvenanceRecord` indicating origin, freshness, and verification status.

## 4. API Hardening
*   `helmet`: Used in Express to set secure HTTP headers (CSP, HSTS).
*   `cors`: Strictly limits cross-origin requests to configured domains.
*   `express.json({ limit: '10mb' })`: Prevents payload bloat and simple DoS.

## 5. Trust & Verification Profiles
*   Businesses maintain a `TrustProfile`.
*   Scores are separated into `fraudFlags` and `verificationLevel` (UNVERIFIED, BASIC, KYC_VERIFIED, OFFICIAL), ensuring that a business's trustworthiness is quantifiably distinct from its mere existence.
