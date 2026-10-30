"""각진 구 전경 뿌리 대신 이미 베이크한 실물 파단 목질로 전경 모듈을 교체."""
import bpy,bmesh,math,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;src=bpy.data.objects['RF3_Fallen_Log'];id='RF3_Foreground_Branch_Frame';old=bpy.data.objects[id];oldmesh=old.data;parts=[]
for loc,sc,a in [((0,0,0),(.9,.65,.70),0),((-1.2,.25,.2),(.55,.40,.50),.72)]:
 o=src.copy();o.data=src.data.copy();S.collection.objects.link(o);o.hide_render=False;o.hide_set(False);o.rotation_mode='XYZ';o.location=loc;o.scale=sc;o.rotation_euler.z=a;bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);parts.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();tmp=parts[0];old.data=tmp.data.copy();m=src.data.materials[0].copy();m.name=id+'_Baked';old.data.materials.clear();old.data.materials.append(m)
for f in old.data.polygons:f.material_index=0
for o in S.objects:
 if o.data==oldmesh:o.data=old.data
bpy.data.objects.remove(tmp,do_unlink=True);old.hide_set(False);bpy.ops.object.select_all(action='DESELECT');old.select_set(True);bpy.context.view_layer.objects.active=old;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);old.hide_set(True)
rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));r=next(r for r in rows if r['id']==id);base=next(r for r in rows if r['id']=='RF3_Fallen_Log');r.update({'역할':'CC0 실물 파단 목질2개를 접합한 전경 프레임·공유 베이크 atlas','맵':base['맵'].copy(),'텍스처규격':base['텍스처규격'],'텍스처해상도':base['텍스처해상도'],'재질':m.name,'정점':len(old.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in old.data.polygons),'bounds':[min(v.co[k]for v in old.data.vertices)for k in range(3)]+[max(v.co[k]for v in old.data.vertices)for k in range(3)],'베이크':'RF3_Fallen_Log의 실제 스캔 high→low 베이크를 UV 동일하게 공유. 추가 절차적 뿔/판근 없음'})
for o in list(S.objects):
 if o.name.startswith('승인전경_'):bpy.data.objects.remove(o,do_unlink=True)
o=old.copy();o.data=old.data;S.collection.objects.link(o);o.name='승인전경_실물목질';o.location=(6,-10.5,1.25);o.scale=(2.1,1.4,1.3);o.rotation_euler.z=math.radians(34);o.hide_render=False;o.hide_set(False)
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/실물전경_검수.png');bpy.ops.render.render(write_still=True)
