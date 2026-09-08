// World intro auto v1. Inputs and timeline are project-local; no game runtime changes.
import fs from "node:fs";
export default async ({ project }) => {
  const p = await project({dir:"/tmp/hr_intro_auto",size:"1280x720",fps:24,background:"#000000"});
  const beats=JSON.parse(fs.readFileSync("/tmp/hr_intro_auto/segments.json","utf8"));
  for(const b of beats){
    const clip=await p.add("/tmp/hr_intro_auto/input/"+b.id+".mp4");
    p.cut(clip,{at:b.at,from:0,dur:b.duration,fit:"contain"});
  }
  const titleAt=113.29166666666667;
  p.compose(
    <column x={128} y={244} width={1024} height={232} align="center" justify="center" gap={18}>
      <text width={1024} fontFamily="Playfair Display" fontSize={100} fontWeight={700} letterSpacing={8} align="center" color="#d5c6ab"
        animate={[{property:"opacity",keyframes:[{at:0,value:0},{at:0.5,value:1},{at:3.4,value:1},{at:4,value:0}]}]}>EXODUSER</text>
      <text width={1024} fontFamily="Inter" fontSize={27} fontWeight={400} letterSpacing={10} align="center" color="#8d887f"
        animate={[{property:"opacity",keyframes:[{at:0,value:0},{at:0.6,value:1},{at:3.4,value:1},{at:4,value:0}]}]}>HELL ROAD</text>
    </column>,
    {at:titleAt,dur:4,name:"EXODUSER — HELL ROAD"}
  );
  fs.writeFileSync("/tmp/hr_intro_auto/title_times.json",JSON.stringify({titleAt,titleDur:4,total:titleAt+4}));
  await p.frame(titleAt+1.5,"renders/title-proof.png");
};
