extends "res://scripts/enemy.gd"
## D-only actor; generic Main HP/poise/field owner API inherited unchanged.
const RECIPE=preload("res://scripts/type3_spawn_recipe.gd")
const HURTE=preload("res://scripts/native_normal_enemy_hurte.gd")
var d_owner: Node
var not_ready: String=""
var slam_t: float=9999
var slam_cd: float=9999
var slime_t: float=9999
var slime_cd: float=9999
var native_ticks:=0
var _last_serial: int=-1
var _base_tex: Texture2D
var _directions: Array=[]
var _textures: Dictionary={}
var _walk_textures: Dictionary={}
var _walk_distance:=0.0
var _col:=0
var _row:=0
func _ready() -> void:
 name=data.id;add_to_group("enemies");collision_layer=4;collision_mask=0
 set_physics_process(false)
 texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
 var seed_value: int=(etype*7+RECIPE._js_int32(global_position.x*31))&0x7fffffff
 _col=(seed_value%40)%8;_row=int((seed_value%40)/8)
 _directions=preload("res://scripts/type3_summoned_actor.gd").DIRECTIONS
 for direction in _directions:
  _textures[direction]=load("res://assets/enemy/atlas_ch1_8dir_"+direction+".png")
  _walk_textures[direction]=load("res://assets/enemy/atlas_ch1_8dir_walk_"+direction+".png")
 _base_tex=_textures[_directions[posmod(roundi(fposmod(facing,TAU)/(PI/4)),8)]]
 var decor:=preload("res://scripts/native_enemy_source_decor.gd").new()
 decor.name="SourceEnemyDecor";add_child(decor);decor.configure(self)
 queue_redraw()
func is_native_registry_ready() -> bool:return is_instance_valid(d_owner) and not_ready.is_empty()
func set_player(value: Node2D) -> void:
 player=value
func _physics_process(_dt: float) -> void:pass
func advance_native_phase(sp: float,_frame: float,_enemies: Array) -> void:
 if not is_instance_valid(d_owner) or not d_owner.current() or not alive or not_ready!="":return
 var serial: int=world.get_native_projectile_fx_context().frame_reset_epoch
 if serial<=_last_serial:return
 _last_serial=serial;native_ticks+=1
 var visual_before: Vector2=global_position
 _moving=false
 var n: Dictionary=data.native_final
 if n.reviveIframes>0:n.reviveIframes=maxf(0,n.reviveIframes-sp)
 _hit_flash=maxf(0,_hit_flash-sp)
 if _frozen>0:_frozen=maxf(0,_frozen-sp);charge_ticks=0;queue_redraw();return
 if _stun_ticks>0:_stun_ticks=maxf(0,_stun_ticks-sp);charge_ticks=0;queue_redraw();return
 if _hit_stun>0:_hit_stun=maxf(0,_hit_stun-sp);queue_redraw();return
 if not _knockback.is_zero_approx():
  var pushed: Vector2=global_position+_knockback*sp
  if world.can_move(pushed,radius):global_position=pushed
  _knockback*=pow(0.85,sp)
 if poise<max_poise:
  _poise_regen+=sp
  if _poise_regen>=200:poise=minf(max_poise,poise+int(max_poise*0.15));_poise_regen=0
 var delta: Vector2=player.global_position-global_position
 var distance: float=delta.length()
 if not alerted and distance<800 and state in ["idle","recover"] and world.has_line_of_sight(global_position,player.global_position):alerted=true
 if alerted and distance<800:facing=delta.angle()
 var reach: int={18:400,19:400,23:800,24:400,25:600}[etype]
 if alerted and state in ["idle","recover"]:
  var per_tick: Vector2=Vector2.ZERO
  if (reach<=400 and distance>30) or (reach>400 and distance>reach*0.85):per_tick=world.get_path_direction(global_position)*float(data.speed_pixels_per_tick)
  elif reach>400 and distance<reach*0.65 and distance>30:per_tick=-delta.normalized()*float(data.speed_pixels_per_tick)*0.5
  var flow_at: Vector2=global_position+per_tick*sp
  if world.can_move(flow_at,radius):global_position=flow_at
  distance=global_position.distance_to(player.global_position)
 if charge_ticks>0:
  charge_ticks-=sp
  if charge_ticks<=0 and not d_owner.fire(self):not_ready="actual_projectile_birth_rejected";return
 if not alerted and distance>400:return
 _contact_ticks-=sp
 if state=="recover":
  if _contact_ticks<=0:state="idle"
  queue_redraw();return
 if state=="eSlamWind":
  if _contact_ticks<=0:
   if distance<70+radius and player.iframes<=0 and player.state!="charge":
    # Existing PC interface owns hurtP/Player knockback; never write Player fields.
    player.receive_damage(int(attack*2*player.get_native_element_multiplier(int(n.el))),"phys",delta.normalized(),10.0)
   for other in world.get_enemies():
    if other!=self and is_instance_valid(other) and other.alive and global_position.distance_to(other.global_position)<70+radius:
     other.add_native_knockback((other.global_position-global_position).normalized()*6)
   state="recover";_contact_ticks=50
  queue_redraw();return
 if etype==19:
  slam_t-=sp
  if slam_t<=0 and distance<80:state="eSlamWind";_contact_ticks=40;slam_t=slam_cd;queue_redraw();return
 if etype==24 and distance<radius+player.radius+8:player.apply_native_freeze_slow(90)
 if etype==25:
  slime_t-=sp
  if slime_t<=0:
   if not d_owner.zone(self):not_ready="iceZone_birth_rejected";return
   slime_t=slime_cd
 # Reuse actual World flow/collision authority; source cached distance before idle.
 var movement: Vector2=Vector2.ZERO
 var speed_value: float=float(data.speed_pixels_per_tick)
 if etype in [23,25]:
  if distance<80:movement=-Vector2.from_angle(facing)*speed_value*0.6
  elif distance>200:movement=Vector2.from_angle(facing)*speed_value*1.2
 else:movement=Vector2.from_angle(facing)*speed_value*1.6
 var at: Vector2=global_position+movement*sp
 if world.can_move(at,radius):global_position=at
 if etype in [18,19] and distance<radius+player.radius+8 and player.iframes<=0 and _contact_ticks<=0:
  player.receive_damage(int(attack*0.8));_contact_ticks=40+int(world.sample_native_random_unit()*20)
 if etype!=24 and charge_ticks<=0:
  _projectile_ticks-=sp
  if _projectile_ticks<=0 and distance<reach:_projectile_ticks=240;charge_ticks=60
 _moving=global_position.distance_squared_to(visual_before)>0
 _walk_distance+=global_position.distance_to(visual_before)
 queue_redraw()
func receive_damage(amount: int,direction: Vector2,source: String,options: Dictionary={}) -> void:
 if not is_instance_valid(d_owner) or not d_owner.current() or not_ready!="" or not alive:return
 var r: Dictionary=HURTE.new().execute(world.get_parent(),world,self,amount,direction.angle(),0,options)
 if r.get("ok")!=true:d_owner.suspend_type(etype,str(r.get("reason","hurtE_NOT_READY")))
 # Do not replay the prefix or bypass a refusal with generic receive_damage.
func apply_native_normal_enemy_death_write() -> Dictionary:
 if etype==25:
  d_owner.suspend_type(etype,"PC_hurtE_42804_death_prefix_required")
  return {"applied":false,"reason":not_ready}
 return super.apply_native_normal_enemy_death_write()
func _update_animation() -> void:queue_redraw()
func _draw() -> void:
 if not alive:return
 var art_facing: float=facing
 if is_instance_valid(player) and player.hp>0 and global_position.distance_squared_to(player.global_position)<640000:
  art_facing=(player.global_position-global_position).angle()
 _base_tex=_textures[_directions[posmod(roundi(fposmod(art_facing,TAU)/(PI/4)),8)]]
 var n: Dictionary=data.native_final
 var sa: float=1.0
 if n.get("_cloaked",false):sa=.08+sin(Time.get_ticks_msec()/300.0)*.05
 elif float(n.get("reviveIframes",0))>0:sa=maxf(0,.2+sin(Time.get_ticks_msec()/40.0)*.5)
 elif _stun_ticks>0:sa=.6
 var bright: float=1.0
 var tint:=Color(bright,bright,bright,sa)
 var size_: float=maxf(radius*7.0,80.0)
 var bounds: Rect2=preload("res://scripts/native_enemy_source_art.gd").screen_rect(self,size_)
 if _base_tex!=null:draw_texture_rect_region(_base_tex,bounds,Rect2(_col*256,_row*256,256,256),tint)
 if _moving:
  var direction: String=_directions[posmod(roundi(fposmod(art_facing,TAU)/(PI/4)),8)]
  var frame: int=int(floor(_walk_distance/128))%4
  draw_texture_rect_region(_walk_textures[direction],bounds,Rect2((_col*4+frame)*256,_row*256,256,256),tint)
 for bar in BAR_LAYOUT.build(radius,float(hp),float(mhp),eShield,eShieldMax,_stun_ticks,data.get("native_final",{}).get("_maxStunned")):draw_rect(bar.rect,Color(bar.color,bar.color.a*sa))

func read_native_normal_enemy_hurte_fields(caller_world: Node) -> Dictionary:
 if not_ready!="" or not is_instance_valid(d_owner) or not d_owner.current():return {"ready":false,"reason":"D_type_suspended:"+not_ready}
 return super.read_native_normal_enemy_hurte_fields(caller_world)

# Source53686-53693: additive snapshot with a 5% hit pop; display only.
func _draw_native_source_hit_flash(canvas: Node2D) -> void:
 if not alive or _hit_flash<=0:return
 var native: Dictionary=data.native_final
 var alpha: float=1.0
 if native.get("_cloaked",false):alpha=.08+sin(Time.get_ticks_msec()/300)*.05
 elif float(native.get("reviveIframes",0))>0:alpha=maxf(0,.2+sin(Time.get_ticks_msec()/40)*.5)
 elif _stun_ticks>0:alpha=.6
 var value: float=minf(1,_hit_flash/6)
 var size_: float=maxf(radius*7,80)*(1+.05*value)
 var rect: Rect2=preload("res://scripts/native_enemy_source_art.gd").screen_rect(self,size_)
 if _base_tex!=null:canvas.draw_texture_rect_region(_base_tex,rect,Rect2(_col*256,_row*256,256,256),Color(1,1,1,value*.8*alpha))
 if _moving:
  var direction_angle: float=(player.global_position-global_position).angle() if is_instance_valid(player) and player.hp>0 and global_position.distance_squared_to(player.global_position)<640000 else facing
  var direction: String=_directions[posmod(roundi(fposmod(direction_angle,TAU)/(PI/4)),8)]
  var frame: int=int(floor(_walk_distance/128))%4
  canvas.draw_texture_rect_region(_walk_textures[direction],rect,Rect2((_col*4+frame)*256,_row*256,256,256),Color(1,1,1,value*.8*alpha))
