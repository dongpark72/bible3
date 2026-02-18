import os

data_dir = r"E:\Antigravity\bible\data"
files = os.listdir(data_dir)
for f in files:
    if f.endswith(".json") and "" in f:
        print(f"Found file with unusual characters: {repr(f)}")
        path = os.path.join(data_dir, f)
        # Try different encodings
        for enc in ['utf-8', 'euc-kr', 'cp949']:
            try:
                with open(path, 'r', encoding=enc) as file:
                    content = file.read(100)
                    print(f"  Encoding {enc}: {content[:50]}...")
            except Exception as e:
                print(f"  Encoding {enc} failed: {e}")
