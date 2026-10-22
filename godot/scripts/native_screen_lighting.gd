extends CanvasLayer
## P2-003a — 원본 맵 조명·어둠·안개·비네트·색보정 오버레이 (표시 전용 소비자).
## 원본 game.html 합성 순서(draw 포스트 구간)와 수치 그대로. 웹 런타임 실측
## 과거 web_light_measure.json의 계수를 유지하며 PARITY-MAP-02는 원본 자동 WebGPU + S preset과 비교.
##  1) 라이트맵 55199 + _renderLighting 4693: 지옥0 어둠 rgba(6,16,9,.38)(_HELL_AMBIENT
##     4505) 전면 → destination-out으로 광원 구멍. 스탬프 falloff(_initLightStamps 4562):
##     [0,1][.25,.92][.5,.50][.75,.15][1,0]. 첫 전투 광원 = 플레이어(P.x,P.y-6, r470,
##     a=.86+sin(frame*.07)*.03 — 4652~4657) 1개. (이리스 펫 광원 r250 a~.25는 기존 소비자 입력,
##     LIT 색층은 ci6 제외(_CENTER_GLOW=false 4637), 정적 광원12개는 원본 수집.)
##  2) 토치 어둠 55230s: _TORCH.darkAlpha=0 (8689) → 비활성(게이트 그대로 생략).
##  3) 2D 안개 2층 55352~55372: _bakeFogLayers 4366 — 하단(화면 60%→100%,
##     rgba(60,90,120,.12) 0→.3지점부터 평탄), 상단(0→30%, rgba(40,60,90,.06)→투명),
##     merged=하단 1.0+상단 .6, 화면 알파 펄스 .28+sin(t_ms·π/2000)·.08.
##  4) THREE 안개 캔버스(#fogGL) _fogGLInit 8976: FBM 3층 프래그먼트 셰이더 1:1 포트,
##     uCol=_FOG_COLORS[0]=(0.10,0.18,0.08) (8975), alpha=fog*0.41, rgb=uCol*fog*0.8.
##  5) 동적 환경광 55377: _ENV_LIGHT[0]='rgba(100,160,255,.06)' (11985) 전면 1장.
##  6) 지옥별 비네트 55389~55407: radial(중심, r .35W→.7W), 0→투명·.7→vc.05·1→vc.15,
##     vc='rgba(20,60,120,' (지옥0), 그려질 때 globalAlpha .2 (비보스아레나).
##  7) 최종 색보정 55414~55419: OPT.grain=true → canvas CSS filter
##     'contrast(1.05) brightness(0.97)' (OPT.brightness 100).
## HUD(DOM)는 원본에서 필터·오버레이 비대상 → 이 레이어(5)는 HUD(10) 아래.
## PARITY-MAP-02: half-resolution viewport, 12 static sources, original DOM fog order.
## WebGL proxy lighter no-op와 WebGPU additive는 별개. 본 비교는 실제 useGPU/useGL을 기록.
## PP grade/lift/vig 기본0 보존. 원본 WebGPU의 런타임 X.filter no-op와 native의 명시적 tone은 구분.

const AMBIENT := Color(6.0 / 255, 16.0 / 255, 9.0 / 255, 0.38)
const PLAYER_LIGHT_R := 470.0
const PLAYER_LIGHT_A := 0.86
const FOG_BOT := Color(60.0 / 255, 90.0 / 255, 120.0 / 255, 0.12)
const FOG_TOP := Color(40.0 / 255, 60.0 / 255, 90.0 / 255, 0.06)
const FOG_GL_COL := Vector3(0.10, 0.18, 0.08)
const ENV_LIGHT := Color(100.0 / 255, 160.0 / 255, 255.0 / 255, 0.06)
const VIGNETTE_RGB := Vector3(20.0 / 255, 60.0 / 255, 120.0 / 255)

var _world: Node
var _player: Node2D
var _lightmap: ColorRect
var _fog2d: ColorRect
var _fog_gl: ColorRect
var _vignette: ColorRect
var _filter_rect: ColorRect
var _half_view: SubViewport
var _half_display: TextureRect
var _static_lights: Array=[]
var _static_colors: Array[Sprite2D]=[]
var _light_values:=PackedVector4Array()
var _last_light_center:=Vector2.INF
var _last_light_size:=Vector2.ZERO
var _parity_frame: int=-1
var _clock_ms:=0.0
var _fog_time:=0.0
var _iris_color: Sprite2D
var _env: ColorRect
var _configured := false
var _stage_draws := 0

const LIGHTMAP_SHADER := "
shader_type canvas_item;
render_mode blend_mix;
uniform vec4 ambient : source_color = vec4(0.0235, 0.0627, 0.0353, 0.38);
uniform vec2 light_px = vec2(960.0, 540.0);
uniform float light_r = 470.0;
uniform float light_a = 0.86;
uniform vec2 light2_px = vec2(-4000.0, -4000.0); // 이리스 펫 광원 (P2-004a, 4686~4690)
uniform float light2_r = 250.0;
uniform float light2_a = 0.0;
uniform vec2 screen_px = vec2(1920.0, 1080.0);
uniform vec4 extra_lights[12];
// _initLightStamps(4562) 방사 스탬프: [0,1][.25,.92][.5,.50][.75,.15][1,0] 선형 보간
float stamp(float t) {
	if (t >= 1.0) { return 0.0; }
	if (t < 0.25) { return mix(1.0, 0.92, t / 0.25); }
	if (t < 0.5) { return mix(0.92, 0.50, (t - 0.25) / 0.25); }
	if (t < 0.75) { return mix(0.50, 0.15, (t - 0.5) / 0.25); }
	return mix(0.15, 0.0, (t - 0.75) / 0.25);
}
void fragment() {
	vec2 px = UV * screen_px;
	float hole = clamp(light_a * stamp(distance(px, light_px) / light_r), 0.0, 1.0);
	float hole2 = clamp(light2_a * stamp(distance(px, light2_px) / light2_r), 0.0, 1.0);
	// destination-out 누적: 어둠 알파 *= Π(1 - 광원 알파)
	float a=ambient.a*(1.0-hole)*(1.0-hole2);
 for(int i=0;i<12;i++){vec4 l=extra_lights[i];if(l.z>0.0)a*=1.0-clamp(l.w*stamp(distance(px,l.xy)/l.z),0.0,1.0);}
 COLOR=vec4(ambient.rgb,a);
}
"

const FOG2D_SHADER := "
shader_type canvas_item;
render_mode blend_mix;
uniform vec4 bot_col : source_color;
uniform vec4 top_col : source_color;
uniform float clock_ms=0.0;
void fragment() {
	// _bakeFogLayers(4366): 하단 y .6→1 (0, .3지점부터 평탄), 상단 y 0→.3 (색→투명)
	vec4 c = vec4(0.0);
	if (UV.y >= 0.6) {
		float t = (UV.y - 0.6) / 0.4;
		float k = t < 0.3 ? t / 0.3 : 1.0;
		c = vec4(bot_col.rgb, bot_col.a * k);
	}
	if (UV.y <= 0.3) {
		// merged: 상단층은 .6배로 합성(55361)
		vec4 top = vec4(top_col.rgb, top_col.a * (1.0 - UV.y / 0.3) * 0.6);
		c = top;
	}
	// 화면 알파 펄스 .28 + sin(t_ms·π/2000)·.08 (55356) — 원본 밀리초 clock, 주기4s
	COLOR = vec4(c.rgb, c.a * (0.28 + sin(clock_ms * PI / 2000.0) * 0.08));
}
"

const FOG_GL_SHADER := "
shader_type canvas_item;
render_mode blend_mix;
uniform float fog_time=0.0;
uniform vec3 u_col = vec3(0.10, 0.18, 0.08);
uniform vec2 u_res = vec2(1920.0, 1080.0);
// _fogGLInit(8976) 프래그먼트 1:1 — hash/noise/fbm 동일 상수
float f_hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float f_noise(vec2 p) {
	vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
	return mix(mix(f_hash(i), f_hash(i + vec2(1, 0)), f.x),
		mix(f_hash(i + vec2(0, 1)), f_hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * f_noise(p); p *= 2.0; a *= 0.5; } return v; }
void fragment() {
	vec2 uv = vec2(UV.x, 1.0 - UV.y); // THREE plane uv는 y-상향
	float ar = u_res.x / u_res.y;
	float t = fog_time; // 웹 uTime += 0.016/프레임 ≈ 초
	float f1 = fbm(vec2(uv.x * ar * 3.0 + t * 0.06, uv.y * 3.0 + t * 0.02));
	float f2 = fbm(vec2(uv.x * ar * 2.0 - t * 0.04, uv.y * 2.0 + sin(t * 0.1) * 0.3));
	float f3 = fbm(vec2(uv.x * ar * 5.0 + t * 0.08, uv.y * 4.0 - t * 0.03));
	float fog = f1 * 0.5 + f2 * 0.35 + f3 * 0.15;
	fog = smoothstep(0.15, 0.85, fog);
	float d = length((uv - vec2(0.5)) * vec2(ar, 1.0));
	fog *= mix(0.50, 1.0, smoothstep(0.0, 0.62, d));
	float alpha = fog * 0.41;
	// THREE premultipliedAlpha:false + 일반 알파 합성과 동형: 직색(uCol*fog*0.8)/알파
	// THREE normal transparent blend writes rgb * alpha into a transparent FBO.
	// Its premultipliedAlpha:false DOM canvas then composites that straight RGB.
	COLOR = vec4(u_col * fog * 0.8 * alpha, alpha);
}
"

const VIGNETTE_SHADER := "
shader_type canvas_item;
render_mode blend_mix;
uniform vec3 vig_rgb = vec3(0.0784, 0.2353, 0.4706);
uniform vec2 screen_px = vec2(1920.0, 1080.0);
void fragment() {
	// 55396: radial(중심, r0=.35W → r1=.7W), 0→투명, .7→vc(.05), 1→vc(.15), 전체 ×.2
	vec2 px = UV * screen_px;
	float r0 = screen_px.x * 0.35;
	float r1 = screen_px.x * 0.7;
	float t = clamp((distance(px, screen_px * 0.5) - r0) / (r1 - r0), 0.0, 1.0);
	float a = t < 0.7 ? mix(0.0, 0.05, t / 0.7) : mix(0.05, 0.15, (t - 0.7) / 0.3);
	COLOR = vec4(vig_rgb, a * 0.2);
}
"

const FILTER_SHADER := "
shader_type canvas_item;
uniform sampler2D screen_tex : hint_screen_texture, filter_nearest;
void fragment() {
	// 55414~55419: OPT.grain=true → canvas.style.filter 'contrast(1.05) brightness(0.97)'
	vec4 c = texture(screen_tex, SCREEN_UV);
	c.rgb = (c.rgb - 0.5) * 1.05 + 0.5;
	c.rgb *= 0.97;
	COLOR = vec4(clamp(c.rgb, 0.0, 1.0), 1.0);
}
"


func configure(world: Node, player: Node2D) -> bool:
	if _configured or not is_instance_valid(world) or not is_instance_valid(player):
		return false
	_world = world
	_player = player
	layer = 5 # 월드(0) 위·HUD(10) 아래 — 원본: 캔버스 합성은 HUD DOM 비대상
	_half_view=SubViewport.new()
	_half_view.name="NativeHalfLightmap";_half_view.transparent_bg=true
	_half_view.disable_3d=true;_half_view.render_target_update_mode=SubViewport.UPDATE_ALWAYS
	add_child(_half_view)
	_lightmap=ColorRect.new();_lightmap.name="NativeLightmap"
	var light_shader:=Shader.new();light_shader.code=LIGHTMAP_SHADER
	var light_material:=ShaderMaterial.new();light_material.shader=light_shader;_lightmap.material=light_material
	_half_view.add_child(_lightmap)
	_half_display=TextureRect.new();_half_display.name="NativeHalfLightmapDisplay";_half_display.texture=_half_view.get_texture()
	_half_display.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
	_half_display.mouse_filter=Control.MOUSE_FILTER_IGNORE;add_child(_half_display)
	_half_display.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_static_lights=JSON.parse_string(FileAccess.get_file_as_string("res://assets/map/web_parity/detail02/lights.json")).statics
	_light_values.resize(12)
	for i in _static_lights.size():
		var color_sprite:=Sprite2D.new();color_sprite.texture=load("res://assets/map/web_parity/detail02/color%d.png"%([3,0,4][mini(i,2)]))
		var add_material:=CanvasItemMaterial.new();add_material.blend_mode=CanvasItemMaterial.BLEND_MODE_ADD;color_sprite.material=add_material
		color_sprite.name="NativeStaticColor%d"%i
		color_sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(color_sprite);_static_colors.append(color_sprite)
	_iris_color=Sprite2D.new();_iris_color.name="NativeIrisColor"
	_iris_color.texture=load("res://assets/map/web_parity/detail02/color0.png")
	var iris_add:=CanvasItemMaterial.new();iris_add.blend_mode=CanvasItemMaterial.BLEND_MODE_ADD;_iris_color.material=iris_add
	_iris_color.modulate.a=0;_iris_color.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(_iris_color)
	_fog2d = _shader_rect("NativeFog2D", FOG2D_SHADER)
	(_fog2d.material as ShaderMaterial).set_shader_parameter("bot_col", FOG_BOT)
	(_fog2d.material as ShaderMaterial).set_shader_parameter("top_col", FOG_TOP)
	var env := ColorRect.new()
	_env=env
	env.name = "NativeEnvLight"
	add_child(env)
	env.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	env.color = ENV_LIGHT
	env.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_vignette = _shader_rect("NativeVignette", VIGNETTE_SHADER)
	(_vignette.material as ShaderMaterial).set_shader_parameter("vig_rgb", VIGNETTE_RGB)
	var backbuffer := BackBufferCopy.new()
	backbuffer.name = "NativeFilterCopy"
	backbuffer.copy_mode = BackBufferCopy.COPY_MODE_VIEWPORT
	add_child(backbuffer)
	_filter_rect = _shader_rect("NativeColorFilter", FILTER_SHADER)
	_fog_gl = _shader_rect("NativeFogGL", FOG_GL_SHADER)
	(_fog_gl.material as ShaderMaterial).set_shader_parameter("u_col", FOG_GL_COL)
	_configured = true
	return true


func _shader_rect(rect_name: String, code: String) -> ColorRect:
	var rect := ColorRect.new()
	rect.name = rect_name
	add_child(rect)
	rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var shader := Shader.new()
	shader.code = code
	var material := ShaderMaterial.new()
	material.shader = shader
	rect.material = material
	rect.color = Color(1, 1, 1, 1)
	return rect


func _process(_delta: float) -> void:
	if not _configured or not is_instance_valid(_player):
		return
	_clock_ms=float(Time.get_ticks_msec())
	_fog_time+=.016
	var viewport_size: Vector2 = get_viewport().get_visible_rect().size
	var camera: Camera2D = get_viewport().get_camera_2d()
	var center: Vector2 = camera.get_screen_center_position() if is_instance_valid(camera) else _player.global_position
	# 플레이어 광원 (P.x, P.y-6) → 화면 px (4652)
	var light_px: Vector2 = viewport_size * 0.5 + (_player.global_position + Vector2(0, -6) - center)
	var frame: float=float(_stage_draws) # source _gameFrame is the render counter, not the 60Hz simulation tick
	if _parity_frame>=0:frame=float(_parity_frame)
	var refresh_light: bool=int(frame)%3==0 or center!=_last_light_center or viewport_size!=_last_light_size or _parity_frame>=0
	if refresh_light:
		_last_light_center=center;_last_light_size=viewport_size
		_half_view.render_target_update_mode=SubViewport.UPDATE_ONCE
		var half_size:=Vector2i(int(viewport_size.x/2),int(viewport_size.y/2))
		if _half_view.size!=half_size:_half_view.size=half_size;_lightmap.size=Vector2(half_size)
		for i in _static_lights.size():
			var l: Dictionary=_static_lights[i]
			var pos:=viewport_size*.5+Vector2(l.x,l.y)-center
			var a: float=l.a*(1+sin(frame*.09+i*1.7)*.10*l.f)
			var culled: bool=pos.x< -300 or pos.y< -300 or pos.x>viewport_size.x+300 or pos.y>viewport_size.y+300
			if culled:a=0.0
			_light_values[i]=Vector4(pos.x,pos.y,float(int(l.r*.5))*2,a)
			var sprite: Sprite2D=_static_colors[i];sprite.position=pos;sprite.scale=Vector2.ONE*l.r*2/sprite.texture.get_width()
			sprite.modulate.a=a*.85*.62
		var mat: ShaderMaterial = _lightmap.material
		mat.set_shader_parameter("extra_lights",_light_values)
		mat.set_shader_parameter("ambient", AMBIENT)
		mat.set_shader_parameter("light_px", light_px)
		mat.set_shader_parameter("light_r", PLAYER_LIGHT_R)
		mat.set_shader_parameter("light_a", PLAYER_LIGHT_A + sin(frame * 0.07) * 0.03)
		mat.set_shader_parameter("screen_px", viewport_size)
	(_fog2d.material as ShaderMaterial).set_shader_parameter("clock_ms",_clock_ms)
	(_fog_gl.material as ShaderMaterial).set_shader_parameter("fog_time",_fog_time)
	(_vignette.material as ShaderMaterial).set_shader_parameter("screen_px", viewport_size)
	(_fog_gl.material as ShaderMaterial).set_shader_parameter("u_res", viewport_size)
	_stage_draws += 1


## P2-004a — 이리스 펫 광원(_collectLights 4686~4690): r=OPT.irisGlow‖250,
## a=(.45+sin(f·.1)·.08+sin(f·.17)·.05)×.6, 색(255,200,90)은 원본 색층(ci0) 스탬프로 합성.
## 위치/활성/상태는 기존 펫 어댑터 입력만 읽는다.
func set_native_iris_light(screen_pos: Vector2, radius: float, alpha: float) -> void:
	if not _configured:
		return
	var mat: ShaderMaterial = _lightmap.material
	mat.set_shader_parameter("light2_px", screen_pos)
	mat.set_shader_parameter("light2_r", radius)
	mat.set_shader_parameter("light2_a", clampf(alpha, 0.0, 1.0))
	_iris_color.position=screen_pos;_iris_color.scale=Vector2.ONE*radius*2/_iris_color.texture.get_width()
	_iris_color.modulate.a=clampf(alpha,0.0,1.0)*.85*.62


## MAP-LOOK(2026-10-20): 맵 표현 강화 레이어가 실제 2D 광원 기반 어둠(CanvasModulate)을
## 쓰는 동안 원본 라이트맵 어둠 단계만 끈다. 안개·환경광·비네트·색보정은 유지.
func set_native_lightmap_enabled(enabled: bool) -> void:
	if is_instance_valid(_lightmap):
		_half_display.visible = enabled


func is_native_lightmap_enabled() -> bool:
	return is_instance_valid(_lightmap) and _half_display.visible


func get_native_screen_lighting_snapshot() -> Dictionary:
	return {"configured": _configured, "layer": layer, "stage_draws": _stage_draws,
		"ambient": [6, 16, 9, 0.38], "player_light": {"r": PLAYER_LIGHT_R, "a": PLAYER_LIGHT_A},
		"stages": ["lightmap_55199", "static_colors_4715", "fog2d_55352", "env_light_55377",
			"vignette_55389", "color_filter_55414", "dom_fog_gl_8976"],
		"children": get_children().map(func(c): return str(c.name)),
		"half_resolution": true, "static_light_count": _static_lights.size(),
		"unported": ["전투 동적 광원/블룸 소비자는 별도 범위",
			"토치 어둠(_TORCH.darkAlpha=0 — 원본도 비활성)", "블룸(소스=이리스/보스 — 펫 미이식·보스 원거리)",
			"ATMOS 입자/갓레이(PP 패스)·사이드포그(CH1 제외 — 원본 규칙)", "보스아레나 비네트 α.35~.65 분기",
			"GL 프록시 lighter no-op 규칙(이 머신 실측=Canvas2D·대상 레이어 기여 0)"]}

# Capture clock adapter, visual-only. Natural play advances milliseconds and render count.
func set_parity_visual_clock(now_ms: float, fog_frames: int, light_frame: int=-1) -> void:
	_parity_frame=light_frame
	_process(0.0)
	_clock_ms=now_ms;_fog_time=float(fog_frames)*.016
	(_fog2d.material as ShaderMaterial).set_shader_parameter("clock_ms",_clock_ms)
	(_fog_gl.material as ShaderMaterial).set_shader_parameter("fog_time",_fog_time)
