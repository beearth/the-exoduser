// node run.cjs --source game.html --out DIR --web-commit SHA --core-commit SHA --dependency-root REPO
// Windows PowerShell에서도 stdin을 닫고 무창으로만 Node/.NET을 실행한다.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const arg=k=>{const n=process.argv.indexOf(k);if(n<0||!process.argv[n+1])throw Error(k+' 필요');return process.argv[n+1];};
const out=path.resolve(arg('--out')),project=path.resolve(__dirname,'../..'),build=path.join(project,'Library/ResourceOracle');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(build,{recursive:true});
for(const name of ['Program.cs','ResourceOracleTests.csproj','global.json','NuGet.Config'])fs.copyFileSync(path.join(__dirname,name),path.join(build,name));
const env={...process.env,DOTNET_CLI_HOME:path.join(build,'.dotnet'),DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_NOLOGO:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE:'true',RESOURCE_ORACLE_TEST_OUT:path.join(out,'oracle.json'),RESOURCE_ORACLE_SOURCE:path.resolve(arg('--source')),RESOURCE_ORACLE_WEB_SHA:arg('--web-commit'),RESOURCE_ORACLE_CORE_SHA:arg('--core-commit'),RESOURCE_ORACLE_DEPENDENCY:path.resolve(arg('--dependency-root'))};
function run(exe,args,name){const r=cp.spawnSync(exe,args,{cwd:build,env,windowsHide:true,stdio:['ignore','pipe','pipe'],encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});const log=(r.stdout||'')+(r.stderr||'')+(r.error?'\n'+r.error.message:'');fs.writeFileSync(path.join(out,name+'.log'),log);console.log(name+': 종료 '+r.status+'\n'+log.slice(-4000));return r.status;}
const dotnet=process.platform==='win32'?'C:/Program Files/dotnet/dotnet.exe':'dotnet';
let status=run(process.execPath,['--test',path.join(__dirname,'export.test.cjs')],'export-contract');if(status!==0)process.exit(status??1);
if(!process.argv.includes('--reuse-build')){status=run(dotnet,['build',path.join(build,'ResourceOracleTests.csproj'),'-v:q','-p:NuGetAudit=false','-p:UseSharedCompilation=false','-p:ExoduserProject='+project],'build');if(status!==0)process.exit(status??1);}
status=run(dotnet,[path.join(build,'bin/Debug/net8.0/ResourceOracleTests.dll'),path.join(out,'oracle.json'),path.join(out,'result.json')],'compare');
if(status!==0&&status!==2)process.exit(status??1);
const result=JSON.parse(fs.readFileSync(path.join(out,'result.json'),'utf8')),oracle=JSON.parse(fs.readFileSync(path.join(out,'oracle.json'),'utf8'));
const list=a=>'['+a.join(', ')+']';
let md=`# D-U3 자원 원문 대조\n\n웹 ${oracle.source.webCommit}, Core ${oracle.source.coreCommit}. 고정 시드 ${oracle.seed}.\n\n${result.total}건 / 불일치 ${result.mismatches}건 / 단독 ${result.isolatedMismatches}건 / 혼합 ${result.mixedMismatches}건. 자원 순서는 HP, MP, ST, 쉴드. Config-Player 불일치 ${result.adapterMismatches}건.\n\n합성 입력을 통한 항별 최대치 대조다. 드랍 확률·실플레이·화면은 검사하지 않았다. 표의 효과는 같은 레벨 1 기준 입력에서 해당 항만 켠 차이다. allocated는 STR SP=1의 별도 기준이다. 단독 실패 수와 자원별 실패 수는 별개이며 혼합 원인은 중첩된다.\n\n| 단독 항 | 웹 효과 | Unity 효과 | Unity-웹 | 불일치 자원 |\n|---|---|---|---|---|\n`;
for(const row of result.isolated)md+=`| ${row.term} | ${list(row.webEffect)} | ${list(row.unityEffect)} | ${list(row.delta)} | ${row.different.join(', ')||'일치'} |\n`;
md+='\n## AFFIX_POOL 자원 관련 전수 범위\n\nHP·MP·ST·쉴드의 최대치와 능력치·회복·흡수·획득·소모·부활 관련 id를 원문 풀에서 뽑았다. 양쪽 최대치 효과 0인 항은 이 하니스에서 결함이 아니다. ancHP는 소환체 HP로, 고정 유골함 허용 형식으로만 검사한다.\n\n| id | 원문 슬롯 | 티어 값 |\n|---|---|---|\n';
for(const a of oracle.affixCoverage)md+=`| ${a.id} | ${a.slots.join(', ')} | ${a.tiers.join(', ')} |\n`;
md+='\n## 기존 검사와 겹치는 범위\n\n- stat-parity: 저장본 2건의 CalculateStats HP/MP/ST 비교. 쉴드는 출력만 하고 합격 판정에는 쓰지 않는다.\n- inventory-oracle: 초기 장비·장착/해제·레벨/스테이지/난이도 및 자원 clamp. 구 snapshot 원문과 기본 장비 중심이며 이 하니스의 전체 어픽스 단독·SP/AP·쉴드 Config 대조를 대체하지 않는다.\n- defense-oracle: 장비 근성과 근성 어픽스의 방어력/피해 비교가 겹친다. 최대 자원은 이 하니스에서 별도로 검사한다.\n\n## 원문 추출 위치\n\n';
for(const a of oracle.source.anchors)md+=`- game.html:${a.line} ${a.name}\n`;
fs.writeFileSync(path.join(out,'terms.md'),md);
process.exitCode=status;
