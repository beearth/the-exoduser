shader_type canvas_item;
// growth-tree-detail.css 79–125; dimensions, spread and blur are CSS scene pixels.
uniform vec2 source_origin;
void vertex(){VERTEX+=(source_origin-MODEL_MATRIX[3].xy)/length(MODEL_MATRIX[0].xy);}
uniform vec2 extent=vec2(44.0);
uniform float corner=22.0;
uniform bool selected=false;
uniform bool learned=false;
uniform bool origin=false;
uniform bool major=false;
uniform vec4 school:source_color=vec4(.898,.745,.529,1.0);
float rounded(vec2 p,vec2 halfsize,float r){vec2 q=abs(p)-halfsize+vec2(r);return length(max(q,vec2(0.0)))+min(max(q.x,q.y),0.0)-r;}
vec4 over(vec4 b,vec4 t){float a=t.a+b.a*(1.0-t.a);return vec4((t.rgb*t.a+b.rgb*b.a*(1.0-t.a))/max(a,.00001),a);}
float cdf(float x){float t=1.0/(1.0+.2316419*abs(x));float q=.39894228*exp(-.5*x*x)*t*(.31938153+t*(-.35656378+t*(1.78147794+t*(-1.82125598+t*1.33027443))));return x>=0.0?1.0-q:q;}
// Gaussian convolution of the actual rounded box, not an exponential of edge distance.
// CSS box-shadow blur radius / 2 is sigma. Integrate horizontal spans analytically.
float gaussian_box(vec2 p,vec2 halfsize,float r,float sigma){
 float sum=0.0;float dy=halfsize.y/12.0;
 for(int i=0;i<24;i++){
  float y=-halfsize.y+(float(i)+.5)*dy;
  float cap=max(abs(y)-halfsize.y+r,0.0);
  float span=halfsize.x-r+sqrt(max(r*r-cap*cap,0.0));
  float z=(p.y-y)/sigma;
  sum+=(cdf((span-p.x)/sigma)-cdf((-span-p.x)/sigma))*exp(-.5*z*z)*.39894228*dy/sigma;
 }
 return clamp(sum,0.0,1.0);
}
float mask(float d,float aa){return clamp(.5-d/aa,0.0,1.0);}
void fragment(){
 vec2 p=(UV-.5)*(extent+vec2(128.));vec2 halfsize=extent*.5;
 float d=rounded(p,halfsize,corner);float aa=max(length(vec2(dFdx(d),dFdy(d))),.001);
 float blur=origin?27.0:(selected?29.0:16.0);
 vec3 glow=origin?vec3(247.,198.,110.)/255.:(selected?vec3(242.,173.,81.)/255.:vec3(187.,146.,82.)/255.);
 float strength=origin?.6:(selected?.55:(learned?.25:0.));
 vec4 c=vec4(glow,strength*gaussian_box(p,halfsize,corner,blur*.5));
 // The inherited learned/[aria-pressed] SVG badge filter is also present when selected.
 if(!origin&&(selected||learned))c=over(c,vec4(vec3(182.,139.,69.)/255.,.1333333*gaussian_box(p,halfsize+vec2(selected?6.:5.),corner+(selected?6.:5.),7.)));
 float outer=origin?4.:(selected?6.:(learned?5.:4.));
 vec4 edge=origin?vec4(vec3(179.,144.,80.)/255.,.18):(selected?vec4(vec3(221.,171.,102.)/255.,1.):(learned?vec4(vec3(216.,175.,105.)/255.,.66):vec4(vec3(187.,157.,104.)/255.,.62)));
 c=over(c,vec4(edge.rgb,edge.a*mask(d-outer,aa)));
 if(!origin)c=over(c,vec4((selected?vec3(23.,28.,21.):vec3(16.,23.,19.))/255.,mask(d-3.,aa)));
 float border=origin?1.:1.5;
 vec2 inner=extent-vec2(border*2.);vec2 uv=p/inner+.5;
 float t=length((uv-(selected||learned?vec2(.5):vec2(.36,.24)))*inner)/(length(inner*(selected||learned?vec2(.5):vec2(.64,.76)))*(selected?.72:(learned?.74:.68)));
 t=clamp(t,0.,1.);
 vec4 bg=origin?vec4(vec3(48.,43.,30.)/255.,1.):(selected?vec4(mix(vec3(104.,80.,50.),vec3(34.,37.,27.),t)/255.,1.):(learned?mix(vec4(vec3(125.,93.,53.)/255.*.32,.32),vec4(vec3(26.,38.,32.)/255.,1.),t):vec4(mix(vec3(65.,72.,58.),vec3(23.,32.,27.),t)/255.,1.)));
 if(learned&&!selected&&!origin)bg.rgb/=max(bg.a,.00001);
 c=over(c,vec4(bg.rgb,bg.a*mask(d,aa)));
 if(!origin&&!selected&&!learned){float inset=.52*(1.-gaussian_box(p,halfsize-vec2(border),max(corner-border,0.),6.));c=over(c,vec4(vec3(0.),inset*mask(d+border,aa)));}
 vec3 ink=origin?vec3(242.,210.,148.)/255.:(selected?vec3(255.,224.,163.)/255.:(learned?school.rgb:vec3(164.,152.,120.)/255.));
 c=over(c,vec4(ink,mask(d,aa)-mask(d+border,aa)));
 // ::after is a rotated square border with a clipped central vertical strip (inset -5).
 if(major&&!origin){vec2 q=mat2(vec2(.70710678,-.70710678),vec2(.70710678,.70710678))*p;float h=(extent.x+7.)*.5;float line=mask(max(abs(q.x),abs(q.y))-h,aa)-mask(max(abs(q.x),abs(q.y))-(h-1.),aa);line*=step(h*.24,abs(q.x));c=over(c,vec4(vec3(221.,185.,121.)/255.,.7*line));}
 COLOR=c;
}
