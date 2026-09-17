const fs = require('fs');
const path = require('path');
const serverFile = path.join(__dirname, 'backend/src/server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// I will just remove all lines containing "schemeSuccessRouter" and re-append it once.
const lines = content.split('\n');
const cleanLines = lines.filter(l => !l.includes('schemeSuccessRouter'));
fs.writeFileSync(serverFile, cleanLines.join('\n'));

// Now we append the correct lines via the original mount logic
const mountStr1 = `import { schemeSuccessRouter } from './routes/government-scheme-application-success.js';\n`;
const mountStr2 = `app.use('/api/government-scheme-application-success', requireAuth, schemeSuccessRouter);\n`;

let newContent = fs.readFileSync(serverFile, 'utf8');
const lastImportIndex = newContent.lastIndexOf('import ');
const endOfLastImport = newContent.indexOf('\n', lastImportIndex) + 1;
newContent = newContent.slice(0, endOfLastImport) + mountStr1 + newContent.slice(endOfLastImport);

const lastAppUseIndex = newContent.lastIndexOf("app.use('/api");
const endOfLastAppUse = newContent.indexOf('\n', lastAppUseIndex) + 1;
newContent = newContent.slice(0, endOfLastAppUse) + mountStr2 + newContent.slice(endOfLastAppUse);

fs.writeFileSync(serverFile, newContent);
console.log('Force fixed duplicates in server.ts');
