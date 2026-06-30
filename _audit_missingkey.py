import re
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
print(f"_EN keys: {len(EN)}")
tot=0
for c in L:
    U=c.upper()
    t=open('lang_'+c+'.js',encoding='utf-8').read()
    M=kv(t,'const _'+U)
    missing=[k for k in EN if k not in M]
    tot+=len(missing)
    print(f"{c}: {len(M)} keys, MISSING {len(missing)}")
    if missing and len(missing)<=20:
        for k in missing: print(f"    - {k!r}")
    elif missing:
        for k in missing[:20]: print(f"    - {k!r}")
        print(f"    ... +{len(missing)-20} more")
print(f"\nTOTAL missing keys across langs: {tot}")
