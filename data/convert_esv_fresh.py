
import json
import re
import os

DATA_DIR = r"E:\Antigravity\bible\data"
RAW_FILE = f"{DATA_DIR}/esv_raw.json"
TARGET_FILE = f"{DATA_DIR}/bible_en_esv.json"

BIBLE_BOOKS = [
    {"abbrev": "gn", "name": "Genesis"}, {"abbrev": "ex", "name": "Exodus"}, 
    {"abbrev": "lv", "name": "Leviticus"}, {"abbrev": "nm", "name": "Numbers"}, 
    {"abbrev": "dt", "name": "Deuteronomy"}, {"abbrev": "js", "name": "Joshua"}, 
    {"abbrev": "jud", "name": "Judges"}, {"abbrev": "rt", "name": "Ruth"}, 
    {"abbrev": "1sm", "name": "1 Samuel"}, {"abbrev": "2sm", "name": "2 Samuel"}, 
    {"abbrev": "1kgs", "name": "1 Kings"}, {"abbrev": "2kgs", "name": "2 Kings"}, 
    {"abbrev": "1ch", "name": "1 Chronicles"}, {"abbrev": "2ch", "name": "2 Chronicles"}, 
    {"abbrev": "ezr", "name": "Ezra"}, {"abbrev": "ne", "name": "Nehemiah"}, 
    {"abbrev": "et", "name": "Esther"}, {"abbrev": "job", "name": "Job"}, 
    {"abbrev": "ps", "name": "Psalms"}, {"abbrev": "prv", "name": "Proverbs"}, 
    {"abbrev": "ec", "name": "Ecclesiastes"}, {"abbrev": "so", "name": "Song of Solomon"}, 
    {"abbrev": "is", "name": "Isaiah"}, {"abbrev": "jr", "name": "Jeremiah"}, 
    {"abbrev": "lm", "name": "Lamentations"}, {"abbrev": "ez", "name": "Ezekiel"}, 
    {"abbrev": "dn", "name": "Daniel"}, {"abbrev": "ho", "name": "Hosea"}, 
    {"abbrev": "jl", "name": "Joel"}, {"abbrev": "am", "name": "Amos"}, 
    {"abbrev": "ob", "name": "Obadiah"}, {"abbrev": "jn", "name": "Jonah"}, 
    {"abbrev": "mi", "name": "Micah"}, {"abbrev": "na", "name": "Nahum"}, 
    {"abbrev": "hk", "name": "Habakkuk"}, {"abbrev": "zp", "name": "Zephaniah"}, 
    {"abbrev": "hg", "name": "Haggai"}, {"abbrev": "zc", "name": "Zechariah"}, 
    {"abbrev": "ml", "name": "Malachi"}, 
    {"abbrev": "mt", "name": "Matthew"}, {"abbrev": "mk", "name": "Mark"}, 
    {"abbrev": "lk", "name": "Luke"}, {"abbrev": "jo", "name": "John"}, 
    {"abbrev": "act", "name": "Acts"}, {"abbrev": "rm", "name": "Romans"}, 
    {"abbrev": "1co", "name": "1 Corinthians"}, {"abbrev": "2co", "name": "2 Corinthians"}, 
    {"abbrev": "gl", "name": "Galatians"}, {"abbrev": "eph", "name": "Ephesians"}, 
    {"abbrev": "ph", "name": "Philippians"}, {"abbrev": "cl", "name": "Colossians"}, 
    {"abbrev": "1ts", "name": "1 Thessalonians"}, {"abbrev": "2ts", "name": "2 Thessalonians"}, 
    {"abbrev": "1tm", "name": "1 Timothy"}, {"abbrev": "2tm", "name": "2 Timothy"}, 
    {"abbrev": "tt", "name": "Titus"}, {"abbrev": "phm", "name": "Philemon"}, 
    {"abbrev": "hb", "name": "Hebrews"}, {"abbrev": "jm", "name": "James"}, 
    {"abbrev": "1pe", "name": "1 Peter"}, {"abbrev": "2pe", "name": "2 Peter"}, 
    {"abbrev": "1jo", "name": "1 John"}, {"abbrev": "2jo", "name": "2 John"}, 
    {"abbrev": "3jo", "name": "3 John"}, {"abbrev": "jd", "name": "Jude"}, 
    {"abbrev": "re", "name": "Revelation"}
]

def clean_text(text):
    if not text: return ""
    text = text.replace('\xa0', ' ')
    
    # 1. Closing Quotes
    # Only if ?? NOT at the very end of line (because we fix JSON structure separately)
    # But here text comes from JSON value, so structure is already handled.
    text = text.replace('??', '"') 

    # 2. Single Question Mark
    text = re.sub(r'^\?([a-zA-Z])', r'"\1', text)
    text = re.sub(r' \?([a-zA-Z])', r' "\1', text)
    text = re.sub(r'([a-zA-Z])\?([a-zA-Z])', r'\1—\2', text)
    text = text.replace('?', '"')
    
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def convert_esv():
    print(f"Reading {RAW_FILE}...")
    try:
        with open(RAW_FILE, 'r', encoding='utf-16') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # Replace all ?? with "
    content = content.replace('??', '"')

    # Ensure verse lines end with comma
    # Pattern looks like: "number": "text"
    # We want to ensure it ends with "text",
    # Regex: Find lines ending with " but not ",
    content = re.sub(r'(:\s*".*?")\s*\n', r'\1,\n', content)

    # Now remove trailing commas before closing braces
    # Pattern: , \n } -> \n }
    content = re.sub(r',\s*\n\s*}', r'\n}', content)
    # Also handle nested closing: , \n } \n } -> ...
    # This might need repetition or recursive regex, but standard json usually has standard indentation.
    # Let's do it twice just in case
    content = re.sub(r',\s*\n\s*}', r'\n}', content)

    # Aggressive control char removal: Keep only printable ASCII + Newline/Tab
    # This removes all "smart quotes" that are corrupted and other garbage.
    content = "".join(ch for ch in content if (32 <= ord(ch) <= 126) or ch in '\n\r\t')

    # Check for other trailing comma issues
    content = content.replace(',,', ',')

    try:
        raw_data = json.loads(content, strict=False)
        print("JSON Parsed Successfully!")
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        lines = content.split('\n')
        start = max(0, e.lineno - 5)
        end = min(len(lines), e.lineno + 5)
        for i in range(start, end):
             print(f"{i+1}: {lines[i]}")
        return

    final_books = []
    
    print("Converting structure...")
    for b_meta in BIBLE_BOOKS:
        b_name = b_meta["name"]
        
        target_key = None
        if b_name in raw_data: target_key = b_name
        elif b_name + "s" in raw_data: target_key = b_name + "s"
        elif b_name[:-1] in raw_data: target_key = b_name[:-1]
        elif b_name == "Song of Solomon" and "Song of Songs" in raw_data: target_key = "Song of Songs"

        if not target_key: continue
            
        chapters_data = raw_data[target_key]
        chap_nums = sorted([int(k) for k in chapters_data.keys()])
        chapters_list = []
        
        for ch_num in chap_nums:
            if str(ch_num) not in chapters_data: continue
            verses_data = chapters_data[str(ch_num)]
            v_nums = sorted([int(k) for k in verses_data.keys()])
            verses_list = []
            
            for v_num in v_nums:
                text = clean_text(verses_data[str(v_num)])
                verses_list.append(text)
            
            chapters_list.append(verses_list)
            
        final_books.append({
            "book": b_name,
            "abbrev": b_meta["abbrev"],
            "chapters": chapters_list
        })

    print(f"Writing {len(final_books)} books to {TARGET_FILE}...")
    with open(TARGET_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_books, f, ensure_ascii=False)
    
    print("Done.")

if __name__ == "__main__":
    convert_esv()
