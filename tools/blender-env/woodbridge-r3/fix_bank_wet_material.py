"""실제 지형 UV/현재 높이로 수위 주변 회색 절단 띠를 젖은 부패흙으로 연결."""
import bpy,json,math,shutil,numpy as np
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));o=bpy.data.objects['RF3_Continuous_Bank_Terrain'];me=o.data;me.calc_loop_triangles();rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));row=next(x for x in rows if x['id']==o.name);w,h=row['텍스처규격'];height=np.full((h,w),-2.,dtype=np.float32);uv=me.uv_layers.active.data
for tri in me.loop_triangles:
 pts=np.array([uv[i].uv[:]for i in tri.loops],dtype=np.float32)*np.array([w,h]);zs=np.array([me.vertices[i].co.z for i in tri.vertices]);lo=np.maximum(np.floor(pts.min(axis=0)).astype(int),0);hi=np.minimum(np.ceil(pts.max(axis=0)).astype(int),[w,h]);
 if np.any(hi<=lo):continue
 yy,xx=np.mgrid[lo[1]:hi[1],lo[0]:hi[0]];x=xx+.5;y=yy+.5;a,b,c=pts;den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
 if abs(den)<1e-10:continue
 s=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den;t=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den;inside=(s>=-1e-5)&(t>=-1e-5)&(s+t<=1.00001);block=height[lo[1]:hi[1],lo[0]:hi[0]];block[inside]=(s*zs[0]+t*zs[1]+(1-s-t)*zs[2])[inside]
wet=np.clip((.48-height)/.50,0,1);wet=wet*wet*(3-2*wet);hist=R/'source/강둑회색띠_이전';hist.mkdir(exist_ok=True)
for kind in ['BaseColor','Roughness']:
 p=P/'Textures'/row['맵'][kind];old=hist/p.name
 if not old.exists():shutil.copyfile(p,old)
 im=bpy.data.images.load(str(old),check_existing=False);im.colorspace_settings.name='sRGB'if kind=='BaseColor'else'Non-Color';arr=np.empty(w*h*4,dtype=np.float32);im.pixels.foreach_get(arr);arr=arr.reshape(h,w,4)
 if kind=='BaseColor':
  lum=arr[:,:,:3].mean(axis=2);detail=np.clip(lum/.16,.55,1.5);target=np.array([.021,.017,.010],dtype=np.float32)[None,None,:]*detail[:,:,None];mix=wet[:,:,None]*.94;arr[:,:,:3]=arr[:,:,:3]*(1-mix)+target*mix
 else:arr[:,:,:3]=arr[:,:,:3]*(1-wet[:,:,None])+np.maximum(arr[:,:,:3],.76)*wet[:,:,None]
 im.pixels.foreach_set(arr.ravel());im.update();im.filepath_raw=str(p);im.file_format='PNG';im.save()
for m in o.data.materials:
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE'and n.image and Path(bpy.path.abspath(n.image.filepath)).parent==P/'Textures':
   if n.image.packed_file:n.image.unpack(method='REMOVE')
   n.image.reload()
row['수위흙마감']={'기준':'현재 실제 UV 삼각형의 보간 높이','wet':'smoothstep(clamp((.48-z)/.50,0,1))','linearRGB기준':[.021,.017,.010],'원본밝기세부배율':[.55,1.5],'최대혼합':.94,'젖은흙roughness하한':.76,'의도':'회색 절단 띠의 밝은 노출과 과도한 젖은면 반사 제거. 실제 사진 세부는 유지'};(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/강둑-실제높이-재질마감.json').write_text(json.dumps(row['수위흙마감'],ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;S.render.resolution_percentage=45;S.cycles.samples=24;S.render.filepath=str(R/'renders/강둑회색띠_수정검수.png');bpy.ops.render.render(write_still=True);print('실제 지형 높이/UV 기반 젖은 부패흙 연결',flush=True)
