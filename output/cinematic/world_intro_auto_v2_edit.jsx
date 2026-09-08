// Run from this project directory: higgsedit build edit.jsx
// v2: one continuous 4-second narration bridges city (1.75s) and relics (2.25s).
import path from "node:path";
export default async ({project}) => {
  const root=process.cwd();
  const p=await project({dir:root,size:"1280x720",fps:24,background:"#000000"});
  const master=await p.add(path.join(root,"input/v1_clean.mp4"));
  const city=await p.add(path.join(root,"input/city_silent.mp4"));
  const relics=await p.add(path.join(root,"input/relics_silent.mp4"));
  const voice=await p.add(path.join(root,"input/bridge.wav"));
  const at=1831/24, cityDur=42/24, relicDur=54/24;
  p.cut(master,{at:0,from:0,dur:at,fit:"contain"});
  p.cut(city,{at,from:0,dur:cityDur,fit:"contain"});
  p.cut(relics,{at:at+cityDur,from:0,dur:relicDur,fit:"contain"});
  p.over(voice,{at,dur:4});
  p.cut(master,{at:at+4,from:at+8,dur:33,fit:"contain"});
  await p.frame(at+1,"renders/city-proof.png");
  await p.frame(at+2.25,"renders/relics-proof.png");
};
