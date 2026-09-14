const https = require('https');
https.get('https://chatgpt.com/share/6aa816c4-e4a4-83e8-b7b4-7d85ee217ebc', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const phaseRegex = /PHASE 1\.(\d+)\s*[-—]\s*([^,\\<]+)/gi;
    let match;
    const phases = new Map();
    while ((match = phaseRegex.exec(data)) !== null) {
      const num = parseInt(match[1]);
      if (num >= 44 && num <= 100) {
        let name = match[2].replace(/\\\\n/g, '').replace(/<\/?b>/g, '').trim();
        name = name.replace(/[*\"']/g, '').trim();
        phases.set(num, name);
      }
    }
    const sorted = Array.from(phases.entries()).sort((a, b) => a[0] - b[0]);
    sorted.forEach(([num, name]) => console.log('1.' + num + '|' + name));
  });
}).on('error', (err) => console.log('Error: ', err.message));
