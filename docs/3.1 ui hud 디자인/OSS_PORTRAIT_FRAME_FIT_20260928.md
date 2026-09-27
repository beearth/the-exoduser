# 보관함 전대 초상 프레임 맞춤 (2026-09-28)

| 항목 | 현행 |
|---|---|
| 대상 | 유골함 탭 오른쪽 `#invOssAncestor`의 철갑 전대 초상 |
| 원인 | 원화는 880×1168(폭:높이 0.753)인데 무대가 남는 세로 공간을 `flex:1`로 모두 차지해, `object-fit:contain` 이미지 위아래에 큰 빈 띠가 생겼다. |
| 수정 | 원화 로드 시 무대 `flex:0 0 auto`, 폭 100%, `aspect-ratio:880/1168`. 프레임과 이미지도 무대 크기에 맞춘다. 넓은 화면의 초상 패널은 내용 높이에 맞춰 상단 정렬한다. 1119px 이하의 초상 행은 `auto` 높이로 늘려 이름·수집 정보가 잘리지 않게 한다. |
| 이미지 | 기존 선택 원화의 로컬 사본 `img/vfx_ancestor/iron_warlord_portrait.png`(880×1168 RGB). 원본 Higgsfield GPT Image 2.5 생성본 URL은 `UI_COMPOSITION_20260925.md`에 기록. `ANC_ROSTER[0].portrait`는 로컬 파일을 사용하고 기존 보행 시트 폴백은 유지한다. |
| 연결 | `game.html`, `game-easy-test.html`, `inventory-oss-balance.css?v=20260928-ossuary-fit5` |
| 검증 | Chromium 1940×1080, 1280×720, 970×579, 390×844에서 이미지 880×1168 로드·무대 비율·프레임 내부 일치·하단 설명의 패널 내부 표시·pageerror 0. `tmp/oss_portrait_fit_1940.png` 시각 검수. |
