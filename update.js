const fs = require('fs');

const path = 'C:/Users/yesah/.gemini/antigravity/scratch/lapd-mdt/src/app/mdt/layout.tsx';
let code = fs.readFileSync(path, 'utf8');

// Colors
code = code.replace(/background: '#080c14'/g, "background: '#0a0a0a'");
code = code.replace(/background: 'rgba\\(6,10,18,0\\.7\\)'/g, "background: '#0f0f0f'");
code = code.replace(/borderRight: '1px solid rgba\\(29,110,247,0\\.2\\)'/g, "borderRight: '1px solid rgba(255,255,255,0.08)'");
code = code.replace(/boxShadow: '4px 0 24px -10px rgba\\(29,110,247,0\\.2\\)'/g, "boxShadow: '2px 0 12px rgba(0,0,0,0.4)'");
code = code.replace(/background: 'linear-gradient\\(135deg, rgba\\(29,110,247,0\\.05\\) 0%, transparent 60%\\)'/g, "background: 'transparent'");
code = code.replace(/border: '1\\.5px solid rgba\\(29,110,247,0\\.6\\)'/g, "border: '1.5px solid rgba(255,255,255,0.15)'");
code = code.replace(/color: 'rgba\\(29,110,247,0\\.6\\)'/g, "color: '#444'");
code = code.replace(/borderLeft: '2px solid #1D6EF7'/g, "borderLeft: '2px solid rgba(255,255,255,0.15)'");
code = code.replace(/background: 'rgba\\(29,110,247,0\\.04\\)'/g, "background: 'rgba(255,255,255,0.03)'");
code = code.replace(/color: isActive \\? '#e8ecf5' : 'rgba\\(200,208,230,0\\.5\\)'/g, "color: isActive ? '#ededed' : '#555'");
code = code.replace(/background: isActive\s*\n\s*\? 'linear-gradient\\(90deg, rgba\\(29,110,247,0\\.15\\) 0%, rgba\\(29,110,247,0\\.02\\) 100%\\)'\s*\n\s*: 'transparent'/g, "background: isActive\\n                          ? 'rgba(255,255,255,0.06)'\\n                          : 'transparent'");
code = code.replace(/border: isActive \? '1px solid rgba\\(29,110,247,0\\.2\\)' : '1px solid transparent'/g, "border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'");
code = code.replace(/\(e.currentTarget as HTMLElement\).style.backgroundColor = 'rgba\\(29,110,247,0\\.06\\)'/g, "(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'");
code = code.replace(/\(e.currentTarget as HTMLElement\).style.color = '#c8d0e6'/g, "(e.currentTarget as HTMLElement).style.color = '#888'");
code = code.replace(/\(e.currentTarget as HTMLElement\).style.color = 'rgba\\(200,208,230,0\\.55\\)'/g, "(e.currentTarget as HTMLElement).style.color = '#555'");
code = code.replace(/background: 'linear-gradient\\(90deg, rgba\\(6,10,18,0\\.98\\) 0%, rgba\\(8,12,20,0\\.98\\) 100%\\)'/g, "background: '#0f0f0f'");
code = code.replace(/borderBottom: '1px solid rgba\\(29,110,247,0\\.1\\)'/g, "borderBottom: '1px solid rgba(255,255,255,0.07)'");

// CSS classes replacements
code = code.replace(/color: rgba\(29,110,247,0\.7\);/g, "color: #555;"); // .mdt-topbar-time
code = code.replace(/background: rgba\(29,110,247,0\.08\) !important;/g, "background: rgba(255,255,255,0.06) !important;"); // .mdt-icon-btn:hover
code = code.replace(/color: #1D6EF7 !important;/g, "color: #888 !important;"); // .mdt-icon-btn:hover and collapse
code = code.replace(/border-color: rgba\(29,110,247,0\.6\) !important;/g, "border-color: rgba(255,255,255,0.25) !important;"); // .mdt-avatar-btn:hover
code = code.replace(/border-color: rgba\(29,110,247,0\.2\);/g, "border-color: rgba(255,255,255,0.1);"); // .mdt-collapse-btn:hover
code = code.replace(/background: rgba\(29,110,247,0\.06\) !important;/g, "background: rgba(255,255,255,0.05) !important;"); // .mdt-collapse-btn:hover
code = code.replace(/background: rgba\(29,110,247,0\.2\);/g, "background: rgba(255,255,255,0.12);"); // scrollbar
code = code.replace(/background: rgba\(29,110,247,0\.4\);/g, "background: rgba(255,255,255,0.12);"); // scrollbar
code = code.replace(/background: rgba\(255,255,255,0\.07\);/g, "background: rgba(255,255,255,0.12);"); // scrollbar main

// Profile dropdown card
code = code.replace(/background: 'linear-gradient\\(160deg, #0d1220 0%, #0a0e1a 100%\\)'/g, "background: '#161616'");
code = code.replace(/border: '1px solid rgba\\(29,110,247,0\\.2\\)'/g, "border: '1px solid rgba(255,255,255,0.1)'");
code = code.replace(/boxShadow: '0 20px 60px rgba\\(0,0,0,0\\.6\\), 0 0 0 1px rgba\\(29,110,247,0\\.05\\)'/g, "boxShadow: '0 8px 24px rgba(0,0,0,0.5)'");
code = code.replace(/background: 'linear-gradient\\(135deg, rgba\\(29,110,247,0\\.08\\) 0%, transparent 100%\\)'/g, "background: 'transparent'");
code = code.replace(/borderBottom: '1px solid rgba\\(29,110,247,0\\.08\\)'/g, "borderBottom: '1px solid rgba(255,255,255,0.08)'");

// Main area
code = code.replace(/background: 'linear-gradient\\(160deg, #080c14 0%, #060a12 100%\\)'/g, "background: '#0a0a0a'");
code = code.replace(/background: 'radial-gradient\\(ellipse at 20% 50%, #050810 0%, #080c14 40%, #06091a 100%\\)'/g, "background: '#0a0a0a'");

// Status badges
code = code.replace(/background: '#22c55e'/g, "background: '#00d26a'");
code = code.replace(/boxShadow: '0 0 6px rgba\\(34,197,94,0\\.6\\)'/g, "boxShadow: '0 0 6px rgba(0,210,106,0.6)'");
code = code.replace(/rgba\(34,197,94,0\.5\)/g, "rgba(0,210,106,0.5)");
code = code.replace(/rgba\(34,197,94,0\)/g, "rgba(0,210,106,0)");
code = code.replace(/rgba\(34,197,94,0\.3\)/g, "rgba(0,210,106,0.3)");
code = code.replace(/rgba\(34,197,94,0\.07\)/g, "rgba(0,210,106,0.07)");
code = code.replace(/'#4ade80'/g, "'#00d26a'");

// Aurora
code = code.replace(/rgba\(29,110,247,0\.13\)/g, "rgba(29,110,247,0.05)");
code = code.replace(/rgba\(29,110,247,0\.04\)/g, "rgba(29,110,247,0.02)");
code = code.replace(/rgba\(99,60,230,0\.1\)/g, "rgba(99,60,230,0.04)");
code = code.replace(/rgba\(99,60,230,0\.03\)/g, "rgba(99,60,230,0.01)");
code = code.replace(/rgba\(6,182,212,0\.06\)/g, "rgba(6,182,212,0.02)");

// Texts
code = code.replace(/'#e8ecf5'/g, "'#ededed'");
code = code.replace(/color: 'rgba\\(200,208,230,0\\.4\\)'/g, "color: '#555'");
code = code.replace(/color: 'rgba\\(200,208,230,0\\.3\\)'/g, "color: '#555'");
code = code.replace(/color: 'rgba\\(200,208,230,0\\.45\\)'/g, "color: '#555'");
code = code.replace(/color: 'rgba\\(200,208,230,0\\.35\\)'/g, "color: '#555'");
code = code.replace(/color: 'rgba\\(29,110,247,0\\.5\\)'/g, "color: '#555'");

// Search Input
code = code.replace(/background: 'rgba\\(29,110,247,0\\.04\\)'/g, "background: '#161616'");
code = code.replace(/border: '1px solid rgba\\(29,110,247,0\\.12\\)'/g, "border: '1px solid rgba(255,255,255,0.1)'");

// Remove glow from profile card hover/borders
code = code.replace(/border: `2px solid \$\{profileOpen \? 'rgba\\(29,110,247,0\\.7\\)' : 'rgba\\(29,110,247,0\\.2\\)'\}`/g, "border: `2px solid ${profileOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`");
code = code.replace(/boxShadow: profileOpen \? '0 0 0 4px rgba\\(29,110,247,0\\.15\\)' : 'none'/g, "boxShadow: profileOpen ? '0 0 0 4px rgba(255,255,255,0.05)' : 'none'");

fs.writeFileSync(path, code);
console.log('Update complete');
