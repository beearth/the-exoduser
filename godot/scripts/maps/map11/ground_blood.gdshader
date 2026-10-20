shader_type canvas_item;
varying vec4 instance_tint;
void vertex(){instance_tint=COLOR;}
void fragment(){
 vec4 s=texture(TEXTURE,UV);
 float red=s.r-max(s.g,s.b);
 float blood=smoothstep(.09,.20,red);
 float feather=1.0-smoothstep(.75,1.0,length(UV*2.0-1.0));
 // A flat stain has neither the source's beige spill nor raised specular relief.
 COLOR=vec4(vec3(.24,.032,.023)*instance_tint.rgb,s.a*blood*feather*instance_tint.a);
}
