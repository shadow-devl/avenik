# Avenik Real Data Scorecard

## 1. Provenance Integrity
*   **Government Schemes**: Mapped via `OpportunityMatchResult` tying semantic queries to official registries.
*   **Financial Data**: Real numerical calculations using deterministic functions in `CapitalService`. NO LLM MATH.
*   **Business Records**: Strictly isolated per tenant. No mock records injected cross-tenant.

## 2. API Assertions
*   All routes use `ContextService.resolve()` preventing IDOR.
*   Next-Best-Actions (NBA) generated dynamically from state.
*   Forecast models depend on explicit `FinancialRecord` accumulation.

## 3. Scorecard Result
| Component | Real-Data Verification | Status |
| :--- | :--- | :--- |
| Semantic Matching | Vectors mapping to `Opportunity` table | ✅ PASS |
| Deterministic Capital | `CapitalService.calculateCapitalGap` | ✅ PASS |
| Tenant Isolation | `ContextService` middleware | ✅ PASS |
| AI Governance | `AdaptiveIntelligenceService` explicit tooling | ✅ PASS |
