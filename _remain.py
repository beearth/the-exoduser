import re
from collections import Counter

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
EN = kv(g, 'const _EN')

def isen(v, k):
    e = EN.get(k); return e is not None and v == e and any(ch.isalpha() for ch in e)

cnt = Counter()
for c in ['nl','da','sv','id','de','fr','it','ptbr','ro','es','pl','vi']:
    U = 'PTBR' if c == 'ptbr' else c.upper()
    t = open('lang_'+c+'.js', encoding='utf-8').read()
    M = kv(t, 'const _'+U)
    for k in EN:
        if k in M and isen(M[k], k): cnt[EN[k]] += 1
for v, n in cnt.most_common(70):
    print(n, repr(v))
