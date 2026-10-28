# Unity 빌드 고리 (buildloop) — DBT-3 / DBT-4

`origin/unity/main`이 바뀌면 빌드 → **실제 GPU** 스모크(`--unity-m1-check`) → 로그 판정 → 통과 시 바탕화면 바로가기 빌드(`I:\EXODUSER-Storage\unity-latest\build`)를 교체하고 상태판을 갱신한다. 규칙: `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`.

| 명령 | 하는 일 |
|---|---|
| `buildloop.ps1 check` | HEAD와 마지막 배포 빌드 SHA 비교, 새 커밋 수·제목 출력 (`NEEDS_BUILD=True/False`) |
| `buildloop.ps1 run [-Force] [-AllowKnown] [-Ref <브랜치>] [-NoSwap]` | 새 커밋이 있으면 전체 고리 1회. `-Force`=이미 시도한 HEAD도 다시, `-AllowKnown`=알려진 결함만 있어도 교체, `-Ref`=다른 브랜치를 빌드(자동으로 `-NoSwap`: build 교체·상태 갱신 없음) |
| `buildloop.ps1 status` | 상태판(`status\index.html`, `status.json`) 다시 쓰기 + 요약 |
| `buildloop.ps1 swap [-AllowKnown]` | 사용자가 플레이 중이라 미룬 교체를 다시 시도 |
| `buildloop.ps1 -JudgeOnly <로그> -Scope build\|player` | 빌드 없이 로그 한 개만 판정 |
| `buildloop.ps1 install` | 이 폴더를 `unity-latest\loop\bin`으로 복사(실행 위치는 워크트리 밖 권장 — 고리가 `pc-unity-latest`를 매번 `checkout -f` 한다) |
| `watch.ps1 -Minutes 20` | `run`을 N분마다 부르는 포그라운드 루프 |
| `install-task.ps1` | Windows 예약 작업 등록(만들기만 함, 실행 안 함) |

## 흐름과 안전장치
1. 잠금 `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json` 원자적 생성(`CreateNew`), 보유자 pid가 살아 있으면 30초 간격 최대 60분 대기, 죽었으면 덮어씀. 이어서 Unity/EXODUSER-Unity 프로세스 0개 + 커밋 여유 20GB(Library 없으면 30GB)를 기다린다. 끝나면(예외 포함) 잠금 삭제.
2. 워크트리 `E:\exoduser-wt\pc-unity-latest`를 detach → 영상 복원 스크립트 → `PortVerification.Build`를 `build_new\`로.
3. 스모크(**무창**, 실제 GPU): 플레이어를 `-batchmode --unity-m1-check --unity-mute -screen-width 1600 -screen-height 900`으로 띄운다(`-nographics` 없음 → GPU 장치 유지, 창 없음). `--unity-mute`는 `AudioListener.volume=0`/`pause=true`. 캡처는 월드 카메라 → RenderTexture 1600×900 → PNG(`NativeGame.M1Check.cs`, batchmode+`--unity-mute`일 때만). IMGUI(HUD)는 batchmode에서 Repaint 이벤트가 오는지에 따라 같은 RenderTexture에 얹는다 — 몇 번 그렸는지 `m1-check.json`의 `guiRepaints`/`guiBridged`에 남고, 0이면 상태판에 "캡처에 UI 없음"이 뜬다. 자기가 띄운 Unity·플레이어의 `MainWindowHandle`이 0이 아니면 즉시 종료하고 실패. m1-check.json을 쓴 뒤 60초 안에 안 끝나면 강제 종료(DBT-6 기록). 종료코드 0xC000041D는 DBT-5로 센다. 포커스 이탈 자동 일시정지는 `--unity-m1-check`에서 꺼져 있고(`NativeGame.PauseFocus.cs`), 캡처마다 일시정지/인벤토리/스킬/스탯/대장간 UI가 떠 있는지 `overlay`로 기록한다. 일시정지 메뉴 위의 캡처는 그 단계 실패.
4. 판정(`smoke-rules.json`): `Invalid pass number`, 셰이더·의존성 못 찾음, 비디오 셰이더, `Exception`, `LogError`/컴파일 오류, `Forcing GfxDevice: Null`(플레이어 로그)을 센다. 알려진 결함(DBT-1·DBT-2·DBT-N1 …)은 따로 세어 "알려진 결함 N건"으로 표시하지만 **통과가 아니다**. 판정은 `PASS`/`KNOWN`/`FAIL`/`ABORT`. Direct3D 11/12가 안 잡히거나 m1 단계에 fail이 있어도 FAIL.
5. 교체: `PASS`(또는 `KNOWN`+`-AllowKnown`)일 때만. 이전 `build`는 `build_prev` 1세대로 보관. 사용자가 `build\EXODUSER-Unity.exe`를 직접 실행 중이면(`--unity-` 인자 없는 프로세스) 교체하지 않고 `pending`으로 두고 상태판에 표시한다. 바로가기 파일은 건드리지 않는다.

## 산출물 (`I:\EXODUSER-Storage\unity-latest\`)
`build\` `build_prev\` `build_new\` · `build-receipt.json`(PortVerification 영수증) · `build-commit.json` · **`loop-receipt.json`**(SHA·브랜치·시각·판정) · `status\index.html`·`status.json`·`status\thumbs\` · `loop\runs\<id>\`(빌드 로그·`smoke\` 로그·`caps\*.png`·`m1-check.json`·`run.json`, 최근 10회) · `loop\state.json` · `loop\buildloop.log`.

## 판정 규칙 고치기
`smoke-rules.json`의 `ignore`/`fail`/`knownIssues`만 고친다. 결함을 고치면 해당 `knownIssues` 항목을 지워 다시 "실패"로 잡히게 한다.

## 추가 규칙 (2026-10-28)
- **사용자 세이브 보호**: 스모크는 `--unity-qa-sandbox <runDir>\smoke\sandbox`로 roster·combat-save·native-settings 경로를 격리한다(`NativeQaSandbox.cs`, m1-check+batchmode는 인자 없어도 `persistentDataPath\qa\<시각>-<pid>`로 자동 격리). 실행 전후 `LocalLow\ForDearGamers` 스냅샷(크기·시각·SHA256, Unity Analytics 제외)을 비교해 `USER_SAVE changed=N`을 상태판에 쓰고 N>0이면 FAIL. 사용자 파일은 읽기만 한다.
- **필수 영상**: 빌드 전에 복원 스크립트 2개를 돌리고 `smoke-rules.json`의 `requiredMedia`(StreamingAssets\Lobby 영상 9개, 최소 1MB)를 확인한다. 하나라도 없으면 빌드 실패, 상태판에 "필수 영상 누락".
- **크래시 정지**: 에디터·플레이어 종료코드 -1073741819(0xC0000005)이거나 로그에 `access violation`/`crash has been intercepted`가 있으면 1회 재시도, 또 크래시면 `I:\EXODUSER-Storage\unity-jobs\HALT`(시각·원인·로그·크래시 폴더)를 쓰고 멈춘다. HALT가 있으면 `run`은 실행되지 않는다(지우는 건 사람).
- **검은 캡처**: batchmode에서 `ScreenCapture`는 검은 PNG를 쓴다. 캡처의 20%(최소 4장) 넘게 검으면 FAIL — 무창 캡처를 지원하는 빌드(이 브랜치의 M1Check)만 통과한다.
- **메모리**: 실행 중 `unity-jobs\memlog.csv`에 한 줄씩 기록(열 = 시각, 커밋 사용, 한도, 여유, Unity·claude·node 수), 상태판에 최근 24시간 커밋 여유 SVG 그래프(20/30GB 점선).
- **컴파일 검사**: `compile-check.ps1` — Unity 없이 csc로 Assembly-CSharp 컴파일(약 6초). 런타임 C# 변경 전 먼저 돌린다.
- 알려진 한계: batchmode에서는 IMGUI(OnGUI)가 호출되지 않아 캡처에 HUD/UI가 없다(`guiRepaints=0`). UI 판정은 별도 방식이 필요하다.
