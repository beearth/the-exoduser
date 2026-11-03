"""11-04 arm proportion measurement (Blender headless, read-only).

Measures the warrior authoring file (or any blend with the same rig/part naming) and writes json.
Everything is world metres at the rest pose; H = 1.85 m (character height, brief value).
Definitions:
  upper/fore/hand  : LeftArm->LeftForeArm, LeftForeArm->LeftHand heads; hand = wrist head -> farthest vertex
                     of every mesh bound to the Hand bone (gauntlet back, fingers; greatsword excluded), Euclid.
  fingertip down   : each arm chain rotated rigidly about its shoulder joint so shoulder->wrist points straight down;
                     lowest hand vertex height above z=0 (floor). "upperVertical" variant: upper arm straight down.
  span             : each arm chain rotated about its shoulder joint so shoulder->wrist is horizontal (+-X);
                     fingertip to fingertip distance in X over all hand vertices.
  width            : Feret diameter of a 2 cm thick slab (vertices + edge midpoints) perpendicular to the segment axis,
                     maximum over slabs; sets: upper arm (bone Arm, slabs 5 cm or more below the shoulder joint),
                     elbow (couter bone), forearm (ForeArm bone), wrist (Hand-bound within 3 cm of the wrist plane),
                     gauntlet (Hand-bound, all).
"""
import argparse
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Matrix, Vector

HEIGHT = 1.85
SLAB = 0.02


def open_scene(blend):
    bpy.ops.wm.open_mainfile(filepath=str(Path(blend).resolve()))
    scene = bpy.context.scene
    rig = next(o for o in scene.objects if o.type == "ARMATURE")
    for bone in rig.pose.bones:
        bone.matrix_basis.identity()
    bpy.context.view_layer.update()
    return scene, rig


class Chain:
    """One arm in world metres from the armature rest bones."""

    def __init__(self, rig, side):
        self.side = side
        m = rig.matrix_world
        bones = rig.data.bones
        self.S = m @ bones[side + "Arm"].head_local
        self.E = m @ bones[side + "ForeArm"].head_local
        self.W = m @ bones[side + "Hand"].head_local
        self.T = m @ bones[side + "Hand"].tail_local
        self.L1 = (self.E - self.S).length
        self.L2 = (self.W - self.E).length
        self.u = (self.E - self.S).normalized()
        self.v = (self.W - self.E).normalized()
        self.h = (self.T - self.W).normalized()
        self.nE = (self.u + self.v).normalized()
        self.nW = (self.v + self.h).normalized()

    def zone(self, p):
        """(zone, cumulative arc length along the chain, perpendicular distance to that zone's axis)."""
        if (p - self.E).dot(self.nE) <= 0:
            d = p - self.S
            a = d.dot(self.u)
            return "A", a, (d - self.u * a).length
        if (p - self.W).dot(self.nW) <= 0:
            d = p - self.E
            b = d.dot(self.v)
            return "B", self.L1 + b, (d - self.v * b).length
        d = p - self.W
        c = d.dot(self.h)
        return "C", self.L1 + self.L2 + c, (d - self.h * c).length


def side_sets(scene, side):
    tag = side[0].lower()
    out = {"upper": [], "elbow": [], "fore": [], "hand": []}
    for o in scene.objects:
        if o.type != "MESH" or o.get("char_modular_role") != "rigid":
            continue
        bone = o.get("char_modular_bone")
        if bone == side + "Arm":
            out["upper"].append(o)
        elif bone == "elbow_%s_couter" % tag:
            out["elbow"].append(o)
        elif bone == side + "ForeArm":
            out["fore"].append(o)
        elif bone == side + "Hand":
            out["hand"].append(o)
    return out


def world_points(obj, dense=True):
    m = obj.matrix_world
    pts = [m @ v.co for v in obj.data.vertices]
    if dense:
        pts += [(pts[e.vertices[0]] + pts[e.vertices[1]]) / 2 for e in obj.data.edges]
    return pts


def feret(points, axis, origin):
    """Maximum in-plane extent (m) of points projected onto the plane perpendicular to axis."""
    ref = Vector((0, 1, 0)) if abs(axis.dot(Vector((0, 1, 0)))) < .9 else Vector((1, 0, 0))
    e1 = axis.cross(ref).normalized()
    e2 = axis.cross(e1).normalized()
    xy = [((p - origin).dot(e1), (p - origin).dot(e2)) for p in points]
    best = 0.
    for k in range(18):
        t = math.pi * k / 18
        c, s = math.cos(t), math.sin(t)
        proj = [x * c + y * s for x, y in xy]
        best = max(best, max(proj) - min(proj))
    return best


def slab_profile(points, axis, origin, lo, hi):
    """[(centre along axis, feret width)] for slabs of SLAB metres between lo and hi along the axis."""
    rows = []
    t = lo
    while t < hi - 1e-9:
        sel = [p for p in points if t <= (p - origin).dot(axis) < t + SLAB]
        if len(sel) >= 3:
            rows.append((t + SLAB / 2, feret(sel, axis, origin)))
        t += SLAB / 2
    return rows


def rotate_about(R, pivot, p):
    return pivot + R @ (p - pivot)


def measure(scene, rig, label):
    res = {"label": label, "heightM": HEIGHT}
    chains = {s: Chain(rig, s) for s in ("Left", "Right")}
    sets = {s: side_sets(scene, s) for s in ("Left", "Right")}
    bones = rig.data.bones
    m = rig.matrix_world

    def bh(n):
        return m @ bones[n].head_local
    res["shoulderJointWidthM"] = abs(chains["Left"].S.x - chains["Right"].S.x)
    for s in ("Left", "Right"):
        res[s + "Thigh"] = (bh(s + "Leg") - bh(s + "UpLeg")).length
        res[s + "Shin"] = (bh(s + "Foot") - bh(s + "Leg")).length
    tips = {}
    for s, c in chains.items():
        hand_pts = [p for o in sets[s]["hand"] for p in world_points(o, dense=False)]
        far = max(hand_pts, key=lambda p: (p - c.W).length)
        along = max((p - c.W).dot(c.h) for p in hand_pts)
        r = {"upperM": c.L1, "foreM": c.L2, "handM": (far - c.W).length, "handAlongHandAxisM": along,
             "chordM": (c.W - c.S).length, "elbowBendDeg": math.degrees(c.u.angle(c.v)),
             "wristBendDeg": math.degrees(c.v.angle(c.h))}
        chord = (c.W - c.S).normalized()
        down = chord.rotation_difference(Vector((0, 0, -1))).to_matrix()
        r["fingertipHeightArmsDownChordM"] = min(rotate_about(down, c.S, p).z for p in hand_pts)
        updown = c.u.rotation_difference(Vector((0, 0, -1))).to_matrix()
        r["fingertipHeightArmsDownUpperVerticalM"] = min(rotate_about(updown, c.S, p).z for p in hand_pts)
        sign = 1 if s == "Left" else -1
        horizontal = chord.rotation_difference(Vector((sign, 0, 0))).to_matrix()
        xs = [rotate_about(horizontal, c.S, p).x for p in hand_pts]
        tips[s] = (max(xs) if s == "Left" else min(xs))
        r["fingertipXArmsHorizontalM"] = tips[s]
        up_pts = [p for o in sets[s]["upper"] for p in world_points(o)]
        el_pts = [p for o in sets[s]["elbow"] for p in world_points(o)]
        fo_pts = [p for o in sets[s]["fore"] for p in world_points(o)]
        ha_pts = [p for o in sets[s]["hand"] for p in world_points(o)]
        prof_up = slab_profile(up_pts, c.u, c.S, 0.0, c.L1 + 0.05)
        prof_el = slab_profile(el_pts, c.nE, c.E, -0.15, 0.15)
        prof_fo = slab_profile(fo_pts, c.v, c.E, 0.0, c.L2 + 0.02)
        prof_ha = slab_profile(ha_pts, c.h, c.W, -0.10, 0.30)
        wr_pts = [p for p in ha_pts if abs((p - c.W).dot(c.h)) <= .03]
        r["profiles"] = {"upper": prof_up, "elbow": prof_el, "fore": prof_fo, "hand": prof_ha}
        r["widthsM"] = {
            "upperArm": max((w for t, w in prof_up if t >= 0.05), default=0.),
            "upperArmWholeIncludingShoulderFlare": max((w for t, w in prof_up), default=0.),
            "elbow": max((w for t, w in prof_el), default=0.),
            "forearm": max((w for t, w in prof_fo), default=0.),
            "wrist": feret(wr_pts, c.h, c.W) if len(wr_pts) >= 3 else 0.,
            "gauntlet": max((w for t, w in prof_ha), default=0.)}
        res[s] = r
    res["armSpanM"] = tips["Left"] - tips["Right"]
    res["armSpanNote"] = "fingertip to fingertip, each chain turned about its shoulder joint so shoulder->wrist is horizontal"
    return res


def to_markdown(res_list):
    lines = ["# 팔 비율 실측 (전사 A+B, H=1.85m)", "", "정의는 measure_proportion.py 머리 주석. 단위 m 또는 ×H.", ""]
    keys = [("위팔(L)", lambda r: r["Left"]["upperM"]), ("위팔(R)", lambda r: r["Right"]["upperM"]),
            ("아래팔(L)", lambda r: r["Left"]["foreM"]), ("아래팔(R)", lambda r: r["Right"]["foreM"]),
            ("손(L)", lambda r: r["Left"]["handM"]), ("손(R)", lambda r: r["Right"]["handM"]),
            ("팔 내림 손끝 높이(L, 손목선 수직)", lambda r: r["Left"]["fingertipHeightArmsDownChordM"]),
            ("팔 내림 손끝 높이(R, 손목선 수직)", lambda r: r["Right"]["fingertipHeightArmsDownChordM"]),
            ("팔 내림 손끝 높이(L, 위팔 수직)", lambda r: r["Left"]["fingertipHeightArmsDownUpperVerticalM"]),
            ("팔 내림 손끝 높이(R, 위팔 수직)", lambda r: r["Right"]["fingertipHeightArmsDownUpperVerticalM"]),
            ("양팔 벌린 폭", lambda r: r["armSpanM"]), ("어깨 관절 폭", lambda r: r["shoulderJointWidthM"]),
            ("허벅지(L)", lambda r: r["LeftThigh"]), ("정강이(L)", lambda r: r["LeftShin"]),
            ("허벅지(R)", lambda r: r["RightThigh"]), ("정강이(R)", lambda r: r["RightShin"])]
    lines.append("| 항목 | " + " | ".join("%s m | %s ×H" % (x["label"], x["label"]) for x in res_list) + " |")
    lines.append("|---|" + "---:|---:|" * len(res_list))
    for name, fn in keys:
        lines.append("| %s | " % name + " | ".join("%.4f | %.4f" % (fn(x), fn(x) / x["heightM"]) for x in res_list) + " |")
    lines += ["", "## 굵기 (m, 슬랩 Feret 지름 최대)", "",
              "| 부위 | " + " | ".join("%s L | %s R" % (x["label"], x["label"]) for x in res_list) + " |",
              "|---|" + "---:|---:|" * len(res_list)]
    for k in ("upperArm", "upperArmWholeIncludingShoulderFlare", "elbow", "forearm", "wrist", "gauntlet"):
        lines.append("| %s | " % k + " | ".join("%.4f | %.4f" % (x["Left"]["widthsM"][k], x["Right"]["widthsM"][k]) for x in res_list) + " |")
    lines.append("| 아래팔/위팔 | " + " | ".join("%.3f | %.3f" % (x["Left"]["widthsM"]["forearm"] / x["Left"]["widthsM"]["upperArm"],
                                                             x["Right"]["widthsM"]["forearm"] / x["Right"]["widthsM"]["upperArm"]) for x in res_list) + " |")
    lines.append("| 건틀릿/위팔 | " + " | ".join("%.3f | %.3f" % (x["Left"]["widthsM"]["gauntlet"] / x["Left"]["widthsM"]["upperArm"],
                                                             x["Right"]["widthsM"]["gauntlet"] / x["Right"]["widthsM"]["upperArm"]) for x in res_list) + " |")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--blend", type=Path)
    p.add_argument("--label")
    p.add_argument("--out", type=Path, required=True)
    p.add_argument("--report", nargs=2, type=Path, help="before.json after.json -> --out proportion.json + proportion.md")
    a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
    if a.report:
        pair = [json.loads(x.read_text(encoding="utf-8")) for x in a.report]
        a.out.write_text(json.dumps({"before": pair[0], "after": pair[1]}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        a.out.with_suffix(".md").write_text(to_markdown(pair), encoding="utf-8")
        print("MEASURE_REPORT_DONE")
        sys.exit(0)
    scene, rig = open_scene(a.blend)
    result = measure(scene, rig, a.label)
    a.out.parent.mkdir(parents=True, exist_ok=True)
    a.out.write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("MEASURE_DONE", a.label)
