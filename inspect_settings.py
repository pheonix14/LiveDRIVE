with open('templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'function openRoomSettings()' in line:
        for i in range(idx, idx+35):
            print(f"{i+1}: {lines[i]}", end='')
