// Native Higgsedit composition; historical real development footage only.
// Prepare CFR30 zero-trim MP4 inputs first. No game/browser/server mutation.
import { readFileSync } from "node:fs";

const INPUT = "/home/user/rift-input";
const OUTPUT = "/home/user/rift-edits";
const BG = "#0c1117", FG = "#f3ede1", GOLD = "#e4bb7f", MUTED = "#b5c1c8";
const PLANS = {
  landscape: { size: "1920x1080", w:1920, h:1080, duration:34, shots:[
    {src:"hook", at:0, dur:4, kr:"전투가 끝나면,\n어디로 갈까?", en:"WHERE DO SOULS GO BETWEEN BATTLES?", tag:"지옥의 틈 / 개발 기록 01"},
    {src:"concept", at:4, dur:6, kr:"망자들이\n머무는 틈", en:"A PLACE BETWEEN STAGES", tag:"2026.10.05 / 콘셉트 원화"},
    {src:"walk", at:10, dur:9, kr:"그림 속으로\n걸어 들어가다", en:"FROM PAINTING TO PLAYABLE SPACE", tag:"2026.10.06 / 실제 보행"},
    {src:"detail", at:19, dur:2, kr:"틈에\n머무는 이들", en:"SOULS THAT LINGER", tag:"2026.10.06 / 개발 녹화"},
    {src:"ascent", at:21, dur:9, kr:"다음은,\n망자들의 이야기", en:"NEXT: THE STORIES THEY LEFT BEHIND", tag:"지옥의 틈 / 개발 중"},
  ]},
  portrait: { size:"1080x1920", w:1080, h:1920, duration:20, shots:[
    {src:"short1", at:0, dur:6, kr:"전투가 끝나면,\n어디로 갈까?", en:"BETWEEN BATTLES", tag:"개발 기록 01"},
    {src:"short2", at:6, dur:6, kr:"망자들이\n머무는 곳", en:"WHERE SOULS LINGER", tag:"지옥의 틈 / 개발 중"},
    {src:"short3", at:12, dur:4, kr:"그림에서\n걸어 다니는 공간으로", en:"FROM ART TO FIRST WALK", tag:"2026.10.06 / 실제 개발 녹화"},
  ]},
};

export default async ({project}) => {
  const target=process.env.RIFT_EDIT_TARGET || "landscape";
  const plan=PLANS[target];
  if(!plan) throw new Error(`Unknown target: ${target}`);
  const prepared=JSON.parse(readFileSync(`${INPUT}/prepared.json`,"utf8"));
  const p=await project({dir:`${OUTPUT}/${target}`,size:plan.size,fps:30,background:BG});
  const krFont=await p.add(`${INPUT}/NotoSansKR.ttf`);
  const krType={fontAssetId:krFont.id,axes:{wght:650},script:"Hang",language:"ko",direction:"ltr"};
  const logo=await p.add(`${INPUT}/logo.png`);
  // Editorial score from an existing project asset; source recordings are silent.
  // The prepared audio has a measured fade and is placed once on the audio spine.
  const music=await p.add(`${INPUT}/bgm-${target}.m4a`);
  p.cut(music,{from:0,dur:plan.duration,at:0});
  const source={};
  for(const shot of plan.shots){
    const entry=prepared[shot.src];
    if(!entry || entry.duration < shot.dur || entry.frames !== shot.dur*30) throw new Error(`Unverified preparation: ${shot.src}`);
    source[shot.src]=await p.add(entry.file);
  }
  for(const s of plan.shots){
    const handle=source[s.src];
    if(target==="landscape"){
      // Whole source visible at left. A separate right column carries the story.
      p.compose(
        <frame width={1920} height={1080} layout="none" background={BG}>
          <frame x={0} y={0} width={1320} height={1080} layout="column" clip={true}>
            <media file={handle} trimStart={0} fit="contain" width="fill" height="fill"/>
          </frame>
          <frame x={1320} y={0} width={600} height={1080} layout="none" background="#111a23">
            <text x={48} y={70} width={504} height={48} fontFamily="DM Sans" fontWeight={700} fontSize={24} color={GOLD}>EXODUSER: HELL LORD</text>
            <text x={48} y={148} width={504} height={90} typography={krType} fontSize={24} lineHeight={1.5} color={MUTED}>{s.tag}</text>
            <text x={48} y={330} width={504} height={270} typography={krType} fontSize={51} lineHeight={1.35} color={FG}>{s.kr}</text>
            <text x={48} y={638} width={504} height={150} fontFamily="DM Sans" fontWeight={700} fontSize={30} lineHeight={1.25} color={GOLD}>{s.en}</text>
            <text x={48} y={932} width={504} height={80} typography={krType} fontSize={20} lineHeight={1.4} color={MUTED}>개발 중 화면 / 공개 데모와 다름</text>
            <text x={48} y={1000} width={504} height={40} fontFamily="DM Sans" fontSize={16} color={MUTED}>Separate development build / FDG</text>
          </frame>
        </frame>, {at:s.at,dur:s.dur,name:`${target}-${s.src}`});
    }else{
      p.compose(
        <frame width={1080} height={1920} layout="none" background={BG}>
          <text x={72} y={142} width={936} height={60} typography={krType} fontSize={27} color={GOLD}>{s.tag}</text>
          <text x={72} y={238} width={936} height={250} typography={krType} fontSize={72} lineHeight={1.25} color={FG}>{s.kr}</text>
          <frame x={0} y={530} width={1080} height={950} layout="column" clip={true}>
            <media file={handle} trimStart={0} fit="contain" width="fill" height="fill"/>
          </frame>
          <text x={72} y={1534} width={936} height={90} fontFamily="DM Sans" fontWeight={700} fontSize={35} color={GOLD}>{s.en}</text>
          <text x={72} y={1660} width={936} height={50} typography={krType} fontSize={27} color={MUTED}>개발 중 화면 / 공개 데모와 다름</text>
          <text x={72} y={1732} width={936} height={80} fontFamily="DM Sans" fontSize={23} color={MUTED}>{"Separate development build\nFOR DEAR GAMERS"}</text>
        </frame>,{at:s.at,dur:s.dur,name:`${target}-${s.src}`});
    }
  }
  const vertical=target==="portrait";
  p.compose(
    <frame width={plan.w} height={plan.h} layout="none" background={BG}>
      <frame x={vertical?70:400} y={vertical?380:90} width={vertical?940:1120} height={vertical?380:380} layout="column">
        <media file={logo} fit="contain" width="fill" height="fill"/>
      </frame>
      <text x={vertical?70:250} y={vertical?820:510} width={vertical?940:1420} height={100} typography={krType} fontSize={vertical?66:56} color={FG} align="center">지옥의 틈 / 개발 기록 01</text>
      <text x={vertical?70:250} y={vertical?978:655} width={vertical?940:1420} height={100} fontFamily="DM Sans" fontWeight={700} fontSize={vertical?42:46} color={GOLD} align="center">FREE WINDOWS DEMO ON STEAM</text>
      <text x={vertical?70:250} y={vertical?1148:800} width={vertical?940:1420} height={80} typography={krType} fontSize={vertical?32:28} color={MUTED} align="center">개발 중 화면 / 공개 데모와 다름</text>
      <text x={vertical?70:250} y={vertical?1280:900} width={vertical?940:1420} height={100} fontFamily="DM Sans" fontSize={vertical?26:24} color={MUTED} align="center">{"Separate development build\nFOR DEAR GAMERS"}</text>
    </frame>,{at:plan.duration-4,dur:4,name:`${target}-cta`});
  console.log(JSON.stringify({target,dir:`${OUTPUT}/${target}`,duration:plan.duration,frames:plan.duration*30}));
};
