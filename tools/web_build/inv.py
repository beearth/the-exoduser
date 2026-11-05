import os,re,struct,csv,sys,json,collections
root=sys.argv[1];out=sys.argv[2]
def png(p):
    b=open(p,'rb').read(32)
    if b[:8]==b'\x89PNG\r\n\x1a\n':return struct.unpack('>II',b[16:24])
def jpg(p):
    f=open(p,'rb');
    if f.read(2)!=b'\xff\xd8':return None
    while 1:
        m=f.read(2)
        if len(m)<2:return None
        while m[1]==0xff:m=m[:1]+f.read(1)
        l=f.read(2)
        if len(l)<2:return None
        n=struct.unpack('>H',l)[0]
        if 0xc0<=m[1]<=0xcf and m[1] not in(0xc4,0xc8,0xcc):
            d=f.read(5);return struct.unpack('>H',d[3:5])[0],struct.unpack('>H',d[1:3])[0]
        f.seek(n-2,1)
def tga(p):
    b=open(p,'rb').read(18);return struct.unpack('<HH',b[12:16])
def wav(p):
    f=open(p,'rb');h=f.read(12)
    if h[:4]!=b'RIFF':return None
    ch=rate=br=None;size=None
    while 1:
        c=f.read(8)
        if len(c)<8:break
        n=struct.unpack('<I',c[4:])[0]
        if c[:4]==b'fmt ':
            d=f.read(n);ch,rate,br=struct.unpack('<HII',d[2:12]);continue
        if c[:4]==b'data':size=n;break
        f.seek(n+(n&1),1)
    if ch and size:return round(size/br,2),ch,rate
def ogg(p):
    b=open(p,'rb').read();i=b.find(b'\x01vorbis')
    if i<0:return None
    ch=b[i+11];rate=struct.unpack('<I',b[i+12:i+16])[0];j=b.rfind(b'OggS');g=struct.unpack('<q',b[j+6:j+14])[0]
    return round(g/rate,2),ch,rate
def font(p):
    try:
        b=open(p,'rb').read();
        if b[:4]==b'ttcf':off=struct.unpack('>I',b[12:16])[0]
        else:off=0
        n=struct.unpack('>H',b[off+4:off+6])[0]
        for i in range(n):
            e=off+12+i*16
            if b[e:e+4]==b'name':
                t=struct.unpack('>I',b[e+8:e+12])[0];cnt,so=struct.unpack('>HH',b[t+2:t+6])
                fam=lic=None
                for k in range(cnt):
                    r=t+6+k*12;pid,eid,lid,nid,ln,o=struct.unpack('>6H',b[r:r+12]);s=b[t+so+o:t+so+o+ln]
                    txt=s.decode('utf-16-be','ignore') if pid in(0,3) else s.decode('latin1')
                    if nid==1 and not fam:fam=txt
                    if nid in(13,14) and not lic:lic=txt[:80]
                return fam,lic
    except Exception:pass
    return None,None
lic=re.compile(r'(licen[cs]e|readme|credit|attribution|copying|notice|source|출처|라이선스)',re.I)
rows=[];N=collections.Counter();Sz=collections.Counter();lfs=0
EX={'.meta'}
dirs_lic={}
for d,_,fs in os.walk(root):
    dirs_lic[d]=[f for f in fs if lic.search(f) and not f.endswith('.meta')]
tops=sys.argv[3:]
for top in tops:
    for d,_,fs in os.walk(os.path.join(root,top)):
        for f in sorted(fs):
            if f.endswith('.meta') or f=='.DS_Store':continue
            p=os.path.join(d,f);rel=os.path.relpath(p,root);ext=os.path.splitext(f)[1].lower();sz=os.path.getsize(p);guid=''
            try:
                m=open(p+'.meta',errors='ignore').read(300);g=re.search(r'guid: (\w+)',m);guid=g.group(1) if g else ''
            except OSError:pass
            w=h=dur=ch=rate=fam=fl='';ptr=''
            try:
                if sz<200 and open(p,'rb').read(40).startswith(b'version https://git-lfs'):ptr='lfs-pointer'
                elif ext=='.png':r=png(p);w,h=r if r else('','')
                elif ext in('.jpg','.jpeg'):r=jpg(p);w,h=r if r else('','')
                elif ext=='.tga':w,h=tga(p)
                elif ext=='.wav':r=wav(p);dur,ch,rate=r if r else('','','')
                elif ext=='.ogg':r=ogg(p);dur,ch,rate=r if r else('','','')
                elif ext in('.ttf','.otf','.ttc'):fam,fl=font(p)
            except Exception as e:ptr='parse-error'
            ld='';q=d
            for _ in range(3):
                if dirs_lic.get(q):ld=os.path.relpath(os.path.join(q,dirs_lic[q][0]),root);break
                q=os.path.dirname(q)
            rows.append([rel,ext,sz,guid,w,h,dur,ch,rate,fam or '',fl or '',ld,ptr])
            N[(top,ext)]+=1;Sz[(top,ext)]+=sz
with open(out,'w',newline='',encoding='utf8') as f:
    c=csv.writer(f);c.writerow('path ext bytes guid width height duration_s channels rate font_family font_license_field nearby_notice_file note'.split());c.writerows(rows)
print(len(rows),sum(r[2] for r in rows)/1e9)
summ={'tops':{},'ext':{}}
T=collections.Counter();TS=collections.Counter()
for (t,e),n in N.items():T[t]+=n;TS[t]+=Sz[(t,e)]
for t in T:print('TOP',t,T[t],round(TS[t]/1e6,1))
E2=collections.Counter();E3=collections.Counter()
for (t,e),n in N.items():E2[e]+=n;E3[e]+=Sz[(t,e)]
for e,n in sorted(E2.items(),key=lambda x:-E3[x[0]])[:22]:print('EXT',e or '(none)',n,round(E3[e]/1e6,1))
print('LFS',sum(r[12]=='lfs-pointer' for r in rows),'ERR',sum(r[12]=='parse-error' for r in rows),'NOGUID',sum(not r[3] for r in rows),'NEARLIC',sum(bool(r[11]) for r in rows))
print('NOTICES',sorted({r[11] for r in rows if r[11]})[:40])
print('FONTS',sorted({(r[9],r[10][:40]) for r in rows if r[9]})[:30])
