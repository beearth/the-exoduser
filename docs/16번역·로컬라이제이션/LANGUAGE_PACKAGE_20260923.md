# 언어 검증용 독립 Windows 패키지

기존 `out/EXODUSER-win64`를 읽기 전용 런타임 공급원으로 사용한다. 앱 소스는 지정한 최종 Git 커밋에서만 가져온다. 빌더는 기존 빌드·dist·작업 트리·Git 인덱스를 변경하지 않는다. 2026-09-23 언어 소스 커밋 `170fb3c3112551e9b18adffc56f8f070c807ef42`로 독립 패키지를 생성했다.

| 항목 | 정확한 계약 |
|---|---|
| 빌더 | `tools/build-language-package.mjs` |
| 출력 | `out/EXODUSER-languages-20260923`, 이미 존재하면 중단 |
| 소스 | `--commit`으로 지정한 40자리 커밋 SHA, Git tree·archive 사용 |
| 필수 파일 | 지정 커밋 `build-nwjs.mjs` FILES 배열 + node-main.js + package.json. 기존 선택 입력 credits.html은 제외 |
| 디렉터리 | 지정 커밋 DIRS 배열. 기존 선택 입력 output/imagegen/forge-tabs-v3 이외에 비어 있거나 커밋에서 빠지면 중단 |
| 선택 입력 | credits.html, output/imagegen/forge-tabs-v3. 2026-09-16 기존 빌드에서도 누락되어 건너뛴 두 경로만 허용. 존재하면 포함, 없으면 manifest optionalMissing에 명시하며 archive 인수에서도 제외 |
| 추가 루트 파일 | 커밋에 추적된 lang_*.js, atlas_* |
| 런타임 | 기존 NW.js 0.111.2 normal Windows x64 |
| 런타임 루트 | EXODUSER.exe, nw.dll, nw_elf.dll, node.dll, notification_helper.exe, libGLESv2.dll, libEGL.dll, icudtl.dat, ffmpeg.dll, dxil.dll, dxcompiler.dll, d3dcompiler_47.dll, credits.html, nw_200_percent.pak, nw_100_percent.pak, vulkan-1.dll, vk_swiftshader_icd.json, vk_swiftshader.dll, v8_context_snapshot.bin, resources.pak (20개) |
| 런타임 locales | ASCII 언어명 .pak 및 .pak.info만; en-US.pak 필수 |
| 코덱 | 기존 ffmpeg.dll SHA-256이 지정 커밋 빌더 CODEC_SHA256과 일치해야 함 |
| 앱 manifest | name, version, main, node-main, node-remote, window, chromium-args만 유지; main의 demo=1 필수, 모드 변경 없음 |
| 금지 데이터 | 경로 요소 userdata/saves/log/logs/.env/.env.* 및 .log/.log.* 파일, 대소문자 무시. Git에 추적된 편집기 로그도 archive 추출 필터로 걸러 최종 패키지에 포함하지 않음 |
| 누락·추적 검사 | 필수 입력 누락 중단; 추적되지 않은 파일 및 ignore 파일은 목록 보고 후 제외 |
| 소스 무결성 | 추출 파일 목록이 Git tree와 일치하고 원본 Git blob SHA-1과 일치해야 함; manifest만 위 계약대로 정리 |
| 런타임 복사 | 화이트리스트만 복사; 원본 복사 전·후와 복사본 SHA-256 일치 |
| 최종 보고 | 출력 루트 language-package-manifest.json에 커밋, 파일별 크기·SHA-256, 제외 목록, 완료 시각 기록 |
| 실패 처리 | 기존 출력 삭제·덮어쓰기·자동 정리 없음; 실패한 새 출력은 조사용 보존 |
| 한글 경로 | NUL 구분 UTF-8 Git tree 경로를 검증 기준으로 사용. 기존 설치된 Node tar 모듈(검증 환경 7.5.22)의 x로 UTF-8 추출하며 strict:true, preservePaths:false, 파일·디렉터리만 허용하는 경로 필터 적용. Windows 기본 tar의 비ASCII 목록 및 추출 오류를 피하고, 추출 후 전체 파일 목록과 Git blob은 그대로 대조 |

## 명령

FINAL_COMMIT_SHA를 실제 최종 40자리 커밋으로 바꾼다. 기본 동작과 --check는 출력물을 생성하지 않는 사전 검사다.

```powershell
& 'C:/nvm4w/nodejs/node.exe' --check tools/build-language-package.mjs
& 'C:/nvm4w/nodejs/node.exe' tools/build-language-package.mjs --commit FINAL_COMMIT_SHA --check
& 'C:/nvm4w/nodejs/node.exe' tools/build-language-package.mjs --commit FINAL_COMMIT_SHA --build
```

## 검증 기록

| 검사 | 결과 |
|---|---|
| JavaScript 구문 검사 | PASS (node --check) |
| 기존 nw.dll ProductVersion / FileVersion | 0.111.2 / 0.111.2 (PowerShell 읽기 확인) |
| 최종 커밋 사전 검사 | PASS. 소스 170fb3c3112551e9b18adffc56f8f070c807ef42 |
| 실제 패키징 및 파일 무결성 | PASS. 앱 7,411개·런타임 476개, Git blob 및 SHA-256 대조. out/EXODUSER-languages-20260923/language-package-manifest.json |
| 실제 EXE 언어 선택·유지 | PASS. 로비·시작 안내·게임 설정·사망·재실행·아이템/HUD 데이터 각각 29행. 언어 선택/저장 일치, 실행 오류 0·리소스 오류 0·설정 문구 넘침 0 |
| QA 후 원상 복원 | PASS. package.json·node-main.js 원본 바이트 복원, 임시 주입 제거, 출하 포트 3333 유지. 최종 7,887개 파일 크기·SHA-256 및 전체 파일 목록 일치 |
| 영상·Steam 검증 | 29개 언어 자막 구조·HTTP MIME은 회귀 검사에 포함. 이번 실제 EXE 검사에서 영상 전체 재생·Steam 클라이언트 설치·오버레이는 수행하지 않음 |

관련 문서 검색: docs/16번역·로컬라이제이션의 NW.js·0.111.2·패키징 기록을 확인했다. 이 스크립트는 Steam 업로드·상점 지원 표시를 변경하지 않는다.

## 생성 이력

| 시도 | 원인 / 결과 | 증거 |
|---|---|---|
| 기본 Windows tar 목록 | 비ASCII 경로의 이스케이프 출력으로 중단 | output/localization_20260922/package-build.log, out/EXODUSER-languages-20260923-failed-archive-list |
| 기본 Windows tar 추출 | 한글 경로에 Invalid empty pathname으로 중단 | output/localization_20260922/package-build-r2.log, out/EXODUSER-languages-20260923-failed-tar-extract |
| Node tar 추출 | 전체 추출·Git 원본 대조·런타임 복사 검증 PASS | output/localization_20260922/package-build-r3.log |

실패 산출물은 위 이름으로 보존했다. 패키지의 애플리케이션 소스 커밋은 170fb3c31이며, 한글 추출 수정은 빌더 도구의 후속 변경이다. 실제 EXE 검사 증거는 output/language_package_20260923에 저장한다.

| 최종 집계 도구 | 계약 |
|---|---|
| tools/summarize-language-package.py | 현재 런타임 단계·언어별 결과 수·오류·설정 글자 넘침 집계 |
| --integrity | 로비·안내·게임 설정·사망·재실행·아이템/HUD 각각 29행, 언어 선택/저장·새 프로필/기존 설정 진입·재시작·표시 중 펫 대사 일치, 실행/리소스 오류 없음, QA 원상 복원, 패키지 모든 파일의 크기·SHA-256·파일 목록 확인 후 summary.json 기록 |
| --collect-runtime-artifacts | 실제 실행이 생성한 Dictionaries/en-US-10-1.bdic, Dictionaries/ko-3-0.bdic, package.nw/oauth-debug.log 3개 경로만 증거 폴더 runtime-artifacts 하위로 이동하여 보존. 기존 대상 덮어쓰기 금지, 그 외 추가 파일은 무결성 검사 실패 유지 |
| 시각 범위 | 행 수·해시 PASS가 전체 UI의 글자 배치나 전체 영상 재생 검증을 대체하지 않음 |

## 실제 EXE 결과와 한계

| 범위 | 증거 / 결과 |
|---|---|
| 종합 보고서 | output/language_package_20260923/summary.json |
| 실제 실행 기록 | runtime.json, manifest-restored.json, probe-start.log, probe-steps.log |
| 대표 화면 직접 확인 | character-de.png 긴 문장, character-ar.png RTL, settings-ar.png, tutorial-th.png, item-ms.png |
| 아이템 화면 캡처 한계 | item-en.png는 초기 스킨 로딩 오버레이가 전경에 보임. 아이템 데이터 29행 검사는 통과했지만 모든 아이템 화면의 시각 PASS로 집계하지 않음 |
| 잔존 혼합 표기 | 시작 안내의 OPEN YOUR EYES / MOVE & ATTACK / 진행 키 힌트 및 캐릭터의 WARRIOR / Coming Soon 같은 영어 공통 표기, 초기 로딩의 한국어가 대표 화면에 남아 있음. 29개 언어 전체 콘텐츠 번역 완성 선언은 아님 |
| 사용자 데이터 | 별도 APPDATA·LOCALAPPDATA·Chromium 프로필 사용. 실행이 만든 사전 2개·oauth-debug.log는 증거 폴더로 옮겨 보존하여 배포 패키지에서 제외 |
| Steam 상태 | 새 Steam BuildID 없음. 업로드·상점 언어 지원 체크 변경·게시 미실행 |
