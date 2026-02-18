import json
import os

def convert_bible(raw_file, output_file, book_mapping):
    try:
        with open(raw_file, 'r', encoding='utf-8-sig') as f:
            raw_data = json.load(f, strict=False)
    except (UnicodeDecodeError, json.JSONDecodeError):
        with open(raw_file, 'r', encoding='utf-16') as f:
            raw_data = json.load(f, strict=False)
    
    # Standard book order to ensure consistency
    # (Based on common Protestant Bible order)
    book_order = [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", 
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", 
        "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", 
        "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", 
        "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
        "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", 
        "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
    ]

    # Map for standardized abbreviations used in the app
    abbrev_map = {
        "Genesis": "gn", "Exodus": "ex", "Leviticus": "lv", "Numbers": "nm", "Deuteronomy": "dt",
        "Joshua": "js", "Judges": "jg", "Ruth": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
        "1 Kings": "1ki", "2 Kings": "2ki", "1 Chronicles": "1ch", "2 Chronicles": "2ch",
        "Ezra": "ez", "Nehemiah": "nh", "Esther": "et", "Job": "jb", "Psalms": "ps",
        "Proverbs": "pr", "Ecclesiastes": "ec", "Song of Solomon": "sn", "Isaiah": "is",
        "Jeremiah": "jr", "Lamentations": "lm", "Ezekiel": "ezk", "Daniel": "dn",
        "Hosea": "ho", "Joel": "jl", "Amos": "am", "Obadiah": "ob", "Jonah": "jn",
        "Micah": "mi", "Nahum": "na", "Habakkuk": "hk", "Zephaniah": "zp", "Haggai": "hg",
        "Zechariah": "zc", "Malachi": "ml", "Matthew": "mt", "Mark": "mk", "Luke": "lk",
        "John": "jn", "Acts": "ac", "Romans": "rm", "1 Corinthians": "1co", "2 Corinthians": "2co",
        "Galatians": "gl", "Ephesians": "ep", "Philippians": "ph", "Colossians": "cl",
        "1 Thessalonians": "1th", "2 Thessalonians": "2th", "1 Timothy": "1ti", "2 Timothy": "2ti",
        "Titus": "tt", "Philemon": "pm", "Hebrews": "hb", "James": "js", "1 Peter": "1pt",
        "2 Peter": "2pt", "1 John": "1jn", "2 John": "2jn", "3 John": "3jn", "Jude": "jd",
        "Revelation": "rv"
    }

    converted_data = []

    for book_name in book_order:
        if book_name in raw_data:
            book_obj = raw_data[book_name]
            chapters_array = []
            
            # Sort chapters numerically
            sorted_chapters = sorted(book_obj.keys(), key=int)
            for ch_num in sorted_chapters:
                chapter_obj = book_obj[ch_num]
                verses_array = []
                
                # Sort verses numerically
                sorted_verses = sorted(chapter_obj.keys(), key=int)
                for v_num in sorted_verses:
                    verses_array.append(chapter_obj[v_num])
                
                chapters_array.append(verses_array)
            
            converted_data.append({
                "abbrev": abbrev_map.get(book_name, book_name.lower()[:2]),
                "chapters": chapters_array,
                "name": book_name
            })
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(converted_data, f, ensure_ascii=False)
    print(f"Converted {raw_file} to {output_file}")

if __name__ == "__main__":
    # For now, we use a manual mapping since the downloaded mapping is complex
    # Mapping for English versions in this repo is usually consistent with canonical names
    
    versions = [
        ('data/niv_raw.json', 'data/bible_en_niv.json'),
        ('data/nlt_raw.json', 'data/bible_en_nlt.json'),
        ('data/esv_raw.json', 'data/bible_en_esv.json')
    ]
    
    for raw, out in versions:
        if os.path.exists(raw):
            convert_bible(raw, out, {})
        else:
            print(f"File not found: {raw}")
