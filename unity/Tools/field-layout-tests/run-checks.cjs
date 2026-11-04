// Default: commit-1 field/Core gate. --extended also audits legacy, unrelated Core suites.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const project=path.resolve(__dirname,'../..'),out=path.resolve(process.argv[2]),dotnet='G:/unity/Editor/6000.6.7f1/Editor/Data/DotNetSdk/dotnet.exe';
fs.mkdirSync(out,{recursive:true});
const env={...process.env,DOTNET_CLI_HOME:path.join(project,'Library','FieldScaleDotnet'),DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1'};
const results=process.argv.includes('--resume')?JSON.parse(fs.readFileSync(path.join(out,'summary.json'),'utf8')):[];
function run(name,exe,args){if(results.some(r=>r.name===name))return;const r=cp.spawnSync(exe,args,{cwd:project,env,encoding:'utf8',windowsHide:true,timeout:240000});const text=(r.stdout||'')+(r.stderr||'');fs.writeFileSync(path.join(out,name+'.log'),text);results.push({name,exit:r.status,error:r.error?.message});fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results,null,2));console.log(name+': '+r.status);}
function cs(name,dir,assembly,args){const bin=path.join(project,'Library','FieldScaleChecks',name);run(name+'-compile',dotnet,['build',path.join(project,'Tools',dir,assembly+'.csproj'),'--verbosity','quiet','-p:NuGetAudit=false','-p:UseSharedCompilation=false','-p:ExoduserProject='+project,'-p:OutputPath='+bin+'/']);run(name,dotnet,[path.join(bin,assembly+'.dll'),...args]);}
const map=path.join(project,'Assets/Exoduser/Resources/Data/ch1_map.json');
run('host-contract',process.execPath,[path.join(__dirname,'host-contract.test.cjs')]);
run('navigation',process.execPath,[path.join(__dirname,'navigation.test.cjs')]);
cs('field-layout','field-layout-tests','FieldLayoutTests',[map]);
const suites=['c01-field-oracle','fieldboss-oracle','region-oracle','stage-flow-oracle'];
if(process.argv.includes('--extended'))suites.push('enemy-ai-oracle','enemy-tick-oracle','enemy-spawn-oracle','enemy-pool-oracle','enemy-tables-oracle','damage-parity-oracle','defense-oracle','dash-hit-oracle','dash-parry-oracle','player-hurt-oracle','enemy-hurt-oracle','ki-slash-oracle','roll-oracle','feedback-oracle','parry-reflect-oracle','level-exp-oracle','shield-revive-oracle','skill-oracle','druid-boss-oracle');
for(const suite of suites){
    const script=path.join(project,'Tools',suite,'run.cjs'),oracle=path.join(project,'Tools',suite,'oracle.json');
    if(!fs.existsSync(script)||!fs.existsSync(oracle)){
        if(!results.some(r=>r.name===suite)){results.push({name:suite,exit:null,blocked:!fs.existsSync(script)?'No run.cjs in existing suite':'Existing oracle.json missing'});fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results,null,2));}
        continue;
    }
    run(suite,process.execPath,[script,'--project',project,'--out',path.join(out,suite)]);
}
cs('core','Tests','CoreTests',[path.join(out,'core.json'),map]);
cs('region-real-map','region-test','RegionRealMapTests',[map,path.join(out,'region-real-map.json')]);
cs('start-mobs','start-mobs-test','StartMobsTests',[map,path.join(out,'start-mobs.json')]);
cs('a2-field','a2-field','FieldTests',[map]);
if(process.argv.includes('--extended'))run('minimap-objectives',process.execPath,[path.join(project,'Tools/minimap-objective-tests/run.cjs'),project,path.join(out,'minimap-objectives'),dotnet]);
const failed=results.filter(r=>r.exit!==0);console.log('검사 완료: '+results.length+'개, 실패 '+failed.length+'개');process.exitCode=failed.length?1:0;
