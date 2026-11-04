export function scoreFrame(frame, image) {
  const visible=frame.enemies.filter(e=>e.visible&&e.w>1&&e.h>1&&e.x>=0&&e.y>=0&&e.x+e.w<=frame.width&&e.y+e.h<=frame.height);
  const upperEnemies=visible.filter(e=>e.y+e.h/2<frame.height/3).length;
  const heights=visible.map(e=>e.h/frame.height);
  const layers=new Set(heights.map(h=>h<.035?'far':h<.075?'middle':'near')).size;
  const heroOccluded=frame.heroOverlap>0||!frame.hero||frame.hero.w<=0||frame.hero.h<=0;
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
  return ['id','width','height','hud','tick','seed','player','camera','state'].every(k=>JSON.stringify(a[k])===JSON.stringify(b[k]));
}
export function selectViews(rows,count=4) {
  if(count<3||count>5)throw new Error('장면당 후보는 3~5개');
  return ['S1','S2','S3'].flatMap(scene=>{
    const group=rows.filter(r=>r.scene===scene).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    if(group.length<count)throw new Error(scene+' 후보 부족');return group.slice(0,count);
  });
}
