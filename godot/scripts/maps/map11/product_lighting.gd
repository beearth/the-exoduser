extends "res://scripts/native_map_look.gd"
## MAP11-only presentation adapter. NativeMapLook creates lights, radial gradients and
## silhouette materials; authoritative actors/geometry and original textures stay intact.
var scene: Node2D
var pools: Array[Dictionary]=[]
var _camera: Camera2D
var _fog_material: ShaderMaterial
var _contact_texture: Texture2D
var _unlit: CanvasItemMaterial
var _backdrop: ColorRect

func configure_product(product: Node2D,main: Node) -> void:
 scene=product;_player=main.player;_camera=main.camera
 _light_texture=_make_radial_texture(256,[0.0,.35,.7,1.0],[1.0,.62,.2,0.0])
 _contact_texture=_make_radial_texture(128,[0.0,.28,.65,1.0],[1.0,.85,.30,0.0])
 _unlit=CanvasItemMaterial.new();_unlit.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
 _ambient=CanvasModulate.new();_ambient.name="MAP11Ambient";add_child(_ambient)
 _ambient.color=Color(.46,.49,.55)
 _player_light=_make_light("PlayerKey",{"color":[1.0,.92,.80],"radius":165,"energy":.68,"height_ratio":.8})
 _pool("Heart",Vector2(-250,-2440),"field",680,Color(1.0,.24,.085),.95,.035)
 _pool("GateLeft",Vector2(-150,-4050),"field",410,Color(1.0,.37,.12),.80,.035)
 _pool("GateRight",Vector2(180,-4090),"field",390,Color(1.0,.27,.09),.72,.035)
 _pool("WestTissue",Vector2(-3450,-1250),"field",440,Color(.85,.18,.10),.58,.05)
 _pool("EastTissue",Vector2(1850,-2000),"field",380,Color(.85,.20,.09),.5,.05)
 var offset: Vector2=scene.arena_view.global_position
 _pool("ArenaEntry",offset+Vector2(0,1120),"arena",620,Color(1.0,.32,.10),.72,.035)
 _pool("ArenaHeart",offset+Vector2(0,-1740),"arena",730,Color(1.0,.17,.085),.88,.045)
 _pool("ArenaTissue",offset+Vector2(1550,-450),"arena",500,Color(.90,.19,.08),.56,.045)
 _pool("WestDeepA",Vector2(-3610,-1510),"field",260,Color(.85,.12,.065),.32,.035)
 _pool("WestDeepB",Vector2(-3900,-660),"field",230,Color(.80,.10,.055),.28,.035)
 _mount_actor_readability(main)
 _mount_contacts()
 _mount_gate_recess()
 # The screen-space GL fog/env wash destroys local contrast; MAP11 uses a
 # world-space edge mask on the same cached FBM pass, plus back-tree depth tint.
 var screen: Node=main.get_node("NativeScreenLighting")
 screen.set_native_lightmap_enabled(false)
 for id in ["NativeFog2D","NativeEnvLight","NativeVignette"]:
  var item: CanvasItem=screen.get_node(id)
  item.hide()
 _fog_material=screen.get_node("NativeFogGL").material
 var shader_:=Shader.new();shader_.code=FOG_SHADER
 _fog_material.shader=shader_
 _fog_material.set_shader_parameter("fbm_cache",preload("res://assets/maps/map11/fog_fbm_filtered.png"))
 var layer_:=CanvasLayer.new();layer_.layer=4;add_child(layer_)
 _backdrop=ColorRect.new();_backdrop.mouse_filter=Control.MOUSE_FILTER_IGNORE
 _backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var material_:=ShaderMaterial.new();material_.shader=preload("res://scripts/maps/map11/arena_vignette.gdshader")
 _backdrop.material=material_;layer_.add_child(_backdrop)
 process_priority=50;set_process(true)
 _process(0.0)

func _pool(id: String,point: Vector2,space: String,radius: float,tint: Color,energy_: float,pulse: float) -> void:
 var light:=_make_light(id,{"color":[tint.r,tint.g,tint.b],"radius":radius,"energy":energy_,"height_ratio":.8})
 if id in ["WestTissue","EastTissue"]:
  var nearest: float=INF
  var target: Vector2=point
  for row in scene.field_view._forest_rows:
   if row.layer!="FRONT":continue
   var distance_: float=row.foot.distance_squared_to(target)
   if distance_<nearest:
    nearest=distance_
    var sprite: Sprite2D=row.node.get_child(0)
    point=row.foot+Vector2(0,-sprite.texture.get_height()*absf(sprite.scale.y)*.28)
 light.global_position=point
 pools.append({"node":light,"space":space,"radius":radius,"energy":energy_,"pulse":pulse,"phase":point.x*.0137+point.y*.0091})

func _mount_actor_readability(main: Node) -> void:
 var shader_:=Shader.new();shader_.code=ACTOR_SHADER
 var material_:=ShaderMaterial.new();material_.shader=shader_
 material_.set_shader_parameter("exposure",1.6)
 material_.set_shader_parameter("rim",.22)
 if main.player._sprite.material==null:main.player._sprite.material=material_
 for actor in main.world.get_enemies():_bind_enemy(actor)
 main.world.child_entered_tree.connect(_on_actor_entered)

func _on_actor_entered(actor: Node) -> void:
 if actor is ExoduserEnemy:_bind_enemy.call_deferred(actor)

func _bind_enemy(actor: Node) -> void:
 if not is_instance_valid(actor):return
 var sprite: CanvasItem=actor.get("_body")
 if not is_instance_valid(sprite) or sprite.material!=null:return
 var shader_:=Shader.new();shader_.code=ACTOR_SHADER
 var material_:=ShaderMaterial.new();material_.shader=shader_
 material_.set_shader_parameter("exposure",1.2);material_.set_shader_parameter("rim",.08)
 sprite.material=material_

const ACTOR_SHADER="""
shader_type canvas_item;
render_mode unshaded;
uniform float exposure=.7;
uniform float rim=.1;
void fragment(){
 vec4 source=texture(TEXTURE,UV)*COLOR;
 vec2 d=TEXTURE_PIXEL_SIZE;
 float edge=1.0-min(texture(TEXTURE,UV+vec2(d.x,0)).a,texture(TEXTURE,UV+vec2(0,d.y)).a);
 COLOR=vec4(source.rgb*exposure+vec3(.92,.87,.80)*edge*rim,source.a);
}
"""

func _mount_contacts() -> void:
 # Setup enumeration only. Shadows stay on the ground plane, independent of
 # per-tree occlusion fade; dark recesses do not turn into huge black ellipses.
 for row in scene.field_view._rows:
  var root_: Node2D=row.node
  for child in root_.get_children():
   if child is Sprite2D and child.z_index==-1:child.hide()
  var sprite: Sprite2D=root_.get_child(0)
  var width: float=sprite.texture.get_width()*absf(sprite.scale.x)
  _contact(scene.field_view,row.foot,Vector2(clampf(width*.52,80,500),clampf(width*.095,24,100)),-2990,.78)
  if root_.name.begins_with("D01") or root_.name=="GateBoneFrame":
   _projection(scene.field_view,sprite,row.foot,root_.z_index-1)
 for row in scene.arena_view._rim_sprites:
  var sprite: Sprite2D=row.sprite
  var width: float=sprite.texture.get_width()*absf(sprite.scale.x)
  _contact(scene.arena_view,sprite.position,Vector2(clampf(width*.48,90,480),clampf(width*.085,24,96)),-440,.8)
 for id in ["NorthHeartAltar","EntryArch_VisualOnly","ClearArch_VisualOnly"]:
  var sprite: Sprite2D=scene.arena_view.get_node(id)
  _contact(scene.arena_view,sprite.position,Vector2(240,60),-440,.82)
  _projection(scene.arena_view,sprite,sprite.position,-439)
 _contact(_player,Vector2(0,4),Vector2(62,20),-1,.75)

func _mount_gate_recess() -> void:
 # Ground-only shadow: below gate/trees/actors, never a screen-space black mask.
 var shadow:=Polygon2D.new();shadow.name="GateRecessShadow"
 shadow.polygon=PackedVector2Array([Vector2(-2500,-5500),Vector2(2500,-5500),Vector2(2500,-3850),Vector2(-2500,-3850)])
 shadow.z_index=-2989
 var shader_:=Shader.new();shader_.code="""
shader_type canvas_item;
render_mode unshaded;
varying vec2 p;
void vertex(){p=VERTEX;}
void fragment(){
 float north=1.0-smoothstep(-4180.0,-3890.0,p.y+28.0*sin(p.x*.009)+16.0*sin(p.x*.023));
 float side=1.0-smoothstep(1500.0,2450.0,abs(p.x));
 COLOR=vec4(.018,.012,.016,north*side*.98);
}
"""
 var material_:=ShaderMaterial.new();material_.shader=shader_;shadow.material=material_
 scene.field_view.add_child(shadow)

func _contact(parent: Node2D,foot: Vector2,size_: Vector2,z: int,alpha: float) -> void:
 var shadow:=Sprite2D.new();shadow.name="LightContactAO";shadow.texture=_contact_texture
 shadow.position=foot+Vector2(0,8);shadow.scale=size_/128.0;shadow.modulate=Color(0,0,0,alpha)
 shadow.z_index=z;shadow.material=_unlit;parent.add_child(shadow)

func _projection(parent: Node2D,source_: Sprite2D,foot: Vector2,z: int) -> void:
 var shadow:=Sprite2D.new();shadow.name="LightProjectedSilhouette";shadow.texture=source_.texture
 shadow.centered=false;shadow.offset=source_.offset;shadow.flip_h=source_.flip_h
 shadow.scale=Vector2(source_.scale.x,-source_.scale.y*.24);shadow.skew=deg_to_rad(-32)
 shadow.position=foot+Vector2(15,8);shadow.z_index=z
 shadow.material=_silhouette_material(Color(.005,.008,.014,.42),4.0);parent.add_child(shadow)

func _process(delta: float) -> void:
 if not is_instance_valid(_player):return
 _time+=delta
 var arena: bool=scene.active_space=="arena"
 var approach: float=1.0 if arena else smoothstep(-2600.0,-4100.0,_player.global_position.y)
 _ambient.color=Color(.46,.49,.55).lerp(Color(.52,.42,.43),approach*.75)
 _player_light.global_position=_player.global_position+Vector2(0,-36)
 var size_: Vector2=get_viewport_rect().size/_camera.zoom
 var center: Vector2=_camera.get_screen_center_position()
 var view:=Rect2(center-size_*.5,size_).grow(100)
 var admitted: int=0
 for row in pools:
  var light: PointLight2D=row.node
  var radius: float=row.radius
  light.visible=row.space==scene.active_space and view.intersects(Rect2(light.global_position-Vector2.ONE*radius,Vector2.ONE*radius*2.0)) and admitted<4
  if light.visible:
   admitted+=1;light.energy=row.energy*(1.0+row.pulse*sin(_time*2.1+row.phase))
 _fog_material.set_shader_parameter("view_origin",center-size_*.5)
 _fog_material.set_shader_parameter("view_size",size_)
 _fog_material.set_shader_parameter("arena",arena)
 _fog_material.set_shader_parameter("arena_origin",scene.arena_view.global_position)

const FOG_SHADER="""
shader_type canvas_item;
render_mode unshaded;
uniform sampler2D fbm_cache: repeat_enable, filter_linear;
uniform vec2 view_origin;
uniform vec2 view_size;
uniform bool arena=false;
uniform vec2 arena_origin;
void fragment(){
 vec2 p=view_origin+UV*view_size;
 float side=smoothstep(1800.0,3000.0,abs(p.x));
 float north=smoothstep(3900.0,4700.0,-p.y)*(1.0-smoothstep(500.0,1000.0,abs(p.x)));
 float depth=max(side,north);
 if(arena){depth=smoothstep(1650.0,2450.0,length(p-arena_origin));}
 float f=texture(fbm_cache,p/11000.0+vec2(TIME*.0015,0.0)).r;
 COLOR=vec4(.12,.17,.23,depth*(.045+.065*f));
}
"""
