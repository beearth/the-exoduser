shader_type canvas_item;
render_mode unshaded, blend_mix;

// Separate surface paint, NOT a replacement material on the source sprite.
// Every contribution, including low vapour, is clipped to the original alpha.
uniform float visual_time = 0.0;
uniform float surface_phase = 0.0;
uniform int surface_kind = 0; // pool / poison pit / toxic growth
uniform vec4 bubble_sites[8]; // seeded UV, radius, phase; instance-local RNG

float hash21(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}
float noise2(vec2 p) {
	vec2 i = floor(p), f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x),
		mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y);
}
void fragment() {
	vec4 source = texture(TEXTURE, UV);
	// Linear filtering can bleed a neighbouring opaque texel into transparent
	// source pixels. Erode the effect mask by ONE original texel, not the art.
	vec2 px = TEXTURE_PIXEL_SIZE;
	vec2 center = (floor(UV / px) + 0.5) * px;
	float inside = texture(TEXTURE, center).a;
	inside = min(inside, texture(TEXTURE, center + vec2(px.x, 0)).a);
	inside = min(inside, texture(TEXTURE, center - vec2(px.x, 0)).a);
	inside = min(inside, texture(TEXTURE, center + vec2(0, px.y)).a);
	inside = min(inside, texture(TEXTURE, center - vec2(0, px.y)).a);
	inside = min(inside, texture(TEXTURE, center + px).a);
	inside = min(inside, texture(TEXTURE, center - px).a);
	inside = min(inside, texture(TEXTURE, center + vec2(px.x, -px.y)).a);
	inside = min(inside, texture(TEXTURE, center + vec2(-px.x, px.y)).a);
	float alpha = smoothstep(0.90, 0.99, inside) * smoothstep(0.12, 0.98, source.a);
	vec2 basin_center = surface_kind == 1 ? vec2(0.5, 0.57) : vec2(0.5, 0.50);
	vec2 p = (UV - basin_center) * vec2(1.0, 1.22);
	float basin = 1.0 - smoothstep(0.32, 0.47, length(p));
	float green = smoothstep(0.006, 0.080, source.g - max(source.r * 0.98, source.b));
	// The growth art has nearly black water. Relative chroma finds that liquid
	// without requiring a bright green pixel or painting its brown stone rim.
	if (surface_kind == 2) {
		float chroma = (source.g - max(source.r * 0.98, source.b)) / max(source.g, 0.015);
		green = smoothstep(0.04, 0.30, chroma);
	}
	float liquid = basin * green;
	if (surface_kind == 1) liquid = basin;
	float t = visual_time * 0.24 + surface_phase;
	vec2 drift = vec2(t * 0.12, -t * 0.07);
	float flow = noise2(UV * 9.0 + drift);
	float deep = noise2(UV * 5.0 + vec2(flow * 0.8, t * 0.05));
	// Broken moving ribbons rather than another regular concentric target disk.
	float wave = sin(UV.y * 67.0 + UV.x * 14.0 + flow * 7.0 - t * 2.4);
	float ribbon = smoothstep(0.79, 0.99, wave) * smoothstep(0.42, 0.80, deep);
	float reflection = exp(-pow((UV.y - 0.39 - 0.025 * sin(UV.x * 22.0 + t)) * 34.0, 2.0));
	reflection *= smoothstep(0.33, 0.78, flow) * (0.65 + 0.35 * sin(UV.x * 34.0 + t));
	float bubbles = 0.0;
	for (int i = 0; i < 8; i++) {
		vec4 site = bubble_sites[i];
		float life = fract(visual_time * 0.13 + site.w);
		vec2 q = (UV - site.xy - vec2(0.003 * sin(t + float(i)), -life * 0.008)) * vec2(1, 1.25);
		float r = site.z * (0.5 + life);
		float ring = 1.0 - smoothstep(0.0015, 0.004, abs(length(q) - r));
		float glint = smoothstep(-0.003, 0.006, -q.x - q.y);
		bubbles += ring * glint * sin(life * 3.14159) * 0.22;
	}
	// Slow, broad vapour wisps stay low; no particles or luminous green fog wall.
	float vapour = noise2(UV * vec2(8, 15) + vec2(t * 0.10, t * 0.20));
	vapour *= noise2(UV * 5.0 + vec2(-t * 0.08, t * 0.11));
	vapour = smoothstep(0.25, 0.62, vapour) * (1.0 - smoothstep(0.2, 0.46, abs(UV.y - 0.47)));
	float pit = float(surface_kind == 1);
	float growth = float(surface_kind == 2);
	float absorption = mix(0.18, 0.56, pit) + deep * mix(0.16, 0.25, pit);
	absorption *= mix(1.0, 0.35, growth);
	float sheen = (ribbon * 0.19 + reflection * 0.34 + bubbles) * mix(0.85, 1.25, pit);
	vec3 deep_color = mix(vec3(0.014, 0.024, 0.018), vec3(0.037, 0.055, 0.025), deep);
	vec3 color = mix(deep_color, vec3(0.30, 0.34, 0.21), clamp(sheen * 3.0, 0.0, 1.0));
	color = mix(color, vec3(0.15, 0.19, 0.12), vapour * 0.45);
	float opacity = absorption + sheen * 0.35 + vapour * 0.07;
	COLOR = vec4(color, clamp(opacity, 0.0, 0.86) * liquid * alpha);
}
