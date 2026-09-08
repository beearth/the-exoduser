// v10: keep 3s psychic; new 3s traditional mage. Narration shifted separately, not bit-copied.
export default async ({project}) => {
  const p=await project({dir:"project",size:"1280x720",fps:24,background:"#000000"});
  const master=await p.add("input/v9.mp4");
  const psychic=await p.add("input/psychic.mp4");
  const mage=await p.add("input/mage.mp4");
  for(const beat of [
    {source:master,from:0,dur:2035/24},
    {source:psychic,from:0,dur:3},
    {source:mage,from:0,dur:3},
    {source:master,from:2179/24,dur:540/24}
  ])p.cut(beat.source,{from:beat.from,dur:beat.dur});
  if(process.env.V10_PROOFS==="1"){
    await p.frame(85.8,"renders/psychic-proof.png");
    await p.frame(90.25,"renders/mage-proof.png");
  }
};
