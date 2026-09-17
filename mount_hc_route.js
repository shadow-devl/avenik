const fs = require('fs');
const path = require('path');
const serverFile = path.join(__dirname, 'backend/src/server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

if (!content.includes('human-capital-intelligence.js')) {
  const importStr = `import { humanCapitalIntelligenceRouter } from './routes/human-capital-intelligence.js';\n`;
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex) + 1;
  content = content.slice(0, endOfLastImport) + importStr + content.slice(endOfLastImport);
}

if (!content.includes("'/api/human-capital-intelligence'")) {
  const mountStr = `app.use('/api/human-capital-intelligence', requireAuth, humanCapitalIntelligenceRouter);\n`;
  const lastAppUseIndex = content.lastIndexOf("app.use('/api");
  const endOfLastAppUse = content.indexOf('\n', lastAppUseIndex) + 1;
  content = content.slice(0, endOfLastAppUse) + mountStr + content.slice(endOfLastAppUse);
}

fs.writeFileSync(serverFile, content);
console.log('Mounted Human Capital Route.');
