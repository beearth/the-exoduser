shader_type canvas_item;
render_mode unshaded, blend_mix;

uniform float visual_time = 0.0;
uniform float hole_phase = 0.0;
uniform float pulse_phase = 0.0;
uniform float activity = 0.0;
uniform float rim_gain = 0.65;
uniform float opacity = 1.0;

void fragment() {
	vec2 point = (UV - vec2(0.5)) * 3.3;
	point.y *= 1.10;
	float radius = length(point);
	float angle = atan(point.y, point.x);
	float clock = visual_time * (0.55 + activity * 0.65);
	float swell = sin(pulse_phase) * 0.5 + 0.5;
	float warp = sin(angle * 5.0 + sin(angle * 3.0 + hole_phase) + clock) * 0.033;
	warp += sin(angle * 9.0 - clock * 1.4 + hole_phase) * 0.018;
	float edge = radius + warp;
	float rim = exp(-pow((edge - 0.82 - swell * 0.016) / 0.065, 2.0));
	float lip = exp(-pow((edge - 0.94) / 0.13, 2.0));
	float broken_arc = 0.10 + 0.90 * pow(sin(angle * 2.0 + hole_phase + clock * 0.3) * 0.5 + 0.5, 2.0);
	float pulse = (0.65 + swell * 0.35) * rim_gain;
	float throat = 1.0 - smoothstep(0.48, 0.92, edge);
	float inward = sin(radius * 24.0 + angle * 3.0 + clock * 2.8 + hole_phase);
	float folds = pow(inward * 0.5 + 0.5, 5.0) * smoothstep(0.25, 0.7, radius) * (1.0 - smoothstep(0.78, 0.94, edge));
	vec3 violet = vec3(0.28, 0.075, 0.24);
	vec3 blood = vec3(0.43, 0.075, 0.12);
	vec3 rim_color = mix(violet, blood, sin(angle * 3.0 + hole_phase) * 0.5 + 0.5);
	vec3 color = vec3(0.008, 0.005, 0.015) + folds * vec3(0.045, 0.014, 0.046);
	color += rim_color * rim * broken_arc * pulse;
	color += vec3(0.14, 0.025, 0.095) * lip * broken_arc * pulse * 0.4;
	float alpha = max(throat * 0.84, max(rim * 0.86, lip * 0.27));
	float dust = 0.0;
	for (int strand = 0; strand < 7; strand++) {
		float lane = float(strand);
		float travel = fract(visual_time * (0.12 + activity * 0.09) + lane * 0.173 + hole_phase);
		float radial = mix(1.45, 0.48, travel * travel);
		float bearing = lane * 2.39996 + hole_phase + travel * 0.65;
		vec2 head = vec2(cos(bearing), sin(bearing)) * radial;
		vec2 difference = point - head;
		vec2 direction = vec2(cos(bearing - 0.28), sin(bearing - 0.28));
		float along = dot(difference, direction);
		float across = dot(difference, vec2(-direction.y, direction.x));
		float streak = exp(-pow(along / 0.20, 2.0) - pow(across / 0.035, 2.0));
		dust += streak * sin(travel * 3.141593) * 0.75;
	}
	color += vec3(0.58, 0.40, 0.42) * dust;
	alpha = max(alpha, dust * 0.85);
	COLOR = vec4(color, alpha * opacity);
}
