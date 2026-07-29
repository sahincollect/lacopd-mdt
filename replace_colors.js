const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src/app/giris/page.tsx')
];

const colorMap = {
  '#FFFFFF': 'var(--bg-secondary)',
  'white': 'var(--bg-secondary)',
  '#F9FAFB': 'var(--bg-primary)',
  '#F3F4F6': 'var(--bg-tertiary)',
  '#E5E7EB': 'var(--border-light)',
  '#D1D5DB': 'var(--border-strong)',
  '#041632': 'var(--accent-primary)',
  '#111827': 'var(--text-primary)',
  '#1F2937': 'var(--text-primary)',
  '#374151': 'var(--text-secondary)',
  '#4B5563': 'var(--text-secondary)',
  '#6B7280': 'var(--text-muted)',
  '#9CA3AF': 'var(--text-muted)',
  '#E84F2A': 'var(--accent-secondary)'
};

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  for (const [hex, cssVar] of Object.entries(colorMap)) {
    // Only replace 'white' when used in styles (with quotes)
    if (hex === 'white') {
      content = content.replace(/'white'/g, `'${cssVar}'`);
      content = content.replace(/"white"/g, `"${cssVar}"`);
    } else {
      const regex = new RegExp(hex, 'gi');
      content = content.replace(regex, cssVar);
    }
  }
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
