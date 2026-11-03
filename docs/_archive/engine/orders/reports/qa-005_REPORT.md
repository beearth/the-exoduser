# QA-005 — 로비 회귀 8실패 진단·하니스/기대값 정정

상태: **지정 8실패 진단·수정 완료. 대상 suite 33/33 통과. 확장 회귀 전체 PASS는 아님(선재 2실패 별도 보존).** 제품 수정 0행.

## 기준·실행 범위

| 항목 | 근거 |
|---|---|
| 기준 | fetch 후 origin/main `e556b617190c325ca39f5add04357f5dea5ca87e`. 브랜치 `codex/qa-005-20261020`, 선행 브랜치 의존 없음 |
| 작업 폴더 | `~/exoduser-wt/qa-005`: `worktree add --no-checkout -b` 후 `sparse-checkout set --no-cone`. godot·웹 대용량 에셋 미수신, 최종 약443MiB |
| 비교 대상 | SV-TRANSPORT-READ의 main `284d7faf49295b2f5061937a47ce96038032ed3c` 원로그. `developerCharacterSlots.test.js`, index/game/server/node-main 5파일 SHA-256가 이번 기준과 모두 동일. 실패 8개 이름·순서 동일(`SV-comparison.json`) |
| 변경 | `test/developerCharacterSlots.test.js`와 이 보고서·CHANGELOG_SYNC 신규 절만. 공용6·제품·원본·다른 테스트·저장 형식·2_3 변경 0행. R의 HEAD/branch/INDEX/WORK 보존 |
| 실행 | Node v24.15.0, VM의 실제 원본 함수 + 자체 Map/DOM/fetch fixture. 서버 시작·실제 HTTP·사용자 저장 접근/쓰기 0. 의존 패키지는 기존 R/node_modules를 읽는 로컬 symlink 사용(설치/패키지 변경0) |
| 격리·과부하 | Godot 실행0, override.cfg 생성/수정0. Godot 실행 전 pgrep 대기 규칙을 우회한 실행 없음. 파일 기반 신규 테스트·userdir도 없으며 신규 3경계는 기존 Node suite의 매 테스트 새 VM/Map에서 실행 |

## 실패별 판정표

아래 이름은 **수정 전 실패 원문**이다. 전부 `test/developerCharacterSlots.test.js`. 지정 8건에서 제품 결함으로 확정한 항목은 0건이며 제품 수정안도 필요하지 않다.

| # | 실패명(원문) | 판정 | 원인·최신 main 원본 근거 | 처리 |
|---|---|---|---|---|
| 1 | demo remains a single fixed character even on a development server | 낡은 기대값 + 하니스 | 직접 오류 `_demoSyncActiveSave is not defined`. helper 연결 뒤에도 카드 1개 기대는 실패. index.html:3488–3510 실제 동기화·3541–3545 브라우저 5칸·3555–3559 일반 슬롯 UI/VIEW=2·3624–3635 생성 제한. 단일 고정 카드 계약은 폐기됨 | 원본 helper 실행, 저장 5칸 순서/뷰포트 2칸/5칸 시 생성 불가/개발권한 false/서버 호출0을 확인 |
| 2 | demo lobby shows the level and progress from its autosave | 낡은 기대값 + 하니스 | 직접 오류 동일. index.html:3493–3501 구 단일 저장→첫 빈 슬롯 이관, 3545 목록은 lv/stage/charIdx만 투영, 3584–3588 Lv·스테이지 표시. 처치수 UI 기대는 구 카드 계약 | 이관 전체 JSON(처치수 포함) 보존·단일 키 제거·Lv.46/스테이지 표시 확인. 실제 formatter 사용 |
| 3 | demo shows the default scene until its card is selected after server list completes | 낡은 기대값 + 하니스 | 직접 오류 동일. index.html:3530–3531 데모는 서버 목록을 요청하지 않음. 3555–3622 뷰포트 카드 구조, 3650–3655 선택명은 저장 슬롯 name. 고정 demo/DEMO CHARACTER 기대가 틀림 | 서버가 있어도 호출0, 저장 카드 클릭 전 null/클릭 후 저장 이름·charIdx·active 확인. `_selectSlot` no-op을 실제 원본으로 대체 |
| 4 | demo shows the default scene until its card is selected after storage fallback completes | 낡은 기대값 + 하니스 | 직접 오류 동일. index.html:3523·3531·3541–3545 데모는 동기화 후 브라우저 슬롯 사용. 서버 요청 실패 후 폴백하는 데모 분기 자체가 없음 | 오프라인 fetch fixture에서도 호출0·선택 전/후 검사를 #3과 동일하게 유지 |
| 5 | _goLogin discards a pending local success | 하니스 | 직접 오류 `Cannot read properties of undefined (reading 'resolve')`; 뒤늦은 unhandledRejection 원문은 `_demoSyncActiveSave is not defined`. helper만 연결해도 demo가 fetch를 안 해 finish는 여전히 없음(index.html:3531). full은 await fetch 후 request 검사3534, login은2804에서 무효화 | build=full에서 실제 지연 fetch를 만들고 finish 존재 검사 추가. 기존 응답 후 DOM 동일 참조/선택 null/화면 닫힘 단정 유지 |
| 6 | _goLogin discards a pending local failure | 하니스 | 직접 오류 `Cannot read properties of undefined (reading 'reject')`, 나머지 원인 #5 동일. 실패 응답은 index.html:3537–3538에서 request 검사 | full 지연 reject fixture, 기존 단정 유지 |
| 7 | _goCinematic discards a pending local success | 하니스 | 직접 오류 `Cannot read properties of undefined (reading 'resolve')`, 나머지 원인 #5 동일. cinematic 무효화는 index.html:2832, 성공 응답 검사는3534 | full 지연 resolve fixture, 기존 단정 유지 |
| 8 | _goCinematic discards a pending local failure | 하니스 | 직접 오류 `Cannot read properties of undefined (reading 'reject')`, 나머지 원인 #5 동일. cinematic2832·실패 응답3538 | full 지연 reject fixture, 기존 단정 유지 |

원본 저장 계약 문서 `docs/15 세이브+데이터구조/15 세이브+데이터구조.md`:47–65에도 2026-09-29의 데모 5슬롯·서버 분리와 이전 단일 카드 설명의 대체가 명시돼 있다. 기대값을 현재 관측 결과에 맞춰 임의로 바꾼 것이 아니라 이 계약과 원본 분기에 맞췄다.

## 원본 값·검사 강도

| 근거 | 그대로 확인한 내용 |
|---|---|
| game.html:62111, 62128–62142, 62160–62162 | 데모 단일 활성 키 `hellsave_demo`, 저장 payload의 player.lv·game.stage/kills 및 JSON 저장. 게임 저장 함수/형식은 실행·수정하지 않음 |
| index.html:3498–3501, 3545, 3584–3588 | 원본 구 저장 이관·목록 투영·표시를 실행. 기존 fixture의 Lv46/처치1795/ts는 테스트 입력이며 게임 상수가 아님. stage12는 상수0 반환 하니스를 검출할 합성 입력이며 실제 데모 도달 범위를 주장하지 않음 |
| lobby-stage-info.js:4–12, 16–36 | 실제 챕터 표·formatter 실행. stage12→3장 지옥의 겨울 3층. 기존 `()=>'1층'` 고정 stub 제거 |
| 검사 보존 | 원래 30건을 30건 대응 유지, 0/1/4슬롯 생성 3건 추가→33건. AST 단정 호출 지점59→77. 기존 지연 응답 성공/실패 8조합의 마지막4단정은 바이트 동일, 요청 존재 단정 추가. 관계없는 11개 callback(반복 전개 포함)도 원문 동일 |
| 음성 대조 | 원본 index의 독립 사본에 서버 분리 제거·슬롯 무제한·레벨 소실·스테이지 소실·이관 생략·선택명 오류·login 무효화 제거·cinematic 무효화 제거 8종을 각각 주입. 모두 관련 단정 실패/exit1(각7/2/1/1/1/2/4/4실패)로 검출. 제품/작업 원본에는 주입0 |

음성 대조의 Node TAP은 getter를 가진 DOM 참조 단정 실패를 `ERR_TEST_FAILURE`로 직렬화하는 경우가 있다. 검증 스크립트의 오류 분류식을 보완했으며 원문 `Expected "actual" to be reference-equal to "expected"`와 실패 이름으로 확인한다. 구문/미정의 함수 실패를 검출 성공으로 세지 않는다. 기대값·단정 삭제/skip/임계값 완화/원본 재작성/성공 출력 위조0.

## 실측

| 실행 | tests / pass / fail | exit | cancelled / skipped / todo |
|---|---|---|---|
| 현재 main 대상 baseline | 30 / 22 / 8 | 1 | 0 / 0 / 0 |
| 원본 helper와 메모리 저장소만 연결(중간 진단) | 30 / 22 / 8 | 1 | 0 / 0 / 0 |
| 최종 대상 suite | 33 / 33 / 0 | 0 | 0 / 0 / 0 |
| 확장 회귀: 수정 전 main 테스트 | 311 / 301 / 10 | 1 | 0 / 0 / 0 |
| 확장 회귀: 최종 | 314 / 312 / 2 | 1 | 0 / 0 / 0 |

대상 명령: `node --test --test-reporter=tap test/developerCharacterSlots.test.js`. 확장 명령의 정확한 23파일 인수는 `related-final.command.json` 보존: `test/lobby*.test.js` 전체와 대상 suite, demoOfflineCreation/demoSaveRoute/demoScope/steamDemoScope. 실행별 stderr는0byte이나 Node 실패·비동기 오류는 **stdout TAP에도 출력**되므로 stderr0만으로 PASS 판정하지 않는다. 기준 8실패의 비동기 오류 원문도 baseline.stdout.log에 남겼다.

## 확장 중 확인한 별도 선재 2실패 — 원문 보존·미수정

지정 8건과 별개다. 수정 전 main과 수정 후 모두 동일 실패이며 아래 파일은 다른 담당 범위로 0행 변경했다. 이 둘을 제외하거나 PASS로 승격해 전체 회귀 성공으로 보고하지 않는다.

| 테스트 | 실패명 원문 | 첫 실패 원문·근거 |
|---|---|---|
| test/demoSaveRoute.test.js | demo entry URL never labels the browser-only save as a cloud character | `_characterLoadSeq is not defined`. 원본 index.html:4341은 request를 읽지만 이 VM fixture는 변수를 제공하지 않음. 이번 원문 기록의 첫 오류이며 후속 오류/최종 판정까지 해결했다고 주장하지 않음 |
| test/demoScope.test.js | the lobby and demo build notes describe the same 1-1 level 100 scope | `The input did not match the regular expression /DEMO CHARACTER[\s\S]*Lv\.1 START · Stage 1-1 · Lv\.100 Cap/`. 전체 expected/actual 원문은 related-*.stdout.log. 단일 고정 카드 기대와 관련돼 있으나 해당 테스트·보호 문서는 수정하지 않음 |

이 확장 2건의 후속 담당 확인·수정은 별도 범위다. 실제 브라우저 플레이·실제 저장 복원·PC 실행·전체 Node/Godot 회귀 통과는 미검증이다.

## 산출물·제출·정리

원로그: `~/exoduser-wt/_out/qa-005/`. baseline/helper-only/fixed/related-*.stdout.log·stderr.log·command.json, 원본 snapshot, SV 원문 사본·SHA 비교, source-provenance.json, assertion-preservation.json, negative-control-summary.json 및 독립 음성 사본을 보존한다. 알려진 8실패 baseline은 원문 그대로이며 성공 로그로 대체하지 않는다.

코드 변경 후 docs 키워드 전수 검색 경로는 docs-keyword-paths.txt. 기존 저장 계약이 현행과 일치해 제품/설계 변경 없이 이 판정표·CHANGELOG_SYNC 맨 위 신규 절에 검수 상태를 기록한다. 정상 pre-commit 훅을 유지하고 정확한 3파일만 stage, 자기 브랜치만 비강제 push한다. 원격 SHA 대조 후 DONE.txt에 수치·SHA를 기록하고, 사용자 지시대로 자기 worktree만 `git worktree remove --force`로 정리한다. 브랜치·원로그·보고서 사본은 남긴다.
