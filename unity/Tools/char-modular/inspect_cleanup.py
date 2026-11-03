"""Read-only cause investigation before 03:20 repairs; no acceptance gate."""
import bpy
import json
from pathlib import Path
import sys
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
from hybrid_poses import Poses

root=Path("I:/EXODUSER-Storage/char-modular")
bpy.ops.wm.open_mainfile(filepath=str((Path(__file__).parent/"Warrior_Modular.blend").resolve()))
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
poses=Poses(rig)
head=bpy.data.objects["Warrior_Head"]
head_points=[head.matrix_world@v.co for v in head.data.vertices]
profile=[]
for z in (1.50,1.52,1.54,1.56,1.58,1.60,1.62,1.64,1.66,1.68):
    points=[p for p in head_points if z<=p.z<z+.02]
    if points:profile.append({"z":z,"x":[min(p.x for p in points),max(p.x for p in points)],"y":[min(p.y for p in points),max(p.y for p in points)]})
records=[]
for label in ("rest","elbow140"):
    poses.apply(label);deps=bpy.context.evaluated_depsgraph_get()
    for obj in [o for o in bpy.context.scene.objects if o.type=="MESH"]:
        evaluated=obj.evaluated_get(deps);mesh=evaluated.to_mesh();points=[evaluated.matrix_world@v.co for v in mesh.vertices]
        bad=[]
        for face in mesh.polygons:
            world=[points[i] for i in face.vertices]
            edges=[(world[(i+1)%len(world)]-v).length for i,v in enumerate(world)]
            edge=max(edges)
            if edge>.35:
                area=sum((world[i]-world[0]).cross(world[i+1]-world[0]).length/2 for i in range(1,len(world)-1))
                altitude=2*area/max(edge,1e-9)
                if altitude<.012 or min(v.z for v in world)<-.02:
                    bad.append({"face":face.index,"edge":edge,"altitude":altitude,"minZ":min(v.z for v in world),"maxZ":max(v.z for v in world)})
        if bad or min(v.z for v in points)<-.02:
            records.append({"pose":label,"object":obj.name,"group":obj.get("char_modular_group"),"minZ":min(v.z for v in points),"longThinFaces":bad[:30],"count":len(bad)})
        evaluated.to_mesh_clear()
(root/"cleanup-investigation-current.json").write_text(json.dumps({"headProfile":profile,"suspects":records},indent=2)+"\n",encoding="utf-8")
print("HEAD_PROFILE",profile)
print("THIN_LINE_SUSPECTS",records)
