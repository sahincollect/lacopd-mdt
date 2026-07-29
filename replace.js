const fs = require('fs');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Cyan/Blue
  content = content.replace(/rgba\(0,\s*212,\s*255/g, 'rgba(239, 68, 68');
  content = content.replace(/rgba\(59,\s*130,\s*246/g, 'rgba(239, 68, 68');
  content = content.replace(/#00d4ff/gi, '#ef4444');
  content = content.replace(/#3B82F6/gi, '#dc2626');
  
  // Green (Radar & Status)
  content = content.replace(/rgba\(16,\s*185,\s*129/g, 'rgba(239, 68, 68');
  content = content.replace(/#4ade80/gi, '#ef4444');
  content = content.replace(/#a7f3d0/gi, '#fca5a5');
  content = content.replace(/var\(--accent-green\)/g, 'var(--accent-red)');
  
  // Purple/Other
  content = content.replace(/#8B5CF6/gi, '#991b1b');
  content = content.replace(/#06B6D4/gi, '#ef4444');
  
  fs.writeFileSync(filePath, content);
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src/app/mdt');
files.forEach(replaceColors);
console.log('Replaced colors in ' + files.length + ' files.');
