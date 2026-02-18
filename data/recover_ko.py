import os

def fix_bible_ko():
    path = r"E:\Antigravity\bible\data\bible_ko.json"
    temp_path = path + ".tmp"
    
    # 여러 인코딩 시도
    encodings = ['utf-8', 'cp949', 'euc-kr']
    content = None
    
    for enc in encodings:
        try:
            with open(path, 'r', encoding=enc) as f:
                lines = f.readlines()
            # 충돌 마커 사이의 내용 추출 (HEAD 부분 선택)
            # Line 1: <<<<<<< HEAD
            # Line 2: [데이터]
            # Line 3: =======
            # 그 다음은 무시
            if "<<<<<<< HEAD" in lines[0]:
                data_line = lines[1]
                # 간단한 검증: JSON 시작인 '['가 있는지 확인
                if data_line.strip().startswith('['):
                    content = data_line
                    print(f"Successfully extracted data using {enc} encoding.")
                    break
        except Exception as e:
            continue

    if content:
        # UTF-8로 저장
        try:
            import json
            # JSON 유효성 검사 및 정렬 저장
            data = json.loads(content)
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print("Successfully recovered and formatted bible_ko.json as UTF-8.")
            return True
        except Exception as e:
            print(f"Error during JSON processing: {e}")
            # 단순 파일 쓰기 시도
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    else:
        print("Failed to recover data from bible_ko.json.")
        return False

fix_bible_ko()
