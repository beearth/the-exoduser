# UNITY M1 — 지역 4분할 화면 후속 (배너·방향 화살표·게이트 라벨·진행바) — 2026-10-28

배정: 유니티 총괄(local_59ad835c) → PC Sonnet 단순작업. 판정 = 맵 총괄(local_9d17d95b), 병합 = 유니티 총괄.
선행: R-A(`UNITY_M1_REGION_RA_20261028.md`)가 규칙(Core)과 최소 HUD(진행바 N/4, 봉인 문구)를 `unity/main`에 넣었다. 이 문서는 R-A가 UI 후속으로 넘긴 화면 4종이다.
정답: 웹 `origin/main` game.html (줄 번호는 10-28 기준). UI는 웹 그대로. Core(`Runtime/Core`)는 바꾸지 않았다(읽기 전용 값만 사용).

## 1. 웹 원본 ↔ Unity 대응

| 항목 | 웹 | Unity |
|---|---|---|
| 지역 진입 배너 | `_regionBannerShow` 61009, CSS `#regionBanner` 349~361, 마크업 2689, 진입 판정 `_regionTick` 61045 | `NativeRegionHud.OnTick/ShowBanner/DrawBanner` |
| 지역 정화(클리어) 배너 | 같은 함수 `purge=true`, 트리거 `_regionCheckClears` 61032 (n<4일 때만) | `OnTick`이 Core가 켠 `Cleared`를 이전 값과 비교해 호출 |
| 방향 화살표 | `_regionArrowTarget` 61064, `_drawRegionArrow` 61138, `img/ui/region_arrow.png`, 안전영역 `_raMeasureSafe` 61097 | `ArrowTarget/DrawArrow`, `Resources/Art/ui/region_arrow.png` |
| 게이트 월드 라벨 | 출구 포탈 위 `"▼ 지옥문 봉인 (지역 N/4) ▼"` 52255~52271 | `DrawGateLabel` |
| 진행바 N/4 | `#stageProgress/#stageProgressFill` CSS 375~376, 갱신 60602 | `NativeFieldHud.DrawClock` (그라데이션 + 0.6s ease-out) |

## 2. 웹 실측 값 (1920×1080, 라이브 DOM `getBoundingClientRect`)

| 요소 | 값 |
|---|---|
| 배너 상자 | x650 y302.39 w620 (top 28%, width min(64vw,620)) |
| 한글 줄 | h28, 20.8px, letter-spacing 3.328px(.16em), `Cinzel Decorative`→Nanum Myeongjo, rgba(223,214,194,.92) → 줄 중심 = 상자 top+14 |
| 영문 줄 | y+32 h14, 10.56px, ls 3.379px(.32em), rgba(168,153,127,.72) → 중심 +39 |
| 보조 줄 | y+52 h19, 15px, ls 2.7px(.18em), rgba(219,208,190,.92) → 중심 +61.5 |
| 보석 | 6px 마름모(회전 45°), 한글 줄 좌우 12px 여백 → 글자 양끝에서 15px, 중심 y +14.1 |
| 정화 배너 | 한글 줄 rgba(233,216,180,.96), 보석 #d8b778, 번쩍임 340×56 radial(.22→.1→0) 1.4s |
| 애니메이션 | 2.7s ease-in-out: 0% {0, -12px, blur4} · 12~72% {1, 0, 0} · 100% {0, +6px, blur2} |
| 속성 보석 색 | 지역 0 북서·어둠 #9933cc / 1 북동·번개 #ffee00 / 2 남서·물 #3388ff / 3 남동·불 #ff5522, 채도 `_raDesat`(60% + 뼈회색 40%) |
| 화살표 | 원화 280×139를 너비 96으로, 끝점 x=40, 펄스 .72±.16, 뒤 글로우 blur 9px 색 채움(2회), 라벨 Nanum 700 14px + Cinzel 12px 거리(1m=64px), 흑색 8방향 오프셋 |
| 진행바 | 트랙 2px(rgba(0,0,0,.45)), 채움 linear-gradient(90deg,rgba(112,96,73,.34),rgba(183,166,129,.8),rgba(112,96,73,.34)), width 0.6s ease-out |
| HUD 회피 영역(화살표) | 시계 아래 +12, 스킬바/HP·MP 구슬 위 -12, 미니맵(8,8,141×141), 목표 패널(1684,16,216×153.4) |

## 3. 웹과 다르게 한 점 / 발견

| 항목 | 내용 |
|---|---|
| **웹은 게이트 떠다니는 문구를 화면에 그리지 않는다** | `addTxt('지옥문이 봉인됨 — 지역 클리어 N/4')`(웹 42106)는 55092~55100 화이트리스트(시전/그로기/무적/CRIT/사망/탈출) 밖이라 테스트베드(`_btActive`) 밖에서는 숨겨진다. Unity R-A는 이 문구를 띄웠으므로 `GateSealed`·`GateAnglerBlocked`의 월드 텍스트를 제거해 웹과 맞췄다(이벤트는 로그용으로 유지). 플레이어가 보는 것은 포탈 위 `▼ 지옥문 봉인 (지역 N/4) ▼` 라벨뿐 |
| 게이트 라벨 서체 | 웹은 `bold 13px "Noto Sans KR"`. 작업 규칙(산세리프 금지)에 따라 Nanum Myeongjo(굵게)로 그렸다 |
| 영문 줄 서체 | 웹 `Cinzel`(일반) — Unity에는 `CinzelDecorative-Bold`만 있어 그것을 쓴다 |
| CSS blur()/drop-shadow() | IMGUI에 없어 오프셋 복사 8방향으로 근사 |
| 펫 대사·SFX | `한 지역 클리어! 미니맵에서 다음 지역을 확인해.`(펫 대사)와 `SFX.magic(1)`은 펫·해당 SFX 미이식이라 연결하지 않았다 |
| 앵글러(R-B) | 화살표의 앵글러 분기와 배너 보조 줄 `앵글러 생존`은 `RegionFbAlive`를 읽는다. 앵글러 위치는 R-B 전이라 `_FB_SITES` 좌표(사이트)를 쓰며, R-B가 실제 위치를 노출하면 그 값으로 바꾼다 |
| 미니맵 보조(클리어 지역 틴트·자물쇠 `_mmRegOvlEnsure`, 봉인 표기 52271 미니맵) | 이번 범위 밖(미니맵 세션) |

## 4. 검증 (아래 §5에 결과)

- 캡처 하네스: `--unity-region-hud-capture -output <dir>` (`NativeGame.RegionHudCapture.cs`) — A 진입 배너 / B 정화 배너 / C 화살표 / D 게이트 라벨 + 진행바 2/4.
- 웹 대조 캡처: `E:/exoduser-wt/_out/m1hud/webscenes.mjs`(origin/main game.html을 개발 서버에 주입, 같은 위치·몹 없음·같은 클리어 집합).
