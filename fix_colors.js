const fs = require('fs');
const path = require('path');

const files = [
  "src/app/mdt/mesai/page.tsx",
  "src/app/mdt/duyurular/page.tsx",
  "src/app/mdt/mazeretler/page.tsx",
  "src/app/mdt/yonetmelikler/page.tsx",
  "src/app/mdt/kriminal/page.tsx",
  "src/app/mdt/personel/page.tsx",
  "src/app/mdt/profil/page.tsx",
  "src/app/mdt/basvuru/page.tsx"
];

const replacements = [
  { p: /background: "linear-gradient\(145deg, rgba\(13,18,32,0\.9\) 0%, rgba\(10,14,26,0\.8\) 100%\)"/g, r: 'background: "#111111"' },
  { p: /background: `linear-gradient\(145deg, rgba\(13,18,32,0\.9\) 0%, rgba\(10,14,26,0\.8\) 100%\)`/g, r: 'background: "#111111"' },
  { p: /background: "linear-gradient\(145deg, #111111 0%, rgba\(10,14,26,0\.96\) 100%\)"/g, r: 'background: "#111111"' },
  { p: /boxShadow: "0 8px 32px -8px rgba\(0,0,0,0\.5\), inset 0 1px 0 rgba\(255,255,255,0\.03\)"/g, r: 'boxShadow: "0 2px 8px rgba(0,0,0,0.4)"' },
  { p: /  backdropFilter: "blur\(20px\)",\r?\n/g, r: '' },
  { p: /  backdropFilter: "blur\(24px\)",\r?\n/g, r: '' },
  { p: /borderRadius: 16,/g, r: 'borderRadius: 8,' },
  { p: /borderRadius: 14,/g, r: 'borderRadius: 8,' },
  { p: /borderRadius: 18,/g, r: 'borderRadius: 8,' },
  { p: /background: "linear-gradient\(90deg, #161616 0%, transparent 100%\)"/g, r: 'background: "transparent"' },
  { p: /background: "linear-gradient\(90deg, rgba\(29,110,247,0\.02\) 0%, transparent 100%\)"/g, r: 'background: "transparent"' },
  { p: /background: "rgba\(255,255,255,0\.03\)"/g, r: 'background: "#161616"' },
  { p: /background: `rgba\(255,255,255,0\.03\)`/g, r: 'background: "#161616"' },
  { p: /color: "rgba\(200,208,230,0\.38\)"/g, r: 'color: "#555"' },
  { p: /color: "rgba\(255,255,255,0\.16\)"/g, r: 'color: "#333"' },
  { p: /color: "rgba\(255,255,255,0\.16\)"/g, r: 'color: "#555"' },
  { p: /"#22c55e"/g, r: '"#00d26a"' },
  { p: /rgba\(34,197,94,0\./g, r: 'rgba(0,210,106,0.' },
  { p: /boxShadow: "0 4px 16px rgba\(255,255,255,0\.12\)"/g, r: 'boxShadow: "none"' },
  { p: /boxShadow: "0 6px 24px rgba\(255,255,255,0\.16\)"/g, r: 'boxShadow: "none"' },
  { p: /background: "linear-gradient\(135deg, #1D6EF7 0%, #1558d6 100%\)"/g, r: 'background: "#1D6EF7"' },
  { p: /background: `linear-gradient\(135deg, #1D6EF7 0%, #1558d6 100%\)`/g, r: 'background: "#1D6EF7"' },
  { p: /background: idx % 2 === 0 \? `rgba\(29,110,247,0\.01\)` : `transparent`/g, r: 'background: "transparent"' }
];

files.forEach(f => {
  const filePath = path.join(process.cwd(), f);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(rep => {
      content = content.replace(rep.p, rep.r);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated: " + f);
  } else {
    console.log("Missing: " + f);
  }
});
