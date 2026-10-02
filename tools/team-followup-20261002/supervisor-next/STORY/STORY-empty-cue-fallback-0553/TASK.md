# STORY 후속 — 빈 세계관 cue의 legacy 자막 선택 경계

작업 ID: STORY-empty-cue-fallback-0553. 실제 checkout: `/Users/fordeargamers/Projects/exoduser-migration-20261001`.

먼저 이 TASK, `continuous/COMMON.md`, AGENTS.md, 담당표, 해당 내러티브/자막 SSOT를 실제 읽는다. 다른 담당과 공유 중이므로 타인 변경을 되돌리지 않는다. TASK는 감독 소유 read-only. 새 쓰기는 이 폴더의 result.md/evidence.json 및 의미 있는 source 경계용 checks.mjs, 최대3파일만 소유한다. 생산 코드, 공유 docs, 기존 산출/테스트, Git 조회·stage·commit·push, 게임/세이브/서버/실제 UI, 빌드/설치/계정/권한/게시/외부 메시지/새 세션·하위팀/파일 삭제·이동·cleanup은 하지 않는다. 보호2_3 및 캐릭터 LOCK 유지, 이미지/음성/영상 생성·수정0.

제공 checkpoint `6c2dadab0b3a81a600e8358f485518cfcb122199`는 총괄의 2026-10-02T05:53 전후 원격 SHA 검증값이다. 독립 현재 HEAD로 쓰지 않는다. 생산 source는 총괄이 순차 통합하므로 실제 읽기 시각/전체·fragment SHA를 기록하며, 이전 source pin을 역사값으로 보존한다. Node 실행은 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`만 사용한다. 소유 코드 산출 뒤 docs 전체 관련 키워드를 rg로 검색하고, exact 수치·표·변수·적용 위치·미검수 상태를 root용 canonical 인계 문안에 기록한다. 공유 docs/Git 반영은 root가 한다. Changes는 감독 추적:80부터 root checkpoint,100 전에 새 산출 중단. Git 재조회0. 완료하면 한국어로 한 건만 보고하고 추가 업무를 만들지 않는다.

## 인수 피드백

continuous/STORY의 CIN20/텍스트 cue17 전표는 source 정적 결과로 인수했다. `_CIN_I18N` 전체를 dead라 부르거나 inline28언어 키 존재를 번역 품질 PASS로 확대하지 않는다. 실제 수신은05:36:40.856Z, exact TASK Read 성공05:36:44.420Z, 실제 완료 end_turn05:48:43.193Z다. 앞선 approximate05:33/05:42는 정정 대상 이력이며 기존 보고서는 수정하지 않는다. runtime49 moves 주장은 BOSS의 defs59/usable58/reserved cage와 구분하며 이번에 보스 계약을 다시 조사하지 않는다.

## 다음 한 건

index.html의 실제 resolver는 비한국어에서 `line[lang] || _CIN_I18N[lang][idx] || line.en || line.text`다. cue13/18의 inline 키는 빈 문자열이고 lobby_i18n.js의 해당 idx에는 옛 전사 대사가 있다. **의도적으로 빈 cue와 번역 키 누락이 구분되는지**만 조사한다.

실제 CIN_LINES, legacy `_CIN_I18N`, 지원 언어 목록, resolver fragment를 읽고 cue13/18의 지원 언어별 truthiness/선택 출처/최종 문자열을 표로 기록한다. 실제 present empty가 legacy 텍스트로 살아나는 반례와 정상 nonempty cue1개 및 누락 ms 폴백1개를 같은 실제 resolver로 실행한다. DOM/타이머/미디어/전체 cinematic 실행은 범위 밖이며 결과를 실제 화면 PASS로 부르지 않는다. 한국어와 비한국어 선택 규칙을 임의로 합치지 않는다.

반례가 입증되면 own inline 키가 존재하고 값이 문자열인 경우 빈 문자열도 존중하며, 키 누락 시 기존 legacy→en→text 선택 순서를 유지하는 최소 메모리 후보를 인계한다. 현재 SSOT의 빈 cue 의도를 읽어 근거를 제시하고, 번역 내용·cue 수·v/dur/img·skip·음성·BGM·로어·언어 목록·DOM 구조는 바꾸지 않는다. 기존 전표/전체 번역 품질/hold skip 검사 반복0. `productionApplied=false`, 실게임·자막 렌더·영상·음향 Gate 미검수. 다른 계약에서 결과가 충돌하면 UNKNOWN/HOLD로 보고한다.
