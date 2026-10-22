extends Control
## Literal canvas geometry from game.html:_renderIntroCutscene (63047–63203).
const EMPTY: Dictionary={}
const DEFAULT_CAM: Dictionary={"zs":1,"ze":1}
const DEFAULT_SPEAKER: Dictionary={"label":"","color":"#ffffff"}
const Fonts=preload("res://scripts/native_ui_fonts.gd")
var owner_story: CanvasLayer
var font: Font
var bold: Font
var vignette: Texture2D
var subtitle: GradientTexture2D
var _wrapped: Array=[]
var _prefixes: Array=[]
var _hint_text: String
func _ready() -> void:
	mouse_filter=Control.MOUSE_FILTER_IGNORE
	font=Fonts.stack("font");bold=Fonts.stack("font",700)
	_hint_text=preload("res://scripts/native_demo_ui_i18n.gd").text("SPACE 길게 눌러 건너뛰기",owner_story.locale)
	# Prepare bounded text layouts/prefixes once, outside frame drawing.
	var view_size: Vector2=get_viewport_rect().size
	for cue in owner_story._lines:
		var lines:=_wrap(str(cue.get("text","")),view_size.x*.84,maxi(13,int(view_size.y*.018)))
		_wrapped.append(lines)
		var prefixes: Array=[]
		for line in lines:
			var values:=PackedStringArray()
			for n in line.length()+1:values.append(line.left(n))
			prefixes.append(values)
		_prefixes.append(prefixes)
	# Canvas radial radii use width pixels in both axes (not an ellipse).
	var radial:=Image.create(960,540,false,Image.FORMAT_RGBA8)
	for y in 540:
		for x in 960:
			var d: float=Vector2(x-480,y-270).length()
			radial.set_pixel(x,y,Color(0,0,0,clampf((d-192)/480,0,1)))
	vignette=ImageTexture.create_from_image(radial)
	subtitle=GradientTexture2D.new();subtitle.fill_from=Vector2(0,0);subtitle.fill_to=Vector2(0,1)
	var s:=Gradient.new();s.offsets=PackedFloat32Array([0,.3,1]);s.colors=PackedColorArray([Color(0,0,0,0),Color(0,0,0,.7),Color(0,0,0,.9)]);subtitle.gradient=s
func _draw() -> void:
	if owner_story.phase!="playing":return
	var cue: Dictionary=owner_story.current_cue()
	var full: Vector2=get_viewport_rect().size
	var cw: float=minf(full.x,floor(full.y*16/9));var ch: float=full.y
	var ox: float=floor((full.x-cw)/2)
	var ms: float=owner_story.elapsed_ms
	var now: float=Time.get_ticks_msec()
	draw_rect(Rect2(Vector2.ZERO,full),Color.BLACK)
	var exit_alpha:=1.0
	if cue.get("exit",false):
		exit_alpha=1-clampf(ms/float(cue.get("fade",EMPTY).get("out",1500)),0,1)
		cue=owner_story._lines[maxi(0,owner_story.cue_index-1)]
		ms=owner_story._exit_elapsed
	var cam: Dictionary=cue.get("cam",DEFAULT_CAM)
	var t: float=minf(1,ms/float(cue.dur));var et:=t
	match str(cam.get("ease","linear")):
		"out":et=1-pow(1-t,2)
		"in":et=t*t
		"inout":et=2*t*t if t<.5 else 1-pow(-2*t+2,2)/2
	var zoom: float=lerpf(float(cam.get("zs",1)),float(cam.get("ze",1)),et)
	var fx: Dictionary=cue.get("vfx",EMPTY)
	var mag: float=fx.get("shake",0)
	var pan:=Vector2(float(cam.get("px",0))*et+int(sin(now*.047)*mag*2),float(cam.get("py",0))*et+int(cos(now*.053)*mag*2))
	var fade: Dictionary=cue.get("fade",EMPTY);var fi: float=fade.get("in",400);var fo: float=fade.get("out",0)
	var alpha: float=minf(1,ms/maxf(1,fi))
	if fo>0 and ms>float(cue.dur)-fo:alpha=minf(alpha,(float(cue.dur)-ms)/fo)
	var tex: Texture2D=owner_story._textures.get(str(cue.get("img","")))
	if tex!=null:
		var ratio: float=tex.get_width()/float(tex.get_height());var dw:=cw;var dh:=cw/ratio
		if ratio>cw/ch:dh=ch;dw=ch*ratio
		var pos:=Vector2((cw-dw)/2,(ch-dh)*.1)
		pos=(pos-Vector2(cw,ch)/2)*zoom+Vector2(cw,ch)/2+pan+Vector2(ox,0)
		var grade:=Color.WHITE
		match str(fx.get("grade","")):
			"purple":grade=Color(1-.35+.35*80/255,1-.35+.35*40/255,1-.35+.35*120/255)
			"purple_blood":grade=Color(1-.4+.4*100/255,1-.4+.4*30/255,1-.4+.4*60/255)
			"blue":grade=Color(1-.35+.35*40/255,1-.35+.35*60/255,1-.35+.35*120/255)
		grade.a=clampf(alpha*exit_alpha,0,1);draw_texture_rect(tex,Rect2(pos,Vector2(dw,dh)*zoom),false,grade)
		draw_texture_rect(vignette,Rect2(ox,0,cw,ch),false,Color(1,1,1,float(fx.get("vig",0))))
	if cue.get("speaker")!=null and not str(cue.get("text","")).is_empty():
		var text: String=cue.text
		var fs: int=maxi(13,int(ch*.018));var lh: float=maxf(20,ch*.028);var gap: float=maxf(22,ch*.035)
		var layout_index: int=owner_story.cue_index-1 if exit_alpha<1 else owner_story.cue_index
		var wrapped: PackedStringArray=_wrapped[layout_index]
		var sh: float=maxf(ch*.22,(gap+(wrapped.size()-1)*lh+maxf(13,ch*.018)+maxf(12,ch*.025))/.75)
		var sy:=ch-sh;draw_texture_rect(subtitle,Rect2(ox,sy,cw,sh),false)
		var style: Dictionary=owner_story._data.speakers.get(cue.speaker,DEFAULT_SPEAKER)
		var name_text: String=owner_story._data.localized_speakers.get(owner_story.locale,EMPTY).get(cue.speaker,style.label)
		var col:=Color(str(style.color));var nx:=ox+cw*.08;var ny:=sy+sh*.25
		var nfs: int=maxi(14,int(ch*.022))
		draw_string(bold,Vector2(nx,ny+nfs*.35),name_text,HORIZONTAL_ALIGNMENT_LEFT,-1,nfs,col)
		draw_line(Vector2(nx,ny+maxf(10,ch*.015)),Vector2(nx+bold.get_string_size(name_text,HORIZONTAL_ALIGNMENT_LEFT,-1,nfs).x,ny+maxf(10,ch*.015)),Color(col,.4),1)
		var visible_chars: int=text.replace("\n","").length() if owner_story._wait else int(ms/float(cue.get("text_cfg",EMPTY).get("speed",50)))
		for i in wrapped.size():
			var line: String=wrapped[i];var shown: String=_prefixes[layout_index][i][clampi(visible_chars,0,line.length())];visible_chars-=line.length()
			var at:=Vector2(nx,ny+gap+i*lh+fs*.35)
			draw_string_outline(font,at,shown,HORIZONTAL_ALIGNMENT_LEFT,-1,fs,2,Color.BLACK)
			draw_string(font,at,shown,HORIZONTAL_ALIGNMENT_LEFT,-1,fs,Color.WHITE)
		if owner_story._wait and int(now/500)%2==1:draw_string(font,Vector2(ox+cw*.92,ch-sh*.2),"▼",HORIZONTAL_ALIGNMENT_CENTER,-1,maxi(12,int(ch*.016)),Color(1,1,1,.6))
	# Paint letterbox last so zoom cannot spill into it.
	if ox>0:
		draw_rect(Rect2(0,0,ox,ch),Color.BLACK);draw_rect(Rect2(ox+cw,0,ox,ch),Color.BLACK)
	var holding: bool=owner_story._hold_at>=0
	var hint: String=_hint_text
	draw_string(font,Vector2(full.x-20-font.get_string_size(hint,HORIZONTAL_ALIGNMENT_LEFT,-1,11).x,full.y-34),hint,HORIZONTAL_ALIGNMENT_LEFT,-1,11,Color(1,1,1,.8 if holding else .25+.1*sin(now*.002)))
	draw_rect(Rect2(full.x-140,full.y-28,120,3),Color(1,1,1,.15))
	if holding:draw_rect(Rect2(full.x-140,full.y-28,120*minf(1,(now-owner_story._hold_at)/2000),3),Color(1,1,1,.8))
func _wrap(text: String,width: float,fs: int) -> PackedStringArray:
	var result:=PackedStringArray()
	for paragraph in text.split("\n"):
		var line:=""
		for c in paragraph:
			if not line.is_empty() and font.get_string_size(line+c,HORIZONTAL_ALIGNMENT_LEFT,-1,fs).x>width:result.append(line);line=""
			line+=c
		result.append(line)
	return result
