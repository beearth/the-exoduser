import path from "node:path";
export default async ({project})=>{
 const root=process.cwd();
 const p=await project({dir:root,size:"1280x720",fps:24,background:"#000000"});
 const source=await p.add(path.join(root,"input/v6.mp4"));
 const logo=await p.add(path.join(root,"input/logo.png"));
 const titleAt=2623/24,logoHeight=1280*348/835;
 p.cut(source,{at:0,from:0,dur:titleAt,fit:"contain"});
 p.compose(
  <media file={logo} x={0} y={(720-logoHeight)/2} width={1280} height={logoHeight} fit="contain"
   animate={[{property:"opacity",keyframes:[
    {at:0,value:0},{at:0.75,value:1,easing:"linear"},
    {at:3.6,value:1},{at:4,value:0,easing:"linear"}
   ]}]} />,
  {at:titleAt,dur:4,name:"exoduser-only-title"}
 );
 await p.frame(titleAt+2,"renders/title-proof.png");
};
