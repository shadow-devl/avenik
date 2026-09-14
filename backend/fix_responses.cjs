const fs = require('fs');

const contextFile = 'src/routes/contextEngine.ts';
let context = fs.readFileSync(contextFile, 'utf8');
context = context.replace(/return res\.json\(success\(\{([\s\S]*?)\}\)\);/, 'return success(res, {$1});');
fs.writeFileSync(contextFile, context);

const matchFile = 'src/routes/government-scheme-matching-accuracy.ts';
let match = fs.readFileSync(matchFile, 'utf8');
match = match.replace(/return res\.json\(success\(([\s\S]*?)\)\);/, 'return success(res, $1);');
fs.writeFileSync(matchFile, match);

console.log('Fixed multiline responses');
