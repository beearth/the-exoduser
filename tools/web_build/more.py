import csv,subprocess,sys,os,re
root,p=sys.argv[1],sys.argv[2];R=list(csv.reader(open(p,encoding='utf8')));H=R[0];i={k:n for n,k in enumerate(H)}
for r in R[1:]:
    if r[i['ext']] in('.mp3',):
        o=subprocess.run(['afinfo',os.path.join(root,r[0])],capture_output=True,text=True).stdout;m=re.search(r'estimated duration: ([\d.]+)',o);c=re.search(r'(\d+) ch, (\d+) Hz',o)
        if m:r[i['duration_s']]=round(float(m.group(1)),2)
        if c:r[i['channels']],r[i['rate']]=c.group(1),c.group(2)
    if r[i['nearby_notice_file']].endswith('startup_source_ledger.json'):r[i['nearby_notice_file']]=''
csv.writer(open(p,'w',newline='',encoding='utf8')).writerows(R);print('mp3 ok',sum(1 for r in R[1:] if r[1]=='.mp3' and r[i['duration_s']]));
print('exts no dims', sum(1 for r in R[1:] if r[1] in('.png','.jpg') and not r[i['width']]))
d=[r for r in R[1:] if r[1]=='.mp4'];print('mp4',len(d))
