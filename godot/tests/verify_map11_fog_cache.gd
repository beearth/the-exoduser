extends SceneTree
const Lighting=preload("res://scripts/native_screen_lighting.gd")
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-15-Isolated-20261021":quit(2);return
 var views: Array[SubViewport]=[]
 for cached in [false,true]:
  var viewport:=SubViewport.new();viewport.world_2d=World2D.new();viewport.size=Vector2i(1920,1080);viewport.disable_3d=true;viewport.transparent_bg=true
  viewport.render_target_update_mode=SubViewport.UPDATE_ONCE;root.add_child(viewport);views.append(viewport)
  var rect:=ColorRect.new();rect.size=Vector2(1920,1080)
  var shader:=Shader.new();var code: String=Lighting.FOG_GL_SHADER.replace("TIME","12.0").replace("render_mode blend_mix;","render_mode unshaded, blend_disabled;")
  if cached:
   var start: int=code.find("float fbm(vec2 p)");var end: int=code.find("void fragment()",start)
   code=code.substr(0,start)+"uniform sampler2D fbm_cache: repeat_enable, filter_linear;\nfloat fbm(vec2 p){return texture(fbm_cache,(p+vec2(64.0))/128.0).r;}\n"+code.substr(end)
  shader.code=code;var mat:=ShaderMaterial.new();mat.shader=shader
  if cached:mat.set_shader_parameter("fbm_cache",load("res://assets/maps/map11/fog_fbm_filtered.png"))
  rect.material=mat;viewport.add_child(rect)
 await RenderingServer.frame_post_draw
 var a: PackedByteArray=views[0].get_texture().get_image().get_data()
 var b: PackedByteArray=views[1].get_texture().get_image().get_data()
 var sums: Array[int]=[0,0,0,0];var peaks: Array[int]=[0,0,0,0]
 for i in range(a.size()):
  var d: int=absi(int(a[i])-int(b[i]));sums[i%4]+=d;peaks[i%4]=maxi(peaks[i%4],d)
 var means: Array[float]=[]
 for total in sums:means.append(total/2073600.0)
 var result: Dictionary={"fixed_time":12,"viewport":[1920,1080],"mean_abs_rgba_255":means,"max_abs_rgba_255":peaks,"scope":"fog pass only, fixed TIME; 8-bit straight RGBA cache approximation"}
 var f:=FileAccess.open("/Users/fordeargamers/exoduser-wt/_out/map11-15/fog-cache-comparison.json",FileAccess.WRITE);f.store_string(JSON.stringify(result,"  "));f.close()
 print("MAP11_FOG_COMPARE ",JSON.stringify(result));quit(0)
