extends Node2D
## CH1-04/05/06 independent si1/si2/si3 previews. No extends World, Main/player, enemies, holes or transitions.
const Resources = preload("res://scripts/native_ch1_area_resources.gd")
const USERDIR := "EXODUSER-ch1-04-Isolated-20261020"
@export var preview_active := true
@export var area_stage := 1
var composition_passes: Array=[]
var _analytic_colliders: Array=[]
var _eye_views: Array=[]
var ready_for_fixture := false
var resource_errors: Array = []
var raw: Dictionary = {}
var bundle: Dictionary = {}
var textures: Dictionary = {}
var sprites: Array[Sprite2D] = []
var walls: StaticBody2D
var actor: Node2D
var camera: Camera2D
var fixture_radius := 12.0
var fixture_speed := 280.0 # Preview controls only; no real player resource or movement formula.
var _configured := false

func configure(source: Dictionary, resources: Dictionary) -> void:
 raw = source
 bundle = resources
 _configured = true
 if source.get("stage") in [2,3]:area_stage=int(source.stage)

func _ready() -> void:
 if area_stage not in [1,2,3]:
  resource_errors=["unsupported_area_stage"]
  return
 var isolated_name: String="EXODUSER-ch1-06-Isolated-20261020" if area_stage==3 else "EXODUSER-ch1-05-Isolated-20261020" if area_stage==2 else USERDIR
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != isolated_name or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  resource_errors = ["isolated_userdir_required"]
  return
 if area_stage in [2,3] and not _configured:
  raw=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch1_map_source/si%d.json" % area_stage))
 var result: Dictionary = Resources.new().read_resources(raw,bundle)
 resource_errors = result.errors
 if not result.ready:
  return
 raw = result.raw
 bundle = result.bundle
 textures = result.textures
 _analytic_colliders=bundle.colliders
 if area_stage in [2,3]:
  composition_passes=result.composition.passes
  _analytic_colliders=[]
  for collider in bundle.colliders:
   var decoded: Dictionary=collider.duplicate()
   var bits:=Marshalls.base64_to_raw(collider.f64)
   for i in 6:decoded[["x","y","rx","ry","oy","rotation"][i]]=bits.decode_double(i*8)
   _analytic_colliders.append(decoded)
 _install_ground()
 _install_walls()
 _install_props()
 actor = Node2D.new()
 actor.name = "FixtureActor"
 actor.position = Vector2(raw.start_world[0],raw.start_world[1])
 var marker := Polygon2D.new()
 marker.polygon = PackedVector2Array([Vector2(0,-16),Vector2(11,0),Vector2(0,16),Vector2(-11,0)])
 marker.color = Color("e0cda9")
 actor.add_child(marker)
 actor.z_index = 0
 get_node("PropLayer0").add_child(actor)
 camera = Camera2D.new()
 camera.position_smoothing_enabled = false
 camera.enabled = preview_active
 camera.zoom = Vector2.ONE
 actor.add_child(camera)
 if area_stage in [2,3]:_update_stage2_eyes()
 ready_for_fixture = true
 set_process(preview_active)

func _install_ground() -> void:
 if area_stage==1:_install_stage1_vista()
 _install_floor()

func _install_stage1_vista() -> void:
 var vista_texture: Texture2D = textures[bundle.vista.texture]
 var vista := Sprite2D.new()
 vista.name = "Vista"
 vista.texture = vista_texture
 vista.position = Vector2(4000,4000)
 var fit: float = 14400.0/minf(vista_texture.get_width(),vista_texture.get_height())
 vista.scale = Vector2(fit,fit)
 vista.z_index = -10
 add_child(vista)

func _install_floor() -> void:
 var floor_texture: Texture2D = textures[bundle.floor.texture]
 var floor_view := Polygon2D.new()
 floor_view.name = "SourceFloor"
 floor_view.polygon = PackedVector2Array([Vector2.ZERO,Vector2(8000,0),Vector2(8000,8000),Vector2(0,8000)])
 floor_view.uv = floor_view.polygon
 floor_view.texture = floor_texture
 floor_view.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
 floor_view.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
 var mask := Image.create_from_data(200,200,false,Image.FORMAT_L8,PackedByteArray(bundle.floor.alpha))
 var shader := Shader.new()
 shader.code = "shader_type canvas_item;\nuniform sampler2D floor_mask: filter_linear, repeat_disable;\nvarying vec2 map_uv;\nvoid vertex(){map_uv=VERTEX/8000.0;}\nvoid fragment(){vec4 c=texture(TEXTURE,UV);COLOR=vec4(c.rgb,c.a*texture(floor_mask,map_uv).r);}\n"
 var material := ShaderMaterial.new()
 material.shader = shader
 material.set_shader_parameter("floor_mask",ImageTexture.create_from_image(mask))
 floor_view.material = material
 floor_view.z_index = -5
 add_child(floor_view)
 # Exit markers are destinations only; no gate-open/stage-cleared writes.
 for e in raw.exits:
  var light := Polygon2D.new()
  light.polygon = PackedVector2Array([Vector2(-19,-19),Vector2(19,-19),Vector2(19,19),Vector2(-19,19)])
  light.position = Vector2((e.x+.5)*40,(e.y+.5)*40)
  light.color = Color(.55,.31,.12,.65)
  light.z_index = -1
  add_child(light)

func _install_walls() -> void:
 walls = StaticBody2D.new()
 walls.name = "ExactTile1Union"
 walls.collision_layer = 1
 walls.collision_mask = 0
 add_child(walls)
 for r in bundle.wall_rects:
  var shape := RectangleShape2D.new()
  shape.size = Vector2(r[2]*40,r[3]*40)
  var node := CollisionShape2D.new()
  node.shape = shape
  node.position = Vector2((r[0]+r[2]*.5)*40,(r[1]+r[3]*.5)*40)
  walls.add_child(node)
 # Props use exact source analytic ellipses/circles below, not polygon approximations.

func _install_props() -> void:
 if area_stage in [2,3]:
  _install_stage2_props()
  return
 var layers: Dictionary = {}
 for p in bundle.props:
  var layer: int = int(p.get("metadata",{}).get("_renderLayer") if p.get("metadata",{}).get("_renderLayer") != null else 0)
  if not layers.has(layer):
   var group := Node2D.new()
   group.name = "PropLayer"+str(layer)
   group.y_sort_enabled = true
   group.z_index = layer
   add_child(group)
   layers[layer] = group
  if p.get("type") == "lore":
   var stone := Polygon2D.new()
   stone.name = "LoreMarker"
   stone.position = Vector2(p.x,p.y)
   stone.polygon = PackedVector2Array([Vector2(-11,9),Vector2(-10,-17),Vector2(5,-21),Vector2(12,-8),Vector2(12,9)])
   stone.color = Color("756959")
   layers[layer].add_child(stone)
   continue
  var sprite := Sprite2D.new()
  sprite.name = p.type+"_"+str(sprites.size())
  sprite.texture = textures[p.texture]
  sprite.centered = false
  sprite.position = Vector2(p.x,p.y)
  var size := sprite.texture.get_size()
  sprite.offset = Vector2(-size.x*p.pivot[0],-size.y*p.pivot[1])
  sprite.scale = Vector2(p.draw_size[0]/size.x,p.draw_size[1]/size.y)
  sprite.rotation = deg_to_rad(float(p.rotation))
  sprite.flip_h = p.flip_h
  layers[layer].add_child(sprite)
  sprites.append(sprite)

func is_wall_xy(px: float, py: float) -> bool:
 # JS ~~ truncates toward zero, including the source's -40<coord<0 behavior.
 var tx := int(px/40.0)
 var ty := int(py/40.0)
 if tx < 0 or ty < 0 or tx >= 200 or ty >= 200:
  return true
 if int(raw.tiles[ty*200+tx]) == 1:
  return true
 for c in _analytic_colliders:
  var dx: float = px-float(c.x)
  var dy: float = py-float(c.y)-float(c.oy)
  var rx: float = c.rx
  var ry: float = c.ry
  var blocked := false
  if c.shape == "rect":
   var angle: float=c.rotation
   var local_x:=dx*cos(angle)+dy*sin(angle)
   var local_y:=-dx*sin(angle)+dy*cos(angle)
   blocked=absf(local_x)<rx and absf(local_y)<ry
  elif c.shape == "circle":
   blocked = dx*dx+dy*dy < rx*rx
  else:
   blocked = dx*dx/(rx*rx)+dy*dy/(ry*ry) < 1.0
  if blocked:
   return true
 return false

func can_move_xy(x: float, y: float, r: float) -> bool:
 return not is_wall_xy(x-r,y-r) and not is_wall_xy(x+r,y-r) and not is_wall_xy(x-r,y+r) and not is_wall_xy(x+r,y+r)

func has_los_xy(x1: float,y1: float,x2: float,y2: float) -> bool:
 var dx := x2-x1
 var dy := y2-y1
 var steps := maxi(1,int(sqrt(dx*dx+dy*dy)/16.0))
 for i in range(1,steps):
  var t := float(i)/steps
  if is_wall_xy(x1+dx*t,y1+dy*t):
   return false
 return true

func move_fixture_to(target: Vector2) -> bool:
 # Swept four-corner samples prevent teleporting across a source wall/prop.
 var delta := target-actor.position
 var count := maxi(1,int(ceil(delta.length()/4.0)))
 for i in range(1,count+1):
  var p := actor.position+delta*(float(i)/count)
  if not can_move_xy(p.x,p.y,fixture_radius):
   return false
 actor.position = target
 if area_stage in [2,3]:_update_stage2_eyes()
 return true

func route_to_exit() -> Array[Vector2]:
 var start := int(raw.start_tile[1])*200+int(raw.start_tile[0])
 var goal := int(raw.exit_center_tile[1])*200+int(raw.exit_center_tile[0])
 var previous := PackedInt32Array()
 previous.resize(40000)
 previous.fill(-1)
 previous[start] = start
 var queue := PackedInt32Array([start])
 var head := 0
 while head < queue.size():
  var cell := queue[head]
  head += 1
  if cell == goal:
   break
  var x := cell%200
  var y := int(cell/200)
  for offset in [Vector2i(0,-1),Vector2i(-1,0),Vector2i(1,0),Vector2i(0,1)]:
   var nx: int = x+offset.x
   var ny: int = y+offset.y
   if nx<0 or nx>=200 or ny<0 or ny>=200:
    continue
   var next := ny*200+nx
   if previous[next] != -1:
    continue
   var clear := true
   for step in range(1,11):
    var px: float = (x+.5)*40+offset.x*4*step
    var py: float = (y+.5)*40+offset.y*4*step
    if not can_move_xy(px,py,fixture_radius):
     clear = false
     break
   if clear:
    previous[next] = cell
    queue.append(next)
 if previous[goal] == -1:
  return []
 var result: Array[Vector2] = []
 var at := goal
 while at != start:
  result.push_front(Vector2((at%200+.5)*40,(int(at/200)+.5)*40))
  at = previous[at]
 result.push_front(Vector2(raw.start_world[0],raw.start_world[1]))
 return result

func _process(delta: float) -> void:
 if not ready_for_fixture:
  return
 var direction := Vector2(float(Input.is_physical_key_pressed(KEY_D) or Input.is_physical_key_pressed(KEY_RIGHT))-float(Input.is_physical_key_pressed(KEY_A) or Input.is_physical_key_pressed(KEY_LEFT)),float(Input.is_physical_key_pressed(KEY_S) or Input.is_physical_key_pressed(KEY_DOWN))-float(Input.is_physical_key_pressed(KEY_W) or Input.is_physical_key_pressed(KEY_UP)))
 if direction.length_squared() > 0:
  var next := actor.position+direction.normalized()*fixture_speed*delta
  if not move_fixture_to(next):
   move_fixture_to(Vector2(next.x,actor.position.y))
   move_fixture_to(Vector2(actor.position.x,next.y))

func _install_stage2_props() -> void:
 var group:=Node2D.new()
 group.name="PropLayer0"
 group.y_sort_enabled=true
 add_child(group)
 var materials: Dictionary={}
 for p in bundle.props:
  if p.retired or p.view=="invisible_system_collider":continue
  var sprite:=Sprite2D.new()
  sprite.name=p.type+"_"+str(p.source_index)
  sprite.set_meta("source_index",p.source_index)
  sprite.set_meta("source_type",p.type)
  var texture: Texture2D=textures[p.texture]
  if p.has("atlas"):
   var atlas:=AtlasTexture.new()
   atlas.atlas=texture
   atlas.region=Rect2(0,0,40,40)
   texture=atlas
   _eye_views.append({"sprite":sprite,"atlas":atlas,"source":p})
  sprite.texture=texture
  sprite.centered=false
  sprite.position=Vector2(p.x,p.y)
  var size:=texture.get_size()
  sprite.offset=Vector2(-size.x*p.pivot[0],-size.y if p.anchor_bottom else -size.y*p.pivot[1])
  sprite.scale=Vector2(p.draw_size[0]/size.x,p.draw_size[1]/size.y)
  sprite.rotation=deg_to_rad(float(p.rotation))
  sprite.flip_h=p.flip_h
  var key: String="hard" if p.hard_alpha else "magenta" if p.magenta_key else ""
  if not key.is_empty():
   if not materials.has(key):
    var shader:=Shader.new()
    # Source _hardAlphaSpr/_keyMagentaSpr run on image pixels BEFORE sampling.
    # Fetch and key each texel, then interpolate premultiplied colors for the native view.
    shader.code="shader_type canvas_item;\nvec4 source_pixel(sampler2D src,ivec2 p){vec4 c=texelFetch(src,clamp(p,ivec2(0),textureSize(src,0)-ivec2(1)),0);"
    if key=="hard":shader.code+="if(c.a<1.0)c.a=0.0;"
    else:shader.code+="if(c.r>200.0/255.0&&c.b>200.0/255.0&&c.g<90.0/255.0)c.a=0.0;else if(c.r>150.0/255.0&&c.b>150.0/255.0&&c.g<120.0/255.0&&(c.r-c.g)>50.0/255.0)c.a=floor(c.a*255.0*0.12)/255.0;"
    shader.code+="c.rgb*=c.a;return c;}\nvoid fragment(){vec2 p=UV*vec2(textureSize(TEXTURE,0))-vec2(0.5);ivec2 b=ivec2(floor(p));vec2 f=fract(p);vec4 c=mix(mix(source_pixel(TEXTURE,b),source_pixel(TEXTURE,b+ivec2(1,0)),f.x),mix(source_pixel(TEXTURE,b+ivec2(0,1)),source_pixel(TEXTURE,b+ivec2(1,1)),f.x),f.y);if(c.a>0.0)c.rgb/=c.a;COLOR=c;}"
    var material:=ShaderMaterial.new()
    material.shader=shader
    materials[key]=material
   sprite.material=materials[key]
  group.add_child(sprite)
  sprites.append(sprite)

func _update_stage2_eyes() -> void:
 if actor==null:return
 for view in _eye_views:
  var source: Dictionary=view.source
  var dx: float=actor.position.x-float(source.x)
  var dy: float=actor.position.y-float(source.y)
  var frame:=0
  if dx*dx+dy*dy>1600.0:
   var index:=int(((atan2(dy,dx)+PI)/TAU)*8.0+.5)%8
   frame=[3,4,5,6,7,8,1,2][index]
  view.atlas.region=Rect2(frame*40,0,40,40)
