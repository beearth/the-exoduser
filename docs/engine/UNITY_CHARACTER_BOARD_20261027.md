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
| UCH-03a | 전사 대검 Meshy multi-image-to-3d 1건(정면+옆면) → Unity 임포트(전장 1.60)·텍스처 보정(핏줄 제거·금속 탈색) | **완료** (30cr, 조건부 PASS, 커밋 보류) |
| UCH-03b | 망토 전용 뼈 분리(다리 끌림 해소)·손 파지 고정 포즈/무기 소켓·애니 FBX 메시 제거 | **완료** (조건부 PASS, 커밋 보류) |
| UCH-03d | Hero Light(캐릭터 전용 보조광, 바이블 §8 L-9 캐릭터 총괄 소유)·웅덩이 림광·RM-0 확정 조명(unity/main b280ddf6) 재촬영 | **완료** (Hero 0.6 PASS, L-4 테두리 색 미해결, 디자인총괄 2차 판정 대기) |
| UCH-03e | 웅덩이 테두리광 재설계: 림 Point 재배치 1회 → 안 되면 웅덩이 색 Fresnel(Shader Graph). 이번 단위는 구조만(세기는 Linear 뒤) | **완료** (림 Point 반려, Fresnel 구조 PASS, 세기·지표는 03f) |
| UCH-03f | VFX 병합(Linear·후처리) + RM0-LIGHT-L 뒤 재조정: Hero·Fresnel 세기 확정, ACES 색 밀림(350~12°)·블룸 번짐 확인, Hero Light 브랜치 merge·재캡처·병합 요청 | 대기 |
| UCH-03c | Animator 기본(대기·이동·구르기·공격 1) | 대기 |
| UCH-05 | 실버테일 Meshy body 3D·리깅(1.72m)·단검 3D 각 1건 → Unity 임포트·캡처 | 진행 (Meshy 3건 완료 65cr, Unity는 메모리 여유 대기) |
| UCH-06 | 아이반 Meshy body 3D·리깅(1.85m)·총 3D 각 1건 → Unity 임포트·캡처 | 진행 (Meshy 3건 완료 65cr, Unity는 메모리 여유 대기) |
| UCH-A1 | 애니메이션 공급원 비교 시범(보스전 총괄 공동): 무료 1단계 = 문서 조사·Unity 수동 키 "내려찍기"(예비 48f·발동 6f·회복 70f), 유료 2단계는 사용자 확인 후 | 진행 (Unity 단계 메모리 보류) |
| UCH-04 | 인게임 판정: 1-1 맵 위 1920×1080·1x 크롭, 전사·실버테일 옆 T1~T8 | 대기 |

## 3. 결정 기록

| 날짜 | 결정 | 근거 |
|---|---|---|
| 2026-10-27 | 1차 대상 = 전사·실버테일·아이반. 창법사·변성술사는 원화 채택 뒤 | LOCK이 확정된 캐릭터만 3D 기준으로 삼는다 |
| 2026-10-27 | 시트 생성 = OpenAI `gpt-image-2.5-sunburst` images/edits(기존 맵 텍스처·아이반 키아트와 같은 경로), 1536×1024 high, 상한 12회·$6 | 사용자 "지피티 api로해"(3D 에셋), 아이반 r4 선례 |
| 2026-10-27 | body 시트는 빈손 A포즈, 무기는 별도 시트. 실버테일 등검(허브+접힌 날)은 몸에 붙은 장비라 body에 포함 | 리깅·무기 소켓 분리 |
| 2026-10-27 | 실버테일 단검은 LOCK v1.2대로 1자루(왼쪽 허벅지). 캐릭터 선택 컷 `silvertail_cut.png`의 2자루는 따르지 않는다 | LOCK [A][C] |
| 2026-10-27 | 대검 3D 사양(디자인총괄 합의): 핏줄 금지·홈 안쪽만 탁한 적갈 그을음, 전장 1.6m·손잡이+폼멜 0.35·날 폭 0.16·두께 0.03, 가드 끝 가시 1개씩(무기는 견갑 가시 금지 대상 아님)·중앙 문장 유지, 금속 base는 무채색 중성~차가운 회색, roughness 날 0.55~0.65·홈 0.75+ | 사용자 "디자인 총괄이랑 상의해서", 디자인총괄 회신 2026-10-27 |
| 2026-10-27 | 생성 결과가 텍스처 조건에 걸리면 재생성하지 않고 Unity 텍스처·머티리얼로 보정 | 크레딧 절약(디자인총괄 합의) |
| 2026-10-27 | RM-0 키 라이트를 약하게(L-5) 유지하고, 캐릭터 밝기는 캐릭터 전용 Hero Light(URP Rendering Layer `Hero`, 중성 (1,.97,.94))로 올린다. 웅덩이 안 외곽 대비(L-4)는 웅덩이마다 Hero 레이어 전용 Point 림광(웅덩이 광원 색, range 반지름+0.5m)으로 낸다. 웅덩이는 `Lights/Pools`의 `Pool_Hell_*`·`Pool_Toxic_*` | 맵 총괄·디자인총괄 합의, 바이블 정정 main 27ca98941 |
| 2026-10-28 | 걷기 중 대검은 칼끝이 아래·뒤로 끌리는 자세(원화 warrior_cut의 칼끝 아래 대검). 칼 축은 수평 아래 약 37°: 손 높이 1.0m·손잡이~칼끝 1.45m에서 칼끝-바닥 5cm 이상을 지키는 물리 한계라 목표 50~65°를 낮춰 수용 | 측면 걷기 판정 |
| 2026-10-28 | **유료 승인 기록**: 사용자가 이 세션 채팅에서 직접 승인 — "Run Meshy for Silvertail and Ivan in parallel: body 3D 1 run, rigging 1 run, weapon 3D 1 run each (130 credits total)." (2026-10-28 02:0x KST 전후, 실행 02:17~02:20). 이전 승인: 10-27 "Meshy로 전사 body 시트 3D 시험 1건 진행해. 크레딧은 1건만."·"Meshy 리깅 1건 진행해. 크레딧은 리깅 1건만."·"Meshy로 전사 대검 3D 1건 진행해. 크레딧은 1건만." | 유료 지출은 사용자 확인 필수(CLAUDE.md), CTO 확인 요청 10-28 |
| 2026-10-28 | 키(rigging height): 실버테일 1.72m(하이힐 포함), 아이반 1.85m. LOCK 문서에 키 수치가 없어 총괄이 정함 | 전사 1.85m 기준 비례 |
| 2026-10-28 | 보스는 Hero Light 레이어를 쓰지 않는다(플레이어 가독성 전용). 웅덩이 Fresnel `CharacterLit_PoolRim`은 보스도 쓴다 | 보스전 총괄 회신 |

## 3-1. 제작 경로·품질 기준 (영웅·보스 공용, 2026-10-28)

유니티 총괄 요청(10-28): 영웅과 보스가 같은 게임에서 같은 품질로 보여야 한다. 보스전 총괄은 이 절을 기준으로 삼는다. 전사 1명으로 끝까지 검증한 경로다. 유료 호출은 매번 사용자 확인을 받는다.

| 단계 | 도구·설정 | 비용(실측) | 합격 기준 |
|---|---|---|---|
| ① 시트 | OpenAI `gpt-image-2.5-sunburst` `/v1/images/edits`, 1536×1024 high. body는 정면·3/4·측면·뒤 4뷰, 빈손 A포즈. 회색 #808080, 평면 조명, 그림자 없음. 무기는 별도 시트로 만들고 "game prop design sheet, prop only, nobody" 문구를 쓴다(weapon/gun/blade 단어는 모더레이션 차단). 레퍼런스는 DESIGN LOCK 원화 크롭 | 장당 약 $0.04~0.06 | LOCK 일치(얼굴·장신구·갑옷·머리), 1x에 점·잔노이즈 없음, 뷰 사이 겹침 없음(최소 전경 열로 분할) |
| ② 메시 | Meshy `POST /openapi/v1/multi-image-to-3d`, `ai_model=latest`(meshy-7.1), 입력 정면→측면→뒤(첫 장=정면), PBR, 텍스처 2k, `topology=triangle`, remesh. polycount는 body 60k / 무기 20k. 결과는 3일 뒤 만료되므로 즉시 받아 `I:/EXODUSER-Storage/Meshy/`에 사본을 둔다. 장부는 `E:/exoduser-wt/_out/meshy/credits.log` | 30cr/건 | 1회만 생성, 재생성 금지. 실루엣이 시트와 같고 구멍·떠다니는 조각이 없을 것 |
| ③ 리깅 | Meshy `POST /openapi/v1/rigging`, `input_task_id`=②의 작업 ID, `height_meters`. 뼈 24개, **손가락 뼈 없음**. 기본 걷기·달리기가 함께 나온다 | 5cr/건 | Humanoid 필수 뼈 17개 대응, 가중치 합 1 |
| ④ Unity 임포트 | Humanoid. HumanDescription을 직접 매핑한다(Spine02→Spine, Spine01→Chest, Spine→UpperChest). URP/Lit, MetallicSmoothness = R metallic · A (1−roughness). 애니메이션 FBX는 `.anim`만 뽑고 메시는 버린다 | 0 | `avatar.isValid`·`isHuman`, 걷기 때 꼬임 없음 |
| ⑤ 보정(무료) | 텍스처 결함은 재생성하지 않고 Unity에서 고친다: 채도·적색 제거, roughness 재매핑, 하얀 면 메우기. 긴 천은 전용 뼈를 절차적으로 추가해 다리 가중치 0으로 만들고 `CapeSpring`(지연·처짐·다리 캡슐 충돌)을 단다. 손가락이 없으므로 쥐기는 블렌드셰이프 `Fist_R` + 무기 소켓으로 한다 | 0 | 다리 관통 ≤4/32프레임·3cm, 1x에 점 없음 |
| ⑥ 조명·셰이더 | 바이블 §8: L-8(금속 하이라이트는 중성), L-9(플레이어 전용 Hero Light, 렌더링 레이어 `Hero`), L-4(웅덩이 테두리 = Fresnel 셰이더 `CharacterLit_PoolRim`, 전역 `_HeroPoolRim*`). 보스에 Hero 레이어를 쓸지는 보스전 총괄·디자인총괄이 정한다 | 0 | 흑철 R/G ≤1.25, 날 채도 ≤15%, L-4 ΔE00 ≥15·형광 금지 |
| ⑦ 판정 | 판정용 중성 조명과 RM-0 조명 두 세트. 근접 정면·3/4·뒤, 게임 시점(FOV 30°·피치 55°·키 17%)으로 걷기 8프레임, 1x 크롭. 2차 판정은 디자인총괄 | 0 | 기존 화면 옆에 두어도 같은 게임으로 보일 것 |

- **애니메이션 기준 (유니티 총괄 10-28, 사용자 "노레위처럼")**: 움직임 레퍼런스는 No Rest for the Wicked다. 무게 있는 예비동작, 끊기지 않는 키 애니메이션, 낮지 않은 프레임 밀도로 만든다. Meshy 기본 걷기·달리기는 자리표시용이며 최종 애니메이션이 아니다. 영웅·보스의 최종 애니메이션 공급원(직접 키 애니메이션·유료 모션 생성·모캡 라이브러리)은 아직 정하지 않았다. 보스전 총괄과 함께 시범(드루이드·전사 공격 1종)으로 비교한 뒤 정한다.
- 상세 명세·스크립트: `E:/exoduser-wt/_out/unity-charsheet/SPEC_*.md`, Unity 작업물은 worktree `E:/exoduser-wt/pc-unity-char`의 `Editor/CharacterLab/`·`Runtime/CharacterLab/`(미커밋, 브랜치 `claude/unity-pc-char-*`로 낼 예정).

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
- 2026-10-27 UCH-03a(사용자 승인 "전사 대검 3D 1건", 사양은 디자인총괄 합의): 시트 `warrior/warrior_weapon.png`를 정면·옆면·뒷면으로 분할 → 정면+옆면 2장 multi-image-to-3d(texture_prompt에 핏줄·구리색 금지, target_polycount 20000) → 작업 `01a17da3-fd45-74b9-b390-dbe5893763db`, 86초, 30cr(잔액 4405→4375).
  - 결과 수치: 정점 9,615, 삼각형 19,176, 텍스처 2048² 4장. 비율 길이:가드:날 폭:두께 = 1:0.216:0.097:0.026(가드/날 폭 2.2배, 목표 2.6배보다 좁지만 시트 실루엣과 같아 허용).
  - 저장: `E:/exoduser-wt/_out/unity-charsheet/meshy/warrior_weapon_20261027_2254/`(+`I:/EXODUSER-Storage/Meshy/` 사본), Unity worktree `pc-unity-char`의 `Art/Characters/Warrior/Weapon/`(FBX·Mat·Prefab, 피벗=폼멜 끝, 스케일 0.84098 → 전장 1.600), `Editor/CharacterLab/WeaponImport.cs`·`WeaponCapture.cs`.
  - R1 판정 RETOUCH: 형태·가드 가시·문장·크기는 PASS. 프롬프트 금지에도 입력 시트의 붉은 핏줄을 Meshy가 복사했고, 금속 base에 갈색 채도가 남아 RM-0에서 구리색, 가드 아래 날 가장자리 1면이 하얗게 날아감. 생성 roughness는 균일 0.44.
  - R2(무료, 재생성 없음): roughness 재매핑(0.60+(r−0.44)×1.15, 5/50/95% = 0.52/0.60/0.78), metallic>0.5 픽셀 채도 ×0.12(금속부 평균 채도 0.135→0.016), 적색·채도>0.30 비금속 픽셀 채도 0.10·명도 ×0.85(손잡이 UV는 보호 마스크로 제외, 변화 0), 하얀 면은 base가 아니라 metallic 0.61 면의 하늘 반사 → 그 영역 metallic 0.25·명도 ×0.78. 캡처 `unity_weapon_r2_20261027_2307/`.
  - 총괄 판정 **조건부 PASS**: 중성 조명에서 핏줄 없는 회색 강철·그을린 흑철 홈·갈색 가죽 손잡이로 읽히고 1x 점 없음. 남은 것: ① 가드 아래 날 가장자리의 매끈한 직사각형 면(메시 UV 쪽, 게임 거리에선 안 보임 → 손 파지 후 재판정, 필요하면 텍스처 덧칠) ② RM-0 Hell Sun에서 칼과 갑옷이 함께 구리빛 → 재질이 아니라 광색 문제, 디자인총괄·맵 총괄 공유 사항.
- 2026-10-27 UCH-03a R3(디자인총괄 조건 1, 무료): 중성 조명에서 가운데 홈이 "녹슨 갈색 판"으로 읽힌다는 지적 → 메시 UV 기하 마스크(날 폭 중앙 50%, 실제 홈 폭 약 49%)로 홈만 명도 ×0.80·채도 ×0.5, 홈 경계 15%·가드 아래 8%는 채도 ×0.75만(약한 적갈 잔존). 중성 `crop_blade_mid` L*: 강철 띠 40.7 / 홈 12.3→10.4(대비 28.4→30.3), 홈 채도 0.116→0.052, 손잡이·가드 변화 없음. 캡처 `unity_weapon_r3_20261027_2315/`.
  - 총괄 판정 **PASS(조건 1 해소)**: 홈이 숯빛 흑철로 읽히고 강철 가장자리와 분리된다. 남은 조건 2(가드 아래 매끈한 면)는 손 파지 단계(UCH-03b)에서 게임 거리 재판정.
  - RM-0 구리빛은 맵 총괄이 조명값을 바꾸는 중(Hell Sun (1,.80,.70)·세기 0.6, Trilight 앰비언트, 중성 반사 큐브맵 Env_NeutralSteel, 명세 `E:/exoduser-wt/_out/rm0-light/SPEC.md`). 확정되면 전사·대검을 새 조명으로 재캡처해 합격 기준(날 하이라이트 채도 ≤15%, 흑철 몸통 R/G ≤1.25)으로 잰다.
- 2026-10-27~28 UCH-03b(무료): worktree `pc-unity-char`.
  - 망토: 정점 16,765개를 망토 뼈 9개(Cape_L/C/R × 3마디, 부모 Hips)로 재가중, 다리 뼈 가중치 0, 윗단 15% Hips 혼합, 런타임 `CapeSpring.cs`(지연·처짐·다리 캡슐 충돌). 걷기 32샘플 중 망토-다리 관통 4프레임(최대 2.97cm). 총괄 판정 **PASS**: 다리를 따라 앞으로 접히던 결함 해소.
  - 애니 클립: Walk/Run FBX(각 19MB)를 `.anim`으로 분리하고 FBX는 프로젝트에서 뺐다(원본은 `meshy/warrior_rig_20261027_2025/`, sha256 일치). Warrior 폴더 51MB(칼 제외). **PASS**.
  - R1 대검 RETOUCH: 칼끝이 진행 방향 앞쪽으로 거의 수평(창처럼)이고 손이 펴진 채 손잡이 옆에 겹침. 허벅지 뒤에 흰 조각.
  - R2: 소켓 `Socket_Weapon_R`(RightHand 자식)·오른팔 고정 레이어 `ArmR_HoldWeapon`(마스크 오른팔, 흔들림 ×0.3, 팔꿈치 약 46°) → 칼끝 아래·뒤, 축 평균 37.1°, 칼끝-바닥 8.3~25.9cm, 칼-다리·칼-망토 관통 0/32. 주먹은 블렌드셰이프 `Fist_R`(손가락 정점 648개, 최대 150° 감기, 엄지 제외, 손-손잡이 관통 최대 0.32cm). 흰 조각 원인 = 망토 정점과 다리 정점을 잇는 삼각형이 걸음 때 늘어남(텍스처·법선 아님) → 그 삼각형 628개 제거, 늘어난 삼각형 프레임당 172~311 → 0~2.
  - 총괄 판정 **조건부 PASS**: 측면·게임 시점에서 원화처럼 칼끝이 아래·뒤로 끌리는 대검으로 읽히고 1x 게임 시점에서 주먹으로 쥔 것으로 읽힌다. 가드 아래 매끈한 면(UCH-03a 조건 2)은 게임 거리에서 보이지 않아 해소. 남은 결함: 손 근접에서 `Fist_R` 손가락이 판처럼 각지고 가는 흰 조각이 보인다 → 게임 카메라에선 무관, 근접 컷(시네마틱)이 필요해지면 손가락 뼈 리깅으로 다시 한다(백로그). 걷기 캡처는 클립 이동량 0이라 1.4m/s로 전진시켰다 → 게임 실제 이동 속도로 망토 재확인 필요.
  - 재구성 순서(프리팹을 다시 만들 때): `WarriorR2Fit.WriteClip` → `WarriorCapeRig.Run` → `WarriorR2Apply.Run`. `WarriorImport.Run`을 다시 돌리면 프리팹이 FBX 기준으로 초기화돼 망토·소켓이 사라진다.
  - 캡처: `E:/exoduser-wt/_out/unity-charsheet/unity_uch03b_20261027_2335/`(R1), `unity_uch03b_r2_20261028_0018/`(R2, `pose_ref_compare.png` 포함).
- 2026-10-28 UCH-03d(무료): worktree를 origin/unity/main b280ddf6(RM-0 확정 조명)로 옮겨 측정. `HeroLight.cs`(Directional, 렌더링 레이어 `Hero`, 그림자 없음, 카메라 정면 기준 요 +25°·절대 피치 −35°)·`PoolRimLight.cs`(`Lights/Pools`의 `Pool_Hell_*`·`Pool_Toxic_*`마다 Hero 전용 Point, 웅덩이 안에서만 켜지고 가장자리에서 서서히 꺼짐).
  - 측정(Hero 끔 → 0.5/0.6/0.7): 대검 날 p95(단독) 0.226 → 0.367/0.399/0.433(기준 ≥0.35), 바닥 ΔL*(캐릭터 14px 밖) 0, 날 채도 4.8%, 흑철 R/G 1.245/1.243/1.242, 날 하이라이트 R/B 1.03~1.08. L-4 외곽 p95 − 웅덩이 바닥 p50: −1.3 → +16.5/+19.8/+24.1. 림 Point는 카메라 반대쪽이라 +0.4~1.1만 보탬(Hero 0.6+림 2.5 = +20.7).
  - 총괄 판정: **Hero Light 0.6 PASS**(얼굴·날·흑철이 1x로 읽히고 바닥 불변). **L-4 테두리 색 미해결**: 수치는 중성 Hero 덕에 통과하지만 웅덩이 색 테두리광이 눈에 보이지 않는다 → UCH-03e.
  - 공용 설정 필요(로컬 측정만, 미커밋): `ProjectSettings/TagManager.asset` 렌더링 레이어 `Hero` 이름, `URP_PC_High`·`URP_Mac_Balanced`의 `m_SupportsLightLayers: 1`, `RenderSettings.sun`을 Hell Sun으로 고정(Hero가 더 밝으면 메인 라이트가 바뀌어 키 그림자가 사라짐). 소유·커밋 위치를 유니티 총괄에 협의 중. diff는 `E:/exoduser-wt/_out/unity-charsheet/unity_uch03d_20261028_0050/`.
- 2026-10-28 Hero Light 공용 설정(유니티 총괄이 캐릭터 총괄 소유로 결정, 캐릭터 아트와 분리): 브랜치 `claude/unity-pc-herolight-20261028` `ff20dc2d2`(기준 b280ddf61, 4파일). TagManager 렌더링 레이어 1=`Hero`, URP_PC_High·Mac_Balanced `m_SupportsLightLayers: 1`, `Rm0EngineSetup.ApplyLight`에 `RenderSettings.sun = Hell Sun`.
  - 검증(RM-0 샌드박스, 캡슐, 1600×900, PC_High·Mac_Balanced 동일): 변경 전 Hero가 바닥까지 밝힘(바닥 |ΔL*| 최대 8.2) → 변경 후 바닥 0.000·피사체 L* 29.3→45.4·키 그림자 유지. 빌드 + `--unity-m1-check` 17단계 ok, Core diff 0. 캡처 `E:/exoduser-wt/_out/unity-herolight/captures_20261028_0039/`.
  - 발견: 현재 unity/main TagManager의 빈 렌더링 레이어 줄 끝 공백이 지워져 있어 Unity가 파싱 실패(Parser Failure line 41) → 레이어 이름이 정의되지 않음. 이번 커밋에서 Unity 원본 직렬화로 되돌렸다. Codex에 `.asset` 끝 공백 제거 금지 공지(INBOX main `f97725cf2`, unity/main `e7d43d44d`). 임펙트 총괄에 ApplyLight 변경 알림 완료(VFX 브랜치는 URP 자산·TagManager·Rm0EngineSetup을 건드리지 않음 확인).
  - 병합 대기: VFX 공유 렌더 → RM0-LIGHT-L → Hero Light. 판정 캡처는 그 뒤 Linear·후처리 화면에서 다시 찍는다(현재 캡처는 참고용).
- 2026-10-28 UCH-03e(무료, Gamma·후처리 꺼짐 잠정): 시험 구도 = 캐릭터를 웅덩이 반경 60~80% 가장자리에 세우고 광원을 화면 한쪽 옆에 둠.
  - 림 Point 1회(캐릭터→광원 쪽 0.6m, 높이 1.2m, 세기 2.5): 수치 +95·색상각 9°로 통과하지만, 광원 쪽 몸 면 전체가 붉게 칠해짐(L* p95 75.7) → **반려**.
  - Fresnel: `Art/Characters/Shaders/CharacterLit_PoolRim.shadergraph`(URP Lit + Emission에 `_HeroPoolRimColor × _HeroPoolRimStrength × Fresnel^_RimPower(3) × 광원 쪽 반구 마스크`), 구동 `Runtime/CharacterLab/PoolRimDriver.cs`(`Lights/Pools`의 가장 가까운 `Pool_Hell_*`·`Pool_Toxic_*`, 0.85R~1.0R에서 0으로), 머티리얼 사본 `Warrior_Mat_Rim`·`Warrior_Greatsword_Mat_Rim`. 테두리 0일 때 원본과 픽셀 차이 0, 웅덩이 밖·없음·멀리 차이 0. 세기 3.0에서 광원 쪽 외곽에 진홍 테두리가 1x로 읽힘(색상각 4°, 채도 0.55) → **구조 PASS**.
  - 미해결: ① L-4 ① 휘도 +20에 Fresnel 1~3은 +6~9로 미달(광원 쪽만 보면 세기 약 6에서 +19.5). 진홍은 휘도 비중이 낮아, 휘도로 맞추면 형광 쪽으로 감 → 지표(휘도 유지 / R +40 / ΔE ≥15)를 디자인총괄에 질의. ② 세기 6~8에서 노멀맵 굴곡마다 붉은 조각(점 금지 위험) → Fresnel 법선을 메시 정점 법선으로 교체(03f).
  - 캡처 `E:/exoduser-wt/_out/unity-charsheet/unity_uch03e_20261028_0106/`. `PoolRimDriver`는 아직 씬·게임 코드에 붙이지 않음(캡처 전용).
- 2026-10-28 02:17~02:20 UCH-05·06 Meshy 6건(사용자 승인 130cr): 실버테일 body `01a17e5a-2ff9-726d-afcc-2bd2ae0523fc`·리깅 `01a17e5e-e781-7431-a393-fd5fc83bf4d4`·단검 `01a17e5e-eff6-745c-bbed-df9ec4f02f16`, 아이반 body `01a17e59-948d-740c-b539-09bd57b98a6d`·리깅 `01a17e5e-410c-732a-af43-1e9f66766b7f`·총 `01a17e5f-3297-75e9-a637-f9fe008fba69`. 합계 130cr, 잔액 4375→4245(장부 `E:/exoduser-wt/_out/meshy/credits.log`). 결과 판정·Unity 임포트는 진행 중. PC 메모리 커밋 한계(126.4/127.8GB, CTO 공통 규칙)로 Unity는 여유 20GB·PC 전체 1개 조건에서만 실행.
