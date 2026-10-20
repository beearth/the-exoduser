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
 // Preserve cold recesses without crushing the bark to black.
 color=max(color,vec3(.075,.069,.072));
 COLOR=vec4(color,source.a*instance_tint.a);
}
