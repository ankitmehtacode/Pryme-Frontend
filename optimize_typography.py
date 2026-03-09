import os
import re

def optimize_typography(directory):
    replacements = [
        (r'\bfont-black\b', 'font-semibold'),
        (r'\bfont-extrabold\b', 'font-semibold'),
        (r'\bfont-bold\b', 'font-medium'),
        (r'\btext-6xl\b', 'text-4xl'),
        (r'\btext-5xl\b', 'text-3xl'),
        (r'\btext-4xl\b', 'text-2xl'),
        (r'\btext-3xl\b', 'text-xl'),
        (r'\btext-\[4\.5rem\]\b', 'text-4xl')
    ]

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = content
                for pattern, replacement in replacements:
                    new_content = re.sub(pattern, replacement, new_content)

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

if __name__ == "__main__":
    optimize_typography(r"c:\Users\admin\Downloads\pyr-me-secure-main\src")
