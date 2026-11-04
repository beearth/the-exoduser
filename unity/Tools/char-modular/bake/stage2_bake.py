"""Stage 2: bake Tripo per-part textures (aligned to the authored A-pose) onto the atlas UV of the authored parts.
Cycles selected-to-active, Diffuse Color only. Per part: source = same-named Tripo mesh. Blender -b only."""
import bpy, json, sys, time, numpy as np
from mathutils import Matrix, Vector
WORK = "I:/EXODUSER-Storage/char-modular/bake/work"
GLB = "G:/exoduser-wt/codex-rigpixel/unity/Tools/char-modular/Warrior_AB_Prop_Tripo_Tex4K.glb"
ALIGN = json.load(open("I:/EXODUSER-Storage/char-modular/bake/align.json"))
EXTRUSION = .0015
MAXRAY = .006
MARGIN = 3
LIMIT = int(sys.argv[sys.argv.index("--") + 1]) if "--" in sys.argv and len(sys.argv) > sys.argv.index("--") + 1 else 0
bpy.ops.wm.open_mainfile(filepath=WORK + "/Warrior_Modular_uv.blend")
sc = bpy.context.scene
rig = next(o for o in sc.objects if o.type == "ARMATURE")
for b in rig.pose.bones:
    b.matrix_basis.identity()
bpy.context.view_layer.update()
deps = bpy.context.evaluated_depsgraph_get()
srcobjs = [o for o in sc.objects if o.type == "MESH" and o.get("char_modular_role") in ("rigid", "soft") and o["char_modular_group"] != "W25"]
staged = []
for o in sorted(srcobjs, key=lambda o: o.name):
    ev = o.evaluated_get(deps)
    me = bpy.data.meshes.new_from_object(ev, depsgraph=deps)
    me.transform(o.matrix_world)
    assert "UVMap" in me.uv_layers, o.name
    staged.append((o.name, me))
for o in list(sc.objects):
    bpy.data.objects.remove(o, do_unlink=True)
coll = sc.collection
targets = {}
for name, me in staged:
    t = bpy.data.objects.new("T_" + name, me)
    coll.objects.link(t)
    targets[name] = t
# ------------------------------------------------------------ Tripo sources
bpy.ops.import_scene.gltf(filepath=GLB)
M = Matrix.Translation(ALIGN["t"]) @ Matrix(ALIGN["R"]).to_4x4() @ Matrix.Scale(ALIGN["scale"], 4)
for o in sc.objects:
    if o.parent is None and not o.name.startswith("T_"):
        o.matrix_world = M @ o.matrix_world
bpy.context.view_layer.update()
sources = {o.name: o for o in sc.objects if o.type == "MESH" and not o.name.startswith("T_")}
assert set(sources) == set(targets), (len(sources), len(targets))
for o in sources.values():
    mat = o.data.materials[0]
    img = next(n.image for n in mat.node_tree.nodes if n.type == "TEX_IMAGE" and n.image)
    nm = bpy.data.materials.new("S_" + o.name)
    nm.use_nodes = True
    nt = nm.node_tree
    nt.nodes.clear()
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img; tex.interpolation = "Cubic"
    diff = nt.nodes.new("ShaderNodeBsdfDiffuse")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tex.outputs["Color"], diff.inputs["Color"]); nt.links.new(diff.outputs["BSDF"], out.inputs["Surface"])
    o.data.materials.clear(); o.data.materials.append(nm)
# ------------------------------------------------------------ atlas + target materials
SIDE = 4096
atlas = bpy.data.images.new("Warrior_Atlas_Raw", SIDE, SIDE, alpha=False, float_buffer=False)
atlas.colorspace_settings.name = "sRGB"
atlas.pixels.foreach_set(np.tile(np.array([.10, .09, .085, 1.0], dtype=np.float32), SIDE * SIDE))
tmat = bpy.data.materials.new("BakeTarget")
tmat.use_nodes = True
tn = tmat.node_tree.nodes.new("ShaderNodeTexImage"); tn.image = atlas
tmat.node_tree.nodes.active = tn
for t in targets.values():
    t.data.materials.clear(); t.data.materials.append(tmat)
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 1; sc.cycles.use_denoising = False
sc.cycles.bake_type = "DIFFUSE"
log = []
t0 = time.time()
names = sorted(targets)
if LIMIT:
    names = names[:LIMIT]
for i, name in enumerate(names):
    bpy.ops.object.select_all(action="DESELECT")
    sources[name].select_set(True)
    targets[name].select_set(True)
    bpy.context.view_layer.objects.active = targets[name]
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"COLOR"}, use_selected_to_active=True, cage_extrusion=EXTRUSION, max_ray_distance=MAXRAY,
                        margin=MARGIN, margin_type="EXTEND", use_clear=False, target="IMAGE_TEXTURES")
    log.append(name)
    if i % 10 == 0:
        print("BAKED", i + 1, "/", len(names), "%.0fs" % (time.time() - t0), flush=True)
atlas.filepath_raw = WORK + "/atlas_raw.png"
atlas.file_format = "PNG"
atlas.save()
json.dump({"parts": len(log), "seconds": round(time.time() - t0), "extrusionM": EXTRUSION, "maxRayM": MAXRAY, "marginPx": MARGIN}, open(WORK + "/stage2.json", "w"))
print("STAGE2 done", len(log), "parts", "%.0fs" % (time.time() - t0))
