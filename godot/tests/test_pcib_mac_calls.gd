extends "res://tests/test_pc_combat_pack_b.gd"
## Mac caller regression. Unit-owned source recipe/sp and iframe setup are explicit;
## the separate E2E never injects projectiles or damage.
func _run() -> void:
 main=load("res://scenes/main.tscn").instantiate()
 root.add_child(main)
 for i in 8:await physics_frame
 world=main.world;player=main.player;state=main.source_state
 current_group="mac_calls"
 var bow: Dictionary=state.read_current_inventory().equipped.bow
 spec=SPEC.new().evaluate(bow,state.read_current_passives(),CATALOG.new())
 check(spec.status=="READY","W01 actual current inventory")
 check(is_instance_valid(main.native_auto_crossbow) and world._native_auto_crossbow==main.native_auto_crossbow,"World single crossbow owner")
 check(main.native_pcib_death_effects.receipts[8].status=="APPLIED","etype8 PCI09 registered")
 check(main.native_pcib_death_effects.receipts[29].status=="APPLIED","etype29 PCI09 registered")
 check(main.native_pcib_death_effects.receipts[15].status=="NOT_READY","etype15 missing constructor remains prewrite gated")
 var recipe: Dictionary=_type3_recipe(player.global_position+Vector2(160,0))
 check(not recipe.is_empty(),"canonical type3 recipe")
 if not recipe.is_empty():
  var actor:=Binding.new()
  check(actor.configure(recipe,player,world,{"render_body":false,"native_random":Callable(world,"sample_native_random_unit"),"emit_charged_projectile":_record_packet}),"actual type3 actor")
  check(world.register_summoned_enemy(actor).get("valid")==true,"World registration")
  check(actor.read_native_normal_enemy_hurte_fields(world).get("ready")==true,"PCI02 bound immediately after World registration")
  var again: Dictionary=main.bind_native_enemy_hurte_owner(actor,{"token":"mac-double-bind"})
  check(again.status=="REJECTED" and again.reason=="actor_already_bound","no second binding owner")
  var packet: RefCounted=_borrow_arrow(player.global_position,actor.global_position,1)
  var result: Dictionary=main.request_native_hurte(actor,1,0.0,false,packet.fields,0,{"token":"mac-normalbow-opts"})
  check(result.status in ["APPLIED","SOURCE_RETURN"],"normalBow opts reaches bound hurtE without receive_damage fallback")
  check(result.get("opts_identity_preserved")==true,"same Packet.fields opts identity")
  world.retire_native_player_projectile(main,packet,false)
 var original_serial: int=main.native_auto_crossbow.serial
 main.native_auto_crossbow.advance_source(1.0,1.0)
 check(main.native_auto_crossbow.serial==original_serial,"G.on false prevents intro autofire")
 check(state.apply_native_intro_curtain_g_writes(main.source_intro_sequence,"open").get("applied")==true,"existing intro G.on owner")
 var adapter: RefCounted=main.native_stage_spawn_adapter
 var group: String=str(adapter._groups.keys()[0])
 var holes: Node=world.get_node("NativeSpawnHoleSystem")
 var source_index:=1
 for etype in [8,9,10,11,12,26,27,28]:
  var literal: Dictionary={}
  for draw in preload("res://scripts/native_spawn_hole_system.gd").MKEN_LITERAL_DRAWS:
   if draw[1].is_empty() or draw[1].has(etype):literal[draw[0]]=float(draw[2])+(30.0 if etype==26 and draw[0]=="_iceBlizzT" else float(draw[3]))*.5
  var source: Dictionary={"etype":etype,"elite":0,"mods":[],"speed_u":.5,"radius_u":.5,"literal":literal,"spawn_n":source_index}
  var made: Dictionary=main.request_native_etype_b_spawn(holes,group,source) if etype<13 else main.request_native_etype_f_spawn(holes,group,source)
  source_index+=1
  check(made.get("registered")==true,"actual MAP11 registered profile "+str(etype)+":"+str(made.get("reason")))
  if made.get("registered")!=true:continue
  var actor: Node=made.actor
  actor.eShield=0;actor.data.native_final.reviveIframes=0.0
  var before: float=actor.hp
  var hit: Dictionary=main.request_native_hurte(actor,1,0.0,false,{},0,{"token":"mac-profile/"+str(etype)})
  check(hit.status=="APPLIED" and actor.hp<before,"PCI03 actual B/F HP owner "+str(etype)+":"+str(hit.get("reason")))
  if etype==8:
   var lethal: Dictionary=main.request_native_hurte(actor,1000000,0.0,false,{},0,{"token":"mac-death8"})
   check(main.native_pcib_death_effects.calls[8]==1,"PCI09 actual death8 consumer once:"+str(lethal.get("reason")))
 print("PCIB_MAC_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"forced":"unit recipes/iframe/shield/damage/sp only; no E2E injection","full_runtime_ready":false,"death_calls":main.native_pcib_death_effects.calls}))
 _cleanup()
 quit(0 if failures==0 else 1)
