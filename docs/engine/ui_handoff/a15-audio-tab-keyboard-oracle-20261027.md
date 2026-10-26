# A15 설정 컨트롤: 사운드 탭·슬라이더·키 지정 입력 오라클

## 고정 원본

- 승인 웹 `origin/main` commit `607110d52a56a1e5622a78e2ce7d09582946920a`: `ui-panels.js` blob `9ca0a4729b34f8e3babb8182d482ae11f0d08d86` / SHA-256 `e325928dc6b689af6c1e84f0f1dcce5349449329d87ba78aacc98cd573706697`; `game.html` blob `85c6fc6c87308d1d4a68d9ba1b56b1a8be40ea14` / SHA-256 `d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5`; `ui-refinement.css` blob `bbee08d0d5a359359aeebfdec5353e3becebee7b` / SHA-256 `f6240dfd946394d87bd908ac8ad7c836551a2a582dc10471fef013b1159e08b0`.
- `ui-panels.js:18–46,73–113,148–164`: `game,display,audio,controls` 4탭. tab button은 `role=tab`, panel은 `role=tabpanel`, `aria-controls`/`aria-labelledby` 연결. 활성 탭은 `aria-selected=true`, `tabIndex=0`; 나머지는 false/−1. ArrowRight/Left는 양끝 순환, Home/End는 양끝 선택 후 click·focus. `audio` page에는 기존 `optSfx`, `optBgm`, `optBgmTrack`의 **row를 이동**하며 ID와 기존 listener를 유지한다.
- `ui-refinement.css:36–42,60–61`: `#settings .settings-page[hidden]{display:none!important}`. 활성 탭은 선택 스타일 `#f1dbaf` 글자색, 비활성은 `#aaa28f`. 실제 최종 색은 브라우저 computed style로 판정하고, 속성 문자열만으로 시각 PASS를 만들지 않는다.
- `game.html:2732–2733,10044,13176–13218,48878,48914–48915,49332–49333`: SFX/BGM range는 min0/max100이며 `step` 속성이 없다. SFX는 `oninput`에서 `OPT.sfxVol=+this.value`, `%` 표시, `_mbus.gain=sfxVol()`(=value/100), `saveSettings()`를 순서대로 실행한다. [WHATWG HTML range state](https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range))의 기본 step은 1이며 입력 중 min/max·step 제약이 적용된다. [W3C Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)은 Right Arrow 한 단계 증가를 키보드 동작으로 명시한다.

## 독립 검증 1건: Display → ArrowRight → Audio

| 단계 | 필요한 관측 |
|---|---|
| 사전 상태 | 설정을 열고 `settings-tab-display`에 focus. `aria-selected=true`, `tabIndex=0`; `settings-page-display.hidden=false`. 게임/사운드/조작 탭의 selected=false·tabIndex=−1 |
| 입력 | display 탭에서 키보드 `ArrowRight` **한 번**. 기본 스크롤 동작은 `preventDefault`되어야 함 |
| 선택/입력 후조건 | focus와 selected가 `settings-tab-audio`로 이동. audio tab `tabIndex=0`, display tab −1. `settings-page-audio.hidden=false`, 다른 세 page hidden=true. `getComputedStyle(audioPage).display !== 'none'`, hidden page들의 display=`none` |
| 컨트롤 후조건 | 기존 `optSfx`, `optBgm`, `optBgmTrack` ID의 각 row가 `settings-page-audio`의 자식. SFX/BGM range는 min0/max100, 보이는 이름·값의 접근성 연결(`aria-labelledby`/`aria-describedby`) 유지. 탭 전환만으로 input 값·기존 oninput listener·설정 저장을 새로 실행하지 않음 |

## 4탭 이동과 range ArrowRight의 서로 다른 입력 대상

| focus/초기값 | 입력 | 웹 소스 기준 기대값 | commit 경계 |
|---|---|---|---|
| `settings-tab-game` | ArrowRight | display 탭 선택·focus | 탭 click/selected만. 설정값 저장 없음 |
| `settings-tab-display` | ArrowRight | audio 탭 선택·focus | 위 단일 검증과 동일 |
| `settings-tab-audio` | ArrowRight | controls 탭 선택·focus | SFX range 값 변경 없음 |
| `settings-tab-controls` | ArrowRight | game 탭으로 순환 | 탭 입력의 wrap |
| 어느 탭 button이든 | Home / End | 각각 game / controls 탭 선택·focus | 탭 입력만. 숨긴 page는 computed display none |
| `optSfx` range, 값 `60` | ArrowRight 1회 | 브라우저 기본 range 조작이 허용되면 `61`, 표시 `61%`, `OPT.sfxVol=61`, `_mbus`가 있으면 gain `0.61` | 변경 `input` 이벤트에서 즉시 `saveSettings()` 호출; 별도 blur/확인 버튼을 기다리지 않음 |
| `optSfx` range, 값 `0` | ArrowRight 1회 | `1`, `1%`, OPT 1, gain 0.01 | 같은 input commit |
| `optSfx` range, 값 `100` | ArrowRight 1회 | 상한 clamp로 `100` 유지 | 값 변경이 없으면 `input` 발생·저장 호출을 PASS 조건으로 요구하지 않음 |

`game.html:13176–13218`의 전역 keydown은 ArrowRight를 `preventDefault()` 목록에 넣지 않는다. 따라서 range에 focus가 있을 때 브라우저의 기본 조작이 이어진다. 위 한 칸 증가값은 **HTML range 기본 step=1과 일반 수평 LTR 조작에서 도출한 기대값**이며 이 QA에서는 실제 웹 브라우저를 조작하지 않았다. `saveSettings()`는 localStorage 쓰기를 try/catch로 감싸므로 호출과 디스크/브라우저 저장 성공은 별도 게이트다. Mac Unity는 대응하는 focus·한 칸 증가·0..100 clamp·변경 시 저장 시도로 비교하고, HTML DOM/로컬 저장소를 그대로 복제할 필요는 없다.

## 기존 키 지정 대기 중 Esc/Tab

| 상태·입력 | 원본 함수 | 기대값 |
|---|---|---|
| `listeningBind='up'`, `_listenAlt=false`, Escape 1회 | `game.html:13183–13187` 선행 분기 | 대기 취소: `listeningBind=null`, `_listenAlt=false`, `renderSettings()`, 기본동작 방지. **`BINDS.up` 변경·`saveSettings()` 호출 없음** |
| 같은 대기, Tab 1회(반복 입력 아님) | `game.html:13195–13203` → `_setInputBinding('up','Tab',false)` (`:6245–6253`) | `BINDS.up='Tab'`, 대기 해제·렌더·`saveSettings()` 1회, `preventDefault`+`stopPropagation`. 포커스 탐색용 Tab으로 넘기지 않음. `up`을 택한 이유는 charge↔공격 충돌 제한과 무관하기 때문 |
| 대기 없음, 설정 안의 일반 버튼·input·select에서 Tab | `game.html:13212–13213` | 패널 컨트롤의 기본 focus 이동을 허용; 바인딩 저장 없음. 키 지정 대기 중 Tab과 **별도 상태** |

**판정 경계:** 웹 계산 스타일·함수·입력 후조건을 기준으로 준비한 독립 오라클이다. A15 최소명세/Unity 제품은 아직 freeze·구현 전이므로 Unity PASS **0**. 실제 브라우저/Unity Editor/Player/사용자 창 실행 0, E: 제품·lock 변경 0. 키 지정 중 Tab을 일반 focus 이동으로 처리할지 Mac 접근성 정책이 다르게 확정되면, 이를 웹 동일 결과로 표시하지 말고 별도 설계 차이로 기록한다.
