extends CanvasLayer
## P2-003a — 원본 맵 조명·어둠·안개·비네트·색보정 오버레이 (표시 전용 소비자).
## 원본 game.html 합성 순서(draw 포스트 구간)와 수치 그대로. 웹 런타임 실측
## (web_light_measure.json, Canvas2D 경로·quality high·hwTier S) 기준.
##  1) 라이트맵 55199 + _renderLighting 4693: 지옥0 어둠 rgba(6,16,9,.38)(_HELL_AMBIENT
##     4505) 전면 → destination-out으로 광원 구멍. 스탬프 falloff(_initLightStamps 4562):
##     [0,1][.25,.92][.5,.50][.75,.15][1,0]. 첫 전투 광원 = 플레이어(P.x,P.y-6, r470,
##     a=.86+sin(frame*.07)*.03 — 4652~4657) 1개. (이리스 펫 광원 r250 a~.25는 펫 미이식,
##     LIT 색층은 ci6 제외(_CENTER_GLOW=false 4637)로 기여 광원 0 — 기록.)
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
## GL 프록시 주의: 'lighter'는 프록시 no-op(6028)이나 이 머신 실측은 Canvas2D 경로이고
## 첫 전투에서 lighter 대상 레이어(LIT 색층·블룸)는 기여 광원 0 — 모드 간 화면차 없음.

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
var _configured := false
var _stage_draws := 0

const LIGHTMAP_SHADER := "
shader_type canvas_item;
render_mode blend_mix;
uniform vec4 ambient : source_color = vec4(0.0235, 0.0627, 0.0353, 0.38);
uniform vec2 light_px = vec2(960.0, 540.0);
uniform float light_r = 470.0;
uniform float light_a = 0.86;
uniform vec2 screen_px = vec2(1920.0, 1080.0);
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
	// destination-out: 어둠 알파 *= (1 - 광원 알파)
	COLOR = vec4(ambient.rgb, ambient.a * (1.0 - hole));
}
"

const FOG2D_SHADER := "
shader_type canvas_item;
render_mode blend_mix;
uniform vec4 bot_col : source_color;
uniform vec4 top_col : source_color;
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
		c = vec4(mix(c.rgb, top.rgb, top.a), c.a + top.a * (1.0 - c.a));
	}
	// 화면 알파 펄스 .28 + sin(t_ms·π/2000)·.08 (55356) — TIME(초)·π/2 = 주기 4s
	COLOR = vec4(c.rgb, c.a * (0.28 + sin(TIME * PI / 2.0) * 0.08));
}
"

const FOG_GL_SHADER := "
shader_type canvas_item;
render_mode blend_mix;
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
	float t = TIME; // 웹 uTime += 0.016/프레임 ≈ 초
	float f1 = fbm(vec2(uv.x * ar * 3.0 + t * 0.06, uv.y * 3.0 + t * 0.02));
	float f2 = fbm(vec2(uv.x * ar * 2.0 - t * 0.04, uv.y * 2.0 + sin(t * 0.1) * 0.3));
	float f3 = fbm(vec2(uv.x * ar * 5.0 + t * 0.08, uv.y * 4.0 - t * 0.03));
	float fog = f1 * 0.5 + f2 * 0.35 + f3 * 0.15;
	fog = smoothstep(0.15, 0.85, fog);
	float d = length((uv - vec2(0.5)) * vec2(ar, 1.0));
	fog *= mix(0.50, 1.0, smoothstep(0.0, 0.62, d));
	float alpha = fog * 0.41;
	// THREE premultipliedAlpha:false + 일반 알파 합성과 동형: 직색(uCol*fog*0.8)/알파
	COLOR = vec4(u_col * fog * 0.8, alpha);
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
	_lightmap = _shader_rect("NativeLightmap", LIGHTMAP_SHADER)
	_fog2d = _shader_rect("NativeFog2D", FOG2D_SHADER)
	(_fog2d.material as ShaderMaterial).set_shader_parameter("bot_col", FOG_BOT)
	(_fog2d.material as ShaderMaterial).set_shader_parameter("top_col", FOG_TOP)
	_fog_gl = _shader_rect("NativeFogGL", FOG_GL_SHADER)
	(_fog_gl.material as ShaderMaterial).set_shader_parameter("u_col", FOG_GL_COL)
	var env := ColorRect.new()
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
	var viewport_size: Vector2 = get_viewport().get_visible_rect().size
	var camera: Camera2D = get_viewport().get_camera_2d()
	var center: Vector2 = camera.get_screen_center_position() if is_instance_valid(camera) else _player.global_position
	# 플레이어 광원 (P.x, P.y-6) → 화면 px (4652)
	var light_px: Vector2 = viewport_size * 0.5 + (_player.global_position + Vector2(0, -6) - center)
	var frame: float = float(_world.get_native_frame()) if is_instance_valid(_world) and _world.has_method("get_native_frame") else 0.0
	var mat: ShaderMaterial = _lightmap.material
	mat.set_shader_parameter("ambient", AMBIENT)
	mat.set_shader_parameter("light_px", light_px)
	mat.set_shader_parameter("light_r", PLAYER_LIGHT_R)
	mat.set_shader_parameter("light_a", PLAYER_LIGHT_A + sin(frame * 0.07) * 0.03)
	mat.set_shader_parameter("screen_px", viewport_size)
	(_vignette.material as ShaderMaterial).set_shader_parameter("screen_px", viewport_size)
	(_fog_gl.material as ShaderMaterial).set_shader_parameter("u_res", viewport_size)
	_stage_draws += 1


func get_native_screen_lighting_snapshot() -> Dictionary:
	return {"configured": _configured, "layer": layer, "stage_draws": _stage_draws,
		"ambient": [6, 16, 9, 0.38], "player_light": {"r": PLAYER_LIGHT_R, "a": PLAYER_LIGHT_A},
		"stages": ["lightmap_55199", "fog2d_55352", "fog_gl_8976", "env_light_55377",
			"vignette_55389", "color_filter_55414"],
		"children": get_children().map(func(c): return str(c.name)),
		"unported": ["이리스 펫 광원(r250·a.25 — 펫 미이식)", "LIT 색층(첫 전투 기여 광원 0 — _CENTER_GLOW=false·ci6 제외)",
			"토치 어둠(_TORCH.darkAlpha=0 — 원본도 비활성)", "블룸(소스=이리스/보스 — 펫 미이식·보스 원거리)",
			"ATMOS 입자/갓레이(PP 패스)·사이드포그(CH1 제외 — 원본 규칙)", "보스아레나 비네트 α.35~.65 분기",
			"라이트맵 하프해상도(원본 C/2 — 풀해상도 근사)", "GL 프록시 lighter no-op 규칙(이 머신 실측=Canvas2D·대상 레이어 기여 0)"]}
