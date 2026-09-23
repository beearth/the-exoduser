# 전체 시네마틱 Space 홀드 스킵 — 2026-09-14

Space 홀드가 빠져 있던 전사 스토리 및 시작 안내 4컷에 연결했다. 네메시스/구 전쟁 컷신은 자동 진행·퇴장 컷에서 렌더 함수가 먼저 반환하여 홀드 검사를 건너뛰던 경로를 수정했다.

| 구간 | Space | 홀드 시간 | 종료 |
|---|---|---|---|
| FDG 로고·타이틀 | 기존 아무 키 즉시 스킵에 포함 | 대기 없음 | 기존 다음 화면 |
| 지옥문·세계관 영상 | 첫 누름 다음 컷, 계속 누르면 전체 스킵 | 기존 5000ms | `skipToGate`, 영상/BGM 정리·로비 연결 |
| 전사 생성 스토리 | 첫 누름 다음 대사, 계속 누르면 전체 스킵 | 기존 전체 스킵 기준 1200ms | `finish(true)`, 영상 제거 후 생성 캐릭터 진입 |
| 구 전쟁 PRO·네메시스 INTRO | 계속 누르면 해당 시퀀스 스킵 | 기존 2000ms | `_cutsceneEnd`; PRO→INTRO→시작 안내 순서 유지 |
| 기상 대사·키 안내 4컷 | 첫 누름 다음 컷/포커스 버튼 실행, 계속 누르면 나머지 전체 스킵 | 2000ms | `_finishIntroGuide`, 기존 커튼·스폰 |

| 구현 | 계약 |
|---|---|
| 전사 키 입력 | `keyboard-Space`, `keyboard-Escape` 독립 Set 항목. 키 반복은 대사를 연속 이동시키거나 홀드 시작을 갱신하지 않음 |
| 전사 취소 | 해당 키 해제, 기존 blur/visibilitychange 취소. 다른 입력 소스의 홀드는 유지 |
| 전사 안내 | KO `Space / Esc / B 길게`, 그 외 `hold Space / Esc / B`. 기존 3초 이후 안내 숨김 유지 |
| 시작 안내 시간 | `spaceHeldAt`의 performance.now 경과시간 /2000, RAF에서 확인. 버튼 배경 linear-gradient로 진행률 표시 |
| 시작 안내 취소 | Space 해제·창 blur·visibilitychange에서 `spaceHeldAt=null`, 버튼 배경 초기화. 종료900ms 후 키/포커스 이벤트 모두 해제 |
| 캔버스 컷신 | `_renderIntroCutscene` 진입 직후 홀드 검사. 자동 컷·퇴장 페이드의 조기 반환에도 스킵 가능. 100ms 델타 상한·첫16.67ms 보정 유지 |
| 세계관 안내 | 홀드 게이지 중앙 키보드 표기 `SPACE / ESC`, 패드는 기존 `Ⓑ` |
| 캐시 | index의 `character-story-player.js?v=20260914-space-hold` |
| 검증 | 관련 테스트51개 통과: 양쪽 HTML 시작 안내·자동 퇴장 컷, 전사 키 홀드/해제/반복·미디어 정리, 세계관 BGM/스킵 및 생성 연결 |
| 브라우저 | 로컬 Chrome에서 DOM KeyboardEvent 주입으로 전사1300ms 후 overlay 제거, 시작 안내2200ms 후 done/숨김, 세계관 홀드 후 완료·영상 pause 확인. 실제 물리 키 연속 입력 검증은 별도 |

기존 클릭·Enter·Escape·패드 조작과 영상·음성·저장 흐름은 유지한다. 보스의 실시간 전투 동작·기술 연출은 별도 시네마틱 재생기가 아니다.
