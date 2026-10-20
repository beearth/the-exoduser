shader_type canvas_item;
render_mode unshaded;

uniform sampler2D screen_tex : hint_screen_texture, filter_nearest;

void fragment() {
	vec3 c = texture(screen_tex, SCREEN_UV).rgb;
	float luminance = dot(c, vec3(0.299, 0.587, 0.114));
	c = mix(vec3(luminance), c, 0.92);
	c = (c - 0.5) * 1.04 + 0.5;
	c *= vec3(1.025, 1.005, 0.985);
	COLOR = vec4(clamp(c, vec3(0.0), vec3(1.0)), 1.0);
}
