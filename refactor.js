const fs = require('fs');
const path = require('path');

const replacements = [
  { match: /bg-\[#0f1117\]/g, replace: 'bg-background' },
  { match: /bg-\[#151822\]\/95/g, replace: 'bg-card/95' },
  { match: /bg-\[#151822\]/g, replace: 'bg-card' },
  { match: /border-gray-700\/50/g, replace: 'border-border' },
  { match: /border-gray-800/g, replace: 'border-border' },
  { match: /border-gray-700/g, replace: 'border-border' },
  { match: /text-gray-400/g, replace: 'text-muted' },
  { match: /text-gray-500/g, replace: 'text-muted' },
  { match: /text-gray-100/g, replace: 'text-foreground' },
  { match: /text-gray-200/g, replace: 'text-foreground' },
  { match: /text-gray-300/g, replace: 'text-foreground' },
  { match: /bg-gray-800\/50/g, replace: 'bg-accent/50' },
  { match: /bg-gray-800/g, replace: 'bg-accent' },
  { match: /bg-gray-900\/50/g, replace: 'bg-background/50' },
  { match: /bg-gray-900/g, replace: 'bg-background' },
  { match: /hover:bg-gray-700\/40/g, replace: 'hover:bg-accent/40' },
  { match: /hover:bg-gray-700\/50/g, replace: 'hover:bg-accent/50' },
  { match: /hover:bg-gray-800/g, replace: 'hover:bg-accent' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('./app'), ...walk('./components')];

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ match, replace }) => {
    content = content.replace(match, replace);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files.`);
