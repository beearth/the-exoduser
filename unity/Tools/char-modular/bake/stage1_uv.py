"""Stage 1: needle removal + per-part UV + family-region 4K atlas layout. Blender -b only. Writes a work copy (never the repo blend)."""
import bpy, bmesh, math, json, sys, numpy as np
from mathutils import Vector
SRC = "G:/exoduser-wt/codex-rigpixel/unity/Tools/char-modular/Warrior_Modular.blend"
OUT = "I:/EXODUSER-Storage/char-modular/bake/work/Warrior_Modular_uv.blend"
NPZ = "I:/EXODUSER-Storage/char-modular/bake/work/uv_tris.npz"
REPORT = "I:/EXODUSER-Storage/char-modular/bake/work/stage1.json"
ATLAS = 4096
_a = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ANGLE = float(_a[0]) if len(_a) > 0 else 66.0
GAP_PX = int(_a[1]) if len(_a) > 1 else 4
PAD = int(_a[2]) if len(_a) > 2 else 4
MULT = {"Iron": 1.0, "Cloth": .85, "Leather": 1.0, "Skin": 1.8, "Hair": 1.3}
FAMS = ("Iron", "Cloth", "Leather", "Skin", "Hair")
SOFT = {"W03", "W16", "W23", "W24"}
report = {"angle": ANGLE, "gapPx": GAP_PX, "padPx": PAD}
bpy.ops.wm.open_mainfile(filepath=SRC)
sc = bpy.context.scene
rig = next(o for o in sc.objects if o.type == "ARMATURE")
for b in rig.pose.bones:
    b.matrix_basis.identity()
bpy.context.view_layer.update()

# ---------------------------------------------------------------- needle
part = sc.objects["W12_A_046"]
bm = bmesh.new(); bm.from_mesh(part.data); bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
tip = max(bm.verts, key=lambda v: (part.matrix_world @ v.co).x)
tw = part.matrix_world @ tip.co
assert abs(tw.x - .6535) < .002 and len(tip.link_faces) == 4 and len(tip.link_edges) == 4, (tw, len(tip.link_faces))
faces = list(tip.link_faces)
normal = sum((f.normal for f in faces), Vector()).normalized()
base = [e.other_vert(tip) for e in tip.link_edges]
length = max((part.matrix_world @ b.co - tw).length for b in base)
report["needle"] = {"part": "W12_A_046", "tipWorld": [round(x, 4) for x in tw], "lengthMm": round(length * 1000, 1),
                    "trianglesRemoved": len(faces), "baseVerts": [b.index for b in base]}
bmesh.ops.delete(bm, geom=[tip], context="VERTS")
bm.verts.ensure_lookup_table()
loop = [b for b in base if b.is_valid]
c = sum((v.co for v in loop), Vector()) / 4
ax = (loop[0].co - c).normalized(); ay = normal.cross(ax).normalized()
loop.sort(key=lambda v: math.atan2((v.co - c).dot(ay), (v.co - c).dot(ax)))
f1 = bm.faces.new((loop[0], loop[1], loop[2])); f2 = bm.faces.new((loop[0], loop[2], loop[3]))
for f in (f1, f2):
    f.normal_update()
    if f.normal.dot(normal) < 0:
        f.normal_flip()
report["needle"]["capTriangles"] = 2
bm.to_mesh(part.data); bm.free(); part.data.update()
report["needle"]["trianglesNet"] = 2 - len(faces)

# ---------------------------------------------------------------- UV
meshes = [o for o in sc.objects if o.type == "MESH" and o.get("char_modular_role") in ("rigid", "soft") and o["char_modular_group"] != "W25"]


def family(o):
    g = o["char_modular_group"]
    return "Skin" if g == "W01" else "Hair" if g == "W02" else "Cloth" if g in SOFT else "Leather" if g == "W14" else "Iron"


fam_objs = {f: sorted([o for o in meshes if family(o) == f], key=lambda o: o.name) for f in FAMS}
report["partsPerFamily"] = {f: len(v) for f, v in fam_objs.items()}
for o in meshes:
    while o.data.uv_layers:
        o.data.uv_layers.remove(o.data.uv_layers[0])
    o.data.uv_layers.new(name="UVMap")
sc.tool_settings.use_uv_select_sync = True


def world_area(objs):
    a = 0.0
    for o in objs:
        M = o.matrix_world
        co = np.array([tuple(M @ v.co) for v in o.data.vertices])
        for p in o.data.polygons:
            v = p.vertices
            for k in range(1, len(v) - 1):
                a += np.linalg.norm(np.cross(co[v[k]] - co[v[0]], co[v[k + 1]] - co[v[0]])) / 2
    return a


def uv_area(objs):
    a = 0.0
    for o in objs:
        n = len(o.data.loops)
        uv = np.empty(n * 2); o.data.uv_layers["UVMap"].data.foreach_get("uv", uv); uv = uv.reshape(-1, 2)
        for p in o.data.polygons:
            li = list(p.loop_indices)
            for k in range(1, len(li) - 1):
                u0, u1, u2 = uv[li[0]], uv[li[k]], uv[li[k + 1]]
                a += abs((u1[0] - u0[0]) * (u2[1] - u0[1]) - (u2[0] - u0[0]) * (u1[1] - u0[1])) / 2
    return a


def edit(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")


def done():
    bpy.ops.object.mode_set(mode="OBJECT")


fam_area = {f: world_area(fam_objs[f]) for f in FAMS}
report["worldAreaM2"] = {f: round(a, 4) for f, a in fam_area.items()}
k = {}
for f in FAMS:
    objs = fam_objs[f]
    edit(objs)
    bpy.ops.uv.smart_project(angle_limit=math.radians(ANGLE), margin_method="FRACTION", island_margin=0.0, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.uv.average_islands_scale()
    side_px = 1000 * MULT[f] * math.sqrt(fam_area[f] / .7)
    for attempt in range(2):
        bpy.ops.uv.pack_islands(udim_source="CLOSEST_UDIM", rotate=True, rotate_method="ANY", scale=True, margin_method="FRACTION", margin=GAP_PX / max(side_px, 200), shape_method="CONCAVE")
        done()
        kf = math.sqrt(uv_area(objs) / fam_area[f])   # UV (unit square) per metre
        side_px = 1000 * MULT[f] / kf + 2 * PAD
        if attempt == 0:
            edit(objs)
    k[f] = kf
report["uvPerMetreUnit"] = {f: round(v, 4) for f, v in k.items()}


# ---------------------------------------------------------------- layout search (row1: Iron|Cloth, row2: Skin|Hair|Leather)
def sides(D):
    return {f: D * MULT[f] / k[f] + 2 * PAD for f in FAMS}


best = None
for D in range(1500, 400, -10):
    s = sides(D)
    row1w = s["Iron"] + s["Cloth"]; row1h = max(s["Iron"], s["Cloth"])
    row2w = s["Skin"] + s["Hair"] + s["Leather"]; row2h = max(s["Skin"], s["Hair"], s["Leather"])
    if row1w <= ATLAS and row2w <= ATLAS and row1h + row2h <= ATLAS:
        best = D
        break
assert best, "no layout fits"
s = {f: int(math.floor(v)) for f, v in sides(best).items()}
top = max(s["Iron"], s["Cloth"])
place = {"Iron": (0, 0), "Cloth": (s["Iron"], 0), "Skin": (0, top), "Hair": (s["Skin"], top), "Leather": (s["Skin"] + s["Hair"], top)}
report["baseDensityPxPerM"] = best
report["regions"] = {f: {"x": place[f][0], "y": place[f][1], "side": s[f], "densityPxPerM": round((s[f] - 2 * PAD) * k[f], 1)} for f in FAMS}
tris = []   # rows: u0 v0 u1 v1 u2 v2 (px), family, part index, worldArea
names = []
for f in FAMS:
    x0, y0 = place[f]; inner = s[f] - 2 * PAD
    for o in fam_objs[f]:
        n = len(o.data.loops)
        uv = np.empty(n * 2); o.data.uv_layers["UVMap"].data.foreach_get("uv", uv); uv = uv.reshape(-1, 2)
        assert uv.min() > -1e-6 and uv.max() < 1 + 1e-6, (o.name, uv.min(), uv.max())
        px = np.empty_like(uv)
        px[:, 0] = x0 + PAD + uv[:, 0] * inner
        px[:, 1] = y0 + PAD + uv[:, 1] * inner
        o.data.uv_layers["UVMap"].data.foreach_set("uv", (px / ATLAS).reshape(-1))
        o.data.update()
        names.append(o.name)
        M = o.matrix_world
        co = np.array([tuple(M @ v.co) for v in o.data.vertices])
        for p in o.data.polygons:
            li = list(p.loop_indices); v = p.vertices
            for kk in range(1, len(li) - 1):
                a = np.linalg.norm(np.cross(co[v[kk]] - co[v[0]], co[v[kk + 1]] - co[v[0]])) / 2
                tris.append([*px[li[0]], *px[li[kk]], *px[li[kk + 1]], FAMS.index(f), len(names) - 1, a])
tris = np.array(tris, dtype=np.float64)
np.savez(NPZ, tris=tris, names=np.array(names), fams=np.array(FAMS))
report["triangles"] = int(len(tris))
report["uvPixelAreaFraction"] = float(np.abs((tris[:, 2] - tris[:, 0]) * (tris[:, 5] - tris[:, 1]) - (tris[:, 4] - tris[:, 0]) * (tris[:, 3] - tris[:, 1])).sum() / 2 / ATLAS ** 2)
bpy.ops.wm.save_as_mainfile(filepath=OUT, copy=True)
json.dump(report, open(REPORT, "w"), indent=1)
print("STAGE1", json.dumps(report))
