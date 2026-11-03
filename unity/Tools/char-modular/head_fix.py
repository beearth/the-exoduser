"""11-04 warrior head proportion fix (Blender headless).

Measures scalp(B head mesh, hair excluded) -> chin height. If it is above MAX_H (0.135H = 0.250 m, 7.4 heads) the B head
(W01) and the hair (W02) are scaled uniformly about the neck/head joint (the Head bone head) to TARGET_H (0.1325H, inside
0.130~0.135H). The bones Head (tail), head_end, headfront and the RigHair_* chains (all descendants of Head) move by the
same factor about the same point; names, parents and roll/axes stay. Nothing else in the file is touched (the body is not
re-fitted to 1.85 m; the new hair-top height is only reported).

Scarf ring: after the shrink the gap between the ring (W23, vertices z >= 1.46) and the head/jaw/neck surface is measured at
rest, head_left, head_right, head_bow, head_bow_measured. If the rest gap is above SCARF_MAX_MM only the top ring (vertices within
30 mm of the head surface) is pulled toward the head surface so the closest gap becomes SCARF_TARGET_MM (full move for vertices
within gap+4 mm, linear fade to zero at 30 mm). The lower scarf and the hanging ends keep their place.

Usage (after --): --blend in.blend [--candidate out.blend] [--receipt json] [--dry]
"""
import argparse
import json
from pathlib import Path
import sys
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

sys.path.insert(0, str(Path(__file__).parent))
import measure_proportion as mp
from geometry_metrics import Snapshot
from hybrid_poses import Poses

MAX_H = 0.135
TARGET_H = 0.1325
SCARF_MAX_MM = 10.0
SCARF_TARGET_MM = 7.0
SCARF_FADE_MM = 30.0
POSES = ("rest", "head_left", "head_right", "head_bow", "head_bow_measured")


def scarf_clearance(scene, rig, labels=POSES):
    """Per pose: minimum distance (mm) from W23 points (vertices + triangle centroids, world z >= 1.46) to the B head surface,
    and the deepest sample inside the closed head (same definition as audit_rest_growth.py)."""
    poses = Poses(rig)
    scarf = [o for o in scene.objects if o.type == "MESH" and o.get("char_modular_group") == "W23"]
    out = {}
    for label in labels:
        poses.apply(label)
        head = Snapshot(scene.objects["Warrior_Head"])
        snaps = [Snapshot(o) for o in scarf]
        try:
            minimum, inside_max, inside_n = None, 0., 0
            for ss in snaps:
                pts = list(ss.vertices) + [sum((ss.vertices[i] for i in t), Vector()) / 3 for t in ss.triangles]
                for p in pts:
                    d = head.tree.find_nearest(p)[3] * 1000
                    if p.z >= 1.46:
                        minimum = d if minimum is None else min(minimum, d)
                    if head.in_box(p):
                        inside, _ = head.inside(p)
                        if inside:
                            inside_max, inside_n = max(inside_max, d), inside_n + 1
            out[label] = {"minClearanceMm": minimum, "insideMaxMm": inside_max, "insideSamples": inside_n}
        finally:
            head.close()
            for ss in snaps:
                ss.close()
    for b in rig.pose.bones:
        b.matrix_basis.identity()
    bpy.context.view_layer.update()
    return out


def head_bvh(obj):
    m = obj.matrix_world
    verts = [m @ v.co for v in obj.data.vertices]
    obj.data.calc_loop_triangles()
    return BVHTree.FromPolygons(verts, [tuple(t.vertices) for t in obj.data.loop_triangles])


def scale_object(obj, pivot, k):
    m = obj.matrix_world
    inv = m.inverted()
    for v in obj.data.vertices:
        v.co = inv @ (pivot + k * ((m @ v.co) - pivot))
    obj.data.update()


def pull_scarf(scene, gap_mm):
    """Move scarf top-ring vertices toward the head surface so the closest gap becomes SCARF_TARGET_MM."""
    delta = (gap_mm - SCARF_TARGET_MM) / 1000.
    tree = head_bvh(scene.objects["Warrior_Head"])
    moved, farthest = 0, 0.
    for o in scene.objects:
        if o.type != "MESH" or o.get("char_modular_group") != "W23":
            continue
        m = o.matrix_world
        inv = m.inverted()
        for v in o.data.vertices:
            p = m @ v.co
            loc, nrm, idx, dist = tree.find_nearest(p)
            if loc is None:
                continue
            d_mm = dist * 1000
            if d_mm >= SCARF_FADE_MM or p.z < 1.46:
                continue
            w = 1. if d_mm <= gap_mm + 4. else (SCARF_FADE_MM - d_mm) / (SCARF_FADE_MM - gap_mm - 4.)
            direction = (loc - p)
            if direction.length < 1e-9:
                continue
            step = min(delta * w, dist - 0.001)       # never closer than 1 mm to the surface in one move
            v.co = inv @ (p + direction.normalized() * step)
            moved += 1
            farthest = max(farthest, step)
        o.data.update()
    return moved, farthest * 1000


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--blend", type=Path, required=True)
    p.add_argument("--candidate", type=Path)
    p.add_argument("--receipt", type=Path, default=Path("I:/EXODUSER-Storage/char-modular/proportion/head-receipt.json"))
    p.add_argument("--dry", action="store_true")
    a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
    scene, rig = mp.open_scene(a.blend)
    assert scene.get("char_modular_proportion"), "expected the 11-04 arm-proportion authoring file"
    before = mp.head_metrics(scene, rig)
    scarf_before = scarf_clearance(scene, rig)
    receipt = {"before": before, "scarfBefore": scarf_before, "maxH": MAX_H, "targetH": TARGET_H}
    print("HEAD_BEFORE", json.dumps({k: round(v, 5) for k, v in before.items() if isinstance(v, float)}))
    print("SCARF_BEFORE", json.dumps({k: round(v["minClearanceMm"], 3) for k, v in scarf_before.items()}))
    if before["headHeightH"] <= MAX_H:
        receipt["scaled"] = False
        a.receipt.parent.mkdir(parents=True, exist_ok=True)
        a.receipt.write_text(json.dumps(receipt, indent=1) + "\n", encoding="utf-8")
        print("HEAD_FIX_DONE not scaled (already <= %.3fH)" % MAX_H)
        return
    k = TARGET_H * mp.HEIGHT / before["headHeightM"]
    M = rig.matrix_world
    inv_arm = M.inverted()
    pivot = M @ rig.data.bones["Head"].head_local
    head_bone = rig.data.bones["Head"]
    chain = [head_bone] + list(head_bone.children_recursive)
    old = {b.name: (M @ b.head_local, M @ b.tail_local) for b in chain}
    axes_before = {b.name: [list(r) for r in b.matrix_local.to_3x3()] for b in rig.data.bones}
    tree_before = [(b.name, b.parent.name if b.parent else None) for b in rig.data.bones]
    for o in scene.objects:
        assert o.parent_bone != "Head" or o.type == "MESH", ("object parented to Head bone", o.name)
    receipt["k"] = k
    receipt["pivotM"] = list(pivot)
    receipt["bonesMoved"] = list(old)
    for name in ("Warrior_Head", "Warrior_Hair"):
        scale_object(scene.objects[name], pivot, k)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    eb = rig.data.edit_bones
    for name, (h, t) in old.items():
        eb[name].head = inv_arm @ (pivot + k * (h - pivot))
        eb[name].tail = inv_arm @ (pivot + k * (t - pivot))
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.context.view_layer.update()
    for b in rig.data.bones:
        assert all(abs(x - y) < 2e-5 for r1, r2 in zip(axes_before[b.name], b.matrix_local.to_3x3()) for x, y in zip(r1, r2)), ("bone axes changed", b.name)
    assert [(b.name, b.parent.name if b.parent else None) for b in rig.data.bones] == tree_before
    receipt["boneAfterM"] = {n: [list(M @ rig.data.bones[n].head_local), list(M @ rig.data.bones[n].tail_local)] for n in old}
    receipt["boneBeforeM"] = {n: [list(h), list(t)] for n, (h, t) in old.items()}
    after = mp.head_metrics(scene, rig)
    receipt["after"] = after
    print("HEAD_AFTER", json.dumps({k_: round(v, 5) for k_, v in after.items() if isinstance(v, float)}), "k=%.5f" % k)
    scarf_mid = scarf_clearance(scene, rig)
    receipt["scarfAfterShrink"] = scarf_mid
    print("SCARF_AFTER_SHRINK", json.dumps({k_: round(v["minClearanceMm"], 3) for k_, v in scarf_mid.items()}))
    gap = scarf_mid["rest"]["minClearanceMm"]
    receipt["scarfPulled"] = False
    if gap > SCARF_MAX_MM:
        moved, farthest = pull_scarf(scene, gap)
        scarf_after = scarf_clearance(scene, rig)
        receipt.update({"scarfPulled": True, "scarfVerticesMoved": moved, "scarfMaxMoveMm": farthest, "scarfAfter": scarf_after})
        print("SCARF_PULLED moved", moved, "maxMoveMm %.3f" % farthest, json.dumps({k_: round(v["minClearanceMm"], 3) for k_, v in scarf_after.items()}),
              "inside", json.dumps({k_: round(v["insideMaxMm"], 3) for k_, v in scarf_after.items()}))
    else:
        receipt["scarfAfter"] = scarf_mid
    tri = sum(sum(len(f.vertices) - 2 for f in o.data.polygons) for o in scene.objects if o.type == "MESH")
    receipt["triangles"] = tri
    scene["char_modular_head"] = "20261104_head_k%.4f_h%.4fH" % (k, after["headHeightH"])
    if not a.dry:
        assert a.candidate
        bpy.ops.wm.save_as_mainfile(filepath=str(a.candidate.resolve()), compress=True)
    a.receipt.parent.mkdir(parents=True, exist_ok=True)
    a.receipt.write_text(json.dumps(receipt, indent=1) + "\n", encoding="utf-8")
    print("HEAD_FIX_DONE", "dry" if a.dry else "saved", "triangles", tri)


main()
