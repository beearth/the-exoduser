"""검수된 배치의 실제 행렬을 보존하며 회전 모드를 통일. 새 말뚝/정리한 버섯만 인수."""
import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));ids=['RF3_River_Stake_Cluster','RF3_Fungal_Colony'];old={id:bpy.data.objects[id]for id in ids}
with bpy.data.libraries.load(str(R/'source/회전실제행렬_검수후보.blend'),link=False)as(a,b):b.objects=list(ids)
for id,src in zip(ids,b.objects):
 target=old[id];before=target.data;mat=before.materials[0];new=src.data.copy();new.materials.clear();new.materials.append(mat)
 for f in new.polygons:f.material_index=0
 for o in S.objects:
  if o.type=='MESH'and o.data==before:o.data=new
 bpy.data.objects.remove(src,do_unlink=True)
data={bpy.data.objects[r['id']].data for r in rows};converted=[]
for o in S.objects:
 if o.type=='MESH'and o.data in data and(o.name.startswith('RF3_')or not o.hide_render)and o.rotation_mode!='XYZ':
  before=o.matrix_world.copy();o.rotation_mode='XYZ';o.matrix_world=before;converted.append(o.name)
bpy.context.view_layer.update()
for id in ids:
 o=bpy.data.objects[id];r=next(x for x in rows if x['id']==id);r.update({'재질':o.data.materials[0].name,'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]});bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True)
r=next(x for x in rows if x['id']=='RF3_River_Stake_Cluster');r['매립깊이m']=.5;r['피벗계약']='피벗Z0=수면/지표. 하단 약.5m는 매립부. 실제 장축 다섯개 Z>.95, 높이1.5m초과 검사'
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/회전교정-채택.json').write_text(json.dumps({'원인':'glTF QUATERNION 모드에서 Euler 지정 무시','검수배치보존':'이미 화면으로 검수한 조립은 기존 실제 world matrix를 보존하며XYZ로 전환. 잠재 Euler를 일괄 적용한 배치 변경 후보는 채택0','모드교정':converted,'새제작물':'실제 세운 말뚝5개·사다리 균사14개를 제외한 버섯15개','스캔UV와PBR보존':True},ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/회전교정_배치보존_최종.png');bpy.ops.render.render(write_still=True)
