# BALANCE 저장 보류분 생산 반영 — UIUX 완료 후 순차 실행

이 파일을 전달받은 시점에 root가 UIUX 생산 반영 검수와 원격 체크포인트를 마치고 두 HTML의 저장 구역 단독 소유권을 넘긴다. 전달 전에는 시작하지 않는다. 기존 immediate-drain 17 PASS 후보와 QA busy-save-independent 반례를 읽고 game.html/game-easy-test.html에 적용한다.

허용: dbSaveNow의 보류 요청/컨텍스트 보호, _drainPendingSaveNow helper, 세 _saving=false 종료 지점의 drain 호출. 기존 후보 대비 helper dbSaveNow→dbSave 1줄이지만 생산 대비는 총 4hunk/HTML임을 정확히 기록. 일반500ms, force최소5초, 비용/RNG, 저장 schema 유지. 실제 캐릭터/플레이어/저장 함수 교체시 오래된 요청 폐기. pending은 호출 전 소비하여 재귀/중복 방지. UIUX 인벤토리 구역은 수정 금지.

생산 소스에서 매번 추출해 실행하는 production-integration 회귀검사 작성. busy 완료 직후 추가500ms 없음, dispatch/ACK/persist 분리, 성공/실패/두 번 busy/중복drain/force 상호작용, 캐릭터/함수/DB 교체, 5개 저장 분기, 두 HTML 검수. 이전 원본 RED 검사와 후보 파일/증거 byte 보존. 필요하면 별도의 production-integration fixture로 예전 함수 보관하여 이전 검사의 전제 변경을 문서화. 실제 서버/사용자 save 접근 없음. 두 HTML inline script 구문검수.

AGENTS, BALANCE master, 저장 SSOT 먼저 읽고 docs 전체 관련검색 후 관련 SSOT 현재 생산 반영상태 동기화. 공용 총괄/CHANGELOG는 root 담당. tools/team-followup-20261001/BALANCE/production-integration-*에 실제 UTC receipt, 결과/변경 파일 목록, 검사 명령, 모든 로컬 import 의존성 목록 작성. Git add/commit/push는 root 담당. UI/게임/빌드/인코딩/새 세션/하위 에이전트 생성 금지.

완료 후 HTML 소유권 root에 반환하고 더 편집하지 않는다. 실제 저장/재실행/unload 보장은 별도 미검수로 명시하며 한국어로 보고.
