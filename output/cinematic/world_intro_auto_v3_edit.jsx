// From this directory: higgsedit build edit.jsx
// Reuse the previously produced metal-logo title without redesigning it.
import path from "node:path";
export default async ({project}) => {
  const root=process.cwd();
  const p=await project({dir:root,size:"1280x720",fps:24,background:"#000000"});
  const intro=await p.add(path.join(root,"input/intro_v2.mp4"));
  const ending=await p.add(path.join(root,"input/ending_defiance_v1.mp4"));
  const titleAt=2623/24;
  p.cut(intro,{at:0,from:0,dur:titleAt,fit:"contain"});
  p.cut(ending,{at:titleAt,from:15.5,dur:4,fit:"contain"});
  await p.frame(titleAt+2,"renders/title-proof.png");
};
