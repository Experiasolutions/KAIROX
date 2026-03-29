import os
import re
import datetime

log_dir = r"C:\Users\Gabriel\.gemini\antigravity\conversations"
email_pattern = re.compile(b'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

results = []

for filename in os.listdir(log_dir):
    if filename.endswith(".pb"):
        filepath = os.path.join(log_dir, filename)
        try:
            timestamp = os.path.getctime(filepath)
            with open(filepath, "rb") as f:
                content = f.read()
                matches = email_pattern.findall(content)
                for match in matches:
                    email = match.decode('utf-8', errors='ignore')
                    results.append((timestamp, email, filename))
        except Exception as e:
            print(f"Error reading {filename}: {e}")

results.sort(key=lambda x: x[0])

if not results:
    print("No emails found.")
else:
    print(f"Found {len(results)} emails.")
    # Print oldest first
    for timestamp, email, filename in results:
        dt = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{dt}] {email} (in {filename})")
