extends Node2D
## Source game.html 11612-11762,18133-18169,18501-18574,35722-35741.
var _main: Node
var _actor: Node2D
var _camera: Camera2D
var _look:=Vector2.ZERO
var _ghost: Sprite2D
var _point: Sprite2D
var _gate: Sprite2D
var _portal: Sprite2D
var _portal_core: Sprite2D
var _red: Texture2D
var _blue: Texture2D
var _props: Array[Dictionary]=[]
var _chunks: Array[Sprite2D]=[]
var _trees: Array[ShaderMaterial]=[]
var _features: Array[Node2D]=[]
var _hand_trees: Dictionary={}
var _living: Node2D
var _data: Dictionary
func _ready() -> void:
 _data=JSON.parse_string(FileAccess.get_file_as_string("res://data/map.json"))
 for row in _data.chunks:
  var sprite:=Sprite2D.new();sprite.texture=load(row.texture);sprite.region_enabled=true
  sprite.region_rect=Rect2(1,1,1024,1024);sprite.centered=false;sprite.scale=Vector2.ONE*(1000.0/1024)
  sprite.position=Vector2(row.x*1000,row.y*1000);sprite.z_index=-3000
  sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(sprite);_chunks.append(sprite)
 # Source ch1-forest-sway.js:10-41,67-98; prebuilt original 64x64 mask.
 for y in range(8):
  for x in range(8):
   var path: String="res://assets/map/web_parity/sway_%d_%d.png"%[x,y]
   if not FileAccess.file_exists(path):continue
   var sprite:=Sprite2D.new();sprite.texture=load(path);sprite.centered=false;sprite.scale=Vector2.ONE*(1000.0/1024)
   sprite.position=Vector2(x*1000,y*1000);sprite.z_index=-2950;sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
   var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/web_sway.gdshader")
   mat.set_shader_parameter("world_x",float(x*1000));mat.set_shader_parameter("world_y",float(y*1000));sprite.material=mat;_trees.append(mat);add_child(sprite)
 # Source ch1-rot-trees.js:14-426, exported by the original browser builder.
 var trees: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://assets/map/web_parity/trees.json"))
 for tree in trees.trees:
  var sprite:=Sprite2D.new();sprite.texture=load(tree.texture);sprite.centered=false
  sprite.position=Vector2(tree.x,tree.y);sprite.scale=Vector2.ONE*tree.k;sprite.z_index=-2900 if tree.baked else -100
  sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
  var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/web_tree.gdshader")
  mat.set_shader_parameter("world_x",float(tree.x));mat.set_shader_parameter("world_h",float(tree.h))
  mat.set_shader_parameter("phase",float(tree.phase));mat.set_shader_parameter("phase2",float(tree.phase2))
  mat.set_shader_parameter("anchor_fraction",(float(tree.anchorY)-float(tree.y))/float(tree.h))
  sprite.material=mat;_trees.append(mat);add_child(sprite)
  var features:=preload("res://scripts/maps/map11/web_tree_features.gd").new();sprite.add_child(features);features.configure(tree);_features.append(features)
  if not tree.baked:_hand_trees[Vector2(tree.x+tree.w/2,tree.y+tree.h/2)]=sprite
 for y in range(8):
  for x in range(8):
   var sprite:=Sprite2D.new();sprite.texture=load("res://assets/map/web_parity/edge_%d_%d.png"%[x,y])
   sprite.centered=false;sprite.position=Vector2(x*1000,y*1000);sprite.z_index=-2800;add_child(sprite)
 _living=preload("res://scripts/maps/map11/web_living.gd").new();add_child(_living)
 # game.html 18245-18262,18349-18361,52027-52045: original gate and tinted portal.
 _gate=Sprite2D.new();_gate.texture=load("res://assets/map/web_parity/gate.png");_gate.position=Vector2(4020,220)
 _gate.scale=Vector2(600.0/_gate.texture.get_width(),float(int(600.0*_gate.texture.get_height()/_gate.texture.get_width()))/_gate.texture.get_height());_gate.z_index=-2600;_gate.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(_gate)
 _red=load("res://assets/map/web_parity/portal_red.png");_blue=load("res://assets/map/web_parity/portal_blue.png")
 _portal=Sprite2D.new();_portal.texture=_red;_portal.position=Vector2(4020,300);_portal.z_index=-2599;_portal.modulate.a=.9;_portal.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(_portal)
 _portal_core=Sprite2D.new();_portal_core.texture=_red;_portal_core.position=_portal.position;_portal_core.z_index=-2598;_portal_core.modulate.a=.45;_portal_core.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(_portal_core)
 for row in _data.props:
  var sprite:=Sprite2D.new();sprite.texture=load(row.texture)
  if sprite.texture==null:continue
  var size:=Vector2(row.draw_size[0],row.draw_size[1]);var pivot:=Vector2(row.pivot[0],row.pivot[1])
  sprite.centered=false;sprite.scale=size/sprite.texture.get_size();sprite.offset=-sprite.texture.get_size()*pivot
  sprite.position=Vector2(row.position[0],row.position[1]);sprite.rotation_degrees=row.rotation_degrees
  sprite.flip_h=row.flip_h;sprite.modulate.a=row.alpha;sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
  if row.id=="m_c1tree":
   var tone:=ShaderMaterial.new();tone.shader=preload("res://scripts/maps/map11/web_prop_tone.gdshader");sprite.material=tone
  sprite.z_as_relative=false;sprite.z_index=-2500 if row.ground else int(sprite.position.y/4)
  if _hand_trees.has(sprite.position):
   var processed: Sprite2D=_hand_trees[sprite.position]
   processed.position=sprite.position;processed.offset=-processed.texture.get_size()*.5
   processed.get_child(0).position=processed.offset
   sprite.free();sprite=processed
  else:add_child(sprite)
  var occ: bool=str(row.id).begins_with("m_ctree") or row.id=="m_c1tree"
  _props.append({"sprite":sprite,"row":row,"occ":occ,"s":float(row.metadata.sz)*float(size.x/float(row.metadata.sz)) if not row.metadata.get("keepAR",false) else float(row.metadata.sz),"alpha":1.0})
func configure(main: Node) -> void:
 _main=main;_actor=main.player;_camera=main.camera
 # Source 25500: createRadialGradient(320,320,0,320,320,320), additive.
 _point=Sprite2D.new()
 var gradient:=Gradient.new();gradient.offsets=PackedFloat32Array([0,.4,1]);gradient.colors=PackedColorArray([Color(1,190.0/255,90.0/255,.28),Color(220.0/255,120.0/255,40.0/255,.13),Color(0,0,0,0)])
 var stamp:=GradientTexture2D.new();stamp.width=640;stamp.height=640;stamp.gradient=gradient;stamp.fill=GradientTexture2D.FILL_RADIAL;stamp.fill_from=Vector2(.5,.5);stamp.fill_to=Vector2(1,.5)
 _point.texture=stamp
 var light_mat:=CanvasItemMaterial.new();light_mat.blend_mode=CanvasItemMaterial.BLEND_MODE_ADD;_point.material=light_mat;_point.z_index=-2700;add_child(_point)
 _camera.zoom=Vector2.ONE;_camera.offset=Vector2.ZERO;_camera.position_smoothing_enabled=false
 _camera.limit_left=-20000;_camera.limit_top=-20000;_camera.limit_right=20000;_camera.limit_bottom=20000
 _camera.global_position=_actor.global_position
 _ghost=Sprite2D.new();_ghost.centered=false;_ghost.z_as_relative=false;_ghost.z_index=4090;_ghost.modulate.a=.55;_ghost.texture_filter=CanvasItem.TEXTURE_FILTER_NEAREST;add_child(_ghost);_ghost.hide()
 var layer:=CanvasLayer.new();layer.layer=4;add_child(layer)
 var rect:=ColorRect.new();rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);rect.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/web_grade.gdshader");rect.material=mat;layer.add_child(rect)
func update_product(point: Vector2,delta: float) -> void:
 if not is_instance_valid(_camera):return
 _point.global_position=point
 # Source 35722: P.vx/P.vy are displacement per source tick, not pixels/second.
 var ticks: float=delta*60
 _camera.zoom=_camera.zoom.lerp(Vector2.ONE,1-pow(.94,ticks))
 render_at(float(Time.get_ticks_msec()))
 _look=_look.lerp(_actor.velocity/60*25,1-pow(.9,ticks))
 var damping: float=.85 if _actor.state=="dodge" else (.95 if _actor.state in ["attack","windup","swing","recover"] else .92)
 var p: Vector2=_camera.global_position.lerp(point+_look,1-pow(damping,ticks))
 var half:=get_viewport_rect().size*.5/_camera.zoom
 _camera.global_position=Vector2(clampf(float(int(p.x)),half.x,8000-half.x),clampf(float(int(p.y)),half.y,8000-half.y))
 var hit: bool=false
 for entry in _props:
  if not entry.occ:continue
  var sprite: Sprite2D=entry.sprite
  var s: float=entry.s;var row: Dictionary=entry.row
  if str(row.id).begins_with("m_ctree"):s=float(row.draw_size[0])
  var foot: float=sprite.position.y+s*(-.058 if row.id=="m_c1tree" else .45)
  var ring: bool=row.id in ["m_ctree15","m_ctree18"] and absf(point.x-sprite.position.x)<s*.15 and point.y>sprite.position.y-s*.33 and point.y<sprite.position.y+s*.27
  var front: bool=foot>point.y and not ring
  var os: float=s*(.72 if row.id=="m_c1tree" else 1.0)
  var overlap: bool=point.x+40>sprite.position.x-os*.5 and point.x-40<sprite.position.x+os*.5 and point.y+28>foot-os and point.y-96<foot
  if front and overlap:hit=true
  entry.alpha=lerpf(entry.alpha,.62 if front and overlap else 1.0,1-pow(1-.22,ticks))
  sprite.modulate.a=entry.alpha;sprite.z_index=3000+int(foot/8000*900) if front else -100
 if is_instance_valid(_ghost):
  _ghost.visible=hit and _actor.hp>0
  if hit:
   var source: AnimatedSprite2D=_actor._sprite
   _ghost.texture=source.sprite_frames.get_frame_texture(source.animation,source.frame)
   _ghost.global_transform=source.global_transform;_ghost.offset=source.offset;_ghost.flip_h=source.flip_h
func render_at(now: float) -> void:
 if is_instance_valid(_living):_living.render_at(now)
 if is_instance_valid(_portal):
  var unlocked: bool=is_instance_valid(_main) and _main.source_state.read_current_g().get("_bossUnlocked",false)
  var alive: bool=not is_instance_valid(_main) or _main.source_state.read_current_g().get("bossAlive",true)
  _gate.visible=alive;_portal.visible=alive;_portal_core.visible=alive
  var tex: Texture2D=_blue if unlocked else _red
  _portal.texture=tex;_portal_core.texture=tex
  var pulse: float=250+sin(now/400)*250*.12
  _portal.scale=Vector2.ONE*pulse/tex.get_width();_portal_core.scale=_portal.scale*.55
  _portal.rotation=now/2000;_portal_core.rotation=now/2000-now/800
 for mat in _trees:mat.set_shader_parameter("clock_ms",now)
 for feature in _features:
  if not is_instance_valid(_camera):continue
  var t: Dictionary=feature.tree
  var half:=get_viewport_rect().size*.5+Vector2(24,24)
  var view:=Rect2(_camera.get_screen_center_position()-half,half*2)
  if view.intersects(Rect2(t.x,t.y,t.w,t.h)):feature.render_at(now)
