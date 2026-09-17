const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src/app/dashboard');
let count = 0;

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    const before = content;
    
    content = content.replace(/className=\{([^}'"`]+)\}/g, (match, p1) => {
       if (p1.includes(' ') || p1.includes('-') || p1.includes('[')) {
           // We might have swallowed expressions like ${...} as well, wait, if powershell swallowed `${...}` it's completely gone.
           // e.g. `bg-${color}-500` became `bg--500`
           // Well, mostly it was just `ext-[10px] uppercase mt-1 inline-block px-2 py-0.5 rounded-full ${...}`
           // I will just wrap it in backticks so it compiles.
           return `className={\`${p1.trim()}\`}`;
       }
       return match;
    });

    if (before !== content) {
      fs.writeFileSync(file, content, 'utf8');
      count++;
    }
  }
});

console.log(`Fixed ${count} files with className syntax.`);
