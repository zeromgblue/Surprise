const fs = require('fs');
const path = require('path');

const folders = ['templates_1', 'templates_2', 'templates_3'];
const targetDirs = {
  'free': 'templates_1',
  'standard': 'templates_2',
  'premium': 'templates_3'
};
const partMapping = {
  'free': 1,
  'standard': 2,
  'premium': 3
};

// 1. Gather all existing JS template files
const allFiles = {};
folders.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(f => {
      allFiles[f] = path.join(dirPath, f);
    });
  }
});

// 2. Rewrite each data file to update "part: X" and move files
function processDataFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const templates = [];
  
  // Regex to extract id and tier
  const regex = /id:\s*'([^']+)'(?:[^}]+)tier:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
      templates.push({ id: match[1], tier: match[2], fullMatch: match[0] });
  }

  let movedInFile = 0;

  // Process each template
  templates.forEach(t => {
      const targetFolder = targetDirs[t.tier];
      const targetPart = partMapping[t.tier];
      const jsFilename = `tpl-${t.id}.js`;

      // 1. Move the physical file if it exists
      if (allFiles[jsFilename]) {
          const currentPath = allFiles[jsFilename];
          const newPath = path.join(__dirname, targetFolder, jsFilename);
          if (currentPath !== newPath) {
              // Create folder if not exists
              if (!fs.existsSync(path.dirname(newPath))) fs.mkdirSync(path.dirname(newPath), { recursive: true });
              fs.renameSync(currentPath, newPath);
              console.log(`[Moved] ${jsFilename} -> ${targetFolder}`);
              movedInFile++;
          }
          delete allFiles[jsFilename]; // mark as processed
      }

      // 2. Modify "part:" in the code string using Regex replacer
      // A safe way is to find the chunk for this template and replace part.
      // Easiest is global regex on this specific template property block.
      const blockRegex = new RegExp(`(id:\\s*'${t.id}'[\\s\\S]*?)(part:\\s*\\d+,)?([\\s\\S]*?tier:\\s*'${t.tier}')`, 'g');
      content = content.replace(blockRegex, (m, p1, p2, p3) => {
          // If part existed, replace it. If not, inject it before name.
          // Because 'part' is usually near 'name'.
          return `${p1}part: ${targetPart},${p3}`;
      });
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filename} (Moved ${movedInFile} physical files belonging to this file)`);
}

processDataFile('templates-data-1.js');
processDataFile('templates-data-2.js');
processDataFile('templates-data-3.js');

console.log('--- RESTRUCTURE COMPLETE ---');
