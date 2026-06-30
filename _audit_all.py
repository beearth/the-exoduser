import re, json
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
def hasalpha(s):
    return any(('a'<=c.lower()<='z') for c in s)
# per-language English placeholder count + collect unique english strings
percount={}
uniq={}  # english string -> set of langs where it's still english
for c in L:
    U=c.upper()
    t=open('lang_'+c+'.js',encoding='utf-8').read()
    M=kv(t,'const _'+U)
    n=0
    for k,e in EN.items():
        if not hasalpha(e): continue
        if k in M and M[k]==e:
            n+=1
            uniq.setdefault(k,set()).add(c)
    percount[c]=n
print("=== per-language English placeholder counts ===")
for c in L:
    print(f"  {c:5} {percount[c]}")
print(f"\nUnique keys needing work: {len(uniq)}")
print(f"Total cells: {sum(len(v) for v in uniq.values())}")
# dump unique english keys with EN text, sorted by how many langs affected
out=[]
for k,langs in sorted(uniq.items(),key=lambda x:-len(x[1])):
    out.append({"ko":k,"en":EN[k],"n":len(langs),"langs":sorted(langs)})
json.dump(out,open('_ph/_allmiss.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print("written _ph/_allmiss.json")
