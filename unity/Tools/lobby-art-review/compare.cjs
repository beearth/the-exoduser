// No browser/Player launch and no image-generation dependency. Real captures are mandatory inputs.
const fs=require('node:fs'),path=require('node:path');
const args={};for(let i=2;i<process.argv.length;i+=2)args[process.argv[i]]=process.argv[i+1];
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function capture(key,label){
 const file=args[key];if(!file||!fs.existsSync(file))throw Error(key+' requires a real PNG capture');
 const data=fs.readFileSync(file);
 if(data.length<24||data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('not a PNG: '+file);
 return {label,file:path.basename(file),width:data.readUInt32BE(16),height:data.readUInt32BE(20),url:'data:image/png;base64,'+data.toString('base64')};
}
try{
 const images=[capture('--reference','10-28 웹 로비'),capture('--web','웹 정본 로비'),capture('--regression','385e76ce1 퇴보 화면'),capture('--restored','복구 후보 실제 화면')];
 const width=images[3].width,height=images[3].height;
 if(![1920,3840].includes(width))throw Error('restored capture must be 1920 or 3840 wide');
 if(images.some(i=>i.height!==height))throw Error('all inputs must have the same physical height; do not rescale evidence');
 const scale=height/1080,rail=Math.round(560*scale);
 const full=images.map(i=>'<article><h2>'+esc(i.label)+'</h2><p>'+esc(i.file)+' — '+i.width+'×'+i.height+' / 원본 1x</p><div class="full" style="width:'+width+'px;height:'+height+'px"><img src="'+i.url+'" width="'+i.width+'" height="'+i.height+'"></div></article>').join('');
 const rail1x=images.map(i=>'<article><h2>'+esc(i.label)+' — 오른쪽 레일 1x</h2><div class="crop" style="width:'+rail+'px;height:'+height+'px"><img src="'+i.url+'" style="width:'+i.width+'px;height:'+i.height+'px;left:'+-(i.width-rail)+'px;top:0"></div></article>').join('');
 const detail=images.map(i=>'<article><h2>'+esc(i.label)+' — 오른쪽 레일 3x</h2><div class="crop" style="width:'+rail*3+'px;height:'+height*3+'px"><img src="'+i.url+'" style="width:'+i.width*3+'px;height:'+i.height*3+'px;left:'+-(i.width-rail)*3+'px;top:0"></div></article>').join('');
 const output=path.resolve(args['--output']||'./_out/lobby-art-review-current/lobby-'+width+'.html');fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,'<!doctype html><html lang="ko"><meta charset="utf-8"><title>로비 원화 복구 비교 '+width+'</title><style>body{background:#171719;color:#eee;font:16px sans-serif;margin:24px}main{display:flex;gap:24px;align-items:flex-start;margin:28px 0}article{flex:none}h2{font-size:20px}.full{background:#080809;overflow:hidden}.full img{display:block}.crop{overflow:hidden;position:relative;background:#080809}.crop img{position:absolute;image-rendering:pixelated}p{max-width:1200px}</style><h1>로비 원화 복구 비교 — '+width+'×'+height+'</h1><p>화면 4개를 원본 1x로 나란히 표시한다. 작은 과거 캡처는 확대하지 않고 빈 공간을 남긴다. 아래 레일만 3x 최근접 확대한다. 누락 화면을 소스나 임의 합성으로 대체하지 않는다. 합격선: 디자인된 요소가 하나도 사라지지 않음.</p><main>'+full+'</main><h1>같은 크기 레일 1x</h1><main>'+rail1x+'</main><h1>원화·슬롯·레일 3x</h1><main>'+detail+'</main></html>');
 console.log(output);
}catch(e){console.error(e.message);process.exitCode=2;}
