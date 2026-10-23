shader_type canvas_item;
// growth-tree-detail.css 79–105,119–125; local CSS pixels including shadow apron.
uniform vec2 extent=vec2(44.0);
uniform float corner=22.0;
uniform bool selected=false;
uniform bool learned=false;
uniform bool origin=false;
uniform bool major=false;
uniform vec4 school:source_color=vec4(.898,.745,.529,1.0);
float rounded(vec2 p,vec2 halfsize,float r){vec2 q=abs(p)-halfsize+vec2(r);return length(max(q,vec2(0.0)))+min(max(q.x,q.y),0.0)-r;}
vec4 over(vec4 b,vec4 t){float a=t.a+b.a*(1.0-t.a);return vec4((t.rgb*t.a+b.rgb*b.a*(1.0-t.a))/max(a,.00001),a);}
void fragment(){
 vec2 p=(UV-.5)*(extent+vec2(64.));float d=rounded(p,extent*.5,corner);
 float blur=origin?27.0:(selected?29.0:16.0);vec3 glow=origin?vec3(247.,198.,110.)/255.:(selected?vec3(242.,173.,81.)/255.:vec3(187.,146.,82.)/255.);
 float strength=origin?.6:(selected?.55:(learned?.25:0.));
 vec4 c=vec4(glow,strength*(extent.x*extent.x/(extent.x*extent.x+blur*blur))*exp(-pow(max(d,0.)/(blur*.5),2.0)*.5)*(1.-smoothstep(blur,blur+2.,max(d,0.))));
 float outer=origin?4.:(selected?6.:(learned?5.:4.));
 vec4 edge=origin?vec4(vec3(179.,144.,80.)/255.,.18):(selected?vec4(vec3(221.,171.,102.)/255.,1.):(learned?vec4(vec3(216.,175.,105.)/255.,.66):vec4(vec3(187.,157.,104.)/255.,.62)));
 c=over(c,vec4(edge.rgb,edge.a*(1.-smoothstep(-.4,.4,d-outer))));
 if(!origin)c=over(c,vec4((selected?vec3(23.,28.,21.):vec3(16.,23.,19.))/255.,1.-smoothstep(-.4,.4,d-3.)));
 vec2 uv=p/extent+.5;float r=length(uv-(selected||learned?vec2(.5):vec2(.36,.24)));
 vec3 bg=origin?vec3(48.,43.,30.)/255.:(selected?mix(vec3(104.,80.,50.),vec3(34.,37.,27.),clamp(r/(.70710678*.72),0.,1.))/255.:(learned?mix(mix(vec3(11.,16.,14.),vec3(125.,93.,53.),.32),vec3(26.,38.,32.),clamp(r/(.70710678*.74),0.,1.))/255.:mix(vec3(65.,72.,58.),vec3(23.,32.,27.),clamp(r/(length(vec2(.64,.76))*.68),0.,1.))/255.));
 if(!origin&&!selected&&!learned)bg*=1.-.52*exp(-pow(max(-d,0.)/6.,2.)*.5);
 vec3 border=origin?vec3(242.,210.,148.)/255.:(selected?vec3(255.,224.,163.)/255.:(learned?school.rgb:vec3(164.,152.,120.)/255.));
 bg=mix(bg,border,smoothstep(origin?-1.:-1.5,origin?-.4:-.7,d));
 c=over(c,vec4(bg,1.-smoothstep(-.4,.4,d)));
 if(major&&!origin){vec2 q=mat2(vec2(.7071,-.7071),vec2(.7071,.7071))*p;float r=extent.x*.5+7.;float ring=(1.-smoothstep(.3,.9,abs(length(p)-r)))*step(r*.24,abs(q.x));c=over(c,vec4(vec3(221.,185.,121.)/255.,.7*ring));}
 COLOR=c;
}
