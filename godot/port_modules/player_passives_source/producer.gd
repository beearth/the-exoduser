extends RefCounted
##
## player_passives_source/producer.gd — 원 PASSIVES 상태 provider (load 직후 derive + 현재 PASSIVES authority reader).
## TASK GODOT-PORT-PLAYER-PASSIVES-SOURCE-FIRST-20261013.
##
## 원 R(canonical game.html, 읽기전용) — PASSIVES 결과에 영향을 주는 식만:
##   PASSIVES 시작값 (@28300) : let PASSIVES={};PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0)   — 26키(@28272~28298)
##   dbRestore(d) (@3990):
##     if(!d)return false;  …  if(!d.player)return false;                       (@3991/@3995)
##     if(d.passives)for(const k in d.passives)if(PASSIVES.hasOwnProperty(k))PASSIVES[k]=+d.passives[k]||0;   (@4074)
##     pShield: _legacyLv=Math.max(0,~~(PASSIVES.pShield||0)); if(_legacyLv>0){ …AP 환불…; PASSIVES.pShield=0 }  (@4076~4085)
##     if(d.skills){ if(d.skills.humanity>0&&!PASSIVES.pHuman){PASSIVES.pHuman=Math.min(10,d.skills.humanity);delete d.skills.humanity}
##                   if(d.skills.demonRevive>0&&!PASSIVES.pDemon){PASSIVES.pDemon=Math.min(10,d.skills.demonRevive);delete d.skills.demonRevive} } (@4097~4100)
##   원 load 는 PASSIVES 를 리셋하지 않고 병합한다 → 호출 직전 PASSIVES(prior)가 필수 입력. max 10 clamp 없음.
##   pShield 는 PASSIVE_DEF 에 없음 → 정상 prior 에서는 키가 생기지 않는다(삭제된 패시브 결과 0).
##
## 이 모듈 밖(BUILD/BALANCE 소유, 계산·적용 0): STATS 병합(@4072), pShield/pDef AP 환불(@4076~4095),
## grit/SP 환불(@4101~4102), `delete d.skills.*` save 변이, 패시브 투자/큐/리셋, applyStats.
## 배율 계산은 ROOT combat_stat_formula 소유 — 여기서는 configure_passives_reader 에 PASSIVES 를 공급만 한다.
##
## 두 공급원:
##   derived : derive_restore*() 가 만든 load 직후 local PASSIVES (read_passives)
##   current : configure_current_passives_reader(Callable) — 호출자가 보관하는 실제 현재 PASSIVES authority.
##             매 호출 Callable 을 다시 읽는다(스냅샷/캐시/형변환/쓰기 0). 실패 → null + NOT_READY 사유.
##
## status:
##   READY                 : 원 단계가 실제 prior + 저장 d 로 실행됨 / current reader 가 Dictionary 반환.
##   NOT_READY             : prior/current 미공급·대상 해제·null·미지원 shape — value null (0 위장 금지).
##   SOURCE_RETURNED_FALSE : 원 dbRestore 가 PASSIVES 단계 전에 return false(!d / !d.player) — value null.

const Formula := preload("res://port_modules/combat_stat_formula/producer.gd")
const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_RETURNED_FALSE := "SOURCE_RETURNED_FALSE"

const SOURCE_DERIVED := "derived"
const SOURCE_CURRENT := "current"

const PRIOR_CALLER := "caller_current"
const PRIOR_BOOT := "source_boot_default @28300"

const SKILL_MIGRATION_CAP := 10.0                                                  # Math.min(10, …)
const SKILL_MIGRATIONS := [["humanity", "pHuman"], ["demonRevive", "pDemon"]]   # 원 순서

## 같은 dbRestore 구간의 원 효과 중 이 모듈이 계산/적용하지 않는 것(소유자 필요).
const OUTSIDE_MODULE := {
	"stats_merge": "@4072 if(d.stats)for(k in d.stats)STATS[k]=d.stats[k]||0 — BUILD/BALANCE",
	"pshield_ap_refund": "@4076~4084 _pcv=[1,1,1,2,2,2,3,3,3,5] 환불 → P.ap — BUILD/BALANCE",
	"pdef_ap_refund": "@4087~4095 d.passives.pDef _pcv 환불 → P.ap (PASSIVES 쓰기 없음) — BUILD/BALANCE",
	"skills_delete": "@4098/@4099 delete d.skills.humanity/demonRevive — save 변이, BUILD",
	"grit_sp_refund": "@4101~4102 _grit=d.grit||0, !gritCostModeV2 SP 환불 — BUILD/BALANCE",
}

var _coerce: AffixReader = AffixReader.new()   # JS ToNumber 전용(인벤토리 미바인딩, 캐시 사용 0)

var _status := NOT_READY
var _reason := "derive_not_called"
var _passives: Variant = null       # derived local PASSIVES
var _last: Dictionary = {}
var _derived_formulas: Array = []   # WeakRef — derived 실패 시 formula passives reader 해제

var _current_reader: Callable
var _current_bound := false

# ───────────────────────── source 시작값 ─────────────────────────

## 원 @28300 시작 PASSIVES — 새 Dictionary, PASSIVE_DEF 순서 26키 = 0.
static func source_boot_passives() -> Dictionary:
	var d := {}
	for k in Formula.PASSIVE_DEF_KEYS:
		d[k] = 0.0
	return d

# ───────────────────────── JS helpers ─────────────────────────

static func _is_array_index(s: String) -> bool:
	if s.is_empty() or s.length() > 10:
		return false
	if s == "0":
		return true
	if s.unicode_at(0) == 0x30:
		return false
	for i in s.length():
		var c: int = s.unicode_at(i)
		if c < 0x30 or c > 0x39:
			return false
	return int(s) < 4294967295

## JS 객체 own key 순서: array-index 키 오름차순 → 나머지 삽입 순서. 미지원 키 shape → null.
static func _js_ordered_keys(d: Dictionary) -> Variant:
	var idx: Array = []
	var named: Array = []
	var seen := {}
	for k in d:
		var ks: Variant = AffixReader.js_property_key(k, true)
		if ks == null or seen.has(ks):
			return null
		seen[ks] = true
		if _is_array_index(ks):
			idx.append([int(ks), ks, k])
		else:
			named.append([ks, k])
	idx.sort_custom(func(a, b): return a[0] < b[0])
	var out: Array = []
	for e in idx:
		out.append([e[1], e[2]])
	out.append_array(named)
	return out   # [[js_key, godot_key], ...]

## 원 for(const k in v) 열거 → [[js_key, value], ...]. primitive number/bool → 열거 0. 미지원 → null.
static func _for_in(v: Variant) -> Variant:
	if v == null or v is bool or v is int or v is float:
		return []
	if v is Dictionary:
		var keys: Variant = _js_ordered_keys(v)
		if keys == null:
			return null
		var out: Array = []
		for e in keys:
			out.append([e[0], v[e[1]]])
		return out
	if v is Array:
		var out: Array = []
		for i in v.size():
			out.append([str(i), v[i]])
		return out
	if v is String or v is StringName:
		var s := String(v)
		var out: Array = []
		for i in s.length():
			out.append([str(i), s.substr(i, 1)])
		return out
	return null

## Godot Dictionary 를 JS own key 순서로 재배열(새 Dictionary). 미지원 → null.
static func _js_reordered(d: Dictionary) -> Variant:
	var keys: Variant = _js_ordered_keys(d)
	if keys == null:
		return null
	var out := {}
	for e in keys:
		out[e[0]] = d[e[1]]
	return out

## 원 obj.key — Dictionary 만 own property 를 가진다(string/array 의 named key 는 undefined).
static func _prop(v: Variant, key: String) -> Array:
	if v is Dictionary and v.has(key):
		return [true, v[key]]
	return [false, null]

func _num(v: Variant, present: bool) -> float:
	return _coerce.js_to_number(v, present)

# ───────────────────────── derived (load 직후 PASSIVES) ─────────────────────────

## 원 dbRestore 의 PASSIVES 결과 (@4074 / pShield 0화 @4083 / skills @4097~4100) 를 local 사본에 실행.
##   d             : 저장 레코드(원 d). 읽기만.
##   prior_passives: 호출 직전 실제 PASSIVES (원 load 는 병합). null → NOT_READY. 입력은 변이하지 않는다.
func derive_restore(d: Variant, prior_passives: Variant) -> Dictionary:
	return _derive(d, prior_passives, PRIOR_CALLER)

## prior = 원 시작값(@28300) — 부팅 직후 첫 load 경로. 원 결과(READY)이며 중립 fallback 아님.
func derive_restore_from_boot(d: Variant) -> Dictionary:
	return _derive(d, source_boot_passives(), PRIOR_BOOT)

func _derive(d: Variant, prior_passives: Variant, prior_origin: String) -> Dictionary:
	var r := {
		"status": NOT_READY, "reason": "", "prior_origin": prior_origin,
		"passives": null,
		"applied_keys": [], "ignored_not_own_keys": [], "save_has_passives": false,
		"pshield_cleared": false,
		"skill_migrations": [],
		"save_mutations_not_applied": [],
		"outside_module": OUTSIDE_MODULE.keys(),
		"source": "dbRestore PASSIVES @4074/@4083/@4097~4100",
	}
	if not AffixReader.js_truthy(d):
		return _finish(r, SOURCE_RETURNED_FALSE, "dbRestore: !d → return false @3991")
	var pl: Array = _prop(d, "player")
	if not AffixReader.js_truthy(pl[1]):
		return _finish(r, SOURCE_RETURNED_FALSE, "dbRestore: !d.player → return false @3995")
	if prior_passives == null:
		return _finish(r, NOT_READY, "prior_PASSIVES_unbound")
	if not prior_passives is Dictionary:
		return _finish(r, NOT_READY, "prior_PASSIVES_unsupported_shape:" + type_string(typeof(prior_passives)))
	var passives: Variant = _js_reordered(prior_passives)
	if passives == null:
		return _finish(r, NOT_READY, "prior_PASSIVES_unsupported_key_shape")

	# @4074 — known(own) 키만, +v||0
	var dp: Array = _prop(d, "passives")
	r.save_has_passives = AffixReader.js_truthy(dp[1])
	if r.save_has_passives:
		var entries: Variant = _for_in(dp[1])
		if entries == null:
			return _finish(r, NOT_READY, "d.passives_unsupported_for_in_shape:" + type_string(typeof(dp[1])))
		for e in entries:
			var k: String = e[0]
			if not passives.has(k):
				r.ignored_not_own_keys.append(k)
				continue
			var n: float = _num(e[1], true)
			passives[k] = n if AffixReader.js_truthy(n) else 0.0
			r.applied_keys.append(k)

	# @4077/@4083 — PASSIVES.pShield 0화 조건만(환불량은 OUTSIDE_MODULE)
	var ps: Variant = passives.get("pShield")
	var ps_n: float = _num(ps, true) if AffixReader.js_truthy(ps) else 0.0
	if maxi(0, Formula.js_to_int32(ps_n)) > 0:
		passives["pShield"] = 0.0
		r.pshield_cleared = true

	# @4097~4100 — skills → pHuman/pDemon
	var ds: Array = _prop(d, "skills")
	if AffixReader.js_truthy(ds[1]):
		for m in SKILL_MIGRATIONS:
			var sv_: Array = _prop(ds[1], m[0])
			var sv: float = _num(sv_[1], sv_[0])
			if sv > 0.0 and not AffixReader.js_truthy(passives.get(m[1])):   # NaN > 0 = false
				var val: float = minf(SKILL_MIGRATION_CAP, sv)
				passives[m[1]] = val
				r.skill_migrations.append({"skill": m[0], "passive": m[1], "value": val})
				r.save_mutations_not_applied.append("delete d.skills." + m[0])

	var ordered: Variant = _js_reordered(passives)
	if ordered == null:
		return _finish(r, NOT_READY, "PASSIVES_unsupported_key_shape_after_migration")
	r.passives = ordered
	_passives = ordered
	return _finish(r, READY, "")

func _finish(r: Dictionary, status: String, reason: String) -> Dictionary:
	r.status = status
	r.reason = reason
	_status = status
	_reason = reason
	if status != READY:
		_passives = null
		for w in _derived_formulas:
			var f: Variant = w.get_ref()
			if f != null:
				f.configure_passives_reader(Callable())
		_derived_formulas.clear()
	_last = r
	return r

## derived local PASSIVES 참조(READY 아니면 null).
func read_passives() -> Variant:
	return _passives

func status() -> Dictionary:
	return {"status": _status, "reason": _reason}

func last_result() -> Dictionary:
	return _last

# ───────────────────────── current (실제 현재 PASSIVES authority) ─────────────────────────

## reader(): 실제 현재 PASSIVES Dictionary 참조를 반환. 대상은 호출자가 보관(Callable 약참조).
## invalid Callable → false, 기존 바인딩 해제.
func configure_current_passives_reader(reader: Callable) -> bool:
	_current_bound = reader.is_valid()
	_current_reader = reader if _current_bound else Callable()
	return _current_bound

func clear_current_passives_reader() -> void:
	_current_bound = false
	_current_reader = Callable()

## 매 호출 reader 를 다시 읽어 {status, reason, value} — value 는 원 Dictionary 참조 그대로(복사/형변환/쓰기 0).
func current_status() -> Dictionary:
	if not _current_bound:
		return {"status": NOT_READY, "reason": "current_passives_reader_unbound", "value": null}
	if not _current_reader.is_valid():
		return {"status": NOT_READY, "reason": "current_passives_reader_target_freed", "value": null}
	var v: Variant = _current_reader.call()
	if v == null:
		return {"status": NOT_READY, "reason": "current_PASSIVES_null", "value": null}
	if not v is Dictionary:
		return {"status": NOT_READY, "reason": "current_PASSIVES_unsupported_shape:" + type_string(typeof(v)), "value": null}
	return {"status": READY, "reason": "", "value": v}

## combat_stat_formula 용 현재 PASSIVES. 실패 → null (이전 값 재사용 0).
func read_current_passives() -> Variant:
	return current_status().value

# ───────────────────────── formula 바인딩 ─────────────────────────

## ROOT combat_stat_formula 인스턴스에 PASSIVES 공급원을 바인딩.
##   SOURCE_DERIVED: derive READY 일 때만. 이후 derive 실패 시 formula reader 해제(→ NOT_READY unbound).
##   SOURCE_CURRENT: current reader READY 일 때만. 이후 authority 실패 시 read 가 null 을 반환 →
##                   formula 는 그 호출을 non-READY/value null 로 보고(원 null 컨테이너 문구 SOURCE_THROW);
##                   정확한 사유는 current_status(). authority 복구 시 재바인딩 없이 live.
## provider 인스턴스는 호출자가 보관해야 한다(formula Callable 약참조).
func bind_combat_stat_formula(formula: Object, source: String = SOURCE_DERIVED) -> Dictionary:
	if formula == null or not formula.has_method("configure_passives_reader"):
		return {"ok": false, "status": NOT_READY, "reason": "formula_unsupported"}
	var reader: Callable
	if source == SOURCE_DERIVED:
		if _status != READY:
			return {"ok": false, "status": _status, "reason": "derived_not_ready: " + _reason}
		reader = read_passives
	elif source == SOURCE_CURRENT:
		var cs: Dictionary = current_status()
		if cs.status != READY:
			return {"ok": false, "status": cs.status, "reason": cs.reason}
		reader = read_current_passives
	else:
		return {"ok": false, "status": NOT_READY, "reason": "unknown_source:" + source}
	var ok: bool = formula.configure_passives_reader(reader)
	if ok:
		_derived_formulas = _derived_formulas.filter(func(w): return w.get_ref() != null and w.get_ref() != formula)
		if source == SOURCE_DERIVED:
			_derived_formulas.append(weakref(formula))
	return {"ok": ok, "status": READY if ok else NOT_READY, "source": source,
		"reason": "" if ok else "configure_passives_reader_rejected"}


# Metadata only: no current_status(), source getter or configuration.
func is_current_passives_reader_bound_to(expected: Callable) -> bool:
	return _current_bound and expected.is_valid() and _current_reader.is_valid() \
		and _current_reader == expected \
		and _current_reader.get_object() == expected.get_object() \
		and _current_reader.get_method() == expected.get_method()
