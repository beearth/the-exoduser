# 다크드루이드 native 전투 프레이밍 · r7 · 2026-10-11

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

<!-- DARK_DRUID_THORN_FIRST_EXCEPTION_BEGIN -->
### 2026-10-11 · 자기 QA first 가시 fan 예외

아래 first opt-in만 별도 적용한다. 이 문서의 기존 녹색 orb/r4 수치·기본 본편·피날레·phase2+ 계약과 과거 결과는 원문 그대로 보존한다. 새 부분 성공을 이전 단위의 전체 완료로 합산하지 않는다.

| 항목 | first 예외 / 최종 한정 관측 |
|---|---|
| gate / native 생성 | own QA storage.active+fdgDruidThorn=first, ib·si0/3·!finale·phase0/1만. 기존 bossFanWind st2<=0 한 tick에12발 physical8(i%3!==2)/magic4(lanes2/5/8/11), phase0/1 black0. _druidThornVolley만 modulo3 drop/initial decoy aim 제외, pooled false/lane−1 reset·기존 후처리 적용 |
| 수치 / 원 권위 | 입력속도4.4·최종physical5/magic500/60..600/60px/native f. n=floor(atk×1.3), physical=floor(floor(2n)×.5)/magic=floor(2n). life/ml400 nominal·life−=sp*.667·기존거리내magic life1연장, 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0. wind=floor(25×teleM)+extraDelay(phase0/1base18/16), recover45→20clamp/cd100. native Q/E·black Q-only·poison+3·AI/시간/피해/poise/맵/사용자 save 기본값 유지 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| 아트 / pose 예외 | 해당 hostile flag탄만 ENGINE_AUTHORING 목질가시 quad/tri barbs localX[−27,32] 길이59/폭20, magic diamond X[−15,18]/Y±12·trailX−30. 기존 X WebGPU face<=4, bitmap/new backend0. fan pose dark-druid-native-thorn-fan-first 12tracks×6keys/1.6s/24FPS, native timer read-only·기존19본/UV/mesh/texture 유지 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 first](FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md). 정확 새 파생 자료·시간과 §23는 이 새 정본의 최종 기록을 따른다.
<!-- DARK_DRUID_THORN_FIRST_EXCEPTION_END -->

격리 QA의 정적 카메라 때문에 이동 중 보스가 화면을 벗어나던 접점을, 실제 native 보스·플레이어와 근처 탄의 렌더 경계를 따라가도록 수리했다. 관측한 살아 있는 AI 교전 구간의 카메라 포함은 PASS이며, 첫 교전의 플레이어 사망 FAIL과 후속 접촉 기록은 별도 보존한다. 전체 VISUAL VERDICT는 RETOUCH, 잔여는 `COMBAT_OVERLAP` 1건이다. 전체 stage·battle·보스 처치 PASS는 0이다.

기존 [r4 격리 교전·r6 입력 소비](FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md)와 [r5 내려찍기 접촉](FDG_DARK_DRUID_SLAM_CONTACT_20261011.md)의 원본문·수치·원산출은 동결한다. 원PNG와 r5 rig/scene, native actor/AI/판정/시간은 이번 프레이밍 단위의 제작 대상이 아니다. 아래 신규 결과에 이전 PASS를 합산하지 않는다.

## 진입과 적용 경계

| id / 접점 | r7 정확 계약 |
|---|---|
| 진입 | `http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgDruidSlam=r5&fdgDruidCombat=r7` |
| gate | 기존 `_FDGDruidQaStorage.active` r4 gate AND URL `fdgDruidCombat=r7`. r7 flag 단독으로 main/user save 경로를 활성화하지 않음 |
| 기존 storage gate | `/game.html`, localhost 또는127.0.0.1, port3333, test1/testchar1/bosstest0/fdgDruidQa r4. 혼합 editor/demo/bic/char/booth/mapqa/projectilelab/dropPreview/stage query는 기존 inactive 계약 유지 |
| QA 소비 | `installDruidEncounterQa({combatFraming:true,...})`; `combatFraming` getter는 r7 AND `mode==='native-ai'`일 때 true |
| AI 시작 | r7만 `cameraLock=null`, `combatFrame=null`, compact panel 적용 후 기존 공개 AI 시작 경로 사용. 강제 패턴 자료와 정상 native AI 선택 자료를 구분 |
| native 카메라 적용 순서 | 기존 camera 계산·map clamp→기존 r4 cameraLock 적용→QA `frameCombatCamera`→`ok:true`일 때만 G.cam.x/y 및 G._camZoom 적용→기존 mouse projection 동기화 |
| 보호 | 본편/default camera, map/nav/배치/collision, actor/projectile 좌표, AI·native tick·Q/E·damage·poise, r5 rig/원PNG·사용자 save 유지. 전역 Storage/fetch proxy·새 서버·게임 복제0 |
| r7 QA cache | 현재 r7 QA module query `combat-framing-r7-contact1`; inactive/r4 기존 module 선택과 r5 bridge/fixture 계약 유지 |

## 순수 카메라 API

`engine/fdg/druid-combat-frame.js`의 `fitDruidCombatFrame({bounds,viewport,safeRect,previous,dt,mapBounds})`는 렌더 카메라 값만 계산한다. actor/탄 입력을 이동하거나 native 시간을 진행하지 않는다.

| 입력 / 출력 | 단위·형태·값 |
|---|---|
| `bounds` | 비어 있지 않은 rect 배열 `{left,top,right,bottom}`, world px, finite·left≤right/top≤bottom. 전체 union 사용 |
| `viewport` | `{width,height}` 양수 finite, native logical screen px; caller의 VW/VH |
| `safeRect` | logical screen px, viewport 내부의 양의 폭·높이 rect |
| `previous` | optional `{x,y,zoom}`; 현재 native G.cam과 G._camZoom을 전달. x/y finite, zoom>0 |
| `dt` | finite·0 이상, native `_dtSp` frame-step 단위. seconds/RAF delta/저작24FPS로 변환하지 않음 |
| `mapBounds` | optional world px rect; caller는 `{left:0,top:0,right:G.mw*T,bottom:G.mh*T}` |
| zoom 범위 | MIN_ZOOM0.3 / MAX_ZOOM0.8 |
| 목표 zoom | safeWidth/unionWidth, safeHeight/unionHeight, 0.8의 최솟값을0.3..0.8 clamp. union 폭/높이0인 축은0.8 사용 |
| zoom-out / zoom-in | 축소는 목표에 즉시 적용. 확대는 `previous.zoom+(targetZoom-previous.zoom)*(1-.94**dt)` 후0.3..0.8 clamp |
| center | safeRect 중심 offset을 반영한 ideal world center로 `1-.92**dt` 추종 후 safe containment 구간과 native map camera 구간의 교집합 clamp |
| 작은 map | map 길이가 전체 viewport world 크기 이하인 축은 native와 같이 map 중앙에 고정 |
| 허용 오차 | EPSILON1e-7 screen/world 계산 경계. 투영된 union이 safeRect 안에 있으면 `contained:true` |
| 정상 반환 | `{ok:true,x,y,zoom,targetZoom,bounds,safeRect,contained,reason}`; bounds는 새 union, safeRect는 새 사본 |
| 불가능 containment | 계산은 유효해도 `contained:false`. reason은 `bounds-exceed-safe-viewport`, `map-bounds-conflict`, `bounds-not-contained` 중 해당 이유. 실제 포함 PASS로 승격하지 않음 |
| 잘못된 입력 | `ok:false`와 `invalid-bounds/invalid-viewport/invalid-safe-rect/invalid-dt/invalid-previous/invalid-map-bounds/invalid-frame-geometry`; x/y/zoom/targetZoom/bounds/safeRect=null, contained=false |

QA safeRect는 `{left:min(60,width*.05),right:width-min(230,width*.18),top:min(90,height*.125),bottom:height-min(150,height*.21)}`다. 안전 화면과 map 경계가 동시에 만족되지 않을 때 actor 위치를 바꾸어 containment를 만들지 않는다.

## native 렌더 경계와 입력 투영

| 대상 / 관측 필드 | r7 경계 구성 |
|---|---|
| 보스 sheet envelope | native spec/r로 `dh=e.r*spec.dh`, `halfW=max(e.r*spec.dw*.5,dh*.56)`. offset=`window._btOffsetY||0`, tdY=`e._teleDropY||0`, scale=`window._btScaleMul||1`, base=`e.y+offset+scale*(tdY-6)`; left/right=e.x±halfW, top/bottom=base−dh*.86 / base+dh*.14 |
| 보스 pose union | 같은 actor의 bridge `getRenderSnapshot(e).bounds`가 있으면 e.x/base 기준 actual posed render rect와 union. source는 `native-sheet-envelope` 또는 `native-sheet-envelope+posed-render`. 실제 frame의 alpha crop을 복원했다는 뜻이 아님 |
| 플레이어 | P.x/y±100 world px의 보수적 무기 여백. 정확 alpha bounds 아님 |
| 근처 탄 gate | life>0 AND `_druidPoison`/`_druidStraight`/friendly 중 하나. 현재 탄 중심이 body/player union±240 world px 안에 있을 때만 포함. 원격 탄/탄도 전체가 포함된다는 보장 아님 |
| 적대 Druid poison | dw=`(_druidMine||elemBall?240:clamp((sz||4)*24,96,180))*_physicalProjectileMultiplier(p,2)`; h는 기존 fly 이미지 natural aspect ratio, 미준비 시 dw. 현재 native physical 렌더 크기를 소비 |
| black/blue | rb=`3.5*clamp((sz||1)*1.5,1.2,4)*.7*_physicalProjectileMultiplier(p,2)`; core r=rb*3.5와 기존 velocity7 trail 끝±rb*.9의 union |
| 그 외 탄 | callback 경계가 없으면 r=`clamp((p.r||p.sz||12)*2,24,64)`의 현재점 rect |
| `combatSnapshot()` | 저장된 frame의 JSON 새 사본 또는 null. pure 반환 필드에 `includedShots` 근처 탄 개수, `bodySource`를 추가. actor ID/독립 shot 검증을 새로 제공하지 않음 |
| mouse projection | 같은 active r7 native-ai gate에서 현재 zoom을 기존 `_syncDruidFinaleMouse` 및 `_setMouseFacing` caller에 반영. 기존 gamepad bypass와 editor/default projection 유지 |
| 캐시 경계 | 마지막 combat frame이 남아 있어도 현재 camera와 같다는 뜻이 아님. player-dead mode의 cached frame을 live containment PASS로 세지 않음 |

## 공개 QA와 관측 계약

| 접점 | 현재값·수명 |
|---|---|
| panel | r7 aria-label/title. `전투 보기 / 설정` 공개 toggle로 compact 전환; compact width172px!important/padding8px!important, strong/output/toggle만 유지 |
| 펫 자막 | r7 body class에서 `#petSubtitle {visibility:hidden!important}`. 원 대사·발동·펫 AI 변경0. uninstall에서 자기 style/body class 제거 |
| HUD 에너지쉴드 | r7 HUD는 native eShield 잔량을 Math.round로 표시. 기존 `snapshot().boss`의 HP와 HUD 쉴드 표시를 같은 필드로 표기하지 않음 |
| `native-boss-contact` | r7에서 original hurtE를 먼저 실행하고 original return을 보존한 뒤 HP/쉴드 감소가 있을 때 기록. private force/대미지 주입0 |
| contact 필드 | requested, hpDelta, shieldDelta, hp, eShield, playerState, playerStateTicks, opts; native 호출 전후값 및 원 opts를 관측. 고스트 화살·DOT·poiseHit 공격을 평타로 자동 분류하지 않음 |
| 공개 명암 설정 | 검수의 기존115% 설정은 live canvas filter `contrast(1.05) brightness(1.1155)`로 소비. 자기 QA RAM만 saveSettings memory 갱신; 실제 설정 저장 버튼 사용0·own persistent write0·API0·사용자 tab 조작0 |
| 저장 경계 | 기존 r4 own settings schema/key 유지. camera/combatSnapshot/native actors를 새 저장 payload로 추가하지 않음. 이 단위에서 새로운 Save/reopen 인수 주장0 |
| 해제 | uninstall은 자기 wrapper가 현 함수일 때만 원복, 기존 timer/listener/panel 제거와 r7 style/class 제거. 추가 독립 RAF/전투 clock 없음 |

## 신규 기술 검사와 실제 교전 자료

문서 담당은 코드·브라우저·tests·Git·이전 proof를 실행하지 않았다. 아래 값은 각 소유 담당의 이번 r7 인계값이며, 최초 성공 범위 재실행0·old suite0이다.

| 검사 / 자료 | exact 관측·결과·범위 |
|---|---|
| 순수 frame 검사 | `test/fdgDruidCombatFrame.test.mjs` 최초4/4 PASS. 이동하는 body/무기/player/근처 탄 containment, zoom smoothing, 불가능/invalid 입력, 입력 불변 범위. native 실전 성공으로 확대하지 않음 |
| consumer 검사 | root 새 QA node --check, 변경된3소스블록 파싱, mouse projection 활성/비활성/gamepad3케이스, owned4파일 diff --check PASS. 성공범위 반복0·old suite0. 문법/입력 guard를 추가 native gameplay test로 합산하지 않음 |
| 첫 normal AI 자료 | `native-ai-combat` raw616장, CDP 관측9.464100122451782초, leading ready3장. 실제 AI 이동·held weapon·Q 반사 응답 관측. player dead/HP0·bossHP21017/alive·eShield current6301: 첫 교전 사망 FAIL 보존 |
| 첫 camera coverage | native-ai182poll에서 actual camera=fit 및 contained=true. death107poll은 cached frame이며 actual camera 불일치; 사후 death cached 값을 live PASS에 포함하지 않음. weapon wSwing18/wRecover67·돌진17poll |
| 첫 Q 관측 한계 | native Q magic blue friendly2 entry는 동일ms76706이며 ms77446 NULL1을 포함한 최종 array3. 개체ID·독립 shot 확인0. Druid straight black 성공0/native-reflection event0; 주변 magic 응답을 Druid black 성공으로 확대하지 않음 |
| 후속 별도 교전 | `native-ai-contact` raw314장/160poll·CDP4.9739179611206055초, leading ready3장. 정상 AI·실제 근접/카메라를 고려한 공개 held attack·방향 더블탭 입력. 첫 사망 기록과 clip을 이어 붙이지 않음 |
| native 실제 접촉 | original hurtE 이후 `native-boss-contact`14entry. 실제 weapon active hit ms47077, player wSwing/st2=3, opts `{kbMult:1,poiseMult:1.5,noPoise:false,poiseHit:false,poiseSkill:false}`: shieldDelta145/hpDelta0 |
| 평타 제외 | 별도 첫940 옵션 poiseHit=true와 ghost arrow/DOT를 평타로 세지 않음. 14entry 모두 독립 평타14회라는 뜻이 아님 |
| 에너지쉴드 선흡수 | 시작 eShield21017→최종15170, 총5847 누적 감소; native HP21017 유지. native hurtE 근거로 HP 미감소 원인은 기존 에너지쉴드 선흡수. HP 감소를 새 force로 만들지 않음 |
| 후속 종결 | player alive/HP1835.134375·boss alive/HP21017, kill0. 두번째 Q/E 성공0. 실제 피해 접촉 관측을 Q/E 성공·보스 HP 감소·처치 PASS로 확대하지 않음 |
| 현재 viewport | 공개 paused native-ai review에서 현재 양측이 viewport 안에 포함. live camera는 관측 구간 내 PASS이며 fullstage/fullbattle/kills PASS0 |

| 최종 판정 | 값·남은 범위 |
|---|---|
| VISUAL VERDICT | RETOUCH |
| 잔여 exact1 | `COMBAT_OVERLAP`: ambient 몹/효과·이름표·지역 타이틀이 플레이어/보스 실루엣을 가림 |
| 첫 실패 보존 | 플레이어 사망·보스 생존 FAIL. 후속 contact 관측으로 첫 실패를 덮어쓰지 않음 |
| 현재 인수 범위 | live camera 관측 구간 PASS·실제 native 쉴드 접촉 관측. 전체 stage/battle·처치 PASS0 |

## 새 자료와 파생본 인계

| 항목 | 위치 / 현재 인계 상태 |
|---|---|
| E7 | `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-combat-framing-r7/` |
| 첫 전체 GIF | `derived/native-ai-combat-all-616.gif`: 원본616/616,640×360,112220374B, CDP9.464100122451782초→GIF9500ms. SHA256 `ccfe259621f7d29e78c906f14165883d02ef154ebdfd91870d900a5d2edb66d1` |
| 별도 contact 전체 GIF | `derived/native-ai-contact-all-314.gif`: 원본314/314,640×360,62392741B, CDP4.9739179611206055초→GIF5010ms. SHA256 `6127f0b79ca78d75ff2ec588c3eac9d96cdc3b05541497b2dc2598ca87a58a46` |
| 재생 시간 경계 | 각각 leading ready3과 마지막 미관측hold40ms 보존. merge/drop/duplicate/interpolation0·두 clip 연결0. 10ms 최소 순서 보존 양자화의 최대 누계오차는 첫11.893ms/둘째12.442ms; viewer의 short-delay clamp는 제어할 수 없어 실제 표시 wall-time을 보장하지 않음 |
| 첫 full-frame board | `derived/native-ai-combat-six-full-frames-board.png`: 2632×2532,1280×720 원본6장1:1. 첫 실패 record를 성공 contact로 교체하지 않음 |
| contact full-frame / board | `derived/native-ai-contact-{0012,0160,0313}-full-frame.png`: 각1280×720. `derived/native-ai-contact-three-full-frames-board.png`: 2632×1730/3561032B, SHA256 `862520c7a9987c06d2b069031242b9a6de7939a2c2cc222ba2fa0f358deb208c`. 원RGB1:1·외부 label만 사용 |
| 0012 표시 시각 구분 | wSwing 및 native 이름표 eShield19932가 관측되며 QA panel20077은 갱신이 늦은 별도 표시값. 같은 시각의 native 쉴드 값 또는 ms47077의 exact event frame이라고 주장하지 않음 |
| 0313 / finalstate 시각 구분 | contact board의 촬영0313 표기 player1947/panel15280과 마지막 CDP finalstate playerHP1835.134375/eShield15170은 관측 시각이 다르므로 동시값으로 합치지 않음. root의 공개 물리 정지 후 review-entry.png는 마지막 player1835/shield15170 표시와 대응 |
| 첫 파생 receipt | `derived/r7-derived-captures-receipt.json`: 156713B, SHA256 `79a462ca2fc43516d57e53ec60272bdacc4326746221fd4517ab22d033260466` |
| contact 파생 receipt | `derived/r7-contact-derived-receipt.json`: 85653B, SHA256 `310602e048658e7db8455229ae0fec0f978d63ccea2c9126c7781e5780af94ba` |
| 최종 artifact index | `derived/r7-derived-artifacts-final-index.json`: 6580B, SHA256 `4c5bdedaaf3ac9934281ba884e37d85c8c3709a336b9b00471a3f8c7f06b5ff2`. 목록은 이 새 정본을 참조; docs 담당의 artifact 재검사0 |
| root 최종 인계 | `review-entry.png` 실제 화면에서 VISUAL RETOUCH/COMBAT_OVERLAP 확인. `source-check-receipt.json` 및 `final-receipt.json`은 root 소유 결과 |
| docs 근거 | E7/docs-combat-framing-rg-before.log / docs-combat-framing-literal-grep-before.log / docs-combat-framing-search-receipt.json. whole docs 마지막 rg/literal grep1회 로그와 docs-combat-framing-receipt.json으로 마감 |

## MAP PRODUCTION REPORT · 가이드 §23

이번 단위는 기존 native arena의 actor framing/전투 화면 QA이며 새 map 제작·geometry·배치 변경0이다. 제작 가이드와 MAP SSOT index를 읽었으며 기존 MASTER→OUTER→GROUND 공간 계약을 변경하지 않는다. 아래의 미실측 항목은 기존 PASS를 복사하지 않고 범위를 표시한다.

| §23 그룹 | 필수 항목 | 이번 단위 보고 |
|---|---|---|
| STAGE | stage | 기존 Dark Druid NORMAL native arena / exact r4 QA+r7 opt-in |
| MASTER | silhouette / regions / main route / side spaces | 각 변경0; 새 전체맵 인수0 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | 각 변경0; outer 재저작·재감사0 |
| LARGE | source assets / composites / overlap / repeated silhouette | 환경 source/composite 변경0; 원PNG/r5 body 재사용. 환경 overlap/silhouette 재감사0 |
| MEDIUM | connections / remaining holes | 변경0; 연결/hole 신규 검수0 |
| GROUND | shadow / contamination / structure integration | 각각 변경0; 기존 native ground 유지 |
| PLAYABLE | main arenas / travel space / breathing space / threat space | 각 geometry/배치 변경0; 공개 native AI·이동·held attack을 새 관측 |
| PLAYABLE | combat readability | 관측한 live camera 범위 PASS; COMBAT_OVERLAP 잔여1로 VISUAL RETOUCH. 첫 교전 사망 FAIL·전체 battle PASS0 |
| LANDMARK | primary / secondary / tertiary | 각 변경0·새 hierarchy 인수0 |
| CAMERA QA | START / EARLY / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 각 전체 route/frame 신규 인수0. arena 결과를 이7개 구간에 확대하지 않음 |
| CAMERA QA | ARENA | native-ai live182poll actual fit/contained; death107cached 제외. 후속 paused review 양측 현재 viewport 포함. fullstage 카메라 인수0 |
| TECH QA | route / collision | 각 구현 변경0·이번 단위 재검사0 |
| TECH QA | pageerror / 404 | 이번 인계의 새 수치 미실측; 이전0을 신규 관측으로 복사하지 않음 |
| TECH QA | seam / loading | 원환경 seam 변경0; rig/PNG 기존 소비. 새 전체 loading/route 인수0 |
| TECH QA | performance | pure4검사·QA syntax/소스3블록/입력3케이스/diff check는 기능·문법·변경 경계 범위. 실제 전체 native/GPU 성능 인수0 |
| FILES | stage-owned | game.html의 한정 r7 consumer, engine/fdg/druid-combat-frame.js·druid-encounter-qa.js, test/fdgDruidCombatFrame.test.mjs 및 이번 문서 |
| FILES | concurrent touched | root 코드/실교전, 순수 검사·파생 자료 담당이 같은 checkout 사용; 타인WIP 유지·되돌림0 |
| FILES | unrelated touched | 문서 담당 코드/old proof/Git/browser/tests·보호2_3 변경0 |
| GIT | staged / commit / push / deploy | 문서 담당 실행0. checkpoint는 root가 별도 수행; 이번 문서로 배포/전체 완료를 주장하지 않음 |
| VISUAL VERDICT | PASS / RETOUCH / FAIL | RETOUCH |
| NEXT PASS | next pass | exact1 COMBAT_OVERLAP: ambient 몹/효과·이름표·지역 타이틀의 실루엣 가림 정리. native 판정·Q/E·맵·원PNG 보호 |

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · 현재 paused / ready fit 후속

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| 현재 화면 | 물리 정지 draw도 dt0 camera-only fit. combatFraming의 ready/forced-pattern/native-ai/player-dead는 live boss bounds 소비; 활성 fit에서 cameraLock getter 우회 |
| idle | first+r5에서 dark-druid-slam-contact-idle-r5 2초/24FPS, G.stageTime/60 → floor(seconds×24)/24 %2. 19본/원PNG 유지, walk·다른상태 fallback |
| frozen ready body | paused ready/forced 현재 live boss만 draw alpha1; _spawnT/physics write0. ready paused 전신 VISIBLE 인수; 정상 전투/다른 pose 판정은 별도 |
| old report | 이전 r7 actual/실패/수치는 동결. 새 ready 포함 범위와 visible body 검수는 새 정본에서 별도 기록 |
| 새 결과 | ready 전신 VISIBLE/HUD654·contained:true, 공개 Q 장식 preview frame0/2/6/23 및 fan 세 화면 unclipped 관측. idle5/Q4/preview9/consumer3=고유21종 증분 PASS(수리 이력 정본). native Q 성공0·전체24cell pixel PASS0·60FPS/캐릭터24장 미인수. VISUAL RETOUCH/exact1 WHOLE_COMBAT_VISUAL_UNIFICATION |

[2026-10-12 화면 품질 수리 정본](FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md).
<!-- SCREEN_QUALITY_20261012_APPENDIX_END -->
