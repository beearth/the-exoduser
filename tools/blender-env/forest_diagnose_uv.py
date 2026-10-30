import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_형태.blend'));o=bpy.data.objects['RF_Ancient_Rotten_Tree'];old=o.data
print('원본속성',[(a.name,a.data_type,a.domain,len(a.data)) for a in old.attributes],flush=True)
print('원본UV',[(u.name,len(u.data)) for u in old.uv_layers],flush=True)
# 스캔/절차식 메시 join 이후 편집모드의 custom-data 해제 스택에서 충돌.
# 위치·면·재질만 새 Mesh에 재구성하여 UV 재작성에 필요 없는 이전 custom-data를 제거한다.
me=bpy.data.meshes.new('검증_깨끗한기하');me.from_pydata([tuple(v.co) for v in old.vertices],[],[tuple(f.vertices) for f in old.polygons]);me.update()
for m in old.materials:me.materials.append(m)
for a,b in zip(me.polygons,old.polygons):a.material_index=b.material_index;a.use_smooth=b.use_smooth
assert len(me.vertices)==len(old.vertices) and len(me.polygons)==len(old.polygons)
o.data=me;bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o
print('새메시검사',me.validate(verbose=True),len(me.vertices),len(me.polygons),flush=True)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');print('UV진입',flush=True);bpy.ops.uv.smart_project(angle_limit=1.05,island_margin=.025);print('UV완료_모드종료직전',flush=True);bpy.ops.object.mode_set(mode='OBJECT');print('편집모드종료PASS',flush=True)
(R/'source/UV_새메시검사.json').write_text(json.dumps({'위치면수보존':True,'정점':len(me.vertices),'면':len(me.polygons),'UV루프':len(me.uv_layers.active.data),'편집모드종료':'PASS','실패원인범위':'기존 join 메시의 custom-data 해제. Blender 내부 세부 결함은 미확정'},ensure_ascii=False,indent=2),encoding='utf8')
