shader_type canvas_item;
uniform float selected=0.0;
uniform bool has_icon=true;
uniform float glass_veil=0.0;
void fragment(){
 vec2 p=UV-vec2(.5);float d=length(p)*2.0;
 vec2 dims=vec2(textureSize(TEXTURE,0));vec2 cover=vec2(min(1.0,dims.y/dims.x),min(1.0,dims.x/dims.y));
 vec4 art=texture(TEXTURE,vec2(.5)+p*cover*.84);
 float metal=clamp(.48+dot(normalize(vec3(p,sqrt(max(0.0,.25-dot(p,p))))),normalize(vec3(-.6,-.9,1.2)))*.55,0.0,1.0);
 vec3 ring=mix(vec3(.12,.085,.06),vec3(.76,.59,.32),metal);
 vec3 c=has_icon?art.rgb:vec3(.035,.025,.023);
 c=mix(c,vec3(.68,.63,.57),glass_veil);
 c=mix(c,ring,smoothstep(.86,.89,d));
 c=mix(c,vec3(.10,.065,.04),smoothstep(.95,.975,d));
 c+=vec3(1,.25,.08)*selected*exp(-pow((d-.91)*25.0,2.0))*(.7+.3*sin(TIME*2.5));
 c+=vec3(1,.86,.68)*pow(max(0.0,1.0-length((p-vec2(-.14,-.22))*vec2(2,5))),9.0)*.26;
 COLOR=vec4(c,1.0-smoothstep(.97,1.0,d));
}
