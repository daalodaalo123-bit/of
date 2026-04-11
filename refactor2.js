const fs = require('fs');
const path = require('path');

const replacements = [
  { match: /bg-\[#1a1d27\]/g, replace: 'bg-card' },
  { match: /bg-\[#242732\]\/50/g, replace: 'bg-accent/50' },
  { match: /hover:bg-\[#242732\]\/50/g, replace: 'hover:bg-accent/50' },
  { match: /bg-\[#242732\]/g, replace: 'bg-accent' },
  { match: /hover:bg-\[#242732\]/g, replace: 'hover:bg-accent' },
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

console.log(`Updated ${count} files with new background replacements.`);
