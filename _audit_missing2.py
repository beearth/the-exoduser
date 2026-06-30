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
# key in single quotes, value in single/double/backtick
P=re.compile(r"'((?:\\.|[^'\\])*)'\s*:\s*"
             r"('(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`)")
def keys(t,d):
    s=span(t,d)
    if not s: return set()
    return {m.group(1) for m in P.finditer(t[s[0]:s[1]])}
g=open('game.html',encoding='utf-8').read()
EN=keys(g,'const _EN')
L=['zh','zht','ja','es','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg']
print(f"_EN keys (robust): {len(EN)}")
allmiss={}
for c in L:
    U=c.upper()
    t=open('lang_'+c+'.js',encoding='utf-8').read()
    M=keys(t,'const _'+U)
    missing=[k for k in EN if k not in M]
    for k in missing: allmiss.setdefault(k,[]).append(c)
print(f"distinct missing keys: {len(allmiss)}")
for k,langs in sorted(allmiss.items(),key=lambda x:-len(x[1])):
    print(f"  [{len(langs)}] {k!r}")
