# 최신 웹 스킬 창 기준 캡처 PC-U05REF (PC, 2026-10-26)

- 이미지: `skill_web_fab7a167c_20261026.png` (1920×1080, 1x).
- 웹 기준: `G:/exoduser` 작업 폴더의 `game.html`·`skill-forge.js`·`skill-forge.css`가 `fab7a167c`(스킬 창 중앙 탈착)와 diff 0인 상태에서 찍었다.
- 방법: `cap_skill_web_20261026.cjs`. 헤드리스 Chrome, 음소거, 격리 프로필, 격리 save dir 서버(포트 3401). `game.html?test=1&slot=demo&demo=1`로 새 캐릭터 진입 → 레슨 건너뛰기 → K.
- 첫 실습 대사가 떠 있는 동안에는 웹도 K 키로 스킬 창이 열리지 않았다. 그래서 게임 함수 `togglePanel('skillPanel')`로 열었다. pageerror는 0건.
- 화면 구성: 상단 공통 탭 5개(설정/인벤토리/대장간/스킬/능력치), 제목판 "전투 스킬", 13키 원형 슬롯(1~4·F·Z·LMB·RMB·SHIFT·E·Q·CTRL·SPACE), 왼쪽 선택 스킬 상세(강화+/강화−/리셋, SP·악의·LV 줄), 가운데 합성 제단 원판(왼쪽 장착 스킬, 오른쪽 모체 후보), 오른쪽 합성 로드맵, 아래 버튼 3개(닫기/일괄 레벨업/추천 자동).
- 이 캡처는 기준 자료만 남긴다. Unity 구현은 U-05 결정 뒤에 진행한다.
