"""11-04 warrior arm proportion fix (Blender headless).

Two modes, one transform (`Plan`):
  authoring : --blend Warrior_Modular.blend --candidate out.blend [--upper-m --fore-m --hand-m]
              moves the rest bones (LeftForeArm/LeftHand/RightForeArm/RightHand, couter, hand_r_weapon), re-lays the
              armor plates and writes proportion-plan.json (old/new chain) + a receipt. Bone names, parents, axes
              (roll), weights, triangle counts and the single-bone-100 percent metal stay as they were.
  mesh      : --in mesh.glb --out mesh.glb applies the same plan to a mesh in the OLD rest space (A pose, glTF Y-up).
              Objects named like the authoring parts (W08_A_044 ...) get the exact per-plate transform; any other
              object (e.g. a single textured Tripo mesh) gets the continuous soft warp (approximate, no per-plate logic).

Plan, per side, in world metres (Z-up as in Blender; the plan file stores this frame):
  chain S (shoulder joint, fixed) -> E (elbow) -> W (wrist) -> T (hand bone tail); directions never change.
  E' = S + u*upper, W' = E' + v*fore.  Hand parts scale uniformly by kh about W' (kh = hand/hand_old).
  upper-arm plates (W08/W09): plates in the proximal half stay exactly where they are (shoulder socket, no stretch);
        plates in the distal half shift by (upper-old) and stretch 1.15 (max) along u, anchored at their elbow-side edge.
  elbow plates (W10/W11): rigid with the elbow, shift E'-E.
  forearm plates (W12/W13 non-hand ids): shift E'-E, then stretch k2 = fore/fore_old along v about E'.
  hand plates (hand ids): p' = W' + kh (p - W).
  greatsword + hand_r_weapon: rigid, grip point g -> W' + kh (g - W); the sword is not scaled.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, str(Path(__file__).parent))
import measure_proportion as mp

HERE = Path(__file__).parent
PLAN_FILE = HERE / "proportion-plan.json"
STRETCH_MAX = 1.15
HAND_IDS = {45, 46, 63, 72, 74, 80, 83, 86, 87, 94, 104, 106}   # hybrid_contract.HAND_IDS
PART = re.compile(r"^(W\d\d)_(?:A_(\d+)|[A-Za-z]+)")
SIDE_OF = {"W08": "Left", "W09": "Right", "W10": "Left", "W11": "Right", "W12": "Left", "W13": "Right"}


def classify(name):
    """(kind, side) for an authoring part name, or None."""
    m = PART.match(name)
    if not m:
        return None
    group, ident = m.group(1), m.group(2)
    if group in ("W08", "W09"):
        return "upper", SIDE_OF[group]
    if group in ("W10", "W11"):
        return "elbow", SIDE_OF[group]
    if group in ("W12", "W13"):
        return ("hand" if ident and int(ident) in HAND_IDS else "fore"), SIDE_OF[group]
    if group == "W25":
        return "weapon", "Right"
    return None


def smooth(x):
    x = min(max(x, 0.), 1.)
    return x * x * (3 - 2 * x)


class SidePlan:
    def __init__(self, old, upper, fore, kh):
        self.S, self.E, self.W, self.T, self.G = (Vector(old[k]) for k in ("S", "E", "W", "T", "G"))
        self.L1 = (self.E - self.S).length
        self.L2 = (self.W - self.E).length
        self.u = (self.E - self.S).normalized()
        self.v = (self.W - self.E).normalized()
        self.h = (self.T - self.W).normalized()
        self.nE = (self.u + self.v).normalized()
        self.nW = (self.v + self.h).normalized()
        self.upper, self.fore, self.kh = upper, fore, kh
        self.k1, self.k2 = upper / self.L1, fore / self.L2
        self.E2 = self.S + self.u * upper
        self.W2 = self.E2 + self.v * fore
        self.T2 = self.W2 + (self.T - self.W) * kh
        self.G2 = self.W2 + (self.G - self.W) * kh

    def to_json(self):
        return {"old": {k: list(getattr(self, k)) for k in ("S", "E", "W", "T", "G")},
                "new": {"E": list(self.E2), "W": list(self.W2), "T": list(self.T2), "G": list(self.G2)},
                "oldUpperM": self.L1, "oldForeM": self.L2, "upperM": self.upper, "foreM": self.fore, "handScale": self.kh}

    # --- per-vertex maps (world metres) -------------------------------------------------------------------
    def elbow(self, p):
        return p + (self.E2 - self.E)

    def fore_map(self, p):
        q = p + (self.E2 - self.E)
        b = (p - self.E).dot(self.v)
        return q + self.v * (b * (self.k2 - 1.))

    def hand_map(self, p):
        return self.W2 + (p - self.W) * self.kh

    def upper_map(self, points, label):
        """Rigid shift + <=1.15 stretch along u, anchored at the shoulder or elbow side of this plate."""
        a = [(p - self.S).dot(self.u) for p in points]
        lo, hi = min(a), max(a)
        centre = (lo + hi) / 2
        delta = self.upper - self.L1
        if centre < self.L1 / 2:
            # shoulder-side plate: shape untouched (prop1 audit: a 1.15 stretch moved it 4.05 mm into the pauldron socket in arm90)
            anchor, anchor2, role, s = lo, lo, "proximal", 1.0
        else:
            anchor, anchor2, role, s = hi, hi + delta, "distal", STRETCH_MAX
        out = [p + self.u * ((anchor2 + s * (t - anchor)) - t) for p, t in zip(points, a)]
        return out, {"role": role, "stretch": s, "alongBefore": [lo, hi],
                     "alongAfter": [anchor2 + s * (lo - anchor), anchor2 + s * (hi - anchor)]}

    def soft_displacement(self, p):
        """Continuous warp for an unsplit mesh: blends the three segment displacements across the elbow and the
        wrist planes (+-5 cm) and fades out with the distance to the arm axis (10 cm -> 14 cm)."""
        a = (p - self.S).dot(self.u)
        if a < 0 and (p - self.E).dot(self.nE) < 0 and a < -0.05:
            return Vector()
        # nearest-axis lateral distance
        if (p - self.E).dot(self.nE) <= 0:
            r = ((p - self.S) - self.u * a).length
        elif (p - self.W).dot(self.nW) <= 0:
            r = ((p - self.E) - self.v * (p - self.E).dot(self.v)).length
        else:
            r = ((p - self.W) - self.h * (p - self.W).dot(self.h)).length
        fade = 1. - smooth((r - 0.10) / 0.04)
        if fade <= 0.:
            return Vector()
        dA = self.u * (max(a, 0.) * (self.k1 - 1.))
        dB = (self.E2 - self.E) + self.v * ((p - self.E).dot(self.v) * (self.k2 - 1.))
        dC = (self.W2 - self.W) + (p - self.W) * (self.kh - 1.)
        wB = smooth(((p - self.E).dot(self.nE) + 0.05) / 0.10)
        wC = smooth(((p - self.W).dot(self.nW) + 0.05) / 0.10)
        d = dA * (1 - wB) + dB * wB
        d = d * (1 - wC) + dC * wC
        return d * fade


def transform_object(obj, plans, receipt):
    info = classify(obj.name)
    m = obj.matrix_world
    inv = m.inverted()
    verts = obj.data.vertices
    world = [m @ v.co for v in verts]
    if info is None:
        return False
    kind, side = info
    plan = plans[side]
    meta = {"kind": kind, "side": side}
    if kind == "upper":
        new, extra = plan.upper_map(world, obj.name)
        meta.update(extra)
    elif kind == "elbow":
        new = [plan.elbow(p) for p in world]
    elif kind == "fore":
        new = [plan.fore_map(p) for p in world]
        meta["stretch"] = plan.k2
    elif kind == "hand":
        new = [plan.hand_map(p) for p in world]
        meta["uniformScale"] = plan.kh
    else:
        return False        # weapon is moved with its empty/bone by the caller
    for v, p in zip(verts, new):
        v.co = inv @ p
    obj.data.update()
    receipt[obj.name] = meta
    return True


def build_plans(old_chains, upper, fore, hand_m, hand_old):
    kh = hand_m / hand_old
    return {side: SidePlan(old_chains[side], upper, fore, kh) for side in ("Left", "Right")}, kh


def author(a):
    scene, rig = mp.open_scene(a.blend)
    assert scene.get("char_modular_sonnet_fix"), "expected the 11-04 Sonnet-fixed authoring file"
    before = mp.measure(scene, rig, "before")
    M = rig.matrix_world
    bones = rig.data.bones
    old = {}
    sword = bpy.data.objects["W25_UCH03a_Greatsword"]
    for side in ("Left", "Right"):
        c = mp.Chain(rig, side)
        grip = (M @ bones["hand_r_weapon"].head_local) if side == "Right" else (c.W + (c.T - c.W) * .5)
        old[side] = {"S": list(c.S), "E": list(c.E), "W": list(c.W), "T": list(c.T), "G": list(grip)}
    hand_old = (before["Left"]["handM"] + before["Right"]["handM"]) / 2
    plans, kh = build_plans(old, a.upper_m, a.fore_m, a.hand_m, hand_old)
    receipt = {"params": {"upperM": a.upper_m, "foreM": a.fore_m, "handM": a.hand_m, "handOldMeanM": hand_old, "handScale": kh,
                          "heightM": mp.HEIGHT, "upperH": a.upper_m / mp.HEIGHT, "foreH": a.fore_m / mp.HEIGHT, "handH": a.hand_m / mp.HEIGHT},
               "plates": {}, "before": before}
    tri_before = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in scene.objects if o.type == "MESH")
    bones_before = [(b.name, b.parent.name if b.parent else None, b.use_connect) for b in rig.data.bones]
    axes_before = {b.name: [list(r) for r in b.matrix_local.to_3x3()] for b in rig.data.bones}
    # ---------------- bones
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    inv = M.inverted()
    eb = rig.data.edit_bones
    for side, tag in (("Left", "l"), ("Right", "r")):
        p = plans[side]
        e_arm, e_fore, e_hand = eb[side + "Arm"], eb[side + "ForeArm"], eb[side + "Hand"]
        couter = eb["elbow_%s_couter" % tag]
        couter_vec = couter.tail - couter.head
        e_arm.tail = inv @ p.E2
        e_fore.head = inv @ p.E2
        e_fore.tail = inv @ p.W2
        e_hand.head = inv @ p.W2
        e_hand.tail = inv @ p.T2
        couter.head = inv @ p.E2
        couter.tail = couter.head + couter_vec
    wb = eb["hand_r_weapon"]
    weapon_vec = wb.tail - wb.head
    grip_delta_world = plans["Right"].G2 - plans["Right"].G
    wb.head = wb.head + inv.to_3x3() @ grip_delta_world
    wb.tail = wb.head + weapon_vec
    bpy.ops.object.mode_set(mode="OBJECT")
    # ---------------- plates
    moved = 0
    for obj in scene.objects:
        if obj.type == "MESH" and obj.get("char_modular_role") == "rigid" and classify(obj.name):
            assert obj.data.users == 1, obj.name
            if transform_object(obj, plans, receipt["plates"]):
                moved += 1
    shift = Matrix.Translation(grip_delta_world)
    sword.matrix_world = shift @ sword.matrix_world
    empty = bpy.data.objects["W25_Greatsword"]
    empty.matrix_world = shift @ empty.matrix_world
    bpy.context.view_layer.update()
    receipt["platesMoved"] = moved
    receipt["sword"] = {"gripDeltaWorldMm": [x * 1000 for x in grip_delta_world]}
    # ---------------- invariants
    for b in rig.data.bones:
        assert not (b.name in axes_before) or all(abs(x - y) < 2e-5 for r1, r2 in zip(axes_before[b.name], b.matrix_local.to_3x3()) for x, y in zip(r1, r2)), ("bone axes changed", b.name)
    assert [(b.name, b.parent.name if b.parent else None) for b in rig.data.bones] == [(n, p) for n, p, _ in bones_before]
    tri_after = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in scene.objects if o.type == "MESH")
    assert tri_after == tri_before
    for obj in scene.objects:
        if obj.type == "MESH" and obj.get("char_modular_role") == "rigid":
            for v in obj.data.vertices:
                ws = [g.weight for g in v.groups if g.weight > 0]
                assert len(ws) == 1 and abs(ws[0] - 1.) < 1e-6, ("rigid metal not single 100%", obj.name)
    head = bpy.data.objects["Warrior_Head"]
    receipt["trianglesBefore"], receipt["trianglesAfter"], receipt["bones"] = tri_before, tri_after, len(rig.data.bones)
    for side in ("Left", "Right"):
        c = mp.Chain(rig, side)
        assert abs(c.L1 - a.upper_m) < 1e-5 and abs(c.L2 - a.fore_m) < 1e-5, (side, c.L1, c.L2)
    after = mp.measure(scene, rig, "after")
    receipt["after"] = after
    # coverage along the chain (informational): union of plate/couter intervals in arc length
    gaps = {}
    for side in ("Left", "Right"):
        c = mp.Chain(rig, side)
        sets = mp.side_sets(scene, side)
        spans = []
        for key in ("upper", "elbow", "fore"):
            for o in sets[key]:
                s = [c.zone(o.matrix_world @ v.co)[1] for v in o.data.vertices]
                spans.append((min(s), max(s), o.name))
        spans.sort()
        reach, holes = spans[0][1], []
        for lo, hi, n in spans[1:]:
            if lo > reach + 1e-4:
                holes.append([reach, lo])
            reach = max(reach, hi)
        gaps[side] = {"coveredFrom": spans[0][0], "coveredTo": reach, "holesM": holes}
    receipt["coverageHoles"] = gaps
    scene["char_modular_proportion"] = "20261104_arm_proportion_u%.4f_f%.4f_h%.4f" % (a.upper_m, a.fore_m, a.hand_m)
    if not a.dry:
        bpy.ops.wm.save_as_mainfile(filepath=str(a.candidate.resolve()), compress=True)
        PLAN_FILE.write_text(json.dumps({"description": "11-04 arm proportion plan, world metres Z-up, old rest space",
                                         "stretchMax": STRETCH_MAX, "handIds": sorted(HAND_IDS), "sides": {s: plans[s].to_json() for s in plans}},
                                        indent=1) + "\n", encoding="utf-8")
    a.receipt.parent.mkdir(parents=True, exist_ok=True)
    a.receipt.write_text(json.dumps(receipt, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    h = mp.HEIGHT
    for s in ("Left", "Right"):
        r = after[s]
        print("AFTER", s, "upper %.4f fore %.4f hand %.4f(%.4fH) tipDown %.4fH widths %s" % (r["upperM"], r["foreM"], r["handM"], r["handM"] / h, r["fingertipHeightArmsDownChordM"] / h,
              {k: round(v, 3) for k, v in r["widthsM"].items()}))
    print("AFTER span %.4fH" % (after["armSpanM"] / h), "holes", json.dumps(gaps))
    print("PROPORTION_FIX_DONE", "dry" if a.dry else "saved")


def run_mesh(a):
    plan_data = json.loads(PLAN_FILE.read_text(encoding="utf-8"))
    plans = {}
    for side, d in plan_data["sides"].items():
        plans[side] = SidePlan(d["old"], d["upperM"], d["foreM"], d["handScale"])
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(a.input.resolve()))
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    receipt = {}
    soft = 0
    for obj in meshes:
        if classify(obj.name):
            if obj.name.startswith("W25"):
                continue
            transform_object(obj, plans, receipt)
        elif not obj.name.startswith("Warrior_") and not PART.match(obj.name):
            m = obj.matrix_world
            inv = m.inverted()
            for v in obj.data.vertices:
                p = m @ v.co
                side = plans["Left" if p.x >= 0 else "Right"]
                v.co = inv @ (p + side.soft_displacement(p))
            obj.data.update()
            soft += 1
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(a.out.resolve()), export_format="GLB", use_selection=True, export_yup=True,
                              export_apply=False, export_skins=False, export_animations=False, export_materials="EXPORT",
                              export_image_format="AUTO", export_cameras=False, export_lights=False, export_extras=False)
    print("PROPORTION_MESH_DONE parts", len(receipt), "softWarped", soft)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--blend", type=Path)
    p.add_argument("--candidate", type=Path)
    p.add_argument("--receipt", type=Path, default=Path("I:/EXODUSER-Storage/char-modular/proportion/fix-receipt.json"))
    p.add_argument("--upper-m", type=float, default=0.3330)
    p.add_argument("--fore-m", type=float, default=0.2683)
    p.add_argument("--hand-m", type=float, default=0.1850)
    p.add_argument("--dry", action="store_true")
    p.add_argument("--in", dest="input", type=Path)
    p.add_argument("--out", type=Path)
    a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
    if a.input:
        run_mesh(a)
    else:
        assert a.blend and (a.candidate or a.dry)
        author(a)
