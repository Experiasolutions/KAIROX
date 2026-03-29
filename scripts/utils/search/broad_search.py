import os
import string

# Helper to extract strings
def strings(filename, min=4):
    with open(filename, "rb") as f:
        result = ""
        for c in f.read():
            if chr(c) in string.printable:
                result += chr(c)
                continue
            if len(result) >= min:
                yield result
            result = ""
        if len(result) >= min:
            yield result

base_dir = r"C:\Users\Gabriel\.gemini\antigravity"
target_file = "fdbfc488-e646-4c01-af2d-21fec5daec3d.pb"
keywords = ["email", "mail", "contato", "gmail", "hotmail", "@"]

target_path = ""
# Find the file first
for root, dirs, files in os.walk(base_dir):
    if target_file in files:
        target_path = os.path.join(root, target_file)
        break

if target_path:
    print(f"Found {target_file} at {target_path}")
    print(f"Creation Time: {os.path.getctime(target_path)}")
    print("-" * 20)
    for s in strings(target_path):
        if any(k in s.lower() for k in keywords):
            print(f"MATCH: {s}")
else:
    print(f"Could not find {target_file}")

print("\n--- Broad Keyword Search in Conversations ---")
conv_dir = os.path.join(base_dir, "conversations")
if os.path.exists(conv_dir):
    for filename in os.listdir(conv_dir):
        if not filename.endswith(".pb"): continue
        filepath = os.path.join(conv_dir, filename)
        
        # Search for "my email is" patterns or just keywords near @
        for s in strings(filepath):
            s_lower = s.lower()
            if "email" in s_lower or "mail" in s_lower or "contato" in s_lower:
                # Print context if it looks interesting
                if len(s) < 200:
                    print(f"[{filename}] {s}")
