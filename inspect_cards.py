with open('templates/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = [m.start() for m in re.finditer(r'<div class="room-card', text)]
for m in matches:
    print(text[m:m+1200])
    print("="*40)
