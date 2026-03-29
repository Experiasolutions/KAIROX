import os
import re
import json

files_to_check = [
    r"C:\Users\Gabriel\.gemini\antigravity\user_settings.pb",
    r"C:\Users\Gabriel\.gemini\antigravity\code_tracker\active\My AIOS_06f5574f7973869b3147cbaf8be4ff02283218a7\fe1c586ab94a45fe61e37f699f352e8e_learning-audit-log.json"
]

email_pattern = re.compile(b'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

for filepath in files_to_check:
    print(f"Checking {filepath}...")
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    try:
        with open(filepath, "rb") as f:
            content = f.read()
            matches = email_pattern.findall(content)
            if matches:
                 for match in matches:
                    email = match.decode('utf-8', errors='ignore')
                    # valid length filter to avoid noise
                    if len(email) > 5 and '.' in email.split('@')[1]: 
                         print(f"FOUND in {os.path.basename(filepath)}: {email}")
            else:
                print("No emails found.")
    except Exception as e:
        print(f"Error: {e}")
