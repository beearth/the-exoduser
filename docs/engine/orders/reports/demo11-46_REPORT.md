# DEMO11-46 — Mac export 기동 확인 / 화면 검수 BLOCKED

**로컬 QA export·실제 기본 앱 기동 로그만 확인했다. 화면 접근 승인 거절로 실제 설정 조작·5슬롯 왕복·정상 종료 저장·재시작 복원·요청 캡처4장/1x 크롭은 미검수다.** main 미병합 기능은 실패와 구분한다. 배포 인수/실플레이/저장 복원 완료가 아니다.

아래 로그 경로는 `~/exoduser-wt/_out/demo11-46/` 기준이다.

| 단계 | 결과 | 로그·산출물 경로 |
|---|---|---|
| P5-001a 재확인 | Mac preset 없음·표준 template 폴더0개. 기존 Windows/Web bytes 유지하면서 Mac preset 추가 | `templates-check.json`, `source-scope-proof.json`; 기존 P5-001a 보고서 |
| 공식 템플릿 | 4.7.2 공식 tpz1,281,349,702byte의 SHA512-SUMS 대조 성공. macos.zip123,597,580byte만 보존, 전체 임시 tpz 삭제. 전역 template 설치0 | `templates/macos.zip`, `SHA512-SUMS.txt`, `templates-check.json` |
| 기본 필드 export | Universal2 debug `.app` 생성·PCK 오프라인 설정검사·ad-hoc codesign 검증 성공. 최종 import/export ERROR0·WARNING0 | `mac/Godot.app`, `export.*.log`, `package-verification.json`, `field-codesign-verify.log` |
| 실제 앱 기동 | 자기 PID3722, Apple M5 Pro/OpenGL4.1 Metal, Main READY1·viewport1920×1080, stdout/stderr ERROR0·WARNING0. **화면/입력 미확인** | `field-01.launch.json`, `field-01.stdout.log`, `field-01.stderr.log`, `field-01.engine.log`, `field-01-open-files.log` |
| 화면 도구 | **BLOCKED**: 자기 export 앱 경로에 대한 CUA getApp 결과 `Computer Use was not approved to use Godot`. 대체 UI 조작/캡처 경로 미사용 | `ui-blocked.txt` |
| 설정 변경 | **미병합 DEMO11-09**(dc9f34ea); 현재 main은 read-view/S10 subset이고 실제 설정 UI 없음. UI 접근도 BLOCKED. 실패 집계하지 않음 | `dependencies.json`; main `native_settings_read_view.gd`, `native_settings_lobby_bridge.gd`, Main `_toggle_pause` |
| 5슬롯 새로하기/이어하기 | 04 독립 로비/메타 IO는 main 포함. 필드 인계07(5d07f978)·복원06c(93f118fb)는 **미병합**. 실제 생성/왕복/Player 복원은 UI BLOCKED로 미검수. 가짜 저장 생성0 | `dependencies.json`, `isolated-files.json`; Main 직행/독립 로비 소비자 부재 확인 |
| 로비 진단 export | 기존 demo_lobby.tscn을 시작 씬으로 지정한 **별도 진단 앱** export·PCK/bundle/code-sign 검증 성공. 기동/화면 미시도. 통합 router 구현/왕복 성공 아님 | `lobby-preview/mac/Godot.app`, `lobby-preview/package-verification.json`, `lobby-preview/export.*.log`, `lobby-codesign-verify.log` |
| 종료 저장·재시작 | 정상 GUI 종료는 승인 거절로 불가. 자기 PID만 SIGTERM→exit−15로 정리, 종료 저장 검증으로 세지 않음. 06c/07 **미병합**, 재시작 복원 미시도 | `field-01-controlled-stop.json`, `field-01.exit.json`, `dependencies.json` |
| 데모 종료·캡처 | 종료38/39 **미병합**. 요청4장 중 **0장**, 1x 크롭0. 기존 다른 작업 화면/생성 이미지로 대체하지 않음 | `captures/manifest.json`, `ui-blocked.txt` |

| 범위·판단 | 근거 |
|---|---|
| 기준·분기 | fetch origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`, codex/demo11-46-20261021. 06c 등 미병합 체인 추가0. main/force/rebase/reset0 |
| 변경 | export_presets.cfg의 Mac32줄 추가, tools/export_demo11_mac.py·run_demo11_mac.py, 이 보고서·docs13 실행법·CHANGELOG만. Main/State/Player/World/HUD/맵/전투/저장 코드0줄. project.godot은 export 때만 임시 설정 후 원본 bytes 복원, commit 변경0 |
| 최종 격리 | 두 PCK의 project.binary를 앱 실행 전 오프라인 해석·MD5 대조. custom_user_dir=true, 정확히 EXODUSER-demo11-46-Isolated-20261021, baked main scene/bundle ID 검증. 외부 로그 경로 사용. source project 원본 복원 및 override 종료0byte. 실제 격리 폴더 파일0개(사용자 저장 내용 조회0) |
| 초기 격리 한계 | **처음 두 editor import는 override.cfg가 무시되어 기본 First user-dir 존재확인/생성 가능성을 배제할 수 없다.** official main.cpp2107 setup(...,editor)·2261 ensure_user_data_dir 근거. 앱/제품 저장 함수는 미실행이지만 이 구간을 First 접근0으로 주장하지 않는다. 기존 사용자 저장 파일을 읽거나 되돌리는 추가 접근0. 수정 도구는 project.godot에 실제 임시 격리값을 적용한다 | 
| 패키지·서명 | 기본 앱577,124,035byte(PCK389,930,232byte); 공식 Universal2 템플릿·ASTC/S3TC 임시 import·built-in ad-hoc 서명. Developer ID/공증/공개 배포·Windows QA는 미수행. QA 이름 Godot·독립 bundle ID는 기존 game과 구별하고 정확한 pgrep gate에 포함하기 위한 export 설정 |
| 실패·검사 구분 | 초기 export설정3회 실패(ASTC/override2회, arm64-only template 부재1회), 공식 template의 scene path override 비활성으로 진단 기동1회 실패를 모두 보존. 최종 기본/로비 export 성공, 기본 Main 기동 성공. 기능 미병합/화면 거절을 PASS나 제품 회귀 실패0으로 바꾸지 않음. Python 구문검사 통과, 제품 회귀 suite 미실행(제품 코드 변경0) |
| 보호·마감 | 기존 게임/서버 재시작0, 다른 PID 신호0. 자기 PID3722만 명령 경로 대조 후 정리. R HEAD/branch·tracked INDEX/WORK 보존. 산출물은 checkout 밖 `_out`, `.git/info/exclude` 예방 패턴 추가, 앱/템플릿/캐시/로그 stage0. 자기 branch 정상 push·원격 SHA/DONE 뒤 자기 worktree 제거 |

초기 실패 로그는 `attempt01_astc_disabled/`, `attempt02_editor_ignores_override/`, `attempt03_arm64_template_absent/`, scene override 거절은 `lobby-01.*`에 남겼다. 초기 editor의 로그는 기본적으로 꺼진다는 공식 main.cpp2312–2327도 함께 확인했지만, 폴더 ensure 가능성이 없어지는 것은 아니다. 초기 구간을 엄격한 격리 준수로 인증하지 않는다.

공식 템플릿은 [Godot 4.7.2 release](https://github.com/godotengine/godot-builds/releases/tag/4.7.2-stable), 구조/서명 근거는 [macOS export 문서](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_macos.html). PCK/ECFG 검사는 해당 tag `core/io/file_access_pack.cpp`·`core/config/project_settings.cpp` 구조를 사용했다. 실행법은 [docs13](../../../13출시·마케팅/DEMO11_MAC_LOCAL_EXPORT_20261021.md).

남은 인수 조건은 Godot 화면 접근 승인, 06c/07/09 및 종료 흐름의 main 병합, 그 기준에서 실제 설정·5슬롯 새로하기/이어하기·정상 종료 저장·재시작 복원과 캡처 재검수다. 사용자에게 취침 중 확인 질문을 하지 않았으며 제품 코드로 화면/저장 연결을 임의 구현하지 않았다.
