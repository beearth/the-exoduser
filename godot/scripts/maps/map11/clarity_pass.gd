extends CanvasLayer
## One native-resolution world pass, after fog(5), before HUD(10). Setup only.
func _ready() -> void:
 layer=6
 var rect:=ColorRect.new();rect.name="WorldResolve"
 rect.mouse_filter=Control.MOUSE_FILTER_IGNORE
 rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var material_:=ShaderMaterial.new()
 material_.shader=preload("res://scripts/maps/map11/clarity_pass.gdshader")
 rect.material=material_;add_child(rect)
 set_process(false);set_physics_process(false)
