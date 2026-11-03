# 1-1 드루이드 노인 코어 rig-pixel 준비 — 2026-11-04

상태: 11-04 01:20 CTO 배정으로 v7 Generic FBX·opt-in 어댑터를 프로젝트에 연결한 소스 후보다(§7). PC 정책46/0·Roslyn5어셈블리 오류0. 실제 Unity 임포트·Avatar·RT·화면·성능은 Mac 대기이며, 기존9cba8b5e1의8b 판정도 대기다. 기획 근거는 [G0 §26](../8.1보스디자인바이블/BOSS_1-1_FIRST_BOSS_REPLAN_G0_20261103.md), 고정 사양은 [LOCK §17.6·§17.8](../11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md), 영웅 rig-pixel 계약은 [UNITY_RIG_PIXEL_20261103](UNITY_RIG_PIXEL_20261103.md)이다.

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
