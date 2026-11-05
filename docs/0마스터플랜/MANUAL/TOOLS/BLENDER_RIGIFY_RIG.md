# TOOLS — Blender 리깅: Rigify · 본 이름 표준 · Unity Humanoid/UE 호환 (2026-11-05, 클라우드 조사)

## ① 목적 · 우리 파이프라인의 단계
- 영웅·장비 파트가 공유할 **공용 스켈레톤 1개**를 만든다(CH 브리프 §1-2·3). 리깅 3D → 실시간 픽셀 렌더(11-03)의 출발점이고, 모캡 리타깃(D-MO-1)·장비 갈아입기(TOOLS 5)·소켓(TOOLS 4)이 전부 이 스켈레톤 위에 선다.
- 엔진 독립: 변형(DEF) 본만 FBX로 내보내 Unity Humanoid와 UE IK Rig 양쪽에 맵핑되게 한다.

## ② 입력 형식
- 베이스 바디 메시(.blend, 단위 m, 원점 발밑, +Y 정면이 아니라 **Blender -Y 정면 / Z 위**, 스케일 1, A-포즈 또는 T-포즈·LOCK 시트 기준), 삼각/쿼드 무관, 머티리얼 슬롯 정리 상태.
- Rigify 메타리그(기본 `Human (Meta-Rig)` 또는 UnityRig 메타리그).

## ③ 옵션 전수표
| 옵션(도구) | 무엇을 바꾸나 | 우리 설정값 | 근거 출처 |
|---|---|---|---|
| Rigify 메타리그 종류: Human / Basic Human / Animals… | 생성될 컨트롤·DEF 구조 | Human(손가락 포함) | docs.blender.org/manual/en/dev/addons/rigging/rigify/metarigs.html `[발췌]` |
| 메타리그 본 Rigify Type(limbs.arm/leg, spines.basic_spine, faces.*) | 서브 리그 종류·세그먼트 수(DEF 분할) | 팔·다리 segments 2(트위스트 1개씩), 척추 4, 얼굴 리그 **끔**(픽셀 렌더에서 안 읽힘) | 〃 + Rig Types 페이지 `[발췌]` |
| Bone Collections UI(Rigify 4.x) · Color Sets · Selection Sets | 생성 리그의 컬렉션·색 | 기본 | docs.blender.org …/rigify/metarigs.html(4.2~4.5) `[발췌]` |
| Generate · Advanced: Overwrite/New, Rig Name, Force Widget Update | 재생성 방식 | Overwrite, 이름 `RIG_<영웅>` | docs.blender.org …/rigify/basics.html `[발췌]` |
| DEF/ORG/MCH 컬렉션 | DEF = 변형 본(내보낼 것), ORG·MCH = 내부 | 내보내기는 DEF만 | 〃 "all the deforming bones are in the DEF bone collection" |
| **DEF 부모 계층 문제** | Rigify DEF 본은 모듈별로 흩어진 계층 → "Only Deform Bones" 내보내기 시 불필요 본 포함, Unity Humanoid가 부모 관계를 거부 | 아래 셋 중 하나로 해결: (a) GameRig 피처셋(GPL-2, Blender 4.5.4/5.0, "단일 변형 계층·루트 본·스케일 비활성·벤디본 없음") (b) UnityRig(MIT, Blender 4.0+, Rigify→Humanoid 이름·계층 변환) (c) Game Rig Tools(유료 $15, 보류) | github.com/Arminando/GameRig **[열림]**; github.com/nixkuroi/UnityRig **[열림]**; projects.blender.org/blender/blender-addons/pulls/104644 `[발췌]`(DEF 부모 옵션 PR, 병합 여부 미검증); forum.unity.com/threads/rigify-to-humanoid-not-working.427487 `[발췌]` |
| 트위스트 본 | Unity Humanoid는 트위스트 본을 맵핑하지 않음(변형은 유지, 리타깃 무시) | 팔·다리 트위스트 1개씩만, DEF 상완→하완→손 부모를 트위스트가 아닌 상위 본으로 정리 | developer.blender.org/T57536 `[발췌]`; Reallusion 트래커 `[발췌]` |
| **본 이름 표준(우리)** | Humanoid 자동 맵핑·UE 체인 맵핑·bones 재매핑(TOOLS 5)의 키 | Unity 식: `Hips, Spine, Chest, UpperChest, Neck, Head, Left/Right + Shoulder, UpperArm, LowerArm, Hand, UpperLeg, LowerLeg, Foot, Toes`, 손가락 `Left/Right + Thumb/Index/Middle/Ring/Little + Proximal/Intermediate/Distal`. 추가 비(非)Humanoid 본: `Root`(바닥, 루트모션), `Weapon_R`·`Weapon_L`·`Back`·`Cape_01..n`(소켓·천) | UnityRig README 명명 **[열림]**; Unity HumanTrait.RequiredBone(15개 필수: Hips·Spine·Head·양쪽 UpperLeg/LowerLeg/Foot/UpperArm/LowerArm/Hand — 개수는 API 발췌, 목록은 미검증) `[발췌]` |
| UE 호환 | UE5 Mannequin은 `root, pelvis, spine_01..05, neck_01/02, head, clavicle_l/r, upperarm_l, lowerarm_l, hand_l, thigh_l, calf_l, foot_l, ball_l` + IK 본. **이름 일치 불필요**, IK Rig 리타깃 체인(Spine·Head·LeftArm·… 체인 이름 일치)으로 맵핑 | dev.epicgames.com IKRigEditor FTemplateHierarchy `[발췌]`; uhiyama-lab.com UE5 retargeting guide `[발췌]`; forums.unrealengine.com bone-hierarchy thread `[발췌]` |
| FBX 내보내기(Armature 탭): Primary/Secondary Bone Axis | 본 축 | **Y / X**(기본, 바꾸면 90° 회전 수입) | app.cinevva.com blender-to-unreal checklist `[발췌]`; docs.blender.org scene_fbx(항목 TODO) `[발췌]` |
| Armature FBXNode Type | 아마추어 노드 종류 | Null | zenn.dev 스크립트 예 `[발췌]` |
| Only Deform Bones | DEF + 변형 자식이 있는 비변형 본만 | **켬** | developer.blender.org rBA866397a8 커밋 `[발췌]` |
| Add Leaf Bones | 체인 끝 `_end` 본 추가 | **끔** | cinevva 체크리스트 `[발췌]`(상충 예 1건: zenn 스크립트 켬) |
| Bake Animation: Key All Bones · NLA Strips · All Actions · Force Start/End Keying · Sampling Rate · Simplify | 애니 클립 묶음 | 스켈레톤 메시 FBX 1개(애니 없음) + 동작별 FBX(아마추어만, NLA Strips 켬, Simplify 0) | docs.blender.org/api bpy.ops.export_scene.fbx `[발췌]`; cinevva `[발췌]` |
| Apply Scalings · Forward/Up · Apply Unit | 스케일·축 | FBX Units Scale, -Z / Y, Apply Unit 켬(TOOL_MASTERY §2.7과 동일) | TOOL_MASTERY §2.7 |
| Unity Rig 탭: Animation Type | None/Legacy/Generic/**Humanoid** | Humanoid(영웅) · Generic(보스·비인간) | docs.unity3d.com/Manual/class-Avatar.html `[발췌]` |
| Avatar Definition | Create From This Model / Copy From Other Avatar | 스켈레톤 FBX = Create, 장비 파트·애니 FBX = **Copy From Other Avatar**(스켈레톤 아바타) | 〃 `[발췌]`(Copy From 문구는 미검증) |
| Configure… 맵핑 · Human Template(.ht) 저장/불러오기 | 15 필수(실선)·선택(점선) 맵핑 재사용 | `.ht` 1개를 영웅 공용으로 저장 | 〃 |
| Optimize Game Objects · Extra Transforms to Expose | 비맵핑 본 제거, 소켓 본은 예외로 노출 | 켬 + `Weapon_R, Weapon_L, Back` 노출(TOOLS 4) | docs.unity3d.com/Manual/FBXImporter-Rig.html(2021.1) `[발췌]` |
| Skin Weights(Quality / ModelImporter.maxBonesPerVertex) | 정점당 본 수 1/2/4/Auto | 4 | docs.unity3d.com QualitySettings.skinWeights `[발췌]` |
| UE 임포트: Convert Scene · Force Front XAxis · Use T0 As Ref Pose · Import Mesh LODs | 축·기준 포즈 | Convert Scene 켬, Force Front XAxis **끔**(Blender 기본 축 유지 시), T0 Ref Pose 끔 | dev.epicgames.com FbxSkeletalMeshImportData `[발췌]`; UE-239143 `[발췌]`(Force Front XAxis 버그) |

## ④ 절차
1. 베이스 바디 .blend 열기 → `Add > Armature > Human (Meta-Rig)`(또는 UnityRig 메타리그) → 메시에 맞춰 본 위치·롤 조정(대칭 X 켬). 손가락은 5개 유지, 얼굴 리그 삭제.
2. 각 limb 세그먼트 2, 척추 4, Rigify Type 확인 → `Generate`. 생성 리그 이름 `RIG_<영웅>`.
3. 변형 계층 정리: GameRig 피처셋이면 `Generate GameRig` 버튼으로 생성(단일 DEF 계층·Root). UnityRig이면 `Convert Rigify → Unity Humanoid (Duplicate)`. 수동이면 DEF 본 부모를 Humanoid 계층(Hips→Spine→Chest→UpperChest→Neck→Head, Chest→Shoulder→UpperArm→LowerArm→Hand…)으로 재부모화하고 ORG/MCH는 비변형 유지.
4. DEF 본 이름을 §③ 표준으로 변경(일괄 스크립트는 파일로 실행, `python -` 금지). `Root`·`Weapon_R/L`·`Back` 본 추가(변형 끔, 소켓용).
5. 메시 Armature 모디파이어 대상 = 생성 리그, Vertex Groups 이름 = DEF 표준 이름.
6. 내보내기: 스켈레톤+베이스 바디 FBX(`CH_<영웅>_Skel.fbx`), 옵션 §③. 동작은 아마추어만 선택해 FBX별(`CH_<영웅>_A_<동작>.fbx`).
7. Unity: Rig → Humanoid → Create From This Model → Configure에서 15 필수 모두 초록 확인 → `.ht` 저장 → Optimize Game Objects + Extra Transforms(Weapon_R/L, Back). UE: Skeletal Mesh 임포트 → IK Rig 체인 정의 → IK Retargeter로 Mannequin 애니 1개 적용해 확인.

## ⑤ 출력 형식 · 네이밍
- `unity/Assets/Exoduser/Art/Characters/<영웅>/CH_<영웅>_Skel.fbx`(스켈레톤+바디), `CH_<영웅>_A_<동작>.fbx`(애니), `CH_Common.ht`(Humanoid 템플릿). 본 이름은 §③ 표준(접두사 없음, `DEF-` 제거). 단위 m, 스케일 1, Hips 높이 실측.
- 변경은 .blend 원본 + FBX를 같은 커밋에(이진 파일 LFS 여부는 CH 레인 결정).

## ⑥ 검수 방법
- Unity Configure 창: 필수 15 전부 실선 초록, 경고 0. T-포즈 강제(Enforce T-Pose) 뒤 관절 꺾임 0.
- Mixamo 또는 Kevin Iglesias 무료 Humanoid 클립 1개 재생 → 어깨·고관절 뒤틀림 0, 손이 손목을 따라감(트위스트 부모 오류 검출).
- UE: Mannequin idle 리타깃 1개 재생, 체인 맵핑 자동 성공.
- 캡처: 33° 1x·3x 바인드 포즈·idle 2장(`MANUAL/img/tools-rig-{before,after}.png`). 전 = Rigify 원본 계층 내보내기(불필요 본 포함), 후 = 정리 계층.

## ⑦ 금지 · 흔한 실패
- ORG/MCH/컨트롤 본을 내보내지 않는다(Humanoid가 ORG를 우선 맵핑해 DEF 가중치와 어긋남).
- Add Leaf Bones 켬(`_end` 본으로 맵핑 흐트러짐), Primary/Secondary Bone Axis 변경(90° 회전), Apply Scalings All Local(스케일 100).
- 메시에 옛 Armature 모디파이어가 남아 다른 아마추어를 가리키면 맵핑 실패(Unity 포럼 사례).
- 벤디본·DEF 스케일 애니는 엔진에서 재현되지 않음(GameRig가 끄는 이유).
- 얼굴 리그·손가락 3단 전부를 픽셀 렌더용 영웅에 넣어 본 수를 늘리지 않는다(Skin Weights 4 안에서 어깨·고관절 품질 우선).
- 생성 메시 리깅 금지(11-05 09:30). 스크립트 키 애니메이션 금지(CH 브리프).

## ⑧ 실습 기록
- Mac 실습 대기(브랜치 `claude/unity-mac-character-20261105`, 과제 C1). 기록 항목: 입력 .blend SHA, Rigify/GameRig/UnityRig 버전, 본 수(DEF/전체), 전·후 이미지 경로, Unity Configure 경고 수, UE 리타깃 성공 여부, 날짜·커밋 SHA.
