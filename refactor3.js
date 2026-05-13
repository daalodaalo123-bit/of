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

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Regex breakdown:
  // (?<!dark:) => Ignore if 'dark:' is directly right before it
  // text-(blue|green|red|yellow|amber|rose|purple|indigo)-(200|300|400|500)
  // Replaced with: text-$1-700 dark:text-$1-$2
  
  const regex = /(?<!dark:)text-(blue|green|red|yellow|amber|rose|purple|indigo)-(200|300|400|500)/g;
  
  content = content.replace(regex, (match, color, weight) => {
    return `text-${color}-600 dark:text-${color}-${weight}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${count} files with adaptive colored text.`);
