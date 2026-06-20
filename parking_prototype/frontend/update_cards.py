import os
import re

directories = [
    'C:/Users/ACER/OneDrive/Desktop/Flipkart/parking_prototype/frontend/src/pages',
]

for root_dir in directories:
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(subdir, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace class
                new_content = content.replace('glass-panel', 'premium-card')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file}")
