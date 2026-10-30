const fs=require('node:fs'),path=require('node:path');
const right=r=>r.x+r.width,bottom=r=>r.y+r.height;
const inside=(a,b,t=.5)=>a.x>=b.x-t&&a.y>=b.y-t&&right(a)<=right(b)+t&&bottom(a)<=bottom(b)+t;
const intersects=(a,b)=>Math.min(right(a),right(b))-Math.max(a.x,b.x)>.5&&Math.min(bottom(a),bottom(b))-Math.max(a.y,b.y)>.5;
function analyze(frame){
 const elements=[];
 for(const e of frame.elements||[]){
  if(!e.rect||e.rect.width<=0||e.rect.height<=0)continue;
  // 같은 문자열의 1px 외곽선/그림자만 통합한다. 다른 내용은 제외하지 않는다.
  if(elements.some(p=>p.kind===e.kind&&p.text===e.text&&['x','y','width','height'].every(k=>Math.abs(p.rect[k]-e.rect[k])<=3.1)))continue;
  elements.push(e);
 }
 const visible=elements.filter(e=>e.kind!=='text'||!elements.some(p=>p.kind==='panel'&&p.order>e.order&&inside(e.rect,p.rect)));
 const issues=[],screen={x:0,y:0,width:frame.width,height:frame.height};
 for(let i=0;i<visible.length;i++){
  const a=visible[i];if(a.kind!=='text')continue;
  if(!inside(a.rect,screen))issues.push({type:'화면 이탈',a});
  for(let j=0;j<visible.length;j++){
   if(i===j)continue;const b=visible[j];if(!intersects(a.rect,b.rect))continue;
   if(b.kind==='text'){if(j>i)issues.push({type:'글자-글자',a,b});}
   else if(b.kind==='button'&&!(inside(a.rect,b.rect)&&a.order>b.order))issues.push({type:'글자-버튼',a,b});
   else if(b.kind==='panel'&&!inside(a.rect,b.rect))issues.push({type:'글자-판',a,b});
  }
 }
 return {...frame,elements:visible,issues};
}
function run(dir){
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'coverage.json'),'utf8'));
 const frames=manifest.frames.map(name=>analyze(JSON.parse(fs.readFileSync(path.join(dir,name+'.json'),'utf8'))));
 const missing=[];
 for(const width of [1920,1600])for(const lang of manifest.languages)for(const page of manifest.pages)
  if(!frames.some(f=>f.width===width&&f.language===lang&&f.page===page&&f.repaintFrames>0&&f.elements.some(e=>e.kind==='text')))missing.push(`${width}/${lang}/${page}`);
 const result={passed:missing.length===0&&frames.every(f=>f.issues.length===0),frameCount:frames.length,issueCount:frames.reduce((s,f)=>s+f.issues.length,0),missing,frames};
 fs.writeFileSync(path.join(dir,'overlap-report.json'),JSON.stringify(result,null,2));
 const rows=frames.flatMap(f=>f.issues.map(i=>`|${f.page}|${f.width}×${f.height}|${f.language}|${i.type}|${(i.a.text||'').replaceAll('|','/')}|${i.b?.text||i.b?.kind||''}|${i.a.source||''}|`));
 fs.writeFileSync(path.join(dir,'겹침_검사.md'),`# 전 화면 겹침 검사\n\n판정: ${result.passed?'PASS':'FAIL'}, ${frames.length}장, 겹침 ${result.issueCount}건, 누락 ${missing.length}건.\n\n실제 Repaint에서 수집한 글자 측정 사각형·버튼·판의 경계 검사다. 판/버튼 안의 자기 글자와 뒤 판에 가려진 글자는 정상 포함/가림으로 처리한다. 다른 문자열 충돌은 제외하지 않는다.\n\n|화면|해상도|언어|종류|글자|상대|그리기 위치|\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n${missing.join('\n')}\n`);
 console.log(JSON.stringify({passed:result.passed,frames:frames.length,issues:result.issueCount,missing}));return result.passed;
}
module.exports={analyze,run};if(require.main===module)process.exitCode=run(process.argv[2])?0:2;
