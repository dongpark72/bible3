import os

path = r"E:\Antigravity\bible\data\bible_ko.json"
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f):
        if "<<<<<<< HEAD" in line or "=======" in line or ">>>>>>>" in line:
            print(f"Line {i+1}: {line.strip()}")
