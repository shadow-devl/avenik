const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Users', 'tanik_gmhyf0h', 'Documents', 'PRO', 'AVENIK', 'backend', 'src', 'server.ts');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import contextEngineRouter')) {
  const importStatement = `import contextEngineRouter from './routes/contextEngine.js';\n`;
  content = content.replace("import organizationsRouter from './routes/organizations.js';", "import organizationsRouter from './routes/organizations.js';\n" + importStatement);
}

if (!content.includes("app.use('/api/context'")) {
  const mountStatement = `app.use('/api/context', contextEngineRouter);\n`;
  content = content.replace("app.use('/api/auth', authRouter);", "app.use('/api/auth', authRouter);\n" + mountStatement);
}

fs.writeFileSync(file, content);
console.log('Updated server.ts');
