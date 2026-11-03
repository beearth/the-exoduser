"""Read exact welded-edge neighbourhood; no mutation or acceptance rerun."""
import bpy
import json
from pathlib import Path
import sys
import bmesh
sys.path.insert(0,str(Path(__file__).parent))
from geometry_metrics import Snapshot
bpy.ops.wm.open_mainfile(filepath=str((Path(__file__).parent/"Warrior_Modular.blend").resolve()))
rows=[]
for name in ("W15_A_018","W13_A_104"):
    snap=Snapshot(bpy.data.objects[name]);bm=bmesh.new()
    verts=[bm.verts.new(v) for v in snap.vertices]
    for tri in snap.triangles:
        try:bm.faces.new([verts[i] for i in tri])
        except ValueError:pass
    problems=[]
    for edge in bm.edges:
        if len(edge.link_faces)!=2:
            problems.append({"edge":[list(v.co) for v in edge.verts],"faces":[{"area":f.calc_area(),"verts":[list(v.co) for v in f.verts]} for f in edge.link_faces]})
    rows.append({"object":name,"edges":problems});bm.free();snap.close()
Path("I:/EXODUSER-Storage/char-modular/local-topology-current.json").write_text(json.dumps(rows,indent=2)+"\n",encoding="utf-8")
print(json.dumps(rows))
