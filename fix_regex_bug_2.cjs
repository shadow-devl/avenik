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
    
    // Replace any apiGet<any>(/api/....) with apiGet<any>(`/api/....`)
    content = content.replace(/apiGet(?:<any>)?\(\/api\/([^\)]+)\)/g, (match, p1) => {
        // if it already has backticks or quotes, leave it
        if (match.includes('`') || match.includes("'") || match.includes('"')) {
            return match;
        }
        
        // p1 is something like generic-intelligence/metrics?businessId=&domain=account-verification
        // wait, the original template had `?businessId=${bid}`
        // if it got swallowed, it's `?businessId=` or `?businessId=&domain=`
        // Let's restore `${bid}`
        let inner = p1;
        inner = inner.replace(/\?businessId=(&domain=[a-zA-Z0-9\-]+)?/, '?businessId=${bid}$1');
        return `apiGet<any>(\`/api/${inner}\`)`;
    });
    
    if (before !== content) {
      fs.writeFileSync(file, content, 'utf8');
      count++;
    }
  }
});

console.log(`Fixed additional ${count} files.`);
