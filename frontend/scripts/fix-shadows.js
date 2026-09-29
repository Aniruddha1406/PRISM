import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (/\.(jsx|tsx)$/.test(file)) {
      results.push(file);
    }
  });
  return results;
}

const srcDir = path.resolve(__dirname, '../src');
const files = walk(srcDir);

let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace hover:border-glacier-500 with hover:border-slate-300
  content = content.replace(/hover:border-glacier-500/g, 'hover:border-slate-300');
  
  // Remove shadows
  content = content.replace(/\s?shadow-hover/g, '');
  content = content.replace(/\s?shadow-sm/g, '');
  content = content.replace(/\s?shadow-lg/g, '');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    totalReplacements++;
  }
}

console.log(`Fixed borders and shadows in ${totalReplacements} files.`);
