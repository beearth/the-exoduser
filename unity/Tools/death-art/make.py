# Death screen art (PBZ-style): calligraphy 絶命 + blood-ink splatter, rendered by headless Chrome. Deterministic (fixed seeds).
import base64,sys
font=sys.argv[1];out=sys.argv[2]
b64=base64.b64encode(open(font,'rb').read()).decode()
html=r'''<!doctype html><meta charset=utf-8><style>
@font-face{font-family:Boku;src:url(data:font/ttf;base64,%s)}
html,body{margin:0;background:transparent}
#cal{position:absolute;left:0;top:0;width:760px;height:1360px}
#spl{position:absolute;left:800px;top:0;width:1400px;height:1400px;filter:url(#rough)}
</style>
<svg id=cal viewBox="0 0 760 1360" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <linearGradient id=ink x1=0 y1=0 x2=0 y2=1><stop offset=0 stop-color="#e01a1f"/><stop offset=.55 stop-color="#c3121a"/><stop offset=1 stop-color="#9c0c13"/></linearGradient>
  <filter id=brush x="-10%%" y="-10%%" width="120%%" height="120%%">
   <feTurbulence type=fractalNoise baseFrequency=".045" numOctaves=3 seed=7 result=wob />
   <feDisplacementMap in=SourceGraphic in2=wob scale=9 xChannelSelector=R yChannelSelector=G result=rough />
   <feTurbulence type=fractalNoise baseFrequency=".022" numOctaves=2 seed=3 result=tone />
   <feColorMatrix in=tone type=matrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -.42" result=toneA />
   <feFlood flood-color="#6a070c" result=dark />
   <feComposite in=dark in2=toneA operator=in result=darkSpots />
   <feComposite in=darkSpots in2=rough operator=in result=darkIn />
   <feMerge><feMergeNode in=rough /><feMergeNode in=darkIn /></feMerge>
  </filter>
 </defs>
 <g filter="url(#brush)" fill="url(#ink)" font-family=Boku font-size=600 text-anchor=middle>
  <text x=380 y=600>絶</text>
  <text x=380 y=1250>命</text>
 </g>
</svg>
<canvas id=spl width=1400 height=1400></canvas>
<svg width=0 height=0><filter id=rough x="-5%%" y="-5%%" width="110%%" height="110%%"><feTurbulence type=fractalNoise baseFrequency=".02" numOctaves=3 seed=5 result=n /><feDisplacementMap in=SourceGraphic in2=n scale=26 xChannelSelector=R yChannelSelector=G /></filter></svg>
<script>
let s=20261104;const R=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
const c=document.getElementById('spl').getContext('2d');const cx=700,cy=640;
function blot(x,y,r,col,sq){c.fillStyle=col;c.beginPath();const n=48;for(let i=0;i<=n;i++){const t=i/n*Math.PI*2,k=r*(.84+R()*.24);c.lineTo(x+Math.cos(t)*k,y+Math.sin(t)*k*(sq||.9));}c.closePath();c.fill();}
blot(cx,cy,250,'rgba(84,6,10,.93)');blot(cx-120,cy-150,130,'rgba(84,6,10,.93)');blot(cx+150,cy+140,150,'rgba(76,5,9,.92)');blot(cx+40,cy-30,160,'rgba(112,9,14,.55)');blot(cx-60,cy+60,110,'rgba(60,4,8,.6)');
const N=16;for(let i=0;i<N;i++){const ang=i/N*Math.PI*2+(R()-.5)*.32,len=150+R()*330,w0=8+R()*13;const x0=cx+Math.cos(ang)*190,y0=cy+Math.sin(ang)*170;
 const x1=cx+Math.cos(ang)*(190+len),y1=cy+Math.sin(ang)*(170+len);const nx=-Math.sin(ang),ny=Math.cos(ang);
 c.fillStyle=R()<.3?'rgba(150,14,20,.92)':'rgba(88,7,11,.92)';c.beginPath();c.moveTo(x0+nx*w0,y0+ny*w0);c.quadraticCurveTo((x0+x1)/2+nx*w0*.3,(y0+y1)/2+ny*w0*.3,x1,y1);c.lineTo(x0-nx*w0,y0-ny*w0);c.fill();
 if(R()<.7){const d=7+R()*14;c.beginPath();c.ellipse(x1+Math.cos(ang)*d*1.8,y1+Math.sin(ang)*d*1.8,d*.6,d*.45,ang,0,7);c.fill();}}
for(let i=0;i<9;i++){const ang=R()*Math.PI*2,dist=300+R()*200,r=8+R()*18;c.fillStyle=R()<.4?'rgba(160,16,22,.9)':'rgba(84,7,11,.9)';c.beginPath();c.ellipse(cx+Math.cos(ang)*dist,cy+Math.sin(ang)*dist*.9,r,r*(.7+R()*.3),ang,0,7);c.fill();}
</script>'''%b64
open(out,'w').write(html)
