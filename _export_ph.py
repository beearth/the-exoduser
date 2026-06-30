import re, json, os

def extract_obj_span(text, decl):
    i = text.find(decl + '={')
    if i < 0: return None
    j = i + len(decl) + 1
    depth = 0; k = j; in_str = None
    while k < len(text):
        c = text[k]
        if in_str:
            if c == '\\': k += 2; continue
            if c == in_str: in_str = None
        else:
            if c in ("'", '"', '`'): in_str = c
            elif c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0: return (j, k+1)
        k += 1
    return None

PAT = re.compile(r"'((?:\\.|[^'\\])*)'\s*:\s*'((?:\\.|[^'\\])*)'")
def kv_last(body):
    d = {}
    for m in PAT.finditer(body):
        d[m.group(1)] = m.group(2)  # last wins
    return d

game = open('game.html', encoding='utf-8').read()
EN = kv_last(game[slice(*extract_obj_span(game, 'const _EN'))])

def is_en(val, k):
    e = EN.get(k)
    return e is not None and val == e and any(ch.isalpha() for ch in e)

langs = {'ES':'es','RU':'ru','DE':'de','PTBR':'ptbr','FR':'fr','PL':'pl','IT':'it','UK':'uk','TR':'tr','VI':'vi','TH':'th','ID':'id','AR':'ar','SV':'sv','DA':'da','NO':'no','FI':'fi','CS':'cs','HU':'hu','RO':'ro','NL':'nl','EL':'el','BG':'bg'}

os.makedirs('_ph', exist_ok=True)
allkeys = {}
for U, c in langs.items():
    text = open('lang_'+c+'.js', encoding='utf-8').read()
    body = text[slice(*extract_obj_span(text, 'const _'+U))]
    M = kv_last(body)
    ph = {k: EN[k] for k in EN if k in M and is_en(M[k], k)}
    json.dump(ph, open(f'_ph/{c}.json','w',encoding='utf-8'), ensure_ascii=False, indent=0)
    for k in ph: allkeys[k] = EN[k]
    print(f"{U:5} {c:5} placeholders={len(ph)}")
print(f"\nUNIQUE placeholder keys across all langs: {len(allkeys)}")
json.dump(allkeys, open('_ph/_unique.json','w',encoding='utf-8'), ensure_ascii=False, indent=0)
