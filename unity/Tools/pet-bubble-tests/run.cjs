// One focused suite: execute production pure-C# policy, source/catalogue and adopted-art contracts.
// Does not run the old importer suite, Unity, a Player, a build, or touch saves.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'../..'),runtime=path.join(project,'Assets/Exoduser/Runtime');
const output='I:/EXODUSER-Storage/codex-takeover/death-screen/pet-bubble-current';
const unity='G:/unity/Editor/6000.6.7f1/Editor/Data',dotnet=unity+'/NetCoreRuntime/dotnet.exe';
let checks=0;
function check(ok,name){checks++;assert(ok,name);}
function run(args){const p=cp.spawnSync(dotnet,args,{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});if(p.status!==0)throw Error((p.stdout||'')+(p.stderr||'')+(p.error||''));return p.stdout;}
fs.mkdirSync(output,{recursive:true});
try{
 const actual=JSON.parse(fs.readFileSync(project+'/Assets/Exoduser/Resources/Data/pet_bubble.json','utf8')),gold=require('./export.cjs');
 check(actual.codes.length===29&&new Set(actual.codes).size===29,'29 distinct locales');
 assert.deepEqual(actual.entries,gold.entries);checks++;
 assert.deepEqual(actual.cues,gold.cues);checks++;
 check(actual.entries.length===13&&actual.cues.length===9,'first pass scope (13 keys: No.0924 unused in Unity)');
 const warn=actual.cues.find(c=>c.id==='warn_hp50');
 check(warn&&warn.who==='crow'&&warn.key==='…절반이다. 정신차려.'&&warn.pairWho===''&&warn.pairKey===''&&warn.pairSeconds===0,'P3 warn_hp50 crow only, empty pair');
 check(!actual.entries.some(e=>e.key.includes('물약 마실 타이밍')),'P3 No.0924 text not in Unity catalogue');
 for(const entry of actual.entries)check(entry.texts.length===29&&entry.texts.every(t=>typeof t==='string'&&t.length>0),'complete '+entry.key);
 for(const cue of actual.cues)check(actual.entries.some(e=>e.key===cue.key)&&(!cue.pairKey||actual.entries.some(e=>e.key===cue.pairKey)),'cue references '+cue.id);
 for(const [who,source] of [['crow','crow'],['cat','cat_pet']]){
  const png=fs.readFileSync(project+'/Assets/Exoduser/Resources/Art/PetBubble/'+who+'.png');
  check(png.equals(fs.readFileSync('G:/exoduser-wt/latest-web/img/'+source+'/portrait.png')),'original painted PNG '+who);
  check(png.readUInt32BE(16)===1536&&png.readUInt32BE(20)===1024,'portrait geometry '+who);
  const meta=fs.readFileSync(project+'/Assets/Exoduser/Resources/Art/PetBubble/'+who+'.png.meta','utf8');
  check(/enableMipMap: 0/.test(meta)&&/filterMode: 1/.test(meta),'new portrait meta '+who);
 }
 const adapter=fs.readFileSync(runtime+'/NativeGame.PetBubble.cs','utf8'),game=fs.readFileSync(runtime+'/NativeGame.cs','utf8'),view=fs.readFileSync(runtime+'/NativePetBubbleView.cs','utf8'),capture=fs.readFileSync(runtime+'/NativeGame.PetBubbleCapture.cs','utf8');
 check(game.includes('UpdatePetBubble();')&&game.includes('DrawPetBubble();')&&game.includes('StartCoroutine(PetBubbleCaptureRun())'),'minimal live and fixture hooks');
 for(const guard of ['lobby.IsBlocking','menu','inventory.Open','skills.Open','stats.Open','forge.Open','stageClear.Active','LoadPhase>0','DeathPresentationActive','PlayerDown'])check(adapter.includes(guard),'live visibility '+guard);
 check(adapter.includes('Simulation.TickCount-petBubbleTick')&&adapter.includes('petBubbleSimulation!=Simulation')&&adapter.includes('petBubbleArena!=flow.InArena'),'tick/run/arena lifetime');
 check(adapter.includes('EnvironmentReady(petBubbleFieldSeconds,flow.InArena)')&&adapter.includes('petBubbleStage==0&&!flow.InArena')&&!adapter.includes('petBubbleObservedDefeat')&&!adapter.includes('petBubbleStageSeconds'),'P2 environment: stage-0 field time, not in arena');
 const body=name=>{const at=adapter.indexOf('void '+name+'()'),open=adapter.indexOf('{',at),close=adapter.indexOf('\n  }',open);return at<0?'':adapter.slice(open,close);};
 const enc=body('ResetPetBubbleEncounter'),runReset=body('ResetPetBubbleRun');
 check(enc&&!/Seen|FieldSeconds/.test(enc)&&enc.includes('petBubble.Reset()'),'P1 encounter reset keeps run-level seen flags');
 check(runReset&&runReset.includes('petBubbleBossSeen=petBubbleEnvSeen=false')&&runReset.includes('petBubbleFieldSeconds=0'),'P1 run reset clears seen flags');
 check((adapter.match(/petBubbleBossSeen=false|petBubbleEnvSeen=false|petBubbleBossSeen=petBubbleEnvSeen=false/g)||[]).length===1,'P1 seen flags cleared in exactly one place');
 check(adapter.includes('petBubbleRun!=Simulation')&&adapter.includes('firstPractice==null&&petBubbleRun!=Simulation'),'P1 new Simulation is the only run boundary');
 check(adapter.includes('petBubbleStage>=0&&petBubbleStage<=3')&&adapter.includes('NativePetBubblePolicy.BossReady(flow.InArena'),'P1 chapter-0 arena boss only');
 check(!adapter.includes('ch11.line.'),'GB1 automatic triggers held');
 check(adapter.includes('ratio<.1')&&adapter.includes('ratio<.3')&&adapter.includes('ratio<.5'),'HP trigger thresholds');
 check(view.includes('new Rect(92,237,306,51)')&&view.includes('new Rect(122,250,190,42)')&&view.includes('scale=1.5f'),'web text apertures/scale');
 check(view.includes('NativeUiViewport.EdgeMatrix')&&view.includes('firstPractice')===false&&view.includes('isCrow||guideOpen'),'edge docking and guide side');
 check(view.includes('NativeDemoText.Label')&&view.includes('BindingLabel(action,locale)'),'serif RTL and live binding lookup');
 check(capture.includes('nativeSettingsStore!=null')&&capture.includes('combatStore!=null')&&capture.includes('CharacterStoreDirectory')&&capture.includes('Path.IsPathRooted(Argument("--unity-qa-sandbox"))'),'fixture storage isolation');
 check(capture.includes('not natural field/boss/HP events')&&capture.includes('urgentInterrupted')&&capture.includes('languageRefreshed'),'fixture receipt scope');
 const pack=unity+'/DotNetSdk/packs/Microsoft.NETCore.App.Ref/8.0.21/ref/net8.0';
 const dll=output+'/PetBubbleTests.dll';
 run([unity+'/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll','-nologo','-noconfig','-nostdlib+','-target:exe','-out:'+dll,...fs.readdirSync(pack).filter(f=>f.endsWith('.dll')).map(f=>'-r:'+pack+'/'+f),runtime+'/NativePetBubbleQueue.cs',runtime+'/NativePetBubblePolicy.cs',path.join(__dirname,'Program.cs')]);
 fs.writeFileSync(output+'/PetBubbleTests.runtimeconfig.json',JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.21'}}}));
 const policy=run([dll]);console.log(policy.trim());
 fs.writeFileSync(output+'/tests.json',JSON.stringify({passed:true,dataSourceChecks:checks,policy:policy.trim(),scope:'production pure C# execution and source/data contracts; no Unity/Player/visual verification'},null,2));
 console.log(JSON.stringify({passed:true,dataSourceChecks:checks}));
}catch(e){fs.writeFileSync(output+'/tests.json',JSON.stringify({passed:false,checks,error:String(e.stack)},null,2));console.error(e.stack);process.exitCode=1;}
