"""승인 원화의 다리/강가 화면 위치에 맞추고 스캔의 남은 바닥 받침을 제거한다."""
import bpy,bmesh,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));change=[]
for id in ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B','RF3_Root_Stump']:
 for suffix in ['', '_High']:
  o=bpy.data.objects.get(id+suffix)
  if not o:continue
  bm=bmesh.new();bm.from_mesh(o.data);bm.normal_update();bad=[f for f in bm.faces if f.calc_center_median().z<.85 and f.normal.z>.60]
  if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
  loose=[v for v in bm.verts if not v.link_faces]
  if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
  bm.to_mesh(o.data);bm.free();change.append({'id':id+suffix,'잔여수평받침제거':len(bad)})
  if not suffix:
   bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True);r=next(r for r in rows if r['id']==id);r.update({'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]})
cam=S.camera;cam.location=(28,-27,27);target=Vector((4,0,1));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=45;bpy.context.view_layer.update()
anchors={name:list(world_to_camera_view(S,cam,Vector(p)))for name,p in [('다리남쪽',(0,-5.4,.6)),('다리북쪽',(0,5.4,.6)),('좌측거목',(-7.3,-4.3,.5)),('강가그루터기',(6.2,.8,1.1))]}
# 큰 뿌리의 상면에는 부피가 있는 이끼 쿠션을 잇는다. 아래로 늘어지는 카드와 구분한다.
src=bpy.data.objects['RF3_Moss_Cushion']
for j,(x,y,z,s)in enumerate([(-8,-5,1,.8),(-7,-4,1.4,1),(-9.4,-4.8,.7,.9),(-5.8,-4.2,.65,.9),(-9.6,6.1,.8,.85),(5.4,13.3,.7,.9),(6.1,14.4,1.2,.8),(5.8,.6,.9,.65)]):
 o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='뿌리의_이끼질량';o.location=(x,y,z);o.scale=(s,s,s*.5);o.rotation_euler.z=j*1.2;o.hide_render=False;o.hide_set(False)
S.render.resolution_percentage=38;S.cycles.samples=16
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/구도-접지마감.json').write_text(json.dumps({'카메라XYZ':list(cam.location),'목표':list(target),'초점mm':cam.data.lens,'수평대비하향각':math.degrees(math.atan2(26,math.hypot(24,27))),'화면정규화앵커':anchors,'실제수정':change,'UV보존':'잔여 받침 면만 제거. 남은 면의 UV/기존 베이크 보존'},ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/구도마감_검수.png');bpy.ops.render.render(write_still=True)
