'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const legacy={dotnet:['C:/Program Files/dotnet/dotnet.exe'],python:['C:/Python314/python.exe']};
function findTool(kind,options={}) {
  const env=options.env||process.env,platform=options.platform||process.platform,win=platform==='win32';
  const directories=(env.PATH||env.Path||'').split(win?';':':').filter(Boolean).map(s=>s.replace(/^"|"$/g,''));
  const extensions=win?(env.PATHEXT||'.EXE;.CMD;.BAT;.COM').split(';'):[''];
  const usable=file=>{try{fs.accessSync(file,win?fs.constants.F_OK:fs.constants.X_OK);return fs.statSync(file).isFile();}catch{return false;}};
  function lookup(value) {
    if(!value)return null;value=value.replace(/^"|"$/g,'');
    const explicit=path.isAbsolute(value)||/[\\/]/.test(value);
    const suffixes=win&&!path.extname(value)?['',...extensions]:[''];
    for(const dir of explicit?['']:directories)for(const suffix of suffixes){const file=path.resolve(dir,value+suffix);if(usable(file))return file;}
    return null;
  }
  const override=lookup(env[kind==='dotnet'?'EXO_DOTNET':'EXO_PYTHON']);if(override)return override;
  for(const name of kind==='dotnet'?['dotnet']:['python3','python']){const found=lookup(name);if(found)return found;}
  for(const file of options.legacy===undefined?legacy[kind]:options.legacy){const found=lookup(file);if(found)return found;}
  return null;
}
function skip(kind){return '건너뜀(경로 없음): '+kind+'\n';}
function dotnet(required=true){const exe=findTool('dotnet');if(!exe&&required){process.stdout.write(skip('dotnet'));process.exit(0);}return exe;}
function python(){return findTool('python');}
function dotnetRoot(){return path.dirname(fs.realpathSync(dotnet()));}
function sdkRoot(){return path.join(dotnetRoot(),'sdk');}
function refRoot(){return path.join(dotnetRoot(),'packs/Microsoft.NETCore.App.Ref');}
function latest(root,prefix=''){return fs.readdirSync(root).filter(s=>/^\d/.test(s)&&s.startsWith(prefix)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);}
function csc(version='8.0.301') {
  const root=sdkRoot(),pick=fs.existsSync(path.join(root,version))?version:latest(root,version.split('.')[0]+'.');
  if(!pick){process.stdout.write(skip('dotnet SDK '+version));process.exit(0);}
  return path.join(root,pick,'Roslyn/bincore/csc.dll');
}
function refPack(version='8.0.6',tfm='net8.0') {
  const root=refRoot(),pick=fs.existsSync(path.join(root,version,'ref',tfm))?version:latest(root,version.split('.')[0]+'.');
  if(!pick){process.stdout.write(skip('dotnet reference pack '+tfm));process.exit(0);}
  return path.join(root,pick,'ref',tfm);
}
function prepareDotnet(args,options={}) {
  const env=options.env||process.env,cwd=path.resolve(options.cwd||process.cwd());
  const unchanged={args,options,cleanup(){}};
  if(env.EXO_DOTNET_ROLLFORWARD!=='1'||!['build','run','test','restore','publish','msbuild'].includes(args[0]))return unchanged;
  let dir=cwd,global;
  while(true){const file=path.join(dir,'global.json');if(fs.existsSync(file)){global=file;break;}const parent=path.dirname(dir);if(parent===dir)return unchanged;dir=parent;}
  const config=JSON.parse(fs.readFileSync(global,'utf8').replace(/^\uFEFF/,''));
  if(!config.sdk)return unchanged;
  config.sdk.rollForward='latestPatch';
  // SDK lookup uses cwd. Only its policy is copied; projects and source stay in the worktree.
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'exo-dotnet-policy-'));
  try {
    fs.writeFileSync(path.join(temporary,'global.json'),JSON.stringify(config,null,2)+'\n');
    // Preserve local feed configuration when moving the SDK lookup directory.
    for(const name of ['NuGet.Config','nuget.config'])if(fs.existsSync(path.join(dir,name)))fs.copyFileSync(path.join(dir,name),path.join(temporary,name));
    const rewritten=args.slice();
    for(let i=1;i<rewritten.length;i++) {
      if(rewritten[i]==='--')break;
      if(['--project','--solution','-p'].includes(rewritten[i])&&i+1<rewritten.length){rewritten[++i]=path.resolve(cwd,rewritten[i]);continue;}
      if(/\.(csproj|fsproj|vbproj|sln|slnx)$/i.test(rewritten[i])&&!rewritten[i].startsWith('-'))rewritten[i]=path.resolve(cwd,rewritten[i]);
    }
    return {args:rewritten,options:{...options,cwd:temporary},cleanup(){fs.rmSync(temporary,{recursive:true});}};
  } catch(error){fs.rmSync(temporary,{recursive:true});throw error;}
}
function spawnSync(exe,args,options={}) {
  if(!exe)return {status:0,signal:null,stdout:skip('tool'),stderr:'',skipped:true};
  const isDotnet=/^dotnet(?:\.exe)?$/i.test(path.basename(exe))||exe===findTool('dotnet',{env:options.env||process.env});
  if(!isDotnet)return cp.spawnSync(exe,args,options);
  const prepared=prepareDotnet(args,options);
  try{return cp.spawnSync(exe,prepared.args,prepared.options);}finally{prepared.cleanup();}
}
module.exports={findTool,dotnet,python,dotnetRoot,sdkRoot,refRoot,csc,refPack,prepareDotnet,spawnSync,skip};
