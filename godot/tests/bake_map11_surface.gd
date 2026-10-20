extends SceneTree
## Deterministic static five-tap filter cache. Existing source art is unchanged.
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-15-Isolated-20261021":quit(2);return
 var texture_: Texture2D=load("res://assets/map/ch1/ground_dark_soil.png")
 var viewport:=SubViewport.new();viewport.size=Vector2i(1024,1024);viewport.disable_3d=true
 viewport.render_target_update_mode=SubViewport.UPDATE_ONCE;root.add_child(viewport)
 var rect:=ColorRect.new();rect.size=Vector2(1024,1024)
 var shader:=Shader.new();shader.code="""shader_type canvas_item;
 render_mode unshaded, blend_disabled;
 uniform sampler2D ground: repeat_enable, filter_linear;
 void fragment(){vec2 d=vec2(.006);COLOR=vec4((texture(ground,UV).rgb*2.0+texture(ground,UV+d).rgb+texture(ground,UV-d).rgb+texture(ground,UV+vec2(d.x,-d.y)).rgb+texture(ground,UV+vec2(-d.x,d.y)).rgb)/6.0,1.0);}
 """
 var mat:=ShaderMaterial.new();mat.shader=shader;mat.set_shader_parameter("ground",texture_);rect.material=mat;viewport.add_child(rect)
 await RenderingServer.frame_post_draw
 var image: Image=viewport.get_texture().get_image()
 var result: int=image.save_png("res://assets/maps/map11/field_ground_filtered.png")
 print("MAP11_BAKE ",JSON.stringify({"size":[1024,1024],"source":texture_.resource_path,"save_error":result}))
 quit(result)
