# MAC-LIVE 실창·Movie Maker 보고 — 2026-10-20

**최신 결과: 실시간 화면 캡처 파일과 엔진 FPS 표본은 수집했으나, Godot 앱 제어가 거부되어 실게임 녹화·첫 전투는 BLOCKED.**

사용자 지정 안내: **“macOS 권한 변경 후 VS Code 재시작 필요”**. VS Code는 직접 재시작·종료하지 않았다. 화면 기록 권한은 실제로 허용됐고 남은 거부는 도구의 Godot 앱 제어 승인이다. 재시작만으로 해결되는지는 미검증이며, 사용자 재시작 후 앱 제어 승인 상태도 다시 확인해야 한다.

## 실시간 녹화(권한 필요, 실제 FPS)

2026-10-20 18:30 KST 재검사에서 `CGPreflightScreenCaptureAccess()=true`였다. `/usr/sbin/screencapture -v -V 1 -x -D 1 .../realtime-permission-probe.mov`는 exit 0, 601,438 byte 파일 생성으로 권한 변경을 확인했다. 아래 실제 실행에는 `--fixed-fps`·`--write-movie`를 사용하지 않았다.

실제 창 실행 명령(기존 `run.command`가 원근뷰 우선 인자를 자동 전달):

```sh
FDG_GODOT_BIN=/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot /Users/fordeargamers/exoduser-wt/mac-live/godot/run.command --windowed --position 40,80 --resolution 1280x720 --print-fps --log-file /Users/fordeargamers/exoduser-wt/_out/mac-live/realtime-engine.log
```

화면 녹화 명령(창 실행 직전 시작):

```sh
/usr/sbin/screencapture -v -V 45 -x -R40,80,1280,750 /Users/fordeargamers/exoduser-wt/_out/mac-live/mac_live_realtime.mov
```

| 항목 | 실제 결과 |
|---|---|
| 실행 구간 | 18:32:30~18:33:16 KST. 격리 이름 `EXODUSER-MacLive-Isolated-20261020`. 기존 import 캐시 사용, 추가 import 없음 |
| 부팅 | stdout `GODOT_FIRST_PLAYABLE_READY`, Main `res://scenes/main.tscn`, viewport 1920×1080, spawn `(4020.0, 7420.0)` |
| 화면 기록 | exit 0 · stderr 0 byte · `~/exoduser-wt/_out/mac-live/mac_live_realtime.mov` |
| MOV 검사 | 38,473,536 byte · MOV `mvhd` 27001/600 = **45.0017초**, 영상 track 2560×1500(Retina 캡처). SHA-256 `1c53a07a95ff91f5dcfd6c3f9b557ebd046379350870d0e660aa71a70c05bbf0` |
| 실제 화면 확인 | 동시점 `realtime-visible-check.png`에서 캡처 영역에 **VS Code가 보임**. Godot 전경 전환을 확인하지 못했으므로 파일 생성을 실게임 영상 인수로 인정하지 않음 |
| 앱 제어·입력 | 원앱 `cua.getApp`이 `Computer Use was not approved to use Godot` 반환. 입력 0회. 다른 입력·전경 전환 수단으로 우회하지 않음 |
| 인트로·커튼·전투 | 실시간 화면에서 모두 미확인. 첫 전투 30초 미도달·BLOCKED |
| 정리 | 녹화 완료 후 runner가 **자기 Godot PID 20311만 SIGTERM**으로 종료(exit −15). 부팅 실패·자연 크래시 코드가 아님. 기존 게임·VS Code는 종료하지 않음. override 0 byte로 비움 |
| 런타임 오류 | ERROR/SCRIPT ERROR 없음. Camera2D physics interpolation 전환 WARNING 1건 |

### 실제 FPS 관측 범위

`--print-fps`의 `Project FPS`는 약 1초 단위 실제 엔진 루프 표본이다. [Godot 4.7.2 main loop](https://raw.githubusercontent.com/godotengine/godot/4.7.2-stable/main/main.cpp#L4741)가 실제 ticks를 누적해 이 값을 계산하며, Movie Maker 고정 출력률이나 프로젝트 상한 240과 구분된다.

| 측정 항목 | 값 |
|---|---|
| 표본 수·합계 | 36개 · 합계 4971 |
| 표본 산술평균 | **138.08 FPS** |
| 최저·최고 표본 | **45 / 145 FPS** |
| 관측 범위 | 전체 로그에 출력된 표본 전부(초기 낮은 표본도 포함). 가이드 대기·시작 구간이 섞였으며 게임 전경·입력·전투 미확인 |
| 의미 한계 | 전투 FPS·화면 제시 FPS·GPU 완료 속도·단일 프레임 최저값·체감 FPS의 증거가 아님. 이 최저는 약 1초 표본의 최저 |

원자료는 `realtime-runtime.out`, 계산값은 `realtime-fps.json`이다. 고정 프레임 없이 실행한 **엔진 처리 FPS는 측정**했지만, 실게임 화면·전투·조작감에 대한 실시간 성능 인수는 아직 미검증이다.

실시간 원로그는 출력 폴더의 `realtime-permission-preflight.json`, `realtime-permission-probe.*`, `realtime-command.json`, `realtime-result.json`, `realtime-record.out/.err`, `realtime-runtime.out/.err`, `realtime-engine.log`, `realtime-input-blocker.json`, `realtime-fps.json`, `realtime-media-inspection.json`에 보존했다. MOV 전체 프레임 추출·재생 검증은 미완료다. Swift 검사 도구는 compiler 6.3.3과 SDK 6.4 불일치로 실패했으며 원로그 `realtime-inspection.err`를 보존했다. 도구 체인 변경 없이 MOV 컨테이너의 길이·크기만 별도로 읽었다.


## 기준·보존 범위

| 항목 | 기록 |
|---|---|
| 작업·브랜치 | `mac-live` · `codex/mac-live-20261020` |
| worktree | `/Users/fordeargamers/exoduser-wt/mac-live` |
| 실행 소스 | 최초 `origin/main` 기준 `7c4a2442bfc46f5d25c1bd9bf287a9324d8d5e5a` + 문서 커밋만. Movie Maker 시작 HEAD `37f1cd46`, 실시간 재시도 시작 HEAD `b1aedcd23588ae359e9e46417ecfd452ba5237d7`. 같은 worktree·브랜치 유지, 이후 main 코드 병합 없음 |
| 재개 시 확인한 origin/main ref | Movie Maker 재개 시 `d3b672fea878ff99a9f110f4a6d8adf86b1e6898`, 실시간 재시도 시 `e5c5e0b1502f0378bf464f20a0bdbf988d3861a3` — 이번 실행 소스와 다름 |
| 원본 Godot | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` · `4.7.2.stable.official.ed1daf0bf` |
| 실행 renderer | stdout: OpenGL API 4.1 Metal / Compatibility / Apple M5 Pro |
| 시작 시 INDEX/WORK | 자기 worktree tracked 변경 없음. 타 작업 코드를 편집하지 않음 |
| 변경·커밋 범위 | 이 보고서와 `docs/engine/orders/WORK_BOARD.md`의 MAC-LIVE 행만. 게임 코드·테스트 수정 없음. 영상·로그·백업·override는 커밋하지 않음 |
| 기준 체크아웃 R | branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184` 보존. 브랜치 전환·커밋·소스 수정 없음 |
| 기존 상태 보존 | 실제 저장 폴더 `EXODUSER-Godot-Native-First`, 기존 게임 창, 다른 담당의 worktree·로그·app_userdata에 입력·쓰기·종료하지 않음 |

## 백업·import·격리

| 단계 | 명령·결과 |
|---|---|
| 옵션 확인 | 지정 원앱 `--help`에서 `--write-movie`, `--fixed-fps`, `--quit-after` 확인. 원문 `~/exoduser-wt/_out/mac-live/movie-help.out` |
| import 전 백업 | `/usr/bin/ditto "/Users/fordeargamers/Library/Application Support/Godot" /Users/fordeargamers/exoduser-wt/_backup/godot-appsupport-20261020-mac-live` · exit 0 |
| 백업 검증 | 68개 일반 파일 원본/백업 SHA-256 동일. 실행 종료 후에도 기존 68개 파일 변경·누락 없음. 전역 설정 수동 편집·복원 없음 |
| 격리 | `godot/override.cfg`에 `config/use_custom_user_dir=true`, `config/custom_user_dir_name="EXODUSER-MacLive-Isolated-20261020"` 설정 후 import·Main 실행 |
| import | 지정 원앱 `--headless --path /Users/fordeargamers/exoduser-wt/mac-live/godot --import` · 1회 · exit 0 · stderr 0 byte · 18:22:40~18:22:57 KST |
| 종료 정리 | 실행 runner의 `finally`에서 override를 비움. 종료 시 0 byte. 격리 userdir `~/Library/Application Support/EXODUSER-MacLive-Isolated-20261020/` 생성 확인, 보존 |

## Movie Maker(고정 프레임, 렌더링 증거만)

60fps × 30초 = 1800프레임으로 계산했다. 실제 명령은 다음과 같다. 마지막 사용자 인자는 기존 `godot/run.command:21`과 같은 원근뷰 우선 실행 경로를 유지한다.

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --path /Users/fordeargamers/exoduser-wt/mac-live/godot --write-movie /Users/fordeargamers/exoduser-wt/_out/mac-live/mac_live_movie.avi --fixed-fps 60 --quit-after 1800 --log-file /Users/fordeargamers/exoduser-wt/_out/mac-live/movie-engine.log -- --fdg-native-perspective-first
```

| 항목 | 관측 결과 |
|---|---|
| 실행 결과 | exit 0 · PID 15086 · 18:23:23~18:23:58 KST. 벽시계 경과는 실시간 FPS 측정값이 아님 |
| 부팅 | `GODOT_FIRST_PLAYABLE_READY`, Main `res://scenes/main.tscn`, viewport 1920×1080, spawn `(4020.0, 7420.0)` |
| 영상 경로 | `~/exoduser-wt/_out/mac-live/mac_live_movie.avi` |
| 파일 크기·해시 | 82,328,040 byte · SHA-256 `eb60f31e3708b6ebcdafa2ce66a8288ddc1224b0a1116ebf71da938d5a2c7984` |
| 영상 스트림 실측 | AVI `avih.dwTotalFrames=1800`, video `strh.length=1800`, `rate=60`, `scale=1`, 실제 `00db` JPEG 청크 1800개 → **30.0초** |
| 시각 확인 | 원본 JPEG 표본 frame 0·60·900·1799를 디코드해 확인. 모두 닫힌 어두운 커튼 배경·가로 중앙선. 가이드 글씨·월드·HUD·전투는 보이지 않음 |
| 오류 | import stderr 0 byte, Main ERROR/SCRIPT ERROR 없음. Camera2D가 physics interpolation 때문에 physics process mode로 전환된다는 WARNING 1건 |
| 실시간 FPS | **이 Movie Maker 실행에서는 미검증.** 60fps는 고정 출력률. 별도 실제 엔진 루프 FPS는 위 실시간 절에 기재 |

엔진 종료 요약은 `316 frames at 60 FPS`, `00:00:05:16`으로 출력했지만, AVI 헤더·실제 영상 청크는 모두 1800프레임이었다. [공식 4.7.2 MovieWriter](https://raw.githubusercontent.com/godotengine/godot/4.7.2-stable/servers/movie_writer/movie_writer.cpp)의 요약은 draw 카운터를 사용하고, [main loop](https://raw.githubusercontent.com/godotengine/godot/4.7.2-stable/main/main.cpp)는 반복마다 MovieWriter에 프레임을 추가한다. 따라서 이 보고서의 파일 길이는 컨테이너 실측값을 사용한다. 특정 렌더 생략 원인은 관측하지 못해 단정하지 않는다.

컨테이너 점검에서 RIFF 선언 길이는 실제 파일 끝보다 70 byte 짧았다. 실제 EOF까지 청크를 읽으면 영상 1800개·오디오 청크 1800개·index가 끝까지 존재했고, 확인 표본 JPEG는 디코드됐다. AVI 파일은 수정하지 않았다. 외부 동영상 플레이어에서 전체 재생·음성 정상 여부는 미검증이다.

### Movie Maker 단계별 도달·입력 제한

| 단계 | 도달 판정 | 근거·제약 |
|---|---|---|
| 부팅 | 확인 | READY 로그 및 커튼 배경 영상 생성 |
| 인트로 | 제한적 확인 | 닫힌 커튼 배경까지만 시각 확인. 가이드 글씨 미관측. `native_intro_curtain_sequence.gd:159`의 guide 진입은 정적 코드 근거이며 UI 표시 성공의 대체 증거가 아님 |
| 커튼 열림 | 미도달·BLOCKED | 키 입력 0회. 모든 확인 표본은 닫힌 커튼 |
| 첫 전투 30초 | 미도달·BLOCKED | 전투 영상 없음. 생성된 30초 파일을 전투 30초로 보고하지 않음 |
| 키 입력 | 도구 권한 거부 | `cua.getApp(지정 원앱 Godot.app)` 응답: `Computer Use was not approved to use Godot`. 다른 입력 수단·권한 우회 시도 없음 |

가이드는 자동 진행하지 않으며 Enter/Space 4회가 필요하다. `native_intro_curtain_sequence.gd:178~188`의 게이트는 `Time.get_ticks_msec()`에 따른 실제 시간 250ms 간격이고 `:375~383`에 진행·스킵 입력이 있다. 앱 제어가 거부돼 이 경로를 실행하지 않았다. `:20`에 명시된 영상 컷신·로비는 첫 이식본 범위 밖이므로 이번 커튼 배경을 영상 인트로 재생 완료로 보고하지 않는다.

### Movie Maker 원로그·남은 작업

모든 산출물은 `~/exoduser-wt/_out/mac-live/`에 보존했다.

| 분류 | 파일 |
|---|---|
| 백업·설정 | `movie-backup.json`, `movie-backup-verification.json`, `movie-appsupport-after.json` |
| import | `movie-import-command.json`, `movie-import-result.json`, `movie-import.out`, `movie-import.err` |
| 실행 | `movie-runtime-command.json`, `movie-runtime-result.json`, `movie-runtime.out`, `movie-runtime.err`, `movie-engine.log` |
| 영상 검사·표본 | `movie-container-inspection.json`, `movie-frame-0000.jpg`, `movie-frame-0060.jpg`, `movie-frame-0300.jpg`, `movie-frame-0900.jpg`, `movie-frame-1799.jpg` |
| 입력 거부 | `movie-input-blocker.json` |

남은 범위는 앱 제어가 허용된 환경에서 가이드 진행→커튼 열림→첫 전투를 기록하는 일이다. 전투·화면 표시 FPS·조작감 인수에는 앱 제어가 허용되고 게임 화면이 확인되는 별도 검증이 필요하다. 게임 코드·테스트는 고치지 않았다.

## 이전 화면 기록 시도·제출 기록

최초 화면 기록 시도는 `CGPreflightScreenCaptureAccess()=false`, `/usr/sbin/screencapture -v -V 1 -x .../permission-probe.mov` exit 1, stdout/stderr 0 byte, 영상 미생성이었다. 원로그 `permission-preflight.json`, `recording-probe-result.json`, `recording-probe.out`, `recording-probe.err`는 보존했다. 이전 결과 본문 SHA `5b101dcfb60179a55c4fda47e3291ef27b8056ef`, 이전 제출 SHA `37f1cd4678eaa12303ad74e1e2dc2eaa42d54866`이다.

각 후속 결과는 자기 `codex/` 브랜치에만 제출하며 main push·병합·force·reset은 하지 않는다. 이번 실시간 재시도 최종 SHA·원격 대조는 로컬 `~/exoduser-wt/_out/mac-live/DONE.txt`, `realtime-remote-verification.json`에 남긴다. 이전 Movie Maker 제출 대조는 `movie-remote-verification.json`에 보존했다.

후속 Movie Maker 결과 본문 커밋: `a8bb9b730cc81c9b92bc0a13fa158db879574950`. 이후 커밋은 제출 SHA를 기록하는 메타데이터 변경이며, 최종 branch tip·원격 SHA는 `DONE.txt`와 `movie-remote-verification.json`에 기록한다.

실시간 재시도 결과 본문 커밋: `3259b390ecbba6633053ef117e99704abf62e106`. 최종 제출 SHA는 이 값을 기록하는 후속 메타데이터 커밋을 포함하며 `DONE.txt`, `realtime-remote-verification.json`에서 확인한다.
