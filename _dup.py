import re

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

def occurrences(body):
    """list of (key, value) in order"""
    return [(m.group(1), m.group(2)) for m in PAT.finditer(body)]

game = open('game.html', encoding='utf-8').read()
sp = extract_obj_span(game, 'const _EN')
EN = dict(occurrences(game[sp[0]:sp[1]]))

langs = {'ZH':'zh','ZHT':'zht','JA':'ja','ES':'es','RU':'ru','DE':'de','PTBR':'ptbr','FR':'fr','PL':'pl','IT':'it','UK':'uk','TR':'tr','VI':'vi','TH':'th','ID':'id','AR':'ar','SV':'sv','DA':'da','NO':'no','FI':'fi','CS':'cs','HU':'hu','RO':'ro','NL':'nl','EL':'el','BG':'bg'}

def is_en(val, k):
    e = EN.get(k)
    return e is not None and val == e and any(ch.isalpha() for ch in e)

grand_recoverable = 0
grand_dupkeys = 0
for U, c in langs.items():
    text = open('lang_'+c+'.js', encoding='utf-8').read()
    sp = extract_obj_span(text, 'const _'+U)
    occs = occurrences(text[sp[0]:sp[1]])
    seen = {}
    for k, v in occs:
        seen.setdefault(k, []).append(v)
    dupkeys = {k: vs for k, vs in seen.items() if len(vs) > 1}
    # recoverable: last value is EN-placeholder, but some earlier value is a real translation
    recoverable = []
    for k, vs in dupkeys.items():
        last = vs[-1]
        if is_en(last, k):
            good = [v for v in vs if not is_en(v, k)]
            if good:
                recoverable.append((k, vs))
    grand_dupkeys += len(dupkeys)
    grand_recoverable += len(recoverable)
    print(f"{U:5} dupkeys={len(dupkeys):4}  recoverable(EN-wins-over-good)={len(recoverable)}")
    if recoverable and U in ('ES','DE','SV'):
        for k, vs in recoverable[:6]:
            print(f"        {k!r}: {vs}")
print(f"\nTOTAL dup keys across langs: {grand_dupkeys}")
print(f"TOTAL recoverable (remove EN dup to reveal good translation): {grand_recoverable}")
