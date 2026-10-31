// Low cold scattering survives the environment dimmer; alpha still defines wood.
export const forestRadiance=(art,depth,rim)=>art.map((v,i)=>v*([.72,.76,.80][i]*(1-depth)+[.50,.59,.68][i]*depth)+[.07,.09,.12][i]*(.55+.45*depth)+[.05,.065,.085][i]*rim);
export const forestLightingGLSL=`vec3 forestRadiance(vec3 art,float depth,float rim){return art*mix(vec3(.72,.76,.80),vec3(.50,.59,.68),depth)+vec3(.07,.09,.12)*(.55+.45*depth)+vec3(.05,.065,.085)*rim;}`;
