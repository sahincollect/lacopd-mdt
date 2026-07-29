const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src/app/mdt/layout.tsx'),
  path.join(__dirname, 'src/app/mdt/page.tsx')
];

const colorMap = {
  '#FEF2F2': 'var(--color-danger-bg)',
  '#FECACA': 'var(--color-danger-border)',
  '#DC2626': 'var(--color-danger)',
  '#FEE2E2': 'var(--color-danger-border)',
  '#B91C1C': 'var(--color-danger)',
  '#ECFDF5': 'var(--color-success-bg)',
  '#A7F3D0': 'var(--color-success-border)',
  '#10B981': 'var(--color-success)',
  '#059669': 'var(--color-success)',
  '#FFFBEB': 'var(--color-warning-bg)',
  '#FEF3C7': 'var(--color-warning-border)',
  '#FDE68A': 'var(--color-warning-border)',
  '#D97706': 'var(--color-warning)',
  '#92400E': 'var(--color-warning)',
  '#E0E7FF': 'var(--color-info-bg)',
  '#C7D2FE': 'var(--color-info-border)',
  '#4F46E5': 'var(--color-info)',
  '#FFF5F2': 'var(--color-danger-bg)',
  '#FDECE7': 'var(--color-danger-border)',
  '#F0FDF4': 'var(--color-success-bg)',
  '#BBF7D0': 'var(--color-success-border)',
  '#D1FAE5': 'var(--color-success-bg)'
};

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  for (const [hex, cssVar] of Object.entries(colorMap)) {
    const regex = new RegExp(hex, 'gi');
    content = content.replace(regex, cssVar);
  }
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}
