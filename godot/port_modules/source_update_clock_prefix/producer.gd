extends RefCounted
# source update clock prefix — pure producer + explicit _dtSp holder (candidate, not integrated)
# TASK CLAUDE8-SKILL-SOURCE-UPDATE-CLOCK-PREFIX-20261017
# Source: official cached handoff 620d50bf (inline fragments only), game.html @ f8a88898.
# This object never writes G/World/HP/clock. G writes are returned as owner write requests.
# Phase APIs below are ABSTRACT CANDIDATES for ENGINE wiring, not existing actual APIs.

const SCHEMA := "exoduser.godot.source-update-clock-prefix.v2"

# 60466 const PHYS_STEP=1000/60;
const PHYS_STEP := 1000.0 / 60.0
# hitstop 32580-32594: _dtSp=0.04
const HITSTOP_DT_SP := 0.04
const HITSTOP_CAP := 12

const P_IDLE := "idle"
const P_SYSTEM_LESSON := "system_lesson"
const P_G_ON := "g_on"
const P_PARRY_LESSON := "parry_lesson"
const P_EDITOR := "editor"
const P_PANEL_INPUTS := "panel_inputs_gap"
const P_PAUSED := "paused"
const P_BODY_GAP_TO_HITSTOP := "body_gap_to_hitstop"
const P_HITSTOP := "hitstop"
const P_GAP_HITSTOP_TO_SP := "gap_hitstop_to_sp"
const P_SP := "sp"
const P_GAP_SP_TO_STAGE_TIME := "gap_sp_to_stage_time"
const P_STAGE_PLAY_TIME := "stage_play_time"

const ORDER := [P_SYSTEM_LESSON, P_G_ON, P_PARRY_LESSON, P_EDITOR, P_PANEL_INPUTS,
	P_PAUSED, P_BODY_GAP_TO_HITSTOP, P_HITSTOP, P_GAP_HITSTOP_TO_SP, P_SP,
	P_GAP_SP_TO_STAGE_TIME, P_STAGE_PLAY_TIME]

# _dtSp holder. Not declared -> NOT_READY (no fallback 1).
var _dt_sp_declared := false
var _dt_sp: float = 0.0
var _dt_sp_writer := ""

# per-update cursor
var _in_update := false
var _g_ref: Variant = null
var _next_index := 0
var _returned_at := ""
var _not_ready_at := ""
var _hs_active: Variant = null
var _hs_dt_orig: Variant = null
var _sp_published := false
var _sp: float = 0.0


# ---------- _dtSp holder ----------

# 60463 let _dtSp=1;  (file-load declaration; distinct from any runtime fallback)
func declare_dt_sp() -> Dictionary:
	if _dt_sp_declared:
		return _nr("dt_sp_already_declared")
	_dt_sp_declared = true
	_dt_sp = 1.0
	_dt_sp_writer = "declaration_60463"
	return {"status": "OK", "dt_sp": _dt_sp}


# 61848 _dtSp=1;_impPerFrame=0;_txtPerFrame=0;
# _impPerFrame/_txtPerFrame are returned as owner write requests (owner NR here).
func render_front() -> Dictionary:
	if not _dt_sp_declared:
		return _nr("dt_sp_not_declared")
	if _in_update:
		return _nr("render_front_inside_update")
	_dt_sp = 1.0
	_dt_sp_writer = "render_front_61848"
	return {"status": "OK", "dt_sp": _dt_sp,
		"owner_writes": [{"name": "_impPerFrame", "value": 0}, {"name": "_txtPerFrame", "value": 0}]}


func read_dt_sp() -> Dictionary:
	if not _dt_sp_declared:
		return _nr("dt_sp_not_declared")
	return {"status": "OK", "dt_sp": _dt_sp, "writer": _dt_sp_writer}


# ---------- 61875 fixed accumulator schedule (acc/gameTime owned by caller) ----------
# while(_acc>=PHYS_STEP){ _gameTime+=PHYS_STEP; _now=_gameTime; update(); _acc-=PHYS_STEP; _didUpdate=true; }
# acc and game_time are the source ms accumulator/game time. Native ticks=min(delta*60,3)
# or a native epoch are NOT accepted as substitutes; the caller must hold the source values.

func sched_should_step(acc: Variant) -> Dictionary:
	if not _is_num(acc):
		return _nr("acc_not_number")
	return {"status": "OK", "step": float(acc) >= PHYS_STEP}


func sched_before_update(game_time: Variant) -> Dictionary:
	if not _is_num(game_time):
		return _nr("game_time_not_number")
	var gt := float(game_time) + PHYS_STEP
	return {"status": "OK", "game_time": gt, "now": gt}


func sched_after_update(acc: Variant) -> Dictionary:
	if not _is_num(acc):
		return _nr("acc_not_number")
	return {"status": "OK", "acc": float(acc) - PHYS_STEP, "did_update": true}


# ---------- update() prefix, one call per source update() ----------

func begin_update(g: Variant) -> Dictionary:
	if _in_update:
		return _nr("previous_update_not_ended")
	if not _dt_sp_declared:
		return _nr("dt_sp_not_declared")
	if typeof(g) != TYPE_DICTIONARY:
		return _nr("g_carrier_type_unknown")
	_in_update = true
	_g_ref = g
	_next_index = 0
	_returned_at = ""
	_not_ready_at = ""
	_hs_active = null
	_hs_dt_orig = null
	_sp_published = false
	_sp = 0.0
	return {"status": "OK"}


func end_update() -> Dictionary:
	if not _in_update:
		return _nr("not_in_update")
	_in_update = false
	_g_ref = null
	return read_update_state()


# window._systemLesson?.tick();
# obs.presence: "absent" = known current undefined/null (no call), "called" = owner called tick here (result ignored)
func phase_system_lesson(obs: Dictionary) -> Dictionary:
	var c := _enter(P_SYSTEM_LESSON, null)
	if c.status != "OK":
		return c
	var pres: Variant = obs.get("presence")
	if typeof(pres) != TYPE_STRING or (pres != "absent" and pres != "called"):
		return _halt_nr(P_SYSTEM_LESSON, "system_lesson_presence_unknown")
	return _cont(P_SYSTEM_LESSON)


# if(!G.on)return;
func phase_g_on(g: Variant) -> Dictionary:
	var c := _enter(P_G_ON, g, true)
	if c.status != "OK":
		return c
	if not _js_truthy(_g_ref.get("on")):
		return _ret(P_G_ON)
	return _cont(P_G_ON)


# if(window._parryLesson&&window._parryLesson.tick())return;
# obs.presence: "falsy" = known current falsy (no call), "called" = owner called tick here with obs.tick_result
func phase_parry_lesson(obs: Dictionary) -> Dictionary:
	var c := _enter(P_PARRY_LESSON, null)
	if c.status != "OK":
		return c
	var pres: Variant = obs.get("presence")
	if typeof(pres) != TYPE_STRING:
		return _halt_nr(P_PARRY_LESSON, "parry_lesson_presence_unknown")
	if pres == "falsy":
		return _cont(P_PARRY_LESSON)
	if pres == "called":
		if not obs.has("tick_result"):
			return _halt_nr(P_PARRY_LESSON, "parry_lesson_tick_result_missing")
		if _js_truthy(obs["tick_result"]):
			return _ret(P_PARRY_LESSON)
		return _cont(P_PARRY_LESSON)
	return _halt_nr(P_PARRY_LESSON, "parry_lesson_presence_unknown")


# if(_EDITOR_MODE){_editorUpdate();return}
# obs.editor_mode: the actual current _EDITOR_MODE value (key required); when truthy, obs.editor_update_called must be true
func phase_editor(obs: Dictionary) -> Dictionary:
	var c := _enter(P_EDITOR, null)
	if c.status != "OK":
		return c
	if not obs.has("editor_mode"):
		return _halt_nr(P_EDITOR, "editor_mode_unknown")
	if _js_truthy(obs["editor_mode"]):
		if obs.get("editor_update_called") != true:
			return _halt_nr(P_EDITOR, "editor_update_not_called")
		return _ret(P_EDITOR)
	return _cont(P_EDITOR)


# existing panel/input callbacks (names/results not in the official packet).
# Without an owner receipt this is NOT_READY, never skip/no-op.
func phase_panel_inputs(receipt: Variant) -> Dictionary:
	return _gap(P_PANEL_INPUTS, receipt, "panel_input_callbacks_not_in_packet")


# if(G.paused)return;
func phase_paused(g: Variant) -> Dictionary:
	var c := _enter(P_PAUSED, g, true)
	if c.status != "OK":
		return c
	if _js_truthy(_g_ref.get("paused")):
		return _ret(P_PAUSED)
	return _cont(P_PAUSED)


# source body between the early gate and 32580 (e.g. thunderStakes) — not in packet
func phase_body_gap_to_hitstop(receipt: Variant) -> Dictionary:
	return _gap(P_BODY_GAP_TO_HITSTOP, receipt, "body_between_gate_and_hitstop_not_in_packet")


# 32580-32594
# G.hitStop=0; if(G.hitStop>12)G.hitStop=12; const _hsActive=G.hitStop>0; const _hsDtOrig=_dtSp;
# if(_hsActive){ /*gap*/ _dtSp=0.04; }
# inner_receipt is required only when _hsActive is true (inner callbacks/bodies not in packet).
func phase_hitstop(g: Variant, inner_receipt: Variant = null) -> Dictionary:
	var c := _enter(P_HITSTOP, g, true)
	if c.status != "OK":
		return c
	var writes: Array = [{"target": "G.hitStop", "value": 0}]
	var hs := 0
	if hs > HITSTOP_CAP:
		hs = HITSTOP_CAP
		writes.append({"target": "G.hitStop", "value": HITSTOP_CAP})
	var active := hs > 0
	var dt_orig := _dt_sp
	if active:
		# statements before the inner gap are already-applied prefix effects; kept on NR/return
		_hs_active = active
		_hs_dt_orig = dt_orig
		var rr := _receipt_ok(inner_receipt)
		if rr != "":
			return _halt_nr(P_HITSTOP, "hitstop_inner_gap_" + rr, writes)
		if inner_receipt.get("returned") == true:
			return _ret(P_HITSTOP, writes)
		_dt_sp = HITSTOP_DT_SP
		_dt_sp_writer = "hitstop_32594"
	_hs_active = active
	_hs_dt_orig = dt_orig
	var r := _cont(P_HITSTOP)
	r["owner_writes"] = writes
	r["hs_active"] = active
	r["hs_dt_orig"] = dt_orig
	r["dt_sp"] = _dt_sp
	return r


# source between 32594 and 32680 — not in packet
func phase_gap_hitstop_to_sp(receipt: Variant) -> Dictionary:
	return _gap(P_GAP_HITSTOP_TO_SP, receipt, "body_between_hitstop_and_sp_not_in_packet")


# 32680-32683
# G.slowMo=0; const sp=(G.slowMo>0?.35:1)*_dtSp; if(G.slowMo>0)G.slowMo-=_dtSp;
func phase_sp(g: Variant) -> Dictionary:
	var c := _enter(P_SP, g, true)
	if c.status != "OK":
		return c
	var writes: Array = [{"target": "G.slowMo", "value": 0}]
	var slow := 0.0
	var sp := (0.35 if slow > 0 else 1.0) * _dt_sp
	if slow > 0:
		slow -= _dt_sp
		writes.append({"target": "G.slowMo", "value": slow})
	_sp = sp
	_sp_published = true
	var r := _cont(P_SP)
	r["owner_writes"] = writes
	r["sp"] = sp
	r["dt_sp"] = _dt_sp
	return r


# source between 32684 and 32741 (_uqFrame(sp)/killBuff/legendary/combo/DPS timers) — not in packet
func phase_gap_sp_to_stage_time(receipt: Variant) -> Dictionary:
	return _gap(P_GAP_SP_TO_STAGE_TIME, receipt, "body_between_sp_and_stage_time_not_in_packet")


# 32742 G.stageTime=(G.stageTime||0)+sp; G.playTime=(G.playTime||0)+sp;
# (G.x||0): a JS-falsy current (absent/0/NaN/null/false/"") -> 0 is this source statement's
# own rule, not a provider default. A truthy non-number current has no ToNumber/concat
# owner here -> NOT_READY (the earlier statement's write stays as applied prefix).
func phase_stage_play_time(g: Variant) -> Dictionary:
	var c := _enter(P_STAGE_PLAY_TIME, g, true)
	if c.status != "OK":
		return c
	if not _sp_published:
		return _halt_nr(P_STAGE_PLAY_TIME, "sp_not_published")
	var writes: Array = []
	for key in ["stageTime", "playTime"]:
		var current: Variant = _g_ref.get(key)
		var base := 0.0
		if _js_truthy(current):
			if not _is_num(current):
				return _halt_nr(P_STAGE_PLAY_TIME, "stage_play_time_current_not_number_" + key, writes)
			base = float(current)
		writes.append({"target": "G." + key, "value": base + _sp})
	var r := _cont(P_STAGE_PLAY_TIME)
	r["owner_writes"] = writes
	r["sp"] = _sp
	return r


func read_sp() -> Dictionary:
	# sp lives only within the open update; after end_update/render_front it is not current
	if not _in_update:
		return _nr("no_current_update")
	if _sp_published:
		return {"status": "OK", "sp": _sp}
	if _returned_at != "":
		return {"status": "UNREACHED", "returned_at": _returned_at}
	if _not_ready_at != "":
		return {"status": "NOT_READY", "at": _not_ready_at}
	return {"status": "UNREACHED", "next_phase": _phase_name(_next_index)}


func read_update_state() -> Dictionary:
	return {
		"in_update": _in_update,
		"applied_phases": ORDER.slice(0, _next_index),
		"next_phase": _phase_name(_next_index),
		"returned_at": _returned_at,
		"not_ready_at": _not_ready_at,
		"hs_active": _hs_active,
		"hs_dt_orig": _hs_dt_orig,
		"sp_published": _sp_published,
		"dt_sp": _dt_sp if _dt_sp_declared else null,
		"dt_sp_writer": _dt_sp_writer,
		"hitstop_dt_restore": "NR (restore of _hsDtOrig not in packet)",
	}


# ---------- internals ----------

func _enter(phase: String, g: Variant, g_required: bool = false) -> Dictionary:
	if not _in_update:
		return _nr("not_in_update")
	if _returned_at != "":
		return _nr("update_already_returned_at_" + _returned_at)
	if _not_ready_at != "":
		return _nr("update_halted_not_ready_at_" + _not_ready_at)
	if _next_index >= ORDER.size() or ORDER[_next_index] != phase:
		return _nr("phase_order_expected_" + _phase_name(_next_index))
	# G phases must receive the current G; no-G phases pass g_required=false
	if g_required:
		if typeof(g) == TYPE_NIL:
			return _nr("g_missing")
		if not is_same(g, _g_ref):
			return _nr("g_reference_changed")
	return {"status": "OK"}


func _gap(phase: String, receipt: Variant, why: String) -> Dictionary:
	var c := _enter(phase, null)
	if c.status != "OK":
		return c
	var rr := _receipt_ok(receipt)
	if rr != "":
		return _halt_nr(phase, why + "_" + rr)
	if receipt.get("returned") == true:
		return _ret(phase)
	return _cont(phase)


# abstract owner gap receipt: {"completed": true, "returned": bool}
func _receipt_ok(receipt: Variant) -> String:
	if typeof(receipt) != TYPE_DICTIONARY:
		return "no_receipt"
	if receipt.get("completed") != true:
		return "receipt_not_completed"
	if typeof(receipt.get("returned")) != TYPE_BOOL:
		return "receipt_returned_unknown"
	return ""


func _cont(phase: String) -> Dictionary:
	_next_index += 1
	return {"status": "CONTINUE", "phase": phase}


func _ret(phase: String, writes: Array = []) -> Dictionary:
	_next_index += 1
	_returned_at = phase
	var r := {"status": "RETURNED", "phase": phase}
	if not writes.is_empty():
		r["owner_writes"] = writes
	return r


# Gap/unknown is NOT a skip: halt at this slot, keep every earlier applied phase/effect.
# writes = source statements of this phase that precede the gap (applied prefix, owner must apply).
func _halt_nr(phase: String, why: String, writes: Array = []) -> Dictionary:
	_not_ready_at = phase
	var r := {"status": "PARTIAL_NOT_READY" if (_next_index > 0 or not writes.is_empty()) else "NOT_READY",
		"phase": phase, "reason": why, "applied_phases": ORDER.slice(0, _next_index)}
	if not writes.is_empty():
		r["owner_writes"] = writes
	return r


func _nr(why: String) -> Dictionary:
	return {"status": "NOT_READY", "reason": why}


func _phase_name(i: int) -> String:
	return ORDER[i] if i < ORDER.size() else "done"


func _is_num(v: Variant) -> bool:
	return typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT


# JS ToBoolean on a Godot view: absent key -> null -> false; objects/arrays truthy even if empty
func _js_truthy(v: Variant) -> bool:
	match typeof(v):
		TYPE_NIL:
			return false
		TYPE_BOOL:
			return v
		TYPE_INT:
			return v != 0
		TYPE_FLOAT:
			return v != 0.0 and not is_nan(v)
		TYPE_STRING, TYPE_STRING_NAME:
			return String(v) != ""
		TYPE_OBJECT:
			return is_instance_valid(v)
		_:
			return true
