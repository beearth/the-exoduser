# Unity RM-1 보스 아레나 A1 (1-1 다크드루이드, si0) — P0 계획 (2026-10-28)

담당 RM-1 세션(Sonnet), 판정 맵 총괄. 명세 `E:/exoduser-wt/_out/rm-arena/SPEC_ARENA_CH1.md`. 브랜치 `claude/unity-pc-rm1-20261027`. 이 단위는 **P0 = 코드 읽기·계산·계획**이다. Unity 실행 0, Core·Rendering·Remodel/Common·ProjectSettings·Packages 변경 0줄.

산출물: 이 문서, 좌표 json `unity/Assets/Exoduser/Remodel/CH1_1/Arena/Data/rm1_arena_layout.json`, 계산기 `unity/Tools/rm1-arena-layout/arena_p0.py`(`python arena_p0.py <outDir>`, Pillow·numpy), 탑뷰 1장 `E:/exoduser-wt/_out/rm-arena/rm1_arena_top.png`(1480x1280, 1px = 월드 4px, 용량이 커서 git 밖).

## 1. 지금 런타임이 아레나를 그리는 방식 (읽은 곳)

| 파일 | 내용 |
|---|---|
| `Runtime/Core/BossArena.cs` `BossArenaLayout.Generate(si)` | 웹 `genBossArena` 1:1. 격자 128×108, 1타일 40px. 1장 si0~3 = `ArenaType[SiToHell[si]]` = 0(원형). `rr = min(124,104)/2 - 1 = 51`, 타일 (x-64)²+(y-54)² ≤ 51² 이 바닥(4), 걷기 칸과 벽(1)이 만나는 바닥은 룬(5). 충돌 `Blocked`·`CanMove`는 **타일 값 1과 격자 밖만** 막는다 |
| `Runtime/NativeArenaView.cs` | 2D 스프라이트 두 장. ① `Boss Arena Soil`(sortingOrder -30001): `Resources/Art/map/boss_arena/ground_dark_soil` 타일 반복 1텍셀=웹 1px. ② `Boss Arena Floor`(-30000): 벽 타일(1)마다 평평한 남색 (3,6,10) 불투명 마스크 + 출구 열리면 3타일 불빛. 룬(5)은 따로 그리지 않는다 |
| `Runtime/NativeGame.StageFlow.cs:93-116` `StageFlowSyncViews` | `Simulation.Stage.InArena`가 켜지고 `arenaView == null`이면 필드 청크·소품·적 뷰를 지우고 `new NativeArenaView(transform, flow.Arena)`. 나가면 `DestroyArenaView`. 출구가 열리면 `Rebuild(true, ex.X, ex.Y)` |
| `Runtime/NativeGame.cs:50-52` | 게임 카메라 = `Camera.main`, 정사영 5.4, **2D(XY 평면)**: 월드 x = px/100, y = -py/100 |
| `Runtime/Core/DruidBoss.Pillars.cs` | 기둥 = Core 데이터뿐. `EnsurePillars`가 보스전 첫 틱에 `ArenaCx/Cy = (ArenaW/2, ArenaH/2) = (2560, 2160)`, 링 = `(min(W,H)/2 − 3타일 = 2040) × 0.55 = 1122px`, 45°+90°k, 반지름 80px로 4개 만든다(`Pillars` 목록). 아무 그림도 없다 |

**필드 RM-1이 쓰는 연결 방식은 "연결"이 아직 아니다.** 필드 슬라이스는 에디터 빌더(`Rm1SliceBuilder`)가 굽는 **독립 3D 씬** `RM1_Slice.unity`(XZ 평면, `Player Marker` 1개)이고, 런타임 게임(2D XY 스프라이트 + 정사영 카메라)이 그 씬을 불러 쓰는 코드는 unity/main에 없다(`SceneManager`·`Remodel` 참조 0건, RM0 문서도 "월드 3D화·카메라 교체는 RM-1 이후"). 아레나도 같은 방식으로 간다.

## 2. 방안 (한 가지)

**아레나 = 굽는 3D 씬 + 렌더 전용 컴포넌트, 값은 Core에서 읽는다. 공용 파일 수정 0줄로 P1까지 간다.**

1. 빌더 `Editor/Rm1ArenaBuilder.cs`(멱등, `Run`·`Capture`·`Fps`, `Rm1SliceBuilder`와 같은 인자·좌표 규칙 x=px/100, z=-py/100)가 `Remodel/CH1_1/Arena/RM1_Arena.unity`를 만든다. 에디터 빌더가 `BossArenaLayout.Generate(0)`·`BossRemodelSets`/`DruidRemodelData.Set`을 **직접 호출**해 격자·기둥(`PillarCount`·`PillarRingFraction`·`PillarRadius`·`PillarStartDeg`)을 얻는다(상수 복사 없음). 계산기 json은 검증·문서용이고 빌더는 json을 읽지 않는다 — 빌더가 같은 수를 만들고 `rm1_arena_layout.json`과 대조해 다르면 실패한다.
2. 바닥·벽·숲·수로·기둥은 모두 이 씬 안의 3D 물체(절차 메시, `Rm1SliceBuilder`의 `LumpMesh` 등 재사용 — 같은 Editor 어셈블리, 내 파일).
3. 연출용 값 두 개는 **MonoBehaviour 공개 필드**로 노출해 Timeline이 직접 움직이게 한다(공용 셰이더 `EXODUSER/ToxicFlow`는 수위 파라미터가 없고 보스·필드가 같이 쓰므로 고치지 않는다):
   - `Rm1ArenaChannel.Level` (0~1): 수로 메시 전체의 Y 이동(낮음 0 = -0.08u, 높음 1 = +0.12u, 바닥 Y = 0). 판정 불변.
   - `Rm1ArenaPillar.Rise` (0~1): 기둥 Y 이동(0 = 땅속, 1 = 솟음). 기둥 4개 각각. 런타임 값 읽기: 같은 씬의 `Rm1ArenaBridge`가 `FindFirstObjectByType<NativeGame>().Simulation`(공개 getter)의 `Stage.InArena`·보스 `Pillars`를 읽어 `Rise`를 맞춘다(Core 값을 읽는 부분 = 위치는 `Pillars[k].X/Y`, 빌드 때 만든 자리와 8px 이내가 아니면 경고).
4. 2D 스프라이트 아레나(`NativeArenaView`)와 게임 카메라(XY 정사영)를 3D 씬으로 바꾸는 일은 **필드와 같은 미해결 공용 작업**이다. P0·P1은 편집기 배치 캡처(`Capture` 컷)까지만 하고 거기엔 손대지 않는다.

### 공용 파일을 고쳐야 하는 부분 (고치지 않았고, 여기서 멈춤 — 유니티 총괄 결정)
| 필요 | 파일 | 이유 |
|---|---|---|
| 런타임에서 3D 아레나를 실제로 보이게 하기 | `Runtime/NativeGame.StageFlow.cs:96-111`(Codex 소유 NativeGame*), `Runtime/NativeArenaView.cs`(스프라이트 마스크 끄기) | 진입 시 3D 씬을 켜고 남색 void 마스크를 끄려면 한 자리 훅이 필요 |
| 게임 카메라 XY → 3D 카메라 | `Runtime/NativeGame.cs:50-52` 와 입력·스프라이트 평면 | 플레이어·적이 XY 스프라이트라 3D XZ 월드와 평면이 다름 — 필드 RM-1도 같은 문제 |

P1(캡처·판정)은 이 두 가지 없이 가능하다. 런타임 연결은 필드·아레나 함께 한 번에 정하는 게 맞다.

## 3. 명세 표 항목별 좌표·수치 (전부 `rm1_arena_layout.json`, 계산기는 Core를 1:1로 옮긴 것)

월드 규칙 x = px/100, z = -py/100, 1타일 = 0.4u. 격자 5120×4320px = 51.2×43.2u.

| 항목 | 값 |
|---|---|
| 타일 수 | 벽 5,651 / 바닥 7,885 / 룬 288 / 걷기(바닥+룬) 8,173 |
| 원 | 타일 원 중심 = 타일 (64,54) = **px (2580, 2180)**(타일 가운데). Core 아레나 중심(`ArenaCx/Cy`) = **px (2560, 2160) = Unity (25.60, -21.60)**. 두 중심이 (20, 20)px 어긋난다. 걷는 원 반지름 51타일 = 2040px(Core 기준). Core 중심에서 잰 가장 먼 걷기 반지름: E 2079 · SE 2093 · S 2079 · SW 2036 · W 2040 · NW 2036 · N 2000 · NE 2036 |
| 진입 | 타일 x 61~67 · y 101~104 = px x 2440~2720 · y 4040~4200. **전부 원 안이라 바닥을 한 칸도 더하지 않는다**(복도 없음, 남쪽 꼭지에 걷기 칸이 1칸 폭 돌출) |
| 보스 자리 | 타일 (64,54), 더해지는 칸 0 |
| 출구 | x 타일 64, `ExitY` = **2**(Generate 결과, 하드코딩 금지) = px (2580, 100) = Unity (25.80, -1.00). `Rebuild`는 `|tx-exitX| ≤ 1`, 폭 3타일을 연다 |
| 기둥 4 | 링 반지름 1122px(=11.22u), 반지름 80px(=0.80u). P0 SE px (3353.374, 2953.374) = Unity (33.5337, -29.5337) · P1 SW (1766.626, 2953.374) = (17.6663, -29.5337) · P2 NW (1766.626, 1366.626) = (17.6663, -13.6663) · P3 NE (3353.374, 1366.626) = (33.5337, -13.6663). 발자국 원 전체가 걷기 칸 위(검사 완료). 모델 발자국 허용 ≤ 8px(= 0.08u) |
| 룬(5) 288칸 | 걷기 칸이다. "걷기 칸 덮임 0"은 **그을린 뿌리 테두리를 벽 쪽 입술(걷기 칸에서 0~20px 바깥, 낮은 덩어리 h ≤ 0.9u)에 두고 룬 칸 자체는 흙 그대로 둔다**로 해석해 진행(맵 총괄 확인 요청) |
| 독액 수로 | 아래 §4 |
| 바깥 | 입술(0~20px, 낮은 덩어리) → 수로(20~160px) → 가시숲 3겹(160px~). 격자 경계까지 여유: 북 120 · 남 80 · 서 520 · 동 480px. **북·남은 수로·숲이 Core 격자 밖(월드)까지 나가야 한다**(격자 밖 충돌은 `Blocked`=참이라 영향 없음) |
| 시선 쐐기 | `h ≤ 0.9 + tan(0.85) × D` (tan 0.85 = 1.1383, D = 벽 덩어리에서 북쪽 가장 가까운 걷기 칸까지 u). D 0 → 0.90u · 0.4 → 1.36 · 0.8 → 1.81 · 1.6 → 2.72 · 3.2 → 4.54 · 6.4 → 8.18. 같은 칸 열 위 북쪽 16칸 이내에 걷기 칸이 있는 벽 타일 1,008개(남쪽 가장자리)가 대상. 필드 RM-1은 보수적으로 평평한 0.9u를 썼다(차이 메모) |
| 조명 | 1-1 톤은 RM0-LIGHT-L 결과 기준(대기). 수로 쪽 점광 최대 4개, 카메라 근처 8개는 `Rm4PoolLightCuller`(브랜치 `claude/unity-pc-rm4-20261028`, 아직 unity/main 밖) 방식 참고 |
| 카메라 | 보스전 줌 0.80(이식본 그대로), 쐐기 계산 피치 0.85 |
| 바닥 | `Resources/Art/map/boss_arena/ground_dark_soil`(웹 흙)과 필드 `Materials/Ground` 흙을 같은 계열로. 필드 START 컷 옆 1x 비교는 P1 |

## 4. 수로 — 명세와 Core 사이의 어긋남 (맵 총괄 결정 필요)

명세 §1 "걷는 원 바깥 고리 r = 2060~2200px". Core 중심 (2560, 2160) 기준으로 계산해 보니 이 고리는 걷기 칸 위에 걸린다.

| 항목 | 값 |
|---|---|
| 명세 고리 셀 (10px 격자) | 18,744 |
| 그중 걷기 칸 위 | **342** (1.8%) |
| 그중 걷기 칸에서 20px 안 | 1,251 |
| 원인 | ① 타일 원 중심이 Core 중심에서 (20,20)px 어긋남, ② 타일 계단이라 걷기 반지름이 방향마다 2000~2093 |
| 권장 | **계단 따라가는 띠**: 걷기 타일 사각형까지의 거리가 20~160px인 벽 쪽 점(폭 140px, 명세와 같은 폭). 걷기 칸 위 셀 **0**(구성상), 진입·출구 앞은 x 2580 ± 200px로 끊음. 틈을 뺀 셀 18,892 |

색상각 40~65°는 `M_ToxicFlow` 현행 값 그대로(색 조정은 톤 단계). 수위 파라미터 이름 = `Rm1ArenaChannel.Level`(0~1), 기둥 = `Rm1ArenaPillar.Rise`(0~1). **명세 고리(2060~2200)는 걷기 칸을 침범하므로 권장 띠로 바꿔 진행**한다(맵 총괄 PASS 전까지는 P1 착수 안 함).

### 4.1 판정 반영 (맵 총괄 10-28, P0 PASS) — 안쪽 가장자리는 매끈한 곡선
맵 총괄이 수로 띠 교체·독립 씬 방식·`Level`/`Rise` 필드·룬 해석(룬 칸은 흙 그대로, 뿌리 테두리는 벽 쪽 입술 0~20px h ≤ 0.9u)을 승인했다. 조건: 띠 안쪽 가장자리가 타일 계단 톱니로 보이면 안 된다. 보스전 총괄 보충(§4-1 바닥에 독 광택을 굽지 않음, §4-2 기둥 수는 Core `Set.PillarCount`에서 읽고 빌더에 4를 기본값으로 두지 않음)도 P1에 반영한다.

**매끈한 곡선 가능성 계산** (`unity/Tools/rm1-arena-layout/smooth_band.py`, 타일 원 중심 (2580, 2180) 기준 걷기 타일 네 모서리의 극좌표 바깥 끝):
- 걷기 타일 모서리가 가장 멀리 가는 반지름 = **2067.85px**, 모든 모서리가 이 원 안이다.
- 극좌표 포락선(±6빈 최대 → 25빈 평균, 720빈)은 2052.8~2067.8px, 계단의 최대 어긋남은 약 15px.
- 따라서 **안쪽 가장자리 = 중심 (2580, 2180) · 반지름 2070px 원**, 바깥 가장자리 = 같은 중심 · 2210px(폭 140px)이면 걷기 칸 위 0셀을 지키면서 완전한 곡선이다. 계단과 이 원 사이(0~약 30px)가 뿌리 테두리 입술(h ≤ 0.9u)이다 — 20px보다 넓은 곳은 입술 덩어리가 채운다. 진입·출구 끊김 x 2580 ± 200px은 그대로.
- 이 중심은 Core 아레나 중심(2560, 2160)과 (20, 20)px 다르다. 수로 원은 타일 원 중심을 쓴다(기둥은 Core 중심 그대로).
- P1 탑뷰 캡처로 곡선 매끈함과 걷기 칸 위 0셀을 확인한다.

## 5. P1 계획 (이 문서 PASS 뒤, Unity 실행 순번 받은 뒤)
1. `Rm1ArenaBuilder.Run`(바닥·벽 덩어리·수로·기둥·숲 3겹, 멱등), `Capture -cuts south,pillars,top`.
2. 판정 수치: 걷기 칸 덮임 0(중심·0.5칸), 수로 픽셀이 걷기 칸 위 0, 기둥 발자국 ≤ 8px, 쐐기 위반 0, 보이지 않는 벽 0, FPS, 공용 파일 미수정.
3. 기둥 높이는 기둥 뒤 가려지는 폭 `(h − 0.9)/1.138`을 확인하며 P1 캡처에서 정한다(기둥은 엄폐물이므로 가림 자체는 의도, 다만 뒤 1.3u 이내).
