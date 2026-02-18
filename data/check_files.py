import os
import json

data_dir = r"E:\Antigravity\bible\data"
files = os.listdir(data_dir)
print("Files in data directory:")
for f in files:
    try:
        print(f"{f} - {os.path.getsize(os.path.join(data_dir, f))} bytes")
    except:
        print(f"Could not print filename {repr(f)}")

# Check bible_ko.json for conflicts
ko_path = os.path.join(data_dir, "bible_ko.json")
if os.path.exists(ko_path):
    with open(ko_path, 'r', encoding='utf-8') as f:
        head = f.read(100)
        print(f"bible_ko.json head: {repr(head)}")
