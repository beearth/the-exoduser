const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'../..'),runtime=path.join(root,'Assets/Exoduser/Runtime');
const argv=process.argv.slice(2),options={};let positional;
for(let i=0;i<argv.length;i++){if(argv[i].startsWith('--'))options[argv[i]]=argv[++i];else positional=argv[i];}
const output=path.resolve(options['--output']||positional||path.join(__dirname,'../../../_out/death-ui-tests-current'));
fs.mkdirSync(output,{recursive:true});
const read=name=>fs.readFileSync(path.join(runtime,name),'utf8');
let failures=0;const results=[];
function check(ok,name){const line=(ok?'PASS ':'FAIL ')+name;results.push(line);console.log(line);if(!ok)failures++;}
const game=read('NativeGame.cs'),registry=game.slice(game.indexOf('bool legacyFixture='),game.indexOf('InitializeEntryFlowCapture(args)'));
for(const flag of ['--unity-death-screen-smoke','--unity-death-ui-smoke'])check(registry.includes('"'+flag+'"'),flag+' bypasses lobby.Begin');
const silver=read('NativeLobby.SilverHell.cs');
check(!read('NativeGame.DeathScreenCapture.cs').includes('colorProbe')&&!fs.existsSync(path.join(runtime,'NativeGame.DeathColorProbe.cs')),'retired colour probe and shader dependency removed');
const lobby=read('NativeLobby.SilverLobby.cs'),visual=read('NativeLobby.SilverCharacter.cs'),name=read('NativeLobby.CharacterPresentation.cs');
check(lobby.includes('new Rect(1428,702,416,156)')&&lobby.includes('canEnter?lobbySilverEnter:lobbySilverDisabled')&&!lobby.includes('ActionPlate('),'ENTER art/rect and slot cards restored; no procedural plate');
check(visual.includes('ArtImage(cancel,silverVisualCancel)')&&visual.includes('locked?silverVisualDisabled:silverVisualCreate')
 &&name.includes('ArtImage(cancel,silverNameCancel)')&&name.includes('ArtImage(create,silverNameCreate)'),'visual and name button artwork drawn');
check(lobby.includes('FrameOnly(new Rect(1368,8,544,1064))'),'decorated right rail frame restored');
let imported=true;
for(const asset of ['btn_primary_composed','btn_plaque_20261029','guide_button_glow','lobby_enter_btn_silver_20261029','lobby_enter_disabled','visual_create','visual_cancel','visual_disabled','name_create','name_cancel','panel_frame_20261029']){
 const meta=fs.readFileSync(path.join(root,'Assets/Exoduser/Resources/Art/ui/silver_hell',asset+'.png.meta'),'utf8');
 imported&&=/enableMipMap: 0/.test(meta)&&!/filterMode: 2/.test(meta);
}
check(imported,'all restored artwork: mipmaps OFF, no trilinear filtering');const vm=require('node:vm');
function macLayoutProbe(){
 const base='/Applications/Unity/Hub/Editor/Test/Unity.app/Contents',scripting=base+'/Resources/Scripting';
 const directories=new Map([
  [scripting+'/DotNetSdk/sdk',['8.0.318']],
  [scripting+'/DotNetSdk/packs/Microsoft.NETCore.App.Ref',['8.0.21']],
  [scripting+'/DotNetSdk/packs/Microsoft.NETCore.App.Ref/8.0.21/ref',['net8.0']]
 ]);
 const files=new Set([scripting+'/NetCoreRuntime/dotnet',scripting+'/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll']);
 const fake={existsSync:p=>directories.has(p)||files.has(p),readdirSync:p=>(directories.get(p)||[]).map(name=>({name,isDirectory:()=>true}))};
 try{
  const source=dirs.toString()+'\n'+first.toString()+'\n'+toolchain.toString()+'\ntoolchain()';
  const tc=vm.runInNewContext(source,{fs:fake,path:path.posix,options:{'--unity-data':base},process:{platform:'darwin',env:{}},cp:{spawnSync:()=>({stdout:''})}});
  return tc.dotnet===scripting+'/NetCoreRuntime/dotnet'&&tc.csc===scripting+'/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll';
 }catch{return false;}
}
check(macLayoutProbe(),'Mac Contents/Resources/Scripting SDK/runtime layout');
const audit=read('NativeUiAudit.cs');
check(audit.includes('NativeUiChrome.ClearBackgrounds(style,'),'native draw boundary removes all skin backgrounds');
function method(source,name){const start=source.indexOf(name);if(start<0)throw Error('missing '+name);let at=source.indexOf('{',start),depth=1,end=at+1;for(;depth&&end<source.length;end++){if(source[end]==='{')depth++;if(source[end]==='}')depth--;}return source.slice(start,end);}
function dirs(p){return fs.existsSync(p)?fs.readdirSync(p,{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>path.join(p,x.name)).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true})):[];}
function first(candidates){return candidates.find(p=>p&&fs.existsSync(p));}
function toolchain(){
 const exe=process.platform==='win32'?'dotnet.exe':'dotnet';
 const hub=process.platform==='darwin'?'/Applications/Unity/Hub/Editor':null;
 const roots=[options['--unity-data'],process.env.UNITY_EDITOR_DATA,...(hub?dirs(hub).map(p=>path.join(p,'Unity.app/Contents')):[]),...(process.platform==='win32'?['G:/unity/Editor/6000.6.7f1/Editor/Data']:[])].filter(Boolean);
 const candidates=roots.flatMap(data=>[data,path.join(data,"Resources/Scripting")]);
 for(const data of candidates){
  const sdk=dirs(path.join(data,'DotNetSdk/sdk'))[0],ref=dirs(path.join(data,'DotNetSdk/packs/Microsoft.NETCore.App.Ref'))[0];
  const refs=ref&&dirs(path.join(ref,'ref'))[0],dotnet=first([options['--dotnet'],path.join(data,'NetCoreRuntime',exe),path.join(data,'DotNetSdk',exe)]);
  const csc=first([options['--csc'],sdk&&path.join(sdk,'Roslyn/bincore/csc.dll')]);
  if(dotnet&&csc&&(options['--refs']||refs))return {dotnet,csc,refs:options['--refs']||refs};
 }
 if(options['--dotnet']&&options['--csc']&&options['--refs'])return {dotnet:options['--dotnet'],csc:options['--csc'],refs:options['--refs']};
 // A system .NET SDK is also supported, including Apple Silicon installations.
 const dotnet=first([options['--dotnet'],...(process.env.PATH||'').split(path.delimiter).map(p=>path.join(p,exe)),'/usr/local/share/dotnet/dotnet','/opt/homebrew/bin/dotnet']);
 if(dotnet){
  const sdk=cp.spawnSync(dotnet,['--list-sdks'],{windowsHide:true,encoding:'utf8'});
  const lines=(sdk.stdout||'').trim().split(/\r?\n/).reverse();
  for(const line of lines){const m=/^(\S+) \[(.+)\]/.exec(line);if(!m)continue;const home=path.dirname(m[2]),ref=dirs(path.join(home,'packs/Microsoft.NETCore.App.Ref'))[0];
   if(ref)return {dotnet,csc:path.join(m[2],m[1],'Roslyn/bincore/csc.dll'),refs:dirs(path.join(ref,'ref'))[0]};}
 }
 throw Error('No .NET toolchain: use --unity-data <Unity.app/Contents or Editor/Data>, or --dotnet <exe> --csc <dll> --refs <ref directory>');
}
try{
 const tc=toolchain(),version=path.basename(path.dirname(path.dirname(tc.refs))),tfm=path.basename(tc.refs);
 const source=read('NativeUiChrome.cs');
 const body=method(source,'static void ClearState(')+'\n'+method(source,'internal static GUIStyle ClearBackgrounds(')+'\n'+method(silver,'internal static float ArtSelection(')+'\n'+method(silver,'internal static void ThornPlate(')+'\n'+method(silver,'internal static void ActionPlate(');
 const test=fs.readFileSync(path.join(__dirname,'MaterialProbe.cs'),'utf8').replace('/*PRODUCTION*/',body);
 fs.writeFileSync(output+'/Probe.cs',test);
 fs.writeFileSync(output+'/probe.runtimeconfig.json',JSON.stringify({runtimeOptions:{tfm,framework:{name:'Microsoft.NETCore.App',version}}}));
 fs.writeFileSync(output+'/probe.rsp',['-nologo','-nostdlib+','-target:exe','-out:"'+output+'/probe.dll"',...fs.readdirSync(tc.refs).filter(x=>x.endsWith('.dll')).map(x=>'-r:"'+tc.refs+'/'+x+'"'),'"'+output+'/Probe.cs"'].join('\n'));
 for(const mode of ['Player','Editor']){
  let r=cp.spawnSync(tc.dotnet,[tc.csc,...(mode==='Editor'?['-define:UNITY_EDITOR']:[]),'@'+output+'/probe.rsp'],{windowsHide:true,encoding:'utf8'});
  if(r.status===0)r=cp.spawnSync(tc.dotnet,[output+'/probe.dll'],{windowsHide:true,encoding:'utf8'});
  const log=(r.stdout||'')+(r.stderr||'')+(r.error?String(r.error):'');console.log(log);results.push(log);
  check(r.status===0,mode+' stock-only sanitizer / original art and brightness contract');
 }
}catch(e){check(false,e.message);}
fs.writeFileSync(output+'/result.txt',results.join('\n'));process.exitCode=failures?2:0;
