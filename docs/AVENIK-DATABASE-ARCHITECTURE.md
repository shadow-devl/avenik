# AVENIK Database Architecture

## 1. Overview
The Avenik database architecture is built on PostgreSQL with Prisma as the ORM. It is designed to be a highly scalable, multi-tenant system supporting a global entrepreneurial ecosystem.

## 2. Core Entities

### Identity & Access (Multi-Tenant RBAC)
*   `User`: Global user entity supporting Google Auth and email.
*   `Role` / `UserRole`: Granular role-based access control.
*   `Organization`: Multi-tenant boundary. Users belong to organizations.
*   `OrganizationMember`: Maps users to organizations with specific roles.
*   `Business`: The core tenant of the application. Owned by a User or an Organization.

### Operational Intelligence (Goal OS & Action Engine)
*   `Goal`: Strategic objectives (Financial, Product, Market) for a Business. Supports hierarchical tracking (parent/child).
*   `GoalMetric`: Quantitative targets for goals.
*   `Action`: Execution items linked to Goals or Businesses.
*   `ActionDependency`: Tracks blocked/blocking relationships between actions.

### AI & Next-Best-Action
*   `Recommendation`: System-generated Next-Best-Actions (NBA) scored by confidence, urgency, impact, and risk.
*   `Decision`: User responses to recommendations, tracking rationale and outcome.

### Business Intelligence & Forecasting
*   `BusinessHealth`: Multidimensional scoring (Financial, Operations, Compliance) tracking the health trend of the business.
*   `Forecast`: Predictive metric projections (Revenue, Cash Flow, Burn Rate) with confidence intervals.
*   `EarlyWarning`: Proactive alerts for financial burn, compliance risks, or market shifts.
*   `FinancialRecord`: Tracks inflows, outflows, revenue, and debt deterministically.

### Ecosystem & Trust
*   `EcosystemRelationship`: Maps relationships between businesses (e.g., B2B_SUPPLIER, INVESTOR).
*   `TrustProfile`: Security and verification scores for a business/user.
*   `Document`: Verified evidence (incorporation, financials) uploaded by the business.
*   `AuditEvent`: Immutable log of all system actions (Context switches, data access) for compliance.

### Government & Opportunity Discovery (Track 1)
*   `EntrepreneurIntent`: Captured user intent for government support, used for semantic search.
*   `OpportunityMatchResult`: AI-driven eligibility matches scoring business profile against government schemes.

## 3. Provenance & Real Data Constraints
*   `ProvenanceRecord`: Every major AI generation or external data point is tracked with `ProvenanceType` (e.g., `OFFICIAL_SOURCE`, `AI_GENERATED`, `VERIFIED`).
*   Determinism: The schema strictly separates raw facts (`FinancialRecord`) from predictive analysis (`Forecast`, `Recommendation`).

## 4. Key Design Patterns
1.  **UUID Primary Keys**: All IDs use `gen_random_uuid()` for distributed scale and security against enumeration.
2.  **Cascade Deletes**: Proper referential integrity ensures that deleting a `Business` cleans up `Goals`, `Actions`, `Recommendations`, and `FinancialRecords`.
3.  **Timestamps**: Extensive use of `@db.Timestamptz` for timezone-aware tracking (`createdAt`, `updatedAt`, `expiresAt`, `calculatedAt`).
