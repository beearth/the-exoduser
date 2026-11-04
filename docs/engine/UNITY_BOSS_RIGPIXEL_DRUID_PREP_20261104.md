# 1-1 드루이드 노인 코어 rig-pixel 준비 — 2026-11-04

상태: Blender 정리본·재질 분할·Blender 근사 미리보기까지 끝났다. Unity 반영과 실제 RT 판정은 0이다. 레인 배정과 Mac 판정 차례는 CTO가 정한다. 기획 근거는 [G0 §26](../8.1보스디자인바이블/BOSS_1-1_FIRST_BOSS_REPLAN_G0_20261103.md), 고정 사양은 [LOCK §17.6·§17.8](../11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md), 영웅 rig-pixel 계약은 [UNITY_RIG_PIXEL_20261103](UNITY_RIG_PIXEL_20261103.md)이다.

## 1. 입력 자산

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

## 4. Unity에서 할 일 (배정 전, 계획)

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
