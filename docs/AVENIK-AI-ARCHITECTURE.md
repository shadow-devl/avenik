# AVENIK AI Architecture

## 1. Principles
The Avenik AI Architecture strictly separates **Authoritative Data** (deterministic, verified) from **Generative Insight** (probabilistic, advisory). AI is used to synthesize, route, and match, but *never* to invent numerical facts.

## 2. Core AI Pipelines

### A. Intent Extraction (`IntentExtractionService`)
*   **Purpose**: Translates raw, unstructured user queries (e.g., "I am a 25yo woman starting a tech company in Mumbai, need money") into structured JSON parameters (Sector, Age, Demographics, Support Need).
*   **Fallback**: If extraction fails, it gracefully falls back to explicit user profiles.

### B. Hybrid Semantic Search (`HybridSearchService` & `OpportunityEmbeddingService`)
*   **Purpose**: Matches Entrepreneur Intents against Government Schemes and Investor profiles.
*   **Implementation**: Utilizes `pgvector` inside PostgreSQL.
*   **Flow**:
    1. Opportunity details are embedded into vector space via an Embedding API.
    2. User intents are embedded and searched via cosine similarity.
    3. Results are scored and returned alongside traditional keyword/heuristic filters.

### C. Generative Explanation (`ExplanationService`)
*   **Purpose**: Provides human-readable rationale for *why* a business matched an opportunity.
*   **Constraint**: It must cite the exact `eligibilityRules` from the database. It cannot invent new rules.

### D. Next-Best-Action (NBA) Engine
*   **Purpose**: Synthesizes business health, recent events, and goals into prioritized, actionable recommendations.
*   **Security**: Outputs are stored in the database as `Recommendation` rows with confidence scores, allowing the user to `Accept/Dismiss` deterministically.

## 3. Security & Governance (AI Gateway)
*   All AI requests pass through a governed gateway.
*   Prompt injection defenses are applied.
*   No LLM has unrestricted SQL write access; all outputs must map to Zod-validated schemas before being committed to the database.
