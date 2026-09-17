const fs = require('fs');
const path = require('path');
const serverFile = path.join(__dirname, 'backend/src/server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

const modules = [
  { name: 'universityRouter', file: './routes/university.js', path: '/api/university' },
  { name: 'wellnessRouter', file: './routes/wellness.js', path: '/api/wellness' },
  { name: 'dataGovernanceRouter', file: './routes/data-governance.js', path: '/api/data-governance' },
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
console.log('Mounted Batch 8 Routes.');
