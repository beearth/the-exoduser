// Rebuild with: higgsedit build edit.jsx; higgsedit render . --engine node --out renders/picture.mp4
import path from "node:path";
export default async ({project}) => {
 const root=process.cwd();
 const p=await project({dir:root,size:"1280x720",fps:24,background:"#000000"});
 const old=await p.add(path.join(root,"input/intro_v3.mp4"));
 const gate=await p.add(path.join(root,"input/cruel_gate_v1_en_ko.mp4"));
 const start=306/24,end=415/24,total=2719/24;
 p.cut(old,{at:0,from:0,dur:start,fit:"contain"});
 p.cut(gate,{at:start,from:0,dur:end-start,fit:"contain"});
 p.cut(old,{at:end,from:end,dur:total-end,fit:"contain"});
 await p.frame(14.5,"renders/gate-proof.png");
};
