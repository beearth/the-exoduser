# 언어 검증용 독립 Windows 패키지

기존 `out/EXODUSER-win64`를 읽기 전용 런타임 공급원으로 사용한다. 앱 소스는 지정한 최종 Git 커밋에서만 가져온다. 기존 빌드·dist·작업 트리·Git 인덱스는 변경하지 않는다. 작성 시점에는 최종 커밋 지정과 실제 패키징을 대기한다.

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
| 금지 데이터 | 경로 요소 userdata/saves/log/logs/.env/.env.* 및 .log/.log.* 파일, 대소문자 무시. Git에 추적된 편집기 로그도 archive 추출 제외 인수로 걸러 최종 패키지에 포함하지 않음 |
| 누락·추적 검사 | 필수 입력 누락 중단; 추적되지 않은 파일 및 ignore 파일은 목록 보고 후 제외 |
| 소스 무결성 | 추출 파일 목록이 Git tree와 일치하고 원본 Git blob SHA-1과 일치해야 함; manifest만 위 계약대로 정리 |
| 런타임 복사 | 화이트리스트만 복사; 원본 복사 전·후와 복사본 SHA-256 일치 |
| 최종 보고 | 출력 루트 language-package-manifest.json에 커밋, 파일별 크기·SHA-256, 제외 목록, 완료 시각 기록 |
| 실패 처리 | 기존 출력 삭제·덮어쓰기·자동 정리 없음; 실패한 새 출력은 조사용 보존 |
| 한글 경로 | NUL 구분 UTF-8 Git tree 경로를 검증·제외 기준으로 사용. Windows tar -tf의 비ASCII 이스케이프 출력은 경로로 해석하지 않음. 추출 후 전체 파일 목록과 Git blob은 그대로 대조 |

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
| 최종 커밋 사전 검사 | 최종 커밋 전달 이후 실행 |
| 실제 패키징 및 파일 무결성 | 최종 커밋 전달 이후 실행 |
| 실행·29개 언어·영상 검증 | 통합 담당자가 별도 수행; 파일 검사만으로 실행 검증 PASS를 선언하지 않음 |

관련 문서 검색: docs/16번역·로컬라이제이션의 NW.js·0.111.2·패키징 기록을 확인했다. 이 스크립트는 Steam 업로드·상점 지원 표시를 변경하지 않는다.
