extends RefCounted
##
## combat_reference_source/producer.gd — 원 meleeRef()/magicRef() 현재 참조값 provider.
## TASK GODOT-PORT-COMBAT-REFERENCE-SOURCE-FIRST-20261013.
##
## 원 R(canonical game.html, 읽기전용):
##   wp() (@17020)          = INV.equipped.weapon||{}
##   hm() (@17024)          = INV.equipped.helmet||{}
##   enhMulAtk(n) (@28745)  = n*0.25
##   _eqStatRebuild (@28627): _eqStatCache={};for(SLOT_NAMES){const it=INV.equipped[slot];
##                            if(it){for(const k2 in it){if(k2[0]==='b'&&typeof it[k2]==='number'){
##                              const sk=k2.slice(1);_eqStatCache[sk]=(_eqStatCache[sk]||0)+it[k2]}}}}
##   _eqStat(k) (@28628)    = if(!_eqStatCache)_eqStatRebuild();return _eqStatCache[k]||0
##   _slotFlatAtk(it) (@29403): if(!it||!it.affixes)return 0;let s=0;for(i<it.affixes.length){const a=it.affixes[i];
##                            if(a.id==='sharpAtk'||a.id==='brutalAtk'||a.id==='ruinAtk')s+=(+a.value||0)}return s
##   _lvB() (@29405)        = ~~(P.lv*.5)
##   meleeRef() (@29407)    = (((+wp().atk||0)+enhMulAtk(wp().enh||0))+_slotFlatAtk(wp())+P.baseAtk
##                             +(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal>0?.3:1)
##   magicRef() (@29409)    = (((+hm().atk||0)+enhMulAtk(hm().enh||0))+_slotFlatAtk(hm())+P.baseAtk
##                             +(STATS.int+_eqStat('Int')+_lvB()))*(P._weaponSeal>0?.3:1)
##   원 상태값(이 모듈이 공급하지 않음 — 읽기만): mkP baseAtk:8,lv:1 (@29657), recalc P.baseAtk=G.on?15+(stage-1)*2:15
##   (@28588), STATS={str:0,dex:0,int:0,vit:0,lck:0} (@28268), P._weaponSeal 부재→+600 (@41967)/감소 (@37784).
##
## 읽기 전용: P/INV/STATS/ROOT 캐시 쓰기 0, 아이템 생성·장착·강화·RNG·봉인 해제 0, 타이머/clock 0.
## atk/enh/flat/P/STATS/_weaponSeal 은 매 호출 reader 를 다시 읽는다(원과 같음). _eqStat 만 원 lazy 캐시.
## 미바인딩/대상 해제/reader null 반환은 NOT_READY + value null — 8/15/0 위장 금지.
## JS 덧셈(문자열 연결)/ToNumber/ToInt32 는 ROOT combat_stat_formula·equipment_affix_reader 것을 빌려 쓴다.
##
## status: READY / NOT_READY / SOURCE_THROW (원 TypeError — value null)
##         / READY_PARTIAL_AFTER_SOURCE_THROW (원 rebuild throw 후 남은 부분 {} 캐시 — 원 숫자, 비권위).
## reader 반환 null = 현재 authority 없음(NOT_READY `<label>_reader_null`). 반환된 INV 안의
## equipped:null / affixes[i]:null 은 원 데이터 → TypeError(SOURCE_THROW).
##
## _eqStat 캐시(모듈 private, 원 `let _eqStatCache=null`): 무효화는 스스로 추정하지 않는다.
##   ENGINE 이 원 지점에서 호출: _refreshEquipmentStats(@16798, equip/unequip 후) · recalcSt(@16934)
##   → invalidate_eq_stat_cache(); _inventoryEquipCP(@49832~49836: const _statCache=_eqStatCache …
##   _eqStatCache=null … finally _eqStatCache=_statCache) → capture/invalidate/restore token.
##   새 INV reader 바인딩/해제 → 캐시 null(원 초기 상태).

const Formula := preload("res://port_modules/combat_stat_formula/producer.gd")
const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const SLOT_NAMES: Array[String] = Formula.SLOT_NAMES

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_THROW := "SOURCE_THROW"
const READY_PARTIAL := AffixReader.READY_PARTIAL   # "READY_PARTIAL_AFTER_SOURCE_THROW"

const ENH_MUL_ATK := 0.25      # enhMulAtk @28745
const SEAL_MUL := 0.3          # P._weaponSeal>0?.3:1 @29407
const LV_B_MUL := 0.5          # _lvB @29405
const FLAT_ATK_IDS: Array[String] = ["sharpAtk", "brutalAtk", "ruinAtk"]   # _slotFlatAtk @29403

## kind → [슬롯, STATS 키, _eqStat 키, 원 함수명]
const KINDS := {
	"melee": ["weapon", "str", "Str", "meleeRef"],
	"magic": ["helmet", "int", "Int", "magicRef"],
	"bow": ["bow", "dex", "Dex", "bowRef"],
}

var _inventory_reader: Callable
var _player_reader: Callable
var _stats_reader: Callable
var _inventory_bound := false
var _player_bound := false
var _stats_bound := false

var _js: Formula = Formula.new()            # _js_add/_js_num 차용(미바인딩 인스턴스, 상태 0)
var _coerce: AffixReader = AffixReader.new()  # JS ToNumber 전용(인벤토리 미바인딩, 캐시 사용 0)

var _eq_stat_cache: Variant = null      # 원 _eqStatCache (null = 미구축). 키 = k2.slice(1)
var _eq_stat_partial := false           # 원 rebuild throw 후 부분 캐시
var _eq_stat_last_throw := ""
var _eq_stat_slots: Dictionary = {}     # 진단 전용: sk → 기여 슬롯(원에 없음, 값 계산에 쓰지 않음)

# ───────────────────────── configure ─────────────────────────

## reader(): 현재 INV Dictionary({equipped:{slot:item}}) 참조. ROOT affix reader/formula 와 같은 Callable 공유 가능.
## 바인딩/해제(invalid) 모두 _eqStat 캐시를 원 초기 상태(null)로 되돌린다.
func configure_inventory_reader(reader: Callable) -> bool:
	_inventory_bound = reader.is_valid()
	_inventory_reader = reader if _inventory_bound else Callable()
	_reset_eq_stat_cache()
	return _inventory_bound

## reader(): 현재 P Dictionary 참조. 읽는 키: baseAtk, lv, _weaponSeal.
func configure_player_reader(reader: Callable) -> bool:
	_player_bound = reader.is_valid()
	_player_reader = reader if _player_bound else Callable()
	return _player_bound

## reader(): 현재 STATS Dictionary 참조. 읽는 키: str(meleeRef), int(magicRef).
func configure_stats_reader(reader: Callable) -> bool:
	_stats_bound = reader.is_valid()
	_stats_reader = reader if _stats_bound else Callable()
	return _stats_bound

func clear_readers() -> void:
	_inventory_bound = false
	_player_bound = false
	_stats_bound = false
	_inventory_reader = Callable()
	_player_reader = Callable()
	_stats_reader = Callable()
	_reset_eq_stat_cache()

## ROOT combat_stat_formula 에 melee/magic ref reader 바인딩. 이후 매 호출 live.
## provider 인스턴스는 호출자가 보관해야 한다(formula Callable 약참조).
func bind_combat_stat_formula(formula: Object) -> Dictionary:
	if formula == null or not formula.has_method("configure_ref_readers"):
		return {"ok": false, "status": NOT_READY, "reason": "formula_unsupported"}
	var unbound: Array = _unbound_labels()
	if not unbound.is_empty():
		return {"ok": false, "status": NOT_READY, "reason": "readers_unbound:" + ",".join(PackedStringArray(unbound))}
	var ok: bool = formula.configure_ref_readers(melee_ref_value, magic_ref_value)
	return {"ok": ok, "status": READY if ok else NOT_READY, "reason": "" if ok else "configure_ref_readers_rejected"}

# ───────────────────────── authority reads ─────────────────────────

func _unbound_labels() -> Array:
	var out: Array = []
	if not _inventory_bound: out.append("INV")
	if not _player_bound: out.append("P")
	if not _stats_bound: out.append("STATS")
	return out

func _call(reader: Callable, bound: bool, label: String) -> Dictionary:
	if not bound:
		return {"ok": false, "status": NOT_READY, "reason": label + "_reader_unbound"}
	if not reader.is_valid():
		return {"ok": false, "status": NOT_READY, "reason": label + "_reader_target_freed"}
	var v: Variant = reader.call()
	if v == null:
		return {"ok": false, "status": NOT_READY, "reason": label + "_reader_null"}   # 현재 authority 없음
	return {"ok": true, "value": v}

static func _is_primitive(v: Variant) -> bool:
	return v is bool or v is int or v is float or v is String or v is StringName or v is Array

## 원 obj.key: {ok, present, value}. null obj → TypeError; primitive → undefined; Object → 미지원.
static func _prop(obj: Variant, key: String, label: String) -> Dictionary:
	if obj == null:
		return {"ok": false, "status": SOURCE_THROW,
			"reason": "TypeError: Cannot read properties of null (reading '%s') @%s" % [key, label]}
	if obj is Dictionary:
		return {"ok": true, "present": obj.has(key), "value": obj.get(key)}
	if _is_primitive(obj):
		return {"ok": true, "present": false, "value": null}
	return {"ok": false, "status": NOT_READY, "reason": label + "_unsupported_shape:" + type_string(typeof(obj))}

## _prop + 값이 Godot Object 이면 미지원(원 JSON 상태에 없는 shape — NaN 으로 삼키지 않음).
static func _scalar_prop(obj: Variant, key: String, label: String) -> Dictionary:
	var p: Dictionary = _prop(obj, key, label)
	if p.ok and p.value is Object:
		return {"ok": false, "status": NOT_READY, "reason": "%s.%s_unsupported_shape:Object" % [label, key]}
	return p

## INV.equipped (원 wp()/hm(), 매 호출 live). primitive equipped → 모든 슬롯 undefined.
func _equipped() -> Dictionary:
	var c: Dictionary = _call(_inventory_reader, _inventory_bound, "INV")
	if not c.ok:
		return c
	var inv: Dictionary = _prop(c.value, "equipped", "INV")
	if not inv.ok:
		return inv
	var e: Variant = inv.value
	if e == null:
		return {"ok": false, "status": SOURCE_THROW,
			"reason": "TypeError: Cannot read properties of %s (reading '%%s') @INV.equipped" % ("null" if inv.present else "undefined")}
	if e is Dictionary:
		return {"ok": true, "value": e}
	if _is_primitive(e):
		return {"ok": true, "value": {}}
	return {"ok": false, "status": NOT_READY, "reason": "INV.equipped_unsupported_shape:" + type_string(typeof(e))}

# ───────────────────────── 원 helper 들 ─────────────────────────

## 원 wp()/hm(): INV.equipped[slot]||{}. truthy 면 원 item identity 그대로(복사 0).
static func _slot_item(equipped: Dictionary, slot: String) -> Dictionary:
	var it: Variant = equipped.get(slot)
	if not AffixReader.js_truthy(it):
		return {"ok": true, "item": {}, "fallback_empty": true}
	if it is Dictionary or _is_primitive(it):
		return {"ok": true, "item": it, "fallback_empty": false}
	return {"ok": false, "status": NOT_READY, "reason": "item_unsupported_shape:%s@%s" % [type_string(typeof(it)), slot]}

## 원 _slotFlatAtk(it). it 은 _slot_item 결과(Dictionary 또는 primitive).
func slot_flat_atk(it: Variant, label: String = "it") -> Dictionary:
	if not AffixReader.js_truthy(it) or not it is Dictionary:
		return {"ok": true, "value": 0.0}                     # !it / primitive.affixes=undefined
	var affixes: Variant = it.get("affixes")
	if not AffixReader.js_truthy(affixes):
		return {"ok": true, "value": 0.0}                     # !it.affixes
	var elements: Array = []
	if affixes is Array:
		elements = affixes
	elif affixes is String or affixes is StringName:
		for ch in String(affixes):
			elements.append(ch)                               # 1문자 string: .id undefined
	elif affixes is Dictionary:
		if affixes.has("length"):
			return {"ok": false, "status": NOT_READY, "reason": "affixes_unsupported_shape:object_with_length@" + label}
		return {"ok": true, "value": 0.0}                     # {}.length undefined → 0회
	elif affixes is bool or affixes is int or affixes is float:
		return {"ok": true, "value": 0.0}
	else:
		return {"ok": false, "status": NOT_READY, "reason": "affixes_unsupported_shape:%s@%s" % [type_string(typeof(affixes)), label]}
	var s := 0.0
	for i in range(elements.size()):
		var a: Variant = elements[i]
		if a == null:
			return {"ok": false, "status": SOURCE_THROW,
				"reason": "TypeError: Cannot read properties of null (reading 'id') @%s.affixes[%d]" % [label, i]}
		if not a is Dictionary:
			if a is Object:
				return {"ok": false, "status": NOT_READY, "reason": "affix_unsupported_shape:Object@%s.affixes[%d]" % [label, i]}
			continue                                          # primitive/Array .id undefined
		var id: Variant = a.get("id")
		if not ((id is String or id is StringName) and FLAT_ATK_IDS.has(String(id))):
			continue                                          # === 엄격 비교
		var n: float = _coerce.js_to_number(a.get("value"), a.has("value"))
		s += n if AffixReader.js_truthy(n) else 0.0           # (+a.value||0)
	return {"ok": true, "value": s}

# ───────────────────────── 원 _eqStatCache (모듈 private) ─────────────────────────

func _reset_eq_stat_cache() -> void:
	_eq_stat_cache = null
	_eq_stat_partial = false
	_eq_stat_last_throw = ""
	_eq_stat_slots = {}

## 원 `_eqStatCache=null` — ENGINE 이 _refreshEquipmentStats(@16798)/recalcSt(@16934)/CP preview(@49833) 에서 호출.
func invalidate_eq_stat_cache() -> void:
	_reset_eq_stat_cache()

func is_eq_stat_cache_built() -> bool:
	return _eq_stat_cache != null

## 원 _inventoryEquipCP `const _statCache=_eqStatCache` — 캐시 객체 identity 그대로(복사 0).
func capture_eq_stat_cache_token() -> Dictionary:
	return {"cache": _eq_stat_cache, "partial": _eq_stat_partial, "last_throw": _eq_stat_last_throw, "slots": _eq_stat_slots}

## 원 finally `_eqStatCache=_statCache`.
func restore_eq_stat_cache_token(token: Dictionary) -> void:
	_eq_stat_cache = token.get("cache")
	_eq_stat_partial = bool(token.get("partial", false))
	_eq_stat_last_throw = String(token.get("last_throw", ""))
	var sl: Variant = token.get("slots", {})
	_eq_stat_slots = sl if sl is Dictionary else {}

## 진단용 복사본(원 캐시 수정 불가). 미구축 → null.
func eq_stat_cache_snapshot() -> Variant:
	if not _eq_stat_cache is Dictionary:
		return null
	return {"cache": _eq_stat_cache.duplicate(), "partial": _eq_stat_partial,
		"last_throw": _eq_stat_last_throw, "slots": _eq_stat_slots.duplicate(true)}

## 원 _eqStatRebuild 를 현재 INV authority 로 강제 실행(진단/ENGINE 선구축용).
func rebuild_eq_stat_cache() -> Dictionary:
	var c: Dictionary = _call(_inventory_reader, _inventory_bound, "INV")
	if not c.ok:
		return {"status": c.status, "reason": c.reason}
	return _rebuild_eq_stat_from(c.value)

## 원 _eqStatRebuild(@28627). `_eqStatCache={}` 먼저 → throw 시 부분 {} 가 남는다.
##   SLOT_NAMES 순서, 각 item 의 for-in 키 전부(b 접두 + typeof number, bool 제외), (cache[sk]||0)+v.
##   for-in 순서: 정수형 키 먼저지만 정수형 키는 'b' 로 시작할 수 없어 b 키 순서 = Dictionary 삽입 순서.
func _rebuild_eq_stat_from(inv: Variant) -> Dictionary:
	var e: Dictionary = _prop(inv, "equipped", "INV")
	if not e.ok:
		_reset_eq_stat_cache()
		return {"status": e.status, "reason": e.reason}
	var built: Dictionary = {}
	var slots: Dictionary = {}
	var equipped: Variant = e.value
	if equipped == null:
		var err := "TypeError: Cannot read properties of %s (reading '%s') @INV.equipped" % [
			"null" if e.present else "undefined", SLOT_NAMES[0]]
		_eq_stat_cache = built
		_eq_stat_partial = true
		_eq_stat_last_throw = err
		_eq_stat_slots = slots
		return {"status": SOURCE_THROW, "reason": err}
	if _is_primitive(equipped):
		equipped = {}                                         # primitive[slot] = undefined
	elif not equipped is Dictionary:
		_reset_eq_stat_cache()
		return {"status": NOT_READY, "reason": "INV.equipped_unsupported_shape:" + type_string(typeof(equipped))}
	for slot in SLOT_NAMES:
		var it: Variant = equipped.get(slot)
		if not AffixReader.js_truthy(it):
			continue
		if it is Object:
			_reset_eq_stat_cache()
			return {"status": NOT_READY, "reason": "item_unsupported_shape:Object@" + slot}
		if not it is Dictionary:
			continue                                          # primitive/Array for-in: 인덱스 키, 'b' 없음
		for k2 in it.keys():
			var ks: String
			if k2 is String or k2 is StringName:
				ks = String(k2)
			elif k2 == null or k2 is bool or k2 is int or k2 is float:
				continue                                      # JS 키 문자열이 'b' 로 시작하지 않음
			else:
				_reset_eq_stat_cache()
				return {"status": NOT_READY, "reason": "item_key_unsupported_shape:%s@%s" % [type_string(typeof(k2)), slot]}
			if not ks.begins_with("b"):
				continue                                      # k2[0]==='b'
			var v: Variant = it[k2]
			if not (v is int or v is float):
				continue                                      # typeof==='number' (bool 제외)
			var sk := ks.substr(1)
			var prev: Variant = built.get(sk)
			built[sk] = (float(prev) if AffixReader.js_truthy(prev) else 0.0) + float(v)
			if not slots.has(sk):
				slots[sk] = []
			slots[sk].append(slot)
	_eq_stat_cache = built
	_eq_stat_partial = false
	_eq_stat_last_throw = ""
	_eq_stat_slots = slots
	return {"status": READY, "reason": ""}

## 원 _eqStat(k) = if(!_eqStatCache)_eqStatRebuild(); return _eqStatCache[k]||0.
##   INV authority 는 매 호출 확인(미바인딩/해제/null → NOT_READY, 캐시 값 반환 0).
##   캐시가 구축돼 있으면 INV.equipped 를 다시 읽지 않는다(원과 같음 — in-place 변경은 무효화 전까지 stale).
func eq_stat(k: String) -> Dictionary:
	var src := "_eqStat('%s')" % k
	var c: Dictionary = _call(_inventory_reader, _inventory_bound, "INV")
	if not c.ok:
		return _fail(c.status, c.reason, src)
	var rebuilt := false
	if _eq_stat_cache == null:
		var rb: Dictionary = _rebuild_eq_stat_from(c.value)
		if rb.status != READY:
			return _fail(rb.status, rb.reason, src)
		rebuilt = true
	var cache: Dictionary = _eq_stat_cache
	var v: Variant = cache.get(k)
	var r: Dictionary = _ok(float(v) if AffixReader.js_truthy(v) else 0.0, src)
	if _eq_stat_partial:
		r.status = READY_PARTIAL
		r.reason = _eq_stat_last_throw
	r["origin"] = "sum" if cache.has(k) else "absent_zero"
	r["slots"] = _eq_stat_slots.get(k, []).duplicate()
	r["rebuilt"] = rebuilt
	return r

static func _num_of(p: Dictionary, coerce: AffixReader) -> float:
	return coerce.js_to_number(p.value, p.present)

## 원 _lvB() = ~~(P.lv*.5).
func lv_b() -> Dictionary:
	var c: Dictionary = _call(_player_reader, _player_bound, "P")
	if not c.ok:
		return _fail(c.status, c.reason, "_lvB()")
	var lv: Dictionary = _scalar_prop(c.value, "lv", "P")
	if not lv.ok:
		return _fail(lv.status, lv.reason, "_lvB()")
	return _ok(Formula.js_to_int32(_num_of(lv, _coerce) * LV_B_MUL), "_lvB()")

## 원 P._weaponSeal>0 (ToNumber 비교; undefined/NaN/null → false, true → 1>0).
func weapon_seal_active() -> Dictionary:
	var c: Dictionary = _call(_player_reader, _player_bound, "P")
	if not c.ok:
		return _fail(c.status, c.reason, "P._weaponSeal>0")
	var ws: Dictionary = _scalar_prop(c.value, "_weaponSeal", "P")
	if not ws.ok:
		return _fail(ws.status, ws.reason, "P._weaponSeal>0")
	var r: Dictionary = _ok(_num_of(ws, _coerce) > 0.0, "P._weaponSeal>0")
	r["raw"] = ws.value
	r["raw_present"] = ws.present
	return r

# ───────────────────────── result helpers ─────────────────────────

func _ok(value: Variant, source: String) -> Dictionary:
	var nf: bool = value is float and (is_nan(value) or is_inf(value))
	return {"status": READY, "value": value, "non_finite": nf, "source": source, "reason": ""}

func _fail(status: String, reason: String, source: String) -> Dictionary:
	return {"status": status, "value": null, "non_finite": false, "source": source, "reason": reason}

## JS acc + operand; operand 부재(undefined) → number+undefined = NaN (이 위치 acc 는 항상 number).
func _add(acc: Variant, operand: Variant, present: bool) -> Dictionary:
	if not present:
		if acc is String:
			return _js._js_add(acc, "undefined")
		return {"ok": true, "value": NAN}
	return _js._js_add(acc, operand)

# ───────────────────────── 원 meleeRef / magicRef ─────────────────────────

## kind: "melee" | "magic" | "bow". INV(wp/hm/bw) → baseAtk → STATS → _eqStat → _lvB → seal.
func reference_for_kind(kind: String) -> Dictionary:
	if not KINDS.has(kind):
		return _fail(NOT_READY, "kind_not_ported:" + kind, kind + "Ref()")
	var slot: String = KINDS[kind][0]
	var stat_key: String = KINDS[kind][1]
	var eq_key: String = KINDS[kind][2]
	var src: String = KINDS[kind][3] + "()"
	var unbound: Array = _unbound_labels()
	if not unbound.is_empty():
		var r0: Dictionary = _fail(NOT_READY, "readers_unbound:" + ",".join(PackedStringArray(unbound)), src)
		r0["missing"] = unbound
		return r0
	# wp()/hm()
	var eq: Dictionary = _equipped()
	if not eq.ok:
		return _fail(eq.status, String(eq.reason).replace("%s", slot), src)
	var si: Dictionary = _slot_item(eq.value, slot)
	if not si.ok:
		return _fail(si.status, si.reason, src)
	var it: Variant = si.item
	var atk: Dictionary = _scalar_prop(it, "atk", slot)
	if not atk.ok:
		return _fail(atk.status, atk.reason, src)
	var enh: Dictionary = _scalar_prop(it, "enh", slot)
	if not enh.ok:
		return _fail(enh.status, enh.reason, src)
	# +it.atk||0
	var atk_n: float = _num_of(atk, _coerce)
	var atk_term: float = atk_n if AffixReader.js_truthy(atk_n) else 0.0
	# enhMulAtk(it.enh||0) = (it.enh||0)*0.25
	var enh_raw: Variant = enh.value if AffixReader.js_truthy(enh.value) else 0
	var enh_term: float = _js._js_num(enh_raw) * ENH_MUL_ATK
	var flat: Dictionary = slot_flat_atk(it, slot)
	if not flat.ok:
		return _fail(flat.status, flat.reason, src)
	var acc: Variant = (atk_term + enh_term) + float(flat.value)
	# +P.baseAtk
	var pc: Dictionary = _call(_player_reader, true, "P")
	if not pc.ok:
		return _fail(pc.status, pc.reason, src)
	var base_atk: Dictionary = _prop(pc.value, "baseAtk", "P")
	if not base_atk.ok:
		return _fail(base_atk.status, base_atk.reason, src)
	var t: Dictionary = _add(acc, base_atk.value, base_atk.present)
	if not t.ok:
		return _fail(NOT_READY, t.reason + " @+P.baseAtk", src)
	acc = t.value
	# (STATS.<k>+_eqStat(K)+_lvB())
	var sc: Dictionary = _call(_stats_reader, true, "STATS")
	if not sc.ok:
		return _fail(sc.status, sc.reason, src)
	var st: Dictionary = _prop(sc.value, stat_key, "STATS")
	if not st.ok:
		return _fail(st.status, st.reason, src)
	var es: Dictionary = eq_stat(eq_key)
	if es.status != READY and es.status != READY_PARTIAL:
		return _fail(es.status, es.reason, src)
	var lb: Dictionary = lv_b()
	if lb.status != READY:
		return _fail(lb.status, lb.reason, src)
	var inner: Dictionary
	if st.present:
		inner = _js._js_add(st.value, float(es.value))
	else:
		inner = {"ok": true, "value": NAN}                    # undefined + number
	if inner.ok:
		inner = _js._js_add(inner.value, float(lb.value))
	if not inner.ok:
		return _fail(NOT_READY, inner.reason + " @(STATS.%s+_eqStat('%s')+_lvB())" % [stat_key, eq_key], src)
	t = _js._js_add(acc, inner.value)
	if not t.ok:
		return _fail(NOT_READY, t.reason + " @+(STATS...)", src)
	acc = t.value
	# *(P._weaponSeal>0?.3:1)
	var seal: Dictionary = weapon_seal_active()
	if seal.status != READY:
		return _fail(seal.status, seal.reason, src)
	var mul: float = SEAL_MUL if seal.value else 1.0
	var r: Dictionary = _ok(_js._js_num(acc) * mul, src)
	if es.status == READY_PARTIAL:
		r.status = READY_PARTIAL                  # 원 숫자 그대로, 부분 캐시 기반 → 비권위
		r.reason = String(es.reason)
	r["terms"] = {
		"slot": slot,
		"item": it,                               # 원 item identity(truthy) 또는 원 ||{} 새 빈 객체
		"item_fallback_empty": si.fallback_empty,
		"atk_term": atk_term,
		"enh_term": enh_term,
		"slot_flat_atk": float(flat.value),
		"base_atk_raw": base_atk.value,
		"base_atk_present": base_atk.present,
		"stat_raw": st.value,
		"stat_present": st.present,
		"eq_stat": float(es.value),
		"eq_stat_slots": es.slots,
		"eq_stat_rebuilt": es.rebuilt,
		"eq_stat_partial": es.status == READY_PARTIAL,
		"lv_b": int(lb.value),
		"pre_seal": acc,
		"string_concat": acc is String,
		"seal_active": bool(seal.value),
		"seal_mul": mul,
	}
	return r

func melee_ref() -> Dictionary:
	return reference_for_kind("melee")

func magic_ref() -> Dictionary:
	return reference_for_kind("magic")

## R game.html bowRef: current equipped bow, original DEX/flat/enh/seal order.
func bow_ref() -> Dictionary:
	return reference_for_kind("bow")

## ROOT formula configure_ref_readers 용: READY → float(NaN 포함, 원 산술 그대로), 그 외(READY_PARTIAL 포함) → null.
## null 은 formula 에서 `<label>_unsupported_shape:Nil` NOT_READY 로 보인다 — 정확한 사유는 melee_ref()/magic_ref().
func melee_ref_value() -> Variant:
	var r: Dictionary = reference_for_kind("melee")
	return r.value if r.status == READY else null

func magic_ref_value() -> Variant:
	var r: Dictionary = reference_for_kind("magic")
	return r.value if r.status == READY else null
