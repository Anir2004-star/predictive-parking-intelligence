import os
import re

directories = [
    'C:/Users/ACER/OneDrive/Desktop/Flipkart/parking_prototype/frontend/src/pages',
    'C:/Users/ACER/OneDrive/Desktop/Flipkart/parking_prototype/frontend/src/components'
]

for root_dir in directories:
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(subdir, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Check if it has lucide-react
                if 'lucide-react' in content:
                    # Find the import statement
                    import_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"];?", content, re.MULTILINE | re.DOTALL)
                    if import_match:
                        icons_str = import_match.group(1)
                        # Extract icon component names
                        icons = []
                        for i in icons_str.split(','):
                            i = i.strip()
                            if not i: continue
                            if ' as ' in i:
                                icons.append(i.split(' as ')[-1].strip())
                            else:
                                icons.append(i)
                        
                        # Remove the import line
                        content = content[:import_match.start()] + content[import_match.end():]
                        
                        # Remove usages of each icon
                        for icon in icons:
                            # Remove self-closing tags: <Icon ... />
                            content = re.sub(rf'<{icon}\b[^>]*/>', '', content)
                            # Remove paired tags: <Icon ...>...</Icon>
                            content = re.sub(rf'<{icon}\b[^>]*>.*?</{icon}>', '', content, flags=re.DOTALL)
                        
                        # Also replace empty buttons that used to have icons with text
                        # e.g., <button onClick={...}><X /></button> -> <button onClick={...}>Close</button>
                        # But wait, we just removed <X />, so now it's <button onClick={...}></button>
                        content = re.sub(r'<button([^>]*)>\s*</button>', r'<button\1>Close</button>', content)
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Cleaned icons from {file}")
