extends RefCounted
## P1-002.E — 기본 무기 근접 1타의 hurtE(game.html 42110~43119) 실행자.
## 대상: hurtE owner API를 가진 일반 적 — generic enemy.gd(P1-002.E) +
## 첫 스테이지 전용 스크립트 적 4종(P1-002.F: flesh_crawler/spine_beast/
## ice_soul_flame/hive_bloater, 공용 owner는 native_dedicated_enemy_hurte_owner.gd).
## 원칙:
##  - 값은 Main의 12개 normal-enemy provider와 실제 owner(State G/STATS/PASSIVES/INV,
##    enemy 필드)에서만 읽는다. NOT_READY면 그 지점에서 정지(halt)하고 폴백하지 않는다.
##  - 적용된 prefix는 적용된 채 남고, journal이 정지 지점을 정확히 보고한다.
##  - 이식 안 된 분기(어픽스/전설 효과 등)가 "활성"이면 가짜 구현 대신 정지한다.
##    스타터 장비에서는 전부 비활성(값 0)이라 도달하지 않는다.
##  - RNG는 원본 hurtE 본문이 Math.random()을 소비하는 게임플레이 지점에서만
##    rand provider로 같은 순서·같은 횟수 소비한다 (시각 FX 내부 RNG는 미이식과
##    함께 비소비 — docs/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md 고정).
## 실행 문장·단락 근거의 전체 표: docs/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md

const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const DROP_SOURCE = preload("res://port_modules/kill_reward/drop_item_source.gd") # P2-001c
const UNDEAD_ETYPES: Array[int] = [4, 10, 12, 14, 23, 40, 47, 82, 83, 85] # game.html:24729 _UNDEAD_ET
const SPECIAL_HIT_ETYPES: Array[int] = [99, 92, 91, 93, 40, 41, 57, 6, 63, 74, 85, 87] # 42136~42182·42508 특수 피격/사망 분기 보유 etype — 활성 시 정지
const PROVIDER_KEYS: Array[String] = ["eq_affix", "u_eq", "p_atk_mul", "melee_ref",
	"parry_lesson_active", "player_view", "stat_str", "p_dot_pool", "l_eq", "rand",
	"el_mul", "play_time"]
const AFFIX_READY: Array[String] = ["READY", "READY_PARTIAL_AFTER_SOURCE_THROW"]

var journal: Array = []
var rng_draws: Array = []
var _providers: Dictionary = {}
var _main: Node
var _state: Node
var _world: Node2D
var _enemy: Node
var _halt_reason := ""
var _halt_line := 0

# ── 33360 wSwing: _wEl=(wp().el||0)||(_lEq('_lGloveElem')>0?1+~~(rand*4):0) ──
static func resolve_basic_attack_element(main: Node) -> Dictionary:
	if not is_instance_valid(main) or not main.has_method("get_native_normal_enemy_damage_provider_callbacks"):
		return {"ready": false, "line": 33360, "reason": "actual_main_hurte_entry_missing"}
	var providers: Dictionary = main.get_native_normal_enemy_damage_provider_callbacks()
	if providers.size() != 12:
		return {"ready": false, "line": 33360, "reason": "normal_enemy_providers_unavailable"}
	var state: Variant = main.get("source_state")
	if not is_instance_valid(state) or not state.has_method("read_current_inventory"):
		return {"ready": false, "line": 33360, "reason": "actual_state_owner_missing"}
	var inventory: Variant = state.read_current_inventory()
	if not inventory is Dictionary or not inventory.get("equipped") is Dictionary:
		return {"ready": false, "line": 33360, "reason": "current_inventory_not_ready"}
	var weapon: Variant = inventory["equipped"].get("weapon")
	var el: Variant = weapon.get("el") if weapon is Dictionary else null
	if (el is int or el is float) and is_finite(float(el)) and float(el) != 0.0:
		return {"ready": true, "line": 33360, "value": int(el)}
	var glove: Dictionary = providers["l_eq"].call("_lGloveElem")
	if str(glove.get("status")) not in AFFIX_READY:
		return {"ready": false, "line": 33360, "reason": "l_eq_not_ready:" + str(glove.get("reason"))}
	if float(glove.get("value", 0)) > 0.0:
		# 전설 장갑 랜덤 원소(스윙당 1회 rand)는 본 단계 미이식 — 정지, 폴백 금지.
		return {"ready": false, "line": 33360, "reason": "unported_branch_active:_lGloveElem_random_element"}
	return {"ready": true, "line": 33360, "value": 0}

# P1-002.G: 실제 존재하는 두 호출부 opts 프로필만 받는다 —
#   weapon(37617): {kbMult:1, poiseMult:1.5, noPoise:false, poiseHit:false, poiseSkill:false, _lessonAttack:'weapon'}
#   kiSlash(19837): {poiseHit:true, kbMult:0.5, noImpact:true, _lessonAttack:'kiSlash', _lessonFullCharge:…, _kiFull:…}
# hurtE 본문이 읽는 키만 효과를 갖고, 목록 밖 키는 가짜 구성 방지를 위해 정지한다.
const SUPPORTED_OPT_KEYS: Array[String] = ["kbMult", "poiseMult", "noPoise", "poiseHit",
	"poiseSkill", "noImpact", "_lessonAttack", "_lessonFullCharge", "_kiFull"]

func execute(main: Node, world: Node2D, enemy: Node, base_damage: int, ang: float, atk_el: int, opts: Dictionary = {}) -> Dictionary:
	_main = main
	_world = world
	for opt_key in opts:
		if opt_key not in SUPPORTED_OPT_KEYS:
			return _halt(42110, "hurte_opts_unsupported:" + str(opt_key))
	# 42265~42266: kbM/psM — undefined면 1.0 (원문 기본값).
	var kb_mult: float = float(opts["kbMult"]) if opts.has("kbMult") else 1.0
	var poise_mult: float = float(opts["poiseMult"]) if opts.has("poiseMult") else 1.0
	var poise_hit: bool = opts.get("poiseHit") == true
	var ki_full: bool = opts.get("_kiFull") == true
	var source_label: String = str(opts.get("_lessonAttack", "weapon"))
	# noImpact: 소비처(42417 _addImpact)가 미이식이라 효과 지점 없음 — 수용만.
	# noPoise/poiseSkill/_lessonFullCharge: hurtE 본문(비lesson)에서 미읽기 — 수용만.
	_enemy = enemy
	if not is_instance_valid(main) or not main.has_method("get_native_normal_enemy_damage_provider_callbacks"):
		return _halt(0, "actual_main_hurte_entry_missing")
	_providers = main.get_native_normal_enemy_damage_provider_callbacks()
	for key in PROVIDER_KEYS:
		if not _providers.get(key) is Callable or not _providers[key].is_valid():
			return _halt(0, "normal_enemy_provider_missing:" + key)
	var state: Variant = main.get("source_state")
	if not is_instance_valid(state):
		return _halt(0, "actual_state_owner_missing")
	_state = state
	var fields: Dictionary = enemy.read_native_normal_enemy_hurte_fields(world)
	if fields.get("ready") != true:
		return _halt(0, "actual_enemy_owner_fields_not_ready:" + str(fields.get("reason")))

	# ── hitArc 37614: mult=elMul(el,e.el); dmg=~~(baseDmg*mult) ──
	var el_mul: Dictionary = _providers["el_mul"].call(atk_el, int(fields["el"]))
	if str(el_mul.get("status")) != "READY":
		return _halt(37614, "el_mul_not_ready:" + str(el_mul.get("reason")))
	var mult: float = float(el_mul["value"])
	var dmg: int = FORMULA.js_to_int32(float(base_damage) * mult)
	_log(37614, "elMul", {"atk_el": atk_el, "enemy_el": int(fields["el"]), "mult": mult, "dmg": dmg})

	# ── 42111: 패링 수련 위임 게이트 ──
	var lesson: Dictionary = _providers["parry_lesson_active"].call()
	if str(lesson.get("status")) != "READY":
		return _halt(42111, "parry_lesson_active_not_ready:" + str(lesson.get("reason")))
	if lesson.get("active") == true:
		# 42111 원문: `_parryLesson.hurtEnemy(e,dmg,ang,opts); return;` — 레슨 owner 위임
		# (P2-001k). 레슨 흐름 owner가 lesson_reference로 제공될 때만 실제 위임하고,
		# 없으면 종전대로 정지(폴백 금지). hurtE 본문 판정은 이 분기에서 실행되지 않는다
		# (원본 동일 — 레슨 전용 처리로 조기 return).
		var lesson_ref: Variant = lesson.get("lesson_reference")
		if is_instance_valid(lesson_ref) and lesson_ref.has_method("native_lesson_hurt_enemy"):
			var delegated: Dictionary = lesson_ref.native_lesson_hurt_enemy(_enemy, dmg, ang, opts)
			_log(42111, "parry_lesson_delegated", delegated)
			return _finish(true, {"applied": false, "returned_at": 42111, "lesson_delegated": true,
				"lesson_result": delegated})
		return _halt(42111, "unported_branch_active:parry_lesson_hurt_enemy")
	# ── 42112~42113: 생존/HP 가드 ──
	if not fields["alive"] or float(fields["hp"]) <= 0.0:
		_log(42112, "dead_guard_return", {})
		return _finish(true, {"applied": false, "returned_at": 42112})
	# 42115 _shBufI++ / 43118 -- : JS shQuery 재진입 버퍼 가드 — Godot 구조상 불필요(no-op).
	# 42117 _petOnAtk(): 펫 시스템 미이식.
	_log(42117, "unported_skip:_petOnAtk", {})
	# ── 42120~42121: 부활 무적 ──
	var revive_iframes: float = float(fields.get("reviveIframes", 0.0))
	if revive_iframes > 90.0:
		if not _bookkeeping({"reviveIframes": 90.0}): return _result_now()
		revive_iframes = 90.0
	if revive_iframes > 0.0:
		if not _bookkeeping({"reviveIframes": maxf(0.0, revive_iframes - 1.0)}): return _result_now()
		_log(42121, "revive_iframes_return", {"left": maxf(0.0, revive_iframes - 1.0)})
		return _finish(true, {"applied": false, "returned_at": 42121})
	# ── 42124~42182·이후 특수 사망 분기: 미이식 etype 활성 가드 ──
	if fields["ib"] == true:
		return _halt(42124, "unported_branch_active:boss_hurtE")
	if int(fields["etype"]) in SPECIAL_HIT_ETYPES:
		return _halt(42136, "unported_branch_active:special_etype_" + str(fields["etype"]))
	# 42162~42166: parryBlueBean/bleed/poison opts — 기본 무기 opts에 없음(단락). p_dot_pool 미호출.
	# ── 42172 ──
	var sh_blocked := false
	# ── 42173: 원소 저항 ──
	var e_res: Variant = fields.get("eRes")
	if e_res is Array and atk_el >= 0 and atk_el < e_res.size() and float(e_res[atk_el]) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * (1.0 - float(e_res[atk_el])))
		_log(42173, "eRes", {"dmg": dmg})
	# ── 42187~42188: M14 / 수호 오라 ──
	if fields["mods"] is Array and fields["mods"].has("M14"):
		return _halt(42187, "unported_branch_active:mod_M14")
	var a_def: Variant = fields.get("_aDefM")
	if (a_def is int or a_def is float) and float(a_def) < 1.0 and float(a_def) != 0.0:
		return _halt(42188, "unported_branch_active:guardian_aura")
	# ── 42189: M22 동료불사 — shQuery(e,120) 스캔 ──
	if fields["mods"] is Array and fields["ib"] != true:
		for other in world.get_enemies():
			if other == enemy or not is_instance_valid(other) or other.get("alive") != true:
				continue
			var mods: Variant = other.get("mods")
			if enemy.global_position.distance_to(other.global_position) <= 120.0 \
					and mods is Array and mods.has("M22"):
				dmg = FORMULA.js_to_int32(float(dmg) * 0.67)
				_emit_text(enemy.global_position.x, enemy.global_position.y - 8.0, "불사 보호", "#ff66aa", 15)
				_log(42189, "m22_protection", {"dmg": dmg})
				break
	# ── 42191~42195: 몬스터 피격음 — 기존 이식 소비자(main._on_native_attack_enemy_audio)
	#    가 enemy_damage(raw>0, source weapon) 수신으로 동일 분류/8틱 쿨다운/랜덤 폴백 수행.
	enemy.report_native_normal_enemy_hurte_event("enemy_damage", {"id": enemy.data["id"],
		"raw_amount": dmg, "amount": 0, "absorbed": 0.0, "eShield": fields["eShield"],
		"hp": fields["hp"], "source": source_label, "phase": "hurtE_42191_hit_sfx"})
	_log(42191, "hit_sfx_requested", {"raw_amount": dmg})
	# ── 42197~42205: 감전 스택/감전 부여/저주 ──
	if float(fields.get("_shockStk", 0.0)) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + float(fields["_shockStk"]) * 0.05))
		_log(42197, "shock_stack", {"dmg": dmg})
	if atk_el == 4: # EL.L — 감전 부여(스택/마비)는 미이식
		return _halt(42199, "unported_branch_active:lightning_shock_apply")
	if float(fields.get("_cursed", 0.0)) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * 1.25)
		_log(42205, "curse_amp", {"dmg": dmg})
	# ── 42207: STR 배율 ──
	var str_mul: Dictionary = _providers["stat_str"].call()
	if str(str_mul.get("status")) != "READY":
		return _halt(42207, "stat_str_not_ready:" + str(str_mul.get("reason")))
	dmg = FORMULA.js_to_int32(float(dmg) * float(str_mul["value"]))
	_log(42207, "statStr", {"value": float(str_mul["value"]), "dmg": dmg})
	# ── 42209: 신성력 언데드 보너스 ──
	if (int(fields["etype"]) in UNDEAD_ETYPES or fields.get("_isGhoul") == true) and fields["ib"] != true:
		var anti: Variant = _affix("antiRevive", 42209)
		if anti == null: return _result_now()
		if float(anti) > 0.0:
			dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + float(anti)))
			_log(42209, "antiRevive", {"dmg": dmg})
	# ── 42211: elemConvert ──
	if atk_el == 0:
		var convert: Variant = _affix("elemConvert", 42211)
		if convert == null: return _result_now()
		if float(convert) > 0.0:
			var roll: Variant = _rand(42211, "elemConvert")
			if roll == null: return _result_now()
			if float(roll) < float(convert):
				# 무기 속성 전환 — 속성 무기 자체가 본 경로 미이식 범위.
				return _halt(42211, "unported_branch_active:elemConvert_proc")
	# ── 42213: elemFocus ──
	if atk_el > 0:
		var focus: Variant = _affix("elemFocus", 42213)
		if focus == null: return _result_now()
		if float(focus) > 0.0:
			dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + float(focus)))
	# ── 42215~42219: 속성별 뎀% ──
	if atk_el > 0 and atk_el <= 4:
		var ax_names: Array = ["", "fireDmgPct", "iceDmgPct", "darkDmgPct", "lightDmgPct"]
		var bn_names: Array = ["", "fireDmgBns", "iceDmgBns", "darkDmgBns", "lightDmgBns"]
		var ev_a: Variant = _affix(ax_names[atk_el], 42217)
		var ev_b: Variant = _affix(bn_names[atk_el], 42217)
		if ev_a == null or ev_b == null: return _result_now()
		if float(ev_a) + float(ev_b) > 0.0:
			dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + float(ev_a) + float(ev_b)))
	elif atk_el == 0:
		var pv_a: Variant = _affix("poisonDmgPct", 42219)
		var pv_b: Variant = _affix("poisonDmgBns", 42219)
		if pv_a == null or pv_b == null: return _result_now()
		# opts.poison 없음 → _pv>0이어도 미적용 (원본 && 순서).
	# ── 42222~42228: P 조건 게이트 ──
	var view: Variant = _providers["player_view"].call()
	if not view is Dictionary:
		return _halt(42222, "player_view_not_ready")
	if float(view.get("hp", 0)) < float(view.get("mhp", 0)) * 0.3:
		var crisis: Variant = _affix("crisisBoost", 42222)
		if crisis == null: return _result_now()
		if float(crisis) > 0.0:
			dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + float(crisis)))
	if _js_num(view.get("_killBuff")) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + _js_num(view.get("_killMul"))))
		_log(42224, "killSlayer_buff", {"dmg": dmg})
	if _js_num(view.get("_lBeltT")) > 0.0 or _js_num(view.get("_lBootsT")) > 0.0 \
			or (_js_num(view.get("_lSpearT")) > 0.0 and _js_num(view.get("_lSpearStk")) > 0.0):
		# 전설 벨트/부츠/창 배율·소모 쓰기(P._lBootsT=0)는 본 단계 미이식.
		return _halt(42226, "unported_branch_active:legendary_belt_boots_spear")
	# ── 42230: 장신구 dmgBonus 합 ──
	var inventory: Variant = _state.read_current_inventory()
	if not inventory is Dictionary or not inventory.get("equipped") is Dictionary:
		return _halt(42230, "current_inventory_not_ready")
	var equipped: Dictionary = inventory["equipped"]
	var acc_dmg: float = 0.0
	for slot in ["necklace", "ring1", "ring2", "belt", "bracelet", "headband", "headband2"]:
		var item: Variant = equipped.get(slot)
		if item is Dictionary:
			acc_dmg += _js_num(item.get("dmgBonus"))
	acc_dmg *= 0.01
	if acc_dmg > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + acc_dmg))
		_log(42230, "accessory_dmg", {"dmg": dmg})
	# ── 42232~42234: 약자포식 / 사냥꾼 ──
	var passives: Variant = _state.read_current_passives()
	if not passives is Dictionary:
		return _halt(42232, "current_passives_not_ready")
	var pred: float = 0.0
	if float(fields["hp"]) <= float(fields["mhp"]) * 0.3:
		if not passives.has("pPred"): return _halt(42232, "passives_shape:pPred")
		pred = _js_num(passives["pPred"]) * 0.20
	if pred > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + pred))
		_log(42232, "predBonus", {"dmg": dmg})
	var hunter: float = 1.0
	if fields.get("isBoss") == true or fields.get("isElite") == true or int(fields["etype"]) >= 90:
		if not passives.has("pHunter"): return _halt(42234, "passives_shape:pHunter")
		hunter = 1.0 + _js_num(passives["pHunter"]) * 0.10
	if hunter > 1.0:
		dmg = FORMULA.js_to_int32(float(dmg) * hunter)
	# ── 42236~42262: 조건부 어픽스 합연산 ──
	var conditional: Variant = _conditional_affix_sum(fields, view, passives, enemy)
	if conditional == null: return _result_now()
	if float(conditional) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + float(conditional)))
		_log(42262, "conditional_affix", {"cax": conditional, "dmg": dmg})
	# ── 42263: 최소 1 ──
	if dmg < 1 and not sh_blocked:
		dmg = 1
	# ── 42265~42272: kbM/psM은 진입부에서 opts로 결정됨(두 프로필 모두 아래 플래그는 false) ──
	# _isPure/_isArrow/_isGunpowder/_isMagicDmg: weapon·kiSlash 둘 다
	# pure/maxDist/magic/explode/beam 키가 없고 atkEl=0 → 전부 false.
	# ── 42275~42283: 타입별 뎀% — 근접만 해당 ──
	var melee_pct: Variant = _affix("meleeDmgPct", 42276)
	if melee_pct == null: return _result_now()
	if float(melee_pct) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * (1.0 + float(melee_pct)))
	# 42285~42291: _weakPhys/_weakMag/_weakPj/_shockDR/_blinkWeak — 필드 부재(falsy) 단락.
	for weak_field in ["_weakPhys", "_shockDR", "_blinkWeak"]:
		if _js_num(fields.get(weak_field)) > 0.0:
			return _halt(42286, "unported_branch_active:" + weak_field)
	# ── 42295~42304: 약점노출(comboBoost) ──
	var combo_affix: Variant = _affix("comboBoost", 42295)
	if combo_affix == null: return _result_now()
	if not passives.has("pCombo"): return _halt(42296, "passives_shape:pCombo")
	if float(combo_affix) > 0.0 or _js_num(passives["pCombo"]) > 0.0:
		# 스택 축적·감쇠는 적 update 루프 소유 — 본 단계 미이식.
		return _halt(42295, "unported_branch_active:comboBoost_stack")
	# 42306~42307: 분노 스킬 — P._rageSkCtx 부재 단락.
	if view.get("_rageSkCtx") != null and not (view.get("_rageSkCtx") is bool and view.get("_rageSkCtx") == false):
		return _halt(42306, "unported_branch_active:rage_skill_context")
	# ── 42309~42323: 크리티컬 ──
	var crit_rate_melee: Variant = _affix("critRateMelee", 42311)
	if crit_rate_melee == null: return _result_now()
	var cr_bonus: float = float(crit_rate_melee) * 100.0
	# _lDagForce: P._lNextCrit 부재 → false (l_eq 미읽기).
	if _js_num(view.get("_lNextCrit")) > 0.0:
		return _halt(42314, "unported_branch_active:legendary_dagger_forced_crit")
	# 42313 _ksFC: 기검참 3단 풀차지(_kiFull)에서만 kiSlashFullCrit 어픽스 읽기 —
	# >0이면 확정 치명 + 치명 피해 +_ksFC (스타터 0).
	var ks_fc: float = 0.0
	if ki_full:
		var ks_affix: Variant = _affix("kiSlashFullCrit", 42313)
		if ks_affix == null: return _result_now()
		ks_fc = minf(1.0, float(ks_affix))
	var stat_crit: Variant = _stat_crit(view, passives, equipped)
	if stat_crit == null: return _result_now()
	var crit_roll: Variant = _rand(42316, "crit")
	if crit_roll == null: return _result_now()
	var is_crit: bool = float(crit_roll) * 100.0 < float(stat_crit) + cr_bonus or ks_fc > 0.0
	if is_crit:
		var crit_dmg: Variant = _stat_crit_dmg(view, passives, equipped)
		if crit_dmg == null: return _result_now()
		dmg = FORMULA.js_to_int32(float(dmg) * (float(crit_dmg) + ks_fc))
		# G._sStats — 부트 G에 부재 → 게이트 false.
		var axe: Variant = _l_eq("_lAxeBleed", 42318)
		if axe == null: return _result_now()
		if float(axe) > 0.0 and (_js_num(fields.get("bleedT")) > 0.0):
			return _halt(42318, "unported_branch_active:legendary_axe_bleed_burst")
		for on_crit in ["onCritExplode", "onCritChain", "onCritFreeze", "onCritHeal", "onCritMana", "onCritShield"]:
			var value: Variant = _affix(on_crit, 42319)
			if value == null: return _result_now()
			if float(value) > 0.0:
				return _halt(42319, "unported_branch_active:" + on_crit)
	_log(42316, "crit", {"roll": crit_roll, "stat_crit": stat_crit, "bonus": cr_bonus, "is_crit": is_crit, "dmg": dmg})
	# 42328: _lRingElem — atkEl=0이면 2번째 조건 단락 (l_eq·playTime 미읽기).
	if atk_el > 0:
		var ring: Variant = _l_eq("_lRingElem", 42328)
		if ring == null: return _result_now()
		if float(ring) > 0.0:
			return _halt(42328, "unported_branch_active:legendary_ring_elem") # G.playTime 필요
	# ── 42336~42338: 스턴/빙결 보너스 ──
	if float(fields.get("stunned", 0.0)) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * 1.5)
		_log(42336, "stunned_bonus", {"dmg": dmg})
	if _js_num(fields.get("_frozen")) > 0.0:
		dmg = FORMULA.js_to_int32(float(dmg) * 1.5)
	# ── 42345~42352: 에너지쉴드 흡수 ──
	var shield: float = float(fields["eShield"])
	var shield_max: float = float(fields["eShieldMax"])
	var absorbed: float = 0.0
	if shield_max > 0.0 and shield > 0.0:
		absorbed = minf(shield, float(dmg))
		if not _apply_enemy_field(42347, "eShield", maxf(0.0, shield - float(dmg))): return _result_now()
		dmg = maxi(0, dmg - int(absorbed))
		if absorbed > 0.0:
			_emit_text(enemy.global_position.x, enemy.global_position.y - 70.0,
				str(int(absorbed)), "#66ddff", 45, 48, str(int(absorbed)))
		if dmg == 0:
			sh_blocked = true
		_log(42345, "eShield_absorb", {"absorbed": absorbed, "shield_left": maxf(0.0, shield - absorbed - float(dmg)), "dmg": dmg})
	# ── 42354~42460: dmg>0 블록 ──
	var hp_before: float = float(fields["hp"])
	if dmg > 0:
		# 42355 G._sStats 게이트(부트 G 부재 → 스킵), 42357~42358 G._dmgPeak.
		var g: Variant = _state.read_current_g()
		if not g is Dictionary:
			return _halt(42357, "current_g_not_ready")
		var peak: Dictionary = g.get("_dmgPeak") if g.get("_dmgPeak") is Dictionary else {"val": 0, "t": 0}
		if float(dmg) > _js_num(peak.get("val")):
			peak = {"val": dmg, "t": 300}
		if not _g_writes(42357, [{"field": "_dmgPeak", "value": peak}]): return _result_now()
		# 42361~42368 흡수 어픽스 (전부 0 확인, >0이면 P 자원 쓰기 미이식 → 정지).
		for leech in ["lifeLeech", "injuredLeech", "manaLeech", "stLeech", "lifeOnHit"]:
			var lv: Variant = _affix(leech, 42361)
			if lv == null: return _result_now()
			if float(lv) > 0.0:
				return _halt(42361, "unported_branch_active:" + leech)
		var axe_leech: Variant = _u_eq("_uAxeLeech", 42367)
		if axe_leech == null: return _result_now()
		if float(axe_leech) > 0.0 and (_js_num(fields.get("bleed")) > 0.0 or _js_num(fields.get("bleedT")) > 0.0):
			return _halt(42367, "unported_branch_active:_uAxeLeech")
		# 42370~42379 onHit 상태이상 8종 (0 확인; 0이면 && 단락으로 RNG 미소비).
		for on_hit in ["fireOnHit", "iceOnHit", "lightOnHit", "darkOnHit", "poisonOnHit", "onHitBleed", "onHitStun", "onHitFreeze"]:
			var hv: Variant = _affix(on_hit, 42371)
			if hv == null: return _result_now()
			if float(hv) > 0.0:
				return _halt(42371, "unported_branch_active:" + on_hit)
		# 42380 적 인식.
		if not _apply_enemy_field(42380, "alerted", true): return _result_now()
		# 42382 즉시반격 — enemy.gd st2 대응 필드는 _contact_ticks (기존 매핑 유지).
		if not _apply_enemy_field(42382, "contact_clamp", 5.0): return _result_now()
		# 42383 HP 쓰기 — 기존 owner.
		var hp_write: Dictionary = enemy.apply_native_normal_enemy_hp_write({"field": "hp", "value": float(fields["hp"]) - float(dmg)})
		if hp_write.get("applied") != true:
			return _halt(42383, "enemy_hp_owner_refused:" + str(hp_write.get("reason")))
		_log(42383, "hp_write", {"hp": float(fields["hp"]) - float(dmg)})
		# 42384 _dpsDmg: HUD DPS 미이식.
		# 42386~42390 G._dmgPeakShow.
		var show: Variant = g.get("_dmgPeakShow")
		if not show is Dictionary or float(dmg) > _js_num(show.get("dmg")):
			if not _g_writes(42388, [{"field": "_dmgPeakShow", "value": {"x": enemy.global_position.x, "y": enemy.global_position.y, "dmg": dmg, "crit": is_crit}}]):
				return _result_now()
		# 42399~42411 피/스플래시, 42415 화면 플래시, 42417~19 임팩트: P2-001b 이식 —
		# 아래 feel(42397/98/415/416) 호출 뒤 over_budget 게이트로 수행 (파티클 내부
		# RNG는 시각 전용 world 공유 샘플러 — provider 추적 롤에 비노출).
		# 42412 히트 플래시 / 42414 피격 경직 (idle에서만, elite0 → 8f).
		# 42414의 e.s는 42382 즉시반격(recover→idle)이 적용된 뒤의 현재 값이다 —
		# 전용 적(P1-002.F)은 recover 상태를 실제로 가지므로 스냅샷이 아닌 owner의
		# 현재 state를 다시 읽는다 (generic enemy.gd는 recover가 없어 값 동일).
		if not _apply_enemy_field(42412, "hit_flash", 6.0): return _result_now()
		if fields["ib"] != true and str(_enemy.get("state")) == "idle":
			if not _apply_enemy_field(42414, "hit_stun", 4.0 if int(fields["elite"]) > 0 else 8.0): return _result_now()
		# P2-001a — 42397(_txtPerFrame++)·42398(_overBudget)·42416(히트스톱/셰이크):
		# G·OPT owner(main) 경유. 히트스톱은 소비자(32585)가 원본대로 완전 비활성.
		if not _main.has_method("apply_native_hurte_hit_feel"):
			return _halt(42416, "actual_main_hit_feel_entry_missing")
		var feel: Dictionary = _main.apply_native_hurte_hit_feel()
		if feel.get("applied") != true:
			return _halt(42416, "hit_feel_owner_refused:" + str(feel.get("reason")))
		_log(42416, "hit_feel", {"over_budget": feel.get("over_budget"), "shake": feel.get("shake")})
		if feel.get("over_budget") != true: # 42398 게이트 (42396 _quiet=false 고정)
			var blood: Dictionary = _main.emit_native_hurte_hit_blood(_enemy.global_position.x,
				_enemy.global_position.y,
				str((_enemy.data.get("native_final", {}) as Dictionary).get("col", "#cc4444")),
				dmg, true, ang)
			if blood.get("applied") != true:
				return _halt(42399, "hit_blood_owner_refused:" + str(blood.get("reason")))
			_log(42399, "hit_blood", {"dmg": dmg})
			# 42417~42419: _isMagicDmg=false 고정 — kiSlash는 opts.noImpact로 생략(원문).
			if opts.get("noImpact") != true:
				var impact: Dictionary = _main.emit_native_hurte_impact(_enemy.global_position.x,
					_enemy.global_position.y, ang)
				if impact.get("applied") != true:
					return _halt(42417, "hit_impact_owner_refused:" + str(impact.get("reason")))
				_log(42417, "hit_impact", {"imp_per_frame": impact.get("imp_per_frame")})
		# 42421~42435 OnHit DoT 어픽스 (0 확인).
		for dot_affix in ["poisonDot", "fireDot", "iceDot", "lightChain", "darkCurse", "chainTarget"]:
			var dv: Variant = _affix(dot_affix, 42421)
			if dv == null: return _result_now()
			if float(dv) > 0.0:
				return _halt(42421, "unported_branch_active:" + dot_affix)
		# 42446~42460 냉기 프리즌: atkEl==2만.
		if atk_el == 2:
			return _halt(42446, "unported_branch_active:freeze_gauge")
	# ── 42462~42476: 넉백 (dmg>0 블록 밖 — 쉴드 전량 흡수 타에도 실행, 양 0) ──
	# _isRanged/_isMH/_isBB/_noKB/_isMagicProj 전부 false (opts 고정, atkEl≠EL.L은 위에서 정지).
	var kb_amount: float = minf(float(dmg) * 0.25 * kb_mult, 15.0 * kb_mult)
	var club: Variant = _l_eq("_lClubKB", 42472)
	if club == null: return _result_now()
	if float(club) > 0.0:
		return _halt(42472, "unported_branch_active:_lClubKB")
	# 근접 교전=시야 내 고정: e.kb += cos/sin×amt (뷰포트-밖 좌표이동 분기는 미도달·미이식).
	enemy.add_native_knockback(Vector2(cos(ang), sin(ang)) * kb_amount)
	_log(42476, "knockback", {"amount": kb_amount})
	# ── 42486~42498: 포이즈 — poiseHit 전용(kiSlash). amt는 쉴드 흡수 후 잔여 dmg ──
	# (쉴드 전량 흡수 타는 amt=0 → 원문 _poiseHit amt<=0 가드로 포이즈 무변경.)
	# isDot=false 고정, ib는 42124에서 정지 → 보스 _pImmune/저항 분기 비활성.
	var staggered := false
	if poise_hit:
		var poise_amount: int = FORMULA.js_to_int32(float(dmg) * poise_mult)
		var stagger_bns: Variant = _affix("staggerBns", 42489)
		if stagger_bns == null: return _result_now()
		if float(stagger_bns) > 0.0:
			poise_amount += FORMULA.js_to_int32(float(stagger_bns))
		var poise_result: Dictionary = _apply_poise_hit(poise_amount)
		if poise_result.get("ok") != true: return _result_now()
		staggered = poise_result.get("staggered") == true
		_log(42490, "poise_hit", {"amt": poise_amount, "staggered": staggered, "route": poise_result.get("route")})
		if staggered:
			if not _stagger_break_tail(): return _result_now()
			var explosion: Variant = _affix("staggerExplosion", 42492)
			if explosion == null: return _result_now()
			if float(explosion) > 0.0:
				return _halt(42492, "unported_branch_active:staggerExplosion")
			var hammer: Variant = _l_eq("_lHammerShock", 42495)
			if hammer == null: return _result_now()
			var mace: Variant = _l_eq("_lMaceShock", 42495)
			if mace == null: return _result_now()
			if maxf(float(hammer), float(mace)) > 0.0:
				return _halt(42495, "unported_branch_active:legendary_stagger_shockwave")
	else:
		_log(42486, "poise_skipped:not_poiseHit", {})
	# 피해 적용 결과 telemetry (기존 소비자 호환 shape).
	var hp_after: float = hp_before - float(dmg) if dmg > 0 else hp_before
	enemy.report_native_normal_enemy_hurte_event("native_hurte_damage", {"id": enemy.data["id"],
		"raw_amount": base_damage, "amount": dmg, "absorbed": absorbed,
		"eShield": maxf(0.0, shield - absorbed), "hp": hp_after, "source": source_label, "crit": is_crit})
	# ── 42500~43117: 처치 파이프라인 ──
	var killed := false
	if dmg > 0 and hp_after <= 0.0:
		killed = true
		if not _kill_pipeline(fields, view, passives, dmg, ang, atk_el):
			return _result_now()
	return _finish(true, {"applied": true, "dmg_to_hp": dmg, "absorbed": absorbed,
		"hp_before": hp_before, "hp_after": hp_after, "shield_before": shield,
		"shield_after": maxf(0.0, shield - absorbed), "is_crit": is_crit,
		"stat_crit": stat_crit, "crit_roll": crit_roll, "killed": killed,
		"shield_blocked": sh_blocked, "staggered": staggered, "source": source_label})

# ── 42500~43117 처치 파이프라인 (실행 분기만) ──
func _kill_pipeline(fields: Dictionary, view: Dictionary, passives: Dictionary, dmg: int, ang: float, atk_el: int) -> bool:
	# 42502~42511 디코이/도플갱어: etype 가드로 비활성. 42516~42625 보스: ib 가드.
	# ── 42627~42636: 일반몹 부활 판정 ──
	if fields.get("_revived") != true and fields.get("_isGhoul") != true:
		var rev_pow: float = 0.5 + float(int(maxf(1.0, float(fields.get("lv", 1))) / 100.0)) * 0.10
		var suppress: Variant = _affix("antiRevive", 42629)
		if suppress == null: return false
		# G._fireZones: 부트 G 부재 → 스캔 단락.
		var final_rev: float = maxf(0.0, rev_pow - float(suppress))
		if final_rev > 0.0:
			var roll: Variant = _rand(42633, "normal_revive")
			if roll == null: return false
			if float(roll) < final_rev:
				var ghoul: Variant = _rand(42635, "revive_as_ghoul")
				if ghoul == null: return false
				# 부활 예약 플래그만 기록 — 재스폰 타이머 동작은 미이식.
				if not _bookkeeping({"_revived": true, "_reviveTimer": 90.0,
						"_reviveX": _enemy.global_position.x, "_reviveY": _enemy.global_position.y,
						"_reviveAsGhoul": float(ghoul) < 0.5}):
					return false
				_log(42633, "normal_revive_rolled", {"roll": roll, "chance": final_rev, "revived": true, "ghoul_roll": ghoul, "resurrection": "UNPORTED"})
			else:
				_log(42633, "normal_revive_rolled", {"roll": roll, "chance": final_rev, "revived": false})
	# 42648~42655: killSlayer/On-Kill 어픽스 (0 확인; >0이면 P 쓰기 미이식 → 정지).
	for on_kill in ["killSlayer", "onKillHeal", "hpOnKill", "onKillMana", "onKillStam", "shieldOnKill", "onKillSpeed"]:
		var kv: Variant = _affix(on_kill, 42650)
		if kv == null: return false
		if float(kv) > 0.0:
			_halt(42650, "unported_branch_active:" + on_kill)
			return false
	var mace: Variant = _u_eq("_uMaceExplode", 42658)
	if mace == null: return false
	if float(mace) > 0.0:
		_halt(42658, "unported_branch_active:_uMaceExplode")
		return false
	# 42660~42669 u_d05: e._uqGwExp 부재 → 1번째 조건 단락, G.playTime 미읽기 (42664).
	# 42671~42695 u_d08/u_d13: 컨텍스트 부재 단락.
	for legend in ["_lDaggerKill", "_lRingKill"]:
		var lv2: Variant = _l_eq(legend, 42697)
		if lv2 == null: return false
		if float(lv2) > 0.0:
			_halt(42697, "unported_branch_active:" + legend)
			return false
	# ── 42702: 사망 확정 + 킬 카운트 ──
	# atkTicketRelease: AI 티켓 미이식. _regKill/_petOnKill: 미이식.
	var death: Dictionary = _enemy.apply_native_normal_enemy_death_write()
	if death.get("applied") != true:
		_halt(42702, "enemy_death_owner_refused:" + str(death.get("reason")))
		return false
	var g: Variant = _state.read_current_g()
	if not g is Dictionary:
		_halt(42702, "current_g_not_ready")
		return false
	var kills: int = int(_js_num(g.get("kills"))) + 1
	var stage_kills: int = int(_js_num(g.get("_stageKills"))) + 1
	if not _g_writes(42702, [{"field": "kills", "value": kills}, {"field": "_stageKills", "value": stage_kills}]):
		return false
	_log(42702, "kill_core", {"kills": kills, "stage_kills": stage_kills, "unported": ["atkTicketRelease", "_regKill", "_petOnKill"]})
	# 42704~42711 deathFX + 42720 대형 버스트 + 42722 시체 + 핏자국: P2-001b 이식
	# (사망 사운드는 sfx/death 에셋 미복사 — 어댑터가 목록/카운터 기록). 42712 처치
	# 히트스톱: 소비자 32585 비활성(원본).
	var front: Dictionary = _main.spawn_native_death_fx_front(_enemy, ang, dmg,
		float(fields["radius"]), float(fields["mhp"]),
		str((_enemy.data.get("native_final", {}) as Dictionary).get("col", "#cc4444")))
	if front.get("applied") != true:
		_halt(42704, "death_fx_owner_refused:" + str(front.get("reason")))
		return false
	_log(42704, "death_fx_front", {"radius": fields["radius"]})
	# ── 42714~42718: 콤보 ──
	var combo: int = int(_js_num(g.get("combo"))) + 1
	var combo_timer: int = mini(1200, int(_js_num(g.get("comboTimer"))) + 60)
	var combo_max: int = maxi(int(_js_num(g.get("comboMax"))), combo)
	if not _g_writes(42714, [{"field": "combo", "value": combo}, {"field": "comboTimer", "value": combo_timer}, {"field": "comboMax", "value": combo_max}]):
		return false
	# 42719 _killAng=ang (로컬). 42720 대형사망FX/42722 시체(_addCorpse): 미이식.
	# ── 42726~42731: 고어 롤 (시각 본체 미이식, 롤만 원본 순서로 소비) ──
	var gore_pick: Variant = _rand(42729, "gore_common_or_rare")
	if gore_pick == null: return false
	var gore_index: Variant = _rand(42730, "gore_piece_index")
	if gore_index == null: return false
	var gore_large: Variant = null
	if fields["ib"] == true or float(fields["radius"]) >= 18.0:
		gore_large = _rand(42731, "gore_large_extra")
		if gore_large == null: return false
	_log(42729, "gore_rolls", {"common_or_rare": gore_pick, "index": gore_index, "large": gore_large})
	# 42726~42732: 고어 시각(이미 소비한 위 provider 롤 값 그대로 사용 — 추가 소비 없음)
	# + 사망 임팩트. 42733 _fromHole: 부재(undefined!=null=false) 단락.
	var tail: Dictionary = _main.spawn_native_death_fx_tail(_enemy.global_position.x,
		_enemy.global_position.y, float(fields["radius"]), float(gore_pick), float(gore_index), gore_large)
	if tail.get("applied") != true:
		_halt(42732, "death_fx_owner_refused:" + str(tail.get("reason")))
		return false
	_log(42732, "death_fx_tail", {})
	# 42737~42745 문지기: 단락. 42747~42754 잔해: elite0 → _debC=0 단락(RNG 미소비).
	# ── 42756~42762: 킬 체인 ──
	var chain_count: int = int(_js_num(g.get("_chainCnt"))) + 1
	var chain_writes: Array = [{"field": "_chainCnt", "value": chain_count}, {"field": "_chainT", "value": 180}]
	if chain_count >= 5 and fields["ib"] != true:
		chain_writes = [{"field": "_chainCnt", "value": 0}, {"field": "_chainT", "value": 180},
			{"field": "rifts_append", "value": {"x": _enemy.global_position.x, "y": _enemy.global_position.y,
				"t": 0, "maxT": 120, "spawned": false, "si": int(_js_num(g.get("stage")))}}]
		_log(42758, "rift_recorded", {"spawn_behavior": "UNPORTED"})
	if not _g_writes(42756, chain_writes):
		return false
	# ── 42764~42767: M26 복수자 스캔 ──
	for other in _world.get_enemies():
		if other == _enemy or not is_instance_valid(other) or other.get("alive") != true:
			continue
		var mods: Variant = other.get("mods")
		if mods is Array and mods.has("M26") and _enemy.global_position.distance_to(other.global_position) < 200.0:
			_halt(42764, "unported_branch_active:mod_M26_empower")
			return false
	# 42769~42944: _plagued/특수 etype 사망 효과 — etype 가드로 전부 단락.
	# ── 42946~42963: 속성 사망 장판 ──
	if fields["ib"] != true and fields.get("_isDecoy") != true and int(fields["el"]) != 0:
		var zone_roll: Variant = null
		if int(fields["elite"]) < 1:
			zone_roll = _rand(42946, "death_zone")
			if zone_roll == null: return false
		if int(fields["elite"]) >= 1 or float(zone_roll) < 0.2:
			_log(42946, "death_zone_rolled", {"roll": zone_roll, "el": int(fields["el"]), "zone_spawn": "UNPORTED"})
		else:
			_log(42946, "death_zone_rolled", {"roll": zone_roll, "el": int(fields["el"]), "zone_spawn": false})
	# 42965~43089: 레어/엘리트/슬라임/악의 — 전부 단락 (elite0·일반).
	# ── 43092~43096: 물약 롤 ──
	var potion_gate: Variant = _rand(43092, "potion_gate")
	if potion_gate == null: return false
	var potion_type: Variant = _rand(43093, "potion_type")
	if potion_type == null: return false
	var potion_names: Array = ["hp", "st", "mp"]
	var potion_kind: String = potion_names[clampi(int(float(potion_type) * 3.0), 0, 2)]
	# P2-001c — addPotion(28250): hp → 악의 즉시 전환(G.mats)+텍스트, st/mp → 버림(POT 27677).
	var potion: Dictionary = _state.apply_native_add_potion(_main, potion_kind, 1)
	if potion.get("applied") != true:
		_halt(43095, "add_potion_owner_refused:" + str(potion.get("reason")))
		return false
	if potion.get("accepted") == true:
		for text in potion.get("texts", []): # addPotion 내부 '+1' 텍스트 (P 위치 기준, 28255)
			_emit_text(_js_num(view.get("x")) + float(text["dx"]), _js_num(view.get("y")) + float(text["dy"]),
				text["text"], text["color"], text["life"])
		# 호출부 텍스트(43095): POT.hp name '악의 추출' col '#33cc66' (적 위치 기준).
		_emit_text(_enemy.global_position.x, _enemy.global_position.y - 8.0, "악의 추출 +1", "#33cc66", 30)
	_log(43092, "potion_applied", {"gate": potion_gate, "type": potion_kind, "accepted": potion.get("accepted")})
	# ── 43099~43101: 콤보 보상 계수 — _comboPct=⌊combo/100⌋×.05, _diffPct=max(0,_diffSigned())×.10 ──
	var diff_signed: Variant = _main.read_native_signed_difficulty() if _main.has_method("read_native_signed_difficulty") else null
	if not diff_signed is Dictionary or str(diff_signed.get("status")) != "READY":
		_halt(43100, "signed_difficulty_not_ready")
		return false
	var combo_pct: float = float(FORMULA.js_to_int32(_js_num(g.get("combo")) / 100.0)) * 0.05
	var diff_pct: float = maxf(0.0, float(diff_signed["value"])) * 0.10
	var combo_bonus: float = 1.0 + combo_pct + diff_pct
	var mats: int = int(_js_num(g.get("mats"))) + 4
	if not _g_writes(43103, [{"field": "mats", "value": mats}]):
		return false
	_log(43103, "mats", {"mats": mats})
	# ── 43110 rollDrop — P2-001c: 원본 롤 순서·RNG 소비 그대로(provider rand), 레코드만 생성 ──
	# dropBonus=statDropBonus(27999), _curseMul=1(P._greedCurse 부재). 바닥 표시·줍기는 미이식.
	var lck: Variant = _lck_total(view, _state.read_current_inventory().get("equipped", {}))
	if lck == null: return false
	if not passives.has("pDrop"):
		_halt(43110, "passives_shape:pDrop")
		return false
	var drop_rate_affix: Variant = _affix("dropRate", 43110)
	if drop_rate_affix == null: return false
	var crystal_drop: float = 0.0
	if view.get("_crystalStats") is Dictionary:
		crystal_drop = _js_num((view["_crystalStats"] as Dictionary).get("drop")) * 0.01
	var drop_bonus: float = 1.0 + float(lck) * 0.0015 + _js_num(passives["pDrop"]) * 0.08 + float(drop_rate_affix) + crystal_drop
	var drop_filters: Dictionary = _main.read_native_feel_opt_drop_filters() if _main.has_method("read_native_feel_opt_drop_filters") else {}
	if drop_filters.get("ready") != true:
		_halt(43110, "drop_opt_filters_not_ready:" + str(drop_filters.get("reason")))
		return false
	var bags: Dictionary = _state.read_native_reward_bags()
	var dropper: RefCounted = DROP_SOURCE.new(func(tag): return _rand(43110, "drop:" + str(tag)))
	var drop_result: Variant = dropper.roll_drop(
		{"ib": false, "etype": int(fields["etype"]), "elite": int(fields["elite"]),
			"drop_tier": 0, "x": _enemy.global_position.x, "y": _enemy.global_position.y},
		{"stage": int(_js_num(g.get("stage"))), "drop_bonus": drop_bonus,
			"min_pick_rar": drop_filters["min_pick_rar"], "min_pick_lv_thr": drop_filters["min_pick_lv_thr"],
			"plv": int(_js_num(view.get("lv"))), "crystal_bag_len": (bags.get("crystal", []) as Array).size(),
			"crystal_bag_max": 9999, "stone_bag_len": (bags.get("stone", []) as Array).size(), "stone_bag_max": 9999})
	if not drop_result is Dictionary:
		if _halt_reason.is_empty():
			_halt(43110, "roll_drop_rng_aborted")
		return false
	if not (drop_result["world_items"] as Array).is_empty():
		var records: Dictionary = _state.append_native_drop_records(_main, drop_result["world_items"])
		if records.get("applied") != true:
			_halt(43110, "drop_records_owner_refused:" + str(records.get("reason")))
			return false
	if drop_result.get("crystal") != null or drop_result.get("stone") != null:
		if _state.apply_native_drop_bags(_main, drop_result.get("crystal"), drop_result.get("stone")).get("applied") != true:
			_halt(43110, "drop_bags_owner_refused")
			return false
	for text in drop_result.get("texts", []): # 결정/소켓석 획득 텍스트 (원문 addTxt 인자)
		_emit_text(float(text["x"]), float(text["y"]), text["text"], text["color"], text["life"])
	_log(43110, "roll_drop", {"items": (drop_result["world_items"] as Array).size(),
		"crystal": drop_result.get("crystal") != null, "stone": drop_result.get("stone") != null,
		"unported": ["floor_item_render_pickup", "playItemDropSfx", "_crAutoProcess(기본 OFF)"]})
	# ── 43112~43114 addExp: ~~(max(5,~~(eLv×.4))×_expMul), _expMul=1×_comboBonus ──
	var enemy_lv: float = maxf(1.0, _js_num(fields.get("lv")) if fields.get("lv") != null else 10.0)
	var exp_raw: int = FORMULA.js_to_int32(maxf(5.0, float(FORMULA.js_to_int32(enemy_lv * 0.4))) * combo_bonus)
	# addExp 전처리(43140~43144): v=~~(v/3) → nc().expBonus → eq_affix('expBonus').
	var exp_value: int = FORMULA.js_to_int32(float(exp_raw) / 3.0)
	var necklace: Variant = (_state.read_current_inventory().get("equipped", {}) as Dictionary).get("necklace")
	var neck_bonus: float = _js_num((necklace as Dictionary).get("expBonus")) if necklace is Dictionary else 0.0
	if neck_bonus > 0.0:
		exp_value = FORMULA.js_to_int32(float(exp_value) * (1.0 + neck_bonus))
	var exp_affix: Variant = _affix("expBonus", 43143)
	if exp_affix == null: return false
	if float(exp_affix) > 0.0:
		exp_value = FORMULA.js_to_int32(float(exp_value) * (1.0 + float(exp_affix)))
	var exp_result: Dictionary = _state.apply_native_add_exp(_main, exp_value)
	if exp_result.get("applied") != true:
		_halt(43134, "add_exp_owner_refused:" + str(exp_result.get("reason")))
		return false
	for text in exp_result.get("texts", []): # 43166 'SP +N' (P 위치)
		_emit_text(_js_num(view.get("x")) + float(text["dx"]), _js_num(view.get("y")) + float(text["dy"]),
			text["text"], text["color"], text["life"])
	_log(43112, "add_exp", {"raw": exp_raw, "value": exp_value, "combo_bonus": combo_bonus,
		"lv": exp_result.get("lv"), "exp": exp_result.get("exp"), "levels": exp_result.get("levels"),
		"unported": exp_result.get("unported")})
	# 43115 checkRooms: 미이식 / 43116 dbSaveNow(10킬): 세이브 금지 지시로 미이식.
	if kills % 10 == 0:
		_log(43116, "unported_skip:dbSaveNow", {"kills": kills})
	return true

# ── 42236~42262 조건부 어픽스 — null=halt ──
func _conditional_affix_sum(fields: Dictionary, view: Dictionary, passives: Dictionary, enemy: Node) -> Variant:
	var total: float = 0.0
	if float(fields["hp"]) >= float(fields["mhp"]) * 0.7:
		var abund: Variant = _affix("abundDmg", 42239)
		if abund == null: return null
		if not passives.has("pAbund"): return _halt_null(42239, "passives_shape:pAbund")
		total += float(abund) + _js_num(passives["pAbund"]) * 0.20
	if float(view.get("hp", 0)) >= float(view.get("mhp", 0)) * 0.7:
		var healthy: Variant = _affix("healthyAtk", 42240)
		if healthy == null: return null
		total += float(healthy)
	if float(view.get("hp", 0)) == float(view.get("mhp", 0)):
		var full_life: Variant = _affix("fullLifeDmg", 42241)
		if full_life == null: return null
		total += float(full_life)
	if float(view.get("hp", 0)) <= float(view.get("mhp", 0)) * 0.35:
		for low in ["lowLifeDmg", "injuredDmg"]:
			var lv: Variant = _affix(low, 42242)
			if lv == null: return null
			total += float(lv)
	if float(fields["hp"]) <= float(fields["mhp"]) * 0.3:
		var pred_dmg: Variant = _affix("predDmg", 42244)
		if pred_dmg == null: return null
		total += float(pred_dmg)
	if float(fields["hp"]) <= float(fields["mhp"]) * 0.2:
		var overkill: Variant = _affix("overkilDmg", 42245)
		if overkill == null: return null
		total += float(overkill)
	if float(fields["hp"]) >= float(fields["mhp"]) * 0.95:
		var first_strike: Variant = _affix("firstStrike", 42246)
		if first_strike == null: return null
		total += float(first_strike)
	var manhattan: float = absf(float(view.get("x", 0)) - enemy.global_position.x) + absf(float(view.get("y", 0)) - enemy.global_position.y)
	if manhattan <= 120.0:
		var close: Variant = _affix("closeDmg", 42249)
		if close == null: return null
		total += float(close)
	if manhattan > 300.0:
		var far: Variant = _affix("farDmg", 42250)
		if far == null: return null
		total += float(far)
	if float(fields.get("stunned", 0.0)) > 0.0:
		var stun_up: Variant = _affix("stunDmgUp", 42252)
		if stun_up == null: return null
		total += float(stun_up)
		var club_stun: Variant = _u_eq("_uClubStun", 42252)
		if club_stun == null: return null
		if float(club_stun) > 0.0:
			total += float(club_stun) - 1.0
	# frozen/burn/poison/curse/slow 상태: 필드 부재(0) → 단락.
	# 대상 타입: ib=false, mods.length=0 → mobSlayer만.
	var mob_slayer: Variant = _affix("mobSlayer", 42260)
	if mob_slayer == null: return null
	total += float(mob_slayer)
	return total

# ── statCrit() game.html:27997 / statCritDmg() 27998 / _eqLckTotal() 27996 ──
func _lck_total(view: Dictionary, equipped: Dictionary) -> Variant:
	var stats: Variant = _state.read_current_stats()
	if not stats is Dictionary or not stats.has("lck"):
		return _halt_null(27996, "current_stats_not_ready")
	var lck: float = _js_num(stats["lck"]) + float(FORMULA.js_to_int32(_js_num(view.get("lv")) * 0.5))
	for slot in equipped:
		var item: Variant = equipped[slot]
		if item is Dictionary:
			var b_lck: Variant = item.get("bLck")
			if b_lck is int or b_lck is float:
				lck += float(b_lck)
	for flat in ["lckFlatN", "lckFlatR"]:
		var fv: Variant = _affix(flat, 27996)
		if fv == null: return null
		lck += float(fv)
	return lck

func _stat_crit(view: Dictionary, passives: Dictionary, equipped: Dictionary) -> Variant:
	var lck: Variant = _lck_total(view, equipped)
	if lck == null: return null
	if not passives.has("pCrit"): return _halt_null(27997, "passives_shape:pCrit")
	var crit: float = float(lck) * 0.025 + _js_num(passives["pCrit"]) * 1.5
	for slot in ["ring1", "ring2", "necklace"]:
		var item: Variant = equipped.get(slot)
		if item is Dictionary:
			crit += _js_num(item.get("critRate"))
	var rate: Variant = _affix("critRate", 27997)
	if rate == null: return null
	crit += float(rate) * 100.0
	var crystal: Variant = view.get("_crystalStats")
	if crystal is Dictionary:
		crit += _js_num(crystal.get("crit"))
	return crit

func _stat_crit_dmg(view: Dictionary, passives: Dictionary, equipped: Dictionary) -> Variant:
	var lck: Variant = _lck_total(view, equipped)
	if lck == null: return null
	if not passives.has("pCrit"): return _halt_null(27998, "passives_shape:pCrit")
	var value: float = 1.5 + float(lck) * 0.002 + _js_num(passives["pCrit"]) * 0.08
	for affix in ["critDmgA", "critDmgB", "critDmgW", "neckCritDmg", "glovesCritDmg"]:
		var av: Variant = _affix(affix, 27998)
		if av == null: return null
		value += float(av)
	var crystal: Variant = view.get("_crystalStats")
	if crystal is Dictionary:
		value += _js_num(crystal.get("cdmg")) * 0.01
	return value

# ── 42490 _poiseHit(game.html:19973~20001) — 적별 포이즈 코어 owner 경유 ──
func _apply_poise_hit(amount: int) -> Dictionary:
	# 19974: !e||!e.alive||amt<=0 → false (상태 무변경·RNG 없음).
	if amount <= 0 or _enemy.get("alive") != true:
		_log(19974, "poise_hit_no_entry", {"amt": amount})
		return {"ok": true, "staggered": false, "route": "no_entry"}
	# flesh_crawler: 기존 v3 field-owner 계약으로만 포이즈 코어 적용 (이중 owner 금지).
	if _enemy.has_method("apply_native_source_poise_hit"):
		return _poise_via_source_field_call(amount)
	if not _enemy.has_method("apply_native_normal_enemy_poise_core"):
		_halt(42490, "enemy_poise_owner_missing")
		return {"ok": false}
	var core: Dictionary = _enemy.apply_native_normal_enemy_poise_core(amount)
	if core.get("applied") != true:
		_halt(42490, "enemy_poise_owner_refused:" + str(core.get("reason")))
		return {"ok": false}
	return {"ok": true, "staggered": core.get("staggered") == true, "route": "owner_core"}

func _poise_via_source_field_call(amount: int) -> Dictionary:
	var invocation: Variant = _world.begin_native_normal_enemy_field_call(_enemy)
	if invocation == null:
		# legacy pending poise 잔류 등 — 폴백 금지, 정지.
		_halt(42490, "source_field_call_unavailable")
		return {"ok": false}
	var call := {"kind": "poise_hit", "line": 42490, "amt": amount,
		"commit": {"from": invocation.get_cursors(), "enemy_writes": [], "owner_requests": [],
			"presentation": [], "events": []}}
	var result: Dictionary = invocation.poise_hit(call)
	_world.end_native_normal_enemy_field_call(invocation)
	if result.get("ok") == true:
		return {"ok": true, "staggered": result.get("staggered") == true, "route": "v3_field_call"}
	# v3 코어는 그로기 성립 시 19985(연출 꼬리)에서 의도적으로 멈춘다 — 코어 적용 완료
	# 보고를 그로기 성립으로 받고, 꼬리(19985~20001)는 본 실행자가 수행한다.
	if result.get("poise_core_applied") == true and result.get("core_staggered") == true \
			and int(_js_num(result.get("next_source_line"))) == 19985:
		_log(19985, "v3_poise_core_staggered_tail_by_hurte", {"reason": result.get("reason")})
		return {"ok": true, "staggered": true, "route": "v3_field_call"}
	_halt(42490, "source_poise_call_failed:" + str(result.get("reason")))
	return {"ok": false}

# 그로기 성립 꼬리(19985~20001): 유니크 게이트·텍스트·슬로모. SFX/파티클 미이식 기록.
func _stagger_break_tail() -> bool:
	# 19985~19993: _uqScCtx(천공쇄기 시전 컨텍스트) — 본 경로 부재(falsy) → 환급 게이트 단락.
	var orb: Variant = _u_eq("_uPoiseOrbFracture", 19994)
	if orb == null: return false
	if float(orb) > 0.0:
		_halt(19994, "unported_branch_active:_uPoiseOrbFracture")
		return false
	# 19995 SFX.groggy: 오디오 미이식 — enemy_stagger telemetry로 사실만 보고.
	_enemy.report_native_normal_enemy_hurte_event("enemy_stagger",
		{"id": _enemy.data["id"], "ticks": 180.0, "phase": "hurtE_42490"})
	# 19996 addTxt(그로기) — 기존 NativeFloatingText (원문 문자열·색·수명).
	_emit_text(_enemy.global_position.x, _enemy.global_position.y - 22.0, "💥 그로기!", "#ff8800", 60)
	# 19996 슬로모: G._noHitStopT 게이트 후 G.slowMo=20 (소비자 미이식 — G 쓰기만).
	var g: Variant = _state.read_current_g()
	if not g is Dictionary:
		_halt(19996, "current_g_not_ready")
		return false
	if not (_js_num(g.get("_noHitStopT")) > 0.0):
		if not _g_writes(19996, [{"field": "slowMo", "value": 20}]): return false
	_log(19995, "stagger_break_tail", {"sfx_groggy": "UNPORTED", "particles": "UNPORTED"})
	return true

# ── provider/owner 헬퍼 ──
func _affix(id: String, line: int) -> Variant:
	var result: Dictionary = _providers["eq_affix"].call(id)
	if str(result.get("status")) not in AFFIX_READY:
		return _halt_null(line, "eq_affix_not_ready:" + id + ":" + str(result.get("reason")))
	return float(_js_num(result.get("value")))

func _u_eq(stat: String, line: int) -> Variant:
	var result: Dictionary = _providers["u_eq"].call(stat)
	if str(result.get("status")) != "READY":
		return _halt_null(line, "u_eq_not_ready:" + stat + ":" + str(result.get("reason")))
	return float(_js_num(result.get("value")))

func _l_eq(stat: String, line: int) -> Variant:
	var result: Dictionary = _providers["l_eq"].call(stat)
	if str(result.get("status")) != "READY":
		return _halt_null(line, "l_eq_not_ready:" + stat + ":" + str(result.get("reason")))
	return float(_js_num(result.get("value")))

func _rand(line: int, purpose: String) -> Variant:
	var result: Dictionary = _providers["rand"].call()
	if str(result.get("status")) != "READY":
		return _halt_null(line, "rand_not_ready:" + purpose + ":" + str(result.get("reason")))
	rng_draws.append({"line": line, "purpose": purpose, "value": result["value"]})
	return float(result["value"])

func _apply_enemy_field(line: int, field: String, value: Variant) -> bool:
	var result: Dictionary = _enemy.apply_native_normal_enemy_field_write(field, value)
	if result.get("applied") != true:
		_halt(line, "enemy_field_owner_refused:" + field + ":" + str(result.get("reason")))
		return false
	_log(line, "enemy_field:" + field, {"value": value})
	return true

func _bookkeeping(fields: Dictionary) -> bool:
	var result: Dictionary = _enemy.apply_native_normal_enemy_bookkeeping(fields)
	if result.get("applied") != true:
		_halt(0, "enemy_bookkeeping_refused:" + str(result.get("reason")))
		return false
	return true

func _g_writes(line: int, writes: Array) -> bool:
	var result: Dictionary = _state.apply_native_normal_enemy_hurte_g_writes(_main, writes)
	if result.get("applied") != true:
		_halt(line, "state_g_owner_refused:" + str(result.get("reason")))
		return false
	return true

func _emit_text(x: float, y: float, text: String, color: String, life: Variant, size: Variant = null, num_str: Variant = null) -> void:
	var adapter: Variant = _world.get_node_or_null("NativeFloatingText")
	if is_instance_valid(adapter) and adapter.has_method("emit_native_text"):
		adapter.emit_native_text(x, y, text, color, life, size, num_str)
	else:
		_log(0, "text_adapter_missing", {"text": text})

static func _js_num(value: Variant) -> float:
	if value is int or value is float:
		return float(value) if is_finite(float(value)) else 0.0
	if value is bool:
		return 1.0 if value else 0.0
	return 0.0

func _log(line: int, op: String, data: Dictionary) -> void:
	journal.append({"line": line, "op": op, "data": data})

func _halt(line: int, reason: String) -> Dictionary:
	_halt_line = line
	_halt_reason = reason
	_log(line, "HALT", {"reason": reason})
	return _result_now()

func _halt_null(line: int, reason: String) -> Variant:
	_halt(line, reason)
	return null

func _result_now() -> Dictionary:
	return {"ok": false, "halted_at": _halt_line, "reason": _halt_reason,
		"journal": journal.duplicate(true), "rng_draws": rng_draws.duplicate(true),
		"fallback_used": false}

func _finish(ok: bool, extra: Dictionary) -> Dictionary:
	var result: Dictionary = {"ok": ok, "journal": journal.duplicate(true),
		"rng_draws": rng_draws.duplicate(true), "fallback_used": false}
	result.merge(extra, true)
	return result
