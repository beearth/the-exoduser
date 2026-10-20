shader_type canvas_item;
render_mode blend_mix;
// Lit world geometry, deliberately no screen texture, unshaded pass, or screen veil.
uniform sampler2D density_mask : filter_linear, repeat_disable;
uniform vec2 map_origin;
uniform vec2 map_size;
uniform vec2 parallax_offset;
uniform vec2 flow = vec2(5.0, -1.0);
uniform float visual_time = 0.0;
uniform float phase = 0.0;
uniform float opacity = 0.12;
uniform float noise_scale = 0.003;
varying vec2 world_xy;

float hash21(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
	vec2 i = floor(p), f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
		mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
void vertex() {
	world_xy = (MODEL_MATRIX * vec4(VERTEX, 0.0, 1.0)).xy;
}
void fragment() {
	vec2 uv = (world_xy - map_origin) / map_size;
	float mask = texture(density_mask, uv).r;
	vec2 p = (world_xy + parallax_offset - flow * visual_time) * noise_scale + vec2(phase, phase * 0.73);
	// Broad drifting folds, no fine grain or bright particle speckle.
	float broad = noise(p + vec2(noise(p * 0.61), noise(p * 0.59 + 7.0)) * 1.7);
	float detail = noise(p * 2.1 - vec2(visual_time * 0.009, 0.0));
	float fold = smoothstep(0.20, 0.82, broad * 0.78 + detail * 0.22);
	float edge = smoothstep(0.0, 0.035, uv.x) * smoothstep(0.0, 0.035, uv.y)
		* smoothstep(0.0, 0.035, 1.0 - uv.x) * smoothstep(0.0, 0.035, 1.0 - uv.y);
	COLOR = vec4(vec3(0.47, 0.51, 0.56), opacity * mask * fold * edge);
}
void light() {
	// Volume-like scattering: actual PointLight2D texture/color/energy, not fake light probes.
	LIGHT = vec4(COLOR.rgb * LIGHT_COLOR.rgb * LIGHT_ENERGY * 0.8, LIGHT_COLOR.a);
}
