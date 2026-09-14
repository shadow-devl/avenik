const fs = require('fs');
const path = require('path');

const rawPhases = `
1.44|Marketing Intelligence
1.45|Operations Intelligence
1.46|Human Capital Intelligence
1.47|Partner
1.48|Advanced Supplier
1.49|Advanced Sales
1.50|Advanced Funding Readiness
1.51|Advanced Government Support Execution
1.52|Entrepreneur Market Access
1.53|Entrepreneur Digital Presence
1.54|Product
1.55|Entrepreneur Data-Driven Customer Acquisition
1.56|Entrepreneur Knowledge
1.57|Entrepreneur Service Delivery
1.58|Entrepreneur Revenue Operations
1.59|Customer Loyalty
1.60|Customer Lifecycle Intelligence
1.61|Customer Experience Intelligence
1.62|Customer Lifecycle Orchestration
1.63|Customer Lifecycle Automation
1.64|Customer Lifecycle Intelligence Governance
1.65|Customer Self-Service Portal
1.66|Entrepreneur Customer/Business Portal Unification
1.67|Ecosystem Collaboration Intelligence
1.68|Ecosystem Opportunity Orchestration
1.69|Ecosystem Opportunity Execution
1.70|Ecosystem Opportunity Portfolio Intelligence
1.71|Opportunity Intelligence Learning
1.72|Government Scheme Matching Accuracy
1.73|Government Scheme Application Success
1.74|Government Support Portfolio
1.75|Government Support Portfolio Intelligence
1.76|Government Support Lifecycle Automation
1.77|Cross-Domain Entrepreneur Support Orchestration
1.78|Entrepreneur Support Intelligence Center
1.79|Avenik Unified Entrepreneur Journey Orchestration
1.80|Avenik Decision Intelligence
1.81|Avenik Unified Data Quality
1.82|Avenik Trusted Intelligence
1.83|Avenik Global Entrepreneur Profile
1.84|Avenik Secure Knowledge
1.85|Avenik Collaboration
1.86|Avenik Ecosystem Relationship Intelligence
1.87|Avenik Communication
1.88|Resource Intelligence
1.89|Service Provider
1.90|Opportunity
1.91|Product Management
1.92|Legal
1.93|Internationalization
1.94|Advanced Sustainability
1.95|Workforce
1.96|Advanced Risk
1.97|Entrepreneur Digital Twin
1.98|Unified Entrepreneur Intelligence Workspace
1.99|Cross-Domain Integration
1.100|Production Hub
`;

// Helper to format title case properly if caps
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

const phases = [];
rawPhases.split('\n').forEach(line => {
  if (!line.trim()) return;
  const parts = line.split('|');
  if (parts.length === 2) {
    const id = parts[0].trim();
    let name = toTitleCase(parts[1].trim());
    let routeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!routeName) routeName = 'module-' + id.replace('.', '-');
    phases.push({ id, name, route: routeName });
  }
});

const backendRoutesDir = path.join(__dirname, 'backend', 'src', 'routes');
const frontendDashboardDir = path.join(__dirname, 'frontend', 'src', 'app', 'dashboard');

// Scaffold Backend API Routes
phases.forEach(phase => {
  const routeContent = `import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

// GET /api/${phase.route}
router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: '${phase.name} module loaded successfully',
      moduleId: '${phase.id}'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
`;
  const routePath = path.join(backendRoutesDir, `${phase.route}.ts`);
  if (!fs.existsSync(routePath)) {
    fs.writeFileSync(routePath, routeContent);
  }
});

// Scaffold Frontend Pages
phases.forEach(phase => {
  const pageDir = path.join(frontendDashboardDir, phase.route);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  const componentName = phase.name.replace(/[^a-zA-Z0-9]/g, '');
  
  const pageContent = `import Link from "next/link";

export default function ${componentName}Page() {
  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              ${phase.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">${phase.name}</h1>
        <p className="mt-1 text-slate-400">Manage your module settings and insights.</p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <h2 className="text-lg font-medium text-white">Module Initialized</h2>
          <p className="mt-2 text-sm text-slate-400">The ${phase.name} functionality has been scaffolded and is ready for data integration.</p>
        </div>
      </main>
    </div>
  );
}
`;
  const pagePath = path.join(pageDir, 'page.tsx');
  if (!fs.existsSync(pagePath)) {
    fs.writeFileSync(pagePath, pageContent);
  }
});

console.log("Scaffolded " + phases.length + " new modules (Phase 1.44 to 1.100)!");
