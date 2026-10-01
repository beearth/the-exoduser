# UIUX — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:05:30.667Z

UI03 후속 캡처 판정을 시작합니다. 새로 생성된 캡처 4장과 JSON 5개를 실제로 읽겠습니다.

## 2026-10-01T06:05:53.068Z

개선 후 각 수치에 배경 캡슐이 생긴 것이 보입니다. 나머지 캡처 2장과 JSON 5개를 읽겠습니다.

## 2026-10-01T06:06:11.507Z

캡처는 명확합니다. 이제 JSON 5개를 읽어 계산 스타일·픽셀·클릭·타이머 색·설정 재진입을 정밀 확인하겠습니다.

## 2026-10-01T06:07:05.920Z

after-live.json 나머지(2174~2582)와, 대상 소스인 `ui-refinement.css`의 `#hudTop` 규칙을 확인해 캡처 근거와 소스를 대조하겠습니다.

## 2026-10-01T06:07:12.777Z

`#hudTop>div` 배경·그림자 선언을 완결 확인하겠습니다.

## 2026-10-01T06:08:23.815Z

읽기 전용 검수를 완료했습니다. 소스(`ui-refinement.css #hudTop`)와 캡처 증거가 일치함을 확인했습니다. 최종 보고드립니다.

---

## UI03 상단 전투 스트립 (COMBO/MAX COMBO/TIMER/DPS/MAX HIT) — 캡처 판정

### 판정 종합: **PASS** (경미 관찰 1건)
이번에 새로 생성된 캡처 4장·JSON 5개에 한정한 판정이며, UI03 전체 완료로 확대하지 않습니다. 소스 근거: `ui-refinement.css:1309-1327`(`#hudTop`), 토큰 `--combat-bone/gold/ember/hot`(L1311)이 JSON 색과 1:1 일치.

### 항목별 판정

| # | 확인 항목 | 판정 | 근거 |
|---|---|---|---|
| 1 | 개선 전후 판독성 | **PASS** | 전: `opacity .58`·배경 없음·`comboTimerHud` 원색 `rgb(255,204,68)`·`shadow none`(before-live). 밝은 적 VFX 위 COMBO 대비 저하(before-dense 상단 좌측). 후: `opacity 1`·각 수치 `rgba(9,8,9,.88)` 캡슐·4방향 외곽선·뼈/금/주황/적 토큰(after-dense·after-live). |
| 2 | 각 수치 작은 배경 / 최소 11px | **PASS** | 전 항목 `background rgba(9,8,9,.88)` + `border-radius:2px`(CSS L1321). `font-size:max(1rem, 11px/ui-scale)`(L1318) → computed 16.4992px×scale0.6667=11.0px, 390 fixture 54.16px×0.2031=11.0px. 렌더 하한 11px 충족. |
| 3 | 상단 미니맵/레벨/시계 가림 | **PASS(관찰)** | mmWrap(미니맵 x5~99)·mmLvl(레벨 x1122~1266)은 hudTop(x418~861)과 수평 비중첩. stageClock(시계 x583~696, y11.3~36)은 hudTop(y28~45.7)과 박스 **~8px 수직 중첩** — 단 캡처상 "00:27"과 COMBO 스트립은 시각 분리(잉크 비충돌). |
| 4 | 좁은 화면 줄바꿈 | **PASS** | 390×844: `flex-wrap`+max-width(L1312)+@media≤600px(L1326)로 2줄 수용, `overflow 0`, 각 캡슐 유지, 상단 요소 비간섭(narrow-layout). |
| 5 | 클릭 방해 없음 | **PASS** | 컨테이너·각 div 모두 computed `pointer-events:none`(CSS L1313·1323; JSON 전 프레임 `pointer:"none"`). after-live 전 프레임 `overflow 0`·`errors []`. |
| 6 | 타이머 10/5초 색 전환 | **PASS** | timer-live: ≥10s 금빛 `#ffda87`(10.1s) → <10s 주황 `#ffb17a`(9.6~5.5s) → ≤5s 적 `#ff9290`(5.0·4.4s). 10초·5초 경계 모두 전환. normal-combat 3.2s=적, narrow 10.0s=금빛 일치. |
| 7 | 설정 재진입 시 HUD 숨김 | **PASS** | settings-reopen 2회 모두 `hud:"none"`, `open:true`, `overflow:0`. 재진입에도 숨김 유지. |

### 남은 제약
- **A/B 비동일(사용자 명시)**: before(combo59·적147·`paused:true`) vs after(combo54·적71~101) — 캐릭터 이력·수치가 달라 픽셀 동일 비교·성능 측정이 아니며, 판독성 경향 비교만 유효.
- **stageClock ~8px 박스 중첩**: 1280·scale0.6667 조건의 바운딩박스 근접. 시계 자릿수 증가나 다른 스케일에서 재확인 필요(현재 캡처상 시각 충돌 없음).
- **elementFromPoint 직접 히트테스트 로그 부재**: 클릭 패스스루는 computed `pointer-events:none` 기준 추정. 명시적 elementFromPoint 샘플은 JSON에 미수록.
- **390 fixture는 QA 극단값**(combo 12345 / MAX 98765 / DPS 1.2B): 실게임 수치 아님.
- **dpsHud 일부 프레임 `display:none`**: DPS 미표시 조건으로 정상 거동이나, 표시/숨김 로직 자체는 이번 가독성·대비 판정 범위 밖.
- 단일 조건(WebGPU·Mac·1280×800). FPS/성능은 별건.

### 준수
파일/Git 미수정, 게임/렌더/빌드 미실행, 새 팀/PC 미접속. 현 Mac 경로 읽기 전용(Read/Grep)만 사용. 이번 캡처에 한정한 독립 판정입니다.

## 2026-10-01T06:10:09.104Z

시계 box 겹침 해소만 재판정하겠습니다. 최종 캡처 2개를 읽습니다.

## 2026-10-01T06:10:31.749Z

시계 겹침 해소를 정밀 확인하기 위해 나머지 프레임에 구버전 좌표(y:28)나 overflow/errors 이상이 없는지 확인하겠습니다.

## 2026-10-01T06:11:33.430Z

`final-dense-live.json` 전체에 구버전 좌표(y:28)·overflow>0·errors 없음을 확인했습니다. 시계 겹침 재판정만 보고드립니다.

---

## UI03 — 시계(stageClock) box 겹침 해소 재판정

### 판정: **PASS (겹침 해소 확인)**
적용 변경: 두 HTML `hudTop` 기준 `top 32→48px × scale`, CSS cache22.

### 기하 근거 (final-dense-live.json, 1280×800·scale 0.6667)
| 요소 | y 범위 (px) | 비고 |
|---|---|---|
| stageClock(시계) | 11.33 ~ 35.996 (y 11.328, h 24.668) | 위치 불변 |
| hudTop(전투 스트립) | **38.664** ~ 56.40 (y 38.664, h 17.740) | 기존 y 28 → **38.664**로 하강 |
| **간극** | **+2.67px** | 겹침 0 (기존 ~8px 중첩 해소) |

- 수정 전: hudTop y28(28~45.7) ∩ stageClock(11.3~36) = **~8px 수직 중첩**.
- 수정 후: stageClock 하단 35.996 < hudTop 상단 38.664 → **+2.67px 양(+)의 간극, 중첩 없음**.
- 전 프레임(17개) 일관: `"y": 28` 잔존 0, `overflow>0` 0, `errors` 비어있지 않은 항목 0 (Grep 확인).
- mmWrap(미니맵 x5~99)·mmLvl(레벨 x1122~1266)은 hudTop(x≈421~861)과 수평 비중첩 유지.
- 실화면(final-dense.png): 상단 "00:12" 시계와 "COMBO 18 · MAX COMBO 18 · TIMER 13.1s · DPS 990 · MAX HIT 2.5K" 스트립이 **별도 줄로 분리·가독**, 미니맵·레벨58 패널과 충돌 없음.

→ 경미 관찰(시계 box 근접 중첩) **해소 완료**. 다른 항목은 지시대로 재검토하지 않았습니다.

### 직전 보고 정정 (2건, 명시)
1. **elementFromPoint 실측 존재**: 직전 보고의 "elementFromPoint 직접 샘플 부재"는 오류입니다. `narrow-layout.json`에 `hits:[c,c,c,c,c]` — 5개 지점 모두 캔버스('c')로 히트, 즉 스트립이 클릭을 가로채지 않음이 **실측으로 확인**됩니다(클릭 방해 없음, 추정 아님).
2. **타이머 색 원시 기준·반올림 경계**: `narrow timer 599f = 10.0s`는 **주황(ember)**입니다. 정확한 원시 기준은 **<300f = hot / <600f = ember / 그 외 = gold**(프레임 기준)이며, 표기는 `toFixed` 반올림이라 표시 초(예: "10.0s")가 색 경계와 다를 수 있습니다(599f는 <600이라 ember이나 표기는 10.0s로 반올림). 직전 보고의 "10초=금빛/5초=적" 초 단위 경계 서술은 이 원시 프레임 기준으로 정정합니다.

### 준수
파일/게임/새 팀/PC 미접촉, 읽기 전용(Read/Grep). 이번 캡처(시계 겹침)에 한정한 재판정이며 UI03 전체 완료로 확대하지 않습니다.

## 총괄 원자료 대조

최종 final-dense-live.json은 20표본이다. 검토문 “17개”는 개수 오기이며, 20개 전부 시계 간극·넘침·error 검사를 통과했다. narrow-layout.json hits와 원시 타이머 경계는 후속 정정대로 인수한다.
