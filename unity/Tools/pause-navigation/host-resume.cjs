// 제품 NativeGame 함수 원문 + 실제 Core 전체 소스. Unity 화면/장치 검수와 구분한다.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const project=path.resolve(__dirname,'../..'),output=path.resolve(process.argv[2]);
const native=fs.readFileSync(path.join(project,'Assets/Exoduser/Runtime/NativeGame.cs'),'utf8');
const names=['ApplyPauseCommand','SetInventory','SetSkills','SetStats','SetForge'];
const methods=names.map(name=>{const start=native.indexOf('        void '+name+'('),end=native.indexOf('\n        }',start);if(start<0||end<0)throw Error(name);return native.slice(start,end+10);});
const down=native.split(/\r?\n/).find(l=>l.includes('bool PlayerDown{'));
const entry=fs.readFileSync(path.join(project,'Assets/Exoduser/Runtime/NativeGame.StartupFlow.cs'),'utf8');
const entryStart=entry.indexOf('  bool WaitForFrontendEntryInput()'),entryEnd=entry.indexOf('\n  }',entryStart);
if(entryStart<0||entryEnd<0)throw Error('WaitForFrontendEntryInput');
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'source-evidence.json'),JSON.stringify({scope:'제품 함수 원문을 추출해 컴파일; Core는 실제 전체 소스, 화면/장치는 최소 대역. 실제 Player 별도',nativeSha:crypto.createHash('sha256').update(native).digest('hex'),entrySha:crypto.createHash('sha256').update(entry).digest('hex'),methods:[...names,'WaitForFrontendEntryInput']},null,2));
fs.writeFileSync(path.join(output,'Program.cs'),`using System;using Exoduser.UnityPort.Core;
enum PauseMenuCommand{None,Resume,Restart,ReturnLobby,Quit}
class Panel{public bool Open;public void SetOpen(bool open,int slot=6){Open=open;}public void Reset(){}public void ShowLobby(){}}
class Application{public static void Quit(){}}
class Time{public static int frameCount=1;}class ExoInput{public static bool AnyKey=false;public static bool Mouse(int button){return false;}}
class Host{
 public Simulation Simulation=new Simulation(SourceStarterFixture.CreateKiSlash());
 public bool Running=true,menu=false,gameFocused=true,skillInputFence=false,inventoryWasRunning,skillsWasRunning,statsWasRunning,forgeWasRunning;
 object firstPractice=null;Panel inventory=new Panel(),skills=new Panel(),stats=new Panel(),forge=new Panel(),sound=new Panel(),pauseMenu=new Panel(),lobby=new Panel();
 public bool frontendEntryInputFence;int frontendFenceReleasedFrame;
 void SaveCombatNow(){}void ResetRun(){}
 ${down}
 ${methods.join('\n')}
 ${entry.slice(entryStart,entryEnd+4)}
 public void Resume(){ApplyPauseCommand(PauseMenuCommand.Resume);}
 public bool ReleaseEntry(){return WaitForFrontendEntryInput();}
 public void Panel(bool open,string name){if(name=="inventory")SetInventory(open);else if(name=="skills")SetSkills(open);else if(name=="stats")SetStats(open);else SetForge(open);}
}
class Program{static int count,fail;static void Check(bool ok,string name){count++;Console.WriteLine((ok?"통과 ":"실패 ")+name);if(!ok)fail++;}
 static int Main(){foreach(var state in new[]{"idle","fallen","dead"})foreach(bool focus in new[]{true,false}){
 var h=new Host();h.menu=true;h.Running=false;h.gameFocused=focus;h.Simulation.Player.State=state;h.Simulation.Player.Hp=state=="idle"?h.Simulation.Player.MaxHp:0;
 h.Resume();bool expected=focus&&state!="dead";Check(h.Running==expected&&h.menu==!expected,"계속하기 "+state+" focus="+focus);
 foreach(var panel in new[]{"inventory","skills","stats","forge"}){h=new Host();h.Panel(true,panel);h.Simulation.Player.State=state;h.Simulation.Player.Hp=state=="idle"?h.Simulation.Player.MaxHp:0;h.gameFocused=focus;h.Panel(false,panel);Check(h.Running==expected,panel+" 닫기 "+state+" focus="+focus);}
 }foreach(var panel in new[]{"none","menu","inventory","skills","stats","forge"}){var h=new Host();h.frontendEntryInputFence=true;h.Running=false;if(panel=="menu")h.menu=true;else if(panel!="none")h.Panel(true,panel);h.ReleaseEntry();Check(h.Running==(panel=="none"),"대화 안내 입력 해제 중 열린 창 "+panel);}
 Console.WriteLine(count+"검사 / 실패"+fail);return fail==0?0:1;}}
`);
fs.writeFileSync(path.join(output,'HostResume.csproj'),`<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NoWarn>0169;0649;0414</NoWarn></PropertyGroup><ItemGroup><Compile Include="Program.cs"/><Compile Include="${project.replaceAll('\\','/')}/Assets/Exoduser/Runtime/Core/**/*.cs"/></ItemGroup></Project>`);
fs.writeFileSync(path.join(output,'global.json'),'{"sdk":{"version":"8.0.301","rollForward":"disable"}}');
const r=cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',['run','--project',path.join(output,'HostResume.csproj'),'--artifacts-path',path.join(output,'artifacts')],{cwd:output,encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});
fs.writeFileSync(path.join(output,'result.log'),(r.stdout||'')+(r.stderr||''));process.stdout.write((r.stdout||'')+(r.stderr||''));process.exit(r.status??2);
