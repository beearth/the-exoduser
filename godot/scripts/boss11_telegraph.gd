extends Node2D
## Visual only. Source dimensions/timer ratio supplied by caller.
## Fixed pool and ONE material: no resource/material creation in tick paths.
const SHADER=preload("res://shaders/boss11_telegraph.gdshader")
const CAPACITY=32
static var shared_material: ShaderMaterial
var marks: Array[Polygon2D]=[]
var used:=0
var overlay: Node2D
func bind_player(player: Node2D) -> void:
 overlay.player=player
 var projection: Dictionary=player.get_native_projection_metadata()
 if projection.get("ready",false):overlay.foot_offset=player.to_local(projection.world_foot)
func _ready() -> void:
 var layer:=CanvasLayer.new();layer.layer=6;add_child(layer)
 overlay=preload("res://scripts/boss11_screen_cues.gd").new();overlay.marks=self;layer.add_child(overlay)
 if shared_material==null:
  shared_material=ShaderMaterial.new();shared_material.shader=SHADER
 for i in range(CAPACITY):
  var mark:=Polygon2D.new()
  mark.polygon=PackedVector2Array([Vector2(-1,-1),Vector2(1,-1),Vector2(1,1),Vector2(-1,1)])
  mark.uv=PackedVector2Array([Vector2(0,0),Vector2(1,0),Vector2(1,1),Vector2(0,1)])
  mark.material=shared_material;mark.hide();add_child(mark);marks.append(mark)
func begin() -> void:used=0
func finish() -> void:
 for i in range(used,marks.size()):marks[i].hide()
func put(center: Vector2,extent: Vector2,progress: float,kind: float=0.0,inner: float=0.0,angle: float=0.0,opening: float=0.0) -> void:
 if used>=marks.size() or extent.x<=0 or extent.y<=0:return
 var mark: Polygon2D=marks[used];used+=1
 mark.position=center;mark.scale=extent/0.98;mark.rotation=angle
 mark.color=Color(kind,inner,opening,1)
 mark.set_instance_shader_parameter("progress",clampf(progress,0,1.12));mark.show()
func circle(center: Vector2,radius: float,progress: float) -> void:put(center,Vector2.ONE*radius,progress)
func ring(center: Vector2,radius: float,width: float,gap_angle: float,gap_size: float,progress: float) -> void:
 put(center,Vector2.ONE*radius,progress,0.4,maxf(0.0,(radius-width)/radius)*0.98,gap_angle,gap_size/2)
func strip(start: Vector2,end: Vector2,width: float,progress: float,trajectory: bool=false) -> void:
 put((start+end)/2,Vector2(start.distance_to(end)/2,width/2),progress,1.0,0.5 if trajectory else 0.0,(end-start).angle())
func sector(center: Vector2,radius: float,angle: float,spread: float,progress: float) -> void:
 put(center,Vector2.ONE*radius,progress,0.7,0,angle,spread/TAU)
