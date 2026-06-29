import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LAYOUT_DIR = path.resolve(__dirname, '../src/components/layout');

// Regexes to catch forbidden layout practices in layout primitives
const RAW_SPACING_REGEX = /\b([pm][xytrbl]?|gap|w|h)-\d+\b/g;
const RAW_PIXEL_REGEX = /\[\d+(px|rem|em)\]/g;

// Regex to catch forbidden imports
const FORBIDDEN_IMPORT_REGEX = /from\s+["']@?\/?(features|pages|domain)["']/g;
const FORBIDDEN_RELATIVE_REGEX = /from\s+["'](\.\.\/)+(\.\.\/)?(features|pages)["']/g;

let hasErrors = false;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // 1. Check raw spacing/sizing
    let match;
    while ((match = RAW_SPACING_REGEX.exec(line)) !== null) {
      console.error(`❌ [Architecture Violation] Raw spacing/sizing utility found in layout primitive.`);
      console.error(`   File: ${relativePath}:${index + 1}`);
      console.error(`   Line: ${line.trim()}`);
      console.error(`   Matched: ${match[0]}\n`);
      hasErrors = true;
    }

    while ((match = RAW_PIXEL_REGEX.exec(line)) !== null) {
      console.error(`❌ [Architecture Violation] Raw pixel/rem value found in layout primitive.`);
      console.error(`   File: ${relativePath}:${index + 1}`);
      console.error(`   Line: ${line.trim()}`);
      console.error(`   Matched: ${match[0]}\n`);
      hasErrors = true;
    }

    // 2. Check imports
    if (FORBIDDEN_IMPORT_REGEX.test(line) || FORBIDDEN_RELATIVE_REGEX.test(line)) {
      console.error(`❌ [Architecture Violation] Layout primitive cannot import from features or pages.`);
      console.error(`   File: ${relativePath}:${index + 1}`);
      console.error(`   Line: ${line.trim()}\n`);
      hasErrors = true;
    }
  });
}

console.log('Running Architecture Checks on src/components/layout...');
if (fs.existsSync(LAYOUT_DIR)) {
  walk(LAYOUT_DIR);
} else {
  console.log(`Directory not found: ${LAYOUT_DIR}`);
}

if (hasErrors) {
  console.error('💥 Architecture validation failed. Please fix the errors above.');
  process.exit(1);
} else {
  console.log('✅ Architecture validation passed.');
}
