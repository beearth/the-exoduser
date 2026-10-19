// EXODUSER 30-second review trailer. Native Higgsedit; owns a NEW project only.
// Source footage stays at real-time speed. Native media overlays carry no audio.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const W = 1920, H = 1080, FPS = 30;
let regular, bold;
const fade = (dur, edge = .2) => [{ property: 'opacity', keyframes: [
  {at: 0, value: 0, easing: 'linear'}, {at: edge, value: 1},
  {at: dur-edge, value: 1, easing: 'linear'}, {at: dur, value: 0},
]}];
const gamma = [{kind: 'shader', params: {glsl:
  'vec4 pixel(vec2 uv) { vec4 c = texture(u_src, uv); return vec4(pow(max(c.rgb,vec3(0.0)),vec3(0.90)),c.a); }'}}];

function label(text, y=1006, size=20) {
  return <text x={80} y={y} width={1760} height={46} fontFamily="DM Sans"
    typography={{fontAssetId:regular.id}}
    fontSize={size} color="#e1ddd5" strokeColor="#111111" strokeWidth={1}
    shadow={{x:0,y:2,blur:5,color:'#000000'}}>{text}</text>;
}
function title(text, dur, y=854, align='center', size=52) {
  return <frame width={W} height={H} layout="none">
    <text x={96} y={y} width={1728} height={90} fontFamily="DM Sans"
      typography={{fontAssetId:bold.id}}
      fontSize={size} fontWeight={700} letterSpacing={2} align={align}
      color="#f3efe7" strokeColor="#111111" strokeWidth={1}
      shadow={{x:0,y:3,blur:8,color:'#000000'}} animate={fade(dur)}>{text}</text>
  </frame>;
}

export default async ({project}) => {
  const base = resolve(process.env.EXODUSER_HERO_DIR || '.');
  const dir = resolve(base, 'project-hero-r2');
  if (existsSync(resolve(dir, 'project.json'))) throw new Error('Choose a fresh hero project directory.');
  const plan = JSON.parse(readFileSync(resolve(base,'edit-plan.json'),'utf8'));
  let end = 0;
  for (const s of plan.shots) {
    if (s.at !== end || Math.abs(s.dur*FPS-Math.round(s.dur*FPS)) > 1e-7)
      throw new Error('Shots must be continuous and frame aligned.');
    if (!existsSync(resolve(base,'input/selected',s.id+'.mp4'))) throw new Error('Missing selected input: '+s.id);
    end = Math.round((s.at+s.dur)*FPS)/FPS;
  }
  if (end !== 30) throw new Error('Expected exactly 900 frames.');
  const p = await project({dir,size:'1920x1080',fps:FPS,background:'#08090c'});
  regular=await p.add(resolve(base,'input/dm-sans-400.woff2'));
  bold=await p.add(resolve(base,'input/dm-sans-700.woff2'));
  for (const s of plan.shots) {
    // Selected CFR H.264 starts at PTS0. shots.from is prepared-relative;
    // rawSourceMapping in the plan records the upstream raw source interval.
    const m = await p.add(resolve(base,'input/selected',s.id+'.mp4'));
    p.cut(m,{from:0,dur:s.dur,at:s.at,fit:'contain'});
    if (s.type === 'natural') {
      const scale = s.zoom || 1;
      p.compose(<frame width={W} height={H} layout="none" clip={true}>
        <media file={m} trimStart={0} x={W*(1-scale)/2} y={H*(1-scale)/2}
          width={W*scale} height={H*scale} fit="contain" effects={gamma}/>
      </frame>,{at:s.at,dur:s.dur,name:s.id+'-reframe'});
    }
    if (s.type === 'staged') p.compose(<frame width={W} height={H} layout="none">
      {label('Staged skill demo · Development build')}
    </frame>,{at:s.at,dur:s.dur,name:s.id+'-source-label'});
    if (s.type === 'cinematic') p.compose(<frame width={W} height={H} layout="none">
      {label('Story cinematic')}
    </frame>,{at:s.at,dur:s.dur,name:s.id+'-source-label'});
  }
  p.compose(title('TAKE YOUR REVENGE.',1.8),{at:2.1,dur:1.8,name:'revenge'});
  p.compose(title('DESCEND INTO HELL.',1.8),{at:4.1,dur:1.8,name:'hell'});
  p.compose(title('PARRY. COUNTER.',2.2,90,'left',40),{at:12.3,dur:2.2,name:'counter'});
  const logo=await p.add(resolve(base,'input/logo.png'));
  p.compose(<frame width={W} height={H} layout="none">
    <rect x={0} y={0} width={W} height={H} fill="#050609" animate={[
      {property:'opacity',keyframes:[{at:0,value:0},{at:.5,value:.55},{at:4.8,value:.55}]}]}/>
    <frame x={455} y={195} width={1010} height={490} layout="none" animate={fade(4.8,.25)}>
      <media file={logo} x={0} y={0} width={1010} height={490} fit="contain"/>
    </frame>
    <text x={192} y={680} width={1536} height={58} align="center" fontFamily="DM Sans"
      typography={{fontAssetId:bold.id}} fontSize={34} letterSpacing={8} color="#e2dacc"
      animate={fade(4.8,.25)}>HELL LORD</text>
    <text x={192} y={768} width={1536} height={48} align="center" fontFamily="DM Sans"
      typography={{fontAssetId:regular.id}}
      fontSize={25} letterSpacing={4} color="#d8d2c6" animate={fade(4.8,.25)}>DARK FANTASY ACTION RPG</text>
  </frame>,{at:25.2,dur:4.8,name:'brand-close'});
  p.compose(title('PLAY THE FREE DEMO ON STEAM',4,840,'center',44),
    {at:26,dur:4,name:'steam-cta'});
  mkdirSync(dir,{recursive:true});
  writeFileSync(resolve(dir,'hero-source-plan.json'),JSON.stringify(plan,null,2)+'\n');
  console.log(JSON.stringify({dir,duration:end,frames:900,status:'REVIEW_DRAFT'}));
};
