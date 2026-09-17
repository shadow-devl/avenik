const fs = require('fs');
const files = [
  'frontend/src/app/dashboard/schemes/page.tsx',
  'frontend/src/app/dashboard/settings/integrations/page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix settings/integrations/page.tsx
  content = content.replace(/await apiGet<any>\(\/api\/integrations\?businessId=\)/g, 'await apiGet<any>(/api/integrations?businessId=)');
  content = content.replace(/await apiPost<any>\(\/api\/integrations\/toggle\?businessId=\)/g, 'await apiPost<any>(/api/integrations/toggle?businessId=,');
  
  // Fix schemes/page.tsx
  content = content.replace(/await apiGet<any>\(\/api\/opportunities\/matches\/, { headers:/g, 'await apiGet<any>(/api/opportunities/matches/, { headers:');
  
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
