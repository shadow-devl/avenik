const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Users', 'tanik_gmhyf0h', 'Documents', 'PRO', 'AVENIK', 'backend', 'src', 'server.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import schemeMatcherRouter')) {
  const importStatement = `import schemeMatcherRouter from './routes/government-scheme-matching-accuracy.js';\n`;
  content = content.replace("import contextEngineRouter from './routes/contextEngine.js';", "import contextEngineRouter from './routes/contextEngine.js';\n" + importStatement);
}

if (!content.includes("app.use('/api/schemes/match'")) {
  const mountStatement = `app.use('/api/schemes/match', schemeMatcherRouter);\n`;
  content = content.replace("app.use('/api/context', contextEngineRouter);", "app.use('/api/context', contextEngineRouter);\n" + mountStatement);
}

fs.writeFileSync(file, content);
console.log('Updated server.ts');
