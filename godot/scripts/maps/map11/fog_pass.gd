extends Node
## MAP11-only static FBM cache. Existing fog pass/UV/time/color/compositing owner remain.
var source: ColorRect
var original: ShaderMaterial
func configure(main: Node) -> void:
 var lighting: Node=main.get_node_or_null("NativeScreenLighting")
 if lighting==null:return
 source=lighting.get_node_or_null("NativeFogGL")
 if source==null:return
 original=source.material
 var shader_:=Shader.new()
 var code: String=original.shader.code
 var start: int=code.find("float fbm(vec2 p)")
 var end: int=code.find("void fragment()",start)
 if start<0 or end<0:return
 # Same 5-octave function sampled from a static toroidal cache; no extra screen pass.
 shader_.code=code.substr(0,start)+"uniform sampler2D fbm_cache: repeat_enable, filter_linear;\nfloat fbm(vec2 p){return texture(fbm_cache,(p+vec2(64.0))/128.0).r;}\n"+code.substr(end)
 var material_: ShaderMaterial=original.duplicate()
 material_.shader=shader_
 material_.set_shader_parameter("fbm_cache",load("res://assets/maps/map11/fog_fbm_filtered.png"))
 source.material=material_
func _exit_tree() -> void:
 if is_instance_valid(source) and original!=null:source.material=original
