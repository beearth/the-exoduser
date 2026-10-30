// TDD RED/GREEN과 고정 baseline의 실제 Core 전체를 동일 프로그램으로 컴파일·비교한다. Unity 실행 없음.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../../..'),core='unity/Assets/Exoduser/Runtime/Core',baseline=process.argv[3]||'018ce33f20987648f661a6ca26d54b18ba05ca5d';
const out=path.resolve(process.argv[2]||'I:/EXODUSER-Storage/demo-art/boss-druid/crit-signal-tests');
if(!/^I:[\\/]/i.test(out))throw Error('검사 출력은 I:만 허용');fs.mkdirSync(out,{recursive:true});
const options={cwd:repo,windowsHide:true,encoding:'utf8',timeout:120000,maxBuffer:64*1024*1024};
const dotnet='C:/Program Files/dotnet/dotnet.exe',pack='C:/Program Files/dotnet/packs/Microsoft.NETCore.App.Ref';
const ver=fs.readdirSync(pack).filter(n=>n.startsWith('8.')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1),ref=path.join(pack,ver,'ref/net8.0');
const refs=fs.readdirSync(ref).filter(n=>n.endsWith('.dll')).map(n=>'-r:'+JSON.stringify(path.join(ref,n)));
const files=cp.execFileSync('git',['ls-tree','-r','--name-only',baseline,'--',core],options).trim().split(/\r?\n/).filter(n=>n.endsWith('.cs'));
const baselineDir=path.join(out,'기준Core');fs.mkdirSync(baselineDir,{recursive:true});
for(const f of files)fs.writeFileSync(path.join(baselineDir,path.basename(f)),cp.execFileSync('git',['show',baseline+':'+f],{...options,encoding:null}));
function buildRun(label,sources){
 const dir=path.join(out,label);fs.mkdirSync(dir,{recursive:true});const dll=path.join(dir,'DamageSignalChecks.dll'),rsp=path.join(dir,'검사.rsp');
 fs.writeFileSync(rsp,['-nologo','-utf8output','-target:exe','-langversion:latest','-out:'+JSON.stringify(dll),...refs,...sources.map(n=>JSON.stringify(n)),JSON.stringify(path.join(__dirname,'DamageSignalChecks.cs'))].join('\n'));
 let r=cp.spawnSync(dotnet,['C:/Program Files/dotnet/sdk/8.0.301/Roslyn/bincore/csc.dll','@'+rsp],options);
 fs.writeFileSync(path.join(dir,'컴파일.log'),(r.stdout||'')+(r.stderr||''));if(r.status!==0)throw Error(label+' 컴파일 실패\n'+r.stdout+r.stderr);
 fs.writeFileSync(path.join(dir,'DamageSignalChecks.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.0'}}}));
 r=cp.spawnSync(dotnet,[dll,path.join(dir,'검사.json')],options);fs.writeFileSync(path.join(dir,'실행.log'),(r.stdout||'')+(r.stderr||''));
 if(!fs.existsSync(path.join(dir,'검사.json')))throw Error(label+' 실행예외\n'+r.stdout+r.stderr);
 const data=JSON.parse(fs.readFileSync(path.join(dir,'검사.json'),'utf8'));console.log(label+': '+data.검사수+'검사 / '+data.실패수+'실패');return{data,status:r.status};
}
const base=buildRun('기준RED',files.map(f=>path.join(baselineDir,path.basename(f))));
const candidate=buildRun('현재',files.map(f=>path.join(repo,f)));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),comparisons=[];
for(let i=0;i<base.data.사례.length;i++){
 const a=base.data.사례[i],b=candidate.data.사례[i];
 for(let j=0;j<a.프레임.length;j++){
  const x=a.프레임[j],y=b.프레임[j];
  // 허용된 추가신호만 분리한다. 나머지 모든 피드백은 필드·순서까지 일치해야 한다.
  const filtered=y.피드백.filter(f=>f.Kind!==4); // FeedbackKind.EnemyCrit=4, enum 자체도 고정 baseline과 동일 소스
  comparisons.push({사례:a.이름,호출:j,전상태동일:x.전상태===y.전상태,후상태동일:x.후상태===y.후상태,
   전상태SHA:sha(x.전상태),후상태SHA:sha(x.후상태),수정후상태SHA:sha(y.후상태),난수호출과값동일:JSON.stringify(x.전체난수)===JSON.stringify(y.전체난수),
   기타피드백동일:JSON.stringify(x.피드백)===JSON.stringify(filtered),이전틱피드백동일:JSON.stringify(x.이전틱피드백)===JSON.stringify(y.이전틱피드백),추가관찰수:y.피드백.length-filtered.length});
 }
}
const equal=comparisons.every(r=>r.전상태동일&&r.후상태동일&&r.난수호출과값동일&&r.기타피드백동일&&r.이전틱피드백동일);
fs.writeFileSync(path.join(out,'동등성.json'),JSON.stringify({기준SHA:baseline,기준RED:{검사수:base.data.검사수,실패수:base.data.실패수},현재:{검사수:candidate.data.검사수,실패수:candidate.data.실패수},동등성통과:equal,비교:comparisons},null,2));
console.log('상태/RNG/기타피드백 '+comparisons.length+'프레임 '+(equal?'동일':'불일치'));
process.exitCode=candidate.status===0&&equal?0:2;
