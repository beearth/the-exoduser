const toolpaths=require('../_shared/toolpaths.cjs');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),out='I:/EXODUSER-Storage/codex-takeover/parry-g2/baseline-current';
fs.mkdirSync(out,{recursive:true});
const base='b3cf7a682bd753d81952157ba2d5b7cd55392db4';
const sdk=path.dirname(toolpaths.csc('8.0.301')),refs=toolpaths.refPack('8.0.6','net8.0'),dotnet=toolpaths.dotnet();
const run=(exe,args,timeout=180000)=>toolpaths.spawnSync(exe,args,{cwd:root,windowsHide:true,encoding:'utf8',timeout,maxBuffer:8000000});
const git=args=>{let r=run('C:/Program Files/Git/cmd/git.exe',args);if(r.status!==0)throw Error(r.stderr);return r.stdout.trim();};
const fixture='unity/Tools/enemy-hurt-oracle/oracle.json',harness='unity/Tools/enemy-hurt-oracle/Program.cs';
const pinnedFixture=git(['rev-parse',base+':'+fixture]);
if(pinnedFixture!==git(['rev-parse','f6ff63e333d6b6a15aeac28ef3b824eb22f3b223:'+fixture]))throw Error('Different oracle fixture');
const host=path.join(out,'BaselineCompile.dll'),baselineDll=path.join(out,'BaselineEnemyHurtTests.dll');
const runtime={runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.0'},rollForward:'LatestPatch'}};
const compilerArgs=['-nologo','-target:exe','-langversion:latest','-out:'+host,...fs.readdirSync(refs).filter(x=>x.endsWith('.dll')).map(x=>'-r:'+path.join(refs,x)),'-r:'+path.join(sdk,'Microsoft.CodeAnalysis.dll'),'-r:'+path.join(sdk,'Microsoft.CodeAnalysis.CSharp.dll'),path.join(__dirname,'BaselineCompile.cs')];
const rsp=path.join(out,'host.rsp');fs.writeFileSync(rsp,compilerArgs.map(x=>JSON.stringify(x)).join('\n'));
let log='';let r=run(dotnet,[path.join(sdk,'csc.dll'),'@'+rsp]);log+=(r.stdout||'')+(r.stderr||'');
if(r.status!==0){fs.writeFileSync(path.join(out,'baseline.log'),log);process.stdout.write(log);process.exit(r.status??1);}
fs.writeFileSync(path.join(out,'BaselineCompile.runtimeconfig.json'),JSON.stringify(runtime));
r=run(dotnet,[host,root,base,baselineDll,refs,sdk]);log+=(r.stdout||'')+(r.stderr||'');
if(r.status!==0){fs.writeFileSync(path.join(out,'baseline.log'),log);process.stdout.write(log);process.exit(r.status??1);}
fs.writeFileSync(path.join(out,'BaselineEnemyHurtTests.runtimeconfig.json'),JSON.stringify(runtime));
// The requested baseline oracle is executed exactly once. Exit 2 is the oracle's measured mismatch result.
r=run(dotnet,[baselineDll,path.join(out,'oracle-result.json'),path.join(root,fixture)]);log+=(r.stdout||'')+(r.stderr||'');
fs.writeFileSync(path.join(out,'baseline.log'),log);
fs.writeFileSync(path.join(out,'provenance.json'),JSON.stringify({base,implementation:'f6ff63e333d6b6a15aeac28ef3b824eb22f3b223',oracleBlob:pinnedFixture,harnessBeforeDiagnostics:'90b729ada3b31584ea06ab0db8d394de725c601f',harnessDiagnosticsBlob:git(['hash-object','--',harness]),sourceMode:'git archive stream -> Roslyn syntax trees in memory; no checkout/copy/extraction',oracleExit:r.status},null,2));
process.stdout.write(log);process.exitCode=r.status===0||r.status===2?0:1;
