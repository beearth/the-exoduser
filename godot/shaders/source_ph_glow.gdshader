shader_type canvas_item;
render_mode unshaded, blend_premul_alpha;
uniform vec2 axis = vec2(1., 0.);
uniform float blur_radius = 25.;

void fragment() {
	vec4 result = vec4(0.);
	float weight_sum = 0.;
	float sigma = blur_radius / 2.;
	int extent = int(ceil(sigma * 3.));
	for (int offset = -extent; offset <= extent; offset++) {
		float weight = exp(-float(offset * offset) / (2. * sigma * sigma));
		vec4 sample_color = texture(TEXTURE, UV + axis * TEXTURE_PIXEL_SIZE * float(offset));
		result += sample_color * weight;
		weight_sum += weight;
	}
	COLOR = result / weight_sum * COLOR;
}
