"""Only the approved A+B assembly may enter the numeric joint gate.
All outputs overwrite fixed paths. Model FAIL is recorded, not hidden by exit0.
"""
import argparse
import csv
import itertools
import json
import math
from pathlib import Path
import sys
import bpy
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
from geometry_metrics import Snapshot,pair_metrics,boundary_gap
from hybrid_poses import Poses,LABELS
from hybrid_contract import SOFT_GROUPS

p=argparse.ArgumentParser()
p.add_argument("--blend",type=Path,required=True)
p.add_argument("--out",type=Path,required=True)
p.add_argument("--attempt",type=int,choices=(1,2),required=True)
args=p.parse_args(sys.argv[sys.argv.index("--")+1:])
args.out.mkdir(parents=True,exist_ok=True)
previous_path=args.out/"receipt.json"
previous=json.loads(previous_path.read_text(encoding="utf-8")) if previous_path.exists() else None
if previous and previous.get("attempt",0)>=args.attempt:
    raise RuntimeError("Refusing repeated/unmodified numeric attempt; use source fix then attempt2 only")
bpy.ops.wm.open_mainfile(filepath=str(args.blend.resolve()))
assert bpy.context.scene.get("char_modular_variant")=="A+B_G0_20261104","Rejected B-only model cannot be tested"
parts=[o for o in bpy.context.scene.objects if o.type=="MESH" and o.get("char_modular_hybrid")]
assert len([o for o in parts if o.get("char_modular_source")=="B"])==2
assert len([o for o in parts if o.get("char_modular_source")=="A"])>90
assert {o["char_modular_group"] for o in parts}=={"W%02d"%i for i in range(1,26)}
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
poses=Poses(rig)
by_group={g:[o for o in parts if o["char_modular_group"]==g] for g in {o["char_modular_group"] for o in parts}}
pairs={}
def add(first,second,reason):
    for a,b in itertools.product(first,second):
        if a is b:continue
        key=tuple(sorted((a.name,b.name)))
        pairs.setdefault(key,set()).add(reason)
def groups(*names):return [o for g in names for o in by_group[g]]
add(groups("W12","W13"),groups("W04","W05","W15"),"forearm/hand-chest/tassets")
add(groups("W08","W09"),groups("W04","W05","W06","W07"),"upperarm-pauldron/chest")
add(groups("W15"),groups("W03","W17","W18","W19","W20"),"tassets-thigh/knee")
add(groups("W24"),groups("W03","W04","W05","W14","W17","W18","W19","W20","W21","W22"),"cape-torso/legs")
non_hands=[o for o in parts if o["char_modular_group"]!="W25" and o.get("char_modular_bone") not in ("LeftHand","RightHand")]
add(groups("W25"),non_hands,"sword-all-except-hands")
adjacency=(("W04","W05","Spine01"),("W05","W14","Spine02"),
 ("W06","W08","LeftArm"),("W07","W09","RightArm"),
 ("W08","W10","LeftForeArm"),("W09","W11","RightForeArm"),
 ("W10","W12","LeftForeArm"),("W11","W13","RightForeArm"),
 ("W15","W17","LeftUpLeg"),("W15","W18","RightUpLeg"),
 ("W17","W19","LeftLeg"),("W18","W20","RightLeg"),
 ("W19","W21","LeftFoot"),("W20","W22","RightFoot"),("W01","W23","Head"))
for first,second,_ in adjacency:add(groups(first),groups(second),"adjacent-socket")
def hard(obj):return obj["char_modular_group"] not in SOFT_GROUPS|{"W01","W14"}
rows=[]; gaps=[]; fixture_rows=[]
for label in LABELS:
    fixture=poses.apply(label);fixture_rows.append(fixture)
    if label=="elbow140":assert all(abs(fixture[s+"ElbowFlexDeg"]-140)<.03 for s in ("Left","Right")),fixture
    if label=="knee120":assert abs(fixture["LeftKneeFlexDeg"]-120)<.03,fixture
    snapshots={o.name:Snapshot(o) for o in parts}
    try:
        for (first,second),reason in sorted(pairs.items()):
            a,b=bpy.data.objects[first],bpy.data.objects[second]
            metric=pair_metrics(snapshots[first],snapshots[second])
            # The brief explicitly requests nearest-vertex distance too. It is
            # sampling-dependent and conservative; expose it, never rename it
            # to an exact penetration depth or silently replace it with zero.
            hard_pair=hard(a) and hard(b)
            depth=max(metric["maxSurfaceDepthMm"] or 0,metric["maxNearestVertexMm"])
            if not metric["depthVerified"]:status="UNVERIFIED"
            elif hard_pair and depth>3:status="FAIL"
            elif (metric["maxSurfaceDepthMm"] or 0)>3:status="FAIL"
            else:status="PASS"
            rows.append({"pose":label,"a":first,"b":second,"groupA":a["char_modular_group"],"groupB":b["char_modular_group"],
                         "reason":";".join(sorted(reason)),"hardPair":hard_pair,"status":status,**metric})
        for first,second,pivot_name in adjacency:
            pivot=poses.head(pivot_name)
            def boundary(group):
                # Localise to the named anatomical socket; do not compare a
                # wrist boundary with the far end of an entire arm/garment.
                result=[]
                for obj in by_group[group]:
                    snap=snapshots[obj.name]
                    result.extend(snap.vertices[i] for i in snap.boundary_indices if (snap.vertices[i]-pivot).length<=.17)
                return result
            one,two=boundary(first),boundary(second)
            gap=boundary_gap(one,two)
            gaps.append({"pose":label,"a":first,"b":second,"pivot":pivot_name,"socketRadiusMm":170,
                         "boundaryVerticesA":len(one),"boundaryVerticesB":len(two),"maxBoundaryVertexGapMm":gap,
                         "status":"UNVERIFIED_NO_BOUNDARY" if gap is None else "FAIL" if gap>2 else "PASS"})
        for side,gid in (("Left","W12"),("Right","W13")):
            pivot=poses.head(side+"Hand"); sets=[]
            for bone in (side+"ForeArm",side+"Hand"):
                points=[]
                for obj in by_group[gid]:
                    if obj.get("char_modular_bone")!=bone:continue
                    snap=snapshots[obj.name]
                    points.extend(snap.vertices[i] for i in snap.boundary_indices if (snap.vertices[i]-pivot).length<=.11)
                sets.append(points)
            gap=boundary_gap(*sets)
            gaps.append({"pose":label,"a":gid+"_cuff","b":gid+"_hand","pivot":side+"Hand","socketRadiusMm":110,
                         "boundaryVerticesA":len(sets[0]),"boundaryVerticesB":len(sets[1]),"maxBoundaryVertexGapMm":gap,
                         "status":"UNVERIFIED_NO_BOUNDARY" if gap is None else "FAIL" if gap>2 else "PASS"})
    finally:
        for snapshot in snapshots.values():snapshot.close()
    print("BVH_POSE_DONE",label,"pairs",len(pairs),flush=True)

for name,values in (("pairs.csv",rows),("seams.csv",gaps)):
    with (args.out/name).open("w",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(values[0]));writer.writeheader();writer.writerows(values)
failed=[r for r in rows if r["status"]=="FAIL"]
unknown=[r for r in rows if r["status"]=="UNVERIFIED"]
failed_gaps=[r for r in gaps if r["status"]=="FAIL"]
unknown_gaps=[r for r in gaps if r["status"].startswith("UNVERIFIED")]
passed=not(failed or unknown or failed_gaps or unknown_gaps)
receipt={"scope":"Evaluated world-metre BVHTree.FromObject overlap; manual geometry fixtures, NOT Animator/game",
 "variant":"A+B_G0_20261104","attempt":args.attempt,"numericPassed":passed,"status":"NUMERIC_PASS_VISUAL_PENDING" if passed else "RETOUCH",
 "poses":fixture_rows,"pairCountPerPose":len(pairs),"totalPairRows":len(rows),"failedPairRows":len(failed),"unverifiedPairRows":len(unknown),
 "failedSeamRows":len(failed_gaps),"unverifiedSeamRows":len(unknown_gaps),"depthLimitMm":3,"gapLimitMm":2,
 "metricAlgorithmRevision":2,
 "maxSampledSurfaceDepthMm":max((r["maxSurfaceDepthMm"] for r in rows if r["maxSurfaceDepthMm"] is not None),default=None),"maxNearestVertexMm":max(r["maxNearestVertexMm"] for r in rows),
 "maxMeasuredBoundaryGapMm":max((r["maxBoundaryVertexGapMm"] or 0) for r in gaps),
 "metricLimits":["overlap is triangle intersection count, not penetration volume", "nearest vertex is a conservative sampling-dependent AABB-candidate contact distance; may include outside vertices; NOT penetrating-vertices-only depth",
 "surface depth uses contained vertex and intersecting-triangle centroid samples; continuous maximum is not certified",
 "open/nonmanifold surfaces or ray-sign disagreement remain UNVERIFIED; unsigned proximity is not penetration depth", "socket boundary Hausdorff uses actual boundary vertices in named socket bands; absent boundaries never become zero gap"],
 "priorAttemptSummary":{k:previous[k] for k in ("attempt","failedPairRows","unverifiedPairRows","failedSeamRows","unverifiedSeamRows") if previous and k in previous},
 "worstPairs":sorted(rows,key=lambda r:r["maxSurfaceDepthMm"] or 0,reverse=True)[:30],
 "worstSeams":sorted(gaps,key=lambda r:r["maxBoundaryVertexGapMm"] or -1,reverse=True)[:20],
 "playerRun":False,"unityRun":False,"paidCalls":0,"texturesGenerated":False,"stopAfterSecondFailure":args.attempt==2 and not passed}
previous_path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
lines=["# A+B BVH 관절 수치 검사", "", "판정: **"+receipt["status"]+"** / attempt "+str(args.attempt),
 "", "평가 좌표는 원본1.85m의 metre. 실제 Animator/Unity/game 검사가 아니다.",
 "표면 깊이와 최근접 정점거리(보수적 근사)를 분리한다. 열린 면의 내부 부호나 없는 경계는0으로 판정하지 않는다.",
 "", "| 포즈 | FAIL 쌍 | 미검증 쌍 | 최대 표면 깊이 mm | 최대 최근접 정점 mm | FAIL 틈 | 미검증 틈 |", "|---|---:|---:|---:|---:|---:|---:|"]
for label in LABELS:
    selected=[r for r in rows if r["pose"]==label]; seams=[r for r in gaps if r["pose"]==label]
    lines.append("|%s|%d|%d|%.3f|%.3f|%d|%d|"%(label,sum(r["status"]=="FAIL" for r in selected),sum(r["status"]=="UNVERIFIED" for r in selected),
        max((r["maxSurfaceDepthMm"] or 0) for r in selected),max(r["maxNearestVertexMm"] for r in selected),sum(r["status"]=="FAIL" for r in seams),sum(r["status"].startswith("UNVERIFIED") for r in seams)))
lines.extend(["","전체 쌍: pairs.csv / 경계: seams.csv / 조건·한계·최대쌍: receipt.json", "","## 침투 상위 쌍", "", "| 포즈 | A | B | 삼각형 겹침쌍 | 표면 깊이 mm | 최근접 정점 mm | 판정 |", "|---|---|---|---:|---:|---:|---|"])
for r in receipt["worstPairs"]:
    lines.append("|%s|%s|%s|%d|%s|%.3f|%s|"%(r["pose"],r["a"],r["b"],r["overlapTrianglePairs"],"미측정" if r["maxSurfaceDepthMm"] is None else "%.3f"%r["maxSurfaceDepthMm"],r["maxNearestVertexMm"],r["status"]))
(args.out/"summary.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
print("HYBRID_BVH_RESULT",receipt["status"],"attempt",args.attempt,"failPairs",len(failed),"unknownPairs",len(unknown),"failGaps",len(failed_gaps),"unknownGaps",len(unknown_gaps))
