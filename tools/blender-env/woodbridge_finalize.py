import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'))
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for r in rows:
 o=bpy.data.objects[r['id']];mat=o.data.materials[0];expected=r['id']+'_베이크표적';old=bpy.data.materials.get(expected)
 if old and old!=mat:old.name='보존_'+expected
 mat.name=expected
 for n in mat.node_tree.nodes:
  if n.type=='TEX_IMAGE' and n.image:
   p=P/'Textures'/Path(n.image.filepath).name
   if p.exists():
    if n.image.packed_file:n.image.unpack(method='REMOVE')
    n.image.filepath=str(p);n.image.reload()
 bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o
 bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(r['id']+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
 o.hide_set(True);o.hide_render=True
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'))
print('실제FBX 재질명 정규화·최종 PNG 패킹 완료',len(rows),flush=True)
