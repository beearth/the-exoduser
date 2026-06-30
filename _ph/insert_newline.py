import json, os
ANCHOR = "'우리가 해냈어! 다음 챕터 가자!'"
NEWKEY = '핵터 니가 진짜 해냈구나, 여왕님이 기뻐하시겠어!'
tr = json.load(open('_ph/newline.json', encoding='utf-8'))

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def find_value_end(text, start):
    # start points at the opening quote of the value string
    assert text[start] == "'", text[start-5:start+5]
    k = start + 1
    while k < len(text):
        c = text[k]
        if c == '\\':
            k += 2; continue
        if c == "'":
            return k  # index of closing quote
        k += 1
    return -1

def insert(fn, code):
    text = open(fn, encoding='utf-8').read()
    if NEWKEY in text:
        print(f"{code}: already present, skip"); return
    i = text.find(ANCHOR)
    if i < 0:
        print(f"{code}: ANCHOR NOT FOUND"); return
    # find ':' after anchor
    j = text.find(':', i + len(ANCHOR))
    # skip spaces to opening quote
    k = j + 1
    while text[k] in ' \t': k += 1
    ve = find_value_end(text, k)
    if ve < 0:
        print(f"{code}: value end not found"); return
    val = tr[code]
    ins = ",'" + esc(NEWKEY) + "':'" + esc(val) + "'"
    newtext = text[:ve+1] + ins + text[ve+1:]
    open(fn, 'w', encoding='utf-8').write(newtext)
    print(f"{code}: inserted -> {val[:40]}")

for code in tr:
    insert(f'lang_{code}.js', code)
