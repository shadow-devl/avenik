const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Users', 'tanik_gmhyf0h', '.gemini', 'antigravity', 'brain', 'dd40414f-0b47-4a7d-b396-e1c003e1fa4d', 'task.md');
let content = fs.readFileSync(file, 'utf8');

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

rawPhases.split('\n').forEach(line => {
  if (!line.trim()) return;
  const parts = line.split('|');
  const title = parts[1].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  content += '\n## Phase ' + parts[0] + ' — ' + title + '\n- `[x]` Implementation\n';
});

fs.writeFileSync(file, content);
console.log('Appended to task.md');
