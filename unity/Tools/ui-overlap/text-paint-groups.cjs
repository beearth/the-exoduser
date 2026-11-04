// Logical glyph ownership only. Geometry, occlusion and collision thresholds stay in analyze.cjs.
const suffix=' / 명시 CSS text-shadow 광휘 패스';
const raw=e=>e.unclippedRect||e.rect;
const sameRect=(a,b)=>a&&b&&['x','y','width','height'].every(k=>Number.isFinite(a[k])&&a[k]===b[k]);
const closeSize=(a,b,t=.01)=>['width','height'].every(k=>Math.abs(raw(a)[k]-raw(b)[k])<=t);
const sameClip=(a,b)=>a.hasClip===b.hasClip&&JSON.stringify(a.clipRect)===JSON.stringify(b.clipRect);
const ring=(radius,dy=0)=>Array.from({length:8},(_,i)=>[Math.cos(i*Math.PI/4)*radius,dy+Math.sin(i*Math.PI/4)*radius]);
// A native rounded origin can move by floor(offset) or ceil(offset). This is
// the declared paint offset, not a larger collision radius or a shadow chain.
const quantized=(delta,expected)=>Math.abs(delta-expected)<=.01||(Math.abs(delta-Math.round(delta))<=.01&&delta>=Math.floor(expected)-.01&&delta<=Math.ceil(expected)+.01);
function profile(e,frame){
 const p=e.source?.slice(e.source.indexOf(suffix)+suffix.length),fit=Math.min(frame.width/1920,frame.height/1080);
 if(!e.source?.includes(suffix))return null;
 if(p===' / frontend-black-shadow')return{source:e.source.slice(0,-(suffix+p).length),scale:frame.height/1080,maxAlpha:1.001,offsets:[[0,1],[.5,3],[-.5,3],[.5,2],[-.5,2]]};
 // NativeDeathOverlay draws this profile twice: glyph outline (Text, line 101-102) and pet dialogue lines (line 207).
 if(p===' / death-black-outline')return{source:e.source.slice(0,-(suffix+p).length),scale:fit,maxAlpha:1.001,offsets:[[0,1],[-3,1],[3,1],[0,-2],[0,4],[0,1.5],[-2,0],[2,0],[0,-1],[0,3]]};
 if(p===' / region-banner-black-shadow')return{source:e.source.slice(0,-(suffix+p).length),scale:fit,maxAlpha:.064,offsets:ring(5,4)};
 if(p==='')return{source:e.source.slice(0,-suffix.length),scale:fit,maxAlpha:.03,offsets:[...ring(3),...ring(5.5)]};
 return null;
}
function groupTextPasses(elements,frame,barrier){
 const warnings=[],groups=[],declared=new Map(),legacy=new Map();
 for(const e of elements)if(e.kind==='text'&&e.paintGroupId){const list=declared.get(e.paintGroupId)||[];list.push(e);declared.set(e.paintGroupId,list);}
 for(const [id,members]of declared){
  const bodies=members.filter(e=>!e.shadow),body=bodies[0];
  const valid=bodies.length===1&&(!body.textLayoutRect||sameRect(body.textLayoutRect,body.paintGroupOrigin))&&members.every(e=>e.text===body.text&&e.paintGroupText===body.text&&sameRect(e.paintGroupOrigin,body.paintGroupOrigin)&&e.paintGroupSource===body.paintGroupSource&&!!e.paintGroupSource&&e.depth===body.depth&&sameClip(e,body)&&e.opacityKnown===true&&Number.isFinite(e.effectiveOpacity)&&e.effectiveOpacity>=0&&e.effectiveOpacity<=1.001&&(e===body||(e.order<body.order&&!barrier(e,body))));
  if(!valid){warnings.push('다중 패스 그룹 '+id+': 본문/문자열/원점/깊이/클립/칠 증명 불일치');continue;}
  for(const e of members)if(e!==body)e.decorativeOwnerId=body.id;
  if(members.length>1)groups.push({id,text:body.text,origin:body.paintGroupOrigin,source:body.paintGroupSource,bodyId:body.id,members:members.map(e=>e.id),proof:'명시한 단일 본문과 같은 논리 원점의 실제 다중 패스'});
 }
 for(const e of elements){
  if(e.kind!=='text'||e.paintGroupId||e.shadow!==true||e.opacityKnown===false)continue;
  const p=profile(e,frame);
  const candidates=elements.filter(b=>{
   if(b.kind!=='text'||b.paintGroupId||b.shadow||b.text!==e.text||b.depth!==e.depth||b.order<=e.order||!sameClip(e,b)||barrier(e,b))return false;
   if(p){if(e.opacityKnown!==true||e.effectiveOpacity<0||e.effectiveOpacity>p.maxAlpha||b.source!==p.source||!closeSize(e,b))return false;const a=raw(e),r=raw(b);return p.offsets.some(([x,y])=>quantized(a.x-r.x,x*p.scale)&&quantized(a.y-r.y,y*p.scale));}
   if(e.source?.includes(suffix))return false;
   return b.source?.split(':')[0]===e.source?.split(':')[0]&&closeSize(e,b,3.1)&&['x','y'].every(k=>Math.abs(raw(b)[k]-raw(e)[k])<=3.1);
  });
  // Never choose arbitrarily between duplicate or neighbouring body glyphs.
  if(candidates.length!==1)continue;
  const body=candidates[0];e.decorativeOwnerId=body.id;
  if(!legacy.has(body.id))legacy.set(body.id,{id:'legacy:'+body.id,text:body.text,origin:raw(body),source:body.source,bodyId:body.id,members:[body.id],proof:'선언된 offset와 native 픽셀 반올림으로 복원한 단일 본문'});
  legacy.get(body.id).members.push(e.id);
 }
 return{groups:[...groups,...legacy.values()],warnings};
}
module.exports={groupTextPasses};
