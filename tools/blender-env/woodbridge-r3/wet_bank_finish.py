"""실제 높이 기반 젖은 강둑 전이와 판자 파손, 전경 조명 위계 마감."""
import bpy,bmesh,math,json,shutil,numpy as np
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;hist=R/'source/젖은강둑_원맵';hist.mkdir(exist_ok=True)
for kind in ['BaseColor','Roughness']:
 p=P/'Textures'/('RF3_Continuous_Bank_Terrain_'+kind+'.png');original=hist/p.name
 if not original.exists():shutil.copyfile(p,original)
 im=bpy.data.images.load(str(original),check_existing=False);im.colorspace_settings.name='sRGB'if kind=='BaseColor'else'Non-Color';w,h=im.size;arr=np.empty(w*h*4,dtype=np.float32);im.pixels.foreach_get(arr);arr=arr.reshape(h,w,4)
 x=np.linspace(-36,39,w,dtype=np.float32)[None,:];y=np.linspace(-22,58,h,dtype=np.float32)[:,None];north=y-(5.8+.5*np.sin(x*.4));south=(-6+.5*np.sin(x*.35))-y;right=6.7+.12*np.maximum(y,0)+1.3*np.sin(y*.23)-x;bank=np.maximum(south,np.minimum(north,right));dx=x-6.2;dy=y-.8;a=np.arctan2(dy,dx);island=2.5*(1-np.sqrt((dx/2.6)**2+(dy/3.0)**2)*(1+.16*np.sin(a*5)+.07*np.sin(a*9)));foot=2.7*(1-np.sqrt(((x+7.3)/4.2)**2+((y+5.8)/3.5)**2));d=np.maximum(np.maximum(bank,island),foot);top=.62+.25*np.sin(x*.27+y*.16)+.14*np.sin(x*.67-y*.4);z=-1.1+(top+1.1)*np.clip((d+1.4)/2.2,0,1)+.09*np.sin(x*2.1+y)*np.clip(d+1,0,1);t=np.clip((z+.05)/.60,0,1);t=t*t*(3-2*t)
 if kind=='BaseColor':arr[:,:,:3]*=(.45+.55*t)[:,:,None]
 else:arr[:,:,:3]=.35*(1-t[:,:,None])+arr[:,:,:3]*t[:,:,None]
 im.pixels.foreach_set(arr.ravel());im.update();im.filepath_raw=str(p);im.file_format='PNG';im.save()
for im in bpy.data.images:
 if im.source=='FILE'and Path(bpy.path.abspath(im.filepath)).parent==P/'Textures':
  if im.packed_file:im.unpack(method='REMOVE')
  im.reload()
# 두 판자는 끝이 실제로 끊어진 폭을 가지며 중앙 보행 축은 남긴다.
o=bpy.data.objects['RF3_Rotten_Wood_Bridge'];bm=bmesh.new();bm.from_mesh(o.data);seen=set();broken=0
for v in bm.verts:
 if v in seen:continue
 stack=[v];seen.add(v);part=[]
 while stack:
  q=stack.pop();part.append(q)
  for e in q.link_edges:
   a=e.other_vert(q)
   if a not in seen:seen.add(a);stack.append(a)
 mn=[min(q.co[k]for q in part)for k in range(3)];mx=[max(q.co[k]for q in part)for k in range(3)]
 if mx[0]-mn[0]>2.7 and mx[1]-mn[1]<.75 and mn[2]>.15:
  cy=(mx[1]+mn[1])*.5;j=round((cy+5.4)/.386)
  if j in [9,18]:
   for q in part:
    if j==9 and q.co.x>.10:q.co.x=.10+(q.co.x-.10)*.22;q.co.z-=max(0,q.co.x-.25)*.18
    if j==18 and q.co.x<-.45:q.co.x=-.45+(q.co.x+.45)*.18
   broken+=1
bm.to_mesh(o.data);bm.free();bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models/RF3_Rotten_Wood_Bridge.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True)
for o in S.objects:
 if o.type=='LIGHT'and o.name=='전경_넓은반사':o.data.energy=300
 if o.type=='LIGHT'and '다리끝_검수횃불'in o.name:o.data.energy=520
S.render.resolution_percentage=38;S.cycles.samples=16
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/젖은강둑_최종확인.png');bpy.ops.render.render(write_still=True)
(R/'source/젖은강둑-판자마감.json').write_text(json.dumps({'wetT':'t=smoothstep(clamp((height+.05)/.60,0,1))','컬러선형배율':'.45+.55*t','거칠기':'.35*(1-t)+원본roughness*t','원베이크보존':str(hist),'파손판자추가':broken,'전경반사광':300,'횃불광':520},ensure_ascii=False,indent=2),encoding='utf8')
