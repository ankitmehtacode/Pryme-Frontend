const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-white dark:bg-\[#0[5a]0[5a]0[5a]\]/g, replace: 'bg-card' },
  { regex: /bg-white dark:bg-black/g, replace: 'bg-card' },
  { regex: /text-slate-900 dark:text-white/g, replace: 'text-foreground' },
  { regex: /text-slate-800 dark:text-slate-200/g, replace: 'text-foreground' },
  { regex: /text-slate-700 dark:text-slate-300/g, replace: 'text-muted-foreground' },
  { regex: /border-slate-200 dark:border-white\/10/g, replace: 'border-border' },
  { regex: /border-slate-200 dark:border-slate-800/g, replace: 'border-border' },
  { regex: /border-slate-200\/50 dark:border-slate-800\/50/g, replace: 'border-border/50' },
  { regex: /bg-slate-50 dark:bg-white\/5/g, replace: 'bg-secondary' },
  { regex: /bg-white\/50 dark:bg-white\/5/g, replace: 'bg-secondary/50' },
  { regex: /bg-white\/60 dark:bg-slate-900\/50/g, replace: 'bg-card/60' },
  { regex: /text-slate-500/g, replace: 'text-muted-foreground' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('ui\\') && !fullPath.includes('ui/')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const r of replacements) {
        content = content.replace(r.regex, r.replace);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'pages'));
processDirectory(path.join(__dirname, 'src', 'components'));
console.log('Refactoring complete.');
