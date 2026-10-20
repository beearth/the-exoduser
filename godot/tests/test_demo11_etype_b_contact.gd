extends "res://tests/test_demo11_etype_b_runtime.gd"
func run() -> void:
 await boot_b()
 if b_actors.size()==5:
  var target: Node=b_actors[1]
  target.eShield=0;target.data.native_final.reviveIframes=0.0
  var before_enemy: float=target.hp
  var receipt: Dictionary=HURTE.new().execute(b_main,b_main.world,target,1,0.0,0,{})
  check(receipt.ok and target.hp<before_enemy,"reused installed factory profile reaches actual protected HP writer")
  var actor: Node2D=b_actors[4]
  actor.global_position=b_main.player.global_position+Vector2(1,0)
  actor.st2=0;actor.alerted=true
  b_main.player.iframes=0
  var before_player: float=b_main.player.hp
  actor.advance_native_phase(0.5,1,b_main.world.get_enemies())
  check(b_main.player.hp<before_player,"B12 contact calls actual protected Player damage API")
  check(b_main.source_state.read_current_p().hp==b_main.player.hp,"actual State/Player HP alias after PC damage")
  print("ETYPE_B_CONTACT_OBSERVATION ",JSON.stringify({"player_before":before_player,"player_after":b_main.player.hp,"enemy_before":before_enemy,"enemy_after":target.hp,"protected_hurtE":receipt.ok}))
 print("ETYPE_B_CONTACT_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"registered":b_actors.size(),"test_owned_positions_and_shield_iframe_setup":true}))
 b_main.free()
 await process_frame
 quit(0 if failures==0 else 1)
