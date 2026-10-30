"""원뿔 말뚝을 실물 파단 목질로 교체하고 버섯의 원화 대비 비례를 보정."""
import bpy,bmesh,math,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;id='RF3_River_Stake_Cluster';old=bpy.data.objects[id];oldmesh=old.data;src=bpy.data.objects['RF3_Fallen_Log'];parts=[]
for j in range(5):
 o=src.copy();o.data=src.data.copy();S.collection.objects.link(o);o.hide_render=False;o.hide_set(False);o.rotation_mode='XYZ';o.scale=(.20+.06*(j%3),.12,.12);o.rotation_euler=(.04*math.sin(j),-math.pi/2+.15*math.sin(j*1.6),j*.65);o.location=(-1.4+j*.65,.26*math.sin(j*2.2),.6+.12*(j%2));bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);de=o.modifiers.new('작은파단목질_LOD','DECIMATE');de.ratio=.18;bpy.ops.object.modifier_apply(modifier=de.name);parts.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();tmp=parts[0];old.data=tmp.data.copy();m=src.data.materials[0].copy();m.name=id+'_Baked';old.data.materials.clear();old.data.materials.append(m)
for f in old.data.polygons:f.material_index=0
bm=bmesh.new();bm.from_mesh(old.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if not v.link_faces],context='VERTS');bm.to_mesh(old.data);bm.free()
for o in S.objects:
 if o.data==oldmesh:o.data=old.data
bpy.data.objects.remove(tmp,do_unlink=True);old.hide_set(False);bpy.ops.object.select_all(action='DESELECT');old.select_set(True);bpy.context.view_layer.objects.active=old;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);old.hide_set(True)
rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));r=next(r for r in rows if r['id']==id);base=next(r for r in rows if r['id']=='RF3_Fallen_Log');r.update({'역할':'실물 파단 목질5개의 불규칙 침수 말뚝·공유 베이크 atlas','맵':base['맵'].copy(),'텍스처규격':base['텍스처규격'],'텍스처해상도':base['텍스처해상도'],'재질':m.name,'정점':len(old.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in old.data.polygons),'bounds':[min(v.co[k]for v in old.data.vertices)for k in range(3)]+[max(v.co[k]for v in old.data.vertices)for k in range(3)],'베이크':'실물 Fallen_Log 베이크 atlas/UV 공유. 작은파단목질 LOD, 추가 원뿔 없음'})
fungal=bpy.data.objects['RF3_Fungal_Colony'].data
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data==fungal:o.scale*=.62
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/말뚝버섯_검수.png');bpy.ops.render.render(write_still=True)
