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
    
    // Replace: apiGet<any>(/api/...=);
    // There are a few variations. Let's just use regex on the content.
    // Example: apiGet<any>(/api/workforce/metrics?businessId=);
    // We want: apiGet<any>(/api/workforce/metrics?businessId=);
    
    const before = content;
    
    // Fix the literal regex bug
    content = content.replace(/apiGet<any>\(\/api\/([a-zA-Z0-9\-\/]+)\?businessId=\);/g, 'apiGet<any>(/api/=);');
    
    // Also, some might not have the type parameter <any>
    content = content.replace(/apiGet\(\/api\/([a-zA-Z0-9\-\/]+)\?businessId=\);/g, 'apiGet(/api/=);');

    // Fix ai-intelligence which might have ?businessId= without closing properly
    content = content.replace(/apiGet<any>\(\/api\/generic-intelligence\/metrics\?businessId=\&domain=([a-zA-Z0-9\-]+)\);/g, 'apiGet<any>(/api/generic-intelligence/metrics?businessId=&domain=);');
    
    if (before !== content) {
      fs.writeFileSync(file, content, 'utf8');
      count++;
    }
  }
});

console.log(Fixed  files.);
