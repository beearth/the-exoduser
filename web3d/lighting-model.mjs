// CPU reference and shader use the same reflectance and compact-support pool.
export const poolFalloff=d=>Math.max(0,1-d*d)**2;
export const shadeEnvironment=(art,ambient,light)=>art.map((v,i)=>Math.min(1,Math.max(0,v*ambient[i]+light[i]*(.06+v*1.25))));
export const lightingGLSL=`
 float poolFalloff(float d){return pow(max(0.,1.-d*d),2.);}
 vec3 shadeEnvironment(vec3 art,vec3 ambient,vec3 light){return clamp(art*ambient+light*(.06+art*1.25),0.,1.);}
`;
