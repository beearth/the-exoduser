# BUILD 기존 앱 acceptance manifest 고정 — 2026-10-02

선행22 source-delta 검사를 완료 근거로 인수하고 재실행하지 않았다. 이번 신규 작업은 core7행의 파일 byte SHA/bytes pin과 근거 문서 SHA 고정이다. 상태 **SOURCE_PINS_MATCH_PRIOR_ACCEPTANCE**, acceptanceManifestReady=true. 새 fixture0·새 기능검사0·이전22 재실행0이다.

## 고정 대상과 검수 단계

- checkout: /Users/fordeargamers/Projects/exoduser-migration-20261001
- immutable TASK: /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/BUILD/TASK.md
- archive job: /Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269
- app: /Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app
- archive: /Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Resources/app.nw
- 기존 생성 입력 commit: 6be3a06b4e8d03768a35f4c57d419f45c8efeb39
- 기존 입력7918개는 당시 목록이며 이번 전체입력 검수0
- manifest SHA-256: 7dfcdc3512d94a179ee9171762ad163a0107b88d29291be0cab66fb259deda62
- 실제 pin 실행: 2026-10-02T04:34:35.495Z–2026-10-02T04:34:35.573Z
- 최신 운영 지시: 총괄1+전문15=16, Claude8/Codex8. 이 과제 범위 확대0

## source ID·byte pin·예상 관계·drift·Gate

각 예상 관계는 선행22 검수 당시 계약이다. 현행 source가 선행 SHA와 다르면 아래 실제 SHA를 유지하고 DRIFT_REQUIRES_ROOT_REVIEW로 기록하며 새 기능 원인을 추정하지 않는다. 선행 hunk 개수/근거 pointer는 evidence의 각 행에 재사용했고 새 diff 실행0이다.

| source ID / 한글명 | 적용 파일 | 현재 source bytes / 전체 SHA-256 | archive bytes / 전체 SHA-256 | 선행 당시 예상 관계 | 이번 실제 pin 상태 | 미검수 Gate |
|---|---|---|---|---|---|---|
| ACC-01 / 본편 HTML | game.html | 4,025,302 / 30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f | 4,024,167 / c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a | KNOWN_FUNCTIONAL_DELTA: 선행 당시: 필터 초점 복귀·유골 행동 비활성화 초점 회수2종이 기존 앱에 미포함 | PIN_MATCHES_PRIOR_EVIDENCE | 실제 키보드/패드·필터/유골 행동 초점; 현행 전체입력 재검증·재빌드·실앱 저장 재실행 |
| ACC-02 / 쉬운판 HTML | game-easy-test.html | 3,902,427 / 9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8 | 3,901,292 / 11b4e97b15903b9699b296362bdd068ffed6d3a1a505d9f6eeec5482b7c085ca | KNOWN_FUNCTIONAL_DELTA: 선행 당시: 위 초점2종이 기존 앱에 미포함; 기본 본편/easy 차이 보존 | PIN_MATCHES_PRIOR_EVIDENCE | 쉬운판 실제 UI·게임; 현행 전체입력 재검증·재빌드 |
| ACC-03 / 개발 서버 | server.cjs | 16,335 / 18cf9aa806d5715788f360debbc2a45c2574a76db952f101b524e2ff77fd517d | 예상 비포함 / SHA 없음 | EXPECTED_EXCLUSION: 선행 당시: server.cjs는 기존 앱 입력에 없고 앱 서버는 node-main.js. 개발 INM/Range 인수를 앱 품질로 전달하지 않음 | PIN_MATCHES_PRIOR_EVIDENCE | 개발 HTTP/HEAD/Range와 앱 내장 서버 별도 인수; 서버 기능 앱 포팅은 별도 총괄 소유권 |
| ACC-04 / 앱 내장 서버 | node-main.js | 10,153 / 01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce | 10,261 / f0f922cf4e62dd9f30282ebd37b6ef0c258f2864416e89ab125a6631fd8654c1 | EXPECTED_DERIVATION: 선행 당시: PORT3333→3383, SAVE_DIR→기존 job/user-state/saves 두 치환만 | PIN_MATCHES_PRIOR_EVIDENCE | 실제 앱 HTTP·슬롯 ACK→디스크→종료→재실행→GET; 저장·미디어·이동 경로 계약 |
| ACC-05 / 패널 스크립트 | ui-panels.js | 11,883 / b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5 | 11,883 / b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5 | BYTE_IDENTICAL: 선행 당시: source/archive byte 동일 | PIN_MATCHES_PRIOR_EVIDENCE | native 패널 초점·전체 게임·레이아웃 |
| ACC-06 / 패키지 설정 | package.json | 2,040 / 58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8 | 1,054 / f76006616e9c2c99b728327baf9440a01f4ef9f95d6760b64a342600e2ff9f8c | EXPECTED_DERIVATION: 선행 당시:3383 main/node-remote·고유job 프로필·product_string 파생. name/version/window·나머지 Chromium args 보존, private/type/scripts/devDependencies/dependencies 생략 | PIN_MATCHES_PRIOR_EVIDENCE | 실앱 부트·코덱·서명·절대 profile/save 이동 및 배포; 런타임 의존성 전체 완전성 |
| ACC-07 / 로비 | index.html | 342,046 / 38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8 | 342,046 / 38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8 | BYTE_IDENTICAL: 선행 당시: source/archive byte 동일 | PIN_MATCHES_PRIOR_EVIDENCE | 실앱 로비→캐릭터 선택→게임·미디어 |

## 근거 파일의 전체 SHA 고정

| 근거 ID | 절대경로 | bytes | SHA-256 |
|---|---|---|---|
| task | /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/BUILD/TASK.md | 6060 | b52db69e91c80db9efb0f2a17b4f2dd74570df23283f0af6788fc65a0a78e123 |
| priorEvidence | /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/BUILD_TEAM/evidence.json | 56269 | f26f11e6b0f41dbc3df5cb0a48046566c8cbd397eb724e27f25c964a6b52fb78 |
| priorReport | /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/BUILD_TEAM/result.md | 13977 | 778734c303ea1e2054593f092d47b8fcffe8b0bf43412206f1674b1a1cbe569d |
| config | /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/BUILD/integrated-mac-build-config.json | 3427930 | 78426f539bcd5b39578353c2f6a76bfa9fa1ba7354cf1fadcdaf7a085043ee99 |
| buildResult | /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/BUILD/integrated-mac-build-result.json | 1328858 | 7e7955e1bfd0f71b251446d2eeec019be6feb6dfd3f4ece2ef0b6da86a0dc681 |

각 manifest 행의 evidenceAnchor와 expectedRelationship.proofs는 priorEvidence의 JSON pointer/check ID를 가리키며 위 priorEvidence 전체 SHA에 결속된다. config/result는 기존 앱 생성 신원·제작 commit 근거이지 현재 빌드 승인이 아니다.

## 이번 건수와 준비/승인 구분

| 항목 | 이번 실제 범위 |
|---|---|
| 신규 manifest/pin | source7·archive 실파일6·예상 부재1, 7행 고정 |
| 신규 drift | 0행, sourceStatus=SOURCE_PINS_MATCH_PRIOR_ACCEPTANCE. 드리프트가 있으면 실제 신규 SHA와 전후값은 evidence에 보존 |
| 이전 검사 |22 PASS를 인수, 실행0. 이번 pin/구조 검수와 합산하지 않음 |
| fixture/기능 검사 |0/0. packager·서버·게임 코드 import/실행0 |
| 상태 | acceptanceManifestReady=true, rebuildExecuted=false, runtimeAccepted=false, visualAccepted=false, productionApplied=false |
| 경로/보존 | root/TASK/owner realpath 일치, symlink 경계 거부. 기존 TASK·근거·사용자 config 초안과 source/archive pin 전후 보존=true. 삭제/이동/cleanup0 |
| 산출 | checks.mjs, result.md, evidence.json 3개만. 별도 manifest/config/patch/log/fixture/폴더 생성0 |
| Git/Changes/원격 | Git 명령·인덱스 접근·원격 조회0, 현재 값UNKNOWN. 선행 인수된 head 31454dfa49c90bac77351273fc32f0c1eb937928은 이력이며 현재값으로 선언하지 않음 |

**source/manifest PASS ≠ runtime/visual PASS.** 이 manifest는 재빌드 승인이 아니며 전체7918입력·실앱 로비/설정/저장→종료→재실행/HTTP/영상·음향/서명·배포 검수를 대신하지 않는다. server.cjs 개발 서버 인수는 앱 내장 node-main 품질로 전달하지 않는다.

## docs 검색과 총괄 정정안

checks 코드 작성 뒤 docs 전체에서 acceptanceManifest|packaged-source-delta|08cac1ce|INTEGRATION_BUILD_TEAM_MASTER|releaseOssuaryAction|inventoryFilterKey|node-main|runtime-acquire-config-draft를 rg 검색했다. 145행/63문서, 원문 output SHA=42d8d4ae2a3e6b80ed48537d334d4b4d7610b87b8470fabc874d5581399036db; 정확 목록은 evidence.docsSearch.matchedFiles에 기록. 생산 수치/공식/포함·제외/변환 규칙 변경0, 공용 docs와 보호2_3 수정0이다.

| 총괄 인수 대상 | 필요한 현재상태 추가안 |
|---|---|
| docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md | codex-half/BUILD evidence의 acceptance manifest SHA와 reference/core7 pin 상태를 기록. 이전22 인수·이번7행 pin·새fixture0·재빌드/실앱 미인수를 구분. drift가 있으면 DRIFT_REQUIRES_ROOT_REVIEW 및 실제 SHA 명시 |
| 총괄 팀 상태·후속 인수표 | 본 과제 제출 완료와 acceptanceManifestReady를 기록하되 생산 반영·빌드·runtime/visual 완료로 집계하지 않음. Changes·원격 복구 확인/체크포인트는 총괄이 현재 실제 근거로 수행 |
| 선행 BUILD 결과의 현행 상태 표 | 기존 보고서의 HEAD31454dfa 및 source SHA를 역사적 관측으로 유지. 이번 실제 SHA는 manifest 행을 참조하며 새 drift 원인을 임의 확정하지 않음 |

재현은 지정 Node 전체 경로로 이 checks.mjs --verify이며 기존22나 packager를 실행하지 않는다. manifest 구조/근거 SHA 확인 결과·최종 산출 목록은 evidence.finalVerification에 별도로 기록한다. 자동 다음 작업·다른 채팅 메시지0, 결과만 총괄 인수에 맡긴다.
