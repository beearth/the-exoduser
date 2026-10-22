shader_type canvas_item;
uniform float width_px=33.3;
uniform float height_px=2.7;
void fragment(){
 vec2 p=UV*vec2(width_px,height_px);
 float r=min(3.6,height_px);
 float alpha=1.;
 if(p.y>height_px-r){
  if(p.x<r)alpha=1.-smoothstep(r-.5,r+.5,length(p-vec2(r,height_px-r)));
  if(p.x>width_px-r)alpha=min(alpha,1.-smoothstep(r-.5,r+.5,length(p-vec2(width_px-r,height_px-r))));
 }
 COLOR.a*=alpha;
}
