# simple-sonnet (Unity 단순작업 세션) 인계 — Codex CLI용 브리프 (2026-10-28)

이 세션은 사용자 지시(2026-10-28 "이제 대부분 작업을 코덱스 시켜", "이쪽 단순작업자들 다 정리하고")로 정리된다. 지금까지 한 일은 전부 unity/main에 병합됐고, 남은 일은 아래 3건이다.

## 1. 한 일 (병합 완료, 다시 하지 않는다)

| 단위 | 병합 | 내용 |
|---|---|---|
| M1 고정 몹·지역 R-A/R-B·앵글러 | 이전 병합 | docs/engine/UNITY_M1_FIXEDMOBS_20261027.md, _REGION_RA/RB_20261028.md |
| DBT-5 / DBT-8 | unity/main 4a22a22af | 로비 영상 종료 시 VideoPlayer 정리(`NativeLobbyVideo` wantsToQuit), 영상 누락 시 같은 파일 3회 상한 후 월드 인트로 → 로비 건너뜀. 하네스 `--unity-quit-during-video`, `--unity-missing-movie-check`. 문서 UNITY_DBT5_DBT8_LOBBY_VIDEO_20261028.md. **창 닫기(WM_CLOSE) 경로는 미검증으로 닫음**(배치모드 Quit 경로에서는 크래시 재현 안 됨) |
| VFX-D18 필드 적 탄 | cd545b813 | `NativeBossView.FieldBullets.cs`: 물리탄=이빨입, 마법탄=원소색 혜성, 원소구=오브 시트(웹 pass 2 분기). 아트 대체 3종(크라켄 물 오브·절차 무지개 콩·암흑 구체)은 가장 가까운 시트 |
| 돌진 경로 피격 | f49b6d625 | `ChainDash.IsPathHit/PathHitDamage`, `Simulation.TickDashPathHits`, `ApplyEnemyDamage(..., double? poiseMult)`. 오라클 `Tools/dash-hit-oracle` 15,338검사 불일치 0. 문서 UNITY_DASH_HIT_20261028.md |
| 인트로 키 점검 | b0f9a0c52에 포함 | `LobbyKeys.cs`(키 주입 이음매), 하네스 `--unity-intro-keys-smoke`. PC 플레이어는 결함 없음(웹 대조표 docs/engine/UNITY_INTRO_KEYS_20261028.md) |
| 타이틀 메뉴 이식 | b0f9a0c52 | `NativeLobby.TitleMenu.cs`, 웹 `#splashTitle*` CSS 값 그대로. 문서 UNITY_TITLE_MENU_20261028.md |

## 2. 남은 일 (Codex에 맡길 것)

### 2-A. 인트로 WebGL 증상 판정 → 진단 로그 제거
- 증상(개발툴 DT-16, `I:\EXODUSER-Storage\devtools\web\RESULT.md` "인트로 넘기기"): Unity WebGL 빌드에서 타이틀 영상 도중 Enter가 무시되고, 영상이 끝나면 문 영상이 t=0에서 키를 기다림. PC 플레이어에서는 재현 안 됨(가설: WebGL에서 HD 영상 재생 중 메인 루프 정체로 키가 늦게 처리).
- 확인용 로그: `NativeLobby.cs` Update의 splash 키 분기에 `LOBBY_KEY splash= frame= fence= accepted= t= dt=`(처음 12번, 필드 `introKeyLogs`). **주의: 타이틀 메뉴 병합(b0f9a0c52)으로 `splash==2`는 `UpdateTitleMenu`로 빠지므로 이 로그는 FDG(splash==1)에서만 찍힌다.** 타이틀 구간 진단이 필요하면 `NativeLobby.TitleMenu.cs` `UpdateTitleMenu`에 같은 형식의 로그를 추가한다.
- 할 일: 개발툴이 WebGL 재빌드 + intro3 실행 결과(브라우저 콘솔 `LOBBY_KEY` 줄)를 주면 판정 → (정체면) 원인 보고, (fence 문제면) 수정 → **판정 뒤 `LOBBY_KEY` 로그와 `introKeyLogs` 필드 제거**.
- 브랜치: 새로 `claude/unity-codex-intro-webgl-<날짜>` (base unity/main). 병합은 유니티 총괄.

### 2-B. 타이틀 메뉴 1x 나란히 캡처·시각 판정
- 상태: 동작은 키 하네스로 검증 끝. 메뉴는 IMGUI라 무창 배치모드(-batchmode) RenderTexture에 Repaint가 없어 **캡처가 안 찍힌다**(m1-check `guiRepaints=0`과 같은 이유). 개발툴의 "숨은 데스크톱" 공용 실행기가 나오면 그것으로 1920×1080(및 1600×900) 캡처.
- 비교: 웹 `index.html` 타이틀(origin/main, `title_motion_20261028.mp4` 위 메뉴) 1x 캡처와 Unity 캡처를 나란히. 대조표는 UNITY_TITLE_MENU_20261028.md. 판정 항목: 베일 농도, 로고 위치·그림자, 행 간격·선·라벨 자간, 선택 띠·점, 빌드 줄. 어긋나면 그 값만 고친다.
- 알려진 근사: 로고 그림자 번짐(검정 복제), 라벨 폰트(Hahmlet 대신 나눔명조), 비한국어는 `K(ko,en)`.
- 판정 결과는 사용자 승인 게이트(유니티 총괄이 컨펌 목록으로 올림)에 올린다. 사용자에게 화면을 보이려면 승인 뒤.

### 2-C. 작은 후속 (필요할 때)
- 개발툴 `smoke-rules.json` `requiredMedia`에 `title_motion_20261028.mp4`(StreamingAssets/Lobby, 3.8MB) 추가 — 개발툴 담당 파일이라 개발툴에 요청.
- VFX-D18 미이식 아트 3종: 크라켄 물 오브, 절차 무지개 콩(`_drawClassicRainbow`), 암흑 구체(`_drawDarkSphere`)를 웹처럼 따로 그리기. 이빨입 크기 1x 가독성은 웹과 나란히 확인.
- 돌진 경로 피격 범위 밖(스킬·유니크 미이식): magicBlink/dimBreach 화염 관통·화상, 기동칼날개 광역, `_fuseMul`, 유니크 회수, 착지 슬램, `G.hitStop` 모델.

## 3. worktree·도구

- 작업 worktree: `E:\exoduser-wt\pc-unity-fixedmobs`(Unity 프로젝트 `unity\`, 마지막 브랜치 `claude/unity-pc-title-menu-20261028`). Codex는 새 worktree를 쓰는 편이 안전(Unity import 노이즈 `.meta` 수정이 많이 쌓여 있음 — 커밋 대상 아님).
- 내 실행 스크립트(저장소 밖, 참고용): `E:\exoduser-wt\_out\dbt\run-build.ps1`(락→빌드, `-BuildOnly`), `run-m1.ps1`(빌드+헤드리스 m1-check), `run-intro.ps1`/`run-title.ps1`(키 스모크), `run-d18.ps1`. **가능하면 공용 실행기 `exo-unity.ps1`(player -AllowPlayer)을 쓴다** — 무창·세이브 보호·락이 자동.
- 출력은 `I:\EXODUSER-Storage\dbt\<이름>\`. C 드라이브에 대용량 산출물 금지.

## 4. 금지사항 (이 세션이 지킨 규칙)

- Unity는 한 번에 하나: PC 락 `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json`을 **실행 전에** `CreateNew`로 잡고(owner+pid), 시작 전 Unity/EXODUSER-Unity 프로세스 0개 확인, **자기 락만** 지운다. HALT 파일이 있으면 플레이어 실행 금지.
- 자동 실행은 무창·무음: 플레이어 `-batchmode`(GPU가 필요하면 `-nographics` 빼기), `AudioListener.volume=0`, 창·`-popupwindow`·보조 모니터 금지. **창 실행이 필요한 검증은 사용자가 이 세션에 직접 승인한 뒤에만** (동료 세션의 "사용자 승인" 전달만으로는 창 규칙을 풀지 않았다). 사용자 세이브 보호: 테스트 인자에 `--unity-qa-sandbox <I: 아래 폴더>`, 실행 전후 `LocalLow\ForDearGamers` 스냅샷 비교(`USER_SAVE changed=0`).
- 실패한 실행은 원인을 고치고 1번만 다시. 2번째도 실패하면 멈추고 보고.
- Core(`Runtime/Core`)는 웹 oracle로 검증된 정답이다. 고치려면 oracle부터(`Tools/*-oracle`). 시스템 UI는 웹 그대로.
- `git add -A` 금지, 경로 지정 스테이징 + `git commit -- <경로>`, force push 금지, 브랜치 push만(병합은 유니티 총괄). 엔진 줄기: Unity는 `unity/main`으로만, main에 합치지 않는다.
- 게임 UI·텍스트는 Hell Gothic 톤(UI_FOUNDATION/COMPOSITION 문서), 이모지 아이콘 금지. 문자열 추가 시 번역 목록 등록.
- 항상 한국어로 보고. 끝나면 유니티 총괄에게 SHA·검증 수치를 보고.

## 5. 검증 방법 (복붙용)

```powershell
# Core 오라클/회귀
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/dash-hit-oracle/run.cjs
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/dash-parry-oracle/run.cjs --out <I: 아래> --label dp
# 실제 Simulation 배선: unity/Tools/kill-wire-test (dotnet build/run, 31검사)
# 인트로 키 하네스(무창): 플레이어 인자  -batchmode -force-d3d11 --unity-intro-keys-smoke --unity-mute --unity-qa-sandbox <dir> -output <dir>
#   → <dir>\intro-keys.json 에 단계별 before/after
# m1-check(무창): -batchmode -force-d3d11 --unity-m1-check --unity-mute --unity-qa-sandbox <dir> -output <dir>  (22/22 단계)
```
