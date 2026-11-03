// Presentation only: no collision, actor, camera or source-art mutation.
export const sceneExposure=(moon,warm,shadow,hero)=>(.56+1.48*moon+.62*warm+.18*hero)*(1-.68*shadow);
const hsv=c=>{const v=Math.max(...c),m=Math.min(...c),d=v-m,i=c.indexOf(v);return [((d?(i===0?(c[1]-c[2])/d:i===1?2+(c[2]-c[0])/d:4+(c[0]-c[1])/d)*60:0)+360)%360,v?d/v:0,v];};
const rgb=([h,s,v])=>{const f=n=>v-v*s*Math.max(0,Math.min((n+h/60)%6,4-(n+h/60)%6,1));return [f(5),f(3),f(1)];};
export function keepHue(albedo,lit,maxDegrees=12){const a=hsv(albedo),b=hsv(lit);let d=((b[0]-a[0]+540)%360)-180;b[0]=(a[0]+Math.max(-maxDegrees,Math.min(maxDegrees,d))+360)%360;return rgb(b);}
export const projectShadow=(x,y,across,height,scale=1)=>[x+across+height*.88*scale,y+height*.72*scale];
// Equal channel increments preserve RGB differences even when spatial light
// changes the weighting of differently colored pixels in an area average.
export function relightPaint(a,luminance){const y=a[0]*.299+a[1]*.587+a[2]*.114,d=Math.max(-Math.min(...a),Math.min(1-Math.max(...a),luminance-y));return a.map(v=>v+d);}
export function rootContact(source,w,h){const a=source.slice(),smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;a[i+3]*=smooth(Math.min(x,w-1-x)/Math.max(1,w*.035))*smooth(y/Math.max(1,h*.16))*smooth((h-1-y)/Math.max(1,h*.12));}return a;}
export const sceneLightingGLSL=`
vec3 rgbHSV(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);return vec3(abs(q.z+(q.w-q.y)/(6.*d+1.e-8)),d/(q.x+1.e-8),q.x);}
vec3 hsvRGB(vec3 c){vec3 p=abs(fract(c.xxx+vec3(0.,2./3.,1./3.))*6.-3.);return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y);}
vec3 boundHue(vec3 a,vec3 b,float degrees){vec3 aa=rgbHSV(a),bb=rgbHSV(b);float d=fract(bb.x-aa.x+.5)-.5;bb.x=fract(aa.x+clamp(d,-degrees/360.,degrees/360.)+1.);return hsvRGB(bb);}
vec3 relightPaint(vec3 a,float luminance){float y=dot(a,vec3(.299,.587,.114));float d=clamp(luminance-y,-min(a.r,min(a.g,a.b)),1.-max(a.r,max(a.g,a.b)));return a+vec3(d);}
float sceneExposure(float moon,float warm,float shadow,float hero){return (.56+1.48*moon+.62*warm+.18*hero)*(1.-.68*shadow);}
`;
