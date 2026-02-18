import json
import os
import re

def clean_and_convert(raw_file, output_file):
    print(f"Cleaning {raw_file}...")
    try:
        with open(raw_file, 'rb') as f:
            content = f.read()
        
        # Try to fix the mangled bytes if it was UTF-8 interpreted as Latin-1 then saved as UTF-16
        # Let's try to just get the text and replace the bad sequences
        for enc in ['utf-16', 'utf-8-sig', 'utf-8']:
            try:
                text = content.decode(enc)
                print(f"  Decoded with {enc}")
                break
            except:
                continue
        else:
            print("  Failed to decode.")
            return

        # Replace the specific mangled sequences found:
        # ?\x80\x9c -> "
        # ?\x80\x9d -> "
        text = text.replace('?\u0080\u009c', '"').replace('?\u0080\u009d', '"')
        text = text.replace('?\u0080\u0098', "'").replace('?\u0080\u0099', "'")
        # Also handle potential single characters
        text = text.replace('\u201c', '"').replace('\u201d', '"').replace('\u2018', "'").replace('\u2019', "'")
        
        # Regex to find and fix JSON delimiters if they are broken
        # Sometimes there's a missing quote before a comma/newline
        # text = re.sub(r'([^\\])"\s*\n', r'\1",\n', text)
        
        try:
            raw_data = json.loads(text, strict=False)
        except json.JSONDecodeError as e:
            print(f"  Initial JSON load failed: {e}")
            # Try more aggressive cleaning: replace ALL non-ascii control chars
            text = "".join(c for i, c in enumerate(text) if ord(c) < 128 or c in '\u00a0\u201c\u201d\u2018\u2019')
            try:
                raw_data = json.loads(text, strict=False)
            except Exception as e2:
                print(f"  Final JSON load failed: {e2}")
                # Last resort: try to extract with regex
                raw_data = {}
                # This is a very rough regex for the specific structure
                # "Book": { "Chapter": { "Verse": "Content" } }
                # Let's try to find book sections
                return

        # Conversion logic (copy-pasted from before)
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

        data_to_use = raw_data.get('books', raw_data)
        converted_data = []
        for book_name in book_order:
            if book_name in data_to_use:
                book_obj = data_to_use[book_name]
                chapters_array = []
                # Ensure keys are numeric
                keys = [k for k in book_obj.keys() if k.isdigit()]
                sorted_chapters = sorted(keys, key=int)
                for ch_num in sorted_chapters:
                    chapter_obj = book_obj[ch_num]
                    verses_array = []
                    v_keys = [k for k in chapter_obj.keys() if k.isdigit()]
                    sorted_verses = sorted(v_keys, key=int)
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
            print(f"  Saved {output_file}")
        else:
            print("  No data converted.")

    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    clean_and_convert('data/niv_raw.json', 'data/bible_en_niv.json')
    clean_and_convert('data/nlt_raw.json', 'data/bible_en_nlt.json')
    clean_and_convert('data/esv_raw.json', 'data/bible_en_esv.json')
