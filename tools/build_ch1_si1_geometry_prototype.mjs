import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import sharp from 'sharp';

const root=process.cwd();
const sourcePath=path.join(root,'assets/map/ch1/geometry/ch1_si1_geometry.js');
const outDir=path.join(root,'captures/ch1_si1_geometry_redesign_20260829/PROTOTYPE');
fs.mkdirSync(outDir,{recursive:true});

const context={};context.globalThis=context;
vm.runInNewContext(fs.readFileSync(sourcePath,'utf8'),context,{filename:sourcePath});
const geo=context.CH1_SI1_GEOMETRY;
const W=200,H=200,S=6,OUT=W*S;
const proposed=geo.buildMask();
const currentMapPath=path.join(root,'captures/ch1_si1_geometry_redesign_20260829/CURRENT/runtime_map.json');
const current=new Uint8Array(W*H);
if(fs.existsSync(currentMapPath)){
  const rows=JSON.parse(fs.readFileSync(currentMapPath,'utf8'));
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)current[y*W+x]=rows[y][x]===1?0:1;
}else{
  current.fill(1);
  for(let x=0;x<W;x++){current[x]=0;current[(H-1)*W+x]=0}
  for(let y=0;y<H;y++){current[y*W]=0;current[y*W+W-1]=0}
}

function rgbMask(mask,walk=[245,245,238],wall=[8,9,11]){
  const data=Buffer.alloc(W*H*3);
  for(let i=0;i<mask.length;i++){const c=mask[i]?walk:wall;data[i*3]=c[0];data[i*3+1]=c[1];data[i*3+2]=c[2]}
  return data;
}
async function writeMask(name,mask,walk,wall){
  await sharp(rgbMask(mask,walk,wall),{raw:{width:W,height:H,channels:3}}).resize(OUT,OUT,{kernel:'nearest'}).png().toFile(path.join(outDir,name));
}
function rowSpan(mask,x,y){let l=x,r=x;if(!mask[y*W+x])return 0;while(l>0&&mask[y*W+l-1])l--;while(r<W-1&&mask[y*W+r+1])r++;return r-l+1}
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}

await writeMask('01_CURRENT_WALKABLE_MASK.png',current);
await writeMask('02_PROPOSED_WALKABLE_MASK.png',proposed);

const overlay=Buffer.alloc(W*H*3);
for(let i=0;i<proposed.length;i++){
  const c=proposed[i]?[244,242,226]:(current[i]?[105,24,35]:[7,8,10]);
  overlay[i*3]=c[0];overlay[i*3+1]=c[1];overlay[i*3+2]=c[2];
}
await sharp(overlay,{raw:{width:W,height:H,channels:3}}).resize(OUT,OUT,{kernel:'nearest'}).png().toFile(path.join(outDir,'03_CURRENT_TO_PROPOSED_OVERLAY.png'));

const colors=['#4fc3f7','#ffb74d','#66bb6a','#ab47bc','#ef5350','#26c6da','#ffee58'];
const regionLabels=geo.regions.map((r,i)=>{
  const [x,y]=r.center,c=colors[i];
  return `<circle cx="${x*S}" cy="${y*S}" r="11" fill="${c}" stroke="#fff" stroke-width="2"/><text x="${x*S+16}" y="${y*S+5}" fill="#fff" font-size="18" font-weight="700">${i+1} ${esc(r.label)}</text>`;
}).join('');
const landmarkLabels=Object.entries(geo.landmarks).map(([id,p])=>`<circle cx="${p[0]*S}" cy="${p[1]*S}" r="5" fill="#ff4568" stroke="#fff" stroke-width="1.5"/><text x="${p[0]*S+8}" y="${p[1]*S-7}" fill="#ffd8df" font-size="14">${esc(id)}</text>`).join('');
const pathD=geo.spine.map((p,i)=>`${i?'L':'M'}${p[0]*S},${p[1]*S}`).join(' ');
const bypassD=Object.values(geo.bypassPaths).map(pts=>`<path d="${pts.map((p,i)=>`${i?'L':'M'}${p[0]*S},${p[1]*S}`).join(' ')}" fill="none" stroke="#ffbf4f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
const diagramSvg=`<svg width="${OUT}" height="${OUT}" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#56e8ff"/></marker></defs>
<path d="${pathD}" fill="none" stroke="#56e8ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow)"/>
${bypassD}
${regionLabels}${landmarkLabels}
<rect x="16" y="14" width="370" height="42" rx="8" fill="#050608" fill-opacity=".8"/><text x="30" y="42" fill="#fff" font-size="24" font-weight="800">CH1 SI1 PROPOSED REGION / PATH</text>
</svg>`;
await sharp(rgbMask(proposed,[67,69,65],[5,6,8]),{raw:{width:W,height:H,channels:3}}).resize(OUT,OUT,{kernel:'nearest'}).composite([{input:Buffer.from(diagramSvg)}]).png().toFile(path.join(outDir,'04_REGION_DIRECTION_DIAGRAM.png'));

const widths=geo.widthSamples.map(s=>({...s,actual:rowSpan(proposed,s.x,s.y)}));
const chartW=1400,chartH=520,pad=90,maxV=100;
const px=i=>pad+i*(chartW-pad*2)/(widths.length-1),py=v=>chartH-pad-v*(chartH-pad*1.55)/maxV;
const pts=widths.map((s,i)=>`${px(i)},${py(s.actual)}`).join(' ');
const grid=[0,20,40,60,80,100].map(v=>`<line x1="${pad}" y1="${py(v)}" x2="${chartW-pad}" y2="${py(v)}" stroke="#30343a"/><text x="35" y="${py(v)+6}" fill="#9ba3ad" font-size="18">${v}t</text>`).join('');
const dots=widths.map((s,i)=>`<circle cx="${px(i)}" cy="${py(s.actual)}" r="9" fill="#55e6ff"/><text x="${px(i)}" y="${py(s.actual)-18}" fill="#fff" font-size="22" text-anchor="middle" font-weight="700">${s.actual}</text><text x="${px(i)}" y="${chartH-35}" fill="#ddd" font-size="20" text-anchor="middle">${esc(s.id.toUpperCase())}</text>`).join('');
const chartSvg=`<svg width="${chartW}" height="${chartH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0c0e12"/><text x="${pad}" y="45" fill="#fff" font-size="28" font-weight="800">MAIN ROUTE WIDTH PROFILE (tiles)</text>${grid}<polyline points="${pts}" fill="none" stroke="#55e6ff" stroke-width="7" stroke-linejoin="round"/>${dots}</svg>`;
await sharp(Buffer.from(chartSvg)).png().toFile(path.join(outDir,'05_WIDTH_PROFILE.png'));

const panels=['01_CURRENT_WALKABLE_MASK.png','02_PROPOSED_WALKABLE_MASK.png','03_CURRENT_TO_PROPOSED_OVERLAY.png'];
const titles=['CURRENT: FULL FLOOR','PROPOSED: ACTUAL SILHOUETTE','OVERLAY: RED = REMOVED WALKABLE'];
const panelSize=760,header=80,gap=18,totalW=panelSize*3+gap*4,totalH=panelSize+header+gap*2;
const comps=[];
for(let i=0;i<panels.length;i++){
  const input=await sharp(path.join(outDir,panels[i])).resize(panelSize,panelSize,{kernel:'nearest'}).png().toBuffer();
  comps.push({input,left:gap+i*(panelSize+gap),top:header});
}
const titleSvg=`<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#050608"/>${titles.map((t,i)=>`<text x="${gap+i*(panelSize+gap)+panelSize/2}" y="52" text-anchor="middle" fill="#fff" font-size="25" font-weight="800">${t}</text>`).join('')}</svg>`;
await sharp(Buffer.from(titleSvg)).composite(comps).png().toFile(path.join(outDir,'00_GEOMETRY_3WAY_COMPARISON.png'));

const walkableCurrent=current.reduce((a,v)=>a+v,0),walkableProposed=proposed.reduce((a,v)=>a+v,0);
const report={
  stage:1,size:[W,H],walkable:{current:walkableCurrent,proposed:walkableProposed,currentPct:+(walkableCurrent/400).toFixed(2),proposedPct:+(walkableProposed/400).toFixed(2)},
  widths,regions:geo.regions,landmarks:geo.landmarks,spine:geo.spine,bypassPaths:geo.bypassPaths,
  files:['00_GEOMETRY_3WAY_COMPARISON.png','01_CURRENT_WALKABLE_MASK.png','02_PROPOSED_WALKABLE_MASK.png','03_CURRENT_TO_PROPOSED_OVERLAY.png','04_REGION_DIRECTION_DIAGRAM.png','05_WIDTH_PROFILE.png']
};
fs.writeFileSync(path.join(outDir,'prototype_qa.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
