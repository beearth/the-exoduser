// Unity 실행 없이 실제 표현 타이밍 클래스를 .NET 8로 검사한다. 게임/Player 판정은 별도다.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const out = path.resolve(process.argv[2] || 'I:/EXODUSER-Storage/demo-art/boss-druid/presentation-tests');
if (!/^I:[\\/]/i.test(out)) throw new Error('검사 출력은 I:에 둔다');
fs.mkdirSync(out, {recursive: true});
const dotnet = 'C:/Program Files/dotnet/dotnet.exe';
const pack = 'C:/Program Files/dotnet/packs/Microsoft.NETCore.App.Ref';
const version = fs.readdirSync(pack).filter(x=>x.startsWith('8.')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
const ref = path.join(pack, version, 'ref/net8.0');
const refs = fs.readdirSync(ref).filter(x=>x.endsWith('.dll')).map(x=>'-r:'+path.join(ref,x));
const binary = path.join(out, 'DruidPresentation.dll');
const helper = path.join(root, 'Assets/Exoduser/Runtime/NativeDruidMotionClock.cs');
if (!fs.existsSync(helper)) { console.error('실패: 드루이드 표현 타이밍 구현이 없음'); process.exit(1); }
const impact = path.join(root, 'Assets/Exoduser/Runtime/NativeDruidImpactClock.cs');
if (!fs.existsSync(impact)) { console.error('실패: 보스 접점·자세정지 표현 구현이 없음'); process.exit(1); }
const options = {cwd:root,windowsHide:true,encoding:'utf8',timeout:120000,env:{...process.env,DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_NOLOGO:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'}};
let r = cp.spawnSync(dotnet,['C:/Program Files/dotnet/sdk/8.0.301/Roslyn/bincore/csc.dll','-nologo','-utf8output','-target:exe','-out:'+binary,...refs,path.join(__dirname,'Program.cs'),path.join(__dirname,'ImpactChecks.cs'),helper,impact,path.join(root,'Assets/Exoduser/Runtime/NativeDruidRigContract.cs'),path.join(root,'Assets/Exoduser/Runtime/NativeReviewArgs.cs')],options);
let log=(r.stdout||'')+(r.stderr||'');
if (r.status===0) {
  fs.writeFileSync(path.join(out,'DruidPresentation.runtimeconfig.json'),JSON.stringify({runtimeOptions:{tfm:'net8.0',framework:{name:'Microsoft.NETCore.App',version:'8.0.0'}}}));
  r=cp.spawnSync(dotnet,[binary,'--unity-druid-3d'],options);log+='3D 옵션: '+(r.stdout||'')+(r.stderr||'');
  if(r.status===0){r=cp.spawnSync(dotnet,[binary,'--unity-original-druid-projectiles'],options);log+='원본 탄막 옵션: '+(r.stdout||'')+(r.stderr||'');}
}
fs.writeFileSync(path.join(out,'검사결과.json'),JSON.stringify({범위:'순수 C# 표현 타이밍·검수 세이브 옵션, Unity 전체/Player 미검증',종료코드:r.status,로그:log},null,2));
console.log(log);process.exitCode=r.status??1;
