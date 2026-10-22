shader_type canvas_item;
// Offline original skill-forge-3d.js altar. Rotation is the source .05 rad/sec.
void fragment(){
 vec2 p=UV-vec2(.5);float a=TIME*.05;
 mat2 spin=mat2(vec2(cos(a),-sin(a)),vec2(sin(a),cos(a)));
 vec4 art=texture(TEXTURE,spin*p+vec2(.5));
 float pulse=.5+.5*sin(TIME*3.2);
 float rune=max(0.,art.r-art.b)*smoothstep(.2,.65,art.r);
 art.rgb+=vec3(1.,.35,.09)*rune*(.45+.25*pulse)*.18;
 COLOR=art;
}
