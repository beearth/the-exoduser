import re

def span(text, decl):
    i = text.find(decl + '={')
    if i < 0: return None
    j = i + len(decl) + 1
    depth = 0; k = j; ins = None
    while k < len(text):
        c = text[k]
        if ins:
            if c == '\\': k += 2; continue
            if c == ins: ins = None
        else:
            if c in ("'", '"', '`'): ins = c
            elif c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0: return (j, k+1)
        k += 1
    return None

P = re.compile(r"'((?:\\.|[^'\\])*)'\s*:\s*'((?:\\.|[^'\\])*)'")

def kv(t, d):
    s = span(t, d)
    return {m.group(1): m.group(2) for m in P.finditer(t[s[0]:s[1]])} if s else {}

g = open('game.html', encoding='utf-8').read()
EN = kv(g, 'const _EN'); ENP = kv(g, 'const _EN_PFX'); ENB = kv(g, 'const _EN_BASE')
L = {'ZH':'zh','ZHT':'zht','JA':'ja','ES':'es','RU':'ru','DE':'de','PTBR':'ptbr','FR':'fr','PL':'pl','IT':'it','UK':'uk','TR':'tr','VI':'vi','TH':'th','ID':'id','AR':'ar','SV':'sv','DA':'da','NO':'no','FI':'fi','CS':'cs','HU':'hu','RO':'ro','NL':'nl','EL':'el','BG':'bg'}

def isen(v, k):
    e = EN.get(k); return e is not None and v == e and any(ch.isalpha() for ch in e)

tm = 0; tp = 0
for U, c in L.items():
    t = open('lang_'+c+'.js', encoding='utf-8').read()
    M = kv(t, 'const _'+U); Pf = kv(t, 'const _'+U+'_PFX'); B = kv(t, 'const _'+U+'_BASE')
    mm = len([k for k in EN if k not in M]) + len([k for k in ENP if k not in Pf]) + len([k for k in ENB if k not in B])
    ph = len([k for k in EN if k in M and isen(M[k], k)])
    tm += mm; tp += ph
    print(f"{U:5} miss={mm:3} placeholder={ph}")
print(f"\nTOTAL missing={tm}  TOTAL placeholders={tp}")
