shader_type canvas_item;
void fragment(){
 vec2 p=UV-vec2(.5);float a=TIME*.05;mat2 spin=mat2(vec2(cos(a),-sin(a)),vec2(sin(a),cos(a)));float r=length(p)*2.0;
 vec3 sigil=texture(TEXTURE,spin*p+vec2(.5)).rgb;float rail=exp(-pow((r-.76)*95.0,2.0))+exp(-pow((r-.49)*95.0,2.0))+exp(-pow((r-.96)*110.0,2.0));
 vec3 color=sigil*vec3(.75,.61,.45)+rail*vec3(.4,.25,.10);color+=rail*vec3(.28,.08,.02)*(.6+.4*sin(TIME*1.3));
 COLOR=vec4(color,1.0-smoothstep(.975,1.0,r));
}
