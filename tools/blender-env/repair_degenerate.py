import bpy,bmesh,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env')
bpy.ops.wm.open_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));name='HE_Ash_Gravel';o=bpy.data.objects[name]
bm=bmesh.new();bm.from_mesh(o.data);bad=[f for f in bm.faces if f.calc_area()<1e-9];details=[{'면적m2':f.calc_area(),'중심':list(f.calc_center_median())} for f in bad]
assert len(bad)==4,('예상과다른퇴화면',len(bad),details)
bmesh.ops.delete(bm,geom=bad,context='FACES');orphan=[v for v in bm.verts if not v.link_faces]
if orphan:bmesh.ops.delete(bm,geom=orphan,context='VERTS')
bm.to_mesh(o.data);bm.free();o.data.update()
for ob in bpy.context.scene.objects:ob.hide_set(False);ob.select_set(False)
o.select_set(True);bpy.context.view_layer.objects.active=o
bpy.ops.export_scene.fbx(filepath=str(R/'delivery/Assets/Exoduser/Art/Environment/CH1_1/Models'/(name+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',use_mesh_modifiers=True,bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
for r in rows:
 if r['id']==name:r['정점']=len(o.data.vertices);r['삼각형']=len(o.data.polygons)
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
(R/'퇴화면-수정.json').write_text(json.dumps({'대상':name,'제거':details,'기준':'퇴화면 <1e-9m², 검사의 기준을 낮추지 않고 실제 면을 제거','검사절차오류':'수정 전 동일 퇴화면 실패가 3회 로그에 남았으나 구 영수증을 읽어 통과로 오인했다. 마지막 전체 재수입과 최신 파일 SHA만 최종 근거로 사용한다.'},ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
print('퇴화면 실제 제거',len(bad),'완료',flush=True)
