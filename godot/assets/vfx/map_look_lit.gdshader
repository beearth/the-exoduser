shader_type canvas_item;
// MAP-LOOK(2026-10-20) — 맵 표현 강화 레이어 전용. 원본 그림 파일은 그대로 두고
// ① 그림 명암에서 요철 노멀을 실시간 계산해 2D 광원이 면을 비추게 하고
// ② (나무만) 수관 쪽을 바람에 흔든다. 노멀맵 파일·AI 생성 텍스처 없음.

uniform float bump_strength = 2.4;   // 명암 기울기 → 노멀 기울기 배율
uniform float bump_radius = 1.5;     // 샘플 간격(텍스처 픽셀)
uniform float sway_amp = 0.0;        // 로컬 픽셀(스케일 전) — 0이면 흔들림 없음
uniform float sway_speed = 0.55;
uniform float sway_phase = 0.0;
uniform float sway_root = 0.62;      // 이 UV.y 아래(밑동)는 고정

void vertex() {
	if (sway_amp > 0.0) {
		float k = clamp((sway_root - UV.y) / max(sway_root, 0.001), 0.0, 1.0);
		k = k * k;
		float t = TIME * sway_speed + sway_phase;
		VERTEX.x += (sin(t) + 0.35 * sin(t * 2.31 + sway_phase * 1.7)) * sway_amp * k;
		VERTEX.y += 0.25 * sin(t * 1.63 + sway_phase) * sway_amp * k;
	}
}

void fragment() {
	vec2 px = TEXTURE_PIXEL_SIZE * bump_radius;
	const vec3 W = vec3(0.299, 0.587, 0.114);
	vec4 cl = texture(TEXTURE, UV - vec2(px.x, 0.0));
	vec4 cr = texture(TEXTURE, UV + vec2(px.x, 0.0));
	vec4 cu = texture(TEXTURE, UV - vec2(0.0, px.y));
	vec4 cd = texture(TEXTURE, UV + vec2(0.0, px.y));
	float l = dot(cl.rgb, W) * cl.a;
	float r = dot(cr.rgb, W) * cr.a;
	float u = dot(cu.rgb, W) * cu.a;
	float d = dot(cd.rgb, W) * cd.a;
	// 밝은 쪽이 튀어나온 면으로 읽히도록(높이 = 명암). y는 화면 아래가 +.
	NORMAL = normalize(vec3((l - r) * bump_strength, (u - d) * bump_strength, 1.0));
}
