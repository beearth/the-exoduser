shader_type canvas_item;
// Existing RGBA relief, muted and filtered; no generated raster/noise.
void fragment() {
 vec2 d = vec2(0.004);
 vec4 s = (texture(TEXTURE,UV)*2.0 + texture(TEXTURE,UV+d) + texture(TEXTURE,UV-d) + texture(TEXTURE,UV+vec2(d.x,-d.y)) + texture(TEXTURE,UV+vec2(-d.x,d.y)))/6.0;
 float relief = dot(s.rgb,vec3(0.299,0.587,0.114));
 float vein = clamp((s.r-s.g*1.15)*1.5,0.0,0.18);
 vec3 skin = vec3(0.41,0.35,0.33) + vec3(relief*0.56);
 skin = mix(skin,vec3(0.32,0.19,0.22),vein);
 COLOR = vec4(skin,s.a);
}
