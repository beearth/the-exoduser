# DEMO11-42 — RETOUCH 후 현재 native HUD owner 표시

2026-10-21 Mac 총괄749d0c6e RETOUCH 지시를 적용했다. 보스 HP bar는 PASS 블록 byte 그대로, Main/State/전투/저장 writer 변경0. 현재 범위·검증은 [보고서](../engine/orders/reports/demo11-42_REPORT.md) 맨 위 재제출 절을 따른다.

오른쪽 구슬은 원본 game.html2640–2665/60300–60305의 독립 반구 규칙이다. 왼쪽 MP=실제 State mp/mmp 파랑(#0c2244→#3388cc,라벨#88bbff), 오른쪽 ST=실제 player st/mst 초록(#0c3322→#2a8844,라벨#88dd88). 레거시 웹 SP 문자는 이번 사용자 지시와 HUD 리디자인의 ST 명칭에 따라 ST로 교정해 성장 SP와 구분한다. MP owner를 읽을 수 없거나 수치가 비유효하면 MP label/value를 숨기고0fill, 개발 문구나 가짜 기본값을 보이지 않는다. 값은 소수 부분을 원본 ~~처럼 버려 표시한다. 자원 writer/자동회복/비용 수식 변경0.

기존640×62 상시 검은 정보 띠 및 중복 ST/MP/SP/악의 행은 삭제했다. 선택 정보는 원본 #skBarTip(705–708) 표면/선/둥근 모서리/그림자를 재사용한320×40 hover/요청 후2.5초 툴팁이다. 실제 선택/쿨은 기존 slot_rules/cooldown owner를 읽고 유휴 시 숨긴다. 새로운 자원 요약 UI를 추가하지 않으며 diagnostic snapshot의 자원 값은 UI가 아니다. 실패는 플레이어용 일시 toast, 미연결 실행기는 사용 불가/지금 사용할 수 없습니다.로 표시한다. 구현 사정·연결 대기·미이식 문구는 게임에 노출하지 않는다. UI 입력 통과/기존 슬롯 배치·창 유지.

폰트는 기존 hell/cinzel_hell 토큰, 기본 산세리프/이모지/새 이미지0. source HUD 골격·보스 title hell_title은 유지한다. 새 문구는 번역대상_전체목록에 KO/EN 등록했고 다국어 완성을 주장하지 않는다. 기존8 dispatcher 슬롯 대상이며 키 변경·보호 전투 스킬 실행·스킬 창 배치 변경0.

최신3뷰+1x는 `_out/demo11-42/captures/`(오른쪽 구슬 전용 크롭 포함). 최초 자체 PASS는 Mac 총괄 RETOUCH로 대체됐으며 이번 수정도 재눈검수 대기다.
