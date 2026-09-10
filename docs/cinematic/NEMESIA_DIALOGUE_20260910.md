# 네메시아 구원 대상 대사 개정 — 2026-09-10

사용자가 승인한 네 문장을 INTRO ID5에 그대로 적용했다. 피로 물든 복수 뒤에도 남은 선의를 지적하고, 구해야 할 이를 상기시킨 다음 늦기 전에 움직이라고 재촉한다. 구원 대상의 이름·생사·새로운 시간 제한은 추가하지 않는다. 다음 목마 낙하 장면으로 이어지는 기존 순서를 유지한다.

## 승인 한국어

> 그토록 피를 묻히고도, 네놈 안의 선의는 아직 남아 있구나.
> 네가 구해야 할 이가 누구인지… 잊지는 않았겠지?
> 아직도 너를 기다리고 있다.
> 서둘러라. 너무 늦기 전에.

## 적용 계약

| 항목 | 값 |
|---|---|
| 원문 위치 | game.html,INTRO_CUTSCENE_LINES.ko,id5 |
| 화자 / 이미지 | GODDESS(표시명 네메시아) / 03.png |
| 문장 배치 | 4문장 단락,명시적 줄바꿈3개 |
| 기존 메타데이터 | t8500,dur5000,text_cfg.reveal=char,speed60ms/문자 유지 |
| 실제 진행 | 대사 있는 INTRO 컷은 전체 표시 후 입력 대기. dur5000으로 강제 종료하지 않음 |
| 다음 컷 | id6,04.png,목마 낙하,wood_horse_drop 유지 |
| 번역 원본 | localization/character-story/28개 언어.json의 intro.5만 수정 |
| 인라인 폴백 | INTRO_CUTSCENE_LINES.en/ja/zh의 id5도 동일 의미로 교체 |
| 번들 | tools/build-localization.mjs로 localization-data.js 재생성 |
| 게임 번들 URL | localization-data.js?v=20260910-nemesia-dialogue |
| 음성·음악 | 이 대사에 새 더빙 추가 없음. 기존 네메시아의 강림 V3 유지 |
| 검증 | localizationRuntime/localizationCoverage/characterStorySubtitlePosition 기존12개 PASS |
| 실제 화면 | tools/verify_nemesia_dialogue.py:승인 한국어 일치,28개 번역의 원본·번들 일치,29언어 줄바꿈 후 문자 보존·세로 범위,입력 대기·목마 컷 진행 PASS |
| 증거 | output/cinematic/nemesia_dialogue_20260910/qa.json 및 korean_dialogue.png |
| 검수 범위 | 1280×720 한국어 화면 직접 확인. 다른 언어는 구조·배치 검사이며 원어민 감수 완료를 의미하지 않음 |
