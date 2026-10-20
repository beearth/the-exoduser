shader_type canvas_item;
render_mode unshaded, blend_mix;

uniform float fixed_time = 2.0;
uniform float aspect = 1.7777778;
uniform vec3 fog_color : source_color = vec3(0.16, 0.185, 0.19);

void fragment() {
	// Broad continuous veils, without grain, random points, or imported artwork.
	vec2 p = UV * vec2(aspect, 1.0);
	float a = sin(p.x * 3.4 + p.y * 5.2 + fixed_time * 0.07);
	float b = sin(p.x * 1.6 - p.y * 3.5 - fixed_time * 0.04);
	float veil = smoothstep(-0.9, 1.8, a * 0.65 + b * 0.35);
	float edge = smoothstep(0.24, 0.78, length((UV - vec2(0.5)) * vec2(1.1, 1.0)));
	float ground_haze = smoothstep(0.55, 1.0, UV.y);
	COLOR = vec4(fog_color, veil * (0.012 + 0.035 * edge + 0.012 * ground_haze));
}
