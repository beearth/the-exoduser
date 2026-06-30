import json, glob, re
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
tot_real=0;tot_stub=0
for f in sorted(glob.glob('_ph/tr_*.json')):
    code=f.split('tr_')[1].split('.')[0]
    tr=json.load(open(f,encoding='utf-8'))
    real=sum(1 for k,v in tr.items() if v.strip() and v!=EN.get(k))
    stub=sum(1 for k,v in tr.items() if v.strip() and v==EN.get(k))
    tot_real+=real;tot_stub+=stub
    print(f"{code:5} total={len(tr):3} real={real:3} eng-stub={stub:3}")
print(f"\nTOTAL real={tot_real}  eng-stubs={tot_stub}")
