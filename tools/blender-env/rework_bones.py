import bpy,math,json,hashlib
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1';name='HE_Bone_Heap'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
S=bpy.context.scene;S.cycles.samples=1;S.render.threads_mode='FIXED';S.render.threads=12
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
low=bpy.data.objects[name];high=bpy.data.objects[name+'_High']
for o in [low,high]:
 for v in o.data.vertices:
  x,y,z=v.co
  if x< -1.65:
   # 두개골의 얼굴을 검수 카메라 쪽으로 돌린다.
   v.co=(-1.95-(y-.12),.12+(x+1.95),z)
  elif y>-.99:
   # 갈비 폭을 가슴 중앙에서 벌리고 양 끝에서 줄여 균일한 울타리 형태를 없앤다.
   t=max(0,min(1,(x+1.4)/2.8));f=.47+.53*math.sin(math.pi*t)
   v.co=(x+.08*math.sin(y*1.3),y*f+.25*z,z*.67+.035*math.sin(x*2.1))
  else:v.co.z*=.7
 o.hide_render=False;o.hide_set(False)
for m in high.data.materials:
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.28,.23,.15,1);bs.inputs['Roughness'].default_value=.86
src=(R/'rework_deadwood.py').read_text(encoding='utf8');chunk=src.split('materials=list(high.data.materials)')[1].split('rows=json.loads')[0]
exec(compile('materials=list(high.data.materials)'+chunk.replace('width=2048,height=2048','width=1024,height=1024'),'<동일베이크절차>','exec'))
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for r in rows:
 if r['id']==name:r.update({'역할':'폭이 좁아지는 무너진 흉곽·전면 두개골·긴뼈','범위XYZ최소최대':[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)]})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
(R/'뼈-재작업.json').write_text(json.dumps({'수정':'갈비 양끝 폭 축소·흉곽 붕괴·두개골 전면방향·오래된 뼈색 분리','동일베이크':'rework_deadwood.py의 Cycles 하이→로우 6맵 절차를 1024로 사용'},ensure_ascii=False),encoding='utf8')
for o in [low,high]:o.hide_render=True;o.hide_set(True)
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
print('뼈 무더기 형태·재질 재작업 완료',flush=True)
