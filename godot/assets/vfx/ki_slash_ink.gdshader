shader_type canvas_item;
render_mode unshaded, blend_mix;
// P2-007a — 원본 기검참 검은 잉크 층(game.html 16745~16751 _kiSlashShadowSurface) 재현.
// 원본: 시트 전체를 blur(max(2,round(w/260))px)로 그린 뒤 픽셀마다
// l=max(r,g,b)·(a/255) → a=min(255,l·2.4), rgb=(5,4,6). 그리기는 일반 합성(source-over / GL _setBlend(false)).
// blur_px: 1254px 시트 → round(1254/260)=5. 가우시안 σ=blur_px를 11×11 탭(간격 0.6σ, ±3σ)으로 근사.
uniform float blur_px = 5.0;
varying vec4 vertex_tint;
void vertex() { vertex_tint = COLOR; }
void fragment() {
    vec2 texel = 1.0 / vec2(textureSize(TEXTURE, 0));
    float sigma = max(blur_px, 0.001);
    vec3 premul = vec3(0.0);
    float weight_sum = 0.0;
    for (int y = -5; y <= 5; y++) {
        for (int x = -5; x <= 5; x++) {
            vec2 offset = vec2(float(x), float(y)) * (sigma * 0.6);
            float weight = exp(-dot(offset, offset) / (2.0 * sigma * sigma));
            vec4 tap = texture(TEXTURE, UV + offset * texel);
            premul += tap.rgb * tap.a * weight;
            weight_sum += weight;
        }
    }
    premul /= weight_sum;
    float ink_l = max(premul.r, max(premul.g, premul.b));
    COLOR = vec4(vec3(5.0, 4.0, 6.0) / 255.0, min(1.0, ink_l * 2.4)) * vertex_tint;
}
