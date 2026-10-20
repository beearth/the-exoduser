shader_type canvas_item;
render_mode unshaded;
void fragment() {
 float edge = smoothstep(.25,.76,length((SCREEN_UV-.5)*vec2(1.15,1.0)));
 COLOR = vec4(.012,.008,.017,edge*.16);
}
