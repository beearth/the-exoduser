extends SceneTree
const UP=preload("res://port_modules/skill_management_source/upgrade.gd")
var checks:=0
var failures:=0
var main: Node
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok:failures+=1;printerr("DEMO11_18_UP_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
	check(OS.get_user_data_dir().get_file()=="EXODUSER-demo11-18-Isolated-20261021","actual isolated directory")
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in 12:await physics_frame
	# Declared starting ledger on actual State; no combat/physics replacement.
	var p: Dictionary=main.source_state.read_current_p();p.lv=100;p.sp=100
	p.skills["ghostXbowTurret"]=3;p.skills["voidScarecrow"]=3
	check(main.request_native_skill_fusion("siege-create","siegeGhost").committed,"real fusion creates override-star group")
	var before: Dictionary=main.read_native_skill_management()
	var plan: Dictionary=UP.preview("ghostXbowTurret",before,"ui")
	var result: Dictionary=main.request_native_skill_management({"request_id":"siege-up","action":"learn_up","skill_id":"ghostXbowTurret"})
	check(result.committed and result.branch=="fusion_upgraded","existing fused-upgrade branch")
	check(result.after==plan.value.fixture,"original whole-member ledger")
	check(result.before.p.sp-result.after.p.sp==2,"source actual upgrade uses2members, not display star3")
	check(result.fusion_combat_handoff.fusion_key=="siegeGhost","HOLD handoff identifies actual upgraded fusion key")
	check(result.fusion_combat_handoff.status=="HOLD" and not result.fusion_combat_handoff.damage_execution,"upgrade damage not invoked")
	var bits: Dictionary={}
	for pair in [["sp",result.after.p.sp],["mats",result.after.g.mats]]:
		var b:=PackedByteArray();b.resize(8);b.encode_double(0,float(pair[1]));bits[pair[0]]=b.hex_encode()
	print("SK_S05_ORACLE_ROW ",JSON.stringify({"method":"upgrade","args":["ghostXbowTurret",before,"ui"],"value":{"fixture":result.after},"currency_bits":bits},"",false))
	main.get_parent().remove_child(main);main.free()
	for i in 12:await process_frame
	print("DEMO11_18_UP_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0}))
	quit(1 if failures else 0)
