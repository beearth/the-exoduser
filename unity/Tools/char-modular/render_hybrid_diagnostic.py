"""Visualise existing second-test contacts; NO BVH rerun or authoring mutation."""
import argparse
import csv
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
from hybrid_poses import Poses
p=argparse.ArgumentParser()
p.add_argument("--blend",type=Path,required=True)
p.add_argument("--numeric",type=Path,required=True)
p.add_argument("--out",type=Path,required=True)
args=p.parse_args(sys.argv[sys.argv.index("--")+1:])
result=json.loads((args.numeric/"receipt.json").read_text(encoding="utf-8"))
assert result["attempt"]==2 and result["stopAfterSecondFailure"]
rows=list(csv.DictReader((args.numeric/"pairs.csv").open(encoding="utf-8-sig")))
pose="elbow140"
selected=[r for r in rows if r["pose"]==pose and int(r["overlapTrianglePairs"])>0]
red={r[k] for r in selected for k in ("a","b")}
bpy.ops.wm.open_mainfile(filepath=str(args.blend.resolve()))
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
Poses(rig).apply(pose)
materials=[]
for name,color in (("Contact red",(.7,.012,.008,1)),("Neutral untextured",(.26,.28,.29,1))):
    mat=bpy.data.materials.new(name);mat.diffuse_color=color;mat.use_nodes=True
    bsdf=mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value=color;bsdf.inputs["Roughness"].default_value=.65
    materials.append(mat)
for obj in bpy.context.scene.objects:
    if obj.type!="MESH":continue
    obj.data.materials.clear();obj.data.materials.append(materials[0] if obj.name in red else materials[1])
    for face in obj.data.polygons:face.material_index=0
scene=bpy.context.scene;scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=12;scene.cycles.use_denoising=True
scene.render.resolution_x=768;scene.render.resolution_y=768;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new("Diagnostic world");scene.world.use_nodes=True
scene.world.node_tree.nodes["Background"].inputs[0].default_value=(.09,.10,.11,1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value=.8
for name,position,energy in (("Key",(-3,-4,6),600),("Fill",(4,2,3),300)):
    obj=bpy.data.objects.new(name,bpy.data.lights.new(name,"AREA"));scene.collection.objects.link(obj)
    obj.location=position;obj.data.energy=energy;obj.data.size=4
    obj.rotation_euler=(Vector((0,0,.95))-obj.location).to_track_quat("-Z","Y").to_euler()
camera=bpy.data.objects.new("34 degree contact diagnostic",bpy.data.cameras.new("34 degree contact diagnostic"))
scene.collection.objects.link(camera);scene.camera=camera
camera.data.sensor_fit="VERTICAL";camera.data.sensor_height=24;camera.data.lens=24/(2*math.tan(math.radians(46.9453/2)))
target=Vector((0,0,.95));camera.location=target+Vector((0,-math.cos(math.radians(34)),math.sin(math.radians(34))))*3
camera.rotation_euler=(target-camera.location).to_track_quat("-Z","Y").to_euler()
args.out.parent.mkdir(parents=True,exist_ok=True)
scene.render.filepath=str(args.out);bpy.ops.render.render(write_still=True)
receipt={"scope":"Existing BVH attempt2 contact diagnosis only; NOT a PASS/1x/LOCK comparison or third test",
 "pose":pose,"redMeaning":"triangle surface intersection pairs from existing CSV; does NOT assert >3mm penetration",
 "redObjects":sorted(red),"pairCount":len(selected),"pitch":34,"distance":3,"verticalFov":46.9453,
 "numericRerun":False,"authoringSaved":False,"texturesGenerated":False}
args.out.with_suffix(".json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("EXISTING_CONTACT_DIAGNOSTIC_WRITTEN; no third numeric test, no authoring save")
