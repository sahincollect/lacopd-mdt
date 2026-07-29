const fs = require('fs');
let content = fs.readFileSync('src/app/giris/page.tsx', 'utf8');

// Replace cyan with sky blue
content = content.replace(/rgba\(0, 212, 255/g, 'rgba(14, 165, 233');

// Update Submit button
content = content.replace(
  /backgroundColor: 'rgba\(14, 165, 233, 0\.1\)',\s*color: 'var\(--accent-primary\)',\s*border: '1px solid rgba\(14, 165, 233, 0\.3\)',\s*borderRadius: '12px',/g,
  `background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.8) 0%, rgba(14, 165, 233, 1) 100%)',\n                color: '#000',\n                border: 'none',\n                borderRadius: '50px',`
);

// Remove the hover background color for button to let gradient shine
content = content.replace(
  /whileHover={{ scale: \(!kvkkAccepted \|\| \(requiresCaptcha && !recaptchaToken\)\) \? 1 : 1\.02, backgroundColor: 'rgba\(14, 165, 233, 0\.2\)' }}/g,
  `whileHover={{ scale: (!kvkkAccepted || (requiresCaptcha && !recaptchaToken)) ? 1 : 1.02, boxShadow: '0 0 25px rgba(14, 165, 233, 0.6)' }}`
);

// Inputs background
content = content.replace(/backgroundColor: 'rgba\(255,255,255,0\.03\)'/g, "backgroundColor: 'rgba(0,0,0,0.2)'");

// Add a subtle border radius to inputs to match modern style (8px or 12px is fine, currently 12px)
// We also want to replace "SECURE_TERMINAL_V3" with something cooler if needed, but it's fine.

fs.writeFileSync('src/app/giris/page.tsx', content);
console.log('Done');
