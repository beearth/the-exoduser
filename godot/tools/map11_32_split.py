"""MAP11-32: deterministic source-coordinate cuts, clone/mirror only, no synthesis.
python map11_32_split.py supplied_2000x1125.png [output directory]
"""
import sys,json,hashlib
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
src=Path(sys.argv[1]);out=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).resolve().parents[1]/'assets/maps/map11/target32'
out.mkdir(parents=True,exist_ok=True)
im=Image.open(src).convert('RGB');a=np.asarray(im);assert im.size==(2000,1125)
y,x=np.mgrid[:1125,:2000].astype('float32')
regions=[
 ('left_near',[(0,0),(360,0),(375,180),(425,310),(460,465),(510,590),(700,755),(700,850),(470,890),(380,1080),(320,1125),(0,1125)],(255,880),0),
 ('left_mid',[(380,0),(850,0),(840,120),(825,240),(875,325),(810,395),(665,435),(500,390),(445,290)],(610,365),80),
 ('right_mid',[(1230,0),(1600,0),(1610,150),(1650,250),(1680,395),(1580,470),(1450,515),(1240,470),(1235,415),(1340,335)],(1410,410),90),
 ('right_near',[(1620,0),(2000,0),(2000,1125),(1550,1125),(1450,1040),(1470,940),(1640,855),(1660,680),(1530,620),(1460,520),(1670,440),(1680,250)],(1810,980),0),
 ('white_tree',[(885,0),(1135,0),(1160,70),(1200,100),(1170,155),(1080,195),(915,185),(860,150),(885,90)],(1000,160),48)]
# Root aprons and AO are baked below the independently sorted trunks.
mask_list=[];meta=[]
for name,poly,foot,radius in regions:
 m=Image.new('L',im.size);ImageDraw.Draw(m).polygon(poly,fill=255)
 raw=np.asarray(m);dist=cv2.distanceTransform(cv2.copyMakeBorder(raw,12,12,12,12,cv2.BORDER_REPLICATE),cv2.DIST_L2,5)[12:-12,12:-12]
 alpha=np.clip(dist/8,0,1);alpha=alpha*alpha*(3-2*alpha)
 # Preserve painted root apron in the ground; feather trunk down to its foot.
 alpha*=np.clip((foot[1]+50-y)/65,0,1)
 mask_list.append(alpha)
 # Extend the source frame into its apron with mirrored native pixels. The
 # original screen stays unchanged; camera travel never reveals a straight crop.
 padded_a=cv2.copyMakeBorder(a,300,300,300,300,cv2.BORDER_REFLECT_101)
 padded_m=cv2.copyMakeBorder(alpha,300,300,300,300,cv2.BORDER_REPLICATE)
 py,px=np.mgrid[-300:1425,-300:2300].astype('float32')
 outside=np.maximum(np.maximum(-px,px-1999),np.maximum(-py,py-1124))
 feather=np.clip((285-outside+16*np.sin(px/127)+12*np.sin(py/89))/180,0,1);feather=feather*feather*(3-2*feather)
 padded_m*=feather
 # Do not mirror branches upside-down north of their painted frame.
 padded_m*=np.clip(py/65,0,1)
 padded_m*=np.clip((foot[1]+50-py)/65,0,1)
 mask_image=Image.fromarray((padded_m*255).astype('uint8'))
 pb=mask_image.getbbox();box=[pb[0]-300,pb[1]-300,pb[2]-300,pb[3]-300]
 rgba=Image.fromarray(padded_a).convert('RGBA');rgba.putalpha(mask_image);rgba.crop(pb).save(out/(name+'.png'))
 meta.append(dict(id=name,box=box,source_foot=foot,radius=radius,offset=[box[0]-foot[0],box[1]-foot[1]]))
# A continuous central floor clone fills the removed vertical art at native scale.
def reflect(v,lo,hi):
 t=(v-lo)%(2*(hi-lo));return lo+np.minimum(t,2*(hi-lo)-t)
clone=cv2.remap(a,reflect(x,700,1300).astype('float32'),reflect(y,500,1050).astype('float32'),cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
combined=np.maximum.reduce(mask_list)
floor=(a*(1-combined[...,None])+clone*combined[...,None]).astype('uint8')
# 600 native px apron all around; preserve source scale, never enlarge floor detail.
ey,ex=np.mgrid[-600:1725,-600:2600].astype('float32')
base=cv2.remap(floor,ex,ey,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
# Apron copies ground only, never mirrored vertical silhouettes.
outer_clone=cv2.remap(a,reflect(ex,700,1300).astype('float32'),reflect(ey,500,1050).astype('float32'),cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
outside_mask=(ex<0)|(ex>1999)|(ey<0)|(ey>1124)
# Blend the inner edge too. Otherwise non-trunk background RGB at source y0
# jumps into the cloned apron even when the outer alpha itself is smooth.
inside=np.minimum.reduce([ex,1999-ex,ey,1124-ey])
wavy=95+35*np.sin(ex/139)+25*np.sin(ey/137+ex/199)
keep=np.clip(inside/wavy,0,1);keep=keep*keep*(3-2*keep)
base=(base*keep[...,None]+outer_clone*(1-keep[...,None])).astype('uint8')
# Curved, non-straight transition. Source rect stays fully opaque; only apron fades.
dx=np.maximum(-ex,ex-1999);dy=np.maximum(-ey,ey-1124)
d=np.maximum(dx,dy)
t=np.clip(d/600,0,1)
# Every source pixel remains full alpha. Vary the fade exponent instead of
# cutting a wavy line; all outer pixels reach exactly zero before frame end.
power=1.5+1.1*np.sin(ex/173)*np.sin(ey/149+ex/311)
f=np.power(1-t,power);f=f*f*(3-2*f)
rgba=np.dstack([base,(f*255).astype('uint8')]);Image.fromarray(rgba).save(out/'floor.png')
# Existing blood cracks only, no generated stipple or random field.
b=base.astype(float);vein=np.clip((b[:,:,0]-b[:,:,1]-3)/24,0,1)*np.clip((100-b.max(2))/65,0,1)
Image.fromarray((vein*f*255).astype('uint8')).save(out/'veins.png')
# Root aprons/AO already belong to original painted source; their extracted layers
# are baked into one static ground plate (not duplicated each frame).
root=im.convert('RGBA');root.putalpha(Image.fromarray((combined*np.clip((y-300)/500,0,1)*60).astype('uint8')));root.save(out/'root_aprons.png')
# Source lower edge branches, separately moving at 2.5% parallax.
m=Image.new('L',im.size);ImageDraw.Draw(m).polygon([(0,940),(80,990),(150,1125),(0,1125)],fill=255);ImageDraw.Draw(m).polygon([(485,1125),(550,955),(610,1010),(710,1125)],fill=255)
fg=im.convert('RGBA');fg.putalpha(m.filter(ImageFilter.GaussianBlur(2)));fg.save(out/'foreground.png')
fog=im.crop((800,190,1200,390)).convert('L').resize((400,200)).filter(ImageFilter.GaussianBlur(18));fog.save(out/'fog.png')
# Identity LUT for source scene; measured channel median legacy->target curves.
quant=np.quantile(a[400:950,700:1300].reshape(-1,3),[.1,.5,.9],axis=0)
identity=np.tile(np.arange(256,dtype='uint8')[None,:,None],(1,1,3));Image.fromarray(identity).save(out/'identity_lut.png')
manifest=dict(source_sha256=hashlib.sha256(src.read_bytes()).hexdigest(),source_size=[2000,1125],source_scale=(1920/2000)/.70,projection_y=.6,center=[0,3520],floor_box=[-600,-600,2600,1725],regions=meta,palette={'ground':'55515e','vein':'351f29','moss':'454b40','fog':'787482','white':'b9b5c4'},ground_quantiles=quant.tolist(),new_generation=False,dither=False,clone='native-scale reflected central ground; no inpaint',root_ao='source painted root aprons/contact shadows baked in floor; no extra ellipse over tree roots')
(out/'split.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest))
