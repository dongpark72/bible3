import json
import os

def fix_and_convert(raw_file, output_file):
    print(f"Fixing {raw_file}...")
    try:
        # Read as bytes to avoid encoding issues
        with open(raw_file, 'rb') as f:
            content = f.read()
        
        # Try to decode with common encodings
        for enc in ['utf-8-sig', 'utf-16', 'cp949', 'latin-1']:
            try:
                text = content.decode(enc)
                print(f"  Successfully decoded with {enc}")
                break
            except UnicodeDecodeError:
                continue
        else:
            print(f"  Failed to decode {raw_file}")
            return

        # Replace smart quotes and other potential issues
        text = text.replace('?', '"').replace('?', '"').replace('??', '"')
        # Sometimes smart quotes are individual characters
        text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")
        
        # Try to parse JSON
        try:
            raw_data = json.loads(text, strict=False)
        except json.JSONDecodeError as e:
            print(f"  JSON error: {e}")
            # Try to fix missing commas or other common issues if possible
            # But let's try a simpler fix first: just filter out non-printable chars?
            import re
            # Remove control characters except tab, newline, return
            text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
            try:
                raw_data = json.loads(text, strict=False)
            except:
                print("  Still failed to parse JSON after cleaning.")
                return

        # Same conversion logic as in convert_bible.py
        book_order = [
            "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", 
            "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", 
            "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", 
            "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", 
            "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
            "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", 
            "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
        ]
        
        abbrev_map = {
            "Genesis": "gn", "Exodus": "ex", "Leviticus": "lv", "Numbers": "nm", "Deuteronomy": "dt",
            "Joshua": "js", "Judges": "jud", "Ruth": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
            "1 Kings": "1kgs", "2 Kings": "2kgs", "1 Chronicles": "1ch", "2 Chronicles": "2ch",
            "Ezra": "ezr", "Nehemiah": "ne", "Esther": "et", "Job": "job", "Psalms": "ps",
            "Proverbs": "prv", "Ecclesiastes": "ec", "Song of Solomon": "so", "Isaiah": "is",
            "Jeremiah": "jr", "Lamentations": "lm", "Ezekiel": "ez", "Daniel": "dn",
            "Hosea": "ho", "Joel": "jl", "Amos": "am", "Obadiah": "ob", "Jonah": "jn",
            "Micah": "mi", "Nahum": "na", "Habakkuk": "hk", "Zephaniah": "zp", "Haggai": "hg",
            "Zechariah": "zc", "Malachi": "ml", "Matthew": "mt", "Mark": "mk", "Luke": "lk",
            "John": "jo", "Acts": "act", "Romans": "rm", "1 Corinthians": "1co", "2 Corinthians": "2co",
            "Galatians": "gl", "Ephesians": "eph", "Philippians": "ph", "Colossians": "cl",
            "1 Thessalonians": "1ts", "2 Thessalonians": "2ts", "1 Timothy": "1tm", "2 Timothy": "2tm",
            "Titus": "tt", "Philemon": "phm", "Hebrews": "hb", "James": "jm", "1 Peter": "1pe",
            "2 Peter": "2pe", "1 John": "1jo", "2 John": "2jo", "3 John": "3jo", "Jude": "jd",
            "Revelation": "re"
        }

        # Handle different raw structures (some might have "books" key, some might follow book_order directly)
        data_to_use = raw_data.get('books', raw_data) if isinstance(raw_data, dict) else raw_data

        converted_data = []
        for book_name in book_order:
            if book_name in data_to_use:
                book_obj = data_to_use[book_name]
                chapters_array = []
                sorted_chapters = sorted(book_obj.keys(), key=int)
                for ch_num in sorted_chapters:
                    chapter_obj = book_obj[ch_num]
                    verses_array = []
                    sorted_verses = sorted(chapter_obj.keys(), key=int)
                    for v_num in sorted_verses:
                        verses_array.append(chapter_obj[v_num])
                    chapters_array.append(verses_array)
                
                converted_data.append({
                    "abbrev": abbrev_map.get(book_name, book_name.lower()[:2]),
                    "chapters": chapters_array,
                    "name": book_name
                })
        
        if converted_data:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(converted_data, f, ensure_ascii=False)
            print(f"  Successfully saved {output_file}")
        else:
            print(f"  No books found in {raw_file}")

    except Exception as e:
        print(f"  Error processing {raw_file}: {e}")

if __name__ == "__main__":
    fix_and_convert('data/niv_raw.json', 'data/bible_en_niv.json')
    fix_and_convert('data/nlt_raw.json', 'data/bible_en_nlt.json')
    fix_and_convert('data/esv_raw.json', 'data/bible_en_esv.json')
