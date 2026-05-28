with open('templates/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'function updateRoomTimerDisplay()' in line:
        for i in range(idx, idx+85):
            print(f"{i+1}: {lines[i]}", end='')
