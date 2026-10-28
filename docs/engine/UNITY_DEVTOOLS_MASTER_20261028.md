# Unity 개발툴·엔진 작업환경 마스터 (2026-10-28)

- 소유: 개발툴 총괄 `local_55f5cfd6` (Opus, 조사·명세·검수). 구현은 Sonnet 세션(§5)이 맡는다.
- 배경: 10-28 사용자 지시 "일단 우리가 해야 할 건 작업환경 세팅이야. 개발툴을 정확하게 만들어야지. 최적화하고 커스텀하고 엔진도" → CTO `local_7072229c` 경유. 콘텐츠(맵·보스) 제작보다 실행 기반·개발툴을 먼저 세운다.
- 범위: Unity 줄기(`unity/main`)의 에디터 도구·실행 스크립트·렌더 기반. 게임 규칙 Core(`unity/Assets/Exoduser/Runtime/Core`)는 정답이라 건드리지 않는다. UI는 웹 그대로.
- 코드 위치: `unity/Assets/Exoduser/Editor/DevTools/<도구>/`(에디터 전용), PC 실행 스크립트 `unity/Tools/devtools/`. 브랜치 `claude/unity-pc-devtools-<이름>-20261028` → `unity/main`으로만 병합(병합은 유니티 총괄 `local_59ad835c`). 이 문서와 결정 기록은 main.

## 1. 실측 — 지금 작업 흐름의 병목

측정 출처: `E:\exoduser-wt\_out\**\*.log`·`I:\EXODUSER-Storage\{rm3,qa}\**\*.log`의 Unity batchmode 로그(10-26~10-28), `git ls-tree -l`, robocopy 로그. 집계 스크립트와 원자료는 `I:\EXODUSER-Storage\devtools\survey\`(`logtimes.ps1`·`logtimes.txt`·`classify.ps1`·`classify.txt`·`libsize.txt`). 실행 시간 = 로그 파일 생성~마지막 쓰기(벽시계, 초).

### 1.1 Unity 1회 실행 시간

| 구분 | 실측 | 근거 로그 |
|---|---|---|
| 10-27~28 batchmode 실행 횟수 | **352회**(600초 미만), 합계 **13,892초 = 3.9시간** | logtimes.txt |
| 1회 실행 벽시계 | p10 9초 · **p50 17초** · p90 84초 · 평균 39초 | 〃 |
| 고정 비용(일을 거의 안 하는 실행) | 캡처만 하는 실행 9~16초(예: `Rm1SliceBuilder.Capture` cap1~cap10 = 9~16초, `Rm0EngineSetup.ApplyLight` 7~10초). 그중 Licensing 초기화 2.2초, 첫 Asset Refresh(스크립트 변경 없음) p50 **4.6초**(컴파일 0.6~2.6초), 엔진 초기화·종료 나머지 | `_out\rm1\cap*.log`, `_out\rm0-light\logs\run*.log` |
| 같은 워크트리 반복 실행(코드 변경 有) | 빌더 `Run` 22~24초(`_out\rm1\run3·4·7·8·10·12·13`) | 〃 |
| 브랜치 병합·Library 복사 직후(재컴파일) | `Rm3SliceBuilder.All` **95초**(Refresh 58초, 컴파일 26초) / `Rm1SliceBuilder.Run` 72초(Refresh 51초) / `VfxRm1SharedRender.Run` 168초(Refresh 106초, 컴파일 69초) / 패키지 해석 RM-0 `01-resolve` 258초(Refresh 218초, 컴파일 81초) | `I:\rm3\run1.log`, `_out\rm1\run2.log`, `_out\vfx-rm1\shared_render.log`, `_out\rm0-logs\01-resolve.log` |
| 첫 Refresh 분포(전체) | p10 2.8초 · p50 4.6초 · p90 23.2초 · 최대 218초 | logtimes.txt |
| Player 빌드(`PortVerification.Build`) | 보통 25~55초, 병합 직후 첫 빌드 40~60초(Refresh 17~23초) | `_out\pc-*\build*.log` |

판단: **실행 1회의 절반 이상이 고정 비용이다.** 캡처 1장을 고치고 다시 찍는 반복이 하루 수십 회라, 고정 비용 9~10초 × 352회 ≈ 1시간이 순수 대기다. 여기에 "PC 전체 Unity 1개" 규칙의 순번 대기가 곱해진다(1.4).

### 1.2 실행 결과 분류(10-27 00시 이후 로그 500개)

| 결과 | 개수 | 예 |
|---|---|---|
| 정상 종료(`Exiting batchmode successfully`) | 188 | |
| 빌드 성공 | 85 | |
| 정상 종료 표시 없음(빌드 후 Player 실행·창 모드·강제 종료 포함) | 202 | 대부분 Player 로그·빌드 후속. 실패 여부는 개별 확인 필요 |
| **컴파일 오류로 실행 낭비** | **13** | `_out\rm1\run5.log`(CS1022), `buildparry`·`buildparry2`·`buildparry3`, `fixedmobs\build8b` 등 — Unity를 다 띄운 뒤에야 오류를 안다 |
| **에디터 크래시** | **7** | `pc-d01\build6`, `rm1\build\build`, `vfx-rm1\core6`, `fixedmobs\build8·8c` 등 |
| 스크립트 예외로 실패 | 5 | `rm1\run2`(NullReference), `rm0-light\logs\run1`(MissingComponent `Pool_Hell_Test` Light) |

### 1.3 Library·씬·에셋 크기

| 항목 | 실측 |
|---|---|
| Library가 있는 워크트리 | **33개**(`E:\exoduser-wt\*\unity\Library`) |
| 워크트리 1개 Library | 5.6~5.9GB·약 31,000파일(최신 unity/main 기준), 오래된 것 3.5~4.8GB |
| Library 합계(중복) | **158.4GB / 32개**(§1.3a) |
| Library 복사 1회 | robocopy `/MT:8` **5.95GB·31,211파일·1분**(`I:\rm3\library-copy.log`). 복사 중 Unity가 돌면 안 돼서 `BUSY` 검사 후 대기(`I:\rm4\diag\libcopy.ps1`) |
| `RM3_Slice.unity` | **73.4MB**(unity/main 26a11fd2f) — Mesh 오브젝트 1,252개가 73.1MB. 씬 안에 절차 메시가 직렬화됨 |
| `RM1_Slice.unity` | 1.35MB(메시는 `Generated/*.asset`) |
| `Generated/NavWalk.asset` | RM-3 8.9MB, RM-1 1.26MB |
| unity/Assets 전체 | 797MB·1,914파일. 큰 것: CJK 글꼴 3종 각 23.4MB, 1-1 컬러맵 17.8MB·9.8MB, 로비 mp4 3개 11~13.5MB |
| 맵 빌더 코드 | `Rm1SliceBuilder.cs` 88.5KB/973줄, `Rm2` 71KB/753줄, `Rm3` 88.8KB/956줄, `Rm4` 98.9KB/1,037줄 — **합계 3,719줄**. 정적 함수 기준 Rm2 54개 중 31개, Rm3 67개 중 38개, Rm4 63개 중 44개가 Rm1과 같은 이름의 복사본(`LumpMesh`·`TubeMesh`·`MakeLump`·`BuildNavMesh`·`Capture`·`CaptureTop`·`Fps`·`BuildCamera`·`BuildLighting` 등) |
| `.meta` 누락 | unity/main `Editor/`의 `Rm3SliceBuilder.cs`에 `.meta`가 커밋되지 않음(Rm2·Rm4 브랜치도 같음) → 워크트리마다 GUID가 새로 생겨 참조가 흔들릴 수 있음 |

#### 1.3a Library 합계

전수 측정(10-28, `du -sm`, `I:\EXODUSER-Storage\devtools\survey\libsize.txt`): Library가 있는 32개 합계 **158.4GB**.

| 구분 | 개수 | 크기·파일 수 | 예 |
|---|---|---|---|
| 완전(지금 unity/main과 맞음) | 20 | 5.5~6.1GB·약 30,000~31,400파일 | rm0~4·rmb1·vfx-*·ui·sound·latest·m1hud·o1-* |
| 오래된 이식 단계 | 10 | 3.4~4.7GB·1,300~2,700파일(합계 약 39GB) | c01wire·d01·maps·dmg·d05·map3d·win·a16·char·a14 |
| 불완전 | 2 | 0.9GB·약 26,000파일 | silvertail·ivan |

정리 후보는 오래된 10개와 불완전 2개다. 삭제는 사용자 확인 뒤, junction 전수 확인(`/XJ`, reparse point) 후에만 한다(robocopy·worktree remove가 junction을 따라가 원본을 지운 사고 이력).

### 1.4 동시 실행이 안 되는 원인

| 원인 | 성격 | 근거 |
|---|---|---|
| 같은 프로젝트 폴더는 Unity 1개만 연다(`Temp/UnityLockfile`) | Unity 제약 | 워크트리가 다르면 동시 실행은 기술적으로 가능 |
| **운영 규칙 "PC 전체 Unity 1개"** + 시작 조건 커밋 여유 20GB(Library 없으면 30GB) | 운영 규칙(맵·유니티 총괄 10-28) | `docs/0마스터플랜/session_handoff/map-lead.md` 운영 규칙, `I:\rm3\waitmem.ps1` |
| 커밋 메모리 고갈: 커밋 127.1/127.8GB에서 메모리 부족 크래시 2회, 죽은 Unity 프로세스 6개가 메모리 점유 | 실사고 | 캐릭터 보드(CHAR UCH-05·06), `vfx-lead.md` |
| Library 복사 중에는 다른 Unity가 돌면 안 됨(파일 잠금) | 실사고 회피 규칙 | `libcopy.ps1` BUSY |
| 순번을 사람이(총괄 메시지로) 정한다. 세션 간 메시지 10건 상한 때문에 시작 신호가 늦게 간다 | 운영 | map-lead.md "메시지 10/10" 반복 |
| PC 하드웨어: 64GB RAM·i9-14900KF 32스레드. 블루스크린 잦음(14900KF 열화 의심) | 환경 | 메모리 `pc-hardware-14900kf-bsod` |

판단: 동시 실행을 막는 것은 Unity가 아니라 **메모리 예산과 사람이 돌리는 순번**이다. 상주 서버 + 기계 순번 큐로 바꾸면 "1개" 규칙을 지키면서도 대기·고정 비용이 사라진다. 슬롯을 2개로 늘릴지는 상주 서버 1개의 실제 메모리를 잰 뒤 정한다(DT-01 완료 기준).

**커밋 메모리 실측(10-28 11:0x, Unity 0개인 상태):** 커밋 사용 87.6GB / 한도 100.1GB(RAM 64GB + 페이지 파일) → 여유 **12.6GB**로 Unity 시작 조건 20GB에 못 미쳐 대기열 전체가 멈췄다(rmb1이 잠금을 쥐고 메모리 대기 25분 이상). 프로세스별 private 합계: `claude` 41개 **24.4GB**, `node` 169개 **15.1GB**(세션마다 붙는 MCP 서버·도구), `dota2` 7.0GB, `uv` 29개 3.7GB, `chrome` 2.4GB, `ChatGPT` 2.2GB, `python` 58개 2.1GB. **Unity를 막는 가장 큰 소비자는 동시에 열린 Claude 세션과 그 node·uv·python 자식 프로세스(약 45GB)다.** 대응 후보: ① 끝난 세션 보관(유휴 세션 프로세스 회수) ② 세션당 MCP 서버 수 줄이기 ③ 페이지 파일 확대(시스템 설정, 사용자 결정) ④ Unity 시작 조건 20GB를 실측(DT-01 ④ 서버 메모리)에 맞춰 조정.

### 1.5 캡처·판정 실패 유형

| 유형 | 사례 | 지금 알게 되는 시점 |
|---|---|---|
| A. 화면이 어둡게 나옴 | Linear+후처리 병합 뒤 RM_Sandbox 화면 중앙값 23.7→4.7(거의 검정). RM-3 P1 캡처 전부 어두움 — RM0-LIGHT-L(d6d17bab2) 미병합 상태에서 찍음. 보스 RM1 3D 장면은 어두워 판정 캡처를 아예 안 찍음 | 캡처 PNG를 사람이 열어 본 뒤 |
| B. **수치 PASS인데 화면이 틀림** | RM-3 `MakeMushroom`이 로컬 좌표를 월드 좌표로 넘겨 버섯 줄기·갓 전부가 월드 원점에 쌓임. 수치 5종은 의도 발자국으로 계산해 통과 → 26a11fd2f로 병합까지 됨. 캐릭터 림 Point는 수치 통과인데 몸 전체가 붉게 칠해짐 | 다른 단계 작업 중 우연히 |
| C. 검사가 재야 할 것을 안 잼 | 시선 쐐기 검사가 지형(Terrain) 높이를 빼고 덩어리만 잼 → 앞쪽 둔덕 2.1~2.5u가 캡슐을 가림 | 캡처 판독 때 |
| D. 실행 조건 불일치 | m1-check 17/17이 실은 창 모드 결과였고 batchmode는 베이스부터 실패. 3333 서버가 147커밋 뒤처진 옛 화면이라 캡처 무효 | 판정 뒤 |
| E. 실행 자체 실패 | 컴파일 오류 13·크래시 7·예외 5(§1.2). Cinemachine `ManualUpdate` LogError 6건 | Unity를 다 띄운 뒤 |
| F. 웹 정답 추출 함정 | si≠0이면 `_tickBgInit(9999)` 필요, headless Chrome `browser.close()` 멈춤(5초 race), `--single-process` 30분 정지 | 추출 결과가 틀린 뒤 |

## 2. 팀별 필요 도구

| 팀(SSOT) | 지금 손으로 하는 일 | 필요한 도구 |
|---|---|---|
| 맵 (`docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md`, map-lead 요구 17항목) | P1 수치 5종(걷기 칸 덮임 0·NavMesh 0/0·보이지 않는 벽 0·시선 쐐기 h ≤ 0.9+1.14·D·Hero 레이어 0)+FPS, R1~R8 컷·캡슐 컷·탑뷰, 웹 BFS 대조(`--unity-c04-dump`+`compare.mjs`) | 실행 큐/상주 에디터(최우선), 실제 렌더 기준 구조 검사기(원점 쌓임 탐지·지형 높이 합산), 고정 컷 프리셋, 웹/2D/3D 나란히 캡처, 웹 맵 추출기, 데이터 기반 공용 빌더 |
| 보스 (`docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md`, NRftW 기준 재제작) | `Tools/druid-remodel-test` 하니스 종류별 개수, M1~M7 수치(tele ≥40f·rec ≥ max(tele,60) 등), 55° 1x 클립 판정 | 판정 도형/히트박스 오버레이(Core 바인딩), 무브 타임라인 검사기, 애니 클립 검사(발 미끄럼·루트 이동·접촉 프레임), 55° 게임 시점+측면 동시 캡처 |
| VFX (`docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md`) | 7시점(0~0.6초) 고정 틱 캡처, 상위 1% 휘도 ≥240·지름/키·색상각·반경 밖 ΔRGB 측정, `VfxRm1*Capture` | 고정 틱 프리뷰 벤치, 측정 패널, 판정 바닥 프리셋(실제/중성/검정), 효과별 GPU 비용, PC_High/Mac_Balanced A/B |
| 캐릭터 (`docs/engine/UNITY_CHARACTER_BOARD_20261027.md`) | 캐릭터마다 Import/Capture 스크립트 복제, 3방향+게임 시점, 흑철 R/G ≤1.25·날 채도 ≤15%·바닥 ΔL* 0 | 범용 임포트 검사기(아바타·뼈·가중치), 룩데브 캡처 프리셋(조명 2세트·Animator 사전 샘플·접지), 재질 지표 측정기, Hero 레이어 누수 검사 |

### 2.1 맵 총괄 요구 17항목 대응 (10-28 수신, 맵 총괄 우선순위 12 → A → 8~10 → 6·7 → 16)

| 맵 id | 요구 | 대응 DT |
|---|---|---|
| 12 | Unity 1개 보장(순번 큐·HasExited·커밋 여유·실행별 로그·종료 확인·좀비 감지) | DT-01(+순번 예약 `reserve`/`queue`) |
| 1 | 걷기 칸 덮임(발자국 깊이 0.5칸 이상 0) | DT-02 L1(중심 교차·깊이 0.5칸 둘 다) |
| 2 | NavMesh↔Core 걷기 차이 0/0 | DT-02 L2 |
| 3 | 보이지 않는 벽(막힌 섬마다 보이는 객체, uncoveredAfterFill 0) | DT-02 L3(+L3b 렌더러 없는 콜라이더) |
| 4 | 시선 쐐기 h ≤ 0.9 + tan(0.85)·D | DT-02 L4(지형 높이 합산, terrainH 열) |
| 5 | Hero 렌더링 레이어 nonDefault 0 | DT-02 L5 |
| (사고) | 원점 쌓임·의도 위치 불일치 | DT-02 L6 |
| 8 | 고정 컷(이름 붙은 지점)+탑뷰 걷기 오버레이 | DT-03 프리셋(지점 이름) / DT-02 `-shot` |
| 9 | 캡슐 높이 2종(y=0, 지형 위) | DT-03 프리셋 옵션 |
| 10 | 웹·2D·3D 같은 지점 나란히+1x 크롭 | DT-03 비교판(웹 캡처 입력은 DT-06) |
| 11 | 톤 계측(`measure_L.py` 기준, 기준값 차이 표) | DT-03 LookDevMetrics |
| 6 | 웹 맵 정답 추출기 하나(`_tickBgInit(9999)`, `--single-process` 금지, 원본 변경 때만) | DT-06 |
| 7 | 보스 아레나 오버레이(Core `BossArenaLayout.Generate`·보스 세트 값을 읽어 겹침) | DT-06/DT-07 |
| 13 | 씬 50MB 초과 경고 | DT-02 L7 |
| 14 | URP 추가광 8개 한도 표시 | DT-02 L7 |
| 15 | FPS 고정 절차(START·240프레임·3D 켬/끔) | DT-10(작업 서버 job) |
| 16 | 구역 json을 읽는 공용 빌더 | DT-05 |
| 17 | 런타임 연결 뒤 켬/끔 Core 틱 동일·지형 높이 샘플·발 위치 검사 | DT-05 뒤 RM-INT와 공동(유니티 총괄 결정 범위) |

### 2.2 유니티 총괄이 본 병목 (10-28 수신)

새 worktree는 전체 임포트 100초 + 임포트 포함 빌드 219초 + m1-check 47초 = Unity 4분 26초 점유, 커밋 여유 약 9GB 소모(28.9→19.6GB). 그 밖에 ① worktree마다 Library를 robocopy로 손 복사(Git Bash에서는 `/E`가 깨짐) ② git에 없는 영상 2개 때문에 첫 빌드 실패 → `restore-*.cjs`로 복원 ③ 빌드 경로 치환 실수로 엉뚱한 빌드 실행(receipt·exe 대조 필요) ④ 자동 대기 루프가 다른 세션 단계 사이에 끼어듦 ⑤ 순번을 메시지로만 운영해 메시지 상한(10건)에 닿음 ⑥ `RM3_Slice.unity` 77MB ⑦ RM-0 조명 unity/main 미반영으로 캡처 어두움. 일부 worktree에는 0.9GB짜리 불완전 Library가 있다.

4팀 공통: ① 실행 큐+상주 에디터 ② 캡처 전에 렌더 상태(Linear·후처리·Volume·조명 SHA)를 확인하고 어두우면 경고 ③ 표준 캡처 프리셋(1600×900/1920×1080, 1x 크롭, 게임 시점) ④ 수치 리포트에 "실제로 그려진 것" 증거 묶기 ⑤ Core 판정 오버레이 공유(맵 충돌·NavMesh, 보스 히트박스, VFX 텔레그래프 ±4px).

## 3. 도구 목록·우선순위

우선순위 기준: (1) 4팀이 모두 막혀 있는 것 (2) 실패 유형 A·B를 막는 것 (3) 다른 도구의 바탕이 되는 것. 1~3순위는 바로 착수, 4순위 이하는 1~3 결과를 보고 순서를 다시 정한다.

| 순위 | ID | 도구 | 담당 | 완료 기준 |
|---|---|---|---|---|
| **1** | DT-01 | **Unity 작업 서버 + PC 순번 큐**: 워크트리별 상주 에디터(batchmode, `-quit` 없음)가 작업 폴더의 job json을 받아 정적 메서드를 실행. 실행 전 Refresh·컴파일 대기, 컴파일 오류·예외를 결과 json으로 돌려줌(에디터는 죽지 않음). PC 전역 잠금·메모리 사전 검사(커밋 여유 20GB)·죽은 Unity 정리·하트비트·타임아웃. 서버가 없으면 같은 잠금 아래 1회 실행으로 대체 | Sonnet `devtools-runner` | ① 같은 작업(`Rm1SliceBuilder.Capture` 1컷, `Rm0EngineSetup.Capture`) 1회 실행 3번 vs 상주 서버 3번 시간 비교표(목표: 반복 작업 고정 비용 9~10초 → 2초 이하) ② 스크립트 1줄 수정 뒤 작업(Refresh+컴파일) 시간 ③ 컴파일 오류를 넣었을 때 서버 생존+오류 json ④ 서버 1개 메모리(작업 중 최대) 측정 → 슬롯 수 권고 ⑤ 두 세션이 동시에 제출해도 순서대로 실행 ⑥ 에디터 캡처 1장 |
| **2** | DT-02 | **맵 구조 검사기(MapLint)**: 열린 씬의 실제 Renderer·Collider·Terrain·NavMesh를 읽어 검사. 걷기 칸 덮임, NavMesh↔Core 걷기 차이, 보이지 않는 벽(렌더러 없는 콜라이더), 시선 쐐기(지형 높이+덩어리 합산), Hero 레이어 누수, **원점 쌓임·의도 위치 불일치**, 렌더 상태. SceneView 기즈모 오버레이+EditorWindow(편집할 때마다 다시 검사), batch 진입점(json 출력) | Sonnet `devtools-maplint` | ① unity/main 26a11fd2f의 `RM3_Slice.unity`에서 원점 쌓임을 **잡아낸다**(실패 유형 B 재현) ② `RM1_Slice.unity`에서 기존 수치 5종과 같은 결과 ③ 쐐기 json에 지형 높이 열 ④ 기즈모 켠 SceneView 캡처 ⑤ 검사 1회 시간 |
| **3** | DT-03 | **룩데브 캡처 리그(LookDev)**: 표준 샷 프리셋(게임 카메라 LOOK-001·탑뷰·캡슐·캐릭터 3방향, 1600×900/1920×1080), 렌더 상태 기록(색공간·후처리·Volume·postExposure·워크트리 SHA), 계측(화면 중앙값·바닥 패치 luma·R/G·상위 5% 채도·색상각), **어두운 화면 경고**, 웹 기준 PNG와 나란히 붙인 비교판(1x 크롭 포함), EditorWindow 실시간 계측 | Sonnet `devtools-lookdev` | ① RM_Sandbox·RM1_Slice 프리셋 컷+metrics json ② RM0-LIGHT-L 측정값(화면 중앙값 25.8 등)을 같은 방법으로 재현(±1) ③ 어두운 컷(Linear+후처리, postExposure −0.15)에서 경고 발생 ④ 웹|Unity 나란히 비교판 1장 ⑤ 에디터 창 캡처 |
| **1** | DT-15 | **통합 빌드 → 실제 GPU 스모크 → 바로가기 빌드 자동 교체 → 빌드 상태판**(CTO 10-28 1순위 추가, 규칙 `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md` ③④⑤, DBT-3·DBT-4). `unity/main` HEAD가 바뀌면 `PortVerification.Build` → m1-check를 D3D12 창 모드로(보조 모니터 5120,0, `Forcing GfxDevice: Null`이면 즉시 실패) → 빌드·플레이어 로그의 셰이더 패스 누락·셰이더/의존성 못 찾음·Video 셰이더 없음·예외·LogError 집계(0이 아니면 실패, 알려진 결함은 따로 세되 통과로 치지 않음) → 통과 때만 `I:\EXODUSER-Storage\unity-latest\build` 교체(1세대 보관, 사용자가 실행 중이면 대기) → `unity-latest\status\index.html`(SHA·시각·바뀐 커밋·스모크 단계표·오류 상위 10줄·캡처 썸네일·이력 10회) | Sonnet `devtools-buildloop` | ① 실제 실행 1회(빌드·스모크 시간, Direct3D 확인, 판정) ② 상태판 캡처 ③ 기존 `passed:true` 빌드 로그에서 결함을 잡는지 ④ 교체 여부·이유. 예약 작업 등록은 스크립트만 만들고 등록은 총괄 결정 |
| **1** | DT-16 | **Unity Web(WebGPU/WebGL2) 테스트 빌드 조사**: VFX Graph 컴퓨트 제약, URP 후처리·Linear, 영상·파일 IO·스레드, 빌드 크기, 배포 후보(같은 Wi-Fi LAN 로컬 서버·itch.io 비공개·Cloudflare Pages+Access·Vercel 등). 이 PC의 6000.6.7f1에는 WebGL 모듈이 설치돼 있지 않음(`PlaybackEngines\windowsstandalonesupport`만) | 조사 에이전트 → CTO 보고 | 가능 경로·막히는 것·시험 순서·사용자 승인 항목(모듈 설치 다운로드, 외부 주소 배포) |
| 4 | DT-04 | 공유 Library 정리·캐시: 비활성 워크트리 Library 정리 목록(삭제는 사용자 확인), Unity Accelerator(로컬 캐시 서버) 도입 검토 — 설치 파일 다운로드는 사용자 확인 사항 | 개발툴 총괄 | 합계 용량 전후, 새 워크트리 첫 Refresh 시간 전후 |
| 5 | DT-05 | 데이터 기반 맵 정의(ScriptableObject `MapSliceDef`)+공용 빌더 라이브러리(`MapKit`: LumpMesh·TubeMesh·NavMesh·Terrain·Decal·카메라 리그). Rm1~4 복사 함수 31~44개를 한곳으로. 절차 메시는 `Generated/*.asset`로만 저장(씬 ≤10MB) | Sonnet(DT-02 뒤) | RM-1 씬을 공용 빌더로 다시 만들어 DT-02 결과 동일, 씬 용량 |
| 6 | DT-06 | 웹 맵 추출기 공용화(`tools/rm*/extract.mjs` 통합, `_tickBgInit(9999)`·close race 내장)+웹/2D/3D 나란히 캡처 | Sonnet | 1-1~1-4 추출 결과가 RM P0 수치와 동일 |
| 7 | DT-07 | 보스 무브 타임라인 검사기·판정 도형 오버레이(Core 바인딩, M1~M7 자동 검사)·55° 클립 검수 뷰(NRftW 기준) | 보스전 총괄과 명세 후 Sonnet | 드루이드 무브 1개를 오버레이·검사 리포트로 판정 |
| 8 | DT-08 | VFX 프리뷰 벤치(고정 틱 7시점, 판정 바닥 3종, 측정 패널, 효과별 GPU ms) | 임펙트 총괄과 명세 후 | 독 폭발 1종 7시점 시트+수치 |
| 9 | DT-09 | 캐릭터 임포트·리깅 검사기+3방향 캡처 프리셋(DT-03 확장) | 캐릭터 총괄과 명세 후 | 전사 1종 검사 리포트 |
| 10 | DT-10 | 성능 계측·회귀: 프레임 예산표, 드로우콜·SetPass·메모리 계측, 같은 컷 자동 성능 회귀(작업 서버 job), SRP Batcher·GPU 인스턴싱 점검, 텍스처·메시 임포트 프리셋 | Sonnet | RM-1 슬라이스 기준선 json+회귀 1회 |
| 11 | DT-11 | **이관 → 유니티 커스텀 총괄 C-03**(10-28, `docs/engine/UNITY_CUSTOM_LEAD_MASTER_20261028.md`). URP Renderer Feature: 탑다운 가림 페이드(맵 총괄 후속 후보 "공용 단위"), 외곽선, 높이 안개(FOG-LOW) | 맵·디자인총괄 명세 후 | 1-3 키 큰 버섯 가림 페이드 캡처 |
| 12 | DT-12 | **이관 → 유니티 커스텀 총괄 C-04**(10-28). 프로젝트 셰이더 라이브러리 정리(`SpriteLit3D`·CG 언릿 5종·Shader Graph 서브그래프 목록·공통 HLSL include)+에디터 메뉴 `Exoduser/` 통합·단축키 | Sonnet | 메뉴 목록, 셰이더 표 |
| 13 | DT-13 | 원클릭 PC·Mac 빌드(작업 서버 job로 `PortVerification.Build`+스모크, Mac은 Codex 쪽 확인) | Sonnet | PC 빌드 job 1회+시간. 스모크 판정에 빌드 로그 셰이더 의존성 누락 줄 집계 포함(임펙트 총괄 제보 10-28: unity/main 8d34eb653 빌드는 passed인데 `Universal Render Pipeline/Terrain/Lit` dependency not found 6줄·`Nature/SpeedTree7 Billboard` 1줄) |
| 14 | DT-14 | (경로는 커스텀 총괄 C-01 asmdef·자체 패키지 구조에 맞춤) 커밋 전 빠른 컴파일 검사(Unity 없이 `Library/ScriptAssemblies` 참조로 csc 컴파일 — RM-2가 `I:\rm2\compilecheck`에서 시도한 방식 정식화) | DT-01에 흡수 여부 판단 | 컴파일 오류 13건 유형을 Unity 없이 잡는지 |

## 4. 공통 설계 규칙

- **에디터 도구는 batch 진입점과 창 둘 다 가진다.** batch 진입점은 `public static int RunBatch(string[] args)`(작업 서버가 인자를 직접 넘김) + `public static void RunBatch()`(명령줄용, `Environment.GetCommandLineArgs()`를 넘김). 출력은 json 1개+PNG.
- 작업 서버에서 기존 `()` 메서드를 돌리려면 인자 대체가 필요하다 → DT-01이 `Exoduser.DevTools.ExoArgs.Get()`를 만들고 `Rm0EngineSetup`·`Rm1SliceBuilder`·`Rm3SliceBuilder`의 `Environment.GetCommandLineArgs()` 4곳만 바꾼다(다른 동작 변경 없음). RM-2·RM-4 브랜치는 병합 때 같은 한 줄 치환.
- 산출물(로그·캡처·json)은 `I:\EXODUSER-Storage\unity-jobs\`·`I:\EXODUSER-Storage\devtools\`. C 드라이브 금지. 백그라운드 `python -` 금지.
- 판정은 "실제로 그려진 것" 기준. 의도 데이터(발자국 등)로 낸 수치는 렌더 결과 수치와 나란히 적는다.
- 모든 캡처 json에 렌더 상태(색공간·후처리·Volume·postExposure·워크트리 HEAD SHA·Unity 버전)를 넣는다. 상태가 기대값과 다르면 결과에 `WARN`.
- 기존 사용자 창·서버를 자동 재시작하지 않는다. 작업 서버는 batchmode(창 없음)만, 자기가 띄운 프로세스만 정리한다.

## 5. 배정 (10-28)

| ID | 세션 | 브랜치 / 워크트리 | Unity 실행 |
|---|---|---|---|
| DT-01 | `devtools-runner` (Sonnet) | `claude/unity-pc-devtools-runner-20261028` / `E:\exoduser-wt\pc-unity-devtools-runner` | 유니티 총괄 순번 최우선(개발툴 요청 우선, 10-28 CTO) |
| DT-02 | `devtools-maplint` (Sonnet) | `claude/unity-pc-devtools-maplint-20261028` / `E:\exoduser-wt\pc-unity-devtools-maplint` | 코드 먼저, 검증은 DT-01 서버 또는 순번 1회 |
| DT-03 | `devtools-lookdev` (Sonnet) | `claude/unity-pc-devtools-lookdev-20261028` / `E:\exoduser-wt\pc-unity-devtools-lookdev` | 〃 |
| DT-15 | `devtools-buildloop` (Sonnet) | `claude/unity-pc-devtools-buildloop-20261028` / `E:\exoduser-wt\pc-unity-devtools-buildloop`(스크립트), 빌드는 기존 `E:\exoduser-wt\pc-unity-latest` | 같은 잠금으로 순번 |
| DT-16 | 조사 에이전트 (Sonnet) | 파일 변경 없음 | 없음 |

네 도구는 파일이 겹치지 않는다(`Editor/DevTools/JobServer|MapLint|LookDev/`, `Tools/devtools/buildloop/`). 공용 파일 수정은 DT-01의 `ExoArgs` 치환 4줄뿐.

- 실행 방식: 이 총괄 세션은 다른 세션(CTO) 메시지로 시작돼 새 세션을 띄울 수 없다(앱 제약). 그래서 Sonnet 구현은 이 세션의 Sonnet 하위 에이전트가 맡는다.
- 임시 Unity 잠금: DT-01이 끝나기 전까지 `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json`을 `CreateNew`로 원자적으로 만들어 잡는다(내용 owner·pid·worktree·startedAt, 죽은 pid면 stale). DT-01 완성 뒤에는 `unity/Tools/devtools/exo-unity.ps1`가 같은 파일을 관리한다. 유니티 총괄 순번(10-28)은 개발툴을 맨 앞에 둔다.

## 5.1 진행 현황 (10-28 저녁)

| ID | 브랜치 / SHA | 상태 | 증거 | 핵심 결과 |
|---|---|---|---|---|
| DT-01 | `claude/unity-pc-devtools-runner-20261028` 36448bdb9 | 병합 요청 | `I:\EXODUSER-Storage\devtools\dt01\RESULT.md`, 빌드 영수증 `dt01\build\receipt.json` | 같은 캡처 job: 1회 batch 7.1초 → 상주 서버 1.07초(Rm0), 10.7초 → 1.46초(Rm1), 6.6~7.3배. 스크립트 1줄 수정 job 6.1초, 컴파일 오류 1.2초 만에 json·서버 생존. 서버 메모리 idle 1.7~2.2GB·최대 2.35GB, 플레이어 1.6~2.3GB. 창 옵션 거부·headless 창 핸들 0·예약 큐·HALT·USER_SAVE 스냅샷·WHEA 표시·memlog. 빌드 전 영상 복원·필수 영상 검사 |
| DT-02 | `claude/unity-pc-devtools-maplint-20261028` 9a96d08bd | 병합 요청 | `I:\EXODUSER-Storage\devtools\dt02\RESULT.md`, `rm3_run3.png`, `rm1_run3.png` | unity/main RM3_Slice에서 **원점 쌓임 렌더러 1,170개**(부모 583곳)·안 덮인 막힌 섬 41/50 검출(빌더 수치는 둘 다 0). 맵 총괄이 맵 구조 판정 기준 도구로 채택. L1b(머리 위 덮개 2.5u+, 가림 검사) 신설. 검사 1회 RM-3 0.5초·RM-1 0.08초. 데칼 판정 대기 |
| DT-03 | `claude/unity-pc-devtools-lookdev-20261028` 3ef2607ac | 병합 요청 | `I:\EXODUSER-Storage\devtools\dt03\RESULT.md`, `out\RM_Sandbox__ov-postExposure-1.85_compare.png` | `measure_L.py`와 지표 차이 0(15단계). unity/main 기본(−0.15) 화면 중앙값 4.06 → `DARK` 경고, 1.85 override 25.76(문서 25.8). 캡처마다 렌더 상태 json |
| DT-15 | `claude/unity-pc-devtools-buildloop-20261028` → unity/main **d30ea8607 병합됨**. fail-closed `…-buildloop2-20261028` 91f376ffd 병합 요청 | 일부 병합 | `I:\EXODUSER-Storage\unity-latest\status\index.html`, `loop\runs\20261028-1414_51f130f\` | 창 없는 실제 GPU 스모크(D3D12, `-batchmode` GPU 유지, `--unity-mute`, RenderTexture 캡처), m1 21/21, overlay 판정(LT-2 일시정지 가림 FAIL), 필수 영상 9개 검사, 크래시 1회 재시도 후 HALT, 세이브 격리 `--unity-qa-sandbox` + USER_SAVE 비교, hud-smoke 자동 종료(DBT-6), 영수증 최종 경로(DBT-7), 상태판(커밋 여유 추이 포함). fail-closed: `QaRunPolicy.IsAutomated`(`Runtime/Core/Platform/`, 단위 테스트 62건) |
| DT-16 | `claude/unity-pc-devtools-web-20261028` 4af345fc5(병합 안 함) | 배포됨(비공개 미리보기) | `I:\EXODUSER-Storage\devtools\web\RESULT.md` | Vercel 미리보기(로그인 필요, 비로그인 302 확인). 770MB → 175MB(웹 전용 DXT·ASTC, 영상 720p), 로드 10~14초, WebGPU, FDG → 1-1 → 이동·공격까지 스모크 통과, 게임 톤 로딩 템플릿 |

### 10-28 22시 Codex 인수 검수

| 단위 | 원격 SHA·현재 판정 | 검증·다음 단계 |
|---|---|---|
| DT-01 runner2 | `claude/unity-pc-devtools-runner2-20261028` `2aa218bcd` 원격 보존, `unity/main` 미병합 | 시작 조건 12/20/10GB·숨은 데스크톱·build 인자 분리·14건 자체 시험 코드 확인. 현 `unity/main`과 `merge-tree` 충돌 0. 실제 숨은 데스크톱 Player 영수증은 이 인수에서 새로 만들지 않음. 통합 담당 검증 대기 |
| DT-15 buildloop3 | `claude/unity-pc-devtools-buildloop3-20261028` `0ea27c069` 원격 보존, `unity/main` 미병합 | `merge-tree` 충돌 0. 기본 숨은 데스크톱 스모크·타이틀 영상 필수 검사·11a/12a/12b 하네스 위치를 정적 확인. 현재 `Run-DesktopSmoke`가 플레이어를 직접 `CreateProcess`로 띄워 공통 규칙의 `exo-unity.ps1` 전용 실행과 충돌. 이 경로를 정리하기 전에는 새 통합 빌드·`unity-latest` 교체를 수행하지 않음 |
| DT-16 웹 인트로 진단 | 키 주입·PC 진단 커밋 `65e14f1bb`는 `unity/main`의 조상. `claude/unity-pc-devtools-web-introdiag-20261028` 끝 `219cdef80`은 웹 빌드 브랜치의 임시 merge 포함 | 원격 브랜치를 그대로 병합하면 최신 타이틀 메뉴·미디어·다른 팀 코드를 되돌릴 위험이 있어 병합 대상에서 제외. PC 재현 불가와 웹 가설은 `UNITY_INTRO_KEYS_20261028.md`에 기록됨. 최신 Unity Web 실측은 별도 필요 |
| Codex 실행·정리 도구 | `codex/pc-devtools-tools-20261028` `33ef33763` 원격 보존, `unity/main` 미병합 | 실행 없는 자체 시험 종료 0. 종단 시험 메타 종료 1이므로 Codex 실제 작업 성공 미확인. 정리 도구의 금지된 `worktree prune` 호출 제거, 미등록·링크 루트 비순회, 전역 ignore 접근 오류 보수 처리. `apply` 미실행 |

DT-01 runner2와 Codex 도구 브랜치를 함께 병합하면 `unity/Tools/devtools/README.md`에 내용 충돌 1건이 난다(`merge-tree` 정적 검사). 통합 담당은 두 설명을 함께 보존하고 충돌을 해소해야 한다. 브랜치 push는 `unity/main` 통합이나 PC·Mac 실행 일치를 뜻하지 않는다.

**남은 결함·후속**
- 무창(batchmode) 캡처에는 OnGUI가 돌지 않아 HUD·UI가 없다(`guiRepaints=0`). 숨은 Windows 데스크톱(`CreateDesktop` + `lpDesktop`)에서 batchmode 없이 띄우는 방식을 DT-15 2단계로 시험한다(`desktop-probe.ps1` 준비, 미실행).
- 웹: HUD 스킬 바가 회색 띠(WebGPU Readback 실패 추정, `NativeHud.cs:89~90` `BuildLabelCleanBar`) — 런타임 수정, 유니티 총괄 배정. Unity 스플래시 끄기(다음 웹 빌드). Production 빈 페이지(`exoduser-unity-web-test.vercel.app`, 200)와 예전 미리보기는 사용자가 대시보드에서 정리(영구 삭제라 개발툴이 하지 않음).
- 새 worktree는 .gitignore된 로비 영상 2개·`Rendering/Sandbox/test_sprite.png`가 없다 → 빌드 전 restore 스크립트로 복원(실행기·buildloop에 반영).
- 에디터 창(MapLint·LookDev)은 batchmode 검증만 했고 눈 검수 전이다.

**사고 기록**
- 10:30 DT-15 창 모드 스모크가 사용자 화면에 플레이어 창을 띄움 → 무창 규칙으로 전환(같은 날 "유령같이" 지시).
- 11:11 개발툴 총괄이 문서 편집 명령에 stdin 대기 `python -I -`를 섞어 실행 → 3분 안에 종료, 로그 폭주 없음.
- 14:17 DT-01 정리 단계가 재사용 pid 5개(63284·60904·63164·51452·60708)를 종료했을 가능성 → "자기 자손 + 생성 시각 일치"만 정리하도록 수정.
- 14:16 DT-01 서버 세션 중 다른 세션 Unity 8개가 잠금 없이 실행됨 → 공용 실행기 사용 공지 요청.
- 13:52 RM-INT 검증 실행이 사용자 실제 세이브(`LocalLow\ForDearGamers\…\combat-save-v1`)를 바꿈 → 세이브 격리·fail-closed·USER_SAVE 판정 도입.
- DT-16 웹 빌드가 시작 조건을 10GB로 낮춰 실행(규칙 위반, 기록만).

## 6. 결정 기록

| 날짜 | 결정 | 근거 |
|---|---|---|
| 10-28 | 1순위 = 상주 작업 서버+순번 큐(DT-01). Accelerator·Library 공유보다 먼저 | 고정 비용 9~10초×하루 수백 회, 4팀 모두 순번에 막힘. Library 문제는 새 워크트리 첫 실행에만 걸린다(1~4분) |
| 10-28 | "PC 전체 Unity 1개" 규칙은 유지하되 사람 신호 대신 기계 잠금으로 | 메모리 고갈 크래시 실사고. 슬롯 2개는 DT-01 메모리 실측 뒤 판단 |
| 10-28 | 2순위 = 실제 렌더 기준 구조 검사기 | 실패 유형 B(RM-3 원점 쌓임)가 병합까지 통과 |
| 10-28 | 3순위 = 룩데브 캡처 리그(렌더 상태 기록+어두움 경고) | 실패 유형 A가 맵·보스·VFX·캐릭터 4팀 공통 |
| 10-28 | DT-15(통합 빌드·GPU 스모크·바로가기 교체·상태판)를 1순위에 추가 | CTO 규칙 UNITY_DONE_BUILD_PLAYTEST_RULE(사용자 "배포하고 테스트하는 작업이 없어서 이상하다"). 스모크가 Null 장치라 화면 결함을 못 잡았다 |
| 10-28 | 스모크 판정에서 알려진 결함을 통과로 치지 않는다. 교체는 기본 거부, `-AllowKnown`일 때만 | 규칙 ④ "0이 아니면 실패" |
| 10-28 | RM0-LIGHT-L 병합은 미루지 않는다(유니티 총괄 협의 회신) | DT-03은 조명값을 고정하지 않고 Volume에서 읽어 기록하며, `-override postExposure`로 병합 전후 모두 검증 가능 |
| 10-28 | 손코딩 빌더 대체(DT-05)는 DT-02 뒤 | 검사기가 먼저 있어야 공용 빌더 전환 전후 동일성을 증명할 수 있다 |
| 10-28 | DT-11(URP Renderer Feature)·DT-12(셰이더 라이브러리)를 유니티 커스텀 총괄(`local_143f9249`) C-03·C-04로 이관. asmdef·자체 패키지 구조(C-01)는 커스텀 총괄, DT-14는 그 구조를 따른다. 테스트(C-06)는 공동: 러너·job = 개발툴, 테스트 구조·스모크 내용 = 커스텀 총괄. 패키지 추가·버전 변경은 커스텀 총괄 §5 승인 | 커스텀 총괄 SSOT `docs/engine/UNITY_CUSTOM_LEAD_MASTER_20261028.md` §6 경계(main 8b5e5e464) |
| 10-28 | 창 모드 스모크 취소. 모든 자동 실행은 공용 무창 실행기(DT-01 `exo-unity.ps1`)를 거친다: 플레이어 `-batchmode`(GPU 유지, `-nographics` 금지)+`--unity-mute`, 캡처는 RenderTexture, `-popupwindow`·`-screen-fullscreen`·headed 브라우저는 거부, 실행 뒤 창 핸들 0 검사, 장치 Null이면 실패 | 사용자 지시 "유령같이 브라우저도 안 뜨고 소리 안 나오게"(CTO 10-28 전달). 10:30 DT-15 창 모드 스모크가 사용자 화면에 창을 띄움 |
| 10-28 | 잠금 규칙 보강: pid = 끝까지 기다리는 실행 스크립트 `$PID`, 삭제는 owner·pid가 자기일 때만, pid가 죽었어도 startedAt 10분 이내이고 Unity가 살아 있으면 덮어쓰지 않음, 시작 조건은 커밋 여유(디스크 아님) | 10:19 maplint가 O-1 잠금을 덮어쓴 사고(유니티 총괄 실측) |
| 10-28 | 시작 조건은 커밋 여유 20GB(Library 없음 30GB) 유지. DT-01 실측 근거의 완화안(에디터 12GB·Library 없음 20GB·플레이어 10GB)은 `-Profile proposed`로만 두고 유니티 총괄 합의 뒤 적용. 동시 실행 1 유지 | 작업당 커밋 최대 3.5GB, 시스템 커밋 10초에 5~6GB 흔들림, 상주 서버가 7배 빨라 직렬로 충분, XMP 6400·WHEA·access violation 이력 |
| 10-28 | 자동 실행은 세이브 격리 필수(fail-closed): 격리 실패 시 Quit(3). 판정은 `QaRunPolicy.IsAutomated` 한 곳(`Runtime/Core/Platform/`, 커스텀 총괄 판정 — 규칙 아닌 플랫폼 코드, oracle 대상 아님) | 13:52 사용자 세이브 변경 사고 |
| 10-28 | 웹 테스트 빌드는 Vercel 비공개 미리보기만(사용자 직접 승인). `--prod`·promote·alias 금지. 영구 삭제(Production 빈 페이지 등)는 사용자가 직접 | 사용자 선택(이 세션 질문 카드), 안전 규칙 |
| 10-28 | unity-latest `efae9aa11` 유지(구 캡처 코드라 화면 미검증, 로그 0·m1 20/20·D3D12). 다음 교체는 fail-closed 병합 뒤 최신 unity/main | 되돌리면 더 오래된 빌드가 됨 |
