# 네이티브 알림·레벨업 피드백 — P2-009a

원본·수치·연결의 단일 기준은 [FDG_P2_009A_FEEDBACK_20261020.md](../engine/FDG_P2_009A_FEEDBACK_20261020.md)다. 이 문서는 UI 폴더의 인계 링크이며 UI_FOUNDATION/UI_COMPOSITION 자체의 확정 디자인을 변경하지 않는다.

| 대상 | UI 계약·남은 것 |
|---|---|
| showPH | 원본 game.html 679~680·43609: 화면 중앙/bottom180, 전환 .1s, 기본500ms/레벨업2500ms, currentColor glow25px. 기존 HUD 자식, mouse ignore. 원문·번역 기존0338/0339/0340/1044/1049·동적1523 보존 |
| 레벨업 | game.html 43159~43167, level-up-vfx.js 69~131: LEVEL UP!·Lv. N, 인간/악마 색 분기·3초 VFX/3.5초 라벨. SP/AP·+N은 원본54833~54839 일반 모드 whitelist에 따라 비표시(새 예외 없음) |
| 글꼴 | 현재 기존 NotoSerifKR 재사용. 원본 나눔명조/Cinzel 에셋은 P2-007a 소유로 미수정. 글꼴·래스터 완전 동일 판정은 보류 |
| 실제 창 | 1920×1080 AMD RX9070XT 실제 창의 OS 캡처 및 1x 크롭을 직접 확인. G:/exoduser-wt/_out/P2-009a-pc/visual-first, visual-glow. viewport readback도 별도 보존. 정상 무개입 플레이 증거 아님 |
| 판정 | **RETOUCH**. 알림 위치·색·가독성/빛기둥을 확인했으나 글꼴 인수·원본 픽셀 동등성·수동 전투·장비 줍기 통합은 남음. headless 수치 통과를 visual PASS로 대체하지 않음 |
