const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/dashboard/settings/integrations/page.tsx', 'utf8');

content = content.replace(/className=\{\px-4 py-2 rounded-lg font-medium transition-colors\\}/g, (match, offset, str) => {
  // we can just put a generic dynamic className that relies on the parent's logic or a generic function.
  // Actually, I'll just hardcode a simpler generic class since it's just a button.
  return "className={px-4 py-2 rounded-lg font-medium transition-colors bg-slate-800 text-white hover:bg-slate-700}";
});

fs.writeFileSync('frontend/src/app/dashboard/settings/integrations/page.tsx', content);
