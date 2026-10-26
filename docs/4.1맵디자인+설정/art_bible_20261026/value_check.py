"""아트 바이블 명도·색 측정 (UNITY_MAP_ART_BIBLE_20261026 §4).
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
    im.thumbnail((320,320)); a=np.asarray(im).reshape(-1,3).astype(float)
    L=lum(a); hsv=np.asarray(im.convert('HSV')).reshape(-1,3)
    c,n=km(a)
    print(f"\n## {p.split('/')[-1]} {box}")
    print(" L p5/p50/p95 = %.0f/%.0f/%.0f  mean RGB=%s  meanSat=%.0f"%(np.percentile(L,5),np.percentile(L,50),np.percentile(L,95),a.mean(0).round(0),hsv[:,1].mean()))
    print("  V2 lit(L>=42)=%.1f%%  shade(L<=20)=%.1f%%"%((L>=42).mean()*100,(L<=20).mean()*100))
    print(" clusters(dark->light): "+"  ".join("#%02x%02x%02x %.0f%%"%(*cc.astype(int),nn*100) for cc,nn in zip(c,n)))
