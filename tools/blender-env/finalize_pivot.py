import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env');name='HE_Deadwood_Hollow'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
for id in [name,name+'_High']:
 o=bpy.data.objects[id]
 for v in o.data.vertices:v.co.z-=.6
low=bpy.data.objects[name]
for o in bpy.context.scene.objects:o.hide_set(False);o.select_set(False)
low.select_set(True);bpy.context.view_layer.objects.active=low
bpy.ops.export_scene.fbx(filepath=str(R/'delivery/Assets/Exoduser/Art/Environment/CH1_1/Models'/(name+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',use_mesh_modifiers=True,bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for r in rows:
 if r['id']==name:
  r['범위XYZ최소최대']=[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)];r['접지계약']='피벗 높이=지면. 음수Z 스캔 하부는 지면 아래. 텍스처 UV/형태 불변인 .6m 피벗 보정.'
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
print('고목 지면 피벗 보정 완료',flush=True)
