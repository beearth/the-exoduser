"""두 번의 매끈한 주간 FAIL 뒤 실제 뒤틀린 나무 스캔으로 제작법 교체."""
import bpy,bmesh,math,json
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_제작본.blend'));S=bpy.context.scene
def select(obs,active):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'scan-source/island_tree_01/island_tree_01.gltf'));obs=[o for o in S.objects if o not in before and o.type=='MESH'];keep=[]
for o in obs:
 print('스캔 구성',o.name,len(o.data.vertices),[m.name for m in o.data.materials],flush=True)
 bm=bmesh.new();bm.from_mesh(o.data);bad=[f for f in bm.faces if any(q in o.data.materials[f.material_index].name.lower()for q in ['leaves','branches'])]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 loose=[v for v in bm.verts if not v.link_faces]
 if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
 bm.to_mesh(o.data);bm.free()
 if len(o.data.polygons):
  mw=o.matrix_world.copy();o.data.transform(mw);o.parent=None;o.matrix_world=Matrix.Identity(4);keep.append(o)
 else:bpy.data.objects.remove(o,do_unlink=True)
select(keep,keep[0]);bpy.ops.object.join();raw=keep[0];raw.name='스캔_뒤틀린나무_생잎제외';pts=[v.co for v in raw.data.vertices];mn=Vector([min(p[k]for p in pts)for k in range(3)]);mx=Vector([max(p[k]for p in pts)for k in range(3)]);roots=[v.co for v in raw.data.vertices if v.co.z<mn.z+(mx.z-mn.z)*.04];c=Vector([(min(p[k]for p in roots)+max(p[k]for p in roots))*.5 for k in range(3)]);c.z=mn.z;sc=23/(mx.z-mn.z)
for v in raw.data.vertices:v.co=(v.co-c)*sc
print('스캔 뼈대 범위',list(mn),list(mx),'배율',sc,'면',len(raw.data.polygons),flush=True)
for m in raw.data.materials:
 if not m.use_nodes:continue
 n=m.node_tree.nodes;l=m.node_tree.links;bs=next((q for q in n if q.type=='BSDF_PRINCIPLED'),None)
 if not bs:continue
 if bs.inputs['Base Color'].is_linked:
  prev=bs.inputs['Base Color'].links[0].from_socket;h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.38;h.inputs['Value'].default_value=.72;l.new(prev,h.inputs['Color']);t=n.new('ShaderNodeMixRGB');t.blend_type='MULTIPLY';t.inputs[0].default_value=1;t.inputs[2].default_value=(.64,.52,.35,1);l.new(h.outputs[0],t.inputs[1]);l.new(t.outputs[0],bs.inputs['Base Color'])
 for q in n:
  if q.type=='NORMAL_MAP':q.inputs['Strength'].default_value=.55
for ti,name in enumerate(['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B']):
 for suff in ['', '_High']:
  old=bpy.data.objects[name+suff];oldmesh=old.data;new=raw.data.copy()
  # 두 번째 개체는 굽는 방향만 뒤집고 스캔의 국소 표면은 보존한다.
  if ti:
   for v in new.vertices:v.co.x=-v.co.x
   bm=bmesh.new();bm.from_mesh(new);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(new);bm.free()
  old.data=new
  if not suff:
   select([old],old);de=old.modifiers.new('실제전체나무_저밀도','DECIMATE');de.ratio=min(1,22000/(len(new.polygons)*2));bpy.ops.object.modifier_apply(modifier=de.name)
   for q in S.objects:
    if q.data==oldmesh:q.data=old.data
  old.hide_render=True;old.hide_set(True)
raw.hide_render=True;raw.hide_set(True)
# 나무를 둘러싼 같은 높이의 이끼 고리는 폐기한다. 넓은 뿌리·부러진 측지에 소수 큰 덩어리로 접합한다.
for o in list(S.objects):
 if o.name.startswith('배치_RF3_Hanging_Moss')and abs(o.location.x)>3:bpy.data.objects.remove(o,do_unlink=True)
moss=bpy.data.objects['RF3_Hanging_Moss'];trees=[o for o in S.objects if o.name.startswith('배치_RF3_Ancient_Tree_')]
for ti,t in enumerate(trees):
 for j,(dx,dy,z,sc)in enumerate([(-1.7,-.6,1.1,1),(.4,-1.6,2.5,.9),(1.4,.1,4.1,.8),(-.3,1.1,6,.7),(-2.4,.2,.5,1.1)]):
  if ti>3 and j>2:continue
  a=t.rotation_euler.z;d=Vector((dx*math.cos(a)-dy*math.sin(a),dx*math.sin(a)+dy*math.cos(a),z))*t.scale.x;o=moss.copy();o.data=moss.data;S.collection.objects.link(o);o.name='뿌리접합_이끼';o.location=t.location+d;o.scale=(sc*t.scale.x,)*3;o.rotation_euler.z=a+j*.8;o.hide_render=False;o.hide_set(False)
# 원화처럼 가까운 고목의 뿌리는 풍성하게, 길의 축은 비운다.
for o in S.objects:
 if o.type=='LIGHT'and o.name=='길_따뜻한반사':o.data.energy=700
 if o.type=='LIGHT'and '빛기둥'in o.name:o.data.spot_blend=1.0
S.cycles.samples=32;S.render.resolution_percentage=65
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_실물스캔.blend'));S.render.filepath=str(R/'renders/승인구도_실물스캔.png');bpy.ops.render.render(write_still=True)
(R/'source/주간-제작법변경.json').write_text(json.dumps({'폐기':'로프트 주간 두 후보의 매끈한 관형 실루엣 FAIL','채택방법':'island_tree_01 실제 목질 스캔에서 생잎/잎가지 카드 제외, 양방향 거목화 및 스캔 노멀 유지','원본삼각형':sum(len(f.vertices)-2 for f in raw.data.polygons),'원본높이':mx.z-mn.z,'승인시연높이':23},ensure_ascii=False,indent=2),encoding='utf8')
