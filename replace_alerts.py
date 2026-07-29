import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'alert(' not in content and 'window.alert(' not in content:
        return
        
    print(f"Processing {filepath}")
    
    new_content = content
    # Add import if missing
    if 'from "react-hot-toast"' not in new_content and "from 'react-hot-toast'" not in new_content:
        lines = new_content.split('\n')
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import ') or line.startswith('"use client"') or line.startswith("'use client'"):
                insert_idx = i + 1
        lines.insert(insert_idx, 'import toast from "react-hot-toast";')
        new_content = '\n'.join(lines)
        
    def repl(m):
        msg = m.group(1)
        if 'başarı' in msg.lower() and 'başarısız' not in msg.lower() or 'sıfırlandı' in msg.lower():
            return f'toast.success({msg})'
        else:
            return f'toast.error({msg})'
            
    new_content = re.sub(r'(?:window\.)?alert\((.*?)\)', repl, new_content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

for root, dirs, files in os.walk('src/app/mdt'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
