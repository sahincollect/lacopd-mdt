const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Remove imports
    content = content.replace(/import\s+\{.*motion.*\}\s+from\s+['"]framer-motion['"];?\r?\n/g, '');

    // Replace motion elements
    content = content.replace(/<motion\.([a-zA-Z0-9]+)/g, '<$1');
    content = content.replace(/<\/motion\.([a-zA-Z0-9]+)>/g, '</$1>');

    // Remove framer-motion props safely (might leave some extra spaces but it's fine)
    // properties: initial, animate, whileInView, variants, viewport, transition, exit, layout
    // regex matches prop={...} or prop="..."
    const propsToRemove = ['initial', 'animate', 'whileInView', 'variants', 'viewport', 'transition', 'exit', 'layoutId', 'layout'];
    propsToRemove.forEach(prop => {
        // Matches prop={...} where ... can contain nested braces, up to a reasonable level
        // For simplicity, we just use a non-greedy match for anything between { and } that doesn't have unbalanced braces, 
        // but simple regex: prop=\{[^}]*\} or prop="[^"]*"
        // Since variants={staggerContainer} has no nested braces, it's easy.
        // viewport={{ once: true, margin: "-100px" }} has one level of nested braces.
        
        let regex = new RegExp(`\\s${prop}=\\{(\\{[^}]*\\}|[^{}]+)*\\}`, 'g');
        content = content.replace(regex, '');
        
        let regexStr = new RegExp(`\\s${prop}="[^"]*"`, 'g');
        content = content.replace(regexStr, '');
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Processed:', filePath);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (fullPath.includes('node_modules') || fullPath.includes('.next')) continue;
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

traverseDir(path.join(__dirname, 'src'));
