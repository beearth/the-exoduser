import re, sys

with open('G:/hell/game.html', 'r', encoding='utf-8') as f:
    content = f.read()

NEW = open('G:/hell/_chest3d_new.js', 'r', encoding='utf-8').read()

pattern = r'\(function\(\)\{[\s\S]*?console\.log\(\'\[CHEST3D\][\s\S]*?\'\);\s*\}\)\(\);'
result, n = re.subn(pattern, NEW, content, count=1)
if n == 0:
    print('ERROR: pattern not found')
    sys.exit(1)
with open('G:/hell/game.html', 'w', encoding='utf-8') as f:
    f.write(result)
print('OK replaced')
