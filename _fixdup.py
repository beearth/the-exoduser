import re, sys

APPLY = '--apply' in sys.argv

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

game = open('game.html', encoding='utf-8').read()
gs = extract_obj_span(game, 'const _EN')
EN = {m.group(1): m.group(2) for m in PAT.finditer(game[gs[0]:gs[1]])}

def is_en(val, k):
    e = EN.get(k)
    return e is not None and val == e and any(ch.isalpha() for ch in e)

langs = {'ZH':'zh','ZHT':'zht','JA':'ja','ES':'es','RU':'ru','DE':'de','PTBR':'ptbr','FR':'fr','PL':'pl','IT':'it','UK':'uk','TR':'tr','VI':'vi','TH':'th','ID':'id','AR':'ar','SV':'sv','DA':'da','NO':'no','FI':'fi','CS':'cs','HU':'hu','RO':'ro','NL':'nl','EL':'el','BG':'bg'}

total_removed = 0
for U, c in langs.items():
    fn = 'lang_'+c+'.js'
    text = open(fn, encoding='utf-8').read()
    sp = extract_obj_span(text, 'const _'+U)
    bstart, bend = sp
    body = text[bstart:bend]
    # collect matches with absolute positions (relative to body)
    matches = [(m.start(), m.end(), m.group(1), m.group(2)) for m in PAT.finditer(body)]
    # group occurrences by key
    bykey = {}
    for idx,(s,e,k,v) in enumerate(matches):
        bykey.setdefault(k, []).append(idx)
    # determine indices to remove: for keys with a dup where EN shadows a good translation
    remove_idx = set()
    plan = []
    for k, idxs in bykey.items():
        if len(idxs) < 2: continue
        vals = [matches[i][3] for i in idxs]
        if not any(is_en(v, k) for v in vals): continue
        goods = [i for i in idxs if not is_en(matches[i][3], k)]
        if not goods: continue  # all EN -> not recoverable, leave alone
        keep = goods[0]
        for i in idxs:
            if i != keep:
                remove_idx.add(i)
                plan.append((k, matches[i][3], 'REMOVE' if i!=keep else ''))
    if not remove_idx:
        print(f"{U:5} nothing")
        continue
    # build removal spans (s,e) in body, extend to consume one trailing comma + ws, else preceding comma
    spans = []
    for i in sorted(remove_idx):
        s, e, k, v = matches[i]
        # extend forward over ws to comma
        j = e
        while j < len(body) and body[j] in ' \t': j += 1
        if j < len(body) and body[j] == ',':
            e2 = j+1
            # also swallow trailing spaces/newline if line becomes blank-ish (consume following spaces up to newline)
            spans.append((s, e2))
        else:
            # last entry: consume preceding comma
            p = s-1
            while p >= 0 and body[p] in ' \t\r\n': p -= 1
            if p >= 0 and body[p] == ',':
                spans.append((p, e))
            else:
                spans.append((s, e))
    # apply removals back-to-front
    newbody = body
    for s, e in sorted(spans, reverse=True):
        newbody = newbody[:s] + newbody[e:]
    # collapse any blank lines left (lines with only whitespace)
    newbody = re.sub(r'\n[ \t]*\n', '\n', newbody)
    removed = len(remove_idx)
    total_removed += removed
    print(f"{U:5} remove={removed}")
    for k, v, _ in plan[:4]:
        print(f"        - {k!r} (drop EN {v!r})")
    if APPLY:
        newtext = text[:bstart] + newbody + text[bend:]
        open(fn, 'w', encoding='utf-8').write(newtext)

print(f"\nTOTAL removed: {total_removed}  APPLY={APPLY}")
