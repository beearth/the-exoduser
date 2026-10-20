# P5-001a — Mac 실행판·패키지 점검 (2026-10-20)

판정: **Mac 소스 런처 기동·정상 종료 확인 / 직접 화면 관측 BLOCKED / macOS export 미시도(프리셋 없음)**. Mac 패키지 또는 실플레이 인수 완료 판정이 아니다.

## 범위와 기준

- 담당: Mac VS Code Codex. 작업 7 FEATURE-INVENTORY는 중단했으며 작성 파일·커밋·push 없음.
- 작업 브랜치: `codex/p5-001a-mac-20261020`.
- 작업 폴더: `/Users/fordeargamers/exoduser-wt/p5-001a-mac`.
- 기준: Full Access 전환 후 `git fetch origin`으로 확인한 `origin/main` **`7c4a2442bfc46f5d25c1bd9bf287a9324d8d5e5a`**. 이후 동시 진행되는 main 변경을 이 결과에 소급하지 않는다.
- 기준 체크아웃 R: `/Users/fordeargamers/Projects/exoduser-migration-20261001`, 브랜치 `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작 시 tracked INDEX와 WORK 모두 변경 없음.
- 최신 사용자 지시대로 이 보고서만 Git 변경 대상으로 삼는다. 계획 문서·WORK_BOARD·PC/Mac 동기화 문서는 PC 총괄이 반영한다.
- 원로그 루트: `/Users/fordeargamers/exoduser-wt/_out/p5-001a-mac` (이하 `OUT`).

## 원본 근거와 패키지 판정

| 항목 | 실제 파일·행 또는 설치 경로 | 확인 결과 |
|---|---|---|
| 실행 런처 | `godot/run.command:4`–`:10`, `:21` | `FDG_GODOT_BIN`을 우선 사용하고 실제 프로젝트 경로와 `--fdg-native-perspective-first`를 전달한다. 미지정 시 `/Applications/Godot.app`를 사용자 4.7.2 앱보다 먼저 찾으며, 스크립트 자체의 버전 검사는 없다. 이번 실행은 원본 앱 경로를 명시한다. |
| import 전제 | `godot/run.command:17`–`:20` | worktree의 `.godot/imported`가 없으면 종료하며 자동 import하지 않는다. 새 worktree에서 import를 별도로 1회 수행했다. |
| 저장 기본값 | `godot/project.godot:8`–`:9` | 원본 기본값은 `EXODUSER-Godot-Native-First`. 이 값은 수정하지 않고 임시 `override.cfg`로 격리한다. |
| Windows 프리셋 | `godot/export_presets.cfg:2`–`:31` | `Windows Native Preview x64` / `Windows Desktop`. debug template 빈 문자열, release template는 기존 외부 Windows exe 경로. `codesign/enable=false`는 Windows 설정이다. |
| Web 프리셋 | `godot/export_presets.cfg:32`–`:62` | `Web Native Preview Single Thread` / `Web`. debug template 빈 문자열, release template는 기존 외부 Web zip 경로. |
| macOS 프리셋 | `godot/export_presets.cfg` 전체 | **없음**. macOS용 debug/release template 경로, 서명·공증 설정도 없다. Windows 서명 옵션으로 macOS 서명 상태를 판단하지 않는다. |
| 원본 앱 | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --version` | exit 0, `4.7.2.stable.official.ed1daf0bf`. 앱 복사·재서명·보안 설정 변경 없음. |
| export 템플릿 설치 | `~/Library/Application Support/Godot/export_templates` | 디렉터리는 존재하나 설치 항목 **0개**. 표준 위치의 4.7.2 export 템플릿은 **미설치**. 원본 앱 인접 portable marker/editor_data와 앱 Resources의 template/macos/tpz 후보도 없음. 근거 `OUT/templates-check.json`. |
| macOS debug export | 최신 사용자 지시 + 프리셋 전수 확인 | **미시도**. macOS 프리셋이 없으면 export하지 말라는 지시를 적용했다. export 실패로 집계하지 않는다. 프리셋 추가와 4.7.2 export 템플릿 설치가 **필요함**. 이번 작업에서는 둘 다 하지 않는다. |

## 격리와 실행 검수

격리 이름은 `EXODUSER-P5001A-Isolated-20261020`이다. 실행 전 `godot/override.cfg`에 다음 값을 넣고 사용한 설정을 `OUT/override-used.cfg`로 보존했다. 두 실행 종료 후 override를 **0 byte로 비웠다**. 임시 override·`.godot` 캐시·자동 생성 `.import`/`.uid` 파일은 stage·커밋하지 않는다.

```ini
[application]

config/use_custom_user_dir=true
config/custom_user_dir_name="EXODUSER-P5001A-Isolated-20261020"
```

import 전 `~/Library/Application Support/Godot/`를 `/Users/fordeargamers/exoduser-wt/_backup/godot-appsupport-20261020-181428-P5-001a/`에 복사했다. 사전 사본 68파일의 크기·SHA-256은 `OUT/godot-appsupport-before.json`에 남겼다.

| 검수 | 명령·조건 | 결과·원로그 |
|---|---|---|
| 버전 | 위 원본 앱 `--version` | exit 0. `OUT/version.out`, `version.err` |
| import 1회 | 원본 앱 `--headless --path /Users/fordeargamers/exoduser-wt/p5-001a-mac/godot --import` | **exit 0**, 약 **16.04초**, stderr **0 byte**, stdout ERROR **0**. `OUT/import.out`, `import.err`, `import-command.json`, `import-result.json`. 다른 Godot가 실행 중인 동안은 먼저 대기했다. |
| 첫 런처 기동 | `FDG_GODOT_BIN=<위 원본 앱> godot/run.command --windowed --resolution 1280x720 --quit-after 7200` | PID **15377**, 18:24:19~18:24:31 KST, 프로세스 수명 약 **12.94초**, **exit 0**. `GODOT_FIRST_PLAYABLE_READY` **1회**, ERROR **0**, Camera2D 경고 **1건**. `OUT/launch.out`, `launch.err`, `launch-command.json`, `launch-result.json`. 직접 화면 관측 전에 자동 종료됐다. |
| 미관측 화면 확인용 추가 기동 | 같은 런처, `--quit-after 36000` | PID **15977**, 18:25:37~18:26:28 KST, 프로세스 수명 약 **50.51초**, **exit 0**. 준비 로그 **1회**, ERROR **0**, 경고 **3건**. `OUT/visual.out`, `visual.err`, `visual-command.json`, `visual-result.json`. 성공한 기능 테스트 재수행이 아니라 첫 실행에서 남은 화면 관측 시도이며, 아래 도구 권한으로 직접 화면 확인은 실패했다. |
| 직접 화면 관측 | CUA `getApp('/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app')` | **BLOCKED**: `Computer Use was not approved to use Godot`. 다른 UI 조작·캡처 경로로 우회하지 않았다. 화면 캡처·키보드/마우스 입력·캐릭터 선택·플레이 검수 **없음**. `OUT/visual-observation-blocked.txt`. |
| 격리 실사용 | `~/Library/Application Support/EXODUSER-P5001A-Isolated-20261020/` | `logs/godot.log`, 이전 실행 로그, `qa/latest-session.json` 생성 확인. QA 런타임은 macOS / Godot 4.7.2 / Apple M5 Pro / opengl3 / gl_compatibility. 실제 저장 폴더는 조회·입력·변경하지 않았다. 결과 사본 `OUT/isolated-user-evidence/`, 요약 `OUT/results-summary.json`. |
| macOS debug export | 프리셋 부재로 명령 실행하지 않음 | 시도 **0회**, 산출물 없음. |

위 시간은 각 **프로세스 전체 수명**이며 부팅 지연 시간이나 FPS 측정값이 아니다. CLI의 `--quit-after`는 iteration 한도이다. 두 프로세스 모두 120초 안전 제한 전에 스스로 exit 0으로 종료했으며 종료 신호를 보내지 않았다. 두 기동 시작 시 다른 Godot PID가 없는 것을 확인했다. 시작 대기 기록은 `OUT/preflight-deferred.txt`, `import-wait.log`, `launch-wait.log`, `launch-available-wait.log`, `visual-wait.log`에 남겼다. 120초 연속 idle 대기 실패는 **실행 전 대기 결과**이며 런처나 import의 실패 횟수로 세지 않는다.

첫 실행 경고는 `Camera2D overridden to physics process mode due to use of physics interpolation` (`main.gd:212`) 1건이다. 추가 실행에는 같은 경고 1건과 `Interpolated Camera3D triggered from outside physics process` 2건이 있다. 이번 범위에서는 수정하지 않았다. 로그의 준비 완료·macOS display server·렌더러 관측을 화면 픽셀 품질이나 실제 전투 인수로 대체하지 않는다.

### 전역 설정 사후 관측

`OUT/godot-appsupport-after-import.json`(18:20:56 KST)에서 사전 68파일 대비 추가·삭제 파일은 없고 `editor_settings-4.7.tres`의 byte 차이를 관측했다. 사전 SHA-256은 `09250dfdefa516bb424480f4ad6161a778097e427073bc27c4bb5c816f5185ee`, 관측 SHA-256은 `7f629d061b68dd06328e6dfb1924f8d5c4715dd6820cf81c55b7670fd3f85850`이다. 설정 키 텍스트 대조에서 추가 키 0·공통 키 값 변경 0·제거 키 167이었다(`OUT/editor-settings-observed-summary.json`, `editor-settings-observed.diff`). 이는 설정 파일이 byte 동일하다는 뜻이 아니다. 같은 구간 다른 Godot import/검증도 진행돼 작성 주체는 **미확인**이다. 파일을 직접 편집·권한 변경·자동 복원하지 않았고, 타 작업 변경을 덮어쓰지 않도록 사전 백업을 보존했다.

## 변경 파일·남은 항목

| 구분 | 내용 |
|---|---|
| Git 변경 | 이 보고서 `docs/engine/orders/reports/P5-001a_REPORT.md`만 |
| 제품 코드·공용 설정 | `game.html`, `index.html`, `godot/` 제품 소스·export 프리셋 변경 없음. export 템플릿 설치 없음. |
| 남은 패키지 조건 | macOS 프리셋 추가, Godot 4.7.2 macOS export 템플릿 설치, 서명·공증 정책 확정 및 별도 승인된 export/패키지 실행 검수 **필요함**. |
| 남은 실행 검수 | Godot 화면 도구 접근이 허용되는 환경에서 실제 창·입력·플레이 흐름 확인 **필요함**. 이번 도구 거부를 우회하거나 실플레이 PASS로 대체하지 않았다. |
| 인수 경계 | 이번 점검은 지정 main의 Mac 소스 실행과 패키지 준비 조건이다. 전체 게임 이식·Mac 패키지 완성·PC 실행·성능 기준 달성으로 확대하지 않는다. |
| 기준 문서 반영 | `FDG_PC_MAC_GIT_SYNC_20261016.md`, 계획 P5-001/P5-001a 행, WORK_BOARD는 직접 수정하지 않는다. PC 총괄 인수 대상. |

## 제출 기록

실제 실행 결과와 정리 확인 후 보고서만 경로 지정으로 stage·commit하고, 자기 브랜치만 비강제 push한다. 결과 커밋과 원격 확인 SHA는 최종 제출 기록 및 `OUT/DONE.txt`에 남긴다.
