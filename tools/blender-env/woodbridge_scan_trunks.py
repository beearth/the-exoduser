"""주간의 반복된 홈/판근 FAIL을 실제 전체 목질 스캔으로 교체한다. 우선 독립 시험 파일만 저장."""
import bpy,bmesh,math,json,sys
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'pbr-source/island_tree_01/island_tree_01.gltf'));bpy.context.view_layer.update();obs=[o for o in bpy.data.objects if o not in before and o.type=='MESH'];keep=[]
for o in obs:
 bm=bmesh.new();bm.from_mesh(o.data);bad=[f for f in bm.faces if any(q in o.data.materials[f.material_index].name.lower() for q in ['leaves','branches'])]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 loose=[v for v in bm.verts if not v.link_faces]
 if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
 bm.to_mesh(o.data);bm.free()
 if not len(o.data.polygons):bpy.data.objects.remove(o,do_unlink=True);continue
 o.data.transform(o.matrix_world);o.parent=None;o.matrix_world=Matrix.Identity(4);keep.append(o)
def sel(obs,active):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active
sel(keep,keep[0]);bpy.ops.object.join();raw=keep[0];raw.name='실물목질_생잎제외_원본';pts=[v.co for v in raw.data.vertices];mn=Vector([min(p[k] for p in pts) for k in range(3)]);mx=Vector([max(p[k] for p in pts) for k in range(3)]);base=[p for p in pts if p.z<mn.z+(mx.z-mn.z)*.04];c=Vector([(min(p[k] for p in base)+max(p[k] for p in base))*.5 for k in range(3)]);c.z=mn.z;scale=24/(mx.z-mn.z)
for v in raw.data.vertices:
 p=(v.co-c)*scale;p.x*=.9;p.y*=.9;v.co=p
for mat in raw.data.materials:
 if not mat.use_nodes:continue
 n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED')
 if bs.inputs['Base Color'].is_linked:
  old=bs.inputs['Base Color'].links[0].from_socket;h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.30;h.inputs['Value'].default_value=.85;l.new(old,h.inputs['Color']);t=n.new('ShaderNodeMixRGB');t.blend_type='MULTIPLY';t.inputs[0].default_value=1;t.inputs[2].default_value=(.60,.47,.30,1);l.new(h.outputs[0],t.inputs[1]);l.new(t.outputs[0],bs.inputs['Base Color'])
 for q in n:
  if q.type=='NORMAL_MAP':q.inputs['Strength'].default_value=.5
for ti,id in enumerate(['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk']):
 for suff in ['', '_High']:
  old=bpy.data.objects.get(id+suff)
  if old:bpy.data.objects.remove(old,do_unlink=True)
  me=raw.data.copy()
  if ti:
   for v in me.vertices:v.co.x=-v.co.x;v.co.y*=.88;v.co.z*=.9
   bm=bmesh.new();bm.from_mesh(me);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free()
  o=bpy.data.objects.new(id+suff,me);S.collection.objects.link(o)
  if not suff:
   sel([o],o);de=o.modifiers.new('실물목질저밀도','DECIMATE');de.ratio=min(1,16000/sum(len(f.vertices)-2 for f in me.polygons));bpy.ops.object.modifier_apply(modifier=de.name)
  o.hide_render=True;o.hide_set(True)
raw.hide_render=True;raw.hide_set(True)
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/실물주간_형태시험.blend'));print('실제 목질 형태시험 저장',len(raw.data.polygons),'원본면·납품 무변경',flush=True)
