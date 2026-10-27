// Builds and runs Program.cs against a freshly exported oracle.json. DOTNET_CLI_HOME is ONE fixed folder (a fresh home per run polluted the user PATH with dotnet tools, 10-27).
// usage: node run.cjs [--rev origin/main | --source <game.html path>] [--cases 48] [--out E:/exoduser-wt/_out/druid-oracle]
// Default source is the COMMITTED game.html of --rev (git show <rev>:game.html, never the shared working tree where other sessions keep WIP); the rev and its sha go into oracle.json.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const out=path.resolve(arg('--out','E:/exoduser-wt/_out/druid-oracle')),cases=arg('--cases','48'),repo=arg('--repo','G:/exoduser'),rev=arg('--rev','origin/main');
fs.mkdirSync(out,{recursive:true});
let src=arg('--source',null),head='working-file';
if(!src){
  const g=(a)=>{const r=cp.spawnSync('git',['-C',repo,...a],{encoding:'utf8',maxBuffer:1<<28});if(r.status!==0){process.stderr.write(r.stderr||'git failed');process.exit(4);}return r.stdout;};
  head=g(['rev-parse',rev]).trim();src=path.join(out,'game.'+head.slice(0,9)+'.html');fs.writeFileSync(src,g(['show',head+':game.html']));
}
const exe=process.platform==='win32'?'C:/Program Files/dotnet/dotnet.exe':'dotnet';
const env={...process.env,DOTNET_CLI_HOME:process.env.EXODUSER_DOTNET_HOME||'E:/exoduser-wt/_dotnet-home',DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_NOLOGO:'1'};
const e=cp.spawnSync(process.execPath,[path.join(__dirname,'export.cjs'),'--source',src,'--rev',rev,'--head',head,'--cases',cases,'--out',path.join(out,'oracle.json')],{encoding:'utf8',maxBuffer:1<<27});
process.stdout.write(e.stdout||'');if(e.status!==0){process.stderr.write(e.stderr||'');process.exit(2);}
const b=cp.spawnSync(exe,['build',path.join(__dirname,'DruidBossTests.csproj'),'-c','Release','-o',path.join(out,'bin'),'-p:NuGetAudit=false','-p:BaseIntermediateOutputPath='+path.join(out,'obj')+'/','--verbosity','quiet'],{env,encoding:'utf8',cwd:__dirname});
if(b.status!==0){process.stdout.write((b.stdout||'')+(b.stderr||''));process.exit(3);}
const r=cp.spawnSync(exe,[path.join(out,'bin','DruidBossTests.dll'),path.join(out,'oracle.json')],{env,encoding:'utf8',maxBuffer:1<<26});
process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');process.exit(r.status);
