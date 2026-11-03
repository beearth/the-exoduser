"""03:20 revision: stable original triangle IDs, explicit socket baseline only.
Open-sheet depth remains unverified, not a fabricated failure or zero depth.
"""
import argparse
import csv
import itertools
import json
from pathlib import Path
import sys
import bpy
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
from geometry_metrics import Snapshot
from hybrid_poses import Poses,LABELS
from rest_contact_policy import SOCKETS,SOCKET_ROWS,weapon_pair_required,decide
from hybrid_contract import SOFT_GROUPS

p=argparse.ArgumentParser();p.add_argument("--blend",type=Path,required=True);p.add_argument("--out",type=Path,required=True);p.add_argument("--attempt",choices=("1","2","sonnet1","sonnet2","prop1","prop2"),required=True)
a=p.parse_args(sys.argv[sys.argv.index("--")+1:]);a.out.mkdir(parents=True,exist_ok=True)
old_path=a.out/"rest-growth.json"
ORDER={"1":1,"2":2,"sonnet1":1,"sonnet2":2,"prop1":1,"prop2":2}
old=json.loads(old_path.read_text(encoding="utf-8")) if old_path.exists() else None
if old and ORDER[str(old["attempt"])]>=ORDER[a.attempt]:raise RuntimeError("No unchanged repeat or third same-criterion test")
if a.attempt=="prop2":
    first=a.out.parent/"prop1"/"rest-growth.json"
    if not first.exists() or json.loads(first.read_text(encoding="utf-8"))["attempt"]!="prop1" or json.loads(first.read_text(encoding="utf-8"))["measuredCriterionPassed"]:raise RuntimeError("prop2 only follows a failed prop1 with a changed model")
if a.attempt=="sonnet2":
    first=a.out.parent/"sonnet1"/"rest-growth.json"
    if not first.exists() or json.loads(first.read_text(encoding="utf-8"))["attempt"]!="sonnet1" or json.loads(first.read_text(encoding="utf-8"))["measuredCriterionPassed"]:raise RuntimeError("sonnet2 only follows a failed sonnet1 with a changed model")
bpy.ops.wm.open_mainfile(filepath=str(a.blend.resolve()))
assert bpy.context.scene.get("char_modular_revision")=="0320_rest_growth"
parts=[o for o in bpy.context.scene.objects if o.type=="MESH" and o.get("char_modular_hybrid")]
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
poses=Poses(rig);by_group={g:[o for o in parts if o["char_modular_group"]==g] for g in {o["char_modular_group"] for o in parts}}
pairs={}
def gs(*groups):return [o for g in groups for o in by_group[g]]
def add(one,two,why):
    for x,y in itertools.product(one,two):
        if x is y:continue
        if not weapon_pair_required(x["char_modular_group"],y["char_modular_group"]):continue
        pairs.setdefault(tuple(sorted((x.name,y.name))),set()).add(why)
add(gs("W12","W13"),gs("W04","W05","W15"),"forearms-chest/tassets")
add(gs("W08","W09"),gs("W04","W05","W06","W07"),"upperarms-shoulders/chest")
add(gs("W15"),gs("W03","W17","W18","W19","W20"),"tassets-thigh/knee")
add(gs("W24"),gs("W03","W04","W05","W14","W17","W18","W19","W20","W21","W22"),"cape-body/legs")
add(gs("W25"),gs("W04","W05","W15","W23"),"lead-approved-sword-scope")
add(gs("W23"),gs("W01"),"scarf-head-NO-REST-EXEMPTION")
for first,second,_ in SOCKET_ROWS:add(gs(first),gs(second),"named-socket")

def contacts(x,y):
    if not all(x.low[i]<=y.high[i]+1e-7 and y.low[i]<=x.high[i]+1e-7 for i in range(3)):return {}
    return {(x.triangle_ids[i],y.triangle_ids[j]):(i,j) for i,j in x.tree.overlap(y.tree)}

def depth(x,y,selected):
    """Contained samples from only selected contact triangles, in closed targets.
    No outside AABB vertices or vertex-spacing proxy enter the 3mm gate.
    """
    if not selected:return 0.,0,0,"NO_SURFACE_CONTACT"
    maximum=0.;valid_directions=0;uncertain=0;sample_count=0
    for source,target,indices in ((x,y,{i for i,_ in selected}),(y,x,{j for _,j in selected})):
        if not target.closed:continue
        valid_directions+=1
        vertex_ids={v for i in indices for v in source.triangles[i]}
        points=[source.vertices[i] for i in vertex_ids]
        for i in indices:
            tri=source.triangles[i];vertices=[source.vertices[j] for j in tri]
            points.append(sum(vertices,Vector())/3)
            points.extend((vertices[j]+vertices[(j+1)%3])/2 for j in range(3))
        for point in points:
            if not target.in_box(point):continue
            inside,ambiguous=target.inside(point);uncertain+=int(ambiguous)
            if inside:
                maximum=max(maximum,target.tree.find_nearest(point)[3]*1000);sample_count+=1
    if not valid_directions:return None,sample_count,uncertain,"OPEN_SHEETS_NO_VOLUME_SIGN"
    return maximum,sample_count,uncertain,"CLOSED_TARGET_SAMPLES" if valid_directions==1 else "BIDIRECTIONAL_CLOSED_TARGET_SAMPLES"

baseline={};rest_rows=[];rows=[];scarf_checks=[];topology=[];pose_rows=[]
labels=LABELS+("head_left","head_right","head_bow","head_bow_measured")
for label in labels:
    pose_rows.append(poses.apply(label))
    snapshots={o.name:Snapshot(o) for o in parts}
    try:
        for key,reasons in sorted(pairs.items()):
            first,second=key;x,y=snapshots[first],snapshots[second]
            group_a=bpy.data.objects[first]["char_modular_group"];group_b=bpy.data.objects[second]["char_modular_group"]
            current=contacts(x,y)
            absolute,count,uncertain,depth_scope=depth(x,y,list(current.values()))
            if label=="rest":
                baseline[key]={"pairs":set(current),"depth":absolute}
                rest_rows.append({"a":first,"b":second,"groupA":group_a,"groupB":group_b,"socketExempt":frozenset((group_a,group_b)) in SOCKETS,
                                  "overlapTriangleIdPairs":[list(k) for k in sorted(current)],"sampledDepthMm":absolute,"depthScope":depth_scope})
            base=baseline[key];fresh=set(current)-base["pairs"]
            new_depth,new_samples,new_uncertain,new_scope=depth(x,y,[current[k] for k in fresh])
            result=decide(group_a,group_b,base["pairs"],set(current),base["depth"],new_depth,absolute)
            rows.append({"pose":label,"a":first,"b":second,"groupA":group_a,"groupB":group_b,
                         "reasons":";".join(sorted(reasons)),**result,"restDepthMm":base["depth"],"poseDepthMm":absolute,
                         "newContactDepthMm":new_depth,"depthScope":depth_scope,"newDepthScope":new_scope,
                         "insideSamples":count,"uncertainRaySamples":uncertain+new_uncertain,
                         "topologyAClosed":x.closed,"topologyBClosed":y.closed})
        # Mandatory fixed-head fit is absolute and not covered by socket rules.
        if label in ("rest","head_left","head_right","head_bow","head_bow_measured"):
            hs=snapshots["Warrior_Head"];maximum=0.;inside_total=0;minimum=None
            for obj in by_group["W23"]:
                ss=snapshots[obj.name]
                points=list(ss.vertices)
                for tri in ss.triangles:points.append(sum((ss.vertices[i] for i in tri),Vector())/3)
                for point in points:
                    inside,ambiguous=hs.inside(point) if hs.in_box(point) else (False,False)  # outside the closed head's AABB can never be inside (11-04: removes ray-parity false positives, threshold unchanged)
                    dist=hs.tree.find_nearest(point)[3]*1000
                    if point.z>=1.46:minimum=dist if minimum is None else min(minimum,dist)
                    if inside:maximum=max(maximum,dist);inside_total+=1
            scarf_checks.append({"pose":label,"absoluteScarfInsideHeadDepthMm":maximum,"insideSamples":inside_total,
                                 "minimumRingSurfaceClearanceMm":minimum,"restExempt":False,"status":"PASS" if maximum<=3 else "FAIL"})
        if label=="rest":
            for name,snapshot in snapshots.items():
                if name in ("W15_A_018","W04_A_042","W11_A_041","W13_A_104"):
                    topology.append({"object":name,"closed":snapshot.closed,"nonmanifoldEdges":snapshot.nonmanifold_edges,"boundaryVertices":len(snapshot.boundary_indices)})
    finally:
        for snapshot in snapshots.values():snapshot.close()
    print("REST_GROWTH_POSE_DONE",label,flush=True)

failed=[r for r in rows if r["status"]=="FAIL"]
unknown=[r for r in rows if r["status"]=="UNVERIFIED_OPEN_SURFACE"]
scarf_fail=[r for r in scarf_checks if r["status"]=="FAIL"]
topology_fail=[r for r in topology if not r["closed"]]
passed=not(failed or scarf_fail or topology_fail)
status="MEASURED_REST_GROWTH_PASS_OPEN_SHEETS_PENDING" if passed and unknown else "MEASURED_REST_GROWTH_PASS" if passed else "FAIL"
for name,values in (("rest-growth-pairs.csv",rows),("scarf-head.csv",scarf_checks)):
    with (a.out/name).open("w",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(values[0]));writer.writeheader();writer.writerows(values)
(a.out/"rest-baseline.json").write_text(json.dumps({"scope":"stable original loop-triangle ID pairs in repaired A pose","socketAllowlist":SOCKET_ROWS,"pairs":rest_rows},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
result={"criterion":"0320_named_socket_rest_growth","attempt":a.attempt,"status":status,"measuredCriterionPassed":passed,
 "completeContactVolumeVerified":not unknown,"openSheetUnverifiedRows":len(unknown),"pairRows":len(rows),"failedRows":len(failed),
 "mandatoryScarfChecks":scarf_checks,"topologyChecks":topology,"poses":pose_rows,
 "failedPairs":failed,"socketAllowlist":SOCKET_ROWS,"maxMeasuredGateDepthMm":max((r["gateDepthMm"] or 0) for r in rows),
 "limits":["Only the named socket pairs may exclude existing rest triangle ID pairs","Scarf/head uses absolute fit; no rest exemption",
 "Nearest outside vertices and vertex-spacing proxy are not penetration depths", "Open-open sheet volume depths remain unverified; overlap counts are retained",
 "This is a sampled closed-target surface gate, not a continuous maximum proof or Animator/game PASS"],
 "readyForCandidateCompile":passed,"stopAfterSecondFailure":ORDER[a.attempt]==2 and not passed,"playerRun":False,"paidCalls":0}
old_path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
lines=["# 03:20 rest 대비 증가분 검사","", "상태: **"+status+"**", "", "소켓 허용표 쌍만 rest 겹침을 면제. 스카프/머리는 절대 검사. 열린 천끼리 체적은 미검증으로 남기며 게임 PASS가 아니다.","", "| 포즈 | FAIL | 열린면 미검증 | 최대 측정 gate mm |", "|---|---:|---:|---:|"]
for label in labels:
    selected=[r for r in rows if r["pose"]==label]
    lines.append("|%s|%d|%d|%.4f|"%(label,sum(r["status"]=="FAIL" for r in selected),sum(r["status"]=="UNVERIFIED_OPEN_SURFACE" for r in selected),max(r["gateDepthMm"] or 0 for r in selected)))
lines += ["", "## 스카프/머리 (rest 면제 없음)","", "| 포즈 | 머리 내부 최대 표본 mm | 고리 최소 표면 여유 mm | 판정 |","|---|---:|---:|---|"]
for r in scarf_checks:lines.append("|%s|%.4f|%.4f|%s|"%(r["pose"],r["absoluteScarfInsideHeadDepthMm"],r["minimumRingSurfaceClearanceMm"],r["status"]))
if failed:
    lines += ["", "## 실패 쌍", "", "| 포즈 | A | B | 새 겹침 | gate mm |","|---|---|---|---:|---:|"]
    for r in failed:lines.append("|%s|%s|%s|%d|%.4f|"%(r["pose"],r["a"],r["b"],r["newTrianglePairs"],r["gateDepthMm"]))
(a.out/"rest-growth-summary.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
print("REST_GROWTH_RESULT",status,"failed",len(failed),"scarfFail",len(scarf_fail),"unknown",len(unknown),"topologyFail",len(topology_fail))
