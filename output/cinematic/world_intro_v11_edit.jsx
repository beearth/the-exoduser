// v11 picture edit: end C14 after "We call them", reuse the approved four-second logo.
export default async ({project}) => {
  const p=await project({dir:"project",size:"1280x720",fps:24,background:"#000000"});
  const source=await p.add("source.mp4");
  for(const beat of [{from:0,dur:106.25},{from:2623/24,dur:4}])
    p.cut(source,beat);
  await p.frame(107.4,"renders/logo-proof.png");
};
