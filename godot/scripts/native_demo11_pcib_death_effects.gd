extends RefCounted
## PCI-09 synchronous Mac consumers. No replacement kill pipeline.
var main: Node
var receipts: Dictionary={}
var calls: Dictionary={8:0,15:0,29:0}
func configure(owner: Node) -> void:
 main=owner
 receipts[8]=main.register_native_enemy_death_effect("etype8_death_explosion",_explode,{"token":"pcib/death8"})
 receipts[29]=main.register_native_enemy_death_effect("etype29_death_shots",_shots,{"token":"pcib/death29"})
 receipts[15]=main.register_native_enemy_death_effect("etype15_death_split",_split,{"token":"pcib/death15"})
func _split(c: Dictionary) -> Dictionary:
 calls[15]+=1
 if main._native_etype15_spawn==null:return {"applied":false,"reason":"C15_constructor_not_initialized"}
 return main._native_etype15_spawn.split_death(c)
func _explode(c: Dictionary) -> Dictionary:
 var actor: Node=c.actor
 var origin:=Vector2(c.x,c.y)
 var damage: int=int(actor.attack)
 var nested: Array=[]
 calls[8]+=1
 for enemy in c.world.query_native_enemies(c.x,c.y,50.0):
  if enemy==actor or not is_instance_valid(enemy) or not enemy.alive or origin.distance_to(enemy.global_position)>=50.0:continue
  var angle: float=(enemy.global_position-origin).angle()
  var r: Dictionary=c.hurt_enemy.call(enemy,damage,angle,false,{},0,{"token":str(c.death_prefix_token)+"/"+str(enemy.get_instance_id())})
  nested.append(r)
  if r.get("status") not in ["APPLIED","SOURCE_RETURN"]:return {"applied":false,"reason":"explosion_nested_hurte_stopped","nested":nested}
 if origin.distance_to(main.player.global_position)<50.0 and main.player.iframes<=0 and main.player.state!="charge":
  main.player.receive_damage(damage,"magic")
 main.world.emit_native_parts(origin,"#ff6622",20)
 main.source_state.apply_native_skill_shake(main,5.0)
 return {"applied":true,"nested":nested,"visual_remaining":"source _addBoom fire expansion"}
func _shots(c: Dictionary) -> Dictionary:
 var actor: Node=c.actor
 # PC-ENEMY-ACTORS(2026-10-23): 일반(비보스) 자연 29 의 42819 _spawnBossProjectile 은 _emitEnemyShot 사망 전조(60)로 간다.
 # 아래 보스 래퍼 경로(prepare_boss_props: ib 전용)는 비보스에서 거절되므로 G owner 가 같은 8발·난수 순서로 처리한다.
 if actor.get("g_owner")!=null and is_instance_valid(actor.g_owner):
  calls[29]+=1
  return actor.g_owner.death_shots(c)
 var registry: Node=main.native_demo_boss_projectiles
 if not is_instance_valid(registry) or not c.rand is Callable:return {"applied":false,"reason":"actual_DEMO11_35_registry_or_rand_lost"}
 var frame: Dictionary={"serial":int(main.world._native_clock_updates),"sp":main.world._native_last_ticks,
  "context":{"lesson_active":false,"qa_storage_active":false,"aggro_active":false}}
 var born:=0
 calls[29]+=1
 for i in 8:
  var u: Variant=c.rand.call()
  if not u is float and not u is int:return {"applied":false,"born":born,"reason":"prefix_rng_not_ready"}
  var black: bool=float(u)<.5
  var direction:=Vector2.from_angle(TAU*i/8)
  var speed: float=4.4 if black else 2.5
  var props: Dictionary={"x":c.x,"y":c.y,"vx":direction.x*speed,"vy":direction.y*speed,
   "dmg":int(actor.attack*(1.5 if black else 1.2)),"el":0 if black else 2,"friendly":false,
   "life":400 if black else 200,"ml":400 if black else 200,"col":"#00aa00" if black else "#cc1100","sz":2.0 if black else 1.5}
  if black:props.blackBean=true
  else:props.redBean=true;props.homing=true
  var r: Variant=registry._birth_request({"command":"_spawnBossProjectile","enemy":actor,"args":[props],"frame":frame})
  if not r is Dictionary or r.get("ack")!=true:return {"applied":false,"born":born,"reason":"death29_birth_rejected"}
  born+=1
 if actor.global_position.distance_to(main.player.global_position)<100 and main.player.iframes<=0:main.player.apply_native_freeze_slow(150)
 main.source_state.apply_native_skill_shake(main,10.0)
 main.world.emit_native_parts(actor.global_position,"#4455aa",20)
 return {"applied":true,"born":born,"visual_remaining":"source hitstop/labels"}
