# 1-1 드루이드 노인 코어 rig-pixel 준비 — 2026-11-04

상태: [11-04 v8.2 교체 §9.3 — 현재 입력은 OldmanV82.fbx, 아래 v8.1 수치는 이력] 11-04 03:00 실제시각 CTO 배정으로 v8.1의29기술 단계+Idle/Walk=31클립을 소스에 연결했다(§9). 정책4,672/0·FBX 수치 계약 통과·전체Roslyn1회5어셈블리 오류0. 실제 Unity 임포트/Avatar/Metal/게임 화면/성능은 Mac 대기. §7의 v7 연결은 이전 후보 이력이다.

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

### 8.2 v8.2 — 조건부 항목 수정, 레인 입력은 이 파일 (2026-11-04, CTO 배정, Blender 서브에이전트, 유료 0)

| 항목 | 값 |
|---|---|
| GLB | `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v8_2/oldman_druid_v8_2.glb` (24.3MB, SHA-256 `313bb238185919b69dd9233fade9f12185e803cb6e72d9a807ae0d781bd3798c`), 같은 폴더 `.blend`·`v8_2_report.json`, 치마 중간본 `v8_2/skirt_c/oldman_clean_v7_3.blend` |
| 바뀌지 않은 것 | 액션 31개(이름·길이 §8 표 그대로, 60fps), 뼈 34, 미가중 0, `StaffSocket_L`·`Fist_L`·재질·발광 마스크, 루트 아닌 클립 발 미끄러짐 0.0cm, 이음(몸 0°·보조본 최대 5.5°) |
| 손 도달 | 채찍 1타 8.9 → 0.3cm, 2타 발동·3타 예고 14.2 → 0.3/1.3cm, 2타 예고 6.4 → 0.3cm, 돌진 예고 3.8 → 0.3cm, 심장 6.0~8.4 → 0.7~2.2cm(모두 ≤3cm). 채찍 폭 1.83 → 1.88m·1.72 → 1.80m(≥1.6m 유지) |
| 잠행 폭 | `burrow_dive` 가슴 회전 13.5° → 34.3°(10f 몸을 젖혀 뿌리 팔·갈고리 손 들기 → 24f 깊이 웅크려 감기), `burrow_erupt` 끝에서 가슴 뒤로 33° 아치·갈고리 손 2.50 → 2.66m. 길이·수직 루트(-2.6m↔0) 그대로 |
| 치마 관통(걷기 위상 0/8/16/24, 1cm 넘게 새로 파고든 정점) | v8.1 2,293/2,548/2,768/2,398 → **v8.2 1,094/788/899/821**(61~68% 감소, 목표 ≤500 미달). 늘어남 1.5배 초과 0(최대 1.11). 휴지에서 이미 허벅지 안 5,764 → 3,407. 방법: 휴지 모양에서 치마 바깥으로 최대 3cm 밀기 + 장 단위 재가중(6cm 밀기도 776~1,008에서 멈춰 3cm로 마무리) |
| 띠 | `G:/exoduser/tmp/design-review/20261104_boss_1-1_oldman_cleanup/v8_2_<slash12·slash·burrow·heart>_strip_1x·3x.png`, `v8_2_walk_side_compare.png`(위 v8.1·아래 v8.2) |
| 판정 | 제작자 PASS(Mac 판정 대기): 34° 1x에서 잠행이 "웅크려 감기 → 솟아 찌르기"로 읽힌다. 도달 오차는 모두 3cm 안 |
| 남은 결함 | ① 치마 관통 788~1,094정점(허리띠 쪽 깊이 묻힌 정점, 두 허벅지 사이 가운데 깃털 — 정적 가중으로는 한계) ② 옆 p25·p75 끝단 깃털 가로 막대 모양 그대로 ③ `slam_rec`·`fissure_rec` 오른손 7.9cm, `grab_lunge` 오른발 2.5cm(이번 범위 밖, v8.1과 같음). ①②는 Mac 1x 캡처에서 보이면 Unity `CapeSpring` 계열 2차 움직임이나 깃털 카드 연결로 고친다 |


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

### 9.3 v8.2 교체와 오브 소켓 API (11-04, 보스전 총괄 배정)

| 항목 | 내용 |
|---|---|
| 입력 | §8.2 GLB `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v8_2/oldman_druid_v8_2.glb` SHA-256 313bb238185919b69dd9233fade9f12185e803cb6e72d9a807ae0d781bd3798c 확인(24,299,904B). 원본 미수정 |
| 변환 | `unity/Tools/druid-rigpixel/import-oldman.py`를 v8.1과 같은 절차로 사용(이름만 v8.2/OldmanV82.fbx): 무창 Blender 5.2.3 `-b --factory-startup --threads 2`, 소켓 월드 행렬 복원, Icosphere 제외. 결과 OldmanV82.fbx 15,581,516B, 소켓 보정 후 오차 3.9e-6m |
| 파일 | OldmanV81.fbx 삭제, `.meta`는 이름만 바꿔 GUID 유지(V7→V81과 같음). 갱신한 참조: NativeDruidRigPixelView(Resource), DruidRigPixelVerification(PathName), oldman-import.json(sourceVersion/SHA/bytes), druid-rigpixel-tests(sourceVersion==v8.2) |
| 불변 | 31클립·이름·틱 계약(§9.1), 34본, 4메시, 78,323삼각형, Fist_L, StaffSocket_L(LeftHand). Core 변경 0 |
| 검사 | 정책 4,672검사/0실패. verify-fbx.py: 31클립·34본·78,323삼각형 통과, 정지 발 수평 최대 0.00461cm(허용 0.02cm), 소켓 rest 오차 1.08e-6m. 전체 PC Roslyn 1회: Player Core126/Runtime281, Editor Core126/Runtime281/Editor62, 총5어셈블리 오류 0 |
| 한계 | v8.2의 §8.2 남은 결함(치마 관통 788~1,094정점 등)은 Mac 1x 캡처 판정 대기. PC Unity/Player/빌드/캡처 0 |

**오브 소켓 읽기 API** (VFX 총괄 슬래시3 예고용, `NativeDruidRigPixelView`, Core 무관): 모델에서 `StaffSocket_L` 아래 `lantern_orb` 변환을 찾아 보관(없으면 기존 보스 폴백). 오브 메시 원점=메시 중심(Blender 확인), 위치는 클립이 샘플한 실시간 변환 그대로이며 손으로 잡은 오프셋은 없다.

| 이름 | 의미 |
|---|---|
| `bool HasOrbSocket` | 뷰가 정상(실패 아님)이고 `Ready`(이번 활성 구간에 렌더됨)이며 오브를 찾았을 때 true |
| `Vector3 OrbSocketWorldPosition` | `lantern_orb.position`(월드). 값은 LateUpdate(실행순서1002)의 `motion.Sample` 뒤 최신이며, 그보다 앞선 Update에서 읽으면 직전 프레임 값 |
| `static NativeDruidRigPixelView Current` | 초기화 성공 뒤 현재 뷰, 파기 시 null |
| `static bool TryGetOrbSocketWorldPosition(out Vector3)` | VFX가 새 의존 없이 호출. `Current`가 있고 `HasOrbSocket`이면 true와 위치, 아니면 false와 zero |

rigpixel 플래그(`--boss-render=rigpixel`)가 꺼져 있으면 뷰가 없어 항상 false다.


Mac 전체 인수·7기술별1x 캡처/10초 영상 수집 요청은 [03:00 인계](UNITY_BOSS_ARENA_RB1_7_8_20261103.md#11-04-0300-실제시각-v81-7기술-mac-인계)에 있다. 실제 Unity/Metal RT·원근/크기·타격/예고 경계·실루엣·발/지팡이접지·치마 관통·1x/3x·영상·60fps 판정은 미검증이다. 제작자 조건부 PASS나 숫자/컴파일을 디자인 PASS로 올리지 않는다.
## 10. v9 / v9.1 — 껍질 9부위·페이즈 전환·등장/침강 (2026-11-04, CTO 순회 배정, Blender 서브에이전트, 유료 0)

보드에서 남은 가장 큰 일은 기획서 A안의 5.2m **껍질**이었다(지금까지 Unity에는 노인 코어만 있었다). M1 껍질 메시를 9부위로 나눠 노인 뼈에 붙이고, 페이즈 형태·전환 클립·등장·침강을 만들었다. 기술 VFX는 임펙트 총괄 몫이라 넣지 않았다.

| 항목 | v9.1 값 |
|---|---|
| GLB | `I:/EXODUSER-Storage/boss/oldman-v2-20261104/v9_1/oldman_druid_v9_1.glb` (SHA-256 `d1527e54760ead9f2f778315dadb8a17e362fa7ac441f01f81ef8c432fc35265`), `.blend`, `v9_1_report.json`. 바탕 v9: `.../v9/oldman_druid_v9.glb` (`84256872…`) |
| P3 소품 | `.../v9_1/HuskHeap_P3.glb` (SHA-256 `89fa7b1a132a85d63d0261176ca051b5770105d6014b2ee1385a6b360b0a4855`), 뼈 없는 정적 메시 37,994 tris, 높이 0.67m, 폭 약 6.7×5.2m, 좌표계 = 껍질 원점 |
| 껍질 9부위 | Skull 2,096 · Crown 2,641 · ChestPlate_L 6,491 · ChestPlate_R 6,120 · BackHump 21,967(+탯줄 뿌리 1,236) · RootArm_R 5,461 · Arm_L+지팡이 13,822 · Leg_L 7,003 · Leg_R 7,069 = 73,906 tris. 재질 `druid_husk_bark`·`druid_bone`·`druid_feather`·`druid_glow`, 텍스처 점 0 |
| 리그 | 소켓 `HuskSocket_<부위>` 9 + 뿌리 1. 팔·다리는 강체 대신 스킨(쪼그릴 때 발 뜸·팔 도달 문제). 보조 뼈 `HK_*` 22개(노인 뼈 회전 복사·위치 1.45배·몸통 회전 0.5~0.6배), `HP_*` 6(경첩·숨김), `OM_Lift`(노인 들어올림), `OM_Staff`(노인 지팡이 숨김). **`Hips` 부모 = `OM_Lift`, `StaffSocket_L` 부모 = `OM_Staff`로 바뀜**(월드 위치·31클립 키 그대로). Humanoid 임포트에서 보조 뼈가 살아남는지는 Unity 확인 필요(Generic이면 문제없음) |
| 페이즈 상태 | 1프레임 클립 `state_P1`·`state_P2`·`state_P3`(마스크 레이어나 SetActive로 사용). P1 = 닫힌 껍질, 노인 숨김. P2 = 가슴 판 135° 열림·30cm 내림, 두개골 -35°·왕관 -30° 뒤로 젖힘, 노인 +1.40m(가슴 틈이 껍질 틈보다 0.3m 위). P3 = 껍질 계층 숨김 + `HuskHeap_P3` 배치, 노인 단독(껍질 원점에서 정면 -y로 2.7m 앞). BodyScale(1/.85/.70)은 GLB에 없음 — Unity 루트에서 적용 |
| 새 클립(60fps) | `intro_reveal` 165f(바닥에서 솟아 크기 공개, 왕관 펼침, f130 가슴 틈 점등, 끝 P1 idle) · `phase12_collapse` 120f(끝 P2) · `phase23_collapse` 120f(껍질이 낮게 무너지고 노인이 걸어 나옴, f108에 껍질 끄고 더미 배치, 끝 = v8.2 `idle` 첫 자세) · `death_sink` 150f(P3 기준: 노인이 더미 쪽으로 다가가 웅크리고 3.3m 가라앉음, 더미 가라앉기는 Unity가 소품 이동). 기존 31클립 이름·길이 그대로(재임포트 38액션) |
| 수치 | 발 고정 클립 껍질 발 가로 이동 ≤0.08cm. 걷기 껍질 발 3.18m/s(노인 2.11m/s의 1.5배 — Core 걷기 속도 조정 때 참고), `charge_run` 루트 3.69m. `phase23_collapse` 껍질 발 끌림 40.7cm |

**판정(34° 1x, Blender EEVEE 4단 셀 근사, 제작자)**
- **P1: 조건부 PASS.** 사슴 두개골·뿔·덩치가 위에서 크게 읽힌다(첫 보스 크기 공개).
- **P2: RETOUCH(조건부).** v9 → v9.1에서 노인이 보이는 화면 픽셀이 1,726 → 3,223(보스의 4.6% → 7.4%, 가리지 않을 때의 60%)으로 늘었다. 하지만 노인이 껍질과 비슷한 어두운 팔레트라 위에서는 여전히 작고 어둡다. → Unity rig-pixel 팔레트에서 노인 가면 뼈색·가슴 틈 발광 대비로 먼저 확인하고, 부족하면 가슴 판을 더 젖히고 두개골 턱을 깎는다.
- **P3: 구조 PASS, 크기 FAIL.** 껍질이 뿔 달린 낮은 더미가 되고 노인이 앞에 혼자 서며, 더미가 노인을 가리는 픽셀은 0이다. 그러나 BodyScale .70을 노인 표시에도 적용하면 노인이 영웅의 1.05배(113px vs 108px)로 너무 작다. **결정(총괄)**: P3 노인의 **표시 크기는 영웅 × 2.0**으로 한다. Core 판정 크기(BodyScale·반경)는 바꾸지 않고, Unity 뷰 스케일만 키운다(약 2.62u, 노인 모델 2.82m 기준 표시 배율 약 0.93).
- 남은 결함: 슬램 때 껍질 팔이 노인보다 길어 두 손 지팡이 접촉이 깨진다. 슬램 발동에서 뿔이 몸통 높이까지 내려온다. P2·P3 노인-껍질 근접 정점 221~1,655(P2)가 있다. 지팡이 밑동 뿌리는 M1 원형 그대로다.
- Unity 연결(보스 아레나 레인) 할 일: v8.2 → v9.1 교체, 페이즈 상태·BodyScale 루트 적용, P3 껍질 계층 끄기와 `HuskHeap_P3` 배치(f108), P3 노인 위치를 껍질 원점에서 2.7m 앞으로, P3 노인 표시 영웅×2.0, `intro_reveal`·`death_sink`를 보스 등장·최종 사망 연출에 연결.

미리보기: `G:/exoduser/tmp/design-review/20261104_boss_1-1_oldman_cleanup/v9_1_phases_3x.png`(P1|P2|P3, 34°+옆), `v9_1_phase23_strip_3x.png`, `v9_1_death_strip_3x.png`, v9 판 `v9_phases_3x.png`·`v9_intro_strip_3x.png`·`v9_skills_p1_3x.png`.

### 10.1 Unity 연결 — v8.2 → v9.1 교체, 상태 레이어, P3 크기 규칙 (11-04, 보스 아레나 레인, Core 변경 0)

**교체·변환.** 입력 두 GLB의 SHA-256 확인: `oldman_druid_v9_1.glb` `d1527e54…c35265`(28,875,148B), `HuskHeap_P3.glb` `89fa7b1a…0a4855`(16,753,388B). 원본 미수정. `unity/Tools/druid-rigpixel/import-oldman.py`를 v9.1용으로 고쳐(무창 Blender 5.2.3 `-b --factory-startup --threads 2`) `Resources/Art/Bosses/Druid/OldmanV91.fbx`(36,123,292B)를 만들고, `OldmanV82.fbx.meta`를 `OldmanV91.fbx.meta`로 이름만 바꿔 GUID `d49820bb…871d`를 유지, `OldmanV82.fbx`는 `git rm`했다. 새 `import-huskheap.py`가 같은 축·단위 설정으로 `HuskHeapP3.fbx`(1,322,844B, 정적 메시 1개, 새 meta GUID `22c76cc8…fe6`, 애니메이션 없음)를 만든다. 바뀐 참조: `NativeDruidRigPixelView`(Resource), `DruidRigPixelVerification`(PathName·계약), `oldman-import.json`, `verify-fbx.py`, `druid-rigpixel-tests`.

| 계약(파일에서 읽은 값, 추정 아님) | 값 |
|---|---|
| 뼈 | **65** = 노인 34(`Hips`는 이제 `OM_Lift`의 자식) + `HK_*` **23**(`HK_Root` 포함, §10의 22는 `HK_Root` 제외 표기) + `HP_*` 6 + `OM_Lift`·`OM_Staff`. `StaffSocket_L` 부모 = `OM_Staff` → `LeftHand` |
| 소켓 | `HuskSocket_*` 빈 노드 10개(뼈 부모). Husk 강체 메시 6개는 소켓 자식, Husk 스킨 메시 4개(`Arm_L`·`Leg_L`·`Leg_R`·`RootArm_R`)는 Armature 자식 |
| 메시 | 14개 렌더러 = 노인 4(`char1`·`FrontPanel`·`Staff_L`·`lantern_orb`, 78,323삼각형 불변) + 껍질 10(73,906삼각형). 재질 12종, `druid_husk_bark` 추가 |
| 클립 | **38**(기존 31 이름·길이 불변 + `state_P1/2/3` 1프레임, `phase12_collapse`/`phase23_collapse` 120f, `intro_reveal` 165f, `death_sink` 150f). 전부 60fps, 65뼈 전 채널에 키 |
| 소켓 복원 | 뼈 부모 객체와 강체 껍질 메시의 휴지 월드 행렬을 GLB에서 복원(임포터 오프셋 124.7(Blender 씬 단위) → 보정 후 소켓 최대 1.8e-5m, 강체 메시 2.9e-7m). §10의 "껍질 메시는 월드 좌표 정점, 노드 월드 = 항등" 구조라 강체 메시도 직접 복원했다 |
| FBX 검사 | `verify-fbx.py` 통과: 클립 38, 정지 발 수평 최대 0.0046cm(허용 0.02cm), 소켓 휴지 오차 9.5e-5m |
| 팔레트 | `druid_husk_bark` = GLB 기본색 `#2a2018`(텍스처 없음, 노인 껍질 `#4a3826`보다 어두움). Mac 1x 판정 대기 |

**상태 레이어(뷰 전용).** 31개 기술 클립은 `OM_Lift`·`OM_Staff`·`HK_Root`·`HP_*`(9뼈)에 P1 상수만 갖고 있다. `NativeDruidRigAnimator`는 생성 때 `state_P1/2/3`을 한 번씩 평가해 이 9뼈의 로컬 값을 저장하고, 기술 클립을 평가한 뒤 현재 목숨의 상태 값으로 덮어쓴다(마스크 API 대신 값 덮어쓰기 — Unity를 못 돌려도 결과가 결정적이다). 목숨 = `d.BossPhase`(0/1/2), 목숨 상태가 없는 웹 페이즈 보스는 `state_P3`(노인 단독). 그리기 부품: P1은 껍질만, P2는 껍질+노인(가슴 틈 안), P3는 노인+힙(껍질 계층 미그림).

| 장면 | 선택 조건(모두 Core를 읽기만 함) | 프레임 |
|---|---|---|
| 기술 | 기존 `NativeDruidRigPolicy.Select` 그대로 | 기존 |
| `phase12_collapse`/`phase23_collapse` | `d.S=="bossDruidRest"`, `d.BossPhase`=0/1. **`d.St2`는 무릎 구간 내내 120 그대로**(목숨 코드가 자기 타이머를 센다)라 경과는 `Simulation.DruidLife(e).Set.CollapseTicks − CollapseTicks` | `120 × 경과 / CollapseTicks` (Core 120틱 = 클립 120f) |
| `intro_reveal` | `StageEventKind.BossIntro`(StageFlow가 보스를 90틱 스턴시키는 순간)를 `NativeGame.StageFlow.cs`가 `druidRig.BeginIntro(TickCount)`로 전달. 90틱 안에 기술 상태가 시작되면 즉시 취소 | `165 × 경과 / 90` |
| `death_sink` | 최종 처치 뒤 기존 침강 일정(`NativeGame.BossSinkDraw`의 `sinkAge`, 몸체 `SinkBodyTicks`=66틱) | `150 × min(1, sinkAge/66)`, 이후 마지막 프레임 유지. 기존 `descent` 하강은 제거(클립이 3.3m 침강을 담음), 힙은 같은 진행으로 `높이×스케일+0.2` 내려감 |
| 그 밖 | `bossDruidRest`인데 3번째 목숨이거나 경과를 모를 때 | `Idle` 유지 |

**껍질 끄기와 힙(f108).** `phase23_collapse`의 f108 이후(또는 P3 정지 상태에서 힙이 아직 없을 때) 껍질 계층 렌더를 빼고 `HuskHeapP3`를 켠다. 힙의 월드 위치·회전·스케일은 **그 순간 모델 루트의 월드 TRS를 한 번 저장**해 고정한다(껍질 원점 = 힙 원점, 이후 보스가 돌아도 힙은 안 움직임). 힙은 모델 계층 밖의 별도 오브젝트이며 같은 Point RT에 그려진다. P3 잠행(`bossDruidUnder`) 동안 노인은 안 그려지지만 힙만 계속 그린다. 다음 장면이 껍질을 다시 켜는 목숨(P1/P2)이나 `intro_reveal`이면 힙을 지운다.

**발 위치(P3 노인 2.7m 앞).** 클립은 `OM_Lift`를 껍질 원점에서 정면 2.7m(측정: 발 중심 y=-2.668m)에 둔다. 뷰가 시작 때 `state_P3`+`Idle@0` 자세에서 **발 중심의 루트 기준 수평 위치(anchorLocal)**를 한 번 재고, P3(및 `death_sink`)에서는 매 프레임 `ground − TransformPoint(anchorLocal × 노인 배율)`의 수평 차이만큼 루트를 옮겨 **노인 발 중심 = Core 보스 위치(d.X/d.Y)**가 되게 한다. `phase23_collapse`에서는 노인이 걸어 나오는 f50–108 동안 같은 보정을 0→1로 부드럽게 올려(스무스스텝) 끝 프레임(f108~120)에서 정확히 Core 위치가 되고, 껍질은 그 사이 Core 쪽에서 뒤로 미끄러져 힙 자리(Core − 2.7m×배율)에 선다. 무릎 구간은 Core가 보스를 못 움직이므로 힙이 이 보정만큼 이동해 보인다(Mac 판정 항목). 기술 클립의 `OM_Lift`는 상수라 기술 중 보정은 정지 상태 그대로다.

#### P3 크기 규칙 — Core 판정 반경에서 계산 (표시 배율 직접 지정 없음)

규칙: **발치 원 반지름(렌더) = Core 판정 반경(월드)**. 뷰는 `루트 스케일 = Core반경(월드) ÷ 모델 발치 반지름`을 목숨마다 계산한다. 하드코딩 상수는 없고, 발치 반지름은 `oldman-import.json`(import-oldman.py가 Blender에서 휴지 자세 정점으로 측정)에서 읽는다.

| 단계 | 값 | 근거(파일:줄) |
|---|---|---|
| 기준 반경 `OrigR` | 보스 `ib`: `22×2×ScaleMul`, 일반 등급 `ScaleMul=1` → **44px** | `Core/EnemyFactory.cs:145`, `Core/EliteTables.cs:25`, 스폰 `Core/Simulation.DruidBoss.cs:38`(`Radius=(float)web.r`), 저장 `Core/Simulation.DruidRemodel.cs:49` |
| BodyScale 적용 | **Core는 반경을 BodyScale로 줄인다**: `e.Radius = Max(10, Round(OrigR×BodyScale[life]))` → 44/37/31px | `Core/Simulation.DruidRemodel.cs:144`, `Core/DruidRemodelData.cs:15`(1/.85/.70). 목숨 전환 때 `d.R=e.Radius`: `Core/DruidBoss.Remodel.cs:131`, `Core/DruidBoss.cs:107,128` |
| px → 월드 | 영웅·적과 같은 `NativeRemodel3D.Point`(`px/100`, 1px=0.01u). 뷰는 `Distance(Point(X+1,Y), Point(X,Y))`로 읽음 | `NativeRemodel3D.cs:22,29` |
| Core 반경(월드) | **0.44 / 0.37 / 0.31** | 위 계산 |
| 모델 발치 반지름 | 껍질(`state_P1`, `Husk_Leg_L/R` 정점 중 발·발끝 가중, 두 `HK_*Foot` 머리 중점 기준 최대 수평 거리): **1.3987m** (발목 간격 0.733m). 노인(`state_P3`, `char1` 발·발끝 가중, 두 `*Foot` 중점): **0.4762m** (발목 간격 0.505m) | `import-oldman.py` 측정 → `oldman-import.json`의 `footprint` |
| **배율** (월드 u ÷ 모델 m) | P1 껍질 0.44/1.3987 = **0.31458**, P2 껍질 0.37/1.3987 = **0.26453**, **P3 노인 0.31/0.4762 = 0.65105** | 계산(검증: `druid-rigpixel-tests`가 콘솔에 출력) |
| 영웅 대비 높이(`HeroIdleWorld`=1.12 기준) | P1 껍질 꼭대기 4.8295m → **1.519m = 영웅 ×1.36**, P2 **1.278m = ×1.14**, **P3 노인 뿔 2.71m → 1.764m = ×1.575**(전체 메시 2.8285m → 1.841m = ×1.64) | 같은 배율 × 측정 높이 |

**플래그.** P3 노인은 영웅 ×1.575(뿔 기준)로 1.6~2.4 범위를 **약간 밑돈다**(메시 전체 높이 기준 1.64×이면 범위 안). Core는 바꾸지 않았고 Core에서 계산한 값을 그대로 구현했다. 더 큰 문제는 **P1/P2**다: 같은 규칙을 껍질에 적용하면 이전 v8.2 표시(영웅×2.8)에서 껍질이 영웅 ×1.36·×1.14로 크게 줄어든다(Core 반경 0.44m는 5m급 껍질의 발치 1.40m에 비해 작음). CTO가 정한 규칙대로 구현했고, 크기를 키우려면 Core 반경(BodyScale·OrigR) 또는 규칙을 총괄이 정해야 한다. 영웅의 실제 모델 높이(`HeroModelWorld`)가 1.12가 아니면 위 비율은 그만큼 달라진다.

전환 스케일: 루트 스케일은 껍질 기준(P1/P2 값)이고 노인은 그 위에 `OM_Lift`의 스케일·위치를 배수(`노인배율 ÷ 껍질배율`)로 더 키운다(P2는 1배 = 껍질 안 원래 비율, 위치도 같이 곱해 몸 길이 단위로 2.7m 유지). `phase12_collapse`는 루트 배율을 P1→P2로, `phase23_collapse`는 노인 배수를 f40–108 동안 1→0.65105/0.26453=2.461로 올린다(P3 정지 때는 0.65105/(0.31/1.3987)=2.938). 껍질·힙은 전환 중 크기가 변하지 않는다. 노인이 껍질 안에서 나오며 2.5배로 커져 보이는 것은 이 규칙의 결과이며 Mac 판정 항목이다. 접촉 그림자는 `2.73×R, 1.59×R`(이전 `1.2×.7`÷44px 비율 유지, R=Core 반경 월드).

영수증(`druid-rigpixel.json`, `arena-review` 프레임의 `bossRig`)에 추가: `life`·`overlay`·`drawnParts`·`heapPlaced`·`coreRadiusPx`·`coreRadiusWorld`·`rootScale`·`oldManFactor`·`anchorWeight`·`footprintRadiusWorld`·`bodyHeightWorld`·`bodyHeightHeroRatio`·`ankleSpanWorld`(렌더된 발목 간격)·`heroIdleWorld`. 판정은 `footprintRadiusWorld == coreRadiusWorld`(0.0005 안)를 확인한 뒤 화면에서 발치 원과 비교한다.

#### 11-04 CTO 결정 (a) — Core 반경을 설계 크기로 키움 (위 표의 44/37/31과 플래그 문단을 대체)

규칙은 그대로다(발치 원 반지름 = Core 반경). 바뀐 것은 Core 반경 자체다: `DruidRemodelData.LifeRadiusPx`(`DruidRemodelData.cs:19`, 11-04 재계산 뒤 아래 표의 130 / 111 / 57; 처음엔 91 / 77 / 39)가 `Round(OrigR×BodyScale)` 대신 적용된다(`BossRemodelSet.RadiusFor`, `Simulation.DruidRemodel.cs:50`·`:145`). 뷰 `NativeDruidRigPixelView.RadiusPx`도 같은 함수를 부른다(하드코딩 없음). 목표: P1 영웅 2.8배(G0 §6), P2 = P1×.85(G0에 P2 배수 없음), P3 ≈ 2.0배. 반경→월드→배율이 선형이라 측정 발치로 계산했다.

| 목숨 | Core 반경 px (이전) | 월드 u | 모델 배율 | 영웅 높이 배수, 기준 영웅 키 1.609u (이전) | 목표 |
|---|---|---|---|---|---|
| P1 껍질 | **130** (91 ← 44) | 1.30 | 0.9294 | **×2.789** (1.12u 기준 계산은 2.805, 화면 1.95) | 2.8 |
| P2 껍질 | **111** (77 ← 37) | 1.11 | 0.7936 | **×2.381** (화면 1.65) | 2.38 |
| P3 노인(뿔 끝) | **57** (39 ← 31) | 0.57 | 1.1971 | **×2.016** | 2.0 |

검증: `druid-rigpixel-tests`가 반경 130/111/57과 배수 ±0.05(영웅 1.6094975u 기준)를 검사하고 콘솔에 `hero multiples P1=2.7889 P2=2.3813 P3 horn=2.0156`, `scale P1=0.9294 P2=0.7936 P3 oldman=1.1971`을 낸다. 전환 배수(`phase23_collapse` 노인 배수)는 뷰가 `노인배율 ÷ 껍질배율`로 계산하므로 P2→P3 전환 `0.8191/0.5505 = 1.488`(이전 2.461)로 줄고, P3 정지는 `0.8191/(0.39/1.3987) = 2.938`로 그대로다(껍질·노인이 같은 비율로 커짐). 노인이 껍질에서 나오며 커 보이는 정도가 줄어든다(Mac 판정). 몸 크기에 걸린 거리와 몸 분리는 보스 보드 §8.5.5 표.

#### 캡처 단계 — 공격이 몸 가장자리에 맞는 장면, P1·P2·P3 (실행 안 함; 11-04에 P3 전용에서 확장)

`--unity-boss-arena-p3-edge`(새 인자, `--unity-boss-arena-review`와 함께). 3번째 목숨(`BossPhase==2`, 무릎 아님)에서 봇이 **몸 원이 보스 몸 원 가장자리에 닿는 자리**(중심 거리 = 보스 반경 + 플레이어 반경 + 4px)에 서서 보스 중심을 계속 공격한다. 보스 HP가 줄고 중심 거리가 `반경합 + 40px` 안이면 `p3-edge-hit-1..3`(최대 3장, 60틱 간격) PNG+JSON을 `arena-review/`에 저장하고 `moves.jsonl`에 `kind:"p3-edge-hit"` 줄을 쓴다(`hpBefore/After`, `bossRadiusPx`, `playerRadiusPx`, `centreDistancePx`, `gapPx`, 두 좌표). JSON의 `bossRig`에 위 발치 영수증이 같이 들어간다. 실행 예(Mac):

```
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --unity-boss-direct 0 --boss-render=rigpixel --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-p3-edge --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 3 -output "<출력>"
```

판정 기준: 타격 순간 화면에서 몸통·발치 가장자리가 공격 판정 가장자리와 같은 자리인지 1x/3x 크롭으로 본다(발치 원 = 보스 반경). 이 단계는 입력 봇만 바꾸며 Core 수치·판정은 바꾸지 않는다.

**11-04 확장 — 세 목숨 모두.** 새 인자 `--unity-boss-arena-edge[=1,2,3]`(`--unity-boss-arena-review`와 함께)가 같은 단계를 P1·P2·P3에 적용한다. 값 없이 쓰면 세 목숨 전부, `=1,3`처럼 쓰면 지정한 목숨(1 기반)만이다. 옛 `--unity-boss-arena-p3-edge`는 3번째 목숨만으로 계속 동작한다. 목숨마다 봇이 몸 원 가장자리(간격 4px)에 서서 중심을 공격하고, 가장자리 띠(합 반경+40px) 안에서 보스 HP가 줄면 `edge-p<목숨>-hit-1..3`(목숨당 최대 3장, 60틱 간격) PNG+JSON을 `arena-review/`에 저장하며 `moves.jsonl`에 `kind:"edge-hit"` 줄(`life`, `hpBefore/After`, `bossRadiusPx`, `playerRadiusPx`, `centreDistancePx`, `gapPx`, 두 좌표)을 쓴다. 목숨당 3장이 차면 그 목숨의 가장자리 서기는 끝나고 기술 커버리지 입력으로 돌아간다. 이제 몸 분리(보스 보드 §8.5.5)로 플레이어는 합 반경 안쪽으로 들어가지 못하므로 봇이 중심에 붙지 않는다. 실행 예(Mac, 세 목숨 전부; P3 전용 줄에서 `--unity-boss-arena-p3-edge`만 바꾼다):

```
"<Mac Player 실행경로>" --remodel3d --unity-druid-remodel --unity-boss-direct 0 --boss-render=rigpixel --unity-fullrun-qa --unity-boss-arena-review --unity-boss-arena-edge --unity-mute -nosound --unity-qa-sandbox "<QA 루트>/profile-1920" -screen-fullscreen 0 -screen-width 1920 -screen-height 1080 -qa-width 1920 -qa-max-ticks 36000 -qa-retries 3 -output "<출력>"
```

판정: 목숨마다 1x/3x 크롭에서 발치 원 = 공격이 닿는 가장자리인지, P1 껍질이 영웅 ×2.8로 읽히는지(`bossRig.coreRadiusPx` 91/77/39, `bodyHeightHeroRatio`). 검증은 PC에서 `druid-remodel-test`(`RadiusChecks.cs`: 반경·가장자리 타격·몸 분리·잠행 여유·거리 표)와 `druid-rigpixel-tests`(인자 해석·배수)로 끝냈고 Player 실행은 하지 않았다.

**검사 결과(PC, Unity·Player·빌드 실행 0).** 정책 테스트(임시 csproj) 5,435검사/실패 0(상태 레이어·붕괴·인트로·사망·팔레트·반경 44/37/31 포함). Blender FBX 수치 검사 통과. 전체 PC Roslyn(`compile-check.ps1` 기본 인자) 5어셈블리 오류 0. **한계(미검증)**: Unity 임포트(Generic Avatar·클립 38·소켓 구조·힙 단일 렌더러), 값 덮어쓰기 레이어가 실제 Animator 평가 뒤에도 유지되는지, 전환 중 스케일·미끄러짐·힙 고정의 화면, 껍질 팔레트·노인 가시성(P2 RETOUCH 조건), 잠행 중 힙 단독 그리기, 4단 셀 1x 판정은 모두 Mac 판정 대기다. `Humanoid` 임포트에서 `HK_*` 보조 뼈가 살아남는지는 Generic을 유지해 해당 없음.

**연속 프레임 캡처 `--unity-boss-arena-seq` (11-04, QA 인자, Core·봇 밖 동작 변경 0).** `--unity-boss-arena-review`와 함께 줄 때만 켜지며 인자가 없으면 기존 경로와 같다. 출력은 `arena-review/seq-<이름>/f<6자리 프레임>.png`(가로 960, 쌍선형 1회 축소만, 잡티·디더 추가 없음)와 같은 폴더 `frames.jsonl`(프레임마다 기존 ArenaReviewFrame 행 + `seq`·`seqIndex`와 아래 추가 필드). 캡처 프레임은 기존처럼 `fullRunCaptureActivity`로 clean timing에서 제외한다. 보스 보드 §8.5.6 위험 2·3·4용이다.

| 이름 | 구간 | 추가 필드 |
|---|---|---|
| `collapse` | P2→P3 무릎(`life.Collapsing`, `BossPhase==1`) 시작 10프레임 전 ~ 끝 30프레임 뒤, 최대 360프레임. 사전 10프레임은 P2에서 목숨 HP가 40% 이하일 때부터 링 버퍼(24칸)에 둔 것을 시작 시점에 내보낸다 | `shellScale`(rootScale)·`oldManScale`(oldManFactor)·`bossScreenHeightPx`(projectedBoundsHeightPx) |
| `erupt-1..3` | 솟기 판정 틱(`burrowStrike` actual-activation) 20틱 전 ~ 40틱 뒤 매 프레임, 최대 3회. 사전 구간은 잠행 상태(`bossDruidDive/Under/Erupt`)의 링 버퍼 | `pillarCentreDistancePx`(`Simulation.DruidPillars` 중 보스에서 가장 가까운 기둥 중심 거리)·`pillarRadiusPx`(그 기둥의 `R`, Core 값)·`bossRadiusPx`·`gapPx = 거리 − 기둥 R − 보스 반경` |
| `contact` | P1에서 봇이 보스 몸 띠(중심 거리 ≤ 보스 반경 + 플레이어 반경 + 40)에 처음 들어온 프레임부터 600프레임. 이 구간 봇 입력만 "공격 2초(120틱) → 보스 중심 방향 구르기(12틱 구간, 스페이스 2틱 + 방향) → 공격 1초(60틱) → 보스 중심 방향 대시(15틱, 왼쪽 Shift 유지) → 반복"으로 바뀐다(`NativeArenaReviewPolicy.ContactAt`) | `playerX/Y`·`moveDx/Dy`(직전 틱 대비 이동)·`separationApproxPx`·`centreDistancePx`·`rolling`·`dashing`·`contactStep` |

몸 분리(`RemodelSeparatePlayer`)가 민 거리는 Core가 private이라 읽을 수 없어 근사한다: 입력이 보스 쪽을 향한 틱에서 구르기·대시 중이 아닐 때 중심 거리가 늘어난 양(`separationScope` 필드에 같은 설명). 모든 seq 행에 위 필드가 같이 들어간다(해당 없는 값은 현재 프레임의 실측 또는 0). 인자 해석·접촉 봇 순서는 `druid-rigpixel-tests`에 5건(`SeqRequested`·`ContactAt`).

### 10.2 아레나 리그 픽셀 결함 수정 — RT 초과 영구 폴백, 크기 원인, 가독성 (11-04, Core 변경 0)

**결함 A 원인.** 통합 미리보기 5차 `phase23_collapse`에서 화면 박스 `projectedBoundsHeightPx` 1,069 → `TextureSize` 상한 1,024 초과 → 0 → `Druid exceeds safe RT canvas` 예외 → `Fail()` → 옛 2D 영구 대체. 박스가 큰 이유: 스킨드 메시의 `Renderer.bounds`는 임포트 때 모든 클립(38개, `death_sink` 3.3m 침강·붕괴 포함)에서 구한 localBounds를 쓰므로 현재 포즈의 몸보다 훨씬 크다. 뷰가 이 bounds 8모서리를 화면에 투영해 캔버스를 정했다.

| 수정 | 내용 |
|---|---|
| bounds(1순위) | `TightBounds`: 스킨드 부품 bounds를 "현재 뼈 위치 상자 + 여유 0.9m×단위×루트배율×2"와 교집합. 강체 껍질 메시는 자기 bounds 그대로. 교집합이 비면 뼈 상자. 항상 이전보다 작거나 같다. 실제 PNG에서 잘림 여부는 Mac 판정 |
| RT 상한 | 드루이드 전용 `NativeRigPixelPolicy.DruidMaxRt=2048`. 영웅·적은 기존 `TextureSize(…)`(상한 1,024) 그대로 |
| 초과 처리 | `DruidCanvas`: 상자가 2048 안에 들 때까지 텍셀 배율을 ×2씩 올림(그 프레임만, 다음 프레임은 기본 배율로 재계산). 유한한 상자는 항상 크기>0, 예외·`Fail` 없음. 영구 `Fail`은 모델 로드·애니메이터 오류에만 남음 |

**결함 B 원인(수정 없음, CTO 확정).** `rootScale = Core반경(월드) ÷ 발치반경(모델)` 규칙(§10.1 "P3 크기 규칙")이 만든 값이다: P1 반경 0.91 → rootScale 0.5772, P2 0.77 → 0.4884. 하드코딩·클램프·1.31 기준값은 없다. 발치 원 = 판정 원이 지켜지는 대신 모델의 높이/발치 비율(껍질 높이 ÷ 발치 반경 ≈ 3.45)이 고정이라 영웅 실측 높이(`heroIdleWorld` 1.6095) 대비는 P1 3.1422/1.6095 = **1.952**, P2 2.6588/1.6095 = **1.652**다(설계 2.805/2.374는 모델 배율 0.6506/0.5505·영웅 1.31u 기준 표). 총괄 확정에 따라 "발밑 = 판정" 원칙을 유지하고 배율·Core 반경(91/77/39)은 바꾸지 않았다. 설계 배수까지 키우려면 발치 반경(모델) 또는 Core 반경을 바꿔야 하며 이는 별도 결정이다. 영수증 `bodyHeightHeroRatio`는 `NativeDruidRigPolicy.HeroRatio`로 계산한다.

**11-04 반경 재계산(CTO 승인).** 결함 B의 "설계 배수까지 키우려면 Core 반경을 바꿔야 한다"를 적용했다: 기준 영웅 키를 실측 1.609u(`edge-p1-hit-1.json` `bossRig.heroIdleWorld` 1.6094975, 같은 프레임 `heroGpuSilhouetteHeightPx` 106)로 바꾸고 `LifeRadiusPx` 91/77/39 → **130/111/57**(영웅 대비 2.79 / 2.38 / 2.02배, 위 §10.1 표). 뷰 코드는 바꾸지 않았다(`RadiusPx`가 같은 함수를 부르므로 rootScale = 1.30/1.3987 = 0.9294, 0.7936, 노인 0.57/0.4762 = 1.1971로 자동 계산). 브리프의 P3 48은 같은 식에서 1.70배라 57로 계산했다.

**가독성(C).** 셀 4단계·디더·노이즈·그레인 없음.

| 항목 | 이전 | 이후 |
|---|---|---|
| 달빛 림(`_RimColor` 곱, 뷰) | 0.08 | 0.26 (`RimStrength`) |
| 환경광 하한(`DruidRigPixelToon`) | (0.24, 0.25, 0.28) | (0.38, 0.39, 0.43) |
| 최종 색 하한(평면 상수) | 없음 | (0.05, 0.048, 0.055) |

공유 합성 셰이더(`RigPixelComposite`)는 영웅·적과 같아 바꾸지 않았다. 껍질 팔레트 `#2a2018`이 어두워 효과는 Mac 1x 판정 대상.

**검사.** `druid-rigpixel-tests`에 `DruidCanvas` 1,069px·4,000px·30,000px(텍셀3)·작은 상자(텍셀 유지)·잘못된 입력·기존 상한 유지, 영웅 실측 배수(1.952/1.652) 케이스를 추가했다.

## 10.3 아레나 바닥·조명(디자인 RETOUCH B1·B2·B3·B7·B9)

디자인총괄 5차 판정(B1 바닥 톤 Y 118, B2 격자, B3 조명, B7 기둥, B9 발밑 데칼)에 대한 표현 수정이다. Core 수치·판정(기둥 위치·반경 포함)과 카메라(피치·거리·FOV)는 바꾸지 않았다. 컴파일과 화면 판정은 미확인(공용 실행기 HALT 파일 존재, Player 실행 금지)이며 Mac 1x 판정 대상이다.

| 항목 | 파일 | 전 | 후 |
|---|---|---|---|
| B1 바닥 알베도 | `Resources/Arena8b/Ground.shader` | 고정 곱 (1.10,1.03,0.91), 채도 유지 | `_Tint` (0.66,0.56,0.50), `_Sat` 0.62(휘도 쪽으로 38% 탈채도). 목표 Y 70~80, 채도 .30 이하 |
| B2 반복 무늬 | 같은 셰이더 | 타일 대비 그대로 | `_Flat` 0.45: 타일 평균색(밉 9)으로 대비를 45% 당김. 점·디더·그레인 추가 없음 |
| B3 직사광 | `NativeArena3DView.Materials.cs` `ApplyArenaLighting` | 필드 값 그대로 | 아레나 진입 시 방향광 세기 ×0.65, 피치 48°(필드 값 저장·퇴장 시 복원) |
| B3 환경광 | 같은 곳 | A2 환경광(sky .26/.28/.30, equator .20/.19/.16, ground .075/.065/.05) | 세 색 ×0.80, 퇴장 시 복원 |
| B3 횃불 | `NativeArena3DPlan.Torches`, `CreateTorches` | 2개, 색 (1,.60,.28), 세기 5, 반경 4.7, 소프트 그림자 | 4개(기존 대각 쌍 + 맞은편 쌍), 색 (1,.55,.24), 세기 5.5, 반경 4.0, 그림자 없음 |
| B7 기둥 | `NativeArena3DView.cs`, `.Materials.cs` | 그루터기 1개(원뿔로 읽힘), 접지 처리 없음 | 같은 1-1 RF3 그루터기 에셋으로 낮은 뿌리 4개를 밑동에 퍼뜨림, 밑동 AO 스프라이트(지름 = Core 반경 ×2 ×1.9, 불투명도 .78). 뿌리는 기존 가림 투명화(`NativeArenaOcclusion`) 대상 |
| B9 발밑 데칼 | `NativeSkillView.cs` | 가시덫 .43±.04, 회복영역 .52±.12(링 .64+) | 보스 텔레그래프(`RemodelTelegraphs`)가 하나라도 살아 있으면 두 존의 불투명도 ×0.5(0.15초에 걸쳐 전환), 가시덫 최대 약 .24 |

미해결·메모: 기둥이 영웅이 아니라 보스 앞을 가리는 경우의 가림 투명화는 `NativeArenaOcclusion`이 영웅 위치 하나만 받아 이번에 확장하지 않았다(`NativeGame.Remodel3D.cs` 호출부 변경 필요, 이 브리프 범위 밖). 바닥 휘도·표준편차 실측은 Mac 캡처 필요.

### 10.4 보스 실루엣·막·진입(디자인 RETOUCH B4·B5·B6·B8) (11-04, Core 변경 0)

대상 파일: `DruidRigPixelToon.shader`, `NativeDruidRigPolicy.cs`, `NativeDruidRigPixelView.cs`, `NativeArenaReviewPolicy.cs`, `NativeGame.BossArenaReview.cs`, `druid-rigpixel-tests/Program.cs`. 컴파일(Unity)은 HALT 파일 때문에 미확인, 화면은 미재촬영(Mac 필요).

| # | 원인(확인 범위) | 바꾼 값 |
|---|---|---|
| B4 | 5차 캡처의 `druid-rigpixel.json`은 `failed:true`(RT 초과 폴백, 5942f98c5가 고침)라 대기 컷은 폴백 스프라이트였고, `move-charge-active`는 리그 픽셀이었다. 합성 셰이더 림(`RimStrength` .26)은 **달 방향 한쪽 외곽에만** 켜지고(`RigPixelComposite.shader`, 영웅·적 공유라 미수정) 셀 조명은 달·점광에만 의존해, 돌진처럼 몸이 달과 반대로 기울면 머리·뿔·두개골이 가장 어두운 셀에 몰린다. 몸이 숙여 뿔이 몸에 겹치는지는 클립 확인이 필요해 미확인 | 드루이드 셰이더에 카메라 쪽 차가운 채움광 `(.20,.215,.25)*(.35+.65*Band(n·v))`(같은 4단 셀), 시선 기준 외곽 림 `(.30,.37,.46)`을 2단(fresnel 1-n·v ≥ .55 → .55, ≥ .78 → +.45)으로 모든 자세에 추가. 달 림(.26)은 그대로. 셀 4단 유지 |
| B5 | 발광 `druid_glow`·`lantern_orb`는 리그 픽셀에서 이미 비조명 단색이다. 5차 캡처의 연두는 폴백 스프라이트 몸통의 그림이다(이번 범위 밖 에셋). 호박색 #d49a5c는 S .566이라 합격선(.40)을 넘었다 | 발광 #d49a5c RGB(212,154,92) S .566 → **#b2b57c RGB(178,181,124) HSV(63°, S .315, V .71)**(시든 올리브), 팔레트 기본색 #a8642a → #7b7d52 RGB(123,125,82) S .344. 심장 박동 `ChestPulse`(.6~1.0)는 그대로 |
| B6 | 가라앉기 시작 캡처의 흰 반투명 구체·섬광은 가라앉기 코드(`NativeGame.BossView.cs`, `NativeDruidBody.DrawSink`: 몸통 스프라이트·구멍 디스크·가산 glow .84)에도 보스 리그 뷰에도 없다. 구체를 그리는 코드를 찾지 못했고(Runtime에 구체 메시 없음, 영웅 악의오브 추출·베기 연출로 추정) 이번에 고치지 않았다. 피해 숫자는 캡처에서 이미 막 위에 있었다 | 변경 없음. 막 불투명도 .35 이하는 미달성·미확인(발생 원인 파일 확정 후 처리) |
| B8 | `transition-entry-visible`는 `ArenaActive`가 켜지는 프레임, 곧 Core `LoadPhase` 2의 첫 틱(`LoadT=0`, 로딩 그림 알파 `LoadT/35`=0)이라 순흑이다. 실제 연출은 LoadPhase 1(50틱 페이드)→2(130틱 검정 위 로딩 그림, 그림 알파 35틱 상승)→3→4(Core 타이밍, 미수정). 순흑은 전환 직전 몇 틱과 LoadPhase 2 첫 몇 틱뿐이다(촬영 시점 문제, 실측은 아래 seq-entry) | 연출 변경 없음. 순흑 판정용 `seq-entry` 프레임마다 960폭 평균 Y(`meanY`)를 기록하고 `review.json`에 가장 긴 순흑(Y<.5) 프레임 수·초를 적는다(합격 `entryBlackWithinHalfSecond` ≤ 0.5초) |

#### 새 QA 캡처 (`--unity-boss-arena-review --unity-boss-arena-seq`일 때만, 인자 없으면 기존 경로·review.json 동일)

| 이름 | 내용 |
|---|---|
| `seq-entry` | LoadPhase 0→1(필드 페이드 시작, 아레나 밖)부터 300프레임, 가로 960, `frames.jsonl`에 `meanY` |
| `seq-exit` | `InArena`가 꺼지는 프레임부터 300프레임(스테이지 클리어 뒤 24프레임 링 사전 기록 포함) |
| `bullet-cut.png/.json` | 보스 경고·살아 있는 장판(아레나 전체 펄스 제외)이 영웅 쪽을 향하거나 닿는 첫 틱, 1920 원본. 판정은 `NativeArenaReviewPolicy.TeleTowardHero`(Core 텔레그래프 읽기 전용; Core에는 보스 탄 목록이 없다) |
| `far-enemy-cut.png/.json` | 보스 아님·생존 적이 화면 위 1/3에 있는 첫 프레임. 아레나에 적이 없으면 `review.json`의 `farEnemyCut`="none-in-arena"(적은 있었으나 위 1/3에 없으면 "no-top-third-frame") |

검증: `druid-rigpixel-tests` 5,488 검사 실패 0(발광 S ≤ .40, 진입·퇴장 창 정확히 300프레임, 순흑 연속, 컷 판정 포함), `druid-remodel-test` 99,429 검사 실패 0. 셰이더·뷰·리뷰 캡처 코드의 Unity 컴파일은 HALT로 미확인.
- 기둥 가림 투명화(B7): 영웅·보스 각각 카메라→대상(영웅 +0.9, 보스 +1.4) 선분이 기둥 경계(여백 0.3)와 교차하면 판정하고 둘 중 하나라도 가리면 투명화한다. 목표 알파·전환 시간(0.2초, 유지 0.12초)·카메라는 그대로이고, 셰이더 마스크는 영웅·보스 타원(`_ArenaBattleBoss`)의 max다. 컴파일 미확인(HALT).

### 10.5 적 리그 픽셀 RT 상한(enemy-rt-fallback)

2026-11-04. 기준 `origin/codex/unity-boss-arena-20261103 @13064048f`. §10.2의 "적은 기존 1,024 상한"은 그때의 이력이며, 이 절부터 적은 아래 전용 정책을 쓴다. 영웅 `TextureSize`, 드루이드 `DruidCanvas`·`DruidMaxRt`의 동작은 바꾸지 않았다.

**원인과 측정 한계.** 통합 미리보기 5차 `player-f6cf1d8e.log` 74·75행의 적 id 3·7이 `Model exceeds safe RT canvas`로 영구 2D 대체됐다. 같은 로그 76행의 `FULLRUN.nearby`와 `enemy_rig_models.json`을 대조하면 id 3은 type 29 `Enemies3D/Warden`(기준 키 1.84u), id 7은 type 9 `Enemies3D/RitualApostle`(1.27u)다. 전체 클립 범위를 포함하는 스킨드 bounds를 화면에 투영한 뒤 여유 4텍셀을 더한 정사각 캔버스가 1,024px를 넘으면 기존 `TextureSize`가 0을 반환했고, Render 예외가 `failedIds`에 들어가 같은 적을 계속 2D로 남겼다. 로그와 기존 `enemy3d-render.json`(`fallbacks:2`, 종료 시 `entries:[]`)에는 두 적의 박스 px가 없어 **정확한 너비·높이는 미확인**이다. 두 적 bounds가 현재 포즈보다 얼마나 부풀었는지도 기존 수치가 없어 미확인이다. 1,069px는 §10.2의 드루이드 실측이며 이 두 적의 실측으로 쓰지 않는다.

| 항목 | 변경 |
|---|---|
| bounds | 적 생성 시 스킨드 뼈 배열을 한 번 캐시. 매 샘플에서 각 스킨드 bounds와 현재 뼈 위치 상자(+각 방향 기준 키의 25% × 루트 최대 절대배율)의 교집합. 강체 무기·소품, 뼈가 없는 스킨, 빈 교집합은 기존 bounds 유지. 모델 배율·지면 위치는 그대로 |
| 크기 정책 | 적 전용 `EnemyMaxRt=2048`, `EnemyTextureSize(wpp,baseTexelScale,boxPixels,out float texelScale)`. `ceil((boxPixels/texelScale+4)/32)*32`, 최소 64·최대 2048, 32 배수 |
| 초과 | 매 프레임 기본 텍셀 배율에서 시작해 맞을 때까지 ×2. 월드 단위가 상쇄된 식을 double로 계산하고 배율을 float로 반환해 유한한 float 박스에서도 곱셈·int 배율 넘침 없이 크기 > 0. 크기 초과로 예외·영구 폴백하는 경로 제거 |
| 위치·화질 | 기존 모델 키/반경 배율, `SnapAnchor` 발밑, 캡처·합성 캔버스의 `size*wpp*texel` 식 유지. 큰 캔버스만 텍셀을 키우고 다음 작은 프레임은 기본값으로 복귀. Point·ARGB32 Linear·AA1·밉 없음 유지 |
| 실제 오류 | 모델 로드·애니메이터·URP 요청 오류 및 잘못된 투영 입력의 기존 폴백은 유지. Core·카메라·드루이드 뷰·셰이더 변경 0 |

**정책 검사 1회.** `druid-rigpixel-tests/Program.cs` 총 **5,531 검사 / 실패 0**, 적 전용 **43 검사**. (박스px, 기본텍셀) → (RTpx, 적용텍셀): (1,069,1)→(1,088,1), (4,000,1)→(2,016,2), (30,000,3)→(1,280,24), (500,1)→(512,1), (500,3)→(192,3), (2,044,1)→(2,048,1), (2,045,1)→(1,056,2). 다음 프레임 텍셀1 복귀·0/음수/NaN/±Infinity 입력 거부·float 최소/최대 범위·기존 영웅/드루이드 정책 유지 포함. 임시 csproj는 작업본 밖에서 실행했고 리포에는 넣지 않는다. 기존 Core 미사용 변수 경고 CS0219 2건·SDK 워크로드 확인 안내가 있었으며 테스트 종료 0이다.

**에디터 컴파일:** 컴파일 미확인(공용 실행기 20분 순번 대기 초과: EXO_QUEUE_WAIT owner=claude-quit-fix, 종료 1, Unity 시작 0회). 요청 1회, 재시도 0회. 자기 예약 반환 완료. Player·빌드 실행 0. **화면 판정 미확인:** 보스전 총괄의 같은 통합 빌드/Mac에서 id 3·7 및 가까운 큰 적의 3D 유지, 머리·무기·망토 잘림 0, 화면 크기·발밑, 먼 적 가독성, 2,048 RT 메모리를 확인해야 한다.

### 10.7 boss-fix-b: 아레나 실조명 Editor 촬영·바닥 후보 인자 (2026-11-05)

기준 HEAD `7445707be`. 최신 사용자 지시로 Unity·Player·공용 실행기 실행과 commit·push를 하지 않았다. **컴파일·화면은 미확인(Mac 담당)**. 후보 숫자는 Mac 측정 뒤 CTO가 정하며, 런타임 바닥·조명 기본값은 그대로다. DruidRigPixelToon.shader·실루엣·드루이드 색·Core·카메라는 수정하지 않았다.

기존 캡처 JSON에서 필드 방향광 3.2 → 아레나 2.08, 피치 49° → 48°, 환경광 ×.80을 확인했다. 바닥 셰이더는 실제 환경광을 읽지 않고 상수 (.08,.075,.065)만 더하며 `_Dark=1`이다. 평면 법선의 Lambert는 sin(48°)=.7431이라 피치 1° 차이만으로 BRIEF의 Y 7~11을 설명할 수 없다. 틴트·수광·그림자·톤매핑의 결합이 조사 대상이며, 숲 그림자가 바닥 전체를 덮는지는 미확인이다. BRIEF의 Y 7.5/7.5/9.3·11.1/8.3/9.1은 이전 측정 인용이며 이번 실측이 아니다.

`Ground.shader`에 `_GroundAmbient`(Vector, 기존 선형 상수 그대로), `_GroundShadowFloor=0`, `_LookDiagnostic=0`을 추가했다. 기본 수광식은 이전과 같다. 양수 그림자 하한이나 다른 환경광·톤은 Editor 촬영 인자로 요청할 때만 임시 재질에 적용한다. 런타임 변경은 `NativeArena3DView*.cs`의 소유 객체 해제만 Play=Destroy / Edit=DestroyImmediate로 나눈 것이다.

Mac 메서드: `Exoduser.Editor.BossArenaLookShot.Capture`. 필수 인자 `-output <출력폴더> -fieldReference <material-field-reference.json> -poseReference <move-slam-active.json 또는 move-heartbeat-active.json>`. 입력은 기존 `druid-vfx-candidate/capture-1920/arena-review/`의 JSON 두 개다. 카메라 34°·16.5·46.9453°·1920×1080을 검증하고 `NativeArena3DView` 생성→Prewarm→SetActive→Late의 실제 경로로 숲·재질·아레나 조명 분기·횃불을 만든다. Play 모드에 들어가지 않는다. 후보 인자 없이 기준 `before.png/.json`과 `look.json`만 생성한다.

후보 인자(CTO 지정값만): `-groundAmbient R,G,B`(선형 0~2.4), `-groundShadowFloor 0~1`, `-groundTint R,G,B`(0~1), `-groundSat 0~1`, `-groundFlat 0~1`, `-groundDark 0~1`. 하나라도 있으면 동일 장면·동결한 횃불 상태에서 `after.png/.json`도 쓴다. 선택 인자 `-roi x,y,w,h`는 좌상단 원점의 정규화 영역(기본 .15,.20,.70,.65)이다. 전체·좌·중·우의 가시 바닥 픽셀 수, PNG Rec.601 Y 평균/표준편차, HSV S 평균/최대/.30 초과 비율, 원래 그림자 감쇠 평균/최소/.5 미만 비율·Lambert를 기록한다. 합격 플래그는 없고 CTO 선택 대기 상태를 쓴다. `VerifyMath` 메서드는 같은 측정기의 마스크·좌표·분산·그림자·인자 거부 검사를 포함하며 Capture 시작 때 실행된다. 이 메서드도 PC에서 실행하지 않았다.

한계: 필드 상위 조명은 이전 JSON과 HellLighting 코드 상수로 재생한다. NativeGame의 실제 시작·영웅 부착광/스포트·동적 Core 기둥·배우·VFX·실시간 필드 수면 재질은 재현하지 않는다. 기존 JSON에 없는 방향광 shadowStrength=.55와 bias는 A2Field 코드에서 가져온다. 따라서 이 도구의 기준 컷은 이전 Player PNG의 픽셀 동일 재현이나 Y 합격 증거가 아니다. 그림자/바닥 마스크와 투명 경계도 Mac 검증이 필요하다. Runtime 가림 자원은 Editor 전용 해제 어댑터가 현재 private 멤버를 확인해 정리하며, 별도 소유 파일 NativeArenaOcclusion.cs는 수정하지 않았다. Mac은 전체 리소스·LFS와 URP 17.6/Unity 6000.6.7f1이 갖춰진 작업본에서 무창·무음, GPU 렌더 가능 상태로 실행한다. 남은 일: Editor 컴파일·첫 기준 촬영 → CTO 후보 인자 지정 → Mac 측정 → 실제 같은 빌드에서 영웅·보스·먼 적 가독성, Y 70~80·S≤.30·격자/반복/점 0 판정. 자세한 인계는 레인 `REPORT.md`에 기록한다. CHANGELOG와 커밋은 총괄 담당이다.
