# AVENIK API Matrix

## 1. Authentication & Users
| Endpoint | Method | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/auth/[...nextauth]` | POST/GET | NextAuth integration | Public |
| `/api/auth/register` | POST | Register new user | Public |
| `/api/auth/login` | POST | Login user | Public |

## 2. Context & Multi-Tenancy
| Endpoint | Method | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/context/current` | GET | Resolve current User/Business context and apply RBAC | Required |

## 3. Business & Ecosystem
| Endpoint | Method | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/business` | GET | List owned businesses | Required |
| `/api/organizations` | GET | List organizations | Required |

## 4. Government Support & Opportunities
| Endpoint | Method | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/opportunities/discover` | POST | Track 1 Hybrid Semantic Search for schemes | Required + Context |
| `/api/opportunities/matches/:businessId` | GET | Retrieve saved/scored scheme matches | Required + Context |

## 5. Intelligence & Actions
| Endpoint | Method | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/nba` | GET | Retrieve Next-Best-Actions | Required + Context |
| `/api/health-engine` | GET | Retrieve multidimensional business health | Required + Context |
| `/api/recommendations` | GET | Get AI recommendations | Required + Context |
| `/api/decisions` | POST | Accept/Reject/Dismiss recommendations | Required + Context |

## 6. Financial Intelligence
| Endpoint | Method | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/forecasts` | GET | Retrieve deterministic financial forecasts | Required + Context |
| `/api/finance` | GET | Retrieve financial records & capital gap | Required + Context |
| `/api/funding` | GET | Manage funding requests and readiness | Required + Context |

## 7. Security & Risk
| Endpoint | Method | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| `/api/warnings` | GET | Retrieve early warnings (fraud, burn, compliance) | Required + Context |
| `/api/trust` | GET | Retrieve trust and verification profiles | Required + Context |
| `/api/fraud` | GET | Retrieve fraud signals and cases | Required + Context |

*Note: All protected routes expect standard headers or cookies, and validate against `ContextService.resolve()` to ensure cross-tenant data isolation (preventing IDOR).*
