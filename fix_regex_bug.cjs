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
    
    content = content.replace(/apiGet<any>\(\/api\/([a-zA-Z0-9\-\/]+)\?businessId=\);/g, 'apiGet<any>(`/api/$1?businessId=${bid}`);');
    content = content.replace(/apiGet\(\/api\/([a-zA-Z0-9\-\/]+)\?businessId=\);/g, 'apiGet(`/api/$1?businessId=${bid}`);');
    content = content.replace(/apiGet<any>\(\/api\/generic-intelligence\/metrics\?businessId=\&domain=([a-zA-Z0-9\-]+)\);/g, 'apiGet<any>(`/api/generic-intelligence/metrics?businessId=${bid}&domain=$1`);');
    
    // Also the settings generic page which I checked earlier: /api/generic-intelligence/metrics?businessId=${bid}&domain=settings
    // Since I checked settings before, it might have it too. Let's just blindly fix it.
    
    if (before !== content) {
      fs.writeFileSync(file, content, 'utf8');
      count++;
    }
  }
});

console.log(`Fixed ${count} files.`);
