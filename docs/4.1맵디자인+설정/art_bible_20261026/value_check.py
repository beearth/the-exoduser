"""아트 바이블 명도·색 측정 (MAP_ART_BIBLE_v2 §4 (CIE L*)).
사용: python value_check.py "이미지.png@x0,y0,x1,y1" [...]
출력: 명도 L(Rec.709 sRGB) p5/p50/p95, 평균 RGB, 평균 채도, V2 비율(L>=42 / L<=20), 대표색 6개.
수치 통과는 필요조건일 뿐이다. 합격은 기준 이미지 옆 1x 눈 판정으로만 낸다.
"""
import sys, numpy as np
from PIL import Image
def lum(a): return (0.2126*a[...,0]+0.7152*a[...,1]+0.0722*a[...,2])
def km(px,k=6,it=12):
    rng=np.random.default_rng(0); c=px[rng.choice(len(px),k,replace=False)].astype(float)
    for _ in range(it):
        d=((px[:,None,:]-c[None])**2).sum(-1); l=d.argmin(1)
        for j in range(k):
            m=px[l==j]
            if len(m): c[j]=m.mean(0)
    cnt=np.bincount(l,minlength=k)/len(l); o=np.argsort(lum(c))
    return c[o],cnt[o]
for spec in sys.argv[1:]:
    p,_,box=spec.partition('@')
    im=Image.open(p).convert('RGB')
    if box: im=im.crop(tuple(int(v) for v in box.split(',')))
    im0=im.copy()
    im.thumbnail((320,320)); a=np.asarray(im).reshape(-1,3).astype(float)
    L=lum(a); hsv=np.asarray(im.convert('HSV')).reshape(-1,3)
    c,n=km(a)
    print(f"\n## {p.split('/')[-1]} {box}")
    print(" L p5/p50/p95 = %.0f/%.0f/%.0f  mean RGB=%s  meanSat=%.0f"%(np.percentile(L,5),np.percentile(L,50),np.percentile(L,95),a.mean(0).round(0),hsv[:,1].mean()))
    print("  V2 lit(L>=42)=%.1f%%  shade(L<=20)=%.1f%%"%((L>=42).mean()*100,(L<=20).mean()*100))
    print(" clusters(dark->light): "+"  ".join("#%02x%02x%02x %.0f%%"%(*cc.astype(int),nn*100) for cc,nn in zip(c,n)))
    # CIE L* (MAP_ART_BIBLE_v2 §4): crop 후 768x432 LANCZOS -> sRGB->linear -> Y -> L*
    q=im0.resize((768,432),Image.LANCZOS); u=np.asarray(q).astype(float)/255
    lin=np.where(u<=0.04045,u/12.92,((u+0.055)/1.055)**2.4)
    Y=0.2126*lin[...,0]+0.7152*lin[...,1]+0.0722*lin[...,2]
    Ls=np.where(Y>0.008856,116*np.cbrt(Y)-16,903.3*Y)
    pc=np.percentile(Ls,[5,50,90,95,99]); ch=np.asarray(q).reshape(-1,3)
    rg=np.median(ch[:,0])/max(np.median(ch[:,1]),1)
    print("  L* p5/p50/p90/p95/p99 = %s  L*>=17 %.2f%%  L*<=8 %.2f%%  L*>=50 %.2f%%  R/G(채널 중앙값 비) %.2f"%("/".join("%.1f"%v for v in pc),(Ls>=17).mean()*100,(Ls<=8).mean()*100,(Ls>=50).mean()*100,rg))
