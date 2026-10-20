# MAC-LIVE 실창 실행·녹화 보고 — 2026-10-20

**판정: BLOCKED — 현재 실행 도구의 macOS 화면 기록 권한 없음.**

`CGPreflightScreenCaptureAccess()`가 `false`를 반환했고, `screencapture` 1초 동영상 시도는 exit 1로 종료되어 파일이 생성되지 않았다. stderr/stdout은 모두 0 byte였다. 권한 검사와 녹화 실패를 함께 근거로 판단했으며, 빈 stderr를 특정 오류 메시지로 해석하지 않았다. 사용자 지시대로 권한 변경·우회 없이 중단했다. 게임 Main은 실행하지 않았으므로 부팅 실패로 판정하지 않는다.

## 작업 기준·변경 범위

| 항목 | 기록 |
|---|---|
| 작업ID·브랜치 | `mac-live` · `codex/mac-live-20261020` |
| worktree | `/Users/fordeargamers/exoduser-wt/mac-live` |
| 시작 기준 | `git fetch origin` 성공 후 `origin/main` = `7c4a2442bfc46f5d25c1bd9bf287a9324d8d5e5a`에서 신규 worktree 생성 |
| 선행 지시 | 위 SHA의 `MAC_ORDERS_20261020.md`, `WORK_BOARD.md` 확인. 사용자의 MAC-LIVE 별도 배정을 적용했으며 작업 1~7은 수행하지 않음 |
| 기준 체크아웃 R | `/Users/fordeargamers/Projects/exoduser-migration-20261001` · branch `codex/mac-live-play-time-main-20261017` · HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작 시 tracked INDEX/WORK 각각 변경 없음 |
| 변경 파일 | 이 보고서, `docs/engine/orders/WORK_BOARD.md`의 신규 MAC-LIVE 행만. 게임 코드·에셋 수정 없음 |
| 원본 Godot | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` |
| 버전 실행 결과 | `--version` exit 0 · `4.7.2.stable.official.ed1daf0bf` |
| 예정 격리 이름 | `EXODUSER-MacLive-Isolated-20261020` — Main 미실행으로 생성·사용하지 않음 |
| import·App Support 백업 | 화면 기록 권한 단계에서 중단하여 둘 다 미실행. import 전 필수 백업 대상은 `~/Library/Application Support/Godot/`, 예정 백업은 `~/exoduser-wt/_backup/godot-appsupport-20261020-mac-live/` |
| override | `godot/override.cfg`는 원래 없었으며 작성하지 않음. 커밋 대상 아님 |
| 보존 | 실제 저장 폴더 `EXODUSER-Godot-Native-First`, 기존 게임 창, 다른 담당의 worktree·로그·app_userdata에 쓰기·입력·종료하지 않음 |

## 실행 명령·원로그

실제로 수행한 권한 검사:

```python
import ctypes
core = ctypes.CDLL('/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics')
core.CGPreflightScreenCaptureAccess.restype = ctypes.c_bool
print(bool(core.CGPreflightScreenCaptureAccess()))  # 관측 결과: False
```

실제로 수행한 녹화 probe(게임 실행 전 권한 확인):

```sh
/usr/sbin/screencapture -v -V 1 -x /Users/fordeargamers/exoduser-wt/_out/mac-live/permission-probe.mov > /Users/fordeargamers/exoduser-wt/_out/mac-live/recording-probe.out 2> /Users/fordeargamers/exoduser-wt/_out/mac-live/recording-probe.err
```

| 검사·산출물 | 결과·경로 |
|---|---|
| 권한 사전 검사 | `false` · `~/exoduser-wt/_out/mac-live/permission-preflight.json` |
| 녹화 실행 | exit 1 · `~/exoduser-wt/_out/mac-live/recording-probe-result.json` |
| 녹화 stdout / stderr | 각각 0 byte · `recording-probe.out` / `recording-probe.err` (같은 출력 폴더) |
| 녹화 파일 | 예정 경로 `~/exoduser-wt/_out/mac-live/permission-probe.mov` · **미생성**. 제출 가능한 영상 없음 |
| 환경·소스 기록 | 같은 출력 폴더의 `source-control-baseline.json`, `result.json` |
| 게임 오류 로그 | Main 미실행으로 없음. 게임 코드 결함의 근거가 아님 |

계획한 실창 실행 명령(**미실행**):

```sh
FDG_GODOT_BIN=/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot /Users/fordeargamers/exoduser-wt/mac-live/godot/run.command
```

재개 시 위 명령 이전에 App Support 백업 → 지정 원앱으로 해당 worktree `--headless --path . --import` 1회 → `godot/override.cfg`에 지정 격리 이름을 설정해야 한다. 실행 종료 후 override는 비우고 커밋하지 않는다. 현재는 이 준비 및 Main 실행을 수행하지 않았다.

## 단계별 도달·FPS

| 단계 | 실창 도달 여부 | 소스 근거(기준 SHA, 실행 증거 아님) |
|---|---|---|
| 부팅 | 미검증·미시도 | `godot/project.godot:6` → Main, `godot/scripts/main.gd:288`의 `GODOT_FIRST_PLAYABLE_READY` |
| 인트로 | 미검증·미시도 | `main.gd:276`, `native_intro_curtain_sequence.gd:159`의 가이드 진입 |
| 커튼 | 미검증·미시도 | `native_intro_curtain_sequence.gd:192`의 열림 진입, `:362`의 정리 |
| 첫 전투 30초 | 미검증·미시도 | 위 `:192`의 적 생성·전투 활성화. 30초 플레이 관측 없음 |
| 키 입력 | 미시도 | 위 `:375`의 Enter/Space 진행·Esc 스킵은 코드상 경로이며 입력 성공을 검증한 것이 아님 |
| 체감·실측 FPS | 측정 불가 | 실행·녹화 없음. `project.godot:10`의 상한 240은 실측값이 아님 |

현재 소스의 `native_intro_curtain_sequence.gd:20`은 영상 컷신·로비를 첫 이식본 범위 밖으로 명시한다. 가이드/커튼 단계의 실창 인수와 영상 인트로 재생 여부를 구분해야 하며, 이번 작업에서는 어느 쪽도 검증하지 못했다. `godot/run.command:17`은 import 캐시가 없으면 실행을 중단하고 `:21`은 지정 원앱으로 해당 worktree를 실행한다.

## 남은 작업·인계

화면 기록 권한이 허용된 실행 환경에서 다시 권한 확인 후, 백업·import·격리 Main 실행 및 부팅→인트로→커튼→첫 전투 30초 녹화가 필요하다. 현재 작업의 BLOCKED 원인은 화면 기록 권한이며 게임 코드 수정은 하지 않았다. 키 입력 가능 여부도 미검증이다.

보고서는 자기 `codex/` 브랜치에만 제출한다. main 병합·push·force·reset은 수행하지 않는다. 영상·로그·설정 파일은 커밋하지 않는다. 제출 SHA와 최종 원격 대조 결과는 후속 제출 기록 및 `~/exoduser-wt/_out/mac-live/DONE.txt`에 남긴다.
