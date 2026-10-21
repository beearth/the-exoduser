class_name ExoduserNativeSourcePlayerLife
extends RefCounted
## PCI-01 (2026-10-21, PC-LIFE-PACK) — 플레이어 생명주기 집행 owner.
##
## 원본(game.html R 65,692행 sha256 4d911cdd…):
##   die() G43721–43751          — reviveOnce 우선(G43727) → fallen(G43729–43732)
##   _fallenResolve() G43847–43872 — 악마화 부활 성공(G43849–43865) / 진짜 사망(G43867–43872)
##   retry G63469–63530          — EXP 30% 손실(G63476–63477) → [스테이지 재구성: Mac] →
##                                  자원·상태 리셋(G63521) → applyStats(G63525) →
##                                  _refillRespawnResources(G63526 → G63453–63456)
##   goToLobby G63673–63682      — G63678 사망이면 HP/ST/MP/shield 풀·idle 후 저장(저장은 Mac)
## 역할 분리:
##   - PC(이 모듈): death_token 발급(HP0 이벤트), 원자적 actor/자원/P 쓰기, 단계 검증.
##   - Mac: fallen 300 source-sp countdown(정지 중 0), 사망 순간 확률·쿨다운·roll 계산/저장
##     (G43738–43751), UI/사운드/G 상태(G.on·_sStats·BGM·HUD), 스테이지 재구성, 저장.
## 기존 player.gd HP0 블록(state="dead" + player_died)은 수정하지 않는다. 그 terminal dead를
## 이 모듈이 발급한 토큰으로만 인수한다. 임의 iframe setter 없음 — op별 원본 값만 쓴다.
## 틱 경로 코드 0(이벤트/요청 전용). get_method_list/get_property_list/get_signal_list 0.

signal native_player_life_phase_changed(snapshot: Dictionary)

const MAIN_PATH = "res://scripts/main.gd"
const STATE_PATH = "res://scripts/native_source_new_run_state.gd"
const AUTHORITY_PATH = "res://scripts/native_source_resource_authority.gd"
const SCHEMA = "exoduser.godot.source-player-life.v1"

const OP_FALLEN_ENTER = "fallen_enter"
const OP_REVIVE_ONCE = "revive_once"
const OP_REVIVE_RESOLVE = "revive_resolve"
const OP_FINAL_DEATH = "final_death"
const OP_RESPAWN = "respawn"
const OP_LOBBY_PREPARE = "lobby_prepare"
const OPS = [OP_FALLEN_ENTER, OP_REVIVE_ONCE, OP_REVIVE_RESOLVE, OP_FINAL_DEATH, OP_RESPAWN, OP_LOBBY_PREPARE]
const RESPAWN_STEPS = ["exp_loss", "reset"]

const PHASE_ALIVE = "alive"
const PHASE_HP0 = "hp0"            # HP0 수신, die() 분기 대기(토큰 발급됨)
const PHASE_FALLEN = "fallen"      # G43729 쓰러짐(카운트다운은 Mac)
const PHASE_DEAD = "dead"          # G43870 진짜 사망(사망 화면)
const PHASE_RESPAWNING = "respawning" # retry EXP 손실 뒤 스테이지 재구성 대기
const PHASE_LOBBY = "lobby"        # 로비 준비 완료(종료 상태)

## 원본 op별 iframe 값 — 이 집합 밖의 값은 sink가 거부한다(임의 setter 금지).
const IFRAMES_REVIVE_ONCE = 120.0   # G43727
const IFRAMES_FALLEN = 9999.0       # G43731
const IFRAMES_DEMON_REVIVE = 120.0  # G43854
const IFRAMES_FINAL_DEATH = 0.0     # G43870
const IFRAMES_RETRY = 300.0         # G63521
const FALLEN_COUNTDOWN_TICKS = 300.0 # G43729 P.st2=300 — Mac source-sp clock 소유
const EXP_LOSS_RATE = 0.3            # G63476–63477

const READBACK_FIELDS = ["hp", "mhp", "st", "mst", "mp", "mmp", "shield", "mshield", "exp",
	"iframes", "state", "_reviveOnceUsed", "_demonRevCd", "_fallenAng"]

var _main: WeakRef
var _player: WeakRef
var _world: WeakRef
var _state: WeakRef
var _resources: WeakRef
var _configured := false
var _busy := false
var _committing := false
var _phase := PHASE_ALIVE
var _death_token := ""
var _token_serial := 0
var _retired_tokens: Dictionary = {}
var _pre_death_state := ""
var _pre_death_captured := false
var _hp0_record: Dictionary = {}
var _receipts: Dictionary = {}
var _accepted := 0
var _rejected := 0
var _duplicate_hp0 := 0
var _last_error := "unconfigured"
var _history: Array = []

func configure(main: Node) -> Dictionary:
	if _configured:
		return {"ready": false, "reason": "player_life_already_configured"}
	if not _live(main) or main.get_script() == null or main.get_script().resource_path != MAIN_PATH:
		return {"ready": false, "reason": "player_life_requires_actual_Main"}
	var player: Variant = main.get("player")
	var state: Variant = main.get("source_state")
	var resources: Variant = main.get("source_resources")
	var world: Variant = main.get("world")
	for object in [player, state, resources, world]:
		if not _live(object):
			return {"ready": false, "reason": "player_life_owner_missing"}
	if not player.has_signal("telemetry_event") or not player.has_method("commit_native_player_life") \
			or not state.has_method("commit_native_player_life_p") \
			or not resources.has_method("commit_native_player_life_resources"):
		return {"ready": false, "reason": "player_life_sink_contract_missing"}
	_main = weakref(main)
	_player = weakref(player)
	_world = weakref(world)
	_state = weakref(state)
	_resources = weakref(resources)
	var error := _context_error(main)
	if not error.is_empty():
		return {"ready": false, "reason": error}
	if player.telemetry_event.connect(_on_player_telemetry) != OK:
		return {"ready": false, "reason": "player_life_telemetry_connect_failed"}
	_configured = true
	_last_error = ""
	if float(player.hp) <= 0.0:
		# 이미 HP0인 actor를 늦게 인수: 토큰은 발급하되 die() 직전 상태는 알 수 없다.
		_issue_token({"late_bind": true})
	return {"ready": true, "reason": "", "schema": SCHEMA}

func is_native_player_life_committing(owner: Node) -> bool:
	return _configured and _busy and _committing and _ref(_main) == owner

## 읽기 전용. 쓰기·토큰 발급 0.
func read_phase() -> Dictionary:
	var player: Variant = _ref(_player)
	var snap: Dictionary = {"schema": SCHEMA, "configured": _configured, "phase": _phase,
		"death_token": _death_token, "clear_blocked": _phase != PHASE_ALIVE,
		"pre_death_state": _pre_death_state if _pre_death_captured else null,
		"fallen_countdown_ticks": FALLEN_COUNTDOWN_TICKS, "countdown_owner": "Mac source-sp clock (G43729/G32989–32992)",
		"roll_owner": "Mac (G43738-43751 saved at die)", "token_serial": _token_serial,
		"accepted": _accepted, "rejected": _rejected, "duplicate_hp0": _duplicate_hp0,
		"last_error": _last_error, "tick_path": false}
	if _live(player):
		snap["player"] = {"state": player.state, "hp": player.hp, "iframes": player.iframes}
	snap["readback"] = _readback()
	return snap

func get_history() -> Array:
	return _history.duplicate(true)

# ───────────────────────── HP0 토큰 발급 ─────────────────────────

func _on_player_telemetry(kind: String, data: Dictionary) -> void:
	if not _configured:
		return
	if kind == "player_damage":
		# player.gd는 hp==0일 때 player_damage를 state="dead" 대입 **전에** 낸다 —
		# hurtP가 남긴 상태(stagger/pStun/…)가 원본 die() 시점의 P.s다.
		if _phase == PHASE_ALIVE and (data.get("hp") is float or data.get("hp") is int) and float(data["hp"]) == 0.0:
			var player: Variant = _ref(_player)
			if _live(player):
				_pre_death_state = str(player.state)
				_pre_death_captured = true
	elif kind == "player_died":
		if _phase != PHASE_ALIVE:
			_duplicate_hp0 += 1 # 중복 사망 이벤트: 새 토큰 0, 상태 무변이
			return
		_issue_token({"dot": data.get("dot") == true, "burn": data.get("burn") == true})

func _issue_token(extra: Dictionary) -> void:
	_token_serial += 1
	var main: Variant = _ref(_main)
	_death_token = "pdeath:%d:%d" % [main.get_instance_id() if _live(main) else 0, _token_serial]
	_phase = PHASE_HP0
	_hp0_record = {"death_token": _death_token, "serial": _token_serial,
		"pre_death_state": _pre_death_state if _pre_death_captured else null}
	_hp0_record.merge(extra, true)
	_history.append({"event": "hp0", "death_token": _death_token})
	native_player_life_phase_changed.emit(read_phase())

# ───────────────────────── 요청 진입 ─────────────────────────

func request(owner: Node, request: Dictionary) -> Dictionary:
	var op: Variant = request.get("op")
	var request_id: Variant = request.get("request_id")
	var receipt: Dictionary = {"schema": SCHEMA, "op": op, "token": request_id, "accepted": false,
		"replayed": false, "rng_span": {"consumed": 0, "owner": "none (PC life writes consume no RNG)"},
		"applied_fields": {}, "source_prefix": []}
	if _busy:
		return _reject(receipt, "REJECTED", "player_life_reentrant", false)
	if request_id is String and not String(request_id).is_empty() and _receipts.has(request_id):
		var previous: Dictionary = _receipts[request_id].duplicate(true)
		previous["replayed"] = true
		return previous
	if not request_id is String or String(request_id).is_empty():
		return _reject(receipt, "REJECTED", "player_life_request_id_required", false)
	if not op is String or op not in OPS:
		return _reject(receipt, "REJECTED", "player_life_unknown_op:" + str(op), true)
	var error := _context_error(owner)
	if not error.is_empty():
		return _reject(receipt, "REJECTED", error, true)
	if request.get("player") != _ref(_player):
		return _reject(receipt, "REJECTED", "player_life_foreign_actor", true)
	if _phase == PHASE_LOBBY:
		return _reject(receipt, "REJECTED", "player_life_lobby_terminal", true)
	receipt["before"] = _readback()
	receipt["death_token"] = request.get("death_token")
	_busy = true
	var plan: Dictionary = _plan(owner, op, request)
	if plan.get("status") != "PLANNED":
		_busy = false
		return _reject(receipt, str(plan.get("status", "REJECTED")), str(plan.get("reason")), true)
	receipt["source_prefix"] = plan.get("source_prefix", [])
	receipt["mac_followups"] = plan.get("mac_followups", [])
	receipt["presentation"] = plan.get("presentation", [])
	if plan.get("source_return") == true:
		receipt["status"] = "SOURCE_RETURN"
		receipt["accepted"] = true
		receipt["reason"] = str(plan.get("reason", ""))
		receipt["after"] = _readback()
		receipt["life_phase"] = _phase
		return _finish(receipt, request_id)
	var commit: Dictionary = _commit_batch(owner, plan["writes"])
	if commit.get("committed") != true:
		_busy = false
		receipt["after"] = _readback()
		receipt["unchanged"] = _same(receipt["after"], receipt["before"])
		return _reject(receipt, "FAILED", str(commit.get("reason")), true)
	var applied: Dictionary = commit["fields"]
	# respawn reset: G63525 applyStats → G63526 _refillRespawnResources.
	if plan.get("after_commit") == "apply_stats_then_refill":
		var refresh: Dictionary = owner.request_native_runtime_stat_refresh("apply_stats", "player_life:respawn_G63525")
		receipt["apply_stats"] = {"status": refresh.get("status"), "reason": refresh.get("reason"),
			"pass_serial": refresh.get("pass_serial")}
		if refresh.get("committed") != true:
			_rollback(owner, commit["restore"])
			_busy = false
			receipt["after"] = _readback()
			receipt["unchanged"] = _same(receipt["after"], receipt["before"])
			return _reject(receipt, "FAILED", "respawn_apply_stats_failed:" + str(refresh.get("reason")), true)
		var refill: Dictionary = _commit_batch(owner, _refill_writes())
		if refill.get("committed") != true:
			# applyStats는 원본 그대로 이미 확정된 별도 owner pass다(다른 요청 prefix 비되감기).
			# 이 요청의 리셋 쓰기만 되돌린다.
			_rollback(owner, commit["restore"])
			_busy = false
			receipt["after"] = _readback()
			return _reject(receipt, "FAILED", "respawn_refill_failed:" + str(refill.get("reason")), true)
		applied = {"reset": applied, "refill": refill["fields"]}
	_apply_phase(op, request, plan)
	receipt["applied_fields"] = applied
	receipt["status"] = "APPLIED"
	receipt["accepted"] = true
	receipt["reason"] = ""
	receipt["after"] = _readback()
	receipt["life_phase"] = _phase
	receipt["death_token"] = _death_token if not _death_token.is_empty() else request.get("death_token")
	receipt["state"] = receipt["after"].get("state")
	for field in ["hp", "mp", "st", "iframes"]:
		receipt[field] = receipt["after"].get(field)
	return _finish(receipt, request_id)

func _finish(receipt: Dictionary, request_id: String) -> Dictionary:
	_accepted += 1
	_last_error = ""
	_receipts[request_id] = receipt.duplicate(true)
	_history.append({"event": str(receipt.get("op")), "status": receipt.get("status"), "phase": _phase,
		"death_token": receipt.get("death_token")})
	# 관찰자는 확정 상태를 본다. 처리 중 재호출은 _busy로 거부된다.
	native_player_life_phase_changed.emit(read_phase())
	_busy = false
	return receipt

func _reject(receipt: Dictionary, status: String, reason: String, record: bool) -> Dictionary:
	receipt["status"] = status
	receipt["accepted"] = false
	receipt["reason"] = reason
	if not receipt.has("after"):
		receipt["after"] = _readback()
	_rejected += 1
	_last_error = reason
	# 거절/실패는 무변이라 영수증을 보관하지 않는다 — 같은 request_id 재시도는 다시 판정된다.
	# (record 인자는 진단 호출부 호환용)
	if record:
		_history.append({"event": str(receipt.get("op")), "status": status, "reason": reason})
	return receipt

# ───────────────────────── op 계획(쓰기 0) ─────────────────────────

func _plan(owner: Node, op: String, request: Dictionary) -> Dictionary:
	var player: Variant = _ref(_player)
	var p: Variant = _ref(_state).read_current_p()
	if not p is Dictionary:
		return {"status": "NOT_READY", "reason": "player_life_current_P_unavailable"}
	var res: Dictionary = _ref(_resources).read_current_resource_parameters()
	if res.get("status") != "READY":
		return {"status": "NOT_READY", "reason": "player_life_resources_not_ready"}
	var mmp: float = float(res["values"]["mmp"])
	var token_ok: bool = request.get("death_token") is String and request["death_token"] == _death_token \
		and not _death_token.is_empty()
	if op != OP_LOBBY_PREPARE or float(player.hp) <= 0.0:
		if not token_ok:
			var stale: bool = request.get("death_token") is String and _retired_tokens.has(request["death_token"])
			return {"status": "REJECTED", "reason": "death_token_stale" if stale else "death_token_mismatch"}
	match op:
		OP_REVIVE_ONCE, OP_FALLEN_ENTER:
			if _phase != PHASE_HP0 or str(player.state) != "dead" or float(player.hp) > 0.0:
				return {"status": "REJECTED", "reason": "player_life_requires_hp0_phase"}
			var affix: Variant = _eq_affix(owner, "reviveOnce")
			if affix == null:
				return {"status": "NOT_READY", "reason": "reviveOnce_affix_not_ready"}
			var eligible: bool = float(affix) > 0.0 and not _js_truthy(p.get("_reviveOnceUsed"))
			if op == OP_FALLEN_ENTER:
				if eligible:
					return {"status": "REJECTED", "reason": "revive_once_priority:G43727"}
				return {"status": "PLANNED", "source_prefix": ["G43725 fallen/dead guard", "G43727 reviveOnce false",
						"G43729 P.hp=0;P.s='fallen' (P.st2=300 → Mac countdown)", "G43731 P.iframes=9999",
						"G43732 P._fallenAng=P.facing+PI"],
					"writes": {"resources": {"hp": 0.0}, "player": {"state": "fallen", "iframes": IFRAMES_FALLEN},
						"p": {"_fallenAng": (player.facing as Vector2).angle() + PI}},
					"mac_followups": ["G43722-43724 ultUnmute/_esAutoFire/_alActive: Godot 미이식 상태(쓰기 0)",
						"G43729 P.st2=300 countdown (source-sp, 정지 중 0)", "G43730 _BOOTH_MODE",
						"G43733 G.slowMo>=30", "G43734 _gxTurret 회수(미이식)", "G43735 beamStop/_stopShieldLoop",
						"G43736 player_dead1~4 샘플(Math.random 1회)", "G43737 shake(20)",
						"G43738-43751 부활 확률·쿨다운·can·roll 계산/저장(Math.random 1회)"]}
			if not eligible:
				return {"status": "REJECTED", "reason": "revive_once_not_eligible"}
			if not _pre_death_captured:
				return {"status": "NOT_READY", "reason": "pre_death_state_unknown"}
			return {"status": "PLANNED", "source_prefix": ["G43725 fallen/dead guard",
					"G43727 _reviveOnceUsed=true;hp=mhp;mp=mmp;st=mst;iframes=120 (P.s 유지)"],
				"writes": {"p": {"_reviveOnceUsed": true},
					"resources": {"hp": float(player.max_hp), "mp": mmp, "st": float(player.max_stamina)},
					"player": {"iframes": IFRAMES_REVIVE_ONCE, "state": _pre_death_state}},
				"presentation": ["G43727 playSample('voice_second_wind',1,1)", "G43727 addTxt('💀 1회부활!','#44ff88',60)"],
				"mac_followups": ["G43722-43724 ultUnmute/_esAutoFire/_alActive: Godot 미이식 상태(쓰기 0)"]}
		OP_REVIVE_RESOLVE, OP_FINAL_DEATH:
			if _phase != PHASE_FALLEN or str(player.state) != "fallen":
				return {"status": "REJECTED", "reason": "player_life_requires_fallen_phase"}
			var roll: Variant = request.get("roll_receipt")
			if not roll is Dictionary or not roll.get("can_revive") is bool or not _number(roll.get("roll")) \
					or not _number(roll.get("chance")):
				return {"status": "REJECTED", "reason": "roll_receipt_required"}
			var success: bool = roll["can_revive"] and float(roll["roll"]) < float(roll["chance"])
			if op == OP_FINAL_DEATH:
				if success:
					return {"status": "REJECTED", "reason": "revive_roll_success_requires_revive_resolve"}
				return {"status": "PLANNED", "source_prefix": ["G43849 resolve false", "G43870 P.s='dead';P.iframes=0"],
					"writes": {"player": {"state": "dead", "iframes": IFRAMES_FINAL_DEATH}},
					"mac_followups": ["G43868 _ddDeaths/_ddChapDeathMap", "G43869 _resetInteractInput (interact 입력 owner)",
						"G43870 G._sStats.deaths++", "G43871 SFX.die;G.on=false;G 탄/장판 배열 정리",
						"G43872 BGM death", "G43873- HUD 숨김·사망 화면·EXP 손실 표시"]}
			if not success:
				return {"status": "REJECTED", "reason": "revive_roll_not_success"}
			if not _number(roll.get("cd_frames")):
				return {"status": "REJECTED", "reason": "roll_receipt_cd_frames_required"}
			var rekindle: Variant = _u_eq(owner, "_uDemonRekindle")
			if rekindle == null:
				return {"status": "NOT_READY", "reason": "_uDemonRekindle_not_ready"}
			if float(rekindle) > 0.0:
				# G43860–43861 P.rage 쓰기 owner(분노)는 PC 미연결 — 가짜 구현 대신 쓰기 전 거절.
				return {"status": "NOT_READY", "reason": "unported_branch_active:_uDemonRekindle_rage_writer"}
			return {"status": "PLANNED", "source_prefix": ["G43849 can&&roll<chance", "G43851 P._demonRevCd=cd",
					"G43853 hp=mhp;mp=mmp;st=mst", "G43854 P.s='idle';P.st2=0;P.iframes=120"],
				"writes": {"p": {"_demonRevCd": float(roll["cd_frames"])},
					"resources": {"hp": float(player.max_hp), "mp": mmp, "st": float(player.max_stamina)},
					"player": {"state": "idle", "state_left": 0.0, "iframes": IFRAMES_DEMON_REVIVE}},
				"presentation": ["G43855 flash/shake/slowMo", "G43856 SFX.levelup+voice_demon_revive",
					"G43857-43858 addTxt 악마화 부활!/부활력", "G43862 펫 팁", "G43863 _petOnDeath",
					"G43864 파티클30"],
				"mac_followups": ["G43860-43861 u_d21 재점화(값0 확인 — 실드/기동 완충 없음)"]}
		OP_RESPAWN:
			var step: Variant = request.get("step")
			if not step is String or step not in RESPAWN_STEPS:
				return {"status": "REJECTED", "reason": "respawn_step_required:exp_loss|reset"}
			if step == "exp_loss":
				if _phase != PHASE_DEAD:
					return {"status": "REJECTED", "reason": "respawn_exp_loss_requires_dead_phase"}
				if not _number(p.get("exp")):
					return {"status": "NOT_READY", "reason": "player_exp_not_numeric"}
				var exp_value: float = float(p["exp"])
				var loss: int = _js_int32(exp_value * EXP_LOSS_RATE)
				return {"status": "PLANNED", "source_prefix": ["G63476 expLoss=~~(P.exp*0.3)", "G63477 P.exp=max(0,P.exp-expLoss)"],
					"writes": {"p": {"exp": maxf(0.0, exp_value - float(loss))}},
					"exp_loss": loss,
					"mac_followups": ["G63472-63474 _resetInteractInput·사망 화면 off·_drReset·_deathDlgStop", "G63478-63520 보스방 복원/initStage(스테이지 재구성)"]}
			if _phase != PHASE_RESPAWNING:
				return {"status": "REJECTED", "reason": "respawn_reset_requires_exp_loss_first"}
			if not _number(p.get("mshield")):
				return {"status": "NOT_READY", "reason": "player_mshield_not_numeric"}
			var refresh_context: String = _refresh_context_error(owner)
			if not refresh_context.is_empty():
				return {"status": "NOT_READY", "reason": "respawn_apply_stats_not_ready:" + refresh_context}
			return {"status": "PLANNED", "after_commit": "apply_stats_then_refill",
				"source_prefix": ["G63521 hp=mhp;st=mst;mp=mmp;shield=mshield;s='idle';iframes=300;kb=0",
					"G63525 applyStats()", "G63526 _refillRespawnResources() G63453-63456"],
				"writes": {"resources": {"hp": float(player.max_hp), "st": float(player.max_stamina), "mp": mmp},
					"p": {"shield": float(p["mshield"])},
					"player": {"state": "idle", "iframes": IFRAMES_RETRY, "knockback_zero": true}},
				"mac_followups": ["G63522 chargeStocks/chargeCd(돌진 스톡: Godot 미이식)", "G63523 G._bonfire",
					"G63456-63462 maxChargeStocks/_HARP_GAUGE(사슬 기동 미이식)", "G63463 _dmgLog",
					"G63527-63528 HUD on·updateQS·G.on=true", "G63530 dbSave"]}
		OP_LOBBY_PREPARE:
			if float(player.hp) > 0.0:
				return {"status": "PLANNED", "source_return": true, "reason": "G63678 P.hp>0 — 쓰기 없음",
					"source_prefix": ["G63678 if(P&&P.hp<=0) false"], "mac_followups": ["G63679 dbSave", "G63681 로비 이동"]}
			if _phase == PHASE_ALIVE:
				return {"status": "REJECTED", "reason": "player_life_hp0_without_token"}
			if not _number(p.get("mshield")):
				return {"status": "NOT_READY", "reason": "player_mshield_not_numeric"}
			return {"status": "PLANNED", "source_prefix": ["G63678 hp=mhp;st=mst;mp=mmp;shield=mshield;s='idle'"],
				"writes": {"resources": {"hp": float(player.max_hp), "st": float(player.max_stamina), "mp": mmp},
					"p": {"shield": float(p["mshield"])}, "player": {"state": "idle"}},
				"mac_followups": ["G63679 dbSave", "G63681 로비 이동(/?lobby=1)"]}
	return {"status": "REJECTED", "reason": "player_life_unknown_op:" + op}

func _refill_writes() -> Dictionary:
	var player: Variant = _ref(_player)
	var p: Variant = _ref(_state).read_current_p()
	var res: Dictionary = _ref(_resources).read_current_resource_parameters()
	var mshield: Variant = p.get("mshield") if p is Dictionary else null
	return {"resources": {"hp": float(player.max_hp), "mp": float(res.get("values", {}).get("mmp", NAN)),
			"st": float(player.max_stamina)},
		"p": {"shield": float(mshield) if _number(mshield) else NAN},
		"player": {"dot_slow_clear": true}}

func _apply_phase(op: String, request: Dictionary, plan: Dictionary) -> void:
	match op:
		OP_FALLEN_ENTER:
			_phase = PHASE_FALLEN
		OP_REVIVE_ONCE, OP_REVIVE_RESOLVE:
			_retire_token()
		OP_FINAL_DEATH:
			_phase = PHASE_DEAD
		OP_RESPAWN:
			if request.get("step") == "exp_loss":
				_phase = PHASE_RESPAWNING
			else:
				_retire_token()
		OP_LOBBY_PREPARE:
			_retired_tokens[_death_token] = PHASE_LOBBY
			_phase = PHASE_LOBBY

func _retire_token() -> void:
	if not _death_token.is_empty():
		_retired_tokens[_death_token] = _phase
	_death_token = ""
	_phase = PHASE_ALIVE
	_pre_death_state = ""
	_pre_death_captured = false
	_hp0_record = {}

# ───────────────────────── 원자적 commit ─────────────────────────

func _commit_batch(owner: Node, writes: Dictionary) -> Dictionary:
	var player: Variant = _ref(_player)
	var resources: Variant = _ref(_resources)
	var state: Variant = _ref(_state)
	var pw: Dictionary = writes.get("player", {})
	var rw: Dictionary = writes.get("resources", {})
	var sw: Dictionary = writes.get("p", {})
	_committing = true
	var errors: Array = [player.validate_native_player_life_commit(owner, self, pw),
		resources.validate_native_player_life_resources(owner, self, rw),
		state.validate_native_player_life_p(owner, self, sw)]
	for error in errors:
		if not error is String or not String(error).is_empty():
			_committing = false
			return {"committed": false, "reason": "player_life_sink_rejected:" + str(error)}
	var restore: Dictionary = {"player": player.read_native_player_life_fields(),
		"resources": resources.read_native_player_life_resources(), "p": state.read_native_player_life_p(sw.keys())}
	# 동기 일괄. 세 sink 사이 콜백·시그널·provider 호출 0.
	var results: Array = [resources.commit_native_player_life_resources(owner, self, rw)]
	if results[0].get("accepted") == true:
		results.append(state.commit_native_player_life_p(owner, self, sw))
	if results.size() == 2 and results[1].get("accepted") == true:
		results.append(player.commit_native_player_life(owner, self, pw))
	var ok: bool = results.size() == 3 and results[2].get("accepted") == true
	if ok:
		var after: Dictionary = _readback()
		for field in rw:
			if float(after.get(field, NAN)) != float(rw[field]):
				ok = false
		for field in sw:
			if after.has(field) and not _same(after[field], sw[field]):
				ok = false
		if pw.has("state") and after.get("state") != pw["state"]:
			ok = false
		if pw.has("iframes") and float(after.get("iframes", NAN)) != float(pw["iframes"]):
			ok = false
	_committing = false
	if not ok:
		_rollback(owner, restore)
		return {"committed": false, "reason": "player_life_commit_or_readback_failed", "results": results}
	return {"committed": true, "restore": restore,
		"fields": {"player": pw.keys(), "resources": rw.keys(), "p": sw.keys()}}

func _rollback(owner: Node, restore: Dictionary) -> void:
	_committing = true
	_ref(_resources).commit_native_player_life_resources(owner, self, restore["resources"], true)
	_ref(_state).commit_native_player_life_p(owner, self, restore["p"], true)
	_ref(_player).commit_native_player_life(owner, self, {"restore_snapshot": restore["player"]})
	_committing = false

# ───────────────────────── readback / 검증 ─────────────────────────

func _readback() -> Dictionary:
	var state: Variant = _ref(_state)
	var player: Variant = _ref(_player)
	if not _live(state) or not _live(player):
		return {}
	var p: Variant = state.read_current_p()
	var out: Dictionary = {}
	if p is Dictionary:
		for field in READBACK_FIELDS:
			if p.has(field):
				out[field] = p[field].duplicate(true) if p[field] is Dictionary else p[field]
	out["state"] = str(player.state)
	out["iframes"] = float(player.iframes)
	out["hp"] = float(player.hp)
	out["st"] = float(player.stamina)
	return out

func _context_error(owner: Variant) -> String:
	var main: Variant = _ref(_main)
	if not _live(owner) or not _live(main) or owner != main:
		return "player_life_foreign_owner"
	if not main.is_inside_tree() or main.get_script() == null or main.get_script().resource_path != MAIN_PATH:
		return "player_life_Main_not_live"
	var player: Variant = _ref(_player)
	var state: Variant = _ref(_state)
	var resources: Variant = _ref(_resources)
	var world: Variant = _ref(_world)
	for object in [player, state, resources, world]:
		if not _live(object):
			return "player_life_owner_lost"
	if main.get("player") != player or main.get("source_state") != state or main.get("source_resources") != resources \
			or main.get("world") != world:
		return "player_life_Main_identity_changed"
	if _configured and main.get("source_player_life") != self:
		return "player_life_not_Main_registered"
	if state.get_script() == null or state.get_script().resource_path != STATE_PATH \
			or resources.get_script() == null or resources.get_script().resource_path != AUTHORITY_PATH:
		return "player_life_owner_script_mismatch"
	if player.get_parent() != main or world.get("player") != player or player.get_combat_world() != world:
		return "player_life_actor_tree_mismatch"
	if not state.is_native_new_run_state_ready() or not resources.is_native_source_resources_ready():
		return "player_life_holders_not_ready"
	return ""

func _refresh_context_error(owner: Node) -> String:
	var refresh: Variant = owner.get("source_runtime_stat_refresh")
	if _live(refresh) and refresh.has_method("get_snapshot") and refresh.get_snapshot().get("busy") == true:
		return "runtime_stat_refresh_busy"
	var init: Variant = owner.get("source_initialization")
	if not _live(init) or init.get_native_source_initialization_completion().get("completed") != true:
		return "initialization_not_completed"
	return ""

func _eq_affix(owner: Node, id: String) -> Variant:
	var r: Variant = owner.read_native_source_equipment_affix(id)
	if not r is Dictionary or str(r.get("status")) not in ["READY", "READY_PARTIAL_AFTER_SOURCE_THROW"] \
			or not _number(r.get("value")):
		return null
	return float(r["value"])

func _u_eq(owner: Node, stat: String) -> Variant:
	var providers: Dictionary = owner.get_native_normal_enemy_damage_provider_callbacks()
	var reader: Variant = providers.get("u_eq")
	if not reader is Callable or not reader.is_valid():
		return null
	var r: Variant = reader.call(stat)
	if not r is Dictionary or str(r.get("status")) != "READY" or not _number(r.get("value")):
		return null
	return float(r["value"])

static func _js_int32(value: float) -> int:
	if not is_finite(value):
		return 0
	var t: float = value - fmod(value, 1.0) if value >= 0.0 else -((-value) - fmod(-value, 1.0))
	var m: int = int(fmod(t, 4294967296.0))
	if m < 0:
		m += 4294967296
	return m - 4294967296 if m >= 2147483648 else m

static func _js_truthy(value: Variant) -> bool:
	if value == null:
		return false
	if value is bool:
		return value
	if value is int or value is float:
		return float(value) != 0.0 and not is_nan(float(value))
	if value is String:
		return not String(value).is_empty()
	return true

static func _same(a: Variant, b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):
		return float(a) == float(b)
	return typeof(a) == typeof(b) and a == b

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _ref(value: Variant) -> Variant:
	return value.get_ref() if value is WeakRef and is_instance_valid(value) else null

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())
