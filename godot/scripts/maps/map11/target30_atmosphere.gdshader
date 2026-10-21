shader_type canvas_item;
render_mode unshaded;
uniform vec4 fog_color: source_color=vec4(.412,.388,.420,1.);
uniform vec2 fog_alpha=vec2(.12,.26);
uniform vec2 fog_radii=vec2(1450.,2100.);
varying vec2 point;
void vertex(){point=VERTEX;}
void fragment(){
 vec2 uv=UV+vec2(TIME*.004,-TIME*.002);
 float f=texture(TEXTURE,uv).r;
 float band=smoothstep(fog_radii.x,fog_radii.y,length(point))*(1.-smoothstep(2400.,2850.,length(point)));
 COLOR=vec4(fog_color.rgb,band*mix(fog_alpha.x,fog_alpha.y,f));
}
