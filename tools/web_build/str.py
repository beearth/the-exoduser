import json,glob,os,re,csv,sys
root=sys.argv[1];HG=re.compile('[가-힣]');out=sys.argv[2]
rows=[];per={}
def walk(n,path,codes,file):
    st=per[file]
    if isinstance(n,dict):
        kl={k.lower():k for k in n}
        if 'en' in kl and any(k in kl for k in('ko','kr')):
            st['pairs']+=1;v=n[kl['en']]
            if v in('',None):st['en_empty']+=1;rows.append([file,path+'.en','en-empty',str(n.get(kl.get('ko','ko')))[:70]])
            elif isinstance(v,str) and HG.search(v):st['en_hangul']+=1;rows.append([file,path+'.en','en-has-korean',v[:70]])
            for k,v2 in n.items():
                if k.lower() not in('en','ko','kr'):walk(v2,path+'.'+k,codes,file)
            return
        if 'texts' in n and isinstance(n['texts'],list) and codes and 'en' in codes:
            st['pairs']+=1;v=n['texts'][codes.index('en')] if len(n['texts'])>codes.index('en') else None
            if not v:st['en_empty']+=1;rows.append([file,path,'en-empty',str(n['texts'][0])[:70]])
            elif HG.search(v):st['en_hangul']+=1;rows.append([file,path,'en-has-korean',v[:70]])
            return
        for k,v in n.items():
            if k.lower() in('source','sourcefile','sourcesha256','sourcecommit','note','sourcefiles'):continue
            walk(v,path+'.'+k,codes,file)
    elif isinstance(n,list):
        for i,v in enumerate(n):walk(v,f'{path}[{i}]',codes,file)
    elif isinstance(n,str) and HG.search(n):
        st['ko_no_en']+=1;rows.append([file,path,'korean-without-en-sibling',n[:70]])
for p in sorted(glob.glob(root+'/*.json')):
    f=os.path.basename(p);d=json.load(open(p,encoding='utf8'));per[f]=dict(pairs=0,en_empty=0,en_hangul=0,ko_no_en=0);codes=None
    if isinstance(d,dict):
        for k in('codes','languages'):
            if isinstance(d.get(k),list) and d[k] and isinstance(d[k][0],str):codes=d[k];break
    walk(d,'$',codes,f);per[f]['langs']=len(codes) if codes else ''
csv.writer(open(out,'w',newline='',encoding='utf8')).writerows([['file','path','kind','text_prefix']]+rows)
tot={k:sum(v[k] for v in per.values()) for k in('pairs','en_empty','en_hangul','ko_no_en')};print(tot)
for f,v in sorted(per.items(),key=lambda x:-(x[1]['ko_no_en']+x[1]['en_empty']+x[1]['en_hangul'])):
    if v['ko_no_en']+v['en_empty']+v['en_hangul']+v['pairs']:print(f,v)
json.dump(per,open(out+'.json','w'))
