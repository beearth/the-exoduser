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
- 세로 FOV = `2·atan(H / (2·1400))`. 슬라이스 캡처는 H=900(1600×900)이라 **35.65°**. 게임 기준 1920×1080(H=1080)이면 **42.17°**. 현재 이식 게임 카메라는 정사영 5.4(화면 높이 10.8u = 1080px). 평면 거리 14u에서 H=1080 FOV를 쓰면 대상 평면에서의 보이는 높이가 10.8u로 같다. 어느 값을 쓸지는 연결 쪽 결정.
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
| 카메라 | 실제 화면 높이 H로 2·atan(H/2800), 900p 35.65도. 거리 14u·피치 .85rad·Core 카메라/판정은 유지 | NativeGame.Remodel3DViewport |
| 필드 톤 | RM-1 로드 뒤 Volume 프로필 사본의 노출 +0.25EV, 채도 -18, 색 필터 (0.82,0.90,1). 공통 렌더 자산은 변경하지 않음 | NativeGame.Remodel3DLoad |
| 피부 결 | 기존 웹 컬러맵 4260×3031의 회색조→blur sigma1→중앙 차분×6, nx=-dx/길이·ny=dy/길이·nz=1/길이를 RGB로 인코딩한 normal. 최대4096, TerrainLayer Colormap normalScale .55 | Ground/ch1_1_r1r2_normal.png, TL_Colormap, 빌더 |
| 피격막 | 원본 색 알파 .25×Core ScreenFlashAlpha. 처음 유효 알파 .0625, Core 감쇠 불변 | NativeGame.OnGUI, B07 정본 |
| 보스 바닥·외곽 | 토양 Bilinear, 시각용 바깥 여백32타일, 점유 한 타일 확장 후 Px8 기준 반경10의 가로·세로 box blur3회로 벽 알파 감쇠. 원래 충돌·걷기·출구는 그대로 | NativeArenaView |
| 피해·상태 문자 | 하나의 화면 배치 공유. 피해 font24, 검정 그림자(1,2), 측정 폭+12, 숫자 높이32/상태36, 간격4, 화면 x8~1912/y120~936 안에서 위→좌우로 배치. 512시도 초과 시 해당 프레임 숨김 | NativeFloatingTextLayout, NativeGame, NativeReviveHud |
| 결과 화면 | s=min(1,화면폭/1280,화면높이/900), 중앙 정렬·하단80×s 고정. 1600×900에서 원래 21px 제목·368px 결과폭 유지 | NativeStageClearOverlay |

- 문자 배치 회귀: 변경 전 두 번째 문자에서 중첩 실패, 변경 후 40개 밀집 문자·HUD 경계·프레임 초기화·화면 밖 클램프 통과. `unity/Tools/visual-parity-tests`.
- 기준 빌드 `f4642f85` 오류0, 숨은 D3D11 M1 `3c4f97a5` 23/23·종료0·창0·잔여0·USER_SAVE 변경0. 이 증거는 수정 전 기준이며 위 수정 후보의 검수로 재사용하지 않는다.
- 출력: `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/`. 최종 빌드·비교·통합은 진행 중이다.
