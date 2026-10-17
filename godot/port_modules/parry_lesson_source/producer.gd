extends RefCounted
## parry_lesson_source — current `window._parryLesson` singleton holder / publisher + guard reader.
##
## 원 R parry-lesson.js:2-6 file-init 리터럴, :386-393 start, :685-698 finish guard, :12-15 resetForNewCharacter,
## R resource-practice.js:44-45 chapter 2 전환, R game.html:33360 guard
##   `!(window._parryLesson?.active&&window._parryLesson.chapter===2)`
## 의 현재 객체 상태만 보유한다. 이 guard 는 자연 ST/MP(33361-33362)만 막고 HP/holy flat 은 독립이다.
##
## 기본 authority 는 MISSING(NOT_READY)이다. 원 미생성/null/falsy/inactive 상태는 publisher 가 명시 선언할 때만
## READY inactive 가 된다. 부재를 false 로 자동 대체하지 않는다. 자체 clock/_process/_physics_process 는 없다.
## 전체 lesson UI/input/update/skipKey 영속성·start/finish 외부 복원은 미이식(UNPORTED)이다.

const SCHEMA := "exoduser.godot.parry-lesson-source-holder.v1"
const STATUS_READY := "READY"
const STATUS_NOT_READY := "NOT_READY"

## authority
const AUTH_MISSING := "MISSING"
const AUTH_CURRENT_LESSON := "CURRENT_LESSON"
const AUTH_PROPERTY_UNCREATED := "SOURCE_PROPERTY_UNCREATED"  # window._parryLesson 미생성(undefined)
const AUTH_PROPERTY_UNSET := "SOURCE_PROPERTY_UNSET"          # 생성 후 delete/undefined 대입
const AUTH_PROPERTY_FALSY := "SOURCE_PROPERTY_FALSY"          # null/false/0/""/NaN 대입

## origin — 호출자가 선언한다. 이 모듈은 실제 Main binding 을 증명하지 않는다.
const ORIGIN_OWN_CONSTRUCTOR_FIXTURE := "own_constructor_fixture"
const ORIGIN_NATIVE_MAIN_BINDING := "native_main_binding"
const ORIGINS := [ORIGIN_OWN_CONSTRUCTOR_FIXTURE, ORIGIN_NATIVE_MAIN_BINDING]

## source phase
const PHASE_FILE_INIT := "source_file_init"
const PHASE_EXTERNAL_CURRENT := "external_current_publisher"
const PHASE_PROVIDER_PACKET := "provider_packet"
const PHASE_PROPERTY_WITNESS := "source_property_witness"

## native dispatcher guard keys (resource_regeneration_source GUARD_*)
const GUARD_ACTIVE := "parry_lesson_active"
const GUARD_CHAPTER := "parry_lesson_chapter"
const MAX_SAFE_INTEGER := 9007199254740991.0  # JS Number.MAX_SAFE_INTEGER

## 기존 공개 JS ToBoolean (read-only 재사용).
const AFFIX := preload("res://port_modules/equipment_affix_reader/producer.gd")

## source constants
const SOURCE_FILE_INIT_REF := "R parry-lesson.js:2-6"
const SOURCE_GUARD_REF := "R game.html:33360"
const CHAPTER1_LABEL_COUNT := 8  # R parry-lesson.js:5 chapter!==2 labels 8개 (start 에서 chapter=1 이후 평가)
const FILE_INIT_FIELD_ORDER := ["active", "seen", "phase", "step", "checks", "shot", "heldDirections"]
const FILE_INIT_EXCLUDED := ["t()", "get labels()", "skipKey()", "resetForNewCharacter()", "dismissed()", "<methods/UI>"]
const PACKET_KIND := "parry_lesson_source_constructor_packet"
const PROVIDER_ENVELOPE_KEYS := ["ready", "reason", "current", "packet_kind"]
## AFFIX.js_truthy 에 넘기는 인식 타입. 그 밖(Vector2 등)은 JS 값이 아니므로 NR.
const JS_RECOGNIZED_TYPES := [
	TYPE_NIL, TYPE_BOOL, TYPE_INT, TYPE_FLOAT, TYPE_STRING, TYPE_STRING_NAME, TYPE_OBJECT,
	TYPE_ARRAY, TYPE_DICTIONARY, TYPE_CALLABLE, TYPE_PACKED_BYTE_ARRAY, TYPE_PACKED_INT32_ARRAY,
	TYPE_PACKED_INT64_ARRAY, TYPE_PACKED_FLOAT32_ARRAY, TYPE_PACKED_FLOAT64_ARRAY, TYPE_PACKED_STRING_ARRAY,
]

var _authority: String = AUTH_MISSING
var _current: Variant = null
var _owner_declared := false
var _owner_ref: WeakRef = null
var _witness_raw: Variant = null
var _epoch := 0
var _origin := ""
var _source_phase := ""
var _provenance: Dictionary = {}
var _missing_reason := "never_published"
var _last_projection := ""
var _counts := {
	"publish": 0, "revoke": 0, "publish_rejected": 0,
	"read_guard": 0, "read_guard_not_ready": 0, "epoch_rejected": 0,
	"reset_for_new_character": 0, "start_projection": 0, "resource_start_projection": 0, "finish_projection": 0,
}


# ---------------------------------------------------------------- static source packet

## 원 file-init 리터럴의 정적 constructor packet. status SOURCE_BOOT / current:false.
## fields 는 [key,value] 쌍 Array 라 lesson 객체 shape 가 아니며 publish_current 로 current 가 될 수 없다.
static func source_constructor_packet() -> Dictionary:
	var lit := _fresh_file_init_literal()
	var fields: Array = []
	for k in FILE_INIT_FIELD_ORDER:
		fields.append([k, lit[k]])
	return {
		"packet_kind": PACKET_KIND, "status": "SOURCE_BOOT", "current": false,
		"source": SOURCE_FILE_INIT_REF, "fields": fields, "chapter_present": false,
		"excluded": FILE_INIT_EXCLUDED.duplicate(), "held_directions_repr": "Dictionary-as-Set (keys)",
	}


## 원 리터럴(부분): active false, seen false, phase 'intro', step 0, checks Array(8).fill(false), shot null,
## heldDirections new Set(). chapter 필드는 없다. 매 호출 새 객체.
static func _fresh_file_init_literal() -> Dictionary:
	var checks: Array = []
	checks.resize(8)
	checks.fill(false)
	return {
		"active": false, "seen": false, "phase": "intro", "step": 0,
		"checks": checks, "shot": null, "heldDirections": {},
	}


## JS ToBoolean wrapper. 값 판정은 기존 AFFIX.js_truthy 이며, 여기서는 freed Object 와
## 비인식 Godot 타입만 null(NR)로 거른다.
static func js_truthy(v: Variant) -> Variant:
	var t := typeof(v)
	if t == TYPE_OBJECT and not is_instance_valid(v):
		return null
	if not JS_RECOGNIZED_TYPES.has(t):
		return null
	return AFFIX.js_truthy(v)


## 원 `chapter===2` 비교에 넘길 JS Number → native int. 정수 int 는 그대로(0/3/99 포함),
## 유한·정수·safe-integer float 은 정확 변환(2.0 → 2). 그 밖은 null(NR, 강제 변환 없음).
static func source_chapter_int(v: Variant) -> Variant:
	if typeof(v) == TYPE_INT:
		return int(v)
	if typeof(v) == TYPE_FLOAT:
		var f := float(v)
		if is_nan(f) or is_inf(f) or f != floorf(f) or absf(f) > MAX_SAFE_INTEGER:
			return null
		return int(f)
	return null


# ---------------------------------------------------------------- publish / revoke

## 원 source file-init publisher 가 실제로 실행될 때만 호출. 새 리터럴을 current 소유 참조로 설치한다.
func publish_file_init(origin: String, provenance: Dictionary = {}) -> Dictionary:
	if not ORIGINS.has(origin):
		return _reject("origin_invalid")
	return _install(AUTH_CURRENT_LESSON, _fresh_file_init_literal(), null, origin, PHASE_FILE_INIT, provenance)


## 외부 원 lesson controller 의 현재 객체(Dictionary/Object). identity 유지, deep clone 없음.
func publish_current(lesson: Variant, origin: String, provenance: Dictionary = {}, owner: Variant = null) -> Dictionary:
	if not ORIGINS.has(origin):
		return _reject("origin_invalid")
	var owner_why := _owner_invalid(owner)
	if not owner_why.is_empty():
		return _reject(owner_why)
	var why := _lesson_shape_invalid(lesson)
	if not why.is_empty():
		return _reject(why)
	return _install(AUTH_CURRENT_LESSON, lesson, owner, origin, PHASE_EXTERNAL_CURRENT, provenance)


## 원 window._parryLesson 미생성("uncreated") 또는 해제("unset")의 명시 권위 witness.
func publish_source_property_absent(kind: String, origin: String, provenance: Dictionary = {}) -> Dictionary:
	if not ORIGINS.has(origin):
		return _reject("origin_invalid")
	var auth := ""
	if kind == "uncreated":
		auth = AUTH_PROPERTY_UNCREATED
	elif kind == "unset":
		auth = AUTH_PROPERTY_UNSET
	else:
		return _reject("absent_kind_invalid")
	return _install(auth, null, null, origin, PHASE_PROPERTY_WITNESS, provenance)


## 원 window._parryLesson 이 JS falsy 원시값인 명시 권위 witness. truthy raw 는 거부.
func publish_source_property_falsy(raw: Variant, origin: String, provenance: Dictionary = {}) -> Dictionary:
	if not ORIGINS.has(origin):
		return _reject("origin_invalid")
	var t: Variant = js_truthy(raw)
	if t == null or bool(t):
		return _reject("falsy_witness_raw_not_falsy")
	var r := _install(AUTH_PROPERTY_FALSY, null, null, origin, PHASE_PROPERTY_WITNESS, provenance)
	_witness_raw = raw
	return r


## 외부 provider packet. READY+lesson 은 identity 유지 설치, SOURCE_PROPERTY_* 는 witness,
## 그 밖(NOT_READY/형식 오류)은 authority MISSING 으로 철회한다(READY false 생성 금지).
func publish_provider_packet(packet: Variant, origin: String, provenance: Dictionary = {}, owner: Variant = null) -> Dictionary:
	if not ORIGINS.has(origin):
		return _reject("origin_invalid")
	var owner_why := _owner_invalid(owner)
	if not owner_why.is_empty():
		return _reject(owner_why)
	if not (packet is Dictionary):
		return _revoke_result("provider_packet_not_dictionary")
	var p: Dictionary = packet
	if not (p.get("status", null) is String):
		return _revoke_result("provider_status_missing")
	var st := String(p["status"])
	if st == STATUS_READY:
		if not p.has("lesson"):
			return _revoke_result("provider_ready_without_lesson")
		var why := _lesson_shape_invalid(p["lesson"])
		if not why.is_empty():
			return _revoke_result("provider_" + why)
		return _install(AUTH_CURRENT_LESSON, p["lesson"], owner, origin, PHASE_PROVIDER_PACKET, provenance)
	if st == AUTH_PROPERTY_UNCREATED or st == AUTH_PROPERTY_UNSET:
		return _install(st, null, null, origin, PHASE_PROVIDER_PACKET, provenance)
	if st == AUTH_PROPERTY_FALSY:
		var t: Variant = js_truthy(p["raw"]) if p.has("raw") else null
		if t == null or bool(t):
			return _revoke_result("provider_falsy_raw_invalid")
		var r := _install(AUTH_PROPERTY_FALSY, null, null, origin, PHASE_PROVIDER_PACKET, provenance)
		_witness_raw = p["raw"]
		return r
	return _revoke_result("provider_not_ready:%s:%s" % [st, str(p.get("reason", ""))])


## 권위 철회(late unknown state). 이후 guard 는 NOT_READY.
func revoke(reason: String) -> void:
	_authority = AUTH_MISSING
	_current = null
	_owner_declared = false
	_owner_ref = null
	_witness_raw = null
	_origin = ""
	_source_phase = ""
	_provenance = {}
	_missing_reason = reason if not reason.is_empty() else "revoked"
	_epoch += 1
	_counts.revoke += 1


# ---------------------------------------------------------------- getters

func get_authority() -> String:
	return _authority


func get_epoch() -> int:
	return _epoch


func has_authority() -> bool:
	return _authority != AUTH_MISSING


func has_current_lesson() -> bool:
	return _current_live().ok


## 실제 현재 lesson 참조(raw). 권위 없음/freed/witness 상태면 null. 향후 PHT 등 소비자용.
func get_current_lesson_reference() -> Variant:
	var c := _current_live()
	return c.lesson if c.ok else null


func get_provenance() -> Dictionary:
	return _provenance.duplicate(true)


func get_counts() -> Dictionary:
	return _counts.duplicate(true)


func get_snapshot() -> Dictionary:
	var live := _current_live()
	return {
		"schema": SCHEMA, "authority": _authority, "epoch": _epoch, "origin": _origin,
		"source_phase": _source_phase, "provenance": _provenance.duplicate(true),
		"missing_reason": _missing_reason if _authority == AUTH_MISSING else "",
		"current_present": live.ok, "current_kind": _kind(_current),
		"owner_declared": _owner_declared, "witness_raw": _witness_raw,
		"last_projection": _last_projection, "counts": _counts.duplicate(true),
		"main_binding_proven": false, "full_main_ready": false,
		"automatic_clock": false, "unported": [
			"lesson UI/input/update/render", "skipKey URL/char/slot source (external callback)",
			"localStorage persistence (external command)", "start/finish external restoration",
			"NativeMain publication/lifecycle (ENGINE)",
		],
	}


# ---------------------------------------------------------------- guard reader

## 정확 native guard dict 또는 NOT_READY 시 null.
## READY active → {parry_lesson_active:true, parry_lesson_chapter:int}; inactive → {parry_lesson_active:false}.
func read_guard() -> Variant:
	var d := _eval(-1)
	return d.value if d.ready else null


## epoch 고정 reader. 재발행/철회 후에는 null(NOT_READY).
func read_guard_for_epoch(epoch: int) -> Variant:
	var d := _eval(epoch)
	return d.value if d.ready else null


func read_guard_detail() -> Dictionary:
	return _eval(-1)


func read_guard_detail_for_epoch(epoch: int) -> Dictionary:
	return _eval(epoch)


## dispatcher services.lesson 용 인자 0 Callable. 원 window._parryLesson 처럼 매 호출 현재 holder 를 읽는다.
## 첫 publish 전에 얻어도 되며 그때는 NR, publish 후 READY, 교체 후 새 current, revoke 후 NR.
func get_dispatcher_lesson_callable() -> Callable:
	return Callable(self, "read_guard")


## 진단/cohort 전용: 획득 시점 epoch 고정 Callable. 실제 service 로 쓰지 않는다.
func get_pinned_dispatcher_lesson_callable() -> Callable:
	return Callable(self, "read_guard_for_epoch").bind(_epoch)


# ---------------------------------------------------------------- external controller state setters

## R parry-lesson.js:12-15. skippedKey=null → newCharacterKey=skipKey() → seen=false → try removeItem(key).
## active/chapter/phase/step/checks 는 바꾸지 않는다. skipKey 와 storage 는 외부 Callable 이다.
func reset_for_new_character(skip_key_reader: Callable, storage_remove_item: Callable = Callable()) -> Dictionary:
	_counts.reset_for_new_character += 1
	var c := _current_live()
	if not c.ok:
		return _nr(c.reason, [])
	if not skip_key_reader.is_valid() or skip_key_reader.get_argument_count() != 0:
		return _nr("skip_key_reader_missing", [])
	var storage_bound := storage_remove_item.is_valid()
	if storage_bound and storage_remove_item.get_argument_count() != 1:
		return _nr("storage_remove_item_arity", [])
	var lesson: Variant = c.lesson
	if not _keys_writable(lesson, ["skippedKey", "newCharacterKey", "seen"]):
		return _nr("object_property_missing", [])
	var writes: Array = []
	_write(lesson, "skippedKey", null)
	writes.append("skippedKey")
	var key: Variant = skip_key_reader.call()
	if not (key is String) or String(key).is_empty():
		return _nr("skip_key_not_string", writes)
	_write(lesson, "newCharacterKey", key)
	writes.append("newCharacterKey")
	_write(lesson, "seen", false)
	writes.append("seen")
	if storage_bound:
		storage_remove_item.call(key)
	_last_projection = "reset_for_new_character"
	return {
		"status": STATUS_READY, "ready": true, "reason": "", "epoch": _epoch, "writes": writes,
		"new_character_key": key, "storage": "dispatched_external" if storage_bound else "not_bound_external",
	}


## R parry-lesson.js:391,393 의 lesson 상태 투영만: chapter=1 → seen=true → active=true → phase='intro'
## → step=-3 → checks=Array(8).fill(false). UI/Player/spawn/snapshot/resourcePractice.save 는 외부.
func adopt_source_start_projection() -> Dictionary:
	_counts.start_projection += 1
	var checks: Array = []
	checks.resize(CHAPTER1_LABEL_COUNT)
	checks.fill(false)
	return _project("source_start", [
		["chapter", 1], ["seen", true], ["active", true], ["phase", "intro"], ["step", -3], ["checks", checks],
	])


## R resource-practice.js:44-45 같은 lesson 객체에 chapter=2 → checks → step=0 → pending=null → phase='practice'.
## resourceGuide(UI)·focusTicks/failTicks(timer)는 제외. labels 길이는 외부 resourcePractice 소유(기본값 없음).
func adopt_resource_practice_start_projection(resource_labels_length: Variant) -> Dictionary:
	_counts.resource_start_projection += 1
	if typeof(resource_labels_length) != TYPE_INT or int(resource_labels_length) < 0:
		return _nr("resource_labels_length_required", [])
	var checks: Array = []
	checks.resize(int(resource_labels_length))
	checks.fill(false)
	return _project("resource_practice_start", [
		["chapter", 2], ["checks", checks], ["step", 0], ["pending", null], ["phase", "practice"],
	])


## R parry-lesson.js:686,698 guard/상태만: `if(!this.active)return;` 이후 active=false → pending=null →
## chainPractice=null → attackEnemies=[] → parryEnemy=null → parriedShot=null → saved=null.
## 687-697 외부 복원과 panel/backdrop 제거는 호출자 몫이며 이 API 는 수행·주장하지 않는다.
func adopt_finish_state_projection() -> Dictionary:
	_counts.finish_projection += 1
	var c := _current_live()
	if not c.ok:
		return _nr(c.reason, [])
	var a := _read(c.lesson, "active")
	var t: Variant = js_truthy(a.value) if a.present else false
	if t == null:
		return _nr("active_value_unsupported_type", [])
	if not bool(t):
		return {"status": STATUS_READY, "ready": true, "reason": "", "epoch": _epoch, "writes": [],
			"outcome": "finish_guard_returned", "external_restoration_by_module": false, "ui_completed": false}
	var r := _project("finish_state", [
		["active", false], ["pending", null], ["chainPractice", null], ["attackEnemies", []],
		["parryEnemy", null], ["parriedShot", null], ["saved", null],
	])
	r["outcome"] = "finish_state_written" if r.ready else "not_ready"
	r["external_restoration_by_module"] = false
	r["ui_completed"] = false
	return r


# ---------------------------------------------------------------- internals

func _eval(pinned_epoch: int) -> Dictionary:
	_counts.read_guard += 1
	var d := _eval_inner(pinned_epoch)
	d["epoch"] = _epoch
	d["authority"] = _authority
	d["origin"] = _origin
	d["source_phase"] = _source_phase
	d["source"] = SOURCE_GUARD_REF
	if not d.ready:
		_counts.read_guard_not_ready += 1
	return d


func _eval_inner(pinned_epoch: int) -> Dictionary:
	if pinned_epoch >= 0 and pinned_epoch != _epoch:
		_counts.epoch_rejected += 1
		return _guard_nr("epoch_replaced")
	if _authority == AUTH_MISSING:
		return _guard_nr("authority_missing:" + _missing_reason)
	if _authority != AUTH_CURRENT_LESSON:
		# window._parryLesson?.active → undefined (falsy). chapter 미접근.
		return _guard_ready(false, 0, _authority.to_lower())
	var c := _current_live()
	if not c.ok:
		return _guard_nr(c.reason)
	var a := _read(c.lesson, "active")
	if not a.present:
		return _guard_ready(false, 0, "active_property_missing")
	var t: Variant = js_truthy(a.value)
	if t == null:
		return _guard_nr("active_value_unsupported_type:%d" % typeof(a.value))
	if not bool(t):
		return _guard_ready(false, 0, "active_falsy")  # && 단락: chapter 미접근
	var ch := _read(c.lesson, "chapter")
	if not ch.present:
		return _guard_nr("active_chapter_missing")
	var chi: Variant = source_chapter_int(ch.value)
	if chi == null:
		return _guard_nr("active_chapter_not_integral_number")
	return _guard_ready(true, int(chi), "active_chapter")


func _guard_ready(active: bool, chapter: int, reason: String) -> Dictionary:
	var v := {GUARD_ACTIVE: active}
	if active:
		v[GUARD_CHAPTER] = chapter
	return {"status": STATUS_READY, "ready": true, "reason": reason, "value": v}


func _guard_nr(reason: String) -> Dictionary:
	return {"status": STATUS_NOT_READY, "ready": false, "reason": reason, "value": null}


## owner 는 선택. null 이면 미선언(holder 가 lesson 보유). 명시된 freed/비Object owner 는 거부.
static func _owner_invalid(owner: Variant) -> String:
	if typeof(owner) == TYPE_NIL:
		return ""
	if typeof(owner) != TYPE_OBJECT:
		return "owner_not_object"
	if not is_instance_valid(owner):
		return "owner_freed"
	return ""


func _install(auth: String, lesson: Variant, owner: Variant, origin: String, phase: String, provenance: Dictionary) -> Dictionary:
	_authority = auth
	_current = lesson
	_owner_declared = is_instance_valid(owner)
	_owner_ref = weakref(owner) if _owner_declared else null
	_witness_raw = null
	_origin = origin
	_source_phase = phase
	_missing_reason = ""
	_last_projection = ""
	_epoch += 1
	_counts.publish += 1
	_provenance = provenance.duplicate(true)
	_provenance["origin"] = origin
	_provenance["source_phase"] = phase
	_provenance["authority"] = auth
	_provenance["epoch"] = _epoch
	_provenance["source"] = SOURCE_FILE_INIT_REF if phase == PHASE_FILE_INIT else SOURCE_GUARD_REF
	_provenance["main_binding_proven"] = false
	return {"status": STATUS_READY, "ready": true, "reason": "", "epoch": _epoch, "authority": auth}


func _reject(reason: String) -> Dictionary:
	_counts.publish_rejected += 1
	return {"status": STATUS_NOT_READY, "ready": false, "reason": reason, "epoch": _epoch, "authority": _authority}


func _revoke_result(reason: String) -> Dictionary:
	revoke(reason)
	return {"status": STATUS_NOT_READY, "ready": false, "reason": reason, "epoch": _epoch, "authority": _authority}


func _nr(reason: String, writes: Array) -> Dictionary:
	return {"status": STATUS_NOT_READY, "ready": false, "reason": reason, "epoch": _epoch, "writes": writes}


func _lesson_shape_invalid(lesson: Variant) -> String:
	if typeof(lesson) == TYPE_OBJECT:
		return "" if is_instance_valid(lesson) else "lesson_object_freed"
	if not (lesson is Dictionary):
		return "lesson_not_dictionary_or_object"
	var d: Dictionary = lesson
	if d.get("packet_kind", null) == PACKET_KIND:
		return "constructor_packet_not_current"
	if d.get("status", null) is String:
		for k in PROVIDER_ENVELOPE_KEYS:
			if d.has(k):
				return "provider_envelope_not_lesson"
	return ""


## {ok, reason, lesson}
func _current_live() -> Dictionary:
	if _authority != AUTH_CURRENT_LESSON:
		return {"ok": false, "reason": "no_current_lesson:" + _authority, "lesson": null}
	if _owner_declared and (_owner_ref == null or _owner_ref.get_ref() == null):
		return {"ok": false, "reason": "publisher_owner_freed", "lesson": null}
	if typeof(_current) == TYPE_OBJECT and not is_instance_valid(_current):
		return {"ok": false, "reason": "current_lesson_freed", "lesson": null}
	return {"ok": true, "reason": "", "lesson": _current}


func _project(label: String, pairs: Array) -> Dictionary:
	var c := _current_live()
	if not c.ok:
		return _nr(c.reason, [])
	var keys: Array = []
	for p in pairs:
		keys.append(p[0])
	if not _keys_writable(c.lesson, keys):
		return _nr("object_property_missing", [])
	for p in pairs:
		_write(c.lesson, p[0], p[1])
	_last_projection = label
	return {"status": STATUS_READY, "ready": true, "reason": "", "epoch": _epoch, "writes": keys}


static func _kind(v: Variant) -> String:
	if typeof(v) == TYPE_OBJECT:
		return "object" if is_instance_valid(v) else "freed_object"
	if v is Dictionary:
		return "dictionary"
	return "none"


static func _obj_has(o: Object, key: String) -> bool:
	for p in o.get_property_list():
		if String(p.name) == key:
			return true
	return false


## {present, value}
static func _read(lesson: Variant, key: String) -> Dictionary:
	if lesson is Dictionary:
		var d: Dictionary = lesson
		return {"present": d.has(key), "value": d.get(key, null)}
	var o: Object = lesson
	if _obj_has(o, key):
		return {"present": true, "value": o.get(key)}
	return {"present": false, "value": null}


static func _keys_writable(lesson: Variant, keys: Array) -> bool:
	if lesson is Dictionary:
		return true
	for k in keys:
		if not _obj_has(lesson, String(k)):
			return false
	return true


static func _write(lesson: Variant, key: String, value: Variant) -> void:
	if lesson is Dictionary:
		lesson[key] = value
	else:
		(lesson as Object).set(key, value)


# Current active-only status for consumers which do not read lesson chapter.
# Uses the existing published fields/epoch; no state, cache or clock is added.
func read_active_status() -> Dictionary:
	var epoch: int = _epoch
	var authority: String = _authority
	var current: Variant = _current
	var owner_declared: bool = _owner_declared
	var owner_ref: WeakRef = _owner_ref
	var out: Dictionary = {"status":"NOT_READY", "ready":false, "reason":"",
		"authority":authority, "epoch":epoch, "origin":_origin,
		"source_phase":_source_phase, "source":"parry_lesson_source.read_active_status"}
	if authority == AUTH_MISSING:
		out.reason = "authority_missing:" + _missing_reason
		return out
	if owner_declared and (not is_instance_valid(owner_ref) or not is_instance_valid(owner_ref.get_ref())):
		out.reason = "publisher_owner_freed"
		return out
	if authority in [AUTH_PROPERTY_UNCREATED, AUTH_PROPERTY_UNSET, AUTH_PROPERTY_FALSY]:
		if authority == AUTH_PROPERTY_FALSY:
			var raw: Variant = _witness_raw
			if typeof(raw) not in JS_RECOGNIZED_TYPES \
					or (typeof(raw) == TYPE_OBJECT and not is_instance_valid(raw)):
				out.reason = "falsy_witness_unsupported"
				return out
			if AFFIX.js_truthy(raw):
				out.reason = "falsy_witness_not_falsy"
				return out
		out.merge({"status":"READY", "ready":true, "reason":"explicit_inactive_witness",
			"active":false, "known_absent":authority != AUTH_PROPERTY_FALSY}, true)
		return out
	if authority != AUTH_CURRENT_LESSON:
		out.reason = "authority_unknown"
		return out
	if typeof(current) == TYPE_OBJECT and not is_instance_valid(current):
		out.reason = "current_lesson_freed"
		return out
	if typeof(current) not in [TYPE_DICTIONARY, TYPE_OBJECT]:
		out.reason = "current_lesson_unknown"
		return out
	# Exactly one active-property query, including a possible Object getter.
	var active: Variant = current.get("active")
	if typeof(current) == TYPE_OBJECT and not is_instance_valid(current):
		out.reason = "current_lesson_freed_during_active_read"
		return out
	if _epoch != epoch or _authority != authority or not is_same(_current, current) \
			or _owner_declared != owner_declared or not is_same(_owner_ref, owner_ref):
		out.reason = "active_read_context_changed"
		out["current_epoch"] = _epoch
		return out
	if owner_declared and (not is_instance_valid(owner_ref) or not is_instance_valid(owner_ref.get_ref())):
		out.reason = "publisher_owner_freed_during_active_read"
		return out
	if typeof(active) not in JS_RECOGNIZED_TYPES \
			or (typeof(active) == TYPE_OBJECT and not is_instance_valid(active)):
		out.reason = "active_value_unsupported_or_freed"
		return out
	out.merge({"status":"READY", "ready":true, "reason":"current_active",
		"active":AFFIX.js_truthy(active), "known_absent":false}, true)
	return out
