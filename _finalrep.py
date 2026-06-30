import re, json
def span(text, decl):
    i=text.find(decl+'={')
    if i<0: return None
    j=i+len(decl)+1; depth=0;k=j;ins=None
    while k<len(text):
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
g=open('game.html',encoding='utf-8').read()
EN=kv(g,'const _EN')
def isen(v,k):
    e=EN.get(k);return e is not None and v==e and any(ch.isalpha() for ch in e)
B=set(json.load(open('_B.json',encoding='utf-8')).keys())
A=set(json.load(open('_A.json',encoding='utf-8')).keys())
CJK_OK=set(['타'])  # ja 'Hit' abbreviation kept English (B-like)
L=['zh','zht','ja','es','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg']
genuine=[]
print(f"{'LANG':5} {'total':>5} {'B-int':>5} {'A-same':>6} {'other':>5}")
for code in L:
    t=open('lang_'+code+'.js',encoding='utf-8').read()
    M=kv(t,'const _'+code.upper())
    ph=[k for k in EN if k in M and isen(M[k],k)]
    nb=na=no_=0
    for k in ph:
        if k in B or k in CJK_OK: nb+=1
        elif k in A: na+=1
        else:
            no_+=1; genuine.append((code,k,EN[k]))
    print(f"{code.upper():5} {len(ph):5} {nb:5} {na:6} {no_:5}")
print('\nGENUINE non-B non-A leftover placeholders:', len(genuine))
for x in genuine: print(' ',x)
