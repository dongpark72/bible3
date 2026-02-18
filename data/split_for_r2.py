import json
import os

def split_bible_into_books(input_file, output_base_dir):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    version = os.path.basename(input_file).replace('bible_', '').replace('.json', '')
    version_dir = os.path.join(output_base_dir, version)
    os.makedirs(version_dir, exist_ok=True)
    
    metadata = []
    for book_data in data:
        abbrev = book_data.get('abbrev', book_data.get('book', 'unknown')).lower()
        metadata.append({
            "book": book_data['book'],
            "abbrev": abbrev,
            "chapterCount": len(book_data['chapters'])
        })
        output_file = os.path.join(version_dir, f"{abbrev}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(book_data, f, ensure_ascii=False, indent=2)
    
    # Save metadata for this version
    with open(os.path.join(version_dir, "metadata.json"), 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"Split {input_file} into {len(data)} books and created metadata.json in {version_dir}")

def main():
    base_path = r'E:\Antigravity\debian\bible\data'
    target_path = r'E:\Antigravity\debian\bible\data\r2'
    
    bibles = ['bible_ko.json', 'bible_en_esv.json', 'bible_en_niv.json', 'bible_en_nlt.json']
    
    for bible in bibles:
        input_file = os.path.join(base_path, bible)
        if os.path.exists(input_file):
            split_bible_into_books(input_file, target_path)

if __name__ == "__main__":
    main()
