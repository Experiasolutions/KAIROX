import os
import re
import datetime

log_dir = r"C:\Users\Gabriel\.gemini\antigravity"
email_regex = re.compile(b'[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')

found_entries = []

for root, dirs, files in os.walk(log_dir):
    for file in files:
        if file.endswith(('.json', '.pb', '.md', '.txt', '.js', '.ts', '.html')):
            filepath = os.path.join(root, file)
            try:
                ts = os.path.getctime(filepath)
                with open(filepath, "rb") as f:
                    content = f.read()
                    matches = email_regex.findall(content)
                    for m in matches:
                        email = m.decode('utf-8', errors='ignore')
                        if len(email) < 6: continue
                        domain_part = email.split('@')[1]
                        if '.' not in domain_part: continue
                        tld = domain_part.split('.')[-1]
                        if len(tld) < 2 or not tld.isalpha(): continue
                        found_entries.append({
                            "ts": ts,
                            "email": email,
                            "path": filepath
                        })
            except Exception as e:
                pass

found_entries.sort(key=lambda x: x["ts"])
seen = set()

print(f"{'TIMESTAMP':<20} | {'EMAIL':<30} | {'SOURCE'}")
print("-" * 60)
for e in found_entries:
    dt = datetime.datetime.fromtimestamp(e["ts"]).strftime('%Y-%m-%d %H:%M:%S')
    email = e["email"]
    user_part = email.split('@')[0]
    if len(user_part) < 2 and not user_part.isalpha(): continue
    if "example.com" in email: continue
    if len(email) > 60: continue
    if email in seen: continue
    seen.add(email)
    print(f"{dt:<20} | {email:<30} | {os.path.basename(e['path'])}")
