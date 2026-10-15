extends RefCounted
##
## player_health_parameters_source/producer.gd — 원 applyStats 의 HP parameter 파생(mhp/hpR + Math.min 으로 내려가는 hp)
## 을 원 source phase 4개로 나눈 수동 producer + 단일 ordered HP-parameters sink.
## TASK GODOT-PORT-PLAYER-HEALTH-PARAMETERS-SOURCE-FIRST-20261013
##
## 자체 clock/_process/_physics_process/input/RNG/UI 없음. 상태는 매 호출 provider 에서 현재값으로 읽는다.
## Player/World/P/STATS/PASSIVES/INV/G 직접 쓰기 0 — 결과는 오직 health_sink(packet)->bool 로만 나간다.
## provider/필드 누락 → NOT_READY + packet null + dispatch 0. 중립 350/0/.05 보충 0. bound 0 은 유효 0.
##
## 원 R(canonical game.html, 읽기전용):
##   @28567 for(sl of SLOT_NAMES){const it=INV.equipped[sl];if(it){_eqStr+=(+it.bStr||0);…}}
##   @28568 _lb=_lvB()                         — combat_reference_source.lv_b() 소비
##   @28569 s.str=STATS.str+_eqStr+_lb+~~_eqAffix('strFlat'), s.vit=~~_eqAffix('vitFlat')
##   @28570 P._effStats=s                      — 중앙 소유(부분 str/vit 로 덮어쓰기 0, values 진단만)
##   @28573 _diffBaseHp=Math.max(100,300-20*_diffSigned())   — _diffSigned 는 명시 provider (OPT/0 대체 0)
##   @28574 _stgHp=G.on?_diffBaseHp+((G.stage||1)-1)*6:_diffBaseHp
##   @28575 _afHpF=_eqAffix('maxHPFlat'),_afHpP=_eqAffix('maxHPPct')+_eqAffix('lifeMaxHP'),
##          _imHp=_eqImplicit('_iMaxHP'),_imHpP=_eqImplicit('_iMaxHPPct')+_eqImplicit('_iLifeHPPct')
##   @28578-28581 _allDefSlots 14종: if(_dit){_totalBonusHp+=(+_dit.bonusHp||0);
##                if(_dit.enh>0){if(_hpEnhSet.has(sl))_enhHp+=_dit.enh*1.0}}   _hpEnhSet={gloves,pants,boots}
##   @28582 P.mhp=~~((_stgHp+s.str*5+s.vit*3+_totalBonusHp+_afHpF+_imHp+_enhHp)*(1+_afHpP+_imHpP*.01+(PASSIVES.pMelee||0)*.03))
##   @28592 P.hpR=.05+s.str*.002+_eqAffix('lifeRegen')/60
##   @28596-28600 _cr 공통 결정 합산 → P._crystalStats  — player_resource_parameters_source 소유(재합산 0)
##   @28601 P.mhp=~~(P.mhp+~~_cr.hp)+(PASSIVES.pHuman||0)*100+_gritHpFlat();P.hp=Math.min(P.hp,P.mhp)
##   @28605 P.hpR+=_cr.hpR/60
##   @28616-28617 const _fLv=PASSIVES.pFortify||0;if(_fLv>0){P.mhp+=_fLv*300;P.hp=Math.min(P.hp,P.mhp)}
##   @28560 _gritHpFlat()=_gritTotal() (@28559) — 공개 seam player_resource_parameters_source.read_source_grit_total() 소비
##
## phase 순서(원 대입 순서, 사이 gap 은 다른 owner):
##   PHASE_INITIAL      @28582 mhp → [gap 28583-28591] → @28592 hpR   (결정 공급 전에도 단독 사용 가능)
##   PHASE_CRYSTAL_MHP  @28601 mhp, hp                                  (공통 _cr stage 이후)
##   PHASE_CRYSTAL_HPR  @28605 hpR                                       (같은 pass 의 _cr 객체 재사용 — 재조회 0)
##   PHASE_FORTIFY      @28616-28617 mhp, hp  (_fLv<=0 → 원 대입 0, dispatch 0)
## 후속 phase 는 이 producer 의 직전 phase 가 sink ack 된 같은 pass 에서만, 현재 P.mhp/hpR/hp 가 ack 값과 같을 때만 READY.
##
## captured initial (TASK GODOT-PORT-PLAYER-HEALTH-CAPTURED-INITIAL-FIRST-20261014):
##   run_captured_initial(plan) — 같은 prefix 에서 이 producer 의 plan_initial() 이 이미 만든 READY plan 을
##   재계획 없이(source/affix/lv_b/cache 조회 0) run_phase 와 같은 pass open + dispatch + ACK 로직에 태운다.
##   READY plan_initial 결과에만 최상위 provenance envelope plan.capture={issuer,config_epoch,serial,pass_id}
##   (packet/values 불변). 검증: kind/source/envelope 정수 필드·issuer·epoch·serial(최신 1회)/pass/stage 미진행/
##   기록 사본 일치 + 현재 P.mhp/hpR == writes[].before. source API provenance 검사일 뿐 전역 mutex/보안 token 아님.
##   거부(CAPTURE_REJECTED)·authority 부재(NOT_READY) 모두 sink 0, pass/ack 상태 불변.
##
## 제외(타 owner): DEF/poise/baseAtk/speed/shield/MP/ST/recalcSt, 전체 applyStats, 리젠 tick(hp_regeneration_source),
##   피해/부활/포션/레벨업, P._effStats/P._crystalStats 쓰기, 저장/복원, 아이템·결정 생성/RNG, 렌더.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const CombatStatFormula := preload("res://port_modules/combat_stat_formula/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"   # 원식 NaN/±Inf — 값 공급 0 (diagnostic_packet 만)
const SINK_REJECTED := "SINK_REJECTED"
const CAPTURE_REJECTED := "CAPTURE_REJECTED"     # captured initial 이 malformed/stale/foreign/중복 — sink 0

const ACTION_DISPATCH := "dispatch"
const ACTION_NO_WRITE := "no_write"              # 원 if 가 false — 대입 0, sink 호출 0

const PHASE_INITIAL := "apply_stats_health_initial"
const PHASE_CRYSTAL_MHP := "apply_stats_health_crystal_mhp"
const PHASE_CRYSTAL_HPR := "apply_stats_health_crystal_hpR"
const PHASE_FORTIFY := "apply_stats_health_fortify"
const PHASES: Array[String] = [PHASE_INITIAL, PHASE_CRYSTAL_MHP, PHASE_CRYSTAL_HPR, PHASE_FORTIFY]

## provider 키 → 원 표현식
const PROVIDER_PLAYER := "player"              # () -> 현재 P Dictionary (hp/mhp/hpR 읽기)
const PROVIDER_STATS := "stats"                # () -> 현재 STATS Dictionary (str)
const PROVIDER_PASSIVES := "passives"          # () -> 현재 PASSIVES Dictionary (pMelee/pHuman/pFortify)
const PROVIDER_INVENTORY := "inventory"        # () -> 현재 INV Dictionary ({equipped:{slot:item}})
const PROVIDER_G := "g"                        # () -> 현재 G Dictionary (on, on 이면 stage)
const PROVIDER_DIFF_SIGNED := "diff_signed"    # () -> 원 _diffSigned() number | {status,value}
const PROVIDER_EQ_AFFIX := "eq_affix"          # (id) -> {status,value} = equipment_affix_reader.eq_affix
const PROVIDER_EQ_IMPLICIT := "eq_implicit"    # (id) -> {status,value} = combat_stat_formula.eq_implicit
const PROVIDER_LV_B := "lv_b"                  # () -> {status,value} = combat_reference_source.lv_b
const PROVIDER_CRYSTAL_STATS := "crystal_stats"  # () -> {status,value:_cr Dictionary,stage} 공통 결정 stage 결과
const PROVIDER_GRIT_HP_FLAT := "grit_hp_flat"  # () -> {status,value} = 원 _gritHpFlat() (=_gritTotal)

const PHASE_PROVIDERS := {
	PHASE_INITIAL: [PROVIDER_PLAYER, PROVIDER_STATS, PROVIDER_PASSIVES, PROVIDER_INVENTORY, PROVIDER_G,
		PROVIDER_DIFF_SIGNED, PROVIDER_EQ_AFFIX, PROVIDER_EQ_IMPLICIT, PROVIDER_LV_B],
	PHASE_CRYSTAL_MHP: [PROVIDER_PLAYER, PROVIDER_PASSIVES, PROVIDER_CRYSTAL_STATS, PROVIDER_GRIT_HP_FLAT],
	PHASE_CRYSTAL_HPR: [PROVIDER_PLAYER],
	PHASE_FORTIFY: [PROVIDER_PLAYER, PROVIDER_PASSIVES],
}

const PHASE_SOURCE := {
	PHASE_INITIAL: "game.html:28567-28592",
	PHASE_CRYSTAL_MHP: "game.html:28601",
	PHASE_CRYSTAL_HPR: "game.html:28605",
	PHASE_FORTIFY: "game.html:28616-28617",
}

## 각 phase packet 앞/사이/뒤의 원 구간(이 모듈이 쓰지 않음). at: start | after_write_N | end
const PHASE_GAPS := {
	PHASE_INITIAL: [
		{ "at": "start", "source": "game.html:28566-28581", "owner": "공통 prefix: s.dex/int/lck(resource_parameters), P._effStats=s @28570(중앙), bonusShield/bonusMp 누적(shield/resource)" },
		{ "at": "after_write_0", "source": "game.html:28583-28591", "owner": "baseDef/maxPoise/poise/poiseR/baseAtk/speed(@28589 P.hp<=P.mhp*.5 — 새 mhp 읽음)/_oocSpeed/stR — 중앙 nonHP/resource" },
		{ "at": "end", "source": "game.html:28593-28600", "owner": "mmp/mpR(resource_parameters) + _cr 공통 결정 합산·P._crystalStats(공통 stage)" },
	],
	PHASE_CRYSTAL_MHP: [
		{ "at": "end", "source": "game.html:28602-28604", "owner": "baseAtk/baseDef(+_gritTotal()*.5)/speed 결정 — 중앙 nonHP" },
	],
	PHASE_CRYSTAL_HPR: [
		{ "at": "end", "source": "game.html:28606-28615", "owner": "mpR/stR/mmp/mp/pVital/pStamina — resource_parameters" },
	],
	PHASE_FORTIFY: [
		{ "at": "end", "source": "game.html:28618-28624", "owner": "pArmor baseDef/mshield/shield/recalcSt — 중앙/resource" },
	],
}

## production 에 현재 authority/공개 API 가 없는 입력 (외부 주입 필요)
const MISSING_UPSTREAM := {
	"current_P": "native Player 에 hp/mhp/hpR authority 미설치 — ENGINE",
	"current_STATS": "현재 STATS authority — BUILD",
	"current_G": "현재 G.on/G.stage authority — ENGINE/BUILD",
	"diff_signed": "_diffSigned()/OPT.diff production port 없음 — 명시 provider 필요 (OPT/0 대체 금지)",
	"crystal_current_stage": "실 공유 current 공통 _cr packet 은 외부 PROVIDER_CRYSTAL_STATS 로 공급(권장) — crystal_stats_provider 는 fixture/단독 편의(fresh plan_apply_stats, MP/ST 의존 읽음) — source phase/Main authority 증명 아님",
	"install_sink": "packet 적용 + 원 applyStats call-site 에서 nonHP gap 과 phase interleave — ENGINE",
}

const DEF_SLOTS: Array[String] = [
	"shield", "armor", "boots", "gloves", "pants", "belt", "necklace", "ring1", "ring2", "cape",
	"bracelet", "headband", "ossuary", "headband2",
]
const HP_ENH_SLOTS: Array[String] = ["gloves", "pants", "boots"]
const HEALTH_FIELDS: Array[String] = ["hp", "mhp", "hpR"]

const SCOPE := { "main_ready": false, "full_apply_stats": false, "owns_clock": false }

var _providers: Dictionary = {}
var _sink: Callable = Callable()
var _owners: Array[Object] = []     # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _adapters: Array[Object] = []   # grit/crystal adapter (configure 와 무관하게 유지)
var _configured: bool = false
var _coerce: AffixReader = AffixReader.new()  # JS ToNumber 재사용 (inventory 미바인딩 — 계산 전용)
var _fail: String = ""
var _dispatch_count: int = 0
var _last: Dictionary = {}

## 현재 pass (원 applyStats 1회 호출). PHASE_INITIAL run 이 새 pass 를 연다.
var _pass_id: int = 0
var _done: String = ""              # 이 pass 에서 마지막으로 완료(ack/no_write)된 phase
var _acked: Dictionary = {}         # field -> sink ack 된 마지막 값
var _cr: Variant = null             # 이 pass 의 _cr (PHASE_CRYSTAL_MHP 에서 읽음)
var _cr_stage: String = ""

## captured initial provenance (READY plan_initial 의 최상위 plan.capture envelope 와 대조)
const CAPTURE_KEY := "capture"
const CAPTURE_FIELDS: Array[String] = ["issuer", "config_epoch", "serial", "pass_id"]
var _config_epoch: int = 0          # configure/clear 마다 증가 — 이전 바인딩의 캡처 거부
var _capture_serial: int = 0        # READY plan_initial 마다 단조 증가 (리셋 0) — 같은 출력 재계획도 이전 serial 무효
var _initial_capture: Dictionary = {}   # 최신 READY 캡처 {issuer,config_epoch,serial,pass_id,done,packet,values}
var _last_consumed_serial: int = 0  # 마지막으로 pass 를 연 initial plan 의 serial (sink NACK 포함)


# ───────────────────────── adapters (기존 helper 재사용) ─────────────────────────

## 공개 seam player_resource_parameters_source.read_source_grit_total() (원 _gritTotal @28559 = _gritHpFlat @28560)
## 결과를 그대로(복사본) 전달. 대상 Object 부재/해제/메서드 부재 → NOT_READY value null (중립 0 없음).
class GritHpFlatAdapter extends RefCounted:
	const SEAM := "read_source_grit_total"
	var rp: Object = null

	func read() -> Dictionary:
		var src := "player_resource_parameters_source.read_source_grit_total() (=_gritHpFlat @28560)"
		var alive: bool = is_instance_valid(rp)   # null/해제 모두 false (해제 Object 비교 회피)
		if not alive:
			return { "status": "NOT_READY", "ready": false, "value": null, "reason": "grit_source_unbound_or_freed", "source": src }
		var has_seam: bool = rp.has_method(SEAM)
		if not has_seam:
			return { "status": "NOT_READY", "ready": false, "value": null, "reason": "grit_source_missing_public_seam", "source": src }
		var r: Variant = rp.call(SEAM)
		if not (r is Dictionary):
			return { "status": "NOT_READY", "ready": false, "value": null, "reason": "grit_seam_bad_result", "source": src }
		var d: Dictionary = r
		return d.duplicate(true)


## player_resource_parameters_source.plan_apply_stats() 의 fresh 공통 _cr (@28596-28600). 쓰기 0.
## fixture/단독 편의 — MP/ST 의존 입력도 읽으며 source phase/Main authority 증명이 아니다.
## 실 공유 current 공통 _cr packet 은 외부 PROVIDER_CRYSTAL_STATS 로 공급하는 것이 우선.
class CrystalStatsAdapter extends RefCounted:
	var rp: Object = null

	func read() -> Dictionary:
		var stage := "player_resource_parameters_source.plan_apply_stats():_crystalStats (fresh common _cr @28596-28600)"
		if rp == null or not rp.has_method("plan_apply_stats"):
			return { "status": "NOT_READY", "value": null, "reason": "crystal_source_unbound", "stage": stage }
		var r: Variant = rp.call("plan_apply_stats")
		if not (r is Dictionary):
			return { "status": "NOT_READY", "value": null, "reason": "plan_apply_stats_bad_result", "stage": stage }
		var d: Dictionary = r
		if str(d.get("status", "")) != "READY":
			return { "status": "NOT_READY", "value": null, "stage": stage,
				"reason": "plan_apply_stats_%s:%s" % [str(d.get("status", "")), str(d.get("reason", ""))] }
		var values: Dictionary = d.get("values", {})
		var cr: Variant = values.get("_crystalStats", null)
		if not (cr is Dictionary):
			return { "status": "NOT_READY", "value": null, "reason": "_crystalStats_missing", "stage": stage }
		var crd: Dictionary = cr
		return { "status": "READY", "value": crd.duplicate(), "reason": "", "stage": stage }


## rp = player_resource_parameters_source 인스턴스(호출자가 providers 를 바인딩한 실 객체).
## grit: 공개 read_source_grit_total() 만 호출(private/_fail 접근 0, 5항 재구성 0).
func grit_hp_flat_provider(rp: Object) -> Callable:
	var a := GritHpFlatAdapter.new()
	a.rp = rp
	_adapters.append(a)
	return Callable(a, "read")


func crystal_stats_provider(rp: Object) -> Callable:
	var a := CrystalStatsAdapter.new()
	a.rp = rp
	_adapters.append(a)
	return Callable(a, "read")


# ───────────────────────── configure / readiness ─────────────────────────

## providers: PROVIDER_* → Callable, health_sink: Callable(packet: Dictionary)->bool
func configure(providers: Dictionary, health_sink: Callable) -> Dictionary:
	_providers = providers.duplicate()
	_sink = health_sink
	_owners.clear()
	_retain(health_sink)
	for key: Variant in _providers:
		var v: Variant = _providers[key]
		if v is Callable:
			_retain(v)
	_configured = true
	_reset_pass()
	_config_epoch += 1
	_initial_capture = {}
	return readiness()


func clear() -> void:
	_providers = {}
	_sink = Callable()
	_owners.clear()
	_configured = false
	_reset_pass()
	_config_epoch += 1
	_initial_capture = {}


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


func _reset_pass() -> void:
	_done = ""
	_acked = {}
	_cr = null
	_cr_stage = ""


func dispatch_count() -> int:
	return _dispatch_count


func last_result() -> Dictionary:
	return _last.duplicate(true)


## 현재 pass 진단(값 생성 0).
func stage_state() -> Dictionary:
	return {
		"pass_id": _pass_id, "done": _done, "complete": _done == PHASE_FORTIFY,
		"acked": _acked.duplicate(), "crystal_stage": _cr_stage,
		"next": _next_phase(),
	}


func _next_phase() -> String:
	if _done == "":
		return PHASE_INITIAL
	var i: int = PHASES.find(_done)
	return PHASES[i + 1] if i + 1 < PHASES.size() else ""


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


## 바인딩 준비도(값 호출 없음). phase 별 — 결정 provider 없이도 PHASE_INITIAL 은 ready 일 수 있다.
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
		all_missing.append("health_sink")
	return {
		"ready": all_missing.is_empty(),
		"status": READY if all_missing.is_empty() else NOT_READY,
		"missing": all_missing, "phases": phases,
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


## (+o.key||0)
func _plus_or0(o: Variant, key: String) -> float:
	var n: float = _to_num(o, key)
	if n == 0.0 or is_nan(n):
		return 0.0
	return n


## (o.key||0) 를 산술에 쓸 때의 ToNumber
func _or0_num(o: Variant, key: String) -> float:
	if not _prop_has(o, key):
		return 0.0
	var v: Variant = _prop_val(o, key)
	if not AffixReader.js_truthy(v):
		return 0.0
	if v is Object or v is Array or v is Dictionary:
		_set_fail("unsupported_shape:" + key)
		return 0.0
	return _coerce.js_to_number(v, true)


static func _int32(f: float) -> float:
	return float(CombatStatFormula.js_to_int32(f))


## Math.min(a,b) — 입력은 유한 숫자만 허용되므로 NaN 경로 없음. -0/+0 구분 미재현.
static func _js_min(a: float, b: float) -> float:
	return minf(a, b)


## STATS.key + rhs. 문자열/배열/객체 피연산자는 원에서 문자열 연결 → 미지원 NOT_READY.
func _stats_add(stats: Dictionary, key: String, rhs: float) -> float:
	if not stats.has(key):
		_set_fail("STATS.%s_missing" % key)   # undefined+number=NaN — 현재 authority 누락으로 취급
		return 0.0
	var v: Variant = stats[key]
	if v is int or v is float:
		return float(v) + rhs
	_set_fail("unsupported_js_plus_operand:STATS.%s:%s" % [key, type_string(typeof(v))])
	return 0.0


## 현재 P 필수 유한 숫자 필드(기본값 없음). bound 0/음수/소수 유효.
func _required_number(p: Dictionary, field: String) -> float:
	if not p.has(field):
		_set_fail("P.%s_missing" % field)
		return 0.0
	var v: Variant = p[field]
	if not (v is int or v is float) or not is_finite(float(v)):
		_set_fail("P.%s_not_finite_number:%s" % [field, type_string(typeof(v))])
		return 0.0
	return float(v)


## 후속 phase: 현재 P.field 가 이 pass 의 ack 값과 같아야 한다(stage provenance).
func _acked_current(p: Dictionary, field: String) -> float:
	var n: float = _required_number(p, field)
	if _fail != "":
		return 0.0
	if not _acked.has(field):
		_set_fail("stage_missing_ack:" + field)
		return 0.0
	if n != float(_acked[field]):
		_set_fail("current_P.%s_diverged_from_stage(acked=%s current=%s)" % [field, str(_acked[field]), str(n)])
		return 0.0
	return n


func _read_container(key: String) -> Dictionary:
	var c := _provider(key)
	if not c.is_valid():
		_set_fail("provider_missing:" + key)
		return {}
	var v: Variant = c.call()
	if v == null:
		_set_fail("authority_null:" + key)
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


## {status,value} 계약 소비. READY 만 값 — NOT_READY/SOURCE_THROW/READY_PARTIAL/null 은 0 으로 숨기지 않고 실패.
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


func _call_number(key: String, label: String, arg: Variant = null, with_arg: bool = false) -> float:
	var c := _provider(key)
	if not c.is_valid():
		_set_fail("provider_missing:" + key)
		return 0.0
	return _ready_number(key, c.call(arg) if with_arg else c.call(), label)


func _eq_affix(id: String) -> float:
	return _call_number(PROVIDER_EQ_AFFIX, "_eqAffix('%s')" % id, id, true)


func _eq_implicit(id: String) -> float:
	return _call_number(PROVIDER_EQ_IMPLICIT, "_eqImplicit('%s')" % id, id, true)


## 원 _diffSigned(). number 또는 {status,value}. null/기타 = authority 없음 → NOT_READY (OPT/0 대체 0).
func _diff_signed() -> float:
	var c := _provider(PROVIDER_DIFF_SIGNED)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_DIFF_SIGNED)
		return 0.0
	var v: Variant = c.call()
	if v is Dictionary:
		return _ready_number(PROVIDER_DIFF_SIGNED, v, "_diffSigned()")
	if (v is int or v is float) and is_finite(float(v)):
		return float(v)
	_set_fail("diff_signed_not_number:" + type_string(typeof(v)))
	return 0.0


## G.on?base+((G.stage||1)-1)*6:base. G.on 키 부재 = authority 없음(G={} → NOT_READY). on=false 면 stage 미읽기.
func _stage_hp(g: Dictionary, base: float) -> float:
	if not g.has("on"):
		_set_fail("G.on_missing")
		return 0.0
	var on: Variant = g["on"]
	if not (on is bool):
		_set_fail("G.on_not_bool:" + type_string(typeof(on)))
		return 0.0
	if not bool(on):
		return base
	if not g.has("stage"):
		_set_fail("G.stage_missing")
		return 0.0
	var st: Variant = g["stage"]
	if not (st is int or st is float) or is_inf(float(st)):
		_set_fail("G.stage_not_number:" + type_string(typeof(st)))
		return 0.0
	var stage: float = float(st)
	if stage == 0.0 or is_nan(stage):   # (G.stage||1)
		stage = 1.0
	return base + (stage - 1.0) * 6.0


func _read_crystal_stats() -> Dictionary:
	var c := _provider(PROVIDER_CRYSTAL_STATS)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_CRYSTAL_STATS)
		return {}
	var r: Variant = c.call()
	if not (r is Dictionary):
		_set_fail("crystal_stats_bad_result")
		return {}
	var d: Dictionary = r
	if str(d.get("status", "")) != READY:
		_set_fail("crystal_stats_not_ready:%s:%s" % [str(d.get("status", "")), str(d.get("reason", ""))])
		return {}
	var cr: Variant = d.get("value", null)
	if not (cr is Dictionary):
		_set_fail("crystal_stats_not_dictionary")
		return {}
	var crd: Dictionary = cr
	for k in ["hp", "hpR"]:
		var x: Variant = crd.get(k, null)
		if not (x is int or x is float) or not is_finite(float(x)):
			_set_fail("_cr.%s_not_finite_number" % k)
			return {}
	var stage: String = str(d.get("stage", ""))
	if stage == "":
		_set_fail("crystal_stats_stage_missing")
		return {}
	return { "cr": crd, "stage": stage }


static func _w(p: Dictionary, field: String, value: float, source: String, expr: String) -> Dictionary:
	var present: bool = p.has(field)
	return { "field": field, "value": value, "source": source, "expr": expr,
		"before_present": present, "before": p[field] if present else null }


func _finish_plan(phase: String, writes: Array[Dictionary], values: Dictionary) -> Dictionary:
	var gaps: Array = PHASE_GAPS[phase]
	var packet := { "kind": phase, "pass_id": _pass_id, "source": PHASE_SOURCE[phase],
		"writes": writes, "gaps": gaps.duplicate(true) }
	var bad: Array[String] = []
	for w in writes:
		var f: float = w["value"]
		if not is_finite(f):
			bad.append(str(w["field"]))
	if not bad.is_empty():
		return { "status": SOURCE_NON_FINITE, "ready": false, "reason": "computed_non_finite:" + ",".join(PackedStringArray(bad)),
			"packet": null, "diagnostic_packet": packet, "values": values }
	return { "status": READY, "ready": true, "reason": "", "packet": packet, "values": values }


func _require_after(phase: String) -> bool:
	var i: int = PHASES.find(phase)
	var need: String = PHASES[i - 1]
	if _done != need:
		_set_fail("stage_order:%s requires %s acked in pass %d (done=%s)" % [phase, need, _pass_id, _done if _done != "" else "none"])
		return false
	return true


# ───────────────────────── plans (순수 — 쓰기/sink 0) ─────────────────────────

func plan_phase(phase: String) -> Dictionary:
	match phase:
		PHASE_INITIAL:
			return plan_initial()
		PHASE_CRYSTAL_MHP:
			return plan_crystal_mhp()
		PHASE_CRYSTAL_HPR:
			return plan_crystal_hpr()
		PHASE_FORTIFY:
			return plan_fortify()
	return _not_ready("unknown_phase:" + phase)


## @28567-28592. 결정/grit provider 불필요. 현재 P 에 hpR 가 없어도(boot) 파생 가능 — before_present=false.
func plan_initial() -> Dictionary:
	_fail = ""
	_initial_capture = {}   # 새 initial 계획은 이전 캡처를 대체(실패해도 이전 캡처 무효)
	var missing := _missing_for(PHASE_INITIAL)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	var p := _read_container(PROVIDER_PLAYER)
	var stats := _read_container(PROVIDER_STATS)
	var passives := _read_container(PROVIDER_PASSIVES)
	var inv := _read_container(PROVIDER_INVENTORY)
	var g := _read_container(PROVIDER_G)
	if _fail != "":
		return _not_ready(_fail)
	var eq := _equipped(inv)
	if _fail != "":
		return _not_ready(_fail)
	# @28567
	var eq_str: float = 0.0
	for sl in AffixReader.SLOT_NAMES:
		var it: Variant = _slot(eq, sl)
		if AffixReader.js_truthy(it):
			eq_str += _plus_or0(it, "bStr")
	# @28568-28569
	var lb: float = _call_number(PROVIDER_LV_B, "_lvB()")
	var s_str: float = _stats_add(stats, "str", eq_str) + lb + _int32(_eq_affix("strFlat"))
	var s_vit: float = _int32(_eq_affix("vitFlat"))
	if _fail != "":
		return _not_ready(_fail)
	# @28573-28574
	var diff: float = _diff_signed()
	if _fail != "":
		return _not_ready(_fail)
	var diff_base_hp: float = maxf(100.0, 300.0 - 20.0 * diff)
	var stg_hp: float = _stage_hp(g, diff_base_hp)
	if _fail != "":
		return _not_ready(_fail)
	# @28575
	var af_hp_f: float = _eq_affix("maxHPFlat")
	var af_hp_p: float = _eq_affix("maxHPPct") + _eq_affix("lifeMaxHP")
	var im_hp: float = _eq_implicit("_iMaxHP")
	var im_hp_p: float = _eq_implicit("_iMaxHPPct") + _eq_implicit("_iLifeHPPct")
	# @28578-28581
	var total_bonus_hp: float = 0.0
	var enh_hp: float = 0.0
	for sl in DEF_SLOTS:
		var dit: Variant = _slot(eq, sl)
		if AffixReader.js_truthy(dit):
			total_bonus_hp += _plus_or0(dit, "bonusHp")
			if _to_num(dit, "enh") > 0.0 and HP_ENH_SLOTS.has(sl):
				enh_hp += _to_num(dit, "enh") * 1.0
	var p_melee: float = _or0_num(passives, "pMelee")
	if _fail != "":
		return _not_ready(_fail)
	var writes: Array[Dictionary] = []
	# @28582
	var mhp: float = _int32((stg_hp + s_str * 5.0 + s_vit * 3.0 + total_bonus_hp + af_hp_f + im_hp + enh_hp) \
		* (1.0 + af_hp_p + im_hp_p * 0.01 + p_melee * 0.03))
	writes.append(_w(p, "mhp", mhp, "game.html:28582",
		"P.mhp=~~((_stgHp+s.str*5+s.vit*3+_totalBonusHp+_afHpF+_imHp+_enhHp)*(1+_afHpP+_imHpP*.01+(PASSIVES.pMelee||0)*.03))"))
	# @28592
	var hp_r: float = 0.05 + s_str * 0.002 + _eq_affix("lifeRegen") / 60.0
	if _fail != "":
		return _not_ready(_fail)
	writes.append(_w(p, "hpR", hp_r, "game.html:28592", "P.hpR=.05+s.str*.002+_eqAffix('lifeRegen')/60"))
	var values := {
		"mhp": mhp, "hpR": hp_r, "s_str": s_str, "s_vit": s_vit, "eq_str": eq_str, "lv_b": lb,
		"diff_signed": diff, "diff_base_hp": diff_base_hp, "stg_hp": stg_hp,
		"af_hp_f": af_hp_f, "af_hp_p": af_hp_p, "im_hp": im_hp, "im_hp_p": im_hp_p,
		"total_bonus_hp": total_bonus_hp, "enh_hp": enh_hp, "p_melee": p_melee,
	}
	var r := _finish_plan(PHASE_INITIAL, writes, values)
	if str(r["status"]) == READY:
		_capture_serial += 1
		var env := { "issuer": get_instance_id(), "config_epoch": _config_epoch,
			"serial": _capture_serial, "pass_id": _pass_id }
		var rp: Dictionary = r["packet"]
		_initial_capture = env.duplicate()
		_initial_capture.merge({ "done": _done, "packet": rp.duplicate(true), "values": values.duplicate(true) })
		r[CAPTURE_KEY] = env
	return r


## @28601. 공통 _cr stage 결과 + 현재 P.mhp(=이 pass PHASE_INITIAL ack) + 현재 P.hp.
func plan_crystal_mhp() -> Dictionary:
	_fail = ""
	var missing := _missing_for(PHASE_CRYSTAL_MHP)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	if not _require_after(PHASE_CRYSTAL_MHP):
		return _not_ready(_fail)
	var p := _read_container(PROVIDER_PLAYER)
	var passives := _read_container(PROVIDER_PASSIVES)
	if _fail != "":
		return _not_ready(_fail)
	var cur_mhp: float = _acked_current(p, "mhp")
	if _fail != "":
		return _not_ready(_fail)
	var crs := _read_crystal_stats()
	if _fail != "":
		return _not_ready(_fail)
	var cr: Dictionary = crs["cr"]
	var human: float = _or0_num(passives, "pHuman")
	var grit: float = _call_number(PROVIDER_GRIT_HP_FLAT, "_gritHpFlat()")
	var hp_cur: float = _required_number(p, "hp")
	if _fail != "":
		return _not_ready(_fail)
	var mhp: float = _int32(cur_mhp + _int32(float(cr["hp"]))) + human * 100.0 + grit
	var hp: float = _js_min(hp_cur, mhp)
	var writes: Array[Dictionary] = [
		_w(p, "mhp", mhp, "game.html:28601", "P.mhp=~~(P.mhp+~~_cr.hp)+(PASSIVES.pHuman||0)*100+_gritHpFlat()"),
		_w(p, "hp", hp, "game.html:28601", "P.hp=Math.min(P.hp,P.mhp)"),
	]
	var values := { "mhp": mhp, "hp": hp, "cr": cr.duplicate(), "crystal_stage": crs["stage"],
		"p_human": human, "grit_hp_flat": grit }
	return _finish_plan(PHASE_CRYSTAL_MHP, writes, values)


## @28605. 같은 pass 의 _cr (재조회 0) + 현재 P.hpR(=PHASE_INITIAL ack).
func plan_crystal_hpr() -> Dictionary:
	_fail = ""
	var missing := _missing_for(PHASE_CRYSTAL_HPR)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	if not _require_after(PHASE_CRYSTAL_HPR):
		return _not_ready(_fail)
	if not (_cr is Dictionary):
		return _not_ready("stage_missing:_cr")
	var p := _read_container(PROVIDER_PLAYER)
	if _fail != "":
		return _not_ready(_fail)
	var cur_hpr: float = _acked_current(p, "hpR")
	if _fail != "":
		return _not_ready(_fail)
	var cr: Dictionary = _cr
	var hp_r: float = cur_hpr + float(cr["hpR"]) / 60.0
	var writes: Array[Dictionary] = [_w(p, "hpR", hp_r, "game.html:28605", "P.hpR+=_cr.hpR/60")]
	return _finish_plan(PHASE_CRYSTAL_HPR, writes, { "hpR": hp_r, "cr_hpR": float(cr["hpR"]) })


## @28616-28617. _fLv<=0 → writes [] (원 대입 0). 상한 상승은 hp 를 채우지 않는다(min 만).
func plan_fortify() -> Dictionary:
	_fail = ""
	var missing := _missing_for(PHASE_FORTIFY)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	if not _require_after(PHASE_FORTIFY):
		return _not_ready(_fail)
	var p := _read_container(PROVIDER_PLAYER)
	var passives := _read_container(PROVIDER_PASSIVES)
	if _fail != "":
		return _not_ready(_fail)
	var f_lv: float = _or0_num(passives, "pFortify")
	if _fail != "":
		return _not_ready(_fail)
	var writes: Array[Dictionary] = []
	if f_lv > 0.0:
		var cur_mhp: float = _acked_current(p, "mhp")
		var cur_hp: float = _acked_current(p, "hp")
		if _fail != "":
			return _not_ready(_fail)
		var mhp: float = cur_mhp + f_lv * 300.0
		writes.append(_w(p, "mhp", mhp, "game.html:28617", "P.mhp+=_fLv*300"))
		writes.append(_w(p, "hp", _js_min(cur_hp, mhp), "game.html:28617", "P.hp=Math.min(P.hp,P.mhp)"))
	return _finish_plan(PHASE_FORTIFY, writes, { "f_lv": f_lv })


# ───────────────────────── dispatch ─────────────────────────

## phase 실행: plan → (writes 있으면) health_sink(packet) 1회 → ack 시 pass 진행.
## PHASE_INITIAL 은 새 pass 를 연다(이전 pass 의 ack/_cr 폐기).
func run_phase(phase: String) -> Dictionary:
	var out := { "phase": phase, "action": null, "dispatched": false, "plan": null, "pass_id": _pass_id }
	if not PHASES.has(phase):
		out.merge(_not_ready("unknown_phase:" + phase), true)
		_last = out.duplicate(true)
		return out
	if phase == PHASE_INITIAL:
		_open_pass()
		out["pass_id"] = _pass_id
	if not _sink.is_valid():
		out.merge(_not_ready("health_sink_missing"), true)
		_last = out.duplicate(true)
		return out
	var plan := plan_phase(phase)
	if phase == PHASE_INITIAL:
		_consume_initial_capture(plan)   # run_phase 자체 계획은 captured 로 재-dispatch 불가
	return _dispatch_planned(phase, plan, out)


func _open_pass() -> void:
	_pass_id += 1
	_reset_pass()


## pass 를 연 initial plan 의 serial 기록 + 현재 캡처 폐기 (sink ACK/NACK 무관 — pass open 시점).
func _consume_initial_capture(plan: Dictionary) -> void:
	var env: Variant = plan.get(CAPTURE_KEY, null)
	if env is Dictionary and typeof((env as Dictionary).get("serial", null)) == TYPE_INT:
		_last_consumed_serial = int((env as Dictionary)["serial"])
	_initial_capture = {}


static func _same_raw(a: Variant, b: Variant) -> bool:
	return typeof(a) == typeof(b) and a == b


## captured plan 의 형식/출처/provenance/신선도/1회성. "" = 이 producer 의 최신 캡처와 일치. 상태 변경 0.
## provenance 는 plan.capture envelope 의 정수 issuer/config_epoch/serial/pass_id 를 내부 기록과 정확 비교한다
## (동일 출력의 다른 producer / configure·clear 이전 / 같은 prefix 재계획으로 대체된 plan 구분).
func _captured_initial_error(plan: Dictionary) -> String:
	var status: String = str(plan.get("status", ""))
	if status != READY:
		return "captured_not_ready:%s:%s" % [status, str(plan.get("reason", ""))]
	var pk: Variant = plan.get("packet", null)
	if not (pk is Dictionary):
		return "captured_packet_missing"
	var packet: Dictionary = pk
	if str(packet.get("kind", "")) != PHASE_INITIAL:
		return "captured_wrong_kind:" + str(packet.get("kind", ""))
	if str(packet.get("source", "")) != str(PHASE_SOURCE[PHASE_INITIAL]):
		return "captured_wrong_source:" + str(packet.get("source", ""))
	var pid: Variant = packet.get("pass_id", null)
	if not (pid is int):
		return "captured_pass_id_missing"
	var vals: Variant = plan.get("values", null)
	if not (vals is Dictionary):
		return "captured_values_missing"
	var ev: Variant = plan.get(CAPTURE_KEY, null)
	if not (ev is Dictionary):
		return "captured_envelope_missing"
	var env: Dictionary = ev
	for k in CAPTURE_FIELDS:
		if typeof(env.get(k, null)) != TYPE_INT:
			return "captured_envelope_field_not_int:" + k
	if int(env["issuer"]) != get_instance_id():
		return "captured_foreign_issuer"
	if int(env["config_epoch"]) != _config_epoch:
		return "captured_config_epoch_stale:captured=%d current=%d" % [int(env["config_epoch"]), _config_epoch]
	var serial: int = int(env["serial"])
	if serial == _last_consumed_serial:
		return "captured_initial_already_used:serial_%d" % serial
	if int(env["pass_id"]) != int(pid):
		return "captured_envelope_pass_mismatch:envelope=%d packet=%d" % [int(env["pass_id"]), int(pid)]
	if int(pid) != _pass_id:
		return "captured_stale_pass:captured=%d current=%d" % [int(pid), _pass_id]
	var rec := _initial_capture
	if rec.is_empty():
		return "captured_initial_unrecorded"
	if serial != int(rec["serial"]):
		return "captured_superseded:serial=%d current=%d" % [serial, int(rec["serial"])]
	if str(rec["done"]) != _done:
		return "captured_stage_progressed:captured=%s current=%s" % [str(rec["done"]), _done]
	if packet != rec["packet"] or vals != rec["values"]:
		return "captured_not_from_this_producer"
	return ""


## 같은 applyStats prefix 에서 이 producer 의 plan_initial() 로 1회 캡처된 READY plan 을 재계획 없이 실행.
## 선행 조건: 캡처 이후 plan_initial/run_phase(INITIAL)/configure/clear 및 후속 stage 진행 0.
## 현재 읽기: player provider 1회(P.mhp/hpR before 대조) — 그 외 provider/source/cache 호출 0.
## 통과 시 run_phase(INITIAL) 과 같은 pass open → health_sink(packet) 1회 → ACK 시 _acked/_done 기록.
## dispatch 사본의 pass_id 는 새로 연 pass (run_phase 와 동일 shape). 캡처 시 pass 는 out.captured_pass_id.
func run_captured_initial(plan: Dictionary) -> Dictionary:
	var out := { "phase": PHASE_INITIAL, "action": null, "dispatched": false, "plan": null,
		"pass_id": _pass_id, "captured": true, "captured_pass_id": null }
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	if not _provider(PROVIDER_PLAYER).is_valid():
		missing.append("provider:" + PROVIDER_PLAYER)
	if not missing.is_empty():
		out.merge(_not_ready("not_ready:" + ",".join(PackedStringArray(missing))), true)
		_last = out.duplicate(true)
		return out
	if not _sink.is_valid():
		out.merge(_not_ready("health_sink_missing"), true)
		_last = out.duplicate(true)
		return out
	var err := _captured_initial_error(plan)
	if err != "":
		out.merge({ "status": CAPTURE_REJECTED, "ready": false, "reason": err, "packet": null }, true)
		_last = out.duplicate(true)
		return out
	var packet: Dictionary = plan["packet"]
	out["captured_pass_id"] = packet["pass_id"]
	out["captured_serial"] = (plan[CAPTURE_KEY] as Dictionary)["serial"]
	# 현재 authority (NOT_READY 와 stale 구분)
	_fail = ""
	var p := _read_container(PROVIDER_PLAYER)
	if _fail != "":
		out.merge(_not_ready(_fail), true)
		_last = out.duplicate(true)
		return out
	# current-before: 캡처 이후 P.mhp/hpR 가 바뀌었으면 stale (원은 이 시점에 그 값을 덮어쓴다 — 다른 writer 존재 = 순서 위반)
	for w: Variant in packet["writes"]:
		var wd: Dictionary = w
		var field: String = str(wd["field"])
		var present: bool = p.has(field)
		if present != bool(wd["before_present"]) or (present and not _same_raw(p[field], wd["before"])):
			out.merge({ "status": CAPTURE_REJECTED, "ready": false, "packet": null,
				"reason": "captured_current_before_diverged:P.%s(captured=%s current=%s)" % [
					field, str(wd["before"]) if bool(wd["before_present"]) else "absent",
					str(p.get(field)) if present else "absent"] }, true)
			_last = out.duplicate(true)
			return out
	_consume_initial_capture(plan)
	_open_pass()
	out["pass_id"] = _pass_id
	var opened: Dictionary = plan.duplicate(true)
	var opened_packet: Dictionary = opened["packet"]
	opened_packet["pass_id"] = _pass_id
	return _dispatch_planned(PHASE_INITIAL, opened, out)


## captured initial 진단(값 생성 0).
func initial_capture_state() -> Dictionary:
	return {
		"config_epoch": _config_epoch, "pass_id": _pass_id, "done": _done,
		"recorded": not _initial_capture.is_empty(),
		"recorded_pass_id": _initial_capture.get("pass_id", null),
		"recorded_serial": _initial_capture.get("serial", null),
		"issuer": get_instance_id(), "last_serial": _capture_serial,
		"last_consumed_serial": _last_consumed_serial,
	}


## run_phase / run_captured_initial 공통: (writes 있으면) health_sink(packet) 1회 → ack 시 pass 진행.
func _dispatch_planned(phase: String, plan: Dictionary, out: Dictionary) -> Dictionary:
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
	if phase == PHASE_CRYSTAL_MHP:
		var values: Dictionary = plan["values"]
		_cr = values["cr"]
		_cr_stage = str(values["crystal_stage"])
	_done = phase
	out.merge({ "status": READY, "ready": true, "reason": "" }, true)
	_last = out.duplicate(true)
	return out


## fixture/단독 편의: 4 phase 를 연속 실행. 원 applyStats 는 phase 사이에 nonHP gap 을 실행하므로
## 이것은 전체 source query order 주장이 아니다(full_source_order=false).
func run_health_subset() -> Dictionary:
	var results: Array = []
	var dispatched: Array[String] = []
	var out := { "full_source_order": false, "results": results, "dispatched": dispatched }
	for ph in PHASES:
		var r := run_phase(ph)
		results.append(r)
		if bool(r.get("dispatched", false)):
			dispatched.append(ph)
		if str(r["status"]) != READY:
			out.merge({ "status": r["status"], "ready": false, "reason": "%s:%s" % [ph, str(r["reason"])] }, true)
			return out
	out.merge({ "status": READY, "ready": true, "reason": "" }, true)
	return out


# ───────────────────────── 현재 health 읽기 (파생 아님 — provenance 만) ─────────────────────────

func _health_view() -> Dictionary:
	var c := _provider(PROVIDER_PLAYER)
	if not c.is_valid():
		return { "status": NOT_READY, "reason": "provider_missing:player", "values": {}, "provenance": {}, "missing": [], "p": null }
	var v: Variant = c.call()
	if not (v is Dictionary):
		return { "status": NOT_READY, "reason": "current_P_unavailable", "values": {}, "provenance": {}, "missing": [], "p": null }
	var p: Dictionary = v
	var complete: bool = _done == PHASE_FORTIFY
	var values := {}
	var prov := {}
	var missing: Array[String] = []
	for f in HEALTH_FIELDS:
		if not p.has(f):
			prov[f] = "absent"
			missing.append(f)
			continue
		var x: Variant = p[f]
		values[f] = x
		if not (x is int or x is float) or not is_finite(float(x)):
			prov[f] = "current_unsupported"
			missing.append(f + ":not_finite_number")
			continue
		if f == "hp":
			prov[f] = "current_P"   # hp 는 상태값(리젠/피해가 이후 변경) — 파생 주장 아님
			continue
		if complete and _acked.has(f) and float(x) == float(_acked[f]):
			prov[f] = "stage_acked:pass_%d" % _pass_id
		else:
			prov[f] = "current_unverified"
			missing.append(f + ":not_stage_derived")
	return {
		"status": READY if missing.is_empty() else NOT_READY,
		"reason": "" if missing.is_empty() else "fields:" + ",".join(PackedStringArray(missing)),
		"values": values, "provenance": prov, "missing": missing,
		"pass_id": _pass_id, "stage_done": _done, "p": p,
	}


## 현재 P 의 hp/mhp/hpR 원값 + provenance. 부재 hpR 를 0 으로, boot mhp 350 을 파생으로 만들지 않는다.
func read_current_health() -> Dictionary:
	var r := _health_view()
	r.erase("p")
	return r


## hp_regeneration_source.configure(current_state_reader=Callable(this,"read_regen_state"), …) 용.
## 완료 pass 의 ack mhp/hpR 와 현재 P 가 일치할 때만 실 P Dictionary, 아니면 null (→ 소비자 NOT_READY P_null).
func read_regen_state() -> Variant:
	var r := _health_view()
	if str(r["status"]) != READY:
		return null
	return r["p"]
