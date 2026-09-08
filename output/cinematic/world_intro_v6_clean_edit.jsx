import path from "node:path";
export default async ({project})=>{
 const root=process.cwd();
 const p=await project({dir:root,size:"1280x720",fps:24,background:"#000000"});
 const clean=await p.add(path.join(root,"input/v2_clean.mp4"));
 const gate=await p.add(path.join(root,"input/gate_retimed.mp4"));
 const title=await p.add(path.join(root,"input/v5.mp4"));
 const start=306/24,end=415/24,titleAt=2623/24;
 p.cut(clean,{at:0,from:0,dur:start,fit:"contain"});
 p.cut(gate,{at:start,from:0,dur:end-start,fit:"contain"});
 p.cut(clean,{at:end,from:end,dur:titleAt-end,fit:"contain"});
 p.cut(title,{at:titleAt,from:titleAt,dur:4,fit:"contain"});
 await p.frame(14,"renders/clean-proof.png");
};
