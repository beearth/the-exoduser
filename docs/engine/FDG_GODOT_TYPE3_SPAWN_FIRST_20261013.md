<!-- fdg-godot-native-owner-element-integration-20261013:begin -->
## Godot 소환·6원소 실행 연결 / 현재 이식 경계 · 2026-10-13

| 항목 | 현재 코드·검증 / 미완 범위 |
|---|---|
| 정본 | `docs/engine/FDG_GODOT_TYPE7_INTEGRATION_20261013.md` 및 `FDG_GODOT_TYPE3_BINDING_20261013.md`. 이번 새 production은 실제 World 시계·registry, type3 binding, 원 6속성 packet→투사체→피격FX, type7 조립 API이다. 원337/supportfalse/runtimeNULL·기존 텔레포트/M30/6source/배송5 증거는 보존한다. |
| 시계·생성 순서 | World priority−1 `ticks=min(delta×60,3)`/actual frame·ens Array identity→관리 owner1→원 particle pool update→warning1→기존탄 priority1→새탄 birth2→hitFX post3. getter setter0/AI 이중 자동실행0/SceneTree pause 상속. 초기 report와 동적 child registry를 구분한다. |
| source packet | `_commit`도 dmg×2/sz×2/r4×1.3=5.2. P redBean .5를 후적용해 raw피해 유지/300pxs; magic500..600. P/L/H size3·margin13, F/I/D size3.2·margin13.6. type3 life60/type7common240/TPqueued300, decay.667·homing.00655/life>30. D caller-life60/240 pair만 지원/범용D120 alias0·추가poison0. |
| 실제 피해·FX | type3 F/H는 magic·headingKB2, D는 정규화피해×1.3 magic·기본hurtP KB보존. M29 body는 모든원소 phys이며 elMul 선배율→기본hurtP→독립KB100. current armor미착용 native 배율1. 실제 hitFX 새원bitmap4 합779557B(512²/4×4/cell128²) 최초import4/3.545726167초/ERROR0·oldtexture reimport0. |
| source 상태·입장 | raw source와 별도 actor ctor payload에 facing/eShield/eShieldMax/eRes/native_flags/bodyrect/direction/ai_profile만 투영한다. absent nativeflag는 absent 유지(null/false 발명0). M29 Q/E·warning·impact·SOUND 4cap 및 실제6원소·summon_context가 준비되지 않으면 type7 configure/prepare/install 원자거부. sourceRecord와 pendingJSON은 수정하지 않는다. |
| 현재 기술 인수 | 새고유12PASS=type3 binding4+실World phase2+6원소/FX4+type7 assembly2. assembly는 첫missingM29 1PASS/actual1FAIL→실패actual1만추가FAIL→같은실패1만1.948709167초/exit0/assert0/ERROR0 PASS 이력. source map Dictionary8/absentflag 투영을수리했으며원337/TP본문불변, 모든성공재실행0. actualWorld16frames/owner32·particle/warning/birth/post 각16·pause4, actualFHD Player피해/KB·FX pool12·65생존/66만료·invalid8 부분출력0. |
| Main·배송·시각 | 이번조립 API는 Main/factory 자동등록0. current Main source지원6/미10, 동결Web·Windows배송5/미11. constructor readiness fixture를실제공개Q/E·자연소환/교전·publicpixels/GPU·최저1080p240·24고유프레임/24FPS로승격하지않는다. **VISUAL VERDICT: RETOUCH**. |
| 다음 실제 연결 | 새type7 actualassembly기술단위를 정상 code+관련docs checkpoint→같은SKILL actualNativePlayer 명령/패링 leaf 및 ANIM M29 owner-event소비→본편 자연소환/텔레포트/교전·시각검수. source수치·원MAP/geometry/nav/STARTEXIT·보호paused화면/서버/save/타WIP 유지. |

<!-- fdg-godot-native-owner-element-integration-20261013:end -->

# Godot type3 소환 생성기 · 2026-10-13

`godot/scripts/type3_spawn_recipe.gd`는 CH1 `stage0`에서 `mkEn(sx,sy,0,3,false,el,room)`을 계산하고 원 `eSummon`의 후처리를 적용하는 실제 호출 가능 생성기다. 원본 `R=/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`의 좁은 `mkEn`·`rollElite`·`rollMods`·`_assignMobSkin`·`eSummon` 경계를 소비한다. 생성 결과를 실제 배우 생성 callback에 전달할 수 있지만 이 파일이 actor·factory를 등록하거나 자연 소환 scheduler를 실행하지는 않는다. source16 지원6/미이식10, 동결 Web/Windows5/11, etype7 미등록은 유지한다.

| id / 적용 위치 | 정확 현재 값 / 경계 |
|---|---|
| 파일 / schema | `type3_spawn_recipe.gd` / `ExoduserType3SpawnRecipe` / `exoduser.godot.type3-spawn-recipe.v1` |
| 소유 범위 | 새 생성기·새 검사·이 문서·외부 증거 디렉터리만. shared Player/factory/config/다른 문서/Git 편집0 |
| source reference | canonical `game.html`: EL15066, zero eRes15069, tier/prob/mod31695..31745, mkEn31782..32003, skin23788..23801, eSummon41372..41394, addParts44445..44446 |
| 지원 stage | 정확 `stage=0`만. 나머지 stage는 `stage0_only_other_native_elite_pools_unported`로 명시 거부; 다른 stage의 elite/mod/aura 풀을 CH1 값으로 대체0 |
| context | `stage:0`, `room:int`, `player_level:int≥1`, `difficulty:int0..10`, `stage_difficulty_offset:int`. 대상 native room 값과 caller의 실제 레벨·설정을 소비 |
| element | 0 physical / 1 fire / 2 ice / 3 dark / 4 lightning / 5 holy. 독립 child마다 선택; energy6은 이 소환의 원 후보에 없으므로 거부 |
| RNG authority | caller 소유 `Callable`의 finite `[0,1)`만. 자체 seeded RNG/개체별 새 seed/전역 override0. 기존 Godot에 HTML과 같은 공유 native RNG kernel은 아직 확인되지 않았으며 callable 연결 전 전체 RNG parity 주장0 |
| 생성 전 collision | 먼저 `can_move(x,y,10)`. 막혔으면 caller의 원 `safe_point(x,y,10)` 결과로 x/y를 보정. 실패는 explicit error이며 무작위 draw0; 최종 random r를 이 최초 반경10 대신 쓰지 않음 |
| source safePt 역할 | 원 T40, 거리40..200/step20·8방향 탐색은 실제 world callback의 책임. 이 생성기는 다른 맵 collision이나 좌표를 생성하지 않음 |
| 좌표 precision | recipe Dictionary의 x/y는 double scalar. 생성기에서 Vector2로 좁히지 않음; Godot actor body 위치로의 변환은 후속 actor 경계 |
| native elite | `U<.03`이면 magic1, `U=.03`이면 normal0. rare/champion 확률0. parent elite를 자식에게 복사0 |
| native mod | magic이면 `int(U×2)`로 `[M29,M30]` 중 1개. normal `mods=[]`, 두 경우 `aura=null`. mod flag 삭제/elite0 강제0 |
| 난이도 레벨 offset | `[-500,-400,-300,-200,-100,0,100,200,300,400,500]` |
| 난이도 HP/ATK 배율 | `[.45,.55,.65,.76,.88,1,1.12,1.25,1.40,1.58,1.78]` |
| monLv | `max(1,player_level+DIFF_LV_OFF[difficulty]+stage_difficulty_offset)` |
| source HP curve | lv≤500: `.4×lv³+199×lv+100`; lv>500: `50000000×1.0014^(lv−500)`; 전체×2.925. pacing=`1/(1+min(9,max(0,lv−1))/18)` |
| factory HP | `floor(curve×pacing×difficultyMul×(magic?2:1))`. stage0의 후속 `floor(lvHp×(1+si×.02))`는 같은 정수. unused type3 baseHP10을 final HP로 쓰지 않음 |
| ATK | `floor((50+monLv×1.95)×.6×difficultyMul×(magic?1.3:1))` |
| speed | 원 type3 raw.75→×1.3=.975, `(.75×1.3+U×.08)×1.5` pixels/native tick. normal·magic 동일; M29/M30을 M02 speed 배율로 대체0 |
| radius | `(10+U×2)×2×(magic?1.08:1)`; normal20..24 미만, magic21.6..25.92 미만 |
| idle/facing | `st2=30+U×50`, `facing=U×2π` |
| projectile | `projCd=240` normal / `trunc(240×.8)=192` magic, `projT=180+U×120`, `chargeT=0/chargeCd=9999` |
| 사용하지 않는 RNG draw | `bossPatT=30+U×20`, `_bossOrbitAng=U×2π`, `_erraticAng=U×2π`도 object literal 순서대로 소비. `bossPatCd=9999/_erraticT=9999`라 이 값을 보스/지그재그 AI로 승격0 |
| constructor RNG 순서 | elite→선택 mod→speed→radius→idle→facing→projT→bossPatT→bossOrbitAng→erraticAng. normal9 / magic10 draws |
| summon 후처리 | `hp=JS ToInt32(factory_hp×.5)`, `mhp=hp`, `eShield=0/eShieldMax=0`; `poise=maxPoise=factory_hp` 유지, HP 반감에 poise를 다시 맞추지 않음 |
| baseline Lv1 NORMAL | normal factoryHP875→childHP437/ATK31/poise875/shield0. magic factoryHP1751→childHP875/ATK40/poise1751/shield0 |
| 독립 mutable state | child마다 `kb:{x:0,y:0}`, zero eRes7, fresh modT21개. parent/sibling dictionary alias0 |
| 원 modT21 | regen/summon/tp/chaos/vortex/lightning/twarp/cloned/revived/split/sentry/sentryAng/sentryOn/illusioned/stealthT/eliteBusy/eliteCharge/eliteRing/eliteBolt/eliteMortar. source에 없는 초기 eliteBeam/_hitStun 키를 생성기에서 추가0 |
| 원 초기상태 | alive=true/s=idle/stunned0/poiseR0/_spawnT20/_iceOnHitfalse/_iceFreeze0/_firstShotfalse/native60. native type3 본체 col은 `ETYPE_COL[3]=#66ee66`이며 recipe에 col키 없음; 후속 actor가 이 상수를 소비 |
| atlas | 원 `img/atlas_ch1_8dir.json`: cell256/cols8/rows5/total40. `(3×7+JS ToInt32(x×31))&0x7fffffff`, index=`seed%40`, col=`index%8`, row=`trunc(index/8)` |
| skin authority | 보정된 실제 x와 `_homeX=x`. 부모 flesh_crawler 강제0·논리 type3를 특정 skin에 고정0·기존 PNG 변경/복사/hash/import0 |

## 실제 공개 API

| 함수 | 동작 / 결과 |
|---|---|
| `configure(native_random,can_move,safe_point)->bool` | 유효 Callable3개를 보존하며 실제 RNG draw0. 자체 source seed 생성0 |
| `build_child(x,y,context,element_id)->Dictionary` | `{valid,error,recipe}`. 유효 recipe의 필드는 원 JS 이름으로 x/y/r/hp/mhp/atk/baseAtk/speed/baseSpd/el/etype/room/lv/ib/alive/s/st2/facing/elite/mods/aura/poise/maxPoise/eShield/초기 timer/skin/modT를 제공. `factory_hp`는 반감 전 HP 보존 |
| `summon_type7(x,y,context,child_consumer,spawn_fx)->Dictionary` | count=`1+trunc(U×2)`→각 child의 angle=`2π×i/count+U`, distance=`30+U×20`, element=`trunc(U×6)`→source constructor→actor 소비 callback→spawn FX callback. 실제 순서대로 호출하는 생산 코드이며 배우 종류 alias나 child drop0 |
| `child_consumer(recipe)->bool` | 새 실제 actor를 만들 접점. recipe를 재추첨하지 않고 hp/poise/mod/element/skin 그대로 소비할 책임. false면 explicit rejection/consumed_count/failed_child_index 반환; 이후 child를 조용히 건너뛰지 않음 |
| `spawn_fx(sx,sy,"#8833cc",8)` | 원 `ens.push` 뒤 `addParts`의 접점. collision으로 actor가 safe point로 이동해도 원 sx/sy에 FX 생성. 원 pool/hiFPS guard와 RNG를 공유할 책임 |
| `skin_from_spawn_x(x)->Dictionary` | `{skin,index,cell:256,col,row,chapter:1}` readonly 계산; 원 atlas 메타의40개 이름/col/row 그대로 |
| `get_last_error()->String` | 최근 configure/생성 거부 이유. 전체 actor consumer 준비를 이 문자열로 PASS 승격0 |

`summon_type7`의 entry는 해당 update의 원 `eSummon` particle 분기 **이후**다. channel particle의 `Math.random()>.5`·좌표/size draw와 poolPart의 hiFPS draw를 이 생성기가 생략한 것으로 전체 RNG parity를 주장하지 않는다. child 뒤 원 `addParts(8)`는 `trunc(8×.6)=4` particles이며 정상 풀/hiFPSfalse 경계에서 16개 RNG draw를 소비한다. hiFPS·pool limit에 따라 실제 추가 draw 수가 달라지므로 fake 고정16 draw를 production에 넣지 않고 정확 FX callback을 요구한다. owner의 source guard/tiering, nearby200/4 gate, channel40, summon cooldown reset, recover50, global physics schedule은 후속 실제 caller의 책임이다.

## 신규 검사 · 최초 실행 이력

| 검증 | 결과 / 정확 범위 |
|---|---|
| source oracle | 실제 canonical `mkEn/rollElite/rollMods/_assignMobSkin`만 독립 Node VM에 불러온 원 함수 검증. 원16 snapshot 재추출0. six elements + normal/M29/M30 + elite.03 boundary + Lv500/501 + difficulty + 음수/32bitwrap skin + safe placement 등16개 새 생성 사례 |
| Node fixture 준비 | 첫 window/global alias 미구성으로 `_noProjEtypes` ReferenceError. 두 번째는 잘못 추가한 zero-stream 사례가 원 정상 constructor로 진입해 stream exhausted. fixture만 수리해 세 번째 oracle 생성 성공; 이 두 번을 product runtime 실패나 PASS로 세지 않음 |
| `canonical_constructor_parity` | 첫 PASS. source oracle16개의 실제 반환 필드·RNG9/10회·초기 충돌반경10 비교 |
| `constructor_refusal_and_identity` | 첫 PASS. 빠진 context/다른 stage/잘못된 difficulty/energy6/불가능 safe point/누락 consumer에서 원자 preflight·명시 실패. 실패 child의 invented FX나 후속 draw0 |
| `summon_consumer_and_fx_order` | 첫 PASS. 첫 physical/normal, 둘째 holy/magicM30의 count/angle/radius/element/factory/FX 순서 및58draw 소비. 실제 safe actor와 원 proposed FX origin 분리 |
| `coordinate_skin_and_independent_defense` | 첫 PASS.40개 셀 좌표 계산·반감 HP와 반감 전 poise·M29/shield0·child mutable dictionary 독립 |
| Godot 첫 실행 | 고유4/4 PASS / assertions1022 / 실패0 / SCRIPT ERROR0. portable4.7.2.stable.official.ed1daf0bf isolated fixture |
| 명시 호출 | 직접 `build_child`23회(유효18/거부5), `summon_type7`4회이며 내부 child constructor4회(유효 recipe4). 전체 build 경계27회. elapsed/physics tick으로 환산0 |
| 자동 clock / visual | SceneTree 초기화에서 계산 후 quit: automatic physics0/process0/texture import0. 원 player/HP/state/좌표 setter0·GUI/new server/current paused view 조작0 |
| 반복 / 수리 | production Godot 검사중 코드·fixture 수리0 / 이미 통과한 검사 재실행0 / 옛 suite0. 공유 code·Git·이미지·save 재검수0 |

외부 증거: `E/godot-native-first/dependency-type3-spawn-first/`의 `target-absence-backup.json`, `native-type3-oracle.cjs/.json`, `attempt-01.log`, `check-ledger.json`, `related-doc-paths.txt`. 시작 전 새 소유4경로가 모두 absent여서 이전 working/HEAD bytes를 덮어쓴 것이 없다. 신규 isolated fixture에는 이 생성기/이 검사/좁은 oracle만 복사하며 게임 전체나 texture를 import하지 않는다.

## 남은 실제 연결

| 필요 소비자 | 현재 경계 |
|---|---|
| type3 actor/6elements | 별도 병렬 worker가 실제 `type3_summoned_actor.gd`를 담당. 이 문서는 그 배우의 생성·AI·피해·상태·독립탄 검사나 공개 플레이 완료를 대신하지 않음 |
| M29/M30 actual caller | child.mods 원 flag 유지. M29 병렬커널/M30 기존커널과 실제 배우 guard/tiering 연결은 central owner의 통합 범위 |
| shared RNG / FX | 공유 RNG 커널과 channel/after-child particle callback의 실제 pool/hiFPS 소비를 연결해야 전체 child episode RNG order가 성립 |
| type7 admission | child actor/6elements/elite mods/부모 M30·TP·소환/channel/guard 소비까지 준비한 뒤 factory 등록. 이 생성기 완료로 지원7/16·전체 type7 완료 주장0 |
| current docs sync / commit | 관련 keyword `mkEn/etype3/type3/eSummon/M29/M30`를 allowed docs 전체 검색해51개 경로를 central owner에게 전달. shared 문서는 병렬 충돌 방지를 위해 직접 수정0; 중앙 동기화와 normal code+docs checkpoint 전 integration 완료 주장0. 2_3 확정 문서 수정0/제외 marketing09 접근0 |
| 공개 품질 / 성능 | 원 Web34/Mac paused/browser31 보호. 공개 자연소환·실pixels·240FPS/최저Windows·전체 AI/전체UI/보스 검수0. 기술 생성 검사와 구분하며 **VISUAL VERDICT: RETOUCH** |
