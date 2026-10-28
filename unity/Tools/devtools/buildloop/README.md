# Unity 빌드 고리 (buildloop) — DBT-3 / DBT-4

`origin/unity/main`이 바뀌면 빌드 → **실제 GPU** 스모크(`--unity-m1-check`) → 로그 판정 → 통과 시 바탕화면 바로가기 빌드(`I:\EXODUSER-Storage\unity-latest\build`)를 교체하고 상태판을 갱신한다. 규칙: `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`.

| 명령 | 하는 일 |
|---|---|
| `buildloop.ps1 check` | HEAD와 마지막 배포 빌드 SHA 비교, 새 커밋 수·제목 출력 (`NEEDS_BUILD=True/False`) |
| `buildloop.ps1 run [-Force] [-AllowKnown]` | 새 커밋이 있으면 전체 고리 1회. `-Force`=이미 시도한 HEAD도 다시, `-AllowKnown`=알려진 결함만 있어도 교체 |
| `buildloop.ps1 status` | 상태판(`status\index.html`, `status.json`) 다시 쓰기 + 요약 |
| `buildloop.ps1 swap [-AllowKnown]` | 사용자가 플레이 중이라 미룬 교체를 다시 시도 |
| `buildloop.ps1 -JudgeOnly <로그> -Scope build\|player` | 빌드 없이 로그 한 개만 판정 |
| `buildloop.ps1 install` | 이 폴더를 `unity-latest\loop\bin`으로 복사(실행 위치는 워크트리 밖 권장 — 고리가 `pc-unity-latest`를 매번 `checkout -f` 한다) |
| `watch.ps1 -Minutes 20` | `run`을 N분마다 부르는 포그라운드 루프 |
| `install-task.ps1` | Windows 예약 작업 등록(만들기만 함, 실행 안 함) |

## 흐름과 안전장치
1. 잠금 `I:\EXODUSER-Storage\unity-jobs\_pc_lock.json` 원자적 생성(`CreateNew`), 보유자 pid가 살아 있으면 30초 간격 최대 60분 대기, 죽었으면 덮어씀. 이어서 Unity/EXODUSER-Unity 프로세스 0개 + 커밋 여유 20GB(Library 없으면 30GB)를 기다린다. 끝나면(예외 포함) 잠금 삭제.
2. 워크트리 `E:\exoduser-wt\pc-unity-latest`를 detach → 영상 복원 스크립트 → `PortVerification.Build`를 `build_new\`로.
3. 스모크: 플레이어를 `--unity-m1-check ... -popupwindow`로 띄워 창을 **오른쪽 보조 모니터 (5120,0)** 1920×1080으로 옮긴다(보조 모니터가 없거나 이동 실패면 스모크를 중단 — 메인 모니터 금지). 소리는 `NativeGame.M1Check` 첫 줄이 `AudioListener.volume=0`/`pause=true`로 끈다(별도 인자 불필요).
4. 판정(`smoke-rules.json`): `Invalid pass number`, 셰이더·의존성 못 찾음, 비디오 셰이더, `Exception`, `LogError`/컴파일 오류, `Forcing GfxDevice: Null`(플레이어 로그)을 센다. 알려진 결함(DBT-1·DBT-2·DBT-N1 …)은 따로 세어 "알려진 결함 N건"으로 표시하지만 **통과가 아니다**. 판정은 `PASS`/`KNOWN`/`FAIL`/`ABORT`. Direct3D 11/12가 안 잡히거나 m1 단계에 fail이 있어도 FAIL.
5. 교체: `PASS`(또는 `KNOWN`+`-AllowKnown`)일 때만. 이전 `build`는 `build_prev` 1세대로 보관. 사용자가 `build\EXODUSER-Unity.exe`를 직접 실행 중이면(`--unity-` 인자 없는 프로세스) 교체하지 않고 `pending`으로 두고 상태판에 표시한다. 바로가기 파일은 건드리지 않는다.

## 산출물 (`I:\EXODUSER-Storage\unity-latest\`)
`build\` `build_prev\` `build_new\` · `build-receipt.json`(PortVerification 영수증) · `build-commit.json` · **`loop-receipt.json`**(SHA·브랜치·시각·판정) · `status\index.html`·`status.json`·`status\thumbs\` · `loop\runs\<id>\`(빌드 로그·`smoke\` 로그·`caps\*.png`·`m1-check.json`·`run.json`, 최근 10회) · `loop\state.json` · `loop\buildloop.log`.

## 판정 규칙 고치기
`smoke-rules.json`의 `ignore`/`fail`/`knownIssues`만 고친다. 결함을 고치면 해당 `knownIssues` 항목을 지워 다시 "실패"로 잡히게 한다.
