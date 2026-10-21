shader_type canvas_item;
render_mode unshaded;
uniform sampler2D veins:filter_linear;
uniform float pulse_strength=.012;
uniform float pulse_hz=.16;
void fragment(){
 vec4 a=texture(TEXTURE,UV);
 // Identity LUT is baked offline; static grade costs no fragment lookups.
 float beat=.5+.5*sin(TIME*6.2831853*pulse_hz);
 a.rgb+=vec3(.38,.06,.10)*texture(veins,UV).r*beat*pulse_strength;
 COLOR=a;
}
