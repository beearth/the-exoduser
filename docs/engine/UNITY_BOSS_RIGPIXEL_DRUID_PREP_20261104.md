# 1-1 드루이드 노인 코어 rig-pixel 준비 — 2026-11-04

상태: 11-04 03:00 실제시각 CTO 배정으로 v8.1의29기술 단계+Idle/Walk=31클립을 소스에 연결했다(§9). 정책4,672/0·FBX 수치 계약 통과·전체Roslyn1회5어셈블리 오류0. 실제 Unity 임포트/Avatar/Metal/게임 화면/성능은 Mac 대기. §7의 v7 연결은 이전 후보 이력이다.

## 1. v6 입력 자산 이력 (최신 v7은 §7)

| 항목 | 값 |
|---|---|
| 정리본 GLB | `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v6/oldman_clean_v6.glb` (SHA-256 `d34a6e743669fb9ffa8670aafd8444c108278fc4b9f3ccfa3d86dcd8014079ea`, 21.7MB) |
| 원본 .blend | `.../v6/oldman_clean_v6_seg.blend` (SHA-256 `43deae3332e44dbdb4e9676d353e2497ab50ed0225adcc207fe9bd5f394a1cf3`) |
| 지팡이 단독 | `.../v5/staff_L_v2.glb` (SHA-256 `249a4d61958b1e886976ab2211a45743acfa5a6ec7ecaace17f25f95cfb7efb2`) |
| 텍스처 | 본체 base color 2048²(인장 굽힘) `.../v5s/oldman_basecolor_sigil.png` (`723687978f5f…`), 앞자락 256×1024 `.../v5s/front_panel_cloth.png` (`6a36452f5c8d…`) |
| 리그 | Meshy 인간형 24본(Hips…RightToeBase, 손가락 뼈 없음). 등 뿌리 팔은 Spine02 강체(정리 v1, 10,709정점) |
| 객체 | 본체 `char1`(65,235삼각형, 손·장화 포함), `FrontPanel`(Hips·양 UpLeg 가중), `Staff_L`(12,432삼각형)·`lantern_orb`(소켓 자식), 빈 객체 `StaffSocket_L`(LeftHand 뼈 자식, 쥐는 점 = 지팡이 끝에서 0.85m) |
| 동작 | Meshy 걷기·달리기 클립만(`m3_clean/basic_animations_walking_glb_clean_v1.glb`, 같은 뼈 이름). RB1-7 7기술 동작은 미작성 |

## 2. 크기·RT

| 항목 | 값 | 근거 |
|---|---|---|
| 모델 높이 | 뿔 끝 2.71m, 뿌리 팔 끝 2.82m, 정수리 2.30m | M2·M3 실측 |
| 표시 높이 | **영웅 실제 표시 높이 × 2.8**(뿔 끝 기준). 현재 추정 1.31u → 3.67u, 스케일 약 1.354 | RM1 §13.1 2차 정정 |
| 카메라 | 피치 34°, 거리 16.5(필드와 같음), 세로 FOV 46.9453°, 1080p | 사용자 원근 LOCK |
| 보스 위치 1px | 0.01327u(= 2·16.5·tan(23.47°)/1080) | 위 카메라 |
| 캔버스 | n=1(1920·3840×1080), 보스 extent 약 4.67u → 352텍셀(32 배수, 상한 1024 안) | 영웅 규칙 `ceil(extent/(wpp·n)/32)·32` |
| RT 규칙 | 영웅과 같다: ARGB32 Linear·Point·AA1·mip 없음, 4단 셀 `floor(sat(N·L)·3+.5)/3`, 실제 달빛, 알파 바깥 4이웃 1텍셀 검은 외곽선, 디더·그레인 0 | UNITY_RIG_PIXEL 계약 |

## 3. 재질 팔레트 (재질 이름 → sRGB, LOCK §5)

영웅 어댑터 `NativeRigPixelHero.Palette()`는 영웅 재질 이름(skin·hair·cloth…) 전용이다. 보스는 아래 표를 주입하는 보스용 어댑터(또는 Palette 표 주입식)로 같은 RT 경로를 쓴다. 텍스처 RGB 0%이므로 가면 인장·앞자락 룬은 rig-pixel에서는 보이지 않는다(1x 화면에서 2px 이하라 판정 대상이 아니며, 등장 근접 연출에서만 쓴다).

| 재질 | 색 | 면 수 | 쓰는 곳 |
|---|---|---|---|
| `druid_bone` | `#b9ad90` | 186 | 가면·허리 두개골 |
| `druid_bark` | `#4a3826` | 28,547 | 피부결·팔·다리·뿔·등 뿌리 팔·손·장화 |
| `druid_feather` | `#1c2024` | 28,338 | 치마·등 망토·어깨 깃털 |
| `druid_hair` | `#2a2624` | 6,794 | 가면 뒤 긴 머리 |
| `druid_beard` | `#8f8a82` | 451 | 수염(영역 통째) |
| `druid_glow` | `#a8642a`, Emission `#d49a5c` | 0 | 가슴 틈 — 텍스처에 없어 Unity Emission 마스크로 추가 필요 |
| `druid_moss` | `#36421f` | 0 | 예약 |
| `staff_bark` / `staff_leather` / `staff_bone` | `#4a3826` / `#2e231b` / `#b9ad90` | — | 지팡이 |
| `lantern_orb` | `#a8642a`, Emission `#d49a5c` | — | 구슬. 셀 명암 제외·발광 화면 픽셀 합 ≤0.5%(LOCK §5) |
| `front_panel_cloth` | `#26211d` | — | 앞자락 |

## 4. Unity 연결 원 계획 (v7 소스 연결 상태는 §7)

1. GLB를 `Art/Bosses/Druid/` 계열로 들여와 Humanoid 아바타 확인, `StaffSocket_L` 자식 유지, 스케일은 영웅 표시 높이 영수증으로 계산(상수 하드코딩 금지).
2. 보스용 rig-pixel 어댑터: 영웅과 같은 RT·셀·외곽선, 위 팔레트 표, 루트 = Core 보스 위치(Core·판정 변경 0). 실패 시 기존 보스 표시로 폴백.
3. 보조본(LOCK §4): `Cloak_Back`(체인 4)·`Panel_Front`(2)·`Beard`(2)·`Chain_L`(2)·`Fist_L` 블렌드셰이프는 미작성. 앞자락은 Hips·UpLeg 임시 가중이다.
4. 가슴 틈 `druid_glow` Emission 마스크 추가(텍스처에 발광부가 없음).

## 5. Mac 판정 조건 (같은 후보)

- 보스방 34°·16.5에서 idle·walk 1920·3840 캡처, 1x·3x 크롭, 10초 무음 영상.
- 영웅 옆 크기비 2.6~3.0, 뿔 끝 여백 ≥8%, 가면·가지뿔·지팡이 구슬·깃털 치마·새발 장화가 1x에서 읽힘.
- 3x 낱점 0, 발광 화면 픽셀 합 ≤0.5%, 먼 적이 보스·발광에 가려지지 않음.
- 실패하면 원인 수정 없이 재실행하지 않는다.

## 6. Blender 근사 미리보기 (참고, PASS 근거 아님)

`pixel_preview.py`(Cycles CPU 1샘플, 무창)로 위 2·3절을 흉내 냈다. 결과 `G:/exoduser/tmp/design-review/20261104_boss_1-1_oldman_cleanup/07_rigpixel_preview_1x.png`·`08_rigpixel_preview_3x.png`: 보스 알파 높이 318행(1080의 29%, A포즈·뿌리 팔 포함), 가면·뿔·구슬·치마·장화 읽힘, 3x 낱점 0. 걷기 클립은 Blender 5.2 액션 슬롯 연결이 안 돼 A포즈로만 봤다.

## 7. 11-04 01:20 CTO — v7 Unity 어댑터 소스 후보

최신 origin/unity/main 5c9dd3673861b4b5086884dac664068b4d87f370을 먼저 병합(0c22494993)했다. CHANGELOG_SYNC 양쪽 원문을 보존했다. 작업 중 새 v7 도착을 확인해 브리프대로 v6 대신 교체했다. 목표 장면은 기존8b 아레나34°/16.5의 노인 코어다. 직접 연 v6 정면 분할 참조와 v7 GLB/제작자 수치 보고를 기준으로, 실제 팔레트·크기·발 접지는 Mac 같은 패키지1x에서 처음 판정한다. PC Unity/Player/새 렌더0. §1~6은 v6 준비 이력이며, 현재 입력/동작은 이 절이 우선한다.

| 항목 | 현재 구현·판정 경계 |
|---|---|
| 입력 | I:/EXODUSER-Storage/boss/oldman-v2-20261104/v7/oldman_clean_v7.glb, 22,995,252 bytes, SHA-256 7c5923929caf526cd84436792fcf4c66a5747b074b451dfd9569e41ba23450cc |
| 프로젝트 리소스 | Resources/Art/Bosses/Druid/OldmanV7.fbx + oldman-import.json. 원본은 읽기 전용, 포맷 변환만. 최종 FBX1개, v6 후보는 남기지 않음 |
| Avatar 선택 | Generic(animationType2). 원래34본·보조 체인·LeftHand/StaffSocket_L·Fist_L을 보존하기 위한 선택. Humanoid 매핑/리타깃을 추정해 강제하지 않는다. 실제 avatar.isValid/!isHuman은 Mac Editor/Player 영수증으로 확정 |
| 자산 수치 | 4메시·34본·78,323삼각형·Fist_L. Cloak_Back4·Panel_Front2·Beard2·Chain_L2 보존, Chain_L은 원본 무가중. glTF importer의 Icosphere 뼈 표시 helper 제외. 제작자78,403은 이80삼각형 포함 수치 |
| 가슴 발광 | v7 druid_glow 43면 마스크 그대로. 어댑터에서 druid_glow/lantern_orb를 #d49a5c 비조명 호박색으로 표시. 화면 발광 합 ≤0.5%는 Mac 실제 판정 |
| 동작 | v7 idle2초·walk 약1.0667초를 60fps 시간축으로 변환. Generic Animator + 수동 PlayableGraph, Core tick/60 샘플, 루트 모션 끔. 옛24본 Run은 새34본에 섞지 않음 |
| 기본/옵션 | 기본 표시 유지. --boss-render=rigpixel(또는 분리 인수)만 새 표시. 활성 아레나에서 RT 성공 후 기존 몸체만 숨김. 초기화/RT 실패 시 경고1회·기존 보스 폴백. 잠행 중 기존 흙더미 유지 |
| 공통 픽셀 계약 | NativeRigPixelPolicy·RigPixelComposite 재사용, ARGB32 Linear Point/AA1/no mip, 동적32배수64..1024, 4단 셀·4이웃1텍셀 외곽선·SnapAnchor. 전용 layer27. 영웅/적 pixel grid를 덮지 않음 |
| 팔레트·조명 | §3 팔레트100%, 텍스처RGB0%. 실제 장면 달빛/환경/가까운4점광을 적 어댑터와 같은 방식으로 읽음. 별도 보스 라이트/영웅 전용 림 추가0 |
| 크기·카메라 | NativeArenaActorMetrics.HeroIdleWorld(표시 모델 보정, 없으면 기존 alpha 기준)×2.8을 뿔 기준 목표로 사용. 모델2.82/뿔2.71로 FBX 단위 환산. phase 반경 비율 유지. 카메라34°/16.5/FOV46.9453/전방1.45 변경0. 실제 화면2.6~3.0·뿔 여백8%는 Mac 판정 |
| 침강·히트스톱 | 기존66틱 침강 시간/지면 클립·일시 pose 고정. Death/Sink 모션 없음. Core 위치·방향·상태/MoveId를 읽기만 하며 Core 타이머/판정 변경0 |
| 계측 | camera-frames.jsonl·same-frame JSON의 bossRig에 상태/MoveId/pose/clip/누락/Avatar/소스/RT크기/시간/bounds. 최신 raw RT PNG1장·알파행 높이는 합성 외곽선·가림 전이며 뿌리팔/지팡이 포함. rig 성공 시 옛 스프라이트 bossHeroRatio=-1. 최종 크기 판정은 실제 PNG |

### Core 상태 → 제공 클립 표

| 상태·기술 | 선택 | 제공 여부 |
|---|---|---|
| idle, 정지 | Idle 반복 | v7 제공 |
| idle에서 실제 Core 이동 / eWalk·eChase·eApproach | Walk 반복 | v7 제공 |
| eRun | Idle@0 고정·missingClip=true | v7 Run 미제공 |
| slashCombo 채찍 | Idle@0 고정 | 미제공 |
| slam 내려찍기 | Idle@0 고정 | 미제공 |
| charge 돌진 | Idle@0 고정, Run 대용 안 함 | 미제공 |
| grab 잡기 | Idle@0 고정 | 미제공 |
| burrowStrike 잠행·출현 | 지하 기존 흙더미, 출현 Idle@0 | 미제공 |
| groundFissure 균열 | Idle@0 고정 | 미제공 |
| heartbeat 심장박동 | Idle@0 고정 | 미제공 |
| Hit·Stagger·Death·Sink·기타 | Idle@0 고정(침강 위치만 기존 시간) | 미제공 |

검증: 정책46/0. Player Core126/Runtime281, Editor Core126/Runtime281/Editor60, 총5어셈블리 Roslyn 오류0. FBX 재임포트 수치는34본·4메시·78,323삼각형·Fist_L/소켓·Idle Head와 Walk LeftFoot 움직임을 확인했다. 초기 v6 수치 검사1회는 lantern_orb 액션을 골격 액션으로 잘못 검사해 실패했고, Armature 액션으로 범위를 고친 뒤 통과했다. v7 최종 검사는 통과했다. 같은 테스트2회 실패 없음. 이 수치는 Unity 임포트·게임 화면 PASS가 아니다.

Mac은 먼저 Exoduser.CharacterLab.DruidRigPixelVerification.Verify를 Editor에서 실행해 Generic Avatar/보조본/Fist_L/팔레트/Idle·Walk 곡선/셰이더 임포트를 확인한다. PC 실행 금지. 같은 후보 Player의 기존 아레나 인수에 --hero-render=rigpixel --boss-render=rigpixel을 더하고1920/3840×1080을 따로 실행한다. 전체 인수와 별도 metrics-only는 [아레나 실행 문서](UNITY_BOSS_ARENA_RB1_7_8_20261103.md#11-04-0120-드루이드-rig-pixel-mac-인계)를 따른다. 실제 Unity Avatar·Metal 셰이더·RT 낱점/톤/크기·발/지팡이 접지·7기술 가독성·먼 적·10초 영상·60fps는 미검증이다.

## 7. v7 GLB — 보조본·발광 마스크·idle/walk (2026-11-04 1시, 보스전 총괄 Blender 서브에이전트, 유료 0)

레인은 v6 대신 이 파일을 쓴다. 치마 가중 수정본 v7.1이 나오면 이 절에 경로를 더한다.

| 항목 | 값 |
|---|---|
| GLB | `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v7/oldman_clean_v7.glb` (23.0MB, SHA-256 `711f9f6d82462218638e91b106bc68a729ac8b6439db051c8408d6008fffb92d`) |
| 원본·검사 | 같은 폴더 `oldman_clean_v7.blend`, `v7_report.json`, `v7_check.json`, 스크립트 `build_v7.py`·`bake_walk.py`·`check_v7.py`·`render_v7.py` |
| 뼈 | 34 = Meshy 24 + 보조 10. `StaffSocket_L` 그대로(재임포트 뒤에도 노드 유지) |
| 보조본 가중 정점 | `Cloak_Back_1~4` 6,012 / 12,928 / 12,934 / 4,912(깃털 한 장 단위, 높이 기울기, 맨 위 원래 가중 50% 유지) · `Panel_Front_1~2` 60 / 60(맨 위 UpLeg 10% 유지) · `Beard_1~2` 368 / 259 · `Chain_L_1~2` 0(허리 사슬 형상 없음 — 뼈만 있음) |
| 셰이프 키 | `Fist_L`: 왼손 1,296정점이 쥐는 점 쪽으로 최대 1.5cm |
| 미가중 정점 | 0 (`char1` 99,407, `FrontPanel` 85) |
| 삼각형 | 78,323 (본체 65,235 + 앞자락 128 + 지팡이 12,432 + 구슬 528) |
| `druid_glow` 가슴 틈 | 43면, 131.3cm², 폭 ≤5.8cm·높이 28.5cm(z 1.56~1.85). 기본색 `#a8642a`, 발광 `#d49a5c`, 강도 0.5(GLB emissive ≈ 0.33, 0.16, 0.05). 34° 발광 픽셀(틈+구슬) 화면의 0.016~0.019%(LOCK 상한 0.5% 안) |
| 클립 | `idle` 0~60f(2.0초, 오른다리 체중·고개 20° 숙임·호흡, 두 발과 왼손 고정, 보조본 흔들림), `walk` 0~32f(1.0667초, Meshy 걷기를 30fps 루프로 다시 뽑음, 루프 이음 오차 분산, 왼팔은 지팡이 때문에 25%만 반영 — `build_v7.py`의 `LEFT_ARM_DAMP`) |
| 높이 | 뒤 뿌리 팔 끝 2.82m, 앞 최고점 2.736m(뿔 끝 근사, 문서 2.71m보다 2.6cm 큼) |
| 미리보기 | `G:/exoduser/tmp/design-review/20261104_boss_1-1_oldman_cleanup/v7_idle_f00·f30`, `v7_walk_p00·p25·p50·p75`(`_1x`·`_3x`). EEVEE 근사·외곽선 없음이라 Unity RT 판정 근거가 아니다 |
| 알려진 결함 | ① 걷기에서 깃털 치마가 한쪽 UpLeg 가중이라 옆에서 늘어난 조각이 보인다 → v7.1에서 Hips+양 UpLeg로 나눠 수정 중. ② Blender 임포터가 `StaffSocket_L`을 뼈 꼬리 기준으로 잘못 놓는다(GLB 노드 변환은 v6와 같아 Unity에는 영향 없음 — 확인은 Unity에서) |

### 7.1 v7.1 — 치마 가중 수정 (같은 날 2시, 레인 입력은 이 파일)

| 항목 | 값 |
|---|---|
| GLB | `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v7_1/oldman_clean_v7_1.glb` (23.0MB, SHA-256 `f28a5027829eda72489ec9f75bdc632482b26fa3dee5ed7e6817d7788cf0875e`), 같은 폴더 `.blend`·`v7_1_report.json`·`v7_1_check.json`·`build_v7_1.py` |
| 수정 | 치마 깃털(z<1.58, 망토 제외) 24,471정점을 깃털 한 장 단위로 같은 가중. 다리 몫 앞 60%·옆 42.5%·뒤 25%, 나머지 Hips, 방위각으로 부드럽게 잇고 좌우는 중심선 ±8cm에서 섞음. 아래 자락(z<0.9)은 가까운 Leg 최대 15%. 뼈·액션·`Fist_L`·재질은 v7 그대로 |
| 늘어남(치마 변 45,362개, 걷기 프레임 0/8/16/24) | 1.5배 초과: v7 130/811/465/1,586 → **v7.1 0/0/0/0**. 최대 비율: v7 1.89/5.99/2.39/8.58 → v7.1 1.09/1.10/1.10/1.10 |
| 검사 | 미가중 0, 뼈 34, `idle` 2.0초·`walk` 1.0667초 유지, 발광 0.016~0.019% |
| 비교판 | `G:/exoduser/tmp/design-review/20261104_boss_1-1_oldman_cleanup/v7_1_walk_side_compare_before_after.png`(위 v7, 아래 v7.1, 옆 3x) |
| 남은 결함(RETOUCH) | ① 걷기 옆 p25·p75에서 치마 끝단 깃털이 짧은 가로 막대처럼 뜬다(한 장씩 단단히 움직임). ② 다리가 뒤로 스칠 때 치마를 뚫는다. 둘 다 34° 1x에서의 크기는 Mac 캡처로 판정하고, 보이면 Unity 쪽 `CapeSpring` 계열 2차 움직임이나 깃털 카드 연결로 고친다. ③ `Chain_L`은 형상이 없어 가중 0 |

## 8. 7기술 동작 클립 — 이름·틱 계약 (2026-11-04 2시, 제작 중: v7.2 치마 수정 → v8)

- 산출 예정: `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v8/oldman_druid_v8.glb`(idle·walk + 아래 클립). 완성되면 이 절에 SHA·발 미끄러짐 수치를 적는다.
- 새 클립은 **60fps, 1프레임 = Core 1틱**이고 기술마다 **단계별로 나뉜다**. 레인은 Core 상태(예고·발동·회복 틱)에 맞춰 단계 클립을 잇고, Core 값이 바뀌면(RM1 §13.4 RB1-7 변경표) 단계 재생 속도 = 클립 길이 ÷ Core 틱으로 맞춘다. Core 수치·판정은 바꾸지 않는다.
- 아래 길이는 현재 Core(`DruidRemodelData.cs` unity/main 5ce03758f) 값이다.
- 제작 규칙(보스 보드 §8.5.1, 노레위): 발동 첫 프레임 = 타격 자세, 예고·발동 중 두 발 고정(루트 표시 클립만 이동), 회복 최저 자세는 회복 길이 1/3 이하, 왼손은 지팡이를 놓지 않음(내려찍기만 두 손), 보조본은 2차 움직임. 단계 끝 자세 = 다음 단계 첫 자세, `*_rec` 끝 = `idle` 첫 자세.

| # | Core 기술 | 클립(길이 f) | Core 근거 |
|---|---|---|---|
| 1 | `slashCombo`(1·2타 패링 가능, 3타 불가) | `slash1_tele`(32) → `slash1_act`(8, 6f째 타격) → `slash2_tele`(24) → `slash2_act`(8) → `slash3_tele`(24) → `slash3_act`(8, 지팡이 큰 내려베기) → `slash_rec`(80) | Moves[0] tele 32·rec 80, `SlashActive 8`·`SlashHitAt 6`·`SlashLinkTele 24` |
| 2 | `slam` | `slam_tele`(48, 두 손 지팡이 들기) → `slam_act`(6) → `slam_rec`(70) | Moves[1] 48/70, `SlamActive 6` |
| 3 | `charge` | `charge_tele`(54) → `charge_run`(40 반복, 루트) → `charge_rec`(70) | Moves[2] 54/70, `ChargeTicks 40` |
| 4 | `grab` | `grab_tele`(60) → `grab_lunge`(18, 루트) → 잡힘 `grab_hold`(120 반복) → `grab_throw`(60) / 빗나감 `grab_miss_rec`(80) | Moves[5] 60/80, `GrabLungeTicks 18`, `GrabTicks 120`, `GrabHeldRecovery 60`, `GrabMissRecovery 80` |
| 5 | `burrowStrike` | `burrow_dive`(50, 루트 아래) → `burrow_erupt_warn`(30) → `burrow_erupt`(6) → `burrow_rec`(70) | Moves[6] 50/70, `BurrowEruptWarn 30`, `BurrowEruptPost 6` |
| 6 | `groundFissure` | `fissure_tele`(40) → `fissure_act`(20, 꽂고 버팀) → `fissure_rec`(60) | Moves[3] 40/60(즉시형, 균열 이동은 VFX) |
| 7 | `heartbeat`(강제, P3) | `heart_tele`(90) → `heart_beat`(60)×3 사이 `heart_pause`(30) → `heart_rec`(90) | Moves[11] 90/90, `HeartbeatBeats 3`·`BeatWind 60`·`Pause 30`·`Recover 90` |

### 8.1 v8.1 완성본 — 레인 입력 (2026-11-04 3시)

| 항목 | 값 |
|---|---|
| GLB | `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v8_1/oldman_druid_v8_1.glb` (24.3MB, SHA-256 `a143a7deb7e144bf5dce55e7df730e0604b0e25ca22a88f7615808f6aad85477`), 같은 폴더 `.blend`·`v8_1_report.json` |
| 바탕 | v7.2 치마(`.../v7_2/oldman_clean_v7_2.glb`, SHA-256 `93e2f7c2…`: 다리 몫 장 단위 재맞춤 3,376장·끝단 위 이웃과 최대 50% 섞기, 늘어남 1.5배 초과 0, 관통 1cm 초과 정점 v7.1 3,475~4,845 → v7.2 2,293~2,768 — 휴지에서 이미 허벅지 안인 정점 약 7.1k라 0은 아님) |
| 클립 | `idle`·`walk`(시간 유지, 60fps 키로 2배) + §8 표 29개, 이름·길이 표와 같음(재임포트 확인). 미가중 0, 뼈 34 |
| 이음 | 같은 기술 안 단계 끝↔다음 첫 = 몸 뼈 0°(예외 `heart_tele→beat`·`pause→rec` 2.2°), 보조본 최대 5.5°(`grab_lunge→hold`), `*_rec` 끝 = `idle` 첫(몸 0°) |
| 발 | 루트 아닌 클립 발 미끄러짐 0.0cm. `charge_run` 루트 40틱 2.55m(접지 한 틱 최대 이동 0.000cm), `grab_lunge` 스텝 2회·루트 0.9m, `burrow_dive`/`burrow_erupt` 수직(-2.6m↔0) |
| 예비 자세 폭(tele 최대) | 채찍 1타 몸통 56°·손 수평 폭 1.83m, 2타 66°·1.72m, 3타 28°·왼손 2.62m(지팡이 머리 위), 내려찍기·줄기 28°·2.62m, 돌진 상체 숙임 58°, 잡기 48°·손 궤적 2.46m, 심장 30.5° 가슴 펴기, 무게 중심 뒤로 0.12~0.22m |
| 타격 | 채찍 act 6f째 판정·8f째 반대편 follow-through, 3타는 구슬이 위에서 원호(이동 3.5m), 내려찍기·줄기는 지팡이 아래 끝(뿌리 촉)으로 찍음(첫 프레임 촉 높이 0.0/-0.05m), 구슬은 전 구간 위 |
| 띠 | `G:/exoduser/tmp/design-review/20261104_boss_1-1_oldman_cleanup/v8_1_<slash12·slash·slam·charge·grab·burrow·fissure·heart>_strip_1x·3x.png`(idle | tele 최대 | act 판정 | act 끝 | rec 최저, 위 34°·아래 옆 90°) |
| 판정 | v8 RETOUCH(34°에서 단계 실루엣이 같음·지팡이 거꾸로) → **v8.1 제작자 조건부 PASS**: 34° 1x에서 채찍 감기·내려찍기 들어올림·돌진 숙임이 서로 다른 실루엣으로 읽힌다. 최종은 Unity rig-pixel Mac 캡처(§5) |
| 남은 결함 | ① 채찍 팔 끝 도달 부족 8.9~14.2cm(목표가 팔 길이 밖), 심장 박동 왼손 6~8cm·돌진 예고 3.8cm. ② 잠행은 몸통 13.5°로 폭이 작다. ③ 가슴 틈 밝기 맥동은 Unity에서 `heart_beat` 시간에 맞춰 구동. ④ 치마 관통 잔여(위 바탕 행) |


## 9. 03:00 실제시각 CTO — v8.1 7기술 연결 소스 후보

최신 origin/unity/main 309892b1da390a6ac7218d2935ca0e808157c7a8을 먼저 병합했다(51e0b30e77). CHANGELOG_SYNC와 이 문서의 충돌은 양쪽 기록을 모두 보존했다. 목표 장면은 기존34°/16.5 아레나에서7기술의 예고→발동→회복이 읽히는 실제 rig-pixel 화면이다. 제작자 v8.1 계약(7d3e11f48·2f7f90624), 원본 GLB와 제작자 수치 보고를 기준으로 기존 v7 어댑터를 바꿨다. PC에서는 포맷 변환·숫자 검사·컴파일까지만 했으며, 첫 실제 시각 판정은 같은 SHA의 Mac1920/3840 1x·3x·10초 영상이다. 미끄러짐/접지·단계 구분·예고와 타격·먼 적·60fps 결함은 FAIL이고 같은 검사2회 실패면 중단한다.

| 항목 | 구현·범위 |
|---|---|
| 입력/리소스 | §8.1 GLB의 SHA a143a7deb7e144bf5dce55e7df730e0604b0e25ca22a88f7615808f6aad85477·24,299,016 bytes 확인. Resources/Art/Bosses/Druid/OldmanV81.fbx(15,407,836 bytes) 하나로 교체, v7 FBX 삭제·meta GUID 유지. 원본은 수정하지 않음 |
| 보존 | Generic34본·4메시·78,323삼각형·보조10본·Fist_L·가슴43면·왼손소켓·31클립. glTF importer 뼈 표시 Icosphere 제외. 변환 때 GLB joint-head 기준 소켓 월드 행렬을 복원해 Blender bone-tail 단위/좌표 오프셋을 제거. 재임포트 rest 오차0.000001081m |
| 시간 | 60fps 원본 길이 그대로 FBX 변환. Core S/MoveId/St2/RmTeleTotal/SlashIdx/HbBeat/EruptHit와 회복 보너스를 읽고 수동 Generic Playable을 샘플. 기본 재생은 sourceFrames×elapsedCore/coreDuration. Core 수치·판정·위치 수정0 |
| 플래그·표시 | 기존 --boss-render=rigpixel만. 기본 보스/8b/카메라34°·16.5·FOV46.9453·영웅 실제 모델 높이×2.8·Point RT/4단 셀 유지.31클립 중 하나라도 임포트가 빠지면 기존 보스 폴백 |
| 루트 | Animator root motion 끔. charge_run/grab_lunge의 첫 포즈 대비 수평 Hips 이동을 표시에서 빼 Core 전진과 이중 이동하지 않음. burrow_dive/erupt의 수직 이동은 유지하고 지면 아래 clip. 지하 상태는 기존 흙더미 유지. Core 이동량/회전이 원본 클립과 같다는 뜻은 아니며 실제 세계 발 접지는 Mac 관문 |
| 발광 | heart_beat의 정규화 클립 시간으로 가슴 발광을0.6~1배 맥동. 색은 기존 #d49a5c 상한, 구슬은 유지. 실제 화면 발광≤0.5%·잔점0은 Mac 판정 |
| 영수증 | bossRig의 clip/pose/sourceFrame/sampleSeconds/coreStageTicks/elapsedStageTicks/horizontalRootStripped/held, 좌우 foot world 위치·footDeltaCm 추가. footDelta는 수직 발 들기·Core 이동/회전을 포함하고 단계 첫 샘플은0으로 초기화하므로 미끄러짐 PASS 지표가 아님. 연속 좌표와 실제PNG로 판정 |
| 미제공 | Run·Hit·Stagger·Death·Sink·collapse 전용 클립은 여전히 Idle@0 대기. 일반 idle에서 실제 이동하면 Walk. 기본 표현과 전투 판정은 유지 |

### 9.1 원본 길이 ↔ 현재 Core 시간 연결

§8의 제작 길이는 원본 그대로이며, 최신 Core는 RB1-7 정정으로 아래와 다르다. 아래 차이를 없애려고 Core를 되돌리지 않는다.

| 기술 | 클립/현재 Core 연결 |
|---|---|
| slashCombo | slash1_tele32→Core36, slash2/3_tele24→26, 각 act8→10, rec80→84. act 원본6f 타격 포즈를 현재 Core의 St2=SlashHitAt8(발동 후2틱)에 맞추는 구간별 샘플:0→6f를2틱,6→8f를나머지8틱.3연타는 SlashIdx로 각각 선택 |
| slam | tele48→52, act6→6, rec70→76. 실제 피해는 Core active 끝/rec 진입이며 원본 지팡이 접촉 자세는 실제 캡처에서 대조 |
| charge | tele54→58, run40→최대40(일찍 접촉/벽 충돌하면 Core 상태를 즉시 따름), rec70→74. 벽 충돌 bossShock20은 charge_rec으로 연결. 잡기 선택이 원거리 돌진으로 바뀐 경우 실제 charge 상태를 기억해 회복도 charge_rec을 쓰되 원래 grab 회복 시간84를 유지 |
| grab | tele60→64, lunge18→20, hold120→120. 잡힘 뒤 bossRec60은 grab_throw60, 빗나감84는 miss_rec80, 탈출 recover40은 miss_rec80을 압축. Core 흡수/던지기/탈출 판정 변경0 |
| burrowStrike | dive50→56, 지하45틱은 기존 흙더미. erupt 상태40을 warn34/source30 + post6/source6으로 나누며 EruptHit 경계를 사용. rec70→76, 수직 클립 유지 |
| groundFissure | tele40→42. Core는 균열 생성 즉시 bossRec60으로 넘어가므로 회복 처음20틱에 fissure_act20, 남은40틱에 fissure_rec60을 배치. Core 밖에20틱을 추가하지 않음 |
| heartbeat | 첫 bossHeartWind90은 heart_tele90, 후속2·3회 wind60은 heart_beat60, 사이 pause30·최종 rec90. 최초 예고 뒤 별도60틱을 추가하지 않음. 실제 펄스는 Core HbBeat 전환 영수증과 대조 |
| 패링 보너스 | 실제 RmBonusApplied의+30틱을 회복 길이에 포함. 보너스가 붙어도 이미 경과한 Core 틱은 역행하지 않음. 표시 클립을 늘려 같은 회복 창 안에서 종료 |

### 9.2 계약 검사 결과와 한계

- 정책 RED: 단계 Select API 부재1회 → 구현 후4,672검사/0실패. 실제 Core 상수를 읽어 각 단계 시작/끝·단조 진행·채찍 판정6f·3연타·잠행 경계·잡힘/실패/탈출·즉시 균열·심장3회·패링+30·flag/팔레트·실제 변환 자산31개 길이를 검사했다.
- 변환 FBX 재임포트:31클립 이름/길이,34본·4메시·78,323삼각형·Fist_L·왼손소켓 통과. 정지 단계의 **수평** 발 미끄러짐 최대0.00460955cm(표시 반올림0.0cm, float 허용0.02cm), charge_run 접지 구간 한 틱 최대0.00019078cm. Walk/루트4클립의 의도된 스텝·잠행 수직 이동은 정지 발 검사에서 분리한다.
- 첫 발 검사1회는 발 들기를 포함한3D 변위를 미끄러짐으로 잘못 세어 charge_tele/rec 약20cm FAIL이었다. 원본 GLB 진단에서 수평은 유지되고 오른발만20cm 들리는 원인을 확정한 후 수평 거리로 고쳐 재검사 통과. 소스 동작은 고치지 않았다. 같은 검사2회 실패 없음.
- 전체 PC Roslyn은 요청대로1회: Player Core126/Runtime281, Editor Core126/Runtime281/Editor61, 총5어셈블리 오류0. PC Unity/Player/빌드/렌더/캡처0. Blender는 무창2스레드 포맷 변환·숫자 검사만 했다. python stdin·유료·USER_SAVE 접근0.
- 위 수평 발 수치는 고정 루트의 변환 자산 계약이다. Core의 전진/감속/조준 회전·루트 보정·스킨/아바타·게임 지면을 포함한 실제 발 접지를 증명하지 않는다. Mac Editor Verify는 실제 Unity31클립 길이/곡선/Generic·보조본·Fist_L·수평 발 계약을 검사하도록 확장했고 PC에서는 실행하지 않았다.

Mac 전체 인수·7기술별1x 캡처/10초 영상 수집 요청은 [03:00 인계](UNITY_BOSS_ARENA_RB1_7_8_20261103.md#11-04-0300-실제시각-v81-7기술-mac-인계)에 있다. 실제 Unity/Metal RT·원근/크기·타격/예고 경계·실루엣·발/지팡이접지·치마 관통·1x/3x·영상·60fps 판정은 미검증이다. 제작자 조건부 PASS나 숫자/컴파일을 디자인 PASS로 올리지 않는다.
