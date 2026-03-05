import re

file_path = r"C:\Users\bkala\.gemini\antigravity\scratch\axiom\frontend\src\v1\features\workspace\Workflows.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace 1: Name input
content = re.sub(
    r'<input\s+className="axiom-input"\s+style={{ width: "100%", maxWidth: 350,',
    r'<input\n                            title="Workflow Name"\n                            placeholder="Workflow Name"\n                            className="axiom-input"\n                            style={{ width: "100%", maxWidth: 350,',
    content,
    count=1
)

# Replace 2: Trigger select
content = re.sub(
    r'<select\s+className="axiom-select"\s+style={{ fontSize: 12, padding: "2px 4px", width: "100%",',
    r'<select\n                                    title="Workflow Trigger"\n                                    className="axiom-select"\n                                    style={{ fontSize: 12, padding: "2px 4px", width: "100%",',
    content,
    count=1
)

# Replace 3: Condition input
content = re.sub(
    r'<input\s+className="axiom-input"\s+style={{ fontSize: 12, padding: "2px 4px", width: "100%",',
    r'<input\n                                    title="Workflow Condition"\n                                    placeholder="Condition"\n                                    className="axiom-input"\n                                    style={{ fontSize: 12, padding: "2px 4px", width: "100%",',
    content,
    count=1
)

# Replace 4: Actions input
content = re.sub(
    r'<input\s+className="axiom-input"\s+style={{ flex: 1, fontSize: 12, padding: "2px 4px", background: "transparent"',
    r'<input\n                                        title={`Action ${i + 1}`}\n                                        placeholder={`Action ${i + 1}`}\n                                        className="axiom-input"\n                                        style={{ flex: 1, fontSize: 12, padding: "2px 4px", background: "transparent"',
    content,
    count=1
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
