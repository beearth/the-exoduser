# Mac helper payload 무결성 소스 인수 — 2026-10-02

Mac 패키저 `verifyOutput`이 비어 있지 않은 helper payload의 1바이트 변경을 인수하던 경계를 원 runtime pin SHA-256 대조로 보강했다. 실제 파일에서 추출한 소스 검수는 30/30 PASS이며 실앱·Mach-O·서명·native 실행 인수는 미실행이다.

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 총괄 제공 HEAD `79f6f342569a7c590e8fe9d8962e5453685a164b`는 지시 근거이며 이 문서 담당의 Git 독립 관측이 아니다. 소스 담당 완료 영수증 시각은 `2026-10-02T07:06:09.389232+00:00`다. 문서 담당은 영수증·현재 source/test 원문을 읽고 해시만 대조했으며 검사를 다시 실행하지 않았다.

## 반례와 적용 접점

| 항목 | 정확한 근거 / 상태 |
|---|---|
| 제출 당시 반례 | `BUILD-helper-integrity-0543`: 정상 입력 1개·GPU payload 끝 1바이트 XOR1 변형 1개, 현행/메모리 후보 총 4호출. 현행은 변형을 ACCEPT, 후보는 `MAC_HELPER_SHA_MISMATCH:nwjs Helper (GPU)`로 REJECT. 정상 return·읽기 path/bytes/SHA·descriptor close 동등. 전문팀 5 assertion PASS는 이 두 메모리 입력만의 이력 |
| 생산 소스 적용 | `tools/team-followup-20261001/BUILD/mac-packager/packager.mjs:83`의 기존 helper length 검사 1접점 125 → 666 bytes(+541). 나머지 전체 byte 동일. 승인 메모리 후보와 `verifyOutput` 원문 동일 |
| 원 source SHA | `1975f899fe62559b96674a811604fb24cee873cd1e1b6da170814a1ffa0e7f0c` |
| 적용 source SHA | `289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65` |
| 적용 verifyOutput SHA | `d17222a0e1af21fc9770ea8ac9665af0e2a16140f1c7d2528aecc93cb8161030` |
| source 영수증 | `tmp/mac-migration-runtime/continued-review-20261002/build-helper-backup/receipt.json`, SHA `11d5519d2992a099e7df7d3478e6fecfcf1b16385e12dd7a63c0429859483f46` |
| 새 검사 원문 | `test/macPackagerHelperIntegrity.test.cjs`, SHA `3359cef0b9fb12d5a09f02ba34cd9b9383e6d28753c466016f26688bc203d7c9` |
| 옛 산출 보존 | `tools/team-followup-20261002/supervisor-next/BUILD/BUILD-helper-integrity-0543/{TASK.md,result.md,evidence.json,checks.mjs}` 수정·재실행 0. `productionApplied=false`는 후보 제출 당시 snapshot으로 보존. 이번 적용은 패키저 소스 접점에 한정 |

## helper 4종 이름·경로와 pin 기준

`C=proposal.args.releaseInfo.components.chromium`, `N=proposal.args.app.name`, `A=path.join(proposal.paths.output,N+'.app')`다. source 원 경로는 runtime 목록의 상대경로이며 rename 출력은 앱 안의 절대경로다. 아래 `{C}`·`{N}`·`{A}`는 설명용 자리표시자다.

| suffix(공백 포함) | 원 실행명 | 원 proposal.runtimeFiles 경로 | rename 출력 실행명 / 경로 |
|---|---|---|---|
| `''` | `nwjs Helper` | `nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper` | `{N} Helper` / `{A}/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/{N} Helper.app/Contents/MacOS/{N} Helper` |
| `' (Alerts)'` | `nwjs Helper (Alerts)` | `nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)` | `{N} Helper (Alerts)` / `{A}/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/{N} Helper (Alerts).app/Contents/MacOS/{N} Helper (Alerts)` |
| `' (GPU)'` | `nwjs Helper (GPU)` | `nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)` | `{N} Helper (GPU)` / `{A}/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/{N} Helper (GPU).app/Contents/MacOS/{N} Helper (GPU)` |
| `' (Renderer)'` | `nwjs Helper (Renderer)` | `nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)` | `{N} Helper (Renderer)` / `{A}/Contents/Frameworks/nwjs Framework.framework/Versions/{C}/Helpers/{N} Helper (Renderer).app/Contents/MacOS/{N} Helper (Renderer)` |

`plan`의 `listTree`·`sameInventory`가 원 runtime 목록/pin을 구성·대조하고, `execute`는 build 직전 같은 목록을 다시 대조한다. 설치 `nw-builder` 4.17.10의 `bld/osx.js`는 helper 앱·MacOS 실행명에서 `/^nwjs/`를 app.name으로 rename하고 plist 실행명을 바꾼다. 이 접점은 payload 바이트를 변경하는 구현이 아니다. 고정 NW.js 버전은 0.111.2이며 Plugin suffix를 추가하지 않았다. 이 설명은 기존 소스 정적 대조이고 plan/execute/build 실행 근거가 아니다.

| 순서 | 현재 검사 / 오류 |
|---|---|
| 1. 출력 payload 읽기 | 기존 `readFile`로 helperBytes 1회 읽기, `helperBytes.length>0`; 빈 payload는 기존 `MAC_HELPER_RENAME_NOT_COMPLETED` |
| 2. 원 pin 조회 | 원 `nwjs Helper{suffix}` 상대경로와 정확히 일치하는 `proposal.runtimeFiles.find` entry. rename 목적지 path를 pin의 path로 공급하면 원 pin 누락으로 거부 |
| 3. pin 형식 | `expectedPin&&/^[a-f0-9]{64}$/.test(expectedPin.sha256)`; 누락/무효는 `MAC_HELPER_PIN_MISSING_OR_INVALID`. 대문자·63/65자리·비hex·빈값 허용 0 |
| 4. payload SHA | `digest(helperBytes)===expectedPin.sha256`; 불일치는 `MAC_HELPER_SHA_MISMATCH:nwjs Helper{suffix}`. 해당 helper plist를 읽기 전에 거부 |
| 5. plist rename | 기존 `parse(...).CFBundleExecutable===helper`; 불일치는 `MAC_HELPER_PLIST_NOT_COMPLETED`. plist는 의도적으로 rename되므로 원 plist SHA 일치 검사를 추가하지 않음 |

## 기존 정책의 보존과 한계

| 대상 | 보존된 계약 / 검수 범위 |
|---|---|
| 주 실행 파일 | 원 `nwjs.app/Contents/MacOS/nwjs` pin SHA와 출력 main 비교 및 출력 plist 실행명 확인, 기존 `MAC_RENAME_NOT_COMPLETED` 유지. pin 조회/전체 오류 형태를 별도로 확장하지 않음 |
| 파생 package / server | JSON 직렬화가 `{...proposal.derivedPackage,product_string:N}`와 일치해야 함; node-main은 derivedServer SHA 비교. `DERIVED_PACKAGE_MISMATCH`·`DERIVED_SERVER_MISMATCH` 원문 보존. 이번 새30검사는 정상 대역만 공급하며 이 두 mismatch 별도 오류주입 검수는 하지 않음 |
| 입력 loop | `package.json`·`node-main.js` 제외 후 `proposal.inputs`의 app.nw payload SHA 대조, `PACKAGED_INPUT_SHA_MISMATCH` 원문 동일. 새 fixture `inputs=[]`이므로 loop 동적 인수 0 |
| 안전 읽기 | `safeAncestors` symlink 거부, `O_RDONLY\|O_NOFOLLOW`, regular file/nlink=1, 읽기 전후 size/mtime/ctime 일치, finally close 원문 동일. synthetic 메타데이터·descriptor 오류 검수이며 실제 OS 장애/링크 검수가 아님 |
| close 실패 | 기존 close 예외 전달을 유지. 주입 실패는 close 1시도·outstanding descriptor 1이며 회복·모든 descriptor 닫힘을 주장하지 않음 |
| 정상 동등성 | 실제 old/current verifier를 메모리 대조해 동일 return, lstat/open/fstat/read/close trace, helper payload 1read·1open·1close 및 plist 1read 확인 |
| architecture / 권한 / 서명 | plan의 원 main 첫 8byte thin64 magic/arch 검사는 원문 보존이며 이번 실행 0. helper verifier는 opaque SHA/실행명 plist를 확인할 뿐 Mach-O 구조·아키텍처·실행권한·서명/공증을 검사하지 않음 |
| 다른 소유 | plan/execute/localBuild·cleanup·포트/profile/save·게임 HTML 두 판/node-main/오디오/보호2_3/기존 팀 산출 변경 0. 출력 경로·기존 앱·사용자 데이터 수정 0 |

## 새 실제 소스 검수 수치

소스 담당의 새 30 tests는 actual `verifyOutput/readFile/safeAncestors/digest/requireValue` 5함수와 설치 plist parser, 실제 Node path/crypto/createRequire를 사용한다. VM Script 문법을 위해 추출 verifier의 `import.meta.url` 1곳만 원 source URL literal로 바꿨다. fs·payload·descriptor·메타데이터는 Map 대역이며 패키저 전체 import/evaluate, plan/execute/localBuild 호출, 실제 런타임/앱 읽기·쓰기 0이다. legacy control은 메모리에서 helper guard 한 접점만 원문으로 되돌린다.

| 새 test 분류 | tests 수 | 실제 반영본 결과 / 범위 |
|---|---:|---|
| 정상 old/current return·전체 trace | 1 | PASS |
| 4 suffix 각각 1바이트 변형 | 4 | PASS; 길이 동일/XOR1·옛 ACCEPT→현재 SHA mismatch 거부 |
| 4 suffix 각각 원 pin 누락 | 4 | PASS |
| 4 suffix 각각 무효 pin | 4 | PASS; 각 test 안에서 undefined/null/빈문자/63hex/64비hex/65hex/대문자 7형식. 별도28 tests로 합산하지 않음 |
| 4 suffix 각각 빈 payload | 4 | PASS; 기존 오류/trace 동일 |
| 4 suffix 각각 잘못된 plist 실행명 | 4 | PASS; 기존 오류/trace 동일 |
| 설치 parser malformed plist | 1 | PASS; 옛 오류/trace 동일 |
| opaque 비 Mach-O pin 일치 | 1 | PASS; byte identity만의 인수 한계 |
| rename 목적지 pin path 대입 | 1 | PASS; 원 pin 누락 거부 |
| synthetic ancestor symlink | 1 | PASS; helper open 전 거부 |
| nonregular/read throw/source changed | 3 | PASS; 실제 readFile finally close 대역 검수 |
| synthetic close 실패 | 1 | PASS; 같은 예외/trace와 descriptor 1잔류 보존 |
| main SHA 불일치 | 1 | PASS; 기존 early 오류/trace 동일 |
| 합계 | **30** | **30 PASS / 0 FAIL** |

| 비교 / 별도 검사 | 정확한 수치 |
|---|---|
| 원 source에 같은 새30검사 | 17 PASS / 13 FAIL, exit1. 결과 개선 전 이력이며 완료 수치에 합산하지 않음 |
| 현재 반영 source | 30 PASS / 0 FAIL, exit0 |
| packager 모듈 `node --check` | 1회, exit0 PASS. 새30검사에 합산하지 않음 |
| 전문팀/게임/이전 7,918·8,258 전수/22·8 검사 | 재실행 0; 과거 완료 상태 보존 |
| 문서 담당 | 새·기존 검사 실행 0, source/receipt/test 원문 읽기와 SHA 대조만 |

## 과거 native pin과 합성 pin의 구분

다음 SHA는 `integrated-mac-build-plan.json` 및 전문팀/source 영수증이 인계한 **과거 runtime pin**이다. 해당 native 파일 바이트를 이번에 재관측하지 않았다. 기존 Chromium 예시는 `148.0.7778.97`이고 실제 경로는 C를 따른다. 새 검사의 expected SHA는 메모리 synthetic payload에서 계산하므로 아래 historical pin이나 현재 실앱 SHA로 쓰지 않는다.

| 원 helper | historical pin SHA256 | 이번 native 재관측 |
|---|---|---|
| `nwjs Helper` | `544c9e579c914be565a416ca50c01bf8a259a8bd489fe91aff340bfe1087bedc` | 0 |
| `nwjs Helper (Alerts)` | `601cafa38b6cb4be5fb9026489a717d3abe0320cb31ab473c8b44e0418b92eab` | 0 |
| `nwjs Helper (GPU)` | `abc0a72d988ba5b33cfa638c05352f1a7be975c22d1f4ee379f25e7f0f4f289e` | 0 |
| `nwjs Helper (Renderer)` | `1706b0cdbeec3bfe73a5dec8e42ed4b1c634a7c44c25216de1c60ae804822777` | 0 |

## docs 전체 검색과 원문 보존

문서 작성 전 docs 전체 rg 원문·정확 목록·분류·SHA를 `tmp/mac-migration-runtime/continued-review-20261002/build-helper-docs-backup/2026-10-02T07:07:28.605Z-29892bfc-3c0b-4e64-a8f6-79c88b42b95f/`에 보존했다. 원래 정본 2개를 byte 백업한 뒤 append만 사용했다. 기존 prefix 18,464/8,966 bytes와 LF 122/61, CRLF 0/0을 그대로 유지한다. 신규 보고서 EOF는 LF 1개다.

| 전체 docs 검색 | 매칭 행 / 문서 | 원문 SHA256 |
|---|---|---|
| mac-packager/verifyOutput/runtimeFiles/MAC_HELPER/Helper 및 한글 헬퍼 | 66 / 49 | `7aea3e9c929d72a1edae1bc36735c3861a73a41425cd8f113067180ea3cd1538` |
| 전문팀과 같은 verifyOutput/MAC_HELPER/Helper/Mach-O/packager/대장 | 32 / 20 | `07fc655b0394101a37bedc19c9b56cfa45c7864310b0b2164c6f7a005dc0785b` |
| MAC_RENAME/CFBundleExecutable/nwjs Helper/패키저/payload 계약 | 5 / 4 | `3e7c5511fac08f0b7db763a309aa422f6da25edc082fa0e46162f972c82e6ca2` |

합집합 61문서 중 현재 Mac 패키징/백업 계약을 가진 BUILD 정본 2개에 이 부록/보고서 참조를 추가한다. CHANGELOG/CONTINUOUS-INTEGRATION 2개는 총괄 소유로 인계한다. 관리 근거 3개·역사 task/receipt/다른 helper 18개·다른 시스템 helper 31개·PC/USB/과거 전달 4개·보호2_3 1개는 보존 분류다. PC 창/포트, 과거 앱 생성 및 7,918/8,258 검수, 프로필 인자 인수 이력은 이번 helper 출력 비교로 수정하지 않는다. 전문팀 원자료와 과거 manifest는 재작성하지 않았다.

## 남은 Gate

| Gate | 현재 상태 |
|---|---|
| 패키저 helper 원 pin↔rename payload source 계약 | 적용·새 actual-source 30/30 PASS |
| code+docs 범위 한정 commit/push·정확 원격 ref SHA | 총괄 별도 기록; 이 문서 담당 Git 실행 0 |
| 실제 output 앱 payload/파일 구조·runtime 읽기 | 이번 재관측/실행 0 |
| 실제 Mach-O·아키텍처·권한·서명/공증·앱 생성/실행 | 미검수 |
| 로비→게임→설정→저장→종료→재시작·미디어·제품/배포 | 이번 미검수; 과거 관측은 해당 시점 증거로 보존 |

기존 앱 생성이나 함수검사 PASS를 이번 native/실게임/시각/제품 PASS로 대체하지 않는다. 이번 범위의 rebuild/runtime/Mach-O/signature/app/deployment 인수는 모두 false다.
