extends RefCounted
##
## player_defense_speed_parameters_source/producer.gd — 원 applyStats 의 DEF/이동속도 parameter 대입
## (baseDef/speed/_oocSpeed) 를 원 source 위치 3개 phase 로 나눈 수동 producer + ordered sink,
## 원 readonly getter pPredSpd()/pDefAdd().
## TASK GODOT-PORT-PLAYER-DEFENSE-SPEED-PARAMETERS-SOURCE-FIRST-20261013
##
## 자체 clock/_process/_physics_process/전역 driver 없음. 상태는 매 호출 provider 에서 현재값으로 읽는다.
## Player/World/P/STATS/PASSIVES/INV 직접 쓰기 0 — 결과는 오직 sink(packet)->bool 로만 나간다.
## provider/필드 누락·미지원 shape → NOT_READY + packet null + dispatch 0. 중립 2/2.6/0/1 보충 0.
## 원식이 NaN/±Infinity 를 산출 → SOURCE_NON_FINITE + dispatch 0 (diagnostic_packet 만).
##
## 원값(R canonical game.html, 읽기전용):
##   mkP boot (@29657)      : baseDef:2, speed:2.6                     — source_boot_parameters() 만, 파생 아님
##   dbRestore (@4004/4009) : P.baseDef=pd.baseDef||2; P.speed=pd.speed||2.6 — save_adapter 소유, 여기선 현재 P 읽기만
##   applyStats (@28564):
##     @28569 s.dex                                  — player_resource_parameters_source 같은-pass plan values.s_dex 소비
##     @28582 P.mhp=…                                — player_health_parameters_source PHASE_INITIAL write 0 (HP 소유)
##     ── PHASE_EARLY (HP initial gap after_write_0 = @28583-28591 안) ──
##     @28583 P.baseDef=2
##     @28589 P.speed=(2.6+s.dex*.005)*(1+(P._altSpd||0)+_eqAffix('movSpeed')+_eqAffix('movSpeedCombat')
##                    +_eqImplicit('_iMovSpd')*.01+pPredSpd()+(P._okSpdBuff>0?P._okSpdMul||0:0)
##                    +(_eqAffix('injuredSpeed')>0&&P.hp<=P.mhp*.5?_eqAffix('injuredSpeed'):0))
##     @28590 P._oocSpeed=_eqAffix('movSpeedOOC')
##     @28592 hpR (HP) … @28596-28600 _cr (resource 공통 stage) … @28601 mhp/hp clamp (HP)
##     ── PHASE_CRYSTAL (HP crystal_mhp gap end = @28602-28604 안) ──
##     @28603 P.baseDef+=~~_cr.def+_eqAffix('defFlat')+~~(_gritTotal()*.5)
##     @28604 P.speed*=(1+_cr.spd*0.01)
##     @28605 hpR (HP) … @28606-28614 resource … @28616-28617 fortify (HP)
##     ── PHASE_ARMOR (HP fortify gap end = @28618-28624 안) ──
##     @28619-28620 _aLv=PASSIVES.pArmor||0; if(_aLv>0){P.baseDef+=_aLv*20}
##   pPredSpd (@28712) : P.hp<=P.mhp*.3?(PASSIVES.pPred||0)*.05:0  — readonly getter(저장 필드 없음)
##   pDefAdd  (@28680) : (P._altDef||0)*30                          — readonly getter(저장 필드 없음)
##   _gritTotal (@28559): 공개 seam player_resource_parameters_source.read_source_grit_total() 1회 소비(재조립 0)
##
## @28589 의 P.mhp 는 HP @28582 가 방금 적용한 현재 P.mhp 이다(직전 applyStats 의 stale 값도, @28601 최종값도 아님).
##   필요 분기에서는 HpInitialGapSeam(HP sink 가 write 0 적용 직후 연다)이 열려 있고 그 값이 현재 P.mhp 와 같을 때만 READY.
##   P.hp 는 @28601 clamp 이전 현재값(unclamped)을 읽는다.
## 유효 STR/VIT 는 이 모듈 어디에도 쓰이지 않는다(DEF 무관, speed 는 @28582 적용 mhp 경유 조건부).
##
## 제외(타 owner): HP/mhp/hpR, MP/ST, shield/poise, atk, eDef, 완전 applyStats orchestrator/Main(ENGINE),
##   damage/movement/frame clock, 스탯 분배/레벨/save 복원, bt().spd 등 이동 시점 소비식, _oocSpeed 이동 적용(@34392).

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const CombatStatFormula := preload("res://port_modules/combat_stat_formula/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"   # 원식 결과 NaN/±Inf — 값 공급 0
const SOURCE_BOOT := "SOURCE_BOOT"               # mkP literal (현재/파생 아님)
const SINK_REJECTED := "SINK_REJECTED"

const ACTION_DISPATCH := "dispatch"
const ACTION_NO_WRITE := "no_write"              # 원 if 가 false — 대입 0, sink 호출 0

## 입력 provenance 구분
const ORIGIN_CURRENT := "current"                # 현재 authority 를 지금 읽은 값
const ORIGIN_DERIVED := "derived"                # 다른 source producer 의 같은 pass 결과
const ORIGIN_NOT_REQUIRED := "not_required"      # 원 분기상 결과에 영향 없음(정확 독립)

const PHASE_EARLY := "apply_stats_def_speed_early"       # @28583-28590
const PHASE_CRYSTAL := "apply_stats_def_speed_crystal"   # @28603-28604
const PHASE_ARMOR := "apply_stats_def_speed_armor"       # @28619-28620
const PHASES: Array[String] = [PHASE_EARLY, PHASE_CRYSTAL, PHASE_ARMOR]

## provider 키 → 원 표현식
const PROVIDER_PLAYER := "player"            # () -> 현재 P Dictionary
const PROVIDER_PASSIVES := "passives"        # () -> 현재 PASSIVES Dictionary (pPred/pArmor)
const PROVIDER_EQ_AFFIX := "eq_affix"        # (id) -> {status,value} = equipment_affix_reader.eq_affix
const PROVIDER_EQ_IMPLICIT := "eq_implicit"  # (stat) -> {status,value} = combat_stat_formula.eq_implicit
const PROVIDER_GRIT_TOTAL := "grit_total"    # () -> {status,value} = player_resource_parameters_source.read_source_grit_total
const PROVIDER_RESOURCE_PLAN := "resource_plan"  # () -> 같은 pass 에 이미 계산된 player_resource_parameters_source.plan_apply_stats() 결과
## 조건부: HP initial after_write_0 gap seam. () -> {status:"READY", phase:"game.html:28582", value, pass_id}
## (PASSIVES.pPred||0)*.05 != 0 또는 _eqAffix('injuredSpeed')>0 일 때만 호출(그 외 원 결과가 mhp 와 무관).
const PROVIDER_HP_MHP_28582 := "hp_mhp_28582"
const HP_PHASE := "game.html:28582"

const PHASE_PROVIDERS := {
	PHASE_EARLY: [PROVIDER_PLAYER, PROVIDER_PASSIVES, PROVIDER_EQ_AFFIX, PROVIDER_EQ_IMPLICIT, PROVIDER_RESOURCE_PLAN],
	PHASE_CRYSTAL: [PROVIDER_PLAYER, PROVIDER_EQ_AFFIX, PROVIDER_GRIT_TOTAL, PROVIDER_RESOURCE_PLAN],
	PHASE_ARMOR: [PROVIDER_PLAYER, PROVIDER_PASSIVES],
}
const CONDITIONAL_PROVIDERS: Array[String] = [PROVIDER_HP_MHP_28582]

const PHASE_SOURCE := {
	PHASE_EARLY: "game.html:28583-28590",
	PHASE_CRYSTAL: "game.html:28603-28604",
	PHASE_ARMOR: "game.html:28619-28620",
}

## 원 source 위치 schedule (중앙 orchestrator 가 이 위치에서 run_phase 를 호출해야 한다)
const SOURCE_SCHEDULE := [
	{ "phase": PHASE_EARLY, "source": "game.html:28583-28590",
		"host": "player_health_parameters_source apply_stats_health_initial gap after_write_0 (game.html:28583-28591)",
		"after": "game.html:28582 P.mhp (HP write 0 applied)", "before": "game.html:28592 P.hpR (HP write 1)" },
	{ "phase": PHASE_CRYSTAL, "source": "game.html:28603-28604",
		"host": "player_health_parameters_source apply_stats_health_crystal_mhp gap end (game.html:28602-28604)",
		"after": "game.html:28601 P.mhp/P.hp clamp (+28602 baseAtk, 타 owner)", "before": "game.html:28605 P.hpR" },
	{ "phase": PHASE_ARMOR, "source": "game.html:28619-28620",
		"host": "player_health_parameters_source apply_stats_health_fortify gap end (game.html:28618-28624)",
		"after": "game.html:28616-28617 pFortify", "before": "game.html:28622 mshield (타 owner)" },
]

const MISSING_UPSTREAM := {
	"current_P": "현재 P hp/mhp/_altSpd/_okSpdBuff/_okSpdMul/_altDef/baseDef/speed/_oocSpeed authority — ENGINE",
	"current_PASSIVES": "현재 PASSIVES authority (player_passives_source.read_current_passives 래핑) — BUILD/ENGINE",
	"resource_plan_epoch": "같은 applyStats pass 1회 계산된 resource plan 공유 supplier(HP/DEF/shield 공용) — ENGINE",
	"hp_gap_host": "HP sink 의 after_write_0 gap 에서 HpInitialGapSeam open/close + PHASE_EARLY 실행 — ENGINE SourceRoot",
	"install_sink": "packet 을 P 에 적용하는 sink + 원 applyStats call-site/전체 orchestrator — ENGINE",
}

const PARAMETER_FIELDS: Array[String] = ["baseDef", "speed", "_oocSpeed"]
const SCOPE := { "main_ready": false, "full_apply_stats": false, "owns_clock": false }


## HP initial packet 의 after_write_0 gap 표지. 중앙 HP sink 가 write 0(mhp@28582) 을 실제 P 에 적용한 직후 open,
## write 1(hpR@28592) 적용 전 close. 값 생성 0 — sink 가 적용한 값만 기록.
class HpInitialGapSeam extends RefCounted:
	var _open: bool = false
	var _value: Variant = null
	var _pass_id: Variant = null

	func open(applied_mhp: Variant, pass_id: Variant) -> void:
		_open = true
		_value = applied_mhp
		_pass_id = pass_id

	func close() -> void:
		_open = false
		_value = null
		_pass_id = null

	func is_open() -> bool:
		return _open

	func read() -> Dictionary:
		if not _open:
			return { "status": "NOT_READY", "phase": "game.html:28582", "value": null, "pass_id": null,
				"reason": "hp_28582_gap_closed" }
		return { "status": "READY", "phase": "game.html:28582", "value": _value, "pass_id": _pass_id,
			"reason": "", "source": "player_health_parameters_source apply_stats_health_initial after_write_0 (applied)" }


var _providers: Dictionary = {}
var _sink: Callable = Callable()
var _owners: Array[Object] = []  # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _coerce: AffixReader = AffixReader.new()  # JS ToNumber 재사용 (inventory reader 미바인딩 — 계산 전용)
var _fail: String = ""
var _dispatch_count: int = 0
var _hp_call_count: int = 0
var _grit_call_count: int = 0
var _last: Dictionary = {}

## 현재 pass (원 applyStats 1회). PHASE_EARLY run 이 새 pass 를 연다.
var _pass_id: int = 0
var _done: String = ""
var _acked: Dictionary = {}


# ───────────────────────── boot (원 provenance 만) ─────────────────────────

## 원 mkP literal. 현재 P/파생값이 아니며 READY 로 승격하거나 누락 입력 fallback 으로 쓰지 않는다.
static func source_boot_parameters() -> Dictionary:
	return {
		"status": SOURCE_BOOT,
		"source": "game.html:29657 mkP()",
		"derived": false,
		"current": false,
		"values": { "baseDef": 2.0, "speed": 2.6 },
	}


static func source_schedule() -> Array:
	return SOURCE_SCHEDULE.duplicate(true)


# ───────────────────────── configure / readiness ─────────────────────────

## providers: PROVIDER_* → Callable, sink: Callable(packet)->bool
func configure(providers: Dictionary, sink: Callable) -> Dictionary:
	_providers = providers.duplicate()
	_sink = sink
	_owners.clear()
	_retain(sink)
	for key: Variant in _providers:
		var v: Variant = _providers[key]
		if v is Callable:
			_retain(v)
	_configured = true
	_reset_pass()
	return readiness()


func clear() -> void:
	_providers = {}
	_sink = Callable()
	_owners.clear()
	_configured = false
	_reset_pass()


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


func _reset_pass() -> void:
	_done = ""
	_acked = {}


func dispatch_count() -> int:
	return _dispatch_count


## HP gap seam 호출 횟수 (조건부 독립 검증용)
func hp_call_count() -> int:
	return _hp_call_count


## read_source_grit_total 호출 횟수 (원 @28603 1회)
func grit_call_count() -> int:
	return _grit_call_count


func last_result() -> Dictionary:
	return _last.duplicate(true)


func stage_state() -> Dictionary:
	return { "pass_id": _pass_id, "done": _done, "acked": _acked.duplicate(), "complete": _done == PHASE_ARMOR }


func _provider(key: String) -> Callable:
	var v: Variant = _providers.get(key, null)
	if v is Callable:
		var c: Callable = v
		if c.is_valid():
			return c
	return Callable()


func _missing_for(phase: String) -> Array[String]:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	var keys: Array = PHASE_PROVIDERS[phase]
	for key: Variant in keys:
		if not _provider(str(key)).is_valid():
			missing.append("provider:" + str(key))
	return missing


## 바인딩 준비도(값 호출 없음). hp_mhp_28582 는 원 분기상 필요할 때만 → conditional.
func readiness() -> Dictionary:
	var phases := {}
	var all_missing: Array[String] = []
	for ph in PHASES:
		var m := _missing_for(ph)
		phases[ph] = { "ready": m.is_empty(), "missing": m }
		for x in m:
			if not all_missing.has(x):
				all_missing.append(x)
	if not _sink.is_valid():
		all_missing.append("sink")
	var conditional: Array[String] = []
	for key in CONDITIONAL_PROVIDERS:
		if not _provider(key).is_valid():
			conditional.append("provider:" + key)
	return {
		"ready": all_missing.is_empty(),
		"status": READY if all_missing.is_empty() else NOT_READY,
		"missing": all_missing, "phases": phases,
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
	return null


## +o.key (absent → undefined → NaN)
func _to_num(o: Variant, key: String) -> float:
	return _coerce.js_to_number(_prop_val(o, key), _prop_has(o, key))


## (o.key||0) 를 * 또는 비교 피연산자로 쓸 때 (ToNumber 강제 — 문자열 허용)
func _or0_num(o: Variant, key: String) -> float:
	var v: Variant = _prop_val(o, key)
	if not AffixReader.js_truthy(v):
		return 0.0
	return _coerce.js_to_number(v, true)


## (o.key||0) 를 + 피연산자로 쓸 때. truthy 문자열/객체/배열은 원에서 문자열 연결 → 미지원 NOT_READY.
func _or0_add(o: Variant, key: String) -> float:
	var v: Variant = _prop_val(o, key)
	if not AffixReader.js_truthy(v):
		return 0.0
	if v is bool:
		return 1.0
	if v is int or v is float:
		return float(v)
	_set_fail("unsupported_js_plus_operand:P." + key)
	return 0.0


static func _int32(f: float) -> float:
	return float(CombatStatFormula.js_to_int32(f))


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


## 현재 P 필수 유한 숫자 필드(기본값 없음).
func _required_number(p: Dictionary, field: String) -> float:
	if not p.has(field):
		_set_fail("current_P_%s_missing" % field)
		return 0.0
	var v: Variant = p[field]
	if not (v is int or v is float) or not is_finite(float(v)):
		_set_fail("current_P_%s_not_finite_number" % field)
		return 0.0
	return float(v)


## 후속 phase: 현재 P.field 가 이 pass 의 ack 값과 같아야 한다(원 순서 provenance).
func _acked_current(p: Dictionary, field: String) -> float:
	var n: float = _required_number(p, field)
	if _fail != "":
		return 0.0
	if not _acked.has(field):
		_set_fail("stage_missing_ack:" + field)
		return 0.0
	if n != float(_acked[field]):
		_set_fail("current_P.%s_diverged_from_stage" % field)
		return 0.0
	return n


func _require_after(phase: String) -> bool:
	var i: int = PHASES.find(phase)
	var need: String = PHASES[i - 1]
	if _done != need:
		_set_fail("stage_order:%s requires %s in pass %d (done=%s)" % [phase, need, _pass_id, _done if _done != "" else "none"])
		return false
	return true


## {status,value} 계약 소비. READY + 유한 숫자만 값 — 그 외는 0 으로 숨기지 않고 실패.
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


## 원 _eqAffix(id) — equipment_affix_reader.eq_affix
func _eq_affix(id: String) -> float:
	var c := _provider(PROVIDER_EQ_AFFIX)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_EQ_AFFIX)
		return 0.0
	return _ready_number(PROVIDER_EQ_AFFIX, c.call(id), id)


## 원 _eqImplicit(stat) — combat_stat_formula.eq_implicit
func _eq_implicit(stat: String) -> float:
	var c := _provider(PROVIDER_EQ_IMPLICIT)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_EQ_IMPLICIT)
		return 0.0
	return _ready_number(PROVIDER_EQ_IMPLICIT, c.call(stat), stat)


## 원 _gritTotal() — 공개 seam read_source_grit_total() 1회. READY 유한값만(0 포함), 그 외 NOT_READY.
func _grit_total() -> float:
	var c := _provider(PROVIDER_GRIT_TOTAL)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_GRIT_TOTAL)
		return 0.0
	_grit_call_count += 1
	var f: float = _ready_number(PROVIDER_GRIT_TOTAL, c.call(), "_gritTotal()")
	if _fail == "" and not is_finite(f):
		_set_fail("grit_total_non_finite")
	return f


## 같은 pass 에 이미 계산·공급된 resource plan 의 values. 이 producer 는 plan 을 새로 생성하지 않는다.
## READY 또는 SOURCE_NON_FINITE(원식대로 계산된 values 존재) 만 소비. NOT_READY → 실패(재계산 0).
func _resource_values() -> Dictionary:
	var c := _provider(PROVIDER_RESOURCE_PLAN)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_RESOURCE_PLAN)
		return {}
	var r: Variant = c.call()
	if not (r is Dictionary):
		_set_fail("resource_plan_bad_result")
		return {}
	var d: Dictionary = r
	var status: String = str(d.get("status", ""))
	if status != READY and status != SOURCE_NON_FINITE:
		_set_fail("resource_plan_not_ready:" + status + ":" + str(d.get("reason", "")))
		return {}
	var values: Variant = d.get("values", null)
	if not (values is Dictionary):
		_set_fail("resource_plan_values_missing")
		return {}
	var vd: Dictionary = values
	var s_dex: Variant = vd.get("s_dex", null)
	var cr: Variant = vd.get("_crystalStats", null)
	if not (s_dex is int or s_dex is float):
		_set_fail("resource_plan_s_dex_missing")
		return {}
	if not (cr is Dictionary):
		_set_fail("resource_plan_crystal_stats_missing")
		return {}
	var crd: Dictionary = cr
	for k: String in ["def", "spd"]:
		var cv: Variant = crd.get(k, null)
		if not (cv is int or cv is float):
			_set_fail("resource_plan_crystal_stats_field:" + k)
			return {}
	return { "status": status, "s_dex": float(s_dex), "cr_def": float(crd["def"]), "cr_spd": float(crd["spd"]) }


## HP initial after_write_0 gap 의 적용 mhp. seam 이 열려 있고(=@28582 write 적용 직후) 그 값이 현재 P.mhp 와
## 같을 때만 현재 P.mhp 를 반환. 닫힌 gap/다른 phase/불일치/비유한 → NOT_READY (stale/최종/boot 대체 0).
func _gap_current_mhp(p: Dictionary) -> float:
	var c := _provider(PROVIDER_HP_MHP_28582)
	if not c.is_valid():
		_set_fail("hp_subphase_unbound:" + HP_PHASE)
		return 0.0
	_hp_call_count += 1
	var r: Variant = c.call()
	if not (r is Dictionary):
		_set_fail("hp_subphase_bad_result")
		return 0.0
	var d: Dictionary = r
	if str(d.get("phase", "")) != HP_PHASE:
		_set_fail("hp_subphase_wrong_phase:" + str(d.get("phase", "")))
		return 0.0
	var applied: float = _ready_number(PROVIDER_HP_MHP_28582, d, HP_PHASE)
	if _fail != "":
		return 0.0
	if not is_finite(applied):
		_set_fail("hp_subphase_non_finite")
		return 0.0
	var cur: float = _required_number(p, "mhp")
	if _fail != "":
		return 0.0
	if cur != applied:
		_set_fail("current_P_mhp_not_28582_applied")
		return 0.0
	return cur


static func _w(field: String, value: Variant, source: String, expr: String) -> Dictionary:
	return { "field": field, "value": value, "source": source, "expr": expr }


func _finish_plan(phase: String, writes: Array[Dictionary], values: Dictionary, inputs: Dictionary) -> Dictionary:
	var packet := { "kind": phase, "pass_id": _pass_id, "source": PHASE_SOURCE[phase], "writes": writes }
	var bad: Array[String] = []
	for w in writes:
		var v: Variant = w["value"]
		if v is float and not is_finite(float(v)):
			var field: String = w["field"]
			if not bad.has(field):
				bad.append(field)
	if not bad.is_empty():
		return { "status": SOURCE_NON_FINITE, "ready": false, "reason": "computed_non_finite:" + ",".join(PackedStringArray(bad)),
			"packet": null, "diagnostic_packet": packet, "values": values, "inputs": inputs }
	return { "status": READY, "ready": true, "reason": "", "packet": packet, "values": values, "inputs": inputs }


# ───────────────────────── 원 readonly getter ─────────────────────────

## 원 pPredSpd() @28712 의 순수 본문. hp/mhp 는 호출자 phase 의 P.hp/P.mhp.
func pred_spd_term(hp: float, mhp: float, passives: Dictionary) -> float:
	var pred: float = _or0_num(passives, "pPred") * 0.05
	return pred if hp <= mhp * 0.3 else 0.0


## 원 pPredSpd() — applyStats 밖 call-site 용 현재값 getter. 현재 P.hp/P.mhp/PASSIVES.pPred 를 그대로 읽는다.
func p_pred_spd() -> Dictionary:
	_fail = ""
	var p := _read_container(PROVIDER_PLAYER)
	var passives := _read_container(PROVIDER_PASSIVES)
	var hp: float = 0.0
	var mhp: float = 0.0
	if _fail == "":
		hp = _required_number(p, "hp")
		mhp = _required_number(p, "mhp")
	if _fail != "":
		return { "status": NOT_READY, "value": null, "reason": _fail, "source": "game.html:28712 pPredSpd()" }
	var v: float = pred_spd_term(hp, mhp, passives)
	return { "status": READY if not is_nan(v) else SOURCE_NON_FINITE, "value": v, "reason": "",
		"origin": ORIGIN_CURRENT, "source": "game.html:28712 pPredSpd()" }


## 원 pDefAdd() @28680 = (P._altDef||0)*30. readonly getter(저장 필드 없음).
func p_def_add() -> Dictionary:
	_fail = ""
	var p := _read_container(PROVIDER_PLAYER)
	if _fail != "":
		return { "status": NOT_READY, "value": null, "reason": _fail, "source": "game.html:28680 pDefAdd()" }
	var alt: Variant = p.get("_altDef", null)
	if alt is Object or alt is Array:
		return { "status": NOT_READY, "value": null, "reason": "unsupported_shape:P._altDef", "source": "game.html:28680 pDefAdd()" }
	var v: float = _or0_num(p, "_altDef") * 30.0
	return { "status": READY if is_finite(v) else SOURCE_NON_FINITE, "value": v, "reason": "",
		"origin": ORIGIN_CURRENT, "source": "game.html:28680 pDefAdd()" }


# ───────────────────────── plans (순수 — 쓰기/sink 0) ─────────────────────────

func plan_phase(phase: String) -> Dictionary:
	match phase:
		PHASE_EARLY:
			return plan_early()
		PHASE_CRYSTAL:
			return plan_crystal()
		PHASE_ARMOR:
			return plan_armor()
	return _not_ready("unknown_phase:" + phase)


## @28583-28590. HP initial after_write_0 gap 안에서 계산·적용해야 한다(현재 P.mhp=@28582 적용값, P.hp=@28601 이전).
func plan_early() -> Dictionary:
	_fail = ""
	var missing := _missing_for(PHASE_EARLY)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	var p := _read_container(PROVIDER_PLAYER)
	var passives := _read_container(PROVIDER_PASSIVES)
	if _fail != "":
		return _not_ready(_fail)
	var rv := _resource_values()
	if _fail != "":
		return _not_ready(_fail)
	var s_dex: float = rv["s_dex"]
	var writes: Array[Dictionary] = []
	# @28583
	writes.append(_w("baseDef", 2.0, "game.html:28583", "P.baseDef=2"))
	# @28589 — 좌결합 순서·호출 순서 보존
	var alt_spd: float = _or0_add(p, "_altSpd")
	var mov: float = _eq_affix("movSpeed")
	var mov_c: float = _eq_affix("movSpeedCombat")
	var im: float = _eq_implicit("_iMovSpd")
	if _fail != "":
		return _not_ready(_fail)
	# pPredSpd(): (PASSIVES.pPred||0)*.05 가 0 이면 두 분기 모두 0 → mhp/P.hp 와 정확히 독립
	var pred_val: float = _or0_num(passives, "pPred") * 0.05
	var need_hp_pred: bool = pred_val != 0.0 or is_nan(pred_val)
	var hp: float = 0.0
	var mhp: float = 0.0
	var hp_read: bool = false
	if need_hp_pred:
		hp = _required_number(p, "hp")
		if _fail == "":
			mhp = _gap_current_mhp(p)
		hp_read = true
		if _fail != "":
			return _not_ready(_fail)
	var pred: float = (pred_val if hp <= mhp * 0.3 else 0.0) if need_hp_pred else 0.0
	var ok_term: float = 0.0
	if _to_num(p, "_okSpdBuff") > 0.0:
		ok_term = _or0_add(p, "_okSpdMul")
	var inj: float = _eq_affix("injuredSpeed")
	if _fail != "":
		return _not_ready(_fail)
	var inj_term: float = 0.0
	if inj > 0.0:
		if not hp_read:
			hp = _required_number(p, "hp")
			if _fail == "":
				mhp = _gap_current_mhp(p)
			hp_read = true
			if _fail != "":
				return _not_ready(_fail)
		if hp <= mhp * 0.5:
			inj_term = _eq_affix("injuredSpeed")
	if _fail != "":
		return _not_ready(_fail)
	var sum: float = 1.0 + alt_spd
	sum += mov
	sum += mov_c
	sum += im * 0.01
	sum += pred
	sum += ok_term
	sum += inj_term
	var speed: float = (2.6 + s_dex * 0.005) * sum
	writes.append(_w("speed", speed, "game.html:28589",
		"P.speed=(2.6+s.dex*.005)*(1+(P._altSpd||0)+_eqAffix('movSpeed')+_eqAffix('movSpeedCombat')+_eqImplicit('_iMovSpd')*.01+pPredSpd()+(P._okSpdBuff>0?P._okSpdMul||0:0)+(_eqAffix('injuredSpeed')>0&&P.hp<=P.mhp*.5?_eqAffix('injuredSpeed'):0))"))
	# @28590
	var ooc: float = _eq_affix("movSpeedOOC")
	if _fail != "":
		return _not_ready(_fail)
	writes.append(_w("_oocSpeed", ooc, "game.html:28590", "P._oocSpeed=_eqAffix('movSpeedOOC')"))
	var inputs := {
		"s_dex": { "origin": ORIGIN_DERIVED, "value": s_dex, "upstream_status": rv["status"],
			"source": "player_resource_parameters_source supplied plan game.html:28569" },
		"P.hp": { "origin": ORIGIN_CURRENT if hp_read else ORIGIN_NOT_REQUIRED, "value": hp if hp_read else null,
			"source": "current P before game.html:28601 clamp" },
		"P.mhp": { "origin": ORIGIN_CURRENT if hp_read else ORIGIN_NOT_REQUIRED, "value": mhp if hp_read else null,
			"source": "current P = applied " + HP_PHASE + " (HP initial gap after_write_0)" },
	}
	var values := {
		"baseDef": 2.0, "speed": speed, "_oocSpeed": ooc, "hp_subphase_required": hp_read,
		"speed_terms": { "base": 2.6 + s_dex * 0.005, "altSpd": alt_spd, "movSpeed": mov, "movSpeedCombat": mov_c,
			"iMovSpd": im, "pPredSpd": pred, "okSpd": ok_term, "injuredSpeed": inj_term, "sum": sum },
	}
	return _finish_plan(PHASE_EARLY, writes, values, inputs)


## @28603-28604. 현재 P.baseDef/P.speed(=이 pass PHASE_EARLY ack) + 같은 pass resource _cr + 공개 grit seam 1회.
func plan_crystal() -> Dictionary:
	_fail = ""
	var missing := _missing_for(PHASE_CRYSTAL)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	if not _require_after(PHASE_CRYSTAL):
		return _not_ready(_fail)
	var p := _read_container(PROVIDER_PLAYER)
	if _fail != "":
		return _not_ready(_fail)
	var cur_def: float = _acked_current(p, "baseDef")
	var cur_speed: float = _acked_current(p, "speed")
	if _fail != "":
		return _not_ready(_fail)
	var rv := _resource_values()
	if _fail != "":
		return _not_ready(_fail)
	var cr_def: float = rv["cr_def"]
	var cr_spd: float = rv["cr_spd"]
	# @28603 — P.baseDef = P.baseDef + ((~~_cr.def + _eqAffix('defFlat')) + ~~(_gritTotal()*.5))
	var def_flat: float = _eq_affix("defFlat")
	if _fail != "":
		return _not_ready(_fail)
	var gt: float = _grit_total()
	if _fail != "":
		return _not_ready(_fail)
	var base_def: float = cur_def + ((_int32(cr_def) + def_flat) + _int32(gt * 0.5))
	# @28604
	var speed: float = cur_speed * (1.0 + cr_spd * 0.01)
	var writes: Array[Dictionary] = [
		_w("baseDef", base_def, "game.html:28603", "P.baseDef+=~~_cr.def+_eqAffix('defFlat')+~~(_gritTotal()*.5)"),
		_w("speed", speed, "game.html:28604", "P.speed*=(1+_cr.spd*0.01)"),
	]
	var inputs := {
		"_crystalStats": { "origin": ORIGIN_DERIVED, "def": cr_def, "spd": cr_spd,
			"source": "player_resource_parameters_source supplied plan game.html:28600" },
		"_gritTotal": { "origin": ORIGIN_DERIVED, "value": gt,
			"source": "player_resource_parameters_source.read_source_grit_total() game.html:28559" },
		"P.baseDef": { "origin": ORIGIN_CURRENT, "value": cur_def }, "P.speed": { "origin": ORIGIN_CURRENT, "value": cur_speed },
	}
	var values := { "baseDef": base_def, "speed": speed,
		"def_terms": { "cr_def_int": _int32(cr_def), "defFlat": def_flat, "gritTotal": gt, "grit_half_int": _int32(gt * 0.5) } }
	return _finish_plan(PHASE_CRYSTAL, writes, values, inputs)


## @28619-28620. _aLv<=0 → writes [] (원 대입 0, dispatch 0).
func plan_armor() -> Dictionary:
	_fail = ""
	var missing := _missing_for(PHASE_ARMOR)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	if not _require_after(PHASE_ARMOR):
		return _not_ready(_fail)
	var p := _read_container(PROVIDER_PLAYER)
	var passives := _read_container(PROVIDER_PASSIVES)
	if _fail != "":
		return _not_ready(_fail)
	var a_lv: float = _or0_num(passives, "pArmor")
	var writes: Array[Dictionary] = []
	var inputs := {}
	if a_lv > 0.0:
		var cur_def: float = _acked_current(p, "baseDef")
		if _fail != "":
			return _not_ready(_fail)
		inputs["P.baseDef"] = { "origin": ORIGIN_CURRENT, "value": cur_def }
		writes.append(_w("baseDef", cur_def + a_lv * 20.0, "game.html:28620", "P.baseDef+=_aLv*20"))
	return _finish_plan(PHASE_ARMOR, writes, { "a_lv": a_lv }, inputs)


# ───────────────────────── dispatch ─────────────────────────

## phase 실행: plan → (writes 있으면) sink(packet) 1회 → ack 시 pass 진행. PHASE_EARLY 는 새 pass 를 연다.
## 중앙 orchestrator 가 SOURCE_SCHEDULE 의 원 위치에서만 호출한다(이 모듈은 스스로 호출 시점을 만들지 않는다).
func run_phase(phase: String) -> Dictionary:
	var out := { "phase": phase, "action": null, "dispatched": false, "plan": null, "pass_id": _pass_id }
	if not PHASES.has(phase):
		out.merge(_not_ready("unknown_phase:" + phase), true)
		_last = out.duplicate(true)
		return out
	if phase == PHASE_EARLY:
		_pass_id += 1
		_reset_pass()
		out["pass_id"] = _pass_id
	if not _sink.is_valid():
		out.merge(_not_ready("sink_missing"), true)
		_last = out.duplicate(true)
		return out
	var plan := plan_phase(phase)
	out["plan"] = plan
	if str(plan["status"]) != READY:
		out.merge({ "status": plan["status"], "ready": false, "reason": plan["reason"] }, true)
		_last = out.duplicate(true)
		return out
	var packet: Dictionary = plan["packet"]
	var writes: Array = packet["writes"]
	if writes.is_empty():
		_done = phase
		out.merge({ "status": READY, "ready": true, "reason": "", "action": ACTION_NO_WRITE }, true)
		_last = out.duplicate(true)
		return out
	var ack: Variant = _sink.call(packet.duplicate(true))
	_dispatch_count += 1
	out["dispatched"] = true
	out["action"] = ACTION_DISPATCH
	if not (ack is bool and bool(ack)):
		out.merge({ "status": SINK_REJECTED, "ready": false, "reason": "sink_rejected:" + phase }, true)
		_last = out.duplicate(true)
		return out
	for w: Variant in writes:
		var wd: Dictionary = w
		_acked[str(wd["field"])] = wd["value"]
	_done = phase
	out.merge({ "status": READY, "ready": true, "reason": "" }, true)
	_last = out.duplicate(true)
	return out


# ───────────────────────── 현재 P 읽기 (복원/현재값 — 파생 아님) ─────────────────────────

## 현재 P 의 baseDef/speed/_oocSpeed 원값 그대로. 누락/비유한 → NOT_READY, 보충 0.
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
		var finite_number: bool = (v is int) or (v is float and is_finite(float(v)))
		if not finite_number:
			missing.append(f + ":not_finite_number")
	return {
		"status": READY if missing.is_empty() else NOT_READY,
		"reason": "" if missing.is_empty() else "fields:" + ",".join(PackedStringArray(missing)),
		"origin": "current_P_reader", "values": values, "missing": missing,
	}
