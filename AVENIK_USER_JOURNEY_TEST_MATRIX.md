# AVENIK USER JOURNEY TEST MATRIX

| Role | Journey Step | Expected Behavior | Actual Behavior | Status |
|------|--------------|-------------------|-----------------|--------|
| GUEST | Landing Page | Can view features, ecosystem, trust info | Page renders correctly | WORKING |
| NEW USER | Register | Fills form, selects role, creates account | Account created in DB via API, auto-redirect | WORKING |
| NEW USER | Login | Enters credentials, receives JWT token | NextAuth connects, redirects to dashboard | WORKING |
| ENTREPRENEUR | Dashboard | View business overview | Dashboard UI renders | UI_ONLY |
| ENTREPRENEUR | Access Other Business | 403 Forbidden | Backend explicitly blocks access via ContextService | WORKING |
| ADMIN | Scheme Search | Resolves schemes based on context | Backend returns matched data | API_ONLY |

*Additional roles (INVESTOR, MENTOR) have backend schema and permission definitions, but frontend views are structurally unified under the dashboard shell.*
