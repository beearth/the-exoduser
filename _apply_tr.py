import re, json, sys, os

# Usage: python _apply_tr.py <code> [<code> ...]   (applies _ph/tr_<code>.json into lang_<code>.js)

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

U_OF = {'es':'ES','ru':'RU','de':'DE','ptbr':'PTBR','fr':'FR','pl':'PL','it':'IT','uk':'UK','tr':'TR','vi':'VI','th':'TH','id':'ID','ar':'AR','sv':'SV','da':'DA','no':'NO','fi':'FI','cs':'CS','hu':'HU','ro':'RO','nl':'NL','el':'EL','bg':'BG'}

def esc(s):
    # value goes inside single quotes; escape backslash then single quote
    return s.replace('\\', '\\\\').replace("'", "\\'")

def apply_one(code):
    U = U_OF[code]
    trf = f'_ph/tr_{code}.json'
    if not os.path.exists(trf):
        print(f"{code}: NO tr file"); return
    tr = json.load(open(trf, encoding='utf-8'))
    fn = f'lang_{code}.js'
    text = open(fn, encoding='utf-8').read()
    s, e = extract_obj_span(text, 'const _'+U)
    body = text[s:e]
    # find last occurrence position of each target key
    last = {}
    for m in PAT.finditer(body):
        k = m.group(1)
        if k in tr:
            last[k] = m  # keep last
    # build edits (value-span replacement). value group is group(2); compute its span
    edits = []
    applied = 0; skipped = 0
    for k, m in last.items():
        newval = tr[k]
        if not newval or not newval.strip():
            skipped += 1; continue
        # locate value quotes within match
        mt = m.group(0)
        # value is the last '...' in the match
        vm = list(re.finditer(r"'((?:\\.|[^'\\])*)'", mt))[-1]
        vs = m.start() + vm.start()
        ve = m.start() + vm.end()
        edits.append((vs, ve, "'" + esc(newval) + "'"))
        applied += 1
    for vs, ve, rep in sorted(edits, reverse=True):
        body = body[:vs] + rep + body[ve:]
    newtext = text[:s] + body + text[e:]
    open(fn, 'w', encoding='utf-8').write(newtext)
    print(f"{code}: applied={applied} skipped(empty)={skipped} of {len(tr)}")

for code in sys.argv[1:]:
    apply_one(code)
