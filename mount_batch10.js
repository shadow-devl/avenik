const fs = require('fs');
const path = require('path');
const serverFile = path.join(__dirname, 'backend/src/server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

const modules = [
  { name: 'marketingIntelligenceRouter', file: './routes/marketing-intelligence.js', path: '/api/marketing-intelligence' },
  { name: 'productManagementRouter', file: './routes/product-management.js', path: '/api/product-management' },
  { name: 'financialIntelligenceRouter', file: './routes/financial-intelligence.js', path: '/api/financial-intelligence' },
];

modules.forEach(m => {
  if (!content.includes(m.file)) {
    const importStr = `import { ${m.name} } from '${m.file}';\n`;
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, endOfLastImport) + importStr + content.slice(endOfLastImport);
  }
});

modules.forEach(m => {
  if (!content.includes(m.path)) {
    const mountStr = `app.use('${m.path}', requireAuth, ${m.name});\n`;
    const lastAppUseIndex = content.lastIndexOf("app.use('/api");
    const endOfLastAppUse = content.indexOf('\n', lastAppUseIndex) + 1;
    content = content.slice(0, endOfLastAppUse) + mountStr + content.slice(endOfLastAppUse);
  }
});

fs.writeFileSync(serverFile, content);
console.log('Mounted Batch 10 Routes.');
