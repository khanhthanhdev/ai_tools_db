#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Analyzing bundle performance...\n');

// Analyze dist folder (skip build since it should already be done)
const distPath = './dist';
if (!existsSync(distPath)) {
  console.error('❌ Dist folder not found. Please run "npm run build" first.');
  process.exit(1);
}

// Get file sizes using Node.js fs instead of shell commands
console.log('📊 Bundle Analysis:');
console.log('==================');

function getFilesRecursively(dir, extensions = ['.js', '.css']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

try {
  const files = getFilesRecursively(distPath);
  
  const fileSizes = files.map(file => {
    try {
      const stats = statSync(file);
      const size = stats.size;
      const sizeKB = (size / 1024).toFixed(2);
      const filename = basename(file);
      return { filename, size, sizeKB, path: file };
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Sort by size
  fileSizes.sort((a, b) => b.size - a.size);

  console.log('\n📁 Asset Sizes:');
  fileSizes.forEach(({ filename, sizeKB }) => {
    const indicator = parseFloat(sizeKB) > 100 ? '🔴' : parseFloat(sizeKB) > 50 ? '🟡' : '🟢';
    console.log(`${indicator} ${filename}: ${sizeKB} KB`);
  });

  // Calculate totals
  const totalJS = fileSizes
    .filter(f => f.filename.endsWith('.js'))
    .reduce((sum, f) => sum + f.size, 0);
  
  const totalCSS = fileSizes
    .filter(f => f.filename.endsWith('.css'))
    .reduce((sum, f) => sum + f.size, 0);

  console.log('\n📈 Summary:');
  console.log(`Total JS: ${(totalJS / 1024).toFixed(2)} KB`);
  console.log(`Total CSS: ${(totalCSS / 1024).toFixed(2)} KB`);
  console.log(`Total Assets: ${((totalJS + totalCSS) / 1024).toFixed(2)} KB`);

  // Performance recommendations
  console.log('\n💡 Recommendations:');
  if (totalJS > 200 * 1024) {
    console.log('🔴 JS bundle is large (>200KB). Consider more code splitting.');
  } else if (totalJS > 100 * 1024) {
    console.log('🟡 JS bundle is moderate (>100KB). Monitor for growth.');
  } else {
    console.log('🟢 JS bundle size is good (<100KB).');
  }

  if (totalCSS > 50 * 1024) {
    console.log('🔴 CSS bundle is large (>50KB). Consider purging unused styles.');
  } else {
    console.log('🟢 CSS bundle size is good (<50KB).');
  }

} catch (error) {
  console.error('❌ Error analyzing files:', error.message);
}

console.log('\n✅ Analysis complete!');