shader_type canvas_item;
uniform bool fissure=false;
void fragment(){
 vec4 s=texture(TEXTURE,UV);
 float relief=dot(s.rgb,vec3(.299,.587,.114));
 if(fissure){
  vec2 q=UV*2.0-1.0;
  float edge=1.0-smoothstep(.65,1.20,length(q));
  vec3 tissue=mix(vec3(.10,.025,.014),vec3(.25,.07,.043),smoothstep(.25,.70,relief));
  COLOR=vec4(tissue,s.a*edge*.65);
 }else{
  // Preserve original root relief/alpha while suppressing purple/green halos.
  vec2 q=abs(UV*2.0-1.0);
  float feather=1.0-smoothstep(.60,.99,max(q.x,q.y));
  COLOR=vec4(vec3(.16,.125,.105)+vec3(relief*.70),s.a*feather*.72);
 }
}
