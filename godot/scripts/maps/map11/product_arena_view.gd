extends "res://scripts/maps/map11/arena_preview.gd"
const GroundContact=preload("res://scripts/maps/map11/ground_contact.gd")
## Arena exterior finale presentation; Product Main owns actual actors and camera.
func _ready() -> void:
 _build_floor();_build_props();set_process(false);set_physics_process(false)

 set_process_input(false);set_process_unhandled_input(false);set_process_unhandled_key_input(false)

# Visual shoulder overlaps the unchanged provider's R1700 collision.
var _shoulders: Array[Sprite2D]=[]
func _build_floor() -> void:
 super._build_floor()
 var floor_: Polygon2D=get_node("SkinFloor")
 floor_.polygon=_circle_points(Vector2.ZERO,2480,192)
 floor_.uv=floor_.polygon
 for item in get_node("RGBAFloorDecals").get_children():item.material.set_shader_parameter("opacity",.16)
 for item in get_node("IrregularFissureDecals").get_children():item.material.set_shader_parameter("opacity",.12)
 var material_:=ShaderMaterial.new()
 material_.shader=preload("res://scripts/maps/map11/arena_shoulder.gdshader")
 floor_.material=material_
 _build_ritual()
 # Low silhouettes bridge the floor and the forest; never add collision.
 var root_material:=ShaderMaterial.new()
 root_material.shader=preload("res://scripts/maps/map11/organic_decal.gdshader")
 root_material.set_shader_parameter("opacity",.92)
 for i in range(32):
  var angle: float=TAU*float(i)/32.0
  var root_:=Sprite2D.new();root_.name="RootShoulder%02d"%i
  root_.texture=load(PROP_DIR+"prop_g_root.png")
  root_.position=Vector2.from_angle(angle)*(1530+float(i%3)*45)
  root_.scale=Vector2(850+float(i%4)*70,650+float(i%3)*55)/root_.texture.get_size()
  root_.rotation=angle+PI*.5+float(i%3-1)*.13;root_.flip_h=i%2==0
  root_.material=root_material;root_.z_index=-430;add_child(root_);_shoulders.append(root_)

func _build_props() -> void:
 # Back forest fills the recess beyond the roots, behind the approved front trees.
 for i in range(32):
  var angle: float=TAU*(float(i)+.37+sin(float(i)*2.4)*.18)/32.0
  var foot:=Vector2.from_angle(angle)*(2220+float(i%3)*90)
  _prop("BackForest%02d"%i,"rotforest_tree_%02d.png"%[4,7,2,11,5,1,6,3][i%8],foot,880+float((i*7)%5)*92,i%3==0)
  var sprite: Sprite2D=get_node("BackForest%02d"%i)
  sprite.modulate=Color(.47,.48,.49,1)
 super._build_props()
 # Keep the rear mass; remove the repeated inner corpse-tree curtain at focal bays.
 for row in _rim_sprites:
  var item: Sprite2D=row.sprite
  if str(item.name).begins_with("LivingCorpse") or str(item.name).begins_with("Cocoon"):
   item.modulate.a=0.0;item.set_meta("finale_retired",true)
  elif str(item.name).begins_with("OuterTree"):
   # Rear mass remains continuous; remove alternate front silhouettes in focal bays.
   if int(str(item.name).trim_prefix("OuterTree"))%3==1:
    item.modulate.a=0.0;item.set_meta("finale_retired",true)
    continue
   var a: float=item.position.angle()
   if item.position.y < -1250 or item.position.x < -1450 or (item.position.x>1450 and item.position.y<700):
    item.position*=1.22
    var bounds: Rect2=item.get_meta("opaque_ground_bounds")
    row.rect=Rect2(item.position+bounds.position,bounds.size).grow(65)
    GroundContact.depth(item,item.global_position)
 # South foreground must frame the entrance instead of covering the player lane.
 for row in _rim_sprites:
  var item: Sprite2D=row.sprite
  if item.position.y>800 and (str(item.name).begins_with("OuterTree") or str(item.name).begins_with("BackForest")):
   item.position*=1.30;item.scale*=.70
   var bounds: Rect2=GroundContact.align(item)
   row.rect=Rect2(item.position+bounds.position,bounds.size).grow(65)
   GroundContact.depth(item,item.global_position)
 # Existing portal nodes remain addressable; feet move beyond the combat disk.
 get_node("EntryArch_VisualOnly").position=Vector2(0,1880)
 get_node("ClearArch_VisualOnly").position=Vector2(0,-2110)
 get_node("NorthHeartAltar").position=Vector2(0,-2220)
 for id in ["EntryArch_VisualOnly","ClearArch_VisualOnly","NorthHeartAltar"]:
  var item: Sprite2D=get_node(id)
  GroundContact.depth(item,item.global_position)
  for row in _rim_sprites:
   if row.sprite==item:
    var bounds: Rect2=item.get_meta("opaque_ground_bounds")
    row.rect=Rect2(item.position+bounds.position,bounds.size).grow(65)


func _prop(id: String,file: String,foot: Vector2,height: float,mirror: bool=false) -> void:
 super._prop(id,file,foot,height,mirror)
 var sprite: Sprite2D=get_node(id)
 var bounds: Rect2=GroundContact.align(sprite)
 GroundContact.depth(sprite,sprite.global_position)
 if foot.length()>RADIUS:
  _rim_sprites.back().rect=Rect2(foot+bounds.position,bounds.size).grow(65)

func update_product_occlusion(point: Vector2,delta: float) -> void:
 var view:=_camera_rect()
 for row in _rim_sprites:
  var sprite: Sprite2D=row.sprite
  sprite.visible=not sprite.has_meta("finale_retired") and view.intersects(row.rect.grow(120))
  if not sprite.visible:continue
  var alpha: float=.22 if (row.rect.has_point(point) or row.rect.has_point(point-Vector2(0,55))) and sprite.position.y>point.y-100 and not str(sprite.name).begins_with("BackForest") else 1.0
  sprite.modulate.a=move_toward(sprite.modulate.a,alpha,delta*8.0)
 for sprite in _shoulders:
  sprite.visible=view.intersects(Rect2(sprite.position-Vector2(650,650),Vector2(1300,1300)))

func _camera_rect() -> Rect2:
 var inverse:=get_global_transform_with_canvas().affine_inverse()
 var size_: Vector2=get_viewport_rect().size
 return Rect2(inverse*Vector2.ZERO,size_/get_viewport().get_camera_2d().zoom).grow(100)

# Authored decal composition baked offline: one static texture, one draw, no tick work.
func _build_ritual() -> void:
 var ring:=Sprite2D.new();ring.name="RitualRootCracks"
 ring.texture=preload("res://assets/maps/map11/ritual_root_cracks.png")
 ring.scale=Vector2.ONE*(3600.0/2048.0);ring.z_index=-419
 var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/ritual_cracks.gdshader")
 mat.set_shader_parameter("glow_strength",.10)
 ring.material=mat;add_child(ring)
