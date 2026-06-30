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
def isen(v,k):
    e=EN.get(k); return e is not None and v==e and any(ch.isalpha() for ch in e)
A=set('''광전사|⚔ 광전사|일반|제단|보조|비석|조각|파편!|지뢰|💥 지뢰!|💣 지뢰!|구역|텔레포트|환영|환영!|환영술사|환영술!|위상!|반경|로비|보스|보스 AI 디버그|시스템|슬롯|슬롯:|메뉴|스태미나|참회|대장|대장간|지능|악의|악의 +|레어|체간|투사체|폭력|챔피언|기생|소용돌이|타입|물약|전투|마력|독|자연|☠ 침식|드롭|이전|리셋|리셋!|레벨|스탯|⚙️ 영역|⚙ 특수|보상|대기|기타|유틸|원소|인벤|폭발!|💥폭발!|💢 폭발!|💫 피니셔!|💀 도넛!|의식!|해일!|용암!|분신!|👥 분신!|👤 분신!|⚡ 레이저!|⚔ 연격!|공포!|💫 진동!|💥 그로기!|🚀 미사일!|👻 순간이동!|⚡순간이동!|❄서리!|낙하!|비이이명!!|착지!|💥 착지!|💫 광역!|충격!|삼지창!|집중...|💫 집중...|집중!|경직!|냠!|수역!|💫 미니스턴!|쿨다운|쿨다운!|쿨다운 중...|기검참|처내기|패링|패링!|⚡패링!|패링 (Q)'''.split('|'))
out={}
for c in L:
    U=c.upper()
    t=open('lang_'+c+'.js',encoding='utf-8').read()
    M=kv(t,'const _'+U)
    rows=[]
    for k in EN:
        if k in M and isen(M[k],k) and k in A:
            rows.append([k,EN[k]])
    if rows: out[c]=rows
for c,rows in out.items():
    print(f"\n##### {c}  ({len(rows)})")
    for k,e in rows:
        print(f"{k}\t|\t{e}")
