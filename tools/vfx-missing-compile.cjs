// Roslyn preflight only. Reads existing Unity reference assemblies; all source
// and every emitted file belong to this worktree. Does not launch Unity.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),project=path.join(root,'unity'),out=path.join(root,'tools/combat-impact-check/compile');
const donor='G:/exoduser-wt/codex-unity-parity-1102/unity';
const rspRoot=path.join(donor,'Library/Bee/artifacts/1900b0aE.dag');
const sdk='C:/Program Files/dotnet/sdk';const version=fs.readdirSync(sdk).filter(x=>/^\d/.test(x)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
fs.mkdirSync(out,{recursive:true});
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):e.name.endsWith('.cs')?[path.join(p,e.name)]:[]);
const core=path.join(project,'Assets/Exoduser/Runtime/Core');
for(const name of ['Exoduser.Core','Exoduser.Runtime']) {
  let lines=fs.readFileSync(path.join(rspRoot,name+'.rsp'),'utf8').split(/\r?\n/).filter(l=>l&&l.startsWith('-')||l.startsWith('/'));
  lines=lines.filter(l=>!/^[-/](out|refout|pdb|generatedfilesout|additionalfile|analyzer):/.test(l));
  lines=lines.map(l=>l.replace(/(-r:)"([^"]+)"/,(_,prefix,p)=>{
    if(/Exoduser.Core(?:.ref)?.dll$/.test(p))return prefix+'"'+path.join(out,'Exoduser.Core.dll')+'"';
    return prefix+'"'+(path.isAbsolute(p)?p:path.join(donor,p))+'"';
  }));
  const sources=name==='Exoduser.Core'?walk(core):walk(path.join(project,'Assets/Exoduser/Runtime')).filter(p=>!p.startsWith(core+path.sep));
  lines.push('-out:"'+path.join(out,name+'.dll')+'"',...sources.map(p=>'"'+p+'"'));
  const rsp=path.join(out,name+'.rsp');fs.writeFileSync(rsp,lines.join('\n'));
  const r=cp.spawnSync('C:/Program Files/dotnet/dotnet.exe',[path.join(sdk,version,'Roslyn/bincore/csc.dll'),'@'+rsp],{cwd:project,encoding:'utf8',windowsHide:true,timeout:60000,env:{...process.env,DOTNET_CLI_HOME:out,DOTNET_CLI_TELEMETRY_OPTOUT:'1'}});
  const log=(r.stdout||'')+(r.stderr||'')+(r.error?.message||'');fs.writeFileSync(path.join(out,name+'.log'),log);
  const errors=log.split(/\r?\n/).filter(l=>l.includes('error '));console.log(name+': exit='+r.status+', sources='+sources.length+', errors='+errors.length);if(errors.length)console.log(errors.slice(0,12).join('\n'));
  if(r.status!==0){process.exitCode=r.status??1;break;}
}
