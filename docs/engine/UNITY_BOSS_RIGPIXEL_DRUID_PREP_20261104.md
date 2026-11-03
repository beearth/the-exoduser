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
