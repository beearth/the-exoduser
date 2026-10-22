extends RefCounted
## DEMO11-48: Mac emission owner; PC owns packet flight and hurtE.
const Spec = preload("res://port_modules/auto_bow_spec/producer.gd")
const Catalog = preload("res://port_modules/item_armor_element/source_item_catalog.gd")
const FIELD_KEYS=["_fieldBosses","_fieldBoss","_worms","_fireDevils"]
const Formula = preload("res://port_modules/combat_stat_formula/producer.gd")
var view: Node2D
var main: Node
var pets: Node
var spec_owner: RefCounted = Spec.new()
var catalog: RefCounted = Catalog.new()
var timer := 0.0
var serial := 0
var fired := 0
var hits := 0
var kills := 0
var max_tick_us := 0
var last_pass: Dictionary = {}
var last_shot: Dictionary = {}
var reason := ""
var _ctx: Dictionary = {"token":0}
var _pass_ctx: Dictionary = {"token":0}
var _admit_blocked:=false
var _bow: Variant
var _pbow: Variant
var _spec: Dictionary = {}
func configure(owner: Node) -> void:
 main=owner
 main.world._native_auto_crossbow=self
 pets=main.world.get_node_or_null("NativePets")
 view=preload("res://scripts/native_demo11_arrow_view.gd").new()
 view.main=main;view.z_index=25;main.world.add_child(view)
func advance_source(sp: float, dt_sp: float) -> void:
 if not is_instance_valid(main) or main.get_tree().paused:return
 var g: Dictionary=main.source_state.read_current_g()
 if not g.get("on",false) or g.get("paused",false):return
 var start := Time.get_ticks_usec()
 view.queue_redraw()
 serial+=1
 _fire_phase(dt_sp)
 _pass_ctx.token=serial
 last_pass=main.advance_native_player_projectile_pass(sp,_pass_ctx)
 for result in last_pass.get("results",[]):
  for contact in result.get("collision_receipt",[]):
   var hurt: Dictionary=contact.get("hurte",{})
   if hurt.get("accepted",false):hits+=1
   if hurt.get("kill_receipt",{}).get("killed",false):kills+=1
 max_tick_us=maxi(max_tick_us,Time.get_ticks_usec()-start)
func _fire_phase(dt_sp: float) -> void:
 if main.player.hp<=0:return
 if _admit_blocked:
  var g: Dictionary=main.source_state.read_current_g()
  for key in FIELD_KEYS:
   var value: Variant=g.get(key)
   if (value is Array and not value.is_empty()) or value is Dictionary:return
  _admit_blocked=false
 var options: Variant=main.source_initialization_services.read_current_options()
 if not options is Dictionary:return
 if options.get("xbowAuto",true)==false:return
 var inv: Dictionary=main.source_state.read_current_inventory()
 var bow: Variant=inv.equipped.get("bow")
 if not bow is Dictionary:return
 var passives: Dictionary=main.source_state.read_current_passives()
 if not is_same(_bow,bow) or _pbow!=passives.get("pBow"):
  _bow=bow;_pbow=passives.get("pBow")
  _spec=spec_owner.evaluate(bow,passives,catalog)
 if _spec.get("status")!="READY":reason="W01_spec_not_ready";return
 timer+=dt_sp
 var speed_mul: float=(float(bow.get("bowSpd",1.0)) if bow.get("bowSpd",1.0) else 1.0)*(1.0+float(passives.get("pXbow",0))*.05)
 if speed_mul<=0 or timer<120.0/speed_mul or main.player.stamina<=main.player.max_stamina*.2:return
 var p: Dictionary=main.source_state.read_current_p()
 var origin: Vector2=main.player.global_position
 if is_instance_valid(pets) and pets.pets.has("xbow"):
  origin=Vector2(pets.pets.xbow.x,pets.pets.xbow.y)
 var target: Node
 var near: float=_spec.range
 for enemy in main.world.query_native_enemies(origin.x,origin.y,near):
  if not is_instance_valid(enemy) or not enemy.alive:continue
  var distance: float=origin.distance_to(enemy.global_position)
  if distance<near:near=distance;target=enemy
 if not is_instance_valid(target):return
 var selected: String=str(p.get("activeBowSk","normal"))
 if selected not in ["normal","ghostXbowTurret"]:reason="NOT_READY non_normal_bow_skill";return
 if int(bow.get("el",0))==1:reason="NOT_READY fire_arrow_burn_death_42700";return
 var providers: RefCounted=main.source_providers
 var legendary: Dictionary=providers.get_provider("formula").l_eq("_lBowCrit")
 if legendary.get("status")!="READY" or float(legendary.get("value",0))>0:reason="NOT_READY legendary_extra_arrow_owner";return
 var reference: RefCounted=providers.get_provider("reference")
 var flat: Dictionary=reference.slot_flat_atk(bow,"bow")
 var dex: Dictionary=reference.eq_stat("Dex")
 var lv: Dictionary=reference.lv_b()
 if not flat.get("ok",false) or dex.get("status")!="READY" or lv.get("status")!="READY":reason="bow_reference_dependencies_not_ready";return
 var stats: Dictionary=main.source_state.read_current_stats()
 var ref_value: float=(float(bow.get("atk",0))+float(bow.get("enh",0))*.25+float(flat.value)+float(p.baseAtk)+float(stats.dex)+float(dex.value)+float(lv.value))*(.3 if float(p.get("_weaponSeal",0))>0 else 1.0)
 var common: float=float(passives.pAtk)*.10+float(p.get("_altAtk",0))+float(passives.get("pHuman",0))*.05
 var bow_mul: float=(1.0+common+float(passives.pBow)*.15)*.7
 var xbow_mul: float=(1.0+common+float(passives.get("pXbow",0))*.05)*.7
 var definition: Variant=catalog.bow_definition(str(bow.get("btype","crossbow")))
 if not definition is Dictionary:definition=catalog.bow_definition("crossbow")
 var damage: int=Formula.js_to_int32(ref_value*bow_mul*xbow_mul*float(definition.get("atkMul",1))+28)*3
 var affix: Dictionary=main.read_native_system_equipment_affix("stCostRed")
 if affix.get("status")!="READY":reason="st_discount_not_ready";return
 var cost: float=(1.5+float(p.skills.get("fanShot",0))*1.5)*maxf(.60,1.0-float(passives.pBow)*.04)*(1.0+minf(0,float(affix.value)))
 var angle: float=(target.global_position-origin).angle()
 var borrowed: Dictionary=main.world.borrow_native_player_projectile(main)
 if borrowed.get("ready")!=true:reason="packet_borrow_rejected";return
 var packet: RefCounted=borrowed.packet
 var direction:=Vector2.from_angle(angle)
 packet.fields.merge({"x":origin.x+direction.x*10,"y":origin.y+direction.y*10,"vx":direction.x*float(_spec.spd),"vy":direction.y*float(_spec.spd),"dmg":damage,"el":int(bow.get("el",0)),"maxDist":_spec.range,"dist":0,"r":3,"stagger":0,"kb":0,"pierce":0,"pierceMax":0,"normalBow":true,"ghostXbow":true},true)
 _ctx.token=serial
 last_shot=main.admit_native_source_projectile(main.player,packet,_ctx)
 if last_shot.get("accepted",false):
  timer=0;fired+=1
  main.source_resources.commit_native_skill_stamina_spend(main,minf(cost,main.player.stamina))
  if is_instance_valid(pets) and pets.pets.has("xbow"):pets.pets.xbow.ang=angle
  reason=""
 else:
  reason=str(last_shot.get("reason"))
  _admit_blocked=reason.begins_with("field_mob_owner_unported:")
  main.world.retire_native_player_projectile(main,packet,false)
func snapshot() -> Dictionary:
 return {"fired":fired,"hits":hits,"kills":kills,"serial":serial,"timer":timer,"max_tick_us":max_tick_us,"last_shot":last_shot,"last_pass":last_pass,"reason":reason}

func invalidate_equipment() -> void:
 _bow=null
