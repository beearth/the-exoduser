param([string]$Output='I:\EXODUSER-Storage\codex-takeover\unity-11-fullrun\route-tests')
$ErrorActionPreference='Stop'
$project=(Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
New-Item -ItemType Directory -Force -Path $Output | Out-Null
$env:DOTNET_CLI_HOME=Join-Path $project 'Library\FullRunDotnetHome'
$env:DOTNET_ADD_GLOBAL_TOOLS_TO_PATH='false'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE='1'
$env:DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE='true'
$env:DOTNET_GENERATE_ASPNET_CERTIFICATE='false'
$env:DOTNET_CLI_TELEMETRY_OPTOUT='1'
$env:TEMP=Join-Path $Output 'temp';$env:TMP=$env:TEMP
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
$source=[IO.File]::ReadAllText((Join-Path $project 'Assets\Exoduser\Runtime\NativeGame.FullRunQa.cs'))
$start=$source.IndexOf('                    Vector2 destination =',[StringComparison]::Ordinal)
$end=$source.IndexOf('                    var move = navigation.Direction(',$start,[StringComparison]::Ordinal)
if($start -lt 0 -or $end -le $start){throw 'Actual fullrun route body not found'}
$body=$source.Substring($start,$end-$start)
$defenseStart=$source.IndexOf('                            defend=',[StringComparison]::Ordinal)
$defenseEnd=$source.IndexOf('                            evade=!defend;',$defenseStart,[StringComparison]::Ordinal)
if($defenseStart -lt 0 -or $defenseEnd -lt $defenseStart){throw 'Actual fullrun defense selection not found'}
$defenseBody=$source.Substring($defenseStart,$defenseEnd-$defenseStart)+'evade=!defend;'
$growthStart=$source.IndexOf('        static bool FullRunPhysicalShield(',[StringComparison]::Ordinal)
$growthEnd=if($growthStart -ge 0){$source.IndexOf('        bool FullRunCanMove(',$growthStart,[StringComparison]::Ordinal)}else{-1}
$growthBody=if($growthEnd -gt $growthStart -and $growthStart -ge 0){$source.Substring($growthStart,$growthEnd-$growthStart)}else{'static bool FullRunAllocateGrowth(Simulation sim){return false;}'}
$prefix=@'
using System;using System.IO;using System.Collections.Generic;using System.Text.Json;using Exoduser.UnityPort.Core;
struct Vector2{public float x,y;public Vector2(float a,float b){x=a;y=b;}public static Vector2 up=>new Vector2(0,1);public float magnitude=>(float)Math.Sqrt(x*x+y*y);public Vector2 normalized{get{float d=magnitude;return d>0?new Vector2(x/d,y/d):new Vector2();}}public static Vector2 operator+(Vector2 a,Vector2 b)=>new Vector2(a.x+b.x,a.y+b.y);public static Vector2 operator-(Vector2 a,Vector2 b)=>new Vector2(a.x-b.x,a.y-b.y);public static Vector2 operator*(Vector2 a,float f)=>new Vector2(a.x*f,a.y*f);public static float SqrMagnitude(Vector2 a)=>a.x*a.x+a.y*a.y;public static float Distance(Vector2 a,Vector2 b)=>(float)Math.Sqrt(SqrMagnitude(a-b));}
class Program{
class Route{public float X,Y;public string Objective;}
static readonly List<object> rows=new List<object>();static int failures;
static void Check(bool ok,string name,Route route){rows.Add(new{name,passed=ok,x=route.X,y=route.Y,objective=route.Objective});if(!ok){failures++;Console.WriteLine("FAIL "+name+" actual="+route.Objective+" "+route.X+","+route.Y);}}
static bool At(Route r,float x,float y)=>Math.Abs(r.X-x)<.01&&Math.Abs(r.Y-y)<.01;
static bool FullRunLine(float x,float y,float tx,float ty)=>true;
/* GROWTH_HELPER */
class DefenseInput{public string ParryClass;public float Mana;}
static (bool defend,bool evade) Defense(string kind,float mana){var p=new DefenseInput{Mana=mana};var bullet=new DefenseInput{ParryClass=kind};bool defend=false,evade=false;
/* DEFENSE_BODY */
return (defend,evade);}
static Route ReadActualRoute(Simulation sim){var Simulation=sim;var p=sim.Player;var flow=sim.Stage;var visits=new HashSet<int>();string objective="";
'@
$suffix=@'
return new Route{X=destination.x,Y=destination.y,Objective=objective};}
static Simulation Make(){var s=new Simulation(new SimulationConfig{EnemyAiEnabled=false});s.Player.X=2000;s.Player.Y=4100;return s;}
static int Main(string[] args){
var s=Make();s.Stage.InArena=true;s.Stage.BossAlive=true;s.AddEnemy(new EnemyState{IsBoss=true,Alive=true,Hp=100,MaxHp=100,X=2000,Y=2000});var r=ReadActualRoute(s);Check(At(r,2000,2000),"arena boss beyond850px must not route to old field holes",r);
s=Make();s.Stage.InArena=true;s.Stage.BossAlive=true;s.AddEnemy(new EnemyState{IsBoss=true,Alive=false,ReviveTimer=60,X=2000,Y=2000});r=ReadActualRoute(s);Check(At(r,2000,4100),"boss revival wait must stay in arena instead of field route",r);
s=Make();s.Stage.InArena=true;s.Stage.BossAlive=false;s.Stage.Exits.Add(new StageFlow.Tile(50,5));r=ReadActualRoute(s);Check(At(r,2020,220),"defeated arena goes to real opened exit",r);
s=Make();s.Stage.BossUnlocked=true;s.Stage.Exits.Add(new StageFlow.Tile(99,14));s.Stage.Exits.Add(new StageFlow.Tile(100,14));r=ReadActualRoute(s);Check(At(r,4020,580),"unlocked field approaches real gate",r);
s=Make();s.AddEnemy(new EnemyState{Alive=true,Hp=100,MaxHp=100,X=2250,Y=4100});r=ReadActualRoute(s);Check(At(r,2000,4100)&&r.Objective=="combat","nearby enemy keeps in-range combat",r);
var d=Defense("physical",100);Check(!d.defend&&d.evade,"physical bullet must not choose wrong Q input",new Route{Objective="physical"});
d=Defense("magic",100);Check(d.defend&&!d.evade,"magic bullet with mana chooses Q",new Route{Objective="magic"});
d=Defense("forbidden",100);Check(!d.defend&&d.evade,"unparryable bullet chooses evade",new Route{Objective="forbidden"});
d=Defense("magic",20);Check(!d.defend&&d.evade,"low mana chooses evade instead of unavailable Q",new Route{Objective="low-mana"});
var ep=Make().Player;ep.State="idle";ep.Stamina=5;Check(FullRunPhysicalShield("physical",ep,1),"physical E uses actual stamina cost",new Route());ep.Stamina=4;Check(!FullRunPhysicalShield("physical",ep,1),"low stamina cannot force E",new Route());ep.Stamina=100;Check(!FullRunPhysicalShield("magic",ep,1),"magic is not E parry",new Route());ep.State="sDraw";Check(FullRunPhysicalShield("physical",ep,1)&&!FullRunShieldPress(ep.State,80,5),"E draw releases as a tap",new Route());Check(FullRunShieldPress("idle",150,5)&&!FullRunShieldPress("idle",300,5),"physical parry waits for actual range",new Route());
var g=Make();g.Player.StatPoints=0;g.Player.PassivePoints=0;float hp=g.Player.Hp;Check(!FullRunAllocateGrowth(g)&&g.Player.Hp==hp,"no points cannot allocate or heal",new Route());
g=Make();g.Player.StatPoints=3;g.Player.PassivePoints=1;hp=g.Player.Hp;Check(FullRunAllocateGrowth(g)&&g.Player.StatPoints==0&&g.Player.PassivePoints==0&&g.Growth.Value("str")==3&&g.Growth.Value("pFortify")==1&&g.Player.Hp==hp,"earned points spend transactionally without forced heal",new Route());
Check(!FullRunAllocateGrowth(g),"same earned points cannot be spent twice",new Route());
g=Make();g.Player.StatPoints=0;g.Player.PassivePoints=1000;Check(FullRunAllocateGrowth(g)&&g.Player.PassivePoints>=0&&g.Growth.Value("pFortify")<=10&&g.Growth.Value("pHuman")<=10&&g.Growth.Value("pMelee")<=10,"rank caps and actual costs are respected",new Route());
File.WriteAllText(args[0],JsonSerializer.Serialize(new{passed=rows.Count-failures,failures,scope="Actual NativeGame.FullRunQa route body with pure geometry shim; no Player/GPU claim",rows},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine("checks="+rows.Count+" failures="+failures);return failures>0?1:0;}}
'@
[IO.File]::WriteAllText((Join-Path $Output 'Program.cs'),$prefix.Replace('/* DEFENSE_BODY */',$defenseBody).Replace('/* GROWTH_HELPER */',$growthBody)+"`n"+$body+"`n"+$suffix)
$core=$project.Replace('\','/')+'/Assets/Exoduser/Runtime/Core/**/*.cs'
$csproj='<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit></PropertyGroup><ItemGroup><Compile Include="Program.cs"/><Compile Include="'+$core+'"/></ItemGroup></Project>'
[IO.File]::WriteAllText((Join-Path $Output 'FullRunRouteTests.csproj'),$csproj)
[IO.File]::WriteAllText((Join-Path $Output 'NuGet.Config'),'<configuration><packageSources><clear/></packageSources></configuration>')
$dotnet='G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\dotnet.exe'
& $dotnet build (Join-Path $Output 'FullRunRouteTests.csproj') --verbosity quiet '-p:NuGetAudit=false' 2>&1 | Tee-Object -FilePath (Join-Path $Output 'build.log')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
& $dotnet (Join-Path $Output 'bin\Debug\net8.0\FullRunRouteTests.dll') (Join-Path $Output 'result.json') 2>&1 | Tee-Object -FilePath (Join-Path $Output 'test.log')
exit $LASTEXITCODE
