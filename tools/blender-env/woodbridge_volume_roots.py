"""종잇장 밑동 FAIL: 실제 파단 목질을 굽혀 뿌리 리모델링, 주간/그루터기에 목질 두께 추가."""
import bpy,bmesh,json,math
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';
if (R/'source/목질두께뿌리완료.json').exists():print('이미 적용됨. 현재 원본의 중복 변형 없음',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
prepared=[];src=bpy.data.objects['RF_Fallen_Log'];pieces=[];highpieces=[]
for id in ['RF_Foreground_Roots']:
 for suff in ['', '_High']:
  old=bpy.data.objects.get(id+suff)
  if old:bpy.data.objects.remove(old,do_unlink=True)
 for j,(angle,length,height,width,bend) in enumerate([(.1,3.9,1.4,.90,.24),(1.2,3.1,1.0,.74,-.32),(2.4,4.5,.8,.90,.18),(3.5,3.4,1.2,.82,-.20),(5.0,4.0,1.05,.90,.35),(.8,2.2,.65,.38,-.25),(4.2,2.7,.7,.45,.35)]):
  me=src.data.copy();me.uv_layers.active.name='원본UV';xmin=min(v.co.x for v in me.vertices);xmax=max(v.co.x for v in me.vertices)
  for v in me.vertices:
   p=v.co.copy();t=(p.x-xmin)/(xmax-xmin);a=angle+bend*math.sin(t*3.6);rad=.40+t*length;cy=(p.y-.3)*width*(1-.68*t);cz=(p.z-.38)*width*(1-.78*t);v.co=(rad*math.cos(a)-cy*math.sin(a),rad*math.sin(a)+cy*math.cos(a),height*(1-t)**1.7-.16+cz)
  for mi,m in enumerate(list(me.materials)):
   mat=m.copy();me.materials[mi]=mat;n=mat.node_tree.nodes;l=mat.node_tree.links;uv=n.new('ShaderNodeUVMap');uv.uv_map='원본UV'
   for tx in n:
    if tx.type=='TEX_IMAGE':l.new(uv.outputs[0],tx.inputs['Vector'])
    if tx.type=='NORMAL_MAP':tx.uv_map='원본UV'
  high=bpy.data.objects.new('실물목질뿌리High'+str(j),me);S.collection.objects.link(high);low=high.copy();low.data=high.data.copy();S.collection.objects.link(low);de=low.modifiers.new('굽힌목질저밀도','DECIMATE');de.ratio=.145;apply(low,de);highpieces.append(high);pieces.append(low)
 select(highpieces,highpieces[0]);bpy.ops.object.join();high=highpieces[0];high.name=id+'_High';select(pieces,pieces[0]);bpy.ops.object.join();low=pieces[0];low.name=id;low.hide_render=True;low.hide_set(True);high.hide_render=True;high.hide_set(True);prepared.append((id,low,high))
for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump']:
 for suff in ['', '_High']:
  o=bpy.data.objects[id+suff];o.hide_set(False);before_bounds=[min(v.co[k] for v in o.data.vertices) for k in range(3)]+[max(v.co[k] for v in o.data.vertices) for k in range(3)]
  if suff:
   m=bpy.data.materials.new(id+'_썩은내벽');m.use_nodes=True;bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.048,.026,.011,1);bs.inputs['Roughness'].default_value=.95;o.data.materials.append(m)
  so=o.modifiers.new('실제목질두께','SOLIDIFY');so.thickness=.20;so.offset=-1;so.use_even_offset=False;so.use_quality_normals=True;so.thickness_clamp=.4;so.use_thickness_angle_clamp=True
  if suff:so.material_offset=len(o.data.materials)-1;so.material_offset_rim=len(o.data.materials)-1
  apply(o,so);after_bounds=[min(v.co[k] for v in o.data.vertices) for k in range(3)]+[max(v.co[k] for v in o.data.vertices) for k in range(3)];assert max(abs(a-b) for a,b in zip(before_bounds,after_bounds))<=.25,('예각 가시 재발',id+suff);o.hide_render=True;o.hide_set(True)
 prepared.append((id,bpy.data.objects[id],bpy.data.objects[id+'_High']))
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));code=Path(__file__).with_name('woodbridge_natural_roots.py').read_text(encoding='utf8');code=code[code.index('for id,low,high in prepared:'):];code=code.replace("'큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'","'실제 CC0 파단 목질을 굽힌 비대칭7갈래 노출 뿌리' if id=='RF_Foreground_Roots' else '실제 CC0 목질·20cm 두께·썩은 내벽이 있는 거목/파단 밑동'").replace('기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치','실제 CC0 목질·정점 리모델링 또는20cm 목질 두께 high→low normal/AO/curvature/PBR 2048; 바닥링/종잇장 후보 FAIL 후 제작법 변경');exec(compile(code,str(Path(__file__)),'exec'))
(R/'source/목질두께뿌리완료.json').write_text(json.dumps({'이전판정':'평평한 바닥링/얇은 껍질 FAIL','실제목질두께':.2,'뿌리갈래':7,'원본':'기존 CC0 dead_tree_trunk_02 파단 목질 UV 유지 변형','최종기하':'실제 표면/부피를 다시6맵 베이크'},ensure_ascii=False,indent=2),encoding='utf8')
