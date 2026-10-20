shader_type canvas_item;
uniform sampler2D ground: repeat_enable, filter_linear;
uniform vec2 surface_origin=vec2(0.0);
varying vec2 world_uv;
vec2 turn(vec2 p,float a){return mat2(vec2(cos(a),sin(a)),vec2(-sin(a),cos(a)))*p;}
vec3 filtered(vec2 uv){
 return texture(ground,uv).rgb;
}
void vertex(){world_uv=VERTEX.xy+surface_origin;}
void fragment(){
 vec2 p=world_uv;
 vec3 a=filtered(turn(p/760.0,.27)+vec2(.17,.43));
 vec3 b=filtered(turn(p/1130.0,-.89)+vec2(.69,.13));
 vec3 c=filtered(turn(p/1830.0,1.73)+vec2(.31,.81));
 float blend=.5+.25*sin(p.x/1800.0+p.y/2310.0);
 vec3 sample_=mix(mix(a,b,blend),c,.28);
 float relief=dot(sample_,vec3(.299,.587,.114));
 // Muted skin/soil, no noise or emissive warning-colored lines.
 vec3 skin=vec3(.23,.175,.15)+vec3(relief*.75);
 float blood=clamp(sample_.r-sample_.g*1.15,0.0,.12);
 skin-=vec3(0.0,blood*.42,blood*.37);
 float damp=smoothstep(700.0,3200.0,p.x)*(1.0-smoothstep(-1600.0,2400.0,p.y));
 skin=mix(skin,skin*vec3(.82,.90,.88),damp*.35);
 COLOR=vec4(skin,1.0);
}
