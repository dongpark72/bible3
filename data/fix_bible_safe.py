import os
import json

def safe_fix_v2(file_path):
    if not os.path.exists(file_path):
        return

    print(f"Processing {file_path} safely...")
    
    # Text replacements to apply to each verse string
    text_replacements = {
        '?쏬': '"',
        '??': '"',
        '?셲': "'s",
        '?봳': '--',
        '?쁚': "'",
        '?쇺': "'",
        '?쁔': 'T',
        '?쁓': 'S',
        '?쏞': 'C',
        '?쏦': 'H',
        '?쏽': 'Y',
        '?쏮': 'M',
        '?쏯': 'N',
        '?쏰': 'O',
        '?쏱': 'P',
        '?쐂': 'd',
        '?쐍': 'n',
        '?쐓': 's',
        '?쐋': 'l',
        '?쐅': 'f',
        '?쐆': 'g',
        '?쐔': 't',
        '?쐕': 'u',
        '?쏝': 'B',
        '?쏡': 'D',
        '?쏻': 'W',
        '?쏧': 'I',
        '?쐏': 'o',
        '?쐃': 'e',
        '?쐀': 'a',
        '?쐇': 'h',
        '?쐄': 'e',
        '곊': ' ',
        '봳': '--',
        '셲': "'s",
        '쏬': '"',
        '쁚': "'",
        '쇺': "'",
        '붴': '', # Weird char at end of verse
    }

    def recursive_fix(obj):
        if isinstance(obj, str):
            res = obj
            for old, new in text_replacements.items():
                res = res.replace(old, new)
            return res
        elif isinstance(obj, list):
            return [recursive_fix(item) for item in obj]
        elif isinstance(obj, dict):
            return {k: recursive_fix(v) for k, v in obj.items()}
        return obj

    try:
        # Load the original file (now reverted via git)
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
        
        # Apply fix only to strings inside the structure
        fixed_data = recursive_fix(data)
        
        # Save back as clean JSON
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(fixed_data, f, ensure_ascii=False)
            
        print(f"Successfully fixed {file_path}")
    except Exception as e:
        print(f"Failed to process {file_path}: {e}")

data_dir = r"e:\Antigravity\bible\data"
files = ["bible_en_niv.json", "bible_en_nlt.json", "bible_en_esv.json", "bible_en_kjv.json"]

for f in files:
    safe_fix_v2(os.path.join(data_dir, f))
