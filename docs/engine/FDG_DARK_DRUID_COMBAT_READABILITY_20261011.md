# 다크드루이드 전투 표시 가독성 r8 · 2026-10-11

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

r8은 자기 격리 QA의 텍스트 배치와 기존 렌더 투영을 보정하는 단위다. native 전투의 좌표·시간·AI·Q/E·피해·포이즈·위험 영역, r5 rig/승인 PNG를 유지한다. r3/r4/r5/r6/r7 원문·검사·사진·GIF·보고는 당시 동결 이력으로 보존하며 이번 성공에 합산하지 않는다.

## 활성 조건과 소비 경로

| 항목 | r8 계약 |
|---|---|
| 식별 / URL | `dark-druid-combat-readability-r8`, `fdgDruidCombat=r8` |
| 자기 격리 gate | 기존 `window._FDGDruidQaStorage.active` 승인 경로와 r8 URL을 모두 요구한다. 기존 classic helper의 host/port/path/query 검증을 유지한다 |
| 공개 URL | `http://localhost:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgDruidSlam=r5&fdgDruidCombat=r8` |
| 실제 표시 gate | QA 설치 옵션 `combatReadability:true`이고 `mode==='native-ai'`인 동안만 `combatReadability` getter가 true다 |
| 카메라 | r8 loader는 기존 r7 `combatFraming` 옵션을 함께 켠다. 본편 camera·native actor/projectile 위치·맵 배치는 유지한다 |
| loader query | QA `combat-readability-r8`, 기존 r5 bridge `slam-contact-r5-cache2`와 contact rig 소비 유지 |
| 소스 | `engine/fdg/druid-combat-readability.js`, `engine/fdg/druid-encounter-qa.js`, `game.html` 한정 렌더 caller |
| 저장 | 기존 r4 자기 RAM 격리·own settings key `fdg.qa.dark-druid.encounter.r4` 유지. 이번 정상 play에서 저장 버튼/own persistent write/API write0. 실제 저장·재열기 roundtrip은 수행0 |

## 레이블과 동일 world projection

| API / caller | 계약 |
|---|---|
| `beginReadabilityFrame({transform,pixelScale,viewport})` | native world transform 직후 SSAA·실제 zoom·rounded camera·shake가 포함된 affine 배열 6개와 `pixelScale=_ssaa`를 전달. body/P/transform이 유효하지 않거나 비활성 모드면 frame을 null로 만든다 |
| per-frame transform | `[s*z,0,0,s*z,s*(VW/2+z*(round(VW/2−cam.x+shakeX)−VW/2)),s*(VH/2+z*(round(VH/2−cam.y+shakeY)−VH/2))]`, `s=_ssaa`, `z=_tzoom`. native draw에 이미 적용한 같은 값이다 |
| safe viewport | logical screen `[left:60,top:90,right:VW−230,bottom:VH−150]`을 현재 transform으로 world에 역투영. 기존 body native/posed envelope와 player world `±100`을 장애물로 사용한다. 정확 alpha/hit 영역 저작이 아니다 |
| `placeReadabilityLabel(anchor,width,height)` | world anchor/size·body/player 장애물·앞서 표시한 occupied label을 pure helper에 전달. 반환 rect를 occupied에 추가하고 labels/moved/overflow 누적. 텍스트 record와 actor를 변경하지 않는다 |
| hover tooltip | 기존 hover 판정·문자·폰트·수치·배경 유지, popup의 draw-local anchor만 배치. 모든 native nameplate/에너지 바를 일괄 이주하지 않는다 |
| floating text | 기존 `G.txts` 위치·life·문자·크기·alpha·바운스·흔들림·화이트리스트 유지. bitmap damage number와 일반 text의 draw-local 좌표만 배치하며 원 record write·hide/drop 없음 |
| `projectReadabilitySprite(x,y,width,height)` | logical screen `{x:(a*x+c*y+tx)/s,y:(b*x+d*y+ty)/s,width:width*a/s,height:height*d/s}` 반환. native frame은 축별 같은 양수 scale; 새 geometry/UV 생성 없음 |
| timed / non-timed VFX GL | 두 queue caller가 원 world 중심/크기를 같은 transform의 logical screen으로 전달. backend/shader/UV/color/alpha/angle/frame/life·원 world size 유지. Canvas fallback은 원 world 경로 |
| `readabilityWorldTransform` | 활성 frame transform의 새 배열을 반환하는 readonly getter |
| `readabilitySnapshot()` | transform/pixelScale/viewport/obstacles/occupied/labels/moved/overflow의 JSON 새 사본. native 실행 clock·actor·판정을 설정하지 않는다 |

## pure 레이블 검색과 한계

| export / 값 | 정확 계약 |
|---|---|
| export | `placeCombatLabel(options={})`, `COMBAT_LABEL_LAYOUT_LIMITS` |
| rectangles | `obstacles.length+occupied.length<=256` |
| candidates | 최대 `128`개. 거리 우선, 동률은 x/y 순서 |
| criticalCoordinatesPerAxis | 축별 최대 `16`개 가까운 장애물 임계 좌표 |
| viewportGridPerAxis | `5`, viewport fallback `5×5` |
| gap | 기본 `12` world px |
| 반환 | `{x,y,rect,moved,overflow,reason}`, `ok` 필드 없음 |
| 성공 reason | `clear` / `relocated` |
| fallback reason | `invalid-input`, `zero-area-label`, `zero-area-viewport`, `invalid-viewport`, `invalid-rectangle`, `rectangle-limit`, `label-exceeds-viewport`, `bounded-search-exhausted` |
| fallback 표시 | 원 anchor/rect와 `overflow:true`로 원 위치 표시 유지. malformed anchor 좌표는 null일 수 있다. 검색 소진은 배치 해가 없다는 증명이 아니며 hide/drop하지 않는다 |

## 독립 화마귀와 QA UI

화마귀는 펫이 아니라 `G._fireDevils`에 저장되는 독립 필드보스다. 펫 생성·대사 발동·AI는 이 단위의 수정 대상이 아니다. r7 QA의 petSubtitle visibility 소비는 기존 그대로 상속한다.

| caller / UI | 기존 값과 r8 한정 표시 |
|---|---|
| `_fdDrawEmerge` | world `dsz=280*(scale\|\|1)`, 기존 frame/late pass/색/alpha 유지. r8 활성 frame에서 같은 native SSAA+zoom+rounded camera+shake 행렬 소비 |
| `_fdDrawCharge` | world `dsz=200`, 기존 eye 위치/lighter/12프레임/충전 시간 유지. 같은 r8 world 행렬만 소비 |
| `_fdDrawOne` | 본체 world `280`, bob 진폭 `4`, 기존 몸체/바/색/late pass 유지. 같은 r8 world 행렬 소비 |
| 접촉 / 착지 | `100+P.r`, `108+P.r`, teleport landing world 반경 `210` 불변. 위협 직경 `420`과 원 emerge `280`은 다른 값이므로 새 정확 위협 텔레그래프로 주장하지 않는다 |
| title / aria | leaf `DARK DRUID · r8` / `드루이드 전투 QA r8` |
| compact QA | 기존 width `172px!important`, r8 max-height `170px`. 공개 전투 보기/설정 toggle 유지 |
| 지역 title | r8 body class에서 `top:12px;left:285px;width:330px;text-align:left`, 앞/뒤 장식 폭 `8%`. 기존 문자/폰트/색/animation/지속 `3.1초` 유지, 위쪽 예약 band로 이동 |
| compact HUD | mode·pause·native boss state·반올림 HP/eShield·player state/HP 표시. 화면 HUD와 별도 snapshot/event의 측정시점을 동일한 순간으로 가정하지 않는다 |
| 종료 | QA uninstall 기존 wrapper/listener/panel/style 정리와 r8 body class 제거. actor/save state를 조작하는 종료가 아니다 |

## 보호 계약과 새 검수 범위

| 대상 | r8 보존 / 검수 |
|---|---|
| native 전투 | timers/AI/phase·피해·Q/E·포이즈·위험 면적·독장판·투사체 판단/좌표·입력 유지 |
| 에셋 / 저작 | 승인 PNG·r5 rig/bones/weights/clips·원 sprite/UV/color/alpha/world size/frame/life 유지 |
| 환경 | 맵 geometry/route/collision/배치·본편 camera·native clock·기본/user 설정·공유 저장 유지 |
| 구 검사 | r3/r4/r5/r6/r7 suite/proof/derived/commit 재감사·재실행 0 |
| 새 실제 play | 자기 URL의 normal native AI 연속 play1건. HP/위치/강제패턴/phase/placement/restart 공개 QA 버튼 소비0. sampled fullframe·원본/파생·실측·실제 RETOUCH는 새 E8에 기록 |

<!-- R8_LIVE_RESULTS_BEGIN -->
## 신규 기술 검사와 실제 관측

| 항목 | 실제 결과와 범위 |
|---|---|
| pure helper | 최초 `test/fdgDruidCombatReadability.test.mjs` **5/5 PASS**, old suite0. `readability-helper-first-test.log`, `readability-helper-receipt.json` |
| synthetic API / 실제 추출 queue 계약 | 새 **4/4 PASS**. QA ready 모드 투영 없음·zoom .5/SSAA2 logical 투영·원 actor 위치/HP/쉴드 유지와 label/safe viewport·실제 추출 timed VFX consumer inactive/active 및 angle/alpha/UV 유지. `source-readability-check.mjs`, `source-readability-check-receipt.json`. 실교전/GPU benchmark가 아니다 |
| source syntax | root 변경 블록4 + 화마귀 worker3 syntax 모두 최초 PASS. 구 suite/구 proof 재실행0 |
| normal native play | `E8/native-ai-play`: 새 연속 play1건, sampled JPEG99장(1280×720, everyNthFrame8), state poll38개, 공개 action group18개. CDP first→last `7.852283954620361초`, `frames.json` recordWallMs `8054`(8.054초). 캡처 wall 시간과 sampled CDP 첫/마지막 간격은 다른 값이며 GIF duration은 아래 인계 행에서 구분 |
| 실제 입력 / 미사용 QA | W/A/D 방향 doubletap·held left mouse 무기·E/Q tap. QA placement/HP/forcephase/forcepattern/restart 버튼0. normal native `tideWave`/`spin`/`shock` 준비 상태 관측 |
| 기록 내 전투 결과 | mode native-ai→player-dead, playerHP502→0. bossHP21017 유지·HPdamage0·kill0. recorded eShield21017→12910, literal contact25건의 누적 감소8107. 누적8107을 근접 평타에 전부 귀속하지 않는다 |
| 좁은 실제 평타 접촉 | immutable plain `wSwing` ms135460, request162, eShieldDelta178/HPdelta0. 누적8107 전체를 이 평타의 결과로 취급하지 않는다 |
| E 물리 패링 | callback1, ms137751, inputE/classphysical/blackBeanfalse/friendlytrue/blueBean. 실제 native bluehit ms138418 request546의 외부 eShieldDelta2101은 nested hurtE가 포함될 수 있으며 독립 projectile identity/travel 전체 증명으로 확대하지 않는다 |
| Q / 패링 한계 | Q 입력은 있었으나 이번 success0, native-reflection callback0. magicQ/black 사례 미관측. 기존 Q/E 규칙·black E 금지 불변 |
| 표시 개선 / 렌더 경로 | title/hover/floating label relocation 및 화마귀 zoom projection 개선 관측, 완전 가림 해소 선언0. 기존 QA brightness115% parity 유지·원 bodyUV/colors/material/depth order 불변. 실제 WebGPU / GLqueue 비활성 / VFXinstanced false. GL queue projection 정합은 synthetic 근거이며 이번 live의 실제 GL 재생으로 주장하지 않는다 |
| 기록 후 상태 | 자연 linger 후 eShield12898은 기록 끝12910과 차12이며 별도 시점이다. 현재 public 물리 pause true/mode player-dead, `E8/review-entry.png`. 기록 마지막 값·후속 review 값을 동시값으로 합치지 않는다 |
| alive sampled frame 통계 | state polls38 중 alive31/dead cached7. alive sampled labels181/moved181/overflow0. 각 poll이 관측한 frame 집계이며 고유라벨 수/전체 렌더 FPS/전프레임 통계가 아니다. dead cached7을 살아 있는 표시 성공에 합산하지 않는다 |
| alive player pose poll | idle10/bladeDash2/wSwing2/wRecover4/pStun8/sBash1/sRecover2/stagger2, 합31. native tick별 모든 포즈/독립 행동 횟수로 확대하지 않는다 |
| 저장 / API / 사용자 상태 | own storage writes0·main/API/save roundtrip0. 자기 RAM 격리 유지. 사용자 탭/원 save 조작0 |
| 오류 계측 | 현재 consoleerror snapshot0. 전체 network404 계측은 미측정이며 전체 무404/무오류 PASS로 확대하지 않는다 |
| 실제 raw / full PNG | 같은 실행 `E8/native-ai-play` sampled JPEG99장 everyNthFrame8. `E8/derived/native-ai-play-{0015,0040,0047,0098}-full-frame.png` 각 full1280×720. 매 native tick/모든 원 canvas frame 캡처가 아니다. 원 source PNG 재생성/편집0, 기존 r7 자료 재사용0 |
| 실제 GIF | `E8/derived/native-ai-play-all-99.gif`, 640×360/uncropped/99장 전부, **19184533 bytes**, SHA256 `b2e38303da3ae464d3caadf3412e76c12187e9c1f9d1697f6fb9fcd2329dc865`. 누락/복제/보간/merge0, 정상 elapsed timing을 샘플 타임스탬프로 보존 |
| 시간 / 제한 | CDP first→last **7852.283954620361ms**, recordWall **8054ms**. 누적10ms 양자화의 관측구간7850ms + **미관측 terminal hold40ms** = GIF **7890ms**. 이 세 시간을 동일값으로 취급하지 않으며 GIF playback은 native frame/FPS·GPU benchmark가 아니다 |
| full-frame board | `E8/derived/r8-four-full-frames-board.png`, **2632×1758 / 3897667 bytes**, SHA256 `e953296e076c00c9083d98296e6749ef58e66a788d4271746a615a0dcf040a06` |
| phase caption 한계 | 0015 화면 패널은 idle이고 nearest poll은 wind다. 파일명/가까운 poll을 동일 순간 wind 확정으로 쓰지 않는다. 0040은 contact overlap, 0047 실제 HUD sRecover, 0098 death. root 원본 검수14/40/60과 추가8/46/54의 RETOUCH 판정을 새 데이터 검사가 대체하지 않는다 |
| 파생 receipt | `E8/derived/r8-derived-captures-receipt.json`, **14130 bytes**, SHA256 `1315b4c924c1286dfa2c855ebe0341ce8f066aadaee9f7fe5397ae03fa306e69`. 작성자 receipt 집계의 opts:null script 오류1회 수리; 이미지 생성 후 metadata 수리이며 이미지/GIF 재생성0. 새 실제 run 재생/반복0 |
| root source manifest | `E8/r8-final-source-manifest.json`. root 기존 own source10파일 baseline=HEAD byte-exact 확인 인계. docs 담당 Git/HEAD/source 재검사0; docs baseline8은 별도 backup/delta로 root에 전달 |
| 시각 판정 / 단일 잔여 | root 실제 fullframes0014/0040/0060 **VISUAL VERDICT: RETOUCH**. exact residual1 **COMBAT_VFX_CONTACT_OVERLAP**: frame0040 보라색 native VFX가 양몸 접촉 영역의 손/무기/피격 자세를 가린다. 전체 battle/kills/visual PASS0 |
<!-- R8_LIVE_RESULTS_END -->

<!-- R8_REPORT_BEGIN -->
## MAP PRODUCTION REPORT · 가이드 §23

| 구분 | 항목 | r8 실제 범위 / 결과 |
|---|---|---|
| STAGE | stage | 기존 Dark Druid NORMAL boss test/native QA, 자기 r8 정상 native 연속 play1. 새 맵 제작0 |
| MASTER | silhouette / regions / main route / side spaces | 전부 기존 맵 유지, 재감사0 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | 기존 geometry 유지, 재감사0 |
| LARGE | source assets / composites / overlap / repeated silhouette | 원 PNG/r5 rig·환경 asset 유지. 실제0040 native VFX 접촉 영역 가림 잔여. 새 FX geometry/alpha 완화0 |
| MEDIUM | connections / remaining holes | 기존 맵 유지, 재감사0 |
| GROUND | shadow / contamination / structure integration | 기존 맵 유지, 재감사0 |
| PLAYABLE | main arenas / travel space / breathing space / threat space | 기존 맵·native 전투/위험/독장판 판단 유지. normal play에서 player-dead·bossHP21017alive, kill0. 전체 battle/전경로 PASS0 |
| PLAYABLE | combat readability | 레이블/title·화마귀 native 투영 개선 관측. actual WebGPU/GLqueue false/VFXinstanced false. 접촉 손/무기/피격자세 native VFX 가림 RETOUCH |
| LANDMARK | primary / secondary / tertiary | 기존 맵 유지, 재감사0 |
| CAMERA QA | START / EARLY / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 이번 좁은 정상 보스전 외 경로 미관측. 이전 r7 검수 재사용 PASS0 |
| CAMERA QA | ARENA | 기존 r7 framing 소비와 새 r8 표시 투영 한정 정상 play 관측. fullstage/fullbattle camera PASS 선언0 |
| TECH QA | route / collision | 변경0·전수 검사0. firedevil contact100+P.r/108+P.r·telelanding210world/위험직경420 보존 |
| TECH QA | pageerror / 404 | 현재 consoleerror snapshot0, 전체 network404 미계측. trace 전체 무오류 PASS 선언0 |
| TECH QA | seam | 기존 sprite/UV/material/geometry 유지. 새 모션/geometry seam 검사0 |
| TECH QA | loading | 실제 자기 QA native play 렌더 관측. 전체 asset404/전경로 loading 검수0 |
| TECH QA | performance | bounded helper128후보/256rectangles·새5검사와 synthetic4계약 PASS. 새syntax4+3 PASS. GPU/native 성능 benchmark0 |
| FILES | stage-owned | 새 readability helper/test·QA/game 한정 caller는 root/작업자 소유. docs 정본1+기존8 owned delta |
| FILES | concurrent touched | 다른 작업자의 code/test/새파생 evidence와 공용 WIP 보존 |
| FILES | unrelated touched | docs 담당0·protected2_3/r7 정본 변경0 |
| GIT | staged / commit / push / deploy | docs 담당 전부0. root 정상 checkpoint 별도 |
| VISUAL VERDICT | PASS / RETOUCH / FAIL | **RETOUCH**, 실제 fullframes0014/0040/0060 근거. 기술 PASS로 전체 시각 PASS 대체0 |
| NEXT PASS | 정확 잔여 | exact1 **COMBAT_VFX_CONTACT_OVERLAP**. 보라색 native VFX가 양몸 접촉 영역 손/무기/피격자세를 가림. 신규 수리 범위 자동 확대0 |
<!-- R8_REPORT_END -->

## 문서 소유권과 증거

`E8=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-combat-readability-r8`에 수정 전 현재 8문서의 byte-exact backup/SHA와 appended/prepended delta를 기록한다. docs 담당 HEAD 비교/Git/코드/브라우저/테스트 실행 0, 기존 다른 WIP의 삭제/되돌림 0.

| 문서 | r8 소유 변경 |
|---|---|
| `docs/engine/FDG_DARK_DRUID_COMBAT_READABILITY_20261011.md` | 새 정본: gate/수치/API·실제 결과·§23 |
| `docs/engine/FDG_ENGINE.md` / `FDG_RUNTIME.md` / `FDG_INTEGRATION_INTERFACE.md` | 기존 원문 뒤 r8 scoped contract/link 추가 |
| `docs/engine/FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md` | 기존 이력 뒤 r8 격리 표시 링크 추가 |
| `docs/3.1 ui hud 디자인/exoduser-hud-redesign.md` | 지역 title/hover/floating 위치 계약 추가 |
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | VFX GL 투영과 독립 화마귀 world 행렬 계약 추가 |
| `docs/8.0몬스터디자인/몬스터_총관리.md` | 독립 화마귀 렌더 보정/고정 native 판정 계약 추가 |
| `docs/CHANGELOG_SYNC.md` | r8 entry prepend, 기존 전체 내용 유지 |

선행 기준은 [_MAP_SSOT_INDEX](../4.1맵디자인+설정/_MAP_SSOT_INDEX.md)의 읽기 순서와 [MAP PRODUCTION GUIDELINE v0.9](../4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) §23, 해당 UI/VFX/필드보스 SSOT다. 보호 `2_3`와 r7 정본/숫자/증거는 수정하지 않는다.
