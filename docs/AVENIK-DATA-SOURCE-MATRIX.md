# AVENIK Data Source Matrix

## 1. Verified Core Data (Internal)
*   **User Identity**: Managed securely via NextAuth and Prisma Postgres.
*   **Financial Records**: Deterministically captured and managed directly in Avenik by the Business.
*   **Business Operations**: Goals, Actions, and Health calculations are native platform state.

## 2. External Intelligence & Integrations (The 130 Platform Inventory)

The Master Directive mandates supporting an ecosystem of 130 verified platforms across 11 domains. Implementation rule: **No Fake Integrations**. Data is sourced via `OFFICIAL_API`, `OFFICIAL_PUBLIC_DATA`, `USER_PROVIDED`, or flagged as `REQUIRES_AUTHENTICATION`.

### Category 1: Startup & Private Company Databases
*   **Sources**: Crunchbase, PitchBook, CB Insights, Dealroom, Tracxn
*   **Integration Level**: `OFFICIAL_API` / `PARTNER_INTEGRATION` (where licensed).

### Category 2: Equity Crowdfunding
*   **Sources**: Wefunder, StartEngine, Republic, SeedInvest, Crowdcube, FrontFundr
*   **Integration Level**: `OFFICIAL_WEB_SOURCE`

### Category 3: Rewards/Donation/Hybrid Crowdfunding
*   **Sources**: Kickstarter, Indiegogo, GoFundMe, Patreon
*   **Integration Level**: `OFFICIAL_WEB_SOURCE`

### Category 4: Pre-IPO & Secondary Markets
*   **Sources**: Forge Global, EquityZen, Carta
*   **Integration Level**: `REQUIRES_AUTHENTICATION`

### Category 5: Angel Networks & Syndicates
*   **Sources**: AngelList, Gust, SyndicateRoom
*   **Integration Level**: `OFFICIAL_PUBLIC_DATA`

### Category 6: India-Specific Funding Platforms
*   **Sources**: LetsVenture, Tyke, Grip Invest, Klub, Anicut Capital, Revenue Based Financing (GetVantage)
*   **Integration Level**: `OFFICIAL_PUBLIC_DATA`

### Category 7: Indian Government Grants & Schemes
*   **Sources**: Startup India Seed Fund, Mudra Yojana, CGTMSE, Stand-Up India
*   **Integration Level**: `OFFICIAL_REGISTRY` (Via verified seed synchronization in Track 1 Discovery).

*(Full inventory spans M&A marketplaces like MicroAcquire, Startup Launch platforms like Product Hunt, and more. See complete Master Directive for exhaustive list.)*
