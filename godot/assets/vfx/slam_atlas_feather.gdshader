shader_type canvas_item;
render_mode blend_add;

// Original 2x2 atlas pixels stay untouched. Fade only clipped cell boundaries.
void fragment() {
	vec2 cell_uv = fract(UV * 2.0);
	vec2 edge_distance = min(cell_uv, vec2(1.0) - cell_uv);
	float edge_alpha = smoothstep(0.0, 0.035, min(edge_distance.x, edge_distance.y));
	COLOR.a *= edge_alpha;
}
