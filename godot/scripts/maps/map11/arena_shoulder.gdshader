shader_type canvas_item;
varying vec2 floor_point;
void vertex(){floor_point=VERTEX.xy;}
void fragment(){
 vec2 d=vec2(.004);
 vec4 s=(texture(TEXTURE,UV)*2.0+texture(TEXTURE,UV+d)+texture(TEXTURE,UV-d)+texture(TEXTURE,UV+vec2(d.x,-d.y))+texture(TEXTURE,UV+vec2(-d.x,d.y)))/6.0;
 float relief=dot(s.rgb,vec3(.299,.587,.114));
 float vein=clamp((s.r-s.g*1.15)*1.5,0.0,.18);
 float radius=length(floor_point);
 float rim=smoothstep(980.0,1640.0,radius);
 vec3 skin=mix(vec3(.29,.205,.20)+vec3(relief*.30),vec3(.16,.055,.065)+vec3(relief*.22),rim);
 skin=mix(skin,vec3(.25,.075,.085),vein);
 float angle=atan(floor_point.y,floor_point.x);
 float edge=2090.0+95.0*sin(angle*7.0+.4)+65.0*sin(angle*13.0-1.2)+35.0*sin(angle*23.0);
 float fade=smoothstep(edge-420.0,edge+180.0,length(floor_point));
 COLOR=vec4(skin,s.a*(1.0-fade));
}
