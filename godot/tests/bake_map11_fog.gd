extends SceneTree
## Static five-octave FBM cache; periodic only at +/-64 base units.
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-15-Isolated-20261021":quit(2);return
 var viewport:=SubViewport.new();viewport.world_2d=World2D.new();viewport.size=Vector2i(2048,2048);viewport.disable_3d=true
 viewport.render_target_update_mode=SubViewport.UPDATE_ONCE;root.add_child(viewport)
 var rect:=ColorRect.new();rect.size=Vector2(2048,2048)
 var shader:=Shader.new();shader.code="""shader_type canvas_item;
 render_mode unshaded, blend_disabled;
 float f_hash(vec2 p,float period){p=mod(p+period*.5,period)-period*.5;return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float f_noise(vec2 p,float period){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(f_hash(i,period),f_hash(i+vec2(1,0),period),f.x),mix(f_hash(i+vec2(0,1),period),f_hash(i+vec2(1,1),period),f.x),f.y);}
 float fbm(vec2 p){float v=0.0;float a=.5;float period=128.0;for(int i=0;i<5;i++){v+=a*f_noise(p,period);p*=2.0;a*=.5;period*=2.0;}return v;}
 void fragment(){float value=fbm((UV-.5)*128.0);COLOR=vec4(vec3(value),1.0);}
 """
 var mat:=ShaderMaterial.new();mat.shader=shader;rect.material=mat;viewport.add_child(rect)
 await RenderingServer.frame_post_draw
 var result: int=viewport.get_texture().get_image().save_png("res://assets/maps/map11/fog_fbm_filtered.png")
 print("MAP11_FOG_BAKE ",JSON.stringify({"size":[2048,2048],"period":128,"octaves":5,"save_error":result}));quit(result)
