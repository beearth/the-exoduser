"""Close a five-edge spike-removal hole and restore only A104's original surface.
The previous solidify/decimate produced touching inner shells at A104. Restore
the same approved raw outer surface and cap its open underside; no finger edit.
"""
import bpy
import bmesh
import json
from pathlib import Path
import sys
from mathutils import Matrix,Vector
sys.path.insert(0,str(Path(__file__).parent))
from geometry_metrics import Snapshot
from modular_bind import rigid_bind

folder=Path(__file__).parent
bpy.ops.wm.open_mainfile(filepath=str((folder/"Warrior_Modular.blend").resolve()))
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
head=bpy.data.objects["Warrior_Head"]
fixed=[head.matrix_world@v.co for v in head.data.vertices]

def cap_loops(bm):
    edges={e for e in bm.edges if e.is_boundary};caps=0
    while edges:
        first=edges.pop();loop=[first.verts[0],first.verts[1]];current=loop[-1]
        while current is not loop[0]:
            edge=next((e for e in current.link_edges if e in edges),None)
            if edge is None:raise RuntimeError("Boundary is not a simple closed ring")
            edges.remove(edge);current=edge.other_vert(current)
            if current is not loop[0]:loop.append(current)
        center=bm.verts.new(sum((v.co for v in loop),Vector())/len(loop))
        for i,v in enumerate(loop):bm.faces.new((v,loop[(i+1)%len(loop)],center));caps+=1
    return caps

obj=bpy.data.objects["W15_A_018"]
bm=bmesh.new();bm.from_mesh(obj.data);spike_caps=cap_loops(bm)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()

old=bpy.data.objects["W13_A_104"];frame=old.matrix_world.copy();materials=list(old.data.materials)
existing=set(bpy.context.scene.objects)
bpy.ops.import_scene.gltf(filepath=str((folder/"Warrior_Tripo_Parts.glb").resolve()))
added=[o for o in bpy.context.scene.objects if o not in existing]
meshes=[o for o in added if o.type=="MESH"]
points=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
low=Vector(tuple(min(v[i] for v in points) for i in range(3)));high=Vector(tuple(max(v[i] for v in points) for i in range(3)))
factor=1.85/(high.z-low.z);center=Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z))
obj=next(o for o in meshes if o.name.split(".")[0]=="tripo_part_104")
world=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=Matrix.Identity(4)
hand=rig.matrix_world@rig.data.bones["RightHand"].head_local
offset=hand-Vector((-.392,-.07,.975))
for v in obj.data.vertices:v.co=(world@v.co-center)*factor+offset
for other in added:
    if other is not obj:bpy.data.objects.remove(other,do_unlink=True)
bpy.data.objects.remove(old,do_unlink=True);obj.name="W13_A_104"
bm=bmesh.new();bm.from_mesh(obj.data)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6)
bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=1e-8)
raw_caps=cap_loops(bm)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
obj.data.materials.clear()
for mat in materials:obj.data.materials.append(mat)
for face in obj.data.polygons:face.material_index=0
obj.data.transform(frame.inverted());obj.matrix_world=frame
for key,value in {"char_modular_source":"A","char_modular_source_id":104,"char_modular_group":"W13","char_modular_hybrid":True}.items():obj[key]=value
rigid_bind(obj,rig,"RightHand")
rows=[]
for name in ("W15_A_018","W04_A_042","W11_A_041","W13_A_104"):
    snap=Snapshot(bpy.data.objects[name]);rows.append({"object":name,"closed":snap.closed,"boundaryVertices":len(snap.boundary_indices),"nonmanifoldEdges":snap.nonmanifold_edges});snap.close()
assert all(r["closed"] for r in rows),rows
assert max((head.matrix_world@v.co-p).length for v,p in zip(head.data.vertices,fixed))<1e-9
triangles=sum(sum(len(f.vertices)-2 for f in o.data.polygons) for o in bpy.context.scene.objects if o.type=="MESH")
assert 25000<=triangles<=40000,triangles
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str((folder/"Warrior_Modular.blend").resolve()),compress=True)
out=Path("I:/EXODUSER-Storage/char-modular/topology-final-current.json")
out.write_text(json.dumps({"scope":"Second targeted cleanup topology verification", "parts":rows,"spikeHoleCapTriangles":spike_caps,
 "restoredA104UndersideCapTriangles":raw_caps,"outerSurface":"Approved A104 original unchanged, only underside capped", "triangles":triangles,"headChangeMm":0},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("TOPOLOGY_FINAL_PASS",rows,"triangles",triangles)
