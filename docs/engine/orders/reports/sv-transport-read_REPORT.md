# SV-TRANSPORT-READ 보고서 — 2번 단위 fixture 슬롯 읽기

상태: **reader 구현·원본 읽기 계약 검수 완료 / 실제 transport·복원·UI 설치 없음**. 기존 로비 전체 회귀의 기준 main 동일8실패는 별도 보존하며 PASS로 승격하지 않는다.

## 기준·선행 의존·범위

| 항목 | 실제 계약 |
|---|---|
| 작업 | sv-transport-read / codex/sv-transport-read-20261020 |
| 최신 main | fetch 성공, origin/main284d7faf49295b2f5061937a47ce96038032ed3c |
| 선행 의존 | SV-CONTRACT는 main에 있음. SV-COLLECT b8b8a8fa99b2b5d404c9f4654b5a19a542efd721은 아직 main에 없어 사용자 지시대로 그 브랜치 끝에서 새 분기. 이 reader는 collector를 호출하지 않으나 제출 branch의 부모 의존으로 명시 |
| 작업 위치 | ~/exoduser-wt/sv-transport-read. 첫 전체 checkout은 No space left on device로 실패했고 Git이 생성 중 폴더를 정리했다. 같은 브랜치에 --no-checkout 후 필요한 원본·문서·테스트만 sparse checkout하고 새 index를 초기화. 다른 담당/기존 산출물 삭제0 |
| 타깃 권위 | 매 호출에 dev_server 또는 nw_native fixture 계약을 명시. 자동 선택·실제 SAVE_DIR·APPDATA·saveNamespace 결정·인증·외부계정 접근0. target 미지정/알 수 없음은 HOLD |
| 신규 파일 | godot/port_modules/save_adapter/source_slot_reader.gd, godot/tests/test_native_slot_reader.gd, tools/sv_transport_read_oracle.cjs |
| 허용 문서 | 이 보고서와 CHANGELOG_SYNC 맨 위 신규 절만. WORK_BOARD·추적 문서·설계 보호 문서 변경0 |
| 보호 | 공용6파일·다른 담당 소유 파일·기존 테스트·game/index/server/node-main/project.godot·선행 collector 수정0. 실제 저장 쓰기·서버 호출·저장 형식·마이그레이션·Q/E·2_3 변경0. R 파일 변경0 |

## 원본 행과 읽기 계약

| 원본 | 그대로 유지한 관측 |
|---|---|
| server.cjs198–213 | readdir 순서 보존. .json 끝·_접두 아님만, JSON parse/속성 접근 실패한 파일 제외. name은 첫 .json만 제거. ts\|\|0·player?.lv\|\|1·game?.stage\|\|0·game?.kills\|\|0·charIdx??0. response ok:true/slots/development:true |
| node-main.js118–126 | 같은 row fields/default, development 필드 없음. 개발 서버와 동일한 namespace라고 간주하지 않음 |
| server.cjs225–230 / node-main.js142–146 | 파일 없음404 및 ok/data 응답은 fixture의 status/body로 주어진 결과만 해석. 실제 파일·서버·load route를 실행하지 않음. NW의 손상 파일 예외가 실제 어떤 HTTP 결과가 되는지는 이번 실행으로 주장하지 않음 |
| index.html3522–3550 | response non-ok/transport failure/JSON parse failure/null envelope면5칸 snapshot 폴백. j.ok&&j.slots이면 원 값 유지, 아니면[]. development는 j.ok truthy·development===true·testMode·non-demo 모두 필요. stale 응답은 apply=false이며 slots를 반환하지 않음 |
| index.html3541–3547 | 정확히5개의 caller-supplied raw string/null을 순서대로 읽음. 깨진JSON/null은 제외. name\|\|Slot N·lv\|\|1·stage\|\|0·charIdx\|\|0. API의 ??0과 폴백의 \|\|0 차이 보존. fallback row에는 원본처럼 ts/kills 없음 |
| game.html63968 / 63978–63983 | j.ok&&j.data가 truthy인 기존 응답의 admission만 관측. 새 metadata도 source_found_save=true이며 payload를 정규화하지 않음. player 유무/JS truthiness로 metadata와 player_payload_candidate를 구분하되 full_save_verified=false. 실제 dbRestore나 constructor 호출0 |

원본 SHA-256와 실제 발췌 start/end line·hash는 source-oracle.json/protected-provenance.json에 기록한다. slot 정제·경로 생성·온라인/cloud 계정·삭제·저장·active slot 교환·공유 저장·자동 migration은 이식하지 않는다.

## API·미지원 경계

| API | 입력·결과 |
|---|---|
| project_slot_files(target, files) | 자체 메모리의 {name,raw} 배열 → parsed sendJSON과 같은 payload. 디렉터리/파일을 열지 않음. 잘못된 JSON/null 제외·순서·표현식 default·JSON wire의 비유한 Number→null·문자열 property key를 보존 |
| consume_list_response(target, response, lobby, fallback_raw) | status/body 또는 transport_error, request/current_request/build/test_mode 및5칸 raw snapshot만 소비. response/fallback/stale/HOLD 구분, 저장/UI owner 설치 없음 |
| consume_load_response(target, response) | NOT_FOUND404 / HTTP_ERROR / TRANSPORT_ERROR / PARSE_ERROR / REJECTED / READY를 구분. metadata/player_payload_candidate/non_object_payload를 관측하며 full-save/restore 성공으로 판정하지 않음 |
| parse_fixture_json(raw) | JSON.parse 문법을 선검증한 후 native JSON decode. trailing comma·leading zero·미인용 key·raw control character·잘못된 escape·BOM/비JSON 공백·뒤따른 token을 손상 JSON으로 처리 |
| HOLD | 알 수 없는 target/context/status/body·비문자열 storage fixture·비배열 j.slots·미지원 native carrier는 값을 제조하지 않음. j.slots가 비배열이면 원래 carrier를 original_slots로 보존하며 설치하지 않음 |
| Unicode/깊이 | native 문자열 대응이 미검증인 lone UTF-16 surrogate와 depth128 초과는 HOLD. 유효 JSON을 손상/빈 슬롯으로 위장하지 않음. 지원 확인된 paired surrogate/한글·중복 key/숫자/배열·객체는 원본과 대조 |
| 범위 분리 | _demoSyncActiveSave는 저장/마이그레이션이므로 호출하지 않음. 입력 fallback snapshot은 그 이후 읽기 단계의 fixture로 명시. apply는 최신 응답 관측 플래그이고 실제 UI 변경/쓰기 권한이 아님. 모든 receipt에 fixture_only=true, storage_io/network/write_authorized/restore_connected=false |

반환 payload는 새 decode/projection으로 분리된다. 원래 fixture raw/string/배열은 변경하지 않는다. wrapper를 새 세이브 schema나 저장 데이터로 쓰지 않는다.

## 실제 검증

Godot4.7.2.stable.official.ed1daf0bf 원앱, Node v24.15.0. 전체 asset import와 Main 게임 부팅 없이 이 단위의 headless script를 실행했다. 매 실행 전 pgrep -f "Godot.app/Contents/MacOS/Godot"의 행 수(|wc -l과 동등)를 확인해2 이상이면30초씩 기다렸다. process-guard.jsonl에 대기와 실행 count를 보존하며 이 작업은 Godot 순차1개다.

신규 테스트 격리명 EXODUSER-sv-transport-read-Isolated-20261020, 기존 SV-CONTRACT는 파일 상수 EXODUSER-sv-contract-Isolated-20261020. 실행마다 override.cfg를 적용하고 종료 후0byte로 비웠다. 원본이 sparse checkout이어도 실제 추적 문서·원본4파일·기존 계약 테스트를 읽어 대조하며 누락을 PASS로 취급하지 않는다.

| 실행 | 검사 | 실패 | exit | ERROR/SCRIPT ERROR/경고 |
|---|---:|---:|---:|---:|
| 신규 reader 최종 | 5952 | 0 | 0 | 0/0/0 |
| 기존 SV-CONTRACT 최종 | 3023 | 0 | 0 | 0/0/0 |
| 신규 reader 첫 실행 | 5950 | 12 | 1 | 0/0/0 |
| 기존 developerCharacterSlots 전체 | 30건 중22통과 | 8 | 1 | 원로그 보존 |
| 최신 main 원본만 별도 폴더에 복사한 Node baseline | 30건 중22통과 | 8 | 1 | 같은 실패 이름·취소/skip0 |

첫 실행12실패는 dev response의 dot 할당 StringName development key를 원 JSON 문자열 key로 반환하지 못한 차이다. _wire에서 문자열 key로 변환한 뒤 재검수했다. 별도로 unknown request sequence·non-string fallback 입력의 HOLD를 보완했고 최종2검사를 추가했다. 첫 실패 로그는 attempt-01-*로 보존한다.

| 최종 reader 검사군 | checks | failures |
|---|---:|---:|
| setup | 4 | 0 |
| server_slot_projection | 793 | 0 |
| strict_json_boundaries | 88 | 0 |
| lobby_response_read | 4677 | 0 |
| load_read_admission | 379 | 0 |
| unknown_scope_and_unsupported | 11 | 0 |

실제 원본 branch 대조: 두 서버×6파일 집합12건, JSON.parse37경계, 로비 원본78상황×두 target156건, load 원본 admission16상황×두 target32건. DOM/fetch/fs/restore는 VM 내 자체 fixture stub이며 실제 서버·사용자 저장·복원 호출0. 원본 helper의 read 부분만 평가하고 save/delete route·서버 모듈의 top level/리스너는 실행하지 않는다.

## 기존 로비 회귀 BLOCKED와 제출 범위

기존 developerCharacterSlots의8실패는 demo 및 local pending-response 하니스에서 _demoSyncActiveSave 미정의 등이 관측된다. 동일한 index/game/server/node-main/test 파일을 origin/main에서 읽어 별도 baseline에서 다시 실행해30/22/8과 같은 실패 이름을 확인했다. 새 reader 파일은 해당 테스트에서 import되지 않는다. **로비 전체 suite PASS는 BLOCKED**로 유지한다. 기존 테스트·UI·동기화 writer는 다른 소유/보호 범위여서 수정하지 않는다. 신규 읽기 단위의 검수 통과와 구분한다.

원로그 ~/exoduser-wt/_out/sv-transport-read/: source-oracle.json, summary.json, *.command.json, *.stdout.log, *.stderr.log, *.engine.log, process-guard.jsonl, node-baseline-comparison.json, protected-provenance.json. 순수 fixture라 screenshot·실플레이·PC·실제 endpoint/namespace 검증은 범위 밖이다.

정상 pre-commit docs-sync-check를 유지하고 자기 파일만 명시 stage한다. test_* ignore 때문에 신규 테스트만 -f로 추가하며 훅을 우회하지 않는다. main push·force push·git add -A·R 파일 쓰기0. 자기 branch만 push하고 원격 ref SHA를 대조한다. 최종 branch·SHA·수치는 DONE.txt에 남긴다.

총괄 판정(2026-10-20): 로비 회귀8실패는 최신 main에서도 동일한 선재 결함(QA-005 진단 중)이므로 SV-TRANSPORT-READ를 완료 처리한다.
