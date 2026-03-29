import os
import re
import string

# Helper to extract strings from binary
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
        if len(result) >= min:  # catch last one
            yield result

log_dir = r"C:\Users\Gabriel\.gemini\antigravity\conversations"
keywords = ["gmail", "hotmail", "outlook", "yahoo", "protonmail", "icloud"]
suspect_file = "fdbfc488-e646-4c01-af2d-21fec5daec3d.pb"

print(f"--- Strings in {suspect_file} ---")
fpath = os.path.join(log_dir, suspect_file)
if os.path.exists(fpath):
    found_context = False
    for s in strings(fpath):
        if "@" in s:
            print(f"Potential Email String: {s}")
            found_context = True
        elif any(k in s.lower() for k in keywords):
            print(f"Keyword Match: {s}")
            found_context = True
            
    if not found_context:
        print("No email-like strings found in the file.")
else:
    print(f"File {suspect_file} not found.")

print("\n--- Searching for common domains in ALL logs ---")
for filename in os.listdir(log_dir):
    if not filename.endswith(".pb"): continue
    
    filepath = os.path.join(log_dir, filename)
    timestamp = os.path.getctime(filepath)
    dt = os.path.getmtime(filepath) # Check mod time too
    
    # Use strings extraction for better quality than regex on raw bytes
    for s in strings(filepath):
        # Look for explicit domains
        if any(k in s.lower() for k in keywords) and "@" in s:
             print(f"FOUND: {s} in {filename}")
             print(f"  Time: {timestamp}")
