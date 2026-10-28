# RM-1 보스 아레나 외곽 독액 수로: Core 격자 기반 후보 — 2026-10-28

상태: **순수 C# 기하 후보 / 실제 Unity 보스방 화면·Player 미연결**. 보스 아레나 제작 명세 `UNITY_CH1_BOSS_ARENA_MAP_SPEC_20261028.md` §2의 첫 작은 단위다. 목표는 1-1 보스방의 걷는 원 바깥에만 수로를 놓고 북쪽 출구·남쪽 입구 축을 건드리지 않는 것이다. 독액 재질·메시·애니메이션·페이즈·화면 톤은 이 단위의 구현 범위가 아니다.

## Source와 수치

| 항목 | 값·근거 | 이 단위 결과 |
|---|---|---|
| Core 격자 | `BossArenaLayout.Generate(0)`, 128×108, 40px/타일, 원형 type 0 | 실제 `BossArena.cs`와 생성된 `EnemyTables.cs`를 테스트 프로젝트에 직접 링크 |
| 판정 없는 시각 마스크 | `ArenaChannelPlan.Build(BossArenaLayout)` → `int[]` 타일 인덱스(`y * Width + x`) | 막힘 타일(값 1) 가운데 걷는 바닥과 상하좌우로 접한 외측 한 줄만 선택 |
| 출입축 | `EntryX` 중심 좌우 3타일을 전 높이에서 제외 | 남쪽 진입·북쪽 출구의 시각 개구를 보존하는 **렌더 전용** 여백. Core 게이트 폭·충돌 공식을 복제하거나 수정하지 않음 |
| 후보 수 | 278타일 | 이산 격자 띠다. 실제 수로 곡선·폭·접지 형태를 증명하지 않음 |
| Core 보존 | 기존 `Tiles`를 읽기만 함 | 모든 선택 타일 값 1, 걷기 타일 선택 0, 생성 전후 타일 배열 동일 |

파일: `unity/Assets/Exoduser/Remodel/BossArenas/ArenaChannelPlan.cs`와 `.meta`, 폴더 `.meta`; 순수 C# 검증 `unity/Tools/arena-channel-tests/`. Unity 통합 시 타일 인덱스를 x/z 좌표로 바꾸는 곳에서 `BossArenaLayout.TileSize`와 현재 보스방 좌표 변환을 사용한다. 이 마스크를 걷기 영역으로 확장하거나 `CanMove`·NavMesh를 바꾸지 않는다. `M_ToxicFlow` 재질은 기존 `unity/Assets/Exoduser/Remodel/CH1_1/Materials/M_ToxicFlow.mat`을 참조한다.

## TDD 실행 증거

환경: 작업 브랜치 `codex/pc-map-arena-20261028`, `E:\exoduser-wt\codex-map`, .NET SDK 8.0.301, Unity Editor/Player 실행 없음. 테스트는 실제 Core `BossArenaLayout.Generate(0)`을 부르고 별도 모의 격자를 쓰지 않는다.

| 단계 | 명령 (`PowerShell`) | 결과 |
|---|---|---|
| RED — 테스트·프로젝트만 작성, 구현 파일 없음 | `$env:DOTNET_CLI_HOME='E:\exoduser-wt\_dotnet-home'; $env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH='false'; dotnet run --project 'unity\Tools\arena-channel-tests\ArenaChannelTests.csproj' --configuration Release` | 종료 1, `ARENA_CHANNEL_FAIL ArenaChannelPlan exists`. 컴파일은 성공하고 요구한 기능이 없어 런타임 검사가 실패함 |
| GREEN — 최소 구현 추가 | `$env:DOTNET_CLI_HOME='E:\exoduser-wt\_dotnet-home'; $env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH='false'; dotnet run --project 'unity\Tools\arena-channel-tests\ArenaChannelTests.csproj' --configuration Release --no-restore --verbosity quiet` | 종료 0, `ARENA_CHANNEL_PASS 11 checks / 0 failures; tiles=278` |

11개 검사: Core si0 fixture, 새 타입/API 존재, 비어 있지 않은 타일, 중복 없음, 모든 타일 막힘, 중앙 출입축 여백, 동·서/북·남 호, 모든 타일 Core 걷기면 접촉, Core 타일 불변. 이 결과는 **기하 후보의 단위 검증**이며 Unity 컴파일·실제 보스방 렌더·색/조명·플레이 검수를 대체하지 않는다.

## 다음 단계와 판정 경계

1. Unity 통합 담당 소유의 실제 보스방 렌더 경로에서 이 마스크를 `M_ToxicFlow` 수로 메시의 기준으로 사용한다. 1-1 Core 기둥 4개 및 페이즈 P3 수위 연출은 별도 소유 단위로 연결한다.
2. Core 보행 오버레이와 수로를 같은 1600×900 컷에 찍어 걷기 타일 덮임 0, 입구·출구 가림 0, 보이지 않는 벽 0을 확인한다. 수로의 대각 이산 경계는 메시로 매끈하게 잇되 Core 격자 안쪽으로 넘기지 않는다.
3. 실제 전투에서 독 스킬 프레임과 나란히 1x를 보고 `MAP_ART_BIBLE_v2_20261026.md` §6(독액 색상각 40~65°, 화면 면적, 약한 발광)과 비교한다. 디자인총괄 판정 전 **VISUAL VERDICT: RETOUCH**(수로 메시·게임 화면 미제작).

MAP PRODUCTION REPORT 요약: STAGE=1-1 보스 아레나; MASTER/OUTER/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/CAMERA QA=미제작·미검수; TECH QA=Core 격자 기반 마스크 11/0, Unity·Player·FPS·시각 미검수; FILES=위 후보 코드·테스트·본 문서만; GIT=작업 브랜치 후보, 통합·배포 없음; VISUAL VERDICT=RETOUCH(시각 미제작); NEXT PASS=실제 보스방 메시·캡처·전투 대조.
