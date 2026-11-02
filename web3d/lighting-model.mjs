// Bound incident light before applying painted reflectance; preserve material folds.
export const poolFalloff=d=>Math.max(0,1-d*d)**2;
export const shadeEnvironment=(art,ambient,light)=>{const budget=Math.max(1,...light.map(v=>v/1.25));return art.map((v,i)=>Math.min(1,Math.max(0,v*ambient[i]+light[i]/budget*(.06+v*1.25))));};
export const lightingGLSL=`
 float poolFalloff(float d){return pow(max(0.,1.-d*d),2.);}
 vec3 shadeEnvironment(vec3 art,vec3 ambient,vec3 light){float budget=max(1.,max(light.r,max(light.g,light.b))/1.25);return clamp(art*ambient+light/budget*(.06+art*1.25),0.,1.);}
`;
