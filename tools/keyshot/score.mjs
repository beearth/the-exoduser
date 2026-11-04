export function scoreFrame(frame, image) {
  const visible=frame.enemies.filter(e=>e.visible&&e.w>1&&e.h>1&&e.x>=0&&e.y>=0&&e.x+e.w<=frame.width&&e.y+e.h<=frame.height);
  const upperEnemies=visible.filter(e=>e.y+e.h/2<frame.height/3).length;
  const heights=visible.map(e=>e.h/frame.height);
  const layers=new Set(heights.map(h=>h<.035?'far':h<.075?'middle':'near')).size;
  const heroOccluded=frame.heroOverlap>0||!frame.hero||frame.hero.visible===false||frame.hero.w<=0||frame.hero.h<=0;
  const luminance=image.luminance, hudOverlap=image.hudOverlap||0, blackBorder=!!image.blackBorder;
  const score=Number((Math.min(upperEnemies,12)*5+layers*18+Math.min(visible.length,24)-
    (heroOccluded?30:0)-hudOverlap*50-(blackBorder?100:0)-(luminance<20?(20-luminance)*2:0)).toFixed(2));
  return {score,upperEnemies,layers,visibleEnemies:visible.length,heroOccluded,hudOverlap,luminance,blackBorder,
    visibilityMethod:'렌더러 투영과 물리 가림 근사. 알파 식생과 안개는 눈으로 확인 필요'};
}
export function pixelDifference(a,b) {
  if(a.length!==b.length||!a.length)throw new Error('픽셀 배열 크기 불일치 또는 빈 이미지');
  let changed=0,sum=0,max=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)changed++;sum+=d;max=Math.max(max,d);}
  return {changed,total:a.length,ratio:changed/a.length,mean:sum/a.length,max};
}
export function sameComposition(a,b) {
  return ['id','width','height','hud','tick','seed','player','facing','camera','state'].every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
}
export function validateCaptureSet(frames) {
  const groups=new Map(),files=new Set();
  for(const f of frames){
    if(files.has(f.file))throw new Error('촬영 파일 중복: '+f.file);files.add(f.file);
    const key=f.id;if(!groups.has(key))groups.set(key,{scene:f.scene,pairs:new Set()});
    const group=groups.get(key),pair=`${f.width}x${f.height}/${f.hud}`;
    if(group.scene!==f.scene||group.pairs.has(pair))throw new Error('시점/해상도 중복: '+key);
    group.pairs.add(pair);
  }
  for(const [id,g] of groups){
    if(g.pairs.size!==6)throw new Error('해상도 또는 HUD 쌍 누락: '+id);
    for(const size of ['1920x1080','3840x2160','3840x1080'])for(const hud of [true,false])if(!g.pairs.has(size+'/'+hud))throw new Error('필수 해상도 누락: '+id);
  }
  for(const scene of ['S1','S2','S3'])if([...groups.values()].filter(g=>g.scene===scene).length<3)throw new Error(scene+' 후보 3개 미만');
  return groups.size;
}
export function imageMetrics(frame,on,off) {
  const {width,height}=frame;if(on.length!==width*height*3||off.length!==on.length)throw new Error('이미지와 기록 해상도 불일치');
  const mask=new Uint8Array(width*height);
  for(const e of frame.enemies)if(e.visible){const left=Math.max(0,Math.ceil(e.x)),right=Math.min(width,Math.ceil(e.x+e.w));for(let y=Math.max(0,Math.ceil(e.y));y<Math.min(height,Math.ceil(e.y+e.h));y++)mask.fill(1,y*width+left,y*width+right);}
  let total=0,border=0,dark=0,covered=0,enemyPixels=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const p=y*width+x,i=p*3,l=.2126*off[i]+.7152*off[i+1]+.0722*off[i+2];total+=l;
    if(x<8||x>=width-8){border++;if(l<2)dark++;}
    if(mask[p]){enemyPixels++;if(Math.max(Math.abs(on[i]-off[i]),Math.abs(on[i+1]-off[i+1]),Math.abs(on[i+2]-off[i+2]))>18)covered++;}
  }
  return {luminance:total/(width*height),blackBorder:dark/border>.98,hudOverlap:enemyPixels?covered/enemyPixels:0};
}
export function selectViews(rows,count=4) {
  if(count<3||count>5)throw new Error('장면당 후보는 3~5개');
  return ['S1','S2','S3'].flatMap(scene=>{
    const group=rows.filter(r=>r.scene===scene).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    if(group.length<count)throw new Error(scene+' 후보 부족');return group.slice(0,count);
  });
}
