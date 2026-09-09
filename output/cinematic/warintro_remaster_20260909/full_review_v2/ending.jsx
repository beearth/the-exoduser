import {writeFileSync} from "node:fs";
export default async ({project})=>{
 const p=await project({dir:"ending-project",size:"1280x720",fps:24,background:"#000000"});
 const v=await p.add("/home/user/warintro_pause_v2/ending_source.mp4");const a=await p.add("/home/user/warintro_pause_v2/voice_pause.wav");
 p.cut(v,{from:0,dur:10,at:0,fit:"cover"});
 writeFileSync("/home/user/warintro_pause_v2/voice_id.txt",a.id);
};