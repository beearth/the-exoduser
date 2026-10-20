extends RefCounted
## DEMO11-01: build policy, not a new State/save/XP implementation.
## game.html:16645-16648,62112-62126,63882-63891; index.html:1258.
const EXP_POLICY = preload("res://scripts/native_meta_exp_gate_policy.gd")

static func boot_manifest(route: String = "demo") -> Dictionary:
	# Explicit developer routes never fall through to a public demo new run.
	# Native development/restore entry points require separate implementation.
	if route != "demo":
		return {"status": "REJECTED", "reason": "unsupported_boot_route", "requested_route": route}
	return {"status": "READY", "schema": "exoduser.demo11.policy.v1",
		"build_target": "demo", "demo": true, "boot_route": "demo_new",
		"stage": 0, "last_stage": 0, "hell": 0,
		"level_cap": EXP_POLICY.DEMO_LEVEL_CAP,
		"exp_policy": "native_meta_exp_gate_policy", "development_boot_supported": false,
		"pending_consumers": ["DEMO11-20:actual_add_exp", "demo_clear_transition", "save_restore_admission"],
		"source": {"build": "game.html:16646-16648", "new_run": "game.html:62112-62126",
			"development_split": "game.html:63882-63891", "lobby": "index.html:1258"}}

static func exp_gate(state: Dictionary, today: String, in_loop: bool = false) -> Dictionary:
	# Reuse META-06 including clamp/order/date semantics. No real clock or writer.
	var policy := boot_manifest()
	return EXP_POLICY.loop_gate(state, policy["demo"], today) if in_loop else EXP_POLICY.entry_gate(state, policy["demo"], today)
