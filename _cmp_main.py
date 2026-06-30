import re

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

def kv(body):
    if body is None: return {}
    return {m.group(1): m.group(2) for m in re.finditer(r"'((?:\\.|[^'\\])*)'\s*:\s*'((?:\\.|[^'\\])*)'", body)}

langs = {'ZH':'zh','ZHT':'zht','JA':'ja','ES':'es','RU':'ru','DE':'de','PTBR':'ptbr','FR':'fr','PL':'pl','IT':'it','UK':'uk','TR':'tr','VI':'vi','TH':'th','ID':'id','AR':'ar','SV':'sv','DA':'da','NO':'no','FI':'fi','CS':'cs','HU':'hu','RO':'ro','NL':'nl','EL':'el','BG':'bg'}
BK = '_autosave/lang_backup_20260629/'

tot_removed = 0; tot_valchg = 0
for U, c in langs.items():
    cur = open('lang_' + c + '.js', encoding='utf-8').read()
    bak = open(BK + 'lang_' + c + '.js', encoding='utf-8').read()
    for dictname in ['const _' + U, 'const _' + U + '_PFX', 'const _' + U + '_BASE']:
        cm = kv(extract_obj(cur, dictname))
        bm = kv(extract_obj(bak, dictname))
        removed = [k for k in bm if k not in cm]
        valchg = [k for k in bm if k in cm and bm[k] != cm[k]]
        if removed or valchg:
            tag = dictname.replace('const _', '')
            if removed:
                tot_removed += len(removed)
                print(f"{tag}: REMOVED {len(removed)}: {removed}")
            if valchg:
                tot_valchg += len(valchg)
                # only show non-fix48 unexpected value changes
                print(f"{tag}: VALCHG {len(valchg)}: " + ', '.join(f'{k}:{bm[k]}->{cm[k]}' for k in valchg[:8]))
print(f"\nTOTAL removed from any dict (backup->current): {tot_removed}")
print(f"TOTAL value changes (backup->current): {tot_valchg}")
