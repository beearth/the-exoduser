extends "res://tests/test_demo11_anglers.gd"
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated focused PC boundary")
 setup_registry();native_frame(1)
 scope.player.position=Vector2.ZERO
 for fb in scope.source_state.g._fieldBosses:fb.asleep=0;fb.hid=0;fb.tpT=0;fb.shotCd=1000
 native_frame(2)
 check(family.snapshot().blocked.size()==4 and scope.source_state.g._fieldBosses[0].t==0,"missing PC collision owner freezes prefix")
 var pc:=PC.new();scope.world.add_child(pc);pc.target=scope.player
 check(family.bind_pc_source(pc,&"health"),"actual fixture owner bind")
 check(family.bind_pc_interaction(pc,pc.interact) and not family.bind_pc_interaction(pc,pc.interact),"single PC interaction binding")
 native_frame(3)
 check(pc.requests.size()==4 and pc.requests[0].player.x==0 and pc.requests[1].player.x==140 and pc.requests[3].player.x==140,"later FB receives actual same-frame PC displacement")
 check(family.snapshot().blocked.is_empty() and scope.source_state.g._fieldBosses[0].t==1,"body valid readback permits one prefix")
 pc.bad_readback=true
 native_frame(4)
 var tick: int=scope.source_state.g._fieldBosses[0].t
 var calls: int=pc.requests.size()
 check(family.snapshot().blocked.size()==4,"fake spatial receipt rejected against actual Player")
 native_frame(5)
 check(scope.source_state.g._fieldBosses[0].t==tick and pc.requests.size()==calls,"failed readback quarantines prefix; no silent replay")
 pc.bad_readback=false
 pc.health.emit(0,scope.source_state.g._fieldBosses[0].hp,false,1)
 native_frame(6)
 check(scope.source_state.g._fieldBosses[0].t==tick+1 and family.snapshot().blocked.size()==3,"actual PC resync releases only specified actor")
 check(scope.player.forbidden_calls==0,"mock displacement is never damage/parry proof")
 scope.free()
 print("DEMO31_PC_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"mock_displacement_fixture":true,"damage_parry_verified":false}))
 quit(1 if failures else 0)
