shader_type canvas_item;
render_mode unshaded;
// MAP-LOOK — 소품 투사 그림자·전경 실루엣. 원본 그림의 알파만 흐리게 읽어 단색으로 칠한다.
uniform vec4 tint : source_color = vec4(0.0, 0.0, 0.0, 0.5);
uniform float blur_px = 6.0;   // 텍스처 픽셀 단위 흐림 반경

void fragment() {
	vec2 s = TEXTURE_PIXEL_SIZE * blur_px;
	float a = 0.0;
	a += texture(TEXTURE, UV).a * 4.0;
	a += texture(TEXTURE, UV + vec2(s.x, 0.0)).a * 2.0;
	a += texture(TEXTURE, UV - vec2(s.x, 0.0)).a * 2.0;
	a += texture(TEXTURE, UV + vec2(0.0, s.y)).a * 2.0;
	a += texture(TEXTURE, UV - vec2(0.0, s.y)).a * 2.0;
	a += texture(TEXTURE, UV + s).a;
	a += texture(TEXTURE, UV - s).a;
	a += texture(TEXTURE, UV + vec2(s.x, -s.y)).a;
	a += texture(TEXTURE, UV + vec2(-s.x, s.y)).a;
	a /= 16.0;
	COLOR = vec4(tint.rgb, tint.a * a * COLOR.a);
}
