import os
import json

def ultimate_fix(file_path):
    if not os.path.exists(file_path):
        return

    print(f"Applying ultimate fix to {file_path}...")
    
    text_replacements = {
        '?쏬': '"', '??': '"', '?셲': "'s", '?봳': '--', '?쁚': "'", '?쇺': "'",
        '?쁔': 'T', '?쁓': 'S', '?쏞': 'C', '?쏦': 'H', '?쏽': 'Y', '?쏮': 'M',
        '?쏯': 'N', '?쏰': 'O', '?쏱': 'P', '?쐂': 'd', '?쐍': 'n', '?쐓': 's',
        '?쐋': 'l', '?쐅': 'f', '?쐆': 'g', '?쐔': 't', '?쐕': 'u', '?쏝': 'B',
        '?쏡': 'D', '?쏻': 'W', '?쏧': 'I', '?쐏': 'o', '?쐃': 'e', '?쐀': 'a',
        '?쐇': 'h', '?쐄': 'e', '곊': ' ', '봳': '--', '셲': "'s", '쏬': '"',
        '쁚': "'", '쇺': "'", '붴': '',
        '?쁈': 'I', # From screenshot: ?쁈 love -> I love
        '?쁙': 'A', # Potential capital A variation
        '?쏢': 'E', # Potential capital E variation
        '?쁗': 'R', # Potential capital R variation
        '쁈': 'I',
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
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            data = json.load(f)
        fixed_data = recursive_fix(data)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(fixed_data, f, ensure_ascii=False)
        print(f"Successfully fixed {file_path}")
    except Exception as e:
        print(f"Failed: {e}")

data_dir = r"e:\Antigravity\bible\data"
for f in ["bible_en_niv.json", "bible_en_nlt.json", "bible_en_esv.json"]:
    ultimate_fix(os.path.join(data_dir, f))
