shader_type canvas_item;
// Offline original skill-forge-3d.js altar. Rotation is the source .05 rad/sec.
void fragment(){
 vec2 p=UV-vec2(.5);float a=TIME*.05;
 mat2 spin=mat2(vec2(cos(a),-sin(a)),vec2(sin(a),cos(a)));
 COLOR=texture(TEXTURE,spin*p+vec2(.5));
}
