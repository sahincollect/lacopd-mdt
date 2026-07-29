const fs = require('fs');
const path = require('path');

const replacements = {
    'Ä±': 'ı',
    'Ã§': 'ç',
    'ÅŸ': 'ş',
    'Ã¶': 'ö',
    'Ã¼': 'ü',
    'ÄŸ': 'ğ',
    'Ä°': 'İ',
    'Åž': 'Ş',
    'Ã‡': 'Ç',
    'Ã–': 'Ö',
    'Ãœ': 'Ü',
    'Äž': 'Ğ'
};

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
    let newContent = content;
    for (let [bad, good] of Object.entries(replacements)) {
        newContent = newContent.split(bad).join(good);
    }
    
    // Fix hardcoded non-turkish chars just in case
    newContent = newContent.replace(/CIKIS YAP/gi, 'ÇIKIŞ YAP');
    newContent = newContent.replace(/SUCLU VERITABANI/gi, 'SUÇLU VERİTABANI');
    newContent = newContent.replace(/Suclu Veritabani/g, 'Suçlu Veritabanı');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Fixed encoding in ' + filePath);
    }
  }
});
