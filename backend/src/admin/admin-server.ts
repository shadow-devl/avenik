import express from 'express';
import { prisma } from '../db.js';
import { logger } from '../utils/logger.js';

const adminApp = express();
adminApp.use(express.json({ limit: '10mb' }));

// ── Security / Authentication ────────────────────────
adminApp.use((req, res, next) => {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  
  // Use admin / avenik2026 as credentials
  if (login === 'admin' && password === 'avenik2026') {
    return next();
  }
  
  res.set('WWW-Authenticate', 'Basic realm="Avenik Admin Panel"');
  res.status(401).send('Authentication required.');
});

// ── Admin API Routes ─────────────────────────────

// Dashboard stats
adminApp.get('/api/admin/stats', async (_req, res) => {
  const [users, businesses, schemes, applications, goals, recommendations, healthRecords, fundingRequests] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.opportunity.count(),
    prisma.opportunityEngagement.count(),
    prisma.goal.count(),
    prisma.recommendation.count(),
    prisma.businessHealth.count(),
    prisma.fundingRequest.count(),
  ]);
  res.json({ users, businesses, schemes, applications, goals, recommendations, healthRecords, fundingRequests });
});

// Generic CRUD factory
function crudRoutes(path: string, model: any, options?: { include?: any; orderBy?: any }) {
  // List
  adminApp.get(`/api/admin/${path}`, async (req, res) => {
    try {
      const take = parseInt(req.query.take as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;
      const [items, total] = await Promise.all([
        model.findMany({ take, skip, orderBy: options?.orderBy || { createdAt: 'desc' }, include: options?.include }),
        model.count(),
      ]);
      res.json({ items, total, take, skip });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Get one
  adminApp.get(`/api/admin/${path}/:id`, async (req, res) => {
    try {
      const item = await model.findUnique({ where: { id: req.params.id }, include: options?.include });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Create
  adminApp.post(`/api/admin/${path}`, async (req, res) => {
    try {
      const item = await model.create({ data: req.body });
      res.status(201).json(item);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Update
  adminApp.put(`/api/admin/${path}/:id`, async (req, res) => {
    try {
      const item = await model.update({ where: { id: req.params.id }, data: req.body });
      res.json(item);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Delete
  adminApp.delete(`/api/admin/${path}/:id`, async (req, res) => {
    try {
      await model.delete({ where: { id: req.params.id } });
      res.json({ deleted: true });
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });
}

// Register CRUD for all major models
crudRoutes('users', prisma.user, { include: { businesses: true, roles: { include: { role: true } } } });
crudRoutes('businesses', prisma.business, { include: { owner: true, goals: true, opportunityEngagements: { include: { scheme: true } } } });
crudRoutes('schemes', prisma.opportunity);
crudRoutes('applications', prisma.opportunityEngagement, { include: { scheme: true, business: true } });
crudRoutes('goals', prisma.goal);
crudRoutes('actions', prisma.action);
crudRoutes('recommendations', prisma.recommendation);
crudRoutes('health', prisma.businessHealth);
crudRoutes('forecasts', prisma.forecast);
crudRoutes('warnings', prisma.earlyWarning);
crudRoutes('decisions', prisma.decision);
crudRoutes('funding-requests', prisma.fundingRequest);
crudRoutes('funding-options', prisma.fundingOption);
crudRoutes('trust-profiles', prisma.trustProfile);
crudRoutes('fraud-cases', prisma.fraudCase);
crudRoutes('organizations', prisma.organization, { include: { members: true } });
crudRoutes('roles', prisma.role);
crudRoutes('documents', prisma.document);
crudRoutes('timeline', prisma.timelineEvent);
crudRoutes('memories', prisma.memory);
crudRoutes('financial-records', prisma.financialRecord);
crudRoutes('audit-events', prisma.auditEvent, { orderBy: { timestamp: 'desc' } });

// Bulk delete
adminApp.post('/api/admin/:model/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    const modelName = req.params.model;
    const modelMap: Record<string, any> = {
      users: prisma.user, businesses: prisma.business, opportunities: { label: 'Opportunities', columns: ['title','department','status','maxFundingAmount'], createFields: [{n:'title',t:'text'},{n:'department',t:'text'},{n:'description',t:'textarea'},{n:'eligibilityRules',t:'textarea',l:'Eligibility'},{n:'maxFundingAmount',t:'number',l:'Max Funding (₹)'},{n:'officialUrl',t:'text',l:'Official URL'},{n:'status',t:'select',opts:['ACTIVE','INACTIVE','EXPIRED']}] },
      engagements: prisma.opportunityEngagement,
  ecosystem_relationships: prisma.ecosystemRelationship,
  ecosystem_messages: prisma.ecosystemMessage, goals: prisma.goal, actions: prisma.action,
      recommendations: prisma.recommendation, health: prisma.businessHealth,
    };
    const m = modelMap[modelName];
    if (!m) return res.status(400).json({ error: 'Unknown model' });
    const result = await m.deleteMany({ where: { id: { in: ids } } });
    res.json({ deleted: result.count });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// Seed SIH data endpoint
adminApp.post('/api/admin/seed-sih', async (_req, res) => {
  try {
    // Create or find the demo user
    const user = await prisma.user.upsert({
      where: { email: 'priya.sharma@avenik.demo' },
      update: {},
      create: { email: 'priya.sharma@avenik.demo', name: 'Priya Sharma' },
    });

    const org = await prisma.organization.upsert({
      where: { id: 'sih-demo-org' },
      update: {},
      create: { id: 'sih-demo-org', name: 'Priya Handicrafts Cooperative' },
    });

    const business = await prisma.business.upsert({
      where: { id: 'sih-demo-biz' },
      update: {},
      create: {
        id: 'sih-demo-biz', ownerUserId: user.id, organizationId: org.id,
        displayName: 'Priya Rural Handicrafts', countryCode: 'IN',
      },
    });

    // Seed government schemes
    const schemes = [
      { id: 'scheme-standup', title: 'Stand-Up India', department: 'Ministry of Finance', description: 'Loans between ₹10 lakh and ₹1 crore for SC/ST and women entrepreneurs.', eligibilityRules: 'Women or SC/ST, greenfield enterprise, 18+ years', benefits: 'See description for benefits', maxFundingAmount: 10000000, officialUrl: 'https://www.standupmitra.in', status: 'ACTIVE' as const },
      { id: 'scheme-mudra', title: 'Pradhan Mantri Mudra Yojana', department: 'Ministry of Finance', description: 'Micro-enterprise loans up to ₹10 lakh under Shishu, Kishore, and Tarun categories.', eligibilityRules: 'Non-corporate, non-farm small/micro enterprises', benefits: 'See description for benefits', maxFundingAmount: 1000000, officialUrl: 'https://www.mudra.org.in', status: 'ACTIVE' as const },
      { id: 'scheme-pmegp', title: 'Prime Minister Employment Generation Programme', department: 'Ministry of MSME', description: 'Credit-linked subsidy for setting up micro enterprises.', eligibilityRules: '18+ years, VIII pass for manufacturing projects above ₹10 lakh', benefits: 'See description for benefits', maxFundingAmount: 2500000, officialUrl: 'https://www.kviconline.gov.in', status: 'ACTIVE' as const },
    ];

    for (const s of schemes) {
      await prisma.opportunity.upsert({ where: { id: s.id }, update: s, create: s });
    }

    res.json({ success: true, user: user.id, business: business.id, schemesSeeded: schemes.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Serve Admin UI ───────────────────────────────
adminApp.get('/{*path}', (_req, res) => {
  res.send(ADMIN_HTML);
});

// ── Start Server ─────────────────────────────────
const ADMIN_PORT = parseInt(process.env.ADMIN_PORT || '5555', 10);

adminApp.listen(ADMIN_PORT, () => {
  logger.info(`🛡️  Avenik Admin Panel running on http://localhost:${ADMIN_PORT}`);
});

export default adminApp;

// ── Inline Admin Dashboard HTML ──────────────────
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Avenik Admin Panel</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0e1a;--surface:#111827;--surface2:#1e293b;--border:#334155;--primary:#3b82f6;--primary-hover:#2563eb;--danger:#ef4444;--success:#22c55e;--warning:#f59e0b;--text:#f1f5f9;--text-dim:#94a3b8;--radius:10px;--shadow:0 4px 24px rgba(0,0,0,.4)}
body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex}
a{color:var(--primary);text-decoration:none}
/* Sidebar */
.sidebar{width:240px;background:var(--surface);border-right:1px solid var(--border);height:100vh;position:fixed;overflow-y:auto;display:flex;flex-direction:column}
.sidebar-header{padding:20px;border-bottom:1px solid var(--border);text-align:center}
.sidebar-header h1{font-size:20px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sidebar-header p{font-size:11px;color:var(--text-dim);margin-top:4px}
.nav-section{padding:12px 0}
.nav-section-title{padding:4px 20px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--text-dim)}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;cursor:pointer;transition:.15s;font-size:14px;color:var(--text-dim);border:none;background:none;width:100%;text-align:left}
.nav-item:hover,.nav-item.active{background:var(--surface2);color:var(--text)}
.nav-item.active{border-right:3px solid var(--primary);color:var(--primary)}
.nav-item .icon{width:18px;text-align:center}
/* Main */
.main{margin-left:240px;flex:1;padding:24px;min-height:100vh}
/* Stats */
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:24px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:.2s}
.stat-card:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:var(--shadow)}
.stat-card .label{font-size:12px;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px}
.stat-card .value{font-size:28px;font-weight:700;margin-top:6px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
/* Table */
.table-container{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.table-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
.table-header h2{font-size:16px}
.table-actions{display:flex;gap:8px}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:12px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);border-bottom:1px solid var(--border);background:var(--surface2)}
td{padding:12px 16px;border-bottom:1px solid var(--border);font-size:13px;max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
tr:hover td{background:rgba(59,130,246,.05)}
/* Buttons */
.btn{padding:8px 16px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:6px}
.btn:hover{border-color:var(--primary);color:var(--primary)}
.btn-primary{background:var(--primary);border-color:var(--primary);color:#fff}
.btn-primary:hover{background:var(--primary-hover)}
.btn-danger{border-color:var(--danger);color:var(--danger)}
.btn-danger:hover{background:var(--danger);color:#fff}
.btn-success{border-color:var(--success);color:var(--success)}
.btn-success:hover{background:var(--success);color:#fff}
.btn-sm{padding:4px 10px;font-size:12px}
/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:1000}
.modal-overlay.active{display:flex}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);width:560px;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow)}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border)}
.modal-header h3{font-size:16px}
.modal-close{background:none;border:none;color:var(--text-dim);font-size:20px;cursor:pointer}
.modal-body{padding:20px}
.modal-footer{padding:12px 20px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px}
/* Form */
.form-group{margin-bottom:14px}
.form-group label{display:block;font-size:12px;color:var(--text-dim);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:10px 12px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:14px;outline:none;transition:.15s}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{border-color:var(--primary)}
.form-group textarea{resize:vertical;min-height:80px}
/* Toast */
.toast{position:fixed;top:20px;right:20px;padding:12px 20px;border-radius:8px;font-size:13px;z-index:2000;animation:slideIn .3s;color:#fff}
.toast.success{background:var(--success)}.toast.error{background:var(--danger)}.toast.info{background:var(--primary)}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
/* JSON viewer */
.json-view{background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:12px;font-family:'Cascadia Code',monospace;font-size:12px;max-height:300px;overflow:auto;white-space:pre-wrap;word-break:break-all}
/* Badge */
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.badge-active{background:rgba(34,197,94,.15);color:var(--success)}
.badge-inactive{background:rgba(239,68,68,.15);color:var(--danger)}
.badge-pending{background:rgba(245,158,11,.15);color:var(--warning)}
/* Empty state */
.empty{text-align:center;padding:48px;color:var(--text-dim)}
.empty .icon{font-size:48px;margin-bottom:12px}
/* Pagination */
.pagination{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-top:1px solid var(--border)}
.pagination .info{font-size:12px;color:var(--text-dim)}
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-header">
    <h1>🛡️ AVENIK</h1>
    <p>Admin Control Panel</p>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">Overview</div>
    <button class="nav-item active" onclick="navigate('dashboard')"><span class="icon">📊</span> Dashboard</button>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">Core Data</div>
    <button class="nav-item" onclick="navigate('users')"><span class="icon">👤</span> Users</button>
    <button class="nav-item" onclick="navigate('businesses')"><span class="icon">🏢</span> Businesses</button>
    <button class="nav-item" onclick="navigate('organizations')"><span class="icon">🏛️</span> Organizations</button>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">SIH Engines</div>
    <button class="nav-item" onclick="navigate('schemes')"><span class="icon">📜</span> Gov Schemes</button>
    <button class="nav-item" onclick="navigate('applications')"><span class="icon">📋</span> Applications</button>
    <button class="nav-item" onclick="navigate('goals')"><span class="icon">🎯</span> Goals</button>
    <button class="nav-item" onclick="navigate('recommendations')"><span class="icon">💡</span> Recommendations</button>
    <button class="nav-item" onclick="navigate('actions')"><span class="icon">⚡</span> Actions</button>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">Intelligence</div>
    <button class="nav-item" onclick="navigate('health')"><span class="icon">❤️</span> Health Records</button>
    <button class="nav-item" onclick="navigate('forecasts')"><span class="icon">📈</span> Forecasts</button>
    <button class="nav-item" onclick="navigate('warnings')"><span class="icon">⚠️</span> Warnings</button>
    <button class="nav-item" onclick="navigate('decisions')"><span class="icon">🧠</span> Decisions</button>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">Trust & Security</div>
    <button class="nav-item" onclick="navigate('trust-profiles')"><span class="icon">🔒</span> Trust Profiles</button>
    <button class="nav-item" onclick="navigate('fraud-cases')"><span class="icon">🚨</span> Fraud Cases</button>
    <button class="nav-item" onclick="navigate('audit-events')"><span class="icon">📝</span> Audit Log</button>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">Finance</div>
    <button class="nav-item" onclick="navigate('funding-requests')"><span class="icon">💰</span> Funding Requests</button>
    <button class="nav-item" onclick="navigate('funding-options')"><span class="icon">🏦</span> Funding Options</button>
    <button class="nav-item" onclick="navigate('financial-records')"><span class="icon">💳</span> Financial Records</button>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">System</div>
    <button class="nav-item" onclick="navigate('timeline')"><span class="icon">🕐</span> Timeline</button>
    <button class="nav-item" onclick="navigate('memories')"><span class="icon">🧩</span> Memories</button>
    <button class="nav-item" onclick="navigate('documents')"><span class="icon">📄</span> Documents</button>
    <button class="nav-item" onclick="navigate('roles')"><span class="icon">🔑</span> Roles</button>
  </div>
</div>

<div class="main" id="main-content"></div>
<div class="modal-overlay" id="modal-overlay">
  <div class="modal">
    <div class="modal-header"><h3 id="modal-title">Edit</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <div class="modal-body" id="modal-body"></div>
    <div class="modal-footer" id="modal-footer"></div>
  </div>
</div>

<script>
const API = '';
let currentPage = 'dashboard';
let currentSkip = 0;
const PAGE_SIZE = 20;

// Model display configurations
const modelConfig = {
  users:              { label: 'Users',              columns: ['name','email','createdAt'], createFields: [{n:'name',t:'text'},{n:'email',t:'email'}] },
  businesses:         { label: 'Businesses',         columns: ['displayName','countryCode','createdAt'], createFields: [{n:'displayName',t:'text',l:'Display Name'},{n:'countryCode',t:'text',l:'Country Code'},{n:'ownerUserId',t:'text',l:'Owner User ID'},{n:'organizationId',t:'text',l:'Organization ID'}] },
  organizations:      { label: 'Organizations',      columns: ['name','createdAt'], createFields: [{n:'name',t:'text'}] },
  opportunities: { label: 'Opportunities', columns: ['title','department','status','maxFundingAmount'], createFields: [{n:'title',t:'text'},{n:'department',t:'text'},{n:'description',t:'textarea'},{n:'eligibilityRules',t:'textarea',l:'Eligibility'},{n:'maxFundingAmount',t:'number',l:'Max Funding (₹)'},{n:'officialUrl',t:'text',l:'Official URL'},{n:'status',t:'select',opts:['ACTIVE','INACTIVE','EXPIRED']}] },
  engagements: { label: 'Engagements', columns: ['businessId','opportunityId','status','matchConfidence'], createFields: [{n:'businessId',t:'text'},
  ecosystem_relationships: { label: 'B2B Connections', columns: ['sourceBusinessId','targetBusinessId','relationshipType','status'], createFields: [{n:'sourceBusinessId',t:'text'},{n:'targetBusinessId',t:'text'},{n:'relationshipType',t:'select',opts:['B2B_SUPPLIER','INVESTOR','MENTOR','PARTNER']},{n:'status',t:'select',opts:['DISCOVERED','REQUESTED','CONSENTED','ACTIVE','REJECTED','TERMINATED']}] },
  ecosystem_messages: { label: 'Intro Messages', columns: ['relationshipId','senderUserId','content'], createFields: [{n:'relationshipId',t:'text'},{n:'senderUserId',t:'text'},{n:'content',t:'textarea'}] },
{n:'opportunityId',t:'text'},{n:'status',t:'select',opts:['DISCOVERED','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED']},{n:'matchConfidence',t:'number',l:'Confidence (0-1)'}] },{n:'schemeId',t:'text'},{n:'status',t:'select',opts:['DISCOVERED','IN_PROGRESS','SUBMITTED','APPROVED','REJECTED']},{n:'matchConfidence',t:'number',l:'Confidence (0-1)'}] },
  goals:              { label: 'Goals',               columns: ['title','category','status','progress'], createFields: [{n:'title',t:'text'},{n:'description',t:'textarea'},{n:'category',t:'select',opts:['FUNDING','GROWTH','COMPLIANCE','HIRING','PRODUCT']},{n:'status',t:'select',opts:['ACTIVE','COMPLETED','PAUSED','CANCELLED']},{n:'businessId',t:'text',l:'Business ID'}] },
  actions:            { label: 'Actions',             columns: ['title','type','status','priority'], createFields: [{n:'title',t:'text'},{n:'type',t:'text'},{n:'status',t:'select',opts:['PENDING','IN_PROGRESS','COMPLETED','BLOCKED']},{n:'priority',t:'select',opts:['LOW','MEDIUM','HIGH','CRITICAL']},{n:'businessId',t:'text',l:'Business ID'}] },
  recommendations:    { label: 'Recommendations',     columns: ['title','category','status','urgencyScore'], createFields: [{n:'title',t:'text'},{n:'description',t:'textarea'},{n:'category',t:'text'},{n:'status',t:'select',opts:['ACTIVE','ACCEPTED','DISMISSED','EXPIRED']},{n:'businessId',t:'text',l:'Business ID'}] },
  health:             { label: 'Health Records',      columns: ['score','financialScore','operationalScore','calculatedAt'], createFields: [] },
  forecasts:          { label: 'Forecasts',           columns: ['type','predictedValue','confidence','periodEnd'], createFields: [] },
  warnings:           { label: 'Early Warnings',      columns: ['type','severity','message','resolvedAt'], createFields: [] },
  decisions:          { label: 'Decisions',           columns: ['title','status','outcome','decidedAt'], createFields: [] },
  'trust-profiles':   { label: 'Trust Profiles',      columns: ['verificationLevel','trustScore','updatedAt'], createFields: [] },
  'fraud-cases':      { label: 'Fraud Cases',         columns: ['type','severity','status','detectedAt'], createFields: [] },
  'audit-events':     { label: 'Audit Events',        columns: ['action','entityType','entityId','timestamp'], createFields: [] },
  'funding-requests': { label: 'Funding Requests',    columns: ['type','amountRequested','status','createdAt'], createFields: [] },
  'funding-options':  { label: 'Funding Options',     columns: ['name','type','maxAmount','interestRate'], createFields: [] },
  'financial-records':{ label: 'Financial Records',    columns: ['type','amount','category','recordDate'], createFields: [] },
  timeline:           { label: 'Timeline Events',     columns: ['type','title','occurredAt'], createFields: [] },
  memories:           { label: 'Memories',            columns: ['type','content','importance','createdAt'], createFields: [] },
  documents:          { label: 'Documents',           columns: ['name','type','status','createdAt'], createFields: [] },
  roles:              { label: 'Roles',               columns: ['name','code','description'], createFields: [{n:'name',t:'text'},{n:'code',t:'text'},{n:'description',t:'textarea'}] },
};

function toast(msg, type='success') {
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

async function api(path, opts={}) {
  try {
    const res = await fetch(API + path, { headers: {'Content-Type':'application/json'}, ...opts });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch(e) { toast(e.message, 'error'); throw e; }
}

function navigate(page) {
  currentPage = page;
  currentSkip = 0;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  event?.target?.closest?.('.nav-item')?.classList.add('active');
  if (page === 'dashboard') renderDashboard();
  else renderTable(page);
}

async function renderDashboard() {
  const s = await api('/api/admin/stats');
  document.getElementById('main-content').innerHTML = \`
    <h2 style="margin-bottom:20px;font-size:22px">📊 Dashboard Overview</h2>
    <div class="stats-grid">
      <div class="stat-card" onclick="navigate('users')"><div class="label">👤 Total Users</div><div class="value">\${s.users}</div></div>
      <div class="stat-card" onclick="navigate('businesses')"><div class="label">🏢 Businesses</div><div class="value">\${s.businesses}</div></div>
      <div class="stat-card" onclick="navigate('schemes')"><div class="label">📜 Gov Schemes</div><div class="value">\${s.schemes}</div></div>
      <div class="stat-card" onclick="navigate('applications')"><div class="label">📋 Applications</div><div class="value">\${s.applications}</div></div>
      <div class="stat-card" onclick="navigate('goals')"><div class="label">🎯 Goals</div><div class="value">\${s.goals}</div></div>
      <div class="stat-card" onclick="navigate('recommendations')"><div class="label">💡 Recommendations</div><div class="value">\${s.recommendations}</div></div>
      <div class="stat-card" onclick="navigate('health')"><div class="label">❤️ Health Records</div><div class="value">\${s.healthRecords}</div></div>
      <div class="stat-card" onclick="navigate('funding-requests')"><div class="label">💰 Funding Requests</div><div class="value">\${s.fundingRequests}</div></div>
    </div>
    <div style="margin-top:24px">
      <h3 style="margin-bottom:12px">⚡ Quick Actions</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-success" onclick="seedSIH()">🌱 Seed SIH Demo Data</button>
        <button class="btn" onclick="navigate('schemes')">📜 Manage Schemes</button>
        <button class="btn" onclick="navigate('users')">👤 Manage Users</button>
        <button class="btn" onclick="navigate('businesses')">🏢 Manage Businesses</button>
      </div>
    </div>
  \`;
}

async function seedSIH() {
  if (!confirm('Seed SIH demo data (Priya Sharma + 3 Government Schemes)?')) return;
  await api('/api/admin/seed-sih', { method: 'POST' });
  toast('SIH demo data seeded successfully!');
  renderDashboard();
}

async function renderTable(model) {
  const cfg = modelConfig[model] || { label: model, columns: ['id','createdAt'], createFields: [] };
  const data = await api(\`/api/admin/\${model}?take=\${PAGE_SIZE}&skip=\${currentSkip}\`);
  const items = data.items || [];
  const total = data.total || 0;

  let tableRows = '';
  if (items.length === 0) {
    tableRows = '<tr><td colspan="20" class="empty"><div class="icon">📭</div>No records found</td></tr>';
  } else {
    items.forEach(item => {
      const cells = cfg.columns.map(col => {
        let val = item[col];
        if (val === null || val === undefined) return '<span style="color:var(--text-dim)">—</span>';
        if (col === 'status') return \`<span class="badge \${val==='ACTIVE'?'badge-active':val==='PENDING'||val==='DISCOVERED'?'badge-pending':'badge-inactive'}">\${val}</span>\`;
        if (col === 'createdAt' || col === 'updatedAt' || col === 'calculatedAt' || col === 'timestamp' || col === 'occurredAt' || col === 'detectedAt' || col === 'decidedAt' || col === 'recordDate' || col === 'periodEnd') return new Date(val).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
        if (typeof val === 'number' && col.toLowerCase().includes('amount')) return '₹' + val.toLocaleString('en-IN');
        if (typeof val === 'number' && (col.includes('core') || col.includes('onfidence') || col.includes('rogress'))) return (val * (val <= 1 ? 100 : 1)).toFixed(1) + '%';
        if (typeof val === 'object') return JSON.stringify(val).slice(0, 60) + '…';
        return String(val).slice(0, 60);
      }).map(v => \`<td>\${v}</td>\`).join('');
      tableRows += \`<tr><td style="font-family:monospace;font-size:11px;color:var(--text-dim)">\${item.id?.slice(0,8) || '—'}…</td>\${cells}<td>
        <button class="btn btn-sm" onclick="viewItem('\${model}','\${item.id}')">👁️</button>
        \${cfg.createFields.length ? \`<button class="btn btn-sm" onclick="editItem('\${model}','\${item.id}')">✏️</button>\` : ''}
        <button class="btn btn-sm btn-danger" onclick="deleteItem('\${model}','\${item.id}')">🗑️</button>
      </td></tr>\`;
    });
  }

  document.getElementById('main-content').innerHTML = \`
    <div class="table-container">
      <div class="table-header">
        <h2>\${cfg.label} <span style="color:var(--text-dim);font-size:13px;font-weight:400">(\${total} total)</span></h2>
        <div class="table-actions">
          \${cfg.createFields.length ? \`<button class="btn btn-primary" onclick="createItem('\${model}')">+ New</button>\` : ''}
          <button class="btn" onclick="renderTable('\${model}')">🔄 Refresh</button>
        </div>
      </div>
      <div style="overflow-x:auto"><table>
        <thead><tr><th>ID</th>\${cfg.columns.map(c => \`<th>\${c.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</th>\`).join('')}<th>Actions</th></tr></thead>
        <tbody>\${tableRows}</tbody>
      </table></div>
      <div class="pagination">
        <span class="info">Showing \${currentSkip+1}-\${Math.min(currentSkip+PAGE_SIZE,total)} of \${total}</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" \${currentSkip===0?'disabled':''} onclick="currentSkip=Math.max(0,currentSkip-PAGE_SIZE);renderTable('\${model}')">← Prev</button>
          <button class="btn btn-sm" \${currentSkip+PAGE_SIZE>=total?'disabled':''} onclick="currentSkip+=PAGE_SIZE;renderTable('\${model}')">Next →</button>
        </div>
      </div>
    </div>
  \`;
}

async function viewItem(model, id) {
  const item = await api(\`/api/admin/\${model}/\${id}\`);
  document.getElementById('modal-title').textContent = 'View Record';
  document.getElementById('modal-body').innerHTML = \`<div class="json-view">\${JSON.stringify(item, null, 2)}</div>\`;
  document.getElementById('modal-footer').innerHTML = '<button class="btn" onclick="closeModal()">Close</button>';
  document.getElementById('modal-overlay').classList.add('active');
}

function createItem(model) {
  const cfg = modelConfig[model];
  if (!cfg?.createFields?.length) return;
  let formHtml = cfg.createFields.map(f => {
    const label = f.l || f.n.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());
    if (f.t === 'textarea') return \`<div class="form-group"><label>\${label}</label><textarea name="\${f.n}"></textarea></div>\`;
    if (f.t === 'select') return \`<div class="form-group"><label>\${label}</label><select name="\${f.n}">\${f.opts.map(o=>\`<option value="\${o}">\${o}</option>\`).join('')}</select></div>\`;
    return \`<div class="form-group"><label>\${label}</label><input type="\${f.t}" name="\${f.n}" /></div>\`;
  }).join('');
  document.getElementById('modal-title').textContent = 'Create ' + cfg.label;
  document.getElementById('modal-body').innerHTML = \`<form id="create-form">\${formHtml}</form>\`;
  document.getElementById('modal-footer').innerHTML = \`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitCreate('\${model}')">Create</button>\`;
  document.getElementById('modal-overlay').classList.add('active');
}

async function submitCreate(model) {
  const form = document.getElementById('create-form');
  const data = {};
  new FormData(form).forEach((v, k) => { if (v) data[k] = isNaN(v) ? v : Number(v); });
  await api(\`/api/admin/\${model}\`, { method: 'POST', body: JSON.stringify(data) });
  toast('Created successfully!');
  closeModal();
  renderTable(model);
}

async function editItem(model, id) {
  const cfg = modelConfig[model];
  if (!cfg?.createFields?.length) return;
  const item = await api(\`/api/admin/\${model}/\${id}\`);
  let formHtml = cfg.createFields.map(f => {
    const label = f.l || f.n.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());
    const val = item[f.n] || '';
    if (f.t === 'textarea') return \`<div class="form-group"><label>\${label}</label><textarea name="\${f.n}">\${val}</textarea></div>\`;
    if (f.t === 'select') return \`<div class="form-group"><label>\${label}</label><select name="\${f.n}">\${f.opts.map(o=>\`<option value="\${o}" \${o===val?'selected':''}>\${o}</option>\`).join('')}</select></div>\`;
    return \`<div class="form-group"><label>\${label}</label><input type="\${f.t}" name="\${f.n}" value="\${val}" /></div>\`;
  }).join('');
  document.getElementById('modal-title').textContent = 'Edit Record';
  document.getElementById('modal-body').innerHTML = \`<form id="edit-form">\${formHtml}</form>\`;
  document.getElementById('modal-footer').innerHTML = \`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="submitEdit('\${model}','\${id}')">Save</button>\`;
  document.getElementById('modal-overlay').classList.add('active');
}

async function submitEdit(model, id) {
  const form = document.getElementById('edit-form');
  const data = {};
  new FormData(form).forEach((v, k) => { if (v) data[k] = isNaN(v) ? v : Number(v); });
  await api(\`/api/admin/\${model}/\${id}\`, { method: 'PUT', body: JSON.stringify(data) });
  toast('Updated successfully!');
  closeModal();
  renderTable(model);
}

async function deleteItem(model, id) {
  if (!confirm('Delete this record permanently? This cannot be undone.')) return;
  await api(\`/api/admin/\${model}/\${id}\`, { method: 'DELETE' });
  toast('Deleted successfully!');
  renderTable(model);
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }
document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

// Init
renderDashboard();
</script>
</body>
</html>`;





