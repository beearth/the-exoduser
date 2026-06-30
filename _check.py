import re, json

def extract_obj(text, decl):
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
                if depth == 0: return text[j:k+1]
        k += 1
    return None

PAT = re.compile(r"'((?:\\.|[^'\\])*)'\s*:\s*'((?:\\.|[^'\\])*)'")
def kv(body):
    if body is None: return {}
    return {m.group(1): m.group(2) for m in PAT.finditer(body)}

wk = json.load(open('_trans_work.json', encoding='utf-8'))
keys43 = wk['allmiss']
en_tr = wk['en']

game = open('game.html', encoding='utf-8').read()
EN = kv(extract_obj(game, 'const _EN'))

langs = {'ZH':'zh','ZHT':'zht','JA':'ja','ES':'es','RU':'ru','DE':'de','PTBR':'ptbr','FR':'fr','PL':'pl','IT':'it','UK':'uk','TR':'tr','VI':'vi','TH':'th','ID':'id','AR':'ar','SV':'sv','DA':'da','NO':'no','FI':'fi','CS':'cs','HU':'hu','RO':'ro','NL':'nl','EL':'el','BG':'bg'}

L = {}
for U, c in langs.items():
    L[U] = kv(extract_obj(open('lang_'+c+'.js', encoding='utf-8').read(), 'const _'+U))

# For each of 43 keys: count langs where missing, where ==EN(placeholder), where translated
print("KEY | missing | placeholder(==EN) | translated")
for k in keys43:
    miss=[]; ph=[]; tr=[]
    enval = EN.get(k)
    for U in langs:
        if k not in L[U]: miss.append(U)
        elif enval is not None and L[U][k]==enval and any(ch.isalpha() for ch in enval): ph.append(U)
        else: tr.append(U)
    print(f"{k!r}\n   EN={enval!r}  miss={len(miss)}{miss}  ph={len(ph)}{ph}")
