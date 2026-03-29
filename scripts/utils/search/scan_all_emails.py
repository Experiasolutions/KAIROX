import os
import re
import datetime

roots = [
    r"C:\Users\Gabriel\Documents\My AIOS",
    r"C:\Users\Gabriel\.gemini\antigravity"
]

# Regex: Starts with alphanumeric, contains @, domain has dot, > 5 chars
email_regex = re.compile(b'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

found_entries = []

print("Scanning for emails...")

for root_dir in roots:
    if not os.path.exists(root_dir):
        print(f"Skipping {root_dir} (not found)")
        continue
        
    for root, dirs, files in os.walk(root_dir):
        # Skip .git, node_modules to be faster
        if ".git" in dirs: dirs.remove(".git")
        if "node_modules" in dirs: dirs.remove("node_modules")
        
        for file in files:
            filepath = os.path.join(root, file)
            try:
                # size limit 5MB
                if os.path.getsize(filepath) > 5 * 1024 * 1024:
                    continue
                    
                timestamp = os.path.getctime(filepath)
                
                with open(filepath, "rb") as f:
                    content = f.read()
                    matches = email_regex.findall(content)
                    for m in matches:
                        email = m.decode('utf-8', errors='ignore')
                        
                        # filter
                        if len(email) < 6: continue
                        if "example.com" in email: continue
                        if email.startswith("git@"): continue # git config
                        
                        found_entries.append({
                            "ts": timestamp,
                            "email": email,
                            "path": filepath
                        })
            except:
                pass

# Sort
found_entries.sort(key=lambda x: x["ts"])

print(f"Found {len(found_entries)} matches.")
print("-" * 80)
seen = set()
for e in found_entries:
    dt = datetime.datetime.fromtimestamp(e["ts"]).strftime('%Y-%m-%d %H:%M:%S')
    # Dedupe by email to show first occurrence? Or distinct paths?
    # User wants "all emails ... from oldest to newest"
    # I'll show unique (Time, Email) to avoid spamming the same file scan
    key = (dt, e["email"])
    if key in seen: continue
    seen.add(key)
    
    print(f"{dt} | {e['email']:<30} | {os.path.basename(e['path'])}")
