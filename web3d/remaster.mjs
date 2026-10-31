export function remasterFrame(frame,charIndex){
  if(charIndex!==0||!frame)return null;
  let id,offset=0;
  if(frame.w===48&&frame.h===48&&frame.y<384)id='warrior-base';
  else if(frame.w===80&&frame.h===80&&frame.y>=384&&frame.y<1024){id='warrior-attack';offset=384;}
  else if(frame.w===64&&frame.h===64&&frame.y>=1024&&frame.y<1536){id='warrior-dash';offset=1024;}
  else return null;
  return {id,frame:{x:frame.x*2,y:(frame.y-offset)*2,w:frame.w*2,h:frame.h*2}};
}
export function normalTextureSize(width,height){const ratio=Math.min(1,Math.sqrt(512*512/(width*height)));return {width:Math.max(1,Math.floor(width*ratio)),height:Math.max(1,Math.floor(height*ratio))};}
export async function loadRemasters(){
  const records=new Map(),dirs=['south','south_east','east','north_east','north','north_west','west','south_west'];
  const load=url=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(Error('Sprite load: '+url));i.src=url;});
  await Promise.all(['warrior-base','warrior-attack','warrior-dash',...dirs.map(d=>'enemy-'+d)].map(async id=>{
    const base='./assets/web3d/sprites/'+id;
    const [image,normal]=await Promise.all([load(base+'.png'),load(base+'.normal.png')]);records.set(id,{image,normal});
  }));
  await Promise.all(dirs.map(async dir=>{const normal=await load('./assets/web3d/sprites/enemy-walk-'+dir+'.normal.webp');records.set('enemy-walk-'+dir,{normal});}));
  return records;
}
