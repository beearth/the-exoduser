class_name CombatQERuntime
extends RefCounted
##
## FDG Godot 이식 — 전투 Q/E 실제 실행 본문(G2). TASK GODOT-PORT-COMBAT_QE-FIRST-20261013.
##
## producer.gd(순수 static intent)·caller.gd(NodeAdapter)에 이어, 이 파일은 "상태를 실제로 변이하는
## 실행 본문"을 담는다 — 단순 getter/forward/spec/TODO 가 아니라 원 R(game.html, pin 4192030 /
## sha256 bc7df271...)의 hurtP/보호막 분기와 _sbBurst 전개 루프를 그대로 포팅한 계산·변이 코드다.
##
## 소유: 격리 포트 모듈(port_modules/combat_qe). 공유 Player/world/factory/공통 emitter 직접 수정 0.
## 반사탄 생성·충격파 노드·적 reaction 은 ENGINE 소유 → 주입된 sink(projectile_sink/impact_sink/
## enemy_sink)로 위임한다. 티켓/강제 single-hit/임의 무적 0, 원 무적 window(iframes) 보존.
##
## 원값(raw, native 60fps 프레임):
##   MP_COST_SHIELD        : P.mp-=10                                    (game.html:33687)
##   PARRY_WINDOW_FRAMES   : P._sbParryT=20                              (game.html:33687)
##   SHIELD_CD(native)     : ~~(30*(1+shieldCdRed))  ← JS ~~ = ToInt32 trunc (game.html:33687)
##                           GDScript int()=0방향 절삭 → 양수 red 에서 동일. round 금지.
##   SB_BURST 전개         : _b.r += _b.spd*sp; if(_b.r>=_b.maxR) 소멸     (game.html:36557/36563)
##                           maxR = det ? 150+(lv-1)*15 : 90, spd=8, r0=P.r+5 (game.html:33687)
##   sBlock 흡수(패링실패) : _blkBase=(pGuardAbsorb()+pShieldBlock())*(dot?.5:1)
##                           _blkRate=min(parryFailed?.25:.50, parryFailed?_blkBase*.5:_blkBase)
##                           dmg=max(1,~~(dmg*(1-_blkRate))); parryFailed → ~~(dmg*1.3), poise-1
##                           detonate → parryBank += (raw - dmg)          (game.html:43998~44010)
##   패링 성공            : _poiseHit(e,20)/stun60/parryBank += reflectDmg (game.html 대표 41762)
##   blue 유도반사         : blueBean/parryBlueBean/homing/magic, '#00e5ff' (game.html:34030)

const P := preload("res://port_modules/combat_qe/producer.gd")

## ─────────────────────────────────────────────────────────────────────────────
## BurstRing — G._sbBurst 전개 링(실제 전개·소멸 로직). 원 36556~36563 포팅.
##   ENGINE 의 실제 충격파 노드는 projectile_sink 가 소유; 이 링은 r→maxR 수치 상태만 보유.
## ─────────────────────────────────────────────────────────────────────────────
class BurstRing extends RefCounted:
	var x: float
	var y: float
	var r: float
	var max_r: float
	var spd: float
	var det: bool
	var peace: bool
	var release: bool      # 원 G._sbBurst.release (해제 버스트 여부; @34386/34409)
	var alive: bool = true

	func _init(bx: float, by: float, intent: Dictionary, is_peace: bool = false) -> void:
		x = bx; y = by
		r = float(intent.r); max_r = float(intent.max_r)
		spd = float(intent.spd); det = bool(intent.det)
		peace = is_peace
		release = bool(intent.get("release", false))   # enter 버스트엔 키 없음 → false

	## 원: _b.r += _b.spd*sp;  if(_b.r>=_b.maxR) G._sbBurst=null
	## 반환: 전개 후에도 살아있으면 true, 이 틱에 maxR 도달해 소멸하면 false.
	func advance(sp: float) -> bool:
		if not alive:
			return false
		r += spd * sp
		if r >= max_r:
			r = max_r
			alive = false
		return alive

## ─────────────────────────────────────────────────────────────────────────────
## Q 진입: sBlock — 실제 변이 본문 (원 @33687). mp-10, state, 패링창20, cd=trunc, burst 생성.
##   player: combat_qe leaf/subclass 가 구현한 field(mana/state/sb_parry_t/parry_t/shield_cd/
##           shield_cd_red). projectile_sink: 생성된 BurstRing 을 받는 ENGINE 측 sink(없으면 skip).
##   반환: 생성된 BurstRing(검증/추적용).
## ─────────────────────────────────────────────────────────────────────────────
func enter_shield_block(player: Object, intent: Dictionary, projectile_sink: Object = null) -> BurstRing:
	player.mana -= float(intent.mp_cost)                         # P.mp-=10
	player.state = String(intent.state)                          # "sBlock"
	player.sb_parry_t = int(intent.sb_parry_t)                   # 20 (Q 패링창)
	player.parry_t = int(intent.parry_t)                         # 0
	player.shield_cd = _native_cd(int(intent.shield_cd_base), player.shield_cd_red)  # ~~(30*(1+red))
	return _spawn_sb_burst(player, intent.burst, false, projectile_sink)

## Q 진입: peaceShield — 실제 변이 본문 (원 @15054). state/패링창/parry_t/parry_bank.
func enter_peace_shield(player: Object, intent: Dictionary) -> void:
	player.state = String(intent.state)                          # "peaceShield"
	player.sb_parry_t = int(intent.sb_parry_t)                   # 20
	player.parry_t = int(intent.parry_t)                         # 0
	player.parry_bank = int(intent.parry_bank)                   # 0

## native 쿨다운 변환: ~~(base*(1+red)). JS ~~ 는 ToInt32(0방향 절삭) → GDScript int() 동일.
## round 사용 금지 — 비정수 red 에서 원본과 1프레임 어긋남.
func _native_cd(base_frames: int, cd_red: float) -> int:
	return int(float(base_frames) * (1.0 + cd_red))              # trunc toward 0

## ─────────────────────────────────────────────────────────────────────────────
## _spawn_sb_burst — 실제 생성 본문 (원 G._sbBurst 할당 @33687 / release @34386·34409).
##   BurstRing 을 만들고 projectile_sink.spawn_burst(ring) 로 ENGINE 노드에 위임.
##   단순 forward 아님: r0=player.r+pad 계산, release 변형(max_r override), peace 플래그 반영.
## ─────────────────────────────────────────────────────────────────────────────
func _spawn_sb_burst(player: Object, burst_intent: Dictionary, is_peace: bool, projectile_sink: Object) -> BurstRing:
	var ring := BurstRing.new(_px(player), _py(player), burst_intent, is_peace)
	if projectile_sink != null and projectile_sink.has_method("spawn_burst"):
		projectile_sink.spawn_burst(ring)
	return ring

## 보호막 해제 버스트 — 원 공개 release 명령 소비.
##   sBlock 해제 (@34386): {r:P.r+5, maxR:_sbReleaseR, spd:8, det:P.skills.detonate>=1, release:true}
##                         + P._sbParryT=12 (해제 패링창, 진입 20과 별개). state='idle'.
##   peace 해제 (@34409): {..., det:false, peace:true, release:true}.
##   det 은 source-backed detonateLv(player.detonate_lv>=1) 반영 — 고정 false 아님. release flag 세움.
func release_shield(player: Object, release_r: float, is_peace: bool, projectile_sink: Object = null) -> BurstRing:
	var det_on: bool = (not is_peace) and (player.detonate_lv >= 1)   # 원 P.skills.detonate>=1 (peace=false)
	var intent := {
		"r": player.get_player_r() + P.SB_BURST_R_PAD,
		"max_r": release_r,
		"spd": P.SB_BURST_SPD,
		"det": det_on,
		"release": true,                                             # 원 release:true
	}
	if not is_peace:
		player.sb_parry_t = 12                                       # 원 P._sbParryT=12 (sBlock 해제, @34386)
	player.state = "idle"
	return _spawn_sb_burst(player, intent, is_peace, projectile_sink)

func _px(player: Object) -> float:
	return float(player.global_position.x) if ("global_position" in player) else 0.0
func _py(player: Object) -> float:
	return float(player.global_position.y) if ("global_position" in player) else 0.0

## ─────────────────────────────────────────────────────────────────────────────
## tick — native60 프레임 소비: 패링창 감소 + 활성 BurstRing 전개(소멸 시 impact_sink 통지).
##   sp = delta*60 (원 _dtSp). caller.tick 과 별개로, 런타임이 소유한 ring 전개를 담당.
## ─────────────────────────────────────────────────────────────────────────────
func tick(player: Object, ring: BurstRing, delta: float, impact_sink: Object = null) -> void:
	var sp: float = delta * 60.0
	player.tick_parry_window(sp)                                 # _sbParryT 감소(native60)
	if ring != null and ring.alive:
		var still_alive: bool = ring.advance(sp)
		if not still_alive and impact_sink != null and impact_sink.has_method("on_burst_expire"):
			impact_sink.on_burst_expire(ring)                    # maxR 도달 소멸(det 폭발은 ENGINE 소유)

## ─────────────────────────────────────────────────────────────────────────────
## shield_reduce_damage — sBlock/peaceShield 피해 감소 실제 계산 (원 @43998~44010 포팅).
##   block_base = pGuardAbsorb()+pShieldBlock() (ENGINE 스탯 주입; 임의 상수 금지).
##   패링실패(parry_failed=_sbParryT<=0 && !dot) → 흡수율 절반 + ×1.3 + poise-1.
##   반환: { dmg, blk_rate, bank_add, poise_after, stunned }.
## ─────────────────────────────────────────────────────────────────────────────
func shield_reduce_damage(player: Object, raw_dmg: int, block_base: float, parry_failed: bool, is_dot: bool) -> Dictionary:
	var blk_base: float = block_base * (0.5 if is_dot else 1.0)
	var cap: float = 0.25 if parry_failed else 0.50
	var candidate: float = (blk_base * 0.5) if parry_failed else blk_base
	var blk_rate: float = minf(cap, candidate)
	var dmg: int = maxi(1, int(float(raw_dmg) * (1.0 - blk_rate)))   # ~~(dmg*(1-rate)) trunc
	var stunned: bool = false
	var poise_after: int = player.poise
	if parry_failed:
		dmg = int(float(dmg) * 1.3)                              # ~~(dmg*1.3)
		poise_after = maxi(0, player.poise - 1)
		player.poise = poise_after
		if poise_after <= 0:
			stunned = true                                       # 원: pStun(240*(1-ccRes/stunRes)), iframes=60 → ENGINE
	var bank_add: int = raw_dmg - dmg                            # detonate 시 parryBank += (raw-dmg)
	if player.detonate_lv >= 1:
		player.parry_bank += bank_add
	return { "dmg": dmg, "blk_rate": blk_rate, "bank_add": bank_add, "poise_after": poise_after, "stunned": stunned }

## ─────────────────────────────────────────────────────────────────────────────
## _do_parry_native — 패링 성공 실제 본문 (원 doParry + _poiseHit(e,20)/stun60/parryBank/blue).
##   reflect_dmg 계산은 producer.parry_proj_damage; 여기서 적립·적 반응·탄 변이를 실제 수행.
##   enemy_sink: 적 poise/stun 값 전달(적 reaction 소유 아님). proj: blue 유도반사로 변이.
##   단순 forward 아님 — parry_bank 적립·sb_parry_t 소비·proj 필드 변이·sink 호출을 직접 실행.
## ─────────────────────────────────────────────────────────────────────────────
func _do_parry_native(player: Object, proj: Object, enemy_sink: Object = null, impact_sink: Object = null) -> int:
	var reflect_dmg: int = P.parry_proj_damage(
		proj.dmg, player.is_q_magic_parry(),
		player.get_parry_scale(), player.get_parry_dmg_mul(),
		player.get_parry_bonus(), player.get_leg_shield_parry(), player.get_ki_floor())
	var hit: Dictionary = P.make_parry_hit(reflect_dmg)
	player.parry_bank += int(hit.parry_bank_add)                 # parryBank 적립(실제 변이)
	player.sb_parry_t = 0                                        # 패링창 1회 소비(원 P._sbParryT=0)
	# 적 반응: _poiseHit(e,20)/stun60 값 전달(적 reaction 재작성 아님)
	if enemy_sink != null and ("source_enemy" in proj) and proj.source_enemy != null:
		if enemy_sink.has_method("apply_poise"): enemy_sink.apply_poise(proj.source_enemy, int(hit.poise))
		if enemy_sink.has_method("apply_stun"):  enemy_sink.apply_stun(proj.source_enemy, int(hit.stun_frames))
	# 반사탄 변이: Q 성공 → blue 유도반사(#00e5ff)
	var rf: Dictionary = hit.reflect
	if "blue_bean" in proj: proj.blue_bean = rf.blue_bean
	if "parry_blue_bean" in proj: proj.parry_blue_bean = rf.parry_blue_bean
	if "homing" in proj: proj.homing = rf.homing
	if "magic" in proj: proj.magic = rf.magic
	if "friendly" in proj: proj.friendly = true
	if "col" in proj: proj.col = rf.col
	if "dmg" in proj: proj.dmg = reflect_dmg                     # 물리/마법 반사탄 피해 = pParryProjDmg (원 M29 등)
	if impact_sink != null and impact_sink.has_method("on_parry_reflect"):
		impact_sink.on_parry_reflect(proj, reflect_dmg)
	return reflect_dmg

const BLACK_FIELD_ORDER := ["friendly", "dmg", "life", "ml", "blue_bean", "parry_blue_bean", "magic", "homing", "from_rainbow", "col", "aoe_r", "aoe_dmg"]

## ─────────────────────────────────────────────────────────────────────────────
## canonical_q_reflection — ROOT Node.apply_source_q_reflection(ctx) 의 reaction 산출 미러(소비 계약).
##   원 R game.html:35674: _npDmg=~~(pParryProjDmg(p.dmg,_sbPW)*1.5).
##     즉 base=pParryProjDmg(incoming, actual_sbPW)  (scale 분기 isQ=_sbPW 존중, 강제 true/neutral 발명 0)
##         → projectile_dmg = trunc(base*1.5)
##   @35681: parryBank += (변이된 p.dmg || 10)  → bank_add = projectile_dmg (||10 guard)
##   @35683: doParry(변이된 p.dmg, ..., p.blackBean?'rainbow':p.el) → doParry dmg = projectile_dmg
##   base 는 ROOT stat 의존(magicRef/statInt/... = missing) → ctx 로 공급: parry_base_damage 또는
##     parry_base_provider(incoming) 정확히 1. homing_target 또는 homing_target_provider 정확히 1.
##   이 함수는 reaction 값(base/carrier/bank/element/field_order)만 산출 — carrier physics 전환 복제 0.
## ctx: { player_position:Vector2, incoming_dmg:float, actual_sbPW:bool, is_black_bean:bool, element,
##        parry_base_damage? , parry_base_provider?(Callable), homing_target? , homing_target_provider?(Callable) }
## 반환: { ok, incoming_dmg_before, parry_base_damage, projectile_dmg, bank_add, parry_element,
##         field_order, raw, handoff, error? }
func canonical_q_reflection(ctx: Dictionary) -> Dictionary:
	var incoming: float = float(ctx.get("incoming_dmg", 0.0))
	# exactly-1: parry_base_damage XOR parry_base_provider
	var has_base: bool = ctx.has("parry_base_damage") and ctx["parry_base_damage"] != null
	var has_base_prov: bool = ctx.has("parry_base_provider") and ctx["parry_base_provider"] != null
	if has_base == has_base_prov:
		return { "ok": false, "error": "ctx 는 parry_base_damage 또는 parry_base_provider 정확히 1 필요(강제 isQ/neutral 발명 0)" }
	# exactly-1: homing_target XOR homing_target_provider (둘 다 null 허용 — 없으면 reverse v×2)
	var has_tgt: bool = ctx.has("homing_target")
	var has_tgt_prov: bool = ctx.has("homing_target_provider") and ctx["homing_target_provider"] != null
	if has_tgt and has_tgt_prov:
		return { "ok": false, "error": "homing_target 또는 homing_target_provider 정확히 1" }

	var base: int
	if has_base:
		base = int(ctx["parry_base_damage"])
	else:
		base = int((ctx["parry_base_provider"] as Callable).call(incoming))   # actual_sbPW 분기는 provider 내부(ROOT)
	var projectile_dmg: int = int(float(base) * 1.5)                          # 원 ~~(base*1.5)
	var bank_add: int = projectile_dmg if projectile_dmg > 0 else 10          # 원 (변이된 p.dmg||10)
	var parry_element: String = "rainbow" if bool(ctx.get("is_black_bean", true)) else String(ctx.get("element", ""))
	return {
		"ok": true,
		"incoming_dmg_before": incoming,
		"parry_base_damage": base,
		"projectile_dmg": projectile_dmg,
		"bank_add": bank_add,                 # = projectile_dmg (별 raw pParryBase 아님)
		"parry_element": parry_element,
		"field_order": BLACK_FIELD_ORDER,
		"raw": {
			"src": "game.html:35674 _npDmg=~~(pParryProjDmg(p.dmg,_sbPW)*1.5); 35681 parryBank+=(p.dmg||10); 35683 doParry(p.dmg,...,blackBean?'rainbow':el)",
			"actual_sbPW_respected": ctx.get("actual_sbPW", null),
			"formula": "projectile_dmg=trunc(base*1.5); bank_add=doParry_dmg=projectile_dmg",
		},
		"handoff": "ROOT Node.apply_source_q_reflection(ctx)->Dictionary + Node.get_shot()->Shot (same-carrier, 새 birth 권한 0).",
	}

## ─────────────────────────────────────────────────────────────────────────────
## reflect_blackbean_q — blackBean Q 성공 반사: ctx 生成 + canonical consumer. (원 @35674~35683)
##   정정(0035): base=pParryProjDmg(incoming,_sbPW), carrier=trunc(base*1.5), bank_add=carrier(동일),
##     doParry dmg=carrier. (구 incoming×1.5 / bank 별도 = 틀린 old19 계약, 폐기)
##   velocity(원 순서, field 변환 전): homing→aim max(5,|v|) / else 반대 v×2. life/ml=180.
##   같은 탄 in-place 1회. 같은 Q 프레임 blue 이동 0(다음 tick deferred). 새 birth/blue physics 복제 0.
##   ROOT carrier(physics)=미완(ready=false) 이면 seam 待驗 — 코드 작성으로 READY claim 0.
## ctx_in: { actual_sbPW, parry_base_damage?|parry_base_provider?, homing_target?|homing_target_provider? }
func reflect_blackbean_q(player: Object, proj: Object, ctx_in: Dictionary = {}, carrier_sink: Object = null) -> Dictionary:
	var incoming: float = float(proj.dmg)
	var is_black: bool = bool(proj.black_bean) if ("black_bean" in proj) else true
	var el: String = String(proj.col) if ("col" in proj) else ""

	# ── ctx 生成 (base/target 공급은 ctx_in 그대로 — 강제 isQ/neutral 발명 0) ──
	var ctx := {
		"player_position": Vector2(_px(player), _py(player)),
		"incoming_dmg": incoming,
		"actual_sbPW": ctx_in.get("actual_sbPW", null),   # 존중(공급 field), 강제 true 0
		"is_black_bean": is_black,
		"element": el,
	}
	if ctx_in.has("parry_base_damage"): ctx["parry_base_damage"] = ctx_in["parry_base_damage"]
	if ctx_in.has("parry_base_provider"): ctx["parry_base_provider"] = ctx_in["parry_base_provider"]
	if ctx_in.has("homing_target"): ctx["homing_target"] = ctx_in["homing_target"]
	if ctx_in.has("homing_target_provider"): ctx["homing_target_provider"] = ctx_in["homing_target_provider"]

	# ── reaction 산출: ROOT Node.apply_source_q_reflection 우선, 미완이면 로컬 canonical(ready=false) ──
	var root_ready: bool = false
	var res: Dictionary
	if carrier_sink != null and carrier_sink.has_method("apply_source_q_reflection"):
		res = carrier_sink.apply_source_q_reflection(ctx)
		root_ready = bool(res.get("ok", false))   # ROOT API 결과 — compile/test 완료 시에만 ready
	else:
		res = canonical_q_reflection(ctx)          # 로컬 미러(contract 검증용). ROOT 미완 → ready=false.
	if not bool(res.get("ok", false)):
		return { "ok": false, "ready": false, "error": res.get("error", "ctx 불충분"), "root_ready": false }

	var projectile_dmg: int = int(res.projectile_dmg)
	var bank_add: int = int(res.bank_add)

	# ── 소비: bank_add → parry_bank (doParry dmg = projectile_dmg 동일) ──
	player.parry_bank += bank_add
	player.sb_parry_t = 0

	# ── velocity (원 순서, field 변환 전): homing → aim max(5,|v|) / else 반대 v×2 ──
	var target = ctx.get("homing_target", null)
	if target == null and ctx.has("homing_target_provider") and ctx["homing_target_provider"] != null:
		target = (ctx["homing_target_provider"] as Callable).call()
	var vx: float = float(proj.vx) if ("vx" in proj) else 0.0
	var vy: float = float(proj.vy) if ("vy" in proj) else 0.0
	var new_vx: float
	var new_vy: float
	if target != null:
		var tx: float = (target.x if (target is Vector2) else float(target.x))
		var ty: float = (target.y if (target is Vector2) else float(target.y))
		var ang: float = atan2(ty - _py(player), tx - _px(player))
		var spd: float = maxf(5.0, sqrt(vx * vx + vy * vy))
		new_vx = cos(ang) * spd; new_vy = sin(ang) * spd
	else:
		new_vx = vx * -2.0; new_vy = vy * -2.0

	# ── 같은 탄 in-place 1회 (field_order 순서). 같은 Q 프레임 blue 이동 0(deferred next tick) ──
	if "vx" in proj: proj.vx = new_vx
	if "vy" in proj: proj.vy = new_vy
	if "friendly" in proj: proj.friendly = true
	if "dmg" in proj: proj.dmg = projectile_dmg        # carrier = trunc(base*1.5) (= bank_add)
	if "life" in proj: proj.life = 180
	if "ml" in proj: proj.ml = 180
	if "blue_bean" in proj: proj.blue_bean = true
	if "parry_blue_bean" in proj: proj.parry_blue_bean = true
	if "magic" in proj: proj.magic = true
	if "homing" in proj: proj.homing = true
	if "from_rainbow" in proj: proj.from_rainbow = is_black
	if "col" in proj: proj.col = P.BLUE_REFLECT_COL
	if "aoe_r" in proj: proj.aoe_r = 0.0
	if "aoe_dmg" in proj: proj.aoe_dmg = 0.0

	# ── same-carrier seam (새 birth 권한 0). ROOT get_shot/apply_source_q_reflection 과 정렬 ──
	return {
		"ok": true,
		"ready": root_ready,                 # ROOT API compile/test 전엔 false (待驗)
		"incoming_dmg_before": incoming,
		"parry_base_damage": int(res.parry_base_damage),
		"projectile_dmg": projectile_dmg,
		"bank_add": bank_add,                # = projectile_dmg
		"parry_element": res.parry_element,
		"velocity": { "vx": new_vx, "vy": new_vy },
		"field_order": res.field_order,
		"root_ready": root_ready,
		"handoff": res.get("handoff", ""),
		"deferred_blue_move": "같은 Q 프레임 이동 0 — ROOT carrier 가 다음 tick 부터 消費(same proj, 이동 2번 0).",
	}
