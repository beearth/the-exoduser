extends SceneTree
## PC-SOURCE-PERF — source owner validation pass memo on the actual booted Main.
##
## Contract under test (scripts/native_source_validation_pass.gd):
## * nested repeats of Services/Providers/State/Resources validators inside ONE
##   outermost validation reuse that pass's result (dedupe), and
## * nothing is carried across two outermost calls: owner replacement, tree /
##   scene change, claim meta change, State/resource value ("revision") change
##   and owner loss are observed by the very first following call, whose result
##   equals the unmemoized reference chain (pre-change algorithm) exactly,
## * reentrant/nested scopes always unwind to depth 0 and per-owner memo never
##   leaks to another owner instance.
const USERDIR := "EXODUSER-pc-source-perf-Isolated-20261021"
const MAIN := preload("res://scenes/main.tscn")
const PASS := preload("res://scripts/native_source_validation_pass.gd")
const STATE := preload("res://scripts/native_source_new_run_state.gd")
const RESOURCES := preload("res://scripts/native_source_resource_authority.gd")
const PROVIDERS := preload("res://scripts/native_source_player_providers.gd")
const GROUPS := ["nested_pass_dedupe", "outermost_calls_revalidate", "owner_replacement",
	"claim_meta_change", "tree_and_scene_change", "revision_value_change", "raw_grit_and_owner_loss",
	"reentrant_scope_and_identity"]
var checks := 0
var failures := 0
var rows: Array = []

func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		push_error("PCSVC_INVALID_ISOLATION " + OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func check(ok: bool, label: String) -> bool:
	checks += 1
	if not ok:
		failures += 1
		print("PCSVC_FAIL ", label)
	return ok

func _run() -> void:
	var selected: Array = GROUPS.duplicate()
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="): selected = Array(arg.trim_prefix("--only=").split(",", false))
	for id in selected:
		var before_checks := checks
		var before_failures := failures
		var observation: Variant = await call("_test_" + id)
		var row := {"group": id, "checks": checks - before_checks, "failures": failures - before_failures,
			"observation": observation}
		rows.append(row)
		print("PCSVC_GROUP_RESULT ", JSON.stringify(row))
	print("PCSVC_SUITE_RESULT ", JSON.stringify({"groups": selected.size(), "checks": checks,
		"failures": failures, "userdir": OS.get_user_data_dir(), "actual_Main": true}))
	quit(0 if failures == 0 else 1)

func make_main() -> Node:
	var main: Node = MAIN.instantiate()
	root.add_child(main)
	await physics_frame
	check(is_instance_valid(main.source_state) and is_instance_valid(main.source_resources) \
		and is_instance_valid(main.source_providers) and is_instance_valid(main.source_initialization_services),
		"actual Main source owners live")
	return main

func destroy_main(main: Node) -> void:
	if is_instance_valid(main):
		main.queue_free()
	await process_frame
	await process_frame

## Memoized public verdicts (what every caller sees) for the four owners.
func memo(main: Dictionary) -> Dictionary:
	check(PASS.depth == 0, "memo read starts outside any pass")
	var out := {"resources": main.resources._current_error(), "state": main.state._current_error(),
		"providers": main.providers._context_error(), "services_owner": main.services._source_owner_error(),
		"services": main.services._context_error()}
	check(PASS.depth == 0, "memo read leaves no pass open")
	return out

## Unmemoized reference: the same public entry points with every reuse
## disabled (PASS.bypass) — the pre-change, fully repeated evaluation chain.
func reference(main: Dictionary) -> Dictionary:
	PASS.bypass = true
	var out := {"resources": main.resources._current_error(), "state": main.state._current_error(),
		"providers": main.providers._context_error(), "services_owner": main.services._source_owner_error(),
		"services": main.services._context_error()}
	PASS.bypass = false
	return out

func ref_one(owner: Object, method: String) -> String:
	PASS.bypass = true
	var out: String = owner.call(method)
	PASS.bypass = false
	return out

## Old packet verdict vs the allocation-free replacement, in the same state.
func parameters_equal(main: Dictionary) -> bool:
	return STATE._parameters_valid(main.resources.read_current_resource_parameters()) \
		== main.resources.is_current_resource_parameters_ready()

func owners(main_node: Node) -> Dictionary:
	return {"main": main_node, "player": main_node.player, "world": main_node.world,
		"state": main_node.source_state, "resources": main_node.source_resources,
		"providers": main_node.source_providers, "services": main_node.source_initialization_services}

## First call after a mutation must re-validate (evaluations grow) and equal
## the reference chain; `expect` lists owners whose verdict must be a rejection.
func expect_first_call(o: Dictionary, label: String, expect: Dictionary) -> Dictionary:
	PASS.reset_diagnostics()
	var first := memo(o)
	var evaluated := PASS.evaluations
	var ref := reference(o)
	check(evaluated > 0, label + " first call re-validated (evaluations=" + str(evaluated) + ")")
	check(first == ref, label + " memo == unmemoized reference " + JSON.stringify({"memo": first, "ref": ref}))
	check(parameters_equal(o), label + " resource parameter verdict unchanged")
	for key in expect:
		var want: String = expect[key]
		if want == "*":
			check(not first[key].is_empty(), label + " " + key + " rejects: " + first[key])
		else:
			check(first[key] == want, label + " " + key + " == " + want + " (got " + first[key] + ")")
	return {"memo": first, "evaluations": evaluated}

func expect_all_ready(o: Dictionary, label: String) -> void:
	var now := memo(o)
	for key in now:
		check(now[key].is_empty(), label + " " + key + " ready again: " + now[key])
	check(now == reference(o), label + " ready verdict equals reference")
	check(o.state.is_native_new_run_state_ready() and o.resources.is_native_source_resources_ready() \
		and o.providers.is_native_source_providers_ready() and o.services.is_source_context_ready(),
		label + " public readiness restored")

func _test_nested_pass_dedupe() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	PASS.reset_diagnostics()
	var verdict: String = o.services._context_error()
	var memo_evaluations := PASS.evaluations
	var memo_hits := PASS.hits
	check(verdict.is_empty(), "actual Services context ready")
	# Services ctx, Services owner, Providers ctx, State, Resources: one each.
	check(memo_evaluations == 5, "one outermost Services check evaluates each owner once (" + str(memo_evaluations) + ")")
	check(memo_hits > 0, "nested repeats reused this pass (" + str(memo_hits) + ")")
	check(PASS.depth == 0, "pass closed after outermost return")
	PASS.reset_diagnostics()
	var ref_verdict: String = ref_one(o.services, "_context_error")
	var ref_evaluations := PASS.evaluations
	check(ref_verdict == verdict, "same verdict as unmemoized chain")
	check(ref_evaluations > memo_evaluations * 5, "unmemoized chain re-evaluates nested owners (" + str(ref_evaluations) + ")")
	check(parameters_equal(o), "ready resource parameter verdict unchanged")
	await destroy_main(main_node)
	return {"memo_evaluations": memo_evaluations, "memo_hits": memo_hits, "reference_evaluations": ref_evaluations}

func _test_outermost_calls_revalidate() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	var deltas: Array = []
	var pass_ids: Array = []
	for i in range(3):
		PASS.reset_diagnostics()
		check(o.services._context_error().is_empty(), "call %d ready" % i)
		deltas.append(PASS.evaluations)
		pass_ids.append(PASS.pass_id)
	check(deltas == [5, 5, 5], "every outermost call re-validates all owners " + str(deltas))
	check(pass_ids[0] < pass_ids[1] and pass_ids[1] < pass_ids[2], "each outermost call is a new pass")
	# Same frame, no frame/tick carry: a domain read is one pass, then a new one.
	PASS.reset_diagnostics()
	check(o.state.read_current_p() is Dictionary, "P read")
	var p_evaluations := PASS.evaluations
	check(p_evaluations == 2, "P read evaluates State+Resources once each (" + str(p_evaluations) + ")")
	PASS.reset_diagnostics()
	check(o.providers._read_domain("g") is Dictionary, "provider G read")
	check(PASS.evaluations == 3, "provider domain read = Providers+State+Resources once (" + str(PASS.evaluations) + ")")
	await destroy_main(main_node)
	return {"services_evaluations": deltas, "p_read_evaluations": p_evaluations}

func _test_owner_replacement() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	expect_all_ready(o, "before")
	var other := Node2D.new()
	main_node.world.player = other
	var a := expect_first_call(o, "World.player replaced", {"resources": "world_has_other_player",
		"state": "world_has_other_player", "providers": "*", "services_owner": "*", "services": "*"})
	check(o.state.read_current_g() == null and o.providers.get_provider_bundle().is_empty(),
		"replaced owner: public reads rejected immediately")
	main_node.world.player = o.player
	expect_all_ready(o, "World.player restored")
	# Main-level owner replacement: Services must see a foreign source_state.
	var foreign_state := STATE.new()
	main_node.source_state = foreign_state
	var b := expect_first_call(o, "Main.source_state replaced", {"services_owner": "actual_Main_source_identity_mismatch",
		"services": "actual_Main_source_identity_mismatch"})
	main_node.source_state = o.state
	foreign_state.free()
	expect_all_ready(o, "Main.source_state restored")
	other.free()
	await destroy_main(main_node)
	return {"world_player": a, "main_source_state": b}

func _test_claim_meta_change() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	var player: Node = o.player
	var state_claim: Variant = player.get_meta(STATE.CLAIM_META)
	var impostor := STATE.new()
	player.set_meta(STATE.CLAIM_META, weakref(impostor))
	var a := expect_first_call(o, "State claim replaced", {"state": "new_run_actor_claim_mismatch",
		"providers": "*", "services_owner": "*", "services": "*"})
	player.set_meta(STATE.CLAIM_META, state_claim)
	expect_all_ready(o, "State claim restored")
	player.set_meta(RESOURCES.INITIALIZED_META, false)
	var b := expect_first_call(o, "Resource initialized claim cleared", {"resources": "resource_initialized_claim_missing",
		"state": "*", "providers": "*", "services": "*"})
	player.set_meta(RESOURCES.INITIALIZED_META, true)
	expect_all_ready(o, "Resource initialized meta restored")
	var provider_claim: Variant = player.get_meta(PROVIDERS.CLAIM_META)
	player.set_meta(PROVIDERS.CLAIM_META, weakref(impostor))
	var c := expect_first_call(o, "Provider claim replaced", {"resources": "", "state": "",
		"providers": "actual_player_provider_claim_lost", "services_owner": "*", "services": "*"})
	player.set_meta(PROVIDERS.CLAIM_META, provider_claim)
	expect_all_ready(o, "Provider claim restored")
	impostor.free()
	await destroy_main(main_node)
	return {"state_claim": a, "resource_meta": b, "provider_claim": c}

func _test_tree_and_scene_change() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	# Holder reparented away from the actual World.
	o.state.reparent(main_node, false)
	var a := expect_first_call(o, "State holder reparented", {"state": "holder_reparented",
		"providers": "*", "services_owner": "*", "services": "*"})
	o.state.reparent(o.world, false)
	expect_all_ready(o, "State holder returned")
	# Actual Player leaves the Tree (scene-level change of the actor).
	var parent: Node = o.player.get_parent()
	var index: int = o.player.get_index()
	parent.remove_child(o.player)
	var b := expect_first_call(o, "Player removed from Tree", {"resources": "",
		"state": "player_removed_from_tree", "providers": "*", "services_owner": "*", "services": "*"})
	parent.add_child(o.player)
	parent.move_child(o.player, index)
	expect_all_ready(o, "Player back in Tree")
	# Whole scene change: Main freed, retained owners must report loss at once.
	main_node.queue_free()
	await process_frame
	await process_frame
	var lost := {"resources": o.resources, "state": o.state, "providers": o.providers, "services": o.services}
	check(not is_instance_valid(lost.resources) and not is_instance_valid(lost.state), "scene change freed holders")
	PASS.reset_diagnostics()
	var providers_after: String = o.providers._context_error()
	var services_after: String = o.services._context_error()
	check(PASS.evaluations > 0, "scene change: first call re-validated")
	check(providers_after == ref_one(o.providers, "_context_error") and providers_after == "lost_actual_source_nodes",
		"scene change: provider loss verdict unchanged (" + providers_after + ")")
	check(services_after == ref_one(o.services, "_context_error") and services_after == "actual_source_owner_lost",
		"scene change: services loss verdict unchanged (" + services_after + ")")
	check(o.providers.get_provider_bundle().is_empty() and not o.services.is_source_context_ready(), "scene change: public API NOT_READY")
	return {"reparent": a, "player_removed": b, "scene_change": {"providers": providers_after, "services": services_after}}

func _test_revision_value_change() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	expect_all_ready(o, "before")
	# Accepted owner write between two calls (revision changes, still valid).
	var before_mp: float = float(o.resources._owned["mp"])
	var write: Dictionary = o.resources.commit_native_q_mana_cost(main_node, 1.0)
	check(write.get("accepted") == true, "owner write accepted")
	var params: Dictionary = o.resources.read_current_resource_parameters()
	check(float(params["values"]["mp"]) == maxf(0.0, before_mp - 1.0), "write visible to the next read")
	expect_all_ready(o, "after accepted write")
	# Owned resource revision becomes invalid in the same frame.
	var mp: Variant = o.resources._owned["mp"]
	o.resources._owned["mp"] = NAN
	var a := expect_first_call(o, "owned mp NaN", {"resources": "missing_current_owned_resource:mp",
		"state": "*", "providers": "*", "services": "*"})
	check(o.state.read_current_p() == null and o.state.read_current_g() == null, "invalid revision rejects State reads")
	check(o.resources.read_current_resource_parameters()["status"] != "READY", "invalid revision rejects resource packet")
	o.resources._owned["mp"] = mp
	expect_all_ready(o, "owned mp restored")
	# Actual actor field revision (hp) becomes non-finite in the same frame.
	var hp: float = o.player.hp
	o.player.hp = INF
	var b := expect_first_call(o, "player hp INF", {"resources": "missing_current_actual_player_fields",
		"state": "*", "providers": "*", "services": "*"})
	o.player.hp = hp
	expect_all_ready(o, "player hp restored")
	o.player.iframes = NAN
	var c := expect_first_call(o, "player iframes NaN", {"resources": "",
		"state": "missing_current_actual_player_field:iframes", "providers": "*", "services": "*"})
	o.player.iframes = 0.0
	expect_all_ready(o, "player iframes restored")
	await destroy_main(main_node)
	return {"mp_nan": a, "hp_inf": b, "iframes_nan": c}

func _test_raw_grit_and_owner_loss() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	expect_all_ready(o, "before")
	var bundle: Dictionary = o.providers.get_provider_bundle()
	bundle["raw_grit"].unpublish()
	var a := expect_first_call(o, "raw grit unpublished", {"resources": "", "state": "",
		"providers": "current_owned_raw_grit_not_ready", "services_owner": "*", "services": "*"})
	await destroy_main(main_node)
	var second: Node = await make_main()
	var p := owners(second)
	var readers: Dictionary = p.providers.get_provider_bundle()
	p.state.free()
	PASS.reset_diagnostics()
	var verdicts := {"providers": p.providers._context_error(), "services": p.services._context_error()}
	check(PASS.evaluations > 0, "freed State: first call re-validated")
	check(verdicts.providers == ref_one(p.providers, "_context_error") and verdicts.providers == "lost_actual_source_nodes",
		"freed State provider verdict unchanged (" + verdicts.providers + ")")
	check(verdicts.services == ref_one(p.services, "_context_error") and verdicts.services == "actual_source_owner_lost",
		"freed State services verdict unchanged (" + verdicts.services + ")")
	for key in ["current_g", "current_p", "current_stats", "current_passives", "current_inventory"]:
		check(readers[key].call() == null, "freed State reader returns null: " + key)
	# Free the whole scene now: no frame may run Main against the freed holder.
	second.free()
	await process_frame
	return {"raw_grit": a, "state_freed": verdicts}

func _test_reentrant_scope_and_identity() -> Dictionary:
	var main_node: Node = await make_main()
	var o := owners(main_node)
	# Nested scopes unwind exactly; an outer scope's memo dies with it.
	PASS.reset_diagnostics()
	var outer := PASS.open_read()
	check(o.state._current_error().is_empty(), "inside scope: State ready")
	var first_evaluations := PASS.evaluations
	check(o.state._current_error().is_empty(), "inside scope: nested repeat")
	check(PASS.evaluations == first_evaluations and PASS.hits > 0, "nested repeat reused inside the same scope")
	var inner := PASS.open_read()
	check(inner == outer and PASS.depth == 2, "nested scope joins the running pass")
	PASS.leave()
	PASS.leave()
	check(PASS.depth == 0, "scopes unwind to depth 0")
	# Reentrant call after the scope closed must re-validate and see a change.
	o.player.set_meta(STATE.INITIALIZED_META, false)
	PASS.reset_diagnostics()
	var after: String = o.state._current_error()
	check(PASS.evaluations > 0 and after == "new_run_initialized_claim_missing" and after == ref_one(o.state, "_current_error"),
		"post-scope call re-validates and sees the change (" + after + ")")
	o.player.set_meta(STATE.INITIALIZED_META, true)
	check(o.state._current_error().is_empty(), "restored claim ready")
	# Per-owner identity: a second, unconfigured owner never borrows the memo.
	var stranger := STATE.new()
	var stranger_resources := RESOURCES.new()
	PASS.open_read()
	var main_verdict: String = o.state._current_error()
	var stranger_verdict: String = stranger._current_error()
	var resources_verdict: String = o.resources._current_error()
	var stranger_resources_verdict: String = stranger_resources._current_error()
	PASS.leave()
	check(main_verdict.is_empty() and stranger_verdict == "missing_initialized_new_run_state",
		"same pass, different State owner keeps its own verdict (" + stranger_verdict + ")")
	check(resources_verdict.is_empty() and stranger_resources_verdict == "missing_initialized_resource_authority",
		"same pass, different Resources owner keeps its own verdict (" + stranger_resources_verdict + ")")
	check(PASS.depth == 0, "identity scope closed")
	stranger.free()
	stranger_resources.free()
	await destroy_main(main_node)
	return {"stranger_state": stranger_verdict, "stranger_resources": stranger_resources_verdict}
