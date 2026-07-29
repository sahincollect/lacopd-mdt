const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/'Montserrat',\s*sans-serif/g, "'Bebas Neue', cursive")
      .replace(/#D4AF37/gi, '#3B82F6')
      .replace(/rgba\(\s*212\s*,\s*175\s*,\s*55\s*,/g, 'rgba(59, 130, 246,')
      .replace(/rgb\(\s*212\s*,\s*175\s*,\s*55\s*\)/g, 'rgb(59, 130, 246)');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated ' + filePath);
    }
  }
});
