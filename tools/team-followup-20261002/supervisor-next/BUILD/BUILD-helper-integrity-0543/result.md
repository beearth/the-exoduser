# BUILD native helper 검증 — 메모리 후보 인계

**현행 검증 결함을 재현했다.** 실제 verifyOutput은 GPU helper payload1바이트 변형을 정상 완료로 인수했다. 메모리 SHA 후보는 거부하며 원래 정상 입력은 현행과 동등하다. 생산/공유docs/바이너리 수정0.

작업ID BUILD-helper-integrity-0543, Codex BUILD. 실행 cwd /Users/fordeargamers/Projects/exoduser-migration-20261001. 2026-10-02T05:45:45.947Z–2026-10-02T05:45:46.025Z UTC. 제공 checkpoint f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c는 TASK 근거이며 현재 HEAD/원격 독립관측이 아니다. 실제 source 영수증은 아래와 같다; 이전 source/old archive delta·전수7918/8258·기존22/8검사 반복0.

| 실제 읽기 | bytes | SHA256 |
|---|---|---|
| game.html | 4025390 | 2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94 |
| game-easy-test.html | 3902515 | 3e5969ca139497c2efb312dc720ab53eb42a8d1912c8288caa2ce858cfd5120a |
| node-main.js | 10282 | 541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf |

## 원 구현과 단일 반례

packager.mjs verifyOutput line75, helper 검증 line83. 본체는 proposal.runtimeFiles의 nwjs main SHA와 비교하지만 helper는 length>0와 plist CFBundleExecutable만 비교한다. 실제 safeAncestors/readFile을 같이 추출해 descriptor 수명도 실행했다. packager 모듈 import 및 plan/execute/localBuild 호출0. VM 문법을 위해 import.meta.url만 source URL literal로 치환하고 plist는 실제 설치 parser, fs만 memory 대역이다.

| 입력2개 | 현행 원fragment | 메모리 후보 |
|---|---|---|
| 정상 payload | ACCEPT | ACCEPT; 반환 경로·모든 읽기 path/bytes/SHA 동등 |
| GPU payload 끝1바이트 XOR1, 길이 34 유지 | **ACCEPT — 결함 재현** | REJECT: MAC_HELPER_SHA_MISMATCH:nwjs Helper (GPU) |

새 경계 assertion5 PASS. 현행/후보4호출은 위2입력을 재사용했다. 본체/나머지3helper·plist·derived package/server는 동일대역으로 유지했다. proposal.inputs=[]로 packaged-input 반복 검수는 수행하지 않았다. 원/후 fragment SHA 420dc31f3b2be05992a26f9d4ce042c8aaf55d36a8e4c6caae54c54096748e8a / d17222a0e1af21fc9770ea8ac9665af0e2a16140f1c7d2528aecc93cb8161030. 실제fragment·후보전체·읽기trace·변형전후SHA·오류는 evidence.json에 있다.

## 실제 경로 변환과 pin 범위

설치 nw-builder/src/bld/osx.js line92의 /^nwjs/→app.name, line104 실행 파일 rename, line21 plist executable 이름 변경을 읽었다. 이름만 바뀌고 payload SHA를 바꾸는 코드가 없으므로 원 실행 파일 pin을 출력 실행 파일에 대조한다. 아래 historical pin은 옛plan에서 인수한값이며 이번 native byte 관측값이 아니다. fixture pin은 synthetic payload 해시다.

| suffix | 원 runtimeFiles path | rename 출력 path | 과거 pin | 대역 expected SHA |
|---|---|---|---|---|
| 기본 | nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper | /memory-only/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper.app/Contents/MacOS/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper | 544c9e579c914be565a416ca50c01bf8a259a8bd489fe91aff340bfe1087bedc | 3f346fe0498539d6fb7dcfb5ad6c07a0dca30734b8ee3caf7f6ce577a350a8f4 |
|  (Alerts) | nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts) | /memory-only/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper (Alerts).app/Contents/MacOS/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper (Alerts) | 601cafa38b6cb4be5fb9026489a717d3abe0320cb31ab473c8b44e0418b92eab | 35a50f088d9aeb1ff12204dd613aa794f81e87e4cbbd5538f74c3a4a7b5c89dd |
|  (GPU) | nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU) | /memory-only/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper (GPU).app/Contents/MacOS/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper (GPU) | abc0a72d988ba5b33cfa638c05352f1a7be975c22d1f4ee379f25e7f0f4f289e | b47a3ce00a8db0eed88d42105fdb55694272767d2b76a42e6087a1b78a370429 |
|  (Renderer) | nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer) | /memory-only/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper (Renderer).app/Contents/MacOS/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269 Helper (Renderer) | 1706b0cdbeec3bfe73a5dec8e42ed4b1c634a7c44c25216de1c60ae804822777 | 1cc74ca204b70aba259f7e2d75f0b8d1793d4604ed5138da4620e6939693a5a9 |

후보는 readFile helperBytes를 기존처럼1회 읽고 length 검사, 원 helper경로 expectedPin의 존재/64hex SHA 확인, digest(helperBytes)와 pin 비교를 추가한다. plist rename 검사는 유지한다. 없는/잘못된 pin 에러 MAC_HELPER_PIN_MISSING_OR_INVALID는 후보에 존재하나 이번 입력 제한으로 별도 테스트하지 않았다. 나머지 suffix의 실제 실행·변형, Mach-O/서명/심볼릭링크 오류주입도 미검수다.

## docs 정본 인계와 남은 Gate

checks 작성 후 docs 전체 rg 'verifyOutput|MAC_HELPER|native helper|Helper|Mach-O|packager|INTEGRATION_BUILD_TEAM_MASTER': 30행/19문서, exit0. 원문SHA 75c8aa53fb608e6440c4bfc347c3cd319144fdd076bfe7d572641cf260f639f4, 정확 목록 evidence.docsSearch 참조.

INTEGRATION_BUILD_TEAM_MASTER 및 BUILD 백업/packager 계약에 추가할 문안:

BUILD-helper-integrity-0543: packager.mjs verifyOutput의 helper 검증은 원본 실행 payload SHA를 비교하지 않고 비어 있지 않은 바이트와 CFBundleExecutable rename만 확인한다. 실제 verifyOutput/readFile/safeAncestors fragment와 메모리 fs 대역에서 GPU helper payload 끝1바이트 XOR1 변형이 현행에 인수됨을 재현했다. 메모리 후보는 nwjs Helper{suffix}.app/Contents/MacOS/nwjs Helper{suffix} 원 pin을 proposal.runtimeFiles에서 조회하고 rename된 EXODUSER-{id} Helper{suffix} payload SHA를 비교해 MAC_HELPER_SHA_MISMATCH로 거부한다. 정상 대조1입력은 반환값·읽기 path/bytes/SHA·descriptor close 동등. 총2입력×현행/후보4실행, 대역 expected SHA는 실제 native payload 관측치가 아니다. productionApplied/rebuildExecuted/runtimeAccepted/visualAccepted=false; missing-pin/타helper suffix/failure shape·실앱·서명/제품 검수는 미실행.

생산 반영은 총괄이 fragment/소유권을 검토하고 scoped code+docs checkpoint/원격 보존 후 순차 수행한다. 다음 Gate는 helper source→rename SHA 대조 후보 인수이며 이 작업에서 재빌드하지 않는다. 실앱/서명/배포 Gate는 별도다. productionApplied=false, rebuildExecuted=false, runtimeAccepted=false, visualAccepted=false.

새 폴더 산출 result.md/evidence.json/checks.mjs만. 읽은 참조 전후SHA 동일, 기존 앱·runtime read0, 실제fixture파일 생성0, 삭제0. Git/Changes 조회0; 감독이 최신 count를 추적하며80부터 root 체크포인트/100 전 새산출 중단. 추가 업무 자체 생성0. 스킬/MCP 별도 사용0; 실제 exec_command만 사용했다.
