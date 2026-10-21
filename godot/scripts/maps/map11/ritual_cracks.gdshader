shader_type canvas_item;
render_mode unshaded;
uniform float glow_strength=.10;
void fragment(){
 vec4 s=texture(TEXTURE,UV);
 float relief=dot(s.rgb,vec3(.299,.587,.114));
 float pulse=.5+.5*sin(TIME*.75);
 vec3 tissue=mix(vec3(.22,.037,.031),vec3(.43,.105,.075),smoothstep(.25,.70,relief));
 tissue+=vec3(glow_strength,.012,.008)*(.75+.25*pulse);
 COLOR=vec4(tissue,s.a*.88);
}
