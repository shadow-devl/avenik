const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'backend/src/server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

const modules = [
  { name: 'customerLifecycleOrchestrationRouter', file: './routes/customer-lifecycle-orchestration.js', path: '/api/customer-lifecycle-orchestration' },
  { name: 'partnerRouter', file: './routes/partner.js', path: '/api/partner' },
  { name: 'productManagementRouter', file: './routes/product-management.js', path: '/api/product-management' },
  { name: 'sustainabilityRouter', file: './routes/sustainability.js', path: '/api/sustainability' },
  { name: 'productionHubRouter', file: './routes/production-hub.js', path: '/api/production-hub' },
  { name: 'legalRouter', file: './routes/legal.js', path: '/api/legal' },
];

let importsAdded = 0;
let mountsAdded = 0;

modules.forEach(m => {
  if (!content.includes(m.file)) {
    const importStr = `import { ${m.name} } from '${m.file}';\n`;
    // Find last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, endOfLastImport) + importStr + content.slice(endOfLastImport);
    importsAdded++;
  }
});

modules.forEach(m => {
  if (!content.includes(m.path)) {
    const mountStr = `app.use('${m.path}', requireAuth, ${m.name});\n`;
    // Find last app.use('/api
    const lastAppUseIndex = content.lastIndexOf("app.use('/api");
    const endOfLastAppUse = content.indexOf('\n', lastAppUseIndex) + 1;
    content = content.slice(0, endOfLastAppUse) + mountStr + content.slice(endOfLastAppUse);
    mountsAdded++;
  }
});

fs.writeFileSync(serverFile, content);
console.log(`Added ${importsAdded} imports and ${mountsAdded} route mounts.`);
