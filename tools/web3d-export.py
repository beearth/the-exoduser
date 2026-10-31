"""Read-only R3 intake: shared FBX/source meshes -> glTF + native Core floor mask.
Run with Blender 5.1 in background. Never saves or changes the source blend.
"""
import bpy, json, math
from pathlib import Path
from collections import deque
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path('G:/exoduser-wt/codex-web3d')
DEST = ROOT / 'assets/web3d'
SOURCE = Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3/source/승인구도_납품동일.blend')
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene = bpy.context.scene
objects = [o for o in scene.objects if o.type == 'MESH' and not o.hide_render
           and any(m and '_Baked' in m.name for m in o.data.materials)]
terrain = next(o for o in objects if 'Continuous_Bank_Terrain' in o.name)
bridge = next(o for o in objects if 'Rotten_Wood_Bridge' in o.name)
# The original R3 has several full-width plank gaps and disconnected bank lips.
# This owned trial adds a lower repair deck; falling/swimming is not a native Core rule.
repairs=[]
for i in range(34):
    y=-6.6+i*.4
    top=.46 if abs(y)<5.4 else .46+(abs(y)-5.4)*.23
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,y,top-.045))
    plank=bpy.context.object;plank.name='Web3D_Repair_Deck_%02d'%i
    plank.dimensions=(3.30,.386,.09)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    plank.data.materials.append(bridge.data.materials[0]);repairs.append(plank)
objects.extend(repairs)
depsgraph = bpy.context.evaluated_depsgraph_get()
surfaces = []
for o in [terrain, bridge]+repairs:
    eo = o.evaluated_get(depsgraph)
    mesh = eo.to_mesh()
    verts = [o.matrix_world @ v.co for v in mesh.vertices]
    surfaces.append(BVHTree.FromPolygons(verts, [list(p.vertices) for p in mesh.polygons]))
    eo.to_mesh_clear()

mw, mh, cell = 200, 220, .4
heights, cells = [], []
trees = [o for o in objects if 'Ancient_Tree' in o.name]
for cy in range(mh):
    for cx in range(mw):
        x, y = (cx+.5)*cell-40, 60-(cy+.5)*cell
        hits = []
        for bvh in surfaces:
            hit = bvh.ray_cast(Vector((x,y,4)), Vector((0,0,-1)), 10)
            if hit[0] is not None and hit[1].z > .35:
                hits.append((hit[0].z, hit[1].z))
        h, nz = max(hits, default=(-2, 0))
        # Rails are not a walking surface. The deck stays on the native floor plane.
        on_bridge = abs(x) < 1.58 and abs(y) < 6.6
        walk = h > .29 and nz > .35 and (abs(y) > 6.6 or not abs(x) < 2.8 or on_bridge)
        for tree in trees:
            p = tree.matrix_world.translation
            if math.hypot(x-p.x,y-p.y) < .68*max(abs(v) for v in tree.scale):
                walk = False
        heights.append(round(h, 3))
        cells.append(1 if walk and cx > 1 and cy > 1 and cx < mw-2 and cy < mh-2 else 2)

start = (100, 158)
if cells[start[1]*mw+start[0]] != 1:
    start = min(((x,y) for y in range(mh) for x in range(mw) if cells[y*mw+x] == 1),
                key=lambda p: (p[0]-100)**2+(p[1]-158)**2)
seen = {start}
queue = deque([start])
while queue:
    x,y = queue.popleft()
    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
        q=(x+dx,y+dy)
        if q not in seen and 0<=q[0]<mw and 0<=q[1]<mh and cells[q[1]*mw+q[0]]==1:
            seen.add(q); queue.append(q)
for cy in range(mh):
    for cx in range(mw):
        if (cx,cy) not in seen: cells[cy*mw+cx]=2
rle=[]
for c in cells:
    if rle and rle[-2]==c: rle[-1]+=1
    else: rle.extend([c,1])
template = dict(mw=mw,mh=mh,_testbed=True,rooms=[
    dict(id='s',type='start',cx=start[0],cy=start[1],shape='rect',rx=3,ry=3),
    dict(id='n',type='combat',cx=100,cy=120,shape='ellipse',rx=16,ry=10),
    dict(id='b',type='boss',cx=100,cy=20,shape='ellipse',rx=8,ry=5)],
    corridors=[],objects=[],objs=[],portals=[],spawnHoles=[dict(x=102,y=124,size='S')],tileRLE=rle)
map_data = dict(template=template,heights=heights,origin=[40,60],cell=.4,
                source=str(SOURCE),walkable=len(seen),start=list(start))
DEST.mkdir(parents=True,exist_ok=True)
(DEST/'bridge-map.json').write_text(json.dumps(map_data,separators=(',',':')),encoding='utf8')
# Native map data is synchronously available before game.html starts, only with both flags.
(ROOT/'web3d/bridge-map.js').write_text(
    "/* R3 authored scene, opt-in native Core template. See WEB3D_TRIAL_20261031.md. */\n"
    "if(new URLSearchParams(location.search).get('r3d')==='1'&&new URLSearchParams(location.search).get('r3dScene')==='bridge'){\n"
    "window._Web3DTrialMap="+json.dumps(template,separators=(',',':'))+";\n}\n",encoding='utf8')

bpy.ops.object.select_all(action='DESELECT')
for o in objects:
    o.hide_set(False); o.select_set(True)
    o['web3dModule'] = next(m.name.split('_Baked')[0] for m in o.data.materials if m and '_Baked' in m.name)
# Preserve shared mesh data: 18 source meshes, 1548 placements, no duplicate geometry.
bpy.ops.export_scene.gltf(filepath=str(DEST/'forest-assembly.glb'),export_format='GLB',
    use_selection=True,export_materials='NONE',export_extras=True,export_cameras=False,
    export_lights=False,export_animations=False,export_yup=True)
receipt = dict(source=str(SOURCE),objects=len(objects),meshes=len(set(o.data.name for o in objects)),
               modules=sorted(set(o['web3dModule'] for o in objects)),nav_cells=len(seen),start=start,
               camera=list(scene.camera.location),torches=[list(o.location) for o in scene.objects
               if o.type=='LIGHT' and o.data.type=='POINT' and not o.hide_render])
(DEST/'scene.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf8')
print('WEB3D_EXPORT_COMPLETE',json.dumps(receipt,ensure_ascii=False))
