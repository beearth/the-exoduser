# ITEM — D13 저장 데이터 후보 경계 검토 1건

이 문서는 총괄 후속 배정 초안이며 작성만으로 담당 수신·Read·착수로 세지 않는다. 총괄1+전문11=12 운영에서 Claude native6은 ART/MAP/SKILL/QA/ENEMY/ANIM, Codex는 총괄+UIUX/ITEM/BUILD/BALANCE/SOUND다. 기존 ITEM project chat에서 한 건만 수행한다. 새 세션·하위팀0이다.

최신 운영 보충(최초 수신 전): 위 총괄1+전문11=12/6대6 문맥은 초기 배치 이력이다. 현재는 신규 보스전·스토리·퀘스트/NPC·유튜브/스팀 페이지관리4팀을 더한 **총괄1+전문15=16, Claude8/Codex8** 운영이다. 신규팀의 제공자/소유권 배정은 총괄이 관리하며 이 담당의 과제·허용범위는 늘어나지 않는다.

시작 전에 이 TASK의 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/ITEM/TASK.md`와 checkout의 실제 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001`(끝20261001)을 확인한다. 경로가 다르거나 symlink 해석으로 소유 경계가 바뀌면 쓰지 말고 총괄에 보고한다. **파일/폴더 삭제 명령0, 소유폴더 밖 write0, 임의 cleanup0**이다. 자기 소유 파일도 삭제/이동/정리하지 않는다. 상대경로 오타를 고친다는 이유로 다른 checkout이나 외부 경로를 수정·삭제하지 않는다.

checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 공유 작업 중이므로 다른 담당의 변경을 되돌리지 않는다. 기존 사용자 변경23항목(한글 백업22항목·BUILD 초안), 원담당 후보/근거, 기존 TASK 전부를 보존한다. 이 TASK는 immutable이다.

## 선행 인수·우선순위

`AGENTS.md`, `docs/7아이템디자인/유니크_어픽스_리스트.md` D13, `UNIQUE_TOP8_HOOK_REVIEW_20261001.md`, 저장 SSOT, `project-teams/ITEM/result.md`와 `evidence.json`을 읽는다. D13 callback32와 caller/lifecycle 지도22는 기존 완료로 인수하고 재실행하지 않는다. D13의 원본 생성/DOT/drain/clear·롤 공급·child payload 생산 연결은 없고 `runtimeReady=false`다.

이번 한 건은 **runtime 통합보다 앞서 필요한 D13 데이터 전용 binding 후보의 최소 schema 경계 검토**다. 미결 cap·겹침·payload·비동기 clear 정책은 그대로 둔다. 전투 후보를 새로 만들거나 실게임에 D13 효과를 켜지 않는다.

## 최소 data-only VM 후보

1. `unique-item-project/definitions.js`, `roll-values.js`, 기존 `tools/team-followup-20261001/ITEM/binding-d10.mjs`의 plain-data/schema 판정 방식을 읽는다. 기존 D10 검사/698롤 감사는 재실행하지 않는다. D13의 실제 정의/슬롯/롤 source SHA와 lookup 결과를 먼저 기록한다.
2. `uniqueId:'UI-13'`, slot=belt, `uniqueRoll:{version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue}`라는 **검토용 shape**를 checks.mjs 내부 VM에서만 비교한다. 이는 생산 schema의 확정/채택이 아니다. 정수20~40%의 기존 정규 저장단위0.20~0.40를 그대로 사용하고 raw 중복 저장·기본값 보충·새 RNG를 추가하지 않는다.
3. 최소 입력만 사용한다: 정규 경계0.20/0.40, missing binding/legacy 구분, 잘못된 slot 또는 effect/stat/unit/version, 비정규값0.205, 숫자 아닌 값, own enumerable data가 아닌 접근자1개. 접근자의 실행 횟수0과 입력/중첩 객체의 보존을 기록한다. 불필요한 조합 전수·fuzz·Proxy 보안 감사0이다. fromStoredValue의 기존 소수 검증을 재사용할 수 있으나 생성/재롤 API는 호출하지 않는다.
4. 유효 plain JSON을 한 번 왕복하여 값·identity 정보가 유지되는지 확인한다. restore는 같은 전달 객체/데이터를 보존하고 missing/invalid/legacy를 수리하지 않는다. cross-realm data를 후보가 다룰 때에는 realm 제약을 명시한다. VM 결과가 임의 Proxy/직렬화 hook의 실행 격리를 보장한다고 주장하지 않는다.

보고서 첫 결론은 검토 우선순위(신뢰된 새 생성/저장/장착 소비→source lifecycle/payload→runtime)와 생산 연결0이다. 기존 D13 callback을 호출하거나 새 데이터 shape를 원후보에 주입하지 않는다. 이 경계가 이미 검수됐거나 정당한 새 검사 근거가 없으면 read-only adoption/report와 fixture0/중복0을 허용한다.

## 소유·금지·결과

쓰기 소유는 `tools/team-followup-20261002/codex-half/ITEM/`의 **checks.mjs, result.md, evidence.json 최대3파일**뿐이다. TASK/기존 TASK 수정0, 추가 후보/patch/사본/로그/폴더0이다. 메모리 후보 코드·입력·trace는 이3파일 안에 넣는다. Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` 전체 경로를 쓴다. 허용한 pure data 모듈 외 생산 파일은 import/실행하지 않는다.

생산·공유 docs·원후보 변경0, Git 명령/인덱스/commit/push0, 서버/HTTP/실게임/앱/UI/청취/빌드/생성/새세션/하위팀0이다. 다른 채팅 메시지 전송·자동 다음 일감0이다. 기존23항목과 타 담당 WIP를 보존하며 Changes/HEAD/수신 시각은 총괄 제공 근거만 인용한다.

result.md에 id·한글명·슬롯·schema 필드·롤/단위·입력별 판정·수리/RNG/변이 횟수·대역·미검수 표를 작성한다. `proposal`, `runtimeReady=false`, `enabled=false`, `schemaAdopted=false`, `productionApplied=false`, `source/data fixture PASS ≠ runtime/visual PASS`를 명시한다. 코드 산출 후 docs 전체 관련 키워드 검색을 evidence에 목록/개수/SHA로 기록하고 정확한 docs 동기화 인계안을 총괄에 제공한다. 공용 문서/보호2_3 수정0이다. 결과와 최대3파일만 총괄에게 인계한다.
