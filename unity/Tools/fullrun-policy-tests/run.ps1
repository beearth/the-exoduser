param([string]$Output='',[string]$ProjectRoot=(Join-Path $PSScriptRoot '../..'))
$ErrorActionPreference='Stop'
$project=(Resolve-Path -LiteralPath $ProjectRoot).Path
$case='case-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmssfff')+'-'+[Guid]::NewGuid().ToString('N')
$Evidence=if([string]::IsNullOrWhiteSpace($Output)){Join-Path 'I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/policy-tests' $case}else{[IO.Path]::GetFullPath($Output)}
if(Test-Path -LiteralPath (Join-Path $Evidence 'policy-result.json')){throw 'Preserve previous policy evidence; choose a new Output directory'}
$buildDirectory=Join-Path $project ('Library/FullRunPolicyChecks/'+$case)
$routePath=Join-Path $PSScriptRoot '../fullrun-route-tests/run.ps1'
function Quote-Ps([string]$value){"'"+$value.Replace("'","''")+"'"}
$command='& '+(Quote-Ps $routePath)+' -ProjectRoot '+(Quote-Ps $project)+' -Output '+(Quote-Ps $Evidence)+' -BuildDirectory '+(Quote-Ps $buildDirectory)
& 'C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe' -NoProfile -Command $command
if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
$Output=$buildDirectory
function Export-RunEvidence([int]$Code,[string]$Kind) {
 [IO.Directory]::CreateDirectory($Evidence)|Out-Null
 foreach($name in 'result.json','policy-result.json','build.log','test.log','policy-build.log','policy-test.log'){ $src=Join-Path $Output $name;if(Test-Path -LiteralPath $src){Copy-Item -LiteralPath $src -Destination (Join-Path $Evidence $name) -Force} }
 $program=Join-Path $Output 'Program.cs';if(Test-Path -LiteralPath $program){Copy-Item -LiteralPath $program -Destination (Join-Path $Evidence ($Kind+'-Program.cs')) -Force}
 $scope=[ordered]@{kind=$Kind;exitCode=$Code;project=$project;cache=$Output;evidence=$Evidence;scope='Active dotnet/obj/temp stay in project Library on NTFS. Completed text/source evidence only is exported.'}
 [IO.File]::WriteAllText((Join-Path $Evidence ($Kind+'-runner-scope.json')),($scope|ConvertTo-Json -Depth 3),(New-Object Text.UTF8Encoding($false)))
}
$program=[IO.File]::ReadAllText((Join-Path $Output 'Program.cs'))
$tests=@'
var ps=Make();ps.Stage.InArena=true;ps.AddEnemy(new EnemyState{IsBoss=true,Alive=true,Hp=100,MaxHp=100,X=2200,Y=4100});
var policy=new FullRunControlPolicy();var kk=new List<UnityEngine.InputSystem.Key>();var mv=Vector2.zero;var am=new Vector2(2200,4100);bool aa=true,mm=true;int lc=-10000;var pn=new FullRunNavigation();float ph=ps.Player.Hp,px=ps.Player.X,pst=ps.Player.Stamina;double pg=ps.HarpGauge;
FullRunControlInputs.Apply(ps,policy,pn,(x,y,radius)=>true,kk,ref mv,ref am,ref aa,ref mm,true,0,ref lc);Check(aa&&mm&&kk.Count==0,"disabled policy preserves existing virtual inputs",new Route());
policy.bossRange=float.NaN;policy.chargeTicks=900;policy.chainCooldown=-1;policy.Normalize();Check(!float.IsNaN(policy.bossRange)&&policy.chargeTicks==120&&policy.chainCooldown>=60,"malformed numeric preferences are bounded",new Route());
policy.enabled=true;policy.chain=true;policy.chainHealth=1;ps.Player.Hp=ps.Player.MaxHp*.5f;ph=ps.Player.Hp;
FullRunControlInputs.Apply(ps,policy,pn,(x,y,radius)=>true,kk,ref mv,ref am,ref aa,ref mm,true,0,ref lc);Check(kk.Contains(UnityEngine.InputSystem.Key.LeftShift)&&!aa&&!mm,"eligible defense emits ordinary Shift instead of forced dash",new Route());
Check(ps.Player.Hp==ph&&ps.Player.X==px&&ps.Player.Stamina==pst&&ps.HarpGauge==pg&&!ps.HarpActive,"policy never edits player resources coordinates or dash state",new Route());
kk.Clear();ps.HarpGauge=0;lc=-10000;FullRunControlInputs.Apply(ps,policy,pn,(x,y,radius)=>true,kk,ref mv,ref am,ref aa,ref mm,true,0,ref lc);Check(!kk.Contains(UnityEngine.InputSystem.Key.LeftShift),"empty gauge cannot request chain",new Route());
policy.chain=false;policy.retreatHealth=.9f;policy.orbit=false;mv=Vector2.zero;FullRunControlInputs.Apply(ps,policy,pn,(x,y,radius)=>true,kk,ref mv,ref am,ref aa,ref mm,false,0,ref lc);Check(mv.x<0&&!aa&&!mm&&ps.Player.X==px,"low health retreat changes virtual movement only",new Route());
policy.retreatHealth=0;policy.melee=true;policy.magic=true;ps.Player.KiChargeActive=true;ps.Player.KiChargeTicks=119;aa=false;FullRunControlInputs.Apply(ps,policy,pn,(x,y,radius)=>true,kk,ref mv,ref am,ref aa,ref mm,false,0,ref lc);Check(aa,"configured charge holds119 ticks",new Route());
ps.Player.KiChargeTicks=120;aa=true;FullRunControlInputs.Apply(ps,policy,pn,(x,y,radius)=>true,kk,ref mv,ref am,ref aa,ref mm,false,0,ref lc);Check(!aa,"configured charge releases120 ticks",new Route());
ps.Stage.InArena=false;aa=true;policy.parryOnly=true;FullRunControlInputs.Apply(ps,policy,pn,(x,y,radius)=>true,kk,ref mv,ref am,ref aa,ref mm,false,0,ref lc);Check(aa,"boss preferences cannot alter field controls",new Route());
'@
$program=$program.Replace('File.WriteAllText(args[0],',$tests+"`nFile.WriteAllText(args[0],")
$program+="`nnamespace UnityEngine { internal class Marker {} }`nnamespace UnityEngine.InputSystem { internal enum Key {W,A,S,D,Q,E,R,F,Space,LeftCtrl,LeftShift,Digit1} }"
[IO.File]::WriteAllText((Join-Path $Output 'Program.cs'),$program)
$proj=Join-Path $Output 'FullRunRouteTests.csproj'
$xml=[IO.File]::ReadAllText($proj).Replace('</ItemGroup>','<Compile Include="'+$project.Replace('\','/')+'/Assets/Exoduser/Runtime/NativeGame.FullRunPolicy.cs"/></ItemGroup>')
[IO.File]::WriteAllText($proj,$xml)
$env:DOTNET_CLI_HOME=Join-Path $project 'Library\FullRunDotnetHome';$env:DOTNET_CLI_TELEMETRY_OPTOUT='1';$env:TEMP=Join-Path $Output 'temp';$env:TMP=$env:TEMP
$dotnet='G:\unity\Editor\6000.6.7f1\Editor\Data\DotNetSdk\dotnet.exe'
& $dotnet build $proj --verbosity quiet '-p:NuGetAudit=false' 2>&1 | Tee-Object (Join-Path $Output 'policy-build.log')
$buildExit=$LASTEXITCODE;if($buildExit -ne 0){Export-RunEvidence $buildExit 'policy';exit $buildExit}
& $dotnet (Join-Path $Output 'bin\Debug\net8.0\FullRunRouteTests.dll') (Join-Path $Output 'policy-result.json') (Join-Path $project 'Assets\Exoduser\Resources\Data\ch1_map.json') 2>&1 | Tee-Object (Join-Path $Output 'policy-test.log')
$testExit=$LASTEXITCODE;Export-RunEvidence $testExit 'policy';exit $testExit
