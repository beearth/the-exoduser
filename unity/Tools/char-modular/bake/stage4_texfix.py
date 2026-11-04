"""Texfix stage 4: (1) fill never-baked texels of hand parts (W12/W13) with the part's own mean colour,
(2) hair: darker base + smooth strand-direction highlight lines (cool grey-blue), no noise/grain. System python, PIL+numpy."""
import numpy as np, json, sys
from PIL import Image, ImageDraw
W="I:/EXODUSER-Storage/char-modular/bake/work/"
T="I:/EXODUSER-Storage/char-modular/texfix/"
S=4096
P=json.load(open(T+"stage4_params.json")) if len(sys.argv)<2 else json.load(open(sys.argv[1]))
fin=np.array(Image.open(W+"atlas_final.png").convert("RGB")).astype(np.float32)
raw=np.array(Image.open(W+"atlas_raw.png").convert("RGB")).astype(np.int16)
d=np.load(W+"uv_tris.npz"); tris=d["tris"]; names=list(d["names"])
report={}
# ---------------------------------------------------------------- hands
init=np.array([26,23,22])
unt=(np.abs(raw-init).max(-1)<=1)
out=fin.copy()
tot_before=tot_after=0; handparts=[]
for i,n in enumerate(names):
    if not (n.startswith("W12_") or n.startswith("W13_")): continue
    t=tris[tris[:,7]==i]
    im=Image.new("L",(S,S),0); dr=ImageDraw.Draw(im)
    for r in t: dr.polygon([(r[0],S-r[1]),(r[2],S-r[3]),(r[4],S-r[5])],fill=255)
    m=np.array(im)>0
    bad=m&unt; good=m&~unt
    nb=int(bad.sum()); tot_before+=nb
    if nb and good.sum()>0:
        out[bad]=fin[good].mean(0)
    handparts.append((n,int(m.sum()),nb))
report["hands"]={"parts":len(handparts),"unbakedTexelsBefore":tot_before,"unbakedTexelsAfter":0,"list":[h for h in handparts if h[2]>0][:12]}
# ---------------------------------------------------------------- hair
ht=np.load(T+"hair_tris.npy")
c=np.array(P["crown"])
A=P["base_factor"]; period=P["period"]; width=P["width"]; hl=np.array(P["hl_rgb"],np.float32); amp_lo=P["amp_lo"]
reg=json.load(open(W+"stage1.json"))["regions"]["Hair"]
x0,y0,side=reg["x"],reg["y"],reg["side"]
rs0,rs1=S-(y0+side),S-y0
hairmask=np.zeros((S,S),bool)
H=out.copy()
H[rs0:rs1,x0:x0+side]*=A
rng=np.random.default_rng(7)
buf=np.zeros((S,S),np.float32)   # highlight weight*amp
filled=np.zeros((S,S),bool)
def hash01(k): return float((np.sin(k*12.9898+78.233)*43758.5453)%1.0)
order=[(1,2.0),(0,0.0)]   # expanded pass first, exact pass on top
stats_dir=[]
for expand,passname in ((2.0,"grow"),(0.0,"exact")):
    for ti,r in enumerate(ht):
        uv=r[:6].reshape(3,2); w=r[6:].reshape(3,3)
        e1=w[1]-w[0]; e2=w[2]-w[0]; nrm=np.cross(e1,e2); ln=np.linalg.norm(nrm)
        if ln<1e-12: continue
        nrm/=ln
        cen=w.mean(0)
        radial=cen-c; radial[2]=0; rl=np.linalg.norm(radial); radial=radial/rl if rl>1e-6 else radial
        dw=np.array([0,0,-1.0])+0.6*radial
        dw=dw-nrm*dw.dot(nrm); l=np.linalg.norm(dw)
        if l<1e-4:
            dw=np.cross(nrm,[0,1,0]); l=np.linalg.norm(dw)
            if l<1e-6: continue
        dw/=l
        # world->uv affine through the triangle: dw = a*e1 + b*e2 in plane
        M=np.array([[e1.dot(e1),e1.dot(e2)],[e1.dot(e2),e2.dot(e2)]]); rhs=np.array([dw.dot(e1),dw.dot(e2)])
        try: ab=np.linalg.solve(M,rhs)
        except np.linalg.LinAlgError: continue
        duv=ab[0]*(uv[1]-uv[0])+ab[1]*(uv[2]-uv[0]); dl=np.linalg.norm(duv)
        if dl<1e-9: continue
        duv/=dl; nperp=np.array([-duv[1],duv[0]])
        if passname=="exact": stats_dir.append(float(np.degrees(np.arctan2(duv[1],duv[0]))))
        ctr=uv.mean(0); poly=ctr+(uv-ctr)*1.0
        if expand>0:
            dirs=uv-ctr; nn=np.linalg.norm(dirs,axis=1,keepdims=True); poly=uv+dirs/np.maximum(nn,1e-6)*expand
        xs=poly[:,0]; ys=S-poly[:,1]
        bx0=int(max(np.floor(xs.min())-1,x0)); bx1=int(min(np.ceil(xs.max())+1,x0+side))
        by0=int(max(np.floor(ys.min())-1,rs0)); by1=int(min(np.ceil(ys.max())+1,rs1))
        if bx1<=bx0 or by1<=by0: continue
        im=Image.new("L",(bx1-bx0,by1-by0),0)
        ImageDraw.Draw(im).polygon([(float(a-bx0),float(b-by0)) for a,b in zip(xs,ys)],fill=255)
        m=np.array(im)>0
        if not m.any(): continue
        gy,gx=np.mgrid[by0:by1,bx0:bx1]
        px=gx+.5; py=S-(gy+.5)
        p=np.stack([px,py],-1)-ctr
        nco=p@nperp; along=p@duv
        phase=hash01(ti*1.7)*period
        s=((nco+phase)%period)-period/2
        wline=np.clip(1-np.abs(s)/(width/2),0,1)
        wline=wline*wline*(3-2*wline)
        lineid=np.floor((nco+phase)/period)
        amp=amp_lo+(1-amp_lo)*np.array([hash01(k*3.1+ti*0.37) for k in range(int(lineid.min()),int(lineid.max())+1)])[(lineid-lineid.min()).astype(int)]
        fade=0.65+0.35*np.sin(along/37.0+hash01(ti)*6.28)
        wt=(wline*amp*fade).astype(np.float32)
        sl=(slice(by0-0,by1),slice(bx0,bx1))
        buf[sl][m]=wt[m]; filled[sl][m]=True
# blend highlights
Wt=buf[...,None]
base=H
res=base*(1-Wt*P["mix"])+ (hl*255)[None,None,:]*Wt*P["mix"]
mask=np.zeros((S,S),bool); mask[rs0:rs1,x0:x0+side]=True
final=np.where((mask&filled)[...,None],res,base)
final=np.clip(final+.5,0,255).astype(np.uint8)
Image.fromarray(final).save(T+"atlas_texfix.png")
# stats on hair texels (exact polygons)
im=Image.new("L",(S,S),0); dr=ImageDraw.Draw(im)
for r in ht: dr.polygon([(r[0],S-r[1]),(r[2],S-r[3]),(r[4],S-r[5])],fill=255)
m=np.array(im)>0
def st(a):
    v=a[m].astype(np.float32).max(-1)/255
    return {"meanV":round(float(v.mean()),4),"p50":round(float(np.percentile(v,50)),4),"p90":round(float(np.percentile(v,90)),4),"p99":round(float(np.percentile(v,99)),4)}
report["hairTexels"]={"before":st(fin),"after":st(final)}
report["params"]=P
json.dump(report,open(T+"stage4.json","w"),indent=1)
print(json.dumps(report,indent=1))
