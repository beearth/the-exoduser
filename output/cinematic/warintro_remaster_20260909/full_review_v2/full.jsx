export default async ({project})=>{
 const p=await project({dir:"full-project",size:"1280x720",fps:24,background:"#000000"});
 const head=await p.add("/home/user/warintro_full_review_20260909/clean.mp4");const end=await p.add("/home/user/warintro_pause_v2/ending_clean.mp4");
 p.cut(head,{from:0,dur:89.5,at:0,fit:"cover"});
 p.cut(end,{from:0.5,dur:9.5,at:89.5,fit:"cover"});
};