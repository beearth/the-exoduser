// All painted materials own their hue, including ash and grey canvas. Light
// contributes bounded exposure, never an orange/purple replacement material.
export const poolFalloff=d=>Math.max(0,1-d*d)**2;
export const materialChroma=art=>{const hi=Math.max(...art),lo=Math.min(...art),t=Math.max(0,Math.min(1,((hi-lo)/Math.max(hi,.001)-.08)/.10));return t*t*(3-2*t);};
export const shadeEnvironment=(art,ambient,light,emission=[0,0,0])=>{
 const luma=v=>v[0]*.299+v[1]*.587+v[2]*.114;
 const energy=Math.max(0,luma(light)),self=Math.max(0,luma(emission));
 const exposure=1+.04*energy/(.4+energy)+.015*self/(.05+self);
 const color=art.map(v=>Math.max(0,v*exposure));
 const peak=Math.max(1,...color);return color.map(v=>v/peak);
};
export const lightingGLSL=`
 float poolFalloff(float d){return pow(max(0.,1.-d*d),2.);}
 float materialChroma(vec3 art){float hi=max(art.r,max(art.g,art.b)),lo=min(art.r,min(art.g,art.b));return smoothstep(.08,.18,(hi-lo)/max(hi,.001));}
 vec3 shadeEnvironment(vec3 art,vec3 ambient,vec3 light,vec3 emission){
  vec3 luma=vec3(.299,.587,.114);
  float energy=max(0.,dot(light,luma)),self=max(0.,dot(emission,luma));
  float exposure=1.+.04*energy/(.4+energy)+.015*self/(.05+self);
  vec3 color=max(vec3(0.),art*exposure);return color/max(1.,max(color.r,max(color.g,color.b)));
 }
 vec3 shadeEnvironment(vec3 art,vec3 ambient,vec3 light){return shadeEnvironment(art,ambient,light,vec3(0.));}
 vec3 environmentHaze(vec3 color,vec3 art,vec3 haze,float opacity){
  // Achromatic vapor preserves hue even on the low-chroma camp materials.
  return color+vec3(dot(haze,vec3(.299,.587,.114))*opacity*.24);
 }
`;
