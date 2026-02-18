import os
import json

def fix_encoding_issues(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Processing {file_path}...")
    
    try:
        # Read with utf-8-sig to handle BOM if present, otherwise ignore errors
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        
        # Mapping based on the observed corrupted strings
        # Most of these come from smart quotes/dashes being interpreted-as/converted-to weird Korean syllables
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
            '?쏯': 'N',
            '?쐏': 'o',
            '?쐃': 'e',
            '?쐀': 'a',
            '?쐃': 'e',
            '?쐇': 'h',
            '?쐄': 'e',
            '?쏯': 'N',
            '곊': ' ', # Another common corruption char
            '봳': '--',
            '셲': "'s",
            '쏬': '"',
            '쁚': "'",
            '쇺': "'",
        }
        
        original_len = len(text)
        for old, new in text_replacements.items():
            text = text.replace(old, new)
            
        # Fix potentially broken JSON structure if replacements touched keys
        # But here it's mostly verse content
            
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(text)
        print(f"Successfully processed {file_path}")
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

# Target files
data_dir = r"e:\Antigravity\bible\data"
files_to_fix = [
    "bible_en_niv.json",
    "bible_en_nlt.json",
    "bible_en_esv.json",
    "bible_en_kjv.json"
]

for filename in files_to_fix:
    fix_encoding_issues(os.path.join(data_dir, filename))
