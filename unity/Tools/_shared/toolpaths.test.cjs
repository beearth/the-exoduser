const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const sameWindowsPath=(actual,expected)=>assert.equal(path.win32.normalize(actual).toLowerCase(),path.win32.normalize(expected).toLowerCase());
test('portable tool discovery, missing tools and temporary SDK policy',()=>{
  assert.ok(fs.existsSync(path.join(__dirname,'toolpaths.cjs')),'shared toolpaths implementation is required');
  const tools=require('./toolpaths.cjs'),root=fs.mkdtempSync(path.join(os.tmpdir(),'exo-toolpaths-test-'));
  try {
    const first=path.join(root,'first'),second=path.join(root,'second');fs.mkdirSync(first);fs.mkdirSync(second);
    const touch=(dir,name)=>{const file=path.join(dir,name);fs.writeFileSync(file,'');return file;};
    // Match PATHEXT spelling so the Windows-discovery fixture also works on case-sensitive hosts.
    const dotnet=touch(first,'dotnet.EXE'),override=touch(second,'custom.exe'),legacy=touch(second,'legacy.exe');
    const env={PATH:first+';'+second,PATHEXT:'.EXE;.CMD',EXO_DOTNET:override};
    sameWindowsPath(tools.findTool('dotnet',{env,platform:'win32',legacy:[legacy]}),override);
    sameWindowsPath(tools.findTool('dotnet',{env:{...env,EXO_DOTNET:'missing'},platform:'win32',legacy:[legacy]}),dotnet);
    sameWindowsPath(tools.findTool('dotnet',{env:{PATH:''},platform:'win32',legacy:[legacy]}),legacy);
    assert.equal(tools.findTool('dotnet',{env:{PATH:''},platform:'win32',legacy:[]}),null);
    touch(first,'python.EXE');const python3=touch(second,'python3.EXE');
    sameWindowsPath(tools.findTool('python',{env:{PATH:first+';'+second},platform:'win32',legacy:[]}),python3);
    sameWindowsPath(tools.findTool('python',{env:{PATH:first,EXO_PYTHON:override},platform:'win32',legacy:[]}),override);
    // A Windows drive colon is not a valid POSIX PATH entry; run this on its owning OS.
    if(process.platform!=='win32'){
      const posix=touch(second,'dotnet');fs.chmodSync(posix,0o755);
      assert.equal(tools.findTool('dotnet',{env:{PATH:second},legacy:[]}),posix);
    }
    const missing=tools.spawnSync(null,[],{});assert.equal(missing.status,0);assert.match(missing.stdout,/건너뜀\(경로 없음\)/);
    const global=path.join(root,'global.json'),bytes=Buffer.from('{"sdk":{"version":"8.0.301","rollForward":"disable"}}\r\n');fs.writeFileSync(global,bytes);
    const normal=tools.prepareDotnet(['build','relative.csproj'],{cwd:root,env:{}});
    assert.equal(normal.options.cwd,root);normal.cleanup();
    const relaxed=tools.prepareDotnet(['build','relative.csproj'],{cwd:root,env:{EXO_DOTNET_ROLLFORWARD:'1'}});
    assert.notEqual(relaxed.options.cwd,root);assert.equal(relaxed.args[1],path.join(root,'relative.csproj'));
    assert.equal(JSON.parse(fs.readFileSync(path.join(relaxed.options.cwd,'global.json'))).sdk.rollForward,'latestPatch');
    assert.deepEqual(fs.readFileSync(global),bytes);const temp=relaxed.options.cwd;relaxed.cleanup();assert.equal(fs.existsSync(temp),false);
    const run=tools.prepareDotnet(['run','--project','relative.csproj','--','literal'],{cwd:root,env:{EXO_DOTNET_ROLLFORWARD:'1'}});
    assert.equal(run.args[2],path.join(root,'relative.csproj'));assert.equal(run.args[4],'literal');run.cleanup();
  } finally {fs.rmSync(root,{recursive:true});}
});
test('selected installed executables exist and print versions',()=>{
  const tools=require('./toolpaths.cjs');
  for(const kind of ['dotnet','python']){
    const exe=tools.findTool(kind);assert.ok(exe,kind+' installed');assert.ok(fs.statSync(exe).isFile());
    const result=tools.spawnSync(exe,['--version'],{encoding:'utf8',windowsHide:true,timeout:15000});
    assert.equal(result.status,0,result.stderr||result.error?.message);
    assert.match(result.stdout,kind==='dotnet'?/^\d+\.\d+\.\d+/m:/^Python \d+\.\d+\.\d+/m);
    console.log(kind+': '+exe+' -> '+result.stdout.trim());
  }
});
test('real SDK build uses temporary latestPatch policy and leaves original bytes intact',()=>{
  const tools=require('./toolpaths.cjs'),root=fs.mkdtempSync(path.join(os.tmpdir(),'exo-toolpaths-sdk-'));
  const before=Buffer.from('{"sdk":{"version":"8.0.300","rollForward":"disable"}}\r\n');
  try {
    fs.writeFileSync(path.join(root,'global.json'),before);
    fs.writeFileSync(path.join(root,'NuGet.Config'),'<configuration><packageSources><clear/></packageSources></configuration>');
    fs.writeFileSync(path.join(root,'Policy.csproj'),'<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>');
    fs.writeFileSync(path.join(root,'Program.cs'),'System.Console.WriteLine("temporary-policy-ok");');
    const env={...process.env,EXO_DOTNET_ROLLFORWARD:'1',DOTNET_CLI_HOME:path.join(root,'home'),DOTNET_NOLOGO:'1',DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_ADD_GLOBAL_TOOLS_TO_PATH:'false'};
    const result=tools.spawnSync(tools.dotnet(),['build','Policy.csproj','--verbosity','quiet','-p:NuGetAudit=false','-p:UseSharedCompilation=false'],{cwd:root,env,encoding:'utf8',windowsHide:true,timeout:60000});
    assert.equal(result.status,0,result.stdout+result.stderr);
    assert.deepEqual(fs.readFileSync(path.join(root,'global.json')),before);
    const run=tools.spawnSync(tools.dotnet(),[path.join(root,'bin/Debug/net8.0/Policy.dll')],{cwd:root,env,encoding:'utf8',windowsHide:true,timeout:10000});
    assert.equal(run.status,0,run.stderr);assert.equal(run.stdout.trim(),'temporary-policy-ok');
  } finally {fs.rmSync(root,{recursive:true});}
});
