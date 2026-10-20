shader_type canvas_item;
render_mode unshaded;

// One smooth union, rather than two black stamps darkening the shared centre.
uniform float contact_alpha = 0.42;
uniform float cast_alpha = 0.22;
void fragment() {
	// QuadMesh UV.y grows upward in this 2D mesh; ground +y is south.
	vec2 p = vec2(UV.x - 0.5, 0.5 - UV.y) * vec2(144.0, 88.0);
	float contact = length(p / vec2(24.0, 9.0));
	vec2 q = p - vec2(13.0, 9.0);
	float cast = length(vec2(dot(q, vec2(0.83205, 0.55470)) / 32.0,
		dot(q, vec2(-0.55470, 0.83205)) / 9.0));
	float a = contact_alpha * pow(1.0 - smoothstep(0.0, 1.0, contact), 1.15);
	float b = cast_alpha * pow(1.0 - smoothstep(0.0, 1.0, cast), 1.25);
	COLOR = vec4(vec3(0.018, 0.015, 0.025), max(a, b));
}
