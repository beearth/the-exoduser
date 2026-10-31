const fs=require('node:fs'),path=require('node:path');
const geometry=require('./geometry.cjs');
const requiredPages=['첫화면','브랜드인트로','메뉴','로비',...Array.from({length:5},(_,i)=>'캐릭터선택'+i),'이름입력','로딩',...Array.from({length:4},(_,i)=>'튜토리얼'+i),'HUD','일시정지','종료확인',...Array.from({length:4},(_,i)=>'설정'+i),...Array.from({length:4},(_,i)=>'설정스크롤'+i),'설정목록','인벤토리','스킬','대장간','능력치','클리어'];
requiredPages.push(...Array.from({length:16},(_,i)=>i).filter(i=>i!==6).map(i=>'스킬슬롯'+String(i).padStart(2,'0')),'실습안내','실습진행','실습스크롤','봉안함','결정체','보관함',...['potion','salvage','reroll','crystal','craft'].map(t=>'대장간-'+t),'일반알림','부활대기','사망',...Array.from({length:8},(_,i)=>'지역유도'+i),'지역진입','지역정화');
const loadingImages=[1,2,3,4,5,6,7,8,9,10,11,12,15,16,18,19];
const right=r=>r.x+r.width,bottom=r=>r.y+r.height;
const inside=(a,b,t=.5)=>a.x>=b.x-t&&a.y>=b.y-t&&right(a)<=right(b)+t&&bottom(a)<=bottom(b)+t;
const intersects=(a,b)=>Math.min(right(a),right(b))-Math.max(a.x,b.x)>.5&&Math.min(bottom(a),bottom(b))-Math.max(a.y,b.y)>.5;
const intersection=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);return {x,y,width:Math.max(0,Math.min(right(a),right(b))-x),height:Math.max(0,Math.min(bottom(a),bottom(b))-y)};};
const positive=r=>r&&r.width>0&&r.height>0;
const above=(a,b)=>Number.isFinite(a.depth)&&Number.isFinite(b.depth)?a.depth<b.depth||(a.depth===b.depth&&a.order>b.order):a.order>b.order;
// 가림 차집합에는 충돌 허용오차를 쓰지 않는다. 0.5px 미만의 남은 조각도 보존한다.
function subtract(a,b){
 const cut=intersection(a,b);if(!positive(cut))return [a];
 return [{x:a.x,y:a.y,width:a.width,height:cut.y-a.y},{x:a.x,y:bottom(cut),width:a.width,height:bottom(a)-bottom(cut)},
  {x:a.x,y:cut.y,width:cut.x-a.x,height:cut.height},{x:right(cut),y:cut.y,width:right(a)-right(cut),height:cut.height}].filter(positive);
}
const shapeKnown=e=>e.axisAligned===true||geometry.valid(e.quad);
const shape=e=>geometry.intersect(geometry.valid(e.quad)?e.quad:geometry.rectPoly(e.rect),geometry.rectPoly(e.rect));
const opaque=e=>e.opacityKnown===true&&e.effectiveOpacity===1&&!!e.opacityProof&&Number.isFinite(e.depth)&&e.orderKnown&&e.clipKnown===true&&shapeKnown(e);
const exact=(actual,expected)=>Array.isArray(actual)&&actual.length===expected.length&&actual.every((n,i)=>Number.isFinite(n)&&n===expected[i]);
const alphaReaderValid=f=>f.alphaReaderVerified===true&&!!f.alphaReaderProof&&exact(f.alphaProbe,[0,.25,.5,1])&&exact(f.alphaMipProbe,[1,.5,0])&&exact(f.alphaRtProbe,[0,.25,.5,1]);
function analyze(frame){
 const elements=[];
 for(const input of frame.elements||[]){
  const e={...input,order:input.order??elements.length,orderKnown:Number.isFinite(input.order)};
  if(!e.rect||e.rect.width<=0||e.rect.height<=0)continue;
  if(e.hasClip){if(!e.clipRect)continue;e.rect=intersection(e.rect,e.clipRect);if(!positive(e.rect))continue;}
  // 같은 문자열의 1px 외곽선/그림자만 통합한다. 다른 내용은 제외하지 않는다.
  const duplicate=elements.findIndex(p=>p.kind==='text'&&e.kind==='text'&&p.text===e.text&&(p.shadow||e.shadow)&&p.depth===e.depth&&JSON.stringify(p.clipRect)===JSON.stringify(e.clipRect)&&!elements.some(s=>s.kind==='surface'&&s.order>p.order&&s.order<e.order&&above(s,p)&&geometry.valid(geometry.intersect(shape(s),shape(p))))&&['x','y','width','height'].every(k=>Math.abs(p.rect[k]-e.rect[k])<=3.1));
  if(duplicate>=0){if(elements[duplicate].shadow&&!e.shadow)elements[duplicate]=e;continue;}
  elements.push(e);
 }
 // Explicit production TxtGlow passes belong to their following body glyph. Keep ordinary duplicates and foreign text visible.
 const glowSuffix=' / 명시 CSS text-shadow 광휘 패스',regionSuffix=glowSuffix+' / region-banner-black-shadow',scale=Math.min(frame.width/1920,frame.height/1080);
 for(const e of elements){const region=e.source?.endsWith(regionSuffix),suffix=region?regionSuffix:glowSuffix,glowRadius=(region?9.2:5.5)*scale+.01;if(e.kind!=='text'||e.shadow!==true||!e.source?.endsWith(suffix)||e.opacityKnown!==true||e.effectiveOpacity<0||e.effectiveOpacity>(region ? .064 : .03))continue;
  const source=e.source.slice(0,-suffix.length),body=elements.find(p=>p.kind==='text'&&!p.shadow&&p.text===e.text&&p.source===source&&p.depth===e.depth&&p.order>e.order&&JSON.stringify(p.clipRect)===JSON.stringify(e.clipRect)&&Math.hypot(p.rect.x-e.rect.x,p.rect.y-e.rect.y)<=glowRadius&&Math.abs(p.rect.width-e.rect.width)<.01&&Math.abs(p.rect.height-e.rect.height)<.01&&!elements.some(s=>s.kind==='surface'&&s.order>e.order&&s.order<p.order&&above(s,e)&&geometry.valid(geometry.intersect(shape(s),shape(e)))));
  if(body)e.decorativeOwnerId=body.id;
 }
 const masks=elements.filter(e=>(e.kind==='surface'||e.kind==='panel')&&opaque(e));
 const visible=elements.filter(e=>e.kind!=='surface').map(e=>{
  let visiblePolygons=[shape(e)].filter(geometry.valid);
  for(const p of masks)if(p!==e&&above(p,e)&&p.ownerId!==e.id)visiblePolygons=visiblePolygons.flatMap(poly=>geometry.subtract(poly,shape(p)));
  return {...e,visiblePolygons,visibleRects:visiblePolygons.map(geometry.bounds)};
 }).filter(e=>e.visibleRects.length);
 const issues=[],screen={x:0,y:0,width:frame.width,height:frame.height};
 for(let i=0;i<visible.length;i++){
  const a=visible[i];if(a.kind!=='text')continue;
  if(a.visibleRects.some(r=>!inside(r,screen)))issues.push({type:'화면 이탈',a});
  for(let j=0;j<visible.length;j++){
   if(i===j)continue;const b=visible[j];const intersectionPolygons=a.visiblePolygons.flatMap(ar=>b.visiblePolygons.map(br=>geometry.intersect(ar,br))).filter(geometry.valid).filter(p=>{const r=geometry.bounds(p);return r.width>.5&&r.height>.5;});const intersections=intersectionPolygons.map(geometry.bounds);if(!intersections.length)continue;
   if(b.kind==='text'){if((a.decorativeOwnerId||b.decorativeOwnerId)&&a.text===b.text&&(a.decorativeOwnerId||a.id)===(b.decorativeOwnerId||b.id))continue;if(j>i)issues.push({type:'글자-글자',a,b,intersections,intersectionPolygons});}
   else if(b.kind==='button'&&!(inside(a.rect,b.rect)&&above(a,b)))issues.push({type:'글자-버튼',a,b,intersections,intersectionPolygons});
   else if(b.kind==='panel'&&!inside(a.rect,b.rect))issues.push({type:'글자-판',a,b,intersections,intersectionPolygons});
   else if(b.kind==='control')issues.push({type:'글자-조작부',a,b,intersections,intersectionPolygons});
  }
 }
 const auditWarnings=[];
 if(frame.schemaVersion!==2)auditWarnings.push('구 스키마: 실제 가림 정보 미충족');
 for(const e of elements){
  if(!Number.isFinite(e.depth)||!e.orderKnown||e.clipKnown!==true)auditWarnings.push(e.id+': 깊이/순서/클립 미충족');
  if(e.kind==='surface'&&(!e.opacityKnown||!e.opacityProof||!shapeKnown(e)))auditWarnings.push(e.id+': 불투명도 또는 칠 도형 증명 불명');
 }
 return {...frame,elements:visible,surfaces:elements.filter(e=>e.kind==='surface'),issues,auditWarnings,visibilityComplete:auditWarnings.length===0};
}
function run(dir){
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'coverage.json'),'utf8')),missing=[],observed=new Set();
 if(manifest.schemaVersion!==2||!/^[0-9a-f]{64}$/.test(manifest.runtimeSha256)||!manifest.device||manifest.deviceType==='Null')missing.push('계측 스키마/실제 Runtime SHA/GPU 영수증 누락');
 if(JSON.stringify(manifest.loadingImages)!==JSON.stringify(loadingImages))missing.push('승인16장 실제 로딩 목록 불일치');
 const languages=new Set(['ko','de',...manifest.languages]),languagePath=path.join(dir,'최장언어_실측.json');
 if(!fs.existsSync(languagePath))missing.push('최장 언어의 실제 서체 폭 측정 없음');
 else{const scores=JSON.parse(fs.readFileSync(languagePath,'utf8')).scores;for(const category of ['설정','직업선택']){const rows=scores.filter(s=>s.category===category).sort((a,b)=>b.measuredWidth-a.measuredWidth);if(rows.length<28)missing.push(category+' 언어 폭 표 누락');else languages.add(rows[0].code);}}
 const reportPath=path.join(dir,'overlap-report.json'),temporary=reportPath+'.tmp',rowsPath=path.join(dir,'overlap-rows.tmp'),fd=fs.openSync(temporary,'w'),rowFd=fs.openSync(rowsPath,'w');let frameCount=0,issueCount=0,result;
 try{
  fs.writeSync(fd,'{\n"frames":[\n');
  for(const name of manifest.frames){
   const f={...analyze(JSON.parse(fs.readFileSync(path.join(dir,name+'.json'),'utf8'))),captureName:name};
   if(frameCount)fs.writeSync(fd,',\n');fs.writeSync(fd,JSON.stringify(f));frameCount++;issueCount+=f.issues.length;
   if(f.repaintFrames>0&&f.elements.some(e=>e.kind==='text'))observed.add([f.width,f.height,f.language,f.page].join('/'));
   if(!alphaReaderValid(f))missing.push(f.width+'/'+f.language+'/'+f.page+': 실제 GPU 알파 대조군 미충족');
   if(!f.visibilityComplete)missing.push(f.width+'/'+f.language+'/'+f.page+': 가림 계측 미충족 ('+f.auditWarnings.join(', ')+')');
   const png=path.join(dir,name+'.png');if(!fs.existsSync(png))missing.push('PNG 누락 '+path.basename(png));else{const pngFd=fs.openSync(png,'r'),header=Buffer.alloc(24);try{fs.readSync(pngFd,header,0,24,0);}finally{fs.closeSync(pngFd);}if(header.readUInt32BE(16)!==f.width||header.readUInt32BE(20)!==f.height)missing.push('실제 PNG 해상도 불일치 '+path.basename(png));}
   for(const i of f.issues)fs.writeSync(rowFd,'|'+f.page+'|'+f.width+'×'+f.height+'|'+f.language+'|'+i.type+'|'+(i.a.text||'').replaceAll('|','/')+'|'+(i.b?.text||i.b?.kind||'')+'|'+(i.a.source||'')+'|\n');
  }
  for(const [width,height]of [[1920,1080],[2560,1080],[3840,1080],[1600,900],[2560,1600]])for(const lang of languages){for(const page of requiredPages)if(!observed.has([width,height,lang,page].join('/')))missing.push(width+'x'+height+'/'+lang+'/'+page);if(lang==='ko')for(const page of [...loadingImages.map(i=>'전환로딩'+String(i).padStart(2,'0')),'전환로딩폴백'])if(!observed.has([width,height,lang,page].join('/')))missing.push(width+'x'+height+'/'+lang+'/'+page);}
  result={passed:missing.length===0&&issueCount===0,frameCount,issueCount,missing};
  fs.writeSync(fd,'\n],\n'+Object.entries(result).map(([key,value])=>JSON.stringify(key)+':'+JSON.stringify(value)).join(',\n')+'\n}\n');fs.fsyncSync(fd);
 }finally{fs.closeSync(fd);fs.closeSync(rowFd);}
 fs.renameSync(temporary,reportPath);fs.writeFileSync(path.join(dir,'overlap-summary.json'),JSON.stringify(result,null,2));
 const md=path.join(dir,'겹침_검사.md'),mdFd=fs.openSync(md,'w');
 try{fs.writeSync(mdFd,'# 전 화면 겹침 검사\n\n판정: '+(result.passed?'PASS':'FAIL')+', '+frameCount+'장, 교차 후보 '+issueCount+'건, 누락 '+missing.length+'건.\n\n실제 Repaint의 깊이·그리기 순서·클립과 증명된 유효 불투명도 1인 영역만 가림으로 쓴다. 각 프레임의 전체 원소·가림·교차 근거를 보존하며 프레임 하나씩 분석/기록한다. 교차 후보는 PNG 1x 검수가 필요하다.\n\n|화면|해상도|언어|종류|글자|상대|그리기 위치|\n|---|---|---|---|---|---|---|\n');const input=fs.openSync(rowsPath,'r'),buffer=Buffer.alloc(1024*1024);try{let count;while((count=fs.readSync(input,buffer,0,buffer.length,null))>0)fs.writeSync(mdFd,buffer,0,count);}finally{fs.closeSync(input);}fs.writeSync(mdFd,'\n'+missing.join('\n')+'\n');}finally{fs.closeSync(mdFd);}
 fs.unlinkSync(rowsPath);console.log(JSON.stringify({passed:result.passed,frames:frameCount,issues:issueCount,missing}));return result.passed;
}

module.exports={analyze,run,alphaReaderValid,requiredPages,loadingImages};if(require.main===module)process.exitCode=run(process.argv[2])?0:2;
