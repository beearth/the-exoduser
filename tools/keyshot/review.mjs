import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {scoreFrame,pixelDifference,sameComposition,selectViews} from './score.mjs';
const require=createRequire(import.meta.url);
let sharp;
try { sharp=require('sharp'); } catch { sharp=createRequire(path.resolve(process.env.EXO_NODE_MODULES||'G:/exoduser/node_modules','../package.json'))('sharp'); }
const [mode,root,other,planPath]=process.argv.slice(2);
if(!['score','compare'].includes(mode)||!root)throw new Error('사용법: review.mjs score <촬영폴더> [시점json] | compare <1회폴더> <2회폴더>');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const raw=async p=>sharp(p).removeAlpha().raw().toBuffer({resolveWithObject:true});
const receipt=read(path.join(root,'keyshot.json'));
if(!receipt.passed||!receipt.frames.length)throw new Error('촬영 실패 또는 프레임 없음');
if(mode==='score') {
  const rows=[];
  for(const frame of receipt.frames.filter(f=>f.width===1920&&f.height===1080&&f.hud)) {
    const on=await raw(path.join(root,frame.file));
    const offFrame=receipt.frames.find(f=>f.id===frame.id&&f.width===frame.width&&f.height===frame.height&&!f.hud);
    if(!offFrame)throw new Error(frame.id+' HUD 비교본 없음');
    const off=await raw(path.join(root,offFrame.file));
    let total=0,border=0,borderDark=0,covered=0,enemyPixels=0;
    for(let y=0;y<frame.height;y++)for(let x=0;x<frame.width;x++){
      const i=(y*frame.width+x)*3,l=.2126*off.data[i]+.7152*off.data[i+1]+.0722*off.data[i+2];total+=l;
      if(x<8||x>=frame.width-8){border++;if(l<2)borderDark++;}
      if(frame.enemies.some(e=>e.visible&&x>=e.x&&x<e.x+e.w&&y>=e.y&&y<e.y+e.h)){
        enemyPixels++;if(Math.max(...[0,1,2].map(k=>Math.abs(on.data[i+k]-off.data[i+k])))>18)covered++;
      }
    }
    rows.push({...frame,...scoreFrame(frame,{luminance:total/(frame.width*frame.height),blackBorder:borderDark/border>.98,hudOverlap:enemyPixels?covered/enemyPixels:0})});
  }
  const top=selectViews(rows,4);
  fs.writeFileSync(path.join(root,'scores.json'),JSON.stringify({scope:'자동 선별. 시각 PASS 아님',rows,top},null,2));
  fs.writeFileSync(path.join(root,'scores.csv'),'scene,id,score,upperEnemies,layers,heroOccluded,hudOverlap,luminance\n'+rows.map(r=>[r.scene,r.id,r.score,r.upperEnemies,r.layers,r.heroOccluded,r.hudOverlap,r.luminance].join(',')).join('\n'));
  const tiles=[];for(const r of rows){
    const label=Buffer.from(`<svg width="480" height="32"><rect width="480" height="32" fill="#151515"/><text x="10" y="22" fill="white" font-size="17">${r.id} | ${r.score} | top ${r.upperEnemies} | layers ${r.layers}</text></svg>`);
    tiles.push(await sharp(path.join(root,r.file)).resize(480,270).extend({bottom:32,background:'#151515'}).composite([{input:label,top:270,left:0}]).toBuffer());
  }
  const cols=4,height=Math.ceil(tiles.length/cols)*302;
  await sharp({create:{width:cols*480,height,channels:3,background:'#151515'}}).composite(tiles.map((input,i)=>({input,left:i%cols*480,top:Math.floor(i/cols)*302}))).jpeg({quality:90}).toFile(path.join(root,'contact-sheet.jpg'));
  const source=other||planPath;
  if(source){const plan=read(source);plan.status='자동 선별됨, 시각 판정 대기';for(const view of plan.views){const r=rows.find(r=>r.id===view.id);view.selected=top.some(t=>t.id===view.id);if(r){view.captureTick=r.tick;view.actualPlayer=r.player;view.score=r.score;}}fs.writeFileSync(source,JSON.stringify(plan,null,2)+'\n');}
  console.log(JSON.stringify(top.map(r=>({id:r.id,score:r.score,file:r.file}))));
} else {
  const repeat=read(path.join(other,'keyshot.json'));
  const comparisons=[];
  for(const b of repeat.frames){
    const a=receipt.frames.find(f=>f.file===b.file);if(!a)throw new Error('원본 프레임 없음: '+b.file);
    const x=await raw(path.join(root,a.file)),y=await raw(path.join(other,b.file));
    comparisons.push({file:b.file,metadataEqual:sameComposition(a,b),...pixelDifference(x.data,y.data)});
  }
  const selected=new Set(repeat.frames.map(f=>f.id));
  const expected=receipt.frames.filter(f=>selected.has(f.id));
  const passed=repeat.passed&&selected.size>=9&&comparisons.length===expected.length&&comparisons.every(c=>c.metadataEqual&&c.ratio===0);
  const result={passed,scope:'동일 픽셀만 재현 PASS. 상태 일치와 픽셀 차를 별도 기록',expected:expected.length,actual:comparisons.length,comparisons};
  fs.writeFileSync(path.join(other,'pixel-difference.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({passed,expected:expected.length,actual:comparisons.length,maxMean:Math.max(0,...comparisons.map(c=>c.mean))}));
  if(!passed)process.exitCode=2;
}
