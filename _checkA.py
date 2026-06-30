import re, json
from _trbase import BASE
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
A=json.load(open('_A.json',encoding='utf-8'))
trf={}  # per-lang composed expected
import importlib.util
spec=importlib.util.spec_from_file_location('comp','_compose.py')
# instead just reload composed tr files
LANGS=['es','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg']
g=open('game.html',encoding='utf-8').read()
EN=kv(g,'const _EN')
problems=[]
for code in LANGS:
    t=open('lang_'+code+'.js',encoding='utf-8').read()
    M=kv(t,'const _'+code.upper())
    comp=json.load(open(f'_ph/tr_{code}.json',encoding='utf-8'))
    for k in A:
        want=comp.get(k)
        got=M.get(k)
        if want is None:
            problems.append((code,k,'NO_COMPOSED',got)); continue
        if got!=want:
            problems.append((code,k,want,got))
print('A-key mismatches (lang != composed):', len(problems))
for p in problems[:40]: print(p)
# Also report A-keys whose composed translation == English (legit same-word, informational)
same=0
for code in LANGS:
    comp=json.load(open(f'_ph/tr_{code}.json',encoding='utf-8'))
    for k in A:
        if comp.get(k)==EN.get(k): same+=1
print('A-key composed==English (legit identical-word) total across langs:', same)
