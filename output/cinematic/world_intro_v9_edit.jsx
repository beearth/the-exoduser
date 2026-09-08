// Pictures only; final mux copies v8 AAC without re-encoding.
export default async ({project}) => {
  const p=await project({dir:"project",size:"1280x720",fps:24,background:"#000000"});
  const master=await p.add("input/v8.mp4");
  const psychic=await p.add("input/psychic.mp4");
  const mage=await p.add("input/mage.mp4");
  const beats=[
    {source:master,from:0,dur:2035/24},
    {source:psychic,from:0,dur:62/24},
    {source:mage,from:0,dur:82/24},
    {source:master,from:2179/24,dur:540/24}
  ];
  for(const beat of beats)p.cut(beat.source,{from:beat.from,dur:beat.dur});
  // Main encode is done with: higgsedit render project --engine node
  if(process.env.V9_PROOFS==="1"){
    await p.frame(85.8,"renders/psychic-proof.png");
    await p.frame(88.8,"renders/mage-proof.png");
  }
};

