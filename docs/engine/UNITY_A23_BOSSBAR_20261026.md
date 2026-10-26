# PC-A23 보스 HP·포스처 바 `#bossBar` — 2026-10-26

베이스 `c9cf5d018`(overlays 합본), Unity 6000.6.7f1. 웹 기준: `game.html` 마크업 2701, CSS 387-404·954-958, 갱신 코드 35829-35880, 패널 열림 시 숨김 ui-foundation.css 124 / game.html 2469. 표시용 UI, 값은 호출하는 쪽이 넘긴 Unity 값.

## 1. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규 | `Runtime/NativeBossBar.cs` | 바 본체. 공개 API 아래 |
| 신규 | `Runtime/NativeBossBar.Capture.cs` | `--unity-overlay-capture boss <dir>` (NativeGame 수정 없음) |
| 신규 | `Resources/Data/bossbar_web.json` | 정의: 35개 구역→보스 이름(`STG[si].bn`), 레이아웃, 타이밍, 칩 문구, 글리프 토큰 |
| 신규 | `Resources/Art/ui/boss/boss_name_sharp.png`(DSF2)·`boss_name_blur.png`·`boss_status_glyphs.png`(DSF4) | 보스 이름용 Black Han Sans(faux-bold 900, 25.6px, 웹 text-shadow 포함) 글리프 109자, 상태 글리프 6종. 웹 렌더에서 구운 것 |
| 신규 | `Tools/boss-bar-web/` | `cap_boss_web.cjs`(웹 캡처), `bake_boss_assets.cjs`(글리프 굽기), `build_boss_defs.py`(아틀라스+정의), `mk_cmp.py` |
| 신규 | `docs/engine/unity_patches/A23_nativegame_bossbar.patch` | 12번째 patch(연결 배선만, Show 호출 없음) |

## 2. 공개 API

| 항목 | 설명 |
|---|---|
| `Show(string bossName, float hp01, float poise01)` | 간단 호출 |
| `Show(Input)` | `name, hp01, poise01, state(Normal/Groggy/Immune), stateRatio01, stateSeconds, chips(kind bleed/poison/burn/shock, stacks, seconds)`. 처음 호출 때 웹 인트로가 시작되고, 보이는 동안의 호출은 값만 갱신 |
| `Hide()` | 0.6초 페이드아웃(웹 `transition:opacity .6s`) |
| `BossNameForStage(int si)` | 웹 `HELL_BOSSES`·`CHAPTER_STAGES` 정의표로 구역 번호→보스 이름 |
| `Draw()` | 1920×1080 설계 공간, `Suppressed=true`면 안 그림(전체 화면 패널이 열렸을 때 웹처럼 숨김) |
| `ForcedAge` | 캡처용 시각 고정 |

## 3. 웹 근거 (캡처 `E:/exoduser-wt/_out/pc-a23/web/`, 계산 스타일 덤프)

| 요소 | 웹 값 | Unity |
|---|---|---|
| `#bossBar` | fixed, 가운데, x710 y28 w500, z22 | 같은 좌표 |
| 이름 `.bn` | Black Han Sans 900(faux bold) 25.6px, #ffd3a2, letter-spacing .08em, text-shadow 0 0 16px rgba(255,118,72,.34)+0 2px 4px, 높이 31 | 글리프 아틀라스(웹 렌더). 잉크 위치 웹과 ±1px(891/914/938/961/985/1008) |
| HP 틀 `.bhw` | y65 500×14, 테두리 1px rgba(125,44,32,.92), 반경 14(=알약), 배경 180° rgba(20,7,7,.9)→rgba(9,5,6,.96), box-shadow 0 0 18px rgba(118,38,23,.38), inset 1px rgba(255,169,119,.08) | 알약 열 단위 그리기 + 가우시안 글로 텍스처 |
| HP 채움 `.bhf` | 498×12, 그라데이션 90° #2d0405→#7f1212 38%→#cf361f 72%→#ffb16a, **채움 폭 기준**(HP가 줄면 압축) | 같음 |
| 포이즈 `.bpow` | y83 360×6, 배경 180° rgba(18,12,11,.82)→rgba(8,6,6,.92), 테두리 1px | 같음 |
| 포이즈 채움 | 358×4. 평상시 ≥60% #aaa→#fff, 30~60% #ddaa00→#ffcc44, <30% #ff4400→#ff8800(테두리 #ff4400, 그 외 #666). 그로기 #ff6600→#ffaa00(테두리 #ff6600, 남은 시간 비율), 면역(충전) #4455cc→#8899ff(테두리 #4455cc, 충전 비율) | 같음 |
| 칩 `.bst-i` | y94 높이24, gap6, 패딩 1px 6px, 테두리 1px 색@.333, 배경 rgba(0,0,0,.6), 반경3, Noto Sans KR 13.6px + 13px 글리프. 순서 그로기·면역·출혈·독·화상·감전. 문구 `그로기 1.7s`, `면역 4.7s`, `출혈2 4.5s`, `독3`, `화상1`, `감전1` | 같은 순서·문구, 폭 웹과 ±0.02px(92.46/79.95/…/97.4/84.9). 글리프 6종 웹 `_glyph` SVG 그대로 |
| 인트로 `.intro`(2.0초) | 이름 0.8초 ease-out(0,0,.58,1): 투명도 0→1, letter-spacing 1em→.25em, 블러 8px→0. HP 틀 1.2초 ease-out, 지연 0.4초: 투명도·scaleX 0→1. 2.0초에 클래스 제거 → 간격이 .08em로 튐(웹 그대로 유지). 포이즈 바는 애니메이션 없음. 바 전체 `.on` 페이드 0.6초(ease) | 같은 곡선. 덤프한 간격 15.22px(0.3초)·8.19px(0.6초)와 Unity 값이 정확히 일치. 블러는 선명본/블러본 교차 페이드로 근사 |
| 인트로 중 HP | 보스 시네마 3초 동안 `_introFill`이 90틱(1.5초)에 0→100% | 같음(`Show` 후 3초는 램프, 이후 실제 `hp01`) |

## 4. 트리거 patch — 이벤트 없음

Unity에는 보스 액터·보스 등장 이벤트가 없다(`Simulation.Enemies`의 `EnemyState`에 `Hp/Poise/Stunned`는 있으나 보스 표지, `pImmune`, 상태이상 타이머 없음). 그래서 patch는 연결 줄(`Show` 호출)을 넣지 않고 필드·생성·`ResetRun`의 `Hide()`·`OnGUI`의 `Draw()`만 넣는다(A22와 같은 처리). `git apply --check` 통과(기존 6개→A13→A14→A20→A21→A22→A23, 12개 모두 적용·되돌림 확인).

## 5. 검증

| 항목 | 결과 |
|---|---|
| 합본 트리 Win64 빌드(patch 미적용, NativeBossBar 포함) | Succeeded, errors 0, error CS 0 |
| 합본 회귀 캡처(같은 빌드, 각 1회) | levelup 0 · death 0 · clear 0 · forge 2(점검 11개 중 `NativeGame has no forge field (A14 patch not applied)` 1개 — patch 미적용 트리의 알려진 결과, 이전과 같음) |
| 보스 캡처 `--unity-overlay-capture boss` | 종료 코드 0, 점검 12/12, 프레임 12장 |
| 12개 patch 적용 컴파일 | Win64 빌드 Succeeded, errors 0, warning CS 0. 이후 역순 `apply -R`로 `NativeGame*`·`NativePauseMenu*` 변경 0 확인 |
| inventory-navigation / oracle / stat-parity | 35/35 · 892/0 · 2/2 MATCH |

값 출처: 인트로·정상·hp80_poise33·hp40_poise17_status·그로기·면역 프레임은 웹 덤프에서 옮긴 **테스트 값**(`bossbar-capture.json`의 `testNote`). `unity_boss_real_enemy`는 살아 있는 일반 적의 실제 Hp/Poise를 같은 API로 넘긴 호출자 매핑 예시(보스 아님, 이름은 1-1 정의표 값).

## 6. 미이식 / 남은 차이

| 항목 | 내용 |
|---|---|
| 포이즈 텍스트(`포이즈 N%` 등) | 웹도 `.bpow{overflow:hidden}` 때문에 `.bpol{right:-52px}`가 잘려 보이지 않음 → 그리지 않음 |
| 방어막 바 `#bossShieldF` | 웹이 폭 0 고정("eShield 이원방어 삭제") |
| 영어 보스 이름 | `_T()` 번역표 미이식, 한국어만 |
| 부활 횟수·드루이드 피날레 접미 | 이모지 포함 문구라 미이식(글리프는 숫자·`·`·`/`·`마지막 저항`만 구움), 호출하는 쪽이 이름 문자열에 붙이면 됨 |
| 상태이상 값 | Unity에 보스 상태이상 타이머가 없어 호출하는 쪽이 넘기기 전까지 칩 없음 |
| 포이즈 틀 모서리 반경 2px | 직각 처리 |
| 블러 | 필터가 아니라 선명/블러 교차 페이드로 근사 |
| 비교 이미지 배경 | 웹은 게임 장면 위, Unity는 검은 배경. 인트로 비교 프레임에서 웹은 `.on` 페이드가 이미 끝난 상태로 재생(Web Animations로 시각 고정)한 값이라, 0.3초 프레임에서 Unity 포이즈 바가 약간 어둡다(실제 등장 때는 둘 다 같은 페이드) |

비교 이미지: `E:/exoduser-wt/_out/pc-a23/cmp/`(시점별 `a23_t*.jpg`, 상태별, 1x 크롭 + 3x 이름/상태 칩 크롭).
