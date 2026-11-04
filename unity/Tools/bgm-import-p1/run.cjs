const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'../..'),out=path.resolve(process.argv[2]),rt=path.join(project,'Assets/Exoduser/Runtime');
fs.mkdirSync(out,{recursive:true});
const gameSource=fs.readFileSync(path.join(rt,'NativeGame.cs'),'utf8');
const start=gameSource.indexOf('        string StageMusicKey()'),end=gameSource.indexOf('        void UpdateGameMusic()',start);
assert(start>=0&&end>start,'actual StageMusicKey source');
fs.writeFileSync(path.join(out,'StageFixture.cs'),`using System;class StageFixture {public bool PlayerDown;public Sim Simulation=new Sim();public Forge forge=new Forge();public class Sim {public Flow Stage=new Flow();public Config Config=new Config();}public class Flow {public bool InArena,BossAlive;}public class Config {public int StageIndex=0;}public class Forge {public bool Open;}static class EnemyTables {public static int[] SiToHell={0};}public string Key(){return StageMusicKey();}${gameSource.slice(start,end)}}`);
const files=[path.join(__dirname,'Program.cs'),path.join(__dirname,'host-stubs.cs'),path.join(rt,'NativeGameMusic.cs'),path.join(rt,'NativeBgmCatalog.cs'),path.join(rt,'Core/NativeBgmSelection.cs'),path.join(rt,'Core/NativeBgmRotation.cs')];
files.push(path.join(out,'StageFixture.cs'));
if(fs.existsSync(path.join(rt,'NativeBgmCues.cs')))files.push(path.join(rt,'NativeBgmCues.cs'));
fs.writeFileSync(path.join(out,'Contract.csproj'),`<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems></PropertyGroup><ItemGroup>${files.map(f=>`<Compile Include="${f.replaceAll('\\','/')}"/>`).join('')}</ItemGroup></Project>`);
fs.writeFileSync(path.join(out,'global.json'),'{"sdk":{"version":"8.0.301","rollForward":"disable"}}');
const r=cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',['run','--project',path.join(out,'Contract.csproj')],{cwd:out,encoding:'utf8',stdio:['ignore','pipe','pipe'],windowsHide:true});
fs.writeFileSync(path.join(out,'result.log'),(r.stdout||'')+(r.stderr||''));process.stdout.write((r.stdout||'')+(r.stderr||''));if(r.status!==0)process.exit(r.status||1);
const catalog=require('./catalog.json'),data=JSON.parse(fs.readFileSync(path.join(project,'Assets/Exoduser/Resources/Data/a15_options_web.json'),'utf8'));
const values=data.entries.find(e=>e.key==='bgm.values').texts;
for(let lang=0;lang<29;lang++){const v=values[lang].split('\x01'),labels=data.entries.find(e=>e.key==='bgm.labels').texts[lang].split('\x01');for(const item of catalog){const i=v.indexOf('t:bgm/'+item.file);assert(i>=0&&labels[i]?.length,'29-language existing menu label '+item.file);}}
const dir=path.join(project,'Assets/Exoduser/Resources/Audio/Bgm'),metaBase=fs.readFileSync(path.join(dir,'hell1_rot_iron_oath.mp3.meta'),'utf8').replace(/^guid: .*$/m,'');
const guids=new Set(fs.readdirSync(dir).filter(f=>f.endsWith('.meta')&&!catalog.some(i=>f===i.clip+'.mp3.meta')).map(f=>fs.readFileSync(path.join(dir,f),'utf8').match(/^guid: (.*)$/m)[1]));
for(const item of catalog){const file=path.join(dir,item.clip+'.mp3');assert(fs.statSync(file).size>1000000,'real clip exists');const meta=fs.readFileSync(file+'.meta','utf8'),guid=meta.match(/^guid: (.*)$/m)[1];assert(!guids.has(guid),'unique guid');guids.add(guid);assert.equal(meta.replace(/^guid: .*$/m,''),metaBase,'P0 import settings');}
const native=fs.readFileSync(path.join(rt,'NativeGame.cs'),'utf8');assert(/if\(forge\.Open\)return "forge";/.test(native),'forge screen reaches forge cue');
console.log('통과: 실제 음원 8개·P0 임포트 설정·고유 GUID·29언어 기존 표시명·대장간 배선');
