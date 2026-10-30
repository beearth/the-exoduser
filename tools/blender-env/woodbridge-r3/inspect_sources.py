import bpy,json,math
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3')
bpy.ops.wm.read_factory_settings(use_empty=True)
records=[]
for idx,id in enumerate(['tree_stump_02','dead_tree_trunk_02','rock_moss_set_01','dry_branches_medium_01','shrub_03','moss_01']):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'scan-source'/id/(id+'.gltf')))
 obs=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
 for o in obs:
  pts=[o.matrix_world@Vector(p) for p in o.bound_box];mn=Vector([min(p[k] for p in pts) for k in range(3)]);mx=Vector([max(p[k] for p in pts) for k in range(3)])
  records.append({'source':id,'object':o.name,'vertices':len(o.data.vertices),'bounds':[list(mn),list(mx)],'mats':[m.name for m in o.data.materials]})
  print(records[-1],flush=True)
(R/'source/스캔-구조검사.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/스캔-원본.blend'))
