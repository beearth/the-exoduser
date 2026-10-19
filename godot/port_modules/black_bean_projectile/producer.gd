extends "res://port_modules/parry_blue_projectile/producer.gd"
##
## FDG Godot 이식 — 적대 blackBean(무지개탄) "탄생 이후" 실행 producer.
## TASK GODOT-PORT-BLACK-BEAN-PROJECTILE-FIRST-20261013
##
## 소유: 격리 포트 모듈(이 파일) — 적대 비행/접촉/피해 분기/렌더 + Q 성공 원본 탄도 carrier 변이
## (Shot.apply_source_q_reflection, 35674-35680). 탄생 스탯/emitter/spawnProj 정규화는 BOSS·ENGINE,
## Q/E 자격·contact 판정·pParryProjDmg 기반값·parryBank·doParry·반응은 SKILL(combat_qe),
## World/Player/stat/query provider/Git 은 ENGINE 소유다.
## 이 노드는 원본 spawnProj 가 이미 만든 적대 blackBean 1발(raw source 필드)을 받아 원본 projs 루프 1발 분량을
## 실행한다: 카메라 컬링 → 트레일 → 수명 → life1 게이트 → 플레이어 유도 → 이동 → 벽 → 플레이어 접촉 분기
## (흡수/회전참/무적 폭발/무지개 폭발/일반 피격) → Q 성공 시 carrier 원본 변이 후 완료된 parry_blue 소비자로 인계.
## 렌더는 완료된 parry_blue producer 의 절차형 3pass(_drawClassicRainbow)를 상속으로 재사용한다(적대 플래그 그대로,
## configure_reflected 미호출 — 친화/blue 플래그 위조 0).
##
## 원본 R(읽기전용): /Users/fordeargamers/Projects/exoduser-migration-20261001/game.html
##   _mkProj / _resetProj 풀 기본값                 : 17256-17281
##   spawnProj(탄생: ×1.8 / dmg×2 / sz×2 / r×1.3 / 무지개 500~600px/s 정규화) : 17340-17388, 17302-17306, 17330
##   _projectileParryClass(blackBean→magic) / _eCanReflectProjectile(blackBean 제외) : 17308-17324
##   _hurtProjectilePlayer → hurtP                   : 17389 / 43937
##   _enemyHomingTurnRate(blackBean .0058125)        : 17658-17666
##   projs 루프: 컬링/트레일/수명 35285-35293, 배리어·돔 35296-35298(미이식), life 게이트 35367, deathFx 35369
##   적 유도(homing||blackBean)&&!friendly&&life>30  : 35389-35402 (blackBean 은 허수아비/전대 무시 → P)
##   이동 35429-35431, 벽 35448-35455(blackBean → else: addParts(ELC[el],1))
##   충돌 스캔 필터 35457-35467, _pCollR/_pDist 스윕 35469-35499
##   Q 흡수 35511-35517, 무지개 회전참 35587-35594, 무지개 폭발 35595-35620
##   일반 분기(Q 반사/회전기폭/일반 피격) 35665-35714, Q 성공 변이 필드 순서 35678-35680
##   _normalProjectilePlayerKnockback 17675, _projHitFx 9016, _rainbowImpact 9104, pParryRainbowDR 28686
##   렌더 pass0/1/2 54505-54710 (blackBean → _drawClassicRainbow 54704, _druidPoison 적대 → 54548 미이식)
##

signal reflected_handoff(blue_node: Node2D, shot: Object, native_frame: float)

const BLUE := preload("res://port_modules/parry_blue_projectile/producer.gd")
const QE := preload("res://port_modules/combat_qe/producer.gd")

const HOSTILE_TAG := "blackBean"
const BLACK_TURN_PER_TICK := 0.0058125              # 17660
const HOMING_LIFE_MIN := 30.0                       # 35389 p.life>30
const RAINBOW_SPEED_MIN := 500.0 / 60.0             # 17302 (spawnProj 정규화 결과 확인용, 생성 아님)
const RAINBOW_SPEED_MAX := 600.0 / 60.0             # 17303
const RAINBOW_SPEED_EPS := 1e-6
const SCAN_MIN_R2 := 160000.0                       # 35463 max(160000, scanR²)
const BK_HIT_PAD := 16.0                            # 35584 _pCollR+16
const BK_HP_RATE := 0.15                            # 35598 P.mhp*.15
const BK_DMG_RATE := 0.7                            # 35598 p.dmg*.7
const BK_POISON_MULT := 2.0                         # 35601 total:_bkD*2
const BK_POISE_LOSS := 2                            # 35603
const BK_KB := 7.0                                  # 35606
const BK_MIN_IFRAMES := 15.0                        # 35607
const BK_AOE_R := 120.0                             # 35611
const BK_AOE_DMG_MIN := 120                         # 35611 max(120, ~~(p.dmg*2))
const BK_IFRAME_BOOM_R := 80.0                      # 35596
const WHIRL_ABS_BASE := 0.20                        # 35588 / 35686
const WHIRL_ABS_CAP := 0.30
const WHIRL_ABS_PER_DET := 0.005
const WHIRL_BK_RATE := 0.3                          # 35589
const WHIRL_BK_KB := 2.0                            # 35592
const GENERIC_KB := 2.0                             # 17679
const ELEC_T := 30.0                                # 35710 P._elecT
const EL_P := 0
const EL_L := 4
const EL_BOOM_KIND := ["physical", "fire", "ice", "dark", "lightning", "holy", "earth"]   # 9016 (EL 순서 = ELC)

# 원본 spawnProj 이후 반드시 존재하는 raw 필드(기본값 주입 금지).
const HOSTILE_REQUIRED := ["x", "y", "vx", "vy", "dmg", "el", "life", "ml", "sz", "r", "friendly", "blackBean", "col", "parryClass"]
# _resetProj 풀 기본값(17268-17281). magic 은 풀 밖(JS undefined → falsy).
const HOSTILE_POOL_EXTRA := {"blueBean": false, "parryBlueBean": false, "homing": false, "magic": false,
	"_fromRainbow": false, "_aoeR": 0.0, "_aoeDmg": 0.0, "_sprFr": 0.0, "_seaSlow": false, "_commit": false,
	"rainbow": false, "owner": null}
# blackBean 과 함께 오면 이 producer 가 이식하지 않은 원본 분기로 가야 하는 플래그 → 정확한 사유로 거부.
const HOSTILE_UNPORTED := {"redBean": "35367/35540 redBean", "bwBean": "35622 bwBean", "gbBean": "35637 gbBean",
	"waterBean": "35710-35713 waterBean", "fireMagic": "17315 fireMagic", "mine": "35300 mine", "bomb": "35359 bomb",
	"trap": "35312 trap", "web": "35704 web", "dimRift": "35335 dimRift", "poisonZone": "35347 poisonZone",
	"iceZone": "35695 iceZone", "blizzard": "35699 blizzard", "elemBall": "17662 elemBall", "swordWave": "54673 swordWave",
	"explosive": "35376 explosive", "beam": "beam", "titanEye": "35575 titanEye", "fbEnergy": "35443 fbEnergy",
	"fdEnergy": "35443 fdEnergy", "blackHoleBurst": "35403 blackHoleBurst", "_lvPull": "35434 _lvPull",
	"_lessonShot": "35504 _parryLesson", "_coralSpike": "35334 _coralSpike", "_seaSlow": "35332 _seaSlow",
	"maliceHunt": "maliceHunt", "bladeShard": "bladeShard", "iceBlade": "iceBlade"}
# Q 성공 시 SKILL 이 써야 하는 원본 변이 필드와 순서(35678-35680).
const SOURCE_Q_REFLECT_ORDER := ["vx", "vy", "friendly", "dmg", "life", "ml", "waterBean", "blueBean",
	"parryBlueBean", "magic", "homing", "_fromRainbow", "col", "_aoeR", "_aoeDmg"]
# SKILL contact gate 판정 결과(이 모듈은 계산하지 않음).
const GATE_KEYS := {"q_zone": TYPE_STRING, "q_parry_active": TYPE_BOOL, "io_active": TYPE_BOOL, "ww_abs_r": TYPE_FLOAT,
	"q_collision_scan_r": TYPE_FLOAT, "rainbow_dr": TYPE_FLOAT, "whirl_det": TYPE_BOOL, "detonate_lv": TYPE_FLOAT}

static var _hostile_bound: Array = []

var mode := "unconfigured"
var handoff_error := ""
var handoff_node: Node2D
var reflect_native_frame := -1.0
var explicit_native_steps := 0
var auto_native_steps := 0
var q_reflect_calls := 0
var q_reflect_result: Variant = null
var contact_log: Array = []
var player_log: Array = []
var player_cmd_log: Array = []
var last_gate: Dictionary = {}

var _shot: Shot
var _player: Object
var _contact_gate: Callable
var _q_reflect: Callable
var _player_prev_binding: Callable
var _bindings: Dictionary = {}
var _player_prev := Vector2.ZERO
var _auto_step := false

## ── SKILL/ENGINE 가 보는 탄 1발 carrier. 저장소는 노드 p 와 같은 Dictionary(사본 아님). ──
## raw 이름과 snake_case 별칭을 같은 슬롯으로 노출(_get_property_list 로 'in' 멤버십 보장).
## raw 변이는 apply_source_q_reflection 명령으로만 일어난다. 외부 직접 대입(legacy _do_parry_native 등)은
## external_sets 에 기록만 하고 raw 플래그/값을 바꾸지 않는다. ptype/owner/source_enemy 는 읽기 전용.
class Shot extends RefCounted:
	const SKILL_QE := preload("res://port_modules/combat_qe/producer.gd")
	const Q_DMG_MULT := 1.5            # 35674 _npDmg=~~(pParryProjDmg(p.dmg,_sbPW)*1.5)
	const Q_MIN_SPEED := 5.0           # 35678 max(5, hypot(vx,vy))
	const Q_NO_TARGET_MULT := -2.0     # 35679 p.vx*=-2;p.vy*=-2
	const Q_LIFE := 180.0              # 35680
	const Q_COL := "#00e5ff"
	const Q_BANK_FALLBACK := 10        # 35681 (p.dmg||10)
	const PARRY_ELEMENT := "rainbow"   # 35683 doParry(...,p.blackBean?'rainbow':p.el)
	const READ_ONLY := ["ptype", "owner", "source_enemy"]
	var raw: Dictionary
	var carrier_writes: Array = []     # [raw_key, value] — 실제 carrier 명령이 쓴 순서
	var external_sets: Array = []      # [name, value] — 무시된 외부 직접 대입
	var reflected := false
	var last_reflection: Dictionary = {}
	var _alias_to_raw: Dictionary = {}
	var _raw_to_alias: Dictionary = {}
	var _host: WeakRef

	func _init(storage: Dictionary, raw_to_alias: Dictionary, host: Object = null) -> void:
		raw = storage
		_raw_to_alias = raw_to_alias.duplicate()
		for k in raw_to_alias:
			_alias_to_raw[raw_to_alias[k]] = k
		_alias_to_raw["source_enemy"] = "owner"
		_host = weakref(host) if host != null else null

	func _get(property: StringName) -> Variant:
		var key := String(property)
		if key == "ptype":
			# SKILL resolve_contact 가 읽는 분류(플래그 기준). 색으로 추론하지 않는다.
			return SKILL_QE.ProjType.BLACKBEAN if raw.get("blackBean") == true else null
		var rk: String = _alias_to_raw.get(key, key)
		if rk == "owner":
			var o: Variant = raw.get("owner")
			# 해제된 owner 에 `is` 검사를 먼저 하지 않는다(유효성 먼저). 탄은 owner 와 독립.
			return o if is_instance_valid(o) else null
		if raw.has(rk):
			return raw[rk]
		return null

	func _set(property: StringName, value: Variant) -> bool:
		var key := String(property)
		var rk: String = _alias_to_raw.get(key, key)
		if key in READ_ONLY or raw.has(rk):
			external_sets.append([key, value])
			var host: Variant = _host.get_ref() if _host != null else null
			if is_instance_valid(host):
				host._gap("carrier_direct_set_ignored_" + key)
			return true
		return false

	func _get_property_list() -> Array[Dictionary]:
		var out: Array[Dictionary] = [{"name": "ptype", "type": TYPE_INT, "usage": PROPERTY_USAGE_DEFAULT},
			{"name": "source_enemy", "type": TYPE_OBJECT, "usage": PROPERTY_USAGE_DEFAULT}]
		for k in raw:
			var t: int = typeof(raw[k])
			out.append({"name": String(k), "type": t, "usage": PROPERTY_USAGE_DEFAULT})
			if _raw_to_alias.has(k):
				out.append({"name": String(_raw_to_alias[k]), "type": t, "usage": PROPERTY_USAGE_DEFAULT})
		return out

	## 원본 무지개탄 일반 Q 성공 탄도 변이(game.html 35674-35680). Q/E 자격·bank·doParry·연출은 호출자(SKILL) 몫.
	## ctx:
	##   parry_base_damage(number, 원본 pParryProjDmg(원래 p.dmg,_sbPW) 결과) 또는
	##   parry_base_provider(Callable(incoming_dmg)->number, 변이 전 원래 dmg 로 1회 호출) — 정확히 하나.
	##   player_position(Vector2, 현재 P.x/P.y).
	##   homing_target(키 존재 필수: Object/Vector2/null — null 은 정당한 무표적) 또는
	##   homing_target_provider(Callable()->Variant, 캐시된 _parryHomingTarget, 1회 호출) — 정확히 하나.
	## 반환: {ok, error, incoming_dmg_before, parry_base_damage, parry_base_provenance, projectile_dmg, bank_add,
	##        parry_element, target_branch, field_order, raw, handoff, after_carrier_caller_steps}
	func apply_source_q_reflection(ctx: Dictionary) -> Dictionary:
		var out := {"ok": false, "error": ""}
		if reflected or raw.get("friendly") != false:
			out["error"] = "not_hostile_source_friendly_true"
			return out
		if raw.get("blackBean") != true:
			out["error"] = "not_black_bean"
			return out
		var host: Variant = _host.get_ref() if _host != null else null
		if not is_instance_valid(host):
			out["error"] = "carrier_host_missing"
			return out
		var ready: String = host.q_handoff_readiness()
		if ready != "":
			out["error"] = "handoff_not_ready:" + ready
			return out
		var has_base := ctx.has("parry_base_damage")
		var has_base_p := ctx.has("parry_base_provider")
		if has_base == has_base_p:
			out["error"] = "parry_base_requires_exactly_one_of_scalar_or_provider"
			return out
		var pp: Variant = ctx.get("player_position")
		if not (pp is Vector2) or not (pp as Vector2).is_finite():
			out["error"] = "missing_player_position"
			return out
		var has_t := ctx.has("homing_target")
		var has_t_p := ctx.has("homing_target_provider")
		if has_t == has_t_p:
			out["error"] = "parry_homing_target_requires_exactly_one_of_result_or_provider"
			return out
		if has_t_p and not (ctx["homing_target_provider"] is Callable and (ctx["homing_target_provider"] as Callable).is_valid()):
			out["error"] = "parry_homing_target_provider_invalid"
			return out
		if has_base_p and not (ctx["parry_base_provider"] is Callable and (ctx["parry_base_provider"] as Callable).is_valid()):
			out["error"] = "parry_base_provider_invalid"
			return out
		# 스냅샷: 변이 전 원래 incoming dmg / 속도
		var incoming: float = float(raw["dmg"])
		var bvx: float = float(raw["vx"])
		var bvy: float = float(raw["vy"])
		# 1) pParryProjDmg 기반값(목표 조회 전, 1회)
		var base: Variant = ctx["parry_base_damage"] if has_base else (ctx["parry_base_provider"] as Callable).call(incoming)
		if not ((base is int or base is float) and is_finite(float(base))):
			out["error"] = "parry_base_damage_not_finite"
			return out
		var np_dmg := int(float(base) * Q_DMG_MULT)
		# 2) 캐시된 _parryHomingTarget 1회
		var tgt: Variant = ctx["homing_target"] if has_t else (ctx["homing_target_provider"] as Callable).call()
		var tpos: Variant = null
		if tgt is Vector2:
			tpos = tgt
		elif typeof(tgt) == TYPE_OBJECT and not is_instance_valid(tgt):
			# 해제된 대상은 provider 결함(원본 _parryHomingTarget 은 살아있는 대상만) → 변이 0. null(TYPE_NIL)과 구분.
			out["error"] = "parry_homing_target_freed"
			return out
		elif is_instance_valid(tgt) and tgt is Node2D:
			var tn := tgt as Node2D
			tpos = tn.global_position if tn.is_inside_tree() else tn.position
		elif is_instance_valid(tgt) and "x" in tgt and "y" in tgt:
			tpos = Vector2(float(tgt.get("x")), float(tgt.get("y")))
		elif tgt != null:
			out["error"] = "parry_homing_target_unreadable"
			return out
		if tpos != null and not (tpos as Vector2).is_finite():
			out["error"] = "parry_homing_target_position_not_finite"
			return out
		var nvx: float
		var nvy: float
		var branch: String
		if tpos != null:
			var player_pos: Vector2 = pp
			var tv: Vector2 = tpos
			var ang := atan2(tv.y - player_pos.y, tv.x - player_pos.x)
			var spd := maxf(Q_MIN_SPEED, sqrt(bvx * bvx + bvy * bvy))
			nvx = cos(ang) * spd
			nvy = sin(ang) * spd
			branch = "target"
		else:
			nvx = bvx * Q_NO_TARGET_MULT
			nvy = bvy * Q_NO_TARGET_MULT
			branch = "null_reverse"
		# 3) 원본 필드 순서(SOURCE_Q_REFLECT_ORDER)
		var start := carrier_writes.size()
		_w("vx", nvx)
		_w("vy", nvy)
		_w("friendly", true)
		_w("dmg", np_dmg)
		_w("life", Q_LIFE)
		_w("ml", Q_LIFE)
		_w("waterBean", false)
		_w("blueBean", true)
		_w("parryBlueBean", true)
		_w("magic", true)
		_w("homing", true)
		_w("_fromRainbow", raw["blackBean"] == true)
		_w("col", Q_COL)
		_w("_aoeR", 0.0)
		_w("_aoeDmg", 0.0)
		reflected = true
		var order: Array = []
		for i in range(start, carrier_writes.size()):
			order.append(carrier_writes[i][0])
		var bank_add: int = np_dmg if np_dmg != 0 else Q_BANK_FALLBACK
		out = {"ok": true, "error": "", "incoming_dmg_before": incoming,
			"parry_base_damage": float(base), "parry_base_provenance": "scalar" if has_base else "provider",
			"projectile_dmg": np_dmg, "bank_add": bank_add, "parry_element": PARRY_ELEMENT,
			"target_branch": branch, "target_position": tpos, "velocity_before": Vector2(bvx, bvy),
			"velocity_after": Vector2(nvx, nvy), "field_order": order, "raw": _raw_snapshot(),
			"after_carrier_caller_steps": ["P.parryBank+=bank_add (35681)", "addTxt(P.x,P.y-28,'⚡💎 블루콩!','#00e5ff',35) (35683)",
				"doParry(projectile_dmg,p.x,p.y,false,'rainbow') (35683)"]}
		last_reflection = out.duplicate(true)
		# 4) Q 프레임 종료(projs[pw++]=p;continue): 이번 frame 이동/아군 AoE 0, blue 소비자는 다음 tick
		out["handoff"] = host._on_source_q_reflected(self)
		last_reflection["handoff"] = out["handoff"]
		return out

	func _w(key: String, value: Variant) -> void:
		raw[key] = value
		carrier_writes.append([key, value])

	func _raw_snapshot() -> Dictionary:
		var s := raw.duplicate()
		s.erase("_trail")
		var o: Variant = s.get("owner")
		if is_instance_valid(o):
			s["owner"] = (o as Object).get_instance_id()
		elif typeof(o) == TYPE_OBJECT:
			s["owner"] = 0
		return s

## ── 구성: 원본 spawnProj 가 만든 적대 blackBean 1발. 1 source projectile → 1 Node. ──
## shot_raw: Dictionary 또는 Object(raw 필드명 또는 snake_case 별칭). 탄생 스탯은 그대로 보존(재계산 0).
## owner_world: ENGINE World(is_world_blocked 필수; 시계/RNG/파츠/텍스트는 있으면 소비).
## bindings(필수): player(Object: receive_damage/radius/iframes/state/max_hp),
##   contact_gate(Callable(shot, geometry)->Dictionary — SKILL 판정 결과 GATE_KEYS),
##   q_reflect(Callable(shot)->Variant — SKILL Q 성공 처리. 그 안에서 shot.apply_source_q_reflection(ctx) 를 호출한 뒤
##   반환 bank_add/projectile_dmg 로 parryBank·doParry(...,'rainbow') 를 수행해야 한다. legacy resolve_contact_result 는
##   carrier 를 호출하지 않으므로 직접 대입은 무시·기록되고 탄은 적대 그대로 남는다(통합 gap).
## bindings(선택): fx_sink, camera_position, source_opt, render_bounds, query_enemies, player_prev_position(Callable→Vector2),
##   p_dot_pool(Q 인계 시 blue 소비자가 요구).
func configure_hostile(shot_raw: Variant, owner_world: Object, bindings: Dictionary = {}) -> bool:
	if _configured:
		return _reject("already_configured")
	if not (shot_raw is Dictionary or shot_raw is Object) or shot_raw == null:
		return _reject("shot_source_not_object")
	if not is_instance_valid(owner_world) or not owner_world.has_method("is_world_blocked"):
		return _reject("missing_world_api_is_world_blocked")
	for entry in _hostile_bound:
		var node: Variant = entry["node"].get_ref()
		if is_instance_valid(node) and not node.ended and is_same(entry["source"], shot_raw):
			return _reject("source_projectile_already_bound")
	var raw: Dictionary = {}
	var missing: Array = []
	for key in HOSTILE_REQUIRED:
		var got: Array = _read_field(shot_raw, key)
		if got[0] == "conflict":
			return _reject("conflicting_alias_" + key)
		if got[0] == "missing":
			missing.append(key)
		else:
			raw[key] = got[1]
	if not missing.is_empty():
		return _reject("missing_post_spawnProj_fields:" + ",".join(missing))
	var defaults: Dictionary = POOL_DEFAULTS.duplicate()
	defaults.merge(HOSTILE_POOL_EXTRA, true)
	for key in defaults:
		var got: Array = _read_field(shot_raw, key)
		if got[0] == "conflict":
			return _reject("conflicting_alias_" + key)
		raw[key] = got[1] if got[0] == "ok" else defaults[key]
	if shot_raw is Dictionary:
		var alias_names: Array = ALIASES.values()
		for key in shot_raw:
			if not raw.has(key) and not alias_names.has(key) and not (key in ["_trail", "_trH", "_trLen", "_trLX", "_trLY"]):
				raw[key] = shot_raw[key]
	for key in ["_trail", "_trH", "_trLen", "_trLX", "_trLY"]:
		var got: Array = _read_field(shot_raw, key)
		if got[0] == "ok" and got[1] != null:
			raw[key] = got[1]
	for key in NUMBER_RAW:
		if not _is_number(raw.get(key)):
			return _reject("non_finite_number_" + key)
		raw[key] = float(raw[key])
	if raw["_sprFr"] != null:
		if not _is_number(raw["_sprFr"]):
			return _reject("non_finite_number__sprFr")
		raw["_sprFr"] = float(raw["_sprFr"])
	for key in defaults:
		if defaults[key] is bool and not (raw[key] is bool):
			return _reject("non_bool_flag_" + key)
	for key in ["friendly", "blackBean"]:
		if not (raw[key] is bool):
			return _reject("non_bool_flag_" + key)
	if not (raw["col"] is String):
		return _reject("non_string_col")
	if not (raw["parryClass"] is String):
		return _reject("non_string_parryClass")
	var owner: Variant = raw["owner"]
	if owner != null and not (owner is Object):
		return _reject("owner_not_object")
	# 적대 blackBean 정체성(플래그 기준, 색 무관)
	if raw["blackBean"] != true:
		return _reject("not_black_bean")
	for key in ["friendly", "blueBean", "parryBlueBean", "_fromRainbow"]:
		if raw[key] != false:
			return _reject("not_hostile_state:" + key)
	if raw["parryClass"] == "":
		return _reject("missing_spawnProj_parryClass")
	if raw["parryClass"] != "magic":
		return _reject("unported_parryClass_for_blackBean:" + str(raw["parryClass"]))
	for key in HOSTILE_UNPORTED:
		if raw.get(key) == true:
			return _reject("unported_branch_" + key + ":" + str(HOSTILE_UNPORTED[key]))
	# spawnProj 이동탄 정규화(17374) 결과 확인. 정지탄(|v|=0)은 원본도 정규화하지 않는다.
	var spd: float = sqrt(raw["vx"] * raw["vx"] + raw["vy"] * raw["vy"])
	if spd > 0.0 and (spd < RAINBOW_SPEED_MIN - RAINBOW_SPEED_EPS or spd > RAINBOW_SPEED_MAX + RAINBOW_SPEED_EPS):
		return _reject("missing_spawnProj_rainbow_speed_band")
	# 바인딩
	var pl: Variant = bindings.get("player")
	if not (pl is Object) or not is_instance_valid(pl):
		return _reject("missing_player_target")
	if not pl.has_method("receive_damage") and not pl.has_method("hurt_projectile_player"):
		return _reject("missing_player_api_hurt")
	for field in ["iframes", "state"]:
		if not (field in pl):
			return _reject("missing_player_field_" + field)
	if not ("radius" in pl or "r" in pl):
		return _reject("missing_player_field_radius")
	if not ("max_hp" in pl or "mhp" in pl):
		return _reject("missing_player_field_max_hp")
	if not (pl is Node2D or ("x" in pl and "y" in pl)):
		return _reject("missing_player_position")
	var gate: Variant = bindings.get("contact_gate")
	if not (gate is Callable) or not (gate as Callable).is_valid():
		return _reject("missing_skill_contact_gate")
	var qr: Variant = bindings.get("q_reflect")
	if not (qr is Callable) or not (qr as Callable).is_valid():
		return _reject("missing_skill_q_reflect")
	var prev_b: Variant = bindings.get("player_prev_position", Callable())
	if not (prev_b is Callable):
		return _reject("player_prev_position_not_callable")
	var opt: Dictionary = SOURCE_OPT_DEFAULT.duplicate()
	var given: Variant = bindings.get("source_opt", {})
	if not (given is Dictionary):
		return _reject("source_opt_not_dictionary")
	for key in given:
		opt[key] = given[key]
	if not (opt["trail"] is bool) or not (opt["deathFx"] is bool) or not _is_number(opt["shake"]):
		return _reject("invalid_source_opt")
	for key in ["camera_position", "render_bounds", "query_enemies"]:
		if not (bindings.get(key, Callable()) is Callable):
			return _reject(key + "_not_callable")
	var sink: Variant = bindings.get("fx_sink")
	if sink != null and not (sink is Object):
		return _reject("fx_sink_not_object")
	p = raw
	world = owner_world
	fx_sink = sink
	source_opt = opt
	var pool: Variant = bindings.get("p_dot_pool", Callable())
	_p_dot_pool = pool if pool is Callable else Callable()
	_camera_position = bindings.get("camera_position", Callable())
	_render_bounds = bindings.get("render_bounds", Callable())
	_query_enemies = bindings.get("query_enemies", Callable())
	_player = pl
	_contact_gate = gate
	_q_reflect = qr
	_player_prev_binding = prev_b
	_bindings = bindings
	_source = shot_raw
	_adopt_trail()
	_shot = Shot.new(p, ALIASES, self)
	_player_prev = _player_pos()
	position = Vector2(p["x"], p["y"])
	_configured = true
	mode = "hostile"
	last_error = ""
	# 원본 World 분기 중 현재 World 에 소비 API 가 없는 것(호출 0, 정확한 사유만 기록).
	gaps["unported_world_branch_35296_bonfire_barrier_35298_maliceDome"] = 1
	if not _p_dot_pool.is_valid():
		gaps["q_handoff_requires_p_dot_pool_binding"] = 1
	_hostile_bound = _hostile_bound.filter(func(entry): return is_instance_valid(entry["node"].get_ref()) and not entry["node"].get_ref().ended)
	_hostile_bound.append({"node": weakref(self), "source": shot_raw})
	return true

## 적대 노드에 blue 구성 API 를 쓰지 않는다(플래그 위조 경로 차단).
func configure_reflected(_reflected: Variant, _owner_world: Object, _b: Dictionary = {}) -> bool:
	return _reject("hostile_node_use_configure_hostile")

## SKILL 이 변이할 carrier(1발 1개).
func get_shot() -> Object:
	return _shot

func _ready() -> void:
	if not _configured:
		_end("unconfigured")
		return
	process_mode = Node.PROCESS_MODE_PAUSABLE
	# 기존 priority1 투사체 phase(owner AI/경고 → priority1 투사체 → priority2 birth).
	process_physics_priority = 1
	add_to_group("black_bean_projectiles")
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_OFF
	z_as_relative = false
	z_index = clampi(int(p["y"] / 4.0) + 1, -2000, 4000)
	for pass_id in [PASS_TRAIL, PASS_GLOW, PASS_BODY]:
		var layer = BLUE.SourcePassLayer.new()
		layer.host = self
		layer.pass_id = pass_id
		layer.name = ["SourceTrailPass0", "SourceGlowPass1", "SourceBodyPass2"][pass_id]
		if pass_id != PASS_BODY:
			var add := CanvasItemMaterial.new()
			add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD   # 원본 'lighter'
			layer.material = add
		add_child(layer)
		_layers.append(layer)
	set_physics_process(not _external_native)
	set_process(not _external_render)

## 자체 구동 시 부모 구현(World dt_sp/frame/identity 소비)을 그대로 쓰고, 호출 출처만 계측한다.
func _physics_process(delta: float) -> void:
	_auto_step = true
	super._physics_process(delta)
	_auto_step = false

## ── native step: 원본 projs 루프의 적대 blackBean 1발 1회분 (sp = native ticks). ──
func advance_native_projectile(ticks: float, frame: float, enemies: Array) -> void:
	if not _configured or ended or not is_finite(ticks) or ticks <= 0.0:
		return
	# 원본 P 는 World 가 있는 동안 항상 존재한다. 대상이 해제된 뒤의 호출은 상태 변경 없이 사유만 기록.
	if not is_instance_valid(_player):
		_gap("player_target_freed_step_skipped")
		return
	if _auto_step:
		auto_native_steps += 1
	else:
		explicit_native_steps += 1
	if mode != "hostile":
		return
	var sp := ticks
	native_steps += 1
	native_frame = frame
	# 35289-35290 카메라 2500px 컬링(수명 감소 전, 무연출)
	var cam: Variant = _camera_xy()
	if cam is Vector2:
		if _d2(p["x"], p["y"], cam.x, cam.y) > CAMERA_CULL_D2:
			_end("camera_cull_2500")
			return
	else:
		_gap("camera_source_missing")
	# 35292 트레일 링
	if source_opt["trail"] and not _any(["mine", "trap", "dimRift", "web", "poisonZone", "fdEnergy"]):
		_trail_update()
	# 35293 수명 감소
	p["life"] -= sp * LIFE_DECAY_PER_TICK
	# 35367 life<=0 게이트 (redBean/mine/bomb 은 구성에서 거부됨)
	if p["life"] <= 0.0:
		var reason := ""
		if p["life"] <= LIFE_KILL_FLOOR:
			reason = "life_le_minus900"
		elif cam is Vector2 and _d2(p["x"], p["y"], cam.x, cam.y) > CAMERA_CULL_D2:
			reason = "life_end_offscreen"
		else:
			p["life"] = 1.0
			life1_extensions += 1
		if reason != "":
			# 35369 deathFx 게이트: blackBean 은 일반 소멸 임팩트 없음
			_end(reason)
			return
	var old := Vector2(p["x"], p["y"])
	# 35389-35402 적 유도: blackBean 은 허수아비/전대를 무시하고 P 만 추적
	if (p["homing"] or p["blackBean"]) and not p["friendly"] and p["life"] > HOMING_LIFE_MIN:
		var tp: Vector2 = _player_pos()
		var want := atan2(tp.y - p["y"], tp.x - p["x"])
		var cur := atan2(p["vy"], p["vx"])
		var diff := want - cur
		while diff > PI:
			diff -= TAU
		while diff < -PI:
			diff += TAU
		var turn := minf(absf(diff), BLACK_TURN_PER_TICK * sp) * signf(diff)
		var spd := sqrt(p["vx"] * p["vx"] + p["vy"] * p["vy"])
		p["vx"] = cos(cur + turn) * spd
		p["vy"] = sin(cur + turn) * spd
		homing_target_id = _player.get_instance_id()
	# 35429-35431 이동
	p["x"] += p["vx"] * sp
	p["y"] += p["vy"] * sp
	p["dist"] += sp * sqrt(p["vx"] * p["vx"] + p["vy"] * p["vy"])
	position = Vector2(p["x"], p["y"])
	z_index = clampi(int(p["y"] / 4.0) + 1, -2000, 4000)
	# 35436 _projEmit 서브 파티클(OPT.parts>=60): 전역 _gcT 와 projs 인덱스 필요 → 미이식(gap)
	if _is_number(source_opt.get("parts")) and float(source_opt["parts"]) >= 60.0:
		_gap("projEmit_subparticle_unported")
	# 35448-35455 벽: isW(nx,p.y)/isW(p.x,ny) 는 이동 후 같은 좌표. blackBean → else 분기
	if world.is_world_blocked(Vector2(p["x"], p["y"])):
		var el := int(p["el"])
		if el >= 0 and el < ELC.size():
			_parts(ELC[el], 1)
		else:
			_gap("wall_parts_ELC_undefined")
		_end("wall")
		return
	_contact(old, enemies)

## 35457-35714 플레이어 접촉. Q/E 자격·흡수 구역·반사 반경은 SKILL gate 가 준 값만 쓴다.
func _contact(old: Vector2, enemies: Array) -> void:
	var pp: Vector2 = _player_pos()
	var prev: Vector2 = _player_prev
	if _player_prev_binding.is_valid():
		var v: Variant = _player_prev_binding.call()
		if v is Vector2:
			prev = v
		else:
			_gap("player_prev_position_invalid")
	_player_prev = pp
	var x: float = p["x"]
	var y: float = p["y"]
	var pd2 := _d2(x, y, pp.x, pp.y)
	var pdp2 := _d2(x, y, prev.x, prev.y)
	var p_coll_r: float = _player_radius() + _or(p["sz"], 1.0) * 3.0
	# 35486-35499 일반탄 스윕: 현재/이전 플레이어 + 탄 선분 최근접
	var p_dist := sqrt(pd2)
	p_dist = minf(p_dist, sqrt(pdp2))
	var sdx: float = x - old.x
	var sdy: float = y - old.y
	var sl2 := sdx * sdx + sdy * sdy
	if sl2 > 1.0:
		var t := clampf((sdx * (pp.x - old.x) + sdy * (pp.y - old.y)) / sl2, 0.0, 1.0)
		p_dist = minf(p_dist, Vector2(old.x + sdx * t - pp.x, old.y + sdy * t - pp.y).length())
		var t2 := clampf((sdx * (prev.x - old.x) + sdy * (prev.y - old.y)) / sl2, 0.0, 1.0)
		p_dist = minf(p_dist, Vector2(old.x + sdx * t2 - prev.x, old.y + sdy * t2 - prev.y).length())
	var bk_hit_r := p_coll_r + BK_HIT_PAD
	var geometry := {"x": x, "y": y, "old": old, "player_pos": pp, "player_prev": prev, "p_dist": p_dist,
		"p_dist2": pd2, "p_dist_prev2": pdp2, "p_coll_r": p_coll_r, "bk_hit_r": bk_hit_r}
	var gate: Variant = _contact_gate.call(_shot, geometry)
	var bad := _gate_error(gate)
	if bad != "":
		_gap("contact_gate_invalid:" + bad)
		contact_log.append({"frame": native_frame, "p_dist": p_dist, "branch": "gate_invalid:" + bad})
		return
	var g: Dictionary = gate
	last_gate = g.duplicate()
	# 35467 스캔 필터(blackBean 은 전대 판정 제외)
	var scan_r: float = float(g["q_collision_scan_r"])
	var scan_r2 := maxf(SCAN_MIN_R2, scan_r * scan_r)
	if pd2 > scan_r2 and pdp2 > scan_r2 and not p["friendly"]:
		return
	var io: bool = g["io_active"]
	var iframes: float = float(_player.get("iframes"))
	var state := str(_player.get("state"))
	var q_active: bool = g["q_parry_active"]
	var cls := _parry_class()
	var dmg: float = p["dmg"]
	var dr: float = float(g["rainbow_dr"])
	var entry := {"frame": native_frame, "p_dist": p_dist, "bk_hit_r": bk_hit_r, "q_zone": g["q_zone"],
		"q_parry_active": q_active, "ww_abs_r": float(g["ww_abs_r"]), "iframes": iframes, "state": state, "branch": "none"}
	contact_log.append(entry)
	if contact_log.size() > 16:
		contact_log.pop_front()
	var hit := false
	# 35511-35517 Q 흡수 구역(판정은 SKILL, 탄 소멸/연출은 이 탄)
	if g["q_zone"] == "absorb" and not p["noParry"] and not io:
		entry["branch"] = "q_absorb"
		_hfx("play_sample", ["shield_hit", 0.6, 1.0], "playSample('shield_hit',.6,1)")
		_parts("#ff44ff", 8)
		_text(x, y - 12.0, "흡수", "#66bbff", 20)
		_end("q_absorb")
		return
	var bk_q := q_active and cls == "magic"
	var to_player := atan2(pp.y - y, pp.x - x)
	# 35587-35594 회전참 중 무지개 흡수(무적 중)
	if not hit and not bk_q and p_dist < bk_hit_r and iframes > 0.0 and not io and state == "whirlwind":
		entry["branch"] = "whirlwind_rainbow_absorb"
		var det_lv := _or(g["detonate_lv"], 1.0)
		var abs3 := minf(WHIRL_ABS_CAP, WHIRL_ABS_BASE + 0.0 + (det_lv * WHIRL_ABS_PER_DET if g["whirl_det"] else 0.0))
		var d3 := maxi(1, int(dmg * WHIRL_BK_RATE * (1.0 - abs3) * (1.0 - dr)))
		_hurt_player(d3, {"dtype": "magic", "src": "무지개흡수", "wwAbsorbed": true}, Vector2.from_angle(to_player), -1.0)
		var bank: int = int(_or(dmg, 10.0)) if g["whirl_det"] else int(dmg * WHIRL_BK_RATE * abs3)
		_player_cmd("add_parry_bank", [bank], "P.parryBank+=...")
		_player_cmd("apply_native_posthurt_knockback", [Vector2(cos(to_player), sin(to_player)) * WHIRL_BK_KB], "P.kb+=2")
		_hfx("shake", [3.0], "shake(3)")
		_hfx("hit_flash", ["#ff00ff", 0.1], "doHitFlash('#ff00ff',0.1)")
		_parts("#ff00ff", 4)
		hit = true
	# 35595-35620 무지개 폭발(Q 패링 아님)
	if not hit and not bk_q and p_dist < bk_hit_r and not io:
		if iframes > 0.0 and state != "whirlwind":
			entry["branch"] = "iframe_rainbow_boom"
			_hfx("add_boom", [x, y, BK_IFRAME_BOOM_R, 72.0, "rainbow"], "_addBoom(p.x,p.y,80,72,'rainbow')")
			_hfx("spawn_smoke", [x, y, "rainbow"], "_spawnSmoke(p.x,p.y,'rainbow')")
			_parts("#ff44ff", 8)
			_end("rainbow_iframe_boom")
			return
		entry["branch"] = "rainbow_explosion"
		var mhp: float = float(_player.get("max_hp")) if "max_hp" in _player else float(_player.get("mhp"))
		var bk_d := maxi(int(mhp * BK_HP_RATE * (1.0 - dr)), int(dmg * BK_DMG_RATE * (1.0 - dr)))
		_hurt_player(bk_d, {"dtype": "magic", "src": "무지개폭발"}, Vector2.from_angle(to_player), -1.0)
		var stacks: Variant = _player_cmd("apply_native_rainbow_poison", [float(bk_d) * BK_POISON_MULT], "P._rbPoison.push({total:_bkD*2,t:600,tick:0})")
		if (stacks is int or stacks is float) and int(stacks) > 0:
			var tp: Vector2 = _player_pos()
			_text(tp.x, tp.y - 30.0, "☠중독!×" + str(int(stacks)), "#33aa22", 30)
		_player_cmd("apply_native_rainbow_poise_loss", [BK_POISE_LOSS], "P.poise-=2 (+focus/pStun 35603-35604)")
		_player_cmd("apply_native_posthurt_knockback", [Vector2(cos(to_player), sin(to_player)) * BK_KB], "P.kb+=7")
		_player_cmd("apply_native_min_iframes", [BK_MIN_IFRAMES], "P.iframes=max(P.iframes,15)")
		_text(x, y - 15.0, "💥무지개 폭발! " + str(bk_d), "#ff44ff", 40)
		_hfx("play_sfx", ["detonate"], "SFX.detonate()")
		_hfx("shake", [14.0], "shake(14)")
		_hfx("hit_flash", ["#ff00ff", 0.3], "doHitFlash('#ff00ff',0.3)")
		_hfx("screen_flash", ["rgba(255,60,0,.35)", 0.35], "scrFlash=...;scrFlashA=.35")
		_hfx("request_slow_mo_at_least", [8.0], "G.slowMo=max(G.slowMo,8)")
		var bk_dmg := maxi(BK_AOE_DMG_MIN, int(dmg * 2.0))
		for be in _query("rainbow_aoe", enemies, x, y, BK_AOE_R):
			if not _alive(be):
				continue
			var bp: Vector2 = _epos(be)
			if sqrt(_d2(x, y, bp.x, bp.y)) > BK_AOE_R:
				continue
			hurt_log.append(_hurt_enemy(be, bk_dmg, atan2(bp.y - y, bp.x - x), {"noPoise": true}))
		var kind := "druid_poison_hit" if p["_druidPoison"] and not p["friendly"] else "rainbow_light"
		_hfx("add_boom", [x, y, BK_AOE_R, 72.0, kind], "_addBoom(p.x,p.y,120,72,kind)")
		hit = true
	# 35665-35714 일반 분기
	if not p["noParry"] and not p["poisonZone"] and not hit and not p["friendly"] and p_dist < float(g["ww_abs_r"]) and (q_active or iframes <= 0.0) and not io:
		if q_active and cls == "magic":
			entry["branch"] = "q_reflect"
			_run_q_reflect()
			return
		elif state == "whirlwind" and g["whirl_det"] and not p["friendly"]:
			entry["branch"] = "whirl_detonate_absorb"
			var wd_abs := minf(WHIRL_ABS_CAP, WHIRL_ABS_BASE + _or(g["detonate_lv"], 1.0) * WHIRL_ABS_PER_DET)
			var wd_d := maxi(1, int(dmg * (1.0 - wd_abs)))
			_hurt_player(wd_d, {"dtype": "magic", "wwAbsorbed": true}, Vector2.from_angle(to_player), -1.0)
			_player_cmd("add_parry_bank", [int(_or(dmg, 10.0))], "P.parryBank+=(p.dmg||10)")
			_parts("#ff4400", 4)
			hit = true
		elif state != "charge" and not p["friendly"]:
			entry["branch"] = "generic_projectile_hit"
			var mul: float = 1.0
			if _player.has_method("get_native_element_multiplier"):
				mul = float(_player.call("get_native_element_multiplier", int(p["el"])))
			else:
				_gap("player_elMul_missing_neutral1")
			var pj_d := int(_or(dmg, 10.0) * mul)
			var kb := _normal_projectile_knockback(pp)
			_hurt_player(pj_d, {"dtype": "magic", "redBean": false, "projHit": true, "knockback": kb}, kb.normalized(), kb.length())
			var el := int(p["el"])
			if el >= 0 and el < EL_BOOM_KIND.size():
				_hfx("add_boom", [x, y, 60.0, 12.0 if el == EL_P else 48.0, EL_BOOM_KIND[el]], "_projHitFx(p.x,p.y,p.el,false)")
			else:
				_hfx("add_boom", [x, y, 60.0, 48.0, "physical"], "_projHitFx(p.x,p.y,p.el,false)")
			if el == EL_L:
				_player_cmd("apply_native_elec_t", [ELEC_T], "P._elecT=max(P._elecT||0,30)")
			hit = true
	if hit:
		_end(str(entry["branch"]))

## 35665-35683 Q 성공 분기: 자격/기반 피해/bank/doParry 는 SKILL(q_reflect 바인딩) 몫이고, SKILL 은 그 안에서
## 이 carrier 의 apply_source_q_reflection 을 호출해야 한다. 바인딩이 carrier 를 쓰지 않으면(legacy 직접 대입)
## 탄은 적대 상태 그대로 두고 정확한 통합 gap 만 기록한다(값 보충/정지 상태 발명 0).
func _run_q_reflect() -> void:
	q_reflect_calls += 1
	q_reflect_result = _q_reflect.call(_shot)
	if not _shot.reflected:
		_gap("q_reflect_binding_did_not_apply_source_carrier")

## Node 위임(ENGINE 용). 같은 carrier 명령을 실행한다.
func apply_source_q_reflection(ctx: Dictionary) -> Dictionary:
	if _shot == null:
		return {"ok": false, "error": "unconfigured"}
	return _shot.apply_source_q_reflection(ctx)

## carrier 변이 전 인계 준비 검사(불완전 소비 방지). "" = 준비됨.
func q_handoff_readiness() -> String:
	if not _configured:
		return "unconfigured"
	if ended:
		return "projectile_ended"
	if mode != "hostile":
		return "mode_" + mode
	if not is_instance_valid(world):
		return "world_missing"
	if not _p_dot_pool.is_valid():
		return "missing_blue_binding_p_dot_pool"
	return ""

## carrier 가 원본 필드 변이를 끝낸 직후 호출. 이번 native frame 은 여기서 끝(projs[pw++]=p;continue).
func _on_source_q_reflected(_carrier: Object) -> Dictionary:
	reflect_native_frame = native_frame
	var ok := _handoff_to_blue()
	return {"ok": ok, "mode": mode, "error": handoff_error, "native_frame": reflect_native_frame,
		"blue_node_id": handoff_node.get_instance_id() if is_instance_valid(handoff_node) else 0,
		"deferred_add": ok and get_parent() != null}

## 완료된 parry_blue 소비자(configure_reflected, 읽기전용 재사용)로 같은 carrier 를 인계.
func _handoff_to_blue() -> bool:
	if _trail_ready:
		p["_trail"] = _trail.duplicate()
		p["_trH"] = _trH
		p["_trLen"] = _trLen
		p["_trLX"] = _trLX
		p["_trLY"] = _trLY
	var blue: BLUE = BLUE.new()
	var ok: bool = blue.configure_reflected(_shot, world, _bindings)
	for key in ["_trail", "_trH", "_trLen", "_trLX", "_trLY"]:
		p.erase(key)
	if not ok:
		# 준비 검사 후에도 거부되면 불변식 위반: 이 노드는 더 진행하지 않고 사유만 남긴다(대체 동작 발명 0).
		handoff_error = "blue_configure_rejected:" + str(blue.last_error)
		mode = "handoff_failed"
		_gap("q_handoff_blue_configure_rejected")
		set_physics_process(false)
		blue.free()
		return false
	if _external_native or _external_render:
		blue.bind_external_driver(_external_native, _external_render)
	handoff_node = blue
	handoff_error = ""
	mode = "handed_off"
	var parent := get_parent()
	if parent != null:
		# 이번 native frame 이 끝난 뒤 트리 진입 → Q 프레임 이중 이동 0.
		parent.call_deferred("add_child", blue)
	else:
		_gap("handoff_parent_missing_engine_must_add")
	reflected_handoff.emit(blue, _shot, reflect_native_frame)
	_end("q_reflect_handoff")
	return true

func q_reflect_write_order_matches_source() -> bool:
	if _shot == null or not _shot.reflected:
		return false
	var seq: Array = []
	for w in _shot.carrier_writes:
		seq.append(w[0])
	return seq == SOURCE_Q_REFLECT_ORDER

## _hurtProjectilePlayer(p,dmg,opts) → hurtP(dmg,{...opts,druidPoison,projectileHitSfx:true,mouthProjectile:p}).
## hurtP 본문은 Player(ENGINE) 소유. 완전한 hurtP 포트가 있으면 opts 그대로, 없으면 현재 receive_damage.
func _hurt_player(amount: int, opts: Dictionary, push_dir: Vector2, kb_strength: float) -> void:
	var full := opts.duplicate()
	full["druidPoison"] = bool(p["_druidPoison"])
	full["projectileHitSfx"] = true
	full["mouthProjectile"] = _shot
	var rec := {"amount": amount, "dtype": str(opts.get("dtype", "magic")), "src": str(opts.get("src", "")),
		"push_dir": push_dir, "kb_strength": kb_strength, "hp_before": _player.get("hp"),
		"iframes_before": _player.get("iframes"), "method": ""}
	if _player.has_method("hurt_projectile_player"):
		_player.call("hurt_projectile_player", amount, full)
		rec["method"] = "hurt_projectile_player"
	else:
		_player.call("receive_damage", amount, str(opts.get("dtype", "magic")), push_dir, kb_strength)
		rec["method"] = "receive_damage"
		_gap("player_receive_damage_drops_hurtP_opts")
	rec["hp_after"] = _player.get("hp")
	player_log.append(rec)

## Player 명령(ENGINE 소유). 없으면 호출 0 + 정확한 gap.
func _player_cmd(method: String, args: Array, source_call: String) -> Variant:
	var rec := {"method": method, "args": args, "source": source_call, "applied": false}
	var out: Variant = null
	if _player.has_method(method):
		out = _player.callv(method, args)
		rec["applied"] = true
		rec["result"] = out
	else:
		_gap("player_command_missing_" + method)
	player_cmd_log.append(rec)
	return out

## hurtE(be, dmg, ang, false, opts, p.el). 대상 hurtE 는 ENGINE adapter.
func _hurt_enemy(e: Object, amount: int, ang: float, opts: Dictionary) -> Dictionary:
	var rec := {"target_id": e.get_instance_id(), "amount": amount, "ang": ang, "atkEl": int(p["el"]), "opts": opts.duplicate(),
		"hp_before": e.get("hp") if "hp" in e else null, "method": ""}
	if e.has_method("hurtE"):
		e.call("hurtE", amount, ang, false, opts, int(p["el"]))
		rec["method"] = "hurtE"
	elif e.has_method("receive_damage"):
		var argc: int = e.get_method_argument_count("receive_damage")
		if argc >= 4:
			e.call("receive_damage", amount, Vector2.from_angle(ang), HOSTILE_TAG, opts)
			rec["method"] = "receive_damage/4"
		elif argc == 3:
			e.call("receive_damage", amount, Vector2.from_angle(ang), HOSTILE_TAG)
			rec["method"] = "receive_damage/3"
			_gap("target_receive_damage_drops_source_opts")
		else:
			_gap("target_receive_damage_arity")
	else:
		_gap("target_hurt_api_missing")
	rec["hp_after"] = e.get("hp") if "hp" in e else null
	return rec

## ENGINE fx adapter 호출(없으면 호출 0 + gap). 각 원본 이벤트 1회.
func _hfx(method: String, args: Array, source_call: String) -> void:
	effect_log.append({"kind": method, "args": args, "source": source_call})
	if fx_sink != null and is_instance_valid(fx_sink) and fx_sink.has_method(method):
		fx_sink.callv(method, args)
	else:
		_gap("fx_sink_missing_" + method)

## 17675 _normalProjectilePlayerKnockback
func _normal_projectile_knockback(pp: Vector2) -> Vector2:
	var kx: float = _jsnum(p["vx"])
	var ky: float = _jsnum(p["vy"])
	var km := sqrt(kx * kx + ky * ky)
	if km <= 0.001:
		kx = pp.x - p["x"]
		ky = pp.y - p["y"]
		km = sqrt(kx * kx + ky * ky)
	if km <= 0.001:
		return Vector2(0.0, GENERIC_KB)
	return Vector2(kx / km * GENERIC_KB, ky / km * GENERIC_KB)

func _gate_error(gate: Variant) -> String:
	if not (gate is Dictionary):
		return "not_dictionary"
	for key in GATE_KEYS:
		if not gate.has(key):
			return "missing_" + key
		var v: Variant = gate[key]
		match GATE_KEYS[key]:
			TYPE_STRING:
				if not (v is String) or not (v in ["parry", "absorb", "none"]):
					return "invalid_" + key
			TYPE_BOOL:
				if not (v is bool):
					return "invalid_" + key
			TYPE_FLOAT:
				if not _is_number(v):
					return "invalid_" + key
	return ""

func _player_pos() -> Vector2:
	if not is_instance_valid(_player):
		return Vector2.INF
	if _player is Node2D:
		var n := _player as Node2D
		return n.global_position if n.is_inside_tree() else n.position
	if "x" in _player and "y" in _player:
		return Vector2(float(_player.get("x")), float(_player.get("y")))
	return Vector2.INF

func _player_radius() -> float:
	return float(_player.get("radius")) if "radius" in _player else float(_player.get("r"))

func get_snapshot() -> Dictionary:
	var s: Dictionary = super.get_snapshot()
	s["schema"] = "exoduser.godot.black-bean-projectile.v1"
	s["mode"] = mode
	s["handoff_error"] = handoff_error
	s["handoff_node_id"] = handoff_node.get_instance_id() if is_instance_valid(handoff_node) else 0
	s["reflect_native_frame"] = reflect_native_frame
	s["explicit_native_steps"] = explicit_native_steps
	s["auto_native_steps"] = auto_native_steps
	s["q_reflect_calls"] = q_reflect_calls
	s["carrier_reflected"] = _shot.reflected if _shot != null else false
	s["carrier_writes"] = _shot.carrier_writes.duplicate(true) if _shot != null else []
	s["carrier_external_sets_ignored"] = _shot.external_sets.duplicate(true) if _shot != null else []
	s["q_reflect_order_matches_source"] = q_reflect_write_order_matches_source()
	s["contact_log"] = contact_log.duplicate(true)
	s["player_log"] = player_log.duplicate(true)
	s["player_cmd_log"] = player_cmd_log.duplicate(true)
	s["last_gate"] = last_gate.duplicate()
	return s
