"""Package existing measurements without any new geometry test or art edit."""
import csv
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

project=Path(__file__).resolve().parents[3]
root=Path("I:/EXODUSER-Storage/char-modular")
initial=json.loads((root/"hybrid-current.json").read_text(encoding="utf-8"))
repair=json.loads((root/"hybrid-repair-current.json").read_text(encoding="utf-8"))
audit=json.loads((root/"numeric/receipt.json").read_text(encoding="utf-8"))
assert audit["attempt"]==2 and audit["stopAfterSecondFailure"]
pair_rows=list(csv.DictReader((root/"numeric/pairs.csv").open(encoding="utf-8-sig")))
changes={r["object"]:r for r in repair["plates"]}
initial["preInnerRepairTriangles"]=initial["triangles"]
initial["triangles"]=repair["triangles"]
for row in initial["parts"]:
    if row["name"] in changes:row["triangles"]=changes[row["name"]]["trianglesAfter"]
initial["scope"]="A+B authoring, numeric attempt2 not passed; no Unity A+B export/adoption"
initial["numericPassed"]=False
initial["numericStatus"]="STOP_AFTER_TWO_NUMERIC_FAILURES"
initial["numericSummary"]={k:audit[k] for k in ("attempt","totalPairRows","failedPairRows","unverifiedPairRows","failedSeamRows","unverifiedSeamRows","maxSampledSurfaceDepthMm","maxNearestVertexMm","metricLimits")}
initial["innerRepairSummary"]={"plates":len(repair["plates"]),"closedAfter":sum(r["after"]["closed"] for r in repair["plates"]),"thicknessMm":1.2}
initial["rawAProjectSource"]="unity/Tools/char-modular/Warrior_Tripo_Parts.glb"
initial["UnityPrefabStatus"]="Existing prefab/FBX are obsolete B-only; A+B is NOT connected or compiled"
initial["sourceFrameLimit"]="A raw limb anchors are fitted from normalized part bounds; zero origin error is NOT anatomical/geometry acceptance"
contract=Path(__file__).parent/"hybrid-contract.json"
contract.write_text(json.dumps(initial,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

lines=["# 전사 A+B 재조립·BVH 계측 (2026-11-04)","",
 "상태 **RETOUCH — A+B 수치 검사2회 미통과로 중단**. 세 번째 검사/추가 형상 수정/텍스처/새 유료 생성 없음.","",
 "현재 저작 원본은 `unity/Tools/char-modular/Warrior_Modular.blend`다. A107조각 중 A 머리/머리카락3·27을 B로 대체하고, 나머지105조각을 G0의25개 논리 묶음에 대응했다. 대검은 명시 예외인 기존 UCH-03a다. **비머리23묶음=A22+기존 대검1**. 최신 브리프 축약 W번호와 원래25번호의 대응은 hybrid-contract.json과 REPORT에 적었다.","",
 "최종 **35,088tri·109메시·59뼈**, 망토12·머리카락6·앞치마6·스카프3·태싯5·견갑2·무기 소켓. 금속은 판마다 단일100%, 천/바탕/머리만 혼합 스킨. A의 겹판을 반구로 바꾸지 않았다.","",
 "A 정규화 높이1.85m, G0 원 A포즈24뼈 정렬. A의 팔/다리 원시 기준점은 정규화 bounds에서 맞춘 추정치이며 실제 관절의 기하 합격을 뜻하지 않는다. 원점/회전0과 관통/틈 합격은 구분한다.","",
 "망토는30mm 수평 실루엣 필터와10개 넓은 밑단 컷으로46,139면을 지웠다. 8~12개 찢김의 최종 시각 합격이나 잔점0를 선언하지 않는다. 첫 수치 결과가 지목한 A 단단판67개에1.2mm 안쪽 면을 보완했고65개가 닫힌 체적이 됐다. W11_A_041과 W13_A_104는 비다양체 각1edge가 남았다. B 머리/머리카락·대검·파트 배치 이동은 바꾸지 않았다.","",
 "## G0 조각 묶음·원점 정렬", "", "| G0 | 묶음 | A 조각 번호/출처 | 원점 최대 mm | 회전 최대 도 |", "|---|---|---|---:|---:|"]
for gid,g in initial["groups"].items():
    rows=[r for r in initial["partAlignment"] if r["group"]==gid]
    source=",".join(map(str,g["sourceIds"])) or ("기존 UCH-03a" if gid=="W25" else "B 유지")
    lines.append("|%s|%s|%s|%.6f|%.6f|"%(gid,g["label"],source,max(r["originErrorMm"] for r in rows),max(r["rotationErrorDeg"] for r in rows)))
lines += ["", "## G024뼈 rest 위치 오차", "", "| 뼈 | 원본 FBX→G0 전 mm | 정렬 후 mm |", "|---|---:|---:|"]
for row in initial["boneAlignment"]:lines.append("|%s|%.6f|%.6f|"%(row["bone"],row["beforeErrorMm"],row["afterErrorMm"]))
lines += ["", "## 수치 검사와 한계", "",
 "BVHTree.FromObject를 평가된 world metre 좌표에 구성한 뒤 overlap() 삼각형 쌍과 깊이를 따로 기록했다. 팔꿈치140°/무릎120°는 실제 뼈 벡터 각도도 확인했다. 10개 수동 포즈×1,144쌍=11,440행. 기존 Animator 클립/Unity 게임 화면이 아니다.","",
 "기준물 검사는 분리/좌표변환·1mm 관통·완전 내포·열린면 미검증·1.5mm 경계 간격을 통과했다. 열린 판의 뒷면을 내부로 가정한 1차 계측의 큰 값은 확정 침투가 아니다. 2차는 열린 면의 접촉 주변 무부호 거리와 닫힌 체적의 표본 내부 깊이를 분리했다.","",
 "2차: **최근접 정점거리 기준 FAIL50행·미검증1,050행·이음새170행 전부 미검증**. FAIL50행을 실제3mm 초과 침투50건으로 해석하지 않는다. 닫힌 단단판 간 확인된 표본 표면 깊이는 최대 약1.552mm지만, 최근접 정점거리와 열린 체적/경계 증거가 남아 전체 합격 아님. 스카프 W23_A_069→닫힌 B 머리에는 약27.73mm 내부 표본이 있으나 스카프 자체가 열린 면이라 전체 쌍의 깊이는 미검증이다.","",
 "1.2mm 보완 후 단단판이 닫혀 기존의 열린 경계 정점이 사라졌다. 경계가 없음을 틈0으로 대체하지 않았다. 다음 재개에는 실제 맞닿는 소켓 림/내피 인터페이스를 명시하고 그 경계·표면 간격을 검사해야 한다. 최근접 정점 지표에는 겹친 쌍의 AABB 후보 정점 중 체적 밖 정점도 포함될 수 있어, 침투 정점만의 깊이가 아니다. 감면 정점 간격의 영향도 있다. 50행은 이런 보수 후보거리 기준이며 실제 침투50건이 아니다. 다음에는 침투 정점/교차영역과 후보 정점거리를 분리 검증해야 한다. 연속 체적의 정확한 최대 침투를 인증하지 않았고3mm/2mm 기준을 낮추지 않았다.","",
 "전체 표: `I:/EXODUSER-Storage/char-modular/numeric/pairs.csv`, `seams.csv`, `receipt.json`, `summary.md`. 진단판 `warrior_hybrid_contact_diagnostic.png`의 빨강은 기존 CSV의 삼각형 표면 접촉 쌍이다. >3mm 침투 확정이나 통과1x판이 아니다. 진단판 생성에서 수치 재검사/원본 저장은 하지 않았다.","",
 "## 연결 상태", "",
 "**A+B는 Unity로 내보내거나 컴파일하지 않았다.** 기존 Modular FBX/prefab과068be 소스 컴파일 영수증은 G0 FAIL인 이전 B 후보에만 해당한다. 그 prefab을 A+B라고 검수하면 안 된다. 수치 미통과라 새 LOCK 나란히34도1x 합격판·Tripo 텍스처·Unity 인수로 진행하지 않았다. Player/빌드0, 새 유료0(360/500cr 유지).", "",
 "원본/도구/계약은 자기 브랜치에 보존한다. 최종 커밋·원격 일치와 중단 인수는 `I:/EXODUSER-Storage/codex-takeover/char-modular/REPORT.md` 마지막 기록을 따른다."]
(project/"docs/engine/UNITY_CHAR_MODULAR_HYBRID_20261104.md").write_text("\n".join(lines)+"\n",encoding="utf-8")

path=root/"numeric/warrior_hybrid_contact_diagnostic.png"
with Image.open(path) as src:
    src=src.convert("RGB")
    if src.height==768:
        canvas=Image.new("RGB",(768,880),"#242828");canvas.paste(src,(0,88))
        draw=ImageDraw.Draw(canvas);font=ImageFont.truetype("C:/Windows/Fonts/malgun.ttf",18);small=ImageFont.truetype("C:/Windows/Fonts/malgun.ttf",13)
        draw.text((12,10),"A+B 팔꿈치140° 접촉 진단 / 수치2회 미통과·중단",font=font,fill="#eeeeea")
        draw.text((12,41),"빨강=기존 BVH 삼각형 표면 접촉. 3mm 초과 침투 확정 아님.",font=small,fill="#eeeeea")
        draw.text((12,61),"34°·거리3m 확대. 실제 Animator/게임/1x/LOCK 합격판 아님. 새 검사·원본 저장0.",font=small,fill="#eeeeea")
        draw.text((12,861),"텍스처 전 중립 재질 진단. 열린 면·소켓 경계 미검증을0/PASS로 바꾸지 않음.",font=small,fill="#eeeeea")
        canvas.save(path)
print("HYBRID_REPORT_AND_EXISTING_DIAGNOSTIC_PACKAGED; no geometry test")
