# 다크드루이드 접촉 VFX 가독성 r9 · 2026-10-11

r9은 자기 격리 QA에서 기존 boom의 늦은 보라색 잔광·장식 연기를 접촉 겹침에 한해 낮추는 렌더 저작 단위다. 첫 8프레임의 접촉/패링 코어를 보존하며 native AI·시간·피해·Q/E·포이즈·투사체·위험 판정과 원 PNG/UV/색/재질을 유지한다. r8 및 이전 보고·source·검사·자료는 동결 이력이다. 이번 기술·시각 인수에는 새 자료만 사용한다. 새 정상 실전 표본의 대상 효과 적용은 NOT_OBSERVED, 시각 판정은 RETOUCH이며 잔여1개 COMBAT_VFX_CONTACT_OVERLAP이다.

## 활성 경계와 현재 변경 범위

| 항목 | r9 계약 |
|---|---|
| 단위 / URL | `dark-druid-contact-vfx-r9`, `fdgDruidCombat=r9` |
| 자기 격리 | 기존 `window._FDGDruidQaStorage.active` 승인 경로에만 r9 loader를 연결한다. 기존 r4 classic host/port/path/query gate·RAM settings/slot 경계를 유지한다 |
| 실제 소비 | QA 설치 옵션 `contactVfxReadability:true`이고 `mode==='native-ai'`인 때만 활성. 기존 framing/readability 옵션을 계승하지만 r7/r8/기본 분기의 의미는 유지한다 |
| 최소 game 접점 | 기존 generic boom layer의 `X.globalAlpha` 접점 1곳. 새 draw-local scalar만 사용하며 원 boom record/actor/timer write 없음 |
| QA overlap | `contactVfxAlpha({kind,sheet,frame,progress,alpha,x,y,size})`는 r9 옵션/native-ai/readabilityFrame 및 finite x/y/size>0을 요구. half=size/2에서 `x+half>left && x−half<right && y+half>top && y−half<bottom`인 body/player±100 rect가 하나라도 있으면 overlap true. 접선은 겹침 제외. alpha pixel/hitbox/새 충돌 판정 아님 |
| 공개 관측 | `contactVfxSnapshot()`은 r9 옵션에서 `{active:mode===native-ai,policy:{...CONTACT_VFX_AUTHORING_POLICY},displayOnly:true,contactBoundsSource:existing native body envelope and player ±100}` 새 사본, 옵션이 없으면 null. per-instance applied/frame/alpha/gain 통계가 아니며 active=true만으로 실제 감쇠 발생을 증명하지 않는다 |
| QA UI | leaf `DARK DRUID · r9` / aria `드루이드 접촉 VFX QA r9`, 저작용16%/12%·core8+latefade 설명. compact max-height190px·기존 폰트/zoom/brightness 유지. 정책을 native 피해 수치로 표시하지 않는다 |
| source / cache | `engine/fdg/druid-contact-vfx.js`, `test/fdgDruidContactVfx.test.mjs`, QA/game 새 r9 caller. QA loader query `contact-vfx-r9` |

## 효과 allowlist와 원본 보존

| kind / sheet / frame | r9 한정 소비 |
|---|---|
| Dark Medium Impact | 기존 `Dark_MediumImpact.png`, 4×4/16프레임. frame0..7 코어의 native alpha는 정확히 유지. frame8..15 큰 purple 잔광만 접촉 AABB 겹침에서 policy gain 소비. kind `dark` 또는 `dark02`만 exact basename으로 허용 |
| dark smoke | kind `dark`의 secondary `Dark_DarkSmoke_FBF_4x4.png`만 장식 smoke gain 소비. `dark02`에는 이 secondary smoke가 없으며 추가하지 않는다 |
| 제외 | allowlist 밖 kind/sheet/color/source·비행탄·위험/독장판·다른 VFX는 원 native 경로. 원 효과 프레임·UV·색·재질·blend·draw 순서 유지 |
| 원 boom clock | policy progress는 기존 `ep=t/mt`. native t/mt·66/72 등의 수명 유지. atlas layerPhase는 `min(1,max(0,ep−si*.04)/max(.01,1−si*.04))`, frame=min(15,floor(layerPhase×16)). policy fade를 layerPhase/seconds/새 clock으로 바꾸지 않는다 |
| 원 geometry / alpha | 원 size=`r×(3.0+si*.4)×sqrt(min(1,layerPhase×3))`, 원 alpha=`max(0,1−.5×ep)×(1−.2×si)`. bx/by·world r·frameUV·power scale 및 이전 X.globalAlpha 복원 그대로. draw-local modifier만 추가 |
| source 의미 / backend | 현재 native dark=[Dark_MediumImpact,Dark_DarkSmoke_FBF_4x4], dark02=[Dark_MediumImpact]. common boom은 FDGRuntime SkillSystem/ParticleSystem이 아니다. WebGPU globalAlpha→_ga→quad→WGSL sampledRGBA×vertexalpha의 src-alpha/one-minus-src-alpha 경로이며 composite setter는 no-op. blend 이동/새 backend 수정0; 실제 live 적용은 별도 관측 |
| kind / 과거 귀속 | dark02는 Q 성공 외 다른 native trigger에서도 사용하므로 kind만으로 Q 성공을 판정하지 않는다. 과거0040의 exact effect instance는 NOT_OBSERVED, r8 proof 접근/재검수0. 위험 bossShock ring/쉴드/독탄/EArc는 이번 allowlist 대상이 아니다 |
| 코어 / 사라짐 | medium frame0..7 scalar passthrough. modifier의 양수 tail gain은 별도 삭제/hide/drop을 만들지 않으며 원 native alpha0/life 종료는 그대로다 |

## CONTACT_VFX_AUTHORING_POLICY

| key | 값 | 의미 |
|---|---:|---|
| `mediumTailStartFrame` | 8 | medium core0..7 이후만 보정 |
| `mediumFrameCount` | 16 | 정확 유효 integer frame0..15 |
| `mediumTailGain` | 0.16 | medium 늦은 잔광의 기본 alpha 배수 |
| `darkSmokeGain` | 0.12 | kind dark secondary 장식 연기의 기본 alpha 배수 |
| `fadeStart` | 0.60 | native progress60%까지 해당 gain 유지 |
| `fadeEnd` | 1 | progress100%의 tail gain 도달 |
| `fadeTailGain` | 0.25 | late fade 마지막에 기본 gain의25% 유지 |

`contactVfxAlpha({active,kind,sheet,frame,progress,alpha,overlap})`는 native alpha를 반환하는 pure 함수다. active/overlap true·finite alpha/progress 각각0..1·integer frame0..15·정확 allowlist 조건을 모두 만족하는 장식에만 아래 공식을 사용한다.

```text
q = clamp((progress − 0.60) / 0.40, 0, 1)
modifier = gain × (1 − 0.75 × q)
renderAlpha = nativeAlpha × modifier
```

| progress | medium modifier | dark smoke modifier | medium frame0..7 |
|---:|---:|---:|---|
| 0..0.60 | 0.16 | 0.12 | native scalar 그대로 |
| 0.80 | 0.10 | 0.075 | native scalar 그대로 |
| 1 | 0.04 | 0.03 | native scalar 그대로 |

끝 값0.04/0.03은 **native alpha에 곱하는 modifier**이며 절대 globalAlpha 하한이 아니다. 원 native alpha가0이면 결과도0이다. inactive·overlap false·unlisted/hazard·invalid 입력은 `Object.is`로 동일한 native scalar passthrough를 유지한다. 원 record의 alpha/life/frame을 바꾸지 않는다.

## 보호 계약과 새 인수 범위

| 보존 항목 | 변경0 |
|---|---|
| native 전투 | AI/timers/phase·입력/Q-E·피해·포이즈·공격/위험 면적·탄 좌표/life·독장판 |
| 원 자산 / body | 승인 PNG·UV·원색·material·body/rig/weights/clips·원 비행 아트 |
| 환경 / 다른 소비자 | 맵/nav/geometry LOCK·본편 camera·기존 펫·원 source/shared/user save |
| 기존 단위 | r8 정본/보고/source/evidence/tests/Git 재검수·재실행·수정0. 이전 success 숫자를 새 성공에 합산하지 않는다 |
| 신규 실제 검수 | 새 자기 r9 normal native 연속 실전1회·원 full frame/짧은 영상/GIF·실제 시각 verdict·정확 잔여1·§23 보고. 기술 PASS를 시각 PASS로 대체하지 않는다 |

<!-- R9_RESULTS_BEGIN -->
## 새 기술 검사와 실제 결과

새 정상 native AI 실전1회에서는 정책 대상 dark/dark02 레이어가33개 상태 표본에 없었다. 따라서 정책의 실제 감쇠 적용·감소·core 보존은 모두 NOT_OBSERVED다. 새 source/pure/consumer PASS를 실전 효과 개선이나 시각 PASS로 확대하지 않는다. 실제 접촉 영역의 손·무기·피격/회복 실루엣 가림이 남아 VISUAL VERDICT는 RETOUCH이며 정확 잔여는1개 COMBAT_VFX_CONTACT_OVERLAP이다.

| 항목 | 실제 결과 / 증거 범위 |
|---|---|
| helper / allowlist | engine/fdg/druid-contact-vfx.js: exact kind dark/dark02+Medium late8..15, dark+Smoke0..15. export 정책은 Object.freeze, snapshot 정책은 새 사본. source 계약과 actual instance 관측을 구분한다 |
| 새 pure policy 검사 | test/fdgDruidContactVfx.test.mjs 6/6 최초 PASS, 38.701041ms, old suite0/rerun0. native 실전 renderer/시각 검사가 아니다 |
| 새 consumer 검사 | 새5 checks 최종 PASS: r9 ready 비활성 / 실제 QA world overlap·core·actor resources / 실제 추출 boom alpha만·UV/position/size/life/복원 유지 / early magic parry·physical impact 동일 / 새 installer syntax. 별도 QA node --check 최초 PASS. actual WebGPU 실전 정책 적용 증명 아님 |
| 첫 consumer fixture 실패 / 수리 | 첫 CLI fixture는 fake interval이 readyTick을 호출하지 않아 public AI guard에서 실패. captured readiness interval1회 호출로 fixture만 수리 후 재실행 PASS. 제품 source 추가 수정0·old suite0. E9/consumer-check-fixture-repair.json, new-consumer-checks-receipt.json에 첫 실패 보존 |
| source trace / PNG 접근 | E9/vfx-source-contact-findings.json: scout가 원 source PNG2개를 각1회 inspection, PNG 변경0. 최소 alpha 접점·현재 WebGPU 경로만 조사했다. derived 담당의 원 source PNG reads0와 구분한다. 과거0040 exact instance NOT_OBSERVED·r8 proof 접근/재검수0 |
| 정상 native 실전 / 입력 | 새 연속 play1회, recorded wall6418ms. charIdx0·level1·초기 HP632, 캐릭터/장비 선택 변경0. public 이동·held weapon·E·Q 총14 action groups, Q 실제3탭. QA 배치/HP/force phase/force pattern/restart 및 추가 play/replay0 |
| native 준비 / 일반 무기 | 새 시작 표본에 bossBurstWind/bossSpinWind 관측. immutable 일반 wSwing/st2=3 접촉2건 ms126218/126420: 요청178→shield195 각각, 합390·HP delta0. opts kbMult1/noPoise false/poiseHit false/poiseMult1.5/poiseSkill false. 별도 요청1411 접촉과 총 shield9516을 평타에 귀속하지 않는다 |
| E / Q / blue contact | E physicalProjectile callback1(ms128587): class physical, blackBean false, friendly/blueBean true, druidStraight/fromRainbow false. Druid 고유 직선탄 반사 증거 아님. Q 성공0·native Druid reflection callback0. blueBean ms129311 요청654/outer shieldDelta2101·HPdelta0: nested 효과 포함 가능, stable projectile ID·동일 탄 travel 연속성 미증명, 외부 delta 전부를 직접 blue 피해로 귀속0 |
| 기록 종료 / 후행 review | recorded player-dead HP0, boss alive HP21017/shield11501, shield21017→11501 누적9516·boss HPdamage0·kill0. 종료 뒤 자연14 추가로 paused review shield11487, playerHP0/물리 pause true. 기록 최종과 후행 review를 동시 값으로 합치지 않는다 |
| 효과 / 정책 실제 표본 | states33에 physical/rainbow_light/fire_medium/redbean/rainbow만 관측, dark/dark02/대상 core/late/smoke 레이어 표본0. actual 정책 적용·감소·core 불변은 NOT_OBSERVED. 표본 부재를 전체 render의 효과 무발생 증명으로 확대0. 표본 displayAlpha는 pure policy 재계산이며 actual draw ownership/frame alpha telemetry가 아니다 |
| actual backend / 화면 | 실제 WebGPU/GPU true, GL false/vfxInstanced false. ROOT가 새 원본/derived0012·0048을 직접 확인: 접촉 큰 flash·purple 선/막이 손·무기·몸과 피격/회복 구분을 가림. exact effect kind/instance 귀속 및 인과 before/after 비교 미확정·미수행 |
| alive 표본 / HUD 경계 | polls33=alive29/dead4. alive 표본 label177/moved177/overflow0은 반복 표본 합계이며 고유 label 수·전 render FPS 통계가 아니다. 사망 뒤 cached camera/layout은 alive PASS에서 제외. PNG/HUD·poll·event clock은 독립이며 nearest sample을 같은 event frame으로 확정하지 않는다 |
| storage / API / 오류 | actual own persistent successfulWrites0·main/API writes0·save roundtrip0. 자기 RAM get3279/set7은 persistent write와 구분한다. current console errors[] snapshot0, 전체 network404 계측 UNMEASURED. 사용자 다른 탭/본편 save 입력0 |
| 실제 시각 / 최종 상태 | VISUAL VERDICT: RETOUCH. 정확 잔여1 COMBAT_VFX_CONTACT_OVERLAP. 플레이어 사망/보스 생존 FAIL 유지, 전체 battle/kills/full stage/시각 PASS0. 정책 actual application NOT_OBSERVED를 구현 실패 확정이나 개선 성공으로 바꾸지 않는다 |

## 새 원본·파생 자료와 시간 경계

| 항목 | 새 r9 자료 / 정확 제한 |
|---|---|
| 원본 | E9/native-ai-play: full1280×720 sampled JPEG78장, everyNthFrame8, states33, action groups14. native 모든 frame capture 아님. leading ready1장 유지. 원본/기존 r8 자료 변경·재사용0 |
| 실제 시간 | CDP first→last6157.249927520752ms, recorded wall6418ms. GIF actual CDP 경계의 누적10ms 양자화6160ms+마지막 미관측 hold40ms=6200ms. 양자화 span 오차2.750072479248047ms, frame delay10..160ms. 속도맞춤/균일 duration/interpolation0. viewer minimum delay clamp는 UNMEASURED |
| GIF | E9/derived/native-ai-play-all-78.gif: 78/78, fullframe uniform1280×720→640×360 Lanczos+GIF palette 양자화, 14801723B, SHA256 8def6c9cc9a560fd98e469248899663bebbb77abfc299f2c61797245c376a23c. 누락/추가/복제/보간/merge0. 파일 loop0은 viewer 재생 설정이며 실제 play 반복 아님 |
| PNG0006 | E9/derived/frame-0006-full.png: 1280×720/924359B, SHA256 679a5f9c101d8c3f5bad2c834439aebff7f6eee46a0ff4be4e318c8b5e8ae81a. bossBurstWind 준비 화면; nearest sampled pose와 event 동시 확정0 |
| PNG0012 | E9/derived/frame-0012-full.png: 1280×720/684555B, SHA256 30d617367841bc6f1c759ab104a60d80b0d6892c7ff19920ded4ba008e9649d4. HUD wSwing/화면 shield19164, 일반 접촉 근처의 화면이며 callback 정확 frame claim0 |
| PNG0020 | E9/derived/frame-0020-full.png: 1280×720/931310B, SHA256 4f0a89832c9bbc00f454bdb879c55984798a74bcad112fefd30b297b5d3db87e. HUD pStun/HP336 및 접촉 영역 막 가림 |
| PNG0048 | E9/derived/frame-0048-full.png: 1280×720/1073816B, SHA256 6a50f5d403efafe6c9f6f95bab0cf82e9d06e1648a9326d1a7d934550c2ba186. HUD sRecover/PARRY; E callback 이후 맥락이며 동일 projectile/event frame 증명0 |
| PNG0077 | E9/derived/frame-0077-full.png: 1280×720/905413B, SHA256 efd2af2a8608084cceeea99f9f595228981c2badd9c284592d79631fabd0ef2f. HP0 fallen/bossHP21017/shield11501, 사망 실패 화면을 유지하고 alive layout/camera PASS에서 제외 |
| full board | E9/derived/r9-five-full-frames-board.png: 2632×2608/4561551B, SHA256 f16f4c1b92ef0d31cd0f9f7176856dd21dc2a4c65312312c40a1e1fc40daaaee. 1280×720 원 전체5개 panel1:1·외부 한국어 label·마지막 우측 빈 panel |
| 파생 receipt | E9/derived/r9-derived-captures-receipt.json: 18780B, SHA256 5764321f75286b71150ba055c98b1ddee481b89924a30d5ac45cc59ac3d7d736. PNG는 새 sampled JPEG의 decoded RGB와 exact, crop/brightness/recenter/cleanup0. derived source PNG reads0/raw writes0/browser/tests/Git0 |
| 최종 사실 / checkpoint | E9/r9-pre-checkpoint-facts.json, final-source-manifest.json, owned-checkpoint-baseline-receipt.json. source4 frozen·기존6 baseline HEAD 일치는 ROOT의 좁은 확인 결과이며 docs 담당 Git0. 최종 정상 checkpoint/hash는 ROOT 별도 receipt로 기록한다 |
<!-- R9_RESULTS_END -->

<!-- R9_REPORT_BEGIN -->
## MAP PRODUCTION REPORT · 가이드 §23

| 구분 | 항목 | r9 범위 / 실제 결과 |
|---|---|---|
| STAGE | stage | 기존 Dark Druid NORMAL 자기 native QA의 contact VFX 한정 저작. 새 맵 제작0 |
| MASTER | silhouette / regions / main route / side spaces | 기존 맵 유지, 새 전수 검수0. body/rig/source PNG silhouette 변경0 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | 기존 geometry LOCK 유지, 구조·외곽 변경/전수 판정0 |
| LARGE | source assets / composites / overlap / repeated silhouette | 원 PNG·색·UV·재질·환경 유지. 새 접촉 영역 flash/purple 막 가림은 RETOUCH. effect exact instance 귀속 미확정 |
| MEDIUM | connections / remaining holes | 기존 연결/맵 유지, 새 전수 검수0 |
| GROUND | shadow / contamination / structure integration | 기존 ground/독장판·위험 면적 유지, 새 환경 제작0 |
| PLAYABLE | main arenas / travel space / breathing space / threat space | 원 native 위치/AI/time/위험·판정 유지. 정상 play1회 playerHP632→0·bossHP21017 alive/kill0. 전투 완료 FAIL 유지 |
| PLAYABLE | combat readability | sampled target dark/dark02 layer0, 실제 감쇠/감소/core 불변 NOT_OBSERVED. 손·무기·피격/회복 접촉 실루엣 가림 잔여1 COMBAT_VFX_CONTACT_OVERLAP |
| LANDMARK | primary / secondary / tertiary | 기존 맵 유지, 새 landmark 제작·전수 검수0 |
| CAMERA QA | START / EARLY / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 좁은 정상 교전 외 경로 미관측. 과거 camera proof 재사용 PASS0 |
| CAMERA QA | ARENA | 기존 자기 framing/readability 계승. alive29표본 label177/moved177/overflow0은 label 표본만의 값이며 whole camera/전 render PASS로 확대0. 사망 cached frame 제외 |
| TECH QA | route / collision | map/nav/geometry·탄/actor좌표·공격 위험 면적 변경0, 전수 route/collision 검사0 |
| TECH QA | pageerror / 404 / loading | actual console errors[] snapshot0, 전체404/모든loading 계측 UNMEASURED. 전체 무오류 PASS0 |
| TECH QA | seam | 원 PNG/UV/body/material 유지. 새 shape/asset seam 제작0, 전수 seam 검수0 |
| TECH QA | performance | new policy6/6 first PASS·consumer5final PASS·별도QA syntaxfirst PASS. actual GPU/WebGPU true·GL/vfxInstanced false. GPU benchmark/full native 성능 PASS0 |
| FILES | stage-owned | ROOT game.html/engine/fdg/druid-encounter-qa.js, worker engine/fdg/druid-contact-vfx.js/test/fdgDruidContactVfx.test.mjs, 이 새 정본 및 기존 VFX/RUNTIME/INTEGRATION/CHANGELOG4의 r9 delta |
| FILES | concurrent touched | 다른 담당/Hell WIP 보존, 기존 r8 및 앞선 단위 source·보고·자료·검사 동결 |
| FILES | unrelated touched | docs 담당0, protected2_3/r8 정본/원 PNG/code/browser/tests 변경0 |
| GIT | staged / commit / push / deploy | docs 담당 전부0. 정상 checkpoint/hash는 ROOT 별도 receipt, push/deploy0. 이 문서의 기술/시각 인수와 checkpoint 기록을 구분 |
| VISUAL VERDICT | PASS / RETOUCH / FAIL | RETOUCH. 새0012/0048 fullframe에서 접촉 가림 확인, 전체 battle/kills/visual PASS0 |
| NEXT PASS | 정확 잔여 | 정확1 COMBAT_VFX_CONTACT_OVERLAP. sampled policy 적용 NOT_OBSERVED·exact kind/instance 미확정 경계를 유지. 추가 scope/실전/재검수0 |
<!-- R9_REPORT_END -->

## 문서 기준과 소유권

선행 기준은 [MAP 가이드 v0.9](../4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) §0..26 전체와 [_MAP_SSOT_INDEX](../4.1맵디자인+설정/_MAP_SSOT_INDEX.md)의 순서다. 이번에는 기존 MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK를 유지하고 새 한정 COMBAT/CAMERA/TECH QA를 수행한다. 원 SSOT/LOCK 값을 시각 보정을 위해 변경하지 않는다.

증거 루트는 `E9=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-contact-vfx-r9`다. docs 담당은 이 새 정본과 `VFX_구현가이드.md`, `FDG_RUNTIME.md`, `FDG_INTEGRATION_INTERFACE.md`, `CHANGELOG_SYNC.md`의 새 r9 delta만 소유한다. production 직전 현재4문서 byte-exact backup/SHA는 E9/backup-production과 docs-contact-vfx-production-baselines.json에 보존하며 HEAD 비교/Git·코드·브라우저·테스트 실행0. 기존 body/r8 sections/Hell WIP를 정리하거나 되돌리지 않는다.

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · 현재 별도 Q 접촉 표시 후속

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
| 동결 r9 | 이전 medium/smoke 정책·actual NOT_OBSERVED/RETOUCH 보고는 그대로 보존. 새 dark02 consumer를 과거 정책 actual PASS로 소급0 |
| 새 결과 | ready 전신 VISIBLE/HUD654·contained:true, 공개 Q 장식 preview frame0/2/6/23 및 fan 세 화면 unclipped 관측. idle5/Q4/preview9/consumer3=고유21종 증분 PASS(수리 이력 정본). native Q 성공0·전체24cell pixel PASS0·60FPS/캐릭터24장 미인수. VISUAL RETOUCH/exact1 WHOLE_COMBAT_VISUAL_UNIFICATION |

[2026-10-12 화면 품질 수리 정본](FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md).
<!-- SCREEN_QUALITY_20261012_APPENDIX_END -->
