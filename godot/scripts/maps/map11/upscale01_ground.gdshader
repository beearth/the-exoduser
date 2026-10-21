shader_type canvas_item;
render_mode unshaded;
uniform sampler2D pulse_mask: filter_linear, repeat_disable;
uniform vec4 logical_tile=vec4(0.0);
uniform vec2 logical_origin=vec2(0.0);
uniform vec2 logical_extent=vec2(4096.0);
uniform vec3 glow=vec3(.596,.361,.667);
uniform float strength=.065;
uniform float pulse_hz=.16;
void fragment(){
 vec4 art=texture(TEXTURE,UV);
 vec2 p=logical_tile.xy+UV*logical_tile.zw;
 vec2 mask_uv=(p-logical_origin)/logical_extent;
 float beat=.5+.5*sin(TIME*pulse_hz*6.2831853);
 art.rgb+=glow*texture(pulse_mask,mask_uv).r*beat*strength;
 COLOR=art;
}
