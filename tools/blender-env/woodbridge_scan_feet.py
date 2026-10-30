"""원판 흙/왕관 그루터기 대신 실제 목질 밑동·실물 암반을 만든 뒤 베이크한다."""
import bpy,bmesh,json,math
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
raw=bpy.data.objects['실물목질_생잎제외_원본'];prepared=[];inside=bpy.data.materials.new('밑동_부패한절단목질');inside.use_nodes=True;bs=next(n for n in inside.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.10,.055,.023,1);bs.inputs['Roughness'].default_value=.94
for id,height,xy in [('RF_Fractured_Stump',2.5,1.18),('RF_Foreground_Roots',1.05,1.6)]:
 for suff in ['', '_High']:
  old=bpy.data.objects.get(id+suff)
  if old:bpy.data.objects.remove(old,do_unlink=True)
 me=raw.data.copy();me.materials.append(inside);bm=bmesh.new();bm.from_mesh(me);bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.0001,plane_co=Vector((0,0,height)),plane_no=Vector((0,0,1)),clear_inner=False,clear_outer=True)
 boundary=[e for e in bm.edges if e.is_boundary and all(v.co.z>height-.1 for v in e.verts)]
 if boundary:
  result=bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
  for f in result['faces']:f.material_index=len(me.materials)-1
 for v in bm.verts:
  if v.co.z>height-.2:v.co.z+=.15*math.sin(math.atan2(v.co.y,v.co.x)*7)+.07*math.cos(v.co.x*4)
  v.co.x*=xy;v.co.y*=xy;v.co.z-=.08
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free();high=bpy.data.objects.new(id+'_High',me);S.collection.objects.link(high);low=high.copy();low.data=high.data.copy();low.name=id;S.collection.objects.link(low);de=low.modifiers.new('밑동실물저밀도','DECIMATE');de.ratio=.62;apply(low,de);high.hide_render=True;high.hide_set(True);low.hide_render=True;low.hide_set(True);prepared.append((id,low,high))
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'pbr-source/rock_moss_set_01/rock_moss_set_01.gltf'));bpy.context.view_layer.update();obs=[o for o in bpy.data.objects if o not in before and o.type=='MESH'];rock=max(obs,key=lambda o:len(o.data.polygons))
for o in obs:
 if o!=rock:bpy.data.objects.remove(o,do_unlink=True)
rock.data.transform(rock.matrix_world);rock.parent=None;rock.matrix_world=Matrix.Identity(4);ps=[v.co for v in rock.data.vertices];mn=Vector([min(p[k] for p in ps) for k in range(3)]);mx=Vector([max(p[k] for p in ps) for k in range(3)]);c=Vector(((mn.x+mx.x)/2,(mn.y+mx.y)/2,mn.z));sc=3.7/max(mx.x-mn.x,mx.y-mn.y)
for v in rock.data.vertices:v.co=(v.co-c)*sc;v.co.z-=.14
for m in rock.data.materials:
 if not m.use_nodes:continue
 n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');old=bs.inputs['Base Color'].links[0].from_socket;h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.45;h.inputs['Value'].default_value=.72;l.new(old,h.inputs['Color']);l.new(h.outputs[0],bs.inputs['Base Color'])
id='RF_Corroded_Riverbank'
for suff in ['', '_High']:
 old=bpy.data.objects.get(id+suff)
 if old:bpy.data.objects.remove(old,do_unlink=True)
rock.name=id+'_High';low=rock.copy();low.data=rock.data.copy();low.name=id;S.collection.objects.link(low);de=low.modifiers.new('암반실물저밀도','DECIMATE');de.ratio=.65;apply(low,de);rock.hide_render=True;rock.hide_set(True);low.hide_render=True;low.hide_set(True);prepared.append((id,low,rock));rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
code=Path(__file__).with_name('woodbridge_natural_roots.py').read_text(encoding='utf8');code=code[code.index('for id,low,high in prepared:'):];code=code.replace("'큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'","'실제 CC0 이끼 암반 교대' if id=='RF_Corroded_Riverbank' else '실제 CC0 전체 목질 밑동·불규칙 파단과 노출 뿌리'").replace('기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치','Poly Haven IslandTree01 실제 밑동/뿌리 또는 RockMossSet01 실제암반 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치');exec(compile(code,str(Path(__file__)),'exec'))
(R/'source/스캔접지완료.json').write_text(json.dumps({'목질':'island_tree_01 밑동','그루터기절단높이':2.5,'전경뿌리절단높이':1.05,'암반':'rock_moss_set_01 실제 최대 메시','원판흙보유':'없음·원래 스캔의 최하부는 지면 매립'},ensure_ascii=False,indent=2),encoding='utf8')
