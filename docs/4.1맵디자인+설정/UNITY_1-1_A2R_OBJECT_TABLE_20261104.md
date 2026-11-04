# Unity 1-1 A2R 구역·오브젝트 코드 대조표 (2026-11-04)

기준: `origin/codex/unity-map-a2-20261103`의 **`2c6700fb9654c0df680b6793f0ea8f86a0dade08`**. 이 표는 그 커밋의 읽기 전용 조사다. 다른 레인의 후속 변경·unity/main 병합·사용자 실행본 갱신을 주장하지 않는다. [맵 보드](UNITY_MAP_BOARD_20261026.md)에서 현행 수치 정본으로 연결한다.

각 표의 ID 한 행을 대조 항목 하나로 센다. “일치”는 기존 보드의 현행 유효 정보, “추가”는 보드에 빠졌던 코드 사실, “폐기”는 현행 사양으로 사용할 수 없는 문구다. “런타임 필요”는 마지막 표에 따로 센다. 개수는 원본 입력·생성 후보·실제 생성·실제 표시를 구분한다. 코드·셰이더·JSON·에셋 수정과 Unity 실행은 없다.

## D5 2차 실행 상태 — 검증 미진입 (22:17)

코드 c375c94c71. 공용 순번 대기·10분 휴지 6회 소진, 최종 i18n-merge-fill 앞 순번에서 종료. 실제 Unity 컴파일/빌드 0·Player 0·실제 검사 실패 0/2. 아래 값은 소스 계약이며 화면 합격은 없다. 실제 생성 수·최대 식생/영웅 크기·unity/main 동일 지점 비교·흰 사각형 모두 미확인. SourceMap 정적 예비 계획만 3군락/9개다.

### D5 2차 식생 계약 (Player 판정 대기)

| 대상 | 2차 값 | 관문 |
|---|---|---|
| m_ctree14/20·m_c1cocoon·m_c1spod | 원화/교체 모델·해당 발밑 AO 기본 OFF, D5-off 복귀 | 실제 장면 확인 필요 |
| Withered_Shrub | 기존 A2Module+A2Bramble 3D 잔가지, 활성 메시 높이 .64m/폭≤1.4m, 군락당3개(상한48개), 보행 띠 바깥 .75m, Collider 0 | 실제 모듈 Editor 검사·Player 확인 |
| 흰 사각형 | 실제 Core 추출 이벤트 때 A2R 캡처. 정상 HP·실제 LMB·QA 전용 RNG=0 후 복원, 첫 렌더 프레임 | Player 대기 |

## D5 검증 상태 (2026-11-04)

| 관문 | 확인 사실 | 남은 검증 |
|---|---|---|
| 소스·빌드 | f5f2c3b712 / 공용 caca7ddc / 빌드·C# 오류 0·종료 0·USER_SAVE 0. 실행기 errorLogs=2 별도 | 실제 화면 PASS 아님 |
| 실행기 | 다른 Player PID 14612 종료 불가로 공용 HALT, 실행기 기록에 재부팅·총괄 해제 필요 | D5 Player 0회, HALT 우회 없음 |
| 바람·캠프 | 가중치 6검사 통과, 원화 MossFix 범위 계산 확인 | 평소 2px/돌풍 5px·고목·검은 반원·빨간 별·상자색·보라 점·먼 적·3x 점·단계 ms 전부 미검증 |

## D5 추가 계약 (2026-11-04, 화면 미검증)

| 대상 | D5 처리 | 검증 범위 |
|---|---|---|
| 식생·나무 R 가중치 | max(기존 R, clamp01((루트 높이-min)/(max-min))), 높이 0인 메시 기존값 유지. G/B·지오메트리·D4 진폭 유지 | 경계/중간/기존 큰 R/오프셋/퇴화 높이 6건 통과. 실제 풀 끝 px·고목 움직임 미측정 |
| 캠프 MossFix | 채도 처리 전 G/R .72~.92 및 황록 성분 .08~.20 smoothstep, 회녹(.80,.84,.82)×.85. _MossFix가 있는 카드만 적용 | 원화 범위 검증, Player 색 미검증 |
| --a2r-d5-off | D5 R/색 보정 생략, 기존 D3/D4/바람 끄기 인자는 독립 유지 | 소스 계약 |
| --a2r-wind-debug10 | 생성 완료 후 3D 재질/슬롯 풍량 x10, 진단 전용 | 기본값 변경 아님 |
| --a2r-d5-diagnostic | --a2r-d4-proof와 함께 사용할 때 캠프 AO/hellrot/D3/D4/시야/3D 표시 분리 및 60 실제 프레임 | 생성 조건을 다시 실행하는 CLI-off와 동일하다고 판정하지 않음 |

## 1. 켜기·끄기 및 진단 인자

일반 실행: `--remodel3d` 경로에서 A2 필드가 준비되어야 한다. 현재 `A2R/default-enabled.json` 리소스가 있으므로 A2R은 기본 요청된다. enabled 필드 값이 아니라 **리소스 존재**로 판정한다. 아래 진단 인자는 실행 권장이 아니라 코드 계약 기록이다.

| ID | 판정 | 인자 | 미지정 기본값 | 실제 효과·조건 | 출처 |
|---|---|---|---|---|---|
| F01 | 추가 | `--a2r-off` | 없음: A2R ON | 최상위 A2RSetup 생략. 후보 기본값은 default-enabled 리소스 존재 여부다. | `NativeGame.A2Redesign.cs:14` |
| F02 | 추가 | `--a2r1-light` | 없음 | A2R 명시 요청. --a2r-off가 우선한다. | `NativeGame.A2Redesign.cs:14` |
| F03 | 추가 | `--a2r1-light-capture` | 없음 | A2R 요청 및 원화/조명 캡처 경로. | `NativeGame.A2Redesign.cs:14` |
| F04 | 추가 | `--a2-plan-capture` | 없음 | A2R 요청 및 배치도 캡처 경로. | `NativeGame.A2Redesign.cs:14` |
| F05 | 추가 | `--a2r-3d-off` | 없음: 3D 표시 ON | 교체 3D와 그 자식 Terrain을 숨기고 교체 전 카드를 표시. 모델 생성 자체를 생략하지 않는다. HellRot 필터는 별도다. | `A2RProps3D.cs:45` |
| F06 | 추가 | `--a2r-hellrot-off` | 없음: HellRot ON | 일반 식생/노란 꽃/늪가·덤불 에셋 필터를 해제하고 HellRot 조명 분기를 끈다. D3·D4를 함께 끄지는 않는다. | `A2RClean.cs:10` |
| F07 | 추가 | `--a2r-r18-look` | 없음: Clean ON | Clean OFF: Terrain 자식 비활성, r18 축척/조명 복귀. D2·D3·D4 전체 복귀 스위치가 아니다. | `A2RClean.cs:8` |
| F08 | 추가 | `--a2r-terrain-off` | 없음: Terrain ON | 북쪽 필드 Terrain 호스트/산포/WindZone 생성 생략. | `A2RProps3D.Terrain.cs:10` |
| F09 | 추가 | `--a2r-d3-off` | 없음: D3 ON | Tripo 랜드마크 override·D3 보정·D3 산포·피부 표면 해제. D4는 별도다. | `A2RTerrainSkin.cs:9` |
| F10 | 추가 | `--a2r-terrain-skin-on` | 없음: 피부 표면 OFF | D3 ON 및 skin-off 부재일 때만 피부 Terrain 요청. Terrain/Clean OFF면 표시되지 않는다. | `A2RTerrainSkin.cs:11` |
| F11 | 추가 | `--a2r-terrain-skin-off` | 없음 | skin-on과 함께 주어도 OFF가 우선. 나머지 D3는 유지. | `A2RTerrainSkin.cs:11` |
| F12 | 추가 | `--a2r-d4-off` | 없음: D4 ON | 근경 시체/뼈/살뿌리 override·캠프 MossFix 해제, WindGain 1.5→1. | `NativeGame.A2RD4.cs:9` |
| F13 | 일치 | `--a2r-wind-off` | 없음: 바람 ON | 카드·3D·이끼 바람/접촉 굽힘·맥동 정지. 물 접촉 기록과 물결은 유지. | `A2RNatureDynamics.cs:16` |
| F14 | 추가 | `--a2r-cloud-shadows` | 없음: OFF | 128×128 방향광 쿠키, 크기 35×35m, offset=(t×.012,t×.004). | `A2RLighting.cs:56` |
| F15 | 추가 | `--a2r-air-effects` | 없음: OFF | 자연 효과 ON 상태에서 반딧불/낙엽/늪 실타래 표시. | `A2RNatureDynamics.cs:74` |
| F16 | 추가 | `--a2r-depth-relief` | 없음: OFF | 추가 시각 깊이 릴리프 요청. Core 불변. | `A2RDepthRelief.cs:13` |
| F17 | 추가 | `--a2r-play-sandbox` | 없음: 저장 경로 변경 없음 | 다음 값은 절대 경로 필수. Windows 사람 실행(QA 인자 없음)은 I:/EXODUSER-Storage/map25d/ 하위만 허용. 실패 시 종료 3. | `A2RHumanSave.cs:11` |
| F18 | 추가 | `--a2r-play-smoke` | 없음: OFF | 격리 플레이 스모크. 절대 -output 경로와 NativeQaSandbox.Active 필수, 조건 미달 시 종료 2. | `A2RHumanSave.cs:34` |
| F19 | 추가 | `--a2r-lobby-start` | 없음: OFF | 플레이 스모크에서 필드 준비 후 로비 진입을 기다린다. | `NativeGame.A2RPlay.cs:41` |
| F20 | 추가 | `--a2r-foreground-x` | 3640 (웹 px) | 고정 전경 fixture 희망 X. float 실패 시 기본값, WideLegal 결과는 별도. | `NativeGame.A2Redesign.cs:106` |
| F21 | 추가 | `--a2r-foreground-y` | 7420 (웹 px) | 고정 전경 fixture 희망 Y. 실제 자연 플레이 이동이 아니다. | `NativeGame.A2Redesign.cs:107` |
| F22 | 추가 | `--a2r-td-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F23 | 추가 | `--a2r-d4-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F24 | 추가 | `--a2r-r18-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F25 | 추가 | `--a2r-r19-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F26 | 추가 | `--a2r-r17-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F27 | 추가 | `--a2r-r16-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F28 | 추가 | `--a2r-r15-sheet` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. reviewAll은 격리 + 이 인자가 함께 있어야 허용된다. | `NativeGame.A2RPlay.cs:75` |
| F29 | 추가 | `--a2r-r14-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F30 | 추가 | `--a2r-night-proof` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F31 | 추가 | `--a2r-sight-smoke` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F32 | 추가 | `--a2r-surface-diagnostic` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |
| F33 | 추가 | `--a2r-nature-capture` | 없음: OFF | 플레이 스모크 말미 선택 실행. 코드 순서대로 독립 if이므로 여러 인자는 연속 실행된다. | `NativeGame.A2RPlay.cs:75` |

| ID | 판정 | 구 문구·예시 | 현행 판정 |
|---|---|---|---|
| X01 | 폐기 | `--a2r-veg3d-off`로 식생 3D 끄기 | 기준 커밋의 Runtime·Editor 전체에 토큰/인자 처리 없음. 유효 인자 목록에서 제외. 일반 식생은 HellRot 필터 및 허용 목록으로 처리한다. |
| X02 | 폐기 | r18 식생 113개 교체 / D2 바람 진폭을 현행 기본으로 사용 | r18은 이력이다. 현행 기본은 일반 식생 113개 생성 전 제외, 식생/나무 풍량은 D4 WindGain=1.5 적용. 기존 D2의 .06m 나무·높이×.15를 기본 최종값으로 사용하지 않는다. |

## 2. 구역·바닥 및 좌표

| ID | 판정 | 구역·대상 | 값·규칙 | 출처 |
|---|---|---|---|---|
| Z01 | 추가 | 좌표 | 월드 X=웹 X/100, Z=-웹 Y/100. Core 보행 판정은 Map.CanMove(X×100,-Z×100,0). | A2RWebAssets.Initialize / A2RProps3D.Initialize |
| Z02 | 추가 | 전체 시각 지면 | X=-105..185, Z=-185..105m. 근거리 축 X=-45..125, Z=-125..45는 .25m, 바깥은 2m 간격. | A2FieldLayout.GroundAxis |
| Z03 | 추가 | 웹 바닥·독늪 | 입력 바닥 64장(8×8, 한 장 10m, D4: `C10/Art/r3_ground_x_y.png` 색을 terrain-skin 8k로 교체·1000px·알파 유지; 전투 레인 S p50 .184 lumSD 6.3, 레인 밖 피부막 S p50 .324 lumSD 7.2, 전이 약 3.7m), 40×40 세분화, GroundY+.012m. riverPoints=8, ribbon=1, 수면 Y=-.445m. 카드 입력 189장과 별도. | A2RGroundPainting.Build / web-assets.json |
| Z04 | 추가 | 북쪽 Terrain | X=18..52, Z=-74..-40m(34×34). 높이맵 257², span=max(1,max-min+1), 호스트 TerrainCollider 제거, drawHeightmap=false가 기본. | A2RProps3D.Terrain.BuildTerrainDress |
| Z05 | 추가 | 선택 피부 표면 | skin-on일 때만 +.006m, 4레이어: macro(34×34m)·skin·bruise·vein(각8×8m), alpha 512², normalScale 1/1.8/1.4/1.4. 다리 bounds+.3m 구멍. 현재 기본 OFF. | A2RTerrainSkin.Apply / A2RProps3D.Terrain |
| Z06 | 추가 | 바닥 카드 4종 | m_c1groot·m_c1gtoxicf·m_c1pool·pit_poison 각1. sourceX/sourceY로 위치 복원, max(GroundY,-.45)+.028m, 32×32 세분화, Y 회전 없음·그림자 OFF. | A2RWebAssets.IsFloor / FloorMesh |

## 3. 웹 카드 kind별 처리·수량·크기

폭·높이는 `web-assets.json`의 원본 직사각형(m), `a..b`는 입력 최소..최대다. 알파 실루엣 높이나 생성 후 렌더러 높이가 아니다. 모든 행의 개수 합계는 189다. 나무는 기존 Tree/거목/外곽과 source anchor 거리 <1.4m이면 먼저 중복 생성을 생략하므로, 아래는 **중복 검사 전 입력 수**다.

| ID | 판정 | kind | 입력 수 | 폭 / 높이(m) | 기본 처리 |
|---|---|---|---|---|---|
| K01 | 추가 | `m_c1sbone` | 3 | 1.32 / 1.5 | 3D sbone |
| K02 | 추가 | `m_ctree17` | 1 | 3.37 / 3.62 | 3D ctree17 |
| K03 | 추가 | `m_ctree16` | 1 | 4.52 / 4.55 | 3D ctree16 |
| K04 | 추가 | `corpse` | 2 | 0.33 / 0.36 | D4: corpse_a/b, 조건 실패 시 카드 |
| K05 | 추가 | `m_fbones` | 2 | 0.41 / 0.36 | D4: bone_pile_a/b, 조건 실패 시 카드 |
| K06 | 추가 | `m_c1pool` | 1 | 4.68 / 3.72 | 바닥 투영, 3D 단계에서 건너뜀 |
| K07 | 추가 | `m_hang_cage` | 1 | 2.79 / 2.63 | 3D hang_cage |
| K08 | 추가 | `m_c1cocoon` | 1 | 4.38 / 3.75 | 3D cocoon |
| K09 | 추가 | `m_c1spod` | 2 | 1.48..1.52 / 1.32..1.34 | D3: r3_prop_10 (OFF면 spod 미허용 → 카드) |
| K10 | 추가 | `m_c1groot` | 1 | 7.57 / 7.56 | 바닥 투영, 3D 단계에서 건너뜀 |
| K11 | 추가 | `m_c1tree` | 1 | 8.51 / 10.41 | 3D c1tree |
| K12 | 추가 | `m_ctree15` | 1 | 3.83 / 3.75 | 3D ctree15 |
| K13 | 추가 | `m_ctree18` | 1 | 4.32 / 4.49 | 3D ctree18 |
| K14 | 추가 | `m_penta_circle` | 1 | 3.47 / 3.33 | D3: r3_prop_16 (OFF면 penta_full 미허용 → 카드) |
| K15 | 추가 | `m_c1altar` | 1 | 4.77 / 4.38 | D3: r3_prop_17 (OFF면 altar 미허용 → 카드) |
| K16 | 추가 | `m_c1camp` | 1 | 5.88 / 4.42 | 카드 유지(camp 미허용) |
| K17 | 추가 | `m_skull_totem` | 1 | 0.88 / 2.23 | 3D skull_totem |
| K18 | 추가 | `m_fyellow` | 1 | 1.6 / 1.6 | HellRot 기본 ON: 생성 전 제외. OFF여도 fyellow 미허용 → 카드 |
| K19 | 추가 | `m_sword_pile` | 1 | 1.89 / 1.88 | 3D sword_pile |
| K20 | 추가 | `m_c1sroot` | 4 | 1.5 / 1.4 | D4: flesh_root_a/b, 조건 실패 시 카드; D4 OFF면 sroot_a/b를 처리 인덱스 짝/홀로 선택 |
| K21 | 추가 | `m_c1gtoxicf` | 1 | 4.55 / 4.64 | 바닥 투영, 3D 단계에서 건너뜀 |
| K22 | 추가 | `pit_poison` | 1 | 1.9 / 1.47 | 바닥 투영, 3D 단계에서 건너뜀 |
| K23 | 추가 | `m_ctree19` | 1 | 3.09 / 3.52 | 카드 유지(ctree19 미허용) |
| K24 | 추가 | `m_ctree14` | 1 | 4.38 / 4.33 | 3D ctree14 |
| K25 | 추가 | `m_bone_arch` | 1 | 2.94 / 2.69 | 3D bone_arch |
| K26 | 추가 | `m_ctree20` | 1 | 4.34 / 4.16 | 카드 유지(ctree20 미허용) |
| K27 | 추가 | `m_ctree13` | 1 | 3.36 / 3.37 | 3D ctree13 |
| K28 | 추가 | `boundary_tree` | 8 | 2.978515625..12.294921875 / 2.333984375..13.5546875 | tree_19/24만 D3 Tripo 교체, 나머지는 bnd0/3/5/18 모두 미허용 → 카드(중복 생략 가능) |
| K29 | 추가 | `vegetation` | 113 | 0.95..5.1 / 0.7..1.3 | HellRot 기본 ON: 113장 모두 생성 전 제외. OFF면 fern_*/brush_* 미허용이므로 카드 유지 |
| K30 | 일치 | `forest_wall` | 6 | 15..33 / 7.5..13 | 6장 카드 유지. 15종 *_far 전부 허용일 때만 일괄 3D 전환(현행 허용0) |
| K31 | 추가 | `foreground_tree` | 27 | 7.9 / 7.9 | 3D fg_rot01/03 (asset 끝03 여부). foreground_24 예외는 §4 |

기본 HellRot 필터는 `vegetation`·`m_fyellow`·asset에 `r3_bank`/`r3_thicket` 포함이면 모두 건너뛴다. 현 입력 제외는 114장, 남은 후보 75장=바닥4+세운 카드 후보71이다. **71은 실제 잔여 카드 수가 아니다.** 정상 초기화·기본 스위치에서 실제 세운 카드는 `7+U+D`: 항상 유지하는 캠프1+숲벽6, U=미허용 나무 카드8장 중 중복 제외 후 생성된 수(0..8), D=D4 대상8장 중 OffBand 실패로 카드 유지한 수(0..8). 따라서 코드상 범위 7..23장, 확정 수는 런타임 측정 필요. D4 대상은 corpse2+fbones2+sroot4다. 3D OFF면 교체 카드도 복귀하나, HellRot에서 애초 제외한 114장은 복귀하지 않는다.

`A2RProps3D.Result.standingCards`는 `cards`(3D 교체 대상으로 넣은 원본 카드)만 세므로 모델 ON일 때 0이어도 **전체 카드 0의 증거가 아니다**. `RetainedCards`도 교체 단계 카운터이며 실제 표시 수는 web 중복·hierarchy 상태와 함께 확인해야 한다. `Result.flatDecals`를 올리는 Decal 메서드는 현재 호출되지 않고, 바닥4는 WebAssets의 GroundProjectedCount에서 센다. TerrainDetails는 Result.modelInstances와 별도다.

## 4. 모델 허용·출처·축척·LOD 전수표

`allowed-models.json` 명시 허용 **22종**, 보정 scale **17종**, catalog **78종**이다. D3는 Tripo5종을 실행 중 allowed에 추가(이미 JSON 허용), D4는 소품6종을 JSON 밖에서 추가한다. Terrain 산포10종은 allowed 검사를 하지 않고 catalog/prefab 존재로 생성한다. “비허용”은 삭제·폐기가 아니라 카탈로그 보관 상태다. `--a2r-r15-sheet`+QA 격리의 reviewAll만 전체 허용으로 넓힌다.

원본 source는 `I:/EXODUSER-Storage/map25d/` 기준 상대 경로다. Resources 경로는 모든 종이 `A2R/Models3D/Prefabs/<이름>`. `prepared=true`로 기본 yaw180°. Importer는 밑동 중앙 원점·높이1u로 정규화한다. 폭/깊이는 그 catalog 정규화 치수의 원문 값이다. scale 미기재는1, 파서 clamp .6..1. 일반 3D 배치의 목표 h는 원본 카드 height×scale(월드 실제 실루엣은 접지 변형 후 측정 필요).

D3 Tripo5: `h=min(카드폭/max(.01,catalog.width),카드높이×1.15)`; `ctree14/19/20` h×.8, `foreground_24` h×.8 및 X-1.5m(이 한 개는 원래 anchor 이동). D4 시체/뼈 h=1m, 살뿌리는 같은 LandmarkHeight 식. D4 variant는 FNV-1a(id)의 하위비트: 홀수b·짝수a. 보행 가능 anchor는 반경 .5..3m(.5 간격)·16방향에서 가장 먼저 발견한 비보행점(GroundY>-.3)으로 옮기고 없으면 카드를 유지한다. sroot는 D3Look에서 XZ×1.2,Y×.72, tint(.50,.44,.44); flesh_root_a tint(2.6,1.05,.95), b(1.7,.98,.92).

접지: (X,60,Z)에서 아래140m·layer28 raycast와 GroundY의 큰 값에서 -.04m, 지면 법선 기울기 최대15°. ConformBase 후 gap 산출. 이 기준은 떠있음0을 검증한 결과가 아니다.

LOD0/1/2 삼각형은 **2026-11-04 source GLB JSON을 직접 읽은 값**이다. 모든78종에서 mesh primitive별 합계=catalog.triangles가 일치했다. catalog.triangles는 전 LOD 합계이지 프레임 렌더 삼각형이 아니다. 일반 모델은 원본LOD0 비활성→원본LOD1/2를 표시LOD0/1로 승격(.18/.00001), 높이<1 또는 far는 그림자OFF. 식생 ApplyFoliageBudget은 원본3단계를 유지(.12/.04/.00001), 그림자OFF. far는 원본LOD2만 있어 표의 0/0/N이 정상이다. 실제 Unity 메시/활성LOD/그림자 합계는 런타임 필요.

| ID | 판정 | 이름 | 허용 경로 | 원본 제작 | source 상대 경로 | 보정 scale | 폭 / 깊이(1u) | 원본 LOD0/1/2 | catalog 합계 |
|---|---|---|---|---|---|---|---|---|---|
| M01 | 추가 | `cocoon` | JSON 허용 | Meshy → Blender | `foliage3d/props/cocoon.glb` | 0.9915021657943726 | 1.177154541015625 / 0.6380139589309692 | 31299/7822/1874 | 40995 |
| M02 | 추가 | `hang_cage` | JSON 허용 | Meshy → Blender | `foliage3d/props/hang_cage.glb` | 0.8478025197982788 | 1.2524749040603638 / 1.0254573822021484 | 31058/7759/1855 | 40672 |
| M03 | 추가 | `penta_full` | 비허용 | Meshy → Blender | `foliage3d/props/penta_full.glb` | 1 | 2.1841037273406982 / 2.313072919845581 | 31171/7790/1867 | 40828 |
| M04 | 추가 | `skull_totem` | JSON 허용 | Meshy → Blender | `foliage3d/props/skull_totem.glb` | 0.8679184913635254 | 0.4529472291469574 / 0.43997272849082947 | 31292/7823/1877 | 40992 |
| M05 | 추가 | `sword_pile` | JSON 허용 | Meshy → Blender | `foliage3d/props/sword_pile.glb` | 0.7476029396057129 | 1.3763924837112427 / 1.2571927309036255 | 31284/7821/1876 | 40981 |
| M06 | 추가 | `bnd0` | 비허용 | Meshy → Blender 재베이크 | `bake3d/out/bnd0.glb` | 1 | 1.1005247831344604 / 0.781650185585022 | 51865/12960/3106 | 67931 |
| M07 | 추가 | `bnd18` | 비허용 | Meshy → Blender | `foliage3d/props/bnd18.glb` | 1 | 1.0955599546432495 / 1.0019763708114624 | 52106/13024/3124 | 68254 |
| M08 | 추가 | `bnd3` | 비허용 | Meshy → Blender | `foliage3d/props/bnd3.glb` | 1 | 1.257763385772705 / 1.072015404701233 | 52049/13011/3121 | 68181 |
| M09 | 추가 | `bnd5` | 비허용 | Meshy → Blender | `foliage3d/props/bnd5.glb` | 1 | 1.093302845954895 / 0.935396134853363 | 52010/13002/3120 | 68132 |
| M10 | 추가 | `c1tree` | JSON 허용 | Meshy → Blender | `foliage3d/props/c1tree.glb` | 0.800189733505249 | 1.086734652519226 / 0.9541518092155457 | 51987/12969/3103 | 68059 |
| M11 | 추가 | `ctree13` | JSON 허용 | Meshy → Blender 재베이크 | `bake3d/out/ctree13.glb` | 0.7619181871414185 | 1.3248878717422485 / 1.1949617862701416 | 52134/13032/3128 | 68294 |
| M12 | 추가 | `ctree14` | JSON 허용 | Meshy → Blender 재베이크 | `bake3d/out/ctree14.glb` | 0.6525712013244629 | 1.6083953380584717 / 1.6929734945297241 | 52208/13051/3131 | 68390 |
| M13 | 추가 | `ctree15` | JSON 허용 | Meshy → Blender | `foliage3d/props/ctree15.glb` | 0.8988186120986938 | 1.1767170429229736 / 0.7150945663452148 | 52083/13018/3122 | 68223 |
| M14 | 추가 | `ctree17` | JSON 허용 | Meshy → Blender 재베이크 | `bake3d/out/ctree17.glb` | 0.6988277435302734 | 1.3461345434188843 / 1.2145665884017944 | 52033/13007/3121 | 68161 |
| M15 | 추가 | `ctree18` | JSON 허용 | Meshy → Blender | `foliage3d/props/ctree18.glb` | 0.8390407562255859 | 1.1717511415481567 / 0.608911395072937 | 52009/13001/3118 | 68128 |
| M16 | 추가 | `ctree19` | 비허용 | Meshy → Blender 재베이크 | `bake3d/out/ctree19.glb` | 1 | 1.0589302778244019 / 1.0661903619766235 | 52040/13008/3119 | 68167 |
| M17 | 추가 | `ctree20` | 비허용 | Meshy → Blender 재베이크 | `bake3d/out/ctree20.glb` | 1 | 1.724158525466919 / 1.5778316259384155 | 52125/13028/3125 | 68278 |
| M18 | 추가 | `fg_rot01` | JSON 허용 | Meshy → Blender 재베이크 | `bake3d/out/fg_rot01.glb` | 0.7405306100845337 | 1.3605066537857056 / 1.1020170450210571 | 52042/13010/3121 | 68173 |
| M19 | 추가 | `fg_rot03` | JSON 허용 | Meshy → Blender | `foliage3d/props/fg_rot03.glb` | 0.9450217485427856 | 1.0581613779067993 / 0.6417907476425171 | 52080/13015/3113 | 68208 |
| M20 | 추가 | `fyellow` | 비허용 | Meshy → Blender | `foliage3d/props/fyellow.glb` | 1 | 1.0000778436660767 / 0.09691383689641953 | 14062/3515/842 | 18419 |
| M21 | 추가 | `sbone` | JSON 허용 | Meshy → Blender | `foliage3d/props/sbone.glb` | 0.646728515625 | 1.3953913450241089 / 1.3487389087677002 | 15588/3894/933 | 20415 |
| M22 | 추가 | `spod` | 비허용 | Meshy → Blender | `foliage3d/props/spod.glb` | 1 | 1.761783480644226 / 1.5779598951339722 | 15681/3919/939 | 20539 |
| M23 | 추가 | `sroot_a` | JSON 허용 | Meshy → Blender | `foliage3d/props/sroot_a.glb` | 0.9528805017471313 | 1.1349629163742065 / 0.8769842982292175 | 15666/3914/960 | 20540 |
| M24 | 추가 | `sroot_b` | JSON 허용 | Meshy → Blender | `foliage3d/props/sroot_b.glb` | 1 | 1.0797703266143799 / 0.4465741813182831 | 15644/3904/1285 | 20833 |
| M25 | 추가 | `altar` | 비허용 | Meshy → Blender | `foliage3d/props/altar.glb` | 1 | 2.2818331718444824 / 2.2643721103668213 | 31073/7762/2059 | 40894 |
| M26 | 추가 | `bone_arch` | JSON 허용 | Meshy → Blender | `foliage3d/props/bone_arch.glb` | 0.7854553461074829 | 1.402933120727539 / 1.2712208032608032 | 31293/7816/1870 | 40979 |
| M27 | 추가 | `camp` | 비허용 | Tripo → Blender | `foliage3d/props/camp.glb` | 1 | 2.473266124725342 / 2.208982467651367 | 28078/7018/1703 | 36799 |
| M28 | 추가 | `r3_fern_0` | 비허용 | Blender 원화 메시 | `foliage3d/r3_fern_0.glb` | 1 | 1.8248119354248047 / 1.867484450340271 | 1200/272/24 | 1496 |
| M29 | 추가 | `r3_fern_1` | 비허용 | Blender 원화 메시 | `foliage3d/r3_fern_1.glb` | 1 | 2.273925542831421 / 2.351553440093994 | 600/280/48 | 928 |
| M30 | 추가 | `r3_fern_2` | 비허용 | Blender 원화 메시 | `foliage3d/r3_fern_2.glb` | 1 | 1.6945935487747192 / 2.0369884967803955 | 1200/272/24 | 1496 |
| M31 | 추가 | `r4_brush_0` | 비허용 | Blender 원화 메시 | `foliage3d/r4_brush_0_v3.glb` | 1 | 2.719780206680298 / 2.2846155166625977 | 600/276/24 | 900 |
| M32 | 추가 | `r4_brush_1` | 비허용 | Blender 원화 메시 | `foliage3d/r4_brush_1_v3.glb` | 1 | 2.6519336700439453 / 2.439779043197632 | 580/264/24 | 868 |
| M33 | 추가 | `r4_brush_2` | 비허용 | Blender 원화 메시 | `foliage3d/r4_brush_2_v3.glb` | 1 | 2.8021976947784424 / 2.241758346557617 | 580/264/24 | 868 |
| M34 | 추가 | `r4_brush_3` | 비허용 | Blender 원화 메시 | `foliage3d/r4_brush_3_v3.glb` | 1 | 2.4806630611419678 / 2.182983636856079 | 600/276/24 | 900 |
| M35 | 추가 | `bnd0_far` | 비허용 | Meshy → Blender | `foliage3d/far/bnd0_far.glb` | 1 | 1.0976719856262207 / 0.7559152841567993 | 0/0/3106 | 3106 |
| M36 | 추가 | `bnd3_far` | 비허용 | Meshy → Blender | `foliage3d/far/bnd3_far.glb` | 1 | 1.256693959236145 / 1.0685063600540161 | 0/0/3121 | 3121 |
| M37 | 추가 | `bnd5_far` | 비허용 | Meshy → Blender | `foliage3d/far/bnd5_far.glb` | 1 | 1.0953902006149292 / 0.9365878105163574 | 0/0/3120 | 3120 |
| M38 | 추가 | `bnd18_far` | 비허용 | Meshy → Blender | `foliage3d/far/bnd18_far.glb` | 1 | 1.0921330451965332 / 0.9977372884750366 | 0/0/3124 | 3124 |
| M39 | 추가 | `c1tree_far` | 비허용 | Meshy → Blender | `foliage3d/far/c1tree_far.glb` | 1 | 0.9657653570175171 / 0.8721290826797485 | 0/0/3103 | 3103 |
| M40 | 추가 | `fg_rot01_far` | 비허용 | Meshy → Blender | `foliage3d/far/fg_rot01_far.glb` | 1 | 1.3591010570526123 / 1.088423252105713 | 0/0/3121 | 3121 |
| M41 | 추가 | `fg_rot03_far` | 비허용 | Meshy → Blender | `foliage3d/far/fg_rot03_far.glb` | 1 | 1.0194109678268433 / 0.5594190955162048 | 0/0/3113 | 3113 |
| M42 | 추가 | `ctree13_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree13_far.glb` | 1 | 1.3321831226348877 / 1.204233169555664 | 0/0/3128 | 3128 |
| M43 | 추가 | `ctree14_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree14_far.glb` | 1 | 1.5981028079986572 / 1.6789066791534424 | 0/0/3131 | 3131 |
| M44 | 추가 | `ctree15_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree15_far.glb` | 1 | 1.190481424331665 / 0.7176410555839539 | 0/0/3122 | 3122 |
| M45 | 추가 | `ctree16_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree16_far.glb` | 1 | 1.0403029918670654 / 0.6718118786811829 | 0/0/3121 | 3121 |
| M46 | 추가 | `ctree17_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree17_far.glb` | 1 | 1.3557260036468506 / 1.219374418258667 | 0/0/3121 | 3121 |
| M47 | 추가 | `ctree18_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree18_far.glb` | 1 | 1.1693013906478882 / 0.6091618537902832 | 0/0/3118 | 3118 |
| M48 | 추가 | `ctree19_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree19_far.glb` | 1 | 1.0511350631713867 / 1.072213888168335 | 0/0/3119 | 3119 |
| M49 | 추가 | `ctree20_far` | 비허용 | Meshy → Blender | `foliage3d/far/ctree20_far.glb` | 1 | 1.7301369905471802 / 1.576915979385376 | 0/0/3125 | 3125 |
| M50 | 추가 | `fern_0` | 비허용 | Meshy 고사리 → Blender 변형 | `prop3d-foliage/out/fern_0.glb` | 1 | 3.3861820697784424 / 2.7576310634613037 | 1260/480/120 | 1860 |
| M51 | 추가 | `fern_1` | 비허용 | Meshy 고사리 → Blender 변형 | `prop3d-foliage/out/fern_1.glb` | 1 | 1.8786041736602783 / 1.9470696449279785 | 1442/588/112 | 2142 |
| M52 | 추가 | `fern_2` | 비허용 | Meshy 고사리 → Blender 변형 | `prop3d-foliage/out/fern_2.glb` | 1 | 1.9676436185836792 / 2.2562832832336426 | 1404/594/126 | 2124 |
| M53 | 추가 | `brush_0` | 비허용 | Meshy 고사리 → Blender 변형 | `prop3d-foliage/out/brush_0.glb` | 1 | 4.094828128814697 / 2.407258987426758 | 2800/952/224 | 3976 |
| M54 | 추가 | `brush_1` | 비허용 | Meshy 고사리 → Blender 변형 | `prop3d-foliage/out/brush_1.glb` | 1 | 4.583938121795654 / 2.945326566696167 | 2756/884/208 | 3848 |
| M55 | 추가 | `brush_2` | 비허용 | Meshy 고사리 → Blender 변형 | `prop3d-foliage/out/brush_2.glb` | 1 | 4.332178115844727 / 2.745388984680176 | 2800/952/224 | 3976 |
| M56 | 추가 | `brush_3` | 비허용 | Meshy 고사리 → Blender 변형 | `prop3d-foliage/out/brush_3.glb` | 1 | 3.801363706588745 / 2.496065855026245 | 2688/816/192 | 3696 |
| M57 | 추가 | `ctree16` | JSON 허용 | Meshy → Blender | `foliage3d/props/ctree16.glb` | 0.9683279991149902 | 1.065375566482544 / 0.7004398107528687 | 52059/13011/3121 | 68191 |
| M58 | 추가 | `r3_tree_19` | JSON 허용 | Tripo → Blender | `tripo-b2/lod/r3_tree_19.glb` | 1 | 1.5651516914367676 / 1.4915770292282104 | 12000/4000/1200 | 17200 |
| M59 | 추가 | `r3_tree_24` | JSON 허용 | Tripo → Blender | `tripo-b2/lod/r3_tree_24.glb` | 1 | 0.9357036352157593 / 0.825626015663147 | 12000/4000/1200 | 17200 |
| M60 | 추가 | `r3_prop_10` | JSON 허용 | Tripo → Blender | `tripo-b2/lod/r3_prop_10.glb` | 1 | 1.2519832849502563 / 1.2184443473815918 | 5999/2000/600 | 8599 |
| M61 | 추가 | `r3_prop_16` | JSON 허용 | Tripo → Blender | `tripo-b2/lod/r3_prop_16.glb` | 1 | 1.605469822883606 / 1.5930755138397217 | 6000/2000/600 | 8600 |
| M62 | 추가 | `r3_prop_17` | JSON 허용 | Tripo → Blender | `tripo-b2/lod/r3_prop_17.glb` | 1 | 1.6573816537857056 / 1.6249035596847534 | 6000/2000/600 | 8600 |
| M63 | 추가 | `vein_grass_a` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/vein_grass_a.glb` | 1 | 1.0311211347579956 / 1.0826194286346436 | 1180/590/236 | 2006 |
| M64 | 추가 | `vein_grass_b` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/vein_grass_b.glb` | 1 | 1.0222599506378174 / 1.0248682498931885 | 1180/590/236 | 2006 |
| M65 | 추가 | `root_sprout_a` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/root_sprout_a.glb` | 1 | 1.5200140476226807 / 1.6187108755111694 | 458/228/92 | 778 |
| M66 | 추가 | `root_sprout_b` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/root_sprout_b.glb` | 1 | 1.4114418029785156 / 1.5030888319015503 | 540/270/108 | 918 |
| M67 | 추가 | `bonethorn_bush_a` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/bonethorn_bush_a.glb` | 1 | 1.5176470279693604 / 1.5042245388031006 | 2626/1312/524 | 4462 |
| M68 | 추가 | `bonethorn_bush_b` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/bonethorn_bush_b.glb` | 1 | 1.571428656578064 / 1.5855377912521362 | 2858/1428/572 | 4858 |
| M69 | 추가 | `pustule_cluster_a` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/pustule_cluster_a.glb` | 1 | 1.470588207244873 / 1.4326002597808838 | 848/423/170 | 1441 |
| M70 | 추가 | `pustule_cluster_b` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/pustule_cluster_b.glb` | 1 | 1.4464287757873535 / 1.4066431522369385 | 948/473/190 | 1611 |
| M71 | 추가 | `spore_stalk_a` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/spore_stalk_a.glb` | 1 | 0.7995902895927429 / 0.7723820805549622 | 956/478/190 | 1624 |
| M72 | 추가 | `spore_stalk_b` | Terrain 직접 | Blender 절차 메시 | `foliage-proc/out/spore_stalk_b.glb` | 1 | 0.7742016911506653 / 0.7388002276420593 | 1150/574/230 | 1954 |
| M73 | 추가 | `corpse_a` | D4 조건부 자동 | Tripo → Blender | `tripo-props/lod/corpse_a.glb` | 1 | 2.0807409286499023 / 1.3640422821044922 | 4999/1600/500 | 7099 |
| M74 | 추가 | `corpse_b` | D4 조건부 자동 | Tripo → Blender | `tripo-props/lod/corpse_b.glb` | 1 | 2.14499831199646 / 2.1405560970306396 | 4999/1600/500 | 7099 |
| M75 | 추가 | `bone_pile_a` | D4 조건부 자동 | Tripo → Blender | `tripo-props/lod/bone_pile_a.glb` | 1 | 1.8913804292678833 / 1.8727582693099976 | 5000/1600/500 | 7100 |
| M76 | 추가 | `bone_pile_b` | D4 조건부 자동 | Tripo → Blender | `tripo-props/lod/bone_pile_b.glb` | 1 | 1.076225757598877 / 0.844344437122345 | 5000/1600/500 | 7100 |
| M77 | 추가 | `flesh_root_a` | D4 조건부 자동 | Tripo → Blender | `tripo-props/lod/flesh_root_a.glb` | 1 | 1.7549725770950317 / 1.686746597290039 | 5000/1600/500 | 7100 |
| M78 | 추가 | `flesh_root_b` | D4 조건부 자동 | Tripo → Blender | `tripo-props/lod/flesh_root_b.glb` | 1 | 1.1765339374542236 / 1.1140778064727783 | 5000/1600/500 | 7100 |

제작 출처 근거: 기존28소품·far는 `foliage3d/prop-inputs.json`의 Meshy/Tripo 원본 경로, 베이크 교체는 저장소 `baked-sources.json`; fern/brush7은 `prop3d-foliage/BRIEF_FOLIAGE3D.md`(Meshy 고사리 기반 Blender 변형), 절차 산포는 `foliage-proc/REPORT.md`와 GLB generator, Tripo11종은 source 경로와 `tripo-b2/BRIEF_TRIPO_POST.md`·`tripo-props/BRIEF_TRIPO_PROPS.md`를 대조했다. 외부 제작 파일은 읽기만 했으며 Git에 복사하지 않았다.

## 5. 썩은 숲 산포 5계열

H비는 브리프·캐릭터 정본의 **영웅 H=1.61u** 기준이다. Terrain.cs의 hero1.31m 주석은 오래된 값이며 코드 상수로 쓰이지 않는다. 외부 CATALOG_HELLROT의 .39/.59m·3~6개·LOD .06/.025/.01은 제작 목표다. 현재 배치 코드는 아래 .40/.58m·덤불1~2/기타2~4개·LOD .12/.04/.00001을 사용한다. 목표를 구현 사실로 바꾸어 쓰지 않는다.

| ID | 판정 | 계열 | 모델 | 기준 h(m) | 1차 추첨 가중치 | 높이 식·상한 | 기준 H비 / 상한 H비 |
|---|---|---|---|---|---|---|---|
| P1 | 추가 | 촉수 풀포기 | vein_grass_a/b | 0.36 | 0.34 | min(0.36×(.9+.2×H01),0.4,1.4/max(.05,width)) | 0.223602 / 0.248447 (반올림) |
| P2 | 추가 | 뿌리 싹 | root_sprout_a/b | 0.18 | 0.2 | min(0.18×(.9+.2×H01),0.4,1.4/max(.05,width)) | 0.111801 / 0.248447 (반올림) |
| P3 | 추가 | 뼈가시 덤불 | bonethorn_bush_a/b | 0.53 | 0.2 | min(0.53×(.9+.2×H01),0.58,1.4/max(.05,width)) | 0.329193 / 0.360248 (반올림) |
| P4 | 추가 | 포자 줄기 | spore_stalk_a/b | 0.43 | 0.14 | min(0.43×(.9+.2×H01),0.4,1.4/max(.05,width)) | 0.267081 / 0.248447 (반올림) |
| P5 | 추가 | 종양 혹 | pustule_cluster_a/b | 0.17 | 0.12 | min(0.17×(.9+.2×H01),0.4,1.4/max(.05,width)) | 0.105590 / 0.248447 (반올림) |

후보 셀은3m 격자(12×12=144셀), 각 셀 안3m jitter. walkable·GroundY≥-.2·KeepPlantRule·H01(key,3)≤.85(D4, 이전 .5)를 모두 만족해야 한다. KeepPlantRule은 나무거리<3m **또는** 비보행점 **또는** 반경2m 8방향 중 하나 비보행이면 참이다. 산포 중심은 walkable 선검사가 있어 비보행점 자체에는 놓지 않는다. 나무 가까운 레인 내부가 예외로 통과할 수 있으므로 “모든 레인 중앙0”을 증명한 것은 아니다.

군락 반경 .4.. .9m, 덤불1~2개·나머지2~4개 후보. 자식이 walkable이어야 하며 반경 덤불 .7m/기타 .3m의8방향 모두 walkable일 때 유지한다. 직전 계열이면 다른 계열로 재선택, 같은 군락 variant는 a/b 번갈음; 촉수 계열은 추가25%로 뿌리 싹으로 바뀌므로 첫 추첨 비율은 최종 배치 비율이 아니다. 자식은 KeepPlantRule을 다시 검사하지 않는다. 배치Y=GroundY-.02m, yaw=(prepared?180:0)+H01×360°, 폭상한1.4m. 실제 생성 수·계열 비율은 런타임 측정 필요.

기존 일반 식생 복귀 경로도 보관: FoliageHeight는 fern 카드 height>.7이면 .54m, 아니면 .40m; brush=.45m. Clean fern은 min(.32 또는 .40,.9/unitWidth), brush XZ=min(.45×.7,1.4/unitWidth),Y=.45×1.2=.54m. yaw=FNV(id)%1001/1000×50-25°. 현재 HellRot 필터와 허용 목록 때문에 기본 경로에서 생성되지 않는다.

## 6. 조명·바람 현행값

| ID | 판정 | 대상 | 값·분기 |
|---|---|---|---|
| L01 | 추가 | 기본 해 | 방향광 intensity3.2, RGB(.92,.90,.86), pitch68°, yaw-32°, soft shadow strength.38, bias.025, normalBias.04. NativeGame.A2Field 초기49°를 A2R ApplyClean이 덮어쓴다. |
| L02 | 추가 | 해 분기 | Clean OFF=.9/원래회전49°. Clean ON·HellRot OFF=shadow.55, pitch Terrain ON55°/OFF50°. HellRot ON이면 Terrain 유무와 무관하게68°/.38. |
| L03 | 추가 | 톤 | Neutral; exposure.55, contrast8(Clean&&Terrain) 아니면16, saturation0; whiteBalance 온도16/tint6; split shadows(.48,.49,.51), highlights(.53,.51,.48), balance-15. |
| L04 | 추가 | 블룸·심도 | bloom intensity.055/threshold1.5/scatter.5. Gaussian DOF24..38/maxRadius.25는 기본 inactive. r13 비교만 exposure.80/contrast0/DOF ON. |
| L05 | 추가 | 환경·안개 | Trilight sky(.105,.100,.090), equator(.075,.070,.058), ground(.018,.015,.012); background(.002,.003,.004). RenderSettings.fog OFF, legacy HellFogFeature OFF. 별도 DistanceHaze density.002/start34/max.05. |
| L06 | 추가 | 횃불·영웅 | 횃불 RGB(1,.40,.10), range5.8, power9×(1+.15sin(27t+X)); hero fill2.4 RGB(.94,.96,1), edge2.2/range3.2 RGB(.78,.85,.91). |
| L07 | 추가 | 캠프·랜드마크 | camp fire radius7.5/power9.5/RGB(1,.32,.08), glow4.8/5.2/(1,.52,.20) 그림자OFF; ctree15/altar red4.4/4.56/(.92,.18,.14). AnchorCamp fire+(0,1.1,-.6), glow+(0,.8,-1). |
| L08 | 일치 | 공용 바람 파형 | g=.6+.4sin(1.57t+.07x+.05z); w=(sin(1.7t+p)+.35sin(3.9t+1.7p)+.12sin(7.3t+2.3p))×g; XZ 방향(1,.28). 기본 주기2π/1.7, 돌풍2π/1.57초. |
| L09 | 추가 | 식생·나무 진폭 | D4 ON WindGain1.5: 식생 현재높이×.15×1.5(높이×.225), 나무.06×1.5=.09m. D4 OFF는×1.0. Terrain 나무 재질의 기존x>.04&&x<.05&&z>.5이면 .08×WindGain으로 보정. 진폭계수는 최대 실제 이동량과 다르다. |
| L10 | 추가 | 이끼·잔가지·캠프 | 이끼 property block(.065,0,0,0)으로 상단 고정, D4 배율 대상 아님. 고사 잔가지 D2 재질값(.04,.15,0,0)은 이력. camp 3D 경로 .018m이나 기본은 camp 미허용 카드, 카드 sway는 tree/vegetation 외0이다. |
| L11 | 추가 | WindZone | Directional yaw35°, main.35, turbulence.25, pulseMagnitude.6, pulseFrequency.12. 정점 바람은 Wind.hlsl 별도 경로다. |
| L12 | 추가 | 맥동·접촉 | _WIND_PULSE R=굽힘,G=위상,B=맥동 마스크. period=lerp(3,8,frac(seed×7.137)), 각 정점 법선 이동 .015×최소로컬치수×B×pulse, 양면 크기상한3%. 접촉 반경1.2m, 식생 벡터y=.18, 최대 actor32, ripple24. 바람OFF에도 물결 기록 유지. |
| L13 | 추가 | AddBioTree(R8 소리) | D4: Place에서 fg_rot01/03·ctree13~20·bnd0/3/5/18·c1tree·r3_tree_19/24 배치 시 `NativeAmbientSources.AddBioTree(월드 위치)` 1회. `_far`·카드 제외. 로그 `[A2R_BIOTREE] AddBioTree registered=`, 코드 `A2RProps3D.D4.cs`. |

출처: `NativeGame.A2Field.cs`·`A2RLighting.cs`·`A2RProps3D.cs`·`A2RProps3D.Terrain.cs`·`A2RProps3D.D4.cs`·`A2RNatureDynamics.cs`·`Resources/A2R/Wind.hlsl`·`LitCommon.hlsl`.D2의 수치/컴파일 PASS는 당시 기록이며 현행 D4 화면·자연 플레이 PASS가 아니다.

## 7. 필드 조립 단계 (호출 순서)

`A2RStage.Begin`은 A2FieldSetup 시작에서 호출한다. Mark는 직전 단계 이후 ms와 누적 ms만 로그로 남긴다. A2R이 꺼지면 A2RSetup 안의 단계와 모델 내부 단계는 실행하지 않는다. 아래 중간2단계는 Initialize 안에 중첩되어 3D 모델 합계보다 먼저 기록된다. 단계명 “웹 카드189”는 고정 로그명이고 실제 생성 수가 아니다.

| ID | 판정 | 단계명(선행공백 보존) | 출처 |
|---|---|---|---|
| S01 | 추가 | `조명·볼륨` | `NativeGame.A2Field.cs:42` |
| S02 | 추가 | `지면 텍스처 로드` | `NativeGame.A2Field.cs:52` |
| S03 | 추가 | `거리장 40000타일` | `NativeGame.A2Field.cs:56` |
| S04 | 추가 | `이끼 커버` | `NativeGame.A2Field.cs:59` |
| S05 | 추가 | `외곽 덩어리` | `NativeGame.A2Field.cs:59` |
| S06 | 추가 | `전경` | `NativeGame.A2Field.cs:59` |
| S07 | 추가 | `랜드마크` | `NativeGame.A2Field.cs:59` |
| S08 | 추가 | `접합 뿌리` | `NativeGame.A2Field.cs:59` |
| S09 | 추가 | `지면 메시` | `NativeGame.A2Field.cs:59` |
| S10 | 추가 | `덤불 지면덮개` | `NativeGame.A2Field.cs:59` |
| S11 | 추가 | `다리 이끼` | `NativeGame.A2Field.cs:59` |
| S12 | 추가 | `대기` | `NativeGame.A2Field.cs:59` |
| S13 | 추가 | `환경광` | `NativeGame.A2Field.cs:63` |
| S14 | 추가 | `A2R 깊이 릴리프` | `NativeGame.A2Redesign.cs:19` |
| S15 | 추가 | `A2R 조명` | `NativeGame.A2Redesign.cs:21` |
| S16 | 추가 | `A2R 시야선` | `NativeGame.A2Redesign.cs:23` |
| S17 | 추가 | `A2R 웹 카드 189` | `NativeGame.A2Redesign.cs:23` |
| S18 | 추가 | `  3D 카드·모델 인스턴스` | `A2RProps3D.cs:124` |
| S19 | 추가 | `  Terrain 호스트·산포` | `A2RProps3D.cs:124` |
| S20 | 추가 | `A2R 3D 모델 합계` | `NativeGame.A2Redesign.cs:23` |
| S21 | 추가 | `A2R 자연·바람` | `NativeGame.A2Redesign.cs:23` |
| S22 | 추가 | `A2R SetLook` | `NativeGame.A2Redesign.cs:23` |
| S23 | 추가 | `A2RSetup 합계 이후` | `NativeGame.A2Field.cs:63` |

## 8. 런타임에서만 확정할 남은 항목

| ID | 판정 | 항목 | 남은 확인 |
|---|---|---|---|
| R01 | 런타임 필요 | 나무 중복·잔여 카드 실수 | WebAssets.Result.items의 added/kept3D와 실제 활성 원본 카드를 함께 세어 §3의 U·D와 전체 세운 카드 수 확정. |
| R02 | 런타임 필요 | 근경 소품 배치 | D4OffBand 성공 수·이동 좌표·최종실루엣 높이. h1m은 스케일 명령이지 접지 변형 후 실측값이 아니다. |
| R03 | 런타임 필요 | Terrain 산포 실수 | TerrainDetails/Grass/Shrubs/Pustules/Spores 및 모델별 실제 활성 수. Map.CanMove·GroundY·prefab 로드에 의존. |
| R04 | 런타임 필요 | 접지 | rayHit·gapCm·tilt, 떠 있음 개수와 1x 화면 틈. 코드 임계 gap>3cm를 실행 결과로 바꾸어 쓰지 않음. |
| R05 | 런타임 필요 | 렌더·LOD·성능 | Unity prefab 실제 활성 LOD/그림자별 삼각형·draw calls·FPS. GLB 전체 LOD합과 혼동 금지. |
| R06 | 런타임 필요 | 영웅 표시·가독성 | H=1.61 기준 실제 영웅 렌더 높이·작은 적/탄막 가시성·1x/3x 점·가림. 기존 주석1.31은 검수 증거가 아님. |
| R07 | 런타임 필요 | 풍량·맥동 화면 | 현재 D4 ON/OFF 10초 무음 동일시점 영상에서 px 움직임·과장·탄막 가독성 확인. |
| R08 | 런타임 필요 | 환경 반영 | 맵 총괄 병합 SHA, Mac 실게임 및 사용자 실행본 SHA는 이 문서 작업에서 미확인. |

대조 합계: **198항목 — 추가 185 / 일치 3 / 폐기 2 / 런타임 필요 8**. 한 행 안에 묶은 숫자를 각각 중복 계산하지 않는다. GLB78종의 LOD합계 일치는 별도 검산 결과이며 이 합계에 다시 더하지 않는다.
