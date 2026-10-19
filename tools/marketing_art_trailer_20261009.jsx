// Existing-art teaser. Native Higgsedit composition; owns a fresh project only.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const W=1920,H=1080,FPS=30;
const track=(property,a,b,dur)=>({property,keyframes:[
  {at:0,value:a,easing:'linear'},{at:dur,value:b,easing:'linear'}]});
const fade=(dur,edge=.15)=>({property:'opacity',keyframes:[
  {at:0,value:0},{at:edge,value:1},{at:dur-edge,value:1},{at:dur,value:0}]});
export default async ({project})=>{
  const base=resolve(process.env.EXODUSER_ART_DIR || '.');
  const plan=JSON.parse(readFileSync(resolve(base,'edit-plan.json'),'utf8'));
  const dir=resolve(base,'project-art-r2');
  if(existsSync(resolve(dir,'project.json'))) throw Error('Use a fresh project directory.');
  const p=await project({dir,size:'1920x1080',fps:FPS,background:'#060609'});
  const serif=await p.add(resolve(base,'input/cinzel-600.woff2'));
  const sans=await p.add(resolve(base,'input/dm-sans-400.woff2'));
  let end=0;
  for(const s of plan.shots){
    if(s.at!==end || !Number.isInteger(s.dur*FPS)) throw Error('Non-contiguous/frame-misaligned shot.');
    const m=await p.add(resolve(base,'input',s.file));
    p.compose(<frame x={0} y={0} width={W} height={H} layout="none" clip={true}>
      <frame x={0} y={0} width={W} height={H} layout="none" origin="center"
        animate={[track('scale',s.scale[0],s.scale[1],s.dur),
          track('offsetX',s.pan[0],s.pan[1],s.dur),fade(s.dur,s.edge)]}>
        <media file={m} x={0} y={0} width={W} height={H} fit="contain"/>
      </frame>
    </frame>,{at:s.at,dur:s.dur,name:s.id});
    end=(s.at+s.dur);
  }
  if(end!==30)throw Error('Expected 30 seconds / 900 frames.');
  p.compose(<frame x={0} y={0} width={W} height={H} layout="none">
    <rect x={0} y={0} width={W} height={H} fill="#030306" animate={[
      track('opacity',.28,.35,2.6)]}/>
    <text x={192} y={468} width={1536} height={100} align="center"
      fontFamily="Cinzel" typography={{fontAssetId:serif.id}} fontSize={52}
      letterSpacing={5} color="#f0e9e1" shadow={{x:0,y:3,blur:9,color:'#000000'}}
      animate={[fade(2.6,.3)]}>HELL IS NOT YOUR END.</text>
  </frame>,{at:.2,dur:2.6,name:'opening-promise'});
  p.compose(<frame x={0} y={0} width={W} height={H} layout="none">
    <rect x={0} y={0} width={W} height={H} fill="#030306" animate={[
      {property:'opacity',keyframes:[{at:0,value:.4},{at:.5,value:.69},{at:6,value:.72}]}]}/>
    <frame x={0} y={0} width={W} height={H} layout="none"
      motion={{enter:{from:{y:14,opacity:0},duration:.55},exit:{to:{opacity:0},duration:.4,anchor:'end'}}}>
      <text x={192} y={300} width={1536} height={150} align="center"
        fontFamily="Cinzel" typography={{fontAssetId:serif.id}} fontSize={126}
        letterSpacing={14} color="#ece5dd">EXODUSER</text>
      <text x={192} y={477} width={1536} height={65} align="center"
        fontFamily="Cinzel" typography={{fontAssetId:serif.id}} fontSize={38}
        letterSpacing={14} color="#c45b55">HELL LORD</text>
      <rect x={805} y={590} width={310} height={1} fill="#b79b85"/>
      <text x={192} y={680} width={1536} height={65} align="center"
        fontFamily="DM Sans" typography={{fontAssetId:sans.id}} fontSize={38}
        letterSpacing={3} color="#f2eee7">PLAY THE FREE DEMO ON STEAM</text>
      <text x={192} y={788} width={1536} height={45} align="center"
        fontFamily="DM Sans" typography={{fontAssetId:sans.id}} fontSize={19}
        letterSpacing={2} color="#b9b5b0">CHARACTER & WORLD ART TEASER</text>
    </frame>
  </frame>,{at:24,dur:6,name:'brand-and-demo'});
  writeFileSync(resolve(dir,'source-plan.json'),JSON.stringify(plan,null,2)+'\n');
  console.log(JSON.stringify({dir,duration:end,frames:900,status:'ART_REVIEW_CANDIDATE'}));
};
