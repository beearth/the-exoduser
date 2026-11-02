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
if($source.IndexOf('        static InventoryItem FullRunUpgradeItem(') -lt 0){$growthBody+='static InventoryItem FullRunUpgradeItem(InventoryState inventory,int level){return null;}'}
if($source.IndexOf('        static int FullRunAuxSkills(') -lt 0){$growthBody+='static int FullRunAuxSkills(Simulation sim,bool fighting,float nearest){return 0;}'}
$navStart=$source.IndexOf('    sealed class FullRunNavigation')
$navBody=$source.Substring($navStart,$source.LastIndexOf("`n}")-$navStart)
$attackMatch=[regex]::Match($source,'bool attack = [^;]+;')
if(-not $attackMatch.Success){throw 'Actual attack decision not found'}
$attackBody=$attackMatch.Value
$orbitStart=$source.IndexOf('if(fighting&&Vector2.SqrMagnitude')
$orbitEnd=$source.IndexOf('){var offset',$orbitStart)
if($orbitStart -lt 0 -or $orbitEnd -le $orbitStart){throw 'Actual orbit decision not found'}
$orbitBody=$source.Substring($orbitStart+3,$orbitEnd-$orbitStart-3)
$prefix=@'
using System;using System.IO;using System.Collections.Generic;using System.Text.Json;using Exoduser.UnityPort.Core;using Exoduser.UnityPort;
struct Vector2{public float x,y;public Vector2(float a,float b){x=a;y=b;}public static Vector2 zero=>new Vector2();public static Vector2 up=>new Vector2(0,1);public float magnitude=>(float)Math.Sqrt(x*x+y*y);public Vector2 normalized{get{float d=magnitude;return d>0?new Vector2(x/d,y/d):new Vector2();}}public static Vector2 operator+(Vector2 a,Vector2 b)=>new Vector2(a.x+b.x,a.y+b.y);public static Vector2 operator-(Vector2 a,Vector2 b)=>new Vector2(a.x-b.x,a.y-b.y);public static Vector2 operator*(Vector2 a,float f)=>new Vector2(a.x*f,a.y*f);public static float SqrMagnitude(Vector2 a)=>a.x*a.x+a.y*a.y;public static float Distance(Vector2 a,Vector2 b)=>(float)Math.Sqrt(SqrMagnitude(a-b));}
static class Mathf{public static int Clamp(int a,int l,int h)=>Math.Clamp(a,l,h);public static float Abs(float x)=>Math.Abs(x);public static float Sign(float x)=>Math.Sign(x);}
class Program{
class Route{public float X,Y;public string Objective;}
static readonly List<object> rows=new List<object>();static int failures;
static void Check(bool ok,string name,Route route){rows.Add(new{name,passed=ok,x=route.X,y=route.Y,objective=route.Objective});if(!ok){failures++;Console.WriteLine("FAIL "+name+" actual="+route.Objective+" "+route.X+","+route.Y);}}
static bool At(Route r,float x,float y)=>Math.Abs(r.X-x)<.01&&Math.Abs(r.Y-y)<.01;
static bool FullRunLine(float x,float y,float tx,float ty)=>true;
/* GROWTH_HELPER */
static bool ReadActualAttack(Simulation sim){var p=sim.Player;var flow=sim.Stage;bool fighting=true,defend=false,evade=false,shield=false;/* ATTACK_SELECTOR */return attack;}
static bool ReadActualOrbit(bool selectedAngler,float distance){bool fighting=true;var p=Make().Player;p.X=p.Y=0;var aim=new Vector2(distance,0);return /* ORBIT_SELECTOR */;}
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
s=Make();s.Player.X=4000;s.Player.Y=8000;s.EnableFieldSpawns();s.SpawnHoles.Holes.Clear();s.FieldBosses=new[]{new FieldBossState{Index=0,X=6000,Y=6000,Hp=100,MaxHp=100}};r=ReadActualRoute(s);Check(r.Objective.StartsWith("angler-"),"finished far summon sites must not delay the remaining anglers",r);
s=Make();s.Player.Level=6;s.AddEnemy(new EnemyState{Alive=true,Hp=100,MaxHp=100,X=2080,Y=4100});s.AddEnemy(new EnemyState{Alive=true,Hp=100,MaxHp=100,X=2300,Y=4100,Etype=7});r=ReadActualRoute(s);Check(At(r,2090,4100),"established character can prioritize the nearby summoner",r);
s.Player.Level=2;r=ReadActualRoute(s);Check(At(r,1870,4100),"early character clears the immediate add before chasing its summoner",r);
s=Make();s.EnableFieldSpawns();s.SpawnHoles.Holes.Clear();s.FieldBosses=new[]{new FieldBossState{Index=0,X=2600,Y=4100,Hp=100,MaxHp=100}};s.AddEnemy(new EnemyState{Alive=true,Hp=100,MaxHp=100,X=2080,Y=4100});r=ReadActualRoute(s);Check(At(r,2240,4100),"after holes finish an angler takes priority at the ranged distance",r);
s=Make();s.FieldBosses=new[]{new FieldBossState{Index=0,X=2200,Y=4100,Hp=100,MaxHp=100}};r=ReadActualRoute(s);Check(At(r,1840,4100),"near field angler requests retreat instead of standing in its melee range",r);
var d=Defense("physical",100);Check(!d.defend&&d.evade,"physical bullet must not choose wrong Q input",new Route{Objective="physical"});
d=Defense("magic",100);Check(d.defend&&!d.evade,"magic bullet with mana chooses Q",new Route{Objective="magic"});
d=Defense("forbidden",100);Check(!d.defend&&d.evade,"unparryable bullet chooses evade",new Route{Objective="forbidden"});
d=Defense("magic",20);Check(!d.defend&&d.evade,"low mana chooses evade instead of unavailable Q",new Route{Objective="low-mana"});
var ep=Make().Player;ep.State="idle";ep.Stamina=5;Check(FullRunPhysicalShield("physical",ep,1),"physical E uses actual stamina cost",new Route());ep.Stamina=4;Check(!FullRunPhysicalShield("physical",ep,1),"low stamina cannot force E",new Route());ep.Stamina=100;Check(!FullRunPhysicalShield("magic",ep,1),"magic is not E parry",new Route());ep.State="sDraw";Check(FullRunPhysicalShield("physical",ep,1)&&!FullRunShieldPress(ep.State,80,5),"E draw releases as a tap",new Route());Check(FullRunShieldPress("idle",150,5)&&!FullRunShieldPress("idle",300,5),"physical parry waits for actual range",new Route());
var g=Make();g.Player.StatPoints=0;g.Player.PassivePoints=0;float hp=g.Player.Hp;Check(!FullRunAllocateGrowth(g)&&g.Player.Hp==hp,"no points cannot allocate or heal",new Route());
g=Make();g.Player.StatPoints=3;g.Player.PassivePoints=1;hp=g.Player.Hp;Check(FullRunAllocateGrowth(g)&&g.Player.StatPoints==0&&g.Player.PassivePoints==0&&g.Growth.Value("str")==3&&g.Growth.Value("pFortify")==1&&g.Player.Hp==hp,"earned points spend transactionally without forced heal",new Route());
Check(!FullRunAllocateGrowth(g),"same earned points cannot be spent twice",new Route());
g=Make();g.Player.StatPoints=0;g.Player.PassivePoints=1000;Check(FullRunAllocateGrowth(g)&&g.Player.PassivePoints>=0&&g.Growth.Value("pFortify")<=10&&g.Growth.Value("pHuman")<=10&&g.Growth.Value("pMelee")<=10,"rank caps and actual costs are respected",new Route());
var oldWeapon=new InventoryItem{slot="weapon",wtype="sword",atk=10,spd=.5,name="old"};var better=new InventoryItem{slot="weapon",wtype="sword",atk=20,spd=.6,name="earned"};var locked=new InventoryItem{slot="weapon",wtype="sword",atk=1000,spd=2,name="locked",reqLv=99};var worn=new InventoryItem[17];worn[0]=oldWeapon;var inv=new InventoryState(new InventorySeedData{equipped=worn,bag=new[]{better,locked}});var selected=FullRunUpgradeItem(inv,1);Check(ReferenceEquals(selected,better),"selects owned usable upgrade instead of level-locked loot",new Route());Check(ReferenceEquals(inv.GetEquipped("weapon"),oldWeapon)&&inv.Bag.Count==2,"selection never edits equipment or ownership",new Route());inv.TryEquip(better,1,out _);Check(FullRunUpgradeItem(inv,1)==null,"no downgrade or repeated equip when all usable items are worse",new Route());
var escapeSim=Make();escapeSim.Player.State="pStun";escapeSim.Player.Mana=100;escapeSim.IceOrbCd=0;Check((FullRunAuxSkills(escapeSim,true,100)&2)!=0,"stun selects the learned Ctrl escape skill",new Route());escapeSim.IceOrbCd=100;Check((FullRunAuxSkills(escapeSim,true,100)&2)==0,"Ctrl escape respects actual cooldown",new Route());escapeSim=Make();escapeSim.Rage=80;escapeSim.Materials=1000;Check((FullRunAuxSkills(escapeSim,true,200*200)&4)!=0,"earned rage can use stationary Space burst",new Route());
var md=JsonSerializer.Deserialize<MapData>(File.ReadAllText(args[1]),new JsonSerializerOptions{IncludeFields=true});var map=new SourceMap(md);var nav=new FullRunNavigation();float nx=5145.0137f,ny=3796.453f;for(int t=0;t<1800;t++){var v=nav.Direction(nx,ny,5620,5220,16,map.CanMove,t).normalized;if(map.CanMove(nx+v.x*2.7f,ny,16))nx+=v.x*2.7f;if(map.CanMove(nx,ny+v.y*2.7f,16))ny+=v.y*2.7f;}Check(Vector2.Distance(new Vector2(nx,ny),new Vector2(5620,5220))<60,"real source map corner must reach the next summon site",new Route{X=nx,Y=ny});
var charged=Make();charged.Stage.InArena=true;charged.Player.KiChargeActive=true;charged.Player.KiChargeTicks=119;Check(ReadActualAttack(charged),"boss third slash holds until the real tier3 boundary",new Route());charged.Player.KiChargeTicks=120;Check(!ReadActualAttack(charged),"boss tier3 is released at120 ordinary ticks",new Route());charged.Stage.InArena=false;charged.Player.KiChargeTicks=30;Check(!ReadActualAttack(charged),"field third slash retains its short release",new Route());charged.Player.KiChargeTicks=29;Check(ReadActualAttack(charged),"field short release is not premature",new Route());
Check(!ReadActualOrbit(true,200),"too-close angler must retreat instead of orbit overriding navigation",new Route());Check(ReadActualOrbit(true,360),"angler can orbit at its actual ranged distance",new Route());Check(!ReadActualOrbit(false,80),"too-close ordinary enemy must permit retreat",new Route());
var msim=Make();var fieldTiles=NativeMinimapTiles.Read(map,msim.Stage);Check(fieldTiles.Width==md.width&&fieldTiles.Height==md.height,"field minimap retains its actual source dimensions",new Route());
msim.Stage.InArena=true;msim.Stage.Arena=BossArenaLayout.Generate(0);var arenaTiles=NativeMinimapTiles.Read(map,msim.Stage);Check(arenaTiles.Width==128&&arenaTiles.Height==108&&arenaTiles.Tile(64,54)==4,"arena minimap reads the actual boss room instead of the cached field",new Route());Check(!fieldTiles.Same(arenaTiles),"arena entry invalidates the field minimap texture",new Route());
msim.Stage.BossAlive=false;Check(!arenaTiles.Same(NativeMinimapTiles.Read(map,msim.Stage)),"boss death invalidates the map after the real exit opens",new Route());msim.Stage.InArena=false;msim.Stage.Arena=null;Check(!arenaTiles.Same(NativeMinimapTiles.Read(map,msim.Stage)),"normal retry invalidates the arena map on field return",new Route());
Check(!FullRunMagicShieldPress("wWindup")&&FullRunMagicShieldPress("idle")&&FullRunMagicShieldPress("sRecover")&&FullRunMagicShieldPress("sBlock"),"Q press waits for admission and retains an actual block",new Route());var rollInput=Make();Check(FullRunRollPress(rollInput),"available roll can press on an even frame",new Route());rollInput.Tick(0,0,0,0,false,false);Check(!FullRunRollPress(rollInput),"next frame releases Space for a future keydown",new Route());rollInput.Tick(0,0,0,0,false,false);rollInput.HarpGauge=0;Check(!FullRunRollPress(rollInput),"empty gauge suppresses a denied roll request",new Route());rollInput.HarpGauge=225;rollInput.RollMoveT=12;Check(!FullRunRollPress(rollInput),"ongoing roll completes before another request",new Route());
Check(FullRunFrameCapture("",9,10,"clear")=="clear","prior-frame PNG cost remains labelled after the capture flag clears",new Route());Check(FullRunFrameCapture("",8,10,"clear")=="","old captures are not blamed for a later frame",new Route());Check(FullRunFrameCapture("boss",8,10,"clear")=="boss","current capture has priority over an old stamp",new Route());
File.WriteAllText(args[0],JsonSerializer.Serialize(new{passed=rows.Count-failures,failures,scope="Actual NativeGame.FullRunQa route body with pure geometry shim; no Player/GPU claim",rows},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine("checks="+rows.Count+" failures="+failures);return failures>0?1:0;}}
'@
[IO.File]::WriteAllText((Join-Path $Output 'Program.cs'),$prefix.Replace('/* DEFENSE_BODY */',$defenseBody).Replace('/* GROWTH_HELPER */',$growthBody).Replace('/* ATTACK_SELECTOR */',$attackBody).Replace('/* ORBIT_SELECTOR */',$orbitBody)+"`n"+$body+"`n"+$suffix+"`n"+$navBody)
$core=$project.Replace('\','/')+'/Assets/Exoduser/Runtime/Core/**/*.cs'
$csproj='<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework><EnableDefaultCompileItems>false</EnableDefaultCompileItems><NuGetAudit>false</NuGetAudit></PropertyGroup><ItemGroup><Compile Include="Program.cs"/><Compile Include="'+$core+'"/><Compile Include="'+$project.Replace('\','/')+'/Assets/Exoduser/Runtime/SourceMap.cs"/><Compile Include="'+$project.Replace('\','/')+'/Assets/Exoduser/Runtime/NativeMinimapTiles.cs"/></ItemGroup></Project>'
[IO.File]::WriteAllText((Join-Path $Output 'FullRunRouteTests.csproj'),$csproj)
[IO.File]::WriteAllText((Join-Path $Output 'NuGet.Config'),'<configuration><packageSources><clear/></packageSources></configuration>')
$dotnet='G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\dotnet.exe'
& $dotnet build (Join-Path $Output 'FullRunRouteTests.csproj') --verbosity quiet '-p:NuGetAudit=false' 2>&1 | Tee-Object -FilePath (Join-Path $Output 'build.log')
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
& $dotnet (Join-Path $Output 'bin\Debug\net8.0\FullRunRouteTests.dll') (Join-Path $Output 'result.json') (Join-Path $project 'Assets\Exoduser\Resources\Data\ch1_map.json') 2>&1 | Tee-Object -FilePath (Join-Path $Output 'test.log')
exit $LASTEXITCODE
