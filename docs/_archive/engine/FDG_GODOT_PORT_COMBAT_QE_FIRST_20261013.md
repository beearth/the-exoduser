
## 2026-10-16 Git main 통합 범위

최신 웹 본편과 네이티브 부분 이식을 보존 통합한다. source pin9a4534b4의 native 계약은 최신 웹 전체의 동등성을 뜻하지 않는다. 실제 반영·실행 상태, 모듈 이송·런처·캐시 한계는 [PC·Mac·Git 통합](FDG_PC_MAC_GIT_SYNC_20261016.md)을 따른다. latest_full_game=false를 유지한다.

## Native 기본 공격·기검참 SFX — 2026-10-15 현행

| 범위 | 현재 계약 |
|---|---|
| 실제 재생 | Main/Player 실제 start·2틱검격·실 enemy_damage에 원 MP3 연결. basic3종랜덤/Ki1·2·3순서, body실etype 선택. 실제source OPT60의voice×bus 이중gain/0 mute, 중복serial·상실·pause tail·cleanup 처리. voice/BGM/다른skill·EQ/압축·청감 동등성 미완. |
| 증거·한계 | 실제 CoreAudio output bus nonzeroPCM/자연 적피격 캡처. 새runtime16은 초기경로·fixture순서·capture overflow 실패 후 영향만 수정한 결과이며 first_whole_cleanfalse. 원함수와실요청16 packet key/gain/pitch/RNG 일치. 전체이식·시각·물리speaker동등성 완료0. |
| SSOT / 후보 | FDG_GODOT_NATIVE_FIRST_20261013.md native-attack-sfx-20261015 절 및 native-review-attack-sfx-20261015 새부분후보. camera/wave/tempo 포함·초기pause/명시선택/수동재개. 기존창·후보·ship불변/latestfullfalse/기존RETOUCH. 아래 basicSFX미연결 표기는 이전이력. |

## Native 공격속도·회복 — 2026-10-15 현행

| 항목 | 현재 계약 |
|---|---|
| 실제 소비 | 일반/Ki wSwing5 유지, 후딜=ToInt32(16/((wp.spd 또는 .3)×현재 statDex×(1+meleeAtkSpd+glovesAtkSpd))). E는 별도 ToInt32(28/(1+pParry×.1)). 원 counter0과 render OR1 구분. Warrior .85/Silver1.5는 표시 전용. |
| 검수·한계 | Main/Player2 scripts, 새runtime22/actualMain GPU3/error0. 원식12 configuration·실제frame485 sample 일치. 이전 통과군/원 asset·PNG 재검0. 장비 UI/save·전체 이식/시각 완료 주장0. |
| SSOT / 후보 | FDG_GODOT_NATIVE_FIRST_20261013.md native-attack-tempo-20261015 절 참조. 새 native-review-attack-tempo-20261015 후보는camera0b8/wave693도 포함, 초기정지/명시선택/수동재개. latest_full_game=false/기존RETOUCH. 아래 속도미채택 문장은 이전 이력. |

## Native 기본 합체 E 파동 — 2026-10-15 현행

| 범위 | 현재 구현 |
|---|---|
| 실제 소비 | 기본 shieldFuse의 _autoShieldThrow→실제 post-move wave 이동·사각 공간명중/Enemy HP·KB·소스 _stCd/_stWingT·실제 생성40보호·기존 source 입자/원근 quad 및 자연 gbBean의 같은 carrier blue 반사 연결. 추가 ST0. |
| 수치 | L=max(1,min(maliceSwipe 또는1,shieldThrow 또는1)), cooldown=max(120,720−15L), 기본705. M=(1+.05(L−1))×clamp(charge,1,3), maxDist210M/r50M/w95M/속도12. source 피해·실fusion/affix 및 wave 반사 base(true)×1.5/life120/gb유지. |
| 검수·후보 | 새 GPU/Main3에서 고유23 PASS/제품ERROR0·기존 Camera2DWarning각1. 실제 자연 명중과 자연 탄→blue 피해/최대차징 확인. 새 native-review-e-wave-20261015 후보는 기존camera0b도 포함, 초기pause/명시선택/수동재개. 기존 실행본 자동교체0. |
| 한계 | DEFAULT_FUSED_WAVE_PARTIAL/E_CONTROL_PARTIAL/latest_full_game=false/RETOUCH. 비합체·다른탄·boss/full hurtE/doParry·고유모션/audio·전체스킬24고유장24FPS 미완. blackBean은 Q only/E 제외. |
| 상세 | FDG_GODOT_NATIVE_FIRST_20261013.md의 e-default-fused-wave-20261015 절이 API·공식·입자·소유·첫검수·새후보의 현행 SSOT다. 아래 이전 파동/40보호 미채택 문장은 그 이전 제출의 이력이며 현재 상태를 덮어쓰지 않는다. |

## E 제어·실제 타격 부분 연결 — 2026-10-15

현재 native Main은 공개 E→sDraw(10tick 게이트/.5이동)→tap 또는 kiGather(2배속/.18이동)→sBash20→sRecover ToInt32(28/(1+현재pParry×.1))→정상종료를 실제 P/ST/World/명시profile과 연결했다. 비용은5+((maliceSwipe||1)−1)×2를 tap release 또는 charge 진입1회, charged release 재차감0. Silver 차징만 원150+175×(mult−1) 전진과 진입8iframe, 원Normal E 공간hit/HP·KB8/stun60을 소비한다. 첫actualMain/GPU1/20.469초/새18PASS/제품ERROR0·Camera보간경고2, 옛Q/공간/독립군 재연0. 기본shieldFuse의 별도파동·40보호·쿨다운, E투사체패링·고유모션/연출 등은 미채택이므로 E_CONTROL_PARTIAL/fullEfalse/latestfullfalse/RETOUCH. [정확API·필드·수치·자연타격·새후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015)를 따른다. 아래 과거 E 전체 미연결 표기는 이 부분 범위에서만 현행 계약으로 대체한다.

## Q 다크볼 실제 성공 반사 — 2026-10-15

현재 START의 실제 gbBean만 공개Q→같은 탄 반사→기존 blue 원 clock·자연 AoE/정상 적 피해에 연결했다. live 원 pParryProjDmg base×2 ToInt32/life200, actual HP·ST·MP 성공보상/iframe25/poise+1, 실제 World128px source-order query를 소비한다. 실제 blackBean과 구분하며 black 자연 caller/E/full doParry 보상·audio/FX/core absorb 등은 미완이다. Q_CONTROL_PARTIAL/latestfullfalse/RETOUCH를 유지한다. [정확한 API·원 수치·실패1과 영향검수1·새 후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015)를 따른다. 아래 과거 “반사 전부 미연결” 표기는 다크볼 범위에서만 현행 계약으로 대체한다.

## HP 생존 gate 소수점 보존 — 2026-10-14

NativePlayer hp/max_hp는 이제 float350.0이며 native_combat_qe_adapter의 명령 gate는 actual hp를 int로 잘라 검사하지 않고 float(hp)>0.0을 사용한다. Q/E 피해·비용·시간·원 blackBean/Qonly/poise 계약은 그대로다. 새 회복 실제6그룹88검사는 소수HP→피해의 잔량/0사망을 확인했으나 HP(0,1)의 공개Q 요청은 별도 미측정이다. 기존 QE11검사를 다시 실행하지 않았다.

## 현재 ENGINE 연결 — 2026-10-14 Q/E 단일 피해 경로 (FIRST_VALID10_PLUS_NEW1_PASS)

실제 `scripts/player.gd` / `scripts/world.gd`에 선택 Q/E adapter 바인딩과 접촉 API를 추가했다. 실제 Player의 state·poise·stamina만 proxy로 사용하며 두 번째 Player를 만들지 않는다. source stats8·실제 MP/비용 공급·효과 소비자가 없으면 바인딩은 false이며 본편 Q/E 입력의 자동 활성화는 0이다. 필수 값에 150/.5/100MP 같은 중립 기본을 채워 ready로 만들지 않는다.

| 실제 API / 필드 | 계약 |
|---|---|
| `Player.bind_native_combat_qe(adapter:Object)->bool` / `_native_combat_qe:Object` | 실제 동일 Player·World 및 7개 method·exact bool-ready를 확인한 뒤 한 번 바인딩. 같은 active binding의 중복 교체는 false |
| `Player.get_native_combat_qe_snapshot()->Dictionary` | 실제 adapter snapshot; 미바인딩은 `{ready:false,bound:false}` |
| `World.bind_native_player_combat_qe(adapter:Object)->bool` | ready World의 기존 player 및 `get_combat_world()==self`만 사용. 새 actor·input driver 생성0 |
| `Player.receive_native_projectile_contact(projectile:Object,raw_amount:int,damage_type:String="phys",source_direction:Vector2=ZERO,native_knockback_strength:float=-1)->Dictionary` | HP/iframe gate → QE 결과 → 감소 raw를 단일 내부 피해 경로에 소비. 원 carrier damage와 hurtP raw 요청을 분리 |
| `allows_native_qe_iframe_reflection()->bool` | Q mode·실 active window만 기존 iframe 반사 접촉 예외를 허용. 일반 HP/iframe gate와 E/비Q 거절은 보존 |
| 반사 reaction2 | `PARRY_REFLECT_BLUE` 성공 시 같은 접촉의 HP/KB 적용0. 실제 탄 이동·발사자 귀속·반사 렌더링은 별도 실제 carrier 연결이 필요 |
| `_apply_native_damage` / `_enter_native_hit_stun` | 기존 void `receive_damage`도 같은 내부 경로 사용. shield 초기 penalty가 poise0을 만들면 HP tail 전에 기존 pStun240 진입; 그 외 일반 hit poise−1은 별도 유지. cap33%→DR75% cap/2500 denominator→minimum0.5%의 기존 계산은 변경0 |
| 실제 clock | World priority−1의 `dt_sp/frame/ens`를 Player physics의 HP0 early-return 앞에서 1회 전달. 살아 있는 World의 원 global burst는 Player 사망 후에도 해당 시계로 전개·소멸하며 추가 owner-death 회수0. adapter는 실제 reference·epoch·pause·중복을 검사하고 `Runtime.tick(ticks/60)`만 실행. 추가 자동 physics0. 이 slice는 counter/ring을 Player0에서 함께 처리하므로 원 post-projectile burst phase의 전체 순서까지 완료로 주장하지 않으며 `full_source_phase_order_ready=false` |
| 보존 / 미완 | 실제 6탄 kernel의 기존 receive_damage 호출·후속 상태이상·impact·끝처리는 현재 변경0. 새 facade/birth actor attribution·E 이동/완료·실 source provider·본편 입력·공개 pixels/240FPS는 미완 |

새 코드의 최초 검사 결과와 정확한 provider 계약은 [Q/E 연결 SSOT](FDG_GODOT_QE_BINDING_20261014.md)에 기록한다. 블랙콩 성공 Q 반사는 원 공식 불일치 때문에 `blackbean_source_carrier_not_adopted`로 상태·탄·HP 변경 전에 거절한다. 현재 Source Runtime의 과거19 검사는 canonical 피해/bank 식의 PASS 증거가 아니며 소유자가 같은 affected 분기를 수리 중이다. 원식은 변이 전 `pParryProjDmg(incoming,_sbPW)`→`trunc(base×1.5)`→탄 피해→`bank+=(탄피해||10)`→`doParry(탄피해)`이다. 실제 root `apply_source_q_reflection` 소비는 미연결이며 proposed `spawn_reflected`는 새 탄 발사 권한이 아니다.

기인수한 성공 suite, 원PNG, 보호된 플레이 세션과 `2_3` 확정 문서의 변경0.

First valid integration: 10 groups / 135 assertions / FAIL0 / ERROR0 / exit0 after fixture-only setup repair. Attempt01 remains INVALID with 10 script errors and cleanPASS0. Stats8/resources6/services are constructor fixtures; actual Main providers, input, six projectile facades, BLACK Q and complete source phases remain unadopted. Peace-shield admission is held until its separate source cooldown/state is adopted; its independent new gate test does not rerun the clean10.

The independent peace_shield_admission_hold group then passed FIRST 1/20 with FAIL0/ERROR0/exit0, without rerunning the prior clean10/135. Unique new QE coverage is 10 first-valid repaired groups plus 1 later independent group, not an 11-group replay. Peace MP0/12 fixtures both reject before state/ST/MP/debit/burst/bank changes. Full production Q/E admission remains pending.

---

# FDG Godot 이식 — 전투 Q/E (보호막·패링·blackBean) 첫 producer

- **TASK**: GODOT-PORT-COMBAT_QE-FIRST-20261013
- **작성시각**: 2026-10-13 (현재 도구시각). **test RAN — Godot v4.7.2 headless 격리 실행 24/24 PASS, exit 0** (기술/격리 runtime proof ≠ 공개 visual/240fps/normal checkpoint). binary `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, 격리 E proj `…/team-port/combat_qe/first-runtime/proj`, RUN receipt `…/first-runtime/owned-receipt.json`.
- **소유(신규)**: `godot/port_modules/combat_qe/` 만. Player/factory/world/공통 emitter/runtimeconfig/공유 docs/Git = ENGINE 독점(변경 0).
- **참조 R(읽기전용)**: `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html` pin **4192030** / sha256 `bc7df271a18606c30ad4ca9a72729f06fb2f2f20f3aa93c2479a02124aa8f44a`.

## 산출 파일
| path | 역할 |
|---|---|
| `godot/port_modules/combat_qe/producer.gd` | `CombatQEProducer` — 입력 라우팅 + 패링 윈도우 + 종류별 반응 + 반사 피해식 (순수 함수, 상태변이 0) |
| `godot/port_modules/combat_qe/test_producer.gd` | 첫 caller 검사 (headless, NOT_RUN) |
| `docs/engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md` | 본 정본 doc |

## 원 소스 → 포트 매핑 (raw 보존, native 60fps 프레임)
| 계약 | R 소스 pointer | 포트 |
|---|---|---|
| Q 라우팅 (iceOrb=false / peaceShield / sBlock 기본) | `_qIsIceOrb` @15028, `_qIsPeaceShield` @15029, Q 보호막 @33687 | `route_q()` |
| sBlock 진입 (mp-10, _sbParryT=20, _sbCd=~~(30*(1+shieldCdRed)), _sbBurst) | @33687 / @15040 / @15042 | `make_shield_block_intent()` |
| peaceShield 진입 (_psShieldR=100, parryBank=0) | `_enterPeaceShield` @15054 | `make_peace_shield_intent()` |
| 패링 윈도우 (sBash 앞창 / sBlock·peaceShield _sbParryT>0 / whirlwind·beam·elecRepent 제외) | `isPWin` @39099 | `is_parry_window()` |
| blackBean = Q-magic 전용 분류 | `_projectileParryClass` blackBean→'magic' @17313 | `resolve_contact(BLACKBEAN, …, is_q_magic)` |
| E(물리) 반사에서 blackBean 제외 → E 불가 | `_eCanReflectProjectile` @17321 | `resolve_contact` blackBean+비Q → `NO_REFLECT_PASS` |
| Q 성공 blue 유도반사 (blueBean/parryBlueBean/homing/magic, '#00e5ff') | @34030 / @34037 | `Reaction.PARRY_REFLECT_BLUE` + `make_parry_hit().reflect` |
| 반사 피해 (탄뎀×0.5 + 장비보너스, ki 1방 floor) | `pParryProjDmg` @28684 | `parry_proj_damage()` |
| 패링 성공 poise20 / stun60 / parryBank | 패링 성공부 `_poiseHit(e,20)`·`e.stunned=60` (대표 @41762) | `make_parry_hit()` |

## 공개 API signature (ENGINE/NativePlayer 소비용)
```
CombatQEProducer.route_q(active_q_skill:String, has_peace_shield:bool, mp:float, shield_cd:int) -> QRoute
CombatQEProducer.make_shield_block_intent(player_r:float, detonate_lv:int) -> Dictionary
CombatQEProducer.make_peace_shield_intent() -> Dictionary
CombatQEProducer.is_parry_window(state:String, sb_parry_t:int, sbash_st2:int, parry_win:int=20) -> bool
CombatQEProducer.resolve_contact(proj_type:ProjType, in_parry_window:bool, is_q_magic:bool) -> Reaction
CombatQEProducer.parry_proj_damage(bullet_dmg, is_q, scale, parry_dmg_mul, parry_bonus, leg_shield_parry, ki_floor) -> int
CombatQEProducer.make_parry_hit(reflect_dmg:int) -> Dictionary
enum QRoute{ICE_ORB,PEACE_SHIELD,SHIELD_BLOCK,BLOCKED}  enum Reaction{NONE,SHIELD_REDUCE,PARRY_REFLECT_BLUE,NO_REFLECT_PASS}  enum ProjType{PHYSICAL,MAGIC,BLACKBEAN}
```
- producer 는 **상태 변이·피해 적용·탄 삭제·무적·single-hit 결정 0**. intent/payload 만 반환 → ENGINE Player 가 적용(티켓/동시제한/승리·liveHP 주입 없음).

## 보존/경계 (초기 전문 준수)
- native60/원수치/rawflags/poise/QE/owner-independent탄/LOCK/nav/START/EXIT 보존. blackBean magic·Q전용·E불가·Q성공 blue 유도반사 보존.
- Player 변경은 **ENGINE 제출**(직접 수정 0). 공통 6속성 emitter/projectile/boom/enemy_type* 파일 미접근.
- 원 HTML/PNG/2_3/main/save/foreignWIP/공유 factory·player·docs/Git = immutable. marketing_capture_studio 문서/tools = keyword 검색에도 **제외·미접근**.

## G2 실행본문 (RAN — 실 제품 프로젝트)
- **실행본문 3종 작성**(spec/forward/TODO 아님): `port_modules/combat_qe/combat_qe_runtime.gd`(CombatQERuntime) + 소유 subclass `native_player_combat_qe.gd`(`extends "res://scripts/player.gd"`, 제품 player.gd 수정 0).
  - `enter_shield_block`(mp-10·state·sb_parry_t20·`shield_cd=trunc(30*(1+red))`·`_spawn_sb_burst`) / `enter_peace_shield` / `release_shield`(maxR=release_r) / `tick`(sp=delta*60 패링창 감소 + BurstRing r→maxR 전개·소멸) / `shield_reduce_damage`(`rate=min(parryFailed?.25:.50, …)`·parryFailed `×1.3`+poise-1·detonate parry_bank+=(raw-dmg)) / `_do_parry_native`(reflect 계산·parry_bank 적립·sb_parry_t=0·enemy_sink poise20/stun60·proj blue 유도반사·impact_sink 통지). 반사탄/충격파/적 reaction 은 **injected sink**(projectile/impact/enemy) 위임.
- **shield_cd 원 `~~` = trunc 정정**(CONTROL CD-NATIVE-CONVERSION-2310): `~~(30*(1+shieldCdRed))` = JS ToInt32(0방향 절삭). GDScript `int()` 사용(round 금지). 비정수 red 입증: `red=0.35→40`(round였으면 41), `red=0.37→41`.
- **RAN**: `test_g2_native_player.gd`, `--path /Users/fordeargamers/the-exoduser/godot`(실 player.gd preload — fixture 아님) headless **39/39 PASS, exit 0**. 기반 실 field(hp350/melee_ref8/stat_str1/radius15/poise4/iframes0/state) 상속 입증 포함.
- 수치 핸드오프(임의 상수 미충전): `shield_cd_red=_eqAffix('shieldCdRed')`, `block_base=pGuardAbsorb()+pShieldBlock()`, `parry_scale/parry_dmg_mul/parry_bonus/leg_shield_parry/p_atk_mul` = 원 stat/affix API → subclass @export/파라미터 주입점(ENGINE 공급). 증거: `team-port/combat_qe/g2-bodies/owned-receipt.json`.
- **release/detonate 정정**(CONTROL RELEASE-DETONATE-EXACT-FIX-2340): `BurstRing.release` 신설 + `release_shield` 가 원 공개 release 명령에서 `det=detonate_lv>=1`(원 `P.skills.detonate>=1`, 고정 false 제거)·`release:true`·sBlock 해제 패링창 `sb_parry_t=12`(원 @34386, 진입 20과 별개)·peace 해제 `det=false`(@34409)를 source-backed 생성. ROOT shield_burst_visual renderer 미수정(flag/intent 소비만). 새 release branch `test_g2_release_detonate.gd` headless **18/18 PASS**. 증거: `g2-bodies/release-detonate-fix-receipt.json`.
- **blackBean Q 반사 경계 정정**(CONTROL BLACK-REFLECTION-CARRIER-BOUNDARY-0014): `_do_parry_native`가 bank 계산값으로 반사탄 dmg를 덮던 경계를 blackBean Q 전용 `reflect_blackbean_q`로 분리. **carrier 실피해 = 원 proj.dmg×1.5**(ballistic), **parry_bank += pParryProjDmg**(반응계산, 별개 — bank로 탄dmg 대체 0). velocity(homing→`max(5,|v|)` / else `v×-2`)·`life/ml=180`·flags `blue/parry/magic/homing/_fromRainbow(=blackBean)/#00e5ff/aoe0`(원 @35675~35681 순서), 같은 탄 in-place 1회. ROOT `black_kernel` carrier(실 이동/homing/contact/render) whole body·blue physics **복제 0** — seam `carrier_sink.spawn_reflected(proj, intent)` 인계, 미연결 시 `root_carrier_connected=false`+contract 명시. 라우팅: `resolve_contact_result` BLACKBEAN→`reflect_blackbean_q`, 물리/마법(M29)→기존 `_do_parry_native`(frozen 유지). E 거부(비-Q→NO_REFLECT_PASS·carrier 0). 새 `test_black_reflection_carrier.gd` headless **19/19 PASS**. frozen 39/17/20/13/blue21 재연 0. 증거: `g2-bodies/black-reflection-carrier-boundary-receipt.json`. ⚠️ **이 계약(carrier=incoming×1.5, bank 별도)은 CONTROL 0035 에서 錯誤로 정정됨 — 아래 canonical base-fix 참조. 이 19-case 는 틀린 old 계약 snapshot 로 보존(재연 0).**
- **blackBean Q carrier canonical base 정정**(CONTROL BLACK-CARRIER-CANONICAL-BASE-FIX-0035): 위 0014 의 `carrier=incoming×1.5(120)`·`bank 별도(112)`는 錯誤. 원 game.html:35674 `_npDmg=~~(pParryProjDmg(p.dmg,_sbPW)*1.5)` → **carrier dmg = trunc(pParryProjDmg(incoming, actual_sbPW)×1.5)**, @35681 `parryBank+=변이 p.dmg` → **bank_add = carrier(동일)**, @35683 doParry dmg=carrier. 예: base112 → carrier/bank/doParry **168**. `pParryProjDmg`(@28684) isQ(=`_sbPW`) scale 분기 존중(강제 isQ=true/neutral 발명 0). base 는 stat 의존(ROOT combat_stat_formula, missing) → ctx `parry_base_damage` XOR `parry_base_provider(incoming)` 공급. 새 `canonical_q_reflection(ctx)` = ROOT `Node.apply_source_q_reflection(ctx)` 소비 미러(결과 ok/incoming/base/projectile_dmg/bank_add/parry_element/field_order/raw/handoff). `reflect_blackbean_q(player, proj, ctx_in, carrier_sink)` = ctx 生成 + 소비(bank_add→parry_bank, doParry=carrier, 같은 탄 in-place 1회, 같은 Q프레임 blue 이동 0/다음 tick deferred, life180). ROOT `get_shot()`/`apply_source_q_reflection` 미완 → **ready=false 待驗**(코드 작성=READY 아님), same-carrier seam(새 birth 0). 새 `test_black_carrier_canonical.gd` headless **25/25 PASS**. old 19/39/blue21 재연 0, old19 틀린 snapshot 보존. 증거: `g2-bodies/black-carrier-canonical-base-fix-receipt.json`.
- **실제 ROOT carrier consumer**(CONTROL ACTUAL-ROOT-CARRIER-CONSUMER-0051): local mirror 아닌 실 ROOT 노드 `port_modules/black_bean_projectile/producer.gd`(읽기전용, `get_shot()`/`apply_source_q_reflection(ctx)`) 소비. `black_carrier_consumer.gd`(`CombatQEBlackCarrierConsumer`) — 실 ROOT `.new()`+`configure_hostile`(ENGINE binding stub) 후 0035 ctx(`actual_sbPW=sBlock&&sbT>0`, base scalar XOR provider, homing XOR provider, player_position) 넘겨 **ROOT 가 산출한** base112→`projectile_dmg 168`/`bank_add 168`/`doParry_damage 168`(`parry_element=rainbow`, field_order 15) 소비. carrier Shot **in-place 변이**(dmg168, reflected=true, same identity) 확인. shared HP/input/doParry 本體=ENGINE, 본 scope=reaction 노출+parry_bank(SKILL). 미configure 시 **exact current block `'unconfigured'`+ready=false**(mirror 승격 0), 같은 Q frame 이동 0/다음 tick deferred. 새 `test_black_carrier_consumer.gd` headless **19/19 PASS**(종료 시 ROOT handoff 가 BLUE CanvasItem 실제 생성 → GC leak 경고, 실패 아님). ROOT 파일·새 birth/life/hitcap/state 변경 0. 전체 Main 연결=ENGINE 미완. old 19/39/blue21/canonical25/Root16/109 재생 0. 증거: `actual-root-carrier-consumer-20261014/owned-receipt.json`.
- **native-advance / E / reaction-result / preflight 정정**(CONTROL NATIVE-ADVANCE-E-REACTION-PREFLIGHT-2345): ① counter(sb_parry_t/parry_t/sbash_st2/shield_cd) float화 + `native_advance(frames)` 로 원 `-=sp` 소수 보존(int 버림 제거)·zero-clamp·state guard·source 순서(`_sbParryT`→`parry_t`→`_sbCd`→`sBash st2`); `is_parry_window` param int→float(E창 소수 경계 보존). ② `enter_sbash(shield_st_cost, chg_mul)` = 원 `_sBashFire`(@39080), cost=`useStPct('shield')` **STAMINA**(attack_cost 의미대체 0, 실 field 소비), `state='sBash'·st2=20`. ③ `resolve_contact_result` 신설 — `shield_reduce_damage`의 dmg/stunned + parry reflect/poise/stun 보존(`last_contact_result`), 중앙 HP/stagger adapter 소비용(실 HP 적용 ENGINE); `on_projectile_contact` 은 enum 호환 위임. ④ `StatsReader.preflight(supplied, sinks)` — missing 8 stat/null sink → `ready=false`(neutral 150/.5 미인정). 새 `test_native_advance_e_reaction.gd` headless **27/27 PASS**. frozen 39/17/20/producer 재연 0(int→float auto-promote·enum 반환 유지로 비파괴). 증거: `g2-bodies/native-advance-e-reaction-preflight-receipt.json`.

## QE stat injection — 읽기전용 StatsReader (R2, RAN)
- G2 동결. `port_modules/combat_qe/stats_reader.gd`(`CombatQEStatsReader`, 읽기전용) — **기존 실 provider 가 있는 값만** 읽고, 없는 값은 **null + exact missing API** 로 표기(임의 상수·fixture·@export 기본을 제품값으로 채우지 않음). ITEM/equipment/affix 생성 0, 공유 player.gd 읽기만.
- 제품 provider 조사(`scripts/player.gd` + `data/combat.json` profile=`"raw mkP Lv1, no equipment, STATS/PASSIVES zero"`):
  - **EXISTS(provided)**: `melee_ref` `stat_str` `ki_slash_level` `base_def`(phys 방어흡수) `energy_def`(magic/parry 방어흡수) `attack_cost()`(kiSlash cost_base+(lv-1)×cost_per_level, **단위 STAMINA** — 원 Q mp 코스트와 구분).
  - **MISSING(8, exact API)**: `shield_cd_red`(_eqAffix affix 전무) · `block_base`(pGuardAbsorb+pShieldBlock 전무; base_def/energy_def 로 의미-대체 금지) · `q_shield_mp_cost`(mana 전무) · `parry_bonus`/`parry_dmg_mul`(pParryDmg)/`leg_shield_parry`/`parry_scale`/`p_atk_mul`.
- `inject_into_runtime`: 실 소스 뒷받침 값(`ki_slash_level`/`attack_cost_stamina`)만 주입; MISSING 은 unbacked 로 분리(subclass @export 중립 기본을 제품값으로 덮지 않음, non-authoritative). ENGINE 실 provider 공급 시 unbacked→injected 승격.
- **RAN**: `test_stats_reader.gd` `--path .../the-exoduser/godot` headless **26/26 PASS, exit 0**. 증거: `team-port/combat_qe/godot-port-qe-stats-reader-r2-20261013/owned-receipt.json`.

## 액티브 스킬 state body — whirlwind / beam / elecRepent (RAN)
- G2/26 동결. `port_modules/combat_qe/active_skill_commands.gd`(`CombatQEActiveSkillCommands`) — 원 id 그대로 state body. 원 clock(sp/dt_sp)+owner 입력은 주입 dict, 타격은 injected hit_sink(hit_arc/hit_beam)→ENGINE 이 `world.gd:emit_native_projectile_hit_fx` 등 공유 emitter/적피해에 연결. whole provider 복제·자체 driver 0.
- **whirlwind**(P.s='whirlwind', 진입 game.html:33691): 게이트 `isHeld('weapon')&&skills.whirlwind&&activeLMBSk=='whirlwind'&&st>=2`(**STAMINA**, no MP). cost `~~(30+(lv-1)*5)/60*sp`(stamina 실 field 변이), 범위 `100→200+(lv-1)*15`(`wwAng/63`, 3초), `wwAng+=0.35*_dtSp`, 히트 `max(3,~~(15/(wp().spd*statDex)))`, dmg `~~(meleeRef*statStr*pAtkMul*_skMul('whirlwind')*_fuseMul('whirlwind'))`, `hitArc 2π` noPoise, 종료=weapon 뗌.
- **beam**(P.s='beam', 진입 29550/case 34724): omniBeam gate+`!stormBeam`, cost `~~(_beamMpBase*(1+(lv-1)*0.18))/60*sp`(멸살10/만화15/추적암전30), 종료 `!isAct('beam')||mp<=0`(omni 과부하 `_beamCd=300`), 이동 40%, 히트 `_beamHitFrame%4`(15/s), dmg `magicRef*statInt*pMagicMul*pBeamMul*_skMul*_fuseMul*4*soloMul`.
- **elecRepent**: P.s 상태 **아님** — 합체 플래그(`_isFused('elecRepent')`), `s==='elecRepent'` 부재. 상태 body 날조 0(`is_elec_repent_a_state()=false`), whirlwind 강제(docs/2_1 L331/333)+maliceStorm `_bnsCd` 경로로 명시.

## elecRepent fusion modifier (R3, RAN)
- fusion flag preserve(상태 발명 0). `port_modules/combat_qe/elec_repent_fusion.gd`(`CombatQEElecRepentFusion`) — 3 body. 멤버 `['maliceStorm','hellRay']`(@45000), 선행 `boneStorm`(@45018), host `maliceStorm`.
- **① 활성**(@4193): `can_activate`(boneStorm 선행) + `activation_guarantee`(boneStorm/boneWall1/hellRay1 보장, one-directional). 성급 docs 2성(L598)/3성(L1123) 불일치 → `STAR_DOC_DISCREPANCY`(코드 star 상수 부재, 날조 금지).
- **② 동작 modifier**: maliceStorm 쿨 `_bnsCd=1500`(합체, @37083)/`_msCd=1200`(HUD pct denom 900 quirk); hellRay 스택 `elec?(lv≥10?3:lv≥5?2:1):1`(@36957) recharge 600f; hellRay 설치 intent(@37057) `r=200+(lv-1)*22`·EL.L·elec·`fusion_mul=1.2`·추가 cost 0(maliceStorm mats-=12 포함), dmg=`magicRef*statInt*pMagicMul*pBeamMul*_skMul('hellRay')*1.2`(stat 미제공 시 null+MISSING).
- **③ 종료/경계 + owner callback**: `deactivate`(elecRepent flag 만 제거, 캐스케이드 없음 @4176~4203); `tick_hellray_recharge`(owner frames 로만 `_hrRech-=sp` 전진, own auto-process 0, @36960).
- stat(magic_ref/stat_int/p_magic_mul/p_beam_mul/sk_mul_hellray)=ROOT `combat_stat_formula`/`equipment_affix_reader` 소비 API, 원 제공 없음 → not ready(의미대체 0). 실 fuse 적용·시전 wiring·공유 emitter(fireZone/boneWall)·HP=ENGINE only.
- **RAN**: `test_elec_repent_fusion.gd` headless **35/35 PASS, exit 0**. frozen 39/17/20/13/producer 재연 0. 증거: `team-port/combat_qe/godot-port-elec-repent-fusion-r3-20261013/owned-receipt.json`.

## maliceStorm host runtime (elecRepent host, RAN)
- P.s 상태 **아님**(포격식 aim→charge→cast dispatch, `s==='maliceStorm'` 부재) → 새 P.s 발명 0(`is_malice_storm_state()=false`). `port_modules/combat_qe/malice_storm.gd`(`CombatQEMaliceStorm`) 3 body. `elec_repent_fusion`(쿨/hellRay install) 소비, 중복 0.
- **① 준비/activation/cost**(@13682/37009): `can_activate`(aiming 재입력 취소 + 쿨 gate fused `_bnsCd`/non `_msCd`), `begin_aim`(dist150), `charge`(`_msDist=min(+24×sp,1000)`), `release_position_gamepad`(facing×dist).
- **② emit/damage/stat consumer**(@37024~37086): 범위 `200+(lv-1)×22`, 겹침 차단, `storm_damage=magicRef*statInt*pMagicMul*_skMul('maliceStorm')*_fuseMul('maliceStorm')`(미제공 null+MISSING), `cast_emit_intent`(fused: **MP50+mats12** + boneWall+boneStorm fireZone(el=D) + elecRepent hellRay(elec); non: storm fireZone(el=L) 무비용), cooldown fused1500/non1200(Fusion 소비).
- **③ lifetime/종료 owner callback**(@38041~38078): `StormZone.tick(frames, hurt_sink)` — owner clock로만 전진, 18f DOT(`hurt_sink.dot_zone` → hurtE dot+shieldHit+_webSlow storm20/boneStorm25), `t>=maxT(600, 10초)` 종료. own auto-process 0.
- stat(magicRef/statInt/pMagicMul/_skMul/_fuseMul)=ROOT `combat_stat_formula` 소비 API, mana/mats=제품 미존재 → dmg null·not castable·MISSING(의미대체 0). 공유 emitter(boneWall/fireZone)·hurtE·입력/쿨 field 적용=ENGINE only(sink). ROOT carrier whole dup 0(maliceStorm 은 carrier 아님).
- **RAN**: `test_malice_storm.gd` headless **32/32 PASS, exit 0**. frozen 39/17/20/13/black19/native27/fusion35/release 재연 0. 증거: `team-port/combat_qe/godot-port-malice-storm-first-20261014/owned-receipt.json`.
- 실백킹(stamina/melee_ref/stat_str)만 실 변이; **MISSING(exact API, 임의 상수·mana/stamina 의미대체 0)**: whirlwind_lv/weapon_spd·wRange·el/statDex/pAtkMul/_skMul/_fuseMul, mana/omniBeam_lv/magicRef/statInt/pMagicMul/pBeamMul/pMagicCost.
- ROOT notice(2334) 준수: `parry_blue_projectile`·`shield_burst_visual` whole body 중복 0(hit_arc/hit_beam 위임만, blue 이동·렌더/burst 렌더 본문 미작성). QE 판정/flag·G2 BurstRing state/radius/timer/피해 scope 유지.
- **RAN**: `test_active_skill_commands.gd` `--path .../the-exoduser/godot` headless **43/43 PASS, exit 0**. 증거: `team-port/combat_qe/godot-port-active-skills-first-20261013/owned-receipt.json`.

## 미완 / gap (정확)
- **PENDING_ENGINE_WIRING**: NativePlayer 의 입력 바인딩(Q = cancel_only, InputMap 'parry' 등록)·제품 공유 player.gd 본체 통합(subclass 본체 병합 여부)·pGuardAbsorb/pShieldBlock·pParryDmg 스탯 공급은 ENGINE 소유. producer+runtime+subclass 는 준비·검증됨(39/39), 제품 본체 통합은 ENGINE.
- **RAN(해소)**: `test_producer.gd` Godot v4.7.2 headless 격리 실행 **24/24 PASS, exit 0**. (ENGINE normal checkpoint/공개 visual 은 별도.)
- **`_PARRY_WIN` 해소**: 실 소스 재독 → **`_PARRY_WIN=16`** (game.html:8890 "sBash 20틱 중 패링 활성 16틱, 12→16 완화"). producer `SBASH_PARRY_WIN=16`(문서화) + `is_parry_window(parry_win)` 호출자 override. poise20·_sbParryT20 은 각각 `_poiseHit(e,20)`·`P._sbParryT=20` 로 별개 유지(전역상수 冒充 아님).
- E(칼등치기 sBash) 전진/반사 세부(maliceSwipe 레벨 보정)·detonate 강제기폭(_qDetonateFired)·shield loop 오디오는 본 첫 slice 범위 밖(후속 이식 단위).

## docs keyword 동기화 handoff (ENGINE 인계)
- keyword: `isPWin` / `_sbParryT` / `pParryProjDmg` / `blackBean` / `_eCanReflectProjectile` / `_PARRY_WIN` / `_sbCd` / `_sbBurst`.
- 관련 정본: `R/docs/2_3 돌진+패링+방패시스템/`(수정금지·참조), `R/docs/14밸런스+수치테이블/`(parry/poise 수치), `R/docs/2_8 퀵슬롯+물약시스템/`(Q 슬롯 activeQSk). ENGINE 가 현행값 동기화·정상 checkpoint 소유.
- 제외: `R(및 P) docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md`, `tools/marketing_capture_studio_20261009.*` (미접근).

## 후속 이식 단위 제안 (같은 소유, 구현은 감독 지시 연결)
1. **E 칼등치기(sBash) 전진 패링/반사 slice** — maliceSwipe 레벨 보정·redBean→blueBean 변환·전진 돌진 패링(game.html:34016~34110). 2_3 참조(수정금지).
2. **detonate 강제기폭(_qDetonateFired)·shield release burst slice** — sBlock 유지→해제 시 `G._sbBurst` 확장/기폭(whirlDet 와 분리).
3. **Q 슬롯 라우팅(activeQSk)·iceOrb Q 경로 slice** — activeQSk 토글·_qIsIceOrb 현재 false 의 포트 계약(퀵슬롯 2_8).
