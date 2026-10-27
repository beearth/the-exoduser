# Mac 전사 이야기 자연완주 → 시작 안내 QA — 2026-10-27

## 판정

| 항목 | 관찰·수치 | 판정 |
|---|---|---|
| 정본 영상 | `warrior_story_v23_clean.mp4`, 97,796,468 B, SHA256 `277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34`; 소스와 QA 앱 내 파일 일치 | PASS |
| 일반 생성 | 별도 표시된 QA output에서 로비 `N` → 전사 외형 0 → 한글 이름 입력 → 생성. 이름 `자연완주`(기존 최종 Settings QA 앱) 및 `재생검수`(추적 빌드) 각각 새 로스터 revision 1, selectedIndex 0, names 1개 | PASS |
| 전사 영상 | 생성 직후 자동 시작, 키 입력 없이 끝 구간까지 재생. 추적 빌드 로그의 시간은 4.933→95.000초 연속 증가, duration 96.400초. `WARRIOR_STORY_END_FALLBACK` 0회 | PASS |
| 전사 영상 다음 화면 | 원래 QA 앱에서 끝 구간의 보라색 네메시아 화면을 전사 영상 정지로 오판했다. 이는 별도 27라인 입장 시네마틱의 대사 화면이다. 추적 빌드도 같은 경로로 네메시아 첫 대사에 진입 | PASS |
| 시작 안내 | 입장 시네마틱의 대사만 Return으로 순서대로 진행하고, 무대사 컷은 자동 진행. 첫 안내 `1 / 4`, `눈을 떠`, `이동과 공격` 화면을 1280×720에서 캡처 | PASS |
| 중복·오류 | 각 QA 루트에 생성된 이름 1개/revision 1. 전사 영상 재시작·중복 생성 관찰 없음. Player 로그에 재생 오류·예외 없음. AVFoundation color primaries fallback 경고만 있음 | PASS |
| 청각 | 실제 청음/오디오 파형 측정은 이번 검수에서 하지 않음 | HOLD |

두 번째 빌드는 Unity 6000.6.7f1 ARM64 Settings QA, 빌드 1회 성공·오류 0이다. 영상 종료 진단용 임시 시간 추적·정지 대체 분기를 넣었지만 대체 분기는 **실행되지 않았다**. 별도 네메시아 화면을 영상 정지로 오인한 것을 확인한 뒤 임시 코드를 백업 원본과 같은 바이트로 복원했다. 제품 Runtime/Core/save/media 최종 변경은 0이다. 기존 638개 자막 정적 대조나 과거 통과 suite는 재실행하지 않았다.

일반 생성과 전사 영상 경로는 직접 QA 진입이 아니다. 두 번째 실행의 로비 진입은 세계관 영상을 다시 기다리지 않도록 첫 격리 QA 설정의 `cinSeen:true`만 새 루트로 복사한 **QA 직접 진입**이며, 로스터는 새 빈 루트였다. 첫 실행은 기존 QA 앱에서 타이틀·정본 세계관 영상·로비를 거쳤다. 사용자 앱 PID 38141/48476/52157 및 일반 저장·미디어는 건드리지 않았다.

## 증거

- 첫 일반 실행 QA 루트: `_out/UNITY-MAC-A05-IO-WARRIOR-NATURAL-20261027/` (`story-first.png`, `story-middle.png`, `story-late.png`, `story-final-window.png`, `after-story.png`, `story-end-or-gate.png`, `player.log`). `after-story.png`의 보라색 네메시아 대사는 입장 시네마틱 시작이며 영상 고착이 아니다.
- 두 번째 추적 QA 루트: `_out/UNITY-MAC-A05-IO-WARRIOR-NATURAL-FIX-20261027/` (`story-first.png`, `story-tail.png`, `story-after-end.png`, `first-guide.png`, `player.log`). `story-tail.png`와 `story-after-end.png`는 이미 입장 시네마틱 화면이다.
- 빌드 영수증: `_out/UNITY-MAC-WARRIOR-NATURAL-FIX-20261027/build-receipt.json`. 임시 소스 전·후 비교와 Unity 자동 생성 파일 복구 자료는 같은 `_out` 루트에 보존했다. QA PID 46395/46673은 종료했다.

전사 자연 종료 뒤 `FrontendEntryFlow.Nemesis`는 음성 대사에서 사용자 입력을 기다린다. 따라서 전사 영상의 자연완주와 시작 안내로의 자동 직행은 별개다. 시작 안내는 이 대사를 정상 진행한 뒤 열린다.
