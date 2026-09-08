// Audio recipe produces final.mp4 by copying all v12 picture packets and replacing only Escape.
export default async ({project}) => {
  const p=await project({dir:"project",size:"1280x720",fps:24,background:"#000000"});
  const movie=await p.add("final.mp4");
  p.cut(movie,{at:0,from:0,dur:2719/24});
  await p.frame(100.9,"proof.png");
};
