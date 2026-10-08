// Historical Oct 5 concept + Oct 6 automated QA capture. Devlog v0.1 is an editorial edition, not a game build version.
// Prepared CFR30 source windows only; no browser, game execution, optical interpolation, invented gameplay or new AI assets.
import { readFileSync } from "node:fs";

const INPUT=process.env.RIFT_V01_INPUT||"/home/user/rift-v01-20261008/input";
const DIR=process.env.RIFT_V01_PROJECT||"/home/user/rift-v01-20261008/project";
const BG="#10131b", PANEL="#191d28", FG="#f1eee6", GOLD="#deb57d", MUTED="#bdc6ce";
export default async ({project})=>{
  const plan=JSON.parse(readFileSync(`${INPUT}/manifest.json`,"utf8"));
  if(plan.duration!==15||plan.shots.length!==4)throw new Error("Unexpected historical source plan");
  const p=await project({dir:DIR,size:"1920x1080",fps:30,background:BG});
  const kr=await p.add(`${INPUT}/NotoSansKR.ttf`);
  const krType={fontAssetId:kr.id,axes:{wght:600},script:"Hang",language:"ko",direction:"ltr"};
  const concept=await p.add(`${INPUT}/concept-20261005.png`);
  const music=await p.add(`${INPUT}/bgm-v01.m4a`);
  p.cut(music,{from:0,at:0,dur:15});
  const handles={concept};
  for(const s of plan.shots)if(s.file)handles[s.key]=await p.add(`${INPUT}/${s.file}`);
  const header=()=> <frame width={1920} height={132} layout="none" background={BG}>
    <text x={42} y={24} width={1810} height={48} fontFamily="DM Sans" fontWeight={700} fontSize={32} color={GOLD}>RIFT DEVLOG v0.1 / WORK IN PROGRESS</text>
    <text x={42} y={78} width={243} height={40} typography={krType} fontSize={27} color={FG}>지옥의 틈 개발 기록</text>
    <text x={294} y={78} width={73} height={40} fontFamily="DM Sans" fontSize={27} color={FG}>v0.1 ·</text>
    <text x={377} y={78} width={200} height={40} typography={krType} fontSize={27} color={FG}>개발 중</text>
  </frame>;
  const footer=()=> <frame x={0} y={984} width={1920} height={96} layout="none" background={BG}>
    <text x={42} y={6} width={1810} height={31} fontFamily="DM Sans" fontSize={20} color={MUTED}>CONCEPT 2026-10-05 / FOOTAGE 2026-10-06 / v0.1 = DEVLOG EDITION</text>
    <text x={42} y={46} width={1810} height={34} typography={krType} fontSize={21} color={MUTED}>이전 자동 점검 녹화 / 현재 스팀 공개 데모와 다른 개발 자료</text>
  </frame>;
  for(const s of plan.shots){
    if(s.file&&(s.frames!==s.dur*30||s.sourceEnd-s.sourceStart!==s.dur))throw new Error(`Unverified source window: ${s.key}`);
    p.compose(<frame width={1920} height={1080} layout="none" background={BG}>
      {header()}
      <frame x={0} y={140} width={1270} height={828} layout="column" clip={true}>
        <media file={handles[s.key]} trimStart={0} fit="contain" width="fill" height="fill"/>
      </frame>
      <frame x={1296} y={140} width={582} height={828} layout="none" background={PANEL}>
        <text x={38} y={38} width={506} height={85} fontFamily="DM Sans" fontWeight={700} fontSize={25} lineHeight={1.25} color={GOLD}>{s.tag}</text>
        <text x={38} y={190} width={506} height={200} typography={krType} fontSize={45} lineHeight={1.35} color={FG}>{s.kr}</text>
        <text x={38} y={430} width={506} height={140} fontFamily="DM Sans" fontWeight={700} fontSize={27} lineHeight={1.3} color={FG}>{s.en}</text>
        <text x={38} y={650} width={506} height={115} typography={krType} fontSize={22} lineHeight={1.5} color={MUTED}>{s.note}</text>
      </frame>
      {footer()}
    </frame>,{at:s.at,dur:s.dur,name:`v01-${s.key}`});
  }
  p.compose(<frame width={1920} height={1080} layout="none" background={BG}>
    {header()}
    <frame x={0} y={140} width={860} height={828} layout="column" clip={true}><media file={concept} fit="contain" width="fill" height="fill"/></frame>
    <text x={940} y={205} width={900} height={70} fontFamily="DM Sans" fontWeight={700} fontSize={38} color={GOLD}>NEXT ITERATION</text>
    <text x={940} y={330} width={900} height={310} typography={krType} fontSize={44} lineHeight={1.6} color={FG}>{"이동과 화면 안정성 개선\n주민과 공간 연출 다듬기\n다음 버전에서 다시 기록"}</text>
    <text x={940} y={735} width={900} height={130} fontFamily="DM Sans" fontSize={25} lineHeight={1.5} color={MUTED}>{"Movement / visibility / resident staging\nDevelopment continues."}</text>
    {footer()}
  </frame>,{at:10,dur:3,name:"v01-next-iteration"});
  p.compose(<frame width={1920} height={1080} layout="none" background={BG}>
    {header()}
    <text x={160} y={300} width={1600} height={95} fontFamily="DM Sans" fontWeight={700} fontSize={68} align="center" color={FG}>EXODUSER: HELL LORD</text>
    <text x={160} y={490} width={1600} height={80} fontFamily="DM Sans" fontWeight={700} fontSize={44} align="center" color={GOLD}>FREE WINDOWS DEMO ON STEAM</text>
    <text x={160} y={650} width={1600} height={75} typography={krType} fontSize={31} align="center" color={FG}>지옥의 틈은 별도 개발 중인 공간입니다</text>
    <text x={160} y={770} width={1600} height={90} fontFamily="DM Sans" fontSize={23} lineHeight={1.5} align="center" color={MUTED}>{"Historical QA footage / existing AI-assisted art and music\nFOR DEAR GAMERS"}</text>
    {footer()}
  </frame>,{at:13,dur:2,name:"v01-steam-cta"});
  console.log(JSON.stringify({dir:DIR,duration:15,frames:450,sourceOrder:plan.shots.map(s=>s.key)}));
};
