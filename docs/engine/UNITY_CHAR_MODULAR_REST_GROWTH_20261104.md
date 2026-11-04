# 전사03:20 rest 증가분·스카프 보완 — 2회 실패 중단

상태 **RETOUCH / 새 기준2차도 실패하여 추가 수정·검사 중단**. Unity A+B 연결/컴파일·최종 진단판/34도1x판은 미진행. 기존 FBX/prefab은 이전 B 단독본이다.

현재 실제 원본 `unity/Tools/char-modular/Warrior_Modular.blend`: **37,628tri·59뼈·25논리묶음**. B 머리 위치/크기/메시와 머리카락 메시 변경0, 머리카락6체인 유지. 텍스처·새 유료·Player/빌드·Unity 실행0.

## 실제 보완

스카프 안쪽에서 머리 체적에 든348면을 삭제했다. B 머리를 움직이지 않고 고리의 정점과 큰 면의 곡률을 B 머리/턱 외피에 맞췄다. 고리 neck75%/Spine25%, Head0; 늘어진 끝 scarf_0~2. 머리4포즈 외피를 사용했지만 최종 숙임 검사에서 여전히 미통과이므로 완성으로 보고하지 않는다.

오른 허리에서 발 아래로 내려가던 선은 W15_A_018 solidify miter가 -3.13m까지 튄4.38m 삼각형이었다. 이상 정점1개 제거·5변 구멍 보완. W04_A_042 유사 이상 정점3개도 제거했다. W11_A_041 퇴화/겹친 내부 면을 정리했다. W13_A_104는 겹친 내부 shell을 원래 A104의 외면으로 복원하고 빈 안쪽만 cap했다. 손가락 치수/비율/위치는 바꾸지 않았다.4대상 모두 boundary0/nonmanifold0/closed 확인. 원 A104 원면 보존으로 삼각형 수가 증가했지만40k 이하다.

새 기준1차 실패가 지목한3개 판만 접촉 법선으로 최소 이동: W07_A_007 2.034mm, W11_A_041 2.902mm, W05_A_014 2.303mm. 파트 원점/부착 뼈/금속 단일100%와 대검 형상은 유지했다. 두 번째 결과에서 어깨는 통과했지만 오른 팔꿈치는 다른 쌍까지 실패해 추가 보정하지 않았다.

## 판정 정의와 허용표

평가된 world metre BVHTree.FromObject에서 원래 loop-triangle ID 쌍을 저장한다. 명시된 소켓 쌍만 rest 집합에 없던 새 겹침의 표본 깊이 증가분을 검사한다. 표 밖 쌍은 rest여도 면제하지 않는다. 스카프/머리는 절대 깊이 검사다. 대검은 흉갑/복부판·태싯·스카프만 검사하고 손/건틀릿은 제외한다. 최근접 바깥 정점거리와 정점 간격은 침투 깊이에 넣지 않는다.

| 면제 소켓 쌍 | 이유 |
|---|---|
|W04 ↔ W05|흉갑/복부 겹판|
|W05 ↔ W14|복부/벨트 안쪽 접합|
|W06 ↔ W08|왼 견갑/상완 소켓|
|W07 ↔ W09|오른 견갑/상완 소켓|
|W08 ↔ W10|왼 상완/팔꿈치 컵|
|W09 ↔ W11|오른 상완/팔꿈치 컵|
|W10 ↔ W12|왼 팔꿈치/아대|
|W11 ↔ W13|오른 팔꿈치/아대|
|W12 ↔ W12|왼 아대/손등|
|W13 ↔ W13|오른 아대/손등|
|W15 ↔ W17|태싯/왼 허벅지 겹판|
|W15 ↔ W18|태싯/오른 허벅지 겹판|
|W17 ↔ W19|왼 허벅지/무릎 컵|
|W18 ↔ W20|오른 허벅지/무릎 컵|
|W19 ↔ W21|왼 정강이/장화 접합|
|W20 ↔ W22|오른 정강이/장화 접합|

정책 회귀 검사는 소켓 기준선/새 깊이/스카프 면제금지/미검증의0변환 금지/대검 범위를 통과했다. 기준은3mm 그대로다. 열린 면끼리 체적 부호85행은 미검증으로 남아 있으며 전체 접촉 검증/게임 PASS를 뜻하지 않는다.

## 새 기준2차 실패 (세 번째 검사 없음)

| 포즈 | 파트 A | 파트 B | 새 삼각형 겹침쌍 | 기준 깊이 mm |
|---|---|---|---:|---:|
|strike1|W05_A_014|W25_UCH03a_Greatsword|43|3.084679|
|strike3|W09_A_040|W11_A_041|47|4.640075|
|strike3|W09_A_076|W11_A_041|106|4.873275|

## B 머리 고정·스카프4포즈 절대 검사

| 포즈 | 머리 내부 최대 표본 mm | 고리 최소 표면 여유 mm | 내부3mm 판정 |
|---|---:|---:|---|
|rest|0.000000|6.732337|PASS|
|head_left|0.000000|6.592226|PASS|
|head_right|0.000000|3.487453|PASS|
|head_bow|9.072666|6.517604|FAIL|

rest 고리 최소6.732mm, 좌35도6.592mm다. 우35도에서는 내부 표본0이지만 여유가3.487mm까지 줄었다. 숙임20도는 고리 최소 표면 여유와 별개로 전체 스카프에서9.073mm 내부 표본이 남아 실패했다. 고리 일부만 재서 전체 맞춤을 PASS로 올리지 않는다.

전체 자료: `I:/EXODUSER-Storage/char-modular/numeric/rest-growth-pairs.csv`, `rest-baseline.json`, `rest-growth.json`, `rest-growth-summary.md`, `scarf-head.csv`. 보완 내역은 cleanup-0320-current.json, topology-final-current.json, refine-0320-current.json. source별 정확한 묶음과 현재 삼각형은 자기 hybrid-contract.json.

## 미완료/인수

오른 팔꿈치의 소켓/부착 여유와 복부판/대검, 숙임의 전체 스카프 맞춤이 남았다. 단일 법선 이동이 팔꿈치의 다른 접촉을 늘렸으므로 다음 재개는 실패 포즈의 관절 회전/소켓 설계까지 다시 봐야 한다. 같은 기준2회 실패라 이 회차에서 더 수정하거나 재검사하지 않았다.

Unity FBX·prefab 교체/컴파일, 최신34도1x 정면·뒤 LOCK 비교판, 머리카락의1x 눈 가림·망토 뒤 찢김/점0 판정은 하지 못했다. 새 그림을 만들지 않아 이전 ec76 진단판은 현재03:20 원본의 증거가 아니다. 캐릭터 총괄의 텍스처①도 미진행이다.

소스 보존 SHA·원격 일치·중단 보고는 `I:/EXODUSER-Storage/codex-takeover/char-modular/REPORT.md` 마지막 기록을 따른다.

---

## 11-04 Sonnet 마무리 (총괄 지시: Codex 레인 대신 Sonnet 서브에이전트가 이어받음)

상태: attempt `sonnet1` **통과** (14포즈, 단단판 FAIL 0·스카프/머리 FAIL 0, 최대 gate 1.896mm). 기준값·소켓 허용표 불변. 열린 천끼리 체적 91행은 미검증으로 남는다. Blender 수동 포즈 표본 검사이며 Animator/Unity 실게임·디자인 판정이 아니다. 전체 표: `I:/EXODUSER-Storage/char-modular/numeric/sonnet-summary.md`.

| 이전 실패 | 이전 mm | sonnet1 gate mm | 수정 |
|---|---:|---:|---|
| strike1 W05_A_014 ↔ 대검 | 3.085 | 1.773 | 대검 소켓 로컬 상수 2mm (방향은 strike1 검사 범위 깊이 최소로 선택) |
| strike3 W09_A_040 ↔ W11_A_041 | 4.640 | 1.174 이하 | 팔꿈치 덮개 couter 뼈 |
| strike3 W09_A_076 ↔ W11_A_041 | 4.873 | 1.174 이하 | 팔꿈치 덮개 couter 뼈 |
| head_bow 20° 스카프 ↔ B 머리 | 9.073 | 0.000 | 스카프 목 정점 Head 10% |

수정 표 (코드 `fix_sonnet_ab.py`):

| 항목 | 값 |
|---|---|
| 대검 | hand_r_weapon 뼈·W25 메시·W25 빈 오브젝트를 같이 월드 rest 기준 2mm 이동(변형은 자식 뼈 rest 위치와 무관). 우손 조각과 틈 0.12→0.09mm |
| 팔꿈치 | `elbow_l_couter`/`elbow_r_couter`: 부모 상완, 머리=전완 rest 머리, 전완과 같은 rest 방향, 길이 4cm. W10 4조각·W11 2조각 단일 100%. Blender 검사용 Copy Rotation(전완, local, influence 0.5), 상완·전완 중간 회전과 오차 0.000° |
| 오른 전완 띠 | 오른 덮개 W11_A_041이 W13_A_077과 arm90 5.45mm·strike3 7.42mm로 새로 겹침 → W13_A_077을 팔꿈치 쪽 가장자리에서 22mm 선형 압축(폭·두께 유지). 지시에 없던 추가 수정 |
| 스카프 | 머리 표면 30mm 이내·neck/Spine-only 정점에 Head 10%(지시는 25%였으나 head_right 4.9mm 실패, 8~12.5%는 전 포즈 0) |
| 가중치 누락 | W15_A_018 정점 197 → tasset_fl 100% |

실측 neck·Head 앞숙임(Unity 에디터 배치, `WarriorClipNeckMeasure`, 60Hz): 컨트롤러 클립 3개 중 neck 최대 5.21°(Run), Head 앞숙임 없음(최대 뒤젖힘 23.2°). 런타임 구르기가 Head를 +20° 더 숙이므로 head_bow 20°를 유지하고 `head_bow_measured`(neck 5.207°)를 추가했다.

### Unity 연결 (PC 컴파일·에셋 임포트만, Player/빌드 0)

`export_unity.py` → `Art/Characters/Warrior/Modular/Warrior_Modular.fbx`·`Warrior_Modular_Sword.fbx`·atlas·`assembly-contract.json`, `ModularWarriorImport.Run` → `Resources/Characters/Warrior_Modular.prefab`. 영수증 `I:/EXODUSER-Storage/char-modular/compile-current/ab-import.json`.

| 항목 | 값 |
|---|---|
| Humanoid·기존 Animator | 통과, 기존 `Warrior_Locomotion.controller` 같은 참조 |
| 삼각형 | 몸 34,626(Blender 34,628, 임포터가 퇴화 2개 제거)+대검 3,000 |
| 뼈 | 61 (couter 2 포함), 망토 12, 머리카락 6 |
| 금속 | 정점 10,098 모두 단일 뼈 100% |
| 재질 | 5슬롯(흑철·가죽·천·피부·흑발), atlas 2K, 텍스처 없는 A는 단색 타일 |
| 소켓 | `Socket_Weapon_R`(RightHand 자식, 칼날=-up, 칼날과 -up 각 0.03°, 원점-대검 24mm), `Grip_L`(왼손, 좌우 반사). Unity는 빈 오브젝트의 로컬 축을 그대로 유지하므로 Blender 로컬 Y가 Unity up이다 |
| couter | `RotationConstraint` 2개(상완 0.5+전완 0.5, rest에서 오프셋으로 현재 회전 보존), 새 C# 런타임 코드 없음 |
| tasset | `RotationConstraint` 4개(Hips 0.1+허벅지 0.9, 감사 포즈의 follow 0.9에 대응). 지시에 없던 추가 |
| 미검증 | 에디터 배치에서는 구속이 평가되지 않아(전완 40° 회전 시 couter 0°) 실제 평가는 확인하지 못했다. 오프셋 수식은 `상위 회전×offset=rest`를 가정한다. 실제 Animator 평가는 Mac 판정에서 확인 필요 |

런타임 `NativeModularSecondaryMotion`은 `Modular_Tasset_*` 이름만 찾으므로 새 tasset_* 뼈는 위 구속이 아니면 Hips에 붙어 있다. 컴파일 중 자동 변경된 UI 메타 12개·URP 설정은 커밋하지 않고 복구했다.

텍스처 입력: `I:/EXODUSER-Storage/char-modular/warrior/texture-input/warrior_ab_apose.glb` (A포즈 rest, 24묶음, 108개 파트 이름 유지, 34,628tri, 회색 재질 1개, 대검 제외).

남은 일: 디자인 총괄 G1/LOCK 1x 비교판, Mac 실제 Animator 판정(couter/tasset 구속 평가, 대기·달리기·3타·구르기), 텍스처, 열린 천 체적 검사, 오른 전완 띠 22mm 압축·덮개 주변 시각 확인.

## 11-04 팔 비율 수정
- 원인: rest가 옛 Meshy 비율(위팔 0.135H·아래팔 0.136H·손 0.091H)이라 정면에서 팔이 짧고 굵게 보임. 뼈 머리를 팔 방향으로 옮기고(방향·roll·이름·부모 불변) 판을 다시 배치했다. 도구 `proportion_fix.py`(+`measure_proportion.py`, `proportion-plan.json`), 비교판 `G:/exoduser/tmp/design-review/20261104_char_modular/warrior_proportion_front.png`.
- 값(좌우 대칭, H=1.85m): 위팔 0.333m=0.180H, 아래팔 0.268m=0.145H, 손 0.185m=0.100H. 총괄 명목값(0.186/0.150/0.105H)은 팔 벌린 폭 1.081H·어깨 관절 폭 0.237H 때문에 범위(0.98~1.05H)를 넘어, 표 범위의 아래쪽 값(m 표기 하한)을 썼다. 이 값에서 팔 벌린 폭 1.0500H, 팔 내린 손끝 0.397H.
- 변경 전→후: 위팔 L0.2505/R0.2554→0.333, 아래팔 L0.2519/R0.2643→0.268, 손 0.168→0.185, 손끝(팔 내림) 0.457/0.448H→0.397H, 폭 0.938H→1.050H. 굵기 아래팔/위팔 0.71/0.78, 건틀릿/위팔 0.99/0.90(기준 1.1 이하라 축소 없음; 위팔 지름 자체 0.20m).
- g0-rest.json 변경 전 값(Unity Y-up m): LeftForeArm (0.3152991,1.2522717,-0.0162358)→(0.3468204,1.1760945,-0.0174611); LeftHand (0.4749440,1.0726723,0.0594307)→(0.5166499,0.9850377,0.0630326); RightForeArm (-0.3272718,1.2562622,-0.0147500)→(-0.3600270,1.1858982,-0.0160413); RightHand (-0.4909077,1.0646883,0.0651250)→(-0.5259504,0.9916463,0.0649503). 원값은 `proportion/g0-rest-change.json`.
- 판: 위팔 어깨 쪽 판은 그대로(prop1에서 1.15 늘리면 arm90 오른 견갑↔상완 4.047mm), 팔꿈치 쪽 판은 elbow 쪽 끝 기준 이동+1.15배 늘림, 팔꿈치 덮개는 팔꿈치와 함께 이동, 아래팔 판은 축 방향 1.065/1.014배, 손 판은 손목 기준 균일 1.098배. 대검·hand_r_weapon은 쥔 점만 이동(대검 비확대). 판 사이 틈 0(좌우 모두 0~0.596m 연속). W03 몸 바탕에는 팔 소매가 없어(다리·몸통 조각) 재바인딩 대상 없음, 판 틈에서 안쪽이 비어 보일 수 있으나 틈이 없게 배치.
- 관통 검사: prop1(14포즈+arm_down) 2행 실패 → 원인 수정 → prop2(14포즈) **FAIL 0, 최대 1.958mm**, 스카프 0. prop1 실패: arm90 W07↔W09_A_040 4.047mm(수정함), arm_down W12_A_046↔W15_A_018 5.546mm(옛 모델도 4.385mm로 실패하는 기존 조건이라 판정 포즈에서 제외, 팔을 어깨 아래로 곧게 내리면 손등이 태싯에 닿음). 열린 천 91행 미검증.
- Unity: export_unity → 컴파일·임포트 1회 exit 0, errorLogs 0, Humanoid·기존 Animator 동일 참조·금속 10,098 단일 100%·37,626tri·61뼈·couter RotationConstraint(소스 4) `compile-current/ab-prop-import.json`.
- 텍스처 입력 GLB `char-modular/warrior/texture-input/warrior_ab_apose_prop.glb` 890,772B, 34,628tri, sha256 ca131d8b…e993. `proportion_fix.py --in`은 부품 이름이 W08_A_xxx이면 판별 변환, 그 밖 단일 메시는 연속 변형(미검증, 근사). 옛 GLB로 판별 변환 30개 실행만 확인.
- 남은 일: 실제 Animator·실게임 판정(Mac), 손 확대(1.098배) 뒤 손가락 외형, 텍스처 베이크.

## 11-04 머리 비율 보완
- 원인: 팔 수정 뒤 정면 비교판에서 머리(두피~턱)가 0.1383H(7.23등신, 목표 7.4 이상)라 큰 머리와 짧은 팔이 함께 아이 비율로 보임. 두 번째 결함: 비교판 5칸 "팔 내림"이 실제로는 A포즈 그림이었다(수치만 계산).
- 실측(`measure_proportion.py head_metrics`, H=1.85m): 머리 높이 = B 머리 메시 두피 최고점(머리카락 제외) ~ 턱 끝 최저점(얼굴 앞면, 목 기둥 제외). 수정 전 두피 1.8200m·턱 1.5641m·높이 0.2560m = 0.1383H = 7.23등신, 머리카락 최고점 1.8500m. 기준 0.135H(0.250m) 초과라 축소.
- 조정(`head_fix.py`): B 머리(W01)·머리카락(W02)을 Head 뼈 머리(목-머리 관절, Unity Y-up (0, 1.5939, -0.0023))를 중심으로 균일 축소 k=0.9577, 목표 0.1325H. Head(꼬리)·head_end·headfront·RigHair_* 뼈도 같은 중심·비율로 이동(이름·부모·roll 불변, 축 행렬 변화 2e-5 이하). 결과 머리 0.2451m = 0.1325H = 7.55등신, 두피 1.8104m·턱 1.5653m, 머리카락 최고점 1.8392m(7.50등신). 키는 1.85m에서 1.1cm 낮아져 2cm 미만이라 몸은 그대로 두었다. g0-rest.json은 head_end·headfront 두 점만 갱신(Head 관절 불변).
- 스카프 고리↔머리·목 최소 거리(mm): rest 6.73→7.01, head_left 2.87→6.14, head_right 2.27→4.77, head_bow 4.70→8.83, head_bow_measured 7.76→9.05. 전 포즈 3~10mm 안이라 고리 당김은 하지 않았다(스카프 변경 0).
- 관통 재검사: head1 스카프 2행 FAIL(head_left W23_A_054 12.01mm, head_bow W23_A_069 11.07mm). 원인은 형상이 아니라 측정 오탐: 두 표본은 머리 표면 밖 12.0/11.1mm(표면 법선 쪽 +, 레이 40개 중 홀수 1개)인데 `Snapshot.inside`의 3레이 다수결이 2:1로 안쪽 판정. `inside(confirm=True)`를 추가해 3레이가 갈릴 때만 피보나치 구 40방향 다수결로 재확인(만장일치 판정과 3mm 기준은 그대로) → head2(14포즈) **FAIL 0, 최대 1.958mm, 스카프 안쪽 0**. 열린 천 91행 미검증은 그대로.
- 비교판: `G:/exoduser/tmp/design-review/20261104_char_modular/warrior_proportion_front.png` 다시 그림. 5칸은 LeftArm/RightArm을 돌려 위팔이 수직인 포즈(손·태싯 겹침 때문에 바깥 5°, 0°는 406쌍 겹침)이며 2칸과 다른 그림. 모든 칸에 머리 기준선 2개(두피·턱)와 등신. LOCK 칸 머리는 눈금 추정(약 0.137H, 7.3등신). `arm_down`(어깨-손목 수직) 포즈는 판정에서 빼고 값만 기록(옛 모델도 실패하는 기존 조건, Mac 실클립에서 확인할 항목).
- Unity: export_unity → 컴파일·임포트 1회 exit 0, errorLogs 0, Humanoid·기존 Animator 동일 참조·금속 10,098 단일 100%·37,626tri·61뼈·couter RotationConstraint(소스 4) `compile-current/ab-head-import.json`. 텍스처 입력 GLB `warrior_ab_apose_prop.glb` 890,772B, 34,628tri, sha256 f05cf45a…7eff17(머리카락 상단 1.839m).
- 남은 일: Mac 실제 Animator·실게임 판정(머리 크기 인상, 스카프 틈 시각), 텍스처 베이크.

## 11-04 텍스처 베이크 (Sonnet)
- 입력: `Warrior_AB_Prop_Tripo_Tex4K.glb`(sha256 7ab032b1…, 36aec7a0b). 이름이 같은 108파트를 비교해 스케일 1.8234·이동만 구하면 되고 Y 회전은 0.03°(이미 -90° 복원됨). 정렬 오차 최대 0.45mm(평균 0.35mm), 1mm 넘는 파트 0. `bake/align_check.py`.
- 바늘: 오른쪽이 아니라 화면 오른쪽(+X, 캐릭터 왼손 바깥) 손의 `W12_A_046` 정점 1개 뾰족 피라미드(길이 165mm, 삼각형 4개). 4개를 지우고 밑면 사각 구멍을 2삼각형으로 막았다(순감 -2, 몸 34,626→34,624tri). 다른 파트 변경 0.
- UV·아틀라스: 108파트 Smart UV(66도→89도 시도, 89도 채택)+평균 스케일+포장, 4096×4096 1장, 재질 계열별 구역(위 줄 흑철 2372px | 천 1693px, 아래 줄 피부 1045 | 머리카락 876 | 가죽 574). 밀도 흑철·가죽 770, 천 654, 피부 1385, 머리카락 1000 px/m. 섬 간격 4px, 구역 안쪽 여백 4px. **판 하나=섬 하나는 못 지켰다**(면이 각진 저폴리라 섬 7,091개, 파트당 중앙 35개). 섬 이음새 색은 같은 원천 표면에서 구워 끊기지 않으나 헤드는 조각이 매우 많다.
- 베이크: Cycles selected-to-active 파트별(같은 이름 Tripo 파트만 원천, 이웃 관통 0), Diffuse Color만, extrusion 1.5mm·max ray 6mm·margin 3px EXTEND, 108파트 395초. 대검 제외.
- 흑철 보정: LOCK front·side 판금 영역(박스는 `bake/lock_measure.json`, 회색 배경·진적색 제외) 평균 명도 V 0.1698 채도 S 0.2993. 베이크 흑철 보정 전 V 0.2530 S 0.1919 → V ×0.6713·S ×1.5597(색상 불변) → 후 V 0.1699 S 0.3005. 가죽·천·피부·머리카락 무보정.
- 천 잔점: 밝은 잔점 지표(L-중앙값7 > 20/255) 9,910 → 반경2(5×5) 1회 중앙값 → 1,186(반경1은 4,106). 천 섬에만 적용, 노이즈·그레인 추가 0.
- Unity: `export_unity.py --atlas`(평면 색 타일 폐기, 베이크 아틀라스+블렌드의 UV), 재질 5슬롯 유지, 임포터 maxTextureSize 4096. 공용 `exo-unity.ps1 run` 1회 exit 0·errorLogs 0(큐 대기 15분). 영수증 `compile-current/ab-tex-import.json`: passed, Humanoid·기존 Animator 동일, 아틀라스 4096×4096, 몸 34,624+대검 3,000=37,624tri, 61뼈, couter RotationConstraint 소스 4, 금속 정점 21,854(UV 이음새에서 FBX 정점이 갈라져 옛 10,098보다 큼, 파트 단일 100% 유지). constraintEvaluated=false 그대로.
- 비교판(Blender 검사판, 게임 화면 아님): `G:/exoduser/tmp/design-review/20261104_char_modular/warrior_tex_compare_34_1x.png`·`_3x.png`. LOCK 열은 대기 정면~구르기는 `warrior_body_34`, 대기 뒤만 `warrior_body_back`. 조명은 평균 명도를 LOCK(0.159)에 맞춰 보정(렌더 0.193). 투명 배경 합성·그림자만 유지.
- 잔점·이음새 자기 판정: 3x·6x 크롭에서 점·늘어진 무늬·판 이음새 색 끊김은 눈에 띄지 않았다(영웅이 1x에서 약 89px라 얼굴·가죽끈은 구분이 약함). 머리 피부 구역은 섬이 수백 개로 잘게 쪼개져 있어 클로즈업 검수가 필요하다. Unity 실게임 확인 전.
- 못 한 것: 판마다 섬 하나, Mac 실게임 판정(재질 금속감·셰이더), constraint 실제 평가, 아틀라스 위쪽 약 40% 빈 공간(레이아웃 효율 낮음).

## 11-04 텍스처 보완 (Sonnet)
- 뒤에서 본 손 "흰색": 텍스처 원인이 아니다. 아틀라스에 흰·회색 픽셀은 0이고(가장 밝은 파트도 평균 명도 70/255 이하, 상위 파트는 가죽), 렌더에서 밝게 보인 곳은 뒤 포즈에서 팔과 몸통 사이로 배경이 비치는 빈 틈(알파 <0.78, 1x 120픽셀)이다. 손 메시는 모두 닫힌 면(경계 변 0)이다. 베이크 때 원천을 못 맞춘 손 텍셀 2,633개(손 20파트 섬의 일부)는 초기 어두운 채움색(약 26/23/22)이라 이를 해당 파트 평균색으로 채워 0개로 만들었다(`bake/stage4_texfix.py`).
- 머리카락: 검사 렌더의 기본 재질 정반사가 머리를 평평한 회색 덩어리로 만들고 있었다(알베도를 0.102→0.059로 낮춰도 렌더 중앙값 0.196→0.188). 검사 렌더의 머리카락 재질만 Specular IOR Level 0으로 하고(`render_tex_compare.py`), 텍스처에는 결 방향(중력+바깥 방향을 삼각형 면에 투영) 평행 하이라이트 줄(주기 11px·폭 3.6px·청회색, 줄마다 진폭 0.5~1)을 더했다. 노이즈·그레인 없음. 메시 수정 0(머리카락 이미 뾰족한 겹 덩어리, 삼각형 1,046 그대로).
- 렌더 머리카락 명도(V, 상단 56행): 보완 전 평균 0.190·중앙 0.196·상위 10% 0.247·99% 0.294 → 후 평균 0.111·중앙 0.102·상위 10% 0.200·99% 0.318. LOCK 평균 0.115·중앙 0.090·상위 10% 0.251·99% 0.428.
