shader_type canvas_item;
uniform bool tissue = false;
void fragment() {
 vec4 s = texture(TEXTURE,UV);
 float l = dot(s.rgb,vec3(.299,.587,.114));
 vec3 tint = tissue ? vec3(.53,.23,.22) : vec3(.38,.25,.24);
 vec3 skin = tint*(.45+l*1.35);
 float edge = 1.0-smoothstep(.15,.53,length((UV-.5)*vec2(.88,1.0)));
 COLOR = vec4(skin,s.a*edge*.72);
}
