class_name CombatQEBlackCarrierConsumer
extends RefCounted
##
## black_carrier_consumer.gd — 실제 ROOT black carrier(Node.apply_source_q_reflection/get_shot) 소비자.
## TASK GODOT-PORT-COMBAT_QE-FIRST-20261013 / CONTROL ACTUAL-ROOT-CARRIER-CONSUMER-0051.
##
## local canonical 鏡像/mock 이 아니라 실제 ROOT 작성 노드(port_modules/black_bean_projectile/producer.gd,
## 읽기전용)를 소비한다. 새 API shim·whole kernel 복제 0. ROOT 노드를 new 하고 같은 carrier Shot identity
## 를 유지한 채 0035 ctx 를 넘겨 ROOT return 의 actual bank_add/doParry reaction 만 publicly expose 한다.
##   shared HP/input/doParry 本体 적용은 ENGINE — 본 소비자는 reaction 노출 + SKILL 자원(parry_bank)만.
##   원 continue: 같은 Q frame 이동 0 / 다음 tick deferred blue (ROOT handoff 소관).
##   base112 → projectile_dmg 168 → bank_add 168 / doParry 168 (원 35674~35683 순서, ROOT 산출).
##
## ROOT kernelConstructor/의존 Resource 未準備(configure 미완/handoff_not_ready)면 exact current block 하나와
## ready=false 를 報告한다. local mirror fallback 을 actual PASS 로 승격 0.

const ROOT_SHOT_API := "Node.apply_source_q_reflection(ctx)->Dictionary / Node.get_shot()->Shot (port_modules/black_bean_projectile/producer.gd)"

## projectile-scope actual_sbPW (CONTROL 0051): sBlock && sbT>0. 강제 isQ=true/neutral 발명 0.
static func actual_sbpw(player: Object) -> bool:
	var st: String = String(player.state) if ("state" in player) else ""
	var sbt: float = float(player.sb_parry_t) if ("sb_parry_t" in player) else 0.0
	return st == "sBlock" and sbt > 0.0

## 0035 ctx 生成. base: scalar 또는 Callable(incoming) (정확히 1). homing: Object/Vector2/null(키 필수) 또는 provider.
static func build_ctx(player_position: Vector2, player: Object, base, homing_target = "__NONE__", homing_provider = null) -> Dictionary:
	var ctx := {
		"player_position": player_position,
		"actual_sbPW": actual_sbpw(player),
	}
	if base is Callable:
		ctx["parry_base_provider"] = base
	else:
		ctx["parry_base_damage"] = base
	if homing_provider != null:
		ctx["homing_target_provider"] = homing_provider
	else:
		# "__NONE__" 센티넬이 아니면 키 존재(null 포함)로 전달 — 원 homing_target 키 필수 계약.
		ctx["homing_target"] = (null if homing_target == "__NONE__" else homing_target)
	return ctx

## 실제 ROOT 노드 소비. root_node 는 이미 configure_hostile 된 ROOT producer(ENGINE binding).
##   반환(actual PASS): { ready:true, actual_root:true, projectile_dmg, bank_add, doParry_damage,
##     parry_element, field_order, handoff, after_carrier_caller_steps, deferred }.
##   반환(block): { ready:false, actual_root:true, current_block:<exact error>, reaction:null }.
static func consume(root_node: Object, ctx: Dictionary, player: Object = null) -> Dictionary:
	if root_node == null or not root_node.has_method("apply_source_q_reflection"):
		return { "ready": false, "actual_root": false, "current_block": "root_node_missing_apply_source_q_reflection", "reaction": null }
	var res: Dictionary = root_node.apply_source_q_reflection(ctx)
	if not bool(res.get("ok", false)):
		# exact current block 하나. local mirror 승격 0.
		return { "ready": false, "actual_root": true, "current_block": String(res.get("error", "unknown")), "reaction": null }
	var projectile_dmg: int = int(res.projectile_dmg)
	var bank_add: int = int(res.bank_add)
	# SKILL 자원만 소비(parry_bank). shared HP/doParry 本体 적용은 ENGINE(doParry_damage 노출).
	if player != null and ("parry_bank" in player):
		player.parry_bank += bank_add
	return {
		"ready": true,
		"actual_root": true,
		"incoming_dmg_before": res.get("incoming_dmg_before"),
		"parry_base_damage": res.get("parry_base_damage"),
		"projectile_dmg": projectile_dmg,
		"bank_add": bank_add,
		"doParry_damage": projectile_dmg,          # 원 doParry(변이 p.dmg,...) = projectile_dmg
		"parry_element": res.get("parry_element"),
		"target_branch": res.get("target_branch"),
		"field_order": res.get("field_order"),
		"handoff": res.get("handoff"),
		"after_carrier_caller_steps": res.get("after_carrier_caller_steps"),
		"deferred": "같은 Q frame 이동 0 — blue 소비자는 다음 tick(ROOT handoff). 같은 carrier identity.",
	}
