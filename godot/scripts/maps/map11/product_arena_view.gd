extends "res://scripts/maps/map11/arena_preview.gd"
## Original arena floor/props only. Product Main owns actual actors and camera.
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
 var material_:=ShaderMaterial.new()
 material_.shader=preload("res://scripts/maps/map11/arena_shoulder.gdshader")
 floor_.material=material_
 # Low silhouettes bridge the floor and the forest; never add collision.
 var root_material:=ShaderMaterial.new()
 root_material.shader=preload("res://scripts/maps/map11/field_decal.gdshader")
 for i in range(32):
  var angle: float=TAU*float(i)/32.0
  var root_:=Sprite2D.new();root_.name="RootShoulder%02d"%i
  root_.texture=load(PROP_DIR+"prop_g_root.png")
  root_.position=Vector2.from_angle(angle)*(1800+float(i%3)*65)
  root_.scale=Vector2(740+float(i%4)*70,430+float(i%3)*55)/root_.texture.get_size()
  root_.rotation=angle+PI*.5+float(i%3-1)*.13;root_.flip_h=i%2==0
  root_.material=root_material;root_.z_index=-410;add_child(root_);_shoulders.append(root_)

func _build_props() -> void:
 # Back forest fills the recess beyond the roots, behind the approved front trees.
 for i in range(32):
  var angle: float=TAU*(float(i)+.37)/32.0
  var foot:=Vector2.from_angle(angle)*(2220+float(i%3)*90)
  _prop("BackForest%02d"%i,"rotforest_tree_%02d.png"%[4,7,2,11,5,1,6,3][i%8],foot,1000+float(i%4)*95,i%3==0)
  var sprite: Sprite2D=get_node("BackForest%02d"%i)
  sprite.modulate=Color(.47,.48,.49,1);sprite.z_index=-430
 super._build_props()

func update_product_occlusion(point: Vector2,delta: float) -> void:
 var view:=_camera_rect()
 for row in _rim_sprites:
  var sprite: Sprite2D=row.sprite
  sprite.visible=view.intersects(row.rect.grow(120))
  if not sprite.visible:continue
  var alpha: float=.22 if (row.rect.has_point(point) or row.rect.has_point(point-Vector2(0,55))) and sprite.position.y>point.y-100 and not str(sprite.name).begins_with("BackForest") else 1.0
  sprite.modulate.a=move_toward(sprite.modulate.a,alpha,delta*8.0)
 for sprite in _shoulders:
  sprite.visible=view.intersects(Rect2(sprite.position-Vector2(650,650),Vector2(1300,1300)))

func _camera_rect() -> Rect2:
 var inverse:=get_global_transform_with_canvas().affine_inverse()
 var size_: Vector2=get_viewport_rect().size
 return Rect2(inverse*Vector2.ZERO,size_/get_viewport().get_camera_2d().zoom).grow(100)
