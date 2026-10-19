extends RefCounted
##
## combat_stat_formula/producer.gd — 원 패시브/장비 전투 배율 계산 provider (Q/E stat 소스값).
## TASK GODOT-PORT-COMBAT-STAT-FORMULA-FIRST-20261013.
##
## 원 R(canonical game.html, 읽기전용):
##   SLOT_NAMES (@15843) = weapon,shield,boots,armor,helmet,bow,gloves,pants,belt,necklace,ring1,ring2,
##                         cape,bracelet,headband,ossuary,headband2
##   _uEq(stat) (@17034): for(SLOT_NAMES){const _it=INV.equipped[slot];if(_it&&_it[stat])return _it[stat]}return 0
##   PASSIVES (@28300): PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0)   — mkP 기본 = 26키 전부 0
##   _eqImplicit(stat) (@28653): v=0;for(SLOT_NAMES){it=INV.equipped[sl];
##                               if(it&&it._implicitStat===stat)v+=(+it._implicitVal||0)}return v
##   statStr() (@28654) = 1 / statInt() (@28656) = 1   — 원 상수(fallback 아님)
##   _passDmgSum(type) (@28664):
##     s=0; s+=PASSIVES.pAtk*.10+(P._altAtk||0); s+=(PASSIVES.pHuman||0)*.05;
##     melee: s+=(PASSIVES.pMelee||0)*.15
##     magic: s+=PASSIVES.pMagic*.10+_eqAffix('magicDmg')+_eqImplicit('_iMagDmg')*.01
##     return (1+s)*0.7
##   pAtkMul() (@28678)        = _passDmgSum('melee')
##   pParryDmg() (@28683)      = 1+PASSIVES.pParry*.50
##   pParryProjDmg (@28684)    : scale = isQ ? magicRef()*statInt()*pMagicMul(false) : meleeRef()*statStr()*pAtkMul()
##                               _kiFloor = ~~(meleeRef()*14*statStr()*pAtkMul())
##   pMagicMul(forAttack=true) (@28687) = _passDmgSum('magic')*(1+(_uEq('_uHelmMagic')||0))*(forAttack?2:1)
##   pShieldBlock() (@28700)   = 0   — removed passive pShield, 원 상수
##   pGuardAbsorb() (@28701)   = Math.min(.50,.30+PASSIVES.pGuard*.02+_eqAffix('shieldBlockDR'))
##   P._altAtk=0 (@32230/@63913 리셋)
##
## 이 모듈은 계산만 한다: 패시브/아이템/스탯 생성 0, 타이머 전진 0, PASSIVES/P/INV/G/공유 캐시/QE field 쓰기 0.
## 모든 입력은 현재 원 상태를 반환하는 Callable(스냅샷 금지) + ROOT equipment_affix_reader 인스턴스.
## meleeRef()/magicRef() 본문(무기·투구 atk/enh/_slotFlatAtk/baseAtk/STATS/_eqStat/_lvB/_weaponSeal)은
## ENGINE 소유 → ref reader Callable 로만 받는다(여기서 재계산·중립값 발명 금지).
##
## status:
##   READY          : 원 식 그대로 계산됨. value 가 NaN/Infinity 일 수 있다(원 undefined 산술) → non_finite=true.
##   NOT_READY      : provider 미바인딩/대상 해제/포트 미지원 shape — value null (0/1/.5/150 위장 금지).
##   SOURCE_THROW   : 바인딩된 실 상태에서 원 JS 가 TypeError 로 중단되는 경우 — value null.
##   READY_PARTIAL_AFTER_SOURCE_THROW : ROOT 어픽스 부분 캐시 — 비권위, value null.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const SLOT_NAMES: Array[String] = [
	"weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants", "belt",
	"necklace", "ring1", "ring2", "cape", "bracelet", "headband", "ossuary", "headband2",
]

## 원 PASSIVE_DEF 키 순서(@28272~28298) — mkP 기본 PASSIVES 판정/진단용(값 생성에 쓰지 않음).
const PASSIVE_DEF_KEYS: Array[String] = [
	"pAtk", "pCharge", "pParry", "pMagic", "pBow", "pGuard", "pRegen", "pCrit", "pDrop", "pPierce",
	"pMRegen", "pXbow", "pMelee", "pCombo", "pAbund", "pPred", "pDot", "pVital", "pStamina", "pMalice",
	"pFortify", "pArmor", "pHunter", "pHuman", "pDemon", "pRage",
]

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_THROW := "SOURCE_THROW"
const READY_PARTIAL := "READY_PARTIAL_AFTER_SOURCE_THROW"

const STAT_STR := 1.0     # 원 statStr() @28654
const STAT_INT := 1.0     # 원 statInt() @28656
const SHIELD_BLOCK := 0.0 # 원 pShieldBlock() @28700

## SKILL CombatQEStatsReader.REQUIRED_STATS 중 이 모듈/ROOT 리더 어느 쪽도 계산하지 않는 field.
const STILL_MISSING_FOR_COMBAT_QE := {
	"q_shield_mp_cost": "P.mp-=10 (@33687) — mana/P.mp sink 는 ENGINE/SKILL; 배율 공식 아님",
}

var _passives_reader: Callable
var _player_reader: Callable
var _inventory_reader: Callable
var _melee_ref_reader: Callable
var _magic_ref_reader: Callable
var _passives_bound := false
var _player_bound := false
var _inventory_bound := false
var _legendary_main: WeakRef
var _legendary_services: WeakRef
var _legendary_state: WeakRef
var _legendary_providers: WeakRef
var _legendary_source_bound := false
var _melee_ref_bound := false
var _magic_ref_bound := false
var _affix_reader: Object = null

var _coerce: AffixReader = AffixReader.new()   # JS ToNumber 전용(인벤토리 미바인딩, 캐시 사용 0)

# ───────────────────────── configure ─────────────────────────

## reader(): 현재 원 PASSIVES Dictionary(참조) 반환.
func configure_passives_reader(reader: Callable) -> bool:
	_passives_bound = reader.is_valid()
	_passives_reader = reader if _passives_bound else Callable()
	return _passives_bound

## reader(): 현재 원 P Dictionary(참조) 반환. 이 모듈은 P._altAtk 만 읽는다.
func configure_player_reader(reader: Callable) -> bool:
	_player_bound = reader.is_valid()
	_player_reader = reader if _player_bound else Callable()
	return _player_bound

## reader(): 현재 INV Dictionary({equipped:{slot:item}}) 반환 — ROOT affix reader 와 같은 INV 이어야 한다.
func configure_inventory_reader(reader: Callable) -> bool:
	_inventory_bound = reader.is_valid()
	_inventory_reader = reader if _inventory_bound else Callable()
	return _inventory_bound

## ROOT equipment_affix_reader/producer.gd 인스턴스(eq_affix/read_combat_qe_subset 소비).
func configure_affix_reader(reader: Object) -> bool:
	if reader == null or not reader.has_method("eq_affix"):
		_affix_reader = null
		return false
	_affix_reader = reader
	return true

## ENGINE 소유 meleeRef()/magicRef() 현재값 reader(number 반환).
func configure_ref_readers(melee_ref: Callable, magic_ref: Callable) -> bool:
	_melee_ref_bound = melee_ref.is_valid()
	_melee_ref_reader = melee_ref if _melee_ref_bound else Callable()
	_magic_ref_bound = magic_ref.is_valid()
	_magic_ref_reader = magic_ref if _magic_ref_bound else Callable()
	return _melee_ref_bound and _magic_ref_bound

# ───────────────────────── result helpers ─────────────────────────

func _ok(value: Variant, source: String, undefined_reads: Array = []) -> Dictionary:
	var finite: bool = not (value is float and (is_nan(value) or is_inf(value)))
	return {"status": READY, "value": value, "non_finite": not finite, "source": source,
		"undefined_reads": undefined_reads, "reason": ""}

func _fail(status: String, reason: String, source: String) -> Dictionary:
	return {"status": status, "value": null, "non_finite": false, "source": source,
		"undefined_reads": [], "reason": reason}

static func _is_fail(r: Dictionary) -> bool:
	return r.status != READY

## Callable 은 대상 Object 를 약참조 → 해제된 대상은 unbound 와 구분해 보고.
func _call_reader(reader: Callable, bound: bool, label: String) -> Dictionary:
	if not bound:
		return {"ok": false, "status": NOT_READY, "reason": label + "_reader_unbound"}
	if not reader.is_valid():
		return {"ok": false, "status": NOT_READY, "reason": label + "_reader_target_freed"}
	return {"ok": true, "value": reader.call()}

## 원 container.key 읽기. null 컨테이너 → TypeError, 미지원 shape → NOT_READY.
func _container(label: String, reader: Callable, bound: bool, first_key: String) -> Dictionary:
	var c: Dictionary = _call_reader(reader, bound, label)
	if not c.ok:
		return c
	var v: Variant = c.value
	if v == null:
		return {"ok": false, "status": SOURCE_THROW,
			"reason": "TypeError: Cannot read properties of null (reading '%s') @%s" % [first_key, label]}
	if not v is Dictionary:
		return {"ok": false, "status": NOT_READY, "reason": label + "_unsupported_shape:" + type_string(typeof(v))}
	return {"ok": true, "value": v}

## PASSIVES.key * k  (undefined → NaN, 원 그대로).
func _passive_mul(passives: Dictionary, key: String, k: float, undef: Array) -> float:
	var present: bool = passives.has(key)
	if not present:
		undef.append("PASSIVES." + key)
	return _coerce.js_to_number(passives.get(key), present) * k

## (PASSIVES.key||0) * k
func _passive_or0_mul(passives: Dictionary, key: String, k: float) -> float:
	var v: Variant = passives.get(key)
	if not AffixReader.js_truthy(v):
		return 0.0 * k
	return _coerce.js_to_number(v, true) * k

## 원 _eqAffix(id). ROOT 상태 그대로 전달; partial/throw 는 비권위(value null).
func _eq_affix(id: String) -> Dictionary:
	var src := "_eqAffix('%s')" % id
	if _affix_reader == null:
		return _fail(NOT_READY, "affix_reader_unbound (ROOT equipment_affix_reader)", src)
	var r: Dictionary = _affix_reader.eq_affix(id)
	var st: String = String(r.get("status", NOT_READY))
	if st != READY:
		return _fail(st, String(r.get("reason", "")), src)
	return _ok(float(r.value), src)

# ───────────────────────── JS value ops (number | String | Dictionary) ─────────────────────────

## JS Number#toString — 포트 범위: NaN/±Infinity/정수값(|x|<1e21). 그 외 null(재현 불가 → NOT_READY).
static func _js_num_str(f: float) -> Variant:
	if is_nan(f):
		return "NaN"
	if is_inf(f):
		return "Infinity" if f > 0 else "-Infinity"
	if f == floor(f) and absf(f) < 1e21:
		return str(int(f))
	return null

static func _js_to_string(v: Variant) -> Variant:
	if v == null:
		return "null"
	if v is bool:
		return "true" if v else "false"
	if v is int or v is float:
		return _js_num_str(float(v))
	if v is String or v is StringName:
		return String(v)
	if v is Dictionary:
		return "[object Object]"
	return null

## JS a + b. 반환 {ok, value} — value 는 float 또는 String. Array/Object 피연산자는 미지원.
func _js_add(a: Variant, b: Variant) -> Dictionary:
	for x in [a, b]:
		if not (x == null or x is bool or x is int or x is float or x is String or x is StringName or x is Dictionary):
			return {"ok": false, "reason": "js_add_unsupported_operand:" + type_string(typeof(x))}
	var a_str: bool = a is String or a is StringName or a is Dictionary
	var b_str: bool = b is String or b is StringName or b is Dictionary
	if a_str or b_str:
		var sa: Variant = _js_to_string(a)
		var sb: Variant = _js_to_string(b)
		if sa == null or sb == null:
			return {"ok": false, "reason": "js_number_tostring_outside_port_range"}
		return {"ok": true, "value": String(sa) + String(sb)}
	return {"ok": true, "value": _js_num(a) + _js_num(b)}

func _js_num(v: Variant) -> float:
	if v is Dictionary:
		return NAN
	return _coerce.js_to_number(v, true)

## JS ToInt32 (~~).
static func js_to_int32(f: float) -> int:
	if is_nan(f) or is_inf(f):
		return 0
	var t: float = floorf(f) if f >= 0.0 else ceilf(f)  # trunc toward 0
	var m: float = fmod(t, 4294967296.0)
	if m < 0.0:
		m += 4294967296.0
	if m >= 2147483648.0:
		m -= 4294967296.0
	return int(m)

## JS Math.min(a, b) — NaN 전파.
static func _js_min(a: float, b: float) -> float:
	if is_nan(a) or is_nan(b):
		return NAN
	return minf(a, b)

# ───────────────────────── INV readers (_uEq / _eqImplicit) ─────────────────────────

## INV.equipped. null INV/equipped → 원 TypeError. 비-Dictionary primitive equipped → 슬롯 전부 undefined.
func _equipped() -> Dictionary:
	var inv: Dictionary = _container("INV", _inventory_reader, _inventory_bound, "equipped")
	if not inv.ok:
		return inv
	var d: Dictionary = inv.value
	var e: Variant = d.get("equipped")
	if e == null:
		var what: String = "undefined" if not d.has("equipped") else "null"
		return {"ok": false, "status": SOURCE_THROW,
			"reason": "TypeError: Cannot read properties of %s (reading '%s') @INV.equipped" % [what, SLOT_NAMES[0]]}
	if e is Dictionary:
		return {"ok": true, "value": e}
	if e is bool or e is int or e is float or e is String or e is StringName or e is Array:
		return {"ok": true, "value": {}}
	return {"ok": false, "status": NOT_READY, "reason": "INV.equipped_unsupported_shape:" + type_string(typeof(e))}

## 원 _uEq(stat): SLOT_NAMES 순서 첫 truthy it[stat] 의 raw 값, 없으면 0.
func u_eq(stat: String) -> Dictionary:
	var src := "_uEq('%s')" % stat
	var eq: Dictionary = _equipped()
	if not eq.ok:
		return _fail(eq.status, eq.reason, src)
	var equipped: Dictionary = eq.value
	for slot in SLOT_NAMES:
		var it: Variant = equipped.get(slot)
		if not AffixReader.js_truthy(it):
			continue
		if it is Object:
			return _fail(NOT_READY, "item_unsupported_shape:Object@" + slot, src)
		if it is Dictionary and AffixReader.js_truthy(it.get(stat)):
			var r: Dictionary = _ok(it[stat], src)
			r["slot"] = slot
			return r
	var z: Dictionary = _ok(0, src)
	z["slot"] = ""
	return z

## 원 _eqImplicit(stat): 엄격 일치 _implicitStat 의 (+_implicitVal||0) 합 (SLOT_NAMES 순서 누적).
func eq_implicit(stat: String) -> Dictionary:
	var src := "_eqImplicit('%s')" % stat
	var eq: Dictionary = _equipped()
	if not eq.ok:
		return _fail(eq.status, eq.reason, src)
	var equipped: Dictionary = eq.value
	var v := 0.0
	for slot in SLOT_NAMES:
		var it: Variant = equipped.get(slot)
		if not AffixReader.js_truthy(it):
			continue
		if it is Object:
			return _fail(NOT_READY, "item_unsupported_shape:Object@" + slot, src)
		if not it is Dictionary:
			continue
		var st: Variant = it.get("_implicitStat")
		if not ((st is String or st is StringName) and String(st) == stat):
			continue
		var n: float = _coerce.js_to_number(it.get("_implicitVal"), it.has("_implicitVal"))
		v += n if AffixReader.js_truthy(n) else 0.0
	return _ok(v, src)

# ───────────────────────── 원 공식 ─────────────────────────

## 원 _passDmgSum(type). 이 포트는 'melee'/'magic' 분기만 소비(공통 pAtk/pHuman 항 포함).
func pass_dmg_sum(type: String) -> Dictionary:
	var src := "_passDmgSum('%s')" % type
	if type != "melee" and type != "magic":
		return _fail(NOT_READY, "type_not_ported:" + type, src)
	var undef: Array = []
	var pc: Dictionary = _container("PASSIVES", _passives_reader, _passives_bound, "pAtk")
	if not pc.ok:
		return _fail(pc.status, pc.reason, src)
	var passives: Dictionary = pc.value
	# s+=PASSIVES.pAtk*.10+(P._altAtk||0)
	var a: float = _passive_mul(passives, "pAtk", 0.10, undef)
	var plc: Dictionary = _container("P", _player_reader, _player_bound, "_altAtk")
	if not plc.ok:
		return _fail(plc.status, plc.reason, src)
	var alt: Variant = plc.value.get("_altAtk")
	if not AffixReader.js_truthy(alt):
		alt = 0
	var t: Dictionary = _js_add(a, alt)
	if not t.ok:
		return _fail(NOT_READY, t.reason + " @PASSIVES.pAtk*.10+(P._altAtk||0)", src)
	var s: Dictionary = _js_add(0, t.value)
	if not s.ok:
		return _fail(NOT_READY, s.reason, src)
	# s+=(PASSIVES.pHuman||0)*.05
	s = _js_add(s.value, _passive_or0_mul(passives, "pHuman", 0.05))
	if not s.ok:
		return _fail(NOT_READY, s.reason, src)
	if type == "melee":
		s = _js_add(s.value, _passive_or0_mul(passives, "pMelee", 0.15))
	else:
		# s+=PASSIVES.pMagic*.10+_eqAffix('magicDmg')+_eqImplicit('_iMagDmg')*.01  (좌결합, 호출 순서 보존)
		var m: float = _passive_mul(passives, "pMagic", 0.10, undef)
		var af: Dictionary = _eq_affix("magicDmg")
		if _is_fail(af):
			return _fail(af.status, af.reason + " @_eqAffix('magicDmg')", src)
		var im: Dictionary = eq_implicit("_iMagDmg")
		if _is_fail(im):
			return _fail(im.status, im.reason + " @_eqImplicit('_iMagDmg')", src)
		s = _js_add(s.value, (m + float(af.value)) + float(im.value) * 0.01)
	if not s.ok:
		return _fail(NOT_READY, s.reason, src)
	var one_plus: Dictionary = _js_add(1, s.value)
	if not one_plus.ok:
		return _fail(NOT_READY, one_plus.reason, src)
	var r: Dictionary = _ok(_js_num(one_plus.value) * 0.7, src, undef)
	r["string_concat"] = s.value is String
	return r

## 원 pAtkMul() = _passDmgSum('melee').
func p_atk_mul() -> Dictionary:
	var r: Dictionary = pass_dmg_sum("melee")
	r.source = "pAtkMul()=" + r.source
	return r

## 원 pParryDmg() = 1+PASSIVES.pParry*.50.
func p_parry_dmg() -> Dictionary:
	var src := "pParryDmg()"
	var pc: Dictionary = _container("PASSIVES", _passives_reader, _passives_bound, "pParry")
	if not pc.ok:
		return _fail(pc.status, pc.reason, src)
	var undef: Array = []
	return _ok(1.0 + _passive_mul(pc.value, "pParry", 0.50, undef), src, undef)

## 원 pMagicMul(forAttack=true) = _passDmgSum('magic')*(1+(_uEq('_uHelmMagic')||0))*(forAttack?2:1).
func p_magic_mul(for_attack: bool = true) -> Dictionary:
	var src := "pMagicMul(%s)" % ("true" if for_attack else "false")
	var sum: Dictionary = pass_dmg_sum("magic")
	if _is_fail(sum):
		return _fail(sum.status, sum.reason, src)
	var u: Dictionary = u_eq("_uHelmMagic")
	if _is_fail(u):
		return _fail(u.status, u.reason + " @_uEq('_uHelmMagic')", src)
	var uv: Variant = u.value if AffixReader.js_truthy(u.value) else 0
	var op: Dictionary = _js_add(1, uv)
	if not op.ok:
		return _fail(NOT_READY, op.reason + " @1+(_uEq('_uHelmMagic')||0)", src)
	var r: Dictionary = _ok(float(sum.value) * _js_num(op.value) * (2.0 if for_attack else 1.0), src, sum.undefined_reads)
	r["u_helm_magic_slot"] = u.slot
	return r

## 원 pShieldBlock() = 0 (removed passive pShield 원 상수 — neutral fallback 아님).
func p_shield_block() -> Dictionary:
	return _ok(SHIELD_BLOCK, "pShieldBlock()=0 removed passive pShield @28700")

## 원 pGuardAbsorb() = Math.min(.50,.30+PASSIVES.pGuard*.02+_eqAffix('shieldBlockDR')).
func p_guard_absorb() -> Dictionary:
	var src := "pGuardAbsorb()"
	var pc: Dictionary = _container("PASSIVES", _passives_reader, _passives_bound, "pGuard")
	if not pc.ok:
		return _fail(pc.status, pc.reason, src)
	var undef: Array = []
	var g: float = 0.30 + _passive_mul(pc.value, "pGuard", 0.02, undef)
	var af: Dictionary = _eq_affix("shieldBlockDR")
	if _is_fail(af):
		return _fail(af.status, af.reason + " @_eqAffix('shieldBlockDR')", src)
	var r: Dictionary = _ok(_js_min(0.50, g + float(af.value)), src, undef)
	r["uncapped"] = g + float(af.value)
	return r

## sBlock _blkBase 의 비-dot 항 = pGuardAbsorb()+pShieldBlock() (평가 순서 보존).
func block_base() -> Dictionary:
	var src := "pGuardAbsorb()+pShieldBlock()"
	var ga: Dictionary = p_guard_absorb()
	if _is_fail(ga):
		return _fail(ga.status, ga.reason, src)
	var sb: Dictionary = p_shield_block()
	return _ok(float(ga.value) + float(sb.value), src, ga.undefined_reads)

func _ref(is_magic: bool) -> Dictionary:
	var label := "magicRef" if is_magic else "meleeRef"
	var c: Dictionary = _call_reader(_magic_ref_reader if is_magic else _melee_ref_reader,
		_magic_ref_bound if is_magic else _melee_ref_bound, label)
	if not c.ok:
		return _fail(c.status, c.reason + " (ENGINE %s())" % label, label + "()")
	if not (c.value is int or c.value is float):
		return _fail(NOT_READY, label + "_unsupported_shape:" + type_string(typeof(c.value)), label + "()")
	return _ok(float(c.value), label + "()")

## 원 pParryProjDmg scale: isQ ? magicRef()*statInt()*pMagicMul(false) : meleeRef()*statStr()*pAtkMul().
func parry_scale(is_q: bool) -> Dictionary:
	var src := "magicRef()*statInt()*pMagicMul(false)" if is_q else "meleeRef()*statStr()*pAtkMul()"
	var ref: Dictionary = _ref(is_q)
	if _is_fail(ref):
		return _fail(ref.status, ref.reason, src)
	var mul: Dictionary = p_magic_mul(false) if is_q else p_atk_mul()
	if _is_fail(mul):
		return _fail(mul.status, mul.reason, src)
	return _ok(float(ref.value) * (STAT_INT if is_q else STAT_STR) * float(mul.value), src, mul.undefined_reads)

## 원 _kiFloor = ~~(meleeRef()*14*statStr()*pAtkMul()).
func ki_floor() -> Dictionary:
	var src := "~~(meleeRef()*14*statStr()*pAtkMul())"
	var ref: Dictionary = _ref(false)
	if _is_fail(ref):
		return _fail(ref.status, ref.reason, src)
	var mul: Dictionary = p_atk_mul()
	if _is_fail(mul):
		return _fail(mul.status, mul.reason, src)
	var raw: float = float(ref.value) * 14.0 * STAT_STR * float(mul.value)
	var r: Dictionary = _ok(js_to_int32(raw), src, mul.undefined_reads)
	r["non_finite"] = is_nan(raw) or is_inf(raw)
	return r

# ───────────────────────── SKILL combat_qe subset ─────────────────────────

## CombatQEStatsReader.REQUIRED_STATS 키 이름으로 계산값/미준비를 분리 반환. QE field 쓰기 0.
##   is_q: 이번 패링 이벤트의 원 isQ 인자(원 호출부: Q/sBlock true, E false, _sbPW 분기) — parry_scale 선택.
##   non_finite(원 NaN/Infinity) 값은 provided 에 넣지 않는다(포트 소비자 minf/int 가 NaN 비충실).
func read_combat_qe_subset(is_q: bool) -> Dictionary:
	var detail := {
		"block_base": block_base(),
		"parry_dmg_mul": p_parry_dmg(),
		"p_atk_mul": p_atk_mul(),
		"parry_scale": parry_scale(is_q),
		"ki_floor": ki_floor(),
	}
	var provided := {}
	var not_ready := {}
	for k in detail:
		var r: Dictionary = detail[k]
		if r.status != READY:
			not_ready[k] = "%s %s: %s" % [r.source, r.status, r.reason]
		elif r.non_finite:
			not_ready[k] = "%s source_value_non_finite (undefined_reads=%s)" % [r.source, str(r.undefined_reads)]
		else:
			provided[k] = r.value
	var root_sub: Variant = null
	if _affix_reader != null and _affix_reader.has_method("read_combat_qe_subset"):
		root_sub = _affix_reader.read_combat_qe_subset()
		for k in root_sub.provided:
			provided[k] = root_sub.provided[k]
		for k in root_sub.not_ready:
			not_ready[k] = root_sub.not_ready[k]
	else:
		for k in ["shield_cd_red", "parry_bonus", "leg_shield_parry"]:
			not_ready[k] = "ROOT equipment_affix_reader unbound"
	var required_missing: Array = []
	for k in ["shield_cd_red", "block_base", "q_shield_mp_cost", "parry_bonus", "parry_dmg_mul",
			"leg_shield_parry", "parry_scale", "p_atk_mul"]:
		if not provided.has(k):
			required_missing.append(k)
	return {
		"is_q": is_q,
		"provided": provided,
		"not_ready": not_ready,
		"still_missing": STILL_MISSING_FOR_COMBAT_QE.duplicate(),
		"required_missing": required_missing,
		"all_required_ready": required_missing.is_empty(),
		"detail": detail,
		"root_subset": root_sub,
	}


# Original statStr declaration, independent of P/INV/PASSIVES reader state.
func stat_str() -> Dictionary:
	return _ok(STAT_STR, "statStr()=STAT_STR@game.html:28654")


# Metadata only: no current PASSIVES query or configuration.
func is_passives_reader_bound_to(expected: Callable) -> bool:
	return _passives_bound and expected.is_valid() and _passives_reader.is_valid() \
		and _passives_reader == expected \
		and _passives_reader.get_object() == expected.get_object() \
		and _passives_reader.get_method() == expected.get_method()

# Original pDotPool() @game.html:28068; field ||0 is not an owner fallback.
func p_dot_pool() -> Dictionary:
	var source: String = "pDotPool()=1+(PASSIVES.pDot||0)*.05@game.html:28068"
	var passives: Dictionary = _container("PASSIVES", _passives_reader, _passives_bound, "pDot")
	if not passives.ok:
		return _fail(passives.status, passives.reason, source)
	return _ok(1.0 + _passive_or0_mul(passives.value, "pDot", 0.05), source)

# Weak bindings only. Main owns the script-context cache and its partial prefix.
func configure_main_legendary_source(main: Node, services: RefCounted,
		state: Node, providers: RefCounted) -> bool:
	if not is_instance_valid(main) or not main.can_bind_native_source_legendary_formula(self, services, state, providers):
		return false
	if _legendary_source_bound and (_legendary_main == null or _legendary_main.get_ref() != main):
		return false
	_legendary_main = weakref(main)
	_legendary_services = weakref(services)
	_legendary_state = weakref(state)
	_legendary_providers = weakref(providers)
	_legendary_source_bound = true
	return true

func is_main_legendary_source_bound_to(main: Node, services: RefCounted,
		state: Node, providers: RefCounted) -> bool:
	return _legendary_source_bound and _legendary_main != null and _legendary_main.get_ref() == main \
		and _legendary_services != null and _legendary_services.get_ref() == services \
		and _legendary_state != null and _legendary_state.get_ref() == state \
		and _legendary_providers != null and _legendary_providers.get_ref() == providers

func l_eq(stat: Variant) -> Dictionary:
	var main: Variant = _legendary_main.get_ref() if _legendary_main != null else null
	var services: Variant = _legendary_services.get_ref() if _legendary_services != null else null
	var state: Variant = _legendary_state.get_ref() if _legendary_state != null else null
	var providers: Variant = _legendary_providers.get_ref() if _legendary_providers != null else null
	if not _legendary_source_bound or not is_instance_valid(main) or not is_instance_valid(services) \
			or not is_instance_valid(state) or not is_instance_valid(providers):
		return {"status":"NOT_READY","reason":"legendary_bound_owner_lost","source":"_lEq@game.html:16620"}
	return main.read_native_source_legendary_equipment(stat, self, services, state, providers)

func _native_source_element_formula_not_ready(reason: String, a: Variant, d: Variant,
		read_result: Variant = null) -> Dictionary:
	var packet: Dictionary = {"status": "NOT_READY", "reason": reason, "raw_arguments": {"a": a, "d": d}}
	if read_result != null: packet["read_result"] = read_result
	return packet

func _native_source_element_refs_current(main: Variant, services: Variant,
		state: Variant, providers: Variant) -> bool:
	if not _legendary_source_bound or not main is Node or not services is RefCounted \
			or not state is Node or not providers is RefCounted: return false
	for reference in [_legendary_main, _legendary_services, _legendary_state, _legendary_providers]:
		if not is_instance_valid(reference): return false
	if not is_same(_legendary_main.get_ref(), main) or not is_same(_legendary_services.get_ref(), services) \
			or not is_same(_legendary_state.get_ref(), state) or not is_same(_legendary_providers.get_ref(), providers):
		return false
	return main.is_native_source_element_context_current(self, services, state, providers)

func el_mul(a: Variant, d: Variant) -> Dictionary:
	var main: Variant = _legendary_main.get_ref() if is_instance_valid(_legendary_main) else null
	var services: Variant = _legendary_services.get_ref() if is_instance_valid(_legendary_services) else null
	var state: Variant = _legendary_state.get_ref() if is_instance_valid(_legendary_state) else null
	var providers: Variant = _legendary_providers.get_ref() if is_instance_valid(_legendary_providers) else null
	if not _native_source_element_refs_current(main, services, state, providers):
		return _native_source_element_formula_not_ready("element_formula_owner_not_current", a, d)
	var result: Variant = main.read_native_source_element_multiplier(a, d, self, services, state, providers)
	if not _native_source_element_refs_current(main, services, state, providers):
		return _native_source_element_formula_not_ready("element_formula_owner_changed_after_read", a, d, result)
	if not result is Dictionary or result.get("status") not in ["READY", "NOT_READY"]:
		return _native_source_element_formula_not_ready("element_owner_result_malformed", a, d, result)
	if result.get("status") == "READY" and (not result.has("value") or typeof(result["value"]) != TYPE_FLOAT):
		return _native_source_element_formula_not_ready("element_owner_value_malformed", a, d, result)
	return result
