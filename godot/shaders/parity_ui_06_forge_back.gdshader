shader_type canvas_item;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
vec3 aces(vec3 c){
 c*=1.05/.6;c=mat3(vec3(.59719,.076,.0284),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777))*c;
 c=(c*(c+.0245786)-.000090537)/(c*(.983729*c+.432951)+.238081);
 return clamp(mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602))*c,vec3(0.),vec3(1.));
}
void fragment(){vec2 res=vec2(1842.,786.53),vUv=vec2(UV.x,1.-UV.y);float t=TIME;vec2 p=vUv*res/600.;float s=fbm(p*1.6+vec2(0.,-t*.03))*.7+fbm(p*4.+vec2(t*.02,-t*.05))*.3;
vec2 d=(vUv-vec2(.5,1.-(587.555-215.47)/786.53))*res/max(res.x,res.y);float r=length(d*vec2(1.,1.25));vec3 base=mix(vec3(.010,.007,.008),vec3(.026,.017,.016),s);vec3 fire=vec3(.40,.08,.025)*pow(1.-smoothstep(0.,.34,r),1.6)*(.5+.5*s);float vig=1.-smoothstep(.25,1.15,length((vUv-.5)*vec2(1.,1.4)));vec3 c=aces((base+fire*.45)*vig);COLOR=vec4(mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(vec3(.0031308),c)),1.);}
