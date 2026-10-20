extends RefCounted
##
## player_resource_parameters_source/producer.gd — 원 applyStats/recalcSt 의 MP/ST 자원 parameter 파생
## (mmp/mpR/stR/mst + 상한 Math.min 으로 내려가는 mp/st) plan + 단일 sink dispatch.
## TASK GODOT-PORT-PLAYER-RESOURCE-PARAMETERS-SOURCE-FIRST-20261013
## IT-04: latest origin/main 284d7faf game.html:27934-27939 applies
## IT-01 socketMul(item,ci) once to every crystal effect before summation.
## Older anchors below retain the initial port's provenance.
##
## 자체 clock/_process/_physics_process 없음. 상태는 매 호출 provider 에서 현재값으로 읽는다(캐시/스냅샷 없음).
## Player/World/P/STATS/PASSIVES/INV 직접 쓰기 0 — 결과는 오직 resource_sink(packet) 로만 나간다.
## provider/필드 누락 → NOT_READY + packet null + dispatch 0. 중립 .28/100/160 보충 0.
## 원식이 NaN/±Infinity 를 산출 → SOURCE_NON_FINITE + dispatch 0 (packet 은 진단용으로만 반환).
##
## 원값(R canonical game.html, 읽기전용):
##   mkP boot (@29655)     : st:200,mst:200,stR:.28,mp:160,mmp:160,mpR:0         — source_boot_parameters() 만, 파생 아님
##   dbRestore (@4005-4008): 복원 대입은 save_adapter/restore_player_resources 소유 — 여기선 현재 P 읽기만
##   applyStats (@28564):
##     @28566-28567 for(sl of SLOT_NAMES){it=INV.equipped[sl];if(it){_eqDex+=(+it.bDex||0);_eqInt+=(+it.bInt||0)}}
##     @28568 _lb=_lvB()=~~(P.lv*.5) (@29405)  — 계산은 combat_reference_source.lv_b() 소비(중복 0)
##     @28569 s.dex=STATS.dex+_eqDex+_lb+~~_eqAffix('dexFlat'); s.int=STATS.int+_eqInt+_lb+~~_eqAffix('intFlat')
##     @28578-28581 _allDefSlots 14종: if(_dit){_totalBonusMp+=(+_dit.bonusMp||0);
##                  if(_dit.enh>0){if(_mpEnhSet.has(sl))_enhMp+=_dit.enh*0.2}}
##     @28591 P.stR=.05+s.dex*.005
##     @28593 P.mmp=~~(100+s.int*2+_totalBonusMp+_eqAffix('maxMPFlat')+_enhMp)
##     @28594 P.mpR=.05+s.int*.005
##     @28596-28600 _cr{...:0}; SLOT_NAMES 순 it.crystals[ci] → crystalEffects(c) → _cr[stat]+=value; P._crystalStats=_cr
##     @28606 P.mpR+=_cr.mpR/60   @28607 P.stR+=_cr.stR/60
##     @28608 P.mmp=~~(P.mmp+~~_cr.mp)+(PASSIVES.pHuman||0)*100+_gritMpFlat(); P.mp=Math.min(P.mp,P.mmp)
##     @28610-28611 _vLv=PASSIVES.pVital||0; if(_vLv>0){P.mmp+=_vLv*50;P.mp=Math.min(P.mp,P.mmp);P.mpR*=(1+_vLv*0.01)}
##     @28613-28614 _sLv=PASSIVES.pStamina||0; if(_sLv>0){P.stR*=(1+_sLv*0.01)}
##     @28624 recalcSt()
##   recalcSt (@16933-16940):
##     _eqAffixCache=null;_eqStatCache=null  → KIND_INVALIDATE 명령으로 consumer 에 위임(여기서 실행 0)
##     base=100+STATS.dex*2  (원 STATS.dex 그대로 — 유효스탯 s.dex 아님)
##     for(slot of SLOT_NAMES){if(it){if(it.bonusSt)bonus+=(+it.bonusSt||0);if(it.enh>0&&_stEnhSet.has(slot))_enhSt2+=it.enh*0.2}}
##     P.mst=~~(base+bonus+_eqAffix('maxSTFlat')+~~(P._crystalStats?P._crystalStats.st:0)+_enhSt2)
##           +(PASSIVES.pHuman||0)*100+(PASSIVES.pStamina||0)*50+_gritStFlat(); P.st=Math.min(P.st,P.mst)
##   _gritTotal (@28559): (+_grit||0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR')
##
## 제외(타 owner): HP/mhp/hpR/def/atk/speed/shield/poise 파생, 자연 리젠 tick(resource_regeneration_source),
##   holyDome flat, 포션/레벨업/QE 비용, 저장/복원 대입, PASSIVE/STATS/AP/SP/grit 투자, 아이템·결정 생성/RNG, 렌더.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const CombatStatFormula := preload("res://port_modules/combat_stat_formula/producer.gd")
const ItemQuality := preload("res://port_modules/item_quality_source/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"            # 원식 결과 NaN/±Inf — 값 공급 0
const SOURCE_BOOT := "SOURCE_BOOT"                        # mkP literal (현재/파생 아님)
const PARTIAL_AFTER_APPLY_STATS := "PARTIAL_AFTER_APPLY_STATS"  # 원도 recalcSt 중 throw 시 applyStats 대입은 남는다
const SINK_REJECTED := "SINK_REJECTED"

## 필수 provider 키 → 원 표현식
const PROVIDER_PLAYER := "player"          # () -> 현재 P Dictionary
const PROVIDER_STATS := "stats"            # () -> 현재 STATS Dictionary
const PROVIDER_PASSIVES := "passives"      # () -> 현재 PASSIVES Dictionary
const PROVIDER_INVENTORY := "inventory"    # () -> 현재 INV Dictionary ({equipped:{slot:item}})
const PROVIDER_EQ_AFFIX := "eq_affix"      # (id) -> {status,value}  = equipment_affix_reader.eq_affix (원 _eqAffix + 캐시)
const PROVIDER_EQ_STAT := "eq_stat"        # (k) -> {status,value}  = combat_reference_source.eq_stat (원 _eqStat + _eqStatCache)
const PROVIDER_LV_B := "lv_b"              # () -> {status,value}   = combat_reference_source.lv_b (원 _lvB)
const PROVIDER_GRIT := "grit"              # () -> 현재 원 _grit (number 만; null/기타 → NOT_READY)
const PROVIDER_CRYSTAL_EFFECTS := "crystal_effects"  # (c) -> Array[{stat,value}] = 원 crystalEffects(c). 결정 존재 시에만 호출
const REQUIRED_PROVIDERS: Array[String] = [
	PROVIDER_PLAYER, PROVIDER_STATS, PROVIDER_PASSIVES, PROVIDER_INVENTORY,
	PROVIDER_EQ_AFFIX, PROVIDER_EQ_STAT, PROVIDER_LV_B, PROVIDER_GRIT,
]
const CONDITIONAL_PROVIDERS: Array[String] = [PROVIDER_CRYSTAL_EFFECTS]

## production 에 현재 authority/provider 가 없는 입력 (외부 주입 필요). _eqStat/_lvB 는 combat_reference_source 재사용.
const MISSING_UPSTREAM := {
	"current_INV": "현재 INV authority (equipped) — ITEM/ENGINE",
	"current_P": "현재 P getter 필수: 실제 actor/resources와 owned source fields — ENGINE",
	"current_STATS": "현재 STATS authority — BUILD",
	"grit": "현재 _grit 전역 (@28556) authority — BUILD",
	"crystal_effects": "conditional: 실제 player_crystal_resource_source.crystalEffects provider (@15951)",
	"install_sink": "packet 적용 + KIND_INVALIDATE 를 affix/eqStat 캐시 소유자에서 실행하는 sink 설치 — ENGINE",
}

const DEF_SLOTS: Array[String] = [
	"shield", "armor", "boots", "gloves", "pants", "belt", "necklace", "ring1", "ring2", "cape",
	"bracelet", "headband", "ossuary", "headband2",
]
const MP_ENH_SLOTS: Array[String] = ["bracelet", "necklace", "headband", "headband2", "ossuary"]
const ST_ENH_SLOTS: Array[String] = ["ring1", "ring2", "belt"]
const CR_INIT_KEYS: Array[String] = [
	"hp", "st", "mp", "atk", "def", "eDef", "spd", "crit", "cdmg", "fire", "ice", "dark", "light", "holy",
	"hpR", "stR", "mpR", "drop",
]

const KIND_APPLY_STATS := "apply_stats_resource_parameters"
const KIND_INVALIDATE := "invalidate_eq_caches"
const KIND_RECALC_ST := "recalc_st_resource_parameters"

const PARAMETER_FIELDS: Array[String] = ["mp", "mmp", "st", "mst", "stR", "mpR"]
const REGEN_STATE_FIELDS: Array[String] = ["s", "st", "mst", "mp", "mmp", "stR", "mpR"]

var _providers: Dictionary = {}
var _sink: Callable = Callable()
var _owners: Array[Object] = []  # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _coerce: AffixReader = AffixReader.new()  # JS ToNumber 재사용 (inventory reader 미바인딩 — 계산 전용)
var _socket_quality: ItemQuality = ItemQuality.new() # readonly IT-01; no new provider or inventory authority
var _fail: String = ""
var _dispatch_count: int = 0
var _last: Dictionary = {}


# ───────────────────────── boot (원 provenance 만) ─────────────────────────

## 원 mkP literal. 현재 P/파생값이 아니며 READY 로 승격하지 않는다.
static func source_boot_parameters() -> Dictionary:
	return {
		"status": SOURCE_BOOT,
		"source": "game.html:29655 mkP()",
		"derived": false,
		"current": false,
		"values": { "st": 200.0, "mst": 200.0, "stR": 0.28, "mp": 160.0, "mmp": 160.0, "mpR": 0.0 },
	}


# ───────────────────────── configure / readiness ─────────────────────────

## providers: REQUIRED_PROVIDERS(+CONDITIONAL_PROVIDERS) → Callable, resource_sink: Callable(packet)->bool
func configure(providers: Dictionary, resource_sink: Callable) -> Dictionary:
	_providers = providers.duplicate()
	_sink = resource_sink
	_owners.clear()
	_retain(resource_sink)
	for key: Variant in _providers:
		var v: Variant = _providers[key]
		if v is Callable:
			_retain(v)
	_configured = true
	return readiness()


func clear() -> void:
	_providers = {}
	_sink = Callable()
	_owners.clear()
	_configured = false


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


func dispatch_count() -> int:
	return _dispatch_count


func last_result() -> Dictionary:
	return _last.duplicate(true)


func _provider(key: String) -> Callable:
	var v: Variant = _providers.get(key, null)
	if v is Callable:
		var c: Callable = v
		if c.is_valid():
			return c
	return Callable()


func _missing_providers() -> Array[String]:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	for key in REQUIRED_PROVIDERS:
		if not _provider(key).is_valid():
			missing.append("provider:" + key)
	return missing


## 바인딩 준비도(값 호출 없음). crystal_effects 는 장착 결정이 있을 때만 원이 호출 → conditional.
func readiness() -> Dictionary:
	var missing := _missing_providers()
	if not _sink.is_valid():
		missing.append("resource_sink")
	var conditional: Array[String] = []
	for key in CONDITIONAL_PROVIDERS:
		if not _provider(key).is_valid():
			conditional.append("provider:" + key)
	return {
		"ready": missing.is_empty(),
		"status": READY if missing.is_empty() else NOT_READY,
		"missing": missing,
		"conditional_unbound": conditional,
		"missing_upstream": MISSING_UPSTREAM.duplicate(),
	}


static func _not_ready(reason: String) -> Dictionary:
	return { "status": NOT_READY, "ready": false, "reason": reason, "packet": null }


# ───────────────────────── JS helpers ─────────────────────────

func _set_fail(reason: String) -> void:
	if _fail == "":
		_fail = reason


static func _prop_has(o: Variant, key: String) -> bool:
	if o is Dictionary:
		var d: Dictionary = o
		return d.has(key)
	return false


static func _prop_val(o: Variant, key: String) -> Variant:
	if o is Dictionary:
		var d: Dictionary = o
		return d.get(key, null)
	return null   # primitive/배열의 명명 프로퍼티 = undefined


## +o.key (absent → undefined → NaN)
func _to_num(o: Variant, key: String) -> float:
	return _coerce.js_to_number(_prop_val(o, key), _prop_has(o, key))


## (+o.key||0)
func _plus_or0(o: Variant, key: String) -> float:
	var n: float = _to_num(o, key)
	if n == 0.0 or is_nan(n):
		return 0.0
	return n


## (o.key||0) 를 산술/비교에 쓸 때의 ToNumber
func _or0_num(o: Variant, key: String) -> float:
	if not _prop_has(o, key):
		return 0.0
	var v: Variant = _prop_val(o, key)
	if not AffixReader.js_truthy(v):
		return 0.0
	return _coerce.js_to_number(v, true)


static func _int32(f: float) -> float:
	return float(CombatStatFormula.js_to_int32(f))


## Math.min(a,b) — NaN 전파. (-0/+0 구분 미재현)
static func _js_min(a: float, b: float) -> float:
	if is_nan(a) or is_nan(b):
		return NAN
	return minf(a, b)


## STATS.key + rhs (rhs 는 number). 문자열/배열/객체 피연산자는 원에서 문자열 연결 → 미지원 NOT_READY.
func _stats_add(stats: Dictionary, key: String, rhs: float) -> float:
	if not stats.has(key):
		return NAN                       # undefined + number
	var v: Variant = stats[key]
	if v == null:
		return 0.0 + rhs
	if v is bool:
		return (1.0 if bool(v) else 0.0) + rhs
	if v is int or v is float:
		return float(v) + rhs
	_set_fail("unsupported_js_plus_operand:STATS." + key)
	return 0.0


func _read_container(key: String) -> Dictionary:
	var c := _provider(key)
	if not c.is_valid():
		_set_fail("provider_missing:" + key)
		return {}
	var v: Variant = c.call()
	if v == null:
		_set_fail("source_throw:" + key + "_null")
		return {}
	if not (v is Dictionary):
		_set_fail("unsupported_shape:" + key)
		return {}
	return v


func _equipped(inv: Dictionary) -> Dictionary:
	if not inv.has("equipped") or inv["equipped"] == null:
		_set_fail("source_throw:INV.equipped")
		return {}
	var e: Variant = inv["equipped"]
	if not (e is Dictionary):
		_set_fail("unsupported_shape:INV.equipped")
		return {}
	return e


func _slot(eq: Dictionary, slot: String) -> Variant:
	var it: Variant = eq.get(slot, null)
	if it is Object:
		_set_fail("unsupported_item_shape:" + slot)
		return null
	return it


## 원 _eqAffix(id) — equipment_affix_reader.eq_affix 계약({status,value}) 그대로 소비.
func _eq_affix(id: String) -> float:
	var c := _provider(PROVIDER_EQ_AFFIX)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_EQ_AFFIX)
		return 0.0
	var r: Variant = c.call(id)
	if not (r is Dictionary):
		_set_fail("eq_affix_bad_result:" + id)
		return 0.0
	var d: Dictionary = r
	if str(d.get("status", "")) != READY:
		_set_fail("eq_affix_not_ready:" + id + ":" + str(d.get("reason", "")))
		return 0.0
	var v: Variant = d.get("value", null)
	if not (v is int or v is float):
		_set_fail("eq_affix_not_number:" + id)
		return 0.0
	return float(v)


## {status,value,...} 계약 소비 (combat_reference_source/equipment_affix_reader 공통). READY 만 값으로 쓴다 —
## NOT_READY/SOURCE_THROW/READY_PARTIAL/null 은 0 으로 숨기지 않고 실패.
func _ready_number(key: String, r: Variant, label: String) -> float:
	if not (r is Dictionary):
		_set_fail(key + "_bad_result:" + label)
		return 0.0
	var d: Dictionary = r
	var status: String = str(d.get("status", ""))
	if status != READY:
		_set_fail(key + "_not_ready:" + label + ":" + status + ":" + str(d.get("reason", "")))
		return 0.0
	var v: Variant = d.get("value", null)
	if not (v is int or v is float):
		_set_fail(key + "_not_number:" + label)
		return 0.0
	return float(v)


## 원 _eqStat(k) — combat_reference_source.eq_stat(k) 결과 그대로(원 ||0 은 provider 가 적용; 0 은 유효 READY).
func _eq_stat(k: String) -> float:
	var c := _provider(PROVIDER_EQ_STAT)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_EQ_STAT)
		return 0.0
	return _ready_number(PROVIDER_EQ_STAT, c.call(k), k)


## 원 _lvB() — combat_reference_source.lv_b() 결과 그대로 (원 호출 위치마다 다시 호출).
func _lv_b() -> float:
	var c := _provider(PROVIDER_LV_B)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_LV_B)
		return 0.0
	return _ready_number(PROVIDER_LV_B, c.call(), "_lvB()")


## 현재 _grit. canonical 은 항상 number(원 init 0 @28556, restore d.grit||0) → int/float 만 허용.
## null/String/기타 = 현재 authority 없음 → NOT_READY (0 보충 0). 0 은 유효 READY.
func _grit_raw() -> float:
	var c := _provider(PROVIDER_GRIT)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_GRIT)
		return 0.0
	var v: Variant = c.call()
	if not (v is int or v is float):
		_set_fail("grit_not_number:" + type_string(typeof(v)))
		return 0.0
	return float(v)


## 원 _gritTotal() (= _gritMpFlat() = _gritStFlat()). 호출 지점마다 다시 읽는다.
func _grit_total() -> float:
	var g: float = _grit_raw()
	if g == 0.0 or is_nan(g):   # (+_grit||0)
		g = 0.0
	var t: float = g + _lv_b()
	t += _eq_stat("Grit")
	t += _eq_affix("gritFlatN")
	t += _eq_affix("gritFlatR")
	return t


## Shared source caller seam. Reuse the exact existing five-operand helper
## once; callers never reconstruct grit or substitute a missing authority.
## Keep an enclosing plan's first error intact across this read-only query.
func read_source_grit_total() -> Dictionary:
	var previous_error: String = _fail
	_fail = ""
	var value: float = _grit_total()
	var error: String = _fail
	_fail = previous_error
	if not error.is_empty():
		return {"status": NOT_READY, "ready": false, "value": null,
			"reason": error, "source": "game.html:28559 _gritTotal()"}
	if not is_finite(value):
		return {"status": SOURCE_NON_FINITE, "ready": false, "value": null,
			"reason": "computed_non_finite:_gritTotal", "source": "game.html:28559 _gritTotal()"}
	return {"status": READY, "ready": true, "value": value,
		"reason": "", "source": "game.html:28559 _gritTotal()"}


## game.html:27937-27938: socketMul precedes crystalEffects; provider arity stays1.
func _accumulate_crystal(cr: Dictionary, item: Variant, ci: int, c: Variant) -> void:
	var socket: Dictionary = _socket_quality.socket(item, ci)
	if not socket.ready:
		_set_fail("socket_multiplier_not_ready@" + str(ci) + ":" + socket.reason)
		return
	var cc := _provider(PROVIDER_CRYSTAL_EFFECTS)
	if not cc.is_valid():
		_set_fail("provider_missing:" + PROVIDER_CRYSTAL_EFFECTS)
		return
	var effs: Variant = cc.call(c)
	if not (effs is Array):
		_set_fail("crystal_effects_not_array")
		return
	for e: Variant in effs:
		if not (e is Dictionary):
			_set_fail("crystal_effect_shape")
			return
		var ed: Dictionary = e
		var stat: Variant = ed.get("stat", null)
		var value: Variant = ed.get("value", null)
		if not (stat is String) or not (value is int or value is float):
			_set_fail("crystal_effect_shape")
			return
		var key: String = stat
		var before: float = float(cr[key]) if cr.has(key) else NAN   # undefined+value
		var accumulated: float = before + float(value) * float(socket.multiplier)
		# Refuse invalid provider numbers/unknown stats and overflow before a
		# later resource ~~ conversion can hide NaN as zero and dispatch it.
		if not is_finite(accumulated):
			_set_fail("crystal_sum_non_finite:" + key)
			return
		cr[key] = accumulated


static func _w(field: String, value: Variant, source: String, expr: String) -> Dictionary:
	return { "field": field, "value": value, "source": source, "expr": expr }


static func _non_finite_fields(writes: Array[Dictionary]) -> Array[String]:
	var bad: Array[String] = []
	for w in writes:
		var v: Variant = w["value"]
		if v is float:
			var f: float = v
			if is_nan(f) or is_inf(f):
				var field: String = w["field"]
				if not bad.has(field):
					bad.append(field)
	return bad


func _finish_plan(kind: String, source: String, writes: Array[Dictionary], values: Dictionary) -> Dictionary:
	var packet := { "kind": kind, "source": source, "writes": writes }
	var bad := _non_finite_fields(writes)
	if not bad.is_empty():
		return {
			"status": SOURCE_NON_FINITE, "ready": false, "reason": "computed_non_finite:" + ",".join(PackedStringArray(bad)),
			"packet": null, "diagnostic_packet": packet, "values": values,
		}
	return { "status": READY, "ready": true, "reason": "", "packet": packet, "values": values }


# ───────────────────────── phase 1: applyStats 자원 부분 ─────────────────────────

## 순수 계획. 공유 상태 쓰기/sink 호출 없음. 원 대입 순서대로 writes 를 나열한다(중간값 포함).
func plan_apply_stats() -> Dictionary:
	_fail = ""
	var missing := _missing_providers()
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	var p := _read_container(PROVIDER_PLAYER)
	var stats := _read_container(PROVIDER_STATS)
	var passives := _read_container(PROVIDER_PASSIVES)
	var inv := _read_container(PROVIDER_INVENTORY)
	if _fail != "":
		return _not_ready(_fail)
	var eq := _equipped(inv)
	if _fail != "":
		return _not_ready(_fail)

	# @28566-28567
	var eq_dex: float = 0.0
	var eq_int: float = 0.0
	for sl in AffixReader.SLOT_NAMES:
		var it: Variant = _slot(eq, sl)
		if AffixReader.js_truthy(it):
			eq_dex += _plus_or0(it, "bDex")
			eq_int += _plus_or0(it, "bInt")
	# @28568-28569
	var lb: float = _lv_b()
	var s_dex: float = _stats_add(stats, "dex", eq_dex) + lb + _int32(_eq_affix("dexFlat"))
	var s_int: float = _stats_add(stats, "int", eq_int) + lb + _int32(_eq_affix("intFlat"))
	# @28577-28581
	var total_bonus_mp: float = 0.0
	var enh_mp: float = 0.0
	for sl in DEF_SLOTS:
		var dit: Variant = _slot(eq, sl)
		if AffixReader.js_truthy(dit):
			total_bonus_mp += _plus_or0(dit, "bonusMp")
			if _to_num(dit, "enh") > 0.0 and MP_ENH_SLOTS.has(sl):
				enh_mp += _to_num(dit, "enh") * 0.2
	if _fail != "":
		return _not_ready(_fail)

	var writes: Array[Dictionary] = []
	# @28591
	var st_r: float = 0.05 + s_dex * 0.005
	writes.append(_w("stR", st_r, "game.html:28591", "P.stR=.05+s.dex*.005"))
	# @28593
	var mmp: float = _int32(100.0 + s_int * 2.0 + total_bonus_mp + _eq_affix("maxMPFlat") + enh_mp)
	writes.append(_w("mmp", mmp, "game.html:28593", "P.mmp=~~(100+s.int*2+_totalBonusMp+_eqAffix('maxMPFlat')+_enhMp)"))
	# @28594
	var mp_r: float = 0.05 + s_int * 0.005
	writes.append(_w("mpR", mp_r, "game.html:28594", "P.mpR=.05+s.int*.005"))
	# @28596-28600
	var cr: Dictionary = {}
	for k in CR_INIT_KEYS:
		cr[k] = 0.0
	for sl in AffixReader.SLOT_NAMES:
		var it: Variant = _slot(eq, sl)
		if not AffixReader.js_truthy(it) or not AffixReader.js_truthy(_prop_val(it, "crystals")):
			continue
		var crs: Variant = _prop_val(it, "crystals")
		if crs is Array:
			for ci in crs.size():
				var c: Variant = crs[ci]
				if AffixReader.js_truthy(c):
					_accumulate_crystal(cr, it, ci, c)
					if _fail != "":
						return _not_ready(_fail)
		elif crs is String or crs is StringName or crs is Object or _prop_has(crs, "length"):
			_set_fail("unsupported_crystals_shape:" + sl)
		# number/bool/length 없는 Dictionary: .length=undefined → 0회 반복
		if _fail != "":
			return _not_ready(_fail)
	writes.append(_w("_crystalStats", cr, "game.html:28600", "P._crystalStats=_cr"))
	# @28606-28607
	mp_r += float(cr["mpR"]) / 60.0
	writes.append(_w("mpR", mp_r, "game.html:28606", "P.mpR+=_cr.mpR/60"))
	st_r += float(cr["stR"]) / 60.0
	writes.append(_w("stR", st_r, "game.html:28607", "P.stR+=_cr.stR/60"))
	# @28608
	mmp = _int32(mmp + _int32(float(cr["mp"]))) + _or0_num(passives, "pHuman") * 100.0 + _grit_total()
	writes.append(_w("mmp", mmp, "game.html:28608", "P.mmp=~~(P.mmp+~~_cr.mp)+(PASSIVES.pHuman||0)*100+_gritMpFlat()"))
	var mp: float = _js_min(_to_num(p, "mp"), mmp)
	writes.append(_w("mp", mp, "game.html:28608", "P.mp=Math.min(P.mp,P.mmp)"))
	# @28610-28611
	var v_lv: float = _or0_num(passives, "pVital")
	if v_lv > 0.0:
		mmp += v_lv * 50.0
		writes.append(_w("mmp", mmp, "game.html:28611", "P.mmp+=_vLv*50"))
		mp = _js_min(mp, mmp)
		writes.append(_w("mp", mp, "game.html:28611", "P.mp=Math.min(P.mp,P.mmp)"))
		mp_r *= (1.0 + v_lv * 0.01)
		writes.append(_w("mpR", mp_r, "game.html:28611", "P.mpR*=(1+_vLv*0.01)"))
	# @28613-28614
	var s_lv: float = _or0_num(passives, "pStamina")
	if s_lv > 0.0:
		st_r *= (1.0 + s_lv * 0.01)
		writes.append(_w("stR", st_r, "game.html:28614", "P.stR*=(1+_sLv*0.01)"))
	if _fail != "":
		return _not_ready(_fail)
	var values := { "stR": st_r, "mmp": mmp, "mpR": mp_r, "mp": mp, "_crystalStats": cr, "s_dex": s_dex, "s_int": s_int }
	return _finish_plan(KIND_APPLY_STATS, "game.html:28564-28614", writes, values)


# ───────────────────────── phase 2: recalcSt ─────────────────────────

## 원 recalcSt 첫 줄의 캐시 무효화. consumer(ENGINE/ITEM)가 실제 affix/eqStat 캐시 소유자에서 실행해야 한다.
static func invalidate_packet() -> Dictionary:
	return {
		"kind": KIND_INVALIDATE, "source": "game.html:16934",
		"targets": ["_eqAffixCache", "_eqStatCache"], "writes": [],
	}


## 순수 계획. 반드시 invalidate_packet 실행 *후* 호출(원 순서). P._crystalStats/P.st 는 현재 P 에서 읽는다.
func plan_recalc_st() -> Dictionary:
	_fail = ""
	var missing := _missing_providers()
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	var p := _read_container(PROVIDER_PLAYER)
	var stats := _read_container(PROVIDER_STATS)
	var passives := _read_container(PROVIDER_PASSIVES)
	var inv := _read_container(PROVIDER_INVENTORY)
	if _fail != "":
		return _not_ready(_fail)
	var eq := _equipped(inv)
	if _fail != "":
		return _not_ready(_fail)
	var base: float = 100.0 + _to_num(stats, "dex") * 2.0
	var bonus: float = 0.0
	var enh_st2: float = 0.0
	for sl in AffixReader.SLOT_NAMES:
		var it: Variant = _slot(eq, sl)
		if AffixReader.js_truthy(it):
			if AffixReader.js_truthy(_prop_val(it, "bonusSt")):
				bonus += _plus_or0(it, "bonusSt")
			if _to_num(it, "enh") > 0.0 and ST_ENH_SLOTS.has(sl):
				enh_st2 += _to_num(it, "enh") * 0.2
	var cs_st: float = 0.0
	var cs: Variant = _prop_val(p, "_crystalStats")
	if AffixReader.js_truthy(cs):
		if cs is Object:
			_set_fail("unsupported_shape:P._crystalStats")
		else:
			cs_st = _int32(_to_num(cs, "st"))
	if _fail != "":
		return _not_ready(_fail)
	var mst: float = _int32(base + bonus + _eq_affix("maxSTFlat") + cs_st + enh_st2) \
		+ _or0_num(passives, "pHuman") * 100.0 + _or0_num(passives, "pStamina") * 50.0 + _grit_total()
	var st: float = _js_min(_to_num(p, "st"), mst)
	if _fail != "":
		return _not_ready(_fail)
	var writes: Array[Dictionary] = [
		_w("mst", mst, "game.html:16939", "P.mst=~~(base+bonus+_eqAffix('maxSTFlat')+~~(P._crystalStats?P._crystalStats.st:0)+_enhSt2)+(PASSIVES.pHuman||0)*100+(PASSIVES.pStamina||0)*50+_gritStFlat()"),
		_w("st", st, "game.html:16939", "P.st=Math.min(P.st,P.mst)"),
	]
	return _finish_plan(KIND_RECALC_ST, "game.html:16933-16940", writes, { "mst": mst, "st": st })


# ───────────────────────── dispatch ─────────────────────────

func _dispatch(packet: Dictionary) -> bool:
	var ack: Variant = _sink.call(packet.duplicate(true))
	_dispatch_count += 1
	return ack is bool and bool(ack)


## 원 applyStats 자원 부분 → recalcSt 를 원 phase 순서로 sink 에 공급:
##   [KIND_APPLY_STATS] → [KIND_INVALIDATE] → (현재 P/캐시 재읽기) → [KIND_RECALC_ST]
func run_apply_stats() -> Dictionary:
	var dispatched: Array[String] = []
	var out := { "dispatched": dispatched, "phase1": null, "phase2": null }
	if not _sink.is_valid():
		out.merge(_not_ready("resource_sink_missing"), true)
		_last = out.duplicate(true)
		return out
	var p1 := plan_apply_stats()
	out["phase1"] = p1
	if str(p1["status"]) != READY:
		out.merge({ "status": p1["status"], "ready": false, "reason": p1["reason"] }, true)
		_last = out.duplicate(true)
		return out
	var p1_packet: Dictionary = p1["packet"]
	dispatched.append(KIND_APPLY_STATS)
	if not _dispatch(p1_packet):
		out.merge({ "status": SINK_REJECTED, "ready": false, "reason": "sink_rejected:" + KIND_APPLY_STATS }, true)
		_last = out.duplicate(true)
		return out
	var r2 := run_recalc_st()
	out["phase2"] = r2
	var d2: Array = r2["dispatched"]
	for k: Variant in d2:
		dispatched.append(str(k))
	if str(r2["status"]) == READY:
		out.merge({ "status": READY, "ready": true, "reason": "" }, true)
	elif str(r2["status"]) == SINK_REJECTED:
		out.merge({ "status": SINK_REJECTED, "ready": false, "reason": r2["reason"] }, true)
	else:
		out.merge({ "status": PARTIAL_AFTER_APPLY_STATS, "ready": false, "reason": r2["reason"] }, true)
	_last = out.duplicate(true)
	return out


## 원 recalcSt 단독 호출 지점용: [KIND_INVALIDATE] → plan_recalc_st → [KIND_RECALC_ST]
func run_recalc_st() -> Dictionary:
	var dispatched: Array[String] = []
	var out := { "dispatched": dispatched, "plan": null }
	if not _sink.is_valid():
		out.merge(_not_ready("resource_sink_missing"), true)
		return out
	var missing := _missing_providers()
	if not missing.is_empty():
		out.merge(_not_ready("not_ready:" + ",".join(PackedStringArray(missing))), true)
		return out
	dispatched.append(KIND_INVALIDATE)
	if not _dispatch(invalidate_packet()):
		out.merge({ "status": SINK_REJECTED, "ready": false, "reason": "sink_rejected:" + KIND_INVALIDATE }, true)
		return out
	var plan := plan_recalc_st()
	out["plan"] = plan
	if str(plan["status"]) != READY:
		out.merge({ "status": plan["status"], "ready": false, "reason": plan["reason"] }, true)
		return out
	var packet: Dictionary = plan["packet"]
	dispatched.append(KIND_RECALC_ST)
	if not _dispatch(packet):
		out.merge({ "status": SINK_REJECTED, "ready": false, "reason": "sink_rejected:" + KIND_RECALC_ST }, true)
		return out
	out.merge({ "status": READY, "ready": true, "reason": "" }, true)
	return out


# ───────────────────────── 현재 P 읽기 (복원/현재값 — 파생 아님) ─────────────────────────

## 외부 실 current P reader 가 돌려주는 원값 그대로. 누락/비유한 → NOT_READY, 보충 0.
func read_current_parameters() -> Dictionary:
	_fail = ""
	var p := _read_container(PROVIDER_PLAYER)
	if _fail != "":
		return { "status": NOT_READY, "reason": _fail, "origin": "current_P_reader", "values": {}, "missing": [] }
	var values := {}
	var missing: Array[String] = []
	for f in PARAMETER_FIELDS:
		if not p.has(f):
			missing.append(f)
			continue
		var v: Variant = p[f]
		values[f] = v
		var finite_number: bool = (v is int) or (v is float and not is_nan(float(v)) and not is_inf(float(v)))
		if not finite_number:
			missing.append(f + ":not_finite_number")
	return {
		"status": READY if missing.is_empty() else NOT_READY,
		"reason": "" if missing.is_empty() else "fields:" + ",".join(PackedStringArray(missing)),
		"origin": "current_P_reader", "values": values, "missing": missing,
	}


## resource_regeneration_source.configure(state_reader=Callable(this,"read_regen_state"), …) 용.
## 현재 P 의 REGEN_STATE_FIELDS 중 존재하는 키만 그대로 반환(누락은 소비자가 field_missing 으로 거부).
func read_regen_state() -> Dictionary:
	var out := {}
	var c := _provider(PROVIDER_PLAYER)
	if not c.is_valid():
		return out
	var v: Variant = c.call()
	if not (v is Dictionary):
		return out
	var p: Dictionary = v
	for f in REGEN_STATE_FIELDS:
		if p.has(f):
			out[f] = p[f]
	return out
