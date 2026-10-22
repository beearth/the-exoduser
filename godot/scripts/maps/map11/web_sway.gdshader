shader_type canvas_item;
render_mode unshaded;
uniform float world_x;
uniform float world_y;
uniform float clock_ms=1000.0;
varying vec4 source_modulate;
void vertex(){source_modulate=COLOR;}
void fragment(){
 float wy=world_y+(floor(UV.y*8.0)+.5)*125.0;
 float wx=world_x+500.0;
 float dx=3.8*sin(clock_ms*.00055+wy*.001+wx*.00025)+1.2*sin(clock_ms*.00031-wy*.0007+wx*.00035);
 vec2 uv=UV-vec2(dx/1000.0,0.0);
 COLOR=source_modulate*texture(TEXTURE,uv);
}
