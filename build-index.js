const fs = require('fs');
const path = require('path');

const entriesDir = path.join(process.cwd(), 'entries');
const files = fs.readdirSync(entriesDir).filter(f => f.endsWith('.json'));
const entries = files.map(f => {
  const content = fs.readFileSync(path.join(entriesDir, f), 'utf-8');
  return JSON.parse(content);
});

const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);
fs.writeFileSync(
  path.join(distDir, 'index.json'),
  JSON.stringify(entries, null, 2)
);

console.log(`Built dist/index.json with ${entries.length} entries.`);
