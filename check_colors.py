import re

theme_file = r"C:\Users\bkala\.gemini\antigravity\scratch\axiom\frontend\src\v1\components\ui\theme.css"

with open(theme_file, "r", encoding="utf-8") as f:
    content = f.read()

# find all blocks like .axiom-xxx { ... }
blocks = re.findall(r'(\.axiom-[a-zA-Z0-9-]+[^{]*?)\{([^}]*)\}', content)

missing_color = []
for selector, block in blocks:
    if "color:" not in block and "text" in selector:
        missing_color.append(selector.strip())

print("Classes with 'text' in name but missing color:")
for c in missing_color:
    print(c)
