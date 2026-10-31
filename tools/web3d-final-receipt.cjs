const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),out='G:/exoduser/tmp/design-review/20261031_web3d_main',store='I:/EXODUSER-Storage/web3d-main-20261031';
const git=(...args)=>cp.execFileSync('C:/Program Files/Git/cmd/git.exe',args,{cwd:root,windowsHide:true,maxBuffer:64e6});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const qa=JSON.parse(await fs.readFile(out+'/qa-receipt.json')),fallback=JSON.parse(await fs.readFile(out+'/fallback-receipt.json'));
 const head=git('rev-parse','HEAD').toString().trim(),branch=git('branch','--show-current').toString().trim();
 if(branch!=='codex/web3d-trial-20261031')throw Error('브랜치 변경 감지');
 if(JSON.stringify(qa.source)!==JSON.stringify(fallback.source))throw Error('최종 QA/폴백 소스 불일치');
 const source=[];
 for(const [file,expected]of Object.entries(qa.source)){
  const local=await fs.readFile(path.join(root,file)),committed=git('show',head+':'+file);
  const response=await fetch('http://127.0.0.1:3377/'+file+'?verification='+head),http=Buffer.from(await response.arrayBuffer());
  if(sha(local)!==expected||!local.equals(committed)||!local.equals(http)||response.status!==200)throw Error('디스크/커밋/서버/QA 불일치 '+file);
  source.push({file,sha256:expected,bytes:local.length,http:response.status,committed:true});
 }
 const intake=JSON.parse(await fs.readFile(root+'/assets/web3d/sprites/intake.json'));let assetBytes=0;
 for(const record of intake.files){const bytes=await fs.readFile(path.join(root,record.path));if(sha(bytes)!==record.sha256)throw Error('스프라이트 인수 byte 불일치 '+record.path);assetBytes+=bytes.length;}
 const remote=Object.fromEntries(git('ls-remote','origin','refs/heads/main','refs/heads/'+branch).toString().trim().split(/\r?\n/).map(s=>s.split(/\s+/).reverse()));
 const mainIntegrated=remote['refs/heads/main']===head;
 if(!process.argv.includes('--pending')&&!mainIntegrated)throw Error('원격 main HEAD 불일치');
 const tests=await fs.readFile(store+'/tests-final.txt'),guard=await fs.readFile(store+'/guard-final.txt');
 if(!tests.toString().includes('pass 88')||!tests.toString().includes('fail 0')||!guard.toString().includes('결과: PASS'))throw Error('검수 로그 실패');
 const files=[];
 for(const file of ['REPORT.md','index.html','qa-receipt.json','fallback-receipt.json','comparison-contract.json','artifact-manifest.json','video-verification.json','web3d-main-10s.webm','comparison-exploration-1920.png','comparison-combat-1920.png','crop-1x-bridge.png','crop-1x-water.png','crop-1x-forest.png']){
  const data=await fs.readFile(out+'/'+file);files.push({file,bytes:data.length,sha256:sha(data)});
 }
 const receipt={time:new Date().toISOString(),head,branch,runtimeCommit:git('log','-1','--format=%H','--','game.html','web3d','assets/web3d').toString().trim(),remote,mainIntegrated,
  trackedWork:git('diff','--name-only').toString().trim(),trackedIndex:git('diff','--cached','--name-only').toString().trim(),
  server:{url:'http://127.0.0.1:3377',sourceVerified:true,saveDirectory:store+'/saves',review:'http://127.0.0.1:3377/tmp/web3d-main-review/index.html'},
  default3D:false,paidGeneration:0,source,spriteIntake:{files:intake.files.length,bytes:assetBytes,hashesVerified:true},
  tests:{pass:88,fail:0,sha256:sha(tests)},guard:{pass:true,sha256:sha(guard)},files};
 await fs.writeFile(out+'/final-delivery.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({head,mainIntegrated,verifiedSourceFiles:source.length,spriteFiles:intake.files.length,files:files.length}));
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
