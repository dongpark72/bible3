import json
import re

# Mapping of Korean short names in bible.json to app's English abbreviations
# Order is important (66 books of the Bible)
KOR_TO_ENG = [
    ("창", "gn"), ("출", "ex"), ("레", "lv"), ("민", "nm"), ("신", "dt"),
    ("수", "js"), ("삿", "jud"), ("룻", "rt"), ("삼상", "1sm"), ("삼하", "2sm"),
    ("왕상", "1kgs"), ("왕하", "2kgs"), ("대상", "1ch"), ("대하", "2ch"), ("스", "ezr"),
    ("느", "ne"), ("에", "et"), ("욥", "job"), ("시", "ps"), ("잠", "prv"),
    ("전", "ec"), ("아", "so"), ("사", "is"), ("렘", "jr"), ("애", "lm"),
    ("겔", "ez"), ("단", "dn"), ("호", "ho"), ("욜", "jl"), ("암", "am"),
    ("옵", "ob"), ("욘", "jn"), ("미", "mi"), ("나", "na"), ("하", "hk"),
    ("습", "zp"), ("학", "hg"), ("슥", "zc"), ("말", "ml"), ("마", "mt"),
    ("막", "mk"), ("눅", "lk"), ("요", "jo"), ("행", "act"), ("롬", "rm"),
    ("고전", "1co"), ("고후", "2co"), ("갈", "gl"), ("엡", "eph"), ("빌", "ph"),
    ("골", "cl"), ("살전", "1ts"), ("살후", "2ts"), ("딤전", "1tm"), ("딤후", "2tm"),
    ("딛", "tt"), ("몬", "phm"), ("히", "hb"), ("약", "jm"), ("벧전", "1pe"),
    ("벧후", "2pe"), ("요일", "1jo"), ("요이", "2jo"), ("요삼", "3jo"), ("유", "jd"),
    ("계", "re")
]

def convert():
    print("Loading bible.json...")
    with open('bible.json', 'r', encoding='utf-8') as f:
        new_data = json.load(f)

    result = []
    
    # regex to match "창1:1" or "삼상1:1" or "요일1:1"
    # Matches non-digits, followed by digits, colon, and digits
    pattern = re.compile(r'^([^\d]+)(\d+):(\d+)$')

    for kor_name, eng_name in KOR_TO_ENG:
        print(f"Processing {kor_name} ({eng_name})...")
        book_data = {"abbrev": eng_name, "chapters": []}
        
        # Collect all verses for this book
        verses_by_chapter = {}
        
        for key, text in new_data.items():
            match = pattern.match(key)
            if match:
                k_name, chap_str, verse_str = match.groups()
                if k_name == kor_name:
                    chap_idx = int(chap_str) - 1
                    verse_idx = int(verse_str) - 1
                    
                    if chap_idx not in verses_by_chapter:
                        verses_by_chapter[chap_idx] = {}
                    
                    # Store the verse text, cleaning leading/trailing whitespace
                    verses_by_chapter[chap_idx][verse_idx] = text.strip()
        
        # Sort chapters and verses to ensure order
        sorted_chapters = sorted(verses_by_chapter.keys())
        if not sorted_chapters:
            print(f"Warning: No data found for {kor_name}")
            # Even if empty, we should probably add it as an empty chapters list
            # but usually there should be 66 books.
        
        for c_idx in sorted_chapters:
            chapter_verses = verses_by_chapter[c_idx]
            sorted_verses_keys = sorted(chapter_verses.keys())
            
            # Create a list for the chapter, filling gaps if any
            if sorted_verses_keys:
                max_v = max(sorted_verses_keys)
                verse_list = [""] * (max_v + 1)
                for v_idx in sorted_verses_keys:
                    verse_list[v_idx] = chapter_verses[v_idx]
                book_data["chapters"].append(verse_list)
        
        result.append(book_data)

    print(f"Writing {len(result)} books to data/bible_ko.json...")
    with open('data/bible_ko.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print("Conversion complete!")

if __name__ == "__main__":
    convert()
