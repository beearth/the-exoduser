const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path'),{filter}=require('./known-filter.cjs');
const issue=(sa,ta,sb,tb)=>({type:'글자-글자',a:{source:sa,text:ta},b:{source:sb,text:tb}});
function report(frames){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'known-'));const p=path.join(dir,'overlap-report.json');
 fs.writeFileSync(p,'{\n"frames":[\n'+frames.map(f=>JSON.stringify({schemaVersion:2,...f})).join(',\n')+'\n]}\n');return {dir,p};}
function known(dir,entries){const p=path.join(dir,'known.json');fs.writeFileSync(p,JSON.stringify({entries}));return p;}
const hud={files:['NativeHud.cs','NativeHud.cs'],texts:['A','B'],page:'HUD',language:'ko',lines:['NativeHud.cs:70']};
test('목록에 있는 기존 겹침만 있으면 통과',async()=>{const r=report([{page:'HUD',language:'ko',width:1920,height:1080,issues:[issue('NativeHud.cs:70','A','NativeHud.cs:71','B')]}]);
 const out=await filter(r.p,known(r.dir,[hud]));assert.equal(out.passed,true);assert.equal(out.knownIssues,1);assert.equal(out.unknownIssues,0);});
test('줄 번호만 밀린 같은 겹침은 계속 기존으로 본다',async()=>{const r=report([{page:'HUD',language:'ko',width:1920,height:1080,issues:[issue('NativeHud.cs:90','B','NativeHud.cs:88','A')]}]);
 assert.equal((await filter(r.p,known(r.dir,[hud]))).passed,true);});
test('목록에 없는 새 겹침은 하나라도 실패',async()=>{const r=report([{page:'HUD',language:'ko',width:1920,height:1080,issues:[issue('NativeHud.cs:70','A','NativeHud.cs:71','B'),issue('NativeInventoryOssuary.cs:59','0','NativeInventoryWebLayout.cs:104','/')]}]);
 const out=await filter(r.p,known(r.dir,[hud]));assert.equal(out.passed,false);assert.equal(out.unknownIssues,1);assert.equal(out.unknown[0].page,'HUD');});
test('같은 출처라도 다른 언어·화면·문자열은 따로 본다',async()=>{const r=report([{page:'HUD',language:'de',width:1920,height:1080,issues:[issue('NativeHud.cs:70','A','NativeHud.cs:71','B')]},{page:'설정',language:'ko',width:1920,height:1080,issues:[issue('NativeHud.cs:70','A','NativeHud.cs:71','B')]},{page:'HUD',language:'ko',width:1920,height:1080,issues:[issue('NativeHud.cs:70','A','NativeHud.cs:71','C')]}]);
 assert.equal((await filter(r.p,known(r.dir,[hud]))).unknownIssues,3);});
test('프레임이 없으면 통과가 아님',async()=>{const r=report([]);assert.equal((await filter(r.p,known(r.dir,[hud]))).passed,false);});
