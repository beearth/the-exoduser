# UIUX — 분리된 이전 스킬 카드 콜백 수명 검수 1건

이 문서는 총괄의 후속 배정 초안이다. 파일 작성은 담당의 수신·Read·착수 근거가 아니다. 총괄1+전문11=12 운영에서 Claude native6은 ART/MAP/SKILL/QA/ENEMY/ANIM, Codex는 총괄+UIUX/ITEM/BUILD/BALANCE/SOUND다. 기존 UIUX project chat에서 이 한 건만 인수하며 새 세션·하위팀을 만들지 않는다.

최신 운영 보충(최초 수신 전): 위 총괄1+전문11=12/6대6 문맥은 초기 배치 이력이다. 현재는 신규 보스전·스토리·퀘스트/NPC·유튜브/스팀 페이지관리4팀을 더한 **총괄1+전문15=16, Claude8/Codex8** 운영이다. 신규팀의 제공자/소유권 배정은 총괄이 관리하며 이 담당의 과제·허용범위는 늘어나지 않는다.

시작 전에 이 TASK의 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/UIUX/TASK.md`와 checkout의 실제 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001`(끝20261001)을 확인한다. 경로가 다르거나 symlink 해석으로 소유 경계가 바뀌면 쓰지 말고 총괄에 보고한다. **파일/폴더 삭제 명령0, 소유폴더 밖 write0, 임의 cleanup0**이다. 자기 소유 파일도 삭제/이동/정리하지 않는다. 상대경로 오타를 고친다는 이유로 다른 checkout이나 외부 경로를 수정·삭제하지 않는다.

작업 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이다. 기존 사용자 변경23항목(한글 백업22항목과 BUILD 초안)을 보존하고 타인의 변경을 되돌리지 않는다. 이 TASK와 기존 project-teams/owner-dispatch/claude-provider TASK는 immutable이다.

## 선행 인수와 이번 차이

먼저 `AGENTS.md`, `docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md`, 해당 스킬 UI/자원 SSOT, `tools/team-followup-20261002/project-teams/UIUX/result.md`와 `evidence.json`을 읽는다. 기존 인벤토리 재렌더→분리된 이벤트 타깃→defaultPrevented 공통 guard의 source16 RED/후보16 PASS는 인수하고 재실행하지 않는다. `candidate.patch`는 읽기 전용이며 생산 미적용 이력을 유지한다.

이번에는 **renderSkillPanel이 만든 이전 스킬 카드의 보관된 '+' 콜백이 카드 제거 뒤 실행되는 수명 경계** 한 건을 검수한다. 실제 source의 `slv=P.skills[sk.id]||0`, `learned=slv>=1` 캡처, `_skClick`, '+' handler 연결, grid 재구성 경계를 정확히 추출한다. 기존 인벤토리 guard 후보를 스킬 카드 수명 수정으로 간주하지 않는다.

## 최소 source fixture

1. 본편/easy의 해당 함수·캡처·handler 구간에 현재 행/원문 SHA를 남긴다. 전체 HTML 사본·대형 DOM fixture를 만들지 않는다. 가능하면 기존 작은 DOM 대역을 읽기 전용 import하고, 없는 동작만 checks.mjs 안에 최소로 둔다.
2. 실제 SK 데이터에서 미습득 일반 스킬1개를 고른다. 두 번의 원래 학습 비용을 보유한 합성 P/G를 만들고 원래 비용·슬롯 계산을 사용한다. 학습/강화 수치를 임의로 낮추거나 fake `_skClick`으로 치환하지 않는다. 생성 때 `learned=false`인 이전 카드 '+' 함수 참조를 보관한다.
3. 연결된 현재 카드의 정상 첫 호출→재렌더로 이전 카드 detached→보관한 이전 콜백 직접 재호출 순서를 실행한다. lv/SP/mats/슬롯/저장·렌더 호출 전후를 기록한다. 직접 콜백 호출은 **합성 수명 fixture**이며 네이티브 사용자가 detached 카드를 클릭했다는 실측이 아니다. 결함이 없으면 그대로 보고한다.
4. 수명 결함이 재현될 때만, 이전 카드의 연결/현재 render 소유권을 확인하는 최소 가드를 메모리 source 후보로 비교한다. 연결된 정상 콜백은 원래 효과·비용·RNG를 유지하고 detached 콜백은 효과0이어야 한다. 후보는 checks.mjs 내 원문 변환/fragment와 evidence에만 저장한다. 별도 patch·candidate 파일·생산 적용0이다. P 교체·비동기 reset 등 다른 수명 이슈로 확대하지 않는다.

새 검사는 이 한 시나리오의 양판 source와 메모리 후보 대조만 허용한다. 이미 같은 경계가 선행 근거에 있거나 정당한 새 반례가 없으면 read-only adoption/report, fixture0/중복0으로 완료한다. 기존16을 새 검사 수에 합산하지 않는다.

## 소유·검수·보고

담당의 쓰기 소유는 `tools/team-followup-20261002/codex-half/UIUX/`의 **checks.mjs, result.md, evidence.json 최대3파일**뿐이다. TASK.md 수정0, 추가 폴더/로그/사본0이다. 필요한 대역/후보는 checks.mjs 안에, 입력·trace·실패 이력은 evidence.json 안에 둔다. 지정 Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`다. 생산 모듈을 import하여 부트하지 말고 원문을 추출해 VM/작은 DOM 대역에서만 실행한다.

생산·공유 docs·원담당 산출 쓰기0, Git 명령/인덱스/commit/push0, 서버/HTTP/실게임/앱/UI입력/오디오/빌드/생성/새세션/하위팀0이다. 기존 팀 채팅으로 메시지를 보내거나 다음 일감을 생성하지 않는다. Changes는 총괄의 관측만 인용하고 시각/수신/HEAD를 추정하지 않는다.

result.md에는 id·한글명·조건·현행 비용/슬롯·적용 함수/행/SHA·source/후보 효과·대역·미검수 항목을 표로 적는다. `source fixture PASS ≠ runtime/visual PASS`, `productionApplied=false`를 명시한다. 코드 산출 후 docs 전체 관련 키워드 검색의 문서 목록·개수·출력 SHA와 정확한 동기화 인계안을 evidence/result에 넣고 공용 문서 수정은 총괄에게 맡긴다. 입력 SHA 전후 보존과 자신의 최대3파일을 확인한 뒤 결과만 총괄에 인계한다.
