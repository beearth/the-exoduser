import re, sys
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
P=re.compile(r"'((?:\\.|[^'\\])*)'\s*:\s*'((?:\\.|[^'\\])*)'")
def kv(t,d):
    s=span(t,d);return {m.group(1):m.group(2) for m in P.finditer(t[s[0]:s[1]])} if s else {}
code=sys.argv[1]
keys=sys.argv[2:]
t=open('lang_'+code+'.js',encoding='utf-8').read()
M=kv(t,'const _'+code.upper())
for k in keys:
    print(f"{k!r} -> {M.get(k)!r}")
