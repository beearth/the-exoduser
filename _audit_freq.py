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
EN = kv(g, 'const _EN')
L = ['zh','zht','ja','es','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg']
def isen(v, k):
    e = EN.get(k); return e is not None and v == e and any(ch.isalpha() for ch in e)
from collections import Counter
cnt = Counter(); langs = {}
for c in L:
    U = c.upper()
    t = open('lang_'+c+'.js', encoding='utf-8').read()
    M = kv(t, 'const _'+U)
    for k in EN:
        if k in M and isen(M[k], k):
            cnt[k]+=1; langs.setdefault(k,[]).append(c)
for k,n in cnt.most_common():
    print(f"{n:2}  {k!r} -> {EN[k]!r}")
print(f"\nUnique placeholder keys: {len(cnt)}  Total: {sum(cnt.values())}")
