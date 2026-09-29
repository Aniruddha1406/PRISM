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
    } else if (/\.(jsx|tsx|html|json)$/.test(file)) {
      results.push(file);
    }
  });
  return results;
}

const srcDir = path.resolve(__dirname, '../');
const files = walk(srcDir).filter(f => !f.includes('node_modules') && !f.includes('.git'));

let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace NCPOR with PRISM globally
  content = content.replace(/NCPOR/g, 'PRISM');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    totalReplacements++;
  }
}

console.log(`Replaced NCPOR with PRISM in ${totalReplacements} files.`);
