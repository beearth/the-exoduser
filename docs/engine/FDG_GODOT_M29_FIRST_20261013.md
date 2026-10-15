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

# FDG Godot M29 돌진 standalone dependency kernel (2026-10-13)

범위: 원본 엘리트 모디파이어 M29(돌진)의 native-60 전조/돌격/스윕 피격/패링 계약을 standalone 커널로 이식. 실제 enemy owner·type3 elite child·type7 caller 연결은 이 단위 범위 밖(미연결). 공개 플레이 경로 변경 0, shared factory/player/기존 docs 편집 0.

## 상태

| 항목 | 상태 |
| --- | --- |
| 기술 테스트 (`godot/tests/test_enemy_mod_m29.gd`) | **14개 고유 그룹 유효 PASS 이력**: 첫 13 PASS/1 fixture FAIL(2assert), 실패1만 후속 PASS. 최종 전체14 재실행0 |
| 공개 visual RETOUCH | 미검증 |
| 성능 | 미검증 |
| type7 admitted / source7 | **아님**. 지원 source6/16 동결 유지, shipping Web/Windows 5/16 불변 |
| 실제 owner 연결 | 0 (caller 미연결) |

## 원본 M29 계약 (game.html, frozen16 재추출 없음)

| id | name | source location | numbers | formulas / ticks | guards | output | API | implementation scope |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M29 | 돌진 | MOD_DEFS L31723 `{id:'M29',name:'돌진',col:'#ff5533',hell:0}` | color #ff5533, hell 0 | rollMods: attack pool M29~M32, tier>=3 → 2개 아니면 1개 (L31733-31743) | hell<=SI_TO_HELL[si] pool | mods 문자열 'M29' | (rollMods는 type3 owner 소관) | 미포함 (elite roll은 type3 recipe 몫) |
| trigger | 붉은 직선 전조 후 돌격, 9초 재사용 | L39404 | accumulate 540, eligible 140<d<520 (양끝 제외), claim busy 78, windup st2=60, `_chgAimMax`=60, `_chgDur`=18, `_chgSpd`=32, `_chgLen`=640+e.r, `_chgVisLen`=`_chgLen` | `eliteCharge+=sp` (idle & 범위 내에서만, 범위 밖/비idle은 동결·리셋 없음); `>=540 && _claimEliteAttack(e,78)` → eliteCharge=0, facing/echDx/echDy=atan2(P-e), s='eChargeWind' | `e.mods.includes('M29')`, `e.s==='idle'`, 거리창, 공유 `eliteBusy<=0` (claim 실패 시 누적 유지, 매 틱 재시도) | state 필드 쓰기 + `windup_started` | `advance_mod`, `start_windup`, `trigger` | 구현 |
| shared lock | elite attack lock | L31700-31701 `_tickEliteAttackLock`/`_claimEliteAttack`, modT 초기값 L31829 | eliteBusy/eliteCharge 초기 0 | `eliteBusy=max(0,busy-sp)` 소유자가 틱당 **1회** (M29 시도 직전, L39400) ; claim은 busy>0이면 실패 | M29~M32 공유 (attack ticket 아님) | bool | `tick_attack_lock`, `claim_attack` (static) | 구현. 커널은 lock을 자동 틱하지 않음(이중 감소 방지) |
| eChargeWind | 예고 | L41121-41128 | lock=`(_chgAimMax\|\|60)*.755`=45.3; 벽 프로브 12px; 전환 st2=`_chgDur\|\|20` | 매틱 st2-=sp (L39486, owner) 후: st2>lock이면 플레이어 재조준(echDx/Dy/facing, `_chgVisLen`=null); visLen null이면 `_chgLen\|\|100`까지 ct=e.r부터 +12씩 isW 첫 충돌 ct로 클립; st2<=0 → s='eCharge', st2=dur, visLen=null. 60틱 중 14틱 추적, 이후 방향 고정 | commit 상태(`eChargeWind`/`eCharge`)는 거리/비어그로/iframes 조기 return과 culling/tiering, chain stun(L34614/L46153)에서 면제 — owner가 `is_committed`로 반영 | `windup_started`, `charge_started`, 선택 `vfx_spark`(p<0.3*sp) | `step_charge` | 구현 |
| eCharge | 돌격 | L41129-41140 | spd=`(_chgSpd\|\|5)*sp`; 18틱×32=576; hit pad P.r+e.r+18; dmg `~~(atk*30*elMul(e.el,armor el))`; knockback 100; parry poise 20; recover 30 | 매틱 이동 후 선분(old→new)과 플레이어 최근접점 스윕 판정(터널링 방지); canMv 실패 → recover 30 (이동 없음); 피격/패링/만료 → s='recover', st2=30 | P.iframes<=0일 때만 판정(아니면 통과·계속 돌격); isPWin 우선 → 패링; else P.s!=='charge'이면 피해 (charge 상태면 피해 없이 recover) | `player_damage`(amount, element, element_multiplier, knockback Vector2, angle, `apply_elite_mod_hit`=eModHitP 요청, impact boom 80/48 fire_medium, big_impact fire, shake 10, sfx detonate); `player_parry`(parry_bank_add=`atk\|\|10`, do_parry{atk,x,y,projectile=false,el}, poise_hit 20); `player_charge_state_immune`; `recover_entered`(blocked/hit/expired); 선택 `vfx_trail`(p>0.5) | `step_charge` | 구현 |
| recover | 후딜 | L41975 | 30틱 | 원본 공유 recover 핸들러 (atkTicketRelease 등) | — | — | 커널 비소유 | owner 몫 (커널은 s/st2만 설정) |

## M29 RNG / 시계 / 속성

- 게임플레이 RNG 0: M29 자체에 확률 요소 없음. 원본 `Math.random()`은 불꽃/잔상 파티클(0.3*sp, >0.5)뿐이며 선택 provider `random`이 있을 때만 cosmetic 이벤트로 낸다 (draw 순서: 조건→vx→vy / 조건→x→y).
- 시계: 호출자가 native 60 tick(`sp`, slow-mo 0.35 포함 분수 허용)을 전달. 커널에 자체 시계/타이머/process 없음. damage/shield/poise/QE·projectile lifetime은 변경하지 않음(소유 안 함).
- 속성: element 배수는 provider `element_multiplier(e.el)`(= elMul(e.el, armor el))로 주입. 충격 연출 속성은 원본대로 fire 고정(EL.F).
- M29는 body 돌격이며 투사체가 아님. blackBean(magic/Q ONLY, E 금지, Q 성공 파랑 유도 반사)은 이 모디파이어에서 발생하지 않음 — 해당 규칙 변경 0. 새 PNG/legacy alias 0.

## API (`godot/scripts/enemy_mod_m29.gd`, `preload`로 사용, class_name 없음)

- `configure(providers)`: 필수 `can_move(x,y,r)->bool`(canMv), `is_wall(x,y)->bool`(isW), `element_multiplier(el)->float`; 선택 `random()->float`, `sink(event)`.
- 틱 순서(한 tick, 원본 updateE 순서): owner `tick_attack_lock(modT,sp)` 1회 → `advance_mod(actor,sp,d)`/`trigger(actor,sp,d,player)` → owner AI 본문 → `step_charge(actor,sp,player,decrement_st2)`.
- actor: Dictionary(권장, 참조 변이) 또는 동명 Variant 프로퍼티 Object. 필드 x y r atk el col mods modT s st2 facing echDx echDy `_chg*`. player: x y r iframes state parry_window(=isPWin()).
- 자동 dispatch 없음: 원본 owner가 gating(hitStun/stun/lesson return, tiering, 어그로)을 책임진다.

## 새 isolated 테스트 이력 (Godot 4.7.2)

`godot/tests/test_enemy_mod_m29.gd` — 생성자 fixture만 사용(공개 플레이 경로 아님, live monkey patch/observer 주입 0). 커버: provider 검증·상수, lock/claim, 거리 경계 140/520 배제, 비idle/무M29 동결, 539/540 경계, busy 중 누적 유지·owner 독립, 60틱 전조 중 14틱 추적 후 고정, 벽 프로브 클립(302), 18×32=576 돌격→recover 30, canMv 차단, 스윕 피격(터널링)·피해 600·knockback·impact, iframes 통과, 패링(bank atk||10, poise 20), charge 상태 면제, 분수 tick(0.35 → 172틱), cosmetic random draw 순서/sink, Object adapter, 타 상태 no-op.

| 시도 | 실행 범위 | 결과 | 수정 | 자동 physics/render | 공개 play / asset import |
| --- | --- | --- | --- | --- | --- |
| 1 | 새14그룹, 명시 constructor fixture / 143assert | 13PASS + `hit_damage_and_knockback` 1FAIL(2assert), exit1 | 없음 | 0 / 0 | false / 0 |
| 2 | 실패 `hit_damage_and_knockback` 1그룹만 / 13assert | PASS, exit0, 오류0 | fixture KB Vector2(float32) 성분 허용오차2곳만1e-9→1e-5; productrepair0 | 0 / 0 | false / 0 |

실제 첫 오차는 KB x=96.3517913818359 vs double 기대96.3517909629941, y=26.7643871307373 vs26.7643863786095이다. Vector2 single precision을 고려한 fixture tolerance 수리이며 native KB100·원수식 불변. 최초 통과13·old suite 재실행0, 성공한 전체14 동시최종 suite 재실행0. 테스트 실행은 source ticks를 직접 전달하는 동기 함수 fixture이며 명시 method 호출 합계를 따로 계측하지 않았다. 반복별 auto physics0/render0는 SceneTree `_init()`에서 즉시 끝나는 RefCounted kernel 특성이다. 공개 원AI·실play·240FPS 증거가 아니다.

실행 위치는 저장소와 별도 `E/godot-native-first/dependency-m29-first/fixture-attempt1/`이며 새 script2개만 copy, 새asset0/import0, source/shared userdata/현재 main·GUI 접근0. 실패선택은 `--only=hit_damage_and_knockback`. `test-attempt1.json`/`test-attempt2.json`과 두번째 stdout·stderr가 proof 폴더에 있다.

## 실제 Claude 병렬 작성

- Claude Code CLI 2.1.289, actual session `16c61dbe-d8c9-456d-85a6-7b56a7134c31`, configured default `claude-sonnet-5-5`, `--restricted --permission-mode dontAsk`.
- 허용 도구 Read/Glob/Grep와 정확한 자기3파일 Write/Edit. Bash/Agent/Task/Web/MCP/GUI 실행0, permission denials0. 기존 파일·Git/공유docs/settings 수정0.
- 실제 Claude가 module/test/newdoc를 작성했고, Codex는 새테스트에 실패그룹 선택/ledger출력 추가 및 첫 fixture 실행·오차수리·실패1만 재검증과 이 테스트 상태 갱신을 담당했다.
- `claude-stream.jsonl`·`claude-launch.json`·`claude-generated/`에 실제 실행과 원작성 byte backup을 보존한다. 최초 자기3파일과 optional .uid는 working/HEAD 둘 다 없었음을 먼저 확인했다.

## 병렬 type3 actor 연결 계약

진행 중인 별도 actor는 `get_native_modifier_state()`로 실제 JS-key dictionary 참조를 제공하고 공개 snapshot은 deep copy를 유지한다. `modifier_pre_ai(actor,ticks,distance,player_ctx)`에서 lock1회→`trigger`, 원 st2 감소 뒤 `modifier_state_step(actor,ticks,player_ctx)`에서 `step_charge(...,false)`를 호출하는 계약을 합의했다. target_ctx는 실제 parry provider를 포함해야 하며 raw x/y 변화는 actor가 Node2D 이동으로 동기화한다. 이 계약 합의는 실제 actor·sink 연결 완료나 전체type3/7 admission PASS로 세지 않는다.

## 남은 통합 (이 단위 밖)

1. 실제 enemy owner/type3 elite child/type7: modT(eliteBusy/eliteCharge) 보유, 공유 lock 틱 1회, 위 호출 순서와 commit 면제(culling·chain stun·원거리 return) 연결.
2. `can_move`/`is_wall`/`element_multiplier` 실제 world·armor 어댑터.
3. 이벤트 소비: 실제 player damage/knockback(+eModHitP 타 모디파이어 효과 M01/M03/M05 등), parry bank/doParry/`_poiseHit`, boom/bigImpact/shake/SFX, 전조선 렌더(`_drawChargeTele`, `_chgVisLen` 폭 e.r*1.7)·파티클.
4. recover 후속 핸들러, rollMods M29 선택, type3 elite child recipe 연결(병렬 type3_spawn_recipe.gd).
5. 공개 visual/성능 검수.

## 중앙 owner 동기화용 관련 기존 문서 (수정하지 않음)

- docs/engine/FDG_ENGINE.md, FDG_GAME_DEVELOPMENT_PLAN.md, FDG_INTEGRATION_INTERFACE.md, FDG_BENCHMARK.md
- docs/engine/FDG_GODOT_ENCOUNTER_FACTORY_20261013.md, FDG_GODOT_TYPE7_TELEPORT_20261013.md, FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md, FDG_GODOT_M30_EPICENTER_20261013.md
- docs/CHANGELOG_SYNC.md
- docs/8.0몬스터디자인/몬스터_총관리.md, 몬스터_공격시스템.md, 몬스터_스킨_렌더링_파이프라인.md, 탄막시스템_총정리.md
- docs/9적ai패턴디자인/9_적AI패턴디자인.md, docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md, docs/5.1임펙트디자인/VFX_구현가이드.md, docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md
