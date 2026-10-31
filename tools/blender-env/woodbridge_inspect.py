import bpy,json
from pathlib import Path
src=Path('I:/EXODUSER-Storage/demo-art/map/r2/source/r2_one_mass_lod_baked.blend')
with bpy.data.libraries.load(str(src),link=False) as (a,b):b.objects=['MASS_rotten_foot_scanned_stump','MASS_broken_rising_trunk_scanned']
for o in b.objects:
 pts=[o.matrix_world@v.co for v in o.data.vertices]
 print(o.name,'정점',len(pts),'범위',[min(v[k] for v in pts) for k in range(3)]+[max(v[k] for v in pts) for k in range(3)],'재질',[m.name for m in o.data.materials],flush=True)
 print('UV',[u.name for u in o.data.uv_layers],flush=True)
 for m in o.data.materials:print(m.name,[(n.type,n.image.filepath if n.type=='TEX_IMAGE' and n.image else '') for n in m.node_tree.nodes],flush=True)
