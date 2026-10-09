# 보스 사망 혈흔24: 원16 수명·geometry를 보존한 새 원화 소비 — 2026-10-10

`ROOT-ENGINE-BOSS-DEATH-BLOOD24-20261010`. 실제 `deathFX`의 isBoss=true 혈흔만 새24 원화로 표시한다. 일반몹의 원16과 이미지 실패 폴백을 남기며, 기존 지면 impactId override는 먼저 선택된다. 실제24 그림은 새 제작했고 재생 수명·전투·사망 상태는 원 계약을 유지한다.

## 선택과 실제 소비

| 항목 | 현재 계약 |
|---|---|
| 우선순위 | ready `impactId==='boss_meteor_hit'` 지면 override → 그 외 원blood else 안의 actual isBoss=true → false 원16 |
| 보스 logical id | `boss_death_blood`; `_VFX_SHEETS.boss_death_blood`는 원 `_VFX_SHEETS.death_blood` 객체·Image 그대로 alias |
| factory 시간 | alias의 원 frames16/frame128×128/cols4, boss speed6/maxFrames16/명목96 진행 보존. 24×6=144로 늘리지 않음 |
| 표시 geometry | 원 dw=dh=128×scale, scale=max(.8,min(4.8,.35+max(1,Number(r)||8)×.075)). boss 여부로 크기 고정0 |
| 회전·alpha | 원 선소비 randomangle 및 baseAlpha1.5/formula 그대로. 새 helper Canvas setter만 clamp0..1, finally 원context 복원 |
| 입자 guard | `_tooMany=_partCnt>300` 원 스냅샷과 !tooMany atlas guard 유지; 흰링/flash·보스입자·음향 분기 불변 |
| 원시트 미준비 | 원 factory no-op. 새 Image가 원시트 준비를 대신하지 않음 |
| 새 clip pending/invalid/drawfailure | alias의 원16 generic timed/grid 경로로 폴백. false몹은 항상 원16 |
| 새ready 표시 | 기존 life/end/alpha/cull/budget 뒤 helper에서24 원화 한 셀·Canvas source-over. 성공이면 원generic GL/Canvas 제출0 |
| blend 경계 | 원 register의 source-over는 Canvas fallback 값, 기존 generic GL은 SRC_ALPHA/ONE additive. 원GL정책 수정0/원GLsource-over 보장0 |
| normalized phase | (frame+fraction)/maxFrames×clip.durationSeconds. bornGameTime!==undefined(0포함)은 _vfMix, nonborn은 t/frameTime |
| 시간 한계 | 원96 명목render 진행과 새 clip의24/15=1.6초 reference를 구분. 안정game초/화면FPS/24FPS/자연24전부노출 보장0 |

## 실제 boss flag 경로

| 호출 경로 | flag와 보존 조건 |
|---|---|
| hurtE 사망2 | burst queue 및 일반/burn 경로의 원 !!e.ib. actor/caller/killguard 변경0 |
| update dim DOT1 | G._fireZones의 fz.type==='dim', 원60tick/alive/radius gate 및 !!e.ib; 동결처형으로 분류하지 않음 |
| _fmDeathFx 내부1 | 원 !!isFb. 상위 live true2는 fieldboss/화마귀 HP<=0 및 _deathFxDone 1회guard. 보스이름·etype·반지름으로flag추정0 |
| 일반 몹 | actual false이면 death_blood16 유지. 모든 사망caller 전투 재감사0 |

## 신규 원화와 공유 loader

| 항목 | 값 |
|---|---|
| 생성 | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/reference1/count1, 단1job 09b5015c-2155-4d63-99f5-e36881d66209, 견적15credit/실debit조회0 |
| 참고 | 원 Blood_FBF_4x4.png 정상 HTTPS/fullbytes exact 참조. 기존 원16 PNG 불변 |
| 원본 | 3504×2336/6×4의584셀. α>4·>16 공통몸체 폭515로512 공통crop 불가 |
| 제품 PNG | assets/vfx/boss/boss_death_blood_24_20261010.png,3840×2560/640셀/6×4/24,5662466B/SHA f047f6756cdc46c921e793d366ff3d024981abd09960470f51b1f567dfa0974a |
| JSON | assets/vfx/boss/boss_death_blood_24_20261010.clip.json,231B/SHA 10a0e2473dbdbe7b06ee9b1fa9d2c9fa88e8dae0d3b835bf6a41a38addd5598e |
| flat9 schema | format=exoduser-atlas-clip/version1/name=boss_death_blood/sourcePath 위PNG/columns6/rows4/frameCount24/fps15/loopfalse |
| packing | 공통crop [57,74,572,557], 원nominal292,292→640셀320,320. scale1/resample0/공통padding, 개별frame scale/warp0 |
| 최초 packing | 자기α>4/16손실0/이웃혼입0/edgesα0, 원copypixel exact, visibleRGBA·black·gray 각각24unique |
| loader | 공유loadPromise로 fetch/import/Image1회, exact metadata/runtime3API·grid512or640 검증, immutable inset1 rect24 후 ready. 실패 marksfailed/자동retry0 |
| 원점 | .5,.5 중심을 원128셀64,64 destination에 대응. 후기분리방울의 물리발생원점 추정은 미인수 |

## 메모리와 검수

| 항목 | 결과/한계 |
|---|---|
| 정적 RGBA8 | 새37.5MiB/원1MiB/합38.5MiB. CPU와GPU 각1copy라고 가정하면77MiB, 실제copy·scratch·driver·peak 측정0 |
| 표시 예산 | 원 visualpool20/drawbudget5/cull·수명·compaction 유지. 공격제한·모든동시효과가시보장 아님 |
| source 최초 | 새 source epoch1/8그룹97조건 PASS/actionable0/blocking0. 통제fixture이며 wholegame 아님 |
| 실제PNG 최초 | 별도 epoch1/3그룹29조건 PASS. 실제640셀 PNG 1decode·helper28call·24상24unique·단일셀/context복원/독립pixeloracle exact. source와 합산0/인게임 인수 아님 |
| 준비 refinement | Canvas1초과 alpha setter 무시 문제를 새helper clamp로 첫제품실행전에 보강1. 원 producer/fallback 계산 불변 |
| 완료검사 반복 | 기존 Jump/Charge/Slam/Meteor/Druid suite·원packing 재실행0 |
| 시각판독 | ROOT 실제RGBA black/gray·128strip 판독: 액체응축→확장→갈라짐→방울소산 읽힘, 16→17 연결액체감소·초후기소형가독성·후기origin/궤적 RETOUCH |
| 본편 인수 | actualnormalmain/정상줌/전체보스전/GPU·동시성능/청취·실save/AAA 미인수. 독립Canvas proof는 인게임녹화 아님 |

**VISUAL VERDICT: RETOUCH.** 새24 원화와 실제main consumer 연결을 실제전투 품질 인수로 대신하지 않는다. normalmain·GPU·메모리 검토는 기존 환경 경계 해소 후 사용자의 실제 상태를 확인하고 진행한다. 서버 재시작·사용자 탭 조작 승인으로 해석하지 않는다.
