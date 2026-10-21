extends RefCounted
## Setup-only explicit preloads; visible-tile culling remains with scene owner.
const SHADER=preload("res://scripts/maps/map11/upscale01_ground.gdshader")
const FIELD=[
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_0_0.png"),"position":Vector2(-600.0,-2000.0),"core":Vector2(2046,2046),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_1_0.png"),"position":Vector2(764.0,-2000.0),"core":Vector2(2046,2046),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_2_0.png"),"position":Vector2(2128.0,-2000.0),"core":Vector2(708,2046),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_0_1.png"),"position":Vector2(-600.0,-636.0),"core":Vector2(2046,2046),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_1_1.png"),"position":Vector2(764.0,-636.0),"core":Vector2(2046,2046),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_2_1.png"),"position":Vector2(2128.0,-636.0),"core":Vector2(708,2046),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_0_2.png"),"position":Vector2(-600.0,728.0),"core":Vector2(2046,1496),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_1_2.png"),"position":Vector2(764.0,728.0),"core":Vector2(2046,1496),"density":1.5},
 {"texture":preload("res://assets/maps/map11/upscale01/target32/floor_2_2.png"),"position":Vector2(2128.0,728.0),"core":Vector2(708,1496),"density":1.5},
]
const ARENA=[
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_0_0.png"),"position":Vector2(0.0,0.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_1_0.png"),"position":Vector2(1023.0,0.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_2_0.png"),"position":Vector2(2046.0,0.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_3_0.png"),"position":Vector2(3069.0,0.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_4_0.png"),"position":Vector2(4092.0,0.0),"core":Vector2(8,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_0_1.png"),"position":Vector2(0.0,1023.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_1_1.png"),"position":Vector2(1023.0,1023.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_2_1.png"),"position":Vector2(2046.0,1023.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_3_1.png"),"position":Vector2(3069.0,1023.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_4_1.png"),"position":Vector2(4092.0,1023.0),"core":Vector2(8,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_0_2.png"),"position":Vector2(0.0,2046.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_1_2.png"),"position":Vector2(1023.0,2046.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_2_2.png"),"position":Vector2(2046.0,2046.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_3_2.png"),"position":Vector2(3069.0,2046.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_4_2.png"),"position":Vector2(4092.0,2046.0),"core":Vector2(8,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_0_3.png"),"position":Vector2(0.0,3069.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_1_3.png"),"position":Vector2(1023.0,3069.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_2_3.png"),"position":Vector2(2046.0,3069.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_3_3.png"),"position":Vector2(3069.0,3069.0),"core":Vector2(2046,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_4_3.png"),"position":Vector2(4092.0,3069.0),"core":Vector2(8,2046),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_0_4.png"),"position":Vector2(0.0,4092.0),"core":Vector2(2046,8),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_1_4.png"),"position":Vector2(1023.0,4092.0),"core":Vector2(2046,8),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_2_4.png"),"position":Vector2(2046.0,4092.0),"core":Vector2(2046,8),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_3_4.png"),"position":Vector2(3069.0,4092.0),"core":Vector2(2046,8),"density":2},
 {"texture":preload("res://assets/maps/map11/upscale01/target30/floor_4_4.png"),"position":Vector2(4092.0,4092.0),"core":Vector2(8,8),"density":2},
]
static func mount(owner_: Node2D,space: String,center: Vector2,scale_: float,z: int) -> Array[Dictionary]:
 var rows: Array[Dictionary]=[]
 var field: bool=space=="field"
 var data: Array=FIELD if field else ARENA
 var plane_origin:=Vector2(-600,-2000) if field else Vector2.ZERO
 var plane_extent:=Vector2(3200,3725) if field else Vector2.ONE*4096
 var anchor:=Vector2(1000,562.5) if field else Vector2.ONE*2048
 var mask: Texture2D=preload("res://assets/maps/map11/target32/veins_32b.png") if field else preload("res://assets/maps/map11/target30/veins.png")
 for i in range(data.size()):
  var row: Dictionary=data[i]
  var s:=Sprite2D.new();s.name=("Target32GroundAndRootAO" if field else "Target30Floor")+str(i)
  s.texture=row.texture;s.centered=false;s.region_enabled=true;s.region_rect=Rect2(Vector2.ONE,row.core)
  s.position=center+(row.position-anchor)*scale_;s.scale=Vector2.ONE*scale_/row.density;s.z_index=z
  var mat:=ShaderMaterial.new();mat.shader=SHADER
  mat.set_shader_parameter("pulse_mask",mask)
  mat.set_shader_parameter("logical_tile",Vector4(row.position.x-1.0/row.density,row.position.y-1.0/row.density,row.texture.get_width()/row.density,row.texture.get_height()/row.density))
  mat.set_shader_parameter("logical_origin",plane_origin);mat.set_shader_parameter("logical_extent",plane_extent)
  if field:
   mat.set_shader_parameter("glow",Vector3(.38,.06,.10));mat.set_shader_parameter("strength",.012)
  s.material=mat;owner_.add_child(s)
  rows.append({"node":s,"rect":Rect2(s.position,row.core*scale_/row.density)})
 return rows
