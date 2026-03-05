import os
import re

base_dir = r"C:\Users\bkala\.gemini\antigravity\scratch\axiom\frontend\src\v1"
theme_file = os.path.join(base_dir, "components", "ui", "theme.css")

used_classes = set()
for root, _, files in os.walk(base_dir):
    for fl in files:
        if fl.endswith(".tsx") or fl.endswith(".ts"):
            with open(os.path.join(root, fl), "r", encoding="utf-8") as f:
                content = f.read()
                matches = re.findall(r'axiom-text-[a-zA-Z0-9-]+', content)
                used_classes.update(matches)

with open(theme_file, "r", encoding="utf-8") as f:
    theme_content = f.read()
    defined_classes = set(re.findall(
        r'\.(axiom-text-[a-zA-Z0-9-]+)\s*\{', theme_content))

missing = sorted(list(used_classes - defined_classes))

print(f"Found {len(missing)} missing text classes:")
for c in missing:
    print(c)
