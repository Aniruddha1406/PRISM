import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Regex to match emojis and common symbols (like arrows, checks, etc.)
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2190}-\u{21FF}\u{2B50}]/gu;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (/\.(js|jsx|ts|tsx|css|html)$/.test(file)) {
        results.push(file);
      }
    }
  });
  return results;
}

let hasError = false;

const frontendSrc = path.resolve(__dirname, '../src');
const seedFile = path.resolve(__dirname, '../../backend/prisma/seed.js');

const filesToCheck = [];
if (fs.existsSync(frontendSrc)) {
  filesToCheck.push(...walk(frontendSrc));
}
if (fs.existsSync(seedFile)) {
  filesToCheck.push(seedFile);
}

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (EMOJI_REGEX.test(lines[i])) {
      console.error(`Error: Emoji/Symbol found in ${file}:${i + 1}`);
      console.error(`> ${lines[i].trim()}`);
      hasError = true;
    }
    // Reset lastIndex
    EMOJI_REGEX.lastIndex = 0;
  }
}

if (hasError) {
  console.error('Emoji check failed. Please remove all emojis and symbols.');
  process.exit(1);
} else {
  console.log('Emoji check passed. No emojis found.');
}
