const fs = require('fs');
const path = require('path');

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

const buttonColors = ['bg-blue', 'bg-rose', 'bg-green', 'bg-red', 'bg-emerald', 'bg-indigo', 'from-blue', 'from-indigo', 'from-rose'];

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // We want to replace text-white with text-foreground
  // But ONLY if the line doesn't contain a button background color
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('text-white')) {
      const isButton = buttonColors.some(color => line.includes(color));
      if (!isButton) {
        // Safe to replace text-white with text-foreground,
        // Wait, what if the string is split across lines? Tailwind strings are usually on one line.
        lines[i] = line.replace(/text-white/g, 'text-foreground');
      }
    }
  }
  
  content = lines.join('\n');

  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files.`);
