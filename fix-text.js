const fs = require('fs');
const path = require('path');

function fixMojibake(content) {
    let s = content;
    s = s.replace(/Åž/g, 'Ş');
    s = s.replace(/ÅŸ/g, 'ş');
    s = s.replace(/â€¢/g, '•');
    s = s.replace(/Å /g, 'Ş ');
    s = s.replace(/Å/g, 'Ş'); // Fallback for any leftover broken Ş
    
    // Typo fixes
    s = s.replace(/Suclu/g, 'Suçlu');
    s = s.replace(/Veritabani/g, 'Veritabanı');
    s = s.replace(/Cikis/g, 'Çıkış');
    s = s.replace(/CIKIS/g, 'ÇIKIŞ');
    return s;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if(fs.statSync(dirPath).isDirectory()) {
       walkDir(dirPath, callback);
    } else {
       callback(dirPath);
    }
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = fixMojibake(content);
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Fixed text in ' + filePath);
    }
  }
});
