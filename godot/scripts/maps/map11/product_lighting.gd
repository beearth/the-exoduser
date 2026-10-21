extends "res://scripts/native_map_look.gd"
## MAP11-only presentation adapter. NativeMapLook creates lights, radial gradients and
## silhouette materials; authoritative actors/geometry and original textures stay intact.
const GroundContact=preload("res://scripts/maps/map11/ground_contact.gd")
var scene: Node2D
var pools: Array[Dictionary]=[]
var _camera: Camera2D
var _fog_material: ShaderMaterial
var _contact_texture: Texture2D
var _unlit: CanvasItemMaterial
var _backdrop: ColorRect
var _rim_player: CanvasItem
var _rim_arena: bool=false

func configure_product(product: Node2D,main: Node) -> void:
 scene=product;_player=main.player;_camera=main.camera
 _rim_player=_player.get("_sprite")
 _light_texture=_make_radial_texture(256,[0.0,.35,.7,1.0],[1.0,.62,.2,0.0])
 _contact_texture=_make_radial_texture(128,[0.0,.28,.65,1.0],[1.0,.85,.30,0.0])
 _unlit=CanvasItemMaterial.new();_unlit.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
 _ambient=CanvasModulate.new();_ambient.name="MAP11Ambient";add_child(_ambient)
 _ambient.color=Color(.38,.43,.52)
 _player_light=_make_light("PlayerKey",{"color":[.78,.85,1.0],"radius":420,"energy":.48,"height_ratio":.8})
 _pool("Heart",Vector2(-250,-2440),"field",680,Color(1.0,.24,.085),.95,.035)
 _pool("GateLeft",Vector2(-150,-4050),"field",410,Color(1.0,.37,.12),.80,.035)
 _pool("GateRight",Vector2(180,-4090),"field",390,Color(1.0,.27,.09),.72,.035)
 _pool("WestTissue",Vector2(-3450,-1250),"field",440,Color(.85,.18,.10),.58,.05)
 _pool("EastTissue",Vector2(1850,-2000),"field",380,Color(.85,.20,.09),.5,.05)
 var offset: Vector2=scene.arena_view.global_position
 _pool("ArenaEntry",offset+Vector2(0,1120),"arena",620,Color(1.0,.32,.10),.72,.035)
 # Finale northern pair replaces the old single heart pool.
 _pool("ArenaTissue",offset+Vector2(1550,-450),"arena",500,Color(.90,.19,.08),.56,.045)
 _mount_contacts()
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

func _mount_contacts() -> void:
 # Setup enumeration only. Shadows stay on the ground plane, independent of
 # per-tree occlusion fade; dark recesses do not turn into huge black ellipses.
 for row in scene.field_view._rows:
  var root_: Node2D=row.node
  for child in root_.get_children():
   if child is Sprite2D and child.z_index==-1:child.hide()
  var sprite: Sprite2D=root_.get_child(0)
  GroundContact.shadow(scene.field_view,sprite,row.foot,-2990,.85,_unlit)
 for row in scene.arena_view._rim_sprites:
  var sprite: Sprite2D=row.sprite
  if not sprite.has_meta("finale_retired"):
   GroundContact.shadow(scene.arena_view,sprite,sprite.position,-440,.26,_unlit)
 for id in ["NorthHeartAltar","EntryArch_VisualOnly","ClearArch_VisualOnly"]:
  var sprite: Sprite2D=scene.arena_view.get_node(id)
  if sprite.position.length()<=1700.0:GroundContact.shadow(scene.arena_view,sprite,sprite.position,-440,.40,_unlit)
 _contact(_player,Vector2(0,4),Vector2(62,20),-1,.75)

func _contact(parent: Node2D,foot: Vector2,size_: Vector2,z: int,alpha: float) -> void:
 var shadow:=Sprite2D.new();shadow.name="LightContactAO";shadow.texture=_contact_texture
 shadow.position=foot;shadow.set_meta("contact_foot",foot);shadow.set_meta("ground_contact_kind","ao");shadow.scale=size_/128.0;shadow.modulate=Color(0,0,0,alpha)
 shadow.z_index=z;shadow.material=_unlit;parent.add_child(shadow)

func _process(delta: float) -> void:
 if not is_instance_valid(_player):return
 _camera=get_viewport().get_camera_2d()
 _time+=delta
 var arena: bool=scene.active_space=="arena"
 var approach: float=1.0 if arena else smoothstep(-2600.0,-4100.0,_player.global_position.y)
 var inner: float=1.0-smoothstep(1350.0,1850.0,(_player.global_position-scene.arena_view.global_position).length()) if arena else 0.0
 _ambient.color=Color(.38,.43,.52).lerp(Color(.48,.43,.46),approach*.75).lerp(Color(.70,.60,.61),inner)
 # Only the space transition changes this instance uniform. Repeated uploads
 # are unnecessary when the value is unchanged.
 if arena!=_rim_arena:
  _rim_player.set_instance_shader_parameter("rim_color",Color(.62,.20,.22,.36) if arena else Color(.78,.72,.59,.38))
  _rim_arena=arena
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
 if(arena){depth=0.0;} // MAP11-30 target perimeter pass owns arena fog.
 float f=texture(fbm_cache,p/11000.0+vec2(TIME*.0015,0.0)).r;
 COLOR=vec4(.12,.17,.23,depth*(.045+.065*f));
}
"""
