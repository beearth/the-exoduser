import re,json
def span(text, decl):
    i = text.find(decl + '={')
    if i < 0: return None
    j = i + len(decl) + 1
    depth=0;k=j;ins=None
    while k < len(text):
        c=text[k]
        if ins:
            if c=='\\':k+=2;continue
            if c==ins:ins=None
        else:
            if c in ("'",'"','`'):ins=c
            elif c=='{':depth+=1
            elif c=='}':
                depth-=1
                if depth==0:return(j,k+1)
        k+=1
    return None
P=re.compile(r"'((?:\\.|[^'\\])*)'\s*:\s*'((?:\\.|[^'\\])*)'")
def kv(t,d):
    s=span(t,d); return {m.group(1):m.group(2) for m in P.finditer(t[s[0]:s[1]])} if s else {}
g=open('game.html',encoding='utf-8').read()
EN=kv(g,'const _EN')
L=['zh','zht','ja','es','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg']
TBL={c:kv(open('lang_'+c+'.js',encoding='utf-8').read(),'const _'+c.upper()) for c in L}
miss=json.load(open('_ph/_allmiss.json',encoding='utf-8'))
def hasalpha(s): return any('a'<=ch.lower()<='z' for ch in s)
LOCALIZE=[]  # keys where majority of present langs localized -> translate missing ones
KEEP=[]      # keys where majority kept english -> leave
for item in miss:
    k=item['ko']; en=item['en']
    present=[c for c in L if k in TBL[c]]
    loc=[c for c in present if TBL[c][k]!=en]
    kept=[c for c in present if TBL[c][k]==en]
    frac = len(loc)/len(present) if present else 0
    rec={'ko':k,'en':en,'loc':len(loc),'kept':len(kept),'frac':round(frac,2),'missing':item['langs']}
    if frac>=0.5:
        LOCALIZE.append(rec)
    else:
        KEEP.append(rec)
LOCALIZE.sort(key=lambda r:-r['loc'])
KEEP.sort(key=lambda r:-r['kept'])
print(f"LOCALIZE (siblings mostly translated -> we translate): {len(LOCALIZE)} keys, {sum(len(r['missing']) for r in LOCALIZE)} cells")
print(f"KEEP (siblings mostly kept english -> house style): {len(KEEP)} keys, {sum(len(r['missing']) for r in KEEP)} cells")
json.dump(LOCALIZE,open('_ph/_localize.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
json.dump(KEEP,open('_ph/_keep.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print("\n--- LOCALIZE keys ---")
for r in LOCALIZE:
    print(f"  {r['frac']:.2f} loc{r['loc']:2}/keep{r['kept']:2}  {r['ko']!r} = {r['en']!r}  miss={r['missing']}")
