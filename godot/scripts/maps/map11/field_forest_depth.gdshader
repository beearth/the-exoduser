shader_type canvas_item;
uniform float fog=0.0;
uniform float west=0.0;
uniform float east=0.0;
varying vec4 instance_tint;
void vertex() { instance_tint=COLOR; }
void fragment() {
 vec4 source=texture(TEXTURE,UV);
 vec3 color=source.rgb*instance_tint.rgb;
 float lower=smoothstep(.48,.91,UV.y);
 // Low-saturation reflected ground color, never an emissive warning signal.
 color=mix(color,color*vec3(1.18,.94,.76)+vec3(.025,.012,.003),west*lower*.65);
 color=mix(color,color*vec3(.88,1.12,.74)+vec3(.023,.030,.006),east*lower*.70);
 float luminance=dot(color,vec3(.299,.587,.114));
 color=mix(color,mix(vec3(luminance),vec3(.065,.083,.105),.38),fog);
 // Subtle interior edge reflection: depth-dependent, no halo outside alpha.
 vec2 d=TEXTURE_PIXEL_SIZE*2.0;
 float edge=1.0-min(texture(TEXTURE,UV+vec2(d.x,0)).a,texture(TEXTURE,UV-vec2(d.x,0)).a);
 color+=vec3(.16,.075,.055)*edge*(.35+fog);
 COLOR=vec4(color,source.a*instance_tint.a);
}
