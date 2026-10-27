// Builds and runs Program.cs against oracle.json. DOTNET_CLI_HOME is ONE fixed folder (a fresh home per run polluted the user PATH with dotnet tools, 10-27).
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const project=path.resolve(arg('--project',path.join(__dirname,'../..')));
const out=path.resolve(arg('--out',path.join(__dirname,'runs'))),label=arg('--label','green');
fs.mkdirSync(out,{recursive:true});
const exe=process.platform==='win32'?'C:/Program Files/dotnet/dotnet.exe':'dotnet';
const env={...process.env,DOTNET_CLI_HOME:process.env.EXODUSER_DOTNET_HOME||'E:/exoduser-wt/_dotnet-home',DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_NOLOGO:'1',DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE:'true'};
const o={cwd:__dirname,env,windowsHide:true,timeout:180000,encoding:'utf8'};
const bin=path.join(out,'bin-'+label),obj=path.join(out,'obj-'+label);
const b=cp.spawnSync(exe,['build',path.join(__dirname,'SaveTests.csproj'),'--verbosity','quiet','-p:NuGetAudit=false','-p:ExoduserProject='+project,'-p:BaseIntermediateOutputPath='+obj+'/','-p:OutputPath='+bin+'/'],o);
let r=b,text=(b.stdout||'')+'\n'+(b.stderr||'');
if(b.status===0){r=cp.spawnSync(exe,[path.join(bin,'SaveTests.dll'),path.join(out,label+'.json'),path.join(__dirname,'oracle.json')],o);text+='\n'+(r.stdout||'')+'\n'+(r.stderr||'');}
fs.writeFileSync(path.join(out,label+'.log'),text);console.log(JSON.stringify({status:r.status,error:r.error&&r.error.message,output:text.slice(-3000)}));process.exitCode=r.status??1;
