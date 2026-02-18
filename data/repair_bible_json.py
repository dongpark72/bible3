import os
import re

def repair_json_content(file_path):
    if not os.path.exists(file_path):
        return

    print(f"Repairing {file_path}...")
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 1. First, let's fix the broken quote patterns that destroy JSON structure
    # Patterns like: said, "et -> said, 'Let
    # The previous script replaced ?쏬 with " which was fatal inside a JSON string
    
    # Let's revert back and use single quotes for internal speech
    # Or properly escape them. In JSON, internal quotes MUST be \" 
    
    content = content.replace('", "', 'TEMP_SEP') # Preserve actual JSON separators
    
    # Observed problematic sequence: said, "et -> should be said, \"Let
    # Let's fix the most common ones that look like start/end of speech
    replacements = [
        ('?쏬', '\\"'), # Opening smart quote -> Escaped quote
        ('??', '\\"'), # Closing smart quote -> Escaped quote
        ('?셲', "'s"),
        ('?봳', "--"),
        ('?쁚', "'"),
        ('?쇺', "'"),
        ('?쁔', 'T'),
        ('?쁓', 'S'),
        ('?쏞', 'C'),
        ('?쏦', 'H'),
        ('?쏽', 'Y'),
        ('?쏮', 'M'),
        ('?쏯', 'N'),
        ('?쏰', 'O'),
        ('?쏱', 'P'),
        ('?쐂', 'd'),
        ('?쐍', 'n'),
        ('?쐓', 's'),
        ('?쐋', 'l'),
        ('?쐅', 'f'),
        ('?쐆', 'g'),
        ('?쐔', 't'),
        ('?쐕', 'u'),
        ('?쏝', 'B'),
        ('?쏡', 'D'),
        ('?쏻', 'W'),
        ('?쏧', 'I'),
        ('?쐏', 'o'),
        ('?쐃', 'e'),
        ('?쐀', 'a'),
        ('?쐇', 'h'),
        ('?쐄', 'e'),
         # Re-fix the mess from the previous run
        ('said, "e', 'said, \\"Le'), 
        ('called "i', 'called \\"N'),
        ('says, "e', 'says, \\"Le'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    # Aggressive fix for unescaped quotes between words
    # Find quotes preceded or followed by letters (illegal in JSON unless escaped)
    content = re.sub(r'(?<=[a-zA-Z])"(?=[a-zA-Z ])', '\\"', content)
    content = re.sub(r'(?<=[ ,])"(?=[a-zA-Z])', '\\"', content)

    with open(file_path, 'w', encoding='utf-8', newline='') as f:
        f.write(content)
        
    # Verify
    try:
        import json
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"Successfully repaired {file_path}")
    except Exception as e:
        print(f"Still failing {file_path}: {e}")

data_dir = r"e:\Antigravity\bible\data"
files = ["bible_en_niv.json", "bible_en_nlt.json", "bible_en_esv.json", "bible_en_kjv.json"]

for f in files:
    repair_json_content(os.path.join(data_dir, f))
