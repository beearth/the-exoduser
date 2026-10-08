// Existing game art/dialogue/BGM, exported as a cinematic edit rather than a gameplay recording.
import { readFileSync } from "node:fs";
const INPUT="/home/user/nemesia-input", DIR="/home/user/nemesia-edit";
const BG="#08090f", FG="#f0ece7", GOLD="#d9b788";
export default async ({project})=>{
  const plan=JSON.parse(readFileSync(`${INPUT}/manifest.json`,"utf8"));
  if(plan.cues.length!==27)throw new Error("Expected all 27 original Korean cues");
  const duration=plan.duration+4;
  const p=await project({dir:DIR,size:"1920x1080",fps:30,background:BG});
  const kr=await p.add(`${INPUT}/NotoSansKR.ttf`);
  const krType={fontAssetId:kr.id,axes:{wght:550},script:"Hang",language:"ko",direction:"ltr"};
  const music=await p.add(`${INPUT}/music-prepared.m4a`);
  p.cut(music,{from:0,at:0,dur:duration});
  const images={};
  for(const s of plan.cues)if(s.img&&!images[s.img])images[s.img]=await p.add(`${INPUT}/${s.img}`);
  const labels={GODDESS:"NEMESIA",DIROY:"DIROY",HECTOR:"HECTOR"};
  for(const s of plan.cues){
    const dur=s.dur;
    if(!s.img){p.compose(<rect width={1920} height={1080} fill={BG}/>,{at:s.at,dur,name:`exit-${s.id}`});continue;}
    const hasDialogue=!!(s.ko||s.en);
    p.compose(
      <frame width={1920} height={1080} layout="none" background={BG}>
        <frame width={1920} height={1080} layout="column" clip={true}>
          <media file={images[s.img]} fit="contain" width="fill" height="fill"/>
        </frame>
        <rect x={0} y={0} width={1920} height={68} fill={BG}/>
        <text x={48} y={19} width={900} height={35} fontFamily="DM Sans" fontWeight={700} fontSize={23} color={FG}>EXODUSER: HELL LORD</text>
        <text x={1040} y={21} width={832} height={32} fontFamily="DM Sans" fontSize={20} align="right" color={GOLD}>NEMESIA / OPENING CINEMATIC</text>
        {hasDialogue&&<frame x={0} y={730} width={1920} height={350} layout="none" background="#101019">
          <text x={64} y={25} width={1792} height={36} fontFamily="DM Sans" fontWeight={700} fontSize={25} color={GOLD}>{labels[s.speaker]||s.speaker||""}</text>
          <text x={64} y={82} width={1030} height={250} fontFamily="DM Sans" fontSize={30} lineHeight={1.28} color={FG}>{s.en}</text>
          <rect x={1124} y={82} width={2} height={235} fill="#504b58"/>
          <text x={1160} y={82} width={696} height={250} typography={krType} fontSize={26} lineHeight={1.4} color="#ccc6d0">{s.ko}</text>
        </frame>}
      </frame>,{at:s.at,dur,name:`cue-${s.id}`});
  }
  p.compose(<frame width={1920} height={1080} layout="none" background={BG}>
    <text x={160} y={290} width={1600} height={90} fontFamily="DM Sans" fontWeight={700} fontSize={65} align="center" color={FG}>EXODUSER: HELL LORD</text>
    <text x={160} y={470} width={1600} height={70} fontFamily="DM Sans" fontSize={38} align="center" color={GOLD}>FREE WINDOWS DEMO ON STEAM</text>
    <text x={160} y={635} width={1600} height={70} typography={krType} fontSize={31} align="center" color={FG}>네메시아의 강림 / 오프닝 컷씬</text>
    <text x={160} y={810} width={1600} height={90} fontFamily="DM Sans" fontSize={25} lineHeight={1.5} align="center" color="#b7afbd">{"Cinematic edit from existing game assets / AI-assisted art and music\nFOR DEAR GAMERS"}</text>
  </frame>,{at:plan.duration,dur:4,name:"steam-cta"});
  console.log(JSON.stringify({dir:DIR,duration,frames:Math.round(duration*30)}));
};
