const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'src', 'app', 'dashboard');

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const filePath = path.join(currentDir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace <p className="mt-1 text-slate-400">Phase X.X Module</p>
      content = content.replace(
        /<p className="mt-1 text-slate-400">Phase [0-9.]+ Module<\/p>/g,
        '<p className="mt-1 text-slate-400">Manage your module settings and insights.</p>'
      );

      fs.writeFileSync(filePath, content);
    }
  }
}

walk(dir);
console.log('Phase mentions removed from dashboard modules.');
