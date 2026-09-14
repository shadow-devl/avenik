const fs = require('fs');
const path = require('path');

const phases = [
  { id: '1.14', name: 'University', route: 'university' },
  { id: '1.15', name: 'Community', route: 'community' },
  { id: '1.16', name: 'AI Intelligence', route: 'ai-intelligence' },
  { id: '1.17', name: 'Market Intelligence', route: 'market-intelligence' },
  { id: '1.18', name: 'International Expansion', route: 'international' },
  { id: '1.19', name: 'Intellectual Property', route: 'ip' },
  { id: '1.20', name: 'Sustainability', route: 'sustainability' },
  { id: '1.21', name: 'Analytics', route: 'analytics' },
  { id: '1.22', name: 'Notifications', route: 'notifications' },
  { id: '1.23', name: 'Documents', route: 'documents' },
  { id: '1.24', name: 'Cybersecurity', route: 'cybersecurity' },
  { id: '1.26', name: 'Founder Wellness', route: 'wellness' },
  { id: '1.27', name: 'Personalization', route: 'personalization' },
  { id: '1.28', name: 'Reports', route: 'reports' },
  { id: '1.30', name: 'Ideas', route: 'ideas' },
  { id: '1.31', name: 'Platform Governance', route: 'governance' },
  { id: '1.32', name: 'Data Governance', route: 'data-governance' },
  { id: '1.33', name: 'Workflow Orchestration', route: 'workflows' },
  { id: '1.34', name: 'Ecosystem Marketplace', route: 'marketplace' },
  { id: '1.37', name: 'Scheme Intelligence', route: 'schemes' },
  { id: '1.38', name: 'Application Assistance', route: 'applications' },
  { id: '1.39', name: 'Multi-Channel Communication', route: 'communications' },
  { id: '1.40', name: 'Business Intelligence', route: 'business-intelligence' },
  { id: '1.41', name: 'Command Center', route: 'command-center' },
  { id: '1.42', name: 'Growth Planning', route: 'growth-planning' },
  { id: '1.43', name: 'Customer Intelligence', route: 'customer-intelligence' }
];

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
      phase: '${phase.id}'
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
  
  const pageContent = `import Link from "next/link";

export default function ${phase.name.replace(/[^a-zA-Z0-9]/g, '')}Page() {
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
        <p className="mt-1 text-slate-400">Phase ${phase.id} Module</p>

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

console.log("Scaffolded " + phases.length + " modules!");
