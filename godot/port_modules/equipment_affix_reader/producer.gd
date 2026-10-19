extends RefCounted
##
## equipment_affix_reader/producer.gd — 원 _eqAffix 장비 어픽스 합산 + sh()._lShieldParry 전설 방패 리더.
## TASK GODOT-PORT-EQUIPMENT-AFFIX-READER-FIRST-20261013.
##
## 원 R(canonical game.html, 읽기전용):
##   SLOT_NAMES (@15843) = weapon,shield,boots,armor,helmet,bow,gloves,pants,belt,necklace,ring1,ring2,
##                         cape,bracelet,headband,ossuary,headband2
##   _eqAffixRebuild (@28631):
##     _eqAffixCache={};for(si<SLOT_NAMES.length){const it=INV.equipped[SLOT_NAMES[si]];
##       if(it&&it.affixes)for(i<it.affixes.length){const a=it.affixes[i];
##         _eqAffixCache[a.id]=(_eqAffixCache[a.id]||0)+(+a.value||0)}}
##   _eqAffix(id) (@28632): if(!_eqAffixCache)_eqAffixRebuild();return _eqAffixCache[id]||0
##   sh() (@17021): return INV.equipped.shield||{}            — 캐시 없음, 매 호출 live
##   pParryProjDmg (@28684): _legSP=(sh()._lShieldParry||0)>0?sh()._lShieldParry:1
##   _sbCd (@15041/@34176/@34207/@34278/@34428): ~~(30*(1+_eqAffix('shieldCdRed')))
##   캐시 무효화(_eqAffixCache=null) 원 지점: _refreshEquipmentStats(@16798; equipItem/unequipItem 후),
##     recalcSt(@16934), _testAffix/_testAffixClear(@28644/@28649, 콘솔 디버그), _inventoryEquipCP(@49833,
##     try/finally 로 원 캐시 객체 복원 @49836). 선구축: @51770 if(!_eqAffixCache)_eqAffixRebuild().
##
## 이 모듈은 아이템/어픽스/RNG 생성 0, 중립 스탯 발명 0. 현재 인벤토리를 반환하는 Callable 만 읽는다.
## 캐시 무효화는 스스로 추정하지 않는다 — 원 무효화 지점은 ENGINE/ITEM 이 invalidate_affix_cache() 로 호출.
## 공유 Player/world/driver/input/save 변이 0. sync_combat_qe_player() 만 SKILL 주입점 3개를 쓴다.

const SLOT_NAMES: Array[String] = [
	"weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants", "belt",
	"necklace", "ring1", "ring2", "cape", "bracelet", "headband", "ossuary", "headband2",
]

## 숫자 id 키 변환 안전 범위 (Number.MAX_SAFE_INTEGER = 2^53-1). 원 카탈로그 id 는 문자열이며 숫자 id 는 비정규.
const JS_SAFE_INTEGER_MAX: int = 9007199254740991

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_THROW := "SOURCE_THROW"                         # 원 rebuild 가 TypeError 로 중단된 호출
const READY_PARTIAL := "READY_PARTIAL_AFTER_SOURCE_THROW"    # 원: throw 후 부분 {} 캐시가 남아 반환됨

## SKILL CombatQEStatsReader.MISSING_API 중 이 모듈이 공급하지 않는 field (여전히 gap).
const STILL_MISSING_FOR_COMBAT_QE: Array[String] = [
	"block_base", "q_shield_mp_cost", "parry_dmg_mul", "parry_scale", "p_atk_mul",
]

var _inventory_reader: Callable
var _cache: Variant = null          # 원 _eqAffixCache (null = 미구축)
var _cache_partial: bool = false    # 원 throw 후 부분 캐시 여부
var _last_throw: String = ""

var _re_dec := RegEx.new()
var _re_hex := RegEx.new()
var _re_bin := RegEx.new()
var _re_oct := RegEx.new()

func _init() -> void:
	_re_dec.compile("^[+-]?([0-9]+\\.?[0-9]*|\\.[0-9]+)([eE][+-]?[0-9]+)?$")   # ASCII 숫자만 (JS StrDecimalLiteral)
	_re_hex.compile("^0[xX][0-9a-fA-F]+$")
	_re_bin.compile("^0[bB][01]+$")
	_re_oct.compile("^0[oO][0-7]+$")

# ───────────────────────── configure / authority ─────────────────────────

## reader(): 현재 INV Dictionary({equipped:{slot:item|null}, ...}) 를 반환. 스냅샷 금지 — 호출 시점의 실 INV.
## 새 authority 바인딩은 원 초기 상태(_eqAffixCache=null)로 시작한다.
## invalid Callable → false 반환, 기존 reader/캐시는 그대로 유지(해제 아님). 해제는 clear_inventory_reader().
func configure_inventory_reader(reader: Callable) -> bool:
	if not reader.is_valid():
		return false
	_inventory_reader = reader
	_reset_cache()
	return true

func configure(inventory_reader: Callable) -> bool:
	return configure_inventory_reader(inventory_reader)

func clear_inventory_reader() -> void:
	_inventory_reader = Callable()
	_reset_cache()

func is_configured() -> bool:
	return _inventory_reader.is_valid()

func _reset_cache() -> void:
	_cache = null
	_cache_partial = false
	_last_throw = ""

## 현재 INV.equipped 읽기(읽기전용). 원은 INV/INV.equipped 부재 시 TypeError → 여기선 exact NOT_READY.
func _current_equipped() -> Dictionary:
	if not _inventory_reader.is_valid():
		return {"ok": false, "reason": "inventory_reader_unbound"}
	var inv: Variant = _inventory_reader.call()
	if inv == null:
		return {"ok": false, "reason": "inventory_null"}
	if not inv is Dictionary:
		return {"ok": false, "reason": "inventory_not_dictionary"}
	if not inv.has("equipped") or inv.get("equipped") == null:
		return {"ok": false, "reason": "equipped_missing"}
	var equipped: Variant = inv.get("equipped")
	if not equipped is Dictionary:
		return {"ok": false, "reason": "equipped_not_dictionary"}
	return {"ok": true, "equipped": equipped}

# ───────────────────────── cache seams (원 무효화 지점에 ENGINE 이 연결) ─────────────────────────

## 원 `_eqAffixCache=null`. 호출 지점: equip/unequip 후 _refreshEquipmentStats, recalcSt, CP preview.
func invalidate_affix_cache() -> void:
	_reset_cache()

func is_affix_cache_built() -> bool:
	return _cache != null

## 원 @51770 `if(!_eqAffixCache)_eqAffixRebuild()`.
func ensure_affix_cache_built() -> Dictionary:
	if _cache != null:
		return {"status": READY_PARTIAL if _cache_partial else READY, "rebuilt": false}
	var r: Dictionary = rebuild_affix_cache()
	r["rebuilt"] = r.status == READY
	return r

## 원 _inventoryEquipCP 의 `const _affixCache=_eqAffixCache` … finally `_eqAffixCache=_affixCache`.
## 토큰은 캐시 객체 identity 를 그대로 보관(복사 아님).
func capture_affix_cache_token() -> Dictionary:
	return {"cache": _cache, "partial": _cache_partial, "last_throw": _last_throw}

func restore_affix_cache_token(token: Dictionary) -> void:
	_cache = token.get("cache")
	_cache_partial = bool(token.get("partial", false))
	_last_throw = String(token.get("last_throw", ""))

## 진단용 복사본(원 캐시 수정 불가).
func affix_cache_snapshot() -> Variant:
	return _cache.duplicate() if _cache is Dictionary else null

# ───────────────────────── _eqAffixRebuild / _eqAffix ─────────────────────────

## 원 _eqAffixRebuild. SLOT_NAMES 순서 순회(INV.equipped 의 키 삽입 순서 아님) → float 누적 순서 보존.
func rebuild_affix_cache() -> Dictionary:
	var src: Dictionary = _current_equipped()
	if not src.ok:
		_reset_cache()
		return {"status": NOT_READY, "reason": src.reason}
	var equipped: Dictionary = src.equipped
	var built: Dictionary = {}           # 원 _eqAffixCache={} (throw 시 이 부분 객체가 그대로 남음)
	var slot_count := 0
	for si in range(SLOT_NAMES.size()):
		var slot: String = SLOT_NAMES[si]
		if not equipped.has(slot):
			continue                     # undefined → falsy
		var it: Variant = equipped[slot]
		if not js_truthy(it) or not it is Dictionary:
			continue                     # primitive/Array 의 .affixes = undefined
		slot_count += 1
		if not it.has("affixes"):
			continue
		var affixes: Variant = it.get("affixes")
		if not js_truthy(affixes):
			continue
		var err: String = _accumulate_affixes(built, affixes, slot)
		if err.begins_with("TypeError"):
			_cache = built
			_cache_partial = true
			_last_throw = err
			return {"status": SOURCE_THROW, "reason": err}
		if err != "":
			_reset_cache()               # 포트 미지원 shape: 원 동작 단정 불가 → 캐시 보류
			return {"status": NOT_READY, "reason": err}
	_cache = built
	_cache_partial = false
	_last_throw = ""
	return {"status": READY, "reason": "", "truthy_item_slots": slot_count}

## for(i<it.affixes.length){const a=it.affixes[i]; cache[a.id]=(cache[a.id]||0)+(+a.value||0)}
func _accumulate_affixes(built: Dictionary, affixes: Variant, slot: String) -> String:
	var elements: Array = []
	if affixes is Array:
		elements = affixes
	elif affixes is String or affixes is StringName:
		for ch in String(affixes):
			elements.append(ch)          # "ab"[i] → 1문자 string; .id/.value = undefined
	elif affixes is Dictionary:
		if affixes.has("length"):
			return "unsupported_affixes_shape:object_with_length@" + slot
		return ""                        # {}.length undefined → 0회 순회
	elif affixes is bool or affixes is int or affixes is float:
		return ""                        # number/true .length undefined → 0회 순회
	else:
		return "unsupported_affixes_shape:" + type_string(typeof(affixes)) + "@" + slot
	for i in range(elements.size()):
		var a: Variant = elements[i]
		if a == null:
			return "TypeError: Cannot read properties of null (reading 'id') @%s.affixes[%d]" % [slot, i]
		var key: Variant
		var value_present := false
		var value: Variant = null
		if a is Dictionary:
			key = js_property_key(a.get("id"), a.has("id"))
			value_present = a.has("value")
			value = a.get("value")
		else:
			key = "undefined"
		if key == null:
			return "unsupported_affix_id_shape@%s.affixes[%d]" % [slot, i]
		var prev: Variant = built.get(key, null)
		var base: float = float(prev) if js_truthy(prev) else 0.0
		var add: float = js_to_number(value, value_present)
		if not js_truthy(add):
			add = 0.0
		built[key] = base + add
	return ""

## 원 _eqAffix(id). 반환 {status, id, value, origin}.
##   READY + origin "sum"         : 캐시에 키 존재, 그 합(0/NaN 이면 ||0 → 0)
##   READY + origin "absent_zero" : 유효 장비 소스에 해당 id 없음 → 원 ||0
##   NOT_READY                    : 인벤토리/장비 provider 부재 — value null (0 으로 위장 금지)
func eq_affix(id: Variant) -> Dictionary:
	if not _inventory_reader.is_valid():
		return {"status": NOT_READY, "id": id, "value": null, "reason": "inventory_reader_unbound"}
	var key: Variant = js_property_key(id, true)
	if key == null:
		return {"status": NOT_READY, "id": id, "value": null, "reason": "unsupported_query_id_shape"}
	if _cache == null:
		var r: Dictionary = rebuild_affix_cache()
		if r.status != READY:
			return {"status": r.status, "id": key, "value": null, "reason": r.reason}
	var v: Variant = _cache.get(key, null)
	var out: float = float(v) if js_truthy(v) else 0.0
	return {
		"status": READY_PARTIAL if _cache_partial else READY,
		"id": key,
		"value": out,
		"origin": "sum" if _cache.has(key) else "absent_zero",
		"reason": _last_throw if _cache_partial else "",
	}

# ───────────────────────── sh() / _lShieldParry ─────────────────────────

## 원 sh(): INV.equipped.shield||{}. 캐시 없음. truthy 면 원 Dictionary identity 그대로 반환.
func read_shield() -> Dictionary:
	var src: Dictionary = _current_equipped()
	if not src.ok:
		return {"status": NOT_READY, "shield": null, "fallback_empty": false, "reason": src.reason}
	var equipped: Dictionary = src.equipped
	var s: Variant = equipped.get("shield") if equipped.has("shield") else null
	if js_truthy(s):
		return {"status": READY, "shield": s, "fallback_empty": false, "reason": ""}
	return {"status": READY, "shield": {}, "fallback_empty": true, "reason": ""}   # 원 ||{} (매 호출 새 객체)

## 원 _legSP=(sh()._lShieldParry||0)>0?sh()._lShieldParry:1 (곱셈에서 ToNumber).
## legendarySpecial{stat:'_lShieldParry',val:2} 레코드는 원 리더가 읽지 않는다 → 값에 반영 0(진단 flag 만).
func leg_shield_parry() -> Dictionary:
	var r: Dictionary = read_shield()
	if r.status != READY:
		return {"status": NOT_READY, "value": null, "applied": false, "reason": r.reason}
	var s: Variant = r.shield
	var present: bool = s is Dictionary and s.has("_lShieldParry")
	var raw: Variant = s.get("_lShieldParry") if present else null
	var lhs_n: float = js_to_number(raw, present) if (present and js_truthy(raw)) else 0.0
	var applied: bool = lhs_n > 0.0                       # NaN > 0 = false
	var declared := false
	if s is Dictionary and s.get("legendarySpecial") is Dictionary:
		declared = s.legendarySpecial.get("stat") == "_lShieldParry"
	return {
		"status": READY,
		"value": lhs_n if applied else 1.0,
		"applied": applied,
		"raw": raw,
		"raw_present": present,
		"shield_fallback_empty": r.fallback_empty,
		"legendary_special_declared": declared,
		"reason": "",
	}

# ───────────────────────── SKILL combat_qe subset adapter ─────────────────────────

## CombatQEStatsReader.MISSING_API 키 이름 그대로. provided 는 READY 값만, not_ready 는 exact 사유.
func read_combat_qe_subset() -> Dictionary:
	var cd: Dictionary = eq_affix("shieldCdRed")
	var pb: Dictionary = eq_affix("parryBonus")
	var leg: Dictionary = leg_shield_parry()
	var provided := {}
	var not_ready := {}
	for pair in [["shield_cd_red", cd, "_eqAffix('shieldCdRed')"], ["parry_bonus", pb, "_eqAffix('parryBonus')"], ["leg_shield_parry", leg, "sh()._lShieldParry"]]:
		var res: Dictionary = pair[1]
		if res.status == READY:
			provided[pair[0]] = res.value
		else:
			not_ready[pair[0]] = "%s %s: %s" % [pair[2], res.status, res.get("reason", "")]
	return {
		"status": READY if not_ready.is_empty() else NOT_READY,
		"provided": provided,
		"not_ready": not_ready,
		"still_missing": STILL_MISSING_FOR_COMBAT_QE.duplicate(),
		"detail": {"shield_cd_red": cd, "parry_bonus": pb, "leg_shield_parry": leg},
	}

## SKILL NativePlayer 주입점(shield_cd_red/parry_bonus/leg_shield_parry) 에 all-or-nothing 기록.
## 원은 Q press/패링 시점에 live 조회 → ENGINE 은 소비 명령 직전에 호출해야 한다.
## NOT_READY/partial 이면 아무것도 쓰지 않는다(기존 @export 중립값을 제품값으로 승격하지 않음).
func sync_combat_qe_player(player: Object) -> Dictionary:
	var sub: Dictionary = read_combat_qe_subset()
	if sub.status != READY:
		return {"status": NOT_READY, "written": {}, "not_ready": sub.not_ready, "still_missing": sub.still_missing}
	for field in ["shield_cd_red", "parry_bonus", "leg_shield_parry"]:
		if player == null or not (field in player):
			return {"status": NOT_READY, "written": {}, "not_ready": {field: "consumer_field_absent"}, "still_missing": sub.still_missing}
	for field in ["shield_cd_red", "parry_bonus", "leg_shield_parry"]:
		player.set(field, sub.provided[field])
	return {"status": READY, "written": sub.provided, "not_ready": {}, "still_missing": sub.still_missing}

# ───────────────────────── JS coercion helpers ─────────────────────────

## JS ToBoolean.
static func js_truthy(v: Variant) -> bool:
	if v == null:
		return false
	if v is bool:
		return v
	if v is int:
		return v != 0
	if v is float:
		return not (v == 0.0 or is_nan(v))
	if v is String or v is StringName:
		return not String(v).is_empty()
	return true                          # Object/Array/Dictionary (빈 것 포함) = truthy

## JS 프로퍼티 키 ToString. present=false → "undefined". 미지원 shape → null.
static func js_property_key(v: Variant, present: bool) -> Variant:
	if not present:
		return "undefined"
	if v == null:
		return "null"
	if v is String or v is StringName:
		return String(v)
	if v is bool:
		return "true" if v else "false"
	if v is int:
		if absi(v) > JS_SAFE_INTEGER_MAX:
			return null                  # JS Number 로 정확히 표현 불가 → 키 날조 금지
		return str(v)
	if v is float:
		if is_nan(v):
			return "NaN"
		if is_inf(v):
			return "Infinity" if v > 0 else "-Infinity"
		if v == floor(v) and absf(v) <= float(JS_SAFE_INTEGER_MAX):
			return str(int(v))           # -0.0 → "0" (JS 동일)
		return null                      # 비정수 / 2^53 초과 정수 float: JS Number#toString 재현 범위 밖
	return null

## JS ToNumber (unary +). present=false → NaN(undefined).
func js_to_number(v: Variant, present: bool) -> float:
	if not present:
		return NAN
	if v == null:
		return 0.0
	if v is bool:
		return 1.0 if v else 0.0
	if v is int or v is float:
		return float(v)
	if v is String or v is StringName:
		return _str_to_number(String(v))
	if v is Array:
		if v.is_empty():
			return 0.0                   # [] → "" → 0
		if v.size() > 1:
			return NAN                   # "a,b" → NaN
		var el: Variant = v[0]
		if el == null:
			return 0.0
		if el is Array or el is String or el is StringName:
			return js_to_number(el, true)
		if el is int or el is float:
			return float(el)
		return NAN                       # "true" / "[object Object]"
	return NAN

## ECMAScript StringToNumber 의 trim 대상: WhiteSpace(TAB,VT,FF,SP,NBSP,ZWNBSP/BOM,Zs) + LineTerminator(LF,CR,LS,PS).
## Godot strip_edges() 는 이 집합과 다름 → 전용 helper.
static func is_js_whitespace(c: int) -> bool:
	return (c >= 0x09 and c <= 0x0D) or c == 0x20 or c == 0xA0 or c == 0x1680 \
		or (c >= 0x2000 and c <= 0x200A) or c == 0x2028 or c == 0x2029 \
		or c == 0x202F or c == 0x205F or c == 0x3000 or c == 0xFEFF

static func js_trim(s: String) -> String:
	var a := 0
	var b := s.length()
	while a < b and is_js_whitespace(s.unicode_at(a)):
		a += 1
	while b > a and is_js_whitespace(s.unicode_at(b - 1)):
		b -= 1
	return s.substr(a, b - a)

func _str_to_number(s: String) -> float:
	var t := js_trim(s)
	if t.is_empty():
		return 0.0
	if t == "Infinity" or t == "+Infinity":
		return INF
	if t == "-Infinity":
		return -INF
	if _re_dec.search(t) != null:
		return t.to_float()
	if _re_hex.search(t) != null:
		return float(t.hex_to_int())
	if _re_bin.search(t) != null:
		return float(t.bin_to_int())
	if _re_oct.search(t) != null:
		var n := 0
		for ch in t.substr(2):
			n = n * 8 + ch.to_int()
		return float(n)
	return NAN
