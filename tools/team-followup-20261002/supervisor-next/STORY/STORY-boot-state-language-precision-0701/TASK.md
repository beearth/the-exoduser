# STORY 수정 피드백 한 건 — boot 상태·언어 예외의 정확한 계약

실제 checkout /Users/fordeargamers/Projects/exoduser-migration-20261001. 이 TASK/continuous COMMON/AGENTS/감독 STATE의 STORY 행을 먼저 실제 읽는다. 타인 변경을 되돌리지 않는다. 새 폴더 result.md/evidence.json 최대2파일만 작성. 이전산출/TASK/checks 수정0·검사/Node/fixture/새tests/UI/DOM/미디어/타이머 실행0·production/공유docs/기존tests/Git조회·쓰기/index/실게임/사용자게임/세이브/서버/빌드/삭제/이동/cleanup/권한/인증/설치/외부메시지/새세션/하위팀0. 보호2_3·Q전용 blackBean magic패링·어택티켓금지 유지. CH1-1 복귀/SOUND 통합은 root소유이며 중복 작업0. 맵 제작 범위 밖.

## 제한 인수

직전 exact TASK peer06:35:02.419Z/Read06:35:08.513Z → end_turn ef19701d-1866-495b-a515-a512224b79e0 06:50:19.275Z를 감독이 대조했다. data.languages 접근으로 boot IIFE가 throw하는 조건과, data/DOM이 정상이나 VTTCue가 부재하여 영화 시작 전에 throw하는 조건은 시점/입력 등록이 다르다는 정적 구분을 인수한다. native/API 실패·실게임/제품노출은 미실행 UNKNOWN, 후보채택 HOLD. 보존 legacy 식과 현행 영화 계약 분리 유지.

## 이번 한 건 — 이전 실행을 반복하지 않는 정정

직전 result/evidence, index.html, world-intro-subtitles.js 원문을 읽기만 하여 아래 내용을 새 두 파일과 root canonical 인계표로 정정한다.

1. index.html2119 boot IIFE가 throw하면 _worldIntroPlayer의 let 초기화2156, _cinReady의 let 초기화2225까지 실행되지 않는다. '초기 false/null 유지'가 아니라 이 let 바인딩들의 초기화문 미실행/TDZ다. 함수 선언 hoisting과 let 초기화 실행을 구분한다. 초기화 전 값을 직접 읽거나 DOM 실행하여 확인하지 않는다. 2114-2116 언어 select onchange 등 일부 입력은 먼저 등록되므로 '모든 입력 미등록' 대신 시네마틱 전용 핸들러 미등록이라고 한정한다.
2. getCurrentLanguage2040의 실제 순서는 query ?lang resolve → 저장 hellLang → Steam 감지 → browser 감지 → en fallback다. boot caller 표에서 query를 누락하지 않는다. 첫 throw라는 표현은 실제 확인한 호출/언어 입력 조건으로 한정하고 미확인 이전 caller를 계속 UNKNOWN으로 남겨도 된다.
3. world-intro-subtitles.js9-11의 early-return은 원시 문자열 zht/no 전부가 아니다. zh-(tw|hk|mo|hant)… → zht, ptbr/pt/pt-* → ptbr, nb/nn… → no 정규식이다. raw zht/no는 line13의 data.languages로 간다. raw별칭/정규화된 code/Steam매핑을 구분하는 표를 원문으로만 만든다. data가 없더라도 일부 query/저장/Steam/browser 입력은 boot를 통과하고 더 늦게 실패할 수 있으므로 모든 data누락=A부팅실패로 일반화하지 않는다. 두 지정 누락을 모든 언어·경로에서 반드시 반대 reachability라고 단정0.
4. addTextTrack 실제 호출은24행이고21은 normalizeLanguage다. setLanguage 인자의 getCurrentLanguage는2412에서 attach이후 evaluate되며, normalize→track조회→addTextTrack24→data.timings26→newVTTCue27 순서를 정확히 적는다. data가 없는 조건의 raw별칭/반환code에 따라 normalize의 languages 접근 또는 timings 접근이 먼저일 수 있음을 정적 조건으로 한정한다. 실제 native 실패를 재현했다고 쓰지 않는다.
5. showLine(0,false) 미기동과 onSubSkip 호출 횟수의 관계만 인계한다. '수동 탭13~18회'는 초기 _cinIdx=0에서 실제 onSubSkip 성공호출당 +1일 때 cue13/18이라는 조건부 산술이며, touch/click/keyboard/gamepad의 물리 입력 횟수를 검수한 값이 아니다. emptycue/언어전표/복사식7assertion/이전 route 검사 반복0.

관련 docs 전체 검색 결과의 경로/행과 현행·정정·UNKNOWN exact 문안을 root에 인계한다. 공유 docs 및 생산/Git는 root소유다. 29×32 영화/28키 CIN/KO·비KO/언어목록/미디어/DOM 계약은 변경하지 않는다. SOURCE 전체SHA/읽기시각과 task Read/최종 end_turn 시각을 혼합하지 않는다. 감독이 기존UUID의 peer/Read/end 및 소유파일을 직접 읽으므로 SendMessage/주소요청/relay0.

Changes80이면 root checkpoint,100 전에 신규산출중단. 자신의2파일로 전역 임계 판단0. 한 건 완료 후 한국어 보고하고 추가 업무 자율 생성0.

