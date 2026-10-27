# Unity 캐릭터 총괄 보드 (2026-10-27~)

- 총괄: PC Claude 세션 "유니티 캐릭터 총괄"(Opus). 2026-10-27 사용자가 이 역할을 지정했다.
- 맡는 일: Unity 리모델링에서 플레이어 영웅의 3D 외형을 만든다. 범위는 캐릭터 시트 → 3D 메시 → 리깅 → Animator → 인게임 판정이다. 명세·판정은 총괄이 하고, 실행은 Sonnet이 한다.
- 범위 밖: 전투 규칙(`Runtime/Core`, 웹 oracle 정답), 보스 외형(BX-12, 보스전 총괄), 맵(맵 총괄). 톤 최종 판정은 디자인총괄(통합 컨셉 4장 T1~T8)이 한다.
- 기준 문서: 각 캐릭터 DESIGN LOCK(`docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md`, `docs/archetypes/silvertail/SILVERTAIL_LOCKED_SPEC_v1_2.md`, `docs/17게임아트팀/IVAN_T8_KEYART_V35_20261026.md`), `docs/0마스터플랜/EXODUSER_DESIGN_CONCEPT_V1_20261026.md` 4장, `docs/17게임아트팀/ART_TEAM_MASTER.md` 절대 규칙 R1~R8.

## 1. 대상

| id | 캐릭터 | 원화 상태 | Unity 단계 |
|---|---|---|---|
| warrior | 대검전사 | LOCK 확정(앵커) | UCH-01 시트 |
| silvertail | 실버테일 | LOCK v1.2(단검 1·왼쪽 허벅지) | UCH-01 시트 |
| ivan | 아이반(검은 연기) | T8 r4 확정 | UCH-01 시트 |
| spearmage | 창법사 | 원화 RETOUCH 중 | 원화 채택 뒤 |
| transmuter | 변성술사 | 원화 RETOUCH 중(활·낫·거대 장검 가변) | 원화 채택 뒤 |

## 2. 단계

| 단위 | 내용 | 상태 |
|---|---|---|
| UCH-01 | Unity용 캐릭터 시트 1차: 3명 × body(정면·3/4·측면·뒤, A포즈)·head·weapon, 회색 배경·평면 조명, 뷰 분할(Meshy 다중 입력용) | **완료** (9장 PASS, $0.645) |
| UCH-02a | 전사 body 시트 → Meshy multi-image-to-3d 1건 | **완료** (30cr, 조건부 PASS) |
| UCH-02c | 전사 메시 Meshy 리깅 1건(+기본 걷기·달리기) | **완료** (5cr, 조건부 PASS) |
| UCH-02b | 리깅 전사 Unity 6000.6.7f1 임포트(Humanoid·URP/Lit)·걷기 재생·게임 각도 컷, 얼굴 점 1개 텍스처 수정 | **완료** (PASS, 커밋 보류) |
| UCH-03 | 망토 전용 뼈 분리(다리 끌림 해소)·대검 3D·손 파지/무기 소켓·애니 FBX 메시 제거 후 커밋 | 대기 |
| UCH-03 | 리깅(휴머노이드)·Animator 기본(대기·이동·구르기·공격 1) | 대기 |
| UCH-04 | 인게임 판정: 1-1 맵 위 1920×1080·1x 크롭, 전사·실버테일 옆 T1~T8 | 대기 |

## 3. 결정 기록

| 날짜 | 결정 | 근거 |
|---|---|---|
| 2026-10-27 | 1차 대상 = 전사·실버테일·아이반. 창법사·변성술사는 원화 채택 뒤 | LOCK이 확정된 캐릭터만 3D 기준으로 삼는다 |
| 2026-10-27 | 시트 생성 = OpenAI `gpt-image-2.5-sunburst` images/edits(기존 맵 텍스처·아이반 키아트와 같은 경로), 1536×1024 high, 상한 12회·$6 | 사용자 "지피티 api로해"(3D 에셋), 아이반 r4 선례 |
| 2026-10-27 | body 시트는 빈손 A포즈, 무기는 별도 시트. 실버테일 등검(허브+접힌 날)은 몸에 붙은 장비라 body에 포함 | 리깅·무기 소켓 분리 |
| 2026-10-27 | 실버테일 단검은 LOCK v1.2대로 1자루(왼쪽 허벅지). 캐릭터 선택 컷 `silvertail_cut.png`의 2자루는 따르지 않는다 | LOCK [A][C] |

## 4. 로그

- 2026-10-27 UCH-01 명세 `E:/exoduser-wt/_out/unity-charsheet/SPEC.md`(Git 밖)를 작성하고 Sonnet에 배정했다.
- 2026-10-27 UCH-01 1차: 호출 12회, $0.43, 7장 생성. 총괄 판정은 전사 body·head·weapon PASS, 아이반 body·head PASS(body는 뷰 2·3이 맞닿아 재분할), 실버테일 head PASS, 실버테일 body **RETOUCH**다. RETOUCH 사유는 날이 척추를 따라 곧게 허리까지만 내려온다는 점이다. ㄱ자 접힘·오른쪽 엉덩이·종아리 끝이 없고 측면 보기에서 날이 사라졌다. 실버테일·아이반 weapon은 OpenAI 모더레이션(violence)에 차단됐다. 전사 weapon은 "ceremonial sword prop" 문구로 통과했다. 교훈: 무기 시트는 weapon/gun/blade/dagger 단어를 피하고 "game prop design sheet, prop only, nobody"로 쓴다. R2 명세는 `SPEC_R2.md`다.
- 2026-10-27 UCH-01 R2: 호출 4회, $0.21, 모더레이션 차단 0. 누적 16회 $0.645. 총괄 판정 **9장 전부 PASS** → UCH-01 완료.
  - 실버테일 body r2b(편집 2회): 허브 → 척추 → 오른쪽 엉덩이 ㄱ자 접힘 → 종아리 끝이 3/4·측면·뒤 보기에서 읽힌다. 정면은 오른쪽 허벅지 바깥으로 끝만 보이고 중앙이 깨끗하다. 단검은 왼쪽 허벅지에 1자루다.
  - 실버테일 weapon: 날이 접힌 상태(경첩 위치 포함)로 그려졌다. 펼친 상태는 리깅에서 경첩을 회전해 만든다(조건부 PASS).
  - 아이반 weapon: r4 크롭의 원통 약실·삼각 문양 고리·총구 고리와 일치한다. 개머리는 r4에 보이지 않아 새로 그렸으므로 모델링 때 키아트 전신과 대조한다.
  - 아이반 body는 뷰 2·3 사이 전경 0 열에서 다시 분할해 4뷰가 됐다.
  - 최종 파일: `E:/exoduser-wt/_out/unity-charsheet/<id>/`(`<id>_body`·`_head`·`_weapon`, 실버테일 body=`silvertail_body_r2b.png`), Meshy용 뷰 `<id>/views/*.png` 1024², 격자 `lineup_r2.jpg`.
- 2026-10-27 UCH-02a(사용자 승인 "크레딧은 1건만"): Meshy `POST /openapi/v1/multi-image-to-3d` 1건을 돌렸다.
  - 작업 ID `01a17cf8-4a78-7626-8991-c2d2722c4ae8`
  - 요청: meshy-7.1(latest), 입력 정면·측면·뒤 3장, PBR 2k, 삼각형 60k remesh, `pose_mode=a-pose`, glb·fbx·obj
  - 크레딧: 잔액 4440 → 4410(30cr, `consumed_credits` 30)
  - 키: Codex DPAPI를 메모리에서만 복호화했다
  - 장부: `E:/exoduser-wt/_out/meshy/credits.log`
  - 결과 수치: 정점 30,951, 삼각형 61,981, bbox 1.186×1.904×0.498(Y-up, 정면 +Z), 텍스처 2048² 4장(base_color·metallic·roughness·normal)
  - 저장: `E:/exoduser-wt/_out/unity-charsheet/meshy/warrior_body_20261027_1946/`, 사본은 `I:/EXODUSER-Storage/Meshy/` 같은 이름 폴더(sha256.txt 포함)
  - 미리보기: numpy 정사영 렌더 `compare.jpg`
  - 총괄 판정 **조건부 PASS**: 시트의 얼굴(평범한 짙은 눈·흉터)·흑발·겹친 둥근 견갑·암적 스카프·후드형 망토가 정면·측면·뒤에서 읽히고, 구멍이나 떠다니는 조각이 없다. A포즈라 리깅할 수 있다.
  - 고칠 점: ① 왼쪽 눈 아래 검은 점 1개(텍스처 수정) ② 정면 망토 폭이 시트보다 좁고 허리·정강이 갑옷이 단순해졌다(실루엣 허용 범위, 인게임 카메라 거리에서 재판정) ③ OBJ의 mtl은 `texture_0.png`를 참조한다(파일명은 `tex_base_color.png`).
- 메모: Meshy multi-image는 첫 장을 정면으로 본다. `origin_at`은 `auto_size=true`일 때만 적용되고, 크레딧표는 문서에 없어 응답의 `consumed_credits`를 정본으로 한다. 리깅 API는 별도 유료(문서상 5cr)다.
- 2026-10-27 UCH-02c(사용자 승인 "크레딧은 리깅 1건만"): `POST /openapi/v1/rigging`, `input_task_id`=UCH-02a 작업(multi-image 작업도 수락됨), `height_meters=1.85` → 작업 `01a17d1c-0e10-7148-bb87-ef63742b47d5`, 37초, 5cr(잔액 4405). 결과 = 리깅 GLB·FBX + 기본 걷기·달리기(GLB·FBX·armature GLB), 저장 `E:/exoduser-wt/_out/unity-charsheet/meshy/warrior_rig_20261027_2025/`(사본 I: 같은 이름). 뼈 24개(Hips·Spine02(아래)→Spine01→Spine(위)·neck·Head·좌우 Shoulder/Arm/ForeArm/Hand·UpLeg/Leg/Foot/ToeBase), Humanoid 필수 17개 대응, 정점당 최대 4뼈·가중치 합 오차 1.4e-7·무가중 정점 0, 손가락 뼈 없음. numpy 선형 블렌드 스키닝으로 걷기 4프레임 렌더 확인. 총괄 판정 **조건부 PASS**: 관절 위치·걷기 변형·손발 형태 정상. 고칠 점 = 망토 뒷자락이 다리 뼈에 묶여 걷기 측면 25/75%에서 다리를 따라 끌려 늘어남 → Unity에서 망토 전용 보조 뼈(또는 Cloth/스프링 본)로 분리 필요. Unity Humanoid 척추 매핑 = Spine02→Spine, Spine01→Chest, Spine→UpperChest.
- 2026-10-27 UCH-02b(비용 0): worktree `E:/exoduser-wt/pc-unity-char`(origin/unity/main detached)의 `unity/Assets/Exoduser/Art/Characters/Warrior/`(Rigged·Walk·Run FBX, BaseColor·Normal·MetallicSmoothness 2048² BC7, `Warrior_Mat` URP/Lit, `Warrior_Locomotion.controller`, `Warrior.prefab`) + `Editor/CharacterLab/WarriorImport.cs`·`WarriorCapture.cs`·`WarriorCaptureR2.cs`. 아바타 isValid·isHuman, 22뼈 수동 매핑, Walk 1.033s·Run 0.633s 루프, bbox 1.850 유닛(Scale 1), 임포트 오류 0. 얼굴 점 = UV 차트 틈 픽셀이 렌더에 찍힌 것 → 틈 채움으로 제거.
  - 1차 캡처는 판정 불가(림 Point 과다로 망토 원색 빨강·갑옷 구리색·바닥 얼룩, Animator 첫 렌더 전 포즈 미적용으로 뒤 샷 부양) → R2: RM-0 조명(`Rm0EngineSetup.BuildSandbox` Hell Sun + `GlobalVolume_Hell`)과 판정용 중성 조명 두 세트, 프레임별 BakeMesh 최저점 접지, 골반 추적 게임 시점(FOV 30°·피치 55°·키 17%). 산출 `E:/exoduser-wt/_out/unity-charsheet/unity_import_r2_20261027_2044/{key,rm0}/`.
  - 총괄 판정 **PASS**: 근접 3방향에서 시트·LOCK(평범한 짙은 눈·흑발·겹친 둥근 견갑·탁한 암적 스카프/망토·흑철)이 유지되고 접지·걷기 정상, 1x 점 없음. 남은 결함(UCH-03): ① 망토 뒷자락이 다리 뼈에 묶여 걷기 때 다리와 겹침 ② 손가락 뼈 없음 → 대검 파지는 고정 손 포즈+무기 소켓으로 ③ 게임 시점 17%에서 몸통 대비가 약함 — 모델보다 맵 조명 문제, RM-1 조명과 함께 재판정 ④ RM-0 Hell Sun(1,.62,.5)에서는 흑철이 구리색으로 기움 → 디자인총괄·맵 총괄에 조명 색 공유 필요. 재질 A/B(metallic ×0.5) 차이는 미미해 원본 맵 유지.
  - **커밋 보류(총괄 결정)**: 바이너리 약 76MB(FBX 19MB×3)이고 Walk·Run FBX가 메시를 통째로 담고 있다. UCH-03에서 망토 뼈를 고친 최종 FBX와 메시를 뺀 애니메이션 FBX로 바꾼 뒤 브랜치 `claude/unity-pc-char-*`에 커밋하고, unity/main 병합은 맥북 총괄 창구로 요청한다. 그 전까지 worktree를 유지한다(기존 tracked `.meta` 412개·URP GlobalSettings를 Unity가 건드리면 되돌릴 것, 미추적 `NativeGame.HudBlendCapture.cs.meta`는 내 것 아님).
