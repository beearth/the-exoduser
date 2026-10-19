extends RefCounted
##
## player_effective_stats_source/producer.gd — 원 applyStats 의 P._effStats=s (@28570) 단일 write 를
## 같은 prefix cohort 에서 이미 계산·캡처된 HP initial plan + resource plan 값으로 조립하는 producer + 단일 ordered sink.
## TASK GODOT-PORT-PLAYER-EFFECTIVE-STATS-SOURCE-FIRST-20261013
##
## 자체 clock/_process/_physics_process/input/RNG/UI 없음. HP/resource plan 을 새로 호출하지 않는다(재계산 0).
## Player/World/P/STATS/PASSIVES/INV 직접 쓰기 0 — 결과는 오직 effective_stats_sink(packet)->bool 1회로만 나간다.
## cohort/STATS/라벨 누락·불일치·stale → NOT_READY + packet null + dispatch 0. bound 0 은 유효 0.
##
## 원 R(canonical game.html, 읽기전용):
##   @28566-28567 for(sl of SLOT_NAMES){const it=INV.equipped[sl];if(it){_eqStr+=(+it.bStr||0);_eqDex+=…;_eqInt+=…}}
##   @28568 _lb=_lvB()                           — 1회. HP plan values.lv_b 재사용(새 _lvB 조회 0)
##   @28569 s={str:STATS.str+_eqStr+_lb+~~_eqAffix('strFlat'),   — HP plan values.s_str
##            dex:STATS.dex+_eqDex+_lb+~~_eqAffix('dexFlat'),   — resource plan values.s_dex
##            int:STATS.int+_eqInt+_lb+~~_eqAffix('intFlat'),   — resource plan values.s_int
##            vit:~~_eqAffix('vitFlat'),                         — HP plan values.s_vit
##            lck:STATS.lck+_lb}                                 — 이 모듈 유일 신규 식 (현재 STATS.lck + HP lv_b)
##   @28570 P._effStats=s                         — fresh object 1회 대입 (부분 merge 0). HP@28582/DEF/speed/MP/_cr 보다 앞.
##
## 제외(타 owner): s.str/dex/int/vit 재계산, _eqStat/_eqAffix/_lvB/캐시 재조회, HP/MP/DEF/speed/shield/_crystalStats,
##   STATS/PASSIVES 투자, 장비 재계산, 저장/복원, 렌더, clock.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const HealthParams := preload("res://port_modules/player_health_parameters_source/producer.gd")
const ResourceParams := preload("res://port_modules/player_resource_parameters_source/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"   # 조립 결과 NaN/±Inf — 값 공급 0 (원은 NaN 그대로 대입; 미지원)
const SINK_REJECTED := "SINK_REJECTED"

const KIND := "apply_stats_effective_stats"
const SOURCE := "game.html:28566-28570"
const WRITE_SOURCE := "game.html:28570"
const FIELD := "_effStats"
const KEY_ORDER: Array[String] = ["str", "dex", "int", "vit", "lck"]

## 입력 plan 의 정확 라벨 — 기존 producer 상수 그대로(추측 문자열 0)
const HP_KIND: String = HealthParams.PHASE_INITIAL
const RESOURCE_KIND: String = ResourceParams.KIND_APPLY_STATS

## provider 키
const PROVIDER_COHORT := "cohort"                  # () -> 같은 applyStats prefix 에서 ENGINE 이 캡처한 cohort (아래 schema)
const PROVIDER_CURRENT_COHORT := "current_cohort"  # () -> 현재 applyStats pass 의 cohort_id (ENGINE authority)
const PROVIDER_STATS := "stats"                    # () -> 현재 STATS Dictionary (lck 읽기 + prefix 스냅샷 대조)
const PROVIDER_PLAYER := "player"                  # () -> 현재 P Dictionary (읽기 전용: before / 현재 getter)
const PROVIDER_ORDER: Array[String] = [PROVIDER_COHORT, PROVIDER_CURRENT_COHORT, PROVIDER_STATS, PROVIDER_PLAYER]

## cohort schema (PROVIDER_COHORT 반환):
##   { status:"READY", cohort_id:String|int (비어있지 않음), authority:String, current_main:bool,
##     stats_at_prefix:{str,dex,int,lck} (같은 prefix 에서 HP/resource plan 이 읽은 STATS 스냅샷),
##     hp_initial:{cohort_id, plan:<HealthParams.plan_initial() 결과>},
##     resource_plan:{cohort_id, plan:<ResourceParams.plan_apply_stats() 결과>} }
const STATS_PREFIX_KEYS: Array[String] = ["str", "dex", "int", "lck"]
const HP_VALUE_KEYS: Array[String] = ["s_str", "s_vit", "lv_b"]
const RESOURCE_VALUE_KEYS: Array[String] = ["s_dex", "s_int"]
const RESOURCE_SOURCE := "game.html:28564-28614"   # ResourceParams.plan_apply_stats packet.source (상수 미노출)

const MISSING_UPSTREAM := {
	"cohort_authority": "applyStats prefix(@28566-28570) 에서 HP plan_initial/resource plan_apply_stats 를 각 1회 계산하고 같은 cohort_id 로 캡처·공급하는 SourceRoot — ENGINE",
	"current_cohort": "현재 applyStats pass 의 cohort_id authority (stale 판별) — ENGINE",
	"current_STATS": "현재 STATS(str/dex/int/lck) authority — BUILD",
	"current_P": "native Player 에 _effStats 저장/읽기 authority 없음 — ENGINE",
	"install_sink": "packet 의 단일 _effStats write 를 P 에 적용하고 그 뒤 HP@28582 이하 phase 를 이어가는 call-site — ENGINE",
	"lv_b_cross_check": "resource plan values 에 lv_b 가 노출되지 않아 HP/resource 의 _lvB 동일성은 cohort authority 에 의존",
}

const SCOPE := { "main_ready": false, "full_apply_stats": false, "owns_clock": false }

var _providers: Dictionary = {}
var _sink: Callable = Callable()
var _owners: Array[Object] = []   # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _coerce: AffixReader = AffixReader.new()   # JS ToNumber 재사용 (계산 전용)
var _fail: String = ""
var _dispatch_count: int = 0
var _provider_reads: Array[String] = []        # 마지막 run/plan 의 provider 읽기 순서 (진단)
var _last: Dictionary = {}

var _dispatched_cohorts: Array = []            # sink 호출된 cohort_id (ack 여부 무관 — 재-dispatch 0)
var _acked_cohort: Variant = null
var _acked_value: Dictionary = {}


# ───────────────────────── private fixture cohort (테스트 전용 — current_main=false) ─────────────────────────

## 고정 cohort 공급자. 생성 시 받은 packet 을 deep copy 로 보관. Main/ENGINE authority 아님.
class FixedCohortSupplier extends RefCounted:
	var _cohort: Dictionary = {}
	var _current: Variant = null
	var reads: int = 0

	func _init(cohort: Dictionary, current_id: Variant) -> void:
		_cohort = cohort.duplicate(true)
		_current = current_id

	func read() -> Dictionary:
		reads += 1
		return _cohort.duplicate(true)

	func current_id() -> Variant:
		return _current

	func advance(next_id: Variant) -> void:
		_current = next_id


## 이미 계산된 HP/resource plan 결과로 private cohort 를 만든다(plan 호출 0). current_main=false 고정.
static func private_fixture_cohort(cohort_id: Variant, stats_at_prefix: Dictionary,
		hp_initial_plan: Dictionary, resource_plan: Dictionary) -> Dictionary:
	var snap := {}
	for k in STATS_PREFIX_KEYS:
		if stats_at_prefix.has(k):
			snap[k] = stats_at_prefix[k]
	return {
		"status": READY, "cohort_id": cohort_id, "authority": "private_fixture", "current_main": false,
		"stats_at_prefix": snap,
		"hp_initial": { "cohort_id": cohort_id, "plan": hp_initial_plan.duplicate(true) },
		"resource_plan": { "cohort_id": cohort_id, "plan": resource_plan.duplicate(true) },
	}


# ───────────────────────── configure / readiness ─────────────────────────

## providers: PROVIDER_* → Callable, effective_stats_sink: Callable(packet: Dictionary)->bool
func configure(providers: Dictionary, effective_stats_sink: Callable) -> Dictionary:
	_providers = providers.duplicate()
	_sink = effective_stats_sink
	_owners.clear()
	_retain(effective_stats_sink)
	for key: Variant in _providers:
		var v: Variant = _providers[key]
		if v is Callable:
			_retain(v)
	_configured = true
	_dispatched_cohorts = []
	_acked_cohort = null
	_acked_value = {}
	return readiness()


func clear() -> void:
	_providers = {}
	_sink = Callable()
	_owners.clear()
	_configured = false
	_dispatched_cohorts = []
	_acked_cohort = null
	_acked_value = {}


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


func retained_owner_count() -> int:
	return _owners.size()


func dispatch_count() -> int:
	return _dispatch_count


func provider_reads() -> Array[String]:
	return _provider_reads.duplicate()


func last_result() -> Dictionary:
	return _last.duplicate(true)


func _provider(key: String) -> Callable:
	var v: Variant = _providers.get(key, null)
	if v is Callable:
		var c: Callable = v
		if c.is_valid():
			return c
	return Callable()


func _missing() -> Array[String]:
	var m: Array[String] = []
	if not _configured:
		m.append("not_configured")
	for key in PROVIDER_ORDER:
		if not _provider(key).is_valid():
			m.append("provider:" + key)
	return m


## 바인딩 준비도(값 호출 없음).
func readiness() -> Dictionary:
	var m := _missing()
	if not _sink.is_valid():
		m.append("effective_stats_sink")
	return { "ready": m.is_empty(), "status": READY if m.is_empty() else NOT_READY, "missing": m,
		"missing_upstream": MISSING_UPSTREAM.duplicate() }


## Main 준비도: 이 모듈은 ENGINE cohort authority 를 설치하지 않으므로 항상 NOT_READY (fixture READY 와 분리).
func main_readiness() -> Dictionary:
	return { "status": NOT_READY, "ready": false, "main_ready": false,
		"reason": "external_cohort_authority_absent", "missing_upstream": MISSING_UPSTREAM.duplicate() }


static func _not_ready(reason: String) -> Dictionary:
	return { "status": NOT_READY, "ready": false, "reason": reason, "packet": null }


func _set_fail(reason: String) -> void:
	if _fail == "":
		_fail = reason


# ───────────────────────── input validation ─────────────────────────

func _call_provider(key: String) -> Variant:
	var c := _provider(key)
	if not c.is_valid():
		_set_fail("provider_missing:" + key)
		return null
	_provider_reads.append(key)
	return c.call()


static func _is_id(v: Variant) -> bool:
	if v is String or v is StringName:
		return not String(v).is_empty()
	return v is int


static func _same_id(a: Variant, b: Variant) -> bool:
	return _is_id(a) and _is_id(b) and typeof(a) == typeof(b) and a == b


static func _finite_number(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))


## cohort 섹션({cohort_id, plan}) → plan 의 READY/kind/source 검증 후 values 복사본. 재계산 0.
func _section_values(cohort: Dictionary, section: String, cohort_id: Variant, kind: String,
		expected_source: String, keys: Array[String]) -> Dictionary:
	var sec: Variant = cohort.get(section, null)
	if not (sec is Dictionary):
		_set_fail("cohort_section_missing:" + section)
		return {}
	var sd: Dictionary = sec
	if not _same_id(sd.get("cohort_id", null), cohort_id):
		_set_fail("cohort_mismatch:" + section)
		return {}
	var plan: Variant = sd.get("plan", null)
	if not (plan is Dictionary):
		_set_fail(section + "_plan_missing")
		return {}
	var pd: Dictionary = plan
	var status: String = str(pd.get("status", ""))
	if status != READY:
		_set_fail("%s_not_ready:%s:%s" % [section, status, str(pd.get("reason", ""))])
		return {}
	var packet: Variant = pd.get("packet", null)
	if not (packet is Dictionary):
		_set_fail(section + "_packet_missing")
		return {}
	var pk: Dictionary = packet
	if str(pk.get("kind", "")) != kind:
		_set_fail("%s_wrong_kind:%s" % [section, str(pk.get("kind", ""))])
		return {}
	if str(pk.get("source", "")) != expected_source:
		_set_fail("%s_wrong_source:%s" % [section, str(pk.get("source", ""))])
		return {}
	var values: Variant = pd.get("values", null)
	if not (values is Dictionary):
		_set_fail(section + "_values_missing")
		return {}
	var vd: Dictionary = values
	var out := {}
	for k in keys:
		if not vd.has(k):
			_set_fail("%s_value_missing:%s" % [section, k])
			return {}
		if not _finite_number(vd[k]):
			_set_fail("%s_value_not_finite_number:%s" % [section, k])
			return {}
		out[k] = float(vd[k])
	return out


## STATS.lck + _lb. number/null/bool 만 지원(JS ToNumber). 부재 → undefined 는 authority 누락(0 보충 0).
## String/Array/Object → 원은 문자열 연결 → 미지원 NOT_READY (가짜 0 금지).
func _stats_lck_plus(stats: Dictionary, lb: float) -> float:
	if not stats.has("lck"):
		_set_fail("STATS.lck_missing")
		return 0.0
	var v: Variant = stats["lck"]
	if v == null or v is bool or v is int or v is float:
		return _coerce.js_to_number(v, true) + lb
	_set_fail("unsupported_js_plus_operand:STATS.lck:" + type_string(typeof(v)))
	return 0.0


## 현재 STATS 가 cohort prefix 스냅샷과 같아야 한다(타입+값). 다르면 stale.
func _check_stats_fresh(stats: Dictionary, snap: Dictionary) -> void:
	for k in STATS_PREFIX_KEYS:
		if not stats.has(k):
			_set_fail("STATS.%s_missing" % k)   # undefined+number=NaN — 현재 authority 누락으로 취급
			return
		if not snap.has(k):
			_set_fail("cohort_stats_at_prefix_missing:" + k)
			return
		var a: Variant = stats[k]
		var b: Variant = snap[k]
		if typeof(a) != typeof(b) or a != b:
			_set_fail("stale_cohort:STATS.%s_changed_since_prefix" % k)
			return


# ───────────────────────── plan (순수 — 쓰기/sink 0) ─────────────────────────

## provider 읽기 순서: cohort → current_cohort → stats → player. HP/resource plan 호출 0.
func plan_effective_stats() -> Dictionary:
	_fail = ""
	_provider_reads = []
	var missing := _missing()
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	# cohort (defensive deep copy — 이후 공급자 측 변경이 계획에 새지 않음)
	var cv: Variant = _call_provider(PROVIDER_COHORT)
	if not (cv is Dictionary):
		return _not_ready(_fail if _fail != "" else "cohort_bad_result")
	var cohort: Dictionary = (cv as Dictionary).duplicate(true)
	if str(cohort.get("status", "")) != READY:
		return _not_ready("cohort_not_ready:%s:%s" % [str(cohort.get("status", "")), str(cohort.get("reason", ""))])
	var cohort_id: Variant = cohort.get("cohort_id", null)
	if not _is_id(cohort_id):
		return _not_ready("cohort_id_missing")
	var authority: Variant = cohort.get("authority", null)
	if not (authority is String) or String(authority).is_empty():
		return _not_ready("cohort_authority_missing")
	var cur_main: Variant = cohort.get("current_main", null)
	if not (cur_main is bool):
		return _not_ready("cohort_current_main_not_bool")
	# current cohort (stale 판별)
	var cur_id: Variant = _call_provider(PROVIDER_CURRENT_COHORT)
	if _fail != "":
		return _not_ready(_fail)
	if not _same_id(cur_id, cohort_id):
		return _not_ready("stale_cohort:current=%s cohort=%s" % [str(cur_id), str(cohort_id)])
	if _dispatched_cohorts.has(cohort_id):
		return _not_ready("cohort_already_dispatched:" + str(cohort_id))
	# HP initial / resource plan values (이미 캡처된 것만)
	var hp_source: String = str(HealthParams.PHASE_SOURCE[HealthParams.PHASE_INITIAL])
	var hp := _section_values(cohort, "hp_initial", cohort_id, HP_KIND, hp_source, HP_VALUE_KEYS)
	if _fail != "":
		return _not_ready(_fail)
	var rp := _section_values(cohort, "resource_plan", cohort_id, RESOURCE_KIND, RESOURCE_SOURCE, RESOURCE_VALUE_KEYS)
	if _fail != "":
		return _not_ready(_fail)
	var snap_v: Variant = cohort.get("stats_at_prefix", null)
	if not (snap_v is Dictionary):
		return _not_ready("cohort_stats_at_prefix_missing")
	var snap: Dictionary = snap_v
	# 현재 STATS
	var sv: Variant = _call_provider(PROVIDER_STATS)
	if _fail != "":
		return _not_ready(_fail)
	if not (sv is Dictionary):
		return _not_ready("authority_null:stats" if sv == null else "unsupported_shape:stats")
	var stats: Dictionary = sv
	_check_stats_fresh(stats, snap)
	if _fail != "":
		return _not_ready(_fail)
	# @28569 lck — 유일 신규 식
	var lb: float = hp["lv_b"]
	var lck: float = _stats_lck_plus(stats, lb)
	if _fail != "":
		return _not_ready(_fail)
	# 현재 P (before 진단만)
	var pv: Variant = _call_provider(PROVIDER_PLAYER)
	if _fail != "":
		return _not_ready(_fail)
	if not (pv is Dictionary):
		return _not_ready("authority_null:player" if pv == null else "unsupported_shape:player")
	var p: Dictionary = pv
	# fresh object — key order str,dex,int,vit,lck
	var s := {}
	s["str"] = hp["s_str"]
	s["dex"] = rp["s_dex"]
	s["int"] = rp["s_int"]
	s["vit"] = hp["s_vit"]
	s["lck"] = lck
	var before_present: bool = p.has(FIELD)
	var before: Variant = p.get(FIELD, null)
	if before is Dictionary:
		var bd: Dictionary = before
		before = bd.duplicate(true)
	var write := { "field": FIELD, "value": s, "source": WRITE_SOURCE, "expr": "P._effStats=s",
		"before_present": before_present, "before": before }
	var writes: Array[Dictionary] = [write]
	var packet := { "kind": KIND, "source": SOURCE, "cohort_id": cohort_id, "authority": authority,
		"current_main": cur_main, "writes": writes,
		"gaps": [{ "at": "end", "source": "game.html:28571-28582",
			"owner": "HP@28582(player_health_parameters_source) 이하 DEF/speed/MP/_cr — 이 write 이후" }] }
	var values := { "s": s.duplicate(), "lv_b": lb, "stats_lck": stats["lck"],
		"inputs": { "hp_initial": HP_KIND, "resource_plan": RESOURCE_KIND } }
	for k in KEY_ORDER:
		if not is_finite(float(s[k])):
			return { "status": SOURCE_NON_FINITE, "ready": false, "reason": "computed_non_finite:" + k,
				"packet": null, "diagnostic_packet": packet, "values": values }
	return { "status": READY, "ready": true, "reason": "", "packet": packet, "values": values,
		"main_ready": false }


# ───────────────────────── dispatch ─────────────────────────

## plan → effective_stats_sink(packet) 정확히 1회 → ack 시 cohort 기록. 같은 cohort 재-dispatch 0.
func run_effective_stats() -> Dictionary:
	var out := { "action": null, "dispatched": false, "plan": null, "main_ready": false }
	if not _sink.is_valid():
		out.merge(_not_ready("effective_stats_sink_missing"), true)
		_last = out.duplicate(true)
		return out
	var plan := plan_effective_stats()
	out["plan"] = plan
	out["provider_reads"] = _provider_reads.duplicate()
	if str(plan["status"]) != READY:
		out.merge({ "status": plan["status"], "ready": false, "reason": plan["reason"] }, true)
		_last = out.duplicate(true)
		return out
	var packet: Dictionary = plan["packet"]
	var cohort_id: Variant = packet["cohort_id"]
	_dispatched_cohorts.append(cohort_id)
	var ack: Variant = _sink.call(packet.duplicate(true))
	_dispatch_count += 1
	out["dispatched"] = true
	out["action"] = "dispatch"
	if not (ack is bool and bool(ack)):
		out.merge({ "status": SINK_REJECTED, "ready": false, "reason": "sink_rejected:" + KIND }, true)
		_last = out.duplicate(true)
		return out
	var writes: Array = packet["writes"]
	var w: Dictionary = writes[0]
	_acked_cohort = cohort_id
	_acked_value = (w["value"] as Dictionary).duplicate()
	out.merge({ "status": READY, "ready": true, "reason": "" }, true)
	_last = out.duplicate(true)
	return out


# ───────────────────────── 현재 _effStats 읽기 (파생 아님 — provenance 만) ─────────────────────────

static func _same_eff(a: Dictionary, b: Dictionary) -> bool:
	if a.keys() != b.keys():
		return false
	for k: Variant in a:
		var x: Variant = a[k]
		var y: Variant = b[k]
		if not (x is int or x is float) or not (y is int or y is float) or float(x) != float(y):
			return false
	return true


## 현재 P._effStats 원값 + provenance. 부재를 계획값/0 으로 만들지 않는다.
## READY 는 (a) 현재 P._effStats 가 이 producer 가 ack 받은 값과 키순서·값 동일 (b) 현재 cohort 가 ack cohort 일 때만.
func read_current_effective_stats() -> Dictionary:
	var out := { "status": NOT_READY, "reason": "", "value": null, "provenance": "",
		"acked_cohort": _acked_cohort, "main_ready": false }
	var pc := _provider(PROVIDER_PLAYER)
	if not pc.is_valid():
		out["reason"] = "provider_missing:player"
		return out
	var pv: Variant = pc.call()
	if not (pv is Dictionary):
		out["reason"] = "current_P_unavailable"
		return out
	var p: Dictionary = pv
	if not p.has(FIELD):
		out["reason"] = "P._effStats_absent"
		out["provenance"] = "absent"
		return out
	var raw: Variant = p[FIELD]
	if not (raw is Dictionary):
		out["value"] = raw
		out["reason"] = "P._effStats_not_object"
		out["provenance"] = "current_unsupported"
		return out
	var cur: Dictionary = raw
	out["value"] = cur.duplicate()
	if _acked_cohort == null:
		out["reason"] = "no_acked_write"
		out["provenance"] = "current_unverified"
		return out
	if not _same_eff(cur, _acked_value):
		out["reason"] = "P._effStats_diverged_from_ack"
		out["provenance"] = "current_unverified"
		return out
	var cc := _provider(PROVIDER_CURRENT_COHORT)
	var cur_id: Variant = cc.call() if cc.is_valid() else null
	if not _same_id(cur_id, _acked_cohort):
		out["reason"] = "stale_cohort:current=%s acked=%s" % [str(cur_id), str(_acked_cohort)]
		out["provenance"] = "stale"
		return out
	out["status"] = READY
	out["provenance"] = "stage_acked:cohort_" + str(_acked_cohort)
	return out
