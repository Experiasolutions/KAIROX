import os
import re
import datetime

# Directories to search
base_dir = r"C:\Users\Gabriel\.gemini\antigravity"
dirs_to_check = [
    os.path.join(base_dir, "conversations"),
    os.path.join(base_dir, "brain"),
    os.path.join(base_dir, "code_tracker"),
    os.path.join(base_dir, "implicit"),
    os.path.join(base_dir, "context_state"),
]

# Regex for email (slightly stricter to avoid garbage in binary files)
# Requires at least 2 chars for TLD, and standard chars for domain/user
email_pattern = re.compile(b'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

found_emails = []

print(f"Scanning directories in {base_dir}...")

for d in dirs_to_check:
    if not os.path.exists(d):
        continue
        
    for root, dirs, files in os.walk(d):
        for file in files:
            filepath = os.path.join(root, file)
            try:
                # Get file timestamp (creation time on Windows)
                timestamp = os.path.getctime(filepath)
                
                with open(filepath, "rb") as f:
                    # Read cautiously - some files might be huge, but usually log files are manageable.
                    # For safety, read first 10MB only if it's huge? 
                    # Let's just read it, assuming they aren't gigabytes.
                    content = f.read()
                    
                    matches = email_pattern.findall(content)
                    for match in matches:
                        try:
                            email = match.decode('utf-8')
                            # Filter out common false positives in binary data
                            # 1. TLD shouldn't be all caps usually unless it is valid, but let's allow it.
                            # 2. Check for common garbage (no spaces, valid chars) - regex covers most.
                            # 3. Length check
                            if len(email) < 6 or len(email) > 100:
                                continue
                            
                            # Additional filter: Domain usually has at least one dot
                            domain = email.split('@')[1]
                            if '.' not in domain:
                                continue
                                
                            # Heuristic: Filter out "emails" that look like code artifacts or garbage
                            # e.g. "user@hostname" is common in default configs
                            if email.lower() in ["user@example.com", "foo@bar.com"]:
                                continue

                            # Store unique occurrence per file? Or just all? 
                            # User asked for "all emails and timestamps".
                            found_emails.append({
                                "timestamp": timestamp,
                                "email": email,
                                "source": filepath
                            })
                        except:
                            continue
            except Exception as e:
                # print(f"Skipping {filepath}: {e}")
                pass

# Sort by timestamp
found_emails.sort(key=lambda x: x["timestamp"])

# Deduplicate by (email, roughly same time)? 
# Or just list them all. User asked for "all".
# Let's simple deduplicate by email string to find the *first* occurrence of each unique email?
# "Give me all the emails and timestamps you found from oldest to newest"
# This might mean instances. I will provide a list of unique emails with their *first* seen timestamp, 
# and maybe a full list if requested.
# Let's print all unique (time, email) pairs, maybe grouping by close timestamps.

print(f"Found {len(found_emails)} potential matches.")
print("-" * 60)
print(f"{'TIMESTAMP':<20} | {'EMAIL':<30} | {'SOURCE'}")
print("-" * 60)

seen_entries = set()

for entry in found_emails:
    ts = entry["timestamp"]
    dt = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
    email = entry["email"]
    src = os.path.basename(entry["source"])
    
    # aggressive filtering of junk that regex might pass
    # Common junk in binaries: "s@S.s", "a@b.c"
    if len(email.split('@')[0]) < 2: continue
    if len(email.split('@')[1]) < 4: continue # "a.co" minimum
    
    # Deduplicate exact same output lines
    key = (dt, email, src)
    if key in seen_entries:
        continue
    seen_entries.add(key)
    
    print(f"{dt:<20} | {email:<30} | {src}")
