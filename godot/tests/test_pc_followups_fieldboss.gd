extends "res://tests/test_pc_combat_pack_b.gd"
## PC-FOLLOWUPS P0 — 실제 MAP11(기본 ON) 부팅에서 기본 자동 석궁 × 필드보스(_fieldBosses).
## 대상: native_player_arrow_carrier.gd 35279 _hurtFieldMobs 이식 + native_field_mob_hit_owner.gd(PC) +
##       Mac family(native_demo11_anglers.gd) 기존 PC readback seam(bind_pc_source).
## 원본 대조: tests/pc_combat_pack_b_source_oracle.cjs 가 pProjs 블록과 _hurtFieldMobs/_fmCanHit/_fmXY/_fmApply/
##           _fmDeathFx/_fbMarkDead 원문을 그대로 VM 실행(필드보스 record·RNG 값은 Godot 실제 상태/뽑힌 값 공급).
## 테스트 개입(forced 집계): 플레이어 배치(hole 앵커·앵글러 근처), HP 회복, 결정적 구간의 xbowAuto 일시 OFF,
##   결정적 화살의 _fireXbow(G28712) 필드 채움·source sp=1.0 공급, FB4 일반 적 1마리 배치.
##   필드보스 HP/hitCd/hid 강제 0 — 깨우기는 실제 AI(거리1000 기상·tpT 54)로만.

const FB_USERDIR := "EXODUSER-pc-followups-Isolated-20261021"
const FB_GROUPS := ["map11_setup", "admit_with_fieldbosses", "auto_crossbow_natural_kill", "wake_angler",
	"fb_nonlethal_hit", "fb_hitcd_pass_through", "fb_lethal_with_enemy_kill_pierce", "unported_family_scan", "perf_fieldboss"]

var g: Dictionary
var angler_index := -1
var fb_shots: Dictionary = {}

func _run() -> void:
	var isolated: bool = OS.get_user_data_dir().get_file() == FB_USERDIR
	for group in FB_GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("PCFU_SKIP ", group, " (isolated userdir ", FB_USERDIR, " required)")
			continue
		var a0 := assertions
		var f0 := failures
		await call("_fb_" + group)
		var row := {"group": group, "assertions": assertions - a0, "failures": failures - f0}
		rows.append(row)
		print("PCFU_GROUP ", JSON.stringify(row))
		if group == "map11_setup" and failures > f0:
			break
	var result := {"groups": rows, "assertions": assertions, "failures": failures, "skipped": skipped,
		"forced_test_fields": forced, "observations": observations}
	if not artifacts_dir.is_empty():
		DirAccess.make_dir_recursive_absolute(artifacts_dir)
		var f := FileAccess.open(artifacts_dir.path_join("pc_followups_fieldboss_result.json"), FileAccess.WRITE)
		if f != null:
			f.store_string(JSON.stringify(result, "  "))
			f.close()
	print("PCFU_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions, "failures": failures, "skipped": skipped, "forced_test_fields": forced}))
	_cleanup()
	quit(1 if failures > 0 or assertions == 0 else 0)

# ── 헬퍼 ────────────────────────────────────────────────────────────────────────
func _options() -> Dictionary:
	var o: Variant = main.source_initialization_services.read_current_options()
	return o if o is Dictionary else {}

func _fb(i: int) -> Variant:
	var list: Variant = g.get("_fieldBosses")
	return list[i] if list is Array and i < (list as Array).size() else null

func _fb_view_all() -> Array:
	var out: Array = []
	for i in range(4):
		var m: Variant = _fb(i)
		out.append(null if m == null else {"hp": float(m.hp), "hitCd": float(m.get("hitCd", 0)), "alive": m.get("alive")})
	return out

func _fb_records_for_oracle() -> Array:
	var out: Array = []
	for i in range(4):
		var m: Variant = _fb(i)
		if m == null:
			out.append(null)
			continue
		var c: Dictionary = (m as Dictionary).duplicate(true)
		c["id"] = "FB%d" % i
		out.append(c)
	return out

func _wait_store_idle(max_frames: int) -> void:
	for i in range(max_frames):
		if int(world.get_native_player_projectile_store_snapshot().get("live", 0)) == 0:
			return
		await physics_frame

func _natural_target() -> Node:
	for e in world.get_enemies():
		if is_instance_valid(e) and e.get("alive") == true and is_instance_valid(main.native_natural_enemies) \
				and main.native_natural_enemies.owns_actor(e) and e.has_method("read_native_normal_enemy_hurte_fields"):
			var f: Dictionary = e.read_native_normal_enemy_hurte_fields(world)
			if f.get("ready") == true and int(f.get("el", 0)) != 1 and int(f.get("etype", -1)) in [1, 4]:
				return e
	return null

## 표적 주변 8방향 중 서 있을 수 있고 표적까지 isW가 비어 있는 자리(배치 전용 — 발사·조준은 실제 owner).
var _spot_dir := 0
func _open_spot(target: Node) -> Variant:
	var at: Vector2 = target.global_position
	for j in range(8):
		var k: int = (_spot_dir + j) % 8
		var dir := Vector2.from_angle(TAU * k / 8.0)
		var cand: Vector2 = at - dir * 170.0
		if world.is_world_blocked(cand) or not _open_line(cand, dir, 150.0):
			continue
		_spot_dir = k
		return cand
	return null

## pass 반복(같은 물리 프레임 안 → 적·필드보스 AI 정지 장면). 필드몹 접촉과 적 접촉의 RNG를 스텝 안 원본 순서(35279 → 35281)로 모은다.
func _fly_fb(pkt: RefCounted, max_ticks: int) -> Dictionary:
	var track: Array = []
	var contacts: Array = []
	var fields: Array = []
	var fb_track: Array = []
	var rng_lines: Array = []
	var rng_values: Array = []
	var fate := "live"
	var fate_tick := -1
	var step_reasons: Array = []
	var contact_pass_us: Array = []
	var flying_pass_us_max := 0
	var pid: int = pkt.get_instance_id()
	for t in range(max_ticks):
		var t_us := Time.get_ticks_usec()
		var pr: Dictionary = main.advance_native_player_projectile_pass(1.0, {"token": _tok("fbpass")})
		t_us = Time.get_ticks_usec() - t_us
		check(pr.status == "APPLIED", "fb_pass_applied_t%d:%s:%s" % [t, pr.status, pr.reason])
		var mine: Dictionary = {}
		for res in pr.get("results", []):
			if res.packet_id == pid: mine = res
		for fc in mine.get("field_mob_receipt", []):
			fields.append({"t": t, "index": fc.index, "applied": fc.get("applied"), "outcome": fc.get("outcome"),
				"dmg": fc.get("dmg"), "hp_before": fc.get("hp_before"), "hp_after": fc.get("hp_after"), "final": fc.get("final_death", false),
				"serial": fc.get("serial"), "fbDone_after": fc.get("fbDone_after")})
			for d in fc.get("rng_draws", []):
				rng_lines.append(int(d.line))
				rng_values.append(float(d.value))
		for c in mine.get("collision_receipt", []):
			contacts.append({"t": t, "enemy_id": str(c.enemy_id), "dmg": FORMULA.js_to_int32(float(c.dmg_base) * float(c.mult)),
				"outcome": c.get("outcome"), "status": c.hurte.status, "killed": c.hurte.alive_after == false})
			for d in c.get("rng_draws", []):
				rng_lines.append(int(d.line))
				rng_values.append(float(d.value))
		track.append({"t": t, "x": pkt.fields.x, "y": pkt.fields.y, "vx": pkt.fields.vx, "vy": pkt.fields.vy, "dist": pkt.fields.dist,
			"bounces": int(pkt.fields.get("bounces", 0)), "blocked": world.is_world_blocked(Vector2(pkt.fields.x, pkt.fields.y))})
		fb_track.append(_fb_view_all())
		if not (mine.get("field_mob_receipt", []) as Array).is_empty() or not (mine.get("collision_receipt", []) as Array).is_empty():
			contact_pass_us.append({"t": t, "us": t_us, "field": (mine.get("field_mob_receipt", []) as Array).size(), "enemy": (mine.get("collision_receipt", []) as Array).size()})
		else:
			flying_pass_us_max = maxi(flying_pass_us_max, t_us)
		if str(mine.get("step_status", "")) in ["REFUSED", "PARTIAL"]:
			step_reasons.append(mine.get("reason"))
			fate = "halted"
			fate_tick = t
			break
		if mine.get("released_once") == true or mine.get("expired") == true:
			fate = "recycled" if mine.step_status == "HIT_RELEASED" else "dropped"
			fate_tick = t
			break
	return {"track": track, "contacts": contacts, "fields": fields, "fb_track": fb_track, "rng_lines": rng_lines,
		"rng_values": rng_values, "fate": fate, "fate_tick": fate_tick, "halts": step_reasons,
		"contact_pass_us": contact_pass_us, "flying_pass_us_max": flying_pass_us_max}

func _fb_case(name: String, fired: Dictionary, ens: Array, fb_records: Array, flight: Dictionary, reuse: bool) -> Dictionary:
	var results: Array = []
	for c in flight.contacts: results.append({"killed": c.killed})
	return {"name": name, "kind": "carrier", "sp": 1, "ticks": flight.track.size(), "ens": ens, "packet": fired,
		"hurt_results": results, "rng": flight.rng_values, "reuse_pool": reuse, "wall_model": null, "walls": [],
		"passives": state.read_current_passives(), "G": {"_fieldBosses": fb_records, "_fbDone": false, "stage": 0}}

func _compare_fb(name: String, row: Dictionary, flight: Dictionary) -> void:
	var src_ticks: Array = row.get("ticks", [])
	check(src_ticks.size() == flight.track.size(), "fb_tick_count:%s src=%d port=%d" % [name, src_ticks.size(), flight.track.size()])
	var max_err := 0.0
	var fb_ok := true
	var fb_detail := ""
	var walls_clear := true
	for i in range(mini(src_ticks.size(), flight.track.size())):
		var s: Dictionary = src_ticks[i].p
		var gt: Dictionary = flight.track[i]
		for k in ["x", "y", "vx", "vy", "dist"]:
			max_err = maxf(max_err, absf(float(s[k]) - float(gt[k])))
		if gt.blocked: walls_clear = false
		var sf: Array = src_ticks[i].get("fbs", [])
		var pf: Array = flight.fb_track[i]
		for k in range(4):
			var a: Variant = sf[k] if k < sf.size() else null
			var b: Variant = pf[k]
			if (a == null) != (b == null):
				fb_ok = false
				fb_detail = "t%d slot%d null src=%s port=%s" % [i, k, a == null, b == null]
			elif a != null and (float(a.hp) != float(b.hp) or float(a.hitCd) != float(b.hitCd) or a.alive != b.alive):
				fb_ok = false
				fb_detail = "t%d slot%d src=%s port=%s" % [i, k, a, b]
	check(walls_clear, "fb_flight_path_open_world_isW_false(oracle walls none):" + name)
	check(max_err < 1e-6, "fb_trajectory_equal:%s max_err=%s" % [name, max_err])
	check(fb_ok, "fb_record_states_equal_per_tick:%s %s" % [name, fb_detail])
	check(str(row.get("fate")) == str(flight.fate) and int(row.get("fate_tick", -1)) == int(flight.fate_tick),
		"fb_fate:%s src=%s@%s port=%s@%s" % [name, row.get("fate"), row.get("fate_tick"), flight.fate, flight.fate_tick])
	var src_fb_done: bool = src_ticks.back().get("fbDone", false) if not src_ticks.is_empty() else false
	check(src_fb_done == (g.get("_fbDone") == true), "fb_fbDone_equal:%s src=%s port=%s" % [name, src_fb_done, g.get("_fbDone")])
	check(_ints(row.get("gameplay_random_lines", [])) == flight.rng_lines, "fb_gameplay_rng_lines:%s src=%s port=%s" % [name, row.get("gameplay_random_lines"), flight.rng_lines])
	var src_hits: Array = []
	var ti := -1
	for call in row.get("calls", []):
		if call.call == "TICK": ti = int(call.args[0])
		elif call.call == "hurtE": src_hits.append({"t": ti, "enemy_id": str(call.args[0]), "dmg": int(call.args[1]), "identity": call.args[4]})
	check(src_hits.size() == flight.contacts.size(), "fb_enemy_contact_count:%s src=%d port=%d" % [name, src_hits.size(), flight.contacts.size()])
	for i in range(mini(src_hits.size(), flight.contacts.size())):
		var s: Dictionary = src_hits[i]
		var c: Dictionary = flight.contacts[i]
		check(s.t == c.t and s.enemy_id == c.enemy_id and s.dmg == c.dmg and s.identity == "PACKET_IDENTITY", "fb_enemy_contact_%d:%s" % [i, name])

func _shot_at_angler(i: int, dmg: int, name: String) -> Dictionary:
	var fb: Dictionary = _fb(i)
	_drain_free_pool() # 새 패킷(_mkPProj, _pierceRate 미설정) — 적 접촉 관통 분기 결정성
	var target := Vector2(float(fb.x), float(fb.y))
	var dir: Vector2 = (target - player.global_position).normalized()
	var pkt: RefCounted = _borrow_arrow(player.global_position, target, dmg)
	var fired := _fire_fields(pkt)
	var ens: Array = _ens_view()
	var records := _fb_records_for_oracle()
	var reuse: bool = reused_packets[pkt.get_instance_id()]
	var adm: Dictionary = main.admit_native_source_projectile(player, pkt, {"token": _tok("admit")})
	check(adm.status == "APPLIED", "fb_shot_admitted:%s:%s" % [name, adm.reason])
	var flight: Dictionary = _fly_fb(pkt, 80)
	var by: Dictionary = _run_oracle([_fb_case(name, fired, ens, records, flight, reuse)], "fb_" + name)
	if by.has(name):
		_compare_fb(name, by[name], flight)
	fb_shots[name] = {"fields": flight.fields, "contacts": flight.contacts, "fate": flight.fate, "fate_tick": flight.fate_tick,
		"rng_lines": flight.rng_lines, "halts": flight.halts, "dir": [dir.x, dir.y],
		"contact_pass_us": flight.contact_pass_us, "flying_pass_us_max": flight.flying_pass_us_max}
	return flight

# ── groups ──────────────────────────────────────────────────────────────────────
func _fb_map11_setup() -> void:
	var packed: Variant = load("res://scenes/main.tscn")
	main = packed.instantiate()
	# 실제 제품 부팅 순서(47k와 같음): 인트로 → 가이드 종료 → 레슨 실제 UI skip_all. 앵글러 family는 레슨 비활성에서만 tick.
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	current_scene = main
	for i in range(12):
		await physics_frame
	main.source_intro_sequence.finish_native_guide()
	var lesson: Node = main.source_intro_sequence.lesson_flow
	var until := Time.get_ticks_msec() + 10000
	while not lesson.active and Time.get_ticks_msec() < until:
		await process_frame
	lesson.skip_all()
	for i in range(20):
		await physics_frame
	world = main.get("world")
	player = main.get("player")
	state = main.get("source_state")
	g = state.read_current_g()
	check(main.read_native_map11_provider() != null, "map11_default_on_booted")
	var bow: Variant = state.read_current_inventory().equipped.get("bow")
	spec = SPEC.new().evaluate(bow if bow is Dictionary else {}, state.read_current_passives(), CATALOG.new())
	check(spec.get("status") == "READY", "auto_bow_spec_ready")
	for i in range(60):
		if g.get("_fieldBosses") is Array and (g._fieldBosses as Array).size() == 4: break
		await physics_frame
	check(g.get("_fieldBosses") is Array and (g._fieldBosses as Array).size() == 4, "actual_angler_family_spawned_4_slots:" + str(main.native_demo_anglers.snapshot()))
	check(is_instance_valid(main.get("native_auto_crossbow")), "mac_auto_crossbow_owner_installed")
	observations["fb_spawn"] = _fb_view_all()

func _fb_admit_with_fieldbosses() -> void:
	var pkt: RefCounted = _borrow_arrow(player.global_position, player.global_position + Vector2(100, 0), 30)
	var r: Dictionary = main.admit_native_source_projectile(player, pkt, {"token": _tok("admit")})
	check(not (g._fieldBosses as Array).is_empty(), "fieldbosses_non_empty_during_admit")
	check(r.status == "APPLIED" and not str(r.reason).begins_with("field_mob_owner_unported"), "normalbow_admit_not_blocked_by_fieldbosses:" + str(r.reason))
	if r.status == "APPLIED":
		await _wait_store_idle(60)

func _fb_auto_crossbow_natural_kill() -> void:
	# E2E와 같은 방식: hole 앵커 배치만, 스폰·타이머·발사·비행·hurtE는 전부 실제 owner.
	var xb: RefCounted = main.native_auto_crossbow
	var before: Dictionary = xb.snapshot().duplicate(true)
	var anchors: Array = main.native_map11.provider().anchors("hole")
	var started := Time.get_ticks_msec()
	var target: Node = null
	var regions: Node = main.get_node_or_null("NativeRegions")
	var kills0: int = int(g.get("kills", 0))
	var fo0: Dictionary = main.native_combat_pack_b.get_snapshot().get("field_mob_owner", {}).duplicate(true)
	var samples: Array = []
	var pass_reasons: Dictionary = {}
	var hit_rows: Array = []
	var last_sample := 0
	while Time.get_ticks_msec() - started < 120000:
		for res in xb.last_pass.get("results", []):
			var st: String = str(res.get("step_status")) + ":" + str(res.get("reason", ""))
			pass_reasons[st] = int(pass_reasons.get(st, 0)) + 1
			for c in res.get("collision_receipt", []):
				if hit_rows.size() < 12:
					hit_rows.append({"enemy": c.enemy_id, "dmg_base": c.dmg_base, "mult": c.mult, "outcome": c.get("outcome"),
						"status": c.hurte.status, "reason": c.hurte.reason, "applied": c.hurte.get("applied_fields"), "killed": c.hurte.get("kill_receipt", {}).get("killed")})
		if Time.get_ticks_msec() - last_sample > 3000:
			last_sample = Time.get_ticks_msec()
			samples.append({"t": last_sample - started, "target": target.get_instance_id() if is_instance_valid(target) else 0,
				"hp": target.get("hp") if is_instance_valid(target) else null, "etype": target.get("etype") if is_instance_valid(target) else null,
				"fired": xb.fired, "hits": xb.hits, "reason": xb.reason, "enemies": world.get_enemies().size(),
				"last_dmg": xb.last_shot.get("reason", "")})
		if int(xb.kills) > int(before.kills): break
		if not is_instance_valid(target) or target.get("alive") != true:
			target = _natural_target()
			if target == null and not anchors.is_empty():
				player.global_position = anchors[int((Time.get_ticks_msec() - started) / 7000) % anchors.size()].marker.global_position
				forced += 1
		if is_instance_valid(target) and target.get("alive") == true:
			var spot: Variant = _open_spot(target)
			if spot is Vector2:
				player.global_position = spot
				forced += 1
		_heal()
		await physics_frame
	var after: Dictionary = xb.snapshot()
	observations["auto_crossbow"] = {"before": {"fired": before.fired, "hits": before.hits, "kills": before.kills},
		"after": {"fired": after.fired, "hits": after.hits, "kills": after.kills}, "reason": after.reason,
		"kills_G": [kills0, g.get("kills")], "fieldBosses_present": not (g._fieldBosses as Array).is_empty(),
		"elapsed_ms": Time.get_ticks_msec() - started, "samples": samples, "pass_step_status": pass_reasons, "hit_rows": hit_rows,
		"field_owner_before": fo0, "field_owner_after": main.native_combat_pack_b.get_snapshot().get("field_mob_owner")}
	check(not (g._fieldBosses as Array).is_empty(), "fieldbosses_present_during_auto_fire")
	check(int(after.fired) > int(before.fired), "auto_crossbow_fired_gt0:%d" % (int(after.fired) - int(before.fired)))
	check(int(after.hits) > int(before.hits), "auto_crossbow_hits_gt0:%d" % (int(after.hits) - int(before.hits)))
	check(int(after.kills) > int(before.kills) and int(g.get("kills", 0)) > kills0, "auto_crossbow_kills_gt0:%d" % (int(after.kills) - int(before.kills)))
	check(not str(after.reason).begins_with("field_mob_owner_unported"), "no_field_owner_refusal:" + str(after.reason))

# Placement only: the rejected field contact must not later hit a normal enemy.
# The source oracle has no walls, so require the complete flight corridor open.
func _fb_clear_corridor(origin: Vector2, dir: Vector2) -> bool:
	var length: float = float(spec.range) + float(spec.spd) + 40.0
	if world.is_world_blocked(origin) or not _open_line(origin, dir, length): return false
	for e in _ens_view():
		var offset := Vector2(float(e.x), float(e.y)) - origin
		var along: float = clampf(offset.dot(dir), 0.0, length)
		if (offset - dir * along).length() <= float(e.r) + 11.0: return false
	return true

func _fb_wake_angler() -> void:
	# 실제 AI 기상: 거리 1000 이내(본문 접촉 반경 밖) 배치 → wake(tpT=54) → 출현(hid=0).
	var best := -1
	var best_origin := Vector2.ZERO
	for i in range(4):
		var m: Variant = _fb(i)
		if m == null: continue
		var at := Vector2(float(m.x), float(m.y))
		for k in range(16):
			var dir := Vector2.from_angle(TAU * k / 16.0)
			var origin: Vector2 = at - dir * 420.0
			if not _fb_clear_corridor(origin, dir): continue
			best = i
			best_origin = origin
			break
		if best >= 0: break
	check(best >= 0, "open_shot_line_to_angler_found")
	if best < 0: return
	angler_index = best
	var opts := _options()
	opts["xbowAuto"] = false # 결정적 구간: Mac 자동 석궁 발사만 일시 정지(테스트 개입)
	forced += 1
	player.global_position = best_origin
	forced += 1
	for i in range(240):
		var m: Variant = _fb(best)
		if m is Dictionary and int(m.asleep) == 0 and int(m.hid) == 0 and float(m.tpT) == 0.0: break
		player.global_position = best_origin
		_heal()
		await physics_frame
	await _wait_store_idle(90)
	var m2: Variant = _fb(best)
	check(m2 is Dictionary and int(m2.asleep) == 0 and int(m2.hid) == 0, "angler_woke_by_actual_ai:" + str(_fb_view_all()))
	observations["angler"] = {"index": best, "origin": [best_origin.x, best_origin.y], "state": m2.duplicate(true) if m2 is Dictionary else null}

func _fb_fb_nonlethal_hit() -> void:
	if angler_index < 0: return
	var fb: Dictionary = _fb(angler_index)
	# hitCd가 남아 있으면 실제 AI가 줄일 때까지 대기(테스트가 쓰지 않음)
	for i in range(20):
		if float(fb.get("hitCd", 0)) <= 0.0: break
		await physics_frame
	var at := Vector2(float(fb.x), float(fb.y))
	var placed := false
	for k in range(128):
		var dir := Vector2.from_angle(TAU * k / 128.0)
		var origin: Vector2 = at - dir * 420.0
		if _fb_clear_corridor(origin, dir):
			player.global_position = origin
			forced += 1
			placed = true
			break
	check(placed, "hitcd_full_flight_corridor_clear")
	if not placed: return
	var hp0: float = float(fb.hp)
	var flight: Dictionary = _shot_at_angler(angler_index, 50, "nonlethal")
	check(flight.fields.size() >= 1 and flight.fields[0].applied == true and flight.fields[0].outcome == "hit_18702", "fb_contact_applied_hit")
	check(float(fb.hp) == hp0 - 50.0 and float(fb.hitCd) == 8.0, "fb_hp_minus_dmg_and_hitcd8 hp0=%s hp=%s cd=%s" % [hp0, fb.hp, fb.get("hitCd")])
	check(flight.fate == "recycled", "arrow_recycled_after_field_hit_35628:" + str(flight.fate))
	check(main.native_combat_pack_b.get_snapshot().field_mob_owner.get("bound") == true, "pc_field_owner_bound_to_family_seam")

func _fb_fb_hitcd_pass_through() -> void:
	if angler_index < 0: return
	var fb: Dictionary = _fb(angler_index)
	var hp0: float = float(fb.hp)
	check(float(fb.hitCd) > 0.0, "hitcd_still_positive_same_frame")
	var flight: Dictionary = _shot_at_angler(angler_index, 50, "hitcd_skip")
	check(flight.fields.size() == 1 and flight.fields[0].applied == false and flight.fields[0].outcome == "hitcd_reject_18700", "fb_hitcd_reject_no_damage")
	check(float(fb.hp) == hp0, "fb_hp_unchanged_on_hitcd")
	check(flight.fate != "recycled", "arrow_passes_through_on_hitcd(n=0):" + str(flight.fate))

func _fb_fb_lethal_with_enemy_kill_pierce() -> void:
	if angler_index < 0: return
	var fb: Dictionary = _fb(angler_index)
	for i in range(20):
		if float(fb.get("hitCd", 0)) <= 0.0: break
		await physics_frame
	await _wait_store_idle(90)
	var dmg: int = int(fb.hp) + 100
	# 같은 스텝에 일반 적 1마리가 함께 닿도록 앵글러 경계(r120+hitR11) 바로 앞, 화살 경로 위에 배치(테스트 개입).
	var enemy: Node = _natural_target()
	var target := Vector2(float(fb.x), float(fb.y))
	var dir: Vector2 = (target - player.global_position).normalized()
	var placed := false
	if enemy != null:
		var reach: float = (target - player.global_position).length() - 131.0
		var cdx: Vector2 = dir
		# 화살 위치 = 시작(10) + spd*k. 필드 접촉이 처음 성립하는 스텝 위치에 적 중심을 둔다.
		# 화살 위치(틱 t 이동 후) = 시작 + dir*(10 + spd*(t+1)). 첫 필드 접촉 스텝 위치 s, 적은 s + er/2 (직전 스텝은 er+22/2 > er+3).
		var t_first: int = int(floor((reach - 10.0) / float(spec.spd)))
		var s_pos: float = 10.0 + float(spec.spd) * float(t_first + 1)
		var er: float = float(enemy.read_native_normal_enemy_hurte_fields(world).radius)
		var contact_pt: Vector2 = player.global_position + cdx * (s_pos + er * 0.5)
		if (player.global_position + cdx * s_pos - target).length() < 131.0 and er < 36.0:
			enemy.global_position = contact_pt
			forced += 1
			placed = true
			await physics_frame # 공간 격자 반영
	observations["lethal_enemy_placed"] = placed
	var flight: Dictionary = _shot_at_angler(angler_index, dmg, "lethal_kill_pierce")
	var final_ok: bool = flight.fields.size() >= 1 and flight.fields[0].final == true and flight.fields[0].applied == true
	check(final_ok, "fb_final_death_applied:" + str(flight.fields))
	check(_fb(angler_index) == null and fb.alive == false and float(fb.hp) == 0.0, "family_readback_slot_null_alive_false_hp0")
	check(flight.rng_lines.size() >= 3 and flight.rng_lines.slice(0, 3) == [18692, 18693, 18694], "fm_death_gore_rng_order:" + str(flight.rng_lines))
	check(g.get("_fbDone") != true, "fbDone_false_while_other_anglers_alive")
	if placed:
		var same_step := false
		for c in flight.contacts:
			if flight.fields.size() > 0 and c.t == flight.fields[0].t and c.killed and c.outcome == "kill_pierce_35617": same_step = true
		check(same_step, "same_step_field_hit_then_enemy_kill_pierce:" + str(flight.contacts))
		check(flight.fate != "recycled", "kill_pierce_resets_hit_false_arrow_continues(source quirk):" + str(flight.fate))

func _fb_unported_family_scan() -> void:
	# 웜/화마귀: 실제 접촉 스텝만 쓰기 전 거절. 존재만으로는 거절하지 않는다(G 쓰기 0 — 합성 env로 owner 순수 스캔만 확인).
	var owner: Node = main.get_node_or_null("PCFieldMobHitOwner")
	check(owner != null, "pc_field_owner_installed_under_main")
	if owner == null: return
	var hs: Dictionary = {}
	var worm := {"x": 100.0, "y": 0.0, "r": 56, "hp": 10, "phase": "peek", "hideT": 0}
	var env_w: Dictionary = {"g": g, "fbs": [], "fb_singleton": false, "worms": [worm], "devils": [], "active": true}
	var r1: Dictionary = owner.scan(env_w, 100.0 + 60.0, 0.0, 11.0, hs)
	check(r1.ok == false and r1.reason == "field_mob_owner_unported:_worms" and hs.is_empty(), "worm_contact_refused_prewrite")
	var r2: Dictionary = owner.scan(env_w, 100.0 + 80.0, 0.0, 11.0, hs)
	check(r2.ok == true and (r2.contacts as Array).is_empty(), "worm_present_no_contact_not_refused")
	worm["phase"] = "hide"; worm["hideT"] = 60
	var r3: Dictionary = owner.scan(env_w, 100.0, 0.0, 11.0, hs)
	check(r3.ok == true, "worm_hidden_immune_not_refused(_fmCanHit 18632)")
	var fd := {"x": 0.0, "y": 0.0, "r": 100, "hp": 10, "hid": 1, "emT": 3}
	var env_f: Dictionary = {"g": g, "fbs": [], "fb_singleton": false, "worms": [], "devils": [fd], "active": true}
	var r4: Dictionary = owner.scan(env_f, 50.0, 0.0, 11.0, hs)
	check(r4.ok == false and r4.reason == "field_mob_owner_unported:_fireDevils", "fire_devil_emerging_contact_refused_prewrite")

func _fb_perf_fieldboss() -> void:
	# 필드보스 4슬롯이 살아 있는(3개) 상태에서 30발 동시 비행: pass 비용(접촉 0) — 틱 경로 추가분 관측.
	if angler_index < 0: return
	var opts := _options()
	var samples: Array = []
	var arrows: Array = []
	for i in range(30):
		var a: RefCounted = _borrow_arrow(player.global_position, player.global_position + Vector2.from_angle(PI + 0.02 * i) * 300.0, 1)
		if a == null: break
		main.admit_native_source_projectile(player, a, {"token": _tok("admit")})
		arrows.append(a)
	for t in range(40):
		var t0 := Time.get_ticks_usec()
		main.advance_native_player_projectile_pass(1.0, {"token": _tok("perfpass")})
		samples.append(Time.get_ticks_usec() - t0)
	var total := 0
	var mx := 0
	for s in samples:
		total += s
		mx = maxi(mx, s)
	observations["perf_fieldboss_pass"] = {"arrows": arrows.size(), "passes": samples.size(), "mean_us": float(total) / maxf(1.0, samples.size()), "max_us": mx}
	# 신규 틱 경로 코드만 분리 측정: 스텝당 scan(실제 G 필드보스 슬롯, 접촉 없음 지점) + pass당 has_field_mobs/read_env.
	var owner: Node = main.get_node_or_null("PCFieldMobHitOwner")
	if owner != null:
		var fenv: Dictionary = owner.read_env(g)
		var hs: Dictionary = {}
		var far_pt: Vector2 = player.global_position + Vector2(0, -2000)
		var n := 20000
		var t1 := Time.get_ticks_usec()
		for i in range(n):
			owner.scan(fenv, far_pt.x, far_pt.y, 11.0, hs)
		var scan_us: float = float(Time.get_ticks_usec() - t1) / n
		var t2 := Time.get_ticks_usec()
		for i in range(n):
			if owner.has_field_mobs(g): owner.read_env(g)
		var env_us: float = float(Time.get_ticks_usec() - t2) / n
		observations["perf_field_code_only"] = {"scan_us_per_step": scan_us, "env_us_per_pass": env_us, "slots": (fenv.fbs as Array).size(), "calls": n}
		check(scan_us < 50.0, "field_scan_per_step_under_50us:%s" % scan_us)
	check(samples.size() == 40, "perf_samples")
	opts["xbowAuto"] = true
	forced += 1
	await _wait_store_idle(60)
	observations["fb_shots"] = fb_shots
	observations["field_owner"] = main.native_combat_pack_b.get_snapshot().get("field_mob_owner")
