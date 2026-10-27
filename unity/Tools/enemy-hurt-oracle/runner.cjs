const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
module.exports=function(name,oracle,defaultLabel,red){
 const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
 const project=path.resolve(arg('--project',path.join(__dirname,'../..')));
 const out=path.resolve(arg('--out',path.join(__dirname,'runs'))),label=arg('--label',defaultLabel);
 fs.mkdirSync(out,{recursive:true});
 const executable=process.platform==='win32'?'C:/Program Files/dotnet/dotnet.exe':'dotnet';
 const options={cwd:__dirname,env:{...process.env,DOTNET_CLI_HOME:path.resolve(__dirname,'..','.dotnet-home'),DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false',DOTNET_NOLOGO:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE:'true'},windowsHide:true,timeout:240000,encoding:'utf8'};
 const binary=path.join(out,'bin-'+label+'-'+name),intermediate=path.join(out,'obj-'+label+'-'+name);
 const build=cp.spawnSync(executable,['build',path.join(__dirname,name+'.csproj'),'--verbosity','quiet','-p:NuGetAudit=false','-p:ExoduserProject='+project,'-p:Red='+(red?'true':'false'),'-p:BaseIntermediateOutputPath='+intermediate+'/','-p:OutputPath='+binary+'/'],options);
 let result=build,output=(build.stdout||'')+'\n'+(build.stderr||'');
 if(build.status===0){
  // SDK8 dotnet run ignores a custom OutputPath when it looks for the apphost: run the built DLL explicitly.
  result=cp.spawnSync(executable,[path.join(binary,name+'.dll'),path.join(out,label+'.json'),path.resolve(__dirname,arg('--oracle',oracle))],options);
  output+='\n'+(result.stdout||'')+'\n'+(result.stderr||'');
 }
 fs.writeFileSync(path.join(out,label+'.log'),output);
 console.log(JSON.stringify({status:result.status,error:result.error?.message,output:output.slice(-3000)}));
 process.exitCode=result.status??1;
};
