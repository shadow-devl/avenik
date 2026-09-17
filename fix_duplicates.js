const fs = require('fs');
const path = require('path');
const serverFile = path.join(__dirname, 'backend/src/server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// Replace all occurrences of import and app.use for schemeSuccessRouter
// Wait, a better way is to deduplicate.
const lines = content.split('\n');
const uniqueLines = [];
const seenImports = new Set();
const seenUses = new Set();

for (const line of lines) {
  if (line.trim().startsWith('import { schemeSuccessRouter }')) {
    if (!seenImports.has(line)) {
      seenImports.add(line);
      uniqueLines.push(line);
    }
  } else if (line.trim().startsWith("app.use('/api/government-scheme-application-success'")) {
    if (!seenUses.has(line)) {
      seenUses.add(line);
      uniqueLines.push(line);
    }
  } else {
    uniqueLines.push(line);
  }
}

fs.writeFileSync(serverFile, uniqueLines.join('\n'));
console.log('Fixed duplicates in server.ts');
