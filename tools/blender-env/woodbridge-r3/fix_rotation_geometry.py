"""직접 확인된 Quaternion/Euler 불일치를 실제 행렬로 교정하고 눕힌 말뚝·사다리 균사를 수정."""
import bpy,bmesh,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));data={bpy.data.objects[r['id']].data for r in rows};converted=[]
for o in S.objects:
 if o.type=='MESH'and(o.data in data)and(o.name.startswith('RF3_')or not o.hide_render)and o.rotation_mode!='XYZ':
  intended=o.rotation_euler.copy();before=[list(q)for q in o.matrix_world];o.rotation_mode='XYZ';o.rotation_euler=intended;converted.append({'이름':o.name,'이전실제행렬':before,'의도Euler':list(intended)})
bpy.context.view_layer.update();src=bpy.data.objects['RF3_Fallen_Log'];old=bpy.data.objects['RF3_River_Stake_Cluster'];oldmesh=old.data;parts=[];axes=[]
for j in range(5):
 o=src.copy();o.data=src.data.copy();S.collection.objects.link(o);o.hide_render=False;o.hide_set(False);o.rotation_mode='XYZ';o.scale=(.20+.06*(j%3),.12,.12);o.rotation_euler=(.04*math.sin(j),-math.pi/2+.15*math.sin(j*1.6),j*.65);o.location=(-1.4+j*.65,.26*math.sin(j*2.2),.6+.12*(j%2));bpy.context.view_layer.update();axis=(o.matrix_world.to_3x3()@Vector((1,0,0))).normalized();axes.append(list(axis));assert axis.z>.95,axis;bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);de=o.modifiers.new('실물말뚝_저밀도','DECIMATE');de.ratio=.18;bpy.ops.object.modifier_apply(modifier=de.name);parts.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();tmp=parts[0];old.data=tmp.data.copy();mat=src.data.materials[0].copy();mat.name='RF3_River_Stake_Cluster_Baked';old.data.materials.clear();old.data.materials.append(mat)
for f in old.data.polygons:f.material_index=0
bm=bmesh.new();bm.from_mesh(old.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(old.data);bm.free()
for o in S.objects:
 if o.data==oldmesh:o.data=old.data
bpy.data.objects.remove(tmp,do_unlink=True);assert max(v.co.z for v in old.data.vertices)-min(v.co.z for v in old.data.vertices)>1.5
# 버섯15개의 닫힌 큰 형태는 보존하고,20정점짜리 반복 지그재그 균사14개만 제외한다.
o=bpy.data.objects['RF3_Fungal_Colony'];bm=bmesh.new();bm.from_mesh(o.data);seen=set();bad=[];count=0
for v in bm.verts:
 if v in seen:continue
 stack=[v];seen.add(v);part=[]
 while stack:
  q=stack.pop();part.append(q)
  for e in q.link_edges:
   w=e.other_vert(q)
   if w not in seen:seen.add(w);stack.append(w)
 if len(part)==20:bad.extend(part);count+=1
if bad:bmesh.ops.delete(bm,geom=bad,context='VERTS')
bm.to_mesh(o.data);bm.free();assert count==14,count
for id in ['RF3_River_Stake_Cluster','RF3_Fungal_Colony']:
 o=bpy.data.objects[id];r=next(x for x in rows if x['id']==id);r.update({'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'재질':o.data.materials[0].name,'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]});bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True)
next(x for x in rows if x['id']=='RF3_River_Stake_Cluster')['역할']='실제 세워진 파단 목질5개의 침수 말뚝·Quaternion/Euler 행렬 교정·공유 베이크 atlas'
next(x for x in rows if x['id']=='RF3_Fungal_Colony')['역할']='닫힌 층상 부후균15개·반복 사다리형 균사14개 제외·기존 동일 UV/베이크'
wooddata={bpy.data.objects[r['id']].data for r in rows if any(x in r['id']for x in ['Ancient_Tree','Root_Stump','Fallen_Log','Foreground_Branch','River_Stake','Rotten_Wood_Bridge'])};vv=[];ff=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in wooddata:
  a=len(vv);vv.extend(o.matrix_world@v.co for v in o.data.vertices);ff.extend(tuple(a+i for i in f.vertices)for f in o.data.polygons)
bvh=BVHTree.FromPolygons(vv,ff);moss=bpy.data.objects['RF3_Hanging_Moss'].data;fungal=bpy.data.objects['RF3_Fungal_Colony'].data;top=max(v.co.z for v in moss.vertices)
for o in S.objects:
 if o.type!='MESH'or o.hide_render or o.data not in {moss,fungal}:continue
 anchor=o.matrix_world@Vector((0,0,top))if o.data==moss else o.location.copy();hit,no,ix,d=bvh.find_nearest(anchor)
 if hit is not None and d<2.5:
  if math.hypot(no.x,no.y)>.1:o.rotation_euler.z=math.atan2(no.y,no.x)+math.pi/2
  if o.data==moss:o.location=hit+Vector((no.x*.16,no.y*.16,-top*o.scale.z))
  else:o.location=hit+Vector((no.x*.015,no.y*.015,-.04))
bpy.context.view_layer.update();(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/회전교정-실제행렬검사.json').write_text(json.dumps({'원인':'glTF QUATERNION 모드에서 Euler만 설정하여 의도한 회전이 무시됨','교정':converted,'말뚝다섯실제장축':axes,'말뚝높이검사':True,'사다리형균사제거':count,'게임코드변경':0},ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/회전실제행렬_검수후보.blend'));S.render.filepath=str(R/'renders/실제회전_말뚝접지검수.png');bpy.ops.render.render(write_still=True)
