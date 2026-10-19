# 다크드루이드 실제 접촉 draw 수정

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

| 항목 | 현재 계약 |
|---|---|
| 범위 | 자기3333 격리 QA, `fdgDruidLiveFix=contact` + `window._FDGDruidQaStorage.active`. 기본 게임 표시 유지 |
| 확정 가림 draw | `drawP → shockField → _msStormImg2 → X.drawImage → WebGPU textured quad`. 원본 `assets/vfx/Lightning_Lightning_FBF_4x3.png`, 기존 `#7733ff` tint, 4열3행12프레임 |
| native 장판 alpha | `(progress>.8 ? 1-(progress-.8)/.2 : 1) × .85`, progress=`fz.t/fz.maxT` |
| 넓은 장식 보정 | `_fdgDruidDecorAlpha(nativeAlpha,age)`. age≤8 native 유지; age8..16 선형 gain1→.12; age≥16 gain.12. 장판은 native `fz.t` 사용 |
| 긴 컬러 선 | shockField `_thunder`의 li0 컬러 메인만 같은 gain, age=`th.maxLife-th.life` |
| 유지 | `_msStormImg1`와 `_msStormImg3`, li1 흰 코어 및 흰 분기, 초반8틱, 원 PNG/UV/원색/배치/폭/수명/타격/Q-E/위험/AI/피해/포이즈/맵 LOCK |
| 임시 관측 | 공통 image/quad 관측 제거. 확인된 시트 소비 접점의 frame%24 read console만 새 proof 수집 중 사용. native/observer 필드 assignment0. 최종 삭제 완료 |
| 새 관측 | field-observe에서22 실제 시트 draw. 예: nativeframe48, sheetFrame3, age12/maxAge600, size281.6, alpha.85, WebGPU. 수정본23 draw 중21개 감소 적용; age3/7의 초기2 draw native 유지 |
| 한계 | 이전 r9은 동결 이력. raw/GIF/11검사/세이브를 현재 검증으로 재사용0. 캐릭터 고급 모델링/엔진 완성 주장 없음 |

증거 루트: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-contact-vfx-live-fix/`. 코드 수정 전 backup/before-live-fix.json, 이미지/도형/특정 시트 관측을 순차 교체했다. GPU 공통 Debugger 준비 단계 지연은 AI 시작 전에 제거했으며 정상 재생 증거로 사용하지 않는다.

최종 실제 결과와 MAP PRODUCTION REPORT §23는 같은 문서에 추가한다.

## 실제 검증 결과

| 항목 | 결과 |
|---|---|
| 새 의미 있는 검사 | `node --test test/fdgDruidShockFieldLive.test.mjs` 6/6 PASS. 실제 shockField 소비 블록 실행으로 초기8틱, 후반 gain, 흰 코어/분기, crop/배치/폭/원 수명·피해 필드 유지 검증. 테스트 RNG만 deterministic, 실제 게임 RNG 변경0 |
| 정상 기록 | 공개 AI 시작, W/A/D 더블탭과 좌클릭 drag, E/Q 각2회 시도. 원속도·무강제 전투1회, 기록4.587초/실제 capture span4.414초, full1280×720 JPEG83개, GIF83개/4.460초 |
| 확정 draw | `fixed/draws.json`23개. age3..177, 감소21개. 예 nativeframe72/sheetFrame10/age33/maxAge600/nativeAlpha.85→actualAlpha.102, 동일world size281.6·원 UV·WebGPU image quad |
| 코어 증거 수준 | 장판1/3 및 흰선/분기는 실제 소비 블록 비교검사에서 유지. draw log의 coreAlpha.595는 계산값이며 별도 실제 코어 계측으로 주장하지 않는다 |
| 일반 무기 접촉 | 명확한 일반 wSwing1개 requested275/shieldDelta302/hpDelta0. 별도 noImpact/poiseHit2763 접촉2개는 일반 공격 완료량으로 합산하지 않는다 |
| E/Q | 각2 공개 tap, 성공 callback0/0. 투사체 방향/중심/위협과 판정 코드 유지; 패링 성공 검증 주장 없음 |
| 회피 | W/A 공개 더블탭 후 native bladeDash 관측. 마지막 D 더블탭은 player-dead 상태의 입력 시도로 유지 |
| 생존/보스 | 기본 Lv1 native 초기HP571→0 사망. bossHP21017/alive, 쉴드21017→13075. 격파·무사망·연속패링 검증 없음 |
| 강제/저장 | 새 native/observer field 주입0, 강제 HP/위치/패턴/페이즈/재시작/승리0, 원 save/API0, 공개 밝기115%는 격리 QA RAM 설정 |
| 콘솔 | 수정본 error log0. 포괄 network404/성능 검사는 실행하지 않음 |
| 시각 판정 | **RETOUCH**, 잔여1 `COMBAT_VFX_CONTACT_OVERLAP`. 보라색 잔광은 감소했으나 근접 코어/다른 임팩트가 손·무기·몸체를 순간적으로 가림. 기술 전달과 시각 성공 구분 |
| 초기 실패 | 테스트1차5/6: native30틱 RNG 셔플을 비결정적으로 비교한 fixture 문제. fixture만 deterministic으로 수정 후6/6. 이전 관측의 준비단계 Debugger 지연/읽기 변수 오류는 게임 성공 증거로 사용0 |

최종 source에는 모든 임시 console/quad/image 관측이 제거됐다. `fixed/observed-source.html`은 기록 당시 실제 소비 코드, `fixed/source-receipt.json`은 관측본/최종본 hash와 관측 제거 내역이다. 이전 frozen 자료나11검사/세이브 재사용0. 보호 문서2_3 변경0. map/nav/collision/outer-mass/geometry 변경0.

확인 URL: `http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgDruidSlam=r5&fdgDruidCombat=r8&fdgDruidLiveFix=contact&v=live-contact-fix`. AI 시작 → WASD/방향 더블탭 이동 → 좌클릭 무기 → E 물리/Q 마법. 강제 패턴/HP/페이즈 버튼은 이 검증에서 사용0.

```text
================= MAP PRODUCTION REPORT =================
STAGE: dark-druid-contact-vfx-live-fix / 격리 SI0 native combat
MASTER
- silhouette: 기존 actor/rig/pose 유지
- regions: map 변경0
- main route: 변경0
- side spaces: 변경0
OUTER MASS
- LEFT/RIGHT/TOP/SOUTH: 변경0
- major holes: 신규 geometry 검수 없음
LARGE
- source assets: 기존 Lightning_Lightning_FBF_4x3.png/tint 유지
- composites: shockField secondary decor alpha만 8..16틱 gain1→.12
- overlap: 보라색 감소, 근접 다른 임팩트 잔여1
- repeated silhouette: 변경0
MEDIUM
- connections: 변경0
- remaining holes: 신규 검수 없음
GROUND
- shadow/contamination/structure integration: 변경0
PLAYABLE
- main arenas/travel space/breathing space: 변경0
- threat space: 원 native 반경/수명/피해/탄 중심·방향 유지
- combat readability: 실제23 draw / 감소21. 시각 RETOUCH
LANDMARK
- primary/secondary/tertiary: 변경0
CAMERA QA
- START/EARLY: 새 entry 및 초기8틱 보존
- ARENA: full1280×720 prep/contact/recovery와 정상 연속GIF
- SIDE L/SIDE R: 공개 W/A 회피 관측, D는 사망 뒤 시도
- LANDMARK/LATE/EXIT: 신규 검수 없음
TECH QA
- route/collision: 변경0, 검수 확대0
- pageerror: 새 console error0
- 404: 포괄 측정 안 함
- seam/loading: 신규 지도 검사 없음
- performance: 새 성능 주장/시험 없음
FILES
- stage-owned: game.html, test/fdgDruidShockFieldLive.test.mjs, 관련 docs5개
- concurrent touched: foreign WIP 보존
- unrelated touched: 0
GIT
- staged/commit: 소유 파일만 정상 checkpoint, 정확 hash는 evidence receipt
- push/deploy: 0/0
VISUAL VERDICT: RETOUCH
NEXT PASS: COMBAT_VFX_CONTACT_OVERLAP 한 건의 남은 실제 접촉 가림 수정. 현 단위는 추가 라운드 없이 인계
```
