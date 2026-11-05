import re,os,csv,sys,collections
root=sys.argv[1];out=sys.argv[2];HG=re.compile('[가-힣]');LIT=re.compile(r'\$?@?"(?:[^"\\\n]|\\.)*"');rows=[];C=collections.Counter()
QA=re.compile(r'(Capture|Smoke|Qa|QA|Check|Review|Probe|/Tools/|Test|Editor)')
for d,_,fs in os.walk(root):
    for f in fs:
        if not f.endswith('.cs'):continue
        p=os.path.join(d,f);rel=os.path.relpath(p,root)
        for n,l in enumerate(open(p,encoding='utf8',errors='ignore'),1):
            code=re.sub(r'(?<!:)//.*$','',l) if '"' not in l.split('//')[0][-1:] else l
            lits=[m.group(0) for m in LIT.finditer(code) if HG.search(m.group(0))]
            if not lits:continue
            kind='qa-or-capture' if QA.search(rel) else 'product'
            guarded=bool(re.search(r'language|Language|Lang\(|\.Ko\b|isKo|english|English|"ko"',code))
            C[(kind,guarded)]+=len(lits)
            for t in lits:rows.append([rel,n,kind,'language-branch-nearby' if guarded else 'fixed',t[:80]])
csv.writer(open(out,'w',newline='',encoding='utf8')).writerows([['file','line','kind','guard','literal']]+rows);print(C)
c=collections.Counter(r[0] for r in rows if r[2]=='product' and r[3]=='fixed')
for k,v in c.most_common(22):print(v,k)
