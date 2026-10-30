# Unity RM-1 슬라이스 (1-1 R1 START ~ R2) 구현 현황 — 2026-10-28

브랜치 `claude/unity-pc-rm1-20261027`. 명세 `E:/exoduser-wt/_out/rm1/SPEC.md`(맵 총괄), 판정: 맵 총괄(구조), 디자인총괄(시각), 톤은 ① VFX 렌더 병합(Linear·후처리) 뒤.

## 생성 방법 (멱등)
- 씬 `unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity`, 빌더 `unity/Assets/Exoduser/Editor/Rm1SliceBuilder.cs`.
- `Unity -batchmode -executeMethod Exoduser.Rm1SliceBuilder.Run` (씬 생성), `.Capture -outDir <dir> -cuts start,r2,river,close,trunk,top [-capsule 1] [-shape 1]` (1600x900 컷, top=3200x2160 정사영+걷기 칸 초록), `.Fps -out <json>`.
- 좌표: 웹 px → 월드 x=px/100, z=-px_y/100 (1타일=0.4u). Core(`Runtime/Core`)는 건드리지 않고 3D 층은 렌더 전용.
- 슬라이스 창: 타일 x60~140 y138~192(패딩 포함 지형 x48~152 y126~200).

## 구조 판정 수치 (최종 빌드)
| 항목 | 값 | 파일 |
|---|---|---|
| 3D 덩어리가 덮는 걷기 칸 (중심 / 0.5칸 이상 깊이) | 0 / 0 | `Data/rm1_walk_overlap.json` |
| NavMesh vs Core 걷기 격자 (4320칸) | NavMesh만 걷기 0, Core만 걷기 0 | `Data/rm1_navmesh_diff.json` |
| 막힘 섬·돌출부 전수 점검 4건 | 모두 3D 물체로 덮임 | `Data/rm1_islands.json` |
| FPS (editor batch camera.Render, RX 9070 XT, 1600x900, START) | 3D 켬 767·934 / 끔 2286 | `Data/rm1_fps.json` |

- NavMesh는 걷기 칸 메시를 에이전트 반경 0.1u(복셀 0.04u)로 직접 굽는다. 몹 간격은 NavMeshAgent 반경으로 맞춘다.
- 카메라 쪽(걷기 칸이 북쪽 16칸 이내) 덩어리는 높이 0.9u 이하.

## 재질·실루엣
- `M_RottenWoodMembrane`(덩어리·채움), `M_CursedBark`(둥치·뿌리·가지·W8 소품): 기존 확정 아트 map3d `mass_v01`(+normal) 사용, 새 생성 이미지 없음.
- 덩어리·둥치는 절차 메시(`LumpMesh`: 슈퍼엘립스 풋프린트 상한, 밑동 로브, 테이퍼, 기울임, 노이즈, 돔형 윗면, 둥치는 부러진 윗면). 풋프린트는 항상 막힘 칸 안.
- 독액 `M_ToxicFlow`(`EXODUSER/ToxicFlow`, 불투명): 보스 아레나 수로에서 재사용. 색은 ① 병합 뒤 재조정.
- 전경 카드 `M_FgRoots`(카메라 하위, 화면 아래 모서리), 배경 카드 `M_BgTree`(바깥 덩어리 너머 6장), 풀 detail(LIFE1 색, 군락 36칸): 절차 알파 텍스처.

## 못 한 것 / 대기
- 독 스킬 터진 프레임: VFX 세션 산출물(기포·독 스킬 이펙트) 도착 뒤.
- 풀 detail·전경 카드는 어두운 Gamma 화면에서 거의 안 보임 — ① 병합 뒤 톤에서 재판정.
- 톤·색 수치(독액 노랑 등): ① 병합 뒤. `Rendering/` 자산은 ④ 차례 전까지 손대지 않음.
- 데칼은 쿼드 메시(URP Decal Projector 아님).

## Core → 월드 좌표 변환 (런타임 연결용, 2026-10-28 맵 총괄 요청)

`Rm1SliceBuilder`가 씬을 구울 때 쓴 변환 그대로다(출처: `Editor/Rm1SliceBuilder.cs` 26-29·45행 `W()`, 128-131행 지형 배치, 320행 `GroundY`, 829-859행 카메라). Core(`Runtime/Core`)는 한 줄도 바꾸지 않았고 Core의 z(높이)는 0 그대로다 — 높이는 표현 쪽이 지형에서 샘플한다.

| 항목 | 값 |
|---|---|
| 원점 | Core px (0, 0) = 월드 (0, 0, 0) = 웹 맵 격자 좌상단 모서리. 이동·회전·스케일 없음 |
| 축 | **x_월드 = px_x / 100**, **z_월드 = −px_y / 100**, y_월드 = 높이. 웹 y(아래쪽 = 남쪽)가 커지면 z가 작아진다. +z = 북 = 화면 위, −z = 남 = 카메라 쪽 |
| 단위 | 1px = 0.01u, **1타일 = 40px = 0.4u**. 타일 (tx, ty)의 좌상단 모서리 = `(tx·0.4, y, −ty·0.4)`, 중심 = `((tx+0.5)·0.4, y, −(ty+0.5)·0.4)`. 타일 인덱스 = floor(px/40) |
| 씬 루트 | 루트 오브젝트 `World`(위치 0, 회전 없음, 스케일 1) 아래에 `Terrain`·`Toxic`·`Blockout`·`Background Cards`·`Decals`·`NavWalk`. 씬 루트에 `Lights`(`Pools`·`Shafts`)·`Key Light`(방향광)·`Global Volume`, 그리고 카메라 리그 `RM1_CameraRig`(`Main Camera`(`Foreground Cards` 자식)·`Player Marker`·`CM LOOK-001`, 재생성 뒤. 저장된 씬은 아직 이 셋이 루트에 따로 있음). 모두 월드 좌표 그대로라 오프셋·회전 보정은 필요 없다 |
| 지형 배치 | `Terrain` 위치 = `(48·0.4, −0.5, −200·0.4)` = **(19.2, −0.5, −80.0)** = 타일 x48·y200(남서쪽 모서리) 기준. 크기 `(41.6, 4, 29.6)`u = 타일 104×74. 즉 지형은 **타일 x 48~152 · y 126~200 (px x 1920~6080 · y 5040~8000)** 창만 덮는다. 걷기·막힘·덩어리·수로 데이터는 이 안의 슬라이스 창 타일 x 60~140 · y 138~192만 정식(나머지는 패딩) |
| 지형 높이 | 높이맵 1025×1025, 행 i = 남쪽(ty=200)에서 북쪽으로, 열 j = 서쪽(tx=48)에서 동쪽으로. 월드 높이 = −0.5 + h·4, 범위 −0.5~3.5 |
| 높이 샘플 | `Terrain.SampleHeight(new Vector3(wx, 0, wz)) + terrain.transform.position.y` (빌더의 `GroundY`). 캐릭터·적·드랍은 이 값 위에 얹는다(마커 스프라이트는 `Player Marker` 위 +0.75u). 창 밖 위치의 `SampleHeight` 동작은 확인하지 않았다 → 연결 쪽에서 창 안으로 클램프해서 부르는 것을 권장 |
| 독 수로 | 수면 y = −0.21(지형 위가 아니라 파인 홈). 걷기 칸은 침범하지 않는다(`rm1_walk_overlap.json` 0/0) |
| NavMesh | `NavWalk`: 걷기 타일 사각형만 모은 메시로 구움(반경 0.1u, 복셀 0.04u). Core와 칸 단위 일치(`rm1_navmesh_diff.json` 0/0). 런타임 이동·충돌은 Core가 하므로 NavMesh는 몹 간격 용도 |

### 카메라 LOOK-001 (슬라이스 값)
- 원근, 피치 **0.85rad = 48.70°**(회전 `Euler(48.70, 0, 0)`), 거리 **14u**(= 1400px). 카메라 위치 = 대상 위치 + `(0, sin0.85·14, −cos0.85·14)` = 대상 + **(0, 10.52, −9.24)**. 댐핑 0, 월드 좌표 추적(`CinemachineFollow`).
- 현행 빌더·런타임 카메라 수치는 `Resources/Data/remodel_camera.json` 하나다: 세로FOV46.9453° 고정, 피치48.7014126°·거리14u, 영웅2배·북쪽전방1.45u. 기존 저장 씬은 로드 후 공통값으로 덮어쓰며 다시 굽는 빌더도 같은 값을 읽는다. 이전 H/2800 FOV와 900p35.65°/1080p42.17°는 과거 검수 기록이다.
- 스프라이트 빌보드: 마커 스프라이트 회전 `Euler(48.70, 0, 0)`(카메라 피치와 같은 기울임), 쉐이더 `Rendering/Sandbox/SpriteLit3D.mat`.
- 같은 씬에 카메라 리그(`Main Camera`·`AudioListener`·`CinemachineBrain`·`CM LOOK-001`·`Player Marker`)가 들어 있어 additive 로드하면 `NativeGame`의 `Camera.main`·오디오 리스너와 겹친다. 연결 쪽에서 로드 직후 이 오브젝트를 이름으로 끄거나 `NativeGame` 카메라가 CM에 따르게 해야 한다. **빌더는 이미 고쳤다(맵 총괄 승인 10-28)**: `Main Camera`(+`Foreground Cards`·`AudioListener`·`CinemachineBrain`)·`CM LOOK-001`·`Player Marker`를 루트 `RM1_CameraRig`(위치 0·회전 없음·스케일 1) 하나로 묶는다. additive 로드 뒤 이 루트 하나만 `SetActive(false)`하면 된다. **저장된 `RM1_Slice.unity`는 아직 다시 굽지 않아 예전 배치(리그가 씬 루트에 흩어짐)다** — 재생성은 Unity 실행 순번을 받은 뒤라 그때까지는 이름으로 끈다.

### 보스 아레나 A1 (`RM1_Arena.unity`, 아직 안 만듦)
- 같은 변환: 원점 = 아레나 격자 좌상단 (0,0), x = px/100, z = −py/100, 격자 5120×4320px = 51.2×43.2u. **Core 아레나 중심 (2560, 2160)px = 월드 (25.60, −21.60)**, 걷는 바닥 y = 0 평면(지형 없음 → 높이 샘플은 0 고정).
- 필드 창(x 19.2~60.8, z −80.0~−50.4)과 아레나(x 0~51.2, z −43.2~0)는 월드 좌표가 겹치지 않아 한 번에 로드돼도 충돌하지 않는다.
- 수로 원 중심은 타일 원 중심 (2580, 2180)px = (25.80, −21.80)이고 기둥은 Core 중심 기준이다(`UNITY_RM1_ARENA_20261028.md` §4.1).

## 2026-10-29 웹 화면 비교 수정 후보

인계서 `unity-visual-brief2.md`의 6건을 담당 `codex/pc-unity-visual-ntfs-20261029`에서 처리한다. 웹 기준 game.html blob `1439fadd79e75034ce1e5286a3b885fc67e69c6f`, 검수 해상도 1600×900. 아래는 구현 계약이며 최종 시각 판정은 같은 후보 Player 캡처 뒤에 기록한다.

| 항목 | 현재 후보 값·동작 | 적용 위치 |
|---|---|---|
| 빛줄기 | Hell 1/2 강도 0.035/0.028, 셰이더 상한 0.05, 가로 감쇠 제곱, 세로 0~0.75 진입·0.75~1 퇴장 smoothstep. 바닥 끝 사각형 단절 제거 | 빌더·두 재질·LightShaft.shader |
| 카메라 | 공통 JSON: FOV46.9453°·피치48.7014126°·거리14u·영웅2배·전방1.45u. Core 카메라/판정은 유지. 발끝은 원본240프레임 알파>64 측정값 | NativeRemodelCamera / NativeGame.Remodel3DViewport / Rm1SliceBuilder |
| 필드 톤 | RM-1 로드 뒤 Volume 프로필 사본의 노출 +1.0EV, 채도 -18, 색 필터 (0.82,0.90,1). 공통 렌더 자산은 변경하지 않음 | NativeGame.Remodel3DLoad |
| 피부 결 | 기존 웹 컬러맵 4260×3031의 회색조→blur sigma1→중앙 차분×6, nx=-dx/길이·ny=dy/길이·nz=1/길이를 RGB로 인코딩한 normal. 최대4096, TerrainLayer Colormap normalScale .55 | Ground/ch1_1_r1r2_normal.png, TL_Colormap, 빌더 |
| 피격막 | 원본 색 알파 .25×Core ScreenFlashAlpha. 처음 유효 알파 .0625, Core 감쇠 불변 | NativeGame.OnGUI, B07 정본 |
| 보스 바닥·외곽 | 토양 Bilinear, 시각용 바깥 여백32타일, 점유 한 타일 확장 후 Px8 기준 반경10의 가로·세로 box blur3회로 벽 알파 감쇠. 원래 충돌·걷기·출구는 그대로 | NativeArenaView |
| 피해·상태 문자 | 아래 보스 문자 근거리 재작업 계약으로 교체. 실제몸 예약·유형별거리144/176/208·.18초합계/횟수·필수경고3→수치2→일반예고1→반복0·이동오프셋 유지 | NativeFloatingTextLayout, NativeGame, NativeReviveHud |
| 결과 화면 | 2026-10-30 제작 후보: 실제 시간/처치→보상→측정 통계→저장·로비 행동. 폭560/실제 일반 높이546, 화면여백32 적응 중앙 패널, 표시/포인터 좌표 공유. A22 현행 계약 참조 | NativeStageClearOverlay / NativeStageClearPresentation |

- 문자 배치 회귀: 변경 전 두 번째 문자에서 중첩 실패, 변경 후 40개 밀집 문자·HUD 경계·프레임 초기화·화면 밖 클램프 통과. `unity/Tools/visual-parity-tests`.
- 기준 빌드 `f4642f85` 오류0, 숨은 D3D11 M1 `3c4f97a5` 23/23·종료0·창0·잔여0·USER_SAVE 변경0. 이 증거는 수정 전 기준이며 위 수정 후보의 검수로 재사용하지 않는다.
- 출력: `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/`. 최종 빌드·비교·통합은 진행 중이다.

- 첫 후보 5a340b469의 Win 빌드 69e759cd·M1 bcad8039는 23/23·세이브 변경0. 직접 본 화면에서 노출+.25EV는 피부 결이 지나치게 어두워 시각 반려했고 +1.0EV로 수정한다. 반복 문구는 같은 색/내용·세계거리 x130/y80 이내·120ms 안이면 생성을 합치고 출현 시각만 갱신한다. Core 텍스트 이벤트·값·수명은 바꾸지 않으며, 실제 보스 몸 경계는 화면 배치 금지 영역으로 등록한다. 최종 검수는 다음 후보 영수증으로 구분한다.

- 두 번째 1x 대조에서 피부가 여전히 흐려 기존 색 조정 반복을 중단했다. 컬러맵의 기본 최대2048/NPOT 변환·anisotropic1과 일반 흙 혼합이 원본 주름을 약화시키는 입력으로 확인했다. 컬러맵 최대8192·NPOT 없음·Trilinear·anisotropic8·고품질 압축, 주 레이어 가중치1/추가 흙0으로 바꾼다. WebSkinSurface는 기존 TerrainData의 알파만 수정하고 전체 높이값 전후 동일을 검사한다. normalScale.55와 카메라·노출+1.0은 유지한다.
- 보스의 실제 그림은 generic EnemyView가 아니라 NativeDruidBody.main이었다. 기존 예약 조건은 disabled generic body라 동작하지 않아 현재 NativeDruidBody.Visible/Bounds를 직접 읽도록 수정했다. 소스 값·애니메이션·판정은 그대로다. 다음 Player 실화면에서 이 경로의 글자 가림을 확인한다.

- 원본 피부 단독 가중치 후보 fa3d2e990은 실제 화면에서 거울 같은 점반사가 발생해 반려했다. 설치된 URP17.6 TerrainLitPasses.hlsl 177~194행을 읽어 기존 m_SmoothnessSource=1이 smoothness0을 무시하고 불투명 diffuse alpha1을 표면 매끄러움1로 쓰는 직접 원인을 확인했다. 주 피부 레이어는 m_SmoothnessSource=2(상수), smoothness .08로 고정하고 빌더에도 같은 값을 지정한다. 조명/노출을 다시 돌려서 감추지 않고 재질 입력을 바로잡는다.


## 2026-10-29 NTFS 재개 최종 제작·검수 영수증

- 빌드 입력: `e9dc9700a96613f316f0ea9e0ebff771b3cd000f`, 브랜치 `codex/pc-unity-visual-ntfs-20261029`. 공통 `13c23929eefa1780334935af2c17ba0802d72965`를 정상 병합한 후보이며 작업 브랜치 원격 SHA를 읽어 대조했다.
- Unity 6000.6.7f1 시작 f8eca84f 성공. 최종 Win64 빌드 8e05c001 컴파일0·BuildReport 오류0. 숨은 D3D11 Player 1dbb47b3 M1 23/23, RX9070XT, 사용자창0·잔여0·USER_SAVE 변경0.
- 기존 성공 피격 oracle 3000사례·47559검사·불일치0은 현재 Core 트리/웹 블롭이 동일해 보존했다. 새 oracle 실행으로 세지 않는다. 새 화면 배치의 40개 밀집 문자·HUD 경계·보스 예약20개 검사는 통과했다.
- RM-INT: 2D 2d585d6f와 최종3D 16b5187b 각1800틱·180기록·해시11640a5da4a88c94·기록 불일치0. 2D 실행본과 최종 실행본의 Runtime/Core DLL 바이트 동일을 확인하여 같은 성공검사를 반복하지 않았다.
- 제작자 제출 당시 자체 PASS 표기는 아래 중앙 CTO 독립 판정으로 대체한다. **최종 RETOUCH 기술 통합이며 6항목 전체·보스 리마스터·AAA 완성 PASS가 아니다.**

| 요청 | 최종 직접 확인 | 비교 이미지(1600×900 원본을 좌우 배치) |
|---|---|---|
| 거대한 붉은 빛줄기 | 시야를 덮던 띠·끝 사각면 제거, 약한 광원 흔적만 남음 | I:/EXODUSER-Storage/unity-visual/compare_01_빛줄기.png |
| 피격 붉은 막 | 지형·캐릭터가 읽히는 약한 반응. Core 초기.25×색.25=.0625 | I:/EXODUSER-Storage/unity-visual/compare_02_피격막.png |
| 작은 캐릭터 | 웹과 유사한 원본 픽셀 높이로 복원. 카메라 H는 실제900 | I:/EXODUSER-Storage/unity-visual/compare_03_카메라.png |
| 평평한 분홍 바닥 | 기존 피부 컬러맵 주름·혈관과 냉한 회색 톤 복원, 잘못된 알파 광택 제거 | I:/EXODUSER-Storage/unity-visual/compare_04_피부바닥.png |
| 보스 바닥·문자 겹침 | 토양 경계 완화, 실제 드루이드 몸 경계에 글자0, 피해·상태 문자 공유 배치 | I:/EXODUSER-Storage/unity-visual/compare_05_보스문자.png |
| 클리어 경계·작은 글자 | 검은 계단 단절 제거, 제목21px·결과폭368px·버튼하단80px | I:/EXODUSER-Storage/unity-visual/compare_06_클리어.png |

웹은 정확 game.html 블롭을 별도 서버로 읽고 상태를 고정해 캡처했다. 페이지오류0·사용자창0, 캡처 실행 ee73ec65/실제 보스AI 34e22765. 이는 실제 OS 입력 종단 검수가 아니다. 보스 AI 프레임·레벨·통계·방향/모션 프레임이 완전히 같다는 주장은 하지 않는다. 보스 바닥과 글자·실루엣 가림, 결과 글자 크기/외곽을 비교하는 근거다.

### MAP PRODUCTION REPORT

| 구분 | 이번 범위와 판정 |
|---|---|
| STAGE | CH1-1 RM-1 시작~R2 및 기존 드루이드 아레나/출구 표현 |
| MASTER | 기존 실루엣·구역·주 경로·곁공간 유지. 새 맵 설계0 |
| OUTER MASS | 좌/우/상/남 덩어리·큰 구멍 재설계0. 기존 둥치 반복 실루엣은 맵 담당 재작업 |
| LARGE | 기존 웹 피부 컬러맵·기존 메시 사용. 새 합성/실루엣 제작0·새 충돌 덮침0 |
| MEDIUM | 기존 연결 유지. 외곽 중간 연결의 전체 품질은 별도 미완성 |
| GROUND | 기존 높이 전후 동일. 컬러맵 주름/normal·매끄러움.08·광원 연결 수정, 오염·혈관 원본 유지 |
| PLAYABLE | 넓은 전투공간·이동/휴식/위협 공간·Core 불변. M1 전투23/23, 보스 문자 가림 개선 |
| LANDMARK | 주/보조/세부 랜드마크 변경0·전체 리모델 판정 대상 아님 |
| CAMERA QA | START/EARLY는03-move, ARENA는11a, EXIT는13 캡처 직접 확인. SIDE L/R·LANDMARK·LATE 전체 맵 독립 시각 검수는 미실행, RM-INT start/mid/north/east 보조 증거 |
| TECH QA | 자연 보스 게이트/출구 M1통과·Core 충돌/전투 기록 동일. 웹 pageerror0. 404는 전수 검증 아님. 아레나 계단 seam 해소. UPM/로딩 성공. 성능 수치는 이번 최적화 PASS로 주장하지 않음 |
| FILES | 자기 시각 코드·피부 입력·관련 docs만 반영. 자동 임포트450파일은 I:에 SHA 보존 후 현재HEAD 바이트 복구. tools/guard.baseline.json·미추적 meta는 별도 보존 |
| GIT | 정확경로 커밋·비강제push. 지정된 동일 담당이 후보273773008을 unity/main에 반영하고 일반 바로가기를 검증 exe로 연결, 아래 최종 인수 근거 참조 |
| VISUAL VERDICT | 중앙 CTO 독립 판정 RETOUCH. 붉은 띠·피격 알파·피부 주름·계단 단절의 제한 개선만 인수, 6항목 전체 PASS 아님 |
| NEXT PASS | 전투표현/UI: 보스 문자 확산·대비 및 클리어 통계·문구·LV/SP 겹침. 맵: 외곽 조형·지면 접합. Mac 소유자: 소스 반영·실행 검수 |

최종 영수증은 `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/최종-검수영수증.json`. `COMMON_RULES.md`의 지정 unity-integrator 제한 때문에 시각 담당의 직접 unity/main push/바로가기 교체는0이다. 구 update_unity_latest.ps1는 직접 Unity 실행·이전 빌드 삭제·구 E 경로가 포함돼 사용하지 않았다. 인계서에 허용된 대체 경로로 검증된 exe를 기존 바로가기 백업 후 연결하는 구체 절차를 준비한다. 기존 사용자 실행본·세이브·창은 보존한다.


## 2026-10-29 지정 통합 최종 인수 — RETOUCH 기술 반영

작업ID `unity-ntfs-visual-reviewed-integration-20261029T140030Z`. 중앙 Codex CTO가 기존 NTFS 담당을 이 한 건의 unity-integrator로 지정했다. 같은 G 작업본·세션에서 수행했으며 새 팀/작업본/CLI writer를 만들지 않았다.

| 경계 | 최종 결과·근거 |
|---|---|
| 소스/원격 | expected unity/main13c23929eefa1780334935af2c17ba0802d72965를 fetch·원격조회·조상검사 후 정확 후보273773008115698a005138fa4ff741a3cc1d8d17로 비강제 fast-forward 반영. 원격 SHA 동일 확인. 다른 대기 Mac/runner/보스 후보 추가0 |
| 빌드입력 | e9dc9700a96613f316f0ea9e0ebff771b3cd000f와 후보의 unity tree1f77e160a60a93317d24b24998095a90935fc2cd 동일. 후속은 검수문서만, Unity 입력 변경0 |
| 기존 실행 증거 | Win 빌드8e05c001 컴파일0/빌드오류0, Player1dbb47b3 M1 23/23·창0·잔여0·USER_SAVE0, RM-INT2D/3D1800틱·180기록 전체동일/해시11640a5da4a88c94. 기존 oracle 재사용과 새검사 구분 유지. 성공 빌드/M1/oracle/웹 검수 반복0 |
| 실행파일 | I:/EXODUSER-Storage/unity-visual/ntfs-20261029/accepted-build/EXODUSER-Unity.exe, SHA256 9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2 재대조 |
| 일반 바로가기 | 바탕화면 지옥의 길 (Unity).lnk만 위 exe로 연결. 인자 -force-d3d11 --remodel3d, 시작폴더 accepted-build, 아이콘 같은exe,0. 저장 후 네 속성·해시·반영시 원격273773008 재조회 |
| 보존 | 일반 바로가기 변경전 사본은 원래와 동일 SHA c2e22c41f88f6089e9270db8ce610757d7907cfe2f26ec80cd34676716900ebb. 미리보기 바로가기 SHA ac9a0cf88cee2739e33c195ed84cd361daf079b9ee529cacc092f9254e4560d0 전후동일. 구 실행본·unity-latest 폴더·사용자 게임/세이브·양쪽guard·MP4원본/임포트사본·oldI·과거실패 기록 보존 |
| 작업 제외 | 자동 사용자앱 실행0, Unity 새시작0, 구 updater 사용0, 외부배포/Steam/SetLive0, 비용/삭제/OS·신뢰·예약설정 변경0, CTO_STATE 쓰기0 |
| 공백 예외 | root의 전체 diff --check는 normal.png.meta의 Unity 생성 빈 scalar7행 trailing whitespace 때문에 status2. root-intake-cosmetic-exception.json의 제한 검증exit0·의미영향없음 예외를 이 단위에서 인수. 전체 diff-check PASS로 기록하지 않음, 원본/검사설정/빌드 변경0 |

### 중앙 CTO 독립 시각 판정 — 최종 RETOUCH

root가 compare_04/02/05/06과 accepted-m1/caps의03-move·11a-druid-volley·13-stage-clear를 실제1600×900로 직접 확인했다. 거대한 붉은 띠 제거·피격 알파 계약·피부 주름 복원·검은 계단 단절 해소만 제한 범위에서 인수했다. **회귀 없는 기존 기술 수정의 분리 가능한 RETOUCH 통합**이며 6항목 전체·보스 리마스터·AAA 완성 PASS가 아니다. 신규 FAIL 보스 아트 채택0. 앞선 제작자 자체 PASS 표기는 이 독립 판정으로 대체한다.

| 남은 결함 | 담당·다음 실제 검수 대상 |
|---|---|
| 보스 문자 좌우 열의 과도한 확산·낮은 색 대비 | Unity 전투표현/UI 담당: 실제 밀집 보스전에서 배치폭·대비 수정 후 같은 시점1x 비교 |
| 반복 외곽 둥치·지면 접합 | 맵 담당: 외곽 큰형태/중간연결/접지 리모델 후 실제 게임 카메라·전투 가독성 검수 |
| 클리어 미이식 통계·하단 희미한 문구·상단 LV/SP 겹침 | Unity UI 담당: 실제 상태 연결·대비·겹침 수정 후 클리어1x 검수 |

이 단위의 source 통합과 로컬 바로가기 연결은 완료했다. 손 조작 Player 종단검수·Mac 반영/실행·전체 맵/보스 리마스터 완성은 별도이며 이번 증거로 완료 처리하지 않는다. MAP PRODUCTION REPORT의 최종 VISUAL VERDICT는 **RETOUCH**다. 위 남은 결함은 후속 담당의 다음 패스이며 이 한 건 결과 제출 후 대기한다.

실제 근거: I:/EXODUSER-Storage/unity-visual/ntfs-20261029의 지정통합-선행확인.json, 지정통합-소스반영.json, 통합-바로가기-선행확인.json, shortcut-after.json, root-intake-cosmetic-exception.json, 지정통합-최종영수증.json. 제품소스 반영 SHA와 그 뒤 문서 전용 SHA를 최종 영수증에서 분리한다.


## 2026-10-29 보스 문자 근거리 재작업 후보

작업ID unity-boss-text-locality-rework-20261029T142030Z, 기존 private 브랜치·G NTFS 작업본 유지. 이번 소유 범위는 NativeFloatingTextLayout/NativeGame의 피해 표시/NativeRevive의 상태 표시·최소검사이며 Core·피해량·AI·Q/E규칙·저장·모델·맵·카메라·결과화면은 변경0이다. 이전 통합 권한은 종료, 이번은 제작 후보 제출이다.

### 원인·실패 재현

기존 Place는 숫자부터 배치한 뒤 top~120 사이 행과 좌우 열을 최대512회 전역 탐색했다. 실제 보스 예약상자(760,90,400,500)에서 원점(960,450), 폭90/높이32 문자의 표시중심이294.4px 떨어지는 실패를 재현했다. 프레임마다 전역 탐색하고 상태 수명에 최소.9초를 적용해 M1의 가속 틱에서 예고가 긴 열로 누적됐다.

기존11a는 M1Check의 실제23상태 AI 경로이나 매30틱yield/null로 가속되며, 매틱 플레이어HP/쉴드 회복·420틱뒤무적·170틱마다HurtEnemy로 보스HP단계 진행을 보조한다. 별도 문자 대량 직접주입은0이며 art-a의8발/11c의pool 수동주입과 구분한다. 싸움 전체86피격·254발/53드롭 로그는 있으나11a 한장의 사건원장/자연대하네스피해 비율은 없어 미확정이다. 이 고밀도 한장을 자연플레이 전체로 보지 않는다.

### 현행 표현 계약

| 항목 | 값·동작 |
|---|---|
| 좌표·반경 | 1920×1080 논리좌표, 표시중심-사건원점 거리: 일반숫자/반복정보≤144, 일반예고≤176, 필수경고≤208. 1600×900 실제화면에서는 각각120/146.7/173.3px. 사건원점은 ToGUI(원래 이벤트x,y), 기존 피해만의 위100px 이동 제거 |
| 탐색 | 기존 전역 rows/column 제거. 원점 위/아래30, 반경36단계의8방향, 예약몸의가장가까운변과 그 아래 x±60/120 등 유한한 근거리 후보만. 몸/앞선글자2px여백과 충돌하거나 반경을 넘으면 원래수명내 다음프레임 대기, 먼열로 내보내지 않음 |
| 앵커 안정 | 메시지ID별 상대오프셋 캐시, 유효하면 같은오프셋으로 이동. 움직인몸/상위경고가 침범할 때만 근거리 재배치. 캐시 미사용2초 뒤 회수 |
| HUD·크기 | 화면 x8~1912, y128~864. 미니맵(0,0,160,176), 우상단목표(1600,0,320,190), 실제 드루이드 SpriteRenderer bounds 예약. 글자상자 최대312×68, 긴문구는최대2줄. 숫자/일반24, 필수26, 굵게·검정외곽2px |
| 순서 | 필수경고3→수치2→일반예고1→반복정보0. 같은등급 숫자는집계건수많은것이먼저, 나머지는최근사건먼저. 파괴/패링/PARRY/Q!/E!/사망/부활/구울/쓰러/집중/보호막 및 대응영문을3으로 분류. 그밖의느낌표문구1, 나머지0 |
| 집계 | 같은유형/색/부호채널, 사건x차≤96/y차≤72, 마지막유입으로부터.18초 안의 숫자는합계와 ×횟수로 표시. 반복동일문구도 ×횟수. 원점은건수가중평균. 예:12×40→480 ×40, 실제수치총합·Core 이벤트는불변 |
| 예고 교체 | 같은근거리의 일반예고는현재2개, 반복정보는현재1개. 새예고가오면오래된동급만교체하며 필수경고·숫자는그교체대상아님. 급한경고공간우선, 혼잡시는낮은등급만지역내대기 |
| 시간 | ReviveText.Life/60초 그대로, 미지정은35/60초. 기존최소.9초 제거. 적HP/쉴드피해는기존1초. 합쳐진그룹은마지막사건의표시수명을최대입력수명으로유지 |
| 대비 | 웹일반문구흰색·검정외곽 계약 적용. 필수문구 (1,.96,.78), 숫자원색을흰색으로.55보간하여채널색유지·밝기보강. 웹처럼마지막20%시간만알파감쇠(앞80%불투명) |
| 검사 | 수정전거리208상한실패(실측294.4), 수정후38검사통과: 합480/40건·우선배치·일반예고2개·경고보존·숫자전체숨김방지·유형별반경·비중첩·HUD·이동오프셋·화면밖끌어옴방지·28f수명·반복횟수 |

### 실제 후보 화면 검수 계획

선택플래그 --unity-boss-text-smoke는 명시적 --unity-qa-sandbox/-output/--unity-boss-direct 0 없이는종료한다. 일반실행·기존M1은이경로를실행하지않는다. 기존프리뷰진입 API로격리캐릭터없이보스장에직접들어가 실제AI·StepInput 공격을약60틱/초 진행한다. 플레이어HP/쉴드매틱회복은관찰보조이며 손조작·자연입장검수아님을별도표시한다. 문자주입0인실제AI저밀도(1~2개)/중밀도(3개이상)와, 그뒤분리한합성고밀도(12피해40건+예고10+Q/쉴드파괴2)를별도캡처한다. 합성뒤12틱오른쪽실제이동입력으로앵커변화를검수한다. 전은기존accepted11a1600×900을재사용, 후는같은해상도캡처와사건/표시거리JSON을함께제출한다. 이번단위는새후보빌드·표적캡처가필요하며 기존Core oracle/이전빌드/M1/웹성공검사는반복하지않는다.

후보의Unity컴파일·GPU·실화면·root독립검수는 아직미검증이다. 유한배치검사통과로시각PASS를대신하지않는다. 산출물: I:/EXODUSER-Storage/unity-visual/boss-text-20261029/.


### 첫 실화면 재작업과 최종 우선순위 수정

후보05bf6ec0c의새빌드6572667c는컴파일0/빌드오류0, 표적Player4cc2be4a 종료0·창0·잔여0·USER_SAVE0. 실제AI저밀도2개/중밀도4개는거리103.8~137.7 안에서읽혔으나, 별도합성고밀도에서일반예고2개가숫자보다먼저공간을차지해480 ×40이대기했다. 이화면을완료로채택하지않는다. 실제GPU상자치수로새실패검사를추가해한번실패를재현한뒤, 필수3→수치2→일반예고1→반복0으로유형순서를수정했다. 같은등급수치는집계건수우선으로하여이동중새159단발이40건집계를밀어내지않는다. 반경/글자크기/탐색횟수만확대한수정아님. 실제치수수치보장·신규단발경쟁까지최종40검사통과, 다음후보새빌드·실화면으로별도검수한다. 처음캡처·실패로그는보존한다.


### 최종 후보 표적 실행·1x 제작자 판정

- 실제빌드입력 `21a66acad50c4e42d7527887ec41310d3af727c8`, private브랜치 codex/pc-unity-visual-ntfs-20261029. 새Win64빌드37de2a1e: Unity6000.6.7f1·컴파일0·빌드오류0·셰이더오류0. 새표적Player5c8dcdaf: D3D11/RX9070XT·정상종료0·창0·잔여0·USER_SAVE0. 이번은문자전투QA이며 전체M1새PASS라고부르지않는다.
- 의미있는검사40통과. 기존Core tree23ae5783080d45cb40804b4b59b1e9b8f7811244 동일, 기존oracle재사용이며 새실행0. 이전성공빌드/M1/웹검수 반복0. 첫후보의고밀도수치대기실패는보존하고새소스때문에두번째빌드/표적캡처를실행했다.

| 실제 장면 | 표시/대기 | 사건-표시중심 최대거리(논리px) | 제작자1x 관찰 |
|---|---|---|---|
| 자연AI 저밀도 | 2/0 |153.85(일반예고), 숫자91.75 | 가속M1의긴좌우열이없고연격예고·피해집계가사건근처에서읽힘 |
| 자연AI 중밀도 |4/0|140.67, 숫자113.20/128.72| Q경고·쉴드피해합계·적피해·속박문구를몸밖에서읽음. 문자는흰외곽과밝은채널색, 발사체궤도구분유지 |
| 별도합성 고밀도 |5/0|154.34(일반예고), 집계143.31| Q/쉴드파괴와480 ×40(40건합계480)이함께표시. 일반예고는현재2개. 숫자전부숨김이나먼열이동0 |
| 합성사건+12틱이동 |6/0|167.14(일반예고), 수치143.31/114.72| 집계480 ×40 유지·새실제잔여공격159도표시. Q·쉴드파괴·집계의상대오프셋전후차0/0/0.000061논리px. 신규수치가우선배정되며일반예고는한번재배치됨 |

이동프레임의159는고밀도주입40건과별개의잔여실제공격사건이다. 이프레임을순수합성40건만의결과로세지않는다. 거리원점은그룹사건위치(숫자집계의경우건수가중평균)다. 위프레임과검사에서몸예약/HUD 경계·숫자/문자비중첩을확인했으나모든공격/언어/해상도/장시간플레이를검증한것은아니다.

**제작자 판정: 국소목표(긴전역열·낮은대비·고밀도수치소실) 개선을1x에서확인한 후보. 최종등급은 RETOUCH 유지, root독립검수대기.** 보스리마스터·전체아트/게임PASS가아니며문자개선의반영완료도아니다. 이번승인은제작후보제출만이므로 unity/main push·바로가기교체·다른큐인수0. 이번한건제출뒤대기한다.

| 근거 | 경로(I:/EXODUSER-Storage/unity-visual/boss-text-20261029 기준) |
|---|---|
| 기존 전 | ../ntfs-20261029/accepted-m1/caps/11a-druid-volley.png |
| 같은해상도 전후 | 전후_natural-low.png, 전후_natural-medium.png, 전후_synthetic-high.png (좌우각1600×900, 이벤트시점/밀도차이를표제에명시) |
| 실제1x 원본·잘라보기 | candidate2-caps/*.png, 1x_natural-medium.png, 1x_synthetic-high.png, 1x_synthetic-moving.png |
| 사건표시기록 | candidate2-caps/text-review.json, 실화면-거리-앵커검수.json |
| 검사·실패·보존 | 의미있는-검사결과.json, 원인-분리.json, source-before/, candidate-caps/첫실화면, 자동임포트-보존복구.json |
| 최종영수증 | 후보-제출영수증.json |

Unity자동임포트450파일은이번I보관사본·SHA대조후prebuild입력/현재HEAD바이트로복구했고guard바이트전후동일·INDEX비어있음을확인한다. normal.png.meta 생성빈scalar7공백예외는수정하지않고원인이력유지, 전체diff-check PASS를주장하지않는다. 사용자실행본/세이브·oldI·원본MP4/자동메타·과거실패카운터·다른WIP 보존. 새팀/writer/worktree·비용·삭제·reset/stash/force·권한/신뢰/OS설정·배포·서버재시작·CTO_STATE쓰기0.


## 2026-10-30 보스 문자 지정 통합·변경 Runtime 최초 M1 인수

작업ID `unity-boss-text-reviewed-gate-integration-20261030T000030KST`. 중앙 CTO가 기존 동일NTFS 담당을 이한건 unity-integrator로지정했다. 위제작단위의제출/통합대기기록은그당시상태이며, 현재게이트는아래로갱신한다. 새세션/작업본/CLI writer 추가0.

| 게이트 | 최종 확인 |
|---|---|
| 정확한 소스 | expected unity/main14bcb6eff2b3770dfa8d8da5c1d3e6b84f607120을fetch/원격조회/조상검사하고 제품후보f4d8af17bd80f70dc846ea3cb281d4ba99bf6fd1로정상비강제fast-forward. 다른Mac/runner/보스후보추가0 |
| 빌드 입력 | 실제빌드입력21a66acad50c4e42d7527887ec41310d3af727c8·후보f4의Unity tree9f61da18c54056f7674b30cfd78a221cbcb201ff 동일. 후속은검수문서만이며최종원격SHA는최종영수증에서분리 |
| 새 필수 회귀 | 동일candidate2-build의변경Runtime에대한최초전체M1 b3e441ca,23/23·첫막힘없음·정상종료0·D3D11/RX9070XT·창0·잔여0·USER_SAVE0. 실제실행경로는아래candidate2-build. 단계별기록은통합-새M1-단계영수증.json. 이전accepted M1을이번후보에소급하지않음 |
| 실행 전 조건 | 15:05:37Z Unity/UPM/Player0·잠금없음·큐/티켓0·커밋여유26.67GiB·G/E NTFS·E여유1267025588224바이트. 프로젝트/Library G·DOTNET/UPM E·출력I. 이조회값은그시점값이며향후예약보장아님 |
| 후보 증거 묶음 | I:/EXODUSER-Storage/unity-visual/boss-text-20261029/candidate2-build/EXODUSER-Unity.exe + 빌드37de2a1e영수증오류0 + Unity트리 + Runtime DLL a66d17270d9bdb6db740bd1ca6c6e5abf6e098eabd7ad2206d7cf56102d6b5a1 + Core DLL e6d89a07efae6882c3062ac6b9d9fe1d8acdb00340d3a671ba175282a2ab65c5. Launcher exe의9806abde해시는이전과같으므로단독후보증거로쓰지않음 |
| 일반 바로가기 | 기존14b의accepted-build target/args/workdir/icon일치확인후고유백업을만들고 candidate2-build/EXODUSER-Unity.exe, 인자 -force-d3d11 --remodel3d, 시작candidate2-build, 아이콘같은exe,0으로연결. 저장후네속성·Managed해시·원격f4 readback일치 |
| 고유 백업·보존 | boss-text-20261029/지옥의 길 (Unity)-보스문자통합전-20261030T000030KST.lnk, SHA b735d94faefaee76170d8f617b81640fede0bc15cb81a8c5c307f10153b7cc6e. 미리보기SHA ac9a0cf88cee2739e33c195ed84cd361daf079b9ee529cacc092f9254e4560d0 전후동일. accepted-build/구unity-latest·사용자창/세이브·oldI/양쪽guard·MP4원본/자동사본·과거실패/7공백예외보존 |
| 반복/제외 | 새빌드0·기통과표적캡처/40검사/Coreoracle/웹QA반복0. 이번새M1은변경후보최초통합회귀로서이전성공검사의동일바이트재실행이아님. 사용자앱자동실행/구updater/이전빌드삭제/비용/권한·신뢰·OS예약/외부배포·Steam·SetLive/자동서버재시작/CTO_STATE쓰기0 |

### root 독립 시각 인수 — RETOUCH

root가 candidate2-caps/natural-medium.png·synthetic-high.png·synthetic-moving.png를실제1600×900로직접봤다. 긴전역열제거·480 ×40(40건합480)+Q/쉴드파괴동시표시·가까운사건위치·대비·이동앵커유지의국소개선을인수했다. 문자는여전히보스발아래작은묶음으로모이며중요도별크기/시각계층의추가다듬기가남아있다. **최종 RETOUCH 기술 통합, 전체맵/보스리마스터/AAA PASS0·신규FAIL아트채택0**이다.

기존전은가속M1, 후는직접보스입장·생존보조·StepInput 실제AI/분리한합성이다. 같은사건전후·손조작E2E로부르지않는다. 새전체M1통과도이시각판정을PASS로올리지않는다. 기존05후보고밀도숫자대기실패→실제치수실패재현→유형우선순위수정→40검사/표적전투성공이력은그대로보존한다.

최종소스통합·일반바로가기연결·문서인계만완료하고이한건결과제출뒤대기한다. 손조작/장시간/전언어·전체리모델·Mac반영/실행은별도미검증이다. 근거는동일boss-text-20261029폴더의 통합-소스선행확인.json, 통합-새M1-단계영수증.json, 통합-원격제품반영.json, 통합-바로가기-변경전/후.json, 통합-최종연결확인.json, 통합-최종영수증.json. 전체기존7공백예외를포함한diff-check PASS를주장하지않으며이번문서경로검사와구분한다.

## 2026-10-30 클리어 표시 재작업 제작 후보

작업ID `unity-stageclear-presentation-rework-20261030T002030KST`. 정확한 제품 후보/실제 빌드 입력 `2376c58584281c4fa74352da75f45311bddbd466`, Unity tree `02a7af43c255640ce5cf547e54b33956946762bd`. A22 SSOT의 현행 데이터·배치·언어/진단·최종 영수증을 따른다. 제목/실제 시간·처치/실제SP/측정통계/저장·로비 행동을 한 패널로 정리하고 완료 중 HUD/LV/SP/타이머 중첩과 내부 미이식/중복줄을 제거했다. Core/점수공식/경제/저장/맵·카메라·보스아트 불변.

새빌드 d8684b11 오류0, 최종표적 Player143c1383 D3D11/RX9070XT·170/170·32프레임·창0/잔여0/USER_SAVE0. 실제 Core 이벤트는 QA 직접진입/생존보조/강제처치로 1/168·16초·SP10, 별도137/168·88초는 기존M1확인값복사 화면이다. 자연M1/손조작/같은사건 전후 아님. 1600원본과960작은창·긴언어1x직접판정은 **클리어 국소개선 확인 / 전체RETOUCH·root독립검수대기**. 새 Runtime 전체M1은 미실행, 이전23/23 소급0. 원본웹/기통과Coreoracle/M1 반복0. 기존 첫 QA5실패/컴파일원인·7공백예외·보스문자추가다듬기/전체리마스터/외곽접합 잔여를 보존한다. 최종 비교·영수증: `I:/EXODUSER-Storage/unity-visual/stageclear-20261030/최종_전후_같은표시값_1600.png`, `후보-제출영수증.json`. 이번 private 제출만, 통합/바로가기갱신0.

## 2026-10-30 클리어 표시 지정 통합 게이트

중앙 root가 제품후보 `5f2996dccdd7d5b4dea732ea71d224db1970447a`의 소스·170검사·143c1383·1600/960/긴번역1x를 독립 인수했다. root 판정은 **기술 RETOUCH**: 중복/미이식표시·버튼좌표 개선 인수, 패널재질/완성도·30영문폴백·점수/등급 미구현 잔여. 보스리마스터/문자계층/외곽접합 등 전체RETOUCH 유지. 실제빌드입력2376c5858/Unity tree02a7af43 불변, 정확candidate3-build Runtime89440bab/Coree6d89a07을 대조했다.

이번 변경Runtime 최초전체M1 **47961226 23/23**·D3D11 RX9070XT·정상종료0·창0/잔여0/USER_SAVE0, 실제13은137/168·88초·지역4·SP10. Simulation.Tick/API 가속 하네스로 손조작E2E 아님. 이전M1소급/기통과표적QA·번역·빌드/Coreoracle 반복0. expected unity/main a2f5058652a91b10ca1357f4a9c39db99a0cbadf를 다시 대조한 이번 지정integrator만 후보+필요docs 비강제 반영·일반바로가기 고유백업후candidate3 연결을 진행한다. 최종소스/연결readback은 `I:/EXODUSER-Storage/unity-visual/stageclear-20261030/통합-최종영수증.json`, A22의 지정통합절과 `통합-새M1-단계영수증.json`에 연결. root 수신의 failed키 혼동은 실제 failures=0/170 확인으로 정정, 제품실패/카운터증가0. 기존실패·7공백예외/WIP·guard·oldI·MP4/구실행본·세이브 보존, 전체PASS0.
