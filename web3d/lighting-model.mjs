// Colored pools add illumination. Chroma in painted/emissive materials remains
// the color authority; neutral surfaces can still receive the source's warmth.
export const poolFalloff=d=>Math.max(0,1-d*d)**2;
export const materialChroma=art=>{const hi=Math.max(...art),lo=Math.min(...art),t=Math.max(0,Math.min(1,((hi-lo)/Math.max(hi,.001)-.08)/.10));return t*t*(3-2*t);};
export const shadeEnvironment=(art,ambient,light,emission=[0,0,0])=>{
 const luma=v=>v[0]*.299+v[1]*.587+v[2]*.114,k=materialChroma(art),budget=Math.max(1,...light.map(v=>v/1.25)),incident=light.map(v=>v/budget);
 const a=luma(ambient),energy=luma(incident),reflectance=.06+luma(art)*1.25;
 const color=art.map((v,i)=>Math.max(0,v*(ambient[i]*(1-k)+a*k)+incident[i]*reflectance*(1-k)+(v*1.25+.06)*energy*k));
 const peak=Math.max(1,...color);return color.map((v,i)=>Math.min(1,v/peak+emission[i]));
};
export const lightingGLSL=`
 float poolFalloff(float d){return pow(max(0.,1.-d*d),2.);}
 float materialChroma(vec3 art){float hi=max(art.r,max(art.g,art.b)),lo=min(art.r,min(art.g,art.b));return smoothstep(.08,.18,(hi-lo)/max(hi,.001));}
 vec3 shadeEnvironment(vec3 art,vec3 ambient,vec3 light,vec3 emission){
  vec3 luma=vec3(.299,.587,.114);float k=materialChroma(art);
  float budget=max(1.,max(light.r,max(light.g,light.b))/1.25);vec3 incident=light/budget;
  vec3 base=art*mix(ambient,vec3(dot(ambient,luma)),k);
  vec3 added=mix(incident*(.06+dot(art,luma)*1.25),(art*1.25+.06)*dot(incident,luma),k);
  vec3 color=max(vec3(0.),base+added);return clamp(color/max(1.,max(color.r,max(color.g,color.b)))+emission,0.,1.);
 }
 vec3 shadeEnvironment(vec3 art,vec3 ambient,vec3 light){return shadeEnvironment(art,ambient,light,vec3(0.));}
 vec3 environmentHaze(vec3 color,vec3 art,vec3 haze,float opacity){
  // Neutral additive vapor preserves emissive hue instead of painting over it.
  return mix(mix(color,haze,opacity),color+vec3(dot(haze,vec3(.299,.587,.114))*opacity),materialChroma(art));
 }
`;
