import re,sys
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
# keys to inspect passed as argv
keys = sys.argv[1:]
for k in keys:
    print(f"\n### KEY {k!r}  EN={EN.get(k)!r}")
    for c in L:
        v=TBL[c].get(k,'<<MISSING>>')
        en = EN.get(k)
        mark = '  [=EN]' if v==en else ''
        print(f"  {c:5} {v!r}{mark}")
