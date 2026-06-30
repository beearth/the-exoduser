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
LOC=json.load(open('_ph/_localize.json',encoding='utf-8'))
# per language: list of [ko, en, {sibling samples}]
perlang={c:{} for c in L}
for r in LOC:
    k=r['ko']; en=r['en']
    # gather sibling translations (langs that localized) for style reference
    sib={c:TBL[c][k] for c in L if k in TBL[c] and TBL[c][k]!=en}
    for c in r['missing']:
        perlang[c][k]={'en':en,'sib':sib}
counts={c:len(perlang[c]) for c in L}
print("per-language LOCALIZE cells to fill:")
tot=0
for c in L:
    if counts[c]: print(f"  {c:5} {counts[c]}"); tot+=counts[c]
print("TOTAL",tot)
json.dump(perlang,open('_ph/_targets.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
