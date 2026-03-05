import os
import re

theme_file = r"C:\Users\bkala\.gemini\antigravity\scratch\axiom\frontend\src\v1\components\ui\theme.css"
target_dir = r"C:\Users\bkala\.gemini\antigravity\scratch\axiom\frontend\src\v1\features\management"

with open(theme_file, "r", encoding="utf-8") as f:
    theme_css = f.read()

used_classes = set()

for root, _, files in os.walk(target_dir):
    for file in files:
        if file.endswith(".tsx"):
            with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                content = f.read()
                matches = re.findall(r'className=["\']([^"\']+)["\']', content)
                for match in matches:
                    for cls in match.split():
                        if cls.startswith("axiom-"):
                            used_classes.add(cls)

missing_classes = []
for cls in used_classes:
    if f".{cls} {{" not in theme_css and f".{cls}{{" not in theme_css:
        missing_classes.append(cls)

print(f"Found {len(missing_classes)} missing classes in management folder:")
for c in sorted(missing_classes):
    print(c)
