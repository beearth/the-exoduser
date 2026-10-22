extends RefCounted
## Direct asset/CSS paint primitives, game.html:646–663; inventory-space.css:395–489.
const I18N=preload("res://scripts/native_demo_ui_i18n.gd")
const Fonts=preload("res://scripts/native_ui_fonts.gd")
const ROOT="res://assets/ui/parity_ui_02/"
static var textures: Dictionary={}
static func texture(path: String) -> Texture2D:
 # Weak cache deduplicates living owners without pinning closed UI art.
 var cached: WeakRef=textures.get(path)
 var live: Texture2D=cached.get_ref() if cached!=null else null
 if live!=null:return live
 var resolved: String=ROOT+path
 if not ResourceLoader.exists(resolved) and path=="img/ui/inventory_knight_cutout_20260928.png":resolved=ROOT+"img/ui/inventory_paperdoll_hf_20260923.png"
 var result: Texture2D=load(resolved) if ResourceLoader.exists(resolved) else null
 if result!=null:textures[path]=weakref(result)
 return result
static func art(parent: Node,path: String,rect: Rect2) -> TextureRect:
 var n:=TextureRect.new();n.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;n.texture=texture(path);n.position=rect.position;n.size=rect.size;n.stretch_mode=TextureRect.STRETCH_SCALE;n.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;n.mouse_filter=Control.MOUSE_FILTER_IGNORE;parent.add_child(n);return n
static func panel(parent: Node,rect: Rect2,color: Color,border: Color=Color.TRANSPARENT) -> Panel:
 var n:=Panel.new();n.position=rect.position;n.size=rect.size
 var s:=StyleBoxFlat.new();s.bg_color=color;s.border_color=border;s.set_border_width_all(1);n.add_theme_stylebox_override("panel",s);parent.add_child(n);return n
static func text(parent: Node,value: String,rect: Rect2,px: int=12,color:=Color("d9cbb3"),stack: String="font",weight: int=400) -> Label:
 var n:=Label.new();n.text=I18N.text(value);n.position=rect.position;n.size=rect.size;n.add_theme_font_override("font",Fonts.stack(stack,weight));n.add_theme_font_size_override("font_size",px);n.add_theme_color_override("font_color",color);n.add_theme_color_override("font_shadow_color",Color(0,0,0,.95));n.add_theme_constant_override("shadow_offset_y",1);n.mouse_filter=Control.MOUSE_FILTER_IGNORE;parent.add_child(n);return n
class Rail extends Control:
 var image: Texture2D
 var width:=24.0
 var slice:=.04
 func _draw() -> void:
  if image==null:return
  var ts:=image.get_size();var sx: float=ts.x*slice;var sy: float=ts.y*slice
  var xs: Array=[0.0,sx,ts.x-sx,ts.x];var ys: Array=[0.0,sy,ts.y-sy,ts.y]
  var dx: Array=[0.0,width,size.x-width,size.x];var dy: Array=[0.0,width,size.y-width,size.y]
  for y in 3:
   for x in 3:
    if x==1 and y==1:continue
    draw_texture_rect_region(image,Rect2(dx[x],dy[y],dx[x+1]-dx[x],dy[y+1]-dy[y]),Rect2(xs[x],ys[y],xs[x+1]-xs[x],ys[y+1]-ys[y]))
static func frame(parent: Node,rect: Rect2,width: int=24,outer: bool=false) -> Control:
 var n:=Rail.new();n.image=texture("img/ui/blackiron_frame.png" if outer else "img/ui/iron_covenant_20260924/frame.webp");n.slice=.26 if outer else .04;n.width=width;n.position=rect.position;n.size=rect.size;n.mouse_filter=Control.MOUSE_FILTER_IGNORE;parent.add_child(n);return n
static func button(parent: Node,value: String,rect: Rect2,callback: Callable,active: bool=false,px: int=12) -> Button:
 var b:=Button.new();b.position=rect.position;b.size=rect.size;b.text=I18N.text(value);b.add_theme_font_override("font",Fonts.stack("font",500));b.add_theme_font_size_override("font_size",px);b.add_theme_color_override("font_color",Color("f4e6cb" if active else "c7bead"))
 var blank:=StyleBoxEmpty.new()
 for state in ["normal","hover","pressed","focus"]:b.add_theme_stylebox_override(state,blank)
 parent.add_child(b)
 var plate:=art(b,"img/ui/iron_covenant_20260924/button.webp",Rect2(Vector2.ZERO,rect.size));plate.show_behind_parent=true
 var sh:=Shader.new();sh.code="shader_type canvas_item; uniform vec4 tint:source_color; void fragment(){vec4 c=texture(TEXTURE,UV);COLOR=vec4(mix(c.rgb,tint.rgb,tint.a),c.a);}"
 var mat:=ShaderMaterial.new();mat.shader=sh;mat.set_shader_parameter("tint",Color(.26,.06,.035,.65) if active else Color(.04,.035,.045,.55));plate.material=mat
 b.pressed.connect(callback);return b
static func brighten(n: CanvasItem,amount: float,contrast: float=1.0) -> void:
 var sh:=Shader.new();sh.code="shader_type canvas_item;uniform float brightness=1.0;uniform float contrast=1.0;void fragment(){vec4 c=texture(TEXTURE,UV);c.rgb=(c.rgb*brightness-vec3(.5))*contrast+vec3(.5);COLOR=c;}"
 var mat:=ShaderMaterial.new();mat.shader=sh;mat.set_shader_parameter("brightness",amount);mat.set_shader_parameter("contrast",contrast);n.material=mat

static func iron(parent: Node,rect: Rect2,top: Color,bottom: Color) -> TextureRect:
 var n:=art(parent,"img/ui/hell_gothic/iron.png",rect);n.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED
 var sh:=Shader.new();sh.code="shader_type canvas_item;uniform vec2 extent;uniform vec4 top:source_color;uniform vec4 bottom:source_color;void fragment(){vec4 c=texture(TEXTURE,UV*extent/480.0);vec4 g=mix(top,bottom,UV.y);COLOR=vec4(mix(c.rgb,g.rgb,g.a),1.0);}"
 var mat:=ShaderMaterial.new();mat.shader=sh;mat.set_shader_parameter("extent",rect.size);mat.set_shader_parameter("top",top);mat.set_shader_parameter("bottom",bottom);n.material=mat;return n

# UI transition helpers only; never called by draw/process/physics callbacks.
static func suspend_art(owner: Node) -> void:
 if owner is TextureRect or owner is Rail:
  var key: String="texture" if owner is TextureRect else "image"
  var art: Texture2D=owner.get(key)
  if art!=null and not art.resource_path.is_empty():
   owner.set_meta("vram_01_art",art.resource_path);owner.set(key,null);owner.queue_redraw()
 for child in owner.get_children():suspend_art(child)
static func resume_art(owner: Node) -> void:
 if owner.has_meta("vram_01_art"):
  var key: String="texture" if owner is TextureRect else "image"
  owner.set(key,load(str(owner.get_meta("vram_01_art"))));owner.remove_meta("vram_01_art");owner.queue_redraw()
 for child in owner.get_children():resume_art(child)
