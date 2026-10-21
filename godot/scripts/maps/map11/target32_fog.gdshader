shader_type canvas_item;
render_mode unshaded;
uniform vec4 fog_color:source_color=vec4(.47,.45,.51,1.);
uniform float opacity=.035;
void fragment(){
 float edge=smoothstep(0.,.18,UV.x)*smoothstep(0.,.18,1.-UV.x)*sin(UV.y*3.14159265);
 float f=texture(TEXTURE,vec2(fract(UV.x+TIME*.004),UV.y)).r;
 COLOR=vec4(fog_color.rgb,edge*f*opacity);
}
