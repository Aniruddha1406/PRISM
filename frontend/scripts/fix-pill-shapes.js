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

// Exceptions: small indicator dots (w-1.5 h-1.5, w-2 h-2) and progress bars stay round
// Everything else: rounded-full -> rounded-[2px]
let totalReplacements = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Replace rounded-full but NOT in lines that are clearly small indicator dots
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes('rounded-full')) continue;
    
    // Skip small indicator dots (w-1.5 h-1.5 or w-2 h-2)
    const isSmallDot = /w-[12]\.?5?\s+h-[12]\.?5?\s+rounded-full/.test(lines[i]);
    // Skip progress bar tracks
    const isProgressBar = lines[i].includes('overflow-hidden h-2') && lines[i].includes('rounded-full');
    
    if (isSmallDot || isProgressBar) {
      continue; // leave these round
    }
    
    lines[i] = lines[i].replace(/rounded-full/g, 'rounded-[2px]');
    totalReplacements++;
  }
  
  const newContent = lines.join('\n');
  if (newContent !== original) {
    fs.writeFileSync(file, newContent);
  }
}

console.log(`Replaced rounded-full in ${totalReplacements} lines across ${files.length} files.`);
