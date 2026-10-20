shader_type canvas_item;
varying vec4 tint;
void vertex(){tint=COLOR;}
void fragment(){
 vec4 s=texture(TEXTURE,UV);
 vec2 q=UV*2.0-1.0;
 float feather=1.0-smoothstep(.28,.96,length(q));
 float l=dot(s.rgb,vec3(.299,.587,.114));
 COLOR=vec4(vec3(l)*vec3(.88,.76,.69)*tint.rgb,s.a*feather*tint.a);
}
