shader_type canvas_item;
instance uniform vec4 rim_color : source_color = vec4(.78,.72,.59,.38);
uniform vec3 ambient_tint : source_color = vec3(.89,.77,.81);
varying vec4 tint;
void vertex(){tint=COLOR;}
void fragment(){
 vec4 src=texture(TEXTURE,UV);
 // Inner silhouette only: no expanded quad, halo, atlas bleed or solid backdrop.
 vec2 px=fwidth(UV)*1.35;
 float a=src.a;
 float n=min(min(texture(TEXTURE,UV+vec2(px.x,0)).a,texture(TEXTURE,UV-vec2(px.x,0)).a),min(texture(TEXTURE,UV+vec2(0,px.y)).a,texture(TEXTURE,UV-vec2(0,px.y)).a));
 float edge=smoothstep(.06,.65,a-n)*step(.35,a);
 COLOR=vec4(mix(src.rgb*tint.rgb*ambient_tint,rim_color.rgb,edge*rim_color.a),a*tint.a);
}
