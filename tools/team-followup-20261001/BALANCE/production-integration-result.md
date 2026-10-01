# 저장 보류분 즉시 배수 — 생산 통합 결과

## 수신·소유·실제 시각 (UTC)
- 수신/첫Read 2026-10-01T17:02:21Z. UIUX 소유권 반환과 원격66998de7d0c2f25a1261825ec52957cc0464e983 완료는 사용자전달 근거이며 이번Git조회/쓰기0.
- AGENTS·담당경제대장·저장SSOT·전용task·immediate17후보·QA busy-save R1을 읽었다. 생산은 아직기존dbSaveNow였으며 helper없음을 확인하고 함수별원문/전체SHA를 production-integration-before.json에 보존했다.
- 첫 생산 Code Edit 17:03:41Z(양쪽HTML UTC mtime). 첫 패치시도는 hunk를소스역순으로배치해찾기실패했고 적용0; 소스순서로재작성하여승인8hunk만적용했다. 타팀변경으로오인하지않는다.
- 최종검수 17:06:38Z: **22PASS/0FAIL**, 명령 아래기록. 초기syntax fixture가importmap을JS로오인한실패1건은 JSON/module별parser로교정했다. 생산구문결함이아니다.
- **검수완료후 game.html/game-easy-test.html 소유권을 root에 반환한다. 이후 HTML 추가편집0, 새범위착수0.**

## 실제 생산 변경
| 위치 | 반영내용 | 유지계약 |
|---|---|---|
| 두HTML dbSaveNow | charId/charIdx/P객체/dbSave함수 캡처, DB준비/컨텍스트대조, timer발화busy면 pending1개보관 | 일반500ms 디바운스불변 |
| 두HTML _drainPendingSaveNow | pending을호출전소비, 컨텍스트/DB준비확인 후 dbSave 직접호출 | 완료후추가500ms 재디바운스없음 |
| 두HTML 기본DB/로컬/standalone 종료3곳 | _saving=false 직후 drain호출 | 기존_pendingForce/force최소5초·실패처리불변 |

기존미적용후보대비helper마지막 dbSaveNow→dbSave 한줄, **production대비각HTML4hunk(총8)**이다. demo500/demo override본문·dbSaveForce·비용/RNG·저장schema·UIUX인벤토리 변경0.

## 생산 회귀·보존
실행: `node --test tools/team-followup-20261001/BALANCE/production-integration.test.mjs`
- 매 실행시 현재production에서 now/helper/force/5개save를 추출하고VM에서실행한다. 양쪽 기본DB·로컬hold→보류분완료즉시dispatch, 성공/실패·2회busy·중복drain·force경쟁·일반499/500ms·캐릭터/플레이어/함수교체·DB미준비를검수했다. context교체는timer이전과pending후 각각검사.
- 원본RED(보존된생산원문은busy발화유실: 첫snapshot+0만저장)→현재생산GREEN(두번째snapshot+1 dispatch)4그룹. 기존partial후보의R1 재500ms와생산즉시호출도별도비교8행을기록했다.
- 5개save분기검수: 기본DB·로컬비동기, demo500/demo/standalone동기경로. ACK와메모리persist는각각명시적으로진행하며 새dispatch직후둘다미완료인것을assert한다.
- 두HTML 각각 inline JavaScript **6개**(일반script4/module2)를구문검수했다. 일반은vm.Script 생성만, module은 `node --input-type=module --check`만 수행하며실행/빌드없음. importmap은JSON구문검수.
- 통합구역을메모리에서원문으로치환한전체파일SHA가before전체SHA와동일: **승인구역외 전체바이트/인벤토리원문보존**. force함수byte동일·5개save는오직허용된drain호출변경만있음을assert.
- 이전immediate/save-inflight/AI-persistence/unload 산출 전체SHA manifest를대조해 **원본RED검사·후보·증거byte불변**. 이전파일을현재production용으로수정하거나검사로그를덮어쓰지않았다.

### 이전검사 전제 변경
이전17/29/unload검사는각당시production과동일해야한다는원문SHA assert를포함한다. 이제생산이승인변경됐으므로기존검사파일을그대로현재HTML에실행하면그역사적전제가달라질수있다. 이는이전산출을고칠이유가아니다. 신규 production-integration-before.json으로원본을보관하여새검사에서RED를재현하고현재HTML을매회추출해GREEN을검수했다. root는생산인수명령으로새22회귀를사용한다.

## 변경 파일과 모든 로컬 import 의존성
실제변경:
- game.html, game-easy-test.html (승인저장구역만).
- docs/15 세이브+데이터구조/15 세이브+데이터구조.md (현행보류/즉시배수/제한/생산검수동기화).
- docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md (담당인수상태동기화).
- BALANCE/production-integration-* (task외 before/manifest/회귀/evidence/docs검색/로그/receipt/result 신규산출).

| 생산회귀의 로컬 import | 역할/쓰기 |
|---|---|
| ./immediate-drain-candidate.mjs | 승인후보함수텍스트와일치 assert용, 읽기전용 |
| ./save-inflight-candidate.mjs | 위모듈의전이import: candidateSave 변환, 읽기전용 |
| ./immediate-drain-prior-before.mjs | 기존재500ms 후보비교, 읽기전용 |

로컬import목록은이3개뿐이다. node:test/assert/fs/vm/crypto/child_process는Node내장모듈. 데이터입력은두productionHTML, production-integration-before.json, production-integration-prior-hashes.json 및manifest에열거된이전산출이다. 기존하니스import없음. inline module의실제import/에셋은syntax만검사하여로드하지않았고게임의실행의존성전체를검수했다고주장하지않는다. 외부설치/서버/SDK접속0.

## 최종 SHA-256
| 대상 | SHA-256 |
|---|---|
| game.html | c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a |
| game-easy-test.html | 11b4e97b15903b9699b296362bdd068ffed6d3a1a505d9f6eeec5482b7c085ca |
| production-integration.test.mjs | 3f312e4d3b8476ddb7e1321c2f7776c8d6c9714cd5b948707efde5c5495984f6 |

원함수/새함수별raw SHA는evidence.json, before전체SHA/함수JSON은before.json에보존했다. 최종source재추출및byte보존assert통과. docs전체관련검색 production-integration-doc-search.txt,실제검사출력 production-integration-tests.txt.

## 미검수·root 인계
결과·receipt 완료 UTC: 2026-10-01T17:07:35Z.
실제서버/사용자저장/저장재실행/실브라우저/unload보장은 **미검수**다. 전달된ACK·메모리persist는fake경계이며실서버저장PASS로확대하지않는다. 500ms이전종료·전송영구대기·일반실패재시도·force-only기존잔여·demo공유악의/선택복원·같은identity변경후원복이력은이번범위밖이다.
공용총괄/CHANGELOG/Git add/commit/push·원격백업은root담당. 사용자tab1573846373 입력/리로드/닫기/계측0. UI/게임/서버/빌드/인코딩/설치/새세션/하위에이전트0. HTML소유반환후root검수·체크포인트대기.
