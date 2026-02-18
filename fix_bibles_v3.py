import json
import os
import re

def robust_extract(raw_file, output_file):
    print(f"Extracting from {raw_file}...")
    try:
        with open(raw_file, 'rb') as f:
            content = f.read()
        
        for enc in ['utf-16', 'utf-8-sig', 'utf-8']:
            try:
                text = content.decode(enc)
                print(f"  Decoded with {enc}")
                break
            except:
                continue
        else:
            return

        # Use regex to find books, chapters, and verses
        # Structure: "BookName": { "1": { "1": "...", "2": "..." } }
        
        # 1. Find all book blocks
        # This is tricky because JSON is nested. 
        # But we know the book names.
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

        result_data = []
        
        for i, book_name in enumerate(book_order):
            # Find the section for this book
            # Start after "BookName": {
            # End before the next book name or the end of the file
            start_marker = f'"{book_name}":'
            start_idx = text.find(start_marker)
            if start_idx == -1:
                continue
            
            end_idx = len(text)
            if i + 1 < len(book_order):
                next_marker = f'"{book_order[i+1]}":'
                end_idx = text.find(next_marker, start_idx)
                if end_idx == -1: end_idx = len(text)
            
            book_text = text[start_idx:end_idx]
            
            # Now find chapters in this book
            # "Chapter": {
            chapters = {}
            chapter_matches = list(re.finditer(r'"(\d+)":\s*\{', book_text))
            for j, m in enumerate(chapter_matches):
                chap_num = int(m.group(1))
                c_start = m.end()
                c_end = len(book_text)
                if j + 1 < len(chapter_matches):
                    c_end = chapter_matches[j+1].start()
                
                chap_text = book_text[c_start:c_end]
                
                # Now find verses in this chapter
                # "Verse": "Content"
                # This is where the mangled quotes are!
                # We'll match "Number": "[anything but quote possibly followed by mangled mark]
                verses = {}
                # Match "1": "Content"
                # We use a non-greedy match for the content until the next verse or end of chapter
                # But we need to handle the mangled quotes at the end.
                verse_matches = re.finditer(r'"(\d+)":\s*"([^"]*)', chap_text)
                for vm in verse_matches:
                    v_num = int(vm.group(1))
                    v_content = vm.group(2).strip()
                    # Clean up the end of content if it has mangled chars like ??
                    v_content = re.sub(r'[\?]+$', '', v_content)
                    verses[v_num] = v_content
                
                if verses:
                    # Convert dict to list
                    max_v = max(verses.keys())
                    v_list = [""] * max_v
                    for k, v in verses.items():
                        v_list[k-1] = v
                    chapters[chap_num] = v_list
            
            if chapters:
                # Convert dict to list
                max_c = max(chapters.keys())
                c_list = [[]] * max_c
                for k, v in chapters.items():
                    c_list[k-1] = v
                
                result_data.append({
                    "abbrev": abbrev_map.get(book_name, book_name.lower()[:2]),
                    "chapters": c_list,
                    "name": book_name
                })
        
        if result_data:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result_data, f, ensure_ascii=False)
            print(f"  Saved {len(result_data)} books to {output_file}")
        else:
            print("  No data found.")

    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    robust_extract('data/niv_raw.json', 'data/bible_en_niv.json')
    robust_extract('data/nlt_raw.json', 'data/bible_en_nlt.json')
    robust_extract('data/esv_raw.json', 'data/bible_en_esv.json')
