shader_type canvas_item;
render_mode unshaded, blend_add;
uniform float hue_degrees = 0.0;
varying vec4 vertex_tint;
void vertex() { vertex_tint = COLOR; }
void fragment() {
    vec4 pixel = texture(TEXTURE, UV);
    float angle = radians(hue_degrees), c = cos(angle), s = sin(angle);
    vec3 rgb = vec3(
        dot(pixel.rgb, vec3(.213 + .787*c - .213*s, .715 - .715*c - .715*s, .072 - .072*c + .928*s)),
        dot(pixel.rgb, vec3(.213 - .213*c + .143*s, .715 + .285*c + .140*s, .072 - .072*c - .283*s)),
        dot(pixel.rgb, vec3(.213 - .213*c - .787*s, .715 - .715*c + .715*s, .072 + .928*c + .072*s))
    );
    COLOR = vec4(clamp(rgb, vec3(0.0), vec3(1.0)), pixel.a) * vertex_tint;
}
