// Pack the back-mounted sword spin and left-hand dagger; one shared body scale.
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'output/silvertail_attack_20260915/spin');
const scale=.112;
// Source alpha bounds and planted-foot/body anchors, in chronological order.
const poses=[
 [65,34,368,418,190,418],[462,39,807,419,590,419],[837,38,1201,416,900,416],
 [842,448,1186,804,970,804],[435,438,818,812,625,812],[33,440,387,804,260,804],
 [34,835,409,1220,285,1220],[427,837,757,1242,610,1242],[858,830,1180,1228,1010,1228]
];
(async()=>{
 const layers=[],report=[];
 for(let f=0;f<poses.length;f++){
  const [l,t,r,b,ax,ay]=poses[f],w=r-l+1,h=b-t+1;
  const width=Math.round(w*scale),height=Math.round(h*scale);
  const x=Math.round(40+(l-ax)*scale),y=Math.round(62+(t-ay)*scale);
  if(x<1||y<1||x+width>79||y+height>79)throw Error('Clipped frame '+f);
  const input=await sharp(path.join(dir,'source.png')).extract({left:l,top:t,width:w,height:h}).resize(width,height).png().toBuffer();
  layers.push({input,left:(f%3)*80+x,top:Math.floor(f/3)*80+y});
  report.push({direction:['s','sw','w','nw','n','ne','e','se','s'][f],frame:f,scale,x,y,width,height,footY:62});
 }
 const out=path.join(root,'img/exoduser_silvertail/attack-spin-v2.png');
 await sharp({create:{width:240,height:240,channels:4,background:'#00000000'}}).composite(layers).png().toFile(out);
 fs.writeFileSync(path.join(dir,'packing.json'),JSON.stringify(report,null,2)+'\n');
 console.log(out,report.length+' source poses, no cell clipping');
})();
