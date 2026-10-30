import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'))
for o in bpy.context.scene.objects:
 if o.type=='MESH'and not o.hide_render and any('독액'in m.name or '거품'in m.name for m in o.data.materials if m):print('SURFACE',o.name,list(o.location),list(o.dimensions),'WORLD Z',min((o.matrix_world@v.co).z for v in o.data.vertices),max((o.matrix_world@v.co).z for v in o.data.vertices),[(m.name)for m in o.data.materials],flush=True)
for name in ['독액_기준대리물_비납품','검수_유기거품막']:
 m=bpy.data.materials.get(name)
 if m:
  for n in m.node_tree.nodes:
   if n.type in ['BUMP','BSDF_PRINCIPLED','TEX_NOISE']:print('MAT',name,n.type,[(i.name,list(i.default_value)if hasattr(i.default_value,'__len__')else i.default_value,i.is_linked)for i in n.inputs if hasattr(i,'default_value')],flush=True)
