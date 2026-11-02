// Two slow, world-anchored strata. Environment only; actor and HUD pixels are
// drawn afterwards. Shared by the ground and native upright prop cards.
export function paintedNormal(left,right,above,below,strength=3.6){
 const x=(left-right)*strength,y=(above-below)*strength,d=Math.hypot(x,y,1);return [x/d,y/d,1/d];
}
export function fogOpacity(x,y,time,hero,low=false){
 const wave=Math.sin(x*.0034+y*.0013-time*.028)*Math.sin(y*.0021-x*.0008+time*.018);
 const second=Math.sin(x*.0011-y*.0028+time*.017)*Math.sin(x*.0023+y*.0007-time*.011);
 const distance=Math.min(1,Math.hypot(x-hero.x,y-hero.y)/1800);
 return Math.min(.14,((.018+.028*(wave*.5+.5))+(low?0:.012+.024*(second*.5+.5)))*(.32+.68*distance));
}
export const atmosphereGLSL=`
 vec3 paintedNormal(sampler2D art,vec2 uv,vec2 stepSize){
  vec3 luma=vec3(.299,.587,.114);
  float l=dot(texture2D(art,uv-vec2(stepSize.x,0.)).rgb,luma),r=dot(texture2D(art,uv+vec2(stepSize.x,0.)).rgb,luma);
  float a=dot(texture2D(art,uv-vec2(0.,stepSize.y)).rgb,luma),b=dot(texture2D(art,uv+vec2(0.,stepSize.y)).rgb,luma);
  return normalize(vec3((l-r)*3.6,(a-b)*3.6,1.));
 }
 vec3 forestAtmosphere(vec3 color,vec3 art,vec2 world,vec2 hero,float time,float low){
  float a=sin(world.x*.0034+world.y*.0013-time*.028)*sin(world.y*.0021-world.x*.0008+time*.018);
  float b=sin(world.x*.0011-world.y*.0028+time*.017)*sin(world.x*.0023+world.y*.0007-time*.011);
  float farPlane=clamp(length(world-hero)/1800.,0.,1.);
  float fog=((.018+.028*(a*.5+.5))+(1.-low)*(.012+.024*(b*.5+.5)))*(.32+.68*farPlane);
  // Cold floor vapor and slightly warmer upper haze move against one another.
  return environmentHaze(color,art,mix(vec3(.19,.23,.28),vec3(.27,.29,.28),b*.5+.5),min(.14,fog));
 }
`;
