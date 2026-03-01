from app import app
import sys

print("Verifying routes...")
found = False
for route in app.routes:
    print(f"{route.path} {route.methods}")
    if "/properties/{pid}/run" in route.path:
        found = True

if found:
    print("SUCCESS: Route found")
else:
    print("FAILURE: Route NOT found")
